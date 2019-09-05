const express = require('express');
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const ProductsController = require('../controllers/products');

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

//Handle incoming get requests orders.
router.get('/', ProductsController.product_get_all);
router.post('/', checkAuth, upload.single('productImage'), ProductsController.product_post_item);
router.get('/:productId', ProductsController.product_get_item);
router.patch('/:productId', checkAuth, ProductsController.product_update_item);
router.delete('/:productId', checkAuth, ProductsController.product_delete_item);

module.exports = router;