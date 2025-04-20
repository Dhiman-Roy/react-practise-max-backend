const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Darjiling City",
    description: "Most Beautiful area city",
    imageUrl:
      "https://images.unsplash.com/photo-1622308644420-b20142dc993c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFyamVlbGluZ3xlbnwwfHwwfHx8MA%3D%3D",
    address: "27WC+9V2 Darjeeling, West Bengal, India",
    location: {
      lat: 27.0458959,
      lng: 88.2672631,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "meghalaya",
    description: "Most Beautiful site",
    imageUrl:
      "https://www.shutterstock.com/image-photo/magnificent-view-nohkalikai-fallsmeghalayaindia-600nw-1127211419.jpg",
    address: "27WC+9V2 meghalaya, India",
    location: {
      lat: 25.3125179,
      lng: 91.7663951,
    },
    creator: "u2",
  },
  {
    id: "p3",
    title: "syhlet",
    description: "Most Beautiful area ",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4d/Jaflong_Sylhet.jpg",
    address: "27WC+9V2 syhlet, Bangladesh",
    location: {
      lat: 24.9261249,
      lng: 91.8825551,
    },
    creator: "u3",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    return next(
      new HttpError("could not find a place for the provided id.", 404)
    );
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError("could not find a place for the provided user id.", 404)
    );
  }
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description, coordinates, imageUrl, address, creator } =
    req.body;
  console.log("Mongoose connection state:", mongoose.connection.readyState);

  const createdPlace = new Place({
    // id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    imageUrl,
    creator,
  });
  try {
    console.log("before create");
    const placeResult = await createdPlace.save();
    console.log(placeResult);
  } catch (err) {
    return next(new HttpError("creating place failed, please try again", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatePlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatePlace.title = title;
  updatePlace.description = description;
  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: updatePlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("could not find a place for that id", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
