const express = require("express");


//START server
const app = express();
const PORT = 8080; // default port 8080

//SET the view engine to ejs
app.set('view engine', 'ejs')

//CONSTS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//PAGES

//GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//POST
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const urlId = req.params.id
  urlDatabase[urlId] = req.body.newURL
  res.redirect("/urls")
})

//MESSAGE for console after startup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});