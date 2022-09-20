


const userModel=require("../Model/userModel")

const jwt=require("jsonwebtoken")

const otpGenerator=require("otp-generator")


//isValid is create for validation that if user provide epty string it through error towards the user
const isValid=function (value){
    if(typeof value ==="undefined"||typeof value ===null) return false
    if(typeof value ==='string' &&  value.trim().length ===0) return false
    return true
}


const userDetails=async function(req,res){
    try{
        let data =req.body

        let {name,email,phoneNumber,password}=data

        if(Object.keys(data).length==0){
            return res.status(400).send({status:false,msg:"empty"})
        }
        if(!isValid(name)){
            return res.status(400).send({status:false,msg:"please fill the name"})
        }
        if(!isValid(email)){
            return res.status(400).send({status:false,msg:"please fill the email adress"})

        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "Invalid email" })
            
        }

        if(!isValid(password)){
            return res.status(400).send({status:false,msg:"password is rquired"})
      }
      if (password.length >= 8) {
        return  res.status(400).send({ status: false, msg: "Password should be less than 8 characters"})
          
      }
      if (password.length <= 5) {
        return  res.status(400).send({ status: false, msg: "Password should be more than 5 characters"})
          
      }
      if (!isValid(phoneNumber)) {
        res.status(400).send({ status: false, msg: "Phone Number is mandatory" })
        return
    }
    if (!(/^\d{10}$/.test(phoneNumber))) {
        res.status(400).send({ status: false, msg: "Invalid Phone Number, it should be of 10 digits" })
        return
    }
 
     let emailAlreadyPresent=await userModel.findOne({email})
     if(emailAlreadyPresent){
        return res.status(406).send({status:false,msg:"email is alraedy taken"})
     }

     let phoneNumberAlreadyPresent=await userModel.findOne({phoneNumber})
     if(phoneNumberAlreadyPresent){
         return res.status(406).send({status:false,msg:"this phoneNumber already exist"})
     }
     const userData={
        name,email, phoneNumber,password
     }
      const userdatacreated=await userModel.create(userData)
      return res.status(201).send({status:true,msg:"data sucessfully created",data:userdatacreated})
    }catch(error){
    res.status(500).send({status:false,msg:error.message})

}
}



const loginUser=async function(req,res){
    try {
        let body=req.body
        let {email,password}=body
        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: "Email is required" })
            return
        }
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, msg: "email should have valid email address" })
            return
        }
        
        if (!isValid(password)) {
            res.status(400).send({ status: false, msg: "Password is required" })
            return
        }

        let userDetails=await userModel.findOne({email:email,password:password})
        if(!userDetails){
            return res.status(400).send({status:false,msg:"please provide right credentials"})
        }
        else{
            let token=jwt.sign({userId:userDetails._id,
         
            },"avinay",)
            res.cookie("token", token, {
                httpOnly: true
            })
            res.status(201).send({status:true,msg:"user login sucessfull",data:token})

        }
    } catch (error) {
        console.log(error)
        
        res.status(500).send({msg:error.message})
        
    }
}





// const signout=async function(req,res){
//     let userId=req.params.userId
//     if(req.userId!=userId){
//         return res.status(401).send({msg:"you are not authorized"})
//     }
//     let logout=await userModel.findOne({_id:userId}) 

//    logout.token=""

//      return res.status(200).send({msg:"userlogout"})

// }

const logout = async function (req, res) {
    try {
        res.clearCookie("token")
        return res.status(200).send({ status: true, msg: "logout successfully" })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


// const otp=async function(req,res){
//     let phoneNumber=req.body.phoneNumber
//     const user=await userModel.find({
//          phoneNumber:req.body.phoneNumber
//     })
//     const OTP=otpGenerator.generate(4,{
//         digits:true
//     },5000)
//     console.log(OTP)
//     let otp=new Otp({phoneNumber:phoneNumber,otp:OTP})
//     const result=await otp.save()
//     console.log(result)
//     return res.status(200).send({msg:"otp send sucessfully"})
// }









module.exports.userDetails=userDetails

module.exports.loginUser=loginUser


// module.exports.signout=signout

module.exports.logout=logout
// module.exports.otp=otp


// const data=["abandon","ability","able","about","above"]
// // const data2=["abandon","ability","able","about","above"]
// data.forEach(entry=>{
//     let reg=/[a-z ]+/gi
//     let result=entry.match(reg)
//     console.log(result)
// })


const input = "hello how are you"

check = ["hello", "how", "are", "hey"];

const matched = [];

input
  .split(" ")
  .forEach(item =>
    check.includes(item)
      ? matched.push(item)
      : null
  ); 

console.log( matched );




