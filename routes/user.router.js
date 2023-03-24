const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const UserRouter = express.Router()
const { UserModel } = require('../models/user.model')


UserRouter.get('/', (req, res) => {
    res.status(201).send({ "msg": "This is the base api for travelpro" })
})

//signup
UserRouter.post('/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    bcrypt.hash(password, 10, async function (err, hash) {
        if (err) {
            console.log('MSG: Error from bcrypt')
            res.status(500).send({ 'MSG': "Something went wrong" })
        }
        else {
            try {

                let user = new UserModel({ email, password: hash, first_name, last_name });
                await user.save();
                let userDetails = await UserModel.find({ email })
                let userId = userDetails[0]._id
                console.log(userId)
                let token = jwt.sign({ "userId": userId, email: email }, process.env.secret);
                res.send({ "MSG": "Account has been created successfully", "token": token, "userDetails": userDetails })

            }
            catch (err) {
                console.log(err);
                res.status(401).send({ "MSG": "Something went wrong" })
            }
        }
    })
})

//login
UserRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user && user.email) {
        try {
            bcrypt.compare(password, user.password, async function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).send({ 'msg': "Something went wrong" })
                }
                else if (result) {
                    let token = jwt.sign({ "userId": user._id, email: email }, process.env.secret);
                    res.status(201).send({ "msg": "Login sueccesfull", "token": token, "name": user.first_name })
                }
                else {
                    res.send({ 'msg': "incorrect password" })
                }
            })
        }
        catch (err) {
            // internal failure
            console.log(err)
            res.status(500).send({ "msg": "Somethng went wrong" })
        }
    }
    else {
        res.status(401).send({ "msg": "Invailid credentials" })
    }
})

module.exports = { UserRouter }