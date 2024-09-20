const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const dbconn = require("./config/db.config");
const cors = require("cors"); // Import cors module

dotenv.config();

const app = express();

const port = 5000 || 5000;

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// define a root route\

const options = [
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
];

app.use(options);

app.get("/", (req, res) => {
  res.status(200);
  res.send("Swotle Backend API");
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
const authuserRoutes = require("./src/routes/user.routes");
const authclientRoutes = require("./src/routes/client.routes");
const userRoutes = require("./src/users/users.routes");
const authenticationRoutes = require("./src/auth/auth.routes");
const traitRoutes = require("./src/traits/traits.routes");
const companyRoutes = require("./src/company/company.routes");
const commentRoutes = require("./src/comment/comment.router");
const cardRoutes = require("./src/card/card.routes");

// Version 1 middleware
app.use("/api/v1/generate", generateRoutes);
app.use("/api/v1/users", authuserRoutes);
app.use("/api/v1/client", authclientRoutes);

// version 2 middleware

app.use("/api/v2/auth", authenticationRoutes);
app.use("/api/v2/trait", traitRoutes);
app.use("/api/v2/company", companyRoutes);
app.use("/api/v2/comments", commentRoutes);
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/card", cardRoutes);

// listen for requests
app.listen(port, () => {
  console.log(`Api Swotle is listening on ${port}/`);
});
