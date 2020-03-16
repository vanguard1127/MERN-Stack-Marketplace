const mongoose = require('mongoose');

const Category = mongoose.model('Category');
const User = mongoose.model('User');
const Product = mongoose.model('Product');

const ELASTIC_CATEGORY_TYPE = "category";
const ELASTIC_PRODUCT_TYPE = "product";
const ELASTIC_USER_TYPE = "user";

const { to, TE }    = require('./util.service');

const CONFIG = require('./../config/config');
const {elasticSearchClient} = require('./elastic-search');

// const mapping = {
//         user:{
//             properties:{
//                 id:{type:'text'},
//                 social_type:{type:'integer'},
//                 facebook_id:{type:'text'},
//                 google_id:{type:'text'},
//                 phone_number:{type:'text'},
//                 email:{type:'text'},
//                 user_type:{type:'integer'},
//                 first_name:{type:'text'},
//                 last_name:{type:'text'},
//                 photo:{type:'text'},
//                 country:{type:'text'},
//                 country_state_province:{type:'text'},
//                 city:{type:'text'},
//                 address_line1:{type:'text'},
//                 address_line2:{type:'text'},
//                 geo_lat:{type:'text'},
//                 geo_lng:{type:'text'},
//                 device_id:{type:'text'},
//                 device_type:{type:'integer'},
//                 updatedAt:{type:'text'},
//                 createdAt:{type:'text'},
//             }
//         },
//         product:{
//             _parent:{
//                 type:"user"
//             },
//             properties:{
//                 id:{type:'text'},
//                 user_id:{type:'integer'},
//                 name:{type:'text'},
//                 description:{type:'text'},
//                 category_id:{type:'text'},
//                 price:{type:'integer'},
//                 price_unit:{type:'integer'},
//                 photos:[
//                 ],
//                 updatedAt:{type:'text'},
//                 createdAt:{type:'text'},
//             }
//         },
//         category:{
//             properties:{
//                 name:{type:'text'},
//                 updatedAt:{type:'text'},
//                 createdAt:{type:'text'},
//             }
//         }
// };

const mapping = {
        user:{},
        product: {
            _parent: {
                type: "user"
            },
            properties:{
                id:{type:'text'},
                user_id:{type:'text'},
                name:{type:'keyword'},
                description:{type:'keyword'},
                category_id:{type:'text'},
                price:{type:'double'},
                price_unit:{type:'text'},
                photos:{type:'object'},
                updatedAt:{type:'text'},
                createdAt:{type:'text'},
            }
        },
        category:{}
    };
const createIndex = function() {
    elasticSearchClient.indices.exists({
        index: CONFIG.ELASTIC_SEARCH_INDEX
    }, function(err, response, status) {
        if (status == 404) {
            elasticSearchClient.indices.create({
                index: CONFIG.ELASTIC_SEARCH_INDEX,
                body:{
                    settings : {
                            number_of_shards: 5,
                            "index.refresh_interval": "5s",
                            "index.query.default_field": "message",
                            "index.routing.allocation.total_shards_per_node": 5,
                            "index": {
                                "analysis": {
                                    "analyzer": {
                                        "analyzer_keyword": {
                                            "filter":"lowercase",
                                            "type": "custom",
                                            "tokenizer" : "keyword"
                                        }
                                    }
                                }
                            }
                        },
                        mappings:mapping

                }
            }, function(err, response, status) {
                if(err) {
                    console.log(err);
                    process.exit(1);
                }
                console.log("Created index "+response);
            });
        }
        indexUnIndexedAll().then((result) => {
            //success
        }).catch((err) =>{
            //failed
        });
    });
}
module.exports.createIndex = createIndex;

const indexProduct = async (product) => {
    let err;
    let elProduct = product.toJSON() , elasticProduct;
    elProduct.id = elProduct._id;
    delete elProduct['_id'];
    let userId = elProduct.user_id.toString();
    let id = elProduct.id.toString();
    [err ,elasticProduct] = await to(elasticSearchClient.index(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_PRODUCT_TYPE,
            body: elProduct,
            parent:userId,
            id:id

        })
    );
    if (err) TE(err.message);

    product.isIndexed = true;
    [err , result] = await to (Product.updateOne({'_id':product._id},{$set:{isIndexed:true}}));

    if (err) TE(err.message);

    if (result.ok == 1){
        return elasticProduct;
    } else {
        [err ,result] = await to (deleteIndexProduct(product._id));
        return TE("Failed to update product record.");
    }

}
module.exports.indexProduct = indexProduct;

const updateIndexProduct = async (product) => {
    let err;
    let elProduct = product.toJSON();
    elProduct.id = elProduct._id;
    let userId = elProduct.user_id.toString();
    delete elProduct['_id'];
    [err ,updateElProduct] = await to(elasticSearchClient.update(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_PRODUCT_TYPE,
            id:product._id.toString(),
            parent:userId,
            body: {
                doc:elProduct
            }
        })
    );
    if (err)
        TE(err.message);

    if (err) TE(err.message);
    return updateElProduct;
}
module.exports.updateIndexProduct = updateIndexProduct;

const deleteIndexProduct = async (product_id) => {
    let elResult , err;
    [err ,elResult] = await to(elasticSearchClient.delete(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_PRODUCT_TYPE,
            body: {
                query: {
                    match: { id: product_id }
                }
            }
        })
    );
    if (err)
        return false;
    return true;
}
module.exports.deleteIndexProduct = deleteIndexProduct;

const indexUnIndexedProducts = async() => {
    let err, products;
    [err, products] = await to (Product.find({isIndexed:false}));
    for (let i = 0 ; i < products.length ; i++){
        let product = products[i];
        let elasticProduct;
        [err,elasticProduct] = await to (indexProduct(product));
    }
    return true;
}
module.exports.indexUnIndexedProducts = indexUnIndexedProducts;

const indexUser = async (created_user) => {
    let elUser = created_user.toJSON();
    elUser.id = elUser._id;
    delete elUser['_id'];
    let elasticUser , err;
    [err ,elasticUser] = await to(elasticSearchClient.index(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_USER_TYPE,
            id:created_user.id.toString(),
            body: elUser
        })
    );

    if (err)
        TE(err.message);

    created_user.isIndexed = true;
    [err , result] = await to (User.updateOne({'_id':created_user._id},{$set:{isIndexed:true}}));

    if (err) TE(err.message);

    if (result.ok == 1){
        return elasticUser;
    } else {
        [err ,result] = await to (deleteIndexUser(created_user._id));
        return TE("Failed to update user record.");
    }

}
module.exports.indexUser = indexUser;

const updateIndexUser = async (user) => {
    let elUser = user.toJSON();
    elUser.id = elUser._id;
    delete elUser['_id'];
    let elasticUser;
    let err;
    [err ,elasticUser] = await to(elasticSearchClient.update(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_USER_TYPE,
            id:user.id.toString(),
            body: {
                doc:elUser
            }
        })
    );

    if (err)
        TE(err.message);
    return elasticUser;
}
module.exports.updateIndexUser = updateIndexUser;

const deleteIndexUser = async (user_id) => {
    let elResult;
    [err ,elResult] = await to(elasticSearchClient.delete(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_USER_TYPE,
            body: {
                query: {
                    match: { id: user_id }
                }
            }
        })
    );
    if (err)
        return false;
    return true;
}
module.exports.deleteIndexUser = deleteIndexUser;

const indexUnIndexedUsers = async() => {
    let err, users;
    [err, users] = await to (User.find({isIndexed:false}));
    for (let i = 0 ; i < users.length ; i++){
        let user = users[i];
        let elasticUser;
        [err,elasticUser] = await to (indexUser(user));
    }
    return true;
}
module.exports.indexUnIndexedUsers = indexUnIndexedUsers;

const indexCategory = async (created_category) => {
    let elCategory = created_category.toJSON();
    elCategory.id = elCategory._id;
    delete elCategory['_id'];
    let elasticCategory , err;
    [err ,elasticCategory] = await to(elasticSearchClient.index(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_CATEGORY_TYPE,
            body: elCategory,
            id:elCategory.id.toString()
        })
    );

    if (err)
        TE(err.message);

    created_category.isIndexed = true;
    [err , result] = await to (Category.updateOne({'_id':created_category._id},{$set:{isIndexed:true}}));

    if (err) TE(err.message);

    if (result.ok == 1){
        return elasticCategory;
    } else {
        [err ,result] = await to (deleteIndexCategory(created_category._id));
        return TE("Failed to update user record.");
    }
}
module.exports.indexCategory = indexCategory;

const updateIndexCategory = async (updated_category) => {
    let elCategory = updated_category.toJSON();
    elCategory.id = elCategory._id;
    delete elCategory['_id'];
    let err , updateElCategory;
    let idString = JSON.stringify(updated_category._id);
    [err ,updateElCategory] = await to(elasticSearchClient.update(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_CATEGORY_TYPE,
            id:elCategory.id.toString(),
            body:{
                doc:elCategory
            }

        })
    );
    if (err)
        TE(err.message);
    return updateElCategory;
}
module.exports.updateIndexCategory = updateIndexCategory;

const deleteIndexCategory = async (category_id) => {
    let elResult ,err;
    [err ,elResult] = await to(elasticSearchClient.index(
        {
            index: CONFIG.ELASTIC_SEARCH_INDEX,
            type: ELASTIC_CATEGORY_TYPE,
            body: {
                query: {
                    match: { id: category_id }
                }
            }
        })
    );
    if (err)
        return false;
    return true;
}
module.exports.deleteIndexCategory = deleteIndexCategory;

const indexUnIndexedCategories= async() => {
    let err, categories;
    [err, categories] = await to (Category.find({isIndexed:false}));
    for (let i = 0 ; i < categories.length ; i++){
        let category = categories[i];
        let elasticCategory;
        [err,elasticCategory] = await to (indexCategory(category));
    }
    return true;
}
module.exports.indexUnIndexedCategories = indexUnIndexedCategories;

const indexUnIndexedAll = async() => {
    await to (indexUnIndexedProducts());
    await to (indexUnIndexedUsers());
    await to (indexUnIndexedCategories());
}
module.exports.indexUnIndexedAll = indexUnIndexedAll;