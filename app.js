const express = require("express");
const HttpError = require("./models/http-error");
const app = express();
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

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

app.listen(5000, (err) => {
  console.log("Listening to port 5000");
});
