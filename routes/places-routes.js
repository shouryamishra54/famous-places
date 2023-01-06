
const express = require("express")
const uuid = require("uuid");
const { 
    getAllPlaces, getPlaceByPlaceId, getPlacesByUserId, addNewPlace, updatePlaceById, 
    deletePlaceById 
} = require("../controllers/places-controllers");
const { AuthUser } = require('../middleware/auth_user');
const router = express.Router();

router.get('/places', getAllPlaces)
router.get('/place/:pid', getPlaceByPlaceId);
router.get('/users/:uid', getPlacesByUserId);
router.post('/update/:pid', AuthUser, updatePlaceById);
router.delete('/delete/:pid', AuthUser, deletePlaceById);
router.post('/new', AuthUser, addNewPlace);

module.exports=router