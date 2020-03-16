import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,    
    TouchableHighlight,    
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';

import { Container, Content, Icon, Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail, Grid, Col } from 'native-base';
import Navbar from '../../components/Navbar';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {getData ,storeData} from '../../../utils/AppUtils';
const {width} = Dimensions.get('window');
import {styles} from '../values/Styles';
import Colors from '../values/Colors';
import {getCartProducts , createOrdersWithCarts} from "../../../services/api/httpclient";
import { removeCartProduct , clearCartProduct} from '../../components/redux/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AsyncImageAnimated from 'react-native-async-image-animated';

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    removeCartProduct ,clearCartProduct
  }, dispatch)
);
const mapStateToProps = (state) => {
  const { total_quantity , total_price ,carts } = state
  return { total_quantity , total_price ,carts }
};

  
class OrderCartView extends Component {
    constructor(props) {
        super(props);
        this.state = {


            page:0,
            limit:10,
            totalCount:0,
            total_price:0,
            products:[],
            carts:[],
        }
    }
    componentDidMount(){
      this.onGetCartProducts({carts:this.props.carts, page :this.props.page, limit:this.props.limit});     
      
    }
    componentWillReceiveProps(nextProps) {
      let nextCarts = nextProps.total_quantity;
      let nowCarts = this.props.total_quantity;
      if (nextCarts !== nowCarts){
          this.onGetCartProducts({carts:nextProps.carts, page :this.props.page, limit:this.props.limit});
      }
    }
    onGetCartProducts(payload){
      this.setState({isLoading:true});
        getCartProducts(payload).then(ret =>{
          this.setState({isLoading:false});
            if (ret)
            {
              if (ret.status === 200){
                if (ret.data.success === true){
                  this.setState({responseErrorText :''});
                  this.setState({products:ret.data.products});
                  this.setState({totalCount: ret.data.totalCount});
                  
                  this.setState({totalPrice : this.calculateTotalPrice()});
                } else if (ret.status === 300 || ret.status === 303){
                  alert(ret.data.error);
                }
              } else if (ret.status === 300 || ret.status === 303){
                  this.props.navigation.navigate('LoginView');
              }else {
                alert(ret.data.error);
              }
        }
      } , err=>{
            alert("Please check your network.");
            this.setState({isLoading:false});
        });
    }
    calculateTotalPrice(){
      let price = 0;
      for (let value of Object.keys(this.props.carts)) {
          if (value !== undefined){
              let qty = this.props.carts[value];

              var mProduct = this.state.products.find(function(element) {
                  return element._id === value;
              });

              if (mProduct != undefined){
                  price += qty * mProduct.price; //TODO with using currency
              }                
            }
      }        
      return price;
    }
    onPress = () => {
        console.log(this.props)
        this.props.navigation.toggleDrawer();
    }

    onCreateOrderSuccess(){
      this.props.clearCartProduct({});
      this.props.navigation.goBack();
    }

    onCreateOrdersWithCarts(){
      createOrdersWithCarts({carts:this.props.carts}).then(ret =>{
          if (ret)
          {
            if (ret.status === 200){
              let message = 'Created Order:\n';
              let orders = ret.data.orders;
              orders.map((order) => {
                  message += order.seller.first_name + " " + order.seller.last_name;
              });
              Alert.alert(
                'Success',
                'message',
                [
                  {text: 'OK', onPress: () => this.onCreateOrderSuccess()},
                ]
              );
            } else if (ret.status === 300 || ret.status === 303){
                this.props.navigation.navigate('LoginView');     
            } else {
              alert(ret.data.error);
            }
          }
      } , err=>{
        alert("Please check your network.");
        this.setState({isLoading:false});
      });
  }
    onGetCountPerProduct(id){
        let carts = this.props.carts;
        let ret = 0;
        for (let value of Object.keys(carts)) {
          if (value !== undefined && value === id){
            ret = carts[value];        
            break;
          }
        }
        return ret;
    }
    renderItems() {
        let items = [];
        this.state.products.map((item, i) => {
          items.push(
            <ListItem
              key={i}
              last={this.state.products.length === i+1}
              onPress={() => this.itemClicked(item)}
            >
              <AsyncImageAnimated
                source={item.photos.length > 0 ? {uri: item.photos[0].src} : (require('./../../../../images/ic_logo_cir_red_small.png'))}
                placeholderSource={require('./../../../../images/ic_logo_cir_red_small.png')}
                style={{
                    height: 110,
                    width: 90,                        
                }}/>              
              <Body style={{paddingLeft: 10}}>
                <Text style={{fontSize: 18}}>
                  {this.onGetCountPerProduct(item._id) > 1 ? this.onGetCountPerProduct(item._id) + "x " : null}
                  {item.name}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.price}{item.price_unit}</Text>                
                
              </Body>
              <Right>
                <Button style={{marginLeft: -25}} transparent onPress={() => this.removeItemPressed(item)}>
                  <Icon size={30} style={{fontSize: 30, color: '#95a5a6'}} name='ios-remove-circle-outline' />
                </Button>
              </Right>
            </ListItem>
          );
        });
        return items;
      }
      removeItemPressed(item) {
        Alert.alert(
          'Remove '+item.name,
          'Are you sure you want this item from your cart ?',
          [
            {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'},
            {text: 'Yes', onPress: () => this.removeItem(item)},
          ]
        )
      }
    
      removeItem(itemToRemove) {
        this.props.removeCartProduct({product:itemToRemove});        
      }
    
      removeAllPressed() {
        Alert.alert(
          'Empty cart',
          'Are you sure you want to empty your cart ?',
          [
            {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'},
            {text: 'Yes', onPress: () => this.removeAll()}
          ]
        )
      }
    
      removeAll() {
        this.props.clearCartProduct({});
      }
    
      checkout() {
        this.props.navigation.navigate('Checkout',{
          carts:this.props.carts,
          products:this.state.products,
          total_price:this.calculateTotalPrice()
        });
      }
    
      itemClicked(item) {
        // Actions.product({product: item});
        this.props.navigation.navigate('Product' , {
          id:item._id
        })
      }
      onClickListener = (viewId) => {       
        if (viewId === 'login'){
        }
    }
    render() {
          var left = (
            <Left style={{ flex: 1 }}>
              <Button transparent onPress ={() => this.props.navigation.goBack()}>
                <Icon name='ios-arrow-back' />
              </Button>
            </Left>
          );    
          var right =(
              <Right style={{flex:1}}>
                <Text style={{color:'#ffffff'}}>{this.state.totalPrice}$</Text>
              </Right>
            );
        return (
            <View style={styles.container}>
              <Navbar left={left} right={right} title="My Order Cart" />  
                <View style={[styles.subContainer]}>                
                        <Container style={{backgroundColor: '#fdfdfd',width:width}}>
                        {this.state.products.length <=0 ?
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Icon name="ios-cart" size={38} style={{fontSize: 38, color: '#95a5a6', marginBottom: 7}} />
                            <Text style={{color: '#95a5a6'}}>Your cart is empty</Text>
                            </View>
                            :
                            <Content style={{paddingRight: 10}}>
                            <List>
                                {this.renderItems()}
                            </List>
                            <Grid style={{marginTop: 20, marginBottom: 10}}>
                                <Col style={{paddingLeft: 10,paddingRight: 5}}>
                                <Button onPress={() => this.checkout()} style={{backgroundColor: Colors.navbarBackgroundColor}} block iconLeft>
                                    <Icon name='ios-card' />
                                    <Text style={{color: '#fdfdfd'}}>Checkout</Text>
                                </Button>
                                </Col>
                                <Col style={{paddingLeft: 5, paddingRight: 10}}>
                                <Button onPress={() => this.removeAllPressed()} style={{borderWidth: 1, borderColor: Colors.navbarBackgroundColor}} block iconRight transparent>
                                    <Text style={{color: Colors.navbarBackgroundColor}}>Emtpy Cart</Text>
                                    <Icon style={{color: Colors.navbarBackgroundColor}} name='ios-trash' />
                                </Button>
                                </Col>
                            </Grid>
                            </Content>
                        }
                    </Container> 
                </View>
                {
                  this.state.isLoading == true &&
                  <View style={styles.loading}>
                      <View style={styles.loaderView}>
                          <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                          <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                      </View>
                  </View>
              }
            </View>
        );
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(OrderCartView);