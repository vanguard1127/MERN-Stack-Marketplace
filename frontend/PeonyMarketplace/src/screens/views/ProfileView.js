import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    Button,
    TouchableHighlight,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    Dimensions
} from 'react-native';
import {Icon as NativeIcon, Grid, Col} from 'native-base';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon,Card} from 'react-native-elements'
import {Header , Left ,Title ,Right, Body, Input,Item, Button as NativeButton} from 'native-base';
import Navbar from './../components/Navbar';
import {styles} from './values/Styles';
const {width }= Dimensions.get('window');
import stripe from 'tipsi-stripe';
import { getData, storeData } from './../../utils/AppUtils';
import { getUser , userUpdate,updateUserPoints, chargePoints, } from '../../services/api/httpclient';
import t from 'tcomb-form-native';
import AsyncImageAnimated from 'react-native-async-image-animated';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob'
import storage  from '../../services/firebase/index';
import { setUserData } from './../components/redux/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Colors from './values/Colors';
import { withNavigationFocus } from 'react-navigation';
const mapDispatchToProps = dispatch => (
    bindActionCreators({
      setUserData
    }, dispatch)
  );

const Form = t.form.Form;
const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
const Fetch = RNFetchBlob.polyfill.Fetch;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;
window.fetch = new Fetch({
  // enable this option so that the response data conversion handled automatically
  auto : true,
  // when receiving response data, the module will match its Content-Type header
  // with strings in this array. If it contains any one of string in this array, 
  // the response body will be considered as binary data and the data will be stored
  // in file system instead of in memory.
  // By default, it only store response data to file system when Content-Type 
  // contains string `application/octet`.
  binaryContentTypes : [
      'image/',
      'video/',
      'audio/',
      'foo/',
  ]
}).build()
class ProfileView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            value:{
            },
            user_id:'',
            sell_count:0,
            buy_count:0,
            photo:require('./../../../images/ic_emptyuser.jpg'),
            points:0,
            points_id:'',
            userType:'',
            isChangedPhoto:false,
            validateType: 'onFocus',

            userInfo:'',

            imageFile:null,
            stripe: true,
            center: {
                lat: 50,
                lng: 100
              },
            type:'',
            popupIsVisible:false,
            charge_amount:0,
            charge_amount_text:""
        }
     
    }
    componentDidMount(){        
        const type = this.props.navigation.getParam('type');
        if (type === 'anyProfile'){
            const id = this.props.navigation.getParam('id');
            this.setState({userType:type , user_id:id});
            console.log('id = ' +JSON.stringify(id));
            this.onGetUser(id);
        } else {
            getData('userInfo').then((ret) => {
                let userInfo = JSON.parse(ret);
                // this.setState({userInfo:userInfo});
                if (userInfo){
                    console.log('getData ret = ' + JSON.stringify(userInfo));
                    this.setState({user_id:userInfo._id} , () => this.onGetUser(userInfo._id));
                }
            });
        }
      
    }
    onUpdateWalletPoints(event){
        this.setState({isLoading:true});
        updateUserPoints({points:{_id:this.state.points_id, points:this.state.value.points}}).then(ret =>{
            this.setState({isLoading:false});
            if (ret)
            {     
                if (ret.status === 200){
                    if (ret.data.success === true){
                        this.onUploadedPhoto(); 
                    }
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.navigate('Home');
                } else {
                    alert(ret.data.error);
                }
            }  
        } , err=>{
            this.setState({isLoading:false});
            alert('Please check your network connection;')
        });
    }
    uploadImage = (uri, index,  mime="image/jpg") => {
        return new Promise((resolve , reject) => {
            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://','') : uri;
            let user_id = this.state.user_id;
            let uploadBlob = null;
            var timeStamp = Math.floor(Date.now());             
            let refPath = 'marketplace/' + user_id+'/images/photo/' + timeStamp + "_photo" + "_" + index;
            const imageRef = storage.ref(refPath);
            fs.readFile(uploadUri ,'base64').then((data) =>{
            return Blob.build(data , {type:`${mime};BASE64`});
            }).then((blob) =>{
            uploadBlob = blob;
            return imageRef.put(blob, {contentType:mime});
            }).then(()=>{
            uploadBlob.close();
            return imageRef.getDownloadURL();
            }).then((url) => {
                console.log("Success to upload to firebase" + url)
                resolve({url:url});
            }).catch((error) =>{
            reject(error);
            console.log(JSON.stringify(error))
            });
        });
    }
    onUploadedPhoto(){
        console.log('onUploadedPhoto');
        this.setState({isLoading:true});
        if (!this.state.isChangedPhoto){
            this.onUpdateProfile();
            return;
        }
        console.log('start uploading');
        let index = 0;
        let mime="image/jpg";
        let uri = this.state.photo.uri;
        console.log("Photo Uri = " + uri)
        console.log("Photo Uri = " + this.state.photo)
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://','') : uri;
        //const uploadUri = Platform.OS === 'ios' ? uri.replace('file://','') : this.state.photo;
        let user_id = this.state.user_id;
        let uploadBlob = null;
        var timeStamp = Math.floor(Date.now());             
        let refPath = 'marketplace/' + user_id+'/images/photo/' + timeStamp + "_photo" + "_" + index;
        const imageRef = storage.ref(refPath);
        fs.readFile(uploadUri ,'base64').then((data) =>{
            console.log('1');
            return Blob.build(data , {type:`${mime};BASE64`});
        }).then((blob) =>{
            console.log('2');
            uploadBlob = blob;
            return imageRef.put(blob, {contentType:mime});
        }).then(()=>{
            console.log('3');
            uploadBlob.close();
            return imageRef.getDownloadURL();
        }).then((url) => {
            console.log('Url = ' + url);
            this.setState({photo:{uri:url}} , () => this.onUpdateProfile());
            //resolve({url:url});
        }).catch((error) =>{
            console.log('error = ' + JSON.stringify(error));
            alert("Failed to upload profile image to firebase. Try again.")
            this.setState({isLoading:false});
            //reject(error);
        });
    }
    onUpdateProfile(){
        console.log('UpdateProfile ');
        this.setState({isLoading:true});        
        let payload = {
            first_name:this.state.value.first_name,
            last_name:this.state.value.last_name,
            email:this.state.value.email,
            phone_number:this.state.value.phone_number,
            country_state_province:this.state.value.country_state_province,
            address_line1:this.state.value.address_line1,
            address_line2:this.state.value.address_line2,
            geo_lng:this.state.center.lng,
            geo_lat:this.state.center.lat,      
            photo:this.state.photo.uri,
            _id:this.state.user_id,
        };
        userUpdate(payload).then(ret =>{
            console.log('ret = ' + JSON.stringify(ret));
            this.setState({isLoading:false});
            if (ret)
            {      
                if (ret.status ===  200){
                    if (ret.data.success === true){
                        if (this.state.userType !== 'anyProfile'){
                            storeData('userInfo',JSON.stringify(ret.data.user));
                            console.log(JSON.stringify(ret.data.user))
                            this.props.setUserData({photo:{uri:ret.data.user.photo}, email:ret.data.user.email , user_type: ret.data.user.user_type});
                        }
                        this.props.navigation.goBack();
                    }
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.navigate('LoginView');      
                }  else {
                    alert(ret.data.error);
                }              
                
            }
        } , err=>{
            alert("Please check your network connection.");
            this.setState({isLoading:false});
        });

    }
    onGetUser(userId){
        console.log('GetUser = ' + userId)
        this.setState({isLoading:true});
        getUser(userId).then(ret =>{
            this.setState({isLoading:false});
            console.log('ret = ' + JSON.stringify(ret));
            if (ret)
            {      
                if (ret.status ===  200){
                    if (ret.data.success === true){
                        let formData = this.state.value;
                        formData['points'] = ret.data.user.points.points.toString();
                        formData['sold_count'] = ret.data.sell.toString();
                        formData['bought_count'] = ret.data.buy.toString();
                        formData['first_name'] = ret.data.user.first_name;
                        formData['last_name'] = ret.data.user.last_name;
                        formData['email'] = ret.data.user.email;
                        formData['phone_number'] = ret.data.user.phone_number;
                        formData['country'] = ret.data.user.country;
                        formData['country_state_province'] = ret.data.user.country_state_province;
                        formData['city'] = ret.data.user.city;
                        formData['address_line1'] = ret.data.user.address_line1;
                        formData['address_line2'] = ret.data.user.address_line2;
                        let pos_lat_str = ret.data.user.geo_lat ==="" ? "0" : ret.data.user.geo_lat;
                        let pos_lng_str = ret.data.user.geo_lng === "" ? "0" : ret.data.user.geo_lng;
                        let pos_str = pos_lat_str + " ," +  pos_lng_str
                        formData['position'] = pos_str;
                        this.setState({ value : formData} , () => console.log(JSON.stringify(this.state.value)));
                        if (ret.data.user.photo !== ''){
                            this.setState({photo:{uri:ret.data.user.photo}});    
                        } else {
                            this.setState({photo:require('./../../../images/ic_emptyuser.jpg')});
                        }

                        this.setState({points_id:ret.data.user.points._id});
                    }
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.navigate('LoginView');      
                }  else {
                    alert(ret.data.error);
                }              
                
            }
        } , err=>{
            alert("Please check your network connection.");
            // this.setState({isLoading:false});
        });
    }



    onChange(value) {
        // alert(JSON.stringify(value));
        this.setState({value:value});
    }
    onPress = () => {
        console.log(this.props)
        this.props.navigation.toggleDrawer();
    }

    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <AntDesignIcon name="profile" size={22} color={tintColor} />
            
        )
    }
    handleSubmit = () => {
        const value = this._form.getValue(); // use that ref to get the form value
        console.log('value: ', value);
      }

    
    onClickListener = (viewId) => {   
        if (viewId === 'photo'){
            const options = {
                title: 'Select Photo',
                storageOptions: {
                skipBackup: true,
                path: 'images',
                },
            };
            ImagePicker.showImagePicker(options, (response) => {
                console.log('Response = ', response);
                if (response.didCancel) {
                console.log('User cancelled image picker');
                } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                } else {
                    const source = { uri: response.uri };
                    this.setState({photo:source});
                    this.setState({isChangedPhoto:true});
                }
            });        
        } else if (viewId === 'update'){
            // this.onUploadedPhoto();
            this.onUpdateWalletPoints();
        }
    }
    onImageError(error){
        console.log('onImageError');
        this.setState({photo:require('./../../../images/ic_emptyuser.jpg')});
    }

    chargeWithStripe(){
        if (this.state.charge_amount < 1){
          alert('Please input charge amount larger than 1');
          return;
        }
        if (this.state.stripe){
          return stripe
          .paymentRequestWithCardForm()
          .then(stripeTokenInfo => {
              this.onChargeWithStripeCard(this.state.total_price,stripeTokenInfo.tokenId);
          })
          .catch(error => {
              alert("Failed to get stripe token.");
          });
        } else if (this.state.points){
          //TODO
        }
      }
      onChargeWithStripeCard = (amount, tokenId ,accessToken) => {
        if (this.state.charge_amount < 1){
          alert('Please input more than 1.');
          return false;
        }
        this.setState({isLoading:true});
        let body = {
          amount:this.state.charge_amount * 100,
          currency:'usd', //For test now      
          stripe_token:tokenId,      
          transaction_type:0, // 0 : stripe ,1 : paypal
        }
    
        chargePoints(body).then( ret => {
            this.setState({isLoading:false});
            console.log("ret = " + JSON.stringify(ret));
            if (ret){
                if (ret.status === 200){
                    console.log('status = 200')
                    let amounts = ret.data.point.points;
                    this.state.charge_amount = "";
                    this.state.charge_amount_text="";
                    points = this.state.points + amounts;
                    this.setState({points});
                    alert('Charge Points '+ this.state.amounts + ' successfully. Your points is ' + amounts);
                    
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.replace('LoginView');
                } else {
                  alert(ret.data.error);
                }
            } else {
              alert(ret.data.error);
            }
        } , err => {
              this.setState({isLoading:false});
              alert('Please check your network connection.');
        });
      }
    render() {
        const User = t.struct({
            'points' : t.String,
            'sold_count':t.String,
            'bought_count':t.String,
            'first_name': t.String,
            'last_name': t.String,
            'email': t.String,
            'phone_number': t.String,
            'country': t.String,
            'country_state_province': t.String,
            'city': t.String,
            'address_line1': t.String,
            'address_line2': t.String,
            'position': t.String,
          });
        
          const options = {
                fields:{
                    points:{
                        editable:this.state.userType === 'anyProfile' ? true : false,
                    },
                    sold_count:{
                        label:"Sold Count",
                        editable:false,
                    },
                    bought_count:{
                        label:"Bought Count",
                        editable:false,
                    },
                    first_name:{
                        label:"First Name"
                    },
                    last_name:{
                        label:"Last Name"
                    },
                    email:{
                        label:"Email"
                    },
                    phone_number:{
                        label:"Phone Number"
                    },
                    country:{
                        label:"Country"
                    },
                    country_state_province:{
                        label:"County/State/Province"
                    },
                    city:{
                        label:"City"
                    },
                    address_line1:{
                        label:"Address Line1"
                    },
                    address_line2:{
                        label:"Address Line2"
                    },
                    position:{
                        label:"Position"
                    }
                    

                }
          };

        var left = (
            <Left style={{flex:1}}>
                {
                    this.state.userType === 'anyProfile' ? 
                        <NativeIcon name="ios-arrow-back" onPress ={() => this.props.navigation.goBack()}></NativeIcon>
                    :
                    <Icon name="menu" onPress ={() => this.props.navigation.openDrawer()}></Icon>
                }
            </Left>
          );
        return (
            <View style={styles.container}>
           
                <Navbar left={left} title="Profile" />                
                <View style={styles.subContainer}>
                    <View style={{height:120 ,  alignItems:'center',justifyContent:'center'}}>      
                        <AsyncImageAnimated
                            source={this.state.photo}
                            placeholderSource={require('./../../../images/ic_emptyuser.jpg')}
                            style={{
                                height: 120,
                                width: 120,
                                borderRadius:60,
                            }}
                        />
                    </View>
                    <View style={{height:50 ,  alignItems:'center',justifyContent:'center'}}>      
                        <Grid>
                            <Col size={3}>
                            </Col>
                            <Col style={{ alignItems: 'center' }}>
                                <View style={{ alignItems: 'center' }}>
                                <TouchableHighlight style={[{height:45,
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            marginBottom:20,
                                                            width:100,
                                                            borderRadius:30}, 
                                                styles.normalButton]} 
                                                onPress={()=>this.onClickListener('photo')} >
                                    <Text style={styles.loginText}>Photo</Text>
                                </TouchableHighlight>
                            </View> 
                            </Col>
                        </Grid>
                    </View>
                    

                    <ScrollView style={{width:width ,margin:10 , paddingLeft:10 , paddingRight:10}}>
                        {
                            this.state.userType !== 'anyProfile' &&
                            <View style={{paddingLeft: 20,paddingRight: 20}}> 
                                <Item regular style={{marginTop: 7}}>
                                    <Input placeholder='Input Charge Amount' 
                                    keyboardType={'numeric'} 
                                    onChangeText={(text) => this.setState({charge_amount: text})} 
                                    value={this.state.charge_amount}
                                    placeholderTextColor="#687373" />
                                </Item>
                                <View style={{marginTop: 10, marginBottom: 10, paddingBottom: 7}}>
                                    <NativeButton onPress={() => this.chargeWithStripe()} style={{backgroundColor: Colors.navbarBackgroundColor}} block iconLeft disabled={this.state.isPaymentPending}>
                                        <NativeIcon name='ios-card' />
                                        <Text style={{color: '#fdfdfd'}}>Charge With Stripe</Text>
                                    </NativeButton>
                                </View>
                            </View>
                        }
                        <Form 
                        ref='form'
                        type={User} 
                        options={options}
                        value={this.state.value}
                        onChange={this.onChange.bind(this)}
                        />
                        <View style={{flexDirection:'row', alignItems:'center' , justifyContent:'center'}}>
                            <TouchableHighlight style={[styles.buttonContainer, styles.normalButton , {width:width * 0.4}]} onPress={() => this.onClickListener('update')} >
                                <Text style={styles.loginText}>Update</Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={[styles.buttonContainer, styles.normalButton , {width:width * 0.4}]} onPress={() => this.onClickListener('Set Location')} >
                                <Text style={styles.loginText}>Set Location</Text>
                            </TouchableHighlight>
                        </View>
                    </ScrollView>                    
                </View> 
                {
                    this.state.isLoading == true && 
                    <View style={styles.loading}>
                        <View style={styles.loaderView}>
                            <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                            <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                        </View>
                    </View>
                }
        </View>
        );
    }
}

export default connect(null,mapDispatchToProps)(withNavigationFocus(ProfileView));