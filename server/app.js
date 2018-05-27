const bodyParser = require('body-parser');
const colors = require('colors');
const dotenv = require('dotenv');
const express = require('express');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const path = require('path');

const indexRoute = require('./routes/index');
const importRoute = require('./routes/import');
const authRoute = require('./routes/authenticate');

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

// setup session
app.use(cookieSession({
  name: 'session',
  keys: ['SuperSecretRecipeKey']
}));

// routes
app.use('/', indexRoute);
app.use('/import', importRoute);
app.use('/authenticate', authRoute);

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