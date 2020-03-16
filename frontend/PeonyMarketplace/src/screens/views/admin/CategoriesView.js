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
    ActivityIndicator,RefreshControl,
    FlatList,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon } from 'react-native-elements'
import { Container, Content, Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail } from 'native-base';
import { Dropdown } from 'react-native-material-dropdown';
import Navbar from './../../components/Navbar';
import { getCategories } from './../../../services/api/httpclient';
import { styles } from './../values/Styles';
const { width, height } = Dimensions.get('window');
import { withNavigationFocus } from 'react-navigation';

class CategoriesView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            page: 0,
            limit: 10,
            totalCount: 0,

            keyword: "",
            isRefreshing:false,
            loading:false,
            canLoadMore:false,
        }
    }
    componentDidMount() {
        this.onGetCategories();
    }
    componentDidUpdate(prevProps){
        if (prevProps.isFocused !== this.props.isFocused) {
            // Use the `this.props.isFocused` boolean
            // Call any action
            this.onGetCategories();
          }
    }

    static navigationOptions = {
        drawerIcon: ({ tintColor }) => (
            <FontAwesomeIcon name="product-hunt" size={22} color={tintColor} />
        )
    }

    onGetCategories(){
        let payload = {page: this.state.page , limit: this.state.limit , keyword:this.state.keyword , category_id : this.state.category_id};
        this.setState({loading:true});
        getCategories(payload).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        if (this.state.page === 0){
                            this.setState({categories:ret.data.categories});
                        } else if (this.state.page > 0){
                            this.setState({categories:[...this.state.categories,...ret.data.categories]});
                        }
                        if (ret.data.categories.length >= this.state.limit){
                            this.setState({canLoadMore:true})
                        } else {
                            this.setState({canLoadMore:false});
                        }
                        this.setState({isRefreshing:false});
                        this.setState({loading:false});
                        this.setState({totalCount: ret.data.totalCount});                        
                    }
                } else if (status === 300 || status === 303){
                    NavigationService.navigate('LoginView');          
                } else {
                    alert(ret.data.error);
                }
                
            }
        } ,err=>{
            alert("Please check your network." + JSON.stringify(err));
            this.setState({isLoading:false});
        });
    }
    
    onCategorySelectIndex(value, index, data){
        let item = data[index];        
        this.setState({category_id:item._id} , () => this.onGetCategories());
    }
    onRefresh(){
        this.setState({ isRefreshing: true, page:0 } , () => this.onGetCategories());
    }    
    onLoadMore = () => {
        if (!this.state.loading && this.state.canLoadMore) {
            this.setState({page: this.state.page + 1} ,() => this.onGetCategories());
            
        }
        
    };
    renderFooter = () => {
        if (!this.state.loading) return null;
        return (
            <ActivityIndicator
              style={{ color: '#000' }}
            />)
      }


    onItemClick = (item) => {
        this.props.navigation.navigate('CategoryEdit' , {
            id: item._id
        });
    }
    renderItem = (item) => {
        return(
        <ListItem
            key={item._id}
            onPress={() => this.onItemClick(item)}
        >
            <Thumbnail square style={{ width: 80, height: 100 }} source={(require('./../../../../images/ic_logo_cir_red_small.png'))} />
            <Body>
                <Text style={{ fontSize: 18 }}>
                    {item.name}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{item.description}</Text>
            </Body>
            <Right>            
            </Right>
        </ListItem>)
    }
    
    render() {
        var left = (
            <Left style={{ flex: 1 }}>
                <Icon name="menu" onPress={() => this.props.navigation.openDrawer()}></Icon>
            </Left>
        );
        var right = (
            <Right style={{ flex: 1 }}>
                {
                    <View style={styles.cartContainer}>
                        <AntDesignIcon name="pluscircleo" size={25} onPress={() => this.props.navigation.navigate('CategoryEdit',{'id':-1})} />
                    </View>
                }
            </Right>
        );
        var body = (
            <Body style={{ flex: 3 }}>
                <View style={styles.searchInputContainer}>
                    <Image style={styles.inputIcon} source={{ uri: 'https://img.icons8.com/metro/26/000000/search.png' }} />
                    <TextInput style={styles.inputs}
                        placeholder="Search..."
                        underlineColorAndroid='transparent'
                        onChangeText={(keyword) => this.setState({ keyword })} />
                </View>
            </Body>
        );

        return (
            <View style={styles.container}>
                {
                    this.state.isLoading == true &&
                    <View style={styles.loading}>
                        <View style={styles.loaderView}>
                            <ActivityIndicator color="#fff" style={styles.activityIndicator} />
                            <Text style={styles.loadingText}>{this.state.loadingText}</Text>
                        </View>
                    </View>
                }
                <Navbar left={left} right={right} body={body} title="Categories" />
                <View style={{ flex: 1 }}>
                    <FlatList
                        style={{ width: '100%' }}
                        data={this.state.categories}
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
                        renderItem={({ item }) => this.renderItem(item)}
                    />

                    {/* <Content style={{paddingRight: 10}}>
                    <List>
                        {this.renderItems()}
                    </List>
                </Content> */}
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
        marginLeft: 16,
        marginRight: 16,
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

export default withNavigationFocus(CategoriesView);