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
import StripeButton from './payment/StripeButton';
import AddressInput from 'material-ui-address-input';
import { TextField } from '@material-ui/core';
import { returnStatement } from '@babel/types';
import Checkbox from '../../../components/Checkbox ';
import Modal from 'react-responsive-modal';
import StripeScreen from './payment/StripeScreen';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
// const AnyReactComponent = ({ text }) => <div>{text}</div>;
require('dotenv').config();

class BuyOrderDetail extends Component {
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
            modalopen:false,
            
            payment_type:0, // 0: order , 1: charge

            formData:{
                charge_amount:0,
                charge_currency:'usd'
            }
                       
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    componentDidMount(){
        console.log("BuyOrderDetail ComponenetDidMount");
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
                    this.setState({carts:ret.data.order.carts} , function(){
                        let price = 0;
                        for (var index = 0 ; index < this.state.carts.length ; index++){
                            let row = this.state.carts[index];
                            price = price + row.product_id.price * row.count ;//TODO with locale currency
                        }
                        this.setState({total_price:price});
                    });             
                }
                
            }
        } , err=>{
            if (err.response.status === 300){
                console.log("BuyOrderDetail response status = 300");
                this.props.history.push('/users/signin');
            }
        });
    }
    onStatusChange = event =>{
        this.setState({
            status : event.target.value
        });
    }    
    
    onPayWithPoints(event){
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
        }
        var body = {};
        if (this.state.checked){
            body = { amount:this.state.total_price,
                order_id:this.state.order_id,
                ship_type:1,
           };
        } else {
            body = { amount:this.state.total_price,
                order_id:this.state.order_id,
               ship_type:0,
               shipping:{
                   address:this.state.addresses[this.state.address],
                   name:this.state.name,
                   email:this.state.email,
                   phone:this.state.phone
               },
               ship_type:0
           };
        }
        
        pay_with_pointsOrder(body).then( ret => {
            if (ret.data.success === true){
                alert("Success to pay with points!");
                this.onGetOrderInfo();
                this.setState({
                    address:'',
                    addresses:[],
                    name:'',
                    email:'',
                    phone:''
                });
            }
            
          }).catch(err=>{
            console.log("Payment Error: ", JSON.stringify(err));
            if (err.response.status === 300){
              this.props.history.push('/users/signin');
            } else if (err.response.status === 503){
                alert("Payment Error: Your points is too small to pay with points for this order.");    
            }
            
          });
    }
    onChargeWithStripe(event){
        console.log("onChargeWithStripe");
        if (this.state.formData.charge_amount == 0){
            alert("Input charge amount.");
            return;
        }
        this.setState({modalopen:true , payment_type:1});                
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
    handleStripeResult = result =>{
        console.log("BuyOrderDetails = " + JSON.stringify(result));
        this.setState({modalopen:false});
        let body ={};
        if (this.state.payment_type == 0){
            if (this.state.checked){
                body = {
                    amount: this.state.total_price * 100,
                    stripe_token: result.token,
                    ship_type : 1, //use buyer address
                    checkout_type : 1, //For stripe 1, for points 0
                    currency:"usd" ,
                    order_id :this.state.order_id,
                    transaction_type:0, //For stripe 0 , for paypal : 1
                  };
            } else {
                body = {
                    amount: this.state.total_price * 100,
                    stripe_token: result.token,
                    ship_type : 0, //new shipping address
                    checkout_type : 1, //For stripe 1, for points 0
                    currency:"usd" ,
                    order_id :this.state.order_id,
                    transaction_type:0, //For stripe 0 , for paypal : 1
                    shipping:{
                        address:this.state.addresses[this.state.address],
                        name:this.state.name,
                        email:this.state.email,
                        phone:this.state.phone
                    }
                  };
            }
            
    
            payOrder(body).then( ret => {
                if (ret.data.success === true){
                    alert("Payment Success!");
                    this.onGetOrderInfo();
                    this.setState({
                        address:'',
                        addresses:[],
                        name:'',
                        email:'',
                        phone:''
                    });
                }
                
              }).catch(err=>{
                console.log("Payment Error: ", JSON.stringify(err));
                if (err.response.status === 300){
                  this.props.history.push('/users/signin');
                }
                alert("Payment Error");
              });
        
        } else {
            this.setState({submitted:true});
            body = {
                amount:this.state.formData.charge_amount * 100,
                currency : this.state.formData.charge_currency,
                stripe_token: result.token,
                transaction_type:0, //For stripe 0 , for paypal : 1
            }
            chargePoints(body).then( ret => {
                if (ret.data.success === true){
                    alert("Charge Success");
                    const { formData } = this.state;
                    formData['charge_amount'] = 0;
                    formData['charge_currency'] = 'usd';
                    this.setState({ formData });
                }
                
            }).catch(err=>{
                console.log("Charge Error: ", JSON.stringify(err));
                if (err.response.status === 300){
                this.props.history.push('/users/signin');
                }
                alert("Charge Error");
            });
        }
        
    }
    render() {
        const { submitted,responseError,title ,formData} = this.state;
        
        return(
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title="Buy Order Detail" history={this.props.history}/>
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
                                <Row>                                
                                    <Col sd='4'>
                                        <RaisedButton label="Points" primary={true} style={style} onClick={ (event) => this.onPayWithPoints(event)}/>    
                                    </Col>
                                    <Col sd='4'>
                                    {/* <StripeButton amout={this.state.total_price} props={this.props} state={this.state} /> */}
                                    <RaisedButton label="Stripe" primary={true} style={style} onClick={ (event) => this.onPayWithStripe(event)}/>
                                    <Modal open={this.state.modalopen} onClose={this.handleCloseModal} center >                                    
                                      <StripeScreen handleResult={this.handleStripeResult}/>
                                    </Modal>
                                    </Col>
                                    <Col sd='4'>
                                        <RaisedButton label="COD" primary={true} style={style} onClick={ (event) => this.onPayWithPoints(event)}/>    
                                    </Col>
                                </Row>
                            </Container>  
                        </Paper>
                        <div>Charge</div>
                        <Paper>

                        <ValidatorForm
                                ref="form"
                                onSubmit={this.onChargeWithStripe.bind(this)}
                                onError={errors => console.log(errors)}
                            >
                                <TextValidator
                                    label="Amount"
                                    onChange={this.handleChargeChange}
                                    name="charge_amount"
                                    value={formData.charge_amount}
                                    validators={['required','minNumber:0', 'maxNumber:20000']}
                                    errorMessages={['this field is required', 'should number']}
                                /><br/>
                                <br/>
                                <TextValidator
                                    label="Currency"
                                    onChange={this.handleChargeChange}
                                    name="charge_currency"
                                    type="currency"
                                    value={formData.charge_currency}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                                <br/>                                
                                <RaisedButton label="ChargeWithStripe" primary={true} style={style} type="submit"/>
                                <br/>
                                <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>

                        </ValidatorForm>                                
                            
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
  })(BuyOrderDetail);

