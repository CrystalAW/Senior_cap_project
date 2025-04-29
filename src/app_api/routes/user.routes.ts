import dotenv from 'dotenv';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/user.model.ts';
dotenv.config();


const router = Router();


const generateJWT = (user: IUser) => {
  const payload = {
    email: user.email,
    userId: user.googleId,
    id: user._id,
  };
  
  const secretKey = process.env.JWT_SECRET;
  
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  const options: jwt.SignOptions = {
    expiresIn: '10h',  
  };
  
  return jwt.sign(payload, secretKey, options);
};


// Middleware to check token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)  {
    console.log('Couldnt find token');
    return res.sendStatus(401); // No token
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err && err.name === 'TokenExpiredError') {
      console.log('Token expired');
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err) {
      console.log('Invalid token', err);
      return res.sendStatus(403); // Invalid token
    }
    req.user = user;
    next();
  });
};


// Passport setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    callbackURL: 'http://localhost:3000/api/auth/google/callback', // Redirect URI
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        console.log('No email found.');
        return done(null, false, { message: 'No email found.' });
      }

      const allowedDomain = 'appstate.edu';
      if (!email.endsWith(`@${allowedDomain}`)) {
        console.log('Unauthorized email domain.');
        return done(null, false, { message: 'Unauthorized email domain.' });
      }

      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error);
    }
  }
));

//get user google id
passport.serializeUser((user:any, done) => {
  done(null, user.id);
});

//save user in database after end of session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user)
  } catch (err) {
    done(err);
  }
})

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login?error=unauthorized'}),
    (req, res) => {
    const user= req.user;
    const token = generateJWT(user as IUser);

    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');  // Frontend origin
    // res.setHeader('Access-Control-Allow-Credentials', 'true');  // Allow credentials (cookies)

    res.redirect(`http://localhost:4200/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);

   }
);

const checkUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // No password sent
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// This is the protected route
router.get('/me', authenticateToken, checkUser);

export default router;