const User = require('./../models/user-model');
const catchAsync = require('./../utils/catch-async');
const AppError = require('./../utils/app-error');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

	res.cookie('jwt', token, cookieOptions);

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(
			new AppError(
				'You are not logged in! Please log in to get access.',
				401
			)
		);
	}

	// 2) Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id).select('+status');
	if (!currentUser) {
		return next(
			new AppError(
				'The user belonging to this token does no longer exist.',
				401
			)
		);
	}

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.autorizartion =
	(...type) =>
	(req, res, next) => {
		if (!type.includes(req.user.role)) {
			return next(new AppError('You are not authorized', 401));
		}
		next();
	};

exports.createUser = catchAsync(async (req, res, next) => {
	const requiredFields = ['name', 'email', 'password', 'number', 'role'];
	const requestArray = Object.keys(req.body);
	requestArray.forEach((item) => {
		if (!requiredFields.includes(item)) {
			delete req.body[item];
		}
	});

	// name username email serialNumber password cities gender  status ableToSee type
	const user = await User.create(req.body);

	createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) Check if email and password exist
	if (!email || !password) {
		return next(new AppError('Please provide email and password', 400));
	}

	// 2) Check if user exists && password is correct
	const user = await User.findOne({ email }).select('+password +status');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	if (user.status !== 'active') {
		return next(new AppError('Your account has been disabled', 401));
	}

	createSendToken(user, 200, res);
});

exports.getMyDetails = catchAsync(async (req, res, next) => {
	res.status(200).json({
		status: 'success',
		data: req.user,
	});
});
exports.logout = catchAsync(async (req, res, next) => {
	return res
		.clearCookie('jwt')
		.status(200)
		.json({ message: 'Successfully logged out' });
});
