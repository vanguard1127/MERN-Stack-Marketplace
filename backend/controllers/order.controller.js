const { Order }           = require('../models/order');
const orderService       = require('../services/order.service');
const productService    = require('../services/product.service');
const checkoutService    = require('../services/checkout.service');
const addressService     = require('../services/address.service');
const transactionService = require('../services/transaction.service');
const userPointService   = require('../services/userpoint.service');
const messageService     = require('../services/message.service');
const orderCartService   = require('../services/ordercart.service');
const authService   = require('../services/auth.service');

const { to , ReE , ReS} = require('../services/util.service');

const create_order = async function(req, res){
    let err, order;
    [err, order] = await to(orderService.create_order(req,req.body));
    if(err) return ReE(res, err, 422);
    return ReS(res, {message:'Successfully created new order.', order:order.toJSON()});
}
module.exports.create_order = create_order;

const create_carts_order = async function(req, res){
    let buyer_id = req.decoded.user_id;
    let carts = req.body.carts;
    let createdOrders = await createOrderWithCarts(carts, buyer_id);
    return ReS(res, {message:'Successfully created new orders with cart.', orders:createdOrders});
}
module.exports.create_carts_order = create_carts_order;


async function createOrderWithCarts(carts , buyer_id){
    let err, product;
    let orders = [];
    for (let value of Object.keys(carts)) {
        let qty = carts[value];
        [err, product] = await to (productService.get_product(value));
        if (!err){
            var mOrder = orders.find(function(element) {
                return element.seller_id === product.user_id._id.toString();
            });
            if (mOrder == undefined){
                let seller = product.user_id;
                mOrder = {seller_id:seller._id.toString() , buyer_id:buyer_id , status:0 , carts:[]};
                orders.push(mOrder);
            }
            mOrder.carts.push({order_id:"" , product_id:product._id, count:qty});
        }
    }

    let createdOrders = [];
    for (let i = 0 ; i < orders.length ; i++) {
        let order = orders[i];
        let carts = order.carts;

        let orderErr, createdOrder;
        [orderErr , createdOrder] = await to (orderService.create_order(buyer_id, order));

        createdOrder.carts = [];
        if (!orderErr){
            createdOrders.push(createdOrder.toJSON());
        }
    }
    return createdOrders;
}

const get_buy_orders = async function(req, res){
    let err, orders;
    [err, orders] = await to(orderService.get_buy_orders(req,res));
    if(err) return ReE(res, err, 422)
        ;
    var jsonArrayData = [];
    var length = orders.length;
    for (var i = 0 ; i < length ; i++)
    {
        var order = orders[i];
        jsonArrayData.push(order.toJSON());
    }

    let totalCount;
    [err, totalCount] = await to (orderService.getBuyOrderCount(req));
    return ReS(res, {totalCount : totalCount ,orders:jsonArrayData});
}

module.exports.get_buy_orders = get_buy_orders;

const get_orders = async function(req, res){
    let err, orders;
    [err, orders] = await to(orderService.get_orders(req,res));
    if(err) return ReE(res, err, 422);
    var jsonArrayData = [];
    var length = orders.length;
    for (var i = 0 ; i < length ; i++)
    {
        var order = orders[i];
        jsonArrayData.push(order.toJSON());
    }

    let totalCount;
    [err, totalCount] = await to (orderService.getSellOrderCount(req));

    return ReS(res, {totalCount : totalCount ,orders:jsonArrayData});
}

module.exports.get_orders = get_orders;

const get_all_orders = async function(req, res){
    let err, orders;
    [err, orders] = await to(orderService.get_all_orders(req.query));
    if(err) return ReE(res, err, 422);
    var jsonArrayData = [];
    var length = orders.length;
    for (var i = 0 ; i < length ; i++)
    {
        var order = orders[i];
        jsonArrayData.push(order.toJSON());
    }

    let totalCount;
    [err, totalCount] = await to (orderService.getAllOrderCount(req.query));

    return ReS(res, {totalCount : totalCount ,orders:jsonArrayData});
}

module.exports.get_all_orders = get_all_orders;

const get_order = async function(req, res){
    const reqID = req.params.id;
    if(!reqID){
        return ReE(res, 'Please Select Order Id.');
    }else{
        let err, order;
        [err, order] = await to(orderService.get_order(reqID));
        if(err) return ReE(res, err, 422);
        return ReS(res, {order:order.toWeb()});
    }
}

module.exports.get_order = get_order;


const update_order = async function(req, res){
    let err, order;
    [err, order] = await to(orderService.update_order(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {message:'Successfully updated order.', order:order.toWeb()});
}

module.exports.update_order = update_order;

const delete_order = async function(req, res){
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Please enter an email or phone number to register.');
    }else{
        let err, order;
        [err, order] = await to(orderService.delete_order(req,res));
        if(err) return ReE(res, err, 422);

        return ReS(res, {message:'Successfully created new order.', order:order.toWeb()});
    }
}

module.exports.delete_order = delete_order;

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")("sk_test_iQeqEQJV6HNkgqHYkEs8xFw100vNHVauCp");

const checkout_order = async function(req, res){
    let cartItems = req.body.cartItems;

    let buyer_id = req.decoded.user_id;
    // let order_id = req.body.order_id;
    let token_id = req.body.stripe_token , amount = req.body.amount;
    let ship_type = req.body.ship_type;
    let checkout_type = req.body.checkout_type;
    let transaction_type = req.body.transaction_type;

    let currency = "usd"; //TODO
    const body = {
      source: token_id,
      amount: amount,
      currency: currency
    };
    console.log("amount = " + req.body.amount);

    let stripeErr, stripeRes;
    [stripeErr ,stripeRes] = await to (stripe.charges.create(body));

    if (stripeErr){
        return ReE(res, {message:'Failed to pay with stripe.', error:stripeErr} ,501);
    } else {
        if (stripeRes.status == "succeeded"){
            let err;

            let transaction = {
                type:transaction_type,payment_id:stripeRes.id,amount:stripeRes.amount , currency:stripeRes.currency,
                pCreatedAt: stripeRes.created};

            let created_transaction;

            [err, created_transaction] = await to (transactionService.create_transaction(transaction));

            if (err)
                return ReE(res, {message:'Failed to create transaction.', error:err} ,503 );

            let createdOrders;
            [err ,createdOrders] = await to ( createOrderWithCarts(cartItems, buyer_id));

            for (let index = 0 ; index < createdOrders.length; index++){
                let order = createdOrders[index];
                let order_id = order._id;

                let created_checkout, checkout;

                if (ship_type == 0){
                    let shipping_address = req.body.shipping , created_shipAddress;

                    [err, created_shipAddress] = await to (addressService.create_address(shipping_address));

                    if (err)
                        return ReE(res, {message:'Failed to create address' ,error:err} , 502);

                    checkout ={order_id:order_id,amount:amount,currency:currency ,
                        transaction_id : created_transaction._id,type:1 , shipping_id:created_shipAddress._id,
                        shipping_type: 0
                    };
                } else if (ship_type == 1){
                    checkout ={order_id:order_id,amount:amount,currency:currency ,
                        transaction_id : created_transaction._id,type:1,
                        shipping_type: 1
                    };
                }

                [err, created_checkout] = await to (checkoutService.create_checkout(checkout));

                if (err)
                    return ReE(res, {message:'Failed to create checkout.' ,error:err} , 504);

                let updatedOrder,updateInfo = {status:1 , id:order_id};
                [err, updatedOrder] = await to (orderService.update_order(updateInfo));

                if (err)
                    return ReE(res, {message:'Failed to update order',error:err}, 505);

                let updatedOrder_id = updatedOrder._id;
                let buyer;
                [err , buyer] = await to (authService.getUserById(buyer_id));
                if (err){
                    console.log('Finding my user info error');
                }
                let result;


                 [err,result] = await to (messageService.send_push_notification(order.seller_id.device_id,buyer,updatedOrder_id));
                //For test
                //[err,result] = await to (messageService.send_push_notification(buyer.device_id,buyer,updatedOrder_id));
                //
                // let seller_phone_number = updatedOrder.seller_id.phone_number;
                // let message = makeMessageForConfirmed(updatedOrder);
                // messageService.send_sms(seller_phone_number, message);
            }

            return ReS(res, {message:'Success to create checkouts' }, 200);
        } else {
            return ReE(res, {message:'Failed to pay with stripe.' ,error:stripeErr} , 507);
        }
    }
}
module.exports.checkout_order = checkout_order;

const makeMessageForConfirmed = async function(order){
    let message = order._id + '\n' + 'Products:' + '\n';
    let err,carts;
    [err, carts] = await to (orderCartService.get_ordercarts({order_id:order._id}));

    if (err){
        return "";
    }

    for (let i = 0 ; i < carts.length ; i++){
        let cart = carts[i];
        message += cart.product_id.name + '\n';
    }

    message += 'Buyer' + '\n';
    message += 'name: ' + order.buyer_id.first_name + ' ' + order.buyer_id.last_name + '\n';
    message += 'email:' + order.buyer_id.email + '\n';
    message += 'phone number:' + order.buyer_id.phone_number  + '\n';
    message += 'Confirmed Date : ' + order.confirmed_date;

    return message;

}
const charge_points = async function(req,res){
    let chargeInfo = req.body;
    let err;
    let user_id = req.decoded.user_id;
    let amount = chargeInfo.amount, currency = chargeInfo.currency;
    let token_id = req.body.stripe_token;
    const body = {
        source:token_id,
        amount:amount,
        currency:currency
    }
    let transaction_type = req.body.transaction_type;
    console.log("amount = " + req.body.amount);

    let stripeErr, stripeRes;
    [stripeErr ,stripeRes] = await to (stripe.charges.create(body));
    if (stripeErr){
        return ReE(res, {message:'Failed to pay with stripe.', error:stripeErr} ,501);
    } else {
        if (stripeRes.status == "succeeded") {
            let transaction = {
                type:transaction_type,payment_id:stripeRes.id,amount:stripeRes.amount , currency:stripeRes.currency,
                pCreatedAt: stripeRes.created};

            let created_transaction;

            [err, created_transaction] = await to (transactionService.create_transaction(transaction));

            if (err)
                return ReE(res, {message:'Failed to create transaction' , error:err} , 503);

            let created_checkouts, checkout= {type : 0, points_type: 1, user_id:user_id,  transaction_id : created_transaction._id,
            amount:stripeRes.amount, currency:stripeRes.currency ,points:stripeRes.amount};

            [err,created_checkouts] = await to (checkoutService.create_checkout(checkout));

            if (err)
                return ReE(res,{message:'Failed to create checkout logs' , error:err} ,504);

            let userpoint;

            [err, userpoint] = await to (userPointService.get_userpoint_byUserId(user_id));

            if (err)
                return ReE(res, {message:'Failed to find user point with user id', error:err} , 505);

            if (userpoint === null){
                let created_userpoint;
                [err, created_userpoint] = await to (userPointService.create_userpoint({user_id:user_id,points:stripeRes.amount}))

                if (err)
                    return ReE(res, {message:'Failed to create user point' ,error:err} , 506);

                return ReS(res, {message:'Success to charge points' , point:created_userpoint}, 200);
            } else{

                userpoint.points += stripeRes.amount;
                let updated_user_point;
                [err, updated_user_point] = await to (userPointService.update_userpoint(userpoint));

                if (err)
                    return ReE(res,{message:'Failed to update user point' ,error:err}, 507);

                return ReS(res, {message:'Success to charge points' ,point:updated_user_point} , 200);
            }
        } else {
            return ReE(res, {message:'Failed to pay with stripe', error:stripeErr} , 502 );
        }
    }
}
module.exports.charge_points = charge_points;

 calculate_order_price = async (order) =>{
    let order_id = order._id;

    let total_price = 0;
    let orderCarts, err;
    [err, orderCarts] = await to (orderCartService.get_ordercarts({order_id:order_id}));

    if (err)
        TE('Failed to get order carts.');

    for (let i = 0 ;i < orderCarts.length; i++){
        let order_cart = orderCarts[i];
        total_price += order_cart.product_id.price * order_cart.count;
    }

    return total_price;
}

const pay_with_points = async function(req,res){
    let pay_points_amount = req.body.amount * 100,order_id = req.body.order_id;
    let user_id = req.decoded.user_id;
    let ship_type = req.body.ship_type;
    let cartItems = req.body.cartItems;

    let err, order;
    // [err,order] = await to (orderService.get_order(order_id));
    // if (err)
    //     ReE(res, {message:'Failed to get order' ,error:err}, 501);


    let myUserPoint, dstUserPoint;
    [err , myUserPoint] = await to (userPointService.get_userpoint_byUserId(user_id));

    if (err)
        return ReE(res, {message:'Failed to get my user point.' , error:err} , 502);

    if (myUserPoint.points < pay_points_amount){
        return ReE(res, {message:'Your points is too small to buy this order.'} , 503)
    }

    let createdOrders;
    [err ,createdOrders] = await to ( createOrderWithCarts(cartItems, user_id));


    let created_checkout, checkout;

    if (ship_type == 0){
        let shipping_address = req.body.shipping , created_shipAddress;

        [err, created_shipAddress] = await to (addressService.create_address(shipping_address));

        if (err)
            return ReE(res, {message:'Failed to create address' ,error:err} , 502);

        checkout ={order_id:order_id,user_id:user_id,type:0, points_type:0 ,
            shipping_id:created_shipAddress._id,
            shipping_type: 0,points:pay_points_amount
        };
    } else if (ship_type == 1){
        checkout ={order_id:order_id,user_id:user_id,type:0, points_type:0 ,
            shipping_type: 1,points:pay_points_amount
        };

    }
    [err, created_checkout] = await to (checkoutService.create_checkout(checkout));

    if (err)
        return ReE(res, {message:'Failed to create point log with user_id' , error:err} , 506);

    let points = [];let updatedMyUserPoint ;
    for (let index =0 ; index < createdOrders.length ; index++){
        let createdOrder = createdOrders[index];

        let order_price;
        [err , order_price] = await to (calculate_order_price(createdOrder));
        if (err){
            continue;
        }
        [err, dstUserPoint] = await to (userPointService.get_userpoint_byUserId(createdOrder.seller_id._id));

        myUserPoint.points -= order_price * 100;
        dstUserPoint.points += order_price * 100;
        let updatedSellerUserPoint;



        [err, updatedSellerUserPoint] = await to (userPointService.update_userpoint(dstUserPoint));

        if (err)
            return ReE(res,{message:'Failed to update seller user point' , error:err} , 509);

        points.push({user:{email:updatedSellerUserPoint.user_id.email, phone:updatedSellerUserPoint.user_id.phone_number ,
                first_name:updatedSellerUserPoint.user_id.first_name, last_name:updatedSellerUserPoint.user_id.last_name} , points:order_price * 100});

        let updatedOrder,updateInfo = {status:1 , id:createdOrder._id};
        [err, updatedOrder] = await to (orderService.update_order(updateInfo));

        if (err)
            return ReE(res, {message:'Failed to update order',error:err}, 510);

        //For message or push notification
        let order_id = updatedOrder._id;
        let buyer;
        [err , buyer] = await to (authService.getUserById(user_id));
        if (err){
            console.log('Finding my user info error');
        }
        let result;
        [err,result] = await to (messageService.send_push_notification(createdOrder.seller_id.device_id,buyer,order_id));
        //[err,result] = await to (messageService.send_push_notification(buyer.device_id,buyer,order_id));

        // let seller_phone_number = updatedOrder.seller_id.phone_number;
        // let message = makeMessageForConfirmed(updatedOrder);
        // messageService.send_sms(seller_phone_number, message);
        //
        // if (err)
        //     ReE(res , {message:'Failed to make code'});

    }

    [err, updatedMyUserPoint] = await to (userPointService.update_userpoint(myUserPoint));

    if (err)
        return ReE(res,{message:'Failed to update my user point' , error:err} , 508);

    return ReS(res, {message:'Success to send points with order',myPoints:updatedMyUserPoint, points:points}, 200);

}
module.exports.pay_with_points = pay_with_points;


const cod_request = async function(req,res){
    //TODO cod request
}
module.exports.cod_request = cod_request;