import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import NavDrawer from '../../../components/NavDrawer';
import {getUserWithPoints , updateUserPoints} from "../../../services/api/httpclient";

class WalletEdit extends React.Component {
    constructor(props){
        super(props);
        
        this.state={
            formData: {
                points:'',
                _id:'',
            },
            user_id :'',
            submitted: false,
            responseError : false,
            responseErrorText:'',

            wallet_id:'',
            title:'Edit Wallet',
            isAdd : false
        }
    }
    handleChange = (event) => {
        const { formData } = this.state;
        formData[event.target.name] = event.target.value;
        this.setState({ formData });
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    componentDidMount() {
        console.log("Edit Componenet Did moutn");
        this._isMounted = true;
        let id = this.props.match.params.id;
        if (id != -1 && this._isMounted){
            this.setState({user_id:id} , function(){
                this.onGetUser();
            });  
            this.setState({title:'Edit Wallet'});
        }        
        
    }
    onGetUser(){
        getUserWithPoints(this.state.user_id).then(ret =>{
            console.log("ret = " + JSON.stringify(ret));
            if (ret && this._isMounted)
            {                       
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    const { formData } = this.state;
                    formData.points = ret.data.user.points.points;     
                    formData._id = ret.data.user.points._id;                    
                    this.setState({ formData });
                    this.setState({user_id:ret.data.user_id});
                }
            }
        } , err=>{
            if (err.response.status === 300){                
                this.props.history.push('/users/signin');
            }
        });
    }
    render() {
        const { formData, submitted,responseError, responseErrorText } = this.state      
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title={this.state.title} history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>                            
                        <ValidatorForm
                                ref="form"
                                onSubmit={this.onUpdateWallet.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                            <TextValidator
                                label="Points"
                                onChange={this.handleChange}
                                name="points"
                                value={formData.points}
                                validators={['required','minNumber:0', 'maxNumber:99999999']}
                                errorMessages={['this field is required']}
                            />
                            <br/><br/>
                            

                            <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>

                            <RaisedButton label="Save" primary={true} style={style} type="submit"/>
                            <RaisedButton label="Cancel" primary={true} style={style} onClick={this.props.history.goBack}/>    
                        </ValidatorForm>                        
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }

    onUpdateWallet(event){
        this.setState({submitted :true}); 
        updateUserPoints({points:{_id:this.state.formData._id, points:this.state.formData.points}}).then(ret =>{
            if (ret)
            {      
                if (ret.data.success === true){
                    this.setState({responseErrorText : ''});                        
                    this.props.history.push('/points');   
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
}
const style = {
    margin: 15,
};

const hStyle = { color: 'red' };
export default WalletEdit;