const multer=require("multer")
const uuid=require("uuid")
const HttpError = require("../models/http-error")

const MIME_TYPE_MAP={
    "image/jpg":"jpg",
    "image/png":"png",
    "image/jpeg":"jpeg"
}
const uploadFile=multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, callback)=>{
            // console.log("1")
            callback(null, "upload/images")
        },
        filename: (req, file, callback)=>{
            // console.log("2")
            const ext=MIME_TYPE_MAP[file.mimetype]
            callback(null, uuid.v1()+'.'+ext)
        }
    }),
    fileFilter: (req, file, callback)=>{
        const isValid=!!MIME_TYPE_MAP[file.mimetype]
        // console.log("3")
        const error=isValid? null : new HttpError("Invalid Extension type!", 500)
        console.log(error)
        callback(error, isValid)
    }
})
module.exports= { uploadFile }