import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {userUpdate} from '../../../services/api/httpclient';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import NavDrawer from './../../../components/NavDrawer';
import {getUser} from "../../../services/api/httpclient";
import CurrentLocation from '../../../components/Map';
import { Map, GoogleApiWrapper,InfoWindow, Marker } from 'google-maps-react';
import Button from '@material-ui/core/Button';
import storage  from '../../../services/firebase/index';

class ProfileScreen extends React.Component {
    constructor(props){
        super(props);
        
        this.state={
            formData:{
                _id:'',
                first_name:'',
                last_name:'',
                email:'',
                phone_number:'',

                country:'',
                country_state_province:'',
                city:'',
                address_line1:'',
                address_line2:'',
                geo_lat:'',
                geo_lng:'',
                photo:'',

                image:'',
                imageFile:null
            },
            submitted: false,
            responseError : false,
            responseErrorText:'',

            user_id:'',

            center: {
                lat: 50,
                lng: 100
              },
            zoom: 11,
            showingInfoWindow: false,  //Hides or the shows the infoWindow
            activeMarker: {},          //Shows the active marker upon click
            selectedPlace: {},

            isChangedPhoto:false
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
        console.log("Props = " + JSON.stringify(this.props));
        this._isMounted = true;
        let id = this.props.match.params.id;
        if (id != -1 && this._isMounted){
            
        } else {
            var userInfo = JSON.parse(localStorage.getItem('userInfo'));
            id = userInfo._id;
        }
        console.log("id = " + id);
        this.setState({user_id:id} , function(){
            this.onGetUser();
        });
        
    }
    onGetUser(){
        getUser(this.state.user_id).then(ret =>{
            if (ret && this._isMounted)
            {                       
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({ formData : ret.data.user});
                    this.setState({image:ret.data.user.photo});
                    
                    // const { center } = this.state;
                    // center.lat = ret.data.user.geo_lat;
                    // center.lng = ret.data.user.geo_lng;
                    // this.setState({ center });
                }
            }
        } , err=>{
            
            if (err.response.status === 300){                
                this.props.history.push('/users/signin');
            }
        });
    }

    onFileChange = event =>{        
        this.setState({image:URL.createObjectURL(event.target.files[0]) , imageFile:event.target.files[0]});
        this.setState({isChangedPhoto:true});
    }
    onMarkerClick = (props, marker, e) =>{
        this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true
        });

        console.log("props = 0" + JSON.stringify(props));
    }
    onClose = props => {
        if (this.state.showingInfoWindow) {
        this.setState({
            showingInfoWindow: false,
            activeMarker: null
        });
        }
    };
    getcurrentLocation() {
        if (navigator && navigator.geolocation) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(pos => {
            const coords = pos.coords;
            resolve({
                lat: coords.latitude,
                lng: coords.longitude
            });
            });
        });
        }
        return {
        lat: 0,
        lng: 0
        };
    }
  
    render() {
        const { formData, submitted,responseError, responseErrorText } = this.state      
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Edit Profile" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>                            
                        <ValidatorForm
                                ref="form"
                                onSubmit={this.onUploadedPhoto.bind(this)}
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
                                label="Phone Number"
                                onChange={this.handleChange}
                                name="phone_number"
                                value={formData.phone_number}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Country"
                                onChange={this.handleChange}
                                name="country"
                                value={formData.country}
                            />

                            <br/><br/>
                            <TextValidator
                                label="Country/State/Province"
                                onChange={this.handleChange}
                                name="country_state_province"
                                value={formData.country_state_province}
                            />
                            <br/><br/>
                            <TextValidator
                                label="City"
                                onChange={this.handleChange}
                                name="city"
                                value={formData.city}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Address_line1"
                                onChange={this.handleChange}
                                name="address_line1"
                                value={formData.address_line1}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Address_line2"
                                onChange={this.handleChange}
                                name="address_line2"
                                value={formData.address_line2}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Geo Latitude"
                                onChange={this.handleChange}
                                name="geo_lat"
                                value={formData.geo_lat}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Geo Longitude"
                                onChange={this.handleChange}
                                name="geo_lng"
                                value={formData.geo_lng}
                            />
                            <br/><br/>
                            <TextValidator
                                label="Photo"
                                onChange={this.handleChange}
                                name="photo"
                                value={formData.photo}
                            />
                            <br/><br/>
                            
                            <Button variant="contained" component="label">
                                    Add Images
                                    <input
                                        ref="openDialog"
                                        type="file"
                                        multiple={false}
                                        style={{ display: "none" }}
                                        onChange={this.onFileChange}
                                    />
                            </Button>
                            <br/><br/>                            
                            <img src={this.state.image} width="150px" height="200px" margin="5px"/>
                            <br/><br/>
                            <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                            <RaisedButton label="Save" primary={true} style={style} type="submit"/>
                            <RaisedButton label="Cancel" primary={true} style={style} onClick={this.props.history.goBack}/>    

                            <div>
                                <CurrentLocation
                                    zoom = {this.state.zoom}
                                    centerAroundCurrentLocation ={false}
                                    //initialCenter={{lat:50, lng:100}}                         
                                    initialCenter={{lat:this.state.center.lat, lng:this.state.center.lng}}                                                             
                                    google={this.props.google}
                                    >
                                        <Marker
                                            onClick={this.onMarkerClick}
                                            name={'currnet location'}
                                        />
                                        <InfoWindow
                                            marker={this.state.activeMarker}
                                            visible={this.state.showingInfoWindow}
                                            onClose={this.onClose}
                                        >
                                                <div>
                                                    <h4>{this.state.selectedPlace.name}</h4>
                                                </div>
                                        </InfoWindow>
                                </CurrentLocation>                                
                            </div>
                        </ValidatorForm>


                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }

    onUpdateProfile(){
        this.setState({submitted :true});          
        userUpdate(this.state.formData).then(ret =>{
                if (ret)
                {      
                    if (ret.data.success === true){
                        this.setState({responseErrorText : ''});
                        localStorage.setItem('userInfo' , JSON.stringify(ret.data.user));                        
                        this.props.history.push('/users/viewprofile/' + this.state.formData._id );   
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
    onUploadedPhoto(event){
        if (!this.state.isChangedPhoto){
            this.onUpdateProfile();
            return;
        }
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let user_id = userInfo._id;
        let timeStamp = Math.floor(Date.now()); 
        let refPath = 'marketplace/' + user_id+'/images/photo/' + timeStamp + "_" + this.state.imageFile.name;
        const uploadTask = storage.ref(refPath).put(this.state.imageFile);
        uploadTask.on('state_changed',
            (snapshot) => {

            },
            (error) => {
                
            },
            () => {
                    storage.ref(refPath).getDownloadURL().then(url => {
                        const { formData } = this.state;
                        formData.photo = url;
                        this.setState({ formData } , function(){
                            this.onUpdateProfile();
                        });
                        
                });
            }
        );        
    }
}
const style = {
    margin: 15,
};

const hStyle = { color: 'red' };
export default GoogleApiWrapper({
    apiKey: 'AIzaSyCeWSTokqJs2o1MPw7-S7KP16H57ODufHM'
  })(ProfileScreen);