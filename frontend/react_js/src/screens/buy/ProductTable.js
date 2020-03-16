import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import "react-image-gallery/styles/css/image-gallery.css";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import RaisedButton from 'material-ui/RaisedButton';
// import SwiftSlider from 'react-swift-slider';
import Carousel from 'nuka-carousel';
import { addCartProduct , removeCartProduct , clearCartProduct } from "../../js/actions/index";
import {connect} from 'react-redux';
import ImageGallery from 'react-image-gallery';

const mapStateToProps = state => {
  return { total_quantity: state.total_quantity , carts : state.carts };
};
function mapDispatchToProps(dispatch) {
  return {
    addCartProduct: payload => dispatch(addCartProduct(payload)),    
    clearCartsProduct: payload => dispatch(clearCartProduct(payload)),
  };
}
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

;

class ProductTableHead extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      
    }        
  }
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  
  render() {
    const { order, orderBy,  rowCount } = this.props;
    return (
      <TableHead>
        <TableRow>          
          {this.props.rows.map(
            row => (
              <TableCell
                key={row.id}
                align="center"
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    );
  }
}

ProductTableHead.propTypes = {  
  onRequestSort: PropTypes.func.isRequired,  
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let ProductTableToolbar = props => {
  const { classes , onOpenCart , onClearCarts, totalCount} = props;
  
  return (
    <Toolbar      
    >
      <div className={classes.title}>
        <Typography variant="h6" id="tableTitle">
            {props.title}
          </Typography>
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}> 
        <Tooltip title="Clear Carts">
        <RaisedButton label="Clear_Carts" primary={true} onClick={ event =>onClearCarts(event)}/>
        </Tooltip>         
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}> 
        <Tooltip title="Open Cart">
        <RaisedButton label={"OpenCart(" + totalCount + ")"} primary={true} onClick={ event =>onOpenCart(event)}/>
        </Tooltip>         
      </div>
    </Toolbar>
  );
};

ProductTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,  
};

ProductTableToolbar = withStyles(toolbarStyles)(ProductTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class ProductTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      order: 'asc',
      orderBy: 'name',
      selected: [],
      page: 0,
      rowsPerPage: 10,

      user_id:'',
    };
    
    
    
  }
  

  componentWillMount()
  {
      
      var userInfo = JSON.parse(localStorage.getItem('userInfo'));         
      this.setState({user_id:userInfo._id});
  }
  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }
    this.setState({ order, orderBy });
  };

  handleAddCartClick = (event, product) => {
    if (this.state.user_id === product.user._id){
      alert('This is own product!');
      return;
    }
    alert('Added to cart.');
    this.props.addCartProduct({ product: product, qty : 1});    
    //this.props.onEvent(12 , product);
  };
  handleChangePage = (event, page) => {
    this.setState({ page });
    this.props.onEvent(13 , page);
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value } , function(){
      this.props.onEvent(14 , this.state.rowsPerPage);
    });

  };  

  handleOpenCart = (event) =>{
    this.props.onEvent(15 , null);
  }

  handleClearCart = (event) =>{
    this.props.clearCartsProduct({});    
  }
  onGetCartCount(id){
    let carts = this.props.carts;
    let ret = "0";
    for (let value of Object.keys(carts)) {
      if (value !== undefined && value === id){
        ret = carts[value];        
        break;
      }
    }
    return ret;
    
  }
  onProductImageGallery(photos){
    let images = [];
    photos.map(photo =>{
      images.push({
        original:photo.src,
        thumbnail:photo.src
      })
    });
    
    return images;
  }
  render() {
    
    const { classes } = this.props;
    const {  order, orderBy, rowsPerPage, page  } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.totalCount - page * rowsPerPage);
    const {count} = this.props.total_quantity;
    return (
      <Paper className={classes.root}>
        <ProductTableToolbar  title={this.props.title} onClearCarts ={this.handleClearCart} onOpenCart = {this.handleOpenCart} totalCount = {this.props.total_quantity}/>
        {this.props.searchForm}
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <ProductTableHead              
              order={order}
              orderBy={orderBy}              
              onRequestSort={this.handleRequestSort}
              rowCount = {this.props.totalCount}
              rows = {this.props.rows}
            />
            <TableBody>
              {stableSort(this.props.datas, getSorting(order, orderBy))                
                .map(n => {                  
                  return (
                    <TableRow
                      hover                                            
                      key={n._source.id}
                      style={{height:350}}                       
                    > 
                    <TableCell align="center" style={{width:'250px'}}>
                      <ImageGallery style ={{height:'360px'}} showThumbnails = {false}
                       items={this.onProductImageGallery(n._source.photos)}/>
                      </TableCell>                                           
                      <TableCell align="center">{n._source.user.first_name + " " + n._source.user.last_name}</TableCell>
                      <TableCell align="center">{n._source.category.name}</TableCell>
                      <TableCell align="center">{n._source.name}</TableCell>
                      <TableCell align="center" style={{ width: "20%" }}>{n._source.description}</TableCell>                      
                      <TableCell align="center">{n._source.price + n._source.price_unit}</TableCell>                      
                      <TableCell align="center">{this.onGetCartCount(n._source.id)}</TableCell> 
                      <TableCell align="center">
                        <RaisedButton label="Add_to_Cart" primary={true} onClick={ event =>this.handleAddCartClick(event , n._source)}/>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={this.props.totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}


ProductTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

const Form = connect(mapStateToProps, mapDispatchToProps)(ProductTable);
export default withStyles(styles)(Form);
