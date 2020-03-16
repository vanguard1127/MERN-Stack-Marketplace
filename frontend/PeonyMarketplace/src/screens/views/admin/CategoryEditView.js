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
    FlatList,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon,Container, Content,  Header, Button, Left, Right, Body, Title, List, ListItem, Thumbnail} from 'native-base';
import { Dropdown } from 'react-native-material-dropdown';
import Navbar from './../../components/Navbar';
import { getCategory, updateCategory, createCategory } from './../../../services/api/httpclient';
import {styles} from './../values/Styles';
const {width, height} = Dimensions.get('window');
class CategoryEditView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category_text:"",
            category_id:"-1",
            isLoading :false,
        }
    }
    componentDidMount(){
        let id = this.props.navigation.getParam('id');
        if (id !== undefined){
            this.setState({category_id:id});
            if (id !== -1)
                this.onGetCategory(id);
        }
    }
    
    onGetCategory(id){
        this.setState({isLoading:true});
        getCategory(id).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        this.setState({category_text:ret.data.category.name, category_id:ret.data.category._id});
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

    onUpdateCategory(){
        if (!this.onValidation)
            return;
        let payload = {_id:this.state.category_id , name:this.state.category_text};
        this.setState({isLoading:true});
        updateCategory(payload).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        Alert.alert(
                            'Success',
                            'successfully updated!',
                            [
                              {text: 'OK', onPress: () => this.props.navigation.navigate('Ca')},
                            ]
                          );
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

    onValidation(){
        if (this.state.category_text === '') {
            alert('Please input name.');
            return false;
        }
        return true;
    }
    onCreateCategory(){
        if (!this.onValidation)
            return;
        let payload = { name:this.state.category_text};
        this.setState({isLoading:true});
        createCategory(payload).then(ret =>{
            this.setState({isLoading:false});
            if (ret){
                let status = ret.status;
                if (status === 200){
                    if (ret.data.success === true){
                        Alert.alert(
                            'Success',
                            'successfully created!',
                            [
                              {text: 'OK', onPress: () => this.props.navigation.goBack()},
                            ]
                          );
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
    onClickListener(viewId){
        if (viewId === 'save'){
            if (this.state.category_id === -1) {
                this.onCreateCategory();
            } else if (this.state.category_id !== ''){
                this.onUpdateCategory();
            }
        }
    }
    render(){
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
                <Navbar left={left} title="Category Edit" />
                <View style={styles.subContainer}>
                    <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/ios/50/000000/category.png'}}/>
                        <TextInput style={styles.inputs}
                                placeholder="Category"
                                value={this.state.category_text}
                                underlineColorAndroid='transparent'
                                onChangeText={(category) => this.setState({category_text:category})}/>
                    </View>
                    <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('save')} >
                        <Text style={styles.loginText}>Save</Text>
                    </TouchableHighlight>

                </View>
            </View>
          );
    }
}
export default CategoryEditView;