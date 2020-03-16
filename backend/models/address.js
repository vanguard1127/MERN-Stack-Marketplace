const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    address:{
        city: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: ''
        },
        addressLine1: {
            type: String,
            default: ''
        },
        addressLine2:{
            type:String,
            default:false
        },
        region:{
            type:String,
            default:false
        },
        zip: {
            type: String,
            default: ''
        }
    },
    email: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location:{
        type: String,
        coordinates:[Number]
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

AddressSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('Address', AddressSchema);
