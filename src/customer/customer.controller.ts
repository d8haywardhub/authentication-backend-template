import * as express from 'express';
import passport = require('passport');

import Customer from './customer.interface';
import customerService from './customer.service'
import CustomersNotFoundException from '../common/exceptions/CustomerNotFoundException';
import HttpException from '../common/exceptions/HttpException';

// Test controller for testing authentication and API REST requests.....

class CustomerController { // implements Controller {
    public path:string = '/customers';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Customer routes
        this.router.get(`${this.path}`, this.customers);
        this.router.post(`${this.path}`, this.createCustomer);
        this.router.patch(`${this.path}/:id`, this.modifyCustomer);         // TODO validationMiddleware(CreatePostDto, this.skipMissingProperties)
        this.router.delete(`${this.path}/:id`, this.deleteCustomer); 
    }

    private createCustomer = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const customerData: Customer = req.body;
            //throw("test catch");
            const createdCustomer = await customerService.createCustomer(customerData);
            if (createdCustomer) {
                res.send(createdCustomer);
            } else {
              next(new CustomersNotFoundException());
            }
        } catch(error) {
            next(new HttpException(500, `unexpected error during create customer ${error}`));
        }

      }
    
    private modifyCustomer = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const id = req.params.id;
            const customerData: Customer = req.body;
            //throw("test catch");
            const upatedCustomer = await customerService.updateCustomer(id, customerData);
            if (upatedCustomer) {
                res.send(upatedCustomer);
            } else {
              next(new CustomersNotFoundException());
            }
        } catch(error) {
            next(new HttpException(500, `unexpected error during update customer ${error}`));
        }

    }

    private customers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const customers = await customerService.getCustomers({});
            if (customers) {
                //console.dir("/customers returned: "+customers);
                res.send(customers);
                //return res.json({ user }).status(200).end();
            } else {
                next(new CustomersNotFoundException());
            }
        } catch(error) {
            next(new HttpException(500, `unexpected error during get users ${error}`));
        }
    }

    private deleteCustomer = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const id = req.params.id;
            const upatedCustomer = await customerService.deleteCustomer(id);
            if (upatedCustomer) {
                res.send(upatedCustomer);
            } else {
              next(new CustomersNotFoundException());
            }
        } catch(error) {
            next(new HttpException(500, `unexpected error during delete customer ${error}`));
        }

    }
}

export default CustomerController;