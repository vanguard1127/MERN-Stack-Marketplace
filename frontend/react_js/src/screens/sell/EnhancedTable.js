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
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';

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

class EnhancedTableHead extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      
    }        
  }
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  
  render() {
    const { onSelectAllClick, order, orderBy,  rowCount } = this.props;

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

EnhancedTableHead.propTypes = {  
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
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

let EnhancedTableToolbar = props => {
  const { classes ,onAddClick} = props;
  
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
          <Tooltip title="Add Product">
              <IconButton aria-label="Add Product" onClick={ event => onAddClick(event)}>
                <AddIcon />
              </IconButton>
          </Tooltip>
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,  
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

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

class EnhancedTable extends React.Component {
  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    page: 0,
    rowsPerPage: 10,
  };

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

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: state.data.map(n => n.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleDeleteClick = (event, product_id) => {
    this.props.onEvent(11 , product_id);
  };

  handleEditClick = (event, id) => {    
    this.props.history.push('/products/edit/' +id);
  };
  handleChangePage = (event, page) => {
    this.setState({ page });
    this.props.onEvent(13 , page);
  };
  handleAddClick = (event) => {
    this.props.onEvent(15 , 0);    
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value } , function(){
      this.props.onEvent(14 , this.state.rowsPerPage);
    });

  };  
  handleRowClick = (event , id) => {
    this.props.onEvent(16 , id);
  };
  render() {
    const { classes } = this.props;
    const {  order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.totalCount - page * rowsPerPage);
    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar  title={this.props.title} onAddClick = {this.handleAddClick}/>
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead              
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
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
                      onClick ={event => this.handleRowClick(event ,n.id)}                     
                    >                      
                      <TableCell align="center" component="th" scope="row" padding="none">
                        {n._source.user.first_name + " " + n._source.user.last_name} 
                      </TableCell>
                      <TableCell align="center">{n._source.category.name}</TableCell>
                      <TableCell align="center">{n._source.name}</TableCell>
                      <TableCell align="center">{n._source.description}</TableCell>
                      <TableCell align="center">{n._source.price}{n._source.price_unit}</TableCell>                      
                      <TableCell align="center">
                                {<IconButton onClick={ event => this.handleDeleteClick(event, n._source.id)}>
                                    <DeleteIcon color="secondary" />
                                  </IconButton>}
                                  
                                {<IconButton onClick={ event => this.handleEditClick(event, n._source.id)}>
                                  <EditIcon color="primary" />
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


EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(EnhancedTable);
