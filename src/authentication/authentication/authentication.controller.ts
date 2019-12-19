import * as express from 'express';
import * as bcrypt from 'bcrypt';
import passport = require('passport');

//import * as redis from 'redis';
//const { RateLimiterRedis } = require('rate-limiter-flexible');
//import { RateLimiterRedis } from 'rate-limiter-flexible';

import Controller from '../../common/interfaces/controller.interface';
import LogInDto from './logIn.dto';
import CreateUserDto from '../user/user.dto';
import userService from '../user/user.service'
import jwtUtil from './jwt.util';
import HttpException from '../../common/exceptions/HttpException';

interface AuthResponse {
    user: UserInfo,
    serverKey: number
}

interface UserInfo {
    email: string,
    name: string,
    role: string
}


class AuthenticationController implements Controller {
    public path:string = '/auth';
    public router = express.Router();
    /*
    private redisClient;    //:redis.RedisClient;
    private maxWrongAttemptsByIPperMinute = 2;  //5;
    private maxWrongAttemptsByIPperDay = 100;
    */

    constructor() {
        //this.redisClient = redis.createClient({
        //    enable_offline_queue: false,
        //});
        this.initializeRoutes();
    }




    /*
    private limiterFastBruteByIP = new RateLimiterRedis({
        redis: this.redisClient,
        keyPrefix: 'login_fail_ip_per_minute',
        points: this.maxWrongAttemptsByIPperMinute,
        duration: 30,
        blockDuration: 60 * 10, // Block for 10 minutes, if 5 wrong attempts per 30 seconds
      });
      
    private limiterSlowBruteByIP = new RateLimiterRedis({
        redis: this.redisClient,
        keyPrefix: 'login_fail_ip_per_day',
        points: this.maxWrongAttemptsByIPperDay,
        duration: 60 * 60 * 24,
        blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
      });
      */



    private initializeRoutes() {
        // No need to check authentication during registration or login requests
        this.router.post(`${this.path}/register`, this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);


        // Check authentication for all OTHER requests
        this.router.use('/', this.ensureAuthenticated);

        // 
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private ensureAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const serverKey = req.get('Authorization');
            //console.dir(serverKey);
            if (serverKey === undefined) return next(new HttpException(500, `Authentication error - invalid request`));
            passport.authenticate("jwt",{session: false}, (error, payload, info) => {
                if (error) {
                     console.log(error);
                     next(new HttpException(500, `unexpected error during get customers ${error}`));
                }
                if (info !== undefined) {
                    console.log(info.message);
                    //res.send(info.message);
                    next(new HttpException(500, `Authentication error - ${info.message}`));
                } else {
                    // User is authenticated .... next
                    if (serverKey === ""+payload.serverKey) {
                        next();
                    } else {
                        next(new HttpException(500, `Authentication error - request contains invalid secret key`));
                    }

                }
            })(req, res, next);
        } catch(error) {
            next(new HttpException(500, `unexpected error during get users ${error}`));
        }
    }


    private getRandomInt = () => {
        const min = Math.ceil(0);
        const max = Math.floor(10000);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    private getEnvNumber = (env: string|undefined) => {
        return Number(env);
    }
    private getEnvBoolean = (env: string|undefined) => {
        return (env === "true" || env === "1");
    }

    private handleJwtResponse = async (userDocument: any, res: express.Response):Promise<AuthResponse> => {
        const serverSideKeyCSRF = this.getRandomInt();
        // get and sign jwt token
        // NOTE. jwt payload can be changed to contain whatever is required by web application
        const jwtPayload = { "_id": userDocument._id, "name": userDocument.name, "email": userDocument.email, "serverKey": serverSideKeyCSRF }
        var token = await jwtUtil.sign(jwtPayload);
        // return login/register response.... contains secure cooie with jwt token and csrf used in JWT payload for future RESTful request verification
        
        console.log("cookie maxAge: "+this.getEnvNumber(process.env.COOKIE_MAXAGE));
        console.log("cookie secure: "+this.getEnvBoolean(process.env.COOKIE_SECURE));
        res.cookie('jwt',token,{
            //signed:true,
            secure:this.getEnvBoolean(process.env.COOKIE_SECURE),       //false,                // true if using HTTPS
            httpOnly:this.getEnvBoolean(process.env.COOKIE_HTTPONLY),   //true,
            maxAge:this.getEnvNumber(process.env.COOKIE_MAXAGE)         //Number(process.env.COOKIE_MAXAGE)    //this.getCookieMaxAge()   //1000*60*60*24*5  //1000*60*2      //1000*60*60*24*5
            //expires: new Date(new Date().getTime()+5*60*1000)
        });
        
        
        return {
            user: {
                email: userDocument.email,
                name: userDocument.name,
                role: userDocument.role
            },
            serverKey: serverSideKeyCSRF
        };
    }


    private registration = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const registrationData: CreateUserDto = req.body;
        const { name, email, password } = registrationData;

        try {

            async function checkEmail() {
                const numUsers = await userService.getUserCount(registrationData.email);
                if (numUsers !== 0) {
                    return Promise.reject({ "message": "Error: email already exists." });
                  }
                  return true;
            }
            
            async function createUser() {
                const numUsers = await userService.getDocumentCount();
                const hashedPwd = await new Promise((resolve, reject) => {
                    const saltRounds:number = 10;
                    bcrypt.hash(password, saltRounds, (error:Error, hash:any) => {
                        if (error) {
                            reject(error);
                        } 
                        resolve(hash);
                    });

                });
                let role = "admin"; //"user";
                if (numUsers === 0) {
                    role = "admin";
                }
                const newUser = {
                    password: hashedPwd,
                    email,
                    name,
                    role
                }

                const user = await userService.createUser(newUser);

                return user;
            }

            if (await checkEmail()) {
                const newUserDocument = await createUser();
    
                const jwtResp:AuthResponse = await this.handleJwtResponse(newUserDocument, res);
                return res.json(jwtResp).status(200).end();

            } else {
                console.log("shouldn't get here..... exception expected as user already exists!")
            }

        } catch(error) {
            //throw new Error(error);
            console.log("Exception occured during registration .... error: ", error);
            //next({status: 500, message: error.message})
            //next(new NotAuthorizedException());
            res.status(500).json({ "message": "Registration Failed" });
        }
    }

    private loggingIn = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const loginData: LogInDto = req.body; 

        const ipAddr = req.connection.remoteAddress;
        console.dir(ipAddr);
        /*
        const [resFastByIP, resSlowByIP] = await Promise.all([
            this.limiterFastBruteByIP.get(ipAddr),
            this.limiterSlowBruteByIP.get(ipAddr),
          ]);
        
        let retrySecs = 0;
        // Check if IP is already blocked
        if (resSlowByIP !== null && resSlowByIP.consumedPoints > this.maxWrongAttemptsByIPperDay) {
            retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
        } else if (resFastByIP !== null && resFastByIP.consumedPoints > this.maxWrongAttemptsByIPperMinute) {
            retrySecs = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
        }

        console.log("retry...");
        console.log(retrySecs);
        if (retrySecs > 0) {
            res.set('Retry-After', String(retrySecs));
            res.status(429).send('Too Many Requests');
        }
        */
        //console.dir(loginData);
        try {
            const userDocument = await userService.getUser(loginData.email);
            if (!userDocument) {
                next(new Error('User not found'));
            }
            else {
                // Check for correct password
                const correctPassword = await bcrypt.compare(loginData.password, userDocument.password);
                if (!correctPassword) {
                    console.log('Incorrect password')
                    throw new Error('Incorrect password')
                }
                // get and sign jwt token
                const jwtResp:AuthResponse = await this.handleJwtResponse(userDocument, res);
                // send successful response
                return res.status(200).json(jwtResp).end();
            }
        } catch(error) {
            console.log("Exception occured loggingIn .... error: ", error);
            //next(new NotAuthorizedException());
            //res.status(500).json({ "message": "Login Failed" });
            next(new Error('Login failed'));
        }

    }

    private loggingOut = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const logoutData: LogInDto = req.body; 
        console.log(`loggingOut user: ${logoutData.email}`)
        try {
            const logoutResponse = {
                user: {
                },
                serverKey: null
            }
            res.clearCookie("jwt");
            return res.json(logoutResponse).status(200).end();
        } catch(error) {
            console.log("Exception occured loggingOut .... error: ", error);
            next(new Error('Logout failed'));
        }

    }
}


export default AuthenticationController;