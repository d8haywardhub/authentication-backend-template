import * as mongoose from 'mongoose';

const CommonSchema = {
    //_createdBy: {
    //  type: SystemOrObjectId,
    //  default: "SYSTEM"
    //},
    _created: {
      type: Date,
      default: Date.now
    },
    //_updatedBy: {
    //  type: SystemOrObjectId,
    //  default: "SYSTEM"
    //},
    _updated: {
      type: Date,
      default: Date.now
    },
    _version: {
      type: Number,
      default: 0
    }
  }

  export default CommonSchema;