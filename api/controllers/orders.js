
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product'); 

exports.order_get_all =  (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate("product", "name")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            orders: docs.map((doc) => {
                return {
                    quantity: doc.quantity,
                    productId: doc.product,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:4000/orders/' + doc._id
                    }
                }
            })
        }
        if(docs.length > 0){
            res.status(200).json(response);
        }
        else{
            res.status(404).json({
                message: 'No entries found.'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.order_add_item = (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message: 'Product not found'
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        })

        return order.save();
    })
    .then((result)=>{
        console.log(result);
        res.status(201).json({
            message: 'Order stored',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            }
        });
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })  
}

exports.order_get_item = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .select("product quantity _id")
    .populate("product")
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all orders',
                    url: 'http://localhost:4000/orders'
                }
            });
        }
        else{
            res.status(404).json('No valid entry found for provided ID');
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({error: err});
    });
}

exports.order_update_item = (req, res, next) => {
    const id = req.params.orderId;
    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order updated",
            request: {
                type: "GET",
                url: "http://localhost:4000/orders/" + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    })
}

exports.order_delete_item = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .then(order => {
        if(order !== null){
            return Order.deleteOne({_id: order._id})
        }
        else{
            throw new Error('Order not found');
        }
    })
    .then(() => {
        res.status(200).json({
            message: "Order deleted",
            request: {
                type: "POST",
                url: "http://localhost:3000/orders/",
                description: "Add a new order",
                data: {quantity: 'Number', productId: 'String'}
            }
        });
    })
    .catch(err => {
        // console.log(err);
        res.status(500).json({error: err.message});
    })
}