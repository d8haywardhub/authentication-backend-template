declare namespace NodeJS {
    export interface ProcessEnv {
        JWT_SECRET: string;
        MONGO_DOMAIN: string;
        MONGO_DBNAME: string;
        PORT: string;
    }
  }