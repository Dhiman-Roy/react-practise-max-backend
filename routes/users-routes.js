const express = require("express");
const { body } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const usersControllers = require("../controllers/users-controllers");
const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    body("name").not().isEmpty().escape(),
    body("email").normalizeEmail().isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
