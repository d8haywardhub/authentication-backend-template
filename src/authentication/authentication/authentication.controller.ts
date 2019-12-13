import * as express from 'express';
import * as bcrypt from 'bcrypt';

import Controller from '../../common/interfaces/controller.interface';
import LogInDto from './logIn.dto';
import CreateUserDto from '../user/user.dto';
import userService from '../user/user.service'
import jwtUtil from './jwt.util';

interface AuthResponse {
    user: UserInfo,
    serverKey: number
}

interface UserInfo {
    email: string,
    name: string
}


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


    private getJwtResponse = async (userDocument: any) => {
        debugger;
        // get and sign jwt token
        const jwtPayload = { "_id": userDocument._id, "name": userDocument.name, "email": userDocument.email }
        var token = await jwtUtil.sign(jwtPayload);
        // return login/register response.... contains jwt token for future RESTful request verification
        return {
            user: {
                email: userDocument.email,
                name: userDocument.name,
            },
            token: token
        };
    }

    private getRandomInt = () => {
        const min = Math.ceil(0);
        const max = Math.floor(10000);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
      }

    private handleJwtResponse = async (userDocument: any, res: express.Response):Promise<AuthResponse> => {
        debugger;
        const serverSideKeyCSRF = this.getRandomInt();
        // get and sign jwt token
        const jwtPayload = { "_id": userDocument._id, "name": userDocument.name, "email": userDocument.email, "serverKey": serverSideKeyCSRF }
        var token = await jwtUtil.sign(jwtPayload);
        // return login/register response.... contains secure cooie with jwt token and csrf used in JWT payload for future RESTful request verification
        
        
        res.cookie('jwt',token,{
            //signed:true,
            secure:false,                // true if using HTTPS   TODO configuration!!!!
            httpOnly:true,
            //maxAge:1000*60*60*24*5
        });
        
        
        return {
            user: {
                email: userDocument.email,
                name: userDocument.name,
            },
            serverKey: serverSideKeyCSRF
        };
    }


    private registration = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const registrationData: CreateUserDto = req.body;
        const { name, email, password } = registrationData;

        try {

            async function checkEmail() {
                debugger;
                const numUsers = await userService.getUserCount(registrationData.email);
                if (numUsers !== 0) {
                    return Promise.reject({ "message": "Error: email already exists." });
                  }
                  return true;
            }
            
            async function createUser() {
                debugger;
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
    
                //const jwtResp = await this.getJwtResponse(newUserDocument);
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
                //const jwtResp = await this.getJwtResponse(userDocument);
                const jwtResp:AuthResponse = await this.handleJwtResponse(userDocument, res);
                debugger;
                // send successful response
                return res.status(200).json(jwtResp).end();
                //return res.json(jwtResp).status(200).end();
            }
        } catch(error) {
            console.log("Exception occured loggingIn .... error: ", error);
            //next(new NotAuthorizedException());
            //res.status(500).json({ "message": "Login Failed" });
            next(new Error('Login failed'));
        }

    }
}


export default AuthenticationController;