import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import NavDrawer from '../../../components/NavDrawer';
import {getCategory,createCategory,updateCategory} from "../../../services/api/httpclient";

class CategoryEdit extends React.Component {
    constructor(props){
        super(props);
        
        this.state={
            formData: {
                name:'',
                _id:'',
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',

            category_id:'',
            title:'Edit Category',
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
        this._isMounted = true;
        let id = this.props.match.params.id;
        if (id != -1 && this._isMounted){
            this.setState({category_id:id} , function(){
                this.onGetUser();
            });  
            this.setState({title:'Edit Category'});
            this.setState({isAdd:false});
        } else {
            this.setState({title:'Add Category'});
            this.setState({isAdd:true});
        }        
        
    }
    onGetUser(){
        getCategory(this.state.category_id).then(ret =>{
            if (ret && this._isMounted)
            {                       
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    const { formData } = this.state;
                    formData.name = ret.data.category.name;                    
                    formData._id = ret.data.category._id;                    
                    this.setState({ formData });
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
                                onSubmit={this.onUpdateCategory.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                            <TextValidator
                                label="Name"
                                onChange={this.handleChange}
                                name="name"
                                value={formData.name}
                                validators={['required']}
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

    onUpdateCategory(event){
        this.setState({submitted :true}); 
        if (this.state.isAdd){
            let payload = {name:this.state.formData.name};
            createCategory(payload).then(ret =>{
                if (ret)
                {      
                    if (ret.data.success === true){
                        this.setState({responseErrorText : ''});                        
                        this.props.history.push('/category');   
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
        } else {
            updateCategory(this.state.formData).then(ret =>{
                if (ret)
                {      
                    if (ret.data.success === true){
                        this.setState({responseErrorText : ''});                        
                        this.props.history.push('/category');   
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
}
const style = {
    margin: 15,
};

const hStyle = { color: 'red' };
export default CategoryEdit;