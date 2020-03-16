const { User }           = require('../models/user');
const authService       = require('../services/auth.service');
const msgService        = require('../services/message.service');
const userpointService  = require('../services/userpoint.service');
const orderService      = require('../services/order.service');
const ordercartService  = require('../services/ordercart.service');

const { to , ReE , ReS} = require('../services/util.service');
const create_user = async function(req, res){
    const body = req.body;

    if(!body.email && !body.phone_number){
        return ReE(res, 'Please enter an email or phone number to register.');
    } else if(!body.password){
        return ReE(res, 'Please enter a password to register.');
    }else{
        let err, user;

        [err, user] = await to(authService.create_user(body));

        if(err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created new user.', user:user.toWeb()}, 200);
    }
}

module.exports.create_user = create_user;

const update_user = async function(req,res){
    let err, user;
    [err, user] = await to(authService.update_user(req));

    if(err){
        if(err.message=='Validation error') err = 'The email address or phone number is already in use';
        return ReE(res, err);
    }

    if (user == null){
        return ReE(res, 'User Does not Exist');
    }
    return ReS(res, {message :'Updated User: ' + user.email ,user:user.toJSON()});
}
module.exports.update_user = update_user;

const get_user = async function(req, res){
    const reqID = req.params.id;

    if(!reqID){
        return ReE(res, 'Please Select User Id.');
    }else{
        let err, user;
        [err, user] = await to(authService.getUserById(reqID));
        if(err) return ReE(res, err, 422);

        //TODO sold count and bought count
        let ordercarts;
        [err, ordercarts] = await to (ordercartService.getOrderCartsProductCountBySellerId(reqID));

        let sell_number = 0;
        if (ordercarts.length > 0){
            sell_number = ordercarts[0].count;
        }

        [err, ordercarts] = await to (ordercartService.getOrderCartsProductCountByBuyerId(reqID));

        let buy_number = 0;
        if (ordercarts.length > 0){
            buy_number = ordercarts[0].count;
        }

        return ReS(res, {user:user.toWeb() , buy:buy_number ,sell:sell_number});
    }
}
module.exports.get_user = get_user;

const delete_user = async function(req, res){
    let user, err;
    user = req.user;

    [err, user] = await to(user.destroy());
    if(err) return ReE(res, 'error occured trying to delete user');

    return ReS(res, {message:'Deleted User'}, 204);
}
module.exports.delete_user = delete_user;


const sign_in = async function(req, res){
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authUser(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});
}
module.exports.sign_in = sign_in;

const social_login = async function(req, res){
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authSocialUser(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});
}

module.exports.social_login = social_login;

const forgot_password = async function(req, res)
{
    let err , user;
    [err , user] = await to(authService.forgot_pass(req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res,{user:user.toWeb()});
}
module.exports.forgot_password = forgot_password;

const update_password = async function(req, res)
{
    let err , user;
    [err , user] = await to(authService.update_password(req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res,{token:user.getJWT(),user:user.toWeb()});
}

module.exports.update_password = update_password;

const verify_code = async function(req, res){
    let err, user;
    [err, user] = await to(authService.verify_code(req  ,res));

    if(err){
        return ReE(res, err , 401);
    }
    return ReS(res, {message :'Updated User: '+user.email ,token:user.getJWT(),user:user.toWeb()});
}
module.exports.verify_code = verify_code;

const send_message = async function (req,res) {
    let req_body = req.body;
    let toUserId = req_body.buyer_id;
    let myUserId = req.decoded.user_id;
    let toMessage = req_body.message;
    let type      = req_body.type;
    let err, user, myUser , msg_result;
    [err , user] = await to (authService.getUserById(toUserId));

    if (toUserId === undefined)
        return ReE(res, 'Seller User Id is undefined.');
    if (err)
        return ReE(res, 'Getting Buyer Info Failed.');

    [err, myUser] = await to (authService.getUserById(myUserId));

    if (err)
        return ReE(res, 'Getting My Info Failed.');

    if (type === 0){
        [err, msg_result] = await to (msgService.send_sms(user.phone_number, toMessage));

        // if (err)
        //     return ReE(res,err.message);

        return ReS(res,msg_result);
    } else if (type === 1){
        [err, msg_result] = await to (msgService.send_email(user.email, toMessage + "@" + myUserId.email));
        if (err)
            return ReE(res,err.message);

        return ReS(res,msg_result);
    }
}
module.exports.send_message = send_message;

const getUsers = async function(req,res){
    let err, users;
    [err, users] = await to(authService.getUsers(req.query));
    if(err) return ReE(res, err, 422);
    let jsonArrayData = [];
    let length = users.length;
    for (let i = 0 ; i < length ; i++)
    {
        let user = users[i];
        jsonArrayData.push(user.toJSON());
    }
    let totalCount;

    [err , totalCount] = await to (authService.getUserCount(req.query));
    if (err)
        ReE(res, err, 423);

    return ReS(res, {users:jsonArrayData, totalCount:totalCount} , 200);

}
module.exports.getUsers = getUsers;

const getUsersWithPoints = async function(req,res){
    let err, users;
    [err, users] = await to(authService.getUsersWitPoints(req.query));
    if(err) return ReE(res, err, 422);
    let jsonArrayData = [];
    let length = users.length;
    for (let i = 0 ; i < length ; i++)
    {
        let user = users[i];
        jsonArrayData.push(user.toJSON());
    }
    let totalCount;

    [err , totalCount] = await to (authService.getUserCount(req.query));
    if (err)
        ReE(res, err, 423);

    return ReS(res, {users:jsonArrayData, totalCount:totalCount} , 200);

}
module.exports.getUsersWithPoints = getUsersWithPoints;

const getUserWithPoints = async function(req, res){
    const reqID = req.params.id;

    if(!reqID){
        return ReE(res, 'Please Select User Id.');
    }else{
        let err, user;
        [err, user] = await to(authService.getUserByIdWithPoints(reqID));
        if(err) return ReE(res, err, 422);
        return ReS(res, {user:user.toWeb()});
    }
}
module.exports.getUserWithPoints = getUserWithPoints;

const updateUserPoints = async function(req, res){
    let err, user;
    let pointInfo = req.body.points;
    [err, user] = await to(userpointService.update_userpoint(pointInfo));
    if(err) return ReE(res, err, 422);
    return ReS(res, {user:user.toWeb()});
}
module.exports.updateUserPoints = updateUserPoints;

