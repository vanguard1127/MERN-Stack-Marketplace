import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../components/NavDrawer';
import CartTable from './CartTable'
import { connect } from "react-redux";
import {getCartProducts , createOrdersWithCarts} from "../../services/api/httpclient"
import { confirmAlert } from 'react-confirm-alert';
import { clearCartProduct } from "../../js/actions/index";
const mapStateToProps = state => {
    return { total_quantity: state.total_quantity , carts : state.carts };
  };
function mapDispatchToProps(dispatch) {
    return {
        clearCartProduct:payload => dispatch(clearCartProduct(payload)),
    };
  }
class CartDetailForm extends Component {
    constructor(props){
        super(props);
        this.state={
            headers:[],
            carts :[],
            products:[],
            page : 0,
            limit : 10,
            totalCount:0,
            totla_price:0,
        }
    }
    componentWillReceiveProps(nextProps) {
        
        let nextCarts = nextProps.carts;
        let nowCarts = this.props.carts;
        if (nextCarts !== nowCarts){
            this.onGetCartProducts({carts:nextCarts, page :this.props.page, limit:this.props.limit});
        }
    }
    onReceiveFromTableCallback(type , value)
    {
        
        if (type === 12){ //Add to Cart Button Click

        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetCartProducts({carts:this.props.carts, page :this.props.page, limit:this.props.limit});
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetCartProducts({carts:this.props.carts, page :this.props.page, limit:this.props.limit});
            });
        } else if (type === 15){  // Open Add Cart Form
            this.props.history.push('/buy_cart_detail');
        } else if (type === 16){ // Click Order Now Button
            this.onCreateOrdersWithCarts();
        }
        
    }

    onCreateOrderSuccess(){
        console.log("Cart = Clear Before");
        this.props.clearCartProduct({});
        this.props.history.goBack();
    }
    onCreateOrdersWithCarts(){
        createOrdersWithCarts({carts:this.props.carts}).then(ret =>{
            if (ret)
            {
                if (ret.data.success === false){
                    this.props.history.push("/users/signin");
                } else if (ret.data.success === true){
                    let message = 'Created Order:\n';
                    let orders = ret.data.orders;
                    orders.map((order) => {
                        message += order.seller.first_name + " " + order.seller.last_name;
                    });
                    confirmAlert({
                        title: 'Success',
                        message: message,
                        buttons: [
                          {
                            label: 'Ok',
                            onClick: () => this.onCreateOrderSuccess()
                          },
                        ]
                      }); 
                }
                
            }
        } , err=>{
            console.log(err);
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
        });
    }
    componentWillMount(){
        this.state.headers = [
            { id: 'photo', numeric: false, disablePadding: true, label: 'Photos' },
            { id: 'username', numeric: false, disablePadding: true, label: 'UserName' },
            { id: 'category', numeric: false, disablePadding: true, label: 'Category' },
            { id: 'productname', numeric: true, disablePadding: false, label: 'Product Name' },            
            { id: 'description', numeric: true, disablePadding: false, label: 'Description' },
            { id: 'price', numeric: true, disablePadding: false, label: 'Price' },           
            { id: 'amount', numeric: true, disablePadding: false, label: 'Amount' },           
            { id: 'control', numeric: true, disablePadding: false, label: '' },
        ];
        this.onGetCartProducts({carts:this.props.carts, page :this.props.page, limit:this.props.limit});     
    }
    onGetCartProducts(payload){
        getCartProducts(payload).then(ret =>{
            if (ret)
            {
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({products:ret.data.products});
                    this.setState({totalCount: ret.data.totalCount});
                    
                    this.setState({totalPrice : this.calculateTotalPrice()});
                }
                
            }
        } , err=>{
            console.log(err);
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
        });
    }
    calculateTotalPrice(){
        let price = 0;
        for (let value of Object.keys(this.props.carts)) {
            if (value !== undefined){
                let qty = this.props.carts[value];

                var mProduct = this.state.products.find(function(element) {
                    return element._id === value;
                });

                if (mProduct != undefined){
                    price += qty * mProduct.price; //TODO with using currency
                }                
              }
        }        
        return price;
    }
    componentWillUnmount(){
        
    }
    onStatusChange = event =>{
        this.setState({
            status : event.target.value
        });
    }
    onSubmit(event){
    }


    render() {
        const { submitted,responseError } = this.state;
        return(
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title="Cart Detail" history={this.props.history}/>
                        <div style={{ margin: 20, textAlign:'center'}}>
                            <CartTable title="Carts" history={this.props.history}
                                onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                                rows = {this.state.headers}
                                datas = {this.state.products}
                                totalCount = {this.state.totalCount}
                                totalPrice = {this.state.totalPrice}/>                                      
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

const Form = connect(mapStateToProps, mapDispatchToProps)(CartDetailForm);
export default Form;