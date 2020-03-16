const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    type: {
        type: Number,
        default: 0
    },
    payment_id:{
        type: String,
        default:''
    },
    amount:{
        type: Number,
        default:''
    },
    currency:{
        type: String,
        default:''
    },
    pCreatedAt: {
        type: Date,
        default: Date.now
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
    }
});

TransactionSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('Transaction', TransactionSchema);