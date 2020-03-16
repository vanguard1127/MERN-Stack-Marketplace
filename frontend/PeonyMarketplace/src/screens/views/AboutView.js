import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    TextInput,
    Button,
    TouchableHighlight,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Icon } from 'react-native-elements'
import {Header , Left ,Title ,Right, Body} from 'native-base';
import Navbar from './../components/Navbar';
export default class AboutView extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount(){
    }

    onPress = () => {
        console.log(this.props)
        this.props.navigation.toggleDrawer();
    }

    static navigationOptions = {
        drawerIcon : ({tintColor}) => (
            <AntDesignIcon name="infocirlce" size={22} color={tintColor} />            
        )
    }
    render() {
        var left = (
            <Left style={{flex:1}}>
                <Icon name="menu" onPress ={() => this.props.navigation.openDrawer()}></Icon>
            </Left>
          );
        return (
            <View style={styles.container}>
                <Navbar left={left}  title="About" />
                <View style={styles.subContainer}>                    
                    <Text>About</Text>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    subContainer:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
    }
});