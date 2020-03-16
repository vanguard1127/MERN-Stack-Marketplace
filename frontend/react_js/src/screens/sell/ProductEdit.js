import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Button from '@material-ui/core/Button';
import NavDrawer from './../../components/NavDrawer'
import {getCategories , createProduct , updateProduct , getProduct} from "../../services/api/httpclient";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import storage  from '../../services/firebase/index';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import LoadingOverlay from 'react-loading-overlay';


class ProductForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            formData: {
                _id:'',
                category_id:'',
                user_id:'',
                name:'',
                description:'',
                price : '',
                price_unit:'',
                photos: [] ,                
                
            },
            title :'',
            submitted: false,
            responseError : false,
            responseErrorText:'',
            categories: [],
            category:'',
            imageFiles: [],
            uploaded_count : 0,
            failed_count : 0,
            image_count: 0,
            isAdd : true , 
            loading : false,
        } 
        this.onFileChange = this.onFileChange.bind(this);
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    componentWillMount(){   
        this._isMounted = true;
        let id = this.props.match.params.id;
        if (id != -1){
            this.onGetProduct(id);
            this.setState({isAdd:false});
            this.setState({title: "Product Edit"});
        } else {
            this.setState({isAdd:true});
            this.setState({title: "Product Add"});
        }
        
        let payload = {};
        getCategories(payload).then(ret =>{
            if (ret && this._isMounted)
            {    
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});  
                    this.setState({categories:ret.data.categories});  
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

    
    clearFormData(){
        var formData = {...this.state.formData};
        formData.id = '';
        formData.category_id= '';
        formData.user_id = '';
        formData.name ='';
        formData.description = '';
        formData.price = '';
        formData.price_unit = '';
        formData.photos =  [] ; 
        this.setState({
            formData : formData
        });
    }
    onAddImageDialogOpen(event){        
        this.refs.openDialog.click();
    }
    onSubmit(event){        
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let user_id = userInfo._id;
        
        if (user_id)
        {            
            var formData = {...this.state.formData};
            formData.user_id = user_id;
            this.setState({
                formData : formData
            });

            if (this.state.formData.category_id === ""){
                alert("Please Select a Category!");
                return;
            }
            if (this.state.imageFiles.length + this.state.formData.photos.length < 2){
                confirmAlert({
                    title: 'Too little images!',
                    message: 'Please Select 2 Images At least!.Do you want to add image now?',
                    buttons: [
                      {
                        label: 'Yes',
                        onClick: () => this.onAddImageDialogOpen()
                      },
                      {
                        label: 'No',                        
                      }
                    ]
                  });
                return;
            } 

            this.setState({uploaded_count : 0});
            this.setState({failed_count : 0});
            this.setState({loading : true}) ;
            this.setState({image_count : this.state.imageFiles.length} , function(){
                if (this.state.image_count === 0) {
                    if (this.state.isAdd === true){
                        this.onAddProduct();
                    } else if (this.state.isAdd === false){
                        this.onUpdateProduct();
                    }
                } else if (this.state.image_count > 0) {
                    for (var index = 0 ; index < this.state.imageFiles.length ; index++){
                        let image = this.state.imageFiles[index];                        
                        this.uploadImageAsPromise(image,index).then(ret =>{                        
                            let cnt = this.state.uploaded_count;
                            this.setState({uploaded_count : cnt + 1} , function(){
                                let photos = this.state.formData.photos;
                                photos.push({id: this.state.uploaded_count, src: ret.url});
                                var formData = {...this.state.formData};
                                formData.photos = photos;
                                this.setState({
                                    formData : formData
                                });
        
                                if (this.state.imageFiles.length === this.state.uploaded_count + this.state.failed_count){
                                    this.setState({imageFiles:[]} , function(){
                                        if (this.state.isAdd === true){
                                            this.onAddProduct();
                                        } else if (this.state.isAdd === false){
                                            this.onUpdateProduct();
                                        }
                                    });
                                    
                                    
                                }
                            });
                            
                        } , err=>{                        
                            let cnt = this.state.failed_count;
                            this.setState({failed_count : cnt + 1});
                        });
                    }
                }
                
            });
        }
    }
    uploadImageAsPromise(imageFile , index){
        return new Promise(function(resolve, reject){
            let userInfo = JSON.parse(localStorage.getItem('userInfo'));
            let user_id = userInfo._id;
            var timeStamp = Math.floor(Date.now()); 
            
            let refPath = 'marketplace/' + user_id+'/images/products/' + timeStamp + "_" + imageFile.name;
            const uploadTask = storage.ref(refPath).put(imageFile);
            uploadTask.on('state_changed',
                (snapshot) => {

                },
                (error) => {
                    reject(error);
                },
                () => {
                        storage.ref(refPath).getDownloadURL().then(url => {
                            let payload = {url : url};
                            resolve(payload);
                     });
                }
            );
        });
    }
    onGetProduct(id){
        getProduct(id).then(ret =>{            
            if (ret)
            {
                 if (ret.data.success === true){
                    this.setState({responseErrorText : ''});
                    this.setState({formData:ret.data.product});
                }
                
            }
            
        } , err=>{
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
            this.clearFormData();
            var errorData = err.response.data;            
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error});            
        });
    }
    onUpdateProduct(){
        this.setState({submitted :true});
        let payload = {
            _id:this.state.formData._id,
            user_id : this.state.formData.user_id,
            category_id : this.state.formData.category_id,
            name : this.state.formData.name,
            price : this.state.formData.price,
            price_unit : this.state.formData.price_unit,
            photos : this.state.formData.photos,
            description:this.state.formData.description
        }
        updateProduct(payload).then(ret =>{            
            if (ret)
            {
                if (ret.data.success === true){
                    this.setState({responseErrorText : ''});
                    this.props.history.push('/sell');
                    this.clearFormData();
                }
                
            }
            
        } , err=>{
            this.clearFormData();
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
            var errorData = err.response.data;            
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error});            
        });                
    }
    onAddProduct(updatedPhotos){
        this.setState({submitted :true});
        let payload = {
            user_id : this.state.formData.user_id,
            category_id : this.state.formData.category_id,
            name : this.state.formData.name,
            price : this.state.formData.price,
            price_unit : this.state.formData.price_unit,
            photos : this.state.formData.photos,
            description:this.state.formData.description
        }                
        createProduct(payload).then(ret =>{            
            if (ret)
            {
                this.setState({loading : false}) ;
                 if (ret.data.success === true){
                    this.setState({responseErrorText : ''});
                    if (updatedPhotos == true){

                    } else {
                        this.props.history.push('/sell');
                        this.clearFormData();
                    }
                    
                }
                
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
            
        } , err=>{
            this.clearFormData();
            var errorData = err.response.data;            
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error});            
        });
    }
    
    
    onFileChange = event =>{
        const mFiles = [...this.state.imageFiles];
        for (var i =0 ;i < event.target.files.length ; i++){            
            mFiles.push(event.target.files[i]);
        }
        this.setState({
            imageFiles : mFiles
        });
    }

    onRemoveImage (type , value) {
        if (type === 0){//not uploaded
            for (var i = 0 ; i < this.state.imageFiles.length ; i++){
                if (this.state.imageFiles[i] === value){                    
                    const imgFiles = [...this.state.imageFiles];
                    imgFiles.splice(i,1);
                    this.setState({
                        imageFiles:imgFiles
                    });
                    return;
                }
            }
            
        } else if (type === 1) {//uploaded
            storage.refFromURL(value.src).delete().then(ret=>{
                this.onRemovePhotos(value);
            } , err =>{
                this.onRemovePhotos(value);
            });
            

        }       
        
    }

    onRemovePhotos(value){
        for (var i = 0 ; i < this.state.formData.photos.length ; i++){
            if (this.state.formData.photos[i].src === value.src){                    
                const formData = {...this.state.formData};
                formData.photos.splice(i,1);                    
                this.setState({
                    formData:formData
                });
                return;
            }
        }
    }
    onCategoryChange = event =>{
        var formData = {...this.state.formData};
        formData.category_id = event.target.value;
        this.setState({
            formData : formData
        });
    }

    render() {
        const { formData, submitted,responseError,title } = this.state;
        const sideList = (
            <Grid item xs={12}>
                <div>Uploaded</div>
                <Grid container justify="center" spacing={Number(8)}>                    
                    {
                        this.state.formData.photos.map((photo , index ) =>(
                            <Grid key={index} item>
                                <Paper>
                                <img src={photo.src} width="150px" height="200px" margin="5px"/>
                                <br/>
                                <RaisedButton label="Remove" value={index}
                                primary={true} style={style} onClick={() => this.onRemoveImage(1 , photo)}/>              
                                </Paper>
                            </Grid>
                        ))
                    }                    
                </Grid>
                <div>New Photos</div>
                <Grid container justify="center" spacing={Number(8)}>                    
                    {this.state.imageFiles.map((image , index) => (
                    <Grid key={index} item>
                        <Paper>
                        <img src={URL.createObjectURL(image)} width="150px" height="200px" margin="5px"/>
                         <br/>
                         <RaisedButton label="Remove" value={index}
                         primary={true} style={style} onClick={() => this.onRemoveImage(0 , image)}/>              
                        </Paper>
                    </Grid>
                    ))}
                    
                </Grid>
            </Grid>
        );

        return (
            <div>
                <LoadingOverlay
                    active={this.state.loading}
                    spinner
                    text='Updating or Creating...'
                    >
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title= {title} history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={this.onSubmit.bind(this)}
                            onError={errors => console.log(errors)}
                            >
                            <FormControl style={{ width: '50%'}}>
                                <InputLabel htmlFor="category">Category</InputLabel>
                                    <Select
                                    value={this.state.formData.category_id}
                                    onChange={this.onCategoryChange}
                                    inputProps={{
                                        name: 'category',
                                        id: 'category',
                                    }}
                                    >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {
                                    this.state.categories.map(category => {
                                        return(
                                            <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                        );
                                    })   
                                }
                                </Select>
                            </FormControl>
                            <br/><br/>
                            <TextValidator
                                label="Name"
                                onChange={this.handleChange}
                                name="name"
                                value={formData.name}
                                validators={['required']}
                                errorMessages={['this field is required']}
                                style={{ width: '50%'}}
                            />
                            
                            <br/><br/>
                            <TextValidator
                                label="Description"
                                onChange={this.handleChange}
                                name="description"
                                value={formData.description}                                            
                                errorMessages={['this field is required', 'email is not valid']}
                                style={{ width: '50%'}}
                            />
                            <br/><br/>
                            <TextValidator
                                    label="Price"
                                    onChange={this.handleChange}
                                    name="price"
                                    type="price"
                                    value={formData.price}
                                    validators={['required','minNumber:0', 'matchRegexp:^[0-9]']}
                                    errorMessages={['this field is required','this field should be number']}
                                    style={{ width: '50%'}}
                                />
                            <br/><br/>
                            <TextValidator
                                label="PriceUnit"
                                onChange={this.handleChange}
                                name="price_unit"
                                value={formData.price_unit}
                                validators={['required']}
                                errorMessages={['this field is required']}
                                style={{ width: '50%'}}
                            />
                            <br/><br/><br/>
                            <Button variant="contained" component="label">
                                    Add Images
                                    <input
                                        ref="openDialog"
                                        type="file"
                                        multiple={true}
                                        style={{ display: "none" }}
                                        onChange={this.onFileChange}
                                    />
                            </Button>
                            {sideList}
                            <br/><br/>
                            <RaisedButton label="Apply" type="submit" primary={true} style={style}/>
                            <RaisedButton label="Cancel"  primary={false} style={style} onClick={this.props.history.goBack}/>
                            <br/>
                            <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                        </ValidatorForm>
                        </div>
                    </div>
                </MuiThemeProvider>    
                </LoadingOverlay>
                
            </div>
        );
    }
    handleChange = (event) => {
        const { formData } = this.state;
        formData[event.target.name] = event.target.value;
        this.setState({ formData });
    }    
    
}
const style = {
    margin: 15,
};


const hStyle = { color: 'red' };

export default ProductForm;
