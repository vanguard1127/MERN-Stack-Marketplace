const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const { to, TE }    = require('./util.service');
const indexingService = require('./indexing.service');
const ELASTIC_PRODUCT_TYPE = "product";
const CONFIG = require('./../config/config');
const {elasticSearchClient} = require('./elastic-search');

const create_product = async (req, res) => {
    let user_id = req.decoded.user_id;

    let productInfo = req.body;
    productInfo.user_id = user_id;
    const product = new Product(productInfo);
    let err, created_product;
    [err , created_product] = await to (product.save());

    if (err)
        TE(err.message);

    //elastic product
    if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
        let indexedProduct;
        [err,indexedProduct] = await to (indexingService.indexProduct(created_product));
        if (err)
            TE(err.message);
    }
    return created_product;
};
module.exports.create_product = create_product;

const get_products = async (req, res) => {
    let user_id = "", keyword = "", category_id = "" , price_from = 0 , price_to = 0, limit = 10 , page =0 , sort_type ="";
    user_id = req.decoded.user_id;
    if (req.query.user_id != undefined)
        user_id = req.query.user_id;
    if (req.query.keyword != undefined)
        keyword = req.query.keyword;
    if (req.query.category_id != undefined)
        category_id = req.query.category_id;
    if (req.query.price_to != undefined && req.query.price_from != undefined)
    {
        price_from = req.query.price_from;
        price_to = req.query.price_to;
    }
    if (req.query.limit != undefined)
        limit = parseInt(req.query.limit);
    if (req.query.page != undefined)
        page = parseInt(req.query.page);
    if (req.query.sort_type != undefined)
        sort_type = req.query.sort_type;

    var query = {};
    if (user_id != "")
        query.user_id = user_id;
    if (keyword != ""){
        let reg_name = new RegExp( keyword);
        let reg_description = new RegExp(keyword);
        let subquery = [{name:reg_name},{description:reg_description}];
        query.$or = subquery;
    }
    if (category_id != "-1"){
        query.category_id = category_id;
    }
    if (price_from >0 && price_to >0 && price_from < price_to){
        query.price = { $gt: price_from, $lt: price_to };
    }


    let sort_query = {};

    if (sort_type != ""){
        sort_query[sort_type] = 1;
    }

    let subquery = {};
    subquery.$ne = user_id;
    query.user_id = subquery;
    let err, products;
    [err, products] = await  to (Product.find(query).sort(sort_query).skip((page) * limit).limit(limit).populate('user_id','first_name last_name').populate('category_id','name'));

    if (err)
        TE(err.message);

    return products;
};
module.exports.get_products = get_products;

const get_my_products = async (req, res) => {
    let user_id = "", keyword = "", category_id = "" , price_from = 0 , price_to = 0, limit = 10 , page =0 , sort_type ="";
    user_id = req.decoded.user_id;
    if (req.query.user_id != undefined)
        user_id = req.query.user_id;
    if (req.query.keyword != undefined)
        keyword = req.query.keyword;
    if (req.query.category_id != undefined)
        category_id = req.query.category_id;
    if (req.query.price_to != undefined && req.query.price_from != undefined){
        price_from = req.query.price_from;
        price_to = req.query.price_to;
    }
    if (req.query.limit != undefined)
        limit = parseInt(req.query.limit);
    if (req.query.page != undefined)
        page = parseInt(req.query.page);
    if (req.query.sort_type != undefined)
        sort_type = req.query.sort_type;

    var query = {};
    if (user_id != "")
        query.user_id = user_id;
    if (keyword != ""){
        let reg_name = new RegExp( keyword);
        let reg_description = new RegExp(keyword);
        let subquery = [{name:reg_name},{description:reg_description}];
        query.$or = subquery;
    }
    if (category_id != ""){
        query.category_id = category_id;
    }
    if (price_from >0 && price_to >0 && price_from < price_to){
        query.price = { $gt: price_from, $lt: price_to };
    }
    query.user_id = user_id;
    let sort_query = {};
    if (sort_type != ""){
        sort_query[sort_type] = 1;
    }
    let err, products;
    [err, products] = await  to (Product.find(query).sort(sort_query).skip((page) * limit).limit(limit).populate('user_id','first_name last_name').populate('category_id','name'));

    if (err)
        TE(err.message);

    return products;
};
module.exports.get_my_products = get_my_products;

const makeQuery = function(reqInfo){
    let user_id = reqInfo.user_id;
    let me_flag = reqInfo.me_flag;

    let  keyword = "", category_id = "" , price_from = 0 , price_to = 0;
    if (reqInfo.keyword != undefined)
        keyword = reqInfo.keyword;
    if (reqInfo.category_id != undefined)
        category_id = reqInfo.category_id;
    if (reqInfo.price_to != undefined && reqInfo.price_from != undefined){
        price_from = reqInfo.price_from;
        price_to = reqInfo.price_to;
    }


    let mQuery;
    keyword = "*" + keyword + "*";
    // keyword = keyword  "@";
    if (category_id == "-1" || category_id == ""){
        category_id = "*";
    }
    //TODO inner_hits
    if (me_flag == 1){ //my
        mQuery = "{\n" +
            "            \"query\":{\n" +
            "                \"bool\":{\n" +
            "                    \"must\": {\n" +
            "                        \"has_parent\": {\n" +
            "                            \"type\": \"user\",\n" +
            "                            \"query\": {\n" +
            "                                \"match\":{\n" +
            "                                    \"id\":\""+user_id+"\"\n" +
            "                                }\n" +
            "                            }\n" +
            "                        }\n" +
            "                    },\n" +
            "                    \"must\":[{\n" +
            "                        \"wildcard\":{\n" +
            "                            \"category_id\": {\n" +
            "                                    \"value\":\""+category_id+"\"\n" +
            "                                }\n" +
            "                        \t}\n" +
            "                    \t},\n" +
            "                        {\n" +
            "                        \t\"bool\":{\n" +
            "\t                            \"should\":[\n" +
            "\t                                {\n" +
            "\t                                    \"wildcard\":{\n" +
            "\t                                        \"description\":{\n" +
            "\t                                            \"value\":\""+keyword+"\",\n" +
            "\t                                            \"boost\":1.0\n" +
            "\t                                        }\n" +
            "\t                                    }\n" +
            "\t                                },\n" +
            "\t                                {\n" +
            "\t                                    \"wildcard\":{\n" +
            "\t                                        \"name\":{\n" +
            "\t                                            \"value\":\""+keyword + "\",\n" +
            "\t                                            \"boost\":1.0\n" +
            "\t                                        }\n" +
            "\t                                    }\n" +
            "\t                                }\n" +
            "\t                            ]\n" +
            "                        \t}\n" +
            "                        }\n" +
            "                    ]\n" +
            "                }\n" +
            "            }\n" +
            "        }"
    } else { // not mine
        mQuery = "{\n" +
            "            \"query\":{\n" +
            "                \"bool\":{\n" +
            "                    \"must\":[{\n" +
            "                        \"wildcard\":{\n" +
            "                            \"category_id\": {\n" +
            "                                    \"value\":\""+category_id+"\"\n" +
            "                                }\n" +
            "                        \t}\n" +
            "                    \t},\n" +
            "                        {\n" +
            "                        \t\"bool\":{\n" +
            "\t                            \"should\":[\n" +
            "\t                                {\n" +
            "\t                                    \"wildcard\":{\n" +
            "\t                                        \"description\":{\n" +
            "\t                                            \"value\":\""+keyword+"\",\n" +
            "\t                                            \"boost\":1.0\n" +
            "\t                                        }\n" +
            "\t                                    }\n" +
            "\t                                },\n" +
            "\t                                {\n" +
            "\t                                    \"wildcard\":{\n" +
            "\t                                        \"name\":{\n" +
            "\t                                            \"value\":\""+keyword + "\",\n" +
            "\t                                            \"boost\":1.0\n" +
            "\t                                        }\n" +
            "\t                                    }\n" +
            "\t                                }\n" +
            "\t                            ]\n" +
            "                        \t}\n" +
            "                        }\n" +
            "                    ]\n" +
            "                }\n" +
            "            }\n" +
            "        }"
    }
    return mQuery;
}
const searchProduct = async (reqInfo) => {
    let mQuery = makeQuery(reqInfo);
    let  limit = 10 , page =0 , sort_type ="";
    if (reqInfo.limit != undefined)
        limit = parseInt(reqInfo.limit);
    if (reqInfo.page != undefined)
        page = parseInt(reqInfo.page);
    if (reqInfo.sort_type != undefined)
        sort_type = reqInfo.sort_type;

    return new Promise(function(resolve , reject){
        elasticSearchClient.search({
            index:CONFIG.ELASTIC_SEARCH_INDEX,
            type:ELASTIC_PRODUCT_TYPE,
            from:page * limit,
            size:limit,
            body:mQuery
        }).then(function(response){
            console.log("show the response" + JSON.stringify(response));
            let elasticResponse=response.hits.hits;
            resolve(elasticResponse);
        }).catch(err => {
            reject(err);
        });
    });


}

module.exports.searchProduct = searchProduct;


const countProduct = async (reqInfo) => {
    let mQuery = makeQuery(reqInfo);
    let  limit = 10 , page =0 , sort_type ="";
    if (reqInfo.limit != undefined)
        limit = parseInt(reqInfo.limit);
    if (reqInfo.page != undefined)
        page = parseInt(reqInfo.page);
    if (reqInfo.sort_type != undefined)
        sort_type = reqInfo.sort_type;
    return new Promise(function(resolve , reject){
        elasticSearchClient.count({
            index:CONFIG.ELASTIC_SEARCH_INDEX,
            type:ELASTIC_PRODUCT_TYPE,
            body:mQuery
        }).then(function(response){
            console.log("show the response" + JSON.stringify(response));
            let count=response.count;
            resolve(count);
        }).catch(err => {
            reject(err);
        });
    });


}

module.exports.countProduct = countProduct;

const get_product = async (reqID) => {
    var err, product;
    [err, product] = await to(Product.findById(reqID).populate('user_id'));

    if (err)
        TE(err.message);

    if (product == null)
        TE("Product Not Exist!");

    return product;

};

module.exports.get_product = get_product;

const get_cart_products = async (req, res) => {
    var err, products;
    let page  = 0, limit = 10;

    let carts = req.body.carts;

    if (req.body.limit != undefined)
        limit = parseInt(req.query.limit);
    if (req.body.page != undefined)
        page = parseInt(req.query.page);

    var idstringArray = Object.keys(carts);
    [err, products] = await to(Product.find({'_id':{$in : idstringArray}}).populate('user_id'));

    if (err)
        TE(err.message);

    return products;

};

module.exports.get_cart_products = get_cart_products;

const update_product = async (req, res) => {
    let err, result,updated_product;
    let product_id = req.body._id;
    let user_id = req.decoded.user_id;
    let data = {user_id:user_id , name:req.body.name , description:req.body.description ,
        category_id:req.body.category_id , price:req.body.price , price_unit:req.body.price_unit , photos:req.body.photos};
    [err , result] = await to (Product.updateOne({'_id':req.body._id},{$set:data}));

    if (err)
        TE(err.message);

    if (result.ok == 1)
    {
        [err ,updated_product] = await to (Product.findById(product_id));
        if (err) TE(err.message);

        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let upatedElProduct;
            [err , upatedElProduct] = await to (indexingService.updateIndexProduct(updated_product));

            if (err)
                TE(err.message);
        }
        return updated_product;
    }
    else
        TE("Update Product Failed");

};

module.exports.update_product = update_product;

const delete_product = async (req, res) => {
    let product_id = req.params.id;
    //TODO when deleting prdocut, should delete orders?
    let err, result;
    [err , result] = await to (Product.deleteOne({'_id':product_id}));

    if (err)
        TE(err.message);
    if (result.ok == 1) {
        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            [err, result] = await to (indexingService.deleteIndexProduct(product_id));
            if (err)
                return false;
        }
        return true;
    } else {
        return false;
    }



};

module.exports.delete_product = delete_product;


const getMyCount = async (req, res) => {
    let user_id = req.decoded.user_id;
    let err, count;
    [err, count] = await to(Product.countDocuments({'user_id':user_id}));

    if (err)
        TE(err.message);

    return count;

};

module.exports.getMyCount = getMyCount;

const getCount = async (req, res) => {
    let err, count;
    let user_id = req.decoded.user_id;
    [err, count] = await to(Product.countDocuments({'user_id':{'$ne':user_id}}));

    if (err)
        TE(err.message);

    return count;

};

module.exports.getCount = getCount;