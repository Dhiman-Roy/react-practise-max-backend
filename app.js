const express = require("express");
const HttpError = require("./models/http-error");
const app = express();
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find these route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose.set("debug", true);

// (2) Log connection events
mongoose.connection.on("connecting", () => console.log("Connecting..."));
mongoose.connection.on("connected", () => console.log("Connected!"));
mongoose.connection.on("error", (err) => console.error("Error:", err));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() =>
    app.listen(5000, (err) => {
      console.log("Listening to port 5000");
    })
  )
  .catch((err) => {
    console.log(err);
  });
