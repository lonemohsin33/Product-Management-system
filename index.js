const express = require('express')
const mongoose = require('mongoose')
const route = require('./src/routes/routes')
const multer = require("multer")

const app = express()
app.use(express.json())
app.use(multer().any())


mongoose.connect("mongodb+srv://lonemohsin33:Diabetes7889%40@functionup.aq5cty2.mongodb.net/PMS?retryWrites=true&w=majority",{
    useNewUrlParser : true
},mongoose.set('strictQuery', false))
.then(()=>console.log("MongoDB is connected"))
.catch((err)=>console.log(err))

app.use('/',route)
app.use('/*', async function(req,res){
    return res.status(400).send("Provided route url is wrong")
})

app.listen(3000, function(){
    console.log("Express app is running on port:",3000)
})