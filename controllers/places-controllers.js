const HttpError = require("../models/http-error");
const uuid = require("uuid");
const placeError = require("../validators/place-validator");
const Place = require("../models/Place");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongodb");

let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
      address: '20 W 34th St, New York, NY 10001',
      location: {
        lat: 40.7484405,
        lng: -73.9878584
      },
      creator: 'u1'
    },
    {
      id: 'p2',
      title: 'Emp. State Building',
      description: 'One of the most famous sky scrapers in the world!',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
      address: '20 W 34th St, New York, NY 10001',
      location: {
        lat: 40.7484405,
        lng: -73.9878584
      },
      creator: 'u2'
    }
];
async function getAllPlaces(req, res, next){
  const {page=1, limit=10} = req.query
  const places=await Place.find()
  .limit((!parseInt(limit) || limit <= 0 || limit >100) ? 10 : limit)
  .skip((!parseInt(page) || page <= 0) ? 0 : (page-1)*limit).catch((err)=>{
    const error=new HttpError("Something went wrong, please try again later\n"+err, 500)
    return next(error)
  })
  if(!places || places === undefined || places === null){
    return next(new HttpError("No place found", 404))
  }
  res.status(201).json({places: places.map((p)=>{return p.toObject({getters: true})})})
}
async function getPlaceByPlaceId(req, res, next){
    const placeID=req.params.pid;
    if(!placeID || placeID === null ){
      const error=new HttpError("Place ID not found in URL... Please provide right URL", 403)
      return next(error)
    }
    const place=await Place.findById(placeID).catch((err)=>{
      const error=new HttpError("Something went wrong, please try again later\n"+err, 500)
      return next(error)
    })
    // const place=DUMMY_PLACES.find((p)=>{return (p.id === placeID)})
    if(!place || place === undefined || place === null){
      return next(new HttpError("No Place found for the requested ID", 404))
    }
    res.status(201).json({place:place.toObject({getters: true})})
}
async function getPlacesByUserId(req, res, next){
    const userID = req.params.uid;
    if(!userID || userID === null ){
      const error=new HttpError("User ID not found in URL... Please provide right URL", 403)
      return next(error)
    }
    const { page=1, limit=10 } = req.query
    if(ObjectId.isValid(userID)){
      const userPlaces=await User.findById(userID).populate({path: "places", options: {
        limit:(!parseInt(limit) || limit <= 0 || limit >= 100) ? 2 : limit,
        skip:(!parseInt(page) || page<=0) ? 0 : (page-1)*limit
      }
      }).catch((err)=>{
        const error=new HttpError("Something went wrong, please try again later\n"+err, 500)
        return next(error)
      })
      if(!userPlaces || !userPlaces.places || userPlaces.places.length === 0){
          const error=new HttpError("No Place found for the requested Creator", 404)
          return next(error)
      }
      res.status(201).json({places:userPlaces.places.map((p)=>{return p.toObject({getters: true})})})
    }
    else{
      const error=new HttpError("Invalid UserID")
      return next(error)
    }
}
async function addNewPlace(req, res, next){
    const {title, description, coordinates, address, 
      creator=req.userData ? req.userData.userId : req.userData }=req.body;
    const place={
        title, description, location: coordinates, address, creator
    }
    const createdPlace=new Place({
      title, description, location: coordinates, address, creator
    })
    placeInvalid=placeError(place)
    if(placeInvalid){
      const error=new HttpError(placeInvalid, 404)
      return next(error)
    }
    let user=await User.findById(creator).catch((err)=>{
      const error=new HttpError("Something went wrong, Please try again"+err, 500);
      return next(error)
    })
    if(!user || user === undefined || user === null){
      const error=new HttpError("Sorry, User not found for the given ID", 500)
      return next(error)
    }
    DUMMY_PLACES.push(place)
    try{
      const sess=await mongoose.startSession();
      sess.startTransaction();
      await createdPlace.save({session:sess})
      user.places.push(createdPlace)
      await user.save({session:sess})
      await sess.commitTransaction();
    }catch(err){
      const error=new HttpError("Creating place failed, please try again"+err, 500)
      return next(error)
    }
    // await createdPlace.save().catch((err)=>{
    //   const error=new HttpError("Creating Place Failed, please try again", 500)
    //   return next(error)
    // })
    // console.log(place)
    res.status(201).json({place:createdPlace.toObject({getters: true})})
}
async function updatePlaceById(req, res, next){
  const id=req.params.pid;
  if(!id || id === null ){
    const error=new HttpError("Place ID not found in URL... Please provide right URL", 403)
    return next(error)
  }
  // console.log("shourya")
  // console.log(req.body)
  const {title, description, coordinates, address}=req.body;
  // const index=DUMMY_PLACES.findIndex((p)=>{return (p.id === id)})
  // let place=DUMMY_PLACES.find((p)=>{return (p.id === id)})
  // if((index === undefined || index === -1) || place === undefined){
  //     const error=new HttpError("No Place found for this ID", 404)
  //     return next(error)
  // }
  // const updatedPlace={...place, ...req.body}
  let place=await Place.findById(id).catch((err)=>{
    const error=new HttpError("Something went wrong, could not update place", 500)
    return next(error)
  })
  if(!place || place === undefined || place === null){
    const error=new HttpError("Could not find the place to update", 404)
    return next(error)
  }
  if(!place.creator || place.creator.toString() !== req.userData.userId){
    const error=new HttpError("You are not allowed to edi this place.", 401)
    return next(error)
  }
  const oldPlace=place.toObject({getter:true})
  const updatedPlace={...place.toObject(), ...req.body}
  const placeInvalid=placeError(updatedPlace)
  if(placeInvalid){
    const error=new HttpError(placeInvalid, 404)
    return next(error)
  }
  // DUMMY_PLACES[index]=updatedPlace
  // console.log(Object.keys(req.body))
  Object.keys(req.body).map((p)=>{place[p]=req.body[p]})
  await place.save().catch((err)=>{
    const error=new HttpError("Something went wrong Could not update the place", 404)
    return next(error)
  })
  res.status(201).json({old:oldPlace, new:place.toObject({getter:true})})
}
async function deletePlaceById(req, res, next){
    const id=req.params.pid;
    if(!id || id === null ){
      const error=new HttpError("Place ID not found in URL... Please provide right URL", 403)
      return next(error)
    }
    // const index=DUMMY_PLACES.findIndex((p)=>{return(p.id === id)})
    // if(index === undefined || index === -1){
    //     const error=new HttpError("No Place found for this ID", 404)
    //     return next(error)
    // }
    // const deletedPlace=DUMMY_PLACES[index]
    // let placeToDelete=await Place.findById(id).catch((err)=>{
    //   const error=new HttpError("Someting went wrong, Unable to delete", 500)
    //   return next(error)
    // })
    // const place=placeToDelete.toObject();
    let placeToDelete=await Place.findById(id).populate("creator").catch((err)=>{
      const error=new HttpError("Something went wrong, please try again"+err, 500)
      return next(error);
    })
    if(!placeToDelete || placeToDelete === undefined || placeToDelete === null){
      const error=new HttpError("Place not found", 404)
      return next(error)
    }if(!placeToDelete.creator || placeToDelete.creator === undefined || placeToDelete.creator === null){
      const error=new HttpError("UserID not found", 404)
      return next(error)
    }
    if(placeToDelete.creator.id.toString() !== req.userData.userId){
      const error=new HttpError("You are not allowed to delete this place", 401)
      return next(error)
    }
    try{
      const sess=await mongoose.startSession()
      sess.startTransaction()
      placeToDelete.creator.places.pull(placeToDelete)
      await placeToDelete.creator.save({session:sess})
      await placeToDelete.remove({session:sess})
      await sess.commitTransaction();
    }catch(err){
      const error=new HttpError("Something went wrong, could not delete place"+err, 500)
      return next(error)
    }
    // DUMMY_PLACES.splice(index, 1)
    // await placeToDelete.remove().catch((err)=>{
    //   const error=new HttpError("Something went wrong, unable to delete", 500)
    //   return next(error)
    // })
    // DUMMY_PLACES=DUMMY_PLACES.filter((p)=>{return (p.id === id)})
    // console.log(DUMMY_PLACES)
    res.status(201).json({message: "Place deleted"})
}

module.exports = {
  getAllPlaces, getPlaceByPlaceId, getPlacesByUserId, 
  addNewPlace, updatePlaceById, deletePlaceById,
}