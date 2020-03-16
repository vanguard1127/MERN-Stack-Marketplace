const mongoose = require('mongoose');
const UserPoint = mongoose.model('UserPoint');
const { to, TE }    = require('./util.service');

const create_userpoint = async (info) => {
    const userpoint = new UserPoint(info);
    let err, created_userpoint;
    [err , created_userpoint] = await to (userpoint.save());

    if (err)
        TE(err.message);

    return created_userpoint;
};

module.exports.create_userpoint = create_userpoint;

const get_userpoint_byId = async (userpoint_id) => {
    let err, userpoint;
    [err , userpoint] = await to (UserPoint.findById(userpoint_id));

    if (err)
        TE(err.message);

    return userpoint;
};
module.exports.get_userpoint_byId = get_userpoint_byId;

const get_userpoint_byUserId = async (userid) => {
    let err, userpoint;
    [err , userpoint] = await to (UserPoint.findOne({user_id:userid}));

    if (err)
        TE(err.message);

    return userpoint;
}
module.exports.get_userpoint_byUserId = get_userpoint_byUserId;

const update_userpoint = async (pointInfo) => {

    let err, result,updated_userpoint;
    let userpoint_id = pointInfo._id;
    let user_id = pointInfo.user_id;
    let nowTime = Date.now();
    let data = {points:pointInfo.points , updatedAt:nowTime};
    [err , result] = await to (UserPoint.updateOne({'_id':userpoint_id},{$set:data}));

    if (err)
        TE(err.message);
    if (result.ok == 1) {
        [err, updated_userpoint] = await to(UserPoint.findById(userpoint_id).populate('user_id'));
        if (err) TE(err.message);

        return updated_userpoint;
    }

    return TE("Update Product Failed");
};

module.exports.update_userpoint = update_userpoint;

const delete_userpoint = async (reqID) => {
    let err, result;
    [err , result] = await to (UserPoint.deleteOne({'_id':reqID}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        return true;
    }
    else
    {
        return false;
    }
};

module.exports.delete_userpoint = delete_userpoint;
