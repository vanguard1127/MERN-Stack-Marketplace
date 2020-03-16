const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderCartSchema = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref:'Order'
    },

    product_id: {
        type: Schema.Types.ObjectId,
        ref:'Product'
    },
    count: {
        type: Number,
        default:0
    },
    isIndexed:{
        type:Boolean,
        default:false
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

OrderCartSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('OrderCart', OrderCartSchema);
