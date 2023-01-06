const express = require("express");
const validator = require("express-validator");
const { createUser, updateUser, deleteUser, loginUser, getUser, getAllUsers, fetchImage } = require("../controllers/users-controllers");
const multer = require("multer");
const { uploadFile } = require("../middleware/upload_image");
const { AuthUser } = require("../middleware/auth_user");
const upload = multer({dest: "../upload/images"})
const router = express.Router();

router.get("/user/:uid", getUser);
router.get("/users", getAllUsers);
router.post("/users/new", uploadFile.single("image"),
[
    validator.check('name').exists().notEmpty(),
    validator.check('emailId').normalizeEmail().isEmail()
    .withMessage("Please Enter a valid Email ID"),
    validator.check('password').exists().isStrongPassword({
        minLength: 10,
        minSymbols: 1,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1
    })
    .withMessage("Password must be having below properties: \n"+
    "1. greater than or equal to 10 letters\n"+
    "2. having atleast 1 symbols, 1 uppercase, 1 number and 1 lowercase")
],
createUser);
router.patch("/update-user/:uid", AuthUser, updateUser);
router.delete("/delete-user/:uid", AuthUser, deleteUser);
router.post("/sign-in", loginUser);
router.get("/fetch-image", fetchImage);

module.exports = router