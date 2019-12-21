import * as express from 'express';
import * as redis from 'redis';

const client = redis.createClient();        //('redis://localhost:6379')

client.on('error', err => console.log(`Error ${err}`))

module.exports = (request: express.Request, response: express.Response, next: express.NextFunction) => {
  const uid = request.body.email                // Redis - unique user identifier for the Redis key
  const perMinuteRateAllowed:number = 2;        //20;
  const blockDuration:number = 60 * 5;          // Block for 5 minutes

  client
    .multi()                        // starting a transaction
    .set(uid, "0", 'EX', 60, 'NX')  // Set uid 0 EX(expires in 60 seconds) NX(Only set the key if it does not already exist)
    .incr(uid)                      // Increment the uid value
    .exec((err, replies) => {
      if (err) {
        return response.status(500).send(err.message);
      }
      const reqCount:number = replies[1];
      //console.log(`current count ${reqCount}`);
      if (reqCount > perMinuteRateAllowed) {
        response.set('Retry-After', String(blockDuration));
        return response
            .status(429)
            .send(`Quota of ${perMinuteRateAllowed} per ${60}sec exceeded`);
      }
      return next();
    })
}
