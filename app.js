require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const routes = require('./routes');
const middleware = require('./middleware');
const { AppMiddleware } = middleware;
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Remove trailing slash for consistency
app.use(AppMiddleware.removeTrailingSlash);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

// Public folders
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', routes.root);

//Catch Errors
app.use(AppMiddleware.catchNotFound);
app.use(AppMiddleware.handleErrors);

module.exports = app;
