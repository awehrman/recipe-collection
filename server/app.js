const bodyParser = require('body-parser');
const colors = require('colors');
const cookieSession = require('cookie-session');
const dotenv = require('dotenv');
const express = require('express');
const logger = require('morgan');
const path = require('path');

const authRoute = require('./routes/authenticate');
const importRoute = require('./routes/import');
const indexRoute = require('./routes/index');
const ingredientsRoute = require('./routes/ingredients');
const recipesRoute = require('./routes/recipes');


// set environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

// set up express app
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/stylesheets", express.static(path.join(__dirname, "public")));

// setup session
app.use(cookieSession({
  name: 'session',
  keys: ['SuperSecretRecipeKey']
}));

// setup server-side views
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// routes
app.use('/', indexRoute);
app.use('/authenticate', authRoute);
app.use('/import', importRoute);
app.use('/ingredients', ingredientsRoute);
app.use('/recipes', recipesRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	console.log('in the 404 handler'.yellow);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
	console.log(`${err.message}`.red);
	console.log(err.stack);
  res.status(err.status || 500);
  res.json({ status: err.status, message: err.message, stacktrace: err.stack });
});

module.exports = app;