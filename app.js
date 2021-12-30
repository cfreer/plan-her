"use strict";
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.get("/boxes", async function(req, res) {
  try {
    // let db = await getDBConnection();
    // let qry = "SELECT description FROM boxes ORDER BY RANDOM() LIMIT 30";
    // let rows = await db.all(qry);

    // res.type("json").send(rows);
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @return {Object} the database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "boxes.db",
    driver: sqlite3.Database
  });

  return db;
}

app.use(express.static("public"));
const portNum = 8080;
const PORT = process.env.PORT || portNum;
app.listen(PORT);