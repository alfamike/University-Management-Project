require('dotenv').config(); // Load environment variables from .env file

const createError = require('http-errors'); // Module to create HTTP errors
const express = require('express'); // Express framework
const path = require('path'); // Path module for handling file paths
const cookieParser = require('cookie-parser'); // Middleware to parse cookies
const logger = require('morgan'); // HTTP request logger middleware
const cors = require('cors'); // Middleware to enable CORS
const {join} = require("path"); // Destructure join method from path module
const session = require("express-session"); // Middleware to handle sessions
const nunjucks = require('nunjucks'); // Templating engine
const csurf = require('csurf'); // Middleware to handle CSRF protection
const app = express(); // Create an Express application

// Routers
const loginRouter = require('./routes/login_views'); // Router for login views
const indexRouter = require('./routes/index'); // Router for index views
const generalViewsRouter = require('./routes/general_views'); // Router for general views
const titleViewsRouter = require('./routes/title_views'); // Router for title views
const courseViewsRouter = require('./routes/course_views'); // Router for course views
const studentViewsRouter = require('./routes/student_views'); // Router for student views
const activityViewsRouter = require('./routes/activity_views'); // Router for activity views

// Configure view engine
nunjucks.configure('views', {
    autoescape: true, // Enable auto-escaping
    express: app // Bind Nunjucks to the Express app
});
app.set('view engine', 'njk'); // Set Nunjucks as the view engine

// Middleware setup
app.use(cors()); // Enable CORS
app.use(logger('dev')); // Use morgan logger in development mode

// Parsers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({extended: true})); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// CSRF middleware
app.use(csurf({cookie: true})); // Enable CSRF protection using cookies

// Session middleware
app.use(session({
    secret: process.env.SECRET, // Secret key for session
    resave: false, // Do not resave session if unmodified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {secure: process.env.NODE_ENV === 'production', maxAge: null} // Set secure cookie in production
}));

// Pass CSRF token to views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken(); // Add CSRF token to response locals
    next(); // Proceed to the next middleware
});

// Use routers
app.use('/', indexRouter); // Use index router
app.use('/', loginRouter); // Use login router
app.use('/', generalViewsRouter); // Use general views router
app.use('/', titleViewsRouter); // Use title views router
app.use('/', courseViewsRouter); // Use course views router
app.use('/', studentViewsRouter); // Use student views router
app.use('/', activityViewsRouter); // Use activity views router

// Handle 404 errors
const handle404Error = (req, res, next) => {
    next(createError(404)); // Forward 404 error to error handler
};

// General error handler
const handleErrors = (err, req, res, next) => {
    res.locals.message = err.message; // Set error message
    res.locals.error = req.app.get('env') === 'development' ? err : {}; // Show error details in development
    res.status(err.status || 500); // Set response status
    res.render('error'); // Render error view
};

// Attach middleware
app.use(handle404Error); // Use 404 error handler
app.use(handleErrors); // Use general error handler

module.exports = app; // Export the Express app