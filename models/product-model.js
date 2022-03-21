const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide name'],
		},
		price: {
			type: Number,
			required: [true, 'Please provide price'],
		},
		inventoryCount: {
			type: Number,
			required: [true, 'Please provide price'],
		},
		description: {
			type: String,
			required: [true, 'Please provide inventoryCount'],
		},
		status: {
			type: String,
			enum: {
				values: ['active', 'inactive'],
				message: 'role must be between <active> | <inactive>',
			},
			default: 'active',
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

const ProductModel = mongoose.model('product', productSchema);
module.exports = ProductModel;
