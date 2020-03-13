import * as express from 'express';
import {Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/HttpException';
//const redis = require('redis');
//const moment = require('moment');
import * as redis from 'redis';
import * as moment from 'moment';
const redisClient = redis.createClient();

module.exports = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    //redisClient.exists(request.headers.user,(err,reply) => {
    redisClient.exists(request.body.email,(err,reply) => {
        if(err){
            console.log("problem with redis");
            process.exit(0);        //system.exit(0);
        }

        if(reply === 1) {

            redisClient.get(request.body.email,(err,redisResponse) => {
                let data = JSON.parse(redisResponse);
                
                let currentTime = moment().unix()
                let lessThanMinuteAgo = moment().subtract(1,'minute').unix();

                let RequestCountPerMinutes = data.filter((item) => {
                    return item.requestTime > lessThanMinuteAgo;
                })

                let thresHold = 0;

                RequestCountPerMinutes.forEach((item) => {
                    thresHold = thresHold + item.counter;
                })

                if(thresHold >= 2){

                    return response.json({ "error" : 1,"message" : "throttle limit exceeded" })

                }
                else{

                    let isFound = false;
                    data.forEach(element => {
                        if(element.requestTime) {
                            isFound = true;
                            element.counter++;
                        }
                    });
                    if(!isFound){
                        data.push({
                            requestTime : currentTime,
                            counter : 1
                        })
                    }
                  
                    //redisClient.set(request.headers.user,JSON.stringify(data));
                    redisClient.set(request.body.email,JSON.stringify(data));

                    next();

                }
            })
        }
        else{
            let data:any = [];
            let requestData = {
                'requestTime' : moment().unix(),
                'counter' : 1
            }
            data.push(requestData);
            //redisClient.set(request.headers.user,JSON.stringify(data));
            redisClient.set(request.body.email,JSON.stringify(data));

            next();
        }
    })
}
//}

//export default ratelimiterMiddleware;