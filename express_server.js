const express = require("express");
let cookieParser = require('cookie-parser')


//START server
const app = express();
const PORT = 8080; // default port 8080

//SET the view engine to ejs
app.set('view engine', 'ejs')

//CONSTS
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomId: {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

//PAGES
//helpers
const urlsForUser = (id) => {
  let urls = {}
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urls[url] = {
        longURL: urlDatabase[url].longURL,
        userId: urlDatabase[url].userId
      }
    }
  }
  return urls
}

//helpers end

//GET
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]

  if (!user) {
    return res.status(401).send("Please login or register first!")
  } else {
    const urls = urlsForUser(user.id)
    const templateVars = {
      user: user,
      urls: urls
    };
    res.render("urls_index", templateVars);
  }
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
  const user = users[req.cookies["user_id"]]


  if (!user) {
    return res.status(401).send("You are not logged in.")
  } else {
    const urls = urlsForUser(user.id)
    if (urlDatabase[req.params.id].userId === user.id) {
      const templateVars = {
        user: user,
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL
      };

      res.render("urls_show", templateVars);
    } else {
      return res.status(401).send("You do not have access to this link.")
    }
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL

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
    urlDatabase[urlId] = { longURL: longURL, userId: user.id }
    res.redirect("/urls/" + urlId);
  }
})

app.post("/urls/:id/delete", (req, res) => {
  const urlId = req.params.id
  const user = users[req.cookies["user_id"]]

  for (const url in urlDatabase) {
    if (url === urlId) {
      if (!user) {
        return res.status(401).send("You are not logged in.")
      } else {
        if (urlDatabase[urlId].userId === user.id) {
          delete urlDatabase[req.params.id]
          return res.redirect("/urls")
        } else {
          return res.status(401).send("You are not authorized to delete this link.")
        }
      }
    }
  }

  return res.status(404).send("No such thing exists.")
})

app.post("/urls/:id", (req, res) => {
  const urlId = req.params.id
  const user = users[req.cookies["user_id"]]

  for (const url in urlDatabase) {
    if (url === urlId) {
      if (!user) {
        return res.status(401).send("You are not logged in.")
      } else {
        if (urlDatabase[urlId].userId === user.id) {
          urlDatabase[urlId] = { longURL: req.body.newURL, userId: user.id }
          res.redirect("/urls")
        } else {
          return res.status(401).send("You are not authorized to edit this link.")
        }
      }
    }
  }

  return res.status(404).send("No such thing exists.")
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