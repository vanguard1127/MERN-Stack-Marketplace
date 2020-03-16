const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');
const { to, TE }    = require('./util.service');

const create_transaction = async (info) => {
    let transaction = new Transaction(info);
    let err, created;
    [err, created] = await to (transaction.save());

    if (err)
        TE(err.message);

    return created;
}
module.exports.create_transaction = create_transaction;


const update_transaction = async (info) => {
    let err , updatedTransaction , result;
    let id = info._id;
    [err, result] = await to (Transaction.updateOne({'_id':id}, {$set:info}));

    if (err)
        TE(err.message);

    if (result.ok == 1) {
        [err, updatedTransaction] = await to(getById(id));
        if (err) TE(err.message);

        return updatedTransaction;
    }

    return TE("Updating Transaction Failed!");
}
module.exports.update_transaction = update_transaction;


const getById = async (id) => {
    let err, result;
    [err, result] = await to (Transaction.findById(id));

    if (err)
        TE(err.message);

    return result;
}
module.exports.getById = getById;

const getTransactions = async (info) => {

}
module.exports.getTransactions = getTransactions;


const deleteTransaction = async (id) => {
    let err, result;
    [err , result] = await to (Transaction.deleteOne({'_id':id}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    } else {
        return false;
    }
}
module.exports.deleteTransaction = deleteTransaction;
