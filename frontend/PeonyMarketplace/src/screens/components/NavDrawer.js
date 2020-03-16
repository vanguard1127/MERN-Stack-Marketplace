import { DrawerItems, SafeAreaView } from 'react-navigation';
import {Image, View , Text} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import React, {Component} from 'react';
import AsyncImageAnimated from 'react-native-async-image-animated';
import { connect } from 'react-redux';
const mapStateToProps = (state) => {
  const { photo, email } = state
  return {photo, email }
};


const NavDrawer = (props) => {
  return(
  <SafeAreaView style={{flex:1}}>    
    <View style={{height:150 , backgroundColor:'white', alignItems:'center',justifyContent:'center'}}>      
      <AsyncImageAnimated
          source={props.photo}
          placeholderSource={require('./../../../images/ic_emptyuser.jpg')}
          style={{
              height: 120,
              width: 120,
              borderRadius:60,
          }}
          />
    </View>
    <View style={{height:50 ,alignItems:'center' ,justifyContent:'center'}}>
      <Text>{props.email}</Text>
    </View>
    <ScrollView>
      <DrawerItems {...props}/>
    </ScrollView>
  </SafeAreaView>);
};


export default connect(mapStateToProps)(NavDrawer);