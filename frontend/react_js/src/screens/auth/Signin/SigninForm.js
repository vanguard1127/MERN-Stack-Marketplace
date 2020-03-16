import React from 'react';
import { Route, Redirect } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton';
import FacebookLogin from 'react-facebook-login';
import NavDrawer from './../../../components/NavDrawer'
import GoogleLogin from 'react-google-login';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {login , social_sign} from '../../../services/api/httpclient';
import { Hidden } from '@material-ui/core';

class SigninForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            formData: {
                email: '',
                password: '',
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',
        }        
    }

    componentWillMount() {
        let cart = {};
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('isLoggedIn' , false);
    }

    render(){
        const { formData, submitted ,responseError , responseErrorText } = this.state;
        return (
            
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title = "Sign In" history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                            <ValidatorForm
                                ref="form"
                                onSubmit={this.onSignIn.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                                <TextValidator
                                    label="Email"
                                    onChange={this.handleChange}
                                    name="email"
                                    value={formData.email}
                                    validators={['required', 'isEmail']}
                                    errorMessages={['this field is required', 'email is not valid']}
                                /><br/>
                                <br/>
                                <TextValidator
                                    label="Password"
                                    onChange={this.handleChange}
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <br/>                                
                                <RaisedButton label="Sign In" primary={true} type="submit" style={style}/>
                                <RaisedButton label="ForgotPassword" primary={true} style={style} onClick={(event) => this.onForgotPassword(event)}/>
                                <br/>
                                <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                            </ValidatorForm>

                            <FacebookLogin
                                appId="657641268022639"
                                fields="name,email,picture"
                                callback={this.responseFacebook}
                            />
                            <GoogleLogin
                                clientId="116614831252-akoh84f33u7aemfr3549of2l5vrmjcgr.apps.googleusercontent.com"
                                buttonText="LOGIN WITH GOOGLE"
                                onSuccess={this.responseGoogle}
                                onFailure={this.responseGoogle}
                            />
                            <br/>
                            <RaisedButton label="Sign Up" primary={true} style={style} onClick={(event) => this.onSignup(event)}/>
                            
                            
                            
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
    
    handleChange = (event) => {
        const { formData } = this.state;
        formData[event.target.name] = event.target.value;
        this.setState({ formData });
    }
    handleSubmit = () => {
        this.setState({ submitted: true }, () => {
            setTimeout(() => this.setState({ submitted: false }), 5000);
        });
    }

    

    responseFacebook = (response) => {
        const tokenBlob = new Blob([JSON.stringify({access_token: response.accessToken}, null, 2)], {type : 'application/json'});
        var mResponseJson = JSON.stringify(response);
        if (response.id)
        {
            var nameList = response.name.split(' ');
            var first_name="" , last_name ="";
        
            if (nameList[0] !== undefined && nameList[0] !== "")
            {
                first_name = nameList[0];
            }
            if (nameList[1] !== undefined && nameList[1] !== "")
            {
                last_name = nameList[1];
            }
            
            var payload={
                "first_name": first_name,
                "last_name":last_name,
                "social_type":1,
                "email":response.email,
                "phone_number":"",
                "photo" : '',
                "facebook_id":response.id                  
                 
            }
            this.onSocialLogin(payload);
        }
        
        
      }
  
    responseGoogle = (response) => {
        
        const reponseJSON = JSON.stringify(response);

        if (response.googleId)
        {
            var payload={
                "first_name": response.profileObj.givenName,
                "last_name":response.profileObj.familyName,
                "social_type":2,
                "email":response.profileObj.email,
                "phone_number":"",
                "photo" : '',
                "google_id":response.googleId
            }
            this.onSocialLogin(payload);
        }   
     }
    onSignIn(event){     
        this.setState({submitted :true});                
        login(this.state.formData).then(ret =>{            
            if (ret)
            {
                if (ret.data.success === true){                    
                    this.setState({responseErrorText : ''});
                    localStorage.setItem('accessToken', ret.data.token);
                    localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));
                    localStorage.setItem('isLoggedIn' , true);
                    let cart = {};
                    localStorage.setItem('cart', JSON.stringify(cart));
                    this.props.history.push('/main');
                }
                
            }
            
        } , err=>{
            var errorData = err.response.data;            
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error});            
        });
    }
    onSocialLogin = (payload) =>{
        this.setState({submitted :true});
        social_sign(payload).then(ret =>{
                       
            if (ret)
            {
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    localStorage.setItem('accessToken', ret.data.token);
                    localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));
                    localStorage.setItem('isLoggedIn' , true);
                    this.props.history.push('/main');
                }
                
            }
        } , err=>{
            var errorData = err.response.data;
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error}); 
        });
    }

    onForgotPassword = (payload) =>{
        this.state.submitted = true;
        this.props.history.push('/users/forgot');
    }
    onSignup(event){        
        this.props.history.push('/users/signup');        
    }
}
const style = {
    margin: 15,
};

const hStyle = { color: 'red' };
export default SigninForm;