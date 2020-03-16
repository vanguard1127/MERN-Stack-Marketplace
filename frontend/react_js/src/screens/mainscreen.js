import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from './../components/NavDrawer'
class MainScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            first_name:'',
            last_name:'',
            email:'',
            phone_number:'',
        }
    }
    componentWillMount() {
        //var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    }
    render() {        
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Main Screen" history = {this.props.history}
                        />
                        
                        <div style={{ margin: 20, textAlign:'center'}}>
                            Welcome to MainScreen.
                            We will start main marketplace work here.
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}
const style = {
    margin: 15,
};
export default MainScreen;