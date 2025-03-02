require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const {join} = require("path");
const session = require("express-session");
const nunjucks = require('nunjucks');
const app = express();

// Router
const loginRouter = require('./routes/login_views');
const indexRouter = require('./routes/index');
const generalViewsRouter = require('./routes/general_views');
const titleViewsRouter = require('./routes/title_views');
const courseViewsRouter = require('./routes/course_views');
const studentViewsRouter = require('./routes/student_views');
const activityViewsRouter = require('./routes/activity_views');

// view engine setup
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('view engine', 'njk');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: null }
}));

app.use('/', indexRouter);
app.use('/', loginRouter);
app.use('/', generalViewsRouter);
app.use('/', titleViewsRouter);
app.use('/', courseViewsRouter);
app.use('/', studentViewsRouter);
app.use('/', activityViewsRouter);

// Handle 404 errors
const handle404Error = (req, res, next) => {
  next(createError(404));
};

// General error handler
const handleErrors = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
};

// Attach middleware
app.use(handle404Error);
app.use(handleErrors);

module.exports = app;
