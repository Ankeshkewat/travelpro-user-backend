
const jwt = require('jsonwebtoken')
require('dotenv').config()

const Redis = require('ioredis');
const { send } = require('process');

const {UserModel}=require('../models/user.model')

const validate=async(req,res,next)=>{
  let {first_name,last_name, email,password} =req.body;
  if(!first_name||!last_name||!email||!password){
    res.status(401).send({'MSG':"Please fill all details"})
  }else if(password.length<8){
    res.status(401).send({'MSG':'Please choose strong password'})
  }
  else{
       let data=await UserModel.findOne({email});
       if(data) return res.status(409).send({'MSG':"User Already Exist"});
       next()
  }
}




module.exports = {validate}