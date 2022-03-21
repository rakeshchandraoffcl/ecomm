const express = require('express');
const productController = require('../controllers/product.controller');
const userController = require('../controllers/user.controller');
const constants = require('../utils/constants');
const router = express.Router();

const { USER_ROLE } = constants;

router
	.route('/')
	.get(
		userController.protect,
		userController.autorizartion(USER_ROLE.Admin, USER_ROLE.Manager),
		productController.getProducts
	)
	.post(
		userController.protect,
		userController.autorizartion(USER_ROLE.Admin),
		productController.createProduct
	);
router
	.route('/:id')
	.get(
		userController.protect,
		userController.autorizartion(USER_ROLE.Admin, USER_ROLE.Manager),
		productController.getProductDetails
	)
	.patch(
		userController.protect,
		userController.autorizartion(USER_ROLE.Admin, USER_ROLE.Manager),
		productController.updateProduct
	);

module.exports = router;
