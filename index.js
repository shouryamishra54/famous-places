const dotenv=require("dotenv").config()
const express = require("express");
const path = require('path');
const BodyParser = require("body-parser");
const PlaceRouter = require("./routes/places-routes");
const UserRouter = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const {connectDB} =require("./DB/Connection");
const { uploadFile } = require("./middleware/upload_image");
const app=express()
app.use(BodyParser.json())
app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "https://starter-react-app-eta.vercel.app");
    res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT")
    // res.setHeader("Content-Type", "application/json")
    next();
})
app.use("/upload/images", express.static(path.join("upload", "images")))
app.use('/', PlaceRouter)
app.use('/', UserRouter)
app.use((req, res, next)=>{
    const error=new HttpError("Couldn't find this route", 404)
    throw error;
})
app.use((error, req, res, next)=>{
    if(res.headerSent){
        return next(error)
    }
    console.log(error)
    res.status(error.code || 500)
    .json({message : error.message || "Unexpected Error Occured"})
})
function success(){
    app.listen(5000)
}
connectDB(success)
// app.listen(5000)