const mongoose = require('mongoose');
const Fee = mongoose.model('Fee');
const { to, TE }    = require('./util.service');

const create_fee = async (info) => {
    let fee = new Fee(info);
    let err, created;
    [err, created] = await to (fee.save());

    if (err)
        TE(err.message);

    return created;
}
module.exports.create_fee = create_fee;


const update_fee = async (info) => {
    let err , updatedFee , result;
    let id = info._id;
    [err, result] = await to (Fee.updateOne({'_id':id}, {$set:info}));

    if (err)
        TE(err.message);

    if (result.ok == 1) {
        [err, updatedFee] = await to(getById(id));
        if (err) TE(err.message);

        return updatedFee;
    }

    return TE("Updating Fee Failed!");
}
module.exports.update_fee = update_fee;


const getById = async (id) => {
    let err, result;
    [err, result] = await to (Fee.findById(id));

    if (err)
        TE(err.message);

    return result;
}
module.exports.getById = getById;

const getFees = async (info) => {

}
module.exports.getFees = getFees;


const deleteFee = async (id) => {
    let err, result;
    [err , result] = await to (Fee.deleteOne({'_id':id}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    } else {
        return false;
    }
}
module.exports.deleteFee = deleteFee;
