require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = new mongoose.model("user", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get('/logout', function(req, res) {
  res.redirect('/');
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render('secrets');
      }
    });
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser) {
    if (err) { // If there's an error
      console.log(err);
    } else if (foundUser) { // If we found a user with that username
      bcrypt.compare(password, foundUser.password, function(err, result) { // If the passwords match
        if (result === true) {
          res.render('secrets');
        } else {
          console.log("Password doesn't match");
          res.redirect('/login');
        }
      });
    } else {
      console.log("No user with that username found");
      res.redirect('/login');
    }
  });
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
})