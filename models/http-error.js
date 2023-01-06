
class HttpError extends Error{
    constructor(errMessage, errCode){
        super(errMessage)
        this.code=errCode
    }
}
module.exports=HttpError