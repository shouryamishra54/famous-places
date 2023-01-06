const { default: isEmail } = require("validator/lib/isEmail");
const { default: isStrongPassword } = require("validator/lib/isStrongPassword");
// const { users } = require("../controllers/users-controllers");

const name_error={
    "1":"Name cannot be empty",
    "2":"Name must contain atleast 1 alphabet",
    "3":"Name cannot be less than 3 letters"
}
const username_error={
    "1":"Username cannot be empty",
    "2":"Username must contain atleast 1 alphabet",
    "3":"Username cannot be less than 3 letters"
}
const email_error={
    "1":"Email cannot be empty",
    "2":"Email is invalid",
    "3":"User is already present"
}
const password_error={
    "1":"Password cannot be empty",
    "2":"Password cannot be less than 10 letters and must contain atleast 1 number, special, lowercase and uppercase letter"
}
function nameError(str){
    // let str="dd"
    let error;
    if(str){
        str=str.trim();
    }if(!str || str.length === 0){
        error=name_error["1"]
        return error
    }if(str.length < 3){
        error=name_error["3"]
        return error
    }else{
        const alphabets=str.match(/[A-Za-z]/g);
        if(alphabets === null || alphabets === undefined || alphabets.length < 1){
            error=name_error["2"]
            return error
        }
        return error
    }
}
function usernameError(str){
    let error;
    if(str){
        str=str.trim();
    }if(!str || str.length === 0){
        error=username_error["1"]
        return error
    }if(str.length < 3){
        error=username_error["3"]
        return error
    }else{
        const alphabets=str.match(/[A-Za-z]/g);
        if(alphabets === null || alphabets === undefined || alphabets.length < 1){
            error=username_error["2"]
            return error
        }
        return error
    }
}
function passwordError(str){
    // let str="dffgdf";
    let error;
    if(!str || str.length === 0){
        error=password_error["1"]
        return error
    }if(!isStrongPassword(str, [{
        minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    }])){
        error=password_error[2]
        return error
    }
    return error
}
function emailError(str){
    // let str="fddffd";
    str.toLowerCase();
    let error;
    if(!str || str.length === 0){
        error=email_error["1"]
        return error
    }if(!isEmail(str)){
        error=email_error["2"]
        return error
    }/*if(users.find((u)=>{return (u.emailId.toLowerCase() === str.toLowerCase())})){
        error=email_error[3]
        return error
    }*/
    return error
}
function userError(obj){
    // let str="khggdfjd";
    let error=nameError("");
    if(obj && obj !== undefined && obj !== null){
        error = [
            nameError(obj.name),
            usernameError(obj.username),
            emailError(obj.emailId),
            passwordError(obj.password)
        ]
    }
    // console.log(error)
    if(error.length > 0){
        return error.find((e)=>{return (e !== null && e !== undefined)})
    }
    return null;
}
module.exports = userError