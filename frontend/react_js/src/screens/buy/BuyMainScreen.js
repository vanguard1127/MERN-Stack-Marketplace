import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../components/NavDrawer'
import ProductTable from './ProductTable'
import {getProducts} from "../../services/api/httpclient"
import { TextField } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from '@material-ui/core/Paper';
import {Container , Row, Col } from 'react-bootstrap';



class BuyMainScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            headers:[],
            products :[],
            page : 0,
            limit : 10,
            totalCount:0,

            keyword:"",
            category_id:"-1",
            categories:[]
        }
    }

    onReceiveFromTableCallback(type , value)
    {        
        if (type === 12){ //Add to Cart Button Click

        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetProducts();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetProducts();
            });
        } else if (type === 15){  // Open Add Cart Form
            this.props.history.push('/buy_cart_detail');
        }
        
    }

    componentWillUnmount(){        
        this._isMounted = false;
    }
    componentDidMount() {  
        this._isMounted = true;
        this.state.headers = [
            { id: 'photo', numeric: false, disablePadding: true, label: 'Photos' },
            { id: 'username', numeric: false, disablePadding: true, label: 'UserName' },
            { id: 'category', numeric: false, disablePadding: true, label: 'Category' },
            { id: 'productname', numeric: true, disablePadding: false, label: 'Product Name' },            
            { id: 'description', numeric: true, disablePadding: false, label: 'Description' },
            { id: 'price', numeric: true, disablePadding: false, label: 'Price' },           
            { id: 'amount', numeric: true, disablePadding: false, label: 'Amount' },           
            { id: 'control', numeric: true, disablePadding: false, label: 'Detail' },
        ];
        this.onGetProducts();
    }
    onGetProducts(){
        let payload = {page: this.state.page , limit: this.state.limit , keyword:this.state.keyword , category_id : this.state.category_id};
        getProducts(payload).then(ret =>{
            if (ret && this._isMounted)
            {                
                 if (ret.data.success === true){
                    this.setState({responseErrorText :''});
                    this.setState({products:ret.data.products});
                    this.setState({totalCount: ret.data.totalCount});
                    this.setState({categories: ret.data.categories});
                }
                
            }
        } , err=>{
            if (err.response.status === 300){
                //this.props.history.push('/users/signin');
            }
            if (this._isMounted){
                var errorData = err.response.data;
                this.setState({responseError :true});
                this.setState({responseErrorText : errorData.error}); 
            }
            
        });
    }
    handleKeyword=(event)=>{
        this.setState({keyword:event.target.value});
    }
    handleCategoryChange= event=>{
        this.setState({category_id:event.target.value} , function(){
            this.onGetProducts();
        });
    }
    onSearch= event=>{
        this.onGetProducts();
    }
    render() {
        const searchForm = (
            <Paper>
                <form>
                    <Container>
                        <Row>
                            <Col sd='4'>
                                <TextField 
                                placeholder="Search..."                                 
                                value={this.state.keyword} 
                                onChange={this.handleKeyword}
                                style={{width:'100%'}}/>
                            </Col>
                            <Col sd='4'>
                            <FormControl style={{width:'100%'}}>                                
                                <Select
                                    value={this.state.category_id}
                                    onChange={this.handleCategoryChange}                                
                                >
                                <MenuItem value="-1">
                                    <em>All</em>
                                </MenuItem>
                                {
                                    this.state.categories.map(category => {
                                        return(
                                            <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                        );
                                    })   
                                }
                                </Select>
                            </FormControl>
                            </Col>
                            <Col sd='4'>
                                <RaisedButton label="Search" primary={true} onClick={(event) => this.onSearch(event)}/>
                            </Col>
                        </Row>
                    </Container>
                </form>
                </Paper>  
        );

        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Buy MainScreen" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        
                        <ProductTable title="Products" history={this.props.history} searchForm = {searchForm} 
                            onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                            rows = {this.state.headers}
                            datas = {this.state.products}
                            totalCount = {this.state.totalCount}/>                                      
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
export default BuyMainScreen;