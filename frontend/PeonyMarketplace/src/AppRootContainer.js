import React, {Component , Children } from 'react';
import { StyleSheet,Dimensions , Alert , Platform} from 'react-native';
import HomeView from './screens/views/HomeView';
import AboutView from './screens/views/AboutView';
import ProfileView from './screens/views/ProfileView';
import MyProductsView from './screens/views/MyProductsView';
import MySellOrdersView from './screens/views/MySellOrdersView';
import MyBuyOrdersView from './screens/views/MyBuyOrdersView';

import LoginView from './screens/views/auth/LoginView';
import InputPhoneNumberView from './screens/views/auth/InputPhoneNumberView';
import ResetPasswordView from './screens/views/auth/ResetPasswordView';
import VerifyView from './screens/views/auth/VerifyView';
import SignUpView from "./screens/views/auth/SignUpView";
import OrderCartDetailView from './screens/views/cart/OrderCartDetailView';
import MyBuyOrderDetailView from './screens/views/order/MyBuyOrderDetailView';
import ProductView from './screens/views/product/ProductView';
import ProductEditView from './screens/views/product/ProductEditView';
import CheckoutView from './screens/views/cart/CheckoutView';
import MapView from './screens/views/MapView';
import MySellOrderDetailView from './screens/views/order/MySellOrderDetailView';
import ImageGalleryView from './screens/views/product/ImageGallery';
//admin views
import CategoriesView from './screens/views/admin/CategoriesView';
import CategoryEditView from './screens/views/admin/CategoryEditView';
import OrderDetailAdminView from './screens/views/admin/OrderDetailAdminView';
import OrdersView from './screens/views/admin/OrdersView';
import UsersView from './screens/views/admin/UsersView';
import { createDrawerNavigator, createStackNavigator, createAppContainer } from "react-navigation";
import NavDrawer from './screens/components/NavDrawer';
const {width, height} = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import { BackHandler } from 'react-native';
import { Root } from 'native-base';
import { Scene, Router, Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';

import {getData ,storeData} from './utils/AppUtils';
import {NotificationOpen , Notification} from 'react-native-firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavigationService from './NavigationService';
import { setUserData } from './screens/components/redux/actions';

const mapStateToProps = (state) => {
  const { user_type } = state
  return { user_type }
};
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setUserData
  }, dispatch)
);
class AppRootContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
        navigator:null,
    }
    image = require('./../images/ic_emptyuser.jpg');
    this.props.setUserData({photo:image, email:'', user_type: 0});
  }
  componentWillMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    // this.checkPermission();
    this.onNotification = this.onNotification.bind(this);

  }
  componentWillUnmount = () =>{
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    console.log('Back Pressed')
    Alert.alert(
      "Exit","Do you want to exit?",
      [
        {text:'YES', onPress:() => BackHandler.exitApp()},
        {text:'NO', }
      ],
      { cancelable: true},
    );
    return true;
  }

  onNotification(notification){
    console.log(notification);
    let order_id = notification.data.order_id;
    NavigationService.navigate('SellOrderDetail', { id: order_id });

   
  }
  componentDidMount(){

    this.checkPermission();
    this.createNotificationListeners(); //add this line
  }
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();

  }

  
  async createNotificationListeners(){
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      let order_id = notification.data.order_id;
      if (Platform.OS === 'android'){
        const notification1 = new firebase.notifications.Notification()
        .android.setChannelId('default-channel')
        .setNotificationId('1')
        .setTitle(title)
        .setBody(body)
        .setData({
          order_id: order_id,
        });
        firebase.notifications().displayNotification(notification1);

      } else if (Platform.OS === 'ios'){
        const notification1 = new firebase.notifications.Notification()
        .setNotificationId('notificationId')
        .setTitle(title)
        .setBody(body)
        .setData({
          order_id: order_id,
        });
        firebase.notifications().displayNotification(notification1);
      }
      
    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      console.log(notificationOpen.notification);
      this.onNotification(notificationOpen.notification);
      firebase.notifications().removeAllDeliveredNotifications();
    });

    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const notification = notificationOpen.notification;
      this.onNotification(notification);
      firebase.notifications().removeAllDeliveredNotifications();
    }
    
    this.messageListener = firebase.messaging().onMessage((message) => {
      console.log('message');
      console.log(JSON.stringify(message));
    });
  }
  showAlert(title, body){
    Alert.alert(
      title,body,
      [
        {text:'OK', onPress:() => console.log('Ok Pressed')}
      ],
      { cancelable: false},
    );
  }
  async checkPermission(){
    const enabled = await firebase.messaging().hasPermission();
    if (enabled){
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken(){
    let fcmToken;// = await getData('fcmToken');
    if (!fcmToken){
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken){
        await storeData('fcmToken' , fcmToken);
      }
    }
    console.log('fcm token ' + fcmToken);
  }

  async requestPermission(){
    try{
      await firebase.messaging.requestPermission();
    } catch (error){
      console.log('permisson rejected');
    }
  }


  render() {
    
    const DrawerNavigator = createDrawerNavigator(
      {
        Buy: {screen: HomeView},    
        Profile:ProfileView,
        MySellOrders:MySellOrdersView,
        MyProducts:MyProductsView,
        MyBuyOrders:MyBuyOrdersView,
        //Categories:CategoriesView,
        //Orders:OrdersView,
        //Users:UsersView,
        About:{screen:AboutView},    
        Logout:LoginView    
      },
      {
        initialRouteName: "Buy",
        drawerPosition:'left',
        drawerWidth:width * 0.7,
        contentOptions:{
          activeTintColor:'orange'
        },
        contentComponent: NavDrawer,
      }
    );

    const AdminDrawerNavigator = createDrawerNavigator(
      {
        Buy: {screen: HomeView},    
        Profile:ProfileView,
        MySellOrders:MySellOrdersView,
        MyProducts:MyProductsView,
        MyBuyOrders:MyBuyOrdersView,
        Categories:CategoriesView,
        Orders:OrdersView,
        Users:UsersView,
        About:{screen:AboutView},    
        Logout:LoginView    
      },
      {
        initialRouteName: "Buy",
        drawerPosition:'left',
        drawerWidth:width * 0.7,
        contentOptions:{
          activeTintColor:'orange'
        },
        contentComponent: NavDrawer,
      }
    );



    const PeonyApp = createStackNavigator({
      LoginView:  {screen:LoginView, navigationOptions: {header:null} },
      SignUp : {screen:SignUpView, navigationOptions: {header:null} },
      Verify:{screen:VerifyView, navigationOptions: {header:null} },
      InputPhone:{screen:InputPhoneNumberView, navigationOptions: {header:null} },
      ResetPwd:{screen:ResetPasswordView, navigationOptions: {header:null} },
      OrderCart:{screen:OrderCartDetailView, navigationOptions: {header:null} },
      OrderDetail:{screen:MyBuyOrderDetailView, navigationOptions: {header:null} },
      Product:{screen:ProductView, navigationOptions: {header:null} },
      Checkout:{screen:CheckoutView, navigationOptions: {header:null} },
      Map:{screen:MapView, navigationOptions: {header:null} },
      SellOrderDetail:{screen:MySellOrderDetailView, navigationOptions: {header:null} },
      ProductEdit:{screen:ProductEditView, navigationOptions: {header:null} },
      OrderDetailAdmin:{screen:OrderDetailAdminView, navigationOptions: {header:null} },
      CategoryEdit:{screen:CategoryEditView, navigationOptions: {header:null} },  
      AnyProfile:{screen:ProfileView, navigationOptions: {header:null} },  
      Gallery: {screen:ImageGalleryView, navigationOptions: {header:null} },
      Drawer: {
        screen:this.props.user_type === 1 ? AdminDrawerNavigator : DrawerNavigator , 
        navigationOptions: {header:null} }
      },      
      {
        // initialRouteName:'Map'
        initialRouteName:'Drawer'
      }
    );

    const PeonyAppContainer = createAppContainer(PeonyApp);
    return (
         <PeonyAppContainer ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}/>          
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppRootContainer);