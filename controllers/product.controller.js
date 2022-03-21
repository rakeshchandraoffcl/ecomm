const Product = require('./../models/product-model');
const catchAsync = require('./../utils/catch-async');
const AppError = require('./../utils/app-error');

exports.createProduct = catchAsync(async (req, res, next) => {
	const requiredFields = ['name', 'price', 'inventoryCount', 'description'];
	const requestArray = Object.keys(req.body);
	requestArray.forEach((item) => {
		if (!requiredFields.includes(item)) {
			delete req.body[item];
		}
	});

	// name username email serialNumber password cities gender  status ableToSee type
	const product = await Product.create(req.body);
	res.status(201).json({
		status: 'success',
		data: {
			product,
		},
	});
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	const requiredFields = ['name', 'price', 'inventoryCount', 'description'];
	const requestArray = Object.keys(req.body);
	requestArray.forEach((item) => {
		if (!requiredFields.includes(item)) {
			delete req.body[item];
		}
	});

	// name username email serialNumber password cities gender  status ableToSee type
	const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(201).json({
		status: 'success',
		data: {
			product,
		},
	});
});

exports.getProducts = catchAsync(async (req, res, next) => {
	const filter = {};
	const page = req.query.page * 1 || 1;
	const limit = req.query.limit * 1 || 10;
	const skip = (page - 1) * limit;
	filter.status = 'active';
	const totalDocs = await Product.countDocuments(filter);

	const products = await Product.find(filter)
		.sort('-createdAt')
		.skip(skip)
		.limit(limit);

	res.status(200).json({
		status: 'success',
		data: {
			totalDocs,
			products,
		},
	});
});
exports.getProductDetails = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	res.status(200).json({
		status: 'success',
		data: {
			product,
		},
	});
});
