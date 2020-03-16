const { Product }           = require('../models/product');
const productService       = require('../services/product.service');
const categoryService       = require('../services/category.service');
const userService = require('../services/auth.service');
const { to , ReE , ReS , TE} = require('../services/util.service');
const CONFIG = require('./../config/config');
const create_product = async function(req, res){
    let err, product;
    [err, product] = await to(productService.create_product(req,res));
    if(err) return ReE(res, err, 422);

    return ReS(res, {product:product.toJSON()});
}

module.exports.create_product = create_product;

const get_products = async function(req, res){
    let err, products , categories;
    req.body.keyword = "";
    [err, categories] = await  to (categoryService.get_categories(req,res));

    let totalCount;
    [err, totalCount] = await to (productService.getCount(req,res));

    [err, products] = await to(productService.get_products(req,res));
    if(err) return ReE(res, err, 422);

    var jsonArrayData = [];
    var length = products.length;
    for (var i = 0 ; i < length ; i++)
    {
        var product = products[i];
        jsonArrayData.push(product.toJSON());
    }
    return ReS(res, {totalCount : totalCount , products : jsonArrayData , categories:categories});
};
module.exports.get_products = get_products;

const searchProduct = async function(req, res){
    let param = req.query , products;
    param.me_flag = req.body.me_flag;
    param.user_id = req.decoded.user_id;
    [err,products] = await to (productService.searchProduct(param));
    if (err){
        TE(err.message);
    }
    for (var i = 0 ; i < products.length ; i++){
        let user_id = products[i]._source.user_id;
        let category_id = products[i]._source.category_id;

        let err, user, category;
        [err,user] = await to (userService.getUserById(user_id));
        if (err) TE(err.message);
        [err, category] = await to (categoryService.get_category(category_id));
        if (err) TE(err.message);

        products[i]._source.user = user.toJSON();
        products[i]._source.category = category.toJSON();
    }
    console.log("GetMyProducts = " + products);
    req.body.keyword = "";
    [err, categories] = await  to (categoryService.get_categories(req,res));

    let totalCount;
    [err, totalCount] = await to (productService.countProduct(param));

    return ReS(res, {totalCount : totalCount , products : products , categories:categories});

}
module.exports.searchProduct = searchProduct;

const get_my_products = async function(req, res){
    let err, products , categories;
    req.body.keyword = "";
    [err, categories] = await  to (categoryService.get_categories(req,res));

    let totalCount;
    [err, totalCount] = await to (productService.getMyCount(req,res));

    [err, products] = await to(productService.get_my_products(req,res));
    if(err) return ReE(res, err, 422);

    var jsonArrayData = [];
    var length = products.length;
    for (var i = 0 ; i < length ; i++)
    {
        var product = products[i];
        jsonArrayData.push(product.toJSON());
    }
    return ReS(res, {totalCount : totalCount , products : jsonArrayData , categories:categories});
}
module.exports.get_my_products = get_my_products;

const get_cart_products = async function(req, res){
    let err, products;
    let totalCount = Object.keys(req.body.carts).length;
    [err, products] = await to(productService.get_cart_products(req,res));
    var jsonArrayData = [];
    var length = products.length;
    for (var i = 0 ; i < length ; i++)
    {
        var product = products[i];
        jsonArrayData.push(product.toJSON());
    }

    return ReS(res, {totalCount : totalCount , products : jsonArrayData});
}
module.exports.get_cart_products = get_cart_products;

const get_product = async function(req, res){
    let err, product;
    [err, product] = await to(productService.get_product(req.params.id));
    if(err) return ReE(res, err, 422);
    return ReS(res, {product:product.toJSON()});
}

module.exports.get_product = get_product;


const update_product = async function(req, res){
    let err, product;
    [err, product] = await to(productService.update_product(req,res));
    if(err) return ReE(res, err, 422);

    return ReS(res, {product:product.toWeb()});
}

module.exports.update_product = update_product;

const delete_product = async function(req, res){
    let err, result;
    [err, result] = await to(productService.delete_product(req,res));
    if(err) return ReE(res, err, 422);
    return ReS(res, {result:result});
}

module.exports.delete_product = delete_product;