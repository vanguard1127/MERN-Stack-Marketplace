const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FeeSchema = new Schema({
    type: {
        type: Number,
        default: 0
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref:'Product'
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref:'Category'
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

FeeSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('Fee', FeeSchema);
