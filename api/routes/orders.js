const express = require('express');
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const OrdersController = require('../controllers/orders');
//Handle incoming get requests orders.
router.get('/', checkAuth, OrdersController.order_get_all);
router.post('/', checkAuth, OrdersController.order_add_item);
router.get('/:orderId', checkAuth, OrdersController.order_get_item);
router.get('/:orderId', checkAuth, OrdersController.order_update_item);
router.get('/:orderId', checkAuth, OrdersController.order_delete_item);

module.exports = router;