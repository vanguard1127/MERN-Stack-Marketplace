const { Category }           = require('../models/category');
const categoryService       = require('../services/category.service');
const { to , ReE , ReS} = require('../services/util.service');

const create_category = async function(req, res){
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Please enter a category name.');
    }else{
        let err, category;
        [err, category] = await to(categoryService.create_category(req.body));
        if(err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created new category.', category:category.toWeb()});
    }
}
module.exports.create_category = create_category;

const get_categories = async function(req, res){
    let err, categories;
    [err, categories] = await to(categoryService.get_categories(req.query));
    if(err) return ReE(res, err, 422);
    let jsonArrayData = [];
    let length = categories.length;
    for (let i = 0 ; i < length ; i++)
    {
        let category = categories[i];
        jsonArrayData.push(category.toJSON());
    }
    let totalCount;

    [err , totalCount] = await to (categoryService.getCount(req.query));
    if (err)
        ReE(res, err, 423);
    return ReS(res, {categories:jsonArrayData , totalCount:totalCount} , 200);
}
module.exports.get_categories = get_categories;


const get_category = async function(req, res){
    const reqID = req.params.id;

    if(!reqID){
        return ReE(res, 'Please Select Category Id.');
    }else{
        let err, category;
        [err, category] = await to(categoryService.get_category(reqID));
        if(err) return ReE(res, err, 422);
        return ReS(res, {category:category.toWeb()});
    }
}
module.exports.get_category = get_category;


const update_category = async function(req, res){
    const body = req.body;
    if(!body.name){
        return ReE(res, 'Please enter an category name to update.');
    }else{
        let err, category;
        [err, category] = await to(categoryService.update_category(req.body));
        if(err) return ReE(res, err, 422);

        return ReS(res, {message:'Successfully created new category.', category:category.toWeb()});
    }
}
module.exports.update_category = update_category;

const delete_category = async function(req, res){
    let category_id = req.params.id;
    let err, result;
    [err, result] = await to(categoryService.delete_category(category_id));
    if(err) return ReE(res, err, 422);
    return ReS(res, {result:result});
}
module.exports.delete_category = delete_category;