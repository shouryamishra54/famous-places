import express from "express"
const app=express()
const port=process.env.PORT || 3000

app.get("/", (req, res)=>{
    console.log("Send from this ip: "+req.ip)
    res.send("Hello World")
})
app.listen(port, ()=>{
    console.log("Listening on port number "+port.toString())
})