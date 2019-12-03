import HttpException from './HttpException';

class CustomersNotFoundException extends HttpException {
    constructor() {
        super(404, `Customers not found`);
    }
}

export default CustomersNotFoundException;