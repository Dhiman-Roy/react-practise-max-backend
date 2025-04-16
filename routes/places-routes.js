const express = require("express");
const { body } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.post(
  "/",
  [
    body("title").not().isEmpty().escape(),
    body("description").isLength({ min: 5 }).escape(),
    body("address").not().isEmpty().escape(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [
    body("title").not().isEmpty().escape(),
    body("description").isLength({ min: 5 }).escape(),
  ],
  placesControllers.updatePlace
);
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
