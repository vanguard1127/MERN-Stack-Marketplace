/**
* This is the Store finder page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import {Dimensions , Text ,TouchableHighlight,Image ,ActivityIndicator, TouchableOpacity} from 'react-native';
import { Container, Content, View, 
  Icon, Left, Button, Item, Input,
   } from 'native-base';
// import { Actions } from 'react-native-router-flux';
import MapView from 'react-native-maps';
// Our custom files and classes import
import Navbar from './../components/Navbar';
import {styles} from './values/Styles';
const {width, height} = Dimensions.get('window');
import { userUpdate} from '../../services/api/httpclient';
import { getData,storeData } from '../../utils/AppUtils';

export default class Map extends Component {
  map = null;

  constructor(props) {
    super(props);
    this.state = {
      user_id:'',
      originalRegion: {
        latitude: 48.85837009999999,
        longitude: 2.2944813000000295,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      region: {
        latitude: 48.85837009999999,
        longitude: 2.2944813000000295,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      marker: {
        title: 'My Location',
        address: '21 bis rue de la trippe, paris',
        coord: {
          latitude: 48.85837009999999,
          longitude: 2.2944813000000295
        }
      },

      currentLatitude:48,
      currentLongitude:2.2,

      isLoading:false,
    };
  }

  async componentDidMount(){
    this.getCurrentLocation().then(position => {
      if (position){
          this.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
              // latitudeDelta: 0.003,
              // longitudeDelta: 0.003,
            },
            originalRegion: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            },
            marker:{
              title:'',
              coord:position.coords
            },

          });
      }
    });
    
    await getData('userInfo').then((ret) => {
      let userInfo = JSON.parse(ret);      
      this.setState({user_id:userInfo._id});
  });


  }
  onClickListener = (viewId) => {       
      if (viewId === 'setlocation'){
          this.onUserUpdate();
      } else if (viewId === 'myLoc'){
        const { latitude , longitude, latitudeDelta, longitudeDelta } = this.state.originalRegion;        
        this.map.animateToRegion({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta
        });
      }
  }
  onUserUpdate(){
    let payload = {_id:this.state.user_id,geo_lat:this.state.region.latitude, geo_lng:this.state.region.longitude}
    this.setState({isLoading:true});
    userUpdate(payload).then(ret =>{
        if (ret)
        {      
          this.setState({isLoading:false});
            if (ret.status ===  200){
                if (ret.data.success === true){
                    if (this.state.userType !== 'anyProfile'){ 
                        storeData('userInfo',JSON.stringify(ret.data.user)).then(ret => {
                          this.props.navigation.replace('Drawer');
                        }); 
                    }
                }
            } else if (ret.status === 300 || ret.status === 303){
                this.props.navigation.replace('LoginView');      
            }  else {                     
            }       
        }
    } , err=>{
      this.setState({isLoading:false});
    });
}

  getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => resolve(position), e => reject(e));
    });
  };
  onRegionChangeComplete = (region) => {
    console.log("Current=");
    console.log("lat=" + JSON.stringify(region));
    
    this.setState({
      region: {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta
      },
    });
  }
  render() {
    var left = (
      <Left style={{flex:1}}>
        <Button transparent onPress ={() => this.props.navigation.replace('Drawer')}>
          <Icon name="ios-close" size={38} style={{fontSize: 38}} />
        </Button>
      </Left>
    );
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        {
            this.state.isLoading == true &&
            <View style={styles.loading}>
                <View style={styles.loaderView}>
                    <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                    <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                </View>
            </View>
        }
        <Navbar left={left} title="Set Location" />
        <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <MapView
            onRegionChangeComplete={this.onRegionChangeComplete}
            ref={map => { this.map = map }}
            region={this.state.region}
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
          >
          <MapView.Marker
              title={this.state.marker.title}
              description={this.state.marker.address}
              coordinate={this.state.marker.coord}
            />
          </MapView>
          <Image style={{marginBottom:43}}
          source={require('./../../../images/ic_set_location.png')}/>
          <TouchableOpacity style={{position:'absolute', top:5 , right:5 , width:50, height:50}}onPress={() => this.onClickListener('myLoc')}>
            <Image style={{flex:1,width:50 ,height:50}}
            source={require('./../../../images/ic_my_loc.png')}/>
          </TouchableOpacity>
        </View>   
        <TouchableOpacity style={[styles.rectangleContainer, styles.normalButton , {width:width}]} onPress={() => this.onClickListener('setlocation')} >
            <Text style={styles.loginText}>Set Location</Text>
        </TouchableOpacity>
          
      </Container>
    );
  }


}
