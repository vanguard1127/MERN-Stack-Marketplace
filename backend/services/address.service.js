const mongoose = require('mongoose');
const Address = mongoose.model('Address');
const { to, TE }    = require('./util.service');

const create_address = async (info) => {
    let address = new Address(info);
    let err, created;
    [err, created] = await to (address.save());

    if (err)
        TE(err.message);

    return created;
}
module.exports.create_address = create_address;


const update_address = async (info) => {
    let err , updatedAddress , result;
    let id = info._id;
    [err, result] = await to (Address.updateOne({'_id':id}, {$set:info}));

    if (err)
        TE(err.message);

    if (result.ok == 1) {
        [err, updatedAddress] = await to(getById(id));
        if (err) TE(err.message);

        return updatedAddress;
    }

    return TE("Updating Address Failed!");
}
module.exports.update_address = update_address;


const getById = async (id) => {
    let err, result;
    [err, result] = await to (Address.findById(id));

    if (err)
        TE(err.message);

    return result;
}
module.exports.getById = getById;

const getAddresses = async (info) => {

}
module.exports.getAddresses = getAddresses;

const deleteAddress = async (id) => {
    let err, result;
    [err , result] = await to (Address.deleteOne({'_id':id}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    } else {
        return false;
    }
}
module.exports.deleteAddress = deleteAddress;
