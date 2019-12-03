//import AnotherController from './wherever/your.controller.is.controller';
import AuthenticatonController from './authentication/authentication/authentication.controller';
import CustomerController from './customer/customer.controller';

class AppControllers {

    private _controllers: any[] = [
        new AuthenticatonController(),
        new CustomerController()
        // new.... add more controllers here
    ];

    constructor() { }

    get controllers(): any[] {
        return this._controllers;
    }

}

export default new AppControllers();