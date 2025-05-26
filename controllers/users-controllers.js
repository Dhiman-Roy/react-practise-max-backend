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
  const { name, email, password, image } = req.body;
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
    name,
    email,
    password,
    places: [],
    image,
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong. please try again later.", 500)
    );
  }
  const v = { user: createdUser.toObject({ getters: true }) };
  console.log(v);
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed, please try again later", 500));
  }
  if (!hasUser || hasUser.password !== password) {
    return next(new HttpError("Invalid credential, could not log you in", 401));
  }
  res.json({ message: "logged in", user: hasUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
