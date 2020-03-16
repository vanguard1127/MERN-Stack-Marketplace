import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    TextInput,
    Button,
    TouchableHighlight,
    Image,
    Alert,Dimensions,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Header , Left ,Title ,Right, Body} from 'native-base';
import {styles} from '../values/Styles';
import Colors from './../values/Colors';
const {width, height} = Dimensions.get('window');
import {verify_code} from './../../../services/api/httpclient';
import {getData ,storeData} from './../../../utils/AppUtils';
import Navbar from './../../components/Navbar';
export default class VerifyView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code:'',
            user_id:'',
            isLoading:false,
        }
    }
    componentDidMount(){
        let userInfo = getData('userInfo').then((val) => {
            let userObject =JSON.parse(val);
            this.setState({user_id:userObject._id});
        });
    }

    onClickListener = (viewId) => {       
        if (viewId === 'verify'){
            this.onVerify();
        } 
    }

    onVerify = () =>{
        if (!this.onValidation())
            return;
        this.setState({isLoading:true});
        verify_code({user_id:this.state.user_id , verify_code:this.state.code}).then( ret => {
            this.setState({isLoading:false});
            if (ret){
                if (ret.status === 200){
                    if (ret.data.success === true){       
                        storeData('accessToken', ret.data.token);
                        storeData('userInfo' , JSON.stringify(ret.data.user));
                        let cart = {};
                        storeData('cart' , JSON.stringify(cart));
                        const type = this.props.navigation.getParam('type');
                        console.log('Type = ' + type)
                        if (type === 'forgot'){
                            storeData('isLoggedIn', "false");
                            this.props.navigation.replace('ResetPwd');     
                        } else if (type === 'signup'){
                            storeData('isLoggedIn', "true");
                            this.props.navigation.replace('Drawer');     
                        }
                    } else {
                        alert(ret.data.error);
                    }
                } else {
                    alert(ret.data.error);
                }
            }
        } , err => {
            alert("Please check your network.");
            this.setState({isLoading:false});
            //alert(JSON.stringify(err));
        });
    }
    onValidation(){
        if (this.state.code === ""){
            alert("Please input verification code.");
            return false;
        }
        return true;
    }
    
    onClickGoBack = () => {
        const type = this.props.navigation.getParam('type');
        if (type === 'forgot'){
            storeData('isLoggedIn', "false");
            this.props.navigation.replace('InputPhone');     
        } else if (type === 'signup'){
            storeData('isLoggedIn', "true");
            this.props.navigation.replace('LoginView');     
        }
    }
    render() {
        var left =(
                <Left style={{flex:1}}>
                    <Icon name="arrow-left" size={22} onPress ={() => this.onClickGoBack()}></Icon>
                </Left>
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
                <Navbar left={left} title="Verify" />        
                <View style={styles.subContainer}>     
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/ios/50/000000/approval-filled.png'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Verify"
                                underlineColorAndroid='transparent'
                                onChangeText={(code) => this.setState({code})}/>
                    </View>
                    <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('verify')} >
                        <Text style={styles.loginText}>Verify</Text>
                    </TouchableHighlight>


                </View>
            </View>
        );
    }
}

