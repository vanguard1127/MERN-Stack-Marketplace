import {post , put , get , del} from '../api/index';
const resetPasswordPath = 'users/reset_pass';
const loginPath = 'users/signin/';
const signupPath = 'users/signup/';
const userupdatePath = 'users/update/';
const socialloginPath = 'users/social_sign';
const verifyCodePath = 'users/verify_code';
const forgotPath  = 'users/forgot_pass';
const getusersPath = 'users/users';
const getuserPath = 'users/users/';
const getuserswithointsPath = 'users/with_points';
const getuserwithpointsPath = 'users/with_points/';
const updateuserpointsPath = 'users/update_points/';
//send sms
const sendmessagePath = 'users/sendmsg';

//products
const getmyproductsPath = 'products/sell';
const getproductsPath = 'products/';
const createproductPath = 'products/create';
const updateproductPath ='products/update';
const deleteproductPath = 'products/';
const getproductPath = 'products/';
const getcartproductPath = 'products/carts';
//categories
const getcategoriesPath = 'categories/';
const addcategoryPath = 'categories/create';
const updatecategoryPath = 'categories/update';
const getcategoryPath = 'categories/get/';
const deletecategoryPath = 'categories/';

//orders
const getordersPath = 'orders/';
const getorderPath = 'orders/';
const createorderPath = 'orders/create';
const updateorderPath = 'orders/update';
const deleteorderPath = 'orders/';
const createorderswithcartsPath = 'orders/create_withcart';
const getbuyordersPath = 'orders/buy';
const paymentPath = 'orders/payment';
const chargePath = 'orders/charge';
const paywithpointsPath = 'orders/pay_with_points';
const getallordersPath = 'orders/all';

//categories
export function getCategories(data){
    return new Promise((resolve,reject) =>
        get(getcategoriesPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getCategory(data){
    let path = getcategoryPath + data;
    return new Promise((resolve,reject) =>
        get(path, null , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function createCategory(data){
    return new Promise((resolve,reject) =>
        post(addcategoryPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function updateCategory(data){
    return new Promise((resolve,reject) =>
        put(updatecategoryPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function deleteCategory(data){
    return new Promise((resolve,reject) =>
        del(deletecategoryPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
//orders
export function getOrders(data)
{
    return new Promise((resolve,reject) =>
        get(getordersPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getBuyOrders(data)
{
    return new Promise((resolve,reject) =>
        get(getbuyordersPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getAllOrders(data)
{
    return new Promise((resolve,reject) =>
        get(getallordersPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getOrder(id)
{
    let url = getorderPath + id;
    return new Promise((resolve,reject) =>
        get(url, null , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function createOrder(data)
{
    return new Promise((resolve,reject) =>
        post(createorderPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function createOrdersWithCarts(data)
{
    return new Promise((resolve,reject) =>
        post(createorderswithcartsPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function updateOrder(data)
{
    return new Promise((resolve,reject) =>
        put(updateorderPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function deleteOrder(data)
{
    return new Promise((resolve,reject) =>
        del(deleteorderPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function payOrder(data)
{
    return new Promise((resolve,reject) =>
        post(paymentPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function pay_with_pointsOrder(data)
{
    return new Promise((resolve,reject) =>
        post(paywithpointsPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function chargePoints(data){
    return new Promise((resolve,reject) =>
        post(chargePath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
//products
export function getMyProducts(data) {
    return new Promise((resolve,reject) =>
        get(getmyproductsPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}



export function getProducts(data) {
    return new Promise((resolve,reject) =>
        get(getproductsPath, data , false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function createProduct(data) {
    return new Promise((resolve,reject) =>
        post(createproductPath, data, false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function updateProduct(data) {
    return new Promise((resolve,reject) =>
        put(updateproductPath, data, false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getProduct(data) {
    let url = getproductPath + data;
    return new Promise((resolve,reject) =>
        get(url, data, false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function deleteProduct(data) {
    let deleteUrl = deleteproductPath + "/" + data;
    return new Promise((resolve,reject) =>
        del(deleteUrl, null ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function getCartProducts(data) {    
    return new Promise((resolve,reject) =>
        post(getcartproductPath, data ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
//users
export function getUsers(data){
    return new Promise((resolve,reject) =>
        get(getusersPath, data ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getUser(data){
    let path = getuserPath + data;
    return new Promise((resolve,reject) =>
        get(path, null ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function getUsersWithPoints(data){
    return new Promise((resolve,reject) =>
        get(getuserswithointsPath, data ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function getUserWithPoints(data){
    let path = getuserwithpointsPath + data;
    return new Promise((resolve,reject) =>
        get(path, null ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function updateUserPoints(data){
    return new Promise((resolve,reject) =>
        post(updateuserpointsPath, data ,false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
export function resetPassword(data) {
    return new Promise((resolve,reject) =>
        post(resetPasswordPath, data, false).then((resp) => {
            resolve(resp);
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function login(data) {        
    return new Promise((resolve,reject) =>
        post(loginPath, data, false).then((resp) => {
            resolve(resp);
            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function signup(data) {
    return new Promise((resolve,reject) =>
        post(signupPath, data, false).then((resp) => {
            resolve(resp);
            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}


export function userUpdate(data) {
    return new Promise((resolve,reject) =>
        put(userupdatePath, data , false).then((resp) => {
            resolve(resp);
            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function social_sign(data) {
    return new Promise((resolve,reject) =>
        post(socialloginPath, data , false).then((resp) => {
            resolve(resp);            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function verify_code(data) {
    return new Promise((resolve,reject) =>
        post(verifyCodePath, data , false).then((resp) => {
            resolve(resp);            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function forgotPassword(data) {
    return new Promise((resolve,reject) =>
        post(forgotPath, data , false).then((resp) => {
            resolve(resp);            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}

export function sendMessage(data) {    
    return new Promise((resolve,reject) =>
        post(sendmessagePath, data, false).then((resp) => {
            resolve(resp);
            
        }).catch(err => {
            reject(err); // not provide internal server error
        })
    );
}
