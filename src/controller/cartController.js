const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const { isValidObjectId } = require('mongoose')

const createCart = async function(req,res){
    try{
        const userId = req.params.userId
        const {cartId, productId} = req.body
    
        if(Object.keys(req.body).length==0)return res.status(400).send({status:false, message:"request body is empty"})

        if(cartId){
            if(!(isValidObjectId(cartId)))return res.status(400).send({status:false, message:"please provide valid mongodb cartId "})
        }
        if(!(isValidObjectId(productId)))return res.status(400).send({status:false, message:"please provide valid mongodb productId "})
        
        let findCart = await cartModel.findOne({_id:cartId, userId:userId})
    
        let findProduct = await productModel.findOne({_id:productId, isDeleted:false})
        if(!findProduct)return res.status(404).send({status:false, message:"No Product exits with this Id"})

        if(findCart){
            let productExists = await cartModel.findOne({_id:cartId, items:{$elemMatch:{productId:productId}}})
            if(productExists){
                let amount = findCart.totalPrice + findProduct.price
                let updateCart = await cartModel.findOneAndUpdate(
                    {_id:cartId, "items.productId": productId},
                    {$set:{totalPrice:amount},$inc:{"items.$.quantity": 1}, totalItems:findCart.items.length},
                    {new:true}
                )
                return res.status(200).send({status:true, message:"Succes" ,data:updateCart})
            }else{
                let amount = findCart.totalPrice + findProduct.price
                let updateCart = await cartModel.findOneAndUpdate(
                    {_id:cartId},
                    {$push:{items:{productId:findProduct._id, quantity:1}},totalPrice:amount, $inc:{totalItems:1}},
                    {new:true}
                )
                return res.status(200).send({status:true, message:"Succes" ,data:updateCart})
            }
        }
        if(!findCart){
            let duplicateUser = await cartModel.findOne({userId:userId})
            if(duplicateUser)return res.status(400).send({status:false, message:`please provide correct cartId corresponding to ${userId} userId`})
            let cart = {
                userId : userId,
                items : [{productId:productId,quantity:1}],
                totalPrice : findProduct.price,
                totalItems : 1
            }
            let createCart = await cartModel.create(cart)
            return res.status(201).send({status:true, message:"Success", data:createCart})
        }
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

const getCartDetails = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `${userId} is not valid userid` })
        let findUserData = await userModel.findById({ _id: userId })
        if (!findUserData) return res.status(400).send({ status: false, message: `no user found by this ${userId}` })
        const data = await cartModel.findOne({ userId }).populate('items.productId')
        if (!data) return res.status(404).send({ status: false, message: "no data exist" })
        return res.status(200).send({ status: true, message: 'Success', data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const updateCart=async function(req,res){
    try{
        let userId=req.params.userId
        let {cartId,productId,removeProduct}=req.body
        //================checkpresence====================
        if(!userId){return res.status(400).send({status:false,message:"userId is mandatory"})}
        if(!cartId){return res.status(400).send({status:false,message:"enter cartId to access the cart"})}
        if(!productId){return res.status(400).send({status:false,message:"enter productId to access the product"})}
        if(!removeProduct){ return res.status(400).send({status:false,message:"userId is mandatory"})}
        //=================checkidValid=======================
        if(!isValidObjectId(userId)){return res.status(400).send({status:false,message:"userId is inValid"})} 
         if(!isValidObjectId(cartId)){return res.status(400).send({status:false,message:"cartId is inValid"})}  
         if(!isValidObjectId(productId)){return res.status(400).send({status:false,message:"productId is inValid"})}  
        if(typeof parseInt(removeProduct)!="number"){
            return res.status(400).send({status:false,message:"remove product should be a number"})
        }
        if(removeProduct!= 0 && removeProduct!=1){
            return res.status(400).send({status:false,message:"remove product should be a number"})
        }
        //===============================dbcall=======================================
        let userExist=await userModel.findOne({_id:userId})
        if(!userExist){return res.status(400).send({status:false,message:"user Doesn't exist"})}
        let cartExist=await cartModel.findOne({_id:cartId})
        if(!cartExist){return res.status(404).send({status:false,message:"cart Doesn't exist"})}
        if(cartExist.userId !=userId){return res.status(400).send({status:false,message:"you dont have access to this cart"})}
        let productExist=await productModel.findOne({_id:productId,isDeleted:false})
        if(!productExist){{return res.status(400).send({status:false,message:"This product doesnot exist"})}}
        let productPrice= parseInt(productExist.price)
        console.log(typeof productPrice)
        let items = cartExist.items
        let index=-1
        for(let i=0; i<items.length; i++){
            if(items[i].productId==productId){
                index=i
            }
        }
        if(index==-1){
            return res.status(400).send({status:false, message:"product not found inside cart"})
        }
        if(removeProduct==1){
            items[index].quantity--
            cartExist.totalPrice -= productPrice
            
        }else{
            let price = items[index].quantity*productPrice
            cartExist.totalPrice -= price
            items[index].quantity=0

        }
        if(items[index].quantity==0){
            items.splice(index, 1)
        }
        cartExist.totalItems= items.length
        await cartExist.save()
        let updatedProd= await cartModel.findOne({userId:userId})
        return res.status(200).send({status:false, message:updatedProd})

    }catch(er){
        res.status(500).send({status:false, message: er.message})
    }
}

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `${userId} is not valid userid` })
        let findUserData = await userModel.findById({ _id: userId })
        if (!findUserData) return res.status(400).send({ status: false, message: `no user found by this ${userId}` })
        const cartdata = await cartModel.findOne({ userId })
        if (!cartdata) return res.status(404).send({ status: false, message: "no data exist" })

        const updateData = { items: [], totalPrice: 0, totalItems: 0 }
        const data = await cartModel.findOneAndUpdate({ userId }, updateData, { new: true })
        return res.status(204).send({ status: true, message: "Success", data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
module.exports.createCart =createCart
module.exports.getCartDetails =getCartDetails
module.exports.deleteCart =deleteCart
module.exports.updateCart = updateCart


