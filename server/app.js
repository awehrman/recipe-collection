const dotenv = require('dotenv');
const express = require('express');

const indexRoute = require('./routes/index');

const app = express();

// set environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

// routes
app.use('/', indexRoute);

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