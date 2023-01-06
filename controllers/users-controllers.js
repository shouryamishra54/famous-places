const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const validator = require("validator");
const User=require("../models/User");
const { default: isEmail } = require("validator/lib/isEmail");
const { default: isEmpty } = require("validator/lib/isEmpty");
const { default: isStrongPassword } = require("validator/lib/isStrongPassword");
const userError = require("../validators/user-validator");
const { default: mongoose } = require("mongoose");
const Place = require("../models/Place");
let users = [];

async function getAllUsers(req, res, next){
    const {page=1, limit=10} = req.query
    const users=await User.find()
    .limit((!parseInt(limit) || limit <= 0 || limit >100) ? 10 : limit)
    .skip((!parseInt(page) || page <= 0) ? 0 : (page-1)*limit).catch((err)=>{
        const error=new HttpError("Something went wrong, Unable to find User", 500)
        return next(error)
    })
    if(!users || users === undefined || users === null){
        const error=new Error("No User found", 404)
        return next(error)
    }
    users.map((user)=>{
        // console.log(typeof(user.image))
        if(user.image){
            fs.readFile(user.image.toString(), (err, data)=>{
                if(err){
                    user.image="Cannot fetch Image for this user"
                }else{
                    user.image=data
                }
            })
        }
    })
    res.status(201).json({users:users.map((user)=>{
        // const thisuser=user.toObject({getters: true, setters: true})
        return {userId: user.id, name: user.name, username: user.username, 
            email: user.emailId, image: user.image, places: user.places}
    })})
}
async function getUser(req, res, next){
    const id=req.params.uid;
    if(!id || id === null ){
        const error=new HttpError("User ID not found in URL... Please provide right URL", 403)
        return next(error)
    }
    // const user=users.filter((u)=>{return (u.id === id)})
    const user=await User.findById(id).catch((err)=>{
        const error=new HttpError("Something went wrong, Unable to find User", 500)
        return next(error)
    })
    if(!user || user === undefined || user === null){
        const error=new Error("No User found for this ID", 404)
        return next(error)
    }
    res.status(201).json({user:user.toObject({getters:true})})
}
async function createUser(req, res, next){
    // const user={
    //     id:uuid(), ...req.body
    // }
    const usertofind=await User.findOne({emailId:req.body.emailId}).catch((err)=>{
        const error=new HttpError("Something went wrong, unable to create user", 500)
        return next(error)
    })
    // req.body.image=(req.body.image)
    if(usertofind){
        const error=new HttpError("User existing already for the given emailId", 404)
        return next(error)
    }
    // console.log(req.file)
    let hashedPassword
    try{
        hashedPassword=await bcrypt.hash(req.body.password, 12)
    }catch(e){
        const error=new HttpError("Could not create user, please try again", 500)
        return next(error)
    }
    req.body={...req.body, password: hashedPassword}
    let user=new User({...req.body, places:[]})
    // console.log(req.body)
    if(req.file && req.file.path){
        user=new User({...req.body, image:req.file.path, places:[]})
    }
    const dataError=userError(user)
    if(dataError){
        const error=new HttpError(dataError, 404)
        return next(error)
    }
    users.push(user.toObject())
    // console.log(user)
    user.save().catch((err)=>{
        const error=new HttpError("Something went wrong, unable to create user", 500)
        return next(err)
    })
    let token;
    try{
        token=jwt.sign(
            {userId: user.id, email: user.emailId, username: user.username},
            'supersecret_dont_share',
            {expiresIn: 3600}
        );
    }catch(e){
        const error=new HttpError("Signing up failed, please try again later", 500)
        return next(error)
    }
    res.status(201).json({userId: user.id, username: user.username, email: user.emailId, token: token})
}
async function updateUser(req, res, next){
    const id=req.params.uid;
    if(!id || id === null ){
        const error=new HttpError("User ID not found in URL... Please provide right URL", 403)
        return next(error)
    }if(id !== req.userData.userId){
        const error=new HttpError("You are not allowed to change this user profile", 403)
        return next(error)
    }
    // const index=users.findIndex((u)=>{return (u.id === id)})
    // let user=users.find((u)=>{return (u.id === id)})
    // if((index === undefined || index === -1) || user === undefined){
    //     const error=new HttpError("No User found for this ID", 404)
    //     return next(error)
    // }
    const user=await User.findById(id).catch((err)=>{
        const error=new HttpError("Something went wrong, unable to update user data", 500)
        return next(error)
    })
    if(!user || user === undefined || user === null){
        const error=new Error("No User found for this ID", 404)
        return next(error)
    }
    let hashedPassword
    try{
        hashedPassword=await bcrypt.hash(req.body.password, 12)
    }catch(e){
        const error=new HttpError("Internal Server Error, Unable to update user", 500)
        return next(error)
    }
    const updatedUser={...user.toObject({getters:true}), ...req.body, password:hashedPassword}
    /*const dataIsValid=!(isEmpty(updatedUser.name) || isEmpty(updatedUser.emailId) || 
    isEmpty(updatedUser.password)) && isEmail(updatedUser.emailId) && 
    isStrongPassword(updatedUser.password, [{
        minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    }])
    if(!dataIsValid){
        const error=new HttpError("User data is wrongly typed. Please correct it", 404)
        return next(error)
    }*/
    const dataError=userError(updatedUser)
    if(dataError){
        const error=new HttpError(dataError, 404)
        return next(error)
    }
    // users[index]=updatedUser;
    Object.keys(req.body).map((p)=>{user[p]=updatedUser[p]})
    await user.save().catch((err)=>{
        const error=new HttpError("Something went wrong, Unable to update user data", 500)
        return next(error)
    })
    res.status(201).json({updatedUser})
}
async function loginUser(req, res, next){
    // const user=users.find((u)=>{u.emailId === req.body.emailId})
    const user=await User.findOne({
        emailId:req.body.emailId
    }).catch((err)=>{
        const error=new HttpError("Something went wrong, unable to login", 500)
        return next(error)
    })
    if(!user || user === undefined || user === null){
        const error=new HttpError("Invalid credentials, could not log you in", 404)
        return next(error)
    }
    let isValidPassword
    try{
        isValidPassword=await bcrypt.compare(req.body.password, user.password)
    }catch(e){
        const error=new HttpError("Could not log you in, please check your credentials and try again", 500)
        return next(error)
    }
    if(!isValidPassword || isValidPassword === false){
        const error=new HttpError("Invalid credentials, could not log you in", 404)
        return next(error)
    }
    let token;
    try{
        token=jwt.sign(
            {userId: user.id, email: user.emailId, username: user.username},
            'supersecret_dont_share',
            {expiresIn: 3600}
        );
    }catch(e){
        const error=new HttpError("Login failed, please try again later", 500)
        return next(error)
    }
    res.status(201).json({userId:user.id, username: user.username, email: user.emailId, token: token})
}
async function deleteUser(req, res, next){
    const id=req.params.uid;
    if(!id || id === null ){
        const error=new HttpError("User ID not found in URL... Please provide right URL", 403)
        return next(error)
    }if(id !== req.userData.userId){
        const error=new HttpError("You are not allowed to delete this user profile", 403)
        return next(error)
    }
    // const index=users.findIndex((u)=>{return(u.id === id)})
    // if(index === undefined || index === -1){
    //     const error=new HttpError("No User found for this ID", 404)
    //     return next(error)
    // }
    // const deletedUser=users[index]
    // users.splice(index, 1)
    // DUMMY_PLACES=DUMMY_PLACES.filter((p)=>{return (p.id === id)})
    // const deletedUser=await User.findById(id).catch((err)=>{
    //     const error=new HttpError("Something went wrong, unable to delete user", 500)
    //     return next(error)
    // })
    let deletedUser=await User.findById(id).populate("places").catch((err)=>{
        const error=new HttpError("Something went wrong, unable to delete user"+err, 500)
        return next(error)
    })
    if(!deletedUser || deletedUser === undefined || deletedUser === null){
        const error=new HttpError("No user found for this ID", 404)
        return next(error)
    }
    try{
        const sess=await mongoose.startSession();
        sess.startTransaction();
        if(deletedUser.places){
            deletedUser.places.map(async (place)=>{
                await place.remove({session:sess}).catch((err)=>{
                    const error=new HttpError("Something went wrong, unable to delete places for this user", 500)
                    return next(error)
                })
            })
            // await deletedUser.places.deleteMany({session:sess})
        }
        await deletedUser.remove({session:sess})
        await sess.commitTransaction();
    }catch(err){
        const error=new HttpError("Something went wrong, unable to delete"+err, 500)
        return next(error)
    }
    // const user=deletedUser.toObject({getters:true});
    // console.log(users)
    // await deletedUser.remove().catch((err)=>{
    //     const error=new HttpError("Something went wrong, unable to delete user", 500)
    //     return next(error)
    // })
    res.status(201).json({deletedUser:deletedUser.toObject()})
}
function deleteMyProfile(req, res, next){

}
function updateMyProfile(req, res, next){
    
}
function fetchImage(req, res, next){
    const {image}=req.query
    // console.log(image)
    const options={root : path.join(__dirname, "..")}
    let response;
    // const stat=fs.statSync(`upload/images/${image}`)
    /*res.writeHead(201, {
        "Content-Type": "image/png"
    })*/
    res.status(201).sendFile(image, options, (err)=>{
        if(err){
            console.log(err)
            return next(new HttpError(err, 404))
        }else{
            console.log(image)
        }
    })
    // const readStream=fs.createReadStream(`upload/images/${image}`)
    // readStream.pipe(res)
    /*fs.readFile(`upload/images/${image}`, (err, data)=>{
        if(err){
            const error=new HttpError("Unable to fetch photo", 404)
            return next(error)
        }else{
            response=data
            res.status(201).json({response})
        }
    })*/
}

module.exports = {users, getAllUsers, getUser, createUser, loginUser, updateUser, deleteUser, fetchImage}