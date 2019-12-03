import Customer from './customer.interface';
import CustomerModel from './customer.model';

class CustomerService {

    public customer:CustomerModel = new CustomerModel();

    constructor() { }

    public getCustomer = async (email: string): Promise<Customer> => {
        return this.customer.customerModel.findOne({"email": email})
    }

    public getCustomers = async (query: any): Promise<Customer[]> => {
        return this.customer.customerModel.find({});
    }

    public getCustomersSorted = async (query: any, sort: any, limit: number): Promise<Customer[]> => {
        return this.customer.customerModel.find(query).sort(sort).limit(4);
    }

    public updateCustomer = async (id: any, data: Customer): Promise<Customer> => {
        return await this.customer.customerModel.findByIdAndUpdate(id, data, { new: true });
    }

    public getCount = async (email: string): Promise<number> => {
        return this.customer.customerModel.count({"email": email})
    }

    public createCustomer = async (customerData: any): Promise<Customer> => {
        const newCustomer:Customer = customerData;
        const createdCustomer = await this.customer.customerModel.create(newCustomer);
        const savedCustomer = await createdCustomer.save();
        return savedCustomer;
    }

    public deleteCustomer = async (id: any): Promise<Customer> => {
        return await this.customer.customerModel.findByIdAndRemove(id);
    }
}
const customerService = new CustomerService();

export default customerService;