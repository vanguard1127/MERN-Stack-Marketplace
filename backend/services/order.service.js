const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const ordercartService = require('./ordercart.service');
const checkoutService = require('./checkout.service');
const addresssService = require('./address.service');
const userService = require('./auth.service');
const { to, TE }    = require('./util.service');
const create_order = async (user_id, orderInfo) => {
    let mOrder = new Order({seller_id:orderInfo.seller_id , buyer_id:user_id, status:0});
    let err, created_order;
    [err , created_order] = await to (mOrder.save());

    if (err)
        TE(err.message);
    let seller;
    [err, seller] = await to (userService.getUserById(created_order.seller_id));

    if (err) TE(err.message);

    let carts = orderInfo.carts;
    let order_carts = [];
    if (carts != undefined){
        for (var i = 0 ; i < carts.length ; i++){
            let cart = carts[i];
            cart.order_id = created_order._id;
            let err, created_cart;
            [err, created_cart] = await to (ordercartService.create_ordercart(cart));
            if (!err){
                order_carts.push(created_cart);
            }

        }
    }

    created_order._doc.carts = order_carts;
    created_order._doc.seller = {first_name : seller.first_name , last_name : seller.last_name ,
        email : seller.email , phone_number:seller.phone_number};
    return created_order;
};

module.exports.create_order = create_order;

const get_orders = async (req, res) => {
    let limit = 10 , page =0 , type = -1;
    var query = {};

    if (req.query.limit != undefined)
        limit = parseInt(req.query.limit);
    if (req.query.page != undefined)
        page = parseInt(req.query.page);
    if (req.query.type != undefined){
        type = parseInt(req.query.type);
    }
    let user_id = req.decoded.user_id;

    query.seller_id = user_id;

    if (type != -1){
        query.status = type;
    }

    let err, orders;

    [err, orders] = await  to (Order.find(query).skip((page) * limit).limit(limit).populate('seller_id','first_name last_name')
        .populate('buyer_id' , 'first_name last_name'));
    if (err)
        TE(err.message);

    return orders;
};
module.exports.get_orders = get_orders;


const get_all_orders = async (reqInfo) => {
    let limit = 10 , page =0;
    let query = {};

    if (reqInfo.limit != undefined)
        limit = parseInt(reqInfo.limit);
    if (reqInfo.page != undefined)
        page = parseInt(reqInfo.page);
    if (reqInfo.type != undefined){
        type = parseInt(reqInfo.type);
    }
    let err, orders;
    if (type != -1){
        query.status = type;
    }
    [err, orders] = await  to (Order.find(query).skip((page) * limit).limit(limit).populate('seller_id','first_name last_name')
        .populate('buyer_id' , 'first_name last_name'));
    if (err)
        TE(err.message);

    return orders;
};
module.exports.get_all_orders = get_all_orders;

const getAllOrderCount = async (reqInfo) => {
    let err, count;
    let query = {};
    [err, count] = await to(Order.countDocuments(query));
    if (err)
        TE(err.message);
    return count;

};
module.exports.getAllOrderCount = getAllOrderCount;

const get_buy_orders = async (req, res) => {
    let limit = 10 , page =0;
    var query = {};

    if (req.query.limit != undefined)
        limit = parseInt(req.query.limit);
    if (req.query.page != undefined)
        page = parseInt(req.query.page);
    if (req.query.type != undefined){
        type = parseInt(req.query.type);
    }

    let user_id = req.decoded.user_id;

    query.buyer_id = user_id;
    if (type != -1){
        query.status = type;
    }
    let err, orders;

    [err, orders] = await  to (Order.find(query).skip((page) * limit).limit(limit).populate('seller_id','first_name last_name')
        .populate('buyer_id' , 'first_name last_name'));
    if (err)
        TE(err.message);

    return orders;
};

module.exports.get_buy_orders = get_buy_orders;

const get_order = async (reqId) => {
    let err, order;
    [err , order] = await to (Order.findById(reqId).populate('buyer_id').populate('seller_id'));

    if (err)
        TE(err.message);

    let filter = {};
    filter.order_id = order._id;
    [err , ordercarts] = await to (ordercartService.get_ordercarts(filter));

    if (err)
        TE(err.message);

    order._doc.carts = ordercarts;

    let check_out;

    [err,check_out] =  await to (checkoutService.getCheckOutByOrderId({order_id:reqId}));

    if (!err && check_out != null){
        let ship_type = check_out.shipping_type;
        let ship_id = check_out.shipping_id;

        let ship = {};
        if (ship_type === 0){
            [err, ship] = await to (addresssService.getById(ship_id));
            if (err){
                ship = {};
            }
        }
        order._doc.shipping_type = ship_type;
        order._doc.shipping_id = ship_id;
        order._doc.shipping_address = ship;
    }
    return order;

};

module.exports.get_order = get_order;

const update_order = async (updateInfo) => {
    const order_id = updateInfo.id;
    let err , order;
    let result;
    let nowDate = Date.now();
    let data = {};
    data.status = updateInfo.status;
    data.updatedAt = nowDate;
    if (data.status == "1"){
        data.confirmed_date = nowDate;
    } else if (data.status == "2"){
        data.shipped_date = nowDate;
    } else if (data.status == "3"){
        data.delivered_date = nowDate;
    }
    [err, result] = await  to (Order.updateOne({'_id':order_id} , {$set:data}).exec());
    if(err) TE(err.message);

    if (result.ok == 1){
        [err ,order] = await to (Order.findById(order_id));
        if (err) TE(err.message);
        return order;
    } else
        TE("Update Failed");
};

module.exports.update_order = update_order;

const delete_order = async (req, res) => {
    const order = new Order(req.body);
    let err, created_order;
    [err , created_order] = await to (order.save());

    if (err)
        TE(err.message);

    return created_order;
};

module.exports.delete_order = delete_order;

const getSellOrderCount = async (req) => {
    let err, count;
    var query = {};
    let user_id = req.decoded.user_id;
    query.seller_id = user_id;
    [err, count] = await to(Order.countDocuments(query));

    if (err)
        TE(err.message);

    return count;

};
module.exports.getSellOrderCount = getSellOrderCount;

const getBuyOrderCount = async (req) => {
    let err, count;
    var query = {};
    let user_id = req.decoded.user_id;
    query.buyer_id = user_id;
    [err, count] = await to(Order.countDocuments(query));

    if (err)
        TE(err.message);

    return count;

};
module.exports.getBuyOrderCount = getBuyOrderCount;


const getOrdersBySeller = async (seller_id) => {
    let query = {};
    query.seller_id = seller_id;

    let err, orders;
    [err, orders] = await  to (Order.find(query));
    if (err) {
        TE(err.message);
    }
    return orders;
};
module.exports.getOrdersBySeller = getOrdersBySeller;


const getOrdersByBuyer = async (buyer_id) => {
    let query = {};
    query.buyer_id = buyer_id;

    let err, orders;
    [err, orders] = await  to (Order.find(query));
    if (err) {
        TE(err.message);
    }
    return orders;
};
module.exports.getOrdersByBuyer = getOrdersByBuyer;

