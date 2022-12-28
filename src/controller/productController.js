const productModel=require("../models/productModel")
const {isValidObjectId} = require("mongoose")
const { uploadFile } = require("./aws");
const {isValidString, isValidPrice, isValidStyle, isValidInstallment, isValidImg, isValidTitle, valid} = require("../validator/validation");

const createProduct = async function(req,res){
    try{
      let data = req.body
      let files = req.files 
      let {title,description,currencyId,currencyFormat,productImage,availableSizes} = data
       let {price}=data
      
      /*------------------------- Checking fields are present or not -----------------------------------*/
      if(!title)return res.status(400).send({status:false, message:"title is required"})
      if(!description)return res.status(400).send({status:false, message:"description is required"})
      if(!price)return res.status(400).send({status:false, message:"price is required"})
      if(!currencyId)return res.status(400).send({status:false, message:"currencyId is required"})
      if(!currencyFormat)return res.status(400).send({status:false, message:"currencyFormat is required"})
  
      /*------------------------- Checking fields values are empty or not -----------------------------------*/
      if(!(isValidString(title)))return res.status(400).send({status:false, message:"title is empty"})
      if(!(isValidString(description)))return res.status(400).send({status:false, message:"description is empty"})
      if(!(isValidString(currencyId)))return res.status(400).send({status:false, message:"currencyId is empty"})
      if(!(isValidString(currencyFormat)))return res.status(400).send({status:false, message:"currencyFormat is empty"})

      /*---------------------performing validation & checking valid available size value--------------------*/
      if(availableSizes){
        let arr = availableSizes.split(',')
        let wants = ["S", "XS","M","X", "L","XXL", "XL"]
        let r = []
            for(let j=0; j<arr.length; j++){
              if(r.indexOf(arr[j])==-1){
                if(wants.includes(arr[j])){
                  r.push(arr[j])
                }
              }
            }
        data.availableSizes = r
        if(r.length==0)return res.status(400).send({status:false, message:"please provide valid size ex: S, XS,M,X, L,XXL, XL"}) 
      }

      /*-------------------------checking regex validation ---------------------------*/
      if(!(isValidPrice(price)))return res.status(400).send({status:false, message:"Invalid price value"})
      
      if(data.style){
        if(!(isValidStyle(data.style)))return res.status(400).send({status:false, message:"Please provide valid style"})
      }
      
      if(data.installments){
        if(!(isValidInstallment(data.installments)))return res.status(400).send({status:false, message:"Please provide valid installment in single or double digit format excluding 0"})
      }
      if(data.isFreeShipping){
        if(data.isFreeShipping!='true'&& data.isFreeShipping!='false'){
          return res.status(400).send({status:false,message:"isfreeshipping must be either true or false at the time of creation of product"})
        }
      }

      /*-------------------------some more validation---------------------------*/
      if(currencyId!='INR')return res.status(400).send({status:false, message:`please provide valid currencyId ex: 'INR'`})
      if(currencyFormat!='₹')return res.status(400).send({status:false, message:`please provide valid currencyFormat ex: '₹'`})

      /*------------------------- Checking title is unique or not -----------------------------------*/
      let duplicateTitle = await productModel.findOne({title:title})
      if(duplicateTitle)return res.status(400).send({status:false, message:"title is already registered"})
  
      /*------------------------validation, adding & uploading productImage------------------------------*/
      if (files && files.length > 0) {
        let uploadedFileURL = await uploadFile(files[0]);
        data.productImage = uploadedFileURL
      }else{
        return res.status(400).send({status:false, message:"productImage is required"})
      } 
  
      /*------------------------creating product data------------------------------*/
      const createData = await productModel.create(data) 
      return res.status(201).send({status:true, message:"Success", data:createData})
    }
    catch(err){
      return res.status(500).send({ status: false, message: err.message })
    }
  }
  

const getProductsByFilter=async function(req,res){
    try{
     let {size,name,priceGreaterThan,priceLessThan,priceSort }=req.query
     let data = {isDeleted:false}
     if(size){
      size=size.toUpperCase()
        let arr = size.split(',')
        let wants = ["S", "XS","M","X", "L","XXL", "XL"]
        let r = []
            for(let j=0; j<arr.length; j++){
              if(r.indexOf(arr[j])==-1){
                if(wants.includes(arr[j])){
                  r.push(arr[j])
                }
            }}

         data['availableSizes']= {$in: r}    // "availablesuzw": {$in: [XXl, N]}
     } 
     if(name){
         
         data['title']= name
     }
     if(priceGreaterThan){
         data['price']= {$gt:priceGreaterThan}
     }
     if(priceLessThan){
         data['price']= {$lt:priceLessThan}
     }
     if(priceSort){
         if(!(priceSort==1 || priceSort==-1)){
             return res.status(400).send({status:false,message:"price sort can have only two values 1 or -1"})
         }
     }
     let filteredData=await productModel.find(data).sort({price:priceSort})

     
     if(filteredData.length==0){return res.status(404).send({status:false,message:"data is not present"})}
     res.send(filteredData)
}
    catch(err){
       res.status(500).send({status:false,msg:err.message})
    }
 }


const getProductByID = async function (req, res) {
    try {
      const productId = req.params.productId;
      if (!isValidObjectId(productId))
        return res.status(400).send({ status: false, message: "Invalid Product Id" });
  
      const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false, });
  
      if (!checkProduct)
        return res.status(400).send({ status: false, message: "Product does not exist" });
  
      return res.status(200).send({ status: true, message: "Success", data: checkProduct});
  
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };

  const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: `${productId} is not valid productId` })

        let updateData = req.body
        let files = req.files
        console.log(files)
        if(Object.keys(updateData).length== 0 && files.length==0){
          return res.status(400).send({status:false,message:"please enter at least one key to update data"})
        }
    
        
        if (!(valid(updateData) || files)) return res.status(400).send({ status: false, msg: "please input some data to update" })
        if(files.length>0){
        if (!isValidImg(files[0].originalname)) { return res.status(400).send({ status: false, message: "Image Should be of JPEG/ JPG/ PNG" }); }
        }
        let findProductData = await productModel.findById({ _id: productId })
        if (!findProductData) return res.status(404).send({ status: false, msg: `no data found by this ${productId} productId` })
        if (findProductData.isDeleted == true) return res.status(400).send({ status: false, msg: "this product is deleted so you can't update it" })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, deletedAt, isDeleted } = updateData

        // for(let key in req.body){
        //     if(req.body[key].trim().length==0){
        //         return res.status(400).send({status:false, message:`${key} can't be empty`})
        //     }
        // }


        if (title) {
            if (!isValidTitle(title.trim())) return res.status(400).send({ status: false, message: "Enter a proper title" })
            if (findProductData.title == title) return res.status(400).send({ status: false, msg: "title should be unique" })
        }

        if (description) {
            if (!description) return res.status(400).send({ status: false, msg: "enter valid description" })
        }

        if (price) {
            if (!isValidPrice(price.trim())) return res.status(400).send({ status: false, message: "Enter a proper price" })
        }

        if (currencyId) {
            if (currencyId !== "INR") return res.status(400).send({ status: false, msg: "enter valid currencyId in that formate INR" })
        }

        if (currencyFormat) {
            if (!valid(currencyFormat)) return res.status(400).send({ status: false, message: "Please enter currencyFormat in correct format" })
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currencyFormat in ₹ " })
        }

        if (isFreeShipping) {
            if (!(isFreeShipping == "true" || isFreeShipping == "false"))
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isFreeShipping" })
        }
         


        if(files.length>0){
          if(files[0].fieldname!="productImage"){
          return res.status(400).send({status:false,message:"product upload image key name should be productImage"})
          }
          let uploadedFileURL = await uploadFile(files[0]);
          updateData.productImage= uploadedFileURL
        }
        
    
        if (style) {
            if (!isValidStyle(style)) return res.status(400).send({ status: false, msg: "enter valid style" })
        }

         /*---------------------performing validation & checking valid available size value--------------------*/
      if(availableSizes){
        let arr = availableSizes.split(',')
        let wants = ["S", "XS","M","X", "L","XXL", "XL"]
        let r = []
            for(let j=0; j<arr.length; j++){
              if(r.indexOf(arr[j])==-1){
                if(wants.includes(arr[j])){
                  r.push(arr[j])
                }
              }
            }
        updateData.availableSizes = r
        if(r.length==0)return res.status(400).send({status:false, message:"please provide valid size ex: S, XS,M,X, L,XXL, XL"}) 
      }

        if (installments) {
            if (!(isValidInstallment(installments))) return res.status(400).send({ status: false, message: "Please provide valid installment between one and two numbers" })
        }

        if (isDeleted) {
            if (!(isDeleted == "true" || isDeleted == "false"))
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isDeleted" })
        }

        let updatedProductData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { ...updateData } }, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: updatedProductData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

  const deleteProduct = async function (req, res) {  
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: `${productId} is not valid productId` })
        let ProductData = await productModel.findOne({ _id: productId })
        if (!ProductData) return res.status(404).send({ status: false, msg: `no data found by this ${productId} productId` })
        if (ProductData.isDeleted == true) return res.status(400).send({ status: false, msg: "this product is already deleted" })
        let deletedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });

        return res.status(200).send({ status: true, message: "Success"})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



 module.exports= {getProductsByFilter, createProduct, getProductByID,updateProduct,deleteProduct}