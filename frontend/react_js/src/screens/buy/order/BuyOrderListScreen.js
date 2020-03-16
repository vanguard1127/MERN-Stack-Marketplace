import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import PropTypes from 'prop-types';
import BuyOrderTable from './BuyOrderTable'
import { withStyles } from '@material-ui/core/styles';
import {getBuyOrders} from "../../../services/api/httpclient"

class BuyOrderListScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            headers:[],
            orders :[],
            page : 0,
            limit : 10,
            totalCount:0,
            
        }
    }
    componentDidMount(){
        this._isMounted = true;
    }
    componentWillMount(){
        this._isMounted = false;
    }
    componentWillMount() {        
        this.state.headers = [
            { id: 'order_id', numeric: false, disablePadding: true, label: 'OrderId' },
            { id: 'seller', numeric: false, disablePadding: true, label: 'SellerName' },            
            { id: 'state', numeric: true, disablePadding: false, label: 'Order Status' },
            { id: 'last_date', numeric: true, disablePadding: false, label: 'Last Update' },           
        ];
        

        this.onGetMyOrders();
    }

    onGetMyOrders(){
        
        this.setState({orders:[]});
        
        let payload = {page: this.state.page , limit: this.state.limit , product_id:this.state.product_id};
        getBuyOrders(payload).then(ret =>{
            if (ret && this._isMounted)
            {

                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({orders:ret.data.orders});
                    this.setState({totalCount: ret.data.totalCount});
                }
                
            }
        } , err=>{
            console.log('err' + JSON.stringify(err));
            if (err.response.status === 300){
                //this.props.history.push('/users/signin');
            }
            
            var errorData = err.response.data;
            this.setState({responseError :true});
            this.setState({responseErrorText : errorData.error}); 
        });
    }
    onReceiveFromTableCallback(type , value)
    {
        
        if (type === 12){ //Row Click            
            this.props.history.push({pathname:'/order/buy/detail/' + value});
        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetMyOrders();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetMyOrders();
            });
        } else if (type === 16){ 

        }
    }
    
    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="My Buying Orders" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <BuyOrderTable title="My Buying Orders" history={this.props.history} 
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
BuyOrderListScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(BuyOrderListScreen);
