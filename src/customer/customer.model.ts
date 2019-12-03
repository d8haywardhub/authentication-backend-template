import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

import { customerSchemaDefinition, customerSchemaOptions } from './customer.modeldefinition';
import Customer from './customer.interface';
import CommonSchema from '../common/common.schema';

class CustomerModel {
    private schema: mongoose.Schema;
    private _customerModel;

    constructor() {
        this.schema = new Schema(customerSchemaDefinition, customerSchemaOptions);
        this.schema.add(CommonSchema);
        this._customerModel= mongoose.model<Customer & mongoose.Document>('Customer', this.schema);
    }

    get customerModel(): any {
        return this._customerModel;
    }
}

export default CustomerModel;