const mongoose=require("mongoose")

const UserdeatilsSchema=new mongoose.Schema({
    name:{
       type:String, 
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true
    },
    phoneNumber:{
        type:String,
        required:true,   
         unique:true, 
    },
    password: {
        type: String,
        required: true,
        min:7,
        max:14  
    },
    token:{
        type:String,
        default:''
    },
    mneomic:{
        type:String,
        default:''
    },
    publicAddress:{
        type:String,
        default:''
    },
    privateKey:{
        type:String,
        default:''
    }      
},{timestamps:true})
module.exports=mongoose.model("Usr",UserdeatilsSchema)
