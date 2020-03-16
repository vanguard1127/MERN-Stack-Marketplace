const mongoose = require('mongoose');
const OrderCart = mongoose.model('OrderCart');
const { to, TE }    = require('./util.service');

const create_ordercart = async (cartInfo) => {
    const ordercart = new OrderCart(cartInfo);
    let err, created_ordercart;
    [err , created_ordercart] = await to (ordercart.save());
    if (err)
        TE(err.message);

    return created_ordercart;
};
module.exports.create_ordercart = create_ordercart;

const get_ordercarts = async (filter) => {
    let order_id;
    var query = {};
    if (filter.order_id != undefined && filter.order_id != ""){
        order_id = filter.order_id;
        query.order_id = order_id;
    }

    let err, ordercarts;
    [err, ordercarts] = await  to (OrderCart.find(query).populate('product_id','name price price_unit photos'));
    if (err)
        TE(err.message);


    return ordercarts;
};

module.exports.get_ordercarts = get_ordercarts;

const get_ordercart = async (req, res) => {
    const ordercart = new OrderCart(req.body);
    let err, created_ordercart;
    [err , created_ordercart] = await to (ordercart.save());

    if (err)
        TE(err.message);


    return created_ordercart;
};

module.exports.get_ordercart = get_ordercart;

const update_ordercart = async (req, res) => {
    const ordercart = new OrderCart(req.body);
    let err, created_ordercart;
    [err , created_ordercart] = await to (ordercart.save());

    if (err)
        TE(err.message);

    return created_ordercart;
};

module.exports.update_ordercart = update_ordercart;

const delete_ordercart = async (req, res) => {
    const ordercart = new OrderCart(req.body);
    let err, created_ordercart;
    [err , created_ordercart] = await to (ordercart.save());

    if (err)
        TE(err.message);

    return created_ordercart;
};

module.exports.delete_ordercart = delete_ordercart;

const getOrderCartsProductCountBySellerId = async (seller_id) => {
    let newId = new mongoose.mongo.ObjectId(seller_id);

    let err, ordercarts;
    [err , ordercarts] = await to (OrderCart.aggregate(
        [
            {$lookup: {
                    from:"orders",
                    localField:"order_id",
                    foreignField:"_id",
                    as:"order"
                }
            },
            {
                $project: {
                    _id:'$_id',
                    count: '$count',
                    order: { $arrayElemAt: [ "$order", 0 ] }
                }
            },
            {
                $project: {
                    _id:'$_id',
                    count: '$count',
                    seller_id: '$order.seller_id',
                    status:'$order.status'
                }
            },
            {$match:{$and:[{seller_id: newId} , {status:1}]}},
            {
                $group: {
                    _id: "$seller_id",
                    count: {$sum: "$count"}
                }
            }
        ]
    ));

    return ordercarts;
};

module.exports.getOrderCartsProductCountBySellerId = getOrderCartsProductCountBySellerId;

const getOrderCartsProductCountByBuyerId = async (buyer_id) => {
    let newId = new mongoose.mongo.ObjectId(buyer_id);

    let err, ordercarts;
    [err , ordercarts] = await to (OrderCart.aggregate(
        [
            {$lookup: {
                    from:"orders",
                    localField:"order_id",
                    foreignField:"_id",
                    as:"order"
                }
            },
            {
                $project: {
                    _id:'$_id',
                    count: '$count',
                    order: { $arrayElemAt: [ "$order", 0 ] }
                }
            },
            {
                $project: {
                    _id:'$_id',
                    count: '$count',
                    buyer_id: '$order.buyer_id',
                    status:'$order.status'
                }
            },
            {$match:{$and:[{buyer_id: newId} , {status:1}]}},
            {
                $group: {
                    _id: "$buyer_id",
                    count: {$sum: "$count"}
                }
            }
        ]
    ));

    if (err)
        TE(err.message);

    return ordercarts;
};

module.exports.getOrderCartsProductCountByBuyerId = getOrderCartsProductCountByBuyerId;
