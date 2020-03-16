var express = require('express');
var router = express.Router();
const ProductController   = require('../controllers/product.controller');
const apiConfig         =require('../api/apiConfig');

router.use(function(req,res,next){
    return apiConfig.tokenAuthenticate(req,res,next);
});

/* GET product listing. */

router.get('/sell', function (req, res , next){
    req.body.me_flag = 1;
    apiConfig.tokenAuthenticate(req, res, next);
} , ProductController.searchProduct);

router.post('/carts', ProductController.get_cart_products);

router.get('/', function(req,res,next){
    req.body.me_flag = 0;
    apiConfig.tokenAuthenticate(req, res, next);
},ProductController.searchProduct);
router.get('/:id', ProductController.get_product);
router.post('/create',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, ProductController.create_product);
router.put('/update',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},ProductController.update_product);
router.delete('/:id' , function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},ProductController.delete_product);

module.exports = router;