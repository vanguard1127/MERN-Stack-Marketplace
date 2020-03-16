import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import {getOrder , payOrder , chargePoints,pay_with_pointsOrder } from "../../../services/api/httpclient";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Container , Row, Col } from 'react-bootstrap';
import { Map, GoogleApiWrapper,InfoWindow, Marker } from 'google-maps-react';
// import GoogleMapReact from 'google-map-react';
import CurrentLocation from '../../../components/Map';
import RaisedButton from 'material-ui/RaisedButton';
import AddressInput from 'material-ui-address-input';
import { TextField } from '@material-ui/core';
import { returnStatement } from '@babel/types';
import Checkbox from '../../../components/Checkbox ';
import Modal from 'react-responsive-modal';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
// const AnyReactComponent = ({ text }) => <div>{text}</div>;
require('dotenv').config();
class OrderEdit extends Component {
    constructor(props){
        super(props);
        this.state = {
            order:{},
            carts:[],
            order_id:'',
            status:0,
            submitted: false,
            responseError : false,
            responseErrorText:'',

            total_price:0,
            seller_data:{
                first_name :'',
                last_name :'',
                email:'',
                phone_number:'',
                geo_lng :0,
                geo_lat :0,
            },
            buyer_data:{
                first_name :'',
                last_name :'',
                email:'',
                phone_number:'',
                geo_lng :0,
                geo_lat :0,
            },
            center: {
                lat: 100,
                lng: 20.33
              },
            zoom: 11,
            showingInfoWindow: false,  //Hides or the shows the infoWindow
            activeMarker: {},          //Shows the active marker upon click
            selectedPlace: {},

            address :'',
            addresses :[],
            email:'',
            phone:'',
            name:'',
            checked:false,
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    componentDidMount(){
        this._isMounted = true;        
        let id = this.props.match.params.id;
        if (id !== undefined){
            this.setState({order_id:id} , function(){
                this.onGetOrderInfo();
            });
        }
    }
         
    onGetOrderInfo() {
        getOrder(this.state.order_id).then(ret =>{
            if (ret && this._isMounted)
            {                       
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({order:ret.data.order});
                    this.setState({seller_data : ret.data.order.seller_id})                            
                    this.setState({buyer_data : ret.data.order.buyer_id})                            
                    this.setState({carts:ret.data.order.carts} , function(){
                        let price = 0;
                        for (var index = 0 ; index < this.state.carts.length ; index++){
                            let row = this.state.carts[index];
                            price = price + row.product_id.price * row.count ;//TODO with locale currency
                        }
                        this.setState({total_price:price});
                    });             
                    this.setState({checked:ret.data.order.shipping_type});
                    this.setState({address:0});
                    this.setState({addresses:[ret.data.order.shipping_address.address]});
                    this.setState({email:ret.data.order.shipping_address.email});
                    this.setState({name:ret.data.order.shipping_address.name});
                    this.setState({phone:ret.data.order.shipping_address.phone});
                }
                
            }
        } , err=>{
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
        });
    }
    onStatusChange = event =>{
        this.setState({
            status : event.target.value
        });
    }    
    
    

    handleChargeChange = (event) => {
        const { formData } = this.state;
        formData[event.target.name] = event.target.value;
        this.setState({ formData });
    }


    onPayWithStripe(event){
        if (!this.state.checked){
            if (this.state.phone === ""){
                alert("Please input phone number");
                return;
            }
            if (this.state.email === ""){
                alert("Please input email");
                return;
            }
            if (this.state.name === ""){
                alert("Please input name");
                return;
            }

            if (this.state.addresses.length === 0){
                alert("Plese input address");
                return;
            }
        } else {
            
        }
        this.setState({modalopen:true , payment_type:0});        
    }
    handleCloseModal =() =>{
        this.setState({modalopen:false});
    }
    handleApiLoaded = (map, maps) => {
        // use map and maps objects
      };
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
    handleAddAddress = address => {
        this.setState({
            addresses: [...this.state.addresses, address]
        })
    }
 
    handleChangeAddress = addressIndex => {
        this.setState({
            address: addressIndex
        })
    }
    
    handleChangeName = event =>{
        this.setState({name:event.target.value});
    }

    handleChangeEmail = event =>{
        this.setState({email:event.target.value});
    }

    handleChangePhone = event => {
        this.setState({phone:event.target.value});
    }
    handleCheckboxChange = event =>{        
        this.setState({ checked: event });
    }
    
    render() {
        const { submitted,responseError,title ,formData} = this.state;
        
        return(
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title="Order Detail" history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <div>
                            OrderStatus                            
                        </div>
                        <Paper>
                            <Container>
                                <Row>
                                    <Col sd='3'>Status:</Col>
                                    <Col sd='3'>
                                        <h4 style = {hStyle} >{this.state.order.status === 0 ? 'None' : 
                                this.state.order.status === 1 ? 'Confirmed' : this.state.order.status === 2 ? 'Shipped' : this.state.order.status === 3 ? 'Delivered' : '' }</h4>
                                    </Col>
                                    <Col sd='3'>TotalPrice</Col>
                                    <Col sd='3'>
                                        {this.state.total_price+"$"}
                                    </Col>
                                </Row>
                            </Container>
                        </Paper>
                        <div>Cart List</div>
                        <Paper>
                        <Table>
                            <TableHead>
                            <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Product Price</TableCell>
                                <TableCell>Products Count</TableCell>
                                <TableCell>Price</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {this.state.carts.map(row => (
                                <TableRow key={row._id}>
                                <TableCell component="th" scope="row">
                                    {row.product_id.name}
                                </TableCell>
                                <TableCell>{row.product_id.price + row.product_id.price_unit}</TableCell>
                                <TableCell>{row.count}</TableCell>
                                <TableCell>{row.product_id.price * row.count + row.product_id.price_unit}</TableCell>                                
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </Paper>
                        <div>Seller Profile</div>
                        <Paper>
                            <Container>
                                <Row>
                                    <Col sd='6'>FirstName:</Col>
                                    <Col sd='6'><label >{this.state.seller_data.first_name}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>LastName:</Col>
                                    <Col sd='6'><label >{this.state.seller_data.last_name}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>Email:</Col>
                                    <Col sd='6'><label >{this.state.seller_data.email}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>PhoneNumber:</Col>
                                    <Col sd='6'><label >{this.state.seller_data.phone_number}</label></Col>
                                </Row>                               
                            </Container>  
                        </Paper>
                        <div>Buyer Profile</div>
                        <Paper>
                            <Container>
                                <Row>
                                    <Col sd='6'>FirstName:</Col>
                                    <Col sd='6'><label >{this.state.buyer_data.first_name}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>LastName:</Col>
                                    <Col sd='6'><label >{this.state.buyer_data.last_name}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>Email:</Col>
                                    <Col sd='6'><label >{this.state.buyer_data.email}</label></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>PhoneNumber:</Col>
                                    <Col sd='6'><label >{this.state.buyer_data.phone_number}</label></Col>
                                </Row>                               
                            </Container>  
                        </Paper>
                        <div>Payment</div>
                        <Paper>
                            <Container>
                                <Row>                                
                                    <Col sd='6'>
                                    <AddressInput
                                        onAdd={this.handleAddAddress}
                                        onChange={this.handleChangeAddress}
                                        value={this.state.address}
                                        allAddresses={this.state.addresses}
                                    />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>name:</Col>
                                    <Col sd='6'><TextField                                                                                    
                                                        value={this.state.name} 
                                                        onChange={this.handleChangeName}
                                                        style={{width:'100%'}}/></Col>                                    
                                </Row>
                                <Row>
                                    <Col sd='6'>email:</Col>
                                    <Col sd='6'><TextField                                                                                      
                                                        value={this.state.email} 
                                                        onChange={this.handleChangeEmail}
                                                        style={{width:'100%'}}/></Col>                                    
                                </Row>
                                <Row>
                                    <Col sd='6'>phone:</Col>
                                    <Col sd='6'><TextField                              
                                                        value={this.state.phone} 
                                                        onChange={this.handleChangePhone}
                                                        style={{width:'100%'}}/></Col>                                    
                                </Row>
                                <Row>
                                    <Checkbox checked={this.state.checked} 
                                    handleCheckboxChange={this.handleCheckboxChange} 
                                    label="Ship as buyeraddress" />
                                </Row>
                                
                            </Container>  
                        </Paper>
                        
                        <div>Location</div>
                                                   
                        </div>
                        <div>
                            <CurrentLocation
                              zoom = {this.state.zoom}
                              initialCenter={{
                                lat: 46.11,
                                lng: 123.8233
                              }}
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
}
const style = {
    margin: 15,
};
const hStyle = { color: 'red' };


export default GoogleApiWrapper({
    apiKey: 'AIzaSyCeWSTokqJs2o1MPw7-S7KP16H57ODufHM'
  })(OrderEdit);

