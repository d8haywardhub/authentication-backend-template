//import * as express from 'express';
import * as fs from 'fs';
import * as passportJWT from 'passport-jwt';
const JWTStrategy = require("passport-jwt").Strategy;

import userService from '../user/user.service';
import User from '../user/user.interface';

const privateKEY  = fs.readFileSync('./private.key', 'utf8');
const publicKEY  = fs.readFileSync('./public.key', 'utf8');


module.exports = passport => {
    passport.use(new JWTStrategy({
            jwtFromRequest: req => req.cookies.jwt,
            secretOrKey   : publicKEY
        },
        function (jwtPayload, done:any) {
           //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
           return userService.user.userModel.findById(jwtPayload._id)
                .then( (user: User) => {
                    return done(null, jwtPayload);
                })
                .catch(err => {
                    return done(err, false);
                });
        }
    ));
}

