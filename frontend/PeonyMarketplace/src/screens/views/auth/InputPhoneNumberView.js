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
    Alert,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Header , Left ,Title ,Right, Body} from 'native-base';
import {styles} from './../values/Styles'
import Colors from './../values/Colors';
const {width, height} = Dimensions.get('window');
import {forgotPassword} from './../../../services/api/httpclient';
import {getData ,storeData} from './../../../utils/AppUtils';
import Navbar from './../../components/Navbar';
export default class InputPhoneNumberView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone_number:'',
            isLoading:false
        }
    }
    componentDidMount(){
    }

    onClickListener = (viewId) => {       
        if (viewId === 'confirm'){
            this.onForgotPwd();
        } 
    }

    onForgotPwd = () =>{
        if (!this.onValidation())
            return;
        this.setState({isLoading:true});
        forgotPassword({phone_number:this.state.phone_number}).then( ret => {
            this.setState({isLoading:false});
            if (ret){
                if (ret.status === 200){
                    if (ret.data.success === true){       
                        storeData('accessToken', ret.data.token);
                        storeData('userInfo' , JSON.stringify(ret.data.user));
                        storeData('isLoggedIn' , 'false');
                        this.props.navigation.replace('Verify',{
                            type:'forgot'
                        });     
                  
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
            alert("Please input phone number.");
            return false;
        }
        return true;
    }
    

    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="arrow-left" size={22} onPress ={() => this.props.navigation.replace('LoginView')}></Icon>
            </Left>
        )
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
                <Navbar left={left} title="InputPhoneNumberView" />    
                <View style={styles.subContainer}>     
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/metro/26/000000/phone.png'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Phone Number"
                                underlineColorAndroid='transparent'
                                onChangeText={(phone_number) => this.setState({phone_number})}/>
                    </View>
                    <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('confirm')} >
                        <Text style={styles.loginText}>Confirm</Text>
                    </TouchableHighlight>


                </View>
            </View>
        );
    }
}

