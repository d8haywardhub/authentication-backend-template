import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

//import BaseModel from '../common/models/BaseModel';
import { userSchemaDefinition, userSchemaOptions } from './user.schema';
import User from './user.interface';
import CommonSchema from '../../common/common.schema';

class UserModel {
    private schema: mongoose.Schema;
    private _userModel;

    constructor() {
        this.schema = new Schema(userSchemaDefinition, userSchemaOptions);
        this.schema.add(CommonSchema);
        this._userModel = mongoose.model<User & mongoose.Document>('User', this.schema);
    }

    get userModel(): any {
        return this._userModel;
    }
}

export default UserModel;