//import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';


class JwtUtil {
    //private privateKey:string = process.env.JWT_SECRET;
    //private signingOptions:any = {
    //    expiresIn : 15 * 24 * 60 * 60 * 1000 // 15 days
    //}
    private signOptions:any = {
      expiresIn : "12h",  // 12 hours
      algorithm: "RS256"
    }
    private verifyOptions:any = {
      expiresIn : "12h",  // 12 hours
      algorithm: ["RS256"]
    }

    private privateKEY  = fs.readFileSync('./private.key', 'utf8');
    private publicKEY  = fs.readFileSync('./public.key', 'utf8');

    sign = ( payload: any, options = this.signOptions ):  Promise<Error|string> => {     // 15 days
      return new Promise((resolve, reject) => {
        jwt.sign(payload, this.privateKEY, options, (err: Error, token: string) => {
          if (err || !token)
          {
            return reject(err)
          }
    
          resolve(token)
        })
      });
    };

    verify = (token: any, options = this.verifyOptions): Promise<Error|any> => {
        debugger;
        return new Promise((resolve, reject) => {
          jwt.verify(token, this.publicKEY, options, (err: Error, decodedToken: any) => {
            if (err || !decodedToken)
            {
              return reject(err)
            }
      
            resolve(decodedToken)
          })
        });
    }

    /*
    signSync = ( payload: any, options = { expiresIn : 15 * 24 * 60 * 60 * 1000   } ): any => {     // 15 days
        return jwt.sign(payload, this.privateKey, options);
    };

    verifySync = (token: any, options = {  }): any => {
        return jwt.verify(token, this.privateKey, options);
    }
    */

    /*
    sign = ( payload: any, options = { expiresIn : 15 * 24 * 60 * 60 * 1000   } ):  Promise<Error|string> => {     // 15 days
      return new Promise((resolve, reject) => {
        jwt.sign(payload, this.privateKey, options, (err: Error, token: string) => {
          if (err || !token)
          {
            return reject(err)
          }
    
          resolve(token)
        })
      });
    };

    verify = (token: any, options = {}): Promise<Error|any> => {
        debugger;
        return new Promise((resolve, reject) => {
          jwt.verify(token, this.privateKey, (err: Error, decodedToken: any) => {
            if (err || !decodedToken)
            {
              return reject(err)
            }
      
            resolve(decodedToken)
          })
        });
    }
    */


    decode = (token: any) => {
      return jwt.decode(token, {complete: true});
      // returns null if token is invalid
    }
}

export default new JwtUtil