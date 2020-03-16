import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-social/bootstrap-social.css';
import App from './App';
import { Route,BrowserRouter as Router, Switch} from 'react-router-dom';
import ProfileScreen from './screens/auth/Profile/ProfileScreen';
import ViewProfile from './screens/auth/Profile/ViewProfile';
import SignupForm from './screens/auth/Signup/SignupForm';
import PhoneVerifyScreen from './screens/auth/Verify/PhoneVerifyScreen';
import SigninForm from './screens/auth/Signin/SigninForm';
import BuyMainScreen from './screens/buy/BuyMainScreen';
import CartDetailScreen from './screens/buy/CartDetailForm';
import SellMainScreen from './screens/sell/SellMainScreen';
import ProductForm from './screens/sell/ProductEdit';
import InputPhoneNumberScreen from './screens/auth/ResetPassword/InputPhoneNumberScreen'
import ResetPassword from './screens/auth/ResetPassword/ResetPasswordForm'
import MainScreen from './screens/mainscreen';
import OrderListScreen from './screens/sell/order/OrderListScreen';
import OrderEditForm from './screens/sell/order/OrderEdit';
import BuyOrderListScreen from './screens/buy/order/BuyOrderListScreen';
import BuyOrderDetail from './screens/buy/order/BuyOrderDetail';
import UserListScreen from './screens/admin/User/UserListScreen';
import CategoryListScreen from './screens/admin/Category/CategoryListScreen';
import CategoryEdit from './screens/admin/Category/CategoryEdit';
import AllOrdersListScreen from './screens/admin/Order/OrderListScreen';
import AllOrderEdit from './screens/admin/Order/OrderEdit';
import WalletListScreen from './screens/admin/Wallet/WalletListScreen';
import WalletEdit from './screens/admin/Wallet/WalletEdit';

import TestDataForm from './screens/TestDataForm'; //For Test
import { Provider } from "react-redux"
import store from "./js/store/index";
require('dotenv').config();
const routing = (
    <Provider store={store}>
        <Router>            
            <Route path="/" component={App} exact/>
            <Route path="/users/signin" component={SigninForm} />
            <Route path="/users/profile/:id" component={ProfileScreen} />
            <Route path="/users/signup" component={SignupForm} />
            <Route path="/users/verify" component={PhoneVerifyScreen} />
            <Route path="/users/viewprofile/:id" component={ViewProfile} />
            <Route path="/users/forgot" component={InputPhoneNumberScreen} />
            <Route path="/users/resetpass" component={ResetPassword} />
            <Route path="/main/" component={MainScreen} />
            <Route path="/buy/" component={BuyMainScreen} />                
            <Route path="/buy_cart_detail" component={CartDetailScreen} />
            <Route path="/sell" component={SellMainScreen} />
            <Route path="/products/edit/:id" component={ProductForm} />
            <Route path="/sell_orders" component={OrderListScreen} />
            <Route path="/order/edit/:id" component={OrderEditForm} />
            <Route path="/buy_orders" component={BuyOrderListScreen} />
            <Route path="/order/buy/detail/:id" component={BuyOrderDetail} /> 
            <Route path="/category" component={CategoryListScreen} /> 
            <Route path="/category_edit/:id" component={CategoryEdit} /> 
            <Route path="/orders" component={AllOrdersListScreen} /> 
            <Route path="/orders_edit/:id" component={AllOrderEdit} /> 
            <Route path="/admin/users" component={UserListScreen} /> 
            <Route path="/points" component={WalletListScreen} /> 
            <Route path="/points_edit/:id" component={WalletEdit} /> 
            <Route path="/add_test_data" component={TestDataForm} />            
        </Router>
    </Provider>
)
ReactDOM.render(routing, document.getElementById('root'));