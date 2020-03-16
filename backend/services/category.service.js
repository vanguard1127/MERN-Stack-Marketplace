const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const { to, TE }    = require('./util.service');
const indexService  = require('./indexing.service');
const CONFIG = require('./../config/config');

const create_category = async (reqInfo) => {
    const category = new Category(reqInfo);
    let err, created_category;
    [err , created_category] = await to (category.save());

    if (err)
        TE(err.message);

    if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
        let elCategory;
        [err , elCategory] = await to (indexService.indexCategory(created_category));

        if (err)
            TE(err.message);
    }
    return created_category;
};

module.exports.create_category = create_category;

const get_categories = async (criteria) => {
    let limit = 10 , page =0;
    if (criteria.limit != undefined)
        limit = parseInt(criteria.limit);
    if (criteria.page != undefined)
        page = parseInt(criteria.page);

    let query = makeQuery(criteria);
    let err, categories;

    [err, categories] = await  to (Category.find(query).skip((page) * limit).limit(limit));

    if (err)
        TE(err.message);

    return categories;
};

module.exports.get_categories = get_categories;

const getCount = async (criteria) => {
    let query = makeQuery(criteria);
    let err, count;
    [err, count] = await  to (Category.countDocuments(query));
    if (err)
        TE(err.message);
    return count;
};
module.exports.getCount = getCount;

const makeQuery = function(criteria){
    let keyword = "";
    if (criteria.keyword != undefined)
        keyword = criteria.keyword;
    let query = {};
    if (keyword != ""){
        let reg_name = new RegExp( keyword);
        query.name = reg_name;
    }
    return query;
}
const get_category = async (category_id) => {
    let err, category;
    [err , category] = await to (Category.findById(category_id));

    if (err)
        TE(err.message);

    return category;
};

module.exports.get_category = get_category;

const update_category = async (cateInfo) => {
    let err, result,updated_category;
    let category_id = cateInfo._id;
    let nowTime = Date.now();
    let data = {name:cateInfo.name , updatedAt:nowTime};
    [err , result] = await to (Category.updateOne({'_id':category_id},{$set:data}));

    if (err)
        TE(err.message);
    if (result.ok == 1) {
        [err, updated_category] = await to(Category.findById(category_id));
        if (err) TE(err.message);
        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){
            let updatedElCategory;
            [err, updatedElCategory] = await to (indexService.updateIndexCategory(updated_category));

            if (err)
                TE(err.message);
        }
        return updated_category;
    }

    return TE("Update Product Failed");
};

module.exports.update_category = update_category;

const delete_category = async (reqID) => {
    let err, result;
    [err , result] = await to (Category.deleteOne({'_id':reqID}));
    if (err)
        TE(err.message);
    if (result.ok == 1) {
        if (CONFIG.USE_ELASTIC_SEARCH == 'true'){

        }
        return true;
    }
    else
    {
        return false;
    }
};

module.exports.delete_category = delete_category;
