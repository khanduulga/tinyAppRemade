const express = require("express");
let cookieParser = require('cookie-parser')


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
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

//PAGES

//GET
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  if (!templateVars.user) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  }
})

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
   
  if (!longURL) {
    return res.status(404).send("No such link exists, you've been had!")
  } else {
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (templateVars.user) {
    res.redirect("/urls")
  } else {
    res.render("register", templateVars)
  }
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (templateVars.user) {
    res.redirect("/urls")
  } else {
    res.render("login", templateVars)
  }
})

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

const findUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

//end of helpers

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]

  if (!user) {
    return res.status(401).send("Please register first, to be able to shorten URLs.")
  } else {
    const urlId = generateRandomString()
    const longURL = req.body.longURL
    urlDatabase[urlId] = longURL
    res.redirect("/urls/" + urlId);
  }
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

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = findUserByEmail(email)

  if (!user) {
    return res.status(403).send("User does not exist.")
  }
  else if (user.password !== password) {
    return res.status(403).send("Incorrect password.")
  }
  else {
    res.cookie('user_id', user.id)
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).send("You must include an email or password.")
  }
  else if (findUserByEmail(email)) {
    return res.status(400).send("Email already exists.")
  }
  else {
    users[id] = {
      id, email, password
    }

    res.cookie("user_id", id)
    res.redirect("/urls")
  }
})

//MESSAGE for console after startup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});