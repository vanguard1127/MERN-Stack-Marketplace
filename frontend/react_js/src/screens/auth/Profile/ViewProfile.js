import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {Container , Row, Col } from 'react-bootstrap';
import NavDrawer from './../../../components/NavDrawer'
import {getUser} from "../../../services/api/httpclient";
import CurrentLocation from '../../../components/Map';
import { Map, GoogleApiWrapper,InfoWindow, Marker } from 'google-maps-react';
import { withStyles } from '@material-ui/core/styles';

class ViewProfile extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData:{
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

            },

            sell_count:0,
            buy_count:0,
            points:0,
            user_id:'',

            center: {
                lat: 100,
                lng: 20.33
              },
            zoom: 11,
            showingInfoWindow: false,  //Hides or the shows the infoWindow
            activeMarker: {},          //Shows the active marker upon click
            selectedPlace: {},

        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    componentDidMount() {
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
    onMarkerClick = (props, marker, e) =>
        this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true
        });

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
    onGetUser(){
        getUser(this.state.user_id).then(ret =>{
            if (ret && this._isMounted)
            {                       
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({ formData : ret.data.user});
                    this.setState({sell_count:ret.data.sell, buy_count:ret.data.buy});
                    this.setState({points:ret.data.user.points.points});
                    const { center } = this.state;
                    center.lat = ret.data.user.geo_lat;
                    center.lng = ret.data.user.geo_lng;
                    this.setState({ center });
                }
            }
        } , err=>{
            console.log("View Profile  Screen = " + JSON.stringify(err));
            if (err.response.status === 300){                
                this.props.history.push('/users/signin');
            }
        });
    }
    render() {  
        const { classes } = this.props;      
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="View Profile" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}>                           
                        <Container>
                            <Row>
                                <Col sd='6'>BuyCount:</Col>
                                <Col sd='6'><label >{this.state.sell_count}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Sell Count:</Col>
                                <Col sd='6'><label >{this.state.buy_count}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Points:</Col>
                                <Col sd='6'><label >{this.state.points/100 + "$"}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>FirstName:</Col>
                                <Col sd='6'><label >{this.state.formData.first_name}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>LastName:</Col>
                                <Col sd='6'><label >{this.state.formData.last_name}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Email:</Col>
                                <Col sd='6'><label >{this.state.formData.email}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>PhoneNumber:</Col>
                                <Col sd='6'><label >{this.state.formData.phone_number}</label></Col>
                            </Row><Row>
                                <Col sd='6'>Country:</Col>
                                <Col sd='6'><label >{this.state.formData.country}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Country_state_province:</Col>
                                <Col sd='6'><label >{this.state.formData.country_state_province}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>City:</Col>
                                <Col sd='6'><label >{this.state.formData.city}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Address_line1:</Col>
                                <Col sd='6'><label >{this.state.formData.address_line1}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Address_line2</Col>
                                <Col sd='6'><label >{this.state.formData.address_line2}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Geo Latitude</Col>
                                <Col sd='6'><label >{this.state.formData.geo_lat}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Geo Longitude</Col>
                                <Col sd='6'><label >{this.state.formData.geo_lng}</label></Col>
                            </Row>
                            <Row>
                                <Col sd='6'>Photo</Col>
                                <Col sd='6'><label >{this.state.formData.photo}</label></Col>
                            </Row>
                            
                            <Row>
                            <img src={this.state.formData.photo} width="150px" height="200px" margin="5px"/>
                            </Row>
                            <Row>
                            
                            </Row>
                        </Container>                    
                        <RaisedButton label="Edit" primary={true} style={style} onClick={(event) => this.onEditProfile(event)}/>
                        <RaisedButton label="Back" primary={true} style={style} onClick={this.props.history.goBack}/>
                    </div>
                        <div>
                                <CurrentLocation
                                    zoom = {this.state.zoom}
                                    initialCenter={this.state.center}
                                    centerAroundCurrentLocation={false}
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
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }

    onEditProfile(event){        
        this.props.history.push('/users/profile/'+ this.state.user_id);
    }

    Cancel(event){

    }

}
const style = {
    margin: 15,
};
const styles = {
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
  };
export default GoogleApiWrapper({
    apiKey: 'AIzaSyCeWSTokqJs2o1MPw7-S7KP16H57ODufHM'
  })(withStyles(styles)(ViewProfile));
