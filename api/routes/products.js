const express = require('express');
const mongoose = require('mongoose');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:|\./g,'')  + '__' + file.originalname)
    }
})

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }
    else{
        cb(new Error('File type not accepted. Please upload png/jpeg'), false);
    }
}

const upload = multer({storage: storage, limits: {
    fileSize: 1024 * 1024 * 5
}, fileFilter: fileFilter})

const router = express.Router();

const Product = require('../models/product'); 

//Handle incoming get requests products.
router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map((doc) => {
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:4000/products/' + doc._id
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
});

router.post('/', upload.single('productImage'), (req, res, next) =>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })

    product
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Handling POST requests to /products',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:4000/products/' + result._id
                }
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
           error: err
        })
    });

    
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all products',
                    url: 'http://localhost:4000/products'
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
})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Product updated",
            request: {
                type: "GET",
                url: "http://localhost:4000/products/" + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    })
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .then(product => {
        if(!product){
            throw new Error('Product not found');
        } else{
            return Product.deleteOne({_id: id})
        }
    })
    .then(result => {
        res.status(200).json({
            message: "Product deleted",
            request: {
                type: "POST",
                url: "http://localhost:3000/products/",
                description: "Add a new product",
                data: {name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({message: err.message});
    })
})


module.exports = router;