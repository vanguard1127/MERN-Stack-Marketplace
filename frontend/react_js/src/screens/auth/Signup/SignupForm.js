import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import NavDrawer from './../../../components/NavDrawer'
import {signup} from "../../../services/api/httpclient";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
class SignupForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            formData: {
                first_name:'',
                last_name:'',
                email:'',
                password:'',
                phone_number:'',                
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',
        } 
    }
    render() {
        const { formData, submitted,responseError} = this.state;
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        
                        <NavDrawer title = "Sign Up" history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <ValidatorForm
                                ref="form"
                                onSubmit={this.SignUp.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                            <TextValidator
                                label="First Name"
                                onChange={this.handleChange}
                                name="first_name"
                                value={formData.first_name}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Last Name"
                                onChange={this.handleChange}
                                name="last_name"
                                value={formData.last_name}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            
                            <br/><br/>
                            <TextValidator
                                label="Email"
                                onChange={this.handleChange}
                                name="email"
                                value={formData.email}
                                validators={['required', 'isEmail']}
                                errorMessages={['this field is required', 'email is not valid']}
                            />
                            <br/><br/>
                            <TextValidator
                                    label="Password"
                                    onChange={this.handleChange}
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            <br/><br/>
                            <TextValidator
                                label="Phone Number"
                                onChange={this.handleChange}
                                name="phone_number"
                                value={formData.phone_number}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            
                            <br/>

                            <RaisedButton label="Sign Up" type="submit" primary={true} style={style}/>
                            <br/>
                            <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                        </ValidatorForm>
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
    SignUp(event){
        var payload={
            "first_name": this.state.formData.first_name,
            "last_name":this.state.formData.last_name,
            "email":this.state.formData.email,
            "password":this.state.formData.password,
            "phone_number":this.state.formData.phone_number
        }    
        this.setState({submitted :true});     
        signup(payload).then(ret =>{
            
            if (ret)
            {      
                if (ret.data.success === true){
                    this.setState({responseErrorText : ''});
                    localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));
                    localStorage.setItem('isLoggedIn' , false);
                    this.props.history.push('/users/verify');
                    localStorage.setItem('verifyType' , "signup");     
                    this.props.history.push({
                        pathname:'/users/verify',
                        type: 'signup'
                    });  
                }
                           
            }               
              
        } , err=>{
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error}); 
        });
    }
}
const style = {
    margin: 15,
};

const hStyle = { color: 'red' };
export default SignupForm;