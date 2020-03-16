import { ADD_CART_PRODUCT , REMOVE_CART_PRODUCT, CLEAR_CART_PRODUCT, SET_CART_PRODUCT,DEC_CART_PRODUCT , SET_USER_DATA} from "./types";

export function addCartProduct(payload){
    return { type: ADD_CART_PRODUCT, payload }
}

export function removeCartProduct(payload){
    return { type: REMOVE_CART_PRODUCT, payload }
}

export function clearCartProduct(payload){
    return { type: CLEAR_CART_PRODUCT, payload }
}

export function decCartProduct(payload){
    return {type:DEC_CART_PRODUCT , payload}
}

export function setCartProduct(payload){
    return {type:SET_CART_PRODUCT , payload}
}
export function setUserData(payload){
    return {type:SET_USER_DATA , payload}
}

