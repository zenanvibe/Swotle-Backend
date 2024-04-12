"use strict";
const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

//local mysql db connection
const dbConn = {
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 25060
};

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbConn.host,
  user: dbConn.user,
  password: dbConn.password,
  database: dbConn.database,
  port: dbConn.port,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("Error connecting to database:", err);
    return;
  }
  console.log("Database connected successfully!");
  connection.release();
});

pool.on("error", (err) => {
  console.log("Database connection error:", err);
});

module.exports = pool;
