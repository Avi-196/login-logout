


const userModel=require("../Model/userModel")

const jwt=require("jsonwebtoken")

const otpGenerator=require("otp-generator")
const nodemailer=require("nodemailer")
const randomstring=require('randomstring')

var Web3 = require("web3");
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");


const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545/"
  )
);

const { contractABI, contract } = require("../config/bip20");

const myContract = new web3.eth.Contract(contractABI, contract);



//isValid is create for validation that if user provide epty string it through error towards the user
const isValid=function (value){
    if(typeof value ==="undefined"||typeof value ===null) return false
    if(typeof value ==='string' &&  value.trim().length ===0) return false
    return true
}

const sentResetpasswordMail=async function(name,email,token){
  try {
    const transporter=  nodemailer.createTransport({
          host:'smtp.gmail.com',
          port:587,
          secure:false,
          require:true,
          auth:{
              user:"avinaymishra63@gmail.com",
              pass:""
          }
      });
      const mailOptions={
          from:"avinaymishra63@gmail.com",
          to:email,
          for:"reset password",
          // html:'<p> hii '+name+'  please click on the link <a href= "http://localhost:4000/?token='+token+'" and reset your password</a>'
          html:'<p>hii '+name+' You requested for reset password, kindly use this <a href="http://localhost:4000/?token=' + token + '">link</a> to reset your password</p>'
      }
      transporter.sendMail(mailOptions,function(error,info){
          if(error){
              console.log(error)
          }
           else{
              console.log('mail has been sent:-',info.response)
           }
      })
  } catch (error) {
      return res.status(400).send({msg:error})
  }
}


const userDetails=async function(req,res){
    try{
        let data =req.body

        let {name,email,phoneNumber,password,address,privatekey}=data

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
      if (password.length >= 14) {
        return  res.status(400).send({ status: false, msg: "Password should be less than 12 characters"})
          
      }
      if (password.length <= 7) {
        return  res.status(400).send({ status: false, msg: "Password should be more than 7 characters"})
          
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


  
  
const sendUserPasswordResetEmail=async function(req,res){
  try {
         const email=req.body.email
      const userData=await userModel.findOne({email:email})
      if(userData){
        const randomString= randomstring.generate({expiresIn:"10m"})
    const data=   await userModel.updateOne({email:email},{$set:{token:randomString}})
    console.log(data)
    sentResetpasswordMail(userData.name,userData.email,randomString)
   return  res.status(200).send({msg:"mail has been sent please click on the link"})
      }
      else{
          res.status(400).send({mgs:"mail does not esist"})
      }
      
  } catch (error) {
      return res.status(400).send({msg:error.message})
  }
}




  const userPasswordReset=async function(req,res){
    try {
        const token=req.query.token
       const tokenData= await userModel.findOne({token:token});
       if(tokenData){
             const password=req.body.password
          const userData=  await userModel.findByIdAndUpdate({_id:tokenData._id},{$set:{password:password,token:''}},{new:true})
          return res.status(200).send({msg:'user password has been reset',data:userData})
       }
         else{
            res.status(200).send({msg:"this link is not right"})
         }
    } catch (error) {
        return res.status(400).send({msg:error})
    }
}


// const changeUserPassword = async (req, res) => {
//   const  password  = req.body.password
//   const userId = req.params.userId
//   if(req.userId!==userId){
//       return res.status(401).send({status:false,msg:"you are not authorized"})
//   }
//     if (password) {
//       res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
//     } else {
     
//       await userModel.findByIdAndUpdate({_id:userId}, { $set: { password:password } })
//       res.send({ "status": "success", "message": "Password changed succesfully" })
//     }
// }

const changeUserPassword = async function (req, res) {
    try {
        const userId=req.body.userId
        if(req.userId!==userId){
            return res.status(401).send({status:false,msg:"you are not authorized"})
        }
        const password=req.body.password
        const data=await userModel.findOne({_id:userId})

        if(data){
             await  userModel.findByIdAndUpdate({_id:userId},{$set:{password:password}})
               return res.status(200).send({msg:"password is updated"})
        }
        else{
            res.status(200).send({msg:"userId is not found !"})
        }
    } catch (error) {
        return res.status(400).send({msg:error})
    }
}
const verifymail=async function(name,email,userId){
    try {
      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            require:true,
            auth:{
                user:"avinaymishra63@gmail.com",
                pass:""
            }
        });
        const mailOptions={
            from:"avinaymishra63@gmail.com",
            to:email,
            for:"verification mail",
            // html:'<p> hii '+name+'  please click on the link <a href= "http://localhost:4000/?token='+token+'" and reset your password</a>'
            html:'<p>hii '+name+' You requested for reset password, kindly use this <a href="http://localhost:4000/?userId=' + userId + '">link</a> verify email</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }
             else{
                console.log('mail has been sent:-',info.response)
             }
        })
    } catch (error) {
        return res.status(400).send({msg:error})
    }
  }

const sentVerificationMail=async function(req,res){
    try {
        const email=req.body.email
        const userdata=await userModel.findOne({email:email})
        if(userdata){
            verifymail(userdata.name,userdata.email,userdata._id) 
            return  res.status(200).send({msg:"mail has been sent please check the mail"})
        }
        else{
            return res.status(400).send({msg:"this email is not right"})
        }
    } catch (error) {
        return res.status(500).send({msg:error})
    }
}


// const privatekey=""
// const address=""
// const user=(privatekey,address)
// const create=async function(req,res){
//        user.userModel.create()
// }


const updatewallet=async function(req,res){
    try {
           const userId=req.body.userId
        const userData=await userModel.findOne({_id:userId})
        if(userData){
       
         const mneomic=bip39.generateMnemonic()
         console.log(mneomic)
       
          
      const data= await userModel.findByIdAndUpdate({_id:userId},{$set:{mneomic:mneomic}})
      console.log(data)
      
     return  res.status(200).send({msg:"updated"})
        }
        else{
            res.status(400).send({mgs:"error"})
        }
        
    } catch (error) {
        return res.status(400).send({msg:error.message})
    }
  }
     

  
const getUserAddressPrivateKey=async function(req,res){
    try {
           const userId=req.body.userId
        const userData=await userModel.findOne({_id:userId})
        if(userData){
           const mneomic =req.query.mnemonic
            const seed = bip39.mnemonicToSeedSync(mneomic);

            const hdwallet = hdkey.fromMasterSeed(seed);
            const countvalue = req.query.count ? req.query.count : 0;
            const path = `m/44'/60'/0'/0/${countvalue}`;
      
            const wallet = hdwallet.derivePath(path).getWallet();
            const address = "0x" + wallet.getAddress().toString("hex");
            const privateKey = wallet.getPrivateKey().toString("hex");
       
          
      const data= await userModel.findByIdAndUpdate({_id:userId},{$set:{privateKey:privateKey,address:address}})
      console.log(data)
      
     return  res.status(200).send({msg:"updated"})
        }
        else{
            res.status(400).send({mgs:"error"})
        }
        
    } catch (error) {
        return res.status(400).send({msg:error.message})
    }
  }




module.exports.userDetails=userDetails

module.exports.loginUser=loginUser

module.exports.sendUserPasswordResetEmail=sendUserPasswordResetEmail


module.exports.userPasswordReset=userPasswordReset

// module.exports.signout=signout

module.exports.logout=logout


module.exports.changeUserPassword=changeUserPassword


module.exports.sentVerificationMail=sentVerificationMail

module.exports.updatewallet=updatewallet

module.exports.getUserAddressPrivateKey=getUserAddressPrivateKey
// module.exports.otp=otp


// const data=["abandon","ability","able","about","above"]
// // const data2=["abandon","ability","able","about","above"]
// data.forEach(entry=>{
//     let reg=/[a-z ]+/gi
//     let result=entry.match(reg)
//     console.log(result)
// })


// const input = "hello how are you"

// check = ["hello", "how", "are", "hey"];

// const matched = [];

// input
//   .split(" ")
//   .forEach(item =>
//     check.includes(item)
//       ? matched.push(item)
//       : null
//   ); 

// console.log( matched );




