
import * as passport from 'passport';
const LocalStrategy = require("passport-local").Strategy;

import userService from '../user/user.service';
const User = userService.user.userModel;

// Used to serialize the user for the session
passport.serializeUser(function (user:any, done) {
  done(null, user._id);
});

// Used to deserialize the user
passport.deserializeUser(function (id, done) {

  userService.user.userModel
    .findById(id)
    .then((user) => { done(null, user.toJSON()); })
    .catch((err) => { done(err); })
  ;

  
});

/* TODO: Refactor local-login and local-signup (promises v callbacks)
 *        - promisify bcrypt and genHash
 *        - would need solution that handles early exit in promise chain
 */

passport.use("local-login", new LocalStrategy({
  "usernameField": "email",
  "passwordField": "password",
  "passReqToCallback": true
}, function (req, login, password, done) {
  // TODO: Proper use of process.nextTick?
  // Ensuring that all code paths invoke the callback asynchronously
  process.nextTick(function () {
    /* Handled by LocalStrategy (https://github.com/jaredhanson/passport-local/blob/master/lib/strategy.js)
    // Bail early if missing params
    if (!login || !password) {
      return done(null, false, { "message": "Missing username or password." });
    }
    */

    // If user already logged in, ignore the login request
    if (req.user) {
      return done(null, new User(req.user));
    }

    // Saving / comparing login in lower case to avoid case-sensitivity
    login = login.toLowerCase();

    const checkLogin = function () {
      return userService.user.userModel
        .checkLogin(login, password)
        .catch(function () {
          // TODO: Check for / differentiate between errors? (DB down, login not found, bcrypt issue, bad password)

          // No user found for the given login
          return Promise.reject({"message": "Incorrect username or password."});
        })
        /* TODO: Change checkLogin to return false on mismatched password?
         * Currently checkLogin() => comparePassword() => returns rejected promise on mismatched password
         * Also see checkPassword()
         */
        /*
        .then(function (match) {
          if (!match) {
            // Password didn't match found user
            logger.trace("Bad password:", password);
            return Promise.reject({ "message": "Incorrect username or password." });
          }
          return match;
        })
        */
      ;
    };

    Promise.resolve()
      .then(() => checkLogin())
      .then(() => userService.user.userModel.updateLastLogin(login))
      /* https://github.com/jaredhanson/passport-strategy
       *
       * Strategies should call fail(...) to fail an authentication attempt.
       *
       * Strategies should call error(...) when an internal error occurs during the process of performing
       * authentication; for example, if the user directory is not available.
       *
       * https://github.com/jaredhanson/passport-local/blob/master/lib/strategy.js
       *
       * function verified(err, user, info) {
       *   if (err) { return self.error(err); }
       *   if (!user) { return self.fail(info); }
       *   self.success(user, info);
       * }
       *
       * ==================================================================================================
       * The below done() "translates" to verified()
       */
      .then((user) => done(null, user))
      // TODO: Logic for auth failures vs internal errors? (See above documentation)
      .catch((err) => done(null, false, err))
    ;
  });
}));

passport.use("local-signup", new LocalStrategy({
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
}, function (req, login, password, done) {
  // TODO: Proper use of process.nextTick?
  // Ensuring that all code paths invoke the callback asynchronously
  process.nextTick(function () {
    /* Handled by LocalStrategy (https://github.com/jaredhanson/passport-local/blob/master/lib/strategy.js)
     // Bail early if missing params
     if (!login || !password) {
     return done(null, false, { "message": "Missing username or password." });
     }
     */

    // If user already logged in, ignore the signup request
    if (req.user) {
      return done(null, new User(req.user));
    }

    // Saving / comparing login in lower case to avoid case-sensitivity
    login = login.toLowerCase();

    const checkEmail = function () {
      return userService.user.userModel
        .count({ "email": login })
        .then(function (numUsers) {
          if (numUsers !== 0) {
            return Promise.reject({ "message": "Login already exists." });
          }
          return true;
        })
        ;
    };

    const createUser = function () {
      let newUser = new User(req.body);

      return Promise.resolve()
        .then(() => newUser.hashPassword())
        .then(() => userService.user.userModel.create(newUser))
        .then(function (user) {
          return user;
        })
        ;
    };

    Promise.resolve()
      .then(() => checkEmail())
      .then(() => createUser())
      .then((user) => done(null, user))
      .catch(function (err) {
        return done(err);
      })
    ;
  });
}));
