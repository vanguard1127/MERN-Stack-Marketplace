const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const CheckOutSchema = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref:'Order'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        ref:'Transaction'
    },
    type:{
        type:Number,
        default:0 // 0: points, 1: stripe
    },
    points_type:{
        type:Number,
        default:0 //0:send, 1:charge
    },

    points:{
        type:Number,
        default:0 //0:send, 1:charge
    },
    amount:{
        type:Number,
        default:false
    },
    currency:{
        type:String,
        default:'usd'
    },
    shipping_id:{
        type:Schema.Types.ObjectId,
        ref:'Address'
    },
    shipping_type:{
        type:Number,
        default:0 // 0: use shipping address  from address table, 1: use address as buyer user
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

CheckOutSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('CheckOut', CheckOutSchema);