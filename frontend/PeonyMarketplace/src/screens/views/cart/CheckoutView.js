/**
* This is the Checkout Page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { TouchableHighlight ,ActivityIndicator, Alert} from 'react-native';
import { Container, Content,Platform, Switch, View, Grid, Col, Left, Right, Button, Icon, List, ListItem, Body, Radio, Input, Item } from 'native-base';
import FAIcon  from 'react-native-vector-icons/FontAwesome';
import stripe from 'tipsi-stripe';
// import { Actions } from 'react-native-router-flux';

// Our custom files and classes import
import Colors from './../values/Colors';
import Text from './../../components/Text';
import Navbar from './../../components/Navbar';
import {getOrder , payOrder , pay_with_pointsOrder } from "../../../services/api/httpclient";
import { removeCartProduct , clearCartProduct} from '../../components/redux/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    removeCartProduct ,clearCartProduct
  }, dispatch)
);
const mapStateToProps = (state) => {
  const { total_quantity , total_price ,carts } = state
  return { total_quantity , total_price ,carts }
};


import Config from './../../../config/config';

stripe.setOptions({
  publishableKey: 'pk_test_VjrigsCUtX6uWYWa23jP5Tt400feU8fVEa',
  androidPayMode: 'test',
});
 class Checkout extends Component {
  constructor(props) {
      super(props);
      this.state = {
        carts: {},
        products:[],

        shipping_type:true,
        total_price: 0,
        stripe: true,
        paypal: false,
        points:false,
        name: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        city: '',
        postcode: '',
        note: '',
        
        
        isLoading:false,
      };
  }

  componentDidMount() {
    let carts = this.props.navigation.getParam('carts');
    let products = this.props.navigation.getParam('products');
    let total_price = this.props.navigation.getParam('total_price');
    this.setState({carts:carts, products:products , total_price:total_price});
    
  }

  onGetCountPerProduct(id){
    let carts = this.state.carts;
    let ret = 0;
    for (let value of Object.keys(carts)) {
      if (value !== undefined && value === id){
        ret = carts[value];        
        break;
      }
    }
    return ret;
  }

  onValidationShippingAddress(){
    if (!this.state.shipping_type){
      if (this.phone === ''){
        alert('Please input shipping phone number.');
        return false;
      }
      //TODO
    }
    return true;
  }
  onPayWithStripeCard = (amount , tokenId, accessToken) => {
    if (!this.onValidationShippingAddress())
        return false;
    this.setState({isLoading:true});    
    const ship_addr ={
      address:{
          city:this.state.city,
          country:this.state.country,
          addressLine1:this.state.address,
          addressLine2:this.state.addressLine2,
          region:this.state.state,
          zip:this.state.postcode,
      },
      name:this.state.name,
      email:this.state.email,
      phone:this.state.phone,
    }
    if (this.state.total_price > 0){
      let body = {
        amount:this.state.total_price * 100,
        stripe_token:tokenId,
        ship_type:this.state.shipping_type,
        checkout_type: 1,
        currency:'usd', //For test now
        transaction_type:0, // 0 : stripe ,1 : paypal
        shipping: this.state.shipping_type ? {} : ship_addr,
        cartItems:this.state.carts
      }

      payOrder(body).then( ret => {
          this.setState({isLoading:false});
          if (ret){
              if (ret.status === 200){
                  Alert.alert(
                    "",
                    "Pay Order Success",
                    [
                      {text:'OK', onPress:() => this.props.navigation.navigate('Buy')}
                    ],
                    { cancelable: false},
                  );
                  this.props.clearCartProduct();
              } else if (ret.status === 300 || ret.status === 303){
                  this.props.navigation.navigate('LoginView');
              } else {
                alert(ret.data.error);
              }
          } else {
            alert(ret.data.error);
          }
      } , err => {
            this.setState({isLoading:false});
            alert('Please check your network connection.');
      });
    }
    
  }

  

  onPayWithPoints = () => {
      if (!this.onValidationShippingAddress())
        return false;
      this.setState({isLoading:true});    
      const ship_addr ={
        address:{
            city:this.state.city,
            country:this.state.country,
            addressLine1:this.state.address,
            addressLine2:this.state.addressLine2,
            region:this.state.state,
            zip:this.state.postcode,
            
        },
        name:this.state.name,
        email:this.state.email,
        phone:this.state.phone,
      }
      if (this.state.total_price > 0){
        let body = {
          amount:this.state.total_price,          
          // order_id:id,
          cartItems:this.state.carts,
          checkout_type:0,
          ship_type:this.state.shipping_type,
          shipping: this.state.shipping_type ? {} : ship_addr
        }
  
        pay_with_pointsOrder(body).then( ret => {
            this.setState({isLoading:false});
            if (ret){
                if (ret.status === 200){
                    let points = 1454;
                    alert('Success to pay points to . Your points is ' + ret.myPoints.points);
                    this.props.clearCartProduct();
                    this.props.navigation.goBack();
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.navigate('LoginView');
                } else {
                  alert(ret.data.error);
                }
            } else {
              alert(ret.data.error);
            }
        } , err => {
              this.setState({isLoading:false});
              alert('Please check your network connection.');
        });
      }

  }
  checkout() {
    if (this.state.stripe){
        return stripe
        .paymentRequestWithCardForm()
        .then(stripeTokenInfo => {
            this.onPayWithStripeCard(this.state.total_price,stripeTokenInfo.tokenId);
        })
        .catch(error => {
            alert("Failed to get stripe token.");
        });
    } else if (this.state.points){
      //TODO
        this.onPayWithPoints();
    }
  }

  

  render() {
    var left = (
      <Left style={{flex:1}}>
        <Button transparent>
          <Icon name='ios-arrow-back' onPress={() => this.props.navigation.goBack()}/>
        </Button>
      </Left>
    );
    var right =(
      <Right style={{flex:1}}>
        <Text style={{color:'#ffffff'}}>{this.state.total_price}$</Text>
      </Right>
    );

    const shipping_address = (
            <View>
            <Text style={{marginTop: 15, fontSize: 18}}>Shipping information</Text>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Name' onChangeText={(text) => this.setState({name: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Email' onChangeText={(text) => this.setState({email: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Phone' onChangeText={(text) => this.setState({phone: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Country' onChangeText={(text) => this.setState({country: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Address' onChangeText={(text) => this.setState({address: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='City' onChangeText={(text) => this.setState({city: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Postcode' onChangeText={(text) => this.setState({postcode: text})} placeholderTextColor="#687373" />
            </Item>
            <Item regular style={{marginTop: 7}}>
                <Input placeholder='Note' onChangeText={(text) => this.setState({note: text})} placeholderTextColor="#687373" />
            </Item>
          </View>
    );
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        <Navbar left={left} right={right} title="CHECKOUT" />
        <Content padder>
          <View style={{justifyContent:'center' , alignItems:'center' , flex:1,margin:1}}>
              <Text style={{marginTop: 15, fontSize: 18}}>Use My Address For Shipping</Text>
              <Switch
                onValueChange={value => this.setState({ shipping_type: value })}
                value={this.state.shipping_type}
              />
          </View>
          {
              !this.state.shipping_type && shipping_address
          }
          <Text style={{marginTop: 15, fontSize: 18}}>Your order</Text>
          <View style={styles.invoice}>
            <List>
                {this.renderItems()}
            </List>
            <View style={styles.line} />
            <Grid style={{paddingLeft: 10, paddingRight: 10, marginTop: 7}}>
              <Col>
                <Text style={{fontSize: 18, fontStyle: 'italic'}}>Total</Text>
              </Col>
              <Col>
                <Text style={{textAlign: 'right', fontSize: 18, fontWeight: 'bold'}}>{this.state.total_price + "$"}</Text>
              </Col>
            </Grid>
          </View>
          <View>
            <Text style={{marginTop: 15, marginBottom: 7, fontSize: 18}}>Payement method</Text>
            <ListItem style={{borderWidth: 1, borderColor: 'rgba(149, 165, 166, 0.3)', paddingLeft: 10, marginLeft: 0}}>
              <Text>Pay with stripe</Text>
              <FAIcon name="cc-mastercard" size={20} color="#c0392b" style={{marginLeft: 7}} />
              <FAIcon name="cc-visa" size={20} color="#2980b9" style={{marginLeft: 2}} />
              <Right>
                <Radio selected={this.state.stripe} onPress={() => this.setState({stripe: true, paypal: false , points:false})} />
              </Right>
            </ListItem>
            {/* <ListItem style={{borderWidth: 1, borderColor: 'rgba(149, 165, 166, 0.3)', paddingLeft: 10, marginLeft: 0, borderTopWidth: 0}}>
              <Text>Pay with Paypal</Text>
              <FAIcon name="cc-paypal" size={20} color="#34495e" style={{marginLeft: 7}} />
              <Right>
                <Radio selected={this.state.paypal} onPress={() => this.setState({stripe: false, paypal: true , points:false})} />
              </Right>
            </ListItem> */}
            <ListItem style={{borderWidth: 1, borderColor: 'rgba(149, 165, 166, 0.3)', paddingLeft: 10, marginLeft: 0, borderTopWidth: 0}}>
              <Text>Pay with wallet/points</Text>
              <FAIcon name="google-wallet" size={20} color="#34495e" style={{marginLeft: 7}} />
              <Right>
                <Radio selected={this.state.points} onPress={() => this.setState({stripe: false, paypal: false, points:true})} />
              </Right>
            </ListItem>
          </View>
          <View style={{marginTop: 10, marginBottom: 10, paddingBottom: 7}}>
            <Button onPress={() => this.checkout()} style={{backgroundColor: Colors.navbarBackgroundColor}} block iconLeft disabled={this.state.isPaymentPending}>
              <Icon name='ios-card' />
              <Text style={{color: '#fdfdfd'}}>Proceed to payement</Text>
            </Button>
          </View>
         
        </Content>
        {
              this.state.isLoading == true &&
              <View style={styles.loading}>
                  <View style={styles.loaderView}>
                      <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                      <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                  </View>
              </View>
          }
      </Container>
    );
  }

  renderItems() {
    let items = [];
    this.state.products.map((item, i) => {
      items.push(
        <ListItem
          key={i}
          style={{marginLeft: 0}}
        >
          <Body style={{paddingLeft: 10}}>
            <Text style={{fontSize: 18}}>
              {this.onGetCountPerProduct(item._id) > 1 ? this.onGetCountPerProduct(item._id) + "x " : null}
              {item.name}              
            </Text>
          </Body>
          <Right>
            <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.price}{item.price_unit}</Text>
          </Right>
        </ListItem>
      );
    });
    return items;
  }



}

const styles = {
  invoice: {
    paddingLeft: 20,
    paddingRight: 20
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#777',
    opacity:0.9,
    zIndex:999999999999999999
},
loaderView: {
    //width:scale(250),
    //height:verticalScale(60),
    backgroundColor:'#54C540',
    borderRadius:5,
    flexDirection:'row',
    alignItems:'center'
},
activityIndicator: {
    //margin:scale(15)
},
loadingText:{
    color:'#fff',
    //fontSize:scale(14),
},
};
export default connect(mapStateToProps,mapDispatchToProps)(Checkout);