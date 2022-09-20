const mongoose=require("mongoose")

const UserdeatilsSchema=new mongoose.Schema({
    name:{
       type:String,
       required:true
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
        min: 5,
        max: 8
    },
        
},{timestamps:true})
module.exports=mongoose.model("Usr",UserdeatilsSchema)