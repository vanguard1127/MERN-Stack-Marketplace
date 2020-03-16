const mongoose = require('mongoose');
const Shipping = mongoose.model('Shipping');
const { to, TE }    = require('./util.service');

const create_shipping = async (info) => {
    let shipping = new Shipping(info);
    let err, created;
    [err, created] = await to (shipping.save());

    if (err)
        TE(err.message);

    return created;
}
module.exports.create_shipping = create_shipping;


const update_shipping = async (info) => {
    let err , updatedShipping , result;
    let id = info._id;
    [err, result] = await to (Shipping.updateOne({'_id':id}, {$set:info}));

    if (err)
        TE(err.message);

    if (result.ok == 1) {
        [err, updatedShipping] = await to(getById(id));
        if (err) TE(err.message);

        return updatedShipping;
    }

    return TE("Updating Shipping Failed!");
}
module.exports.update_shipping = update_shipping;


const getById = async (id) => {
    let err, result;
    [err, result] = await to (Shipping.findById(id));

    if (err)
        TE(err.message);

    return result;
}
module.exports.getById = getById;

const getShippings = async (info) => {

}
module.exports.getShippings = getShippings;


const deleteShipping = async (id) => {
    let err, result;
    [err , result] = await to (Shipping.deleteOne({'_id':id}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    } else {
        return false;
    }
}
module.exports.deleteShipping = deleteShipping;
