const AppError = require('./../utils/app-error');

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	console.log(err.message);
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];

	const message = `${value} already registered with us!`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
	new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});

		// Programming or other unknown error: don't leak error details
	} else {
		// 1) Log error
		// console.error('ERROR 💥', err);

		// 2) Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	let er = {
		...err,
		message: err.message,
		name: err.name,
		code: err.code,
	};
	if (process.env.NODE_ENV.trim() == 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV.trim() == 'production') {
		if (er.name === 'CastError') er = handleCastErrorDB(er);
		if (er.code === 11000) er = handleDuplicateFieldsDB(er);
		if (er.name === 'ValidationError') er = handleValidationErrorDB(er);
		if (er.name === 'JsonWebTokenError') er = handleJWTError();
		if (er.name === 'TokenExpiredError') er = handleJWTExpiredError();

		sendErrorProd(er, res);
	}
};
