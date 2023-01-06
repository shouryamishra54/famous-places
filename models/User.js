const mongoose=require("mongoose")
const uniqueValidator=require("mongoose-unique-validator")

const UserSchema=new mongoose.Schema({
    name:{type:String, required:true},
    username:{type:String, required:true},
    emailId:{type:String, required:true},
    password:{type:String, required:true},
    image: { type: Object },
    places:[{type:mongoose.Types.ObjectId, required:true, ref:"Place"}]
})
UserSchema.plugin(uniqueValidator)
module.exports=mongoose.model("User", UserSchema)