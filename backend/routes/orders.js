var express = require('express');
var router = express.Router();
const OrderController   = require('../controllers/order.controller');
const apiConfig         = require('../api/apiConfig');

router.use(function(req,res,next){
    return apiConfig.tokenAuthenticate(req,res,next);
});

/* GET order listing. */
router.get('/',OrderController.get_orders);

router.get('/buy', OrderController.get_buy_orders);
router.get('/all', OrderController.get_all_orders);
router.get('/:id',OrderController.get_order);
router.post('/create',OrderController.create_order);
router.put('/update',OrderController.update_order);
router.delete('/:id' ,OrderController.delete_order);
router.post('/create_withcart' ,OrderController.create_carts_order);

router.post('/payment' ,OrderController.checkout_order);
router.post('/charge' ,OrderController.charge_points);
router.post('/pay_with_points' ,OrderController.pay_with_points);
router.post('/cod_request' ,OrderController.cod_request);
module.exports = router;