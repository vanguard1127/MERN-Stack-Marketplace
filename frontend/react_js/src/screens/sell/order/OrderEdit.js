import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import NavDrawer from './../../../components/NavDrawer'
import {getOrder , updateOrder , sendMessage} from "../../../services/api/httpclient";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Container , Row, Col } from 'react-bootstrap';
import { Map, GoogleApiWrapper,InfoWindow, Marker } from 'google-maps-react';
import TextField from 'material-ui/TextField';
import CurrentLocation from '../../../components/Map';
class OrderEditFrom extends Component {
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

            text_message:'',
            buyer_data:{
                first_name :'',
                last_name :'',
                email:'',
                phone_number:'',
                geo_lng :0,
                geo_lat :0,
                _id:''
            },
            zoom: 11,
            showingInfoWindow: false,  //Hides or the shows the infoWindow
            activeMarker: {},          //Shows the active marker upon click
            selectedPlace: {}  
            
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    componentDidMount(){
        this._isMounted = true;
        let id = this.props.match.params.id;
        if (id != -1 && this._isMounted){
            this.setState({order_id:id} , function(){
                getOrder(this.state.order_id).then(ret =>{
                    if (ret && this._isMounted)
                    {                        
                        if (ret.data.success === true){
                            this.setState({responseErrorText :''});
                            this.setState({order:ret.data.order});
                            this.setState({buyer_data : ret.data.order.buyer_id});                            
                            this.setState({order_id:ret.data.order._id});
                            this.setState({carts:ret.data.order.carts});                            
                        }
                        
                    }
                } , err=>{
                     if (err.response.status === 300){
                        console.log("UpdateOrder");
                     //    this.props.history('/users/signin');
                     }
                    if (this._isMounted){
                        var errorData = err.response.data;
                        this.setState({responseError :true});
                        this.setState({responseErrorText : errorData.error}); 
                    }
                    
                });
            });
        }
    }
         
    onStatusChange = event =>{
        this.setState({
            status : event.target.value
        });
    }
    onSubmit(event){        
        let payload = {id : this.state.order_id , status:this.state.status};
        updateOrder(payload).then(ret =>{
            if (ret && this._isMounted)
            {
                if (ret.data.success === true){
                    this.props.history.push('/sell_orders');
                }
                
            }
        } , err=>{
            if (err.response.status === 300){
                console.log("UpdateOrder");
                //this.props.history.push('/users/signin');
            }
            if (this._isMounted){
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error}); 
            }
            
        });

    }

    onSendSmsOrEmail(type){
        if (this.state.text_message === ""){
            alert("Please input text to send sms!");
            return;
        }
        this.setState({submitted:true});
        let payload = {buyer_id:this.state.buyer_data._id , message:this.state.text_message , type:type};
        sendMessage(payload).then(ret =>{
            if (ret && this._isMounted)
            {                
                if (ret.data.success === true){
                    alert('Successfully Sent');
                    // confirmAlert({
                    //     title: 'Success',
                    //     message: '',
                    //     buttons: [
                    //       {
                    //         label: 'Ok',
                    //         onClick: () => this.onCreateOrderSuccess()
                    //       },
                    //     ]
                    //   });
                    this.props.history.push('/sell_orders');
                    this.setState({submitted:false});
                }
                
            }
        } , err=>{
            if (err.response.status === 300){
                console.log("SendMessage");
                //this.props.history.push('/users/signin');
            }
            if (this._isMounted){
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error}); 
            }; 
        });

    }
    onClickCall(event){
        alert("Call");
    }
    onClickSMS(event){
        //alert(JSON.stringify(this.state.buyer_data));        
        this.onSendSmsOrEmail(0);
    }
    onClickEmail(event){
        let userInfo = JSON.parse(localStorage.getItem('userInfo')); 
        let myEmail = userInfo.email;
        window.location.href = 'mailto:' + myEmail;        
        //window.location.href = 'mailto:zhangyoungjin1127@gmail.com';        
    }
    onClickWhatsApp(event){
        alert("WhatsApp");
    }
    handleMessage=(event)=>{
        this.setState({text_message:event.target.value});
    }   

    render() {
        const { submitted,responseError,title } = this.state;
        return(
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title="Order Detail" history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                        <ValidatorForm ref="form" onSubmit={this.onSubmit.bind(this)}>
                            <FormControl style={{ width: '50%'}}>
                                <Select
                                        value={this.state.status}
                                        onChange={this.onStatusChange}
                                        >
                                    <MenuItem value="0">None</MenuItem>
                                    <MenuItem value="1">Confirmed</MenuItem>
                                    <MenuItem value="2">Shipped</MenuItem>
                                    <MenuItem value="3">Delivered</MenuItem>
                                </Select>
                            </FormControl>
                            <br/><br/>
                            <RaisedButton label="Apply" type="submit" primary={true} style={style}/>
                            <RaisedButton label="Cancel"  primary={false} style={style}/>
                            <br/>
                            <h4 style = {hStyle} >{ submitted && responseError ? this.state.responseErrorText : ''}</h4>
                        </ValidatorForm>
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
                        <div>Customer Profile</div>
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
                                <Row>
                                    <TextField 
                                        id="text_field"
                                        placeholder="Input text to send to buyer."                                 
                                        value={this.state.text_message} 
                                        onChange={this.handleMessage}
                                        style={{width:'100%'}}/>
                                </Row>
                                <Row>
                                    <Col sd='6'><RaisedButton label="SMS" primary={true} style={style} 
                                    onClick={(event) => this.onClickSMS(event)}/></Col>
                                    <Col sd='6'><RaisedButton label="Email" primary={true} style={style} 
                                    onClick={(event) => this.onClickEmail(event)}/></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'><RaisedButton label="Call" primary={true} style={style}
                                    onClick={(event) => this.onClickCall(event)}/></Col>
                                    <Col sd='6'><RaisedButton label="WhatsApp" primary={true} style={style}
                                    onClick={(event) => this.onClickWhatsApp(event)}/></Col>
                                </Row>
                                <Row>
                                    <Col sd='6'>GeoLocation:</Col>
                                    <Col sd='6'><label >{"(" +this.state.buyer_data.geo_lng + "," + this.state.buyer_data.geo_lat + ")"}</label></Col>
                                </Row>                                
                            </Container>  
                        </Paper>
                        <div>Location</div>
                        </div>                        
                    </div>
                    <div >
                    <CurrentLocation
                        zoom = {this.state.zoom}
                        initialCenter={{
                        lat: 46.11, //TODD
                        lng: 123.8233 //TODO
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
                </MuiThemeProvider>
            </div>
        );
    }
}
const style = {
    margin: 15,
};
const mapStyles = {
    width: '50%',
    height: '50%'
  };
const hStyle = { color: 'red' };



export default GoogleApiWrapper({
    apiKey: 'AIzaSyCeWSTokqJs2o1MPw7-S7KP16H57ODufHM'
  })(OrderEditFrom);