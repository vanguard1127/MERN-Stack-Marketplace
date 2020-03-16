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
    FlatList,RefreshControl,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon } from 'react-native-elements'
import { Container, Content,  Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail} from 'native-base';
import Navbar from './../../components/Navbar';

import {styles} from './../values/Styles';
const {width, height} = Dimensions.get('window');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addCartProduct } from './../../components/redux/actions';
import { getUsers } from '../../../services/api/httpclient';

const mapDispatchToProps = dispatch => (
    bindActionCreators({
      addCartProduct,
    }, dispatch)
  );
const mapStateToProps = (state) => {
    const { carts } = state
    return { carts }
  };

class UsersView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users:[],
            page:0,
            limit:10,
            totalCount:0,

            keyword:"",
            loading :false,
            isRefreshing: false,
            canLoadMore : false,

        }
    }
    componentDidMount(){
        this.onGetUsers();
    }

    
    onClickListener = (viewId) => {       
        
    }
    onGetUsers (){        
        let payload = {page: this.state.page , limit: this.state.limit , keyword:this.state.keyword};
        this.setState({loading:true});
        getUsers(payload).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        if (this.state.page === 0){
                            this.setState({users:ret.data.users});
                        } else if (this.state.page > 0){
                            this.setState({users:[...this.state.users,...ret.data.users]});
                        }
                        if (ret.data.users.length >= this.state.limit){
                            this.setState({canLoadMore:true})
                        } else {
                            this.setState({canLoadMore:false});
                        }
                        this.setState({isRefreshing:false});
                        this.setState({loading:false});
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
    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <FontAwesomeIcon name="user" size={22} color={tintColor} />
        )
    }
    
    onItemClick = (rowData) => {
        this.props.navigation.navigate('AnyProfile',{
            type:'anyProfile',
            id:rowData._id
        });
    }
    renderFooter = () => {
        if (!this.state.loading) return null;
        return (
            <ActivityIndicator
              style={{ color: '#000' }}
            />)
      }
      onRefresh(){
        this.setState({ isRefreshing: true, page:0 } , () => this.onGetUsers());
    }    
    onLoadMore = () => {
        if (!this.state.loading && this.state.canLoadMore) {
            this.setState({page: this.state.page + 1} ,() => this.onGetUsers());
            
        }
        
    };
    renderItem = (item) => {
        return (
            <ListItem
                key={item._id}                
                onPress={() => this.onItemClick(item)}
                >
                <Thumbnail square style={{width: 80, height: 80}} 
                source={item.photo ? {uri: item.photo} : (require('./../../../../images/ic_emptyuser.jpg'))} />
                <Body style={{marginLeft: 10}}>
                    <Text style={{fontSize: 18}}>
                        {item.first_name} {item.last_name}
                    </Text>
                    <Text style={{marginTop:5,fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.email}</Text>                
                </Body>
                <Right>
                    <Text>{item.phone_number}</Text>     
                </Right>
            </ListItem>
            );
        };

    // renderItems = () => {
    //     let items = [];
    //     this.state.users.map((item, i) => {
    //       items.push(
    //         <ListItem
    //           key={i}
    //           last={this.state.users.length === i+1}
    //           onPress={() => this.onItemClick(item)}
    //         >
    //           <Thumbnail square style={{width: 80, height: 60}} source={{ uri: item.image_url }} />
    //           <Body>
    //             <Text style={{fontSize: 18}}>
    //               {item.title}
    //             </Text>
    //             <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>{item.description}</Text>                
    //           </Body>
    //           <Right>
    //             <Text>{item.price}</Text>     
    //           </Right>
    //         </ListItem>
    //       );
    //     });
    //     return items;
    // }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="menu" onPress ={() => this.props.navigation.openDrawer()}></Icon>
            </Left>
          );
          var body = (
                <Body style={{flex:3}}>
                    <View style={styles.searchInputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/metro/26/000000/search.png'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Search..."
                                underlineColorAndroid='transparent'
                                value={this.state.keyword}
                                onChangeText={(keyword) => this.setState({keyword})}/>
                    </View>
                </Body>
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
                <Navbar left={left}  body={body} title="Users" />
                <View style={{flex:1}}>
                    <View style={styles.container}>

                    <FlatList
                        style={{ width: '100%' }}
                        data={this.state.users}
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
                    {/* <Content style={{paddingRight: 10}}>
                        <List>
                            {this.renderItems()}
                        </List>
                    </Content> */}
                    </View>
                </View>

            </View>
        );
    }
}

const itemStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        marginLeft:16,
        marginRight:16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 5,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    title: {
        fontSize: 16,
        color: '#000',
    },
    container_text: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 12,
        justifyContent: 'center',
    },
    description: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    photo: {
        height: 50,
        width: 50,
    },
});

export default connect(mapStateToProps,mapDispatchToProps)(UsersView);