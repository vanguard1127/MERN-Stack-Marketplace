const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const elasticClient       = require('../services/elastic-search');

const ProductSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,ref:'User'
    },
    name: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    category_id: {
        type: Schema.Types.ObjectId, ref:'Category'
    },
    price: {
        type: Number,
        default: 0,
        es_type:'integer'
    },

    price_unit :{
        type:String,
        default:'',
    },

    photos: [
        {
            id: Number,
            src: String,
        }
    ],
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

ProductSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
// ProductSchema.plugin(mongoosastic,{
//     esClient:elasticClient
// });


var Product = mongoose.model('Product', ProductSchema);

