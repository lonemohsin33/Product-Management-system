const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const {isValidObjectId} = require('mongoose')

const authentication = async function(req, res, next){
    try{

        let token = req.headers["authorization"]
        if(!token)return res.status(400).send({status:false, message:"Bearer Token must be present in header"})
        let fetchToken = token.split(" ")[1]
        // console.log(fetchToken)
        
        jwt.verify(fetchToken,"password", function(err,tokenVerify){
            if(err){
                return res.status(401).send({status:false, message:"Token is invalid or expired"})
            }else{
                req.tokenVerify = tokenVerify
                return next()
            }
        })
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

const authorization = async function(req, res, next){
    try{
        const userId = req.params.userId
    
        if(!(isValidObjectId(userId)))return res.status(400).send({status:false, message:"please provide valid mongodb userId"})
    
        let getUser = await userModel.findOne({_id:userId})
        if(!getUser)return res.status(404).send({status:false, message:"user is not present in DB i.e., you have to registered first"})
    
        //authorization
        if(getUser._id != req.tokenVerify.userId)return res.status(403).send({status:false, mesage:"unauthorized access"})
    
        return next()

    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = {authentication, authorization}