const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

router
	.route('/get-my-details')
	.get(userController.protect, userController.getMyDetails);
router.route('/logout').get(userController.protect, userController.logout);
router.route('/log-in').post(userController.login);
router.route('/register').post(userController.createUser);

module.exports = router;
