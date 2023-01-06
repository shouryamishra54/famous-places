const { default: isURL } = require("validator/lib/isURL");
const { default: isAlphanumeric } = require("validator/lib/isAlphanumeric");

function title_error(str){
    const error={
        "1":"Title is invalid",
        "2":"Title cannot be less than 3 letters"
    }
    // let str="ffff";
    if(!str || str.length === 0 || str.match(/[A-Za-z]/g).length === 0){
        return error["1"]
    }if(str.length < 3){
        return error["2"]
    }
    return null;
}
function desc_error(str){
    // let str="dfkhdhdf";
    const error={
        "1":"Description is invalid",
        "2":"Description cannot be less than 6 characters"
    }
    if(str && str.length > 0 && str.match(/[A-Za-z]/g).length === 0){
        return error["1"]
    }if(str && str.length < 6){
        return error["2"]
    }
    return null;
}
function url_error(str){
    const error={
        "1":"URL is invalid"
    }    
    if(str && str.length > 0 && !isURL(str)){
        return error["1"]
    }
    return null;
}
function address_error(str){
    // let str="fdjfhkjsd";
    const error={
        "1":"Address cannot be blank",
        "2":"Address must always be an alphanumeric"
    }
    if(!str || str.length === 0){
        return error["1"]
    }
    if(!str.match(/[0-9]/g) || !str.match(/[A-Za-z]/g)){
        return error["2"]
    }
    return null;
}
function creator_error(str){
    const error={
        "1":"Creater cannot be blank"
    }
    if(!str || str.length === 0){
        return error["1"]
    }
    return null;
}
function placeError(obj){
    let error=title_error("");
    if(obj && obj !== null && obj !== undefined){
        error = [
            title_error(obj.title),
            desc_error(obj.description),
            url_error(obj.imageUrl),
            address_error(obj.address),
            creator_error(obj.creator)
        ]
    }
    error=error.find((e)=>{return (e !== null && e !== undefined)})
    if(!error || error === null || error === undefined){
        return null;
    }
    return error;
}

module.exports = placeError;