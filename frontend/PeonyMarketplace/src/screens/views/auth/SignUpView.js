import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    TextInput,
    Button,
    TouchableHighlight,Platform,
    Dimensions,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Header , Left ,Title ,Right, Body} from 'native-base';
import {styles} from './../values/Styles';
const {width, height} = Dimensions.get('window');
import Colors from './../values/Colors';
import {signup} from './../../../services/api/httpclient';
import {getData ,storeData} from './../../../utils/AppUtils';

export default class SignUpView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name:'',
            last_name:'',
            email:'',
            phone_number:'',
            password:'',
            isLoading:false,
            fcmToken:'',
        }
    }
    componentDidMount(){
        getData('fcmToken').then((ret) => {
            this.setState({fcmToken:ret});
            });
    }

    onClickListener = (viewId) => {       
        if (viewId === 'signup'){
            this.onSignup();
                   
        } 
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
            alert("Please input password.");
            return false;
        } else if (this.state.first_name === ""){
            alert("Please input first name.");
            return false;
        } else if (this.state.last_name === ""){
            alert("Please input last name.");
            return false;
        } else if (this.state.phone_number === ""){
            alert("Please input phone number.");
            return false;
        }
        return true;
    }
    onSignup = () =>  {
        if (!this.onValidation())
            return;
        this.setState({isLoading:true});
        let payload = {
            "first_name":this.state.first_name,
            "last_name":this.state.last_name,
            "email":this.state.email,
            "password":this.state.password,
            "phone_number": this.state.phone_number,
            "device_type": Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 1 : 2,
            "device_id" : this.state.fcmToken,
        }
        signup(payload).then( ret => {
            this.setState({isLoading:false});
            if (ret){
                if (ret.status === 200){
                    if (ret.data.success === true){                    
                        storeData('accessToken', ret.data.token);
                        storeData('userInfo' , JSON.stringify(ret.data.user));
                        storeData('isLoggedIn', "false");
                        let cart = {};
                        storeData('cart' , JSON.stringify(cart));
                        //TODO go to next page
                        this.props.navigation.replace('Verify', {
                            type:'signup'
                        }); 
                    }
                } else {
                    alert(ret.data.error);
                }
            }
        } , err => {
            alert("Please check your network.");
            this.setState({isLoading:false});
            alert(JSON.stringify(err));
        });
    }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="arrow-left" size={22} onPress ={() => this.props.navigation.goBack()}></Icon>
            </Left>
        );
        return (
            <View style={{flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#DCDCDC'}}>
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
                    <Left style={{flex:1}}>
                        <Icon name="arrow-left" size={22} onPress ={() => this.props.navigation.replace('LoginView')}></Icon>
                    </Left>
                    <Body style={{flex:1}}>
                    <Title style={{ alignSelf: "center" }}>Sign Up</Title>
                    </Body>
                    <Right style={{flex:1}}/>                   
                </Header>
 
                <View style={{height:40}}/>
                <View style={styles.subContainer}> 
                    <ScrollView style={styles.scroll}>    
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/ios/50/000000/name-filled.png'}}/>
                            <TextInput style={styles.inputs}
                                    placeholder="First Name"
                                    underlineColorAndroid='transparent'
                                    onChangeText={(first_name) => this.setState({first_name})}/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/ios/50/000000/employee-card-filled.png'}}/>
                            <TextInput style={styles.inputs}
                                    placeholder="Last Name"
                                    underlineColorAndroid='transparent'
                                    onChangeText={(last_name) => this.setState({last_name})}/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                            <TextInput style={styles.inputs}
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    underlineColorAndroid='transparent'
                                    onChangeText={(email) => this.setState({email})}/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/metro/26/000000/phone.png'}}/>
                            <TextInput style={styles.inputs}
                                    placeholder="Phone Number"
                                    underlineColorAndroid='transparent'
                                    onChangeText={(phone_number) => this.setState({phone_number})}/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                            <TextInput style={styles.inputs}
                                    placeholder="Password"                                    
                                    secureTextEntry={true}
                                    underlineColorAndroid='transparent'
                                    onChangeText={(password) => this.setState({password})}/>
                        </View>
                        <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('signup')} >
                            <Text style={styles.loginText}>SignUp</Text>
                        </TouchableHighlight>      
                    </ScrollView>             
                </View>                
            </View>
        );
    }
}

