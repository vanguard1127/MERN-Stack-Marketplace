import React from "react";
import Drawer from "@material-ui/core/Drawer";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
const styles = {
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
  };


class NavDrawer extends React.Component {
    constructor(props){
        super(props);
        this.state={
            isLoggedIn:'',
            email:'',
            photo:'/default_photo.jpg',
        }
    }
    list = [];
    images = {};
    state = {
        left: false,
    };
    toggleDrawer = (side, open) => () => {
        this.setState({
          [side]: open,
        });
      };
    componentWillMount() {     
        var isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')); 
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo)
        {
          this.setState({isLoggedIn:isLoggedIn});
          if (isLoggedIn === true){
              if (userInfo.user_type === 1){ //admin user
                this.list = ["Home" ,"Profile" , "My Products" ,"My Sell Orders" ,"Buy" , "Buy Orders" ,"Users","Categories" , "Orders" , "Wallets", "About" , "Log Out"];
              } else if (userInfo.user_type === 0 ){ //normal user
                this.list = ["Home" ,"Profile" , "My Products" ,"My Sell Orders" ,"Buy" , "Buy Orders" , "About" , "Log Out"];
              } else if (userInfo.user_type === 2) { //shipper
                //TODO
              }
              this.setState({email:userInfo.email}); 
              if (userInfo.photo !== "")
              this.setState({photo:userInfo.photo});
              
          } else {
              this.list = ["Home", "About", "Log In"];
          }
        }
        
        
    }
    onClickMenuItem(event ,text){
      var userInfo = JSON.parse(localStorage.getItem('userInfo'));
      var type = userInfo.user_type;      
        if (this.state.isLoggedIn === true){
            if (type === 0 || type === 1){
              if (text === "Home"){
                this.props.history.push('/main/');
              } else if (text === "Profile"){
                var userInfo = JSON.parse(localStorage.getItem('userInfo'));
                let id = userInfo._id;
                  this.props.history.push('/users/viewprofile/' + id);
              } else if (text === "My Products"){
                  this.props.history.push('/sell/mainscreen');
              } else if (text === "Buy"){
                  this.props.history.push('/buy/mainscreen');
              } else if (text === "Buy Orders"){
                this.props.history.push('/buy_orders');
              } else if (text === "My Sell Orders"){
                  this.props.history.push('/sell_orders');
              } else if (text === "About"){
                //TODO
              }else if (text === "Log Out"){
                  let cart = {};
                  localStorage.setItem('cart', JSON.stringify(cart));
                  localStorage.setItem('isLoggedIn' , false);
                  this.props.history.push('/users/signin');
              } else if (text === "Users"){
                this.props.history.push('/admin/users');
              } else if (text === "Categories"){
                this.props.history.push('/category');
              } else if (text === "Orders"){                
                this.props.history.push('/orders');
              } else if (text === "Wallets"){
                this.props.history.push('/points');
              }
            }
            
        } else {
            if (text === "Home"){
              this.props.history.push('/main/');
            } else if (text === "About"){
              //TODO
            } else if (text === "Log In"){
                this.props.history.push('/users/signin');
            }
        }
    }
  render() {
    const { classes } = this.props;
    const sideList = (
        <div className={classes.list}>     
        <Card className={classes.card}>
            <CardActionArea>
                <CardMedia
                component="img"
                alt="Profile Image"
                className={classes.media}
                height="140"
                image={this.state.photo}
                title="Profile Image"
                />
                <CardContent>
                <Typography component="p">
                    {this.state.email}
                </Typography>
                </CardContent>            
            </CardActionArea>
        </Card>
          <List>
            {this.list.map((text, index) => (
              <ListItem button key={text}>                              
                <ListItemText primary={text}  onClick={(event) =>this.onClickMenuItem(event,text)}/>
              </ListItem>
            ))}
          </List>          
        </div>
      );
    return (
        <div>
            <AppBar position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.toggleDrawer('left', true)}
            >
            <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
            { this.props.title}
            </Typography>            
          </Toolbar>
        </AppBar>     
        <Drawer open={this.state.left} onClose={this.toggleDrawer('left', false)}>
            <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
            >
            {sideList}
            </div>
        </Drawer>
        </div>
    );
  }
}

NavDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
export default withStyles(styles)(NavDrawer);
