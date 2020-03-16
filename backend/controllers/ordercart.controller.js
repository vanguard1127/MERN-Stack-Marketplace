const { OrderCart }           = require('../models/ordercart');
const ordercartService       = require('../services/ordercart.service');
const { to , ReE , ReS} = require('../services/util.service');

const create_carts_order = async function(req, res){
    let err, ordercart;
    [err, ordercart] = await to(ordercartService.create_ordercart(req.body));
    if(err) return ReE(res, err, 422);
    return ReS(res, {message:'Successfully created new ordercart.', ordercart:ordercart.toJSON()});
}
module.exports.create_carts_order = create_carts_order;

const get_ordercarts = async function(req, res){

    let err, ordercarts;
    [err, ordercarts] = await to(ordercartService.get_ordercarts(req,res));
    if(err) return ReE(res, err, 422)
        ;
    var jsonArrayData = [];
    var length = ordercarts.length;
    for (var i = 0 ; i < length ; i++)
    {
        var ordercart = ordercarts[i];
        jsonArrayData.push(ordercart.toJSON());
    }
    return ReS(res, {data:jsonArrayData});
}

module.exports.get_ordercarts = get_ordercarts;


const get_ordercart = async function(req, res){
    const reqID = req.params.id;

    if(!reqID){
        return ReE(res, 'Please Select ordercart Id.');
    }else{
        let err, ordercart;
        [err, ordercart] = await to(ordercartService.get_ordercart(req,res));
        if(err) return ReE(res, err, 422);
        return ReS(res, {ordercart:ordercart.toWeb()});
    }
}

module.exports.get_ordercart = get_ordercart;


const update_ordercart = async function(req, res){
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Please enter an email or phone number to register.');
    }else{
        let err, ordercart;
        [err, ordercart] = await to(ordercartService.update_ordercart(req,res));
        if(err) return ReE(res, err, 422);

        return ReS(res, {message:'Successfully created new ordercart.', ordercart:ordercart.toWeb()});
    }
}

module.exports.update_ordercart = update_ordercart;

const delete_ordercart = async function(req, res){
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Please enter an email or phone number to register.');
    }else{
        let err, ordercart;
        [err, ordercart] = await to(ordercartService.delete_ordercart(req,res));
        if(err) return ReE(res, err, 422);

        return ReS(res, {message:'Successfully created new ordercart.', ordercart:ordercart.toWeb()});
    }
}

module.exports.delete_ordercart = delete_ordercart;