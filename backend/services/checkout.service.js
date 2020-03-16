const mongoose = require('mongoose');
const CheckOut = mongoose.model('CheckOut');
const { to, TE }    = require('./util.service');

const create_checkout = async (info) => {
    let checkout = new CheckOut(info);
    let err, created;
    [err, created] = await to (checkout.save());

    if (err)
        TE(err.message);

    return created;
}
module.exports.create_checkout = create_checkout;


const update_checkout = async (info) => {
    let err , updatedCheckOut , result;
    let id = info._id;
    let nowTime = Date.now();

    let data = {order_id:info.amount, amount:info.amount , currency:info.currency, createdAt:info.createdAt,
                updatedAt:nowTime};
    [err, result] = await to (CheckOut.updateOne({'_id':id}, {$set:data}));

    if (err)
        TE(err.message);

    if (result.ok == 1) {
        [err, updatedCheckOut] = await to(getById(id));
        if (err) TE(err.message);

        return updatedCheckOut;
    }

    return TE("Updating Checkout Failed!");
}
module.exports.update_checkout = update_checkout;


const getById = async (id) => {
    let err, result;
    [err, result] = await to (CheckOut.findById(id));

    if (err)
        TE(err.message);

    return result;
}
module.exports.getById = getById;

const getCheckouts = async (info) => {

}
module.exports.getCheckouts = getCheckouts;

const getCheckOutByOrderId = async (info) => {
    let order_id = info.order_id;
    let err, result;

    [err, result] = await to (CheckOut.findOne({order_id:order_id}));

    if (err)
        TE(err.message);

    return result;

}
module.exports.getCheckOutByOrderId = getCheckOutByOrderId;


const deleteCheckout = async (id) => {
    let err, result;
    [err , result] = await to (CheckOut.deleteOne({'_id':id}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    } else {
        return false;
    }
}
module.exports.deleteCheckout = deleteCheckout;
