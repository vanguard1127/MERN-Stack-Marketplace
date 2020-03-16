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
import { addCartProduct,setCartProduct,setUserPhoto } from './../components/redux/actions';
import { getMyProducts , getProducts,deleteProduct } from '../../services/api/httpclient';
import { getData } from '../../utils/AppUtils';
import { withNavigationFocus } from 'react-navigation';
import AsyncImageAnimated from 'react-native-async-image-animated';

const mapDispatchToProps = dispatch => (
    bindActionCreators({
      addCartProduct,setCartProduct,setUserPhoto
    }, dispatch)
  );
const mapStateToProps = (state) => {
    const { total_quantity,cart } = state
    return { total_quantity,cart }
  };

class MyProductsView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products:[],
            page:0,
            limit:10,
            totalCount:0,

            keyword:"",
            category_id:"-1",
            categories:[],



            loading :false,
            isRefreshing: false,
            canLoadMore : false,
            
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
    componentDidMount(){    
        this.onSetCateogries([]);     
        getData('cart').then((ret) => {
            this.props.setCartProduct({cart:JSON.parse(ret)});
        });
        getData('userInfo').then((ret) => {
            let userInfo = JSON.parse(ret);
            let image ;
            
            if (userInfo.photo === ''){
                image = require('./../../../images/ic_emptyuser.jpg');
            } else if (userInfo.photo !== ''){
                image = {uri:userInfo.photo};
            }
            //this.props.setUserPhoto({photo:image, email:userInfo.email});
        });
        this.onGetProducts();
    }
    onSetCateogries(cates){
        let categories = [{
            _id:'-1', name:'All'
        }]                     
        categories = [...categories,...cates];
        this.setState({categories: categories});              
    }
    onGetProducts (){        
        let payload = {page: this.state.page , limit: this.state.limit , keyword:this.state.keyword , category_id : this.state.category_id};
        this.setState({loading:true});
        
        getMyProducts(payload).then(ret =>{
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
    
    onClickListener = (viewId) => {       
        if (viewId === 'setlocation'){

        } 
    }
    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <FontAwesomeIcon name="home" size={22} color={tintColor} />
        )
    }
    
    onItemClick = (rowData) => {
        this.props.navigation.navigate('ProductEdit',{
            id:rowData._source.id
        });
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
                    <AntDesignIcon name="pluscircleo" size={25} onPress ={() => this.props.navigation.navigate('ProductEdit')}/>
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
                                onChangeText={(keyword) => this.setState({keyword} , () => this.onGetProducts())}/>
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

export default connect(mapStateToProps,mapDispatchToProps)(withNavigationFocus(MyProductsView));