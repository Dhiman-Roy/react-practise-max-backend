const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const { validationResult } = require("express-validator");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, { password: 0 });
  } catch (err) {
    return next(
      new HttpError("Fetching user failed, please try again later.", 500)
    );
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;
  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("fetching data failed. please try after.", 500));
  }
  if (hasUser) {
    return next(new HttpError("This user already exists. please log in.", 422));
  }
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("fetching data failed. please try after.", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path.replace(/\\/g, "/"),
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong. please try again later.", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "super_secret_dot_dot_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Something went wrong. please try again later.", 500)
    );
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed, please try again later", 500));
  }
  if (!hasUser) {
    return next(new HttpError("Invalid credential, could not log you in", 401));
  }
  let isValidPassword = false;
  try {
    isValidPassword = bcrypt.compare(password, hasUser.password);
  } catch (err) {
    return next(new HttpError("Login failed, please try again later", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credential, could not log you in", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: hasUser.id, email: hasUser.email },
      "super_secret_dot_dot_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Something went wrong. please try again later.", 500)
    );
  }
  res.json({ userId: hasUser.id, email: hasUser.email, token: token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
