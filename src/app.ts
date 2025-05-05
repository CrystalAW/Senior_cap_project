import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';
import passport from 'passport';
import path from 'path';
 dotenv.config();

import calRouter from './app_api/routes/calRoutes.js';
import taskRouter from './app_api/routes/taskRoutes.js';
import authRoutes from './app_api/routes/user.routes.js';


import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readSavedcreds } from './app_api/controllers/googleCalService.js';
import './app_api/models/_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'app_server', 'views'));
app.set('view engine', 'pug');

app.use('*' ,cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))

app.use(logger('dev'));
app.use(express.json());
// app.use(function(req: Request, res: Response, next: NextFunction) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//   );
//   next();
// })
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'src', 'app_public', 'DigiP', 'dist', 'digi-p', 'browser')));
//app.use(express.static(path.join(__dirname, './src/app_public/dist/digi-p')));
//const angularDistPath = path.resolve(__dirname, '../app_public/DigiP/dist/digi-p');
//app.use(express.static(angularDistPath));
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/calendar', calRouter);
app.use('/api/tasks', taskRouter);

app.get('/api/creds', async (req, res) => {
    try {
      const creds = await readSavedcreds();
      res.json(creds);
    } catch (err) {
      console.error('credential error: ', err);
      res.status(500).json({error: 'Failed to load valid credentials'});
    }
});

// app.get('*', (req: Request, res:Response, next: NextFunction) => {
//   if(req.path !== '/api') {
//     res.sendFile(path.join(__dirname, 'src','app_public', 'dist','digi-p', 'browser', 'index.html'));
//   } else {
//     next();
//   }
// });

// app.get('*', (req: Request, res:Response, next: NextFunction) => {
//   if(req.path !== '/api') {
//     res.sendFile(path.join(angularDistPath, 'index.html'));
//   } else {
//     next();
//   }
// });
// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: HttpError, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
