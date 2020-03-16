var express = require('express');
var router = express.Router();
const apiConfig         =require('../api/apiConfig');
const OrderCartController   = require('../controllers/ordercart.controller');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;