import React, { Component } from 'react';
import './App.css'
import SigninForm from './screens/auth/Signin/SigninForm'
//import injectTapEventPlugin from 'react-tap-event-plugin';
//injectTapEventPlugin();



class App extends Component {
    constructor(props){
        super(props);
    }
    componentWillMount(){        
        if(localStorage.getItem('accessToken') && localStorage.getItem('isLoggedIn') === "true") {
            this.props.history.push('/main');
        }
    }
    
    render() {
        return (
            <div>
                <SigninForm key = {"signInScreen"} history = {this.props.history} parentContext={this}/>          
            </div>
        );
    }
}
const style = {
    margin: 15,
};
export default App;