import { ADD_CART_PRODUCT, REMOVE_CART_PRODUCT, CLEAR_CART_PRODUCT  ,DEC_CART_PRODUCT} from "../constants/action-types";
const initialState = {
  carts:{},
  total_quantity:0,
  total_price:0,
};
function rootReducer(state = initialState, action) {

  let cart =  localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {};
  if (action.type === ADD_CART_PRODUCT){

    let id;
    id = action.payload.product.id;
    if (id === undefined){
      id = action.payload.product._id;
    }
    cart[id] = (cart[id] ? cart[id] : 0);
    let qty = cart[id] + parseInt(action.payload.qty);
    cart[id] = qty;   

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
  } else if (action.type === REMOVE_CART_PRODUCT){
    let id;
    id = action.payload.product.id;
    if (id === undefined){
      id = action.payload.product._id;
    }    
    delete cart[id];
  } else if (action.type === CLEAR_CART_PRODUCT){

      cart = {};
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  state.total_price = 0;
  state.total_quantity =0;
  for (let value of Object.keys(cart)) {
    if (value !== undefined){
      let qty = cart[value];
      state.total_quantity += qty;        
    }
  }
  return Object.assign({}, state, {
    carts: cart
    });
  return state;
}

export default rootReducer;