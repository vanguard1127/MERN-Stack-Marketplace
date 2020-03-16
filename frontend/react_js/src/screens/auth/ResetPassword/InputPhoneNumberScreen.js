import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {forgotPassword} from "../../../services/api/httpclient";
import NavDrawer from '../../../components/NavDrawer'
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
class InputPhoneNumberScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{                
                phone_number:'',
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',
        }
    }
    componentDidMount(){
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo)
        {
            this.state.created_user_id = userInfo._id;       
        }
        
       
    }
    render() {
        const { formData, submitted,responseError ,responseErrorText } = this.state;
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        
                        <NavDrawer title="Input Phone Number" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <ValidatorForm
                                ref="form"
                                onSubmit={this.inputPhoneNumber.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                            <TextValidator
                                label="Input Phone Number"
                                onChange={this.handleChange}
                                name="phone_number"
                                value={formData.phone_number}
                                validators={['required' ]}
                                errorMessages={['this field is required']}
                            />
                            
                            <br/>
                            <RaisedButton label="Confirm" primary={true} style={style} type="submit"/>

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
    inputPhoneNumber(event){        
        forgotPassword(this.state.formData).then(ret =>{                  
            this.setState({submitted :true});           
            if (ret)
            {
                 if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));
                    localStorage.setItem('isLoggedIn' , false);
                    localStorage.setItem('verifyType' , "forgot");
                    this.props.history.push({
                        pathname:'/users/verify',                    
                    });
                }
                
            }
        } , err=>{
            console.log("Forgot = err" + JSON.stringify(err));
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
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
export default InputPhoneNumberScreen;