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
import {resetPassword} from './../../../services/api/httpclient';
import {getData ,storeData} from './../../../utils/AppUtils';
import Navbar from './../../components/Navbar';
export default class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'',
            repeatPassword:'',
            userId:'',
            isLoading:false
        }
    }
    componentDidMount(){
        let userInfo = getData('userInfo').then((val) => {
            let userObject =JSON.parse(val);
            this.setState({userId:userObject._id});
        });
    }

    onClickListener = (viewId) => {       
        if (viewId === 'reset'){
            this.onResetPwd();
        } 
    }
    onResetPwd = () =>{
        if (!this.onValidation())
            return;
        this.setState({isLoading:true});
        let payload={
            "password": this.state.password,            
            "user_id" : this.state.userId
        }
        resetPassword(payload).then( ret => {
            this.setState({isLoading:false});
            if (ret){
                if (ret.status === 200){
                    if (ret.data.success === true){       
                        storeData('accessToken', ret.data.token);
                        storeData('userInfo' , JSON.stringify(ret.data.user));
                        storeData('isLoggedIn' , 'true');
                        this.props.navigation.navigate('Drawer');     
                  
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
        if (this.state.password === ""){
            alert("Please input password");
            return false;
        } else if (this.state.password !== this.state.repeatPassword){
            alert("Password mismatch.");
            return false;
        }
        return true;
    }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="arrow-left" size={22} onPress ={() => this.props.navigation.goBack()}></Icon>
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
                <Navbar left={left} title="ResetPassword" />    
                <View style={styles.subContainer}>     
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="New Password"
                                secureTextEntry={true}
                                underlineColorAndroid='transparent'
                                onChangeText={(password) => this.setState({password})}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Confirm Password"
                                secureTextEntry={true}
                                underlineColorAndroid='transparent'
                                onChangeText={(repeatPassword) => this.setState({repeatPassword})}/>
                    </View>
                    <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('reset')} >
                        <Text style={styles.loginText}>Reset</Text>
                    </TouchableHighlight>


                </View>
            </View>
        );
    }
}

