import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NavDrawer from '../../../components/NavDrawer'
import PropTypes from 'prop-types';
import CategoryTable from '../Category/CategoryTable'
import { withStyles } from '@material-ui/core/styles';
import {getCategories , deleteCategory} from "../../../services/api/httpclient";
import { confirmAlert } from 'react-confirm-alert';
class CategoryListScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData :{
            },
            
            category:'',
            submitted: false,
            responseError : false,
            responseErrorText:'',
            categories :[],
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
            { id: 'category_id', numeric: false, disablePadding: true, label: 'Category Id' },
            { id: 'category_name', numeric: false, disablePadding: false, label: 'Name' },
            { id: 'detail', numeric: false, disablePadding: false, label: 'Detail' }
        ]});
        this.onGetCategories();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    onGetCategories(){
        let payload = {page: this.state.page , limit: this.state.limit};        
        getCategories(payload).then(ret =>{      
            if (ret && this._isMounted)
            {              
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    this.setState({categories:ret.data.categories});
                    this.setState({totalCount: ret.data.totalCount});
                }
            }
        } , err=>{            
            if (err.response.status === 300){
                this.props.history.push('/users/signin');
            }
        });
    }
    
    onDeleteCategory(category_id){
        deleteCategory(category_id).then(ret =>{      
            if (ret && this._isMounted)
            {              
                if (ret.data.success === true){
                    this.setState({responseErrorText :''});                    
                    this.onGetCategories();
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
            this.onDeleteCategory(this.state.value);
        } else if (type === 13){ //Change PageNumber +1
            this.setState({page:value} , function(){
                this.onGetCategories();
            });
        } else if (type === 14){ //Change RowPerPage 
            this.setState({limit:value} , function(){
                this.onGetCategories();
            });
        } else if (type === 15){ //Add button Clicked
            this.props.history.push({pathname:'/category_edit/-1'});
        } else if (type === 16){

        }
        
    }

    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <NavDrawer
                            title="Categories" history={this.props.history}
                        />
                        <div style={{ margin: 20, textAlign:'center'}}> 
                        <CategoryTable title="Categories" history={this.props.history} 
                        onEvent = {(a, b) => {this.onReceiveFromTableCallback(a , b);}}
                        rows = {this.state.headers}
                        datas = {this.state.categories}
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
CategoryListScreen.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(CategoryListScreen);
