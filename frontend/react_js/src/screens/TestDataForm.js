import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {createCategory , createOrder ,getProducts} from "../services/api/httpclient";
import NavDrawer from './../components/NavDrawer'
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
class TestDataForm extends React.Component {
    constructor(props){
        super(props);
        this.state={
            products:[]
        }
    }
    componentDidMount(){
        let categories = ["Food" , "Stuff" , "Clothes" , "Eletronic"];
        categories.map(category =>{
            console.log("Category = " + category);
            let payload={name : category};
            createCategory(payload).then(ret =>{
                if (ret){
                    console.log("TestForm Adding Category " + category + " Success");
                }
                } , err=>{
                    console.log("TestForm Adding Category " + category + " Failed");
                });
        });

        this.setState({products:[]});
        let payload = {page: this.state.page , limit: this.state.limit};
        let counts =  [2, 3, 4, 5,10 , 3, 4,5,67,8,99,1,2,3,45,6,6,3,3,5];
        getProducts(payload).then(ret =>{
            if (ret){
                this.setState({products:ret.data.products} , function(){
                    console.log("Products =  " + this.state.products);
                    this.state.products.map((product, index) => {
                        let count = counts[index];
                        let cart_payload = [{product_id : product._id , count:count}];
                        let payload = {seller_id : product.user_id._id , carts:cart_payload};
                        // createOrder(payload).then(ret =>{
                        //     if (ret){
                        //         console.log("TestForm Adding Order " +  index + " Success");
                        //     }
                        //     } , err=>{
                        //         console.log("TestForm Adding Order " + index + " Failed");
                        //     });
                    });
                });
            }
        } , err=>{
            console.log("Get Products Failed");
        });
        
        
    }
    render() {
        const { formData, submitted,responseError ,responseErrorText } = this.state;
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer title="Add Testing Data" history={this.props.history}/>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
    handleChange = (event) => {
        
    } 
    
}
const style = {
    margin: 15,
};
const hStyle = { color: 'red' };
export default TestDataForm;