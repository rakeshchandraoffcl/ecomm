const mongoose = require('mongoose');
const constants = require('../utils/constants');
const bcrypt = require('bcryptjs');

const { USER_ROLE } = constants;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide name'],
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			required: [true, 'Please provide email'],
		},
		password: {
			type: String,
			default: null,
			select: false,
		},
		status: {
			type: String,
			enum: {
				values: ['active', 'inactive'],
				message: 'role must be between <active> | <inactive>',
			},
			default: 'active',
		},
		role: {
			type: String,
			enum: {
				values: [USER_ROLE.Admin, USER_ROLE.Manager, USER_ROLE.Staff],
			},
			default: USER_ROLE.Admin,
		},
		number: {
			type: String,
			maxlength: [10, 'Max 10 chars allowed'],
			required: [true, 'A phone number must be required'],
			default: null,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.correctPassword = async function (userPassword, dbPassword) {
	return await bcrypt.compare(userPassword, dbPassword);
};

const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;
