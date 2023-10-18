const express = require("express");

//START server
const app = express();
const PORT = 8080; // default port 8080

//CONSTS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//PAGES

app.get("/", (req, res) => {
  res.send("Hello!");
});

//MESSAGE for console after startup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});