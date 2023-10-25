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

app.use(express.urlencoded({ extended: true }));

//PAGES

//GET
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  console.log(req.params.id)
  res.redirect(longURL);
});

//POST

//helper(s) for post
//generates a random 6 character string
const generateRandomString = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let randomId = ""
  for (i = 0; i < 6; i++) {
    randomId += characters.charAt(Math.floor(characters.length * Math.random()))
  }
  return randomId
}

app.post("/urls", (req, res) => {
  const urlId = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[urlId] = longURL
  console.log(urlDatabase)
  res.redirect("/urls/" + urlId);
})

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