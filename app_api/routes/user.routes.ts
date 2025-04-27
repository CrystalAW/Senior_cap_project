import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.ts';
dotenv.config()

const router = Router();

// Passport setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string, // Use your Google client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Use your Google client secret
    callbackURL: 'http://localhost:3000/auth/google/callback', // Redirect URI
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if the user exists in your database
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('Email is required!'), undefined);
        }
        // If not, create a new user
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          // Any other information from the profile you want to store
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect or respond with user data
    res.redirect('/');
  }
);

export default router;