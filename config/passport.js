var LocalStrategy = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy = require('passport-twitter').Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var connection = require('../dbConnection.js');


module.exports = function(passport) {
// turn the user info into serialized
  passport.serializeUser(function(user, done) {
    console.log(user, 'user')
    done(null, user.user_id);
  });
// deserialize the user
  passport.deserializeUser(function(id, done) {
    //by finding by the id
    connection.query(`select * from users where user_id = ${id}`, (err, rows) => {
      done(err, rows);
    });
  });
// use the local sign up method
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      connection.query("select * from users where email = '"+email+"'",function(err,rows){
      console.log(rows);
      console.log("above row object");
        if (err) {
          return done(err);
        }
        if (rows.length) {
          return done(null, false);
        } else {
          const newUserMysql = new Object();
          newUserMysql.email    = email;
          newUserMysql.password = password; // use the generateHash function in our user model
          // newUser.local.password = newUser.generateHash(password);
          const insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ password +"')";
          console.log(insertQuery);
          connection.query(insertQuery, (error, rowsTwo) => {
            console.log(rowsTwo, 'rowsTwo')
            console.log(newUserMysql, 'newUserMysql')
            newUserMysql.user_id = rowsTwo.insertId;

            return done(null, newUserMysql);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'", (err, rows) => {
      if (err) {
        return done(err);
      }
      if (!rows.length) {
        return done(null, false); // req.flash is the way to set flashdata using connect-flash
      }

  // if the user is found but the password is wrong
      if (!(rows[0].password === password)) {
        return done(null, false); // create the loginMessage and save it to session as flashdata
      }

  // all is well, return successful user
      return done(null, rows[0]);
    });
  }));
}