require('dotenv').config();
const { to, TE }    = require('./util.service');
let admin = require("firebase-admin");
const nodemailer     = require('nodemailer');
const twilio_client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_TOKEN);


var serviceAccount = require("./../config/marketplace-fcdc3-firebase-adminsdk-2snxk-beb3b3a0a3.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://marketplace-fcdc3.firebaseio.com"
});


const CONFIG = require('./../config/config');

module.exports.send_sms = async function(phone_number , msg_body ,cb) {
    let err, result;
    [err, result] = await to(twilio_client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number,
        body: msg_body
    }));

    if (err)
        TE(err.message);

    return result;
}

module.exports.send_email = async function(email , msg_body ,cb)
{
    let smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:CONFIG.SENDING_EMAIL,
                    pass:CONFIG.SENDING_EMAIL_PASS
            }
    });
    let mailOptions = {
            from: CONFIG.SENDING_EMAIL,
            to: email,
            subject: "MarketPlace Sending Email",
            text: msg_body,
        }

        let err,response;
    [err, response] = await to(smtpTransport.sendMail(mailOptions));
    if (err)
            TE(err.message);
    return response;
}

module.exports.send_push_notification = async function(registrationToken ,user, order_id)
{
    if (registrationToken !== ''){
        var payload = {
            notification: {
                title: "New Order Status",
                body: 'Order Status Changed'
            }
            ,
            data: {
                order_id:JSON.stringify(order_id),
                title: "New Order Status",
                body: 'Order Status Changed'
            }

        };
        var options = {
            priority: "high",
            timeToLive: 60 * 60 *24
        };


        admin.messaging().sendToDevice(registrationToken, payload, options)
            .then(function(response) {
                console.log("Successfully sent message:", JSON.stringify(response));
            })
            .catch(function(error) {
                console.log("Error sending message:", error);
            });
    }


}
