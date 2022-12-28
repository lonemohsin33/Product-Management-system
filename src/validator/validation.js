const {isValidObjectId} = require('mongoose')
const valid=function(value){
    if(typeof value=="number" || typeof value==null || typeof value==undefined)
    return false
    if(typeof value=="string" && value.trim().length==0)
    return false
    return true
}
//=========================// isValidEmail //===================================

const isValidEmail = function (value) {
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/;
  return emailRegex.test(value)
};

//==============================// isValidName //===============================

const isValidName = function (name) {
  let re = /^[a-z A-Z ]+$/
  return re.test(name)
  
};

//==============================// isValidMobile //===============================

const isValidPhone = function (phone) {
  let re = /^[0]?[6789]\d{9}$/
  return re.test(phone)
 
}
//==============================// isValidPassword //==============================

const isValidPassword = function(password){
  let re= /^(?=.*[0-9])(?=.*[!.@#$%^&*])[a-zA-Z0-9!.@#$%^&*]{8,15}$/
  return re.test(password)
}

//==============================// isValid-pincode //==============================

const isvalidPincode = function (pincode) {
  let re= /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/
  return re.test(pincode)
  
}
const isValidStreet = function (street) {
  let streets = /^[#.0-9a-zA-Z\s,-]+$/;
  return streets.test(street);
};

const isValidString=function(string){
  if (typeof value == 'string' && value.trim().length === 0) return false;
    return true;
}

const isValidPrice = function(price){
  const regex = /^[1-9]\d*(\.\d+)?$/   
  return regex.test(price)
}

const isValidStyle = function(style){
  const regex = /^([a-zA-z\s]{1,100})$/   
  return regex.test(style)
}
const isValidInstallment = function(value){
  const regex = /^[0-9]{1,2}$/   
  return regex.test(value)
}

const isValidImg = (img) => {
  return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(img)
}

const isValidTitle = function (value) {
  return (/^[a-zA-Z][a-zA-Z0-9 $!-_#@%&\.]+$/).test(value)  
     
}

const isIdValid = function(val){
  if(isValidObjectId(val) == false) return false
  return true
}
//=============================// module exports //==============================

module.exports = { isValidString,isValidStreet,valid,isValidEmail, isValidName, isValidPhone, isValidPassword, isvalidPincode, isValidPrice, isValidStyle, isValidInstallment, isValidImg, isValidTitle, isIdValid}


