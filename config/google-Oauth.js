require('dotenv').config()
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport')
const { v4: uuidv4 } = require('uuid');


const {UserModel}=require('../models/user.model')

passport.use(new GoogleStrategy({
    clientID: process.env.clientId,
    clientSecret: process.env.clientSecret,
    callbackURL: "https://sore-tan-gecko-tam.cyclic.app/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        const email = profile._json.email
        const isAlreadyExist = await UserModel.findOne({ email })
        // console.log(profile)

        if (isAlreadyExist) {
            return cb(null, isAlreadyExist)
        }
        const first_name = profile._json.given_name
        const last_name = profile._json.family_name
        const password = uuidv4()

        const user = new UserModel({ first_name,last_name, email, password })
        await user.save()
        return cb(null, user);

    }
));

module.exports = { passport }