/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Image, Dimensions, TouchableWithoutFeedback, ActivityIndicator} from 'react-native';
import { View, Container, Content, Button, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
// import { Actions } from 'react-native-router-flux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { getProduct } from '../../../services/api/httpclient';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addCartProduct , decCartProduct ,setCartProduct} from './../../components/redux/actions';

// Our custom files and classes import
import Colors from './../values/Colors';
import Text from './../../components/Text';
import Navbar from './../../components/Navbar';
import { default as ProductComponent } from './../../components/Product';
import {styles} from './../values/Styles';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { getData } from '../../../utils/AppUtils';
import AsyncImageAnimated from 'react-native-async-image-animated';

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    addCartProduct,decCartProduct,setCartProduct
  }, dispatch)
);
const mapStateToProps = (state) => {
  const { total_quantity , total_price ,carts } = state
  return { total_quantity , total_price ,carts }
};
class ProductView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: {},
      activeSlide: 0,
      quantity: 1,

      product_id:'',
      images:[],
      isLoading:false,

      viewType:'',
    };
  }

  componentWillMount() {
    //get the product with id of this.props.product.id from your server
    const id = this.props.navigation.getParam('id');
    const type = this.props.navigation.getParam('type');
    this.setState({viewType:type});    
    this.setState({product_id:id});
    this.onGetProduct(id);

    console.log('navigation = ' + JSON.stringify(this.props));
  }

  onGetProduct(id){
    this.setState({isLoading:true});
    getProduct(id).then( ret => {      
        this.setState({isLoading:false});
        if (ret){
            if (ret.status === 200){
                if (ret.data.success === true){       
                  this.setState({ product: ret.data.product});
                  let images = [];
                  ret.data.product.photos.map((photo) => {
                      images.push({src:{uri:photo.src} , type:1});
                  });                  
                  this.setState({images:images});

                } else {
                    alert(ret.data.error);
                }
            } else if (ret.status === 300 || ret.status === 303){
              this.props.navigation.replace('LoginView');
            } else {
                alert(ret.data.error);
            }
        }
    } , err => {
        alert("Please check your network.");
        this.setState({isLoading:false});
    });
  }
  _renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback
        key={index}
        onPress={() => this.openGallery(index)}
      >
        {/* <Image
          source={item.src}
          style={{ width: Dimensions.get('window').width, height: 350 }}
          resizeMode="cover"
        /> */}
        <AsyncImageAnimated
        source={item.src.uri !== "" ?  item.src : (require('./../../../../images/product.png'))}
        placeholderSource={require('./../../../../images/product.png')}
        style={{
            height: 350,
            width: Dimensions.get('window').width,                        
        }}/>
      </TouchableWithoutFeedback>
    );
  }


  openGallery = (pos) => {
    // Actions.imageGallery({ images: this.state.product.images, position: pos });
    this.props.navigation.navigate('Gallery' , {
       images:this.state.images,
       position:pos
    })
  }

  addToCart() {    
    this.props.addCartProduct({product: this.state.product, qty : this.state.quantity}); 
  }

  componentDidMount() {
  }

  renderCartIcon = () =>{
    if (this.props.total_quantity > 0)
        return (<Text style={{position:'absolute', backgroundColor:'red', borderRadius:10, color:'white', width:20, height:20, textAlign:'center', left:5, top:0}}>{this.props.total_quantity}</Text>);
  }
  
  render() {
    var left = (
      <Left style={{ flex: 1 }}>
        <Button transparent onPress ={() => this.props.navigation.goBack()}>
          <Icon name='ios-arrow-back' />
        </Button>
      </Left>
    );
    var right = (
      <Right style={{flex:1}}>
              <View style={styles.cartContainer}>
                  <AntDesignIcon name="shoppingcart" size={40} onPress ={() => this.props.navigation.navigate('OrderCart')}/>
                  {this.renderCartIcon()}
              </View>
      </Right>
    );
    return (
      <Container style={{ backgroundColor: '#fdfdfd' }}>
        {
            this.state.isLoading == true &&
            <View style={styles.loading}>
                <View style={styles.loaderView}>
                    <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                    <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                </View>
            </View>
        }
        <Navbar left={left} right={right} title={this.state.product.name} />
        <Content>
          <Carousel
            data={this.state.images}
            renderItem={this._renderItem}
            ref={(carousel) => { this._carousel = carousel; }}
            sliderWidth={Dimensions.get('window').width}
            itemWidth={Dimensions.get('window').width}
            onSnapToItem={(index) => this.setState({ activeSlide: index })}
            enableSnap={true}
          />
          <Pagination
            dotsLength={this.state.images.length}
            activeDotIndex={this.state.activeSlide}
            containerStyle={{ backgroundColor: 'transparent', paddingTop: 0, paddingBottom: 0, marginTop: -15 }}
            dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.92)'
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
          <View style={{ backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center' }}>
            <Grid>
              <Col size={3}>
                <Text style={{ fontSize: 18 }}>{this.state.product.name}</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.product.price}{this.state.product.price_unit}</Text>
              </Col>
            </Grid>
            </View>
            {
              this.state.viewType !== 'onlyView' && (
                <View style={{ backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center' }}>
                <Grid>
                  <Col>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text>Quantity:</Text>
                    </View>
                  </Col>
                  <Col size={3}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <Button block icon transparent onPress={() => this.setState({ quantity: this.state.quantity > 1 ? this.state.quantity - 1 : 1 })} >
                        <Icon name='ios-remove' style={{ color: Colors.navbarBackgroundColor }} />
                      </Button>
                      <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', paddingLeft: 30, paddingRight: 30 }}>
                        <Text style={{ fontSize: 18 }}>{this.state.quantity}</Text>
                      </View>
                      <Button block icon transparent onPress={() => this.setState({ quantity: this.state.quantity + 1 })}>
                        <Icon style={{ color: Colors.navbarBackgroundColor }} name='ios-add' />
                      </Button>
                    </View>
                  </Col>
                </Grid>
                <Grid style={{ marginTop: 15 }}>
                  <Col size={3}>
                    <Button block onPress={this.addToCart.bind(this)} style={{ backgroundColor: Colors.navbarBackgroundColor }}>
                      <Text style={{ color: "#fdfdfd", marginLeft: 5 }}>Add to cart</Text>
                    </Button>
                  </Col>
                  <Col>                
                  </Col>
                </Grid>
                </View>
                )
            }
          <View style={{ backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center' }}>
            <View style={{ marginTop: 15, padding: 10, borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)' }}>
              <Text style={{ marginBottom: 5 }}>Description</Text>
              <View style={{ width: 50, height: 1, backgroundColor: 'rgba(44, 62, 80, 0.5)', marginLeft: 7, marginBottom: 10 }} />
              <NBText note>
                {this.state.product.description}
              </NBText>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
  

}
export default connect(mapStateToProps,mapDispatchToProps)(ProductView);
