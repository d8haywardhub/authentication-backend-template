import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';

import Controller from './common/interfaces/controller.interface';
import errorMiddleware from './common/middleware/error.middleware';


class App {
  public app: express.Application;
  public port: number;

  constructor(controllers, port) {
    this.app = express();
    this.port = port;

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    require('./authentication/authentication/passport.jwt')(passport);
    this.app.use(passport.initialize());
    //this.app.use(passport.session());

    // protects app from some well-known web vulnerabilities by setting HTTP headers appropriately
    this.app.use(helmet())
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller: Controller) => {
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private connectToTheDatabase() {
    const {
      MONGO_DOMAIN,
      MONGO_PORT,
      MONGO_DBNAME
    } = process.env;

    mongoose.connect(`${MONGO_DOMAIN}:${MONGO_PORT}/${MONGO_DBNAME}`, { "useNewUrlParser": true,  "useUnifiedTopology": true });
    //await mongoose.connect(config.mongoUrl, { "useNewUrlParser": true,  "useUnifiedTopology": true });

  }
}

export default App;
