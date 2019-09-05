const express = require("express");
const router = express.Router();

const UsersController = require('../controllers/users');

//Handle incoming get requests orders.
router.get('/', UsersController.users_get_all);
router.post('/signup', UsersController.users_signup);
router.post('/login', UsersController.users_login);
router.delete('/:userId', UsersController.users_delete_one);

module.exports = router;