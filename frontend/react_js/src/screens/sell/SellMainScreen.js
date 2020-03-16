import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../components/NavDrawer'
import PropTypes from 'prop-types';
import EnhancedTable from './EnhancedTable'
import { withStyles } from '@material-ui/core/styles';
import {getMyProducts , deleteProduct} from "../../services/api/httpclient"
import { confirmAlert } from 'react-confirm-alert';
class SellMainScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
            },
            
            category:'',
            submitted: false,
            responseError : false,
            responseErrorText:'',
            products :[],
            categories:[],
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
        this.state.headers = [
            { id: 'user', numeric: false, disablePadding: true, label: 'User Name' },
            { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
            { id: 'name', numeric: false, disablePadding: false, label: 'Product Name' },
            { id: 'description', numeric: false, disablePadding: false, label: 'Product Descrition' },
            { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
            { id: 'btnEdit', numeric: false, disablePadding: false, label: '' }
        ];
        

        this.onGetProducts();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    onGetProducts(){ 
        let payload = {page: this.state.page , limit: this.state.limit};
        
        getMyProducts(payload).then(ret =>{
            if (ret && this._isMounted)
            {              
                
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    this.setState({products:ret.data.products});
                    this.setState({totalCount: ret.data.totalCount});
                    this.setState({categories:ret.data.categories}); 
                }
                
            }
        } , err=>{            
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
            
            if (err.response){
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error}); 
            }
            
        });
    }
    onDeleteProduct(value){
        deleteProduct(value).then(ret =>{            
            if (ret)
            {
                this.setState({loading : false}) ;
                    if (ret.data.success === true){
                    this.setState({responseErrorText : ''});
                    window.location.reload();
                }
                
            }
            
        } , err=>{
            if (err.response.status === 300){                
                this.props.history.push('/users/signin');
            }
            alert("Failed to Delete Product!");
        });
    }
    onReceiveFromTableCallback(type , value)
    {
        console.log("onReceiveFromTable type = " + type + " value = " + value);
        if (type === 11){ //DeleteButtonClick
            confirmAlert({
                title: 'Delete',
                message: 'Do you want to delete really?',
                buttons: [
                  {
                    label: 'Yes',
                    onClick: () => this.onDeleteProduct(value)
                  },
                  {
                    label: 'No',                        
                  }
                ]
              });            
        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetProducts();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetProducts();
            });
        } else if (type === 15){ //Add button Clicked
            this.props.history.push({pathname:'/products/edit/-1'});
        } else if (type === 16){

        }
        
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Sell MainScreen" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <EnhancedTable title="My Products(Selling)" history={this.props.history} 
                        onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                        rows = {this.state.headers}
                        datas = {this.state.products}
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
SellMainScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(SellMainScreen);
