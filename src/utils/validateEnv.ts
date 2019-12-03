import {
  cleanEnv, port, str,
} from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    JWT_SECRET: str(),
    PORT: port(),
    MONGO_DOMAIN: str(),
    MONGO_DBNAME: str(),
    MONGO_PORT: port(),
  });
}

export default validateEnv;
