import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import PropTypes from 'prop-types';
import WalletTable from './WalletTable'
import { withStyles } from '@material-ui/core/styles';
import {getUsersWithPoints } from "../../../services/api/httpclient";
import { confirmAlert } from 'react-confirm-alert';
class WalletListScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
            },
            
            wallet:'',
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
            { id: 'user_id', numeric: false, disablePadding: true, label: 'UserId' },
            { id: 'user_fname', numeric: false, disablePadding: false, label: 'FirstName' },
            { id: 'user_lname', numeric: false, disablePadding: false, label: 'LastName' },
            { id: 'user_email', numeric: false, disablePadding: false, label: 'Email' },
            { id: 'user_phone', numeric: false, disablePadding: false, label: 'Phone Number' },
            { id: 'user_points', numeric: false, disablePadding: false, label: 'User Points' },
            { id: 'detail', numeric: false, disablePadding: false, label: 'Detail' }
        ]});
        this.onGetWallets();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    onGetWallets(){
        let payload = {page: this.state.page , limit: this.state.limit};        
        getUsersWithPoints(payload).then(ret =>{      
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
                this.onGetWallets();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetWallets();
            });
        } else if (type === 15){ //Add button Clicked
            this.props.history.push({pathname:'/wallet_edit/-1'});
        } else if (type === 16){

        }
        
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Wallets" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <WalletTable title="Wallets" history={this.props.history} 
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
WalletListScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(WalletListScreen);
