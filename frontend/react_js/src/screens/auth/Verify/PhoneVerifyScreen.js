import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {verify_code} from "../../../services/api/httpclient";
import NavDrawer from './../../../components/NavDrawer'
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
class PhoneVerifyScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
                otp_code:'',
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',
            user_id:'',
        }
    }
    componentDidMount(){        
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));        
        if (userInfo)
        {
            this.setState({user_id : userInfo._id});
        }
        
       
    }
    render() {
        const { formData, submitted,responseError ,responseErrorText } = this.state;
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        
                        <NavDrawer title="Verify Code" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <ValidatorForm
                                ref="form"
                                onSubmit={this.Verify.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                            <TextValidator
                                label="Verify Phone Code"
                                onChange={this.handleChange}
                                name="otp_code"
                                value={formData.otp_code}
                                validators={['required' ]}
                                errorMessages={['this field is required']}
                            />
                            
                            <br/>
                            <RaisedButton label="Verify" primary={true} style={style} type="submit"/>

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
    Verify(event){        
        if (this.state.user_id)
        {
            this.setState({submitted :true});
            var payload = {
                user_id:this.state.user_id,
                verify_code: this.state.formData.otp_code
            };
            verify_code(payload).then(ret =>{
                if (ret)
                {     
                    if (ret.data.success === true){
                        this.setState({responseErrorText :''});
                        localStorage.setItem('accessToken', ret.data.token);
                        localStorage.setItem('userInfo' , JSON.stringify(ret.data.user)); 
                        var verifyType = localStorage.getItem('verifyType');
                        if (verifyType === "forgot")
                        {
                            localStorage.setItem('isLoggedIn' , false);
                            let cart = {};
                            localStorage.setItem('cart', JSON.stringify(cart));
                            this.props.history.push('/users/resetpass');
                        }
                        else if (verifyType === "signup")
                        {
                            localStorage.setItem('isLoggedIn' , true);
                            let cart = {};
                            localStorage.setItem('cart', JSON.stringify(cart));
                            this.props.history.push('/main');
                        }
                    }               
                   
                }
            } , err=>{
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error});
            });
        }
        
       
        
    }

}
const style = {
    margin: 15,
};
const hStyle = { color: 'red' };
export default PhoneVerifyScreen;