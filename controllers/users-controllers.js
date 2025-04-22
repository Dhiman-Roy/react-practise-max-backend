const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "max schedul",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password, places, image } = req.body;
  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("fetching data failed. please try after.", 500));
  }
  if (hasUser) {
    return next(new HttpError("This user already exists. please log in.", 422));
  }
  const createdUser = new User({
    // id: uuidv4(),
    name,
    email,
    password,
    places,
    image,
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong. please try again later.", 500)
    );
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError(
        "could not identify user, credentials seem to be wrong.",
        401
      )
    );
  }
  res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
