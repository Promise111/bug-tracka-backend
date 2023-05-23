require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const errorHandler = require("./app/middleware/error-handler.middleware");
const limiter = require("./app/middleware/rate-limiter.middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const db = require("./app/models");

app.use(cors({ origin: "*" }));
app.use(helmet());

let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
app.use(morgan("combined", { stream: accessLogStream }));
app.use(limiter);

db.mongoose
  .connect(db.url)
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).json({ status: "success", message: "BugTracka is live" });
});

require("./app/routes/auth.routes")(app);
require("./app/routes/bug.routes")(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("listening on " + PORT);
});
