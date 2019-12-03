import * as express from 'express';
import * as bcrypt from 'bcrypt';

import Controller from '../../common/interfaces/controller.interface';
import LogInDto from './logIn.dto';
import CreateUserDto from '../user/user.dto';
import userService from '../user/user.service'
import jwtUtil from './jwt.util';


class AuthenticationController implements Controller {
    public path:string = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);
    }

    private registration = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const registrationData: CreateUserDto = req.body;
        const { name, email, password } = registrationData; //req.body && req.body.user;

        try {

            async function checkEmail() {
                debugger;
                const numUsers = await userService.getCount(registrationData.email);
                if (numUsers !== 0) {
                    return Promise.reject({ "message": "Error: email already exists." });
                  }
                  return true;
            }
            
            async function createUser() {
                const hashedPwd = await new Promise((resolve, reject) => {
                    const saltRounds:number = 10;
                    bcrypt.hash(password, saltRounds, (error:Error, hash:any) => {
                        if (error) {
                            reject(error);
                        } 
                        resolve(hash);
                    });

                });
                const newUser = {
                    password: hashedPwd,
                    email,
                    name,
                }

                const user = await userService.createUser(newUser);

                return user;
            }

            if (await checkEmail()) {
                const newUser = await createUser();
    
                const jwtPayload = { "_id": newUser._id, "name": newUser.name, "email": newUser.email }
                var token = await jwtUtil.sign(jwtPayload);
      
                const user = { "email": newUser.email, "name":newUser.name };
                return res.json({ user, token }).status(200).end();
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
        console.dir(loginData);
        debugger;
        try {
            const userRecord = await userService.getUser(loginData.email);

            if (!userRecord) {
                //throw new Error('User not found');
                //next(new PostNotFoundException(id));
                next(new Error('User not found'));
            }
            else {
                /*
                const correctPassword = await bcrypt.compare(password, userRecord.password);
                if (!correctPassword) {
                    console.log('Incorrect password')
                    throw new Error('Incorrect password')
                }
                */

                const jwtPayload = { "_id": userRecord._id, "name": userRecord.name, "email": userRecord.email }
                var token = await jwtUtil.sign(jwtPayload);

                const loginResponse = {
                    user: {
                        email: userRecord.email,
                        name: userRecord.name,
                    },
                    token: token
                };
    
                return res.status(200).json(loginResponse).end();
            }
        } catch(error) {
            //throw new Error(error);
            console.log("Exception occured loggingIn .... error: ", error);
            //next({status: 500, message: error.message})
            //next(new NotAuthorizedException());
            res.status(500).json({ "message": "Login Failed" });
        }

        //console.dir(userRecordDoc);
        //res.send({"TBD": "Implement logging in"});

    }
}


export default AuthenticationController;