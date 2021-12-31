"use strict";
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.post("/add/class", async function(req, res) {
  try {
    let name = req.body.name;
    let color = req.body.color;
    let db = await getDBConnection();
    let qry = "INSERT INTO classes VALUES (?, ?)";
    await db.run(qry, [name, color]);
    res.type("text").send("success");
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

app.get("/classes", async function(req, res) {
  try {
    let db = await getDBConnection();
    let qry = "SELECT * FROM classes";
    let rows = await db.all(qry);
    res.type("json").send(rows);
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
    filename: "tables.db",
    driver: sqlite3.Database
  });

  return db;
}

app.use(express.static("public"));
const portNum = 8080;
const PORT = process.env.PORT || portNum;
app.listen(PORT);