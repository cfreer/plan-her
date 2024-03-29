"use strict";
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const multer = require("multer");
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.post("/add/class", async function(req, res) {
  try {
    let name = req.body.name;
    let color = req.body.color;
    let endDate = req.body.endDate;
    let db = await getDBConnection();
    let qry = "INSERT INTO classes VALUES (?, ?, ?)";
    await db.run(qry, [name, color, endDate]);
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

app.post("/add/task", async function(req, res) {
  try {
    let name = req.body.name;
    let taskClass = req.body.class;
    let days = req.body.days;
    let table = req.body.table;
    let dayArray = days.split(",");
    let db = await getDBConnection();
    let endDate = await getEndDate(db, taskClass);
    let dueDate = new Date(req.body.dueDate);
    let qry = "INSERT INTO " + table + " (name, class, due_date, repeated_days) VALUES (?, ?, ?, ?)";
    await db.run(qry, [name, taskClass, getTZDate(dueDate), days]);
    if (dayArray[0] !== "") {
      for (let i = 0; i < dayArray.length; i++) {
        let day = dayArray[i];
        dueDate = new Date(req.body.dueDate);
        dueDate = nextDay(dueDate, day);
        while (dueDate.getTime() <= endDate.getTime()) {
          let qry = "INSERT INTO " + table + " (name, class, due_date, repeated_days) VALUES (?, ?, ?, ?)";
          await db.run(qry, [name, taskClass, getTZDate(dueDate), days]);
          dueDate = nextDay(dueDate, day);
        }
      }
    }
    res.type("text").send("success");
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

app.get("/tasks", async function(req, res) {
  try {
    let db = await getDBConnection();
    let qry = "SELECT * FROM classes c, tasks t WHERE t.class = c.class " +
              "ORDER BY completed, due_date";
    let rows = await db.all(qry);
    res.type("json").send(rows);
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

app.get("/lectures", async function(req, res) {
  try {
    let db = await getDBConnection();
    let qry = "SELECT * FROM classes c, lectures l WHERE l.class = c.class " +
              "ORDER BY completed, due_date";
    let rows = await db.all(qry);
    res.type("json").send(rows);
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

app.post("/toggle/check", async function(req, res) {
  try {
    let id = req.body.id;
    let checked = req.body.checked;
    let table = req.body.table;
    let db = await getDBConnection();
    let qry = "UPDATE " + table + " SET completed = ? WHERE id = ?";
    await db.run(qry, [checked, id]);
    res.type("text").send("success");
  } catch (error) {
    console.log(error);
    res.type("text");
    res.status(500).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Returns the date of the next given day.
 * @param {Date} dueDate - start date
 * @param {String} day - day of the week. ex: Mo
 * @returns {Date} the date of the next given day
 */
function nextDay(dueDate, day) {
  day = DAYS.indexOf(day);
  let date = new Date(dueDate);
  date.setDate(dueDate.getDate() + (day + (7 - dueDate.getDay())) % 7);
  if (day === dueDate.getDay()) {
    date.setDate(date.getDate() + 7);
  }
  return date;
}

/**
 * Returns the date the current class ends.
 * @param {Object} db - database connection.
 * @param {String} taskClass - class to be checked when it ends.
 * @returns {Date} - the date the class ends.
 */
async function getEndDate(db, taskClass) {
  let qry = "SELECT end_date FROM classes WHERE class = ?";
  let row = await db.get(qry, [taskClass]);
  return getISODate(new Date(row.end_date));
}

function getTZDate(date) {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - (offset * 60 * 1000));
  date = date.toISOString().replace("T", " ")
    .substring(0, 16);
  return date;
}

function getISODate(date) {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() + (offset * 60 * 1000));
  return date;
}

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