const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShippingSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    src_address_id: {
        type: Schema.Types.ObjectId,
        ref:'Address'
    },
    dst_address_id: {
        type: Schema.Types.ObjectId,
        ref:'Address'
    },
    order_ids: [{
        type: Schema.Types.ObjectId,
        ref:'Order'
    }],
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

ShippingSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('Shipping', ShippingSchema);
