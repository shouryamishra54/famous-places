const mongoose=require("mongoose");
const url=`mongodb+srv://mycluster.nkqkk.mongodb.net/${process.env.DB_NAME}?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority`;
// const cred="./X509-cert-2389018379024932381.pem";
const cred=process.env.DB_CRED

async function connectDB(callBack){
    await mongoose.connect(url, {sslCert: cred, sslKey: cred}).then(()=>{
        console.log("Connection Successful")
        callBack()
    }).catch((err)=>{
        console.log("Error: "+err)
    })
}
module.exports={connectDB}
