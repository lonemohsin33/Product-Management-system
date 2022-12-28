const userModel = require("../models/userModel");
const productModel = require("../models/productModel")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const bcrypt = require("bcrypt");
const urlValid = require("is-valid-http-url");
const { uploadFile } = require("./aws")
const {
  valid,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidPassword,
  isvalidPincode,
  isValidStreet,
  isValidString
} = require("../validator/validation");

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    //console.log(files)

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: "false", message: "All fields are mandatory" });
    }
    
    let { fname, lname, email, phone, password, address, profileImage } = data;
    //----------------Checking keys presence------------------//
    
    if(!fname)return res.status(400).send({status:false, message:"fname is required"})
    if(!lname)return res.status(400).send({status:false, message:"lname is required"})
    if(!email)return res.status(400).send({status:false, message:"email is required"})
    if(!phone)return res.status(400).send({status:false, message:"phone is required"})
    if(!password)return res.status(400).send({status:false, message:"password is required"})
    if(!address)return res.status(400).send({status:false, message:"address is required"})

    if (!valid(fname)) {
      return res.status(400).send({ status: "false", message: "fname must be present" });
    }
    if (!isValidName(fname)) {
      return res.status(400).send({ status: "false", message: " first name must be in alphabetical order" });
    }
    if (!valid(lname)) {
      return res.status(400).send({ status: "false", message: "lname must be present" });
    }
    if (!isValidName(lname)) {
      return res.status(400).send({ status: "false", message: "last name must be in alphabetical order" });
    }
    if (!valid(email)) {
      return res.status(400).send({ status: "false", message: "email must be present" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: "false", message: "email format is invalid" });
    }

    if (!valid(phone)) {
      return res.status(400).send({ status: "false", message: "phone number must be present" });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).send({ status: "false", message: "Provide a valid phone number" });
    }
    if (!valid(password)) {
      return res.status(400).send({ status: "false", message: "password must be present" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).send({ status: "false", message: "password must be 8 to 15 characters in length with atleast one special character,Number and Alphabate" });
    }
    
    if (!valid(address)) {
      return res.status(400).send({ status: "false", message: "Address must be present" });
    }

    // ------- Address Validation  --------
    
    if (address) {
      data.address = JSON.parse(data.address);
      if(!data.address.shipping){
        return res.status(400).send({status:false,message:"Shipping field is mandatory"})
      }
      if(!data.address.billing){
        return res.status(400).send({status:false,message:"Billing field is mandatory"})
      }
      var {street,city,pincode}=data.address.shipping
      console.log(street)
      console.log(city)
    

      if(!(street)){
        return res.status(400).send({status:false,message:"Street is required"})
      }
      if(!city){
        return res.status(400).send({status:false,message:"City is required"})
      }
      if(!pincode){
        return res.status(400).send({status:false,message:"Pincode is required"})
      }
      
      // console.log(data.address)
      if (address.shipping) {

        // console.log(address.shipping)
        // console.log(data.address.shipping.street)

     
        //-------validations---------//

        if (!valid(address.shipping.street)) {
          return res.status(400).send({ status: "false", message: "street must be present" });
        }
        if (!valid(address.shipping.city)) {
          return res.status(400).send({ status: "false", message: "city must be present" });
        }
        if (!valid(address.shipping.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode must be present" });
        }
        if (!isValidStreet(address.shipping.street)) {
          return res.status(400).send({ status: "false", message: "street should include no. & alphabets only" });
        }
        if (!isValidName(address.shipping.city)) {
          return res.status(400).send({ status: "false", message: "city should include alphabets only" });
        }
        if (!isvalidPincode(address.shipping.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode should be digits only" });
        }
      }
      //------------billing validation-----//

      
      var {street,city,pincode}=data.address.billing
      if(!(street)){
        return res.status(400).send({status:false,message:"Street is required"})
      }
      if(!city){
        return res.status(400).send({status:false,message:"City is required"})
      }
      if(!pincode){
        return res.status(400).send({status:false,message:"Pincode is required"})
      }
      
      if (address.billing) {



        if(!address.billing.street){
          return res.status(400).send({status:false,message:"Street is required"})
        }
        if(!address.billing.city){
          return res.status(400).send({status:false,message:"City is required"})
        }
        if(!address.billing.pincode){
          return res.status(400).send({status:false,message:"Pincode is required"})
        }

        //----------
        if (!valid(address.billing.street)) {
          return res.status(400).send({ status: "false", message: "street must be present" });
        }
        if (!valid(address.billing.city)) {
          return res.status(400).send({ status: "false", message: "city must be present" });
        }
        if (!valid(address.billing.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode must be present" });
        }
        if (!isValidStreet(address.billing.street)) {
          return res.status(400).send({ status: "false", message: "street should include no. and alphabets only" });
        }
        if (!isValidName(address.billing.city)) {
          return res.status(400).send({ status: "false", message: "city should be in alphabetical order" });
        }
        if (!isvalidPincode(address.billing.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode should be digits only" });
        }
      }
    }
    const saltRounds = 10
    // console.log(password)
    const hash = await bcrypt.hash(password, saltRounds)
    if(!hash) return res.status(400).send({status:false, message:"can not generate hash"})
    data.password = hash
    // console.log(hash)

    let emailExists = await userModel.findOne({ email });
    if (emailExists) {
      return res.status(400).send({ status: "false", message: "Email is already in use" });
    }
    let phoneExists = await userModel.findOne({ phone });
    if (phoneExists) {
      return res.status(400).send({ status: "false", message: "Phone number is already in use" });
    }
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL
    } else {
      return res.status(400).send({status:false, msg: "ProfileImage is Mandatory" });
    }

    let savedUser = await userModel.create(data);
    return res.status(201).send({
      status: true, data: savedUser
    });
  } catch (error) {
    return res.status(500).send({ status: "false", msg: error.message });
  }
};

const userLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please Enter data" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });

    if(!(isValidEmail(email)))return res.status(400).send({status:false, message:"Invalid email format"})

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    const Login = await userModel.findOne({ email });
    if (!Login) {
      return res.status(404).send({ status: false, message: "Email Id does Not exist" });

    }
    let hash = Login.password
    bcrypt.compare(password, hash, function (err, result) {
      if (result) {
        let token = jwt.sign({ userId: Login._id }, "password", { expiresIn: "36hr" })
        res.setHeader("x-api-key", token)
        return res.status(200).send({ status: true, message: "Login Successfull", data: { userId: Login._id, token: token } })
      }
      else {
        return res.status(400).send({ status: true, message: "Invalid Password" })

      }
    });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getUserById = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!userId) {
      return res.status(400).send({ status: false, message: "Please provide userid" })
    }
    if (mongoose.Types.ObjectId.isValid(userId) == false) {
      return res.status(400).send({ status: false, message: "Invalid userId" });
    }
    let userDetails = await userModel.findOne({ _id: userId }).lean();
    if (!userDetails) {
      return res.status(404).send({ status: false, msg: "No such user exists" });
    }

    res.status(200).send({ status: true, message: "User profile details", data: userDetails });
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
};


const updateUser = async function (req, res) {
  try {
     const { userId } = req.params
     let data = req.body
     let files=req.files
    
     if (!valid(data)) return res.status(400).send({ status: false, message: "please provide data inside request body" })

     let updateData = {}
     let { fname, lname, email, phone, password, address, profileImage} = data
     
     for(let key in req.body){
        if(req.body[key].trim().length==0){
            return res.status(400).send({status:false, message:`${key} can't be empty`})
        }
     }
     if (fname) {
        if (!isValidName(fname)) {
           return res.status(400).send({ status: false, message: "fname should be in character" });
        }
        updateData['fname'] = fname
     }
     if (lname) {
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "lname should be in character" })
        updateData['lname'] = lname
     }

     if (email) {
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Provide Email in Proper format" })
        const ExistEmail = await userModel.findOne({ email: email })
        if (ExistEmail) return res.status(400).send({ status: false, message: 'give another email to update' })
        updateData['email'] = email
     }
     if (phone) {
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "Provide Phone number in Proper format" })
        const ExistPhone = await userModel.findOne({ phone: phone })
        if (ExistPhone)return  res.status(400).send({ status: false, message: 'give another phone to update' })
        updateData['phone'] = phone
     }

     if (password) {
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Enter password in valid format " })
        const saltRounds = 10
        const hash = await bcrypt.hash(password, saltRounds);
        updateData['password'] = hash
     }
     
     if (address) {
      address = JSON.parse(address)
      if (Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "Please Enter the address in object form" })
     
      ////////////////////////

     
        if (address.shipping) {

           let { street, city, pincode } = address.shipping
           if (street) {
              if (!isValidString(street)) return res.status(400).send({ status: false, message: "Please Enter valid Street" })
              address['shipping.street'] = street
           }
           if (city) {
              if (!isValidString(city)) return res.status(400).send({ status: flase, message: "Please Enter valid city" })
              address['shipping.city'] = city
           }
           if (pincode) {
              if (!isvalidPincode(pincode)) return res.status(400).send({ status: false, message: "Please Enter Six digit Pincode" })
              address['shipping.pincode'] = pincode
           }
        }

        if (address.billing) {
           let { street, city, pincode } = address.billing
           if (street) {
              if (!isValidString(street)) return res.status(400).send({ status: false, message: "Please Enter valid Street" })
              address['billing.street'] = street
           }
           if (city) {
              if (!isValidString(city)) return res.status(400).send({ status: false, message: "Please Enter valid city" })
              address['billing.city'] = city
           }
           if (pincode) {
              if (!isvalidPincode(pincode)) return res.status(400).send({ status: false, message: "Please Enter Six digit Pincode" })
              address['billing.pincode'] = pincode
           }
        }
        if(address.shipping && address.billing){
          updateData["address"] = address
        }
        else if(address.shipping){
          let findBilling = await userModel.findOne({_id:userId})
          let billing = findBilling.address.billing
          updateData["address.billing"] = billing
          updateData["address.shipping"] = address.shipping
        }
        else{
          let findshipping = await userModel.findOne({_id:userId})
          let shipping = findshipping.address.shipping
          updateData["address.shipping"] = shipping
          updateData["address.billing"] = address.billing
        }
     }

      if(files && files.length>0){
        if(files[0].fieldname != "profileImage")return res.status(400).send({status:false, message:"profile field name should be profileImage"})
        let uploadedFileURL = await uploadFile(files[0]);
        updateData['profileImage']= uploadedFileURL
      }
     const updateduserprofile = await userModel.findOneAndUpdate({ _id:userId }, {$set:updateData}, { new: true })
     return res.status(200).send({ status: true, message: "Success", data: updateduserprofile })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


module.exports = { userLogin, createUser, getUserById, updateUser };
