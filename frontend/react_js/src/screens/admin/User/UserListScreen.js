import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import PropTypes from 'prop-types';
import UserTable from './UserTable'
import { withStyles } from '@material-ui/core/styles';
import {getUsers} from "../../../services/api/httpclient";
import { confirmAlert } from 'react-confirm-alert';
class UserListScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
            },
            
            category:'',
            submitted: false,
            responseError : false,
            responseErrorText:'',
            users :[],
            headers:[],
            totalCount : 0,
            page : 0,
            limit : 10,

        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps != this.props) {

        }
    }
    componentDidMount(){
        this._isMounted = true;
        this.setState({headers:[
            { id: 'userid', numeric: false, disablePadding: true, label: 'User Id' },
            { id: 'first_name', numeric: false, disablePadding: false, label: 'First Name' },
            { id: 'last_name', numeric: true, disablePadding: false, label: 'Last Name' },
            { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
            { id: 'phone_number', numeric: false, disablePadding: false, label: 'PhoneNumber' },
            { id: 'verification', numeric: true, disablePadding: false, label: 'Verified' },
            { id: 'user_type', numeric: false, disablePadding: false, label: 'UserType' },            
            { id: 'photo', numeric: true, disablePadding: false, label: 'Photo' },
            { id: 'country', numeric: true, disablePadding: false, label: 'Country' },
            { id: 'state', numeric: true, disablePadding: false, label: 'State/Province' },
            { id: 'line1', numeric: true, disablePadding: false, label: 'AddressLine1' },
            { id: 'line2', numeric: true, disablePadding: false, label: 'AddressLine2' },
            { id: 'detail', numeric: false, disablePadding: false, label: 'Detail' }
        ]});
        

        this.onGetusers();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    onGetusers(){
        let payload = {page: this.state.page , limit: this.state.limit};
        
        getUsers(payload).then(ret =>{            
            if (ret && this._isMounted)
            {              
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    this.setState({users:ret.data.users});
                    this.setState({totalCount: ret.data.totalCount});
                }
                
            }
        } , err=>{            
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
            
            
        });
    }
    
    onReceiveFromTableCallback(type , value)
    {
        console.log("onReceiveFromTable type = " + type + " value = " + value);
        if (type === 11){ //DeleteButtonClick
                        
        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetusers();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetusers();
            });
        } else if (type === 15){ //Add button Clicked
            this.props.history.push({pathname:'/users/edit/-1'});
        } else if (type === 16){

        }
        
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Users" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <UserTable title="Users" history={this.props.history} 
                        onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                        rows = {this.state.headers}
                        datas = {this.state.users}
                        totalCount = {this.state.totalCount}
                        />
                        </div>
                        
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }

    onSubmit(event){

    }
}
const style = {
    margin: 15,
};

const styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
    row: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.background.default,
      },
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120
      },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
  });

const hStyle = { color: 'red' };
UserListScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(UserListScreen);
