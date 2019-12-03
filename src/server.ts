import 'dotenv/config';
import App from './app';

import validateEnv from './utils/validateEnv';

import AppControllers from './app.controllers';
 
validateEnv();

const app = new App(
  /*[
    new PostController(),
  ],*/
  AppControllers.controllers,
  process.env.PORT
);

/*const ws = new BidSocketServer();*/

app.listen();
