import {
    StyleSheet,Dimensions
} from 'react-native';
const {width} = Dimensions.get('window');
import Colors from './Colors';
export const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    header:{
        width: width
    },
    scroll:{
        width:'100%',height:'100%'
    },

    scene: {
        flex: 1,
      },

      
    subContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        width:250,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center'
    },
    searchInputContainer: {        
        backgroundColor: '#FFFFFF',    
        borderRadius:30,    
        borderBottomWidth: 1,
        height:45,                
        flexDirection: 'row',
        alignItems:'center'
    },
    cartContainer:{                        
        alignItems:'center',
        position:'relative',
        justifyContent:'center'
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
    },
    inputIcon:{
        width:30,
        height:30,
        marginLeft:15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width:250,
        borderRadius:30,
    },
    rectangleContainer: {
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',        
        marginBottom:0,        
        width:250,        
    },    
    normalButton: {
        backgroundColor: Colors.navbarBackgroundColor,
    },
    loginText: {
        color: 'white',
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#777',
        opacity:0.9,
        zIndex:999999999999999999
  },
  loaderView: {
        //width:scale(250),
        //height:verticalScale(60),
        backgroundColor:'#54C540',
        borderRadius:5,
        flexDirection:'row',
        alignItems:'center'
  },
  activityIndicator: {
        //margin:scale(15)
  },
  loadingText:{
        color:'#fff',
        //fontSize:scale(14),
  },

});