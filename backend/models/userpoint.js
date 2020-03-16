const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserPointSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref:'User',
        unique:true
    },
    points:{
        type:Number,
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

UserPointSchema.methods = {
    toWeb: function(){
        let json = this.toJSON();
        return json;
    },
}
mongoose.model('UserPoint', UserPointSchema);