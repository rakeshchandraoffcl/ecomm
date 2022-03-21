const express = require('express');
var cookieParser = require('cookie-parser');

// controllers
const globalErrorHandler = require('./controllers/error.controller');

// Routes
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
