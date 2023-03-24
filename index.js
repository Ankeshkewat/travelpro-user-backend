const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cors = require('cors')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.json())
app.use(cors({
    origin: '*'
}))

const { connection } = require('./config/db')
const { passport } = require('./config/google-Oauth')


const { UserRouter } = require('./routes/user.router')


const { UserModel } = require('./models/user.model')

const { validate } = require('./middlewares/athanticate')


app.get('/', UserRouter)
app.post('/signup', validate, UserRouter)
app.post('/login', UserRouter)

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    function (req, res) {
        let token = jwt.sign({ "userId": userId, email: email }, process.env.secret);
        res.redirect(`https://travelproweb.netlify.app/signup.html?token=${token}&name=${req.user.first_name}`)
    });




app.get('/login/github', (req, res) => {
    res.sendFile('https://travelproweb.netlify.app/signup.html')
})

app.get('/auth/github', async (req, res) => {

    const { code } = req.query
    const accessToken = await fetch('https://github.com/login/oauth/access_token', {
        method: "POST",
        headers: {
            'Content-Type': "application/json",
            Accept: 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.github_client_id,
            client_secret: process.env.github_client_secret,
            code
        })
    }).then((msg) => msg.json())

    const userDetals = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
        }
    }).then((msg) => msg.json()).catch((err) => res.send({ 'msg': err }))


    const email = userDetals.login
    const isAlreadyExist = await UserModel.findOne({ email })

    if (isAlreadyExist) {
        const token = jwt.sign({ "userId": isAlreadyExist._id, email: isAlreadyExist.first_name }, process.env.secret)
        return res.redirect(`https://travelproweb.netlify.app/signup.html?token=${token}&name=${isAlreadyExist.first_name}`)
    }
    let name = userDetals.name
    name = name.split(' ');
    const first_name = name[0];
    const last_name = name[1];
    const password = uuidv4()
    const new_user = { email, first_name, last_name, password }

    const user = new UserModel(new_user)
    await user.save()
    console.log(user._id)

    const token = jwt.sign({ 'userId': user._id, email: name }, process.env.secret)
    return res.redirect(`https://travelproweb.netlify.app/signup.html?token=${token}&name=${user.first_name}`)
    
})

app.listen(process.env.port, async () => {
    try {
        await connection;
        console.log(`listening in port ${process.env.port}`)
    }
    catch (err) {
        console.log(err)
    }
})