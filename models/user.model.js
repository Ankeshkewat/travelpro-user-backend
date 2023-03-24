const mongoose=require('mongoose');

const Schema=mongoose.Schema({
    email:String,
    first_name:String,
    last_name:String,
    password:String
})

const UserModel=mongoose.model('User',Schema);

module.exports={UserModel}