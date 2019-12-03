import * as mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    city: String,
    country: String,
    street: String,
});

export const userSchemaDefinition: mongoose.SchemaDefinition = {
    address: { type: addressSchema },

    email: { type: String},

    name: { type: String },

    password: { type: String },

    roles: {
        type: String
    },
    
    disabled: {
        type: Boolean,
        default: false
    },

    resetRequired: {
        type: Boolean,
        default: false
    },

    _lastLogin: {
        type: Date
    },


};

export const userSchemaOptions: mongoose.SchemaOptions = {
    collection: "User"
}