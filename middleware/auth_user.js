const HttpError = require("../models/http-error");

const jwt = require("jsonwebtoken");

function AuthUser(req, res, next){
    if(req.method === "OPTIONS"){
        return next();
    }
    try{
        const token=req.headers.authorization.split(' ')[1]
        if(!token){
            throw new Error("Authentication failed")
        }
        decodedToken = jwt.verify(token, 'supersecret_dont_share')
        req.userData = {userId: decodedToken.userId, username: decodedToken.username, email: decodedToken.email}
        return next();
    }catch(err){
        const error=new HttpError("Authetication Failed", 403)
        return next(error);
    }
}
module.exports = { AuthUser }