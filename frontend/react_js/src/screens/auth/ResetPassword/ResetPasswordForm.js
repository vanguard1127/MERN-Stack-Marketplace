import React from 'react';
import Button from '@material-ui/core/Button';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {resetPassword} from "../../../services/api/httpclient";
import NavDrawer from '../../../components/NavDrawer'
import RaisedButton from 'material-ui/RaisedButton';

class ResetPasswordForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {
                password: '',
                repeatPassword: '',
                userId:'',
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',
        }
    }

    componentDidMount() {
        // custom rule will have name 'isPasswordMatch'
        ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
            if (value !== this.state.user.password) {
                return false;
            }
            return true;
        });
        
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));        
        if (userInfo)
        {
            this.state.user.userId = userInfo._id;    
        }

    }
 
    handleChange = (event) => {
        const { user } = this.state;
        user[event.target.name] = event.target.value;
        this.setState({ user });
    }
    
    onResetPassword = (event) => {
        var payload={
            "password": this.state.user.password,            
            "user_id" : this.state.user.userId
        }
        this.setState({submitted :true});  
        resetPassword(payload).then(ret =>{                
                if (ret)
                {    
                    if (ret.data.success === true){
                        this.setState({responseErrorText : ''});
                        localStorage.setItem('accessToken', ret.data.token);
                        localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));
                        localStorage.setItem('isLoggedIn' , true);
                        this.props.history.push('/main/'); 
                    }  
                                     
                }               
                
            } , err=>{
                if (err.response.status === 300){
                    this.props.history.push('/users/signin');
                }
                var errorData = err.response.data;                
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error});

            });
    }
 
    render() {
        const { user , submitted,responseError ,responseErrorText} = this.state;
        return (
            <MuiThemeProvider>
                <div>
                    <NavDrawer title="Password Reset" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>
                            <ValidatorForm ref="form"
                                onSubmit={this.onResetPassword.bind(this)}
                            >
                                <TextValidator
                                    label="Password"
                                    onChange={this.handleChange}
                                    name="password"
                                    type="password"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    value={user.password}
                                />
                                <br/>
                                <TextValidator
                                    label="Repeat password"
                                    onChange={this.handleChange}
                                    name="repeatPassword"
                                    type="password"
                                    validators={['isPasswordMatch', 'required']}
                                    errorMessages={['password mismatch', 'this field is required']}
                                    value={user.repeatPassword}
                                />
                                <br/>                                
                                <RaisedButton label="Reset" primary={true} style={style} type="submit"/>

                                <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                            </ValidatorForm>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

const style = {
    margin: 15,
};
const hStyle = { color: 'red' };
export default ResetPasswordForm;