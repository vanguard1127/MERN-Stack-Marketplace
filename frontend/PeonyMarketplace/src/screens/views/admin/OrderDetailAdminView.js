import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    Dimensions,
    View,
    TextInput,    
    Image,
    Alert,
    ActivityIndicator,
    FlatList,Linking,Platform,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {Icon, Container, Content,  Grid, Col,Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail} from 'native-base';
import Navbar from './../../components/Navbar';
import {styles} from './../values/Styles';
const {width, height} = Dimensions.get('window');
import { getOrder , updateOrder , sendMessage } from '../../../services/api/httpclient';
class OrderDetailAdminView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order:{},
            carts:[],
            buyer_data:{
                first_name :'',
                last_name :'',
                email:'',
                phone_number:'',
                geo_lng :0,
                geo_lat :0,
                _id:''
            },

            seller_data:{
              first_name :'',
              last_name :'',
              email:'',
              phone_number:'',
              geo_lng :0,
              geo_lat :0,
              _id:''
          },
            shipping_type:0,
            shipping_address:{
                address:{
                    city:'',
                    country:'',
                    addressLine1:'',
                    addressLine2:'',
                    region:'',
                    zip:'',
                    
                },
                email:'',
                phone_number:'',
                name:'',
            },
            cartItems:[],
            page:0,
            limit:10,
            totalCount:0,

            isLoading :false,
            order_id:'',
            status:0,
        }
    }
    componentDidMount(){
        const id = this.props.navigation.getParam('id');
        this.setState({order_id:id} ,() => this.onGetOrder());
    }

    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <FontAwesomeIcon name="product-hunt" size={22} color={tintColor}/>
        )
    }
    onClickListener = (viewId) => {       
        if (viewId === 'confirm'){
            this.onSetOrderStatus(1);
        } else if (viewId === 'ship'){
            this.onSetOrderStatus(2);
        } else if (viewId === 'sms'){
            // Alert.alert(
            //     'SMS '+item.name,
            //     'Are you sure you want to send sms to buyer ?',
            //     [
            //       {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'},
            //       {text: 'Yes', onPress: () => this.removeItem(item)},
            //     ]
            //   )

            let smsNumber ='sms:'+ this.state.order.buyer_id.phone_number;
            Linking.openURL(smsNumber);
        } else if (viewId === 'call') {
            let phoneNumber = '';
 
            if (Platform.OS === 'android') {
              phoneNumber = 'tel:'+ this.state.order.buyer_id.phone_number;
            }
            else {
              phoneNumber = 'telprompt:'+this.state.order.buyer_id.phone_number;
            }
         
            Linking.openURL(phoneNumber);
        } else if (viewId === 'whatsapp'){
            Linking.openURL('whatsapp://send?phone='+ this.state.order.buyer_id.phone_number);
        }
    }

    onSetOrderStatus(status){
        this.setState({isLoading:true});
        updateOrder({id:this.state.order_id,status:status}).then(ret => {
            this.setState({isLoading:false});
            if (ret){
                let statusCode = ret.status;
                if (statusCode === 200){
                    alert('This Order Status changed');
                    let order = this.state.order;
                    order.status = status;
                    this.setState({order:order});
                } else if (statusCode === 300 || statusCode=== 303){
                    this.props.navigation.navigate('LoginView');             
                } else {
                    alert(ret.data.error);
                }
            }
        }, err => {
            alert("Please check your network." + JSON.stringify(err));
            this.setState({isLoading:false});
        });
    }
    onGetOrder = () => {
        this.setState({isLoading:true});
        getOrder(this.state.order_id).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        this.setState({order:ret.data.order});
                        this.setState({buyer_data : ret.data.order.buyer_id});                            
                        this.setState({seller_data : ret.data.order.seller_id});                            
                        this.setState({order_id:ret.data.order._id});
                        this.setState({carts:ret.data.order.carts});
                         
                        if (ret.data.order.shipping_type){
                            this.setState({shipping_type:ret.data.order.shipping_type, shipping_address:ret.data.order.shipping_address});
                        }
                    }
                } else if (status === 300 || status === 303){
                    this.props.navigation.navigate('LoginView');             
                } else {
                    alert(ret.data.error);
                }
                
            }
        } ,err=>{
            alert("Please check your network." + JSON.stringify(err));
            this.setState({isLoading:false});
        });
    }
    onItemClick = (rowData) => {
        this.props.navigation.navigate('Product' , {
            type : 'onlyView',
            id:rowData._id
        })
    }
    calculateTotalPrice(){
        let price = 0;
        this.state.carts.map((row) => {
            price += row.product_id.price * row.count;
        });      
        return price;
      }
    renderItems() {
        let items = [];
        items.push(
            <View style={{flex:1, width:width , margin:10}}>
                <Text style={{ fontSize: 18 }}>Carts</Text>
            </View>
        );
        this.state.carts.map((item, i) => {
          items.push(
            <ListItem
              key={item._id}
              last={this.state.carts.length === i+1}
              onPress={() => this.onItemClick(item)}
            >
              <Thumbnail square style={{width: 110, height: 90}} source={{ uri: item.product_id.photos[0].src }} />
              <Body style={{paddingLeft: 10}}>
                <Text style={{fontSize: 18}}>
                  {item.quantity > 1 ? item.quantity+"x " : null}
                  {item.product_id.name}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.product_id.price}{item.product_id.price_unit}</Text>
                <Text style={{fontSize: 14 ,fontStyle: 'italic'}}></Text>
                <Text style={{fontSize: 14 ,fontStyle: 'italic'}}></Text>
              </Body>
              <Right>
              </Right>
            </ListItem>
          );
        });
        items.push(
            <View style={{flex:1, width:width , margin:10}}>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Total Price</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.calculateTotalPrice()}$</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Status</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                            {this.state.order.status === 0 ? "None" : this.state.order.status === 1 ? "Confirmed" : "Shipped"}
                        </Text>
                    </Col>
                </Grid>
            </View>
        );
        items.push(
            <View style={{flex:1 , flexDirection:'row' , width:width}}>
                <TouchableHighlight disabled={this.state.order.status >= 1 ? true: false} activeOpacity={this.state.order.status < 1 ? 1: 0.5} style={[{flex:1,margin:10} ,styles.buttonContainer, styles.normalButton]} onPress={ () => this.onClickListener('confirm')} >
                    <Text style={styles.loginText}>Confirm</Text>
                </TouchableHighlight>
                <TouchableHighlight disabled = {this.state.order.status >= 2 ? true : false} activeOpacity={this.state.order.status < 2 ? 1: 0.5} style={[{flex:1,margin:10} ,styles.buttonContainer, styles.normalButton]} onPress={ () => this.onClickListener('ship')} >
                    <Text style={styles.loginText}>Ship</Text>
                </TouchableHighlight>
            </View>
        );
        items.push(
          <View style={{flex:1, width:width , margin:10}}>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>Seller Details</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>First Name</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.first_name}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>Last Name</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.last_name}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>Email</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.email}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>Phone Number</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.phone_number}</Text>
                  </Col>
              </Grid>                
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>Country</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.country}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>State</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.country_state_province}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>City</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.city}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>AddressLin1</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.address_line1}</Text>
                  </Col>
              </Grid>
              <Grid>
                  <Col>
                      <Text style={{ fontSize: 18 }}>AddressLin2</Text>
                  </Col>
                  <Col>
                      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.seller_data.address_line2}</Text>
                  </Col>
              </Grid>                
          </View>
          
      );

        items.push(
            <View style={{flex:1, width:width , margin:10}}>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Customer Details</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>First Name</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.first_name}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Last Name</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.last_name}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Email</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.email}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Phone Number</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.phone_number}</Text>
                    </Col>
                </Grid>                
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Country</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.country}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>State</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.country_state_province}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>City</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.city}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>AddressLin1</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.address_line1}</Text>
                    </Col>
                </Grid>
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>AddressLin2</Text>
                    </Col>
                    <Col>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.buyer_data.address_line2}</Text>
                    </Col>
                </Grid>                
            </View>
            
        );
        

        if (this.state.shipping_type == 1) {
            items.push(
                <Grid>
                    <Col>
                        <Text style={{ fontSize: 18 }}>Shipping Address is same with buyer address.</Text>
                    </Col>
                </Grid>);
        }  else {
            items.push(           
                <View style={{flex:1, width:width , margin:10}}>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>Shipping Address</Text>
                            </Col>
                        </Grid>                        
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>Country</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.address.country}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>State</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.address.region}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>City</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.address.city}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>AddressLine1</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.address.addressLine1}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>AddressLine2</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.address.addressLine2}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>Phone Number</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.phone_number}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>name</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.name}</Text>
                            </Col>
                        </Grid>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 18 }}>Email</Text>
                            </Col>
                            <Col>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.shipping_address.email}</Text>
                            </Col>
                        </Grid>
                        
                    </View>
            )
                
        }
        items.push(
            <View style={{flex:1, width:width ,flexDirection:'row'}}>
                <TouchableHighlight style={[{flex:1,margin:10} , styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('sms')} >
                    <Text style={styles.loginText}>SMS</Text>
                </TouchableHighlight>
                <TouchableHighlight style={[{flex:1,margin:10} ,styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('call')} >
                    <Text style={styles.loginText}>CALL</Text>
                </TouchableHighlight>
                <TouchableHighlight style={[{flex:1,margin:10} ,styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('whatsapp')} >
                    <Text style={styles.loginText}>WHATSAPP</Text>
                </TouchableHighlight>
            </View>
        );

        
        return items;
      }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="ios-arrow-back" onPress={() => this.props.navigation.goBack()}></Icon>
            </Left>
          );
        return (
            <View style={styles.container}>
                {
                    this.state.isLoading == true &&
                    <View style={styles.loading}>
                        <View style={styles.loaderView}>
                            <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                            <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                        </View>
                    </View>
                }
                <Navbar left={left} title="Sell Detail" />
                <View style={{flex:1}}>
                    <View style={styles.container}>
                    <Content style={{paddingRight: 10}}>
                        <List>
                            {this.renderItems()}
                        </List>
                    </Content>
                    </View>
                </View>

            </View>
        );
    }
}

export default OrderDetailAdminView;