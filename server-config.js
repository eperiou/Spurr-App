 /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const reqTo = require('./server/router.js');
const passport = require('passport');
const rp = require('request-promise');
require('./config/passport')(passport);
require('./dbConnection');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/client')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// this is listened to by the post form in index.html
app.post('/api/users/signup', passport.authenticate('local-signup'), (req, res) => {
  res.json(req.body.username);
});
app.post('/api/users/signin', passport.authenticate('local-login'), (req, res) => {
  res.json(req.body.username);
});

/**
 * gets Oauth2 token
 * sets headers and searches for Getty images
 * @param {object} secret
 */

app.get('/api/imagequery', reqTo.getOauthToken, reqTo.searchImages);


app.get('/#!/signout', (req, res) => {
  req.logout();
  res.redirect('/signin');
});

app.post('/api/spurrs', reqTo.postSpurr);

app.get('/api/spurrs', reqTo.getSpurr);

app.post('/api/savedSpurrs', reqTo.saveSpurr);

app.get('/api/savedSpurrs', reqTo.getSavedSpurrs);

module.exports = app;
