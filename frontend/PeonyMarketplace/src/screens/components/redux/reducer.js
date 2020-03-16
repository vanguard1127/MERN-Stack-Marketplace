import { combineReducers } from 'redux';
import {getData, storeData} from './../../../utils/AppUtils';
import { ADD_CART_PRODUCT , REMOVE_CART_PRODUCT, CLEAR_CART_PRODUCT, DEC_CART_PRODUCT, SET_CART_PRODUCT , SET_USER_DATA} from "./types";
const initialState = {
    carts:{},
    photo:'',
    email:'',
    user_type:0,
    total_quantity:0,
    total_price:0,
  };
  function rootReducer(state = initialState, action) {      
    let cart = state.carts;
    if (action.type === SET_CART_PRODUCT){
        cart = action.payload.cart;        
    } else if (action.type === ADD_CART_PRODUCT){  
      let id;
      id = action.payload.product.id;
      
      if (id === undefined){
        id = action.payload.product._id;
      }
      if (cart[id] === undefined){
        cart[id] = 0;
      }
      //cart[id] = (cart[id] !== undefined ? cart[id] : 0);
      
      let qty = cart[id] + parseInt(action.payload.qty);
      cart[id] = qty;   
      storeData('cart', JSON.stringify(cart));
    } else if (action.type === DEC_CART_PRODUCT){  //  
      let id;  
      id = action.payload.product.id;
      if (id === undefined){
        id = action.payload.product._id;
      }
      let count = cart[id];
      if (count > 1) {        
        cart[id] = count - 1;
      } else if (count == 1){
        delete cart[id];
      }
      storeData('cart', JSON.stringify(cart));   
    } else if (action.type === REMOVE_CART_PRODUCT){
      let id;
      id = action.payload.product.id;
      if (id === undefined){
        id = action.payload.product._id;
      }    
      delete cart[id];
      storeData('cart', JSON.stringify(cart));
    } else if (action.type === CLEAR_CART_PRODUCT){
          cart = {};
          storeData('cart', JSON.stringify(cart));
    } else if (action.type === SET_USER_DATA){
          state.photo = action.payload.photo;
          state.email = action.payload.email;
          state.user_type = action.payload.user_type;
    }
    
    
    state.total_price = 0;
    state.total_quantity =0;
    for (let value of Object.keys(cart)) {
      if (value !== undefined){
        let qty = cart[value];
        state.total_quantity += qty;        
      }
    }
    state = Object.assign({}, state, {
      carts: cart
      });
      
    return state;
  }
  export default rootReducer;