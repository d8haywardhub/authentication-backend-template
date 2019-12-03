import * as fs from 'fs';
//import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = require("passport-jwt").Strategy;

import userService from '../user/user.service';
//const User = userService.user.userModel;
import User from '../user/user.interface';

const privateKEY  = fs.readFileSync('./private.key', 'utf8');
const publicKEY  = fs.readFileSync('./public.key', 'utf8');


module.exports = passport => {
    passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey   : publicKEY
        },
        function (jwtPayload, done:any) {
debugger;
            //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
           return userService.user.userModel.findById(jwtPayload._id)
                .then( (user: User) => {
                    return done(null, user);
                })
                .catch(err => {
                    return done(err, false);
                });
        }
    ));
}

