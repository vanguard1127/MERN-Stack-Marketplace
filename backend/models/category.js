const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: ''
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

CategorySchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('Category', CategorySchema);
