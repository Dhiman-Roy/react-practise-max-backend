const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("something went wrong, could not find a place", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("could not find a place for the provided id.", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError("Fetching places faild. please try again later!", 500)
    );
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("could not find a place for the provided user id.", 404)
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, coordinates, address, creator } = req.body;
  console.log(req.body);
  const { lat, lng } = JSON.parse(coordinates);
  console.log("lat is: " + lat);
  const image = req.file.path;
  if (!image) {
    return next(new HttpError("Image URL is required", 422));
  }
  console.log(JSON.stringify(coordinates));
  const createdPlace = new Place({
    title,
    description,
    location: {
      lat,
      lng,
    },
    address,
    image: image,
    creator,
  });
  console.log("created place are");
  console.log(createdPlace);
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError("creating place failed... please try again.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("could not find user for provided id", 404));
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await createdPlace.save({ session });

    user.places.push(createdPlace._id);

    await user.save({ session });

    await session.commitTransaction();

    res.status(201).json({ place: createdPlace });
  } catch (err) {
    return next(new HttpError("creating place failed, please try again", 500));
  } finally {
    session.endSession();
  }
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("something went wrong. could not find a place.", 500)
    );
  }
  place.description = description;
  place.title = title;
  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("something went wrong, could not update place", 500)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("something went wrong, could not delete place", 500)
    );
  }
  if (!place) {
    return next(
      new HttpError("Something went wrong, could not find place id.", 404)
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await place.deleteOne("", { session });

    place.creator.places.pull(place);

    await place.creator.save({ session });

    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError("could not delete. please try later", 500));
  }

  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
