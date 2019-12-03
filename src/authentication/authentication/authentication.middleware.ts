//'use strict';
import * as express from 'express';

//module.exports = function (redirect) {
const ensureAuthenticated = function (redirect: any) {
  // Where to redirect if user is not authenticated
  redirect = redirect || "/login";

  return function ensureAuthenticated(req: any, res: express.Response, next: express.NextFunction) {
    // If request is authenticated (passport check) continue, else redirect
    if (req.isAuthenticated()) {
      // Adding shortcut for currently logged-in user id
      req.currentUserId = req.user._id;
      next();
    } else {
      res.redirect(redirect);
    }
  };
};

export default ensureAuthenticated;
