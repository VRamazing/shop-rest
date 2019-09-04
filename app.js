const express = require('express');
const morgan = require('morgan');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


const app = express();

dotenv.config();

mongoose.Promise = global.Promise;

mongoose.connect(
    "mongodb+srv://vignesh:"
     + process.env.MONGO_ATLAS_PW
     + "@shop-restful-bvyrk.mongodb.net/test?retryWrites=true&w=majority", 
    {
        useNewUrlParser: true 
    }
)
.then(res => {
    console.log("Connected to DB");
})
.catch(err => console.log(err));

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept, Authorization" );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE')
        return res.status(200).json({})
    }
    next();
});


//Routes which could handle requests. 
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the project-name api'
    });
})

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;