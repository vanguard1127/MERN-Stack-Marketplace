import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Dimensions,
    ScrollView,
    View,
    TextInput,
    Button,
    TouchableHighlight,
    Image,
    Alert,FlatList,RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Container, Content,  Header, Left, Right, Body, Title, List, ListItem, Thumbnail} from 'native-base';
import Navbar from './../components/Navbar';
const {width }= Dimensions.get('window');
import Colors from './values/Colors';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import {styles} from './values/Styles';
import { getOrders } from '../../services/api/httpclient';
import { withNavigationFocus } from 'react-navigation';

class MySellOrdersView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            none_orders:[],
            none_page:0,
            none_limit:10,
            none_totalCount:0,

            confirmed_orders:[],
            confirmed_page:0,
            confirmed_limit:10,
            confirmed_totalCount:0,

            shipped_orders:[],
            shipped_page:0,
            shipped_limit:10,
            shipped_totalCount:0,

            keyword:"",
            isLoading :false,
            
            index:0,
            routes:[
               { key: 'none', title: 'None' },
               { key: 'confirmed', title: 'Confirmed' },
               { key: 'shipped', title: 'Shipped' },
            ],


            none_Loading :false,
            none_isRefreshing: false,
            none_canLoadMore : false,

            confirmed_Loading :false,
            confirmed_isRefreshing: false,
            confirmed_canLoadMore : false,

            shipped_Loading :false,
            shipped_isRefreshing: false,
            confirmed_canLoadMore : false,

        }
    }
    componentDidUpdate(prevProps){
      if (prevProps.isFocused !== this.props.isFocused) {
          // Use the `this.props.isFocused` boolean
          // Call any action
          this.onGetNoneOrders();
          this.onGetConfirmedOrders();
          this.onGetShippedOrders();
        }
  }

    componentDidMount(){
        this.onGetNoneOrders();
        this.onGetConfirmedOrders();
        this.onGetShippedOrders();
    }
    onItemClick = (rowData) => {
      this.props.navigation.navigate('SellOrderDetail' , {
        id:rowData._id
      });
    }
    renderFooter = () => {
      if (!this.state.none_Loading) return null;
      return (
          <ActivityIndicator
            style={{ color: '#000' }}
          />)
    }
      onPress = () => {
          this.props.navigation.toggleDrawer();
      }
      
      static navigationOptions = {
          drawerIcon : ({tintColor}) => (
              <FontAwesomeIcon name="product-hunt" size={22} color={tintColor}/>
          )
      }
    onGetNoneOrders(){
      let payload = {page: this.state.none_page , limit: this.state.none_limit ,type:0};//TODO insert own userid;              
      getOrders(payload).then(ret =>{
          // this.setState({isLoading:false});
          if (ret)
          {
            let status = ret.status;
                if (status === 200){
                  if (ret.data.success === true){
                      if (this.state.none_page === 0){
                          this.setState({none_orders:ret.data.orders});
                      } else if (this.state.none_page > 0){
                          this.setState({none_orders:[...this.state.none_orders,...ret.data.orders]});
                      }
                      if (ret.data.orders.length >= this.state.none_limit){
                          this.setState({none_canLoadMore:true})
                      } else {
                          this.setState({none_canLoadMore:false});
                      }
                      this.setState({none_totalCount: ret.data.totalCount});
                      this.setState({none_isRefreshing:false});
                      this.setState({none_Loading:false});
                  }
            } else if (status === 300 || status === 303){
                this.props.navigation.navigate('LoginView');             
            } else {
                alert(ret.data.error);
            }
          }
      } , err=>{
        alert("Please check your network." + JSON.stringify(err));
        this.setState({isLoading:false});
      });
    }
    onNoneRefresh(){
      this.setState({ none_isRefreshing: true, none_page:0 } , () => this.onGetNoneOrders());
    }    
    onNoneLoadMore = () => {
        if (!this.state.none_Loading && this.state.none_canLoadMore) {
            this.setState({none_page: this.state.none_page + 1 , none_Loading:true} ,() => this.onGetNoneOrders());
        }
        
    };    
    renderNoneItem = (item) => {
          return(
            <ListItem
              key={item._id}
              onPress={() => this.onItemClick(item)}
            >
              <Thumbnail square style={{width: 70, height: 60}} source={require('./../../../images/ic_logo_cir_red_small.png')}/>
              <Body>
                <Text style={{fontSize: 18}}>
                  {item._id}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.status === 0 ? "None" : item.status === 1 ? "Confirmed" : item.status === 2 ? "Shipped" : ""}</Text>                
              </Body>
              <Right>
                <Text>{item.buyer_id.name}</Text>     
              </Right>
            </ListItem>
          );
    }
    onGetConfirmedOrders(){
      let payload = {page: this.state.confirmed_page , limit: this.state.confirmed_limit ,type:1};//TODO insert own userid;        
      this.setState({confirmed_Loading:true});
      getOrders(payload).then(ret =>{
          // this.setState({isLoading:false});
          if (ret)
          {
            let status = ret.status;
                if (status === 200){
                  if (ret.data.success === true){
                      if (this.state.confirmed_page === 0){
                          this.setState({confirmed_orders:ret.data.orders});
                      } else if (this.state.confirmed_page > 0){
                          this.setState({confirmed_orders:[...this.state.confirmed_orders,...ret.data.orders]});
                      }
                      if (ret.data.orders.length >= this.state.confirmed_limit){
                        this.setState({confirmed_canLoadMore:true})
                      } else {
                          this.setState({confirmed_canLoadMore:false});
                      }
                      this.setState({confirmed_totalCount: ret.data.totalCount});
                      this.setState({confirmed_isRefreshing:false});
                      this.setState({confirmed_Loading:false});
                  }
            } else if (status === 300 || status === 303){
                this.props.navigation.navigate('LoginView');             
            } else {
                alert(ret.data.error);
            }
          }
      } , err=>{
        alert("Please check your network." + JSON.stringify(err));
        this.setState({isLoading:false});
      });
    }
    onConfirmedRefresh(){
      this.setState({ confirmed_isRefreshing: true, confirmed_page:0 } , () => this.onGetConfirmedOrders());
    }    
    onConfirmedLoadMore = () => {
        if (!this.state.confirmed_Loading && this.state.confirmed_canLoadMore) {
            this.setState({confirmed_page: this.state.confirmed_page + 1} ,() => this.onGetConfirmedOrders());
            
        }
        
    };    
    renderConfirmedItem = (item) => {
          return(
            <ListItem
              key={item._id}
              onPress={() => this.onItemClick(item)}
            >
              <Thumbnail square style={{width: 70, height: 60}} source={require('./../../../images/ic_logo_cir_red_small.png')}/>
              <Body>
                <Text style={{fontSize: 18}}>
                  {item._id}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.status === 0 ? "None" : item.status === 1 ? "Confirmed" : item.status === 2 ? "Shipped" : ""}</Text>                
              </Body>
              <Right>
                <Text>{item.buyer_id.name}</Text>     
              </Right>
            </ListItem>
          );
    }
    onGetShippedOrders(){
      let payload = {page: this.state.shipped_page , limit: this.state.shipped_limit ,type:2};//TODO insert own userid;        
      this.setState({shipped_Loading:true});
      getOrders(payload).then(ret =>{
          // this.setState({isLoading:false});
          
          if (ret)
          {
            let status = ret.status;
                if (status === 200){
                  if (ret.data.success === true){
                      if (this.state.shipped_page === 0){
                          this.setState({shipped_orders:ret.data.orders});
                      } else if (this.state.shipped_page > 0){
                          this.setState({shipped_orders:[...this.state.shipped_orders,...ret.data.orders]});
                      }
                      if (ret.data.orders.length >= this.state.shipped_limit){
                        this.setState({shipped_canLoadMore:true})
                      } else {
                          this.setState({shipped_canLoadMore:false});
                      }
                      this.setState({shipped_totalCount: ret.data.totalCount});
                      this.setState({shipped_isRefreshing:false});
                      this.setState({shipped_Loading:false});
                  }
            } else if (status === 300 || status === 303){
                this.props.navigation.navigate('LoginView');             
            } else {
                alert(ret.data.error);
            }
          }
      } , err=>{
        alert("Please check your network." + JSON.stringify(err));
        this.setState({isLoading:false});
      });
    }
    onShippedRefresh(){
      this.setState({ shipped_isRefreshing: true, shipped_page:0 } , () => this.onGetShippedOrders());
    }    
    onShippedLoadMore = () => {
        if (!this.state.shipped_Loading && this.state.shipped_canLoadMore) {
            this.setState({shipped_page: this.state.shipped_page + 1} ,() => this.onGetShippedOrders());
            
        }
        
    };    
    renderShippedItem = (item) => {
          return(
            <ListItem
              key={item._id}
              onPress={() => this.onItemClick(item)}
            >
              <Thumbnail square style={{width: 70, height: 60}} source={require('./../../../images/ic_logo_cir_red_small.png')}/>
              <Body>
                <Text style={{fontSize: 18}}>
                  {item._id}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.status === 0 ? "None" : item.status === 1 ? "Confirmed" : item.status === 2 ? "Shipped" : ""}</Text>                
              </Body>
              <Right>
                <Text>{item.buyer_id.name}</Text>     
              </Right>
            </ListItem>
          );
    }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="menu" onPress ={() => this.props.navigation.openDrawer()}></Icon>
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
                   <Navbar left={left} title="MySellOrders" />   
                   <ScrollableTabView
                    style={{marginTop: 5, }}
                    initialPage={1}
                    renderTabBar={()=><DefaultTabBar />}
                    >
                      <View style={[styles.scene]} tabLabel='None'>
                        <FlatList
                          style={{ width: '100%' }}
                          data={this.state.none_orders}
                          extraData={this.state}
                          refreshControl={
                              <RefreshControl
                              refreshing={this.state.none_isRefreshing}
                              onRefresh={this.onNoneRefresh.bind(this)}
                              />}
                          keyExtractor={(item, index) => index.toString()}
                          onEndReachedThreshold={0.4}     
                          ItemSeparatorComponent={this.renderSeparator}                   
                          ListFooterComponent={this.renderFooter.bind(this)}
                          onEndReached={this.onNoneLoadMore.bind(this)}
                          renderItem={({item}) => this.renderNoneItem(item)}
                          />
                      </View>
                      <View style={[styles.scene]} tabLabel='Confirmed'>
                        <FlatList
                          style={{ width: '100%' }}
                          data={this.state.confirmed_orders}
                          extraData={this.state}
                          refreshControl={
                              <RefreshControl
                              refreshing={this.state.confirmed_isRefreshing}
                              onRefresh={this.onConfirmedRefresh.bind(this)}
                              />}
                          keyExtractor={(item, index) => index.toString()}
                          onEndReachedThreshold={0.4}     
                          ItemSeparatorComponent={this.renderSeparator}                   
                          ListFooterComponent={this.renderFooter.bind(this)}
                          onEndReached={this.onConfirmedLoadMore.bind(this)}
                          renderItem={({item}) => this.renderConfirmedItem(item)}
                          />
                      </View>
                      <View style={[styles.scene]} tabLabel='Shipped'>
                        <FlatList
                          style={{ width: '100%' }}
                          data={this.state.shipped_orders}
                          extraData={this.state}
                          refreshControl={
                              <RefreshControl
                              refreshing={this.state.shipped_isRefreshing}
                              onRefresh={this.onShippedRefresh.bind(this)}
                              />}
                          keyExtractor={(item, index) => index.toString()}
                          onEndReachedThreshold={0.4}     
                          ItemSeparatorComponent={this.renderSeparator}                   
                          ListFooterComponent={this.renderFooter.bind(this)}
                          onEndReached={this.onShippedLoadMore.bind(this)}
                          renderItem={({item}) => this.renderShippedItem(item)}
                          />
                      </View>
                    </ScrollableTabView>
              </View>
            
        );
    }
}
  export default withNavigationFocus(MySellOrdersView);
