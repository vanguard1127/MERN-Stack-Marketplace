var jwt    = require('jsonwebtoken'), // used to create, sign, and verify tokens
    config = require('./../config/config');
var response = function (body, isSuccess, message) {
    return {
        success: isSuccess,
        message: message ? message : "No specified message",
        data: body
    }
}
module.exports = {
    response : response,

    tokenAuthenticate: function(req, res, next,callback) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, config.jwt_encryption, function(err, decoded) {
                if (err) {
                    console.log("Log Error= " + JSON.stringify(err) + "  token" + token);
                    return res.status(300).json(response({}, false, "Failed to authenticate token"));
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(303).send({
                success: false,
                message: 'No token provided.'
            });

        }
        }
}