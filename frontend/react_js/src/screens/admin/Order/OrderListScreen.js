import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import PropTypes from 'prop-types';
import OrderTable from './OrderTable'
import { withStyles } from '@material-ui/core/styles';
import {getAllOrders , deleteOrder} from "../../../services/api/httpclient";
import { confirmAlert } from 'react-confirm-alert';

class OrderListScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
            },
            
            order:'',
            submitted: false,
            responseError : false,
            responseErrorText:'',
            orders :[],
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
            { id: 'order_id', numeric: false, disablePadding: true, label: 'Order Id' },
            { id: 'seller_name', numeric: false, disablePadding: false, label: 'Seller Name' },
            { id: 'buyer_name', numeric: false, disablePadding: false, label: 'Buyer Name' },
            { id: 'status', numeric: false, disablePadding: false, label: 'OrderStatus' },
            { id: 'confirm_date', numeric: false, disablePadding: false, label: 'Confirmed Date' },
            { id: 'shipped_date', numeric: false, disablePadding: false, label: 'Shipped Date' },
            { id: 'delivered_date', numeric: false, disablePadding: false, label: 'Delivered Date' },
            { id: 'detail', numeric: false, disablePadding: false, label: 'Detail' }
        ]});
        this.onGetOrders();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    onGetOrders(){
        let payload = {page: this.state.page , limit: this.state.limit};        
        getAllOrders(payload).then(ret =>{                  
            if (ret && this._isMounted)
            {              
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    this.setState({orders:ret.data.orders});
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
                this.onGetOrders();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetOrders();
            });
        } else if (type === 15){ //Add button Clicked
            
        } else if (type === 16){

        }
        
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Orders" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <OrderTable title="Orders" history={this.props.history} 
                        onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                        rows = {this.state.headers}
                        datas = {this.state.orders}
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
OrderListScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(OrderListScreen);
