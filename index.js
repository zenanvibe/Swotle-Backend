const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const dbconn = require("./config/db.config")
dotenv.config();

const app = express();

const port = process.env.PORT || 3030;

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// define a root route
app.get("/", (req, res) => {
  res.status(412);
  res.send("No permission to view this");
});

app.get("/server_status", (req, res) => {
  res.status(200);
  res.send("SERVER UP");
});

app.get("/dbcheck", (req, res) => {
  if (dbconn) {
    res.status(200);
    res.send("DB UP");
  }
});

// Importing Routes
const generateRoutes = require("./src/routes/generate.routes");


// using as middleware
app.use("/api/v1/generate", generateRoutes);




// listen for requests
app.listen(port, () => {
  console.log(`Api Swotle is listening on ${port}/`);
});
