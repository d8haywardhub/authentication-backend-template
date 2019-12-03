import * as mongoose from 'mongoose';

export const customerSchemaDefinition: mongoose.SchemaDefinition = {
    name: String,
    personOfContact: String,
    phone: String,
    location: String,
    numberOfEmployees: Number,
    isWet: Boolean
};

export const customerSchemaOptions: mongoose.SchemaOptions = {
    collection: "Customer"
}