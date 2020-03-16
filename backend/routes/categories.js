var express = require('express');
var router = express.Router();
const CategoryController   = require('../controllers/category.controller');
const apiConfig         =require('../api/apiConfig');

router.use(function(req,res,next){
    return apiConfig.tokenAuthenticate(req,res,next);
});

/* GET category listing. */
router.get('/', CategoryController.get_categories);
router.get('/get/:id', CategoryController.get_category);
router.post('/create', CategoryController.create_category); //TODO update using apiConfig
router.put('/update',CategoryController.update_category);
router.delete('/:id' , CategoryController.delete_category);

module.exports = router;