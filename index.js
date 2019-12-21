const http = require('http');
const express = require('express');
const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
// You may also use Mongo, Memory or any other limiter type

const redisClient = redis.createClient({
  enable_offline_queue: false,
});

const maxConsecutiveFailsByUsername = 5;

const limiterConsecutiveFailsByUsername = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'login_fail_consecutive_username',
  points: maxConsecutiveFailsByUsername,
  duration: 60 * 60 * 3, // Store number for three hours since first fail
  blockDuration: 60 * 15, // Block for 15 minutes
});

async function loginRoute(req, res) {
  const username = req.body.email;
  const rlResUsername = await limiterConsecutiveFailsByUsername.get(username);

  if (rlResUsername !== null && rlResUsername.consumedPoints > maxConsecutiveFailsByUsername) {
    const retrySecs = Math.round(rlResUsername.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(retrySecs));
    res.status(429).send('Too Many Requests');
  } else {
    const user = authorise(username, req.body.password);

    if (!user.isLoggedIn) {
      try {
        await limiterConsecutiveFailsByUsername.consume(username);

        res.status(400).end('email or password is wrong');
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected;
        } else {
          res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
          res.status(429).send('Too Many Requests');
        }
      }
    }

    if (user.isLoggedIn) {
      if (rlResUsername !== null && rlResUsername.consumedPoints > 0) {
        // Reset on successful authorisation
        await limiterConsecutiveFailsByUsername.delete(username);
      }

      res.end('authorised');
    }
  }
}

const app = express();

app.post('/login', async (req, res) => {
  try {
    await loginRoute(req, res);
  } catch (err) {
    res.status(500).end();
  }
});