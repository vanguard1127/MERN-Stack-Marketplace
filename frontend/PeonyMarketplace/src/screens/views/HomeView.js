import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    Dimensions,
    View,
    TextInput,    
    Image,
    Alert,FlatList,
    ActivityIndicator,
    Platform,RefreshControl,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon,Card, } from 'react-native-elements'
import { Container, Content,  Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail} from 'native-base';
import { Dropdown } from 'react-native-material-dropdown';
import Navbar from './../components/Navbar';

import {styles} from './values/Styles';
const {width, height} = Dimensions.get('window');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addCartProduct,setCartProduct,setUserData } from './../components/redux/actions';
import { getProducts , userUpdate} from '../../services/api/httpclient';
import { getData,storeData } from '../../utils/AppUtils';
import AsyncImageAnimated from 'react-native-async-image-animated';
import { withNavigationFocus } from 'react-navigation';

const mapDispatchToProps = dispatch => (
    bindActionCreators({
      addCartProduct,setCartProduct,setUserData
    }, dispatch)
  );
const mapStateToProps = (state) => {
    const { total_quantity,cart } = state
    return { total_quantity,cart }
  };

class HomeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products:[],
            page:0,
            limit:10,
            totalCount:0,

            keyword:"",
            category_id:'-1',
            categories:[],

            loading :false,
            isRefreshing: false,
            canLoadMore : false,

            fcmToken:'',
            user_id:'',
            isLoggedIn:false,
        }
        this.onCategorySelectIndex = this.onCategorySelectIndex.bind(this);
    }
    componentDidUpdate(prevProps){
        if (prevProps.isFocused !== this.props.isFocused) {
            // Use the `this.props.isFocused` boolean
            // Call any action
            this.onGetProducts();
          }
    }

    async componentDidMount(){  
        this.onSetCateogries([]); 
        const email = this.props.navigation.getParam('email');
        if (email)
        {
            const photo =this.props.navigation.getParam('photo');
            const user_type = this.props.navigation.getParam('user_type');
            const user_id = this.props.navigation.getParam('user_id');
            let image ;
            if (photo === ''){
                image = require('./../../../images/ic_emptyuser.jpg');
            } else if (userInfo.photo !== ''){
                image = {uri:userInfo.photo};
            }
            this.props.setUserData({photo:image, email:userInfo.email , user_type: user_type});
            this.setState({user_id:user_id});
        }
        else {
            await getData('isLoggedIn').then( ret => {
                if (ret !== 'true'){
                    this.props.navigation.replace('LoginView');
                }
            });   
            await getData('fcmToken').then( ret => {
                this.setState({fcmToken:ret});
            });   
            await getData('cart').then((ret) => {
                this.props.setCartProduct({cart:JSON.parse(ret)});
            });
            await getData('userInfo').then((ret) => {
                let userInfo = JSON.parse(ret);
                let image ;
                
                if (userInfo.photo === ''){
                    image = require('./../../../images/ic_emptyuser.jpg');
                } else if (userInfo.photo !== ''){
                    image = {uri:userInfo.photo};
                }
    
                let user_type = userInfo.user_type;            
                this.props.setUserData({photo:image, email:userInfo.email , user_type: user_type});
                this.setState({user_id:userInfo._id});
            });
        }
        this.onUserUpdate();
        this.onGetProducts();

    }

    componentWillReceiveProps(nextProps){
        
    }

    onSetCateogries(cates){
        let categories = [{
            _id:'-1', name:'All'
        }]                     
        categories = [...categories,...cates];
        this.setState({categories: categories});              
    }
    onUserUpdate(){
        let payload = {_id:this.state.user_id,device_id:this.state.fcmToken, device_type:Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 1 : 2}
        userUpdate(payload).then(ret =>{
            if (ret)
            {      
                if (ret.status ===  200){
                    if (ret.data.success === true){
                        if (this.state.userType !== 'anyProfile'){
                            storeData('userInfo',JSON.stringify(ret.data.user));
                        }
                    }
                } else if (ret.status === 300 || ret.status === 303){
                    this.props.navigation.replace('LoginView');      
                }  else {                    
                }              
            }
        } , err=>{
        });
    }
    onGetProducts (){        
        let payload = {page: this.state.page , limit: this.state.limit , keyword:this.state.keyword , category_id : this.state.category_id};
        this.setState({loading:true});
        getProducts(payload).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        if (this.state.page === 0){
                            this.setState({products:ret.data.products});
                        } else if (this.state.page > 0){
                            this.setState({products:[...this.state.products,...ret.data.products]});
                        }
                        if (ret.data.products.length >= this.state.limit){
                            this.setState({canLoadMore:true})
                        } else {
                            this.setState({canLoadMore:false});
                        }
                        this.setState({isRefreshing:false});
                        this.setState({loading:false});
                        this.setState({totalCount: ret.data.totalCount});   
                        this.onSetCateogries(ret.data.categories);
                        
                    }
                } else if (status === 300 || status === 303){
                    this.props.navigation.replace('LoginView');             
                } else {
                    alert(ret.data.error);
                }
                
            }
        } ,err=>{
            alert("Please check your network.");
            this.setState({ isRefreshing: false});
            this.setState({isLoading:false});
        });
    }
    
    onClickListener = (viewId) => {       
        if (viewId === 'setlocation'){
            this.props.navigation.replace('Map');
        } 
    }
    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <FontAwesomeIcon name="home" size={22} color={tintColor} />
        )
    }
    
    onItemClick = (rowData) => {
        this.props.navigation.navigate('Product',{
            id:rowData._source.id
        });
    }
    

    renderCartIcon = () =>{
        if (this.props.total_quantity > 0)
            return (<Text style={{position:'absolute', backgroundColor:'red', borderRadius:10, color:'white', width:20, height:20, textAlign:'center', left:5, top:0}}>{this.props.total_quantity}</Text>);
    }

    onCategorySelectIndex(value, index, data){
        let item = data[index];        
        this.setState({category_id:item._id} , () => this.onGetProducts());
    }
    onRefresh(){
        this.setState({ isRefreshing: true, page:0 } , () => this.onGetProducts());
    }    
    onLoadMore = () => {
        if (!this.state.loading && this.state.canLoadMore) {
            this.setState({page: this.state.page + 1} ,() => this.onGetProducts());
            
        }
        
    };
    renderFooter = () => {
        if (!this.state.loading) return null;
        return (
            <ActivityIndicator
              style={{ color: '#000' }}
            />)
      }
      
    renderItem = (item) => {
        return (
            <ListItem
                key={item._id}                
                onPress={() => this.onItemClick(item)}
                >
                <AsyncImageAnimated
                source={item._source.photos.length > 0 ? {uri: item._source.photos[0].src} : (require('./../../../images/ic_logo_cir_red_small.png'))}
                placeholderSource={require('./../../../images/ic_logo_cir_red_small.png')}
                style={{
                    height: 80,
                    width: 60,                        
                }}/>
                <Body style={{marginLeft: 10}}>
                    <Text style={{fontSize: 18}}>
                        {item._source.name}
                    </Text>
                    <Text style={{marginTop:5,fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item._source.description}</Text>                
                </Body>
                <Right>
                    <Text>{item._source.price}{item._source.price_unit}</Text>     
                </Right>
            </ListItem>
            );
        };
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="menu" onPress ={() => this.props.navigation.openDrawer()}></Icon>
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
          var body = (
                <Body style={{flex:3}}>
                    <View style={styles.searchInputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/metro/26/000000/search.png'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Search..."
                                underlineColorAndroid='transparent'
                                onChangeText={(keyword) => this.setState({keyword} , () => {
                                    this.onGetProducts()
                                })}/>
                    </View>
                </Body>
          );
        
        return (
            <View style={styles.container}>
                <Navbar left={left} right={right} body={body} title="Home" />
                <Dropdown
                        label='Category'
                        data={this.state.categories}                        
                        valueExtractor={(item , index) => item.name}
                        containerStyle={{padding:10}}
                        onChangeText={this.onCategorySelectIndex}
                        value="All"
                    />
                <View style={{flex:1}}>
                    <FlatList
                        style={{ width: '100%' }}
                        data={this.state.products}
                        extraData={this.state}
                        refreshControl={
                            <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.onRefresh.bind(this)}
                            />}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReachedThreshold={0.1}     
                        ItemSeparatorComponent={this.renderSeparator}                   
                        ListFooterComponent={this.renderFooter.bind(this)}
                        onEndReached={this.onLoadMore.bind(this)}
                        renderItem={({item}) => this.renderItem(item)}
                        />
                        
                </View>
                <TouchableHighlight style={[styles.rectangleContainer, styles.normalButton , {width:width}]} onPress={() => this.onClickListener('setlocation')} >
                    <Text style={styles.loginText}>Set Location</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const ownStyles = StyleSheet.create({
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      },
});

export default connect(mapStateToProps,mapDispatchToProps)(withNavigationFocus(HomeView));