import {
  cleanEnv, port, str, num, bool
} from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    JWT_SECRET: str(),
    PORT: port(),
    MONGO_DOMAIN: str(),
    MONGO_DBNAME: str(),
    MONGO_PORT: port(),
    COOKIE_MAXAGE: num(),
    COOKIE_HTTPONLY: bool(),
    COOKIE_SECURE: bool(),
    REDIS_URL: str()
  });
}

export default validateEnv;
