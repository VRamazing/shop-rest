const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()
    .select('email _id password')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs
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
})

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                message: "Mail already exists. Please login"
            });
        }
        else{
            bcrypt.hash(req.body.email, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                }
                else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    console.log(user);
                    user
                    .save()
                    .then(result => {
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    })
                }
            })
        }
    })
});

router.post("/login", (req, res, next) => {
    User.find({email: req.body.email })
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: 'Auth failed'
            });
        }

        console.log(user[0].password, req.body.password)
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            if(result){
                return res.status(200).json({
                    message: 'Auth successful'
                });
            }

            return res.status(401).json({
                message: 'Auth failed'
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.delete('/:userId', (req, res, next) => {
    User.find({_id: req.params.userId})
    .exec()
    .then(user => {
        if(user.length === 0){
            throw "User doesn't exists in db";
        }
        return User.deleteOne({_id: req.params.userId})
        
    })
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: "User deleted"
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err,
        })
    })
})


module.exports = router;