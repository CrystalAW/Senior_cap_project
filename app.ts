import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const indexRouter = require('./app_server/routes/index1');
// const usersRouter = require('./app_server/routes/users');
import apiRouter from './app_api/routes/api.js';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(function(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
})
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'dist', 'digi-p', 'browser')));
//app.use(passport.initialize());
app.use('/api/calendar', apiRouter);
app.get('*', (req: Request, res:Response, next: NextFunction) => {
  if(req.path !== '/api') {
    res.sendFile(path.join(__dirname, 'app_public', 'dist','digi-p', 'browser', 'index.html'));
  } else {
    next();
  }
});

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
