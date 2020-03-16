const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    seller_id:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    buyer_id:{
        type: Schema.Types.ObjectId,
        ref:'User',
    },
    isIndexed:{
        type:Boolean,
        default:false
    },
    status:{
        type:Number,
        default:0
    },
    confirmed_date: {
        type: Date,
        default: Date.now
    },
    shipped_date: {
        type: Date,
        default: Date.now
    },
    delivered_date: {
        type: Date,
        default: Date.now
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

OrderSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}

mongoose.model('Order', OrderSchema);
