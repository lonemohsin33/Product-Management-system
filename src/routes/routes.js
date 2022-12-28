const express = require('express')
const {createUser, userLogin, getUserById,updateUser}= require("../controller/userController")
const router = express.Router()
const mid = require('../middleware/midware')
const {getProductsByFilter, createProduct, getProductByID,updateProduct,deleteProduct}= require("../controller/productController")
const {createCart, getCartDetails, updateCart ,deleteCart} = require('../controller/cartController')
const {createOrder,cancelOrder} = require('../controller/orderController')

router.get('/test', async function(req,res){
    res.send("Test success")
})

//---------------- User---------------------------------------//
router.post("/register",createUser )
router.post("/login",userLogin )
router.get("/user/:userId/profile", mid.authentication, getUserById)
router.put('/user/:userId/profile', mid.authentication, mid.authorization, updateUser)

//---------------- Products---------------------------------------//
router.post("/products", createProduct)
router.get("/products", getProductsByFilter)
router.get("/products/:productId",getProductByID)
router.put('/products/:productId',updateProduct)
router.delete('/products/:productId',deleteProduct)

//--------------------------- cart---------------------------------------//
router.post("/users/:userId/cart", mid.authentication, mid.authorization ,createCart)
router.get("/users/:userId/cart", mid.authentication, mid.authorization , getCartDetails)
router.put('/users/:userId/cart', mid.authentication, mid.authorization , updateCart)
router.delete("/users/:userId/cart", mid.authentication, mid.authorization , deleteCart)

//--------------------------- order---------------------------------------//
router.post("/users/:userId/orders",mid.authentication, mid.authorization,createOrder)
router.put("/users/:userId/orders",mid.authentication, mid.authorization,cancelOrder)

module.exports = router