const mongoose = require('mongoose');
const User = mongoose.model('User');
const msgService = require('./message.service');
const userpointService = require('./userpoint.service');

var phoneToken = require('generate-sms-verification-code');
const { to, TE }    = require('./util.service');
const indexService  = require('./indexing.service');
const validator     = require('validator');
const CONFIG = require('./../config/config');

const getUniqueKeyFromBody = function(body){// this is so they can send in 3 options unique_key, email, or phone and it will work
    let unique_key = body.unique_key;
    if(typeof unique_key==='undefined'){
        if(typeof body.email != 'undefined'){
            unique_key = body.email
        }else if(typeof body.phone_number != 'undefined'){
            unique_key = body.phone_number
        }else{
            unique_key = null;
        }
    }
    return unique_key;
}
/*
 * Generate Otp Code
 * */
function generateCode(number) {
    var generatedToken = phoneToken(8, {type: 'number'})
    return generatedToken; //for test
}

//Create User
const create_user = async (userInfo) => {
    let unique_key, err;
    unique_key = getUniqueKeyFromBody(userInfo);
    if(!unique_key) TE('An email or phone number was not entered.');


    if(validator.isEmail(unique_key)){
        userInfo.email = unique_key;

        const user = new User(userInfo);
        var code = generateCode(userInfo);
        let msgBody = "Your verification code is: " + code + "\n@From MarketPlace Peony";
        let result;
        [err, result] = await to (msgService.send_sms(userInfo.phone_number, msgBody));
        //For test
        // if (err)
        //     TE(err.message);
        user.verify_code = code;
        user.verification = 0;
        var created_user;
        [err , created_user] = await to (user.save());
        if (err)
            TE(err.message);

        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let elCreatedUser;
            [err, elCreatedUser] = await to (indexService.indexUser(created_user));
            if (err) TE(err.message);
        }

        let created_points_user;
        [err, created_points_user] = await to (createUserPoints(created_user));

        if (!err)
            return created_points_user;
        return created_user;
    }else if(validator.isMobilePhone(unique_key, 'any')) {//checks if only phone number was sent
        const user = new User(userInfo);
        user.verify_code = generateCode(userInfo);
        user.verification = 0;
        var code = generateCode(userInfo);
        let msgBody = "Your verification code is: " + code + "\n@From MarketPlace Peony";
        let result;
        [err, result] = await to (msgService.send_sms(userInfo.phone_number, msgBody));
        // if (err)
        //     TE(err.message);
        user.verify_code = code;
        user.verification = 0;
        var created_user;
        [err, created_user] = await to(user.save());

        if (err)
            TE(err.message);
        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let elCreatedUser;
            [err, elCreatedUser] = await to (indexService.indexUser(created_user));
            if (err) TE(err.message);
        }
        let created_points_user;
        [err, created_points_user] = await to (createUserPoints(created_user));

        if (!err)
            return created_points_user;

        return created_user;
    }

}
module.exports.create_user = create_user;

const update_user = async function(req)
{
    var err, user;
    // var user_id = req.decoded.user_id;
    let user_id = req.body._id;
    [err, user] = await to(User.findById(user_id));

    if (err)
        TE(err.message);

    if (user == null)
        TE("Find User Error");
    var data = req.body;
    var result;
    [err, result] = await  to (User.updateOne({'_id':user_id} , {$set:data}).exec());
    if(err) TE(err.message);

    if (result.ok == 1)
    {
        [err ,user] = await to (User.findById(user_id));
        if (err) TE(err.message);

        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let elUpdatedUser;
            [err, elUpdatedUser] = await to (indexService.updateIndexUser(user));

            if (err)
                TE(err.message);
        }
        return user;
    }
    else
        TE("Update Failed");
    return user;
}

module.exports.update_user = update_user;


const delete_user = async (req, res) => {
    let user_id = req.params.id;
    let err, result;
    [err , result] = await to (User.deleteOne({'_id':user_id}));

    if (err)
        TE(err.message);
    if (result.ok == 1) {
        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let elResult;
            [err ,elResult] = await to(indexService.deleteIndexUser(user_id));
            if (err)
                return false;
        }
        return true;
    }  else {
        return false;
    }



};

module.exports.delete_user = delete_user;

const createUserPoints = async function(user){
    let id = user._id;
    let err,points;
    if (user.points != null && user.points != undefined){
        return user;
    }
    [err,points] = await to (userpointService.get_userpoint_byUserId(id));
    if (err)
        TE(err.message);
    if (points == null){
        let points = {user_id:id, points:0};
        let created_points;
        [err ,created_points] = await to (userpointService.create_userpoint(points));

        if (err)
            TE(err.message);

        let updatedUser;
        [err, updatedUser] = await to (User.updateOne({'_id':id}, {$set:{points:created_points._id}}));

        if (err)
            TE(err.message);

        return user;//TODO find updated user and return
    } else {
        let updatedUser;
        [err, updatedUser] = await to (User.updateOne({'_id':id}, {$set:{points:points._id}}));

        if (err)
            TE(err.message);
        return user;
    }
}
module.exports.createUserPoints = createUserPoints;

const authUser = async function(userInfo){//returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = getUniqueKeyFromBody(userInfo);

    if(!unique_key) TE('Please enter an email or phone number to login');

    if(!userInfo.password) TE('Please enter a password to login');

    if(validator.isEmail(unique_key)){
        auth_info.method='email';

        [err, user] = await to(User.findOne({email:unique_key}));
        if(err) TE(err.message);

        if (user == null)
            TE('Not Registered');

    }else if(validator.isMobilePhone(unique_key, 'any')){//checks if only phone number was sent
        auth_info.method='phone';

        [err, user] = await to(User.findOne({phone_number:unique_key}));
        if(err) TE(err.message);
        if (user == null)
            TE('Not Registered');

    }else{
        TE('A valid email or phone number was not entered');
    }

    [err, user] = await to(user.authenticate(userInfo.password));

    if(err) TE("Invalid Password");

    let device_id = userInfo.device_id, device_type = userInfo.device_type , result;
    [err, result] = await  to (User.updateOne({'_id':user._id} , {$set:{device_id:device_id, device_type:device_type}}).exec());
    if (user.verification == 1)
        return user;
    else
        TE("Not Verified!");

}
module.exports.authUser = authUser;

const authSocialUser = async function(userInfo) {//returns token

    let auth_info = {};
    auth_info.status = 'socail_login';

    var email = userInfo.email;

    var user ;
    [err, user] = await to(User.findOne({email:email}));

    if (err)
        TE(err.message);

    if (user != null)
    {
        if (userInfo.social_type == 1){
            if (user.facebook_id == userInfo.facebook_id) {
                return user;
            }
            else {
                var social_info = {facebook_id : userInfo.facebook_id , verification : 1};
                [err, result] = await  to (User.updateOne({'_id':user._id} , {$set:social_info}).exec());
                if (result.ok == 1)
                    return user;
                else
                    TE("Update User Failed");
            }
        } else if (userInfo.social_type == 2){
            if (user.google_id == userInfo.google_id){
                return user;
            } else {
                var social_info = {facebook_id : userInfo.facebook_id , verification : 1};
                [err, result] = await  to (User.updateOne({'_id':user._id} , {$set:social_info}).exec());
                if (result.ok == 1)
                    return user;
                else
                    TE("Update User Failed");
            }
        } else {
            TE("User Error");
        }
    } else {
        return create_user(userInfo);
    }


    if (users.length > 0) // in this case that there is a user which have this email
    {
        user = users[0];

        if (userInfo.social_type == 1)
        {
            if (user.facebook_id == userInfo.facebook_id)
            {
                return user;
            }
            else
            {
                //TODO
                var social_info = {facebook_id : userInfo.facebook_id , verification : 1};
                user.set(social_info);

                [err, user] = await to(user.save());

                if(err) TE(err.message);

                return user;
            }
        }
        else if (userInfo.social_type == 2)
        {
            if (user.google_id == userInfo.google_id)
            {
                return user;
            }
            else
            {
                //TODO
                var social_info = {google_id : userInfo.google_id , verification : 1};
                user.set(social_info);

                [err, user] = await to(user.save());

                if(err) TE(err.message);

                return user;
            }
        }
    }
    else
    {

        return create_user(userInfo);
    }

}
module.exports.authSocialUser = authSocialUser;

const getUserById = async function(id){
    let err, user;
    [err , user] = await to (User.findById(id).populate('points','points'));

    if (err)
        TE(err.message);

    return user;
}
module.exports.getUserById = getUserById;

const getUserByIdWithPoints = async function(id){
    let err, user;
    [err , user] = await to (User.findById(id).populate('points'));

    if (err)
        TE(err.message);

    let created_points_user;
    [err, created_points_user] = await to (createUserPoints(user));

    if (!err)
        return created_points_user;

    return user;
}
module.exports.getUserByIdWithPoints = getUserByIdWithPoints;

const getUserCount = async function(criteria){
    let query = makeQuery(criteria);

    let err, count;
    [err, count] = await  to (User.countDocuments(query));
    if (err)
        TE(err.message);
    return count;
}
module.exports.getUserCount = getUserCount;


const getUsers = async function(criteria){
    let limit = 10 , page =0;
    if (criteria.limit != undefined)
        limit = parseInt(criteria.limit);
    if (criteria.page != undefined)
        page = parseInt(criteria.page);

    let query = makeQuery(criteria);
    let err, users;
    [err, users] = await  to (User.find(query).skip((page) * limit).limit(limit));
    if (err)
        TE(err.message);
    return users;
}
module.exports.getUsers = getUsers;

const makeQuery = function(criteria){
    let keyword = "";
    if (criteria.keyword != undefined)
        keyword = criteria.keyword;

    let query = {};
    if (keyword != ""){
        let reg_name = new RegExp( keyword);
        let reg_description = new RegExp(keyword);
        let subquery = [{first_name:reg_name},{last_name:reg_description},{email:reg_name}];
        query.$or = subquery;
    }
    return  query;
}
const getUsersWitPoints = async function(criteria){
    let limit = 10 , page =0;
    if (criteria.limit != undefined)
        limit = parseInt(criteria.limit);
    if (criteria.page != undefined)
        page = parseInt(criteria.page);

    let query = makeQuery(criteria);
    let err, users;
    [err, users] = await  to (User.find(query).skip((page) * limit).limit(limit).populate('points'));
    if (err)
        TE(err.message);
    return users;
}
module.exports.getUsersWitPoints = getUsersWitPoints;

const verify_code =async function(req, res){
    var otp_code = req.body.verify_code;
    var user_id = req.body.user_id;

    var err, user;
    [err, user] = await to (User.findById(user_id));

    if(err) TE(err.message);
    if (user != null && user != undefined){
        if (user.verify_code == otp_code){
            user.verification = 1;
            [err, result] = await  to (User.updateOne({'_id':user_id} , {$set:{'verification':1}}).exec());
            if (result.ok == 1){
                user.verification = 1;
                if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
                    let elUpdatedUser;
                    [err, elUpdatedUser] = await to (indexService.updateIndexUser(user));

                    if (err)
                        TE(err.message);
                }
                return user;
            }
            else
                TE("Update Verification Failed");
        } else {
            TE("Update Verification Failed");
        }
    }
    else
        TE('Not Registered');

}
module.exports.verify_code = verify_code;

const forgot_pass = async function(requInfo){
    let phone_number = requInfo.phone_number;
    let user;
    // if(validator.isMobilePhone(phone_number, 'any')){//checks if only phone number was sent
        [err, user] = await to(User.findOne({phone_number:phone_number}));

        if(err) TE(err.message);
    // }else{
    //     TE('A valid phone number was not entered');
    // }

    if(!user) TE('Not registered');

    var code = generateCode(phone_number);
    let msgBody = "Your forget password verification code is: " + code + "\n@From MarketPlace Peony";
    let result;
    [err, result] = await to (msgService.send_sms(phone_number, msgBody));

    var data = {verify_code : code , verification:0};
    [err, result] = await  to (User.updateOne({'_id':user._id} , {$set:data}));

    if(err) TE(err.message);

    if (result.ok == 0)
        TE("Update Failed");

    return user;
}
module.exports.forgot_pass = forgot_pass;


const update_password = async function(reqbody)
{
    let password = reqbody.password;
    let user_id  = reqbody.user_id;

    var err, user;

    [err, user] = await to(User.findById(user_id));

    if(err) TE(err.message);

    if(!user) TE('Not registered');

    user.password = password;

    var created_user;
    [err , created_user] = await to (user.save());

    if (err)
        TE(err.message);

    return created_user;

}

module.exports.update_password = update_password;