const mongoose=require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId
const walletSchema=new mongoose.Schema({
    userId:{
        type:ObjectId,ref:"User",
    },
    mnemoic:{
        type:String,
        default:''
    },
    address:{
        type:String,
        default:''
    },
    privateKey:{
        type:String,
        default:''
    }
        
},{timestamps:true})
module.exports=mongoose.model("wallet",walletSchema)