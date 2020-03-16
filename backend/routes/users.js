var express = require('express');
var router = express.Router();

const UserController   = require('../controllers/user.controller');
const apiConfig         =require('../api/apiConfig');

/* GET users listing. */
router.get('/users', function(req, res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
} , UserController.getUsers);

router.get('/users/:id', function(req, res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
} ,UserController.get_user);

router.post('/signin' , UserController.sign_in);
router.post('/signup' , UserController.create_user);
router.put('/update',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},UserController.update_user);

router.post('/verify_code' , UserController.verify_code);
router.post('/forgot_pass' , UserController.forgot_password);
router.post('/reset_pass' , UserController.update_password);
router.post('/social_sign' , UserController.social_login);


router.post('/sendmsg',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},UserController.send_message);

router.get('/with_points', function(req, res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
} ,UserController.getUsersWithPoints);

router.get('/with_points/:id', function(req, res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
} ,UserController.getUserWithPoints);

router.post('/update_points/', function(req, res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
} ,UserController.updateUserPoints);


module.exports = router;
