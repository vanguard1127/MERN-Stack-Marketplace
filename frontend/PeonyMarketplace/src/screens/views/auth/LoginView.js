import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    TextInput,
    Button,
    Dimensions,
    TouchableHighlight,Platform,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from 'react-native-google-signin';

import { LoginButton, AccessToken, LoginManager,ShareApi,GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import {getData ,storeData} from './../../../utils/AppUtils';
import {login,social_sign , update} from './../../../services/api/httpclient';
import config from './../../../config/config';
import {Header , Title} from 'native-base';
const {width, height} = Dimensions.get('window');
import {Left, Icon, Right} from 'native-base'
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Colors from './../values/Colors';

export default class LoginView extends Component {
      
    constructor(props) {
        super(props);
        this.state = {
            email   : "",
            password: "",
            isLoading:false,
            fcmToken:'',
        }
    }

    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <AntDesignIcon name="logout" size={22} color={tintColor} />
        )
    }

    componentDidMount(){
        let cart ={};
        storeData('cart', JSON.stringify(cart));
        storeData('isLoggedIn' , "false");

        getData('fcmToken').then(ret => {
            this.setState({fcmToken:ret});
        });
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
            webClientId: config.webClientId, // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
            hostedDomain: '', // specifies a hosted domain restriction
            loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
            forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
            accountName: '', // [Android] specifies an account name on the device that should be used
            iosClientId: config.iOSClientId, // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
          });
    }
    onValidation(){
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let email = this.state.email;
        let password = this.state.password;
        if (email === ""){
            alert("Please input email.");
            return false;
        } else if (reg.test(email) === false){
            alert("Please input email correctly.");
            return false;
        } else if (password === ""){
            alert("Please input password");
            return false;
        }
        return true;
    }
    onClickListener = (viewId) => {       
        if (viewId === 'login'){            
           this.onLogin();
        } else if (viewId == 'Forgot_password'){
            this.props.navigation.replace('InputPhone');
        } else if (viewId == 'SignUp'){
            this.props.navigation.replace('SignUp');
        }
    }

    // onSuccess =(ret) => {
    //     return new Promise((resolve,reject) => {
    //         await storeData('accessToken', ret.data.token);                        
    //         await storeData('userInfo', JSON.stringify(ret.data.user));                        
    //         await storeData('isLoggedIn', "true");
    //         let cart = {};
    //         await storeData('cart', JSON.stringify(cart));
    //         resolve('true');
    //     });
    // }
    async onSuccess(ret){
        await storeData('accessToken', ret.data.token);                        
        await storeData('userInfo', JSON.stringify(ret.data.user));                        
        await storeData('isLoggedIn', "true");
        let cart = {};
        await storeData('cart', JSON.stringify(cart));
        return true;
    }
    onLogin = event => { 
        if (!this.onValidation())      
            return;
        let device_type = Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 1 : 2;
        let payload = {email:this.state.email, password:this.state.password , device_type:device_type , device_id:this.state.fcmToken};
        this.setState({isLoading:true});
        login(payload).then((ret) => {
            if (ret) {
                let status = ret.status;
                if (status === 200) {
                    if (ret.data.success === true) {
                        this.onSuccess(ret).then((ret) =>{
                            this.setState({ isLoading: false });
                            this.props.navigation.replace('Drawer');
                        });
                    }
                } else if (status === 300) {
                    this.setState({ isLoading: false });
                    //TODO return to login                    
                } else {
                    this.setState({ isLoading: false });
                    alert(ret.data.error);
                }

            }
        }, err => {
            alert("Please check your network.");
            this.setState({ isLoading: false });
        });
    }

    onSocialLogin = payload => {
        this.setState({isLoading:true});
        social_sign(payload).then(ret =>{                       
            this.setState({isLoading:false});
            if (ret)
            {
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){                    
                        if (ret.data.success === true) {
                            this.onSuccess(ret).then((ret) =>{
                                this.setState({ isLoading: false });
                                this.props.navigation.replace('Drawer');
                            });
                        }
                    }
                } else{
                    alert(ret.data.error);
                }  
                
            }
        } , err=>{
            alert("Please check your network.");
            this.setState({isLoading:false});
        });
    }

    onGoogleSignIn = async () => {
        console.warn("Google Login");
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          this.setState({ userInfo });          
          let device_type = Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 1 : 2;
          let payload = {
              "first_name":userInfo.user.givenName,
              "last_name":userInfo.user.familyName,
              "social_type":2,
              "email":userInfo.user.email,
              "phone_number":"",
              "photo":"",
              "google_id":userInfo.id,
              "device_type":device_type , 
              "device_id":this.state.fcmToken
          }
          this.onSocialLogin(payload);
        } catch (error) {            
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {            
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {            
            // operation (f.e. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {            
            // play services not available or outdated
          } else {
            // some other error happened
          }
        }
    };
    
    
    
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="arrow-left" size={22} onPress ={() => this.props.navigation.goBack()}></Icon>
            </Left>
        );
        var right = (
            <Right style={{flex:1}}>
                    <View style={styles.cartContainer}>
                        <AntDesignIcon name="shoppingcart" size={40} onPress ={() => this.props.navigation.navigate('OrderCart')}/>                        
                    </View>
            </Right>
          );
        return (
            <View style={styles.container}>
            {
                this.state.isLoading == true &&
                <View style={styles.loading}>
                    <View style={styles.loaderView}>
                        <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                        <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                    </View>
                </View>
            }
            <Header style={{width:width,flowDirection:'row',alignItems:'center',backgroundColor: Colors.navbarBackgroundColor}}
                backgroundColor={Colors.navbarBackgroundColor}
                androidStatusBarColor={Colors.statusBarColor}
                noShadow={true}
            >
                <Title>SignIn</Title>
            </Header>

            <View style={{height:40}}/>
            <ScrollView style={styles.scroll}>
            <View style={styles.container}>
                <View style={{margin:7}} />
                <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                    <TextInput style={styles.inputs}
                               placeholder="Email"
                               keyboardType="email-address"
                               value={this.state.email}
                               underlineColorAndroid='transparent'
                               onChangeText={(email) => this.setState({email})}/>
                </View>


                <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                    <TextInput style={styles.inputs}
                               placeholder="Password"
                               secureTextEntry={true}
                               value={this.state.password}
                               underlineColorAndroid='transparent'
                               onChangeText={(password) => this.setState({password})}/>
                </View>

                <TouchableHighlight style={styles.buttonContainer} onPress={() => this.onClickListener('Forgot_password')}>
                    <Text>Forgot your password?</Text>
                </TouchableHighlight>

                <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('login')} >
                    <Text style={styles.loginText}>Login</Text>
                </TouchableHighlight>

                <GoogleSigninButton
                    style={styles.buttonContainer}
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Light}
                    onPress={this.onGoogleSignIn}
                    disabled={this.state.isSigninInProgress}
                />
                <LoginButton
                    style={styles.buttonContainer}
                        onLoginFinished={
                            (error, result) => {                                
                            if (error) {
                                console.log("login has error: " + result.error);
                            } else if (result.isCancelled) {
                                console.log("login is cancelled.");
                            } else {
                                console.log('Login button ' + JSON.stringify(result));
                                AccessToken.getCurrentAccessToken().then(
                                    (data) => {
                                        let accessToken = data.accessToken;                                        
                                        console.log(data.accessToken.toString())
                                        _responseInfoCallback = (error, result) => {
                                            if (error) {
                                            console.log('Error fetching data: ' + JSON.stringify(error));
                                            } else {
                                            console.log('Success fetching data: ' + JSON.stringify(result));
                                            let device_type = Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 1 : 2;
                                                let payload = {
                                                    "first_name":result.first_name,
                                                    "last_name":result.last_name,
                                                    "social_type":1,
                                                    "email":result.email,
                                                    "phone_number":"",
                                                    "photo":"",
                                                    "facebook_id":result.id,
                                                    "device_type":device_type , 
                                                    "device_id":this.state.fcmToken
                                                }
                                                this.onSocialLogin(payload);
                                            }
                                        }
                                        const infoRequest = new GraphRequest(
                                            '/me',
                                            {
                                            accessToken: accessToken,
                                            parameters: {
                                                fields: {
                                                string: 'email,name,first_name,middle_name,last_name'
                                                }
                                            }
                                            },
                                            _responseInfoCallback
                                        );
                                        new GraphRequestManager().addRequest(infoRequest).start()
                                        
                                    }
                                )
                                
                                }
                            }
                        }
                        onLogoutFinished={() => console.log("logout.")}/>   
                

                <TouchableHighlight style={[styles.buttonContainer]} onPress={() => this.onClickListener('SignUp')} >
                    <Text>Sign Up</Text>
                </TouchableHighlight>
                </View>                
            </ScrollView>
            </View>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
    },
    scroll:{
        width:'100%'
    },

    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        width:250,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center'
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
    },
    inputIcon:{
        width:30,
        height:30,
        marginLeft:15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width:250,
        borderRadius:30,
    },
   
    normalButton: {
        backgroundColor: Colors.navbarBackgroundColor,
    },
    loginText: {
        color: 'white',
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#777',
        opacity:0.9,
        zIndex:999999999999999999
  },
  loaderView: {
        //width:scale(250),
        //height:verticalScale(60),
        backgroundColor:'#54C540',
        borderRadius:5,
        flexDirection:'row',
        alignItems:'center'
  },
  activityIndicator: {
        //margin:scale(15)
  },
  loadingText:{
        color:'#fff',
        //fontSize:scale(14),
  },

});