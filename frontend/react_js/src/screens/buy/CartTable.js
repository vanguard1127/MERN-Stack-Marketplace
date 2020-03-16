import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import { connect } from "react-redux";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Fab from '@material-ui/core/Fab';
import RaisedButton from 'material-ui/RaisedButton';
import Button from '@material-ui/core/Button';
import Carousel from 'nuka-carousel';
import ImageGallery from 'react-image-gallery';
import { addCartProduct , removeCartProduct , decCartProduct } from "../../js/actions/index";
const mapStateToProps = state => {
  return { total_quantity: state.total_quantity , carts : state.carts };
};
function mapDispatchToProps(dispatch) {
  return {
    addCartProduct: payload => dispatch(addCartProduct(payload)),
    removeCartProduct: payload => dispatch(removeCartProduct(payload)),
    decCartProduct:payload => dispatch(decCartProduct(payload)),
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

class CartTableHead extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      
    }        
  }
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  
  render() {
    const {  order, orderBy,  rowCount } = this.props;
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

CartTableHead.propTypes = {  
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

let CartTableToolbar = props => {
  const { classes , totalCount , total_price ,onOrderNow} = props;
  
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
      <RaisedButton label="OrderNow" primary={true} onClick={ event =>onOrderNow(event)}/>
      </div>
      <div className={classes.actions}>
          {"Total Price =" + total_price +"$"}
      </div>
      <div className={classes.actions}>         
          {"Total Count =" + totalCount}
        
      </div>
    </Toolbar>
  );
};

CartTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,  
};

CartTableToolbar = withStyles(toolbarStyles)(CartTableToolbar);

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

class CartTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      order: 'asc',
      orderBy: 'name',
      selected: [],
      page: 0,
      rowsPerPage: 10,
    };
    
    
    
  }
  

  componentWillMount()
  {    
    
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
  handleDeleteClick = (event, product) =>{
    this.props.removeCartProduct({ product: product});          
  }
  handleIncCount = (event ,product) =>{
    this.props.addCartProduct({ product: product, qty : 1});    
  }
  handleDecCount = (event ,product) =>{
    this.props.decCartProduct({ product: product});    
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
  handleOrder = (event) => {
    this.props.onEvent(16, null);
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
        <CartTableToolbar  title={this.props.title} 
        onOrderNow={this.handleOrder} totalCount = {this.props.total_quantity} 
        total_price = {this.props.totalPrice}/>        
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <CartTableHead              
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
                      key={n._id}                       
                    > 
                    <TableCell align="center" >
                      <ImageGallery style ={{height:'360px'}} showThumbnails = {false}
                       items={this.onProductImageGallery(n.photos)}/>
                      </TableCell>                                           
                      <TableCell align="center">{n.user_id.first_name + " " + n.user_id.last_name}</TableCell>
                      <TableCell align="center">{n.category_id.name}</TableCell>
                      <TableCell align="center">{n.name}</TableCell>
                      <TableCell align="center" style={{ width: "20%" }}>{n.description}</TableCell>                      
                      <TableCell align="center">{n.price + n.price_unit}</TableCell>                      
                      <TableCell align="center" style={{width:'20%'}}>
                      <Fab size="small" color="secondary" aria-label="Add" className={classes.margin}>
                        <RemoveIcon onClick={event => this.handleDecCount(event , n)}/>
                      </Fab>
                      {this.onGetCartCount(n._id)}                      
                      <Fab size="small" color="secondary" aria-label="Add" className={classes.margin}>
                      <AddIcon onClick={event => this.handleIncCount(event , n)}/>
                      </Fab>
                      </TableCell> 
                      <TableCell align="center">
                                {<IconButton onClick={ event => this.handleDeleteClick(event, n)}>
                                    <DeleteIcon color="secondary" />
                                  </IconButton>}                                
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


CartTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

const Form = connect(mapStateToProps, mapDispatchToProps)(CartTable);
export default withStyles(styles)(Form);
