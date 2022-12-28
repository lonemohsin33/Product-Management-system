const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const {isValidObjectId} = require('mongoose')

const createOrder = async function(req,res){
    try{
        let userId = req.params.userId
        let {cancellable, status} = req.body

        if(!(isValidObjectId(userId)))return res.status(400).send({status:false, message:"please provide valid mongoDB userId"})
        
        if(cancellable){
            if(cancellable != 'true' && cancellable != 'false'){
                return res.status(400).send({status:false, message:"cancellable should be either true or false at the time of order placed"})
            }
        }

        if(status){
            if(status != 'pending' && status != 'completed'){
                return res.status(400).send({status:false, message:"status should be either pending or completed at the time of order placed"})
            }
        }

        let findUser = await userModel.findById(userId)
        if(!findUser)return res.status(404).send({status:false, message:`user not found with this ${userId} i.e., you have to registered first`})
    
        let findCart = await cartModel.findOne({userId:userId}).select({createdAt:0,updatedAt:0,__v:0})
        if(!findCart)return res.status(404).send({status:false, message:`cart not found with this ${userId} i.e., you have to create cart first`})
        
        if(findCart.totalItems == 0){
            return res.status(400).send({status:false, message:"there is no item in the cart to place order i.e., you have to add items in the cart fisrt"})
        }

        let findOrder = await orderModel.findOne({userId:userId, isDeleted:false})
        if(findOrder) return res.status(200).send({status:true, message:"Success", data:findOrder})

        let items = findCart.items
        let sum = 0
        for(let i=0; i<items.length; i++){
            if(items[i].quantity){
                sum = sum + items[i].quantity
            }
        }
        
        let orderData = {...findCart._doc, totalQuantity:sum, cancellable:cancellable, status:status}
        let createData = await orderModel.create(orderData)
        return res.status(200).send({status:true, message:"Success", data:createData})
    }
    catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

const cancelOrder = async function (req, res){
    try {

        let data = req.body
        let userId = req.params.userId

        let{ orderId, status} = data


        if(!(userId)){
            return res.status(400).send({ status : false, message : "UserId is missing in params"})
        }

        if(!isValidObjectId(userId)){
            return res.status(400).send({ status : false, message : "UserId is not valid"})
        }

        let userCheck = await userModel.findOne({_id:userId})
        if(!userCheck){
            return res.status(404).send({ status : false, message : "This userId is not found"})
        }

         if(!orderId){
            return res.status(400).send({ status : false, message : "OrderId is missing"})
         }
         if(!isValidObjectId(orderId)){return res.status(400).send({ status : false, message : "OrderId is invalid"})}
         

        
        let checkstatus=await orderModel.findOne({_id:orderId,isDeleted:false})
        if(checkstatus.userId.toString()  !==  userId){return res.status(400).send({ status : false, message : "This Oder doesnot belog to this user! "})}
         let cancellable=checkstatus.cancellable
         if(cancellable==false){return res.status(400).send({ status : false, message : "Order is not cancelable"})}
        let newStatus = {}
        if(status){
            if(!(status =="completed" || status == "canceled")){
                return res.status(400).send({ status : false, message : "status can be from enum only"})
            }else{
                newStatus.status = status
            }
        }

        const orderCancel = await orderModel.findOneAndUpdate({ _id:orderId },{$set:newStatus},{ new: true });
        return res.status(200).send({ status: true, message: "Success", data: orderCancel });
    }catch(err){
        res.status(500).send(err.message);
    }
};
module.exports.createOrder = createOrder
module.exports.cancelOrder = cancelOrder