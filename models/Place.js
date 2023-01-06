const mongoose=require("mongoose")

const PlaceSchema=new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String},
    image:{type:String},
    address:{type:String},
    location:{
        lat:{type:Number},
        lng:{type:Number}
    },
    creator:{type:mongoose.Types.ObjectId, required:true, ref:"User"}
})
module.exports=mongoose.model("Place", PlaceSchema)