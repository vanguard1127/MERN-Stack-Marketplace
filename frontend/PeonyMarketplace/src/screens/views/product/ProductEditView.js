/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Image, Dimensions, Alert, Platform ,TouchableWithoutFeedback, TextInput,TouchableHighlight,ActivityIndicator} from 'react-native';
import { View, Container, Content, Button, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
// import { Actions } from 'react-native-router-flux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { getProduct , getCategories, createProduct , updateProduct } from '../../../services/api/httpclient';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addCartProduct , decCartProduct ,setCartProduct} from './../../components/redux/actions';
import { Dropdown } from 'react-native-material-dropdown';
import RNFetchBlob from 'react-native-fetch-blob'
// Our custom files and classes import
import Colors from './../values/Colors';
import Text from './../../components/Text';
import Navbar from './../../components/Navbar';
import { default as ProductComponent } from './../../components/Product';
import {styles} from './../values/Styles';
import ImagePicker from 'react-native-image-picker';
import { getData } from '../../../utils/AppUtils';
import storage  from './../../../services/firebase/index';
import ActionSheet from 'react-native-actionsheet';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
const Fetch = RNFetchBlob.polyfill.Fetch;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;
window.fetch = new Fetch({
  // enable this option so that the response data conversion handled automatically
  auto : true,
  // when receiving response data, the module will match its Content-Type header
  // with strings in this array. If it contains any one of string in this array, 
  // the response body will be considered as binary data and the data will be stored
  // in file system instead of in memory.
  // By default, it only store response data to file system when Content-Type 
  // contains string `application/octet`.
  binaryContentTypes : [
      'image/',
      'video/',
      'audio/',
      'foo/',
  ]
}).build()

const {width } = Dimensions.get('window');

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    addCartProduct,decCartProduct,setCartProduct
  }, dispatch)
);
const mapStateToProps = (state) => {
  const { total_quantity , total_price ,carts } = state
  return { total_quantity , total_price ,carts }
};
class ProductEditView extends Component {
  constructor(props) {
    super(props);
    let photoMenu;
    this.state = {
      product: {
        name:'',
        description:'',
        price:'',
        price_unit:'',        
      },
      product_name:'',
      product_description:'',
      product_price:'',
      product_price_unit:'$',
      product_category_id:'',

      activeSlide: 0,
      quantity: 1,

      categories:[],
      product_id:'',
      images:[],      
      isLoading:false,
      user_id:'',
      popupIsVisible:false,

      uploaded_count:0,
      toUpload_count:0
    };
  }

  componentWillMount() {
    //get the product with id of this.props.product.id from your server
    getData('userInfo').then((ret) => {
        let userInfo = JSON.parse(ret);
        this.setState({user_id:userInfo._id});
    });
    const id = this.props.navigation.getParam('id');
    if (id != undefined){
      this.setState({product_id:id});
      this.onGetProduct(id);
    }
    
    
    this.onGetCategories();
  }

  showPopover(){
    //this.setState({popupIsVisible:true});
    this.photoMenu.show();
  }

 
  onGetCategories(id){
    this.setState({isLoading:true});
    getCategories({}).then( ret => {      
        this.setState({isLoading:false});
        if (ret){
            if (ret.status === 200){
                if (ret.data.success === true){                         
                  this.setState({categories:ret.data.categories});
                } else {
                    alert(ret.data.error);
                }
            } else if (ret.status === 300 || ret.status === 303){
              this.props.navigation.navigate('LoginView');
            } else {
                alert(ret.data.error);
            }
        }
    } , err => {
        alert("Please check your network.");
        this.setState({isLoading:false});
    });
  }
  onGetProduct(id){
    this.setState({isLoading:true});
    getProduct(id).then( ret => {      
        this.setState({isLoading:false});
        if (ret){
            if (ret.status === 200){
                if (ret.data.success === true){       
                  this.setState({ product: ret.data.product});
                  this.setState({product_name:ret.data.product.name,
                  product_description:ret.data.product.description,
                  product_price:ret.data.product.price.toString(),
                  product_price_unit:ret.data.product.price_unit,
                  product_category_id:ret.data.product.category_id});

                  let images = [];
                  ret.data.product.photos.map((photo) => {
                      images.push({src:{uri:photo.src} , type:1});
                  });                  
                  this.setState({images:images});
                } else {
                    alert(ret.data.error);
                }
            } else if (ret.status === 300 || ret.status === 303){
              this.props.navigation.navigate('LoginView');
            } else {
                alert(ret.data.error);
            }
        }
    } , err => {
        alert("Please check your network.");
        this.setState({isLoading:false});
    });
  }
  onCategorySelectIndex(value, index, data){
    let item = data[index];  
    this.setState({product_category_id:item._id});
}
  _renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback
        key={index}
        onPress={() => this.openGallery(index)}
      >
        <Image
          source={item.src}
          style={{ width: Dimensions.get('window').width, height: 350 }}
          resizeMode="cover"
        />
      </TouchableWithoutFeedback>
    );
  }


  openGallery = (pos) => {
    // Actions.imageGallery({ images: this.state.product.images, position: pos });
    this.props.navigation.navigate('Gallery' , {
       images:this.state.images,
       position:pos
    })
  }

  addToCart() {    
    this.props.addCartProduct({product: this.state.product, qty : this.state.quantity}); 
  }

  onValidation(){
    if (this.state.product_name === ''){
      alert('Please input product name.');
      return false;
    } else if (this.state.product_description === ''){
      alert('Please input product description.');
      return false;
    } else if (this.state.product_price === ''){
      alert('Please input product price.');
      return false;
    } else if (this.state.images.length < 2) {
      alert('Please select 2 photos at least.');
      return false;
    } else if (this.state.product_category_id === '') {
      alert('Please select a category.');
      return false;
    }
    return true;
  }
  onSubmit(){
    if (!this.onValidation())
      return false;
    
    this.setState({isLoading:true});
    var mImage = this.state.images.find(function(element) {
        return element.type === 0;
    });
    
    let mTempImages = [];
    let mUploadedImages  = [];
    if (mImage !== undefined){
        for (let index = 0 ;index < this.state.images.length ; index++){
          let image = this.state.images[index];
          if (image.type === 0){
              mTempImages.push(image);
          } else if (image.type === 1){
              mUploadedImages.push(image);
          }
        }
        this.setState({images:mUploadedImages});
        this.setState({toUpload_count:mTempImages.length}, function(){
          let uploaded_count = 0;
          for (let i = 0 ;i < mTempImages.length ; i++){
            let image = mTempImages[i];
            let uri = image.src.uri;
            this.uploadImage(uri ,i).then(ret =>{
                uploaded_count++;
                let images = this.state.images;
                images.push({type:1, src:{uri:ret.url}});
                this.setState({images:images});
                if (uploaded_count === this.state.toUpload_count){
                  if (this.state.product_id === ''){
                    this.onAddProduct();
                  } else if (this.state.product_id !== ''){
                    this.onUpdateProduct();
                  }
                }
            } ,err => {
                uploaded_count++;
            });
          }
        });
        
        
    } else if (mImage === undefined){
        if (this.state.product_id === ''){
          this.onAddProduct()
        } else {
          this.onUpdateProduct();
        }
        
    }

  }

  onAddProduct(){
    
    let photos = [];
    for (let i = 0 ;i  < this.state.images.length; i++){
      photos.push({id:i , src:this.state.images[i].src.uri});
    }
    let payload = {
      name:this.state.product_name,
      description:this.state.product_description,
      price:parseInt(this.state.product_price),
      price_unit:this.state.product_price_unit,
      category_id:this.state.product_category_id,
      photos:photos
    }
    createProduct(payload).then((ret ) => {
      this.setState({isLoading:false});
      if (ret){
          let status = ret.status;
          if (status === 200){
              if (ret.data.success === true){
                  Alert.alert(
                    'Success',
                    'successfully created!',
                    [
                      {text: 'OK', onPress: () => this.props.navigation.navigate('Drawer')},
                    ]
                  );
              }
          } else if (status === 300 || status === 303){
              this.props.navigation.navigate('LoginView');             
          } else {
              alert(ret.data.error);
          }
          
      }
  } ,err=>{
      alert("Please check your network." + JSON.stringify(err));
      this.setState({isLoading:false});
  });
  }

  onUpdateProduct(){
    let photos = [];
    for (let i = 0 ;i  < this.state.images.length; i++){
      photos.push({id:i , src:this.state.images[i].src.uri});
    }
    let payload = {
      name:this.state.product_name,
      description:this.state.product_description,
      price:parseInt(this.state.product_price),
      price_unit:this.state.product_price_unit,
      category_id:this.state.product_category_id,
      _id:this.state.product_id,
      photos:photos
    }
    updateProduct(payload).then((ret ) => {
        this.setState({isLoading:false});
        if (ret){
            let status = ret.status;
            if (status === 200){
                if (ret.data.success === true){
                    Alert.alert(
                      'Success',
                      'successfully updated!',
                      [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()},
                      ]
                    );
                }
            } else if (status === 300 || status === 303){
                this.props.navigation.navigate('LoginView');             
            } else {
                alert(ret.data.error);
            }
            
        }
    } ,err=>{
        alert("Please check your network." + JSON.stringify(err));
        this.setState({isLoading:false});
    });

  }

  uploadImage = (uri, index,  mime="image/jpg") => {
      return new Promise((resolve , reject) => {
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://','') : uri;
        let user_id = this.state.user_id;
        let uploadBlob = null;
        var timeStamp = Math.floor(Date.now()); 
        let refPath = 'marketplace/' + user_id+'/images/products/' + timeStamp + "_" + index;
        const imageRef = storage.ref(refPath);
        fs.readFile(uploadUri ,'base64').then((data) =>{
          return Blob.build(data , {type:`${mime};BASE64`});
        }).then((blob) =>{
          uploadBlob = blob;
          return imageRef.put(blob, {contentType:mime});
        }).then(()=>{
          uploadBlob.close();
          return imageRef.getDownloadURL();
        }).then((url) => {
          resolve({url:url});
        }).catch((error) =>{
          alert("Failed to upload product image to firebase. Try again.")
          reject(error);
        });
      });
  }
  onClickListener = (viewId) => {       
    if (viewId === 'save'){
      this.onSubmit();
    }  else if (viewId === 'addPhoto'){
      console.log("Added Clicked")

        
        
    } else if (viewId === 'removePhoto'){
      
   

    } else if (viewId === 'clearPhoto'){

    }
}
  componentDidMount() {
  }
  clickMenuSelect(index)
  {      
     if (index === 0){      
      const options = {
        title: 'Select Product Image',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      ImagePicker.showImagePicker(options, (response) => {
      
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const source = { uri: response.uri };
      
          let images = this.state.images;
          images.push({src:source, type:0});
          this.setState({images:images});

          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
      
          this.setState({
            avatarSource: source,
          });
        }
      });
     } else if (index === 1){
      this.setState({isLoading:true});
      let index = this.state.activeSlide;
      let image = this.state.images[index];
      if (image !== undefined){
        if (image.type === 0){
          //normal
          let images = this.state.images;
          images.splice(index,1);
          this.setState({images:images});

        } else if (image.type === 1){
          //uploaded
            storage.refFromURL(image.src.uri).delete().then(ret=>{
              this.onRemovePhotos(image);
          } , err =>{
              this.onRemovePhotos(image);
          });
        }
      }
      this.setState({isLoading:false});
     } else if (index === 2){
      this.setState({isLoading:true});
      this.setState({images:[]} , () =>  this.setState({isLoading:false}));
      
     }
  }
  onRemovePhotos(value){
    console.log("photo mountain1");
    for (var i = 0 ; i < this.state.images.length ; i++){
        if (this.state.images[i].src.uri === value.src.uri){                    
          let images = this.state.images;
          images.splice(i,1);

          console.log("photo mountain " + JSON.stringify(images));
          this.setState({images:images} , () => this.setState({isLoading:false}));
          return;
        }
    }
}
  renderCartIcon = () =>{
    if (this.props.total_quantity > 0)
        return (<Text style={{position:'absolute', backgroundColor:'red', borderRadius:10, color:'white', width:20, height:20, textAlign:'center', left:5, top:0}}>{this.props.total_quantity}</Text>);
  }
  
  render() {
    var left = (
      <Left style={{ flex: 1 }}>
        <Button transparent onPress ={() => this.props.navigation.goBack()}>
          <Icon name='ios-arrow-back' />
        </Button>
      </Left>
    );
    var right = (
      <Right style={{ flex: 1 }}>                
      </Right>
    );

    var imageView = (
      <View style={{ backgroundColor: '#fdfdfd', alignItems: 'center' }}>
      <Carousel
        data={this.state.images}
        renderItem={this._renderItem}
        ref={(carousel) => { this._carousel = carousel; }}
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width}
        onSnapToItem={(index) => this.setState({ activeSlide: index })}
        enableSnap={true}
      />
      <Pagination
        dotsLength={this.state.images.length}
        activeDotIndex={this.state.activeSlide}
        containerStyle={{ backgroundColor: 'transparent', paddingTop: 0, paddingBottom: 0, marginTop: -15 }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.92)'
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </View>
    );

    var blankImage = (
      <View style={{ backgroundColor: '#fdfdfd', alignItems: 'center' }}>
        <Image square style={{width: Dimensions.get('window').width, height: 350}} source={require('./../../../../images/product.png')}/>
      </View>
    )
    return (
      <Container style={{ backgroundColor: '#fdfdfd' }}>
      {
          this.state.isLoading == true &&
          <View style={styles.loading}>
              <View style={styles.loaderView}>
                  <ActivityIndicator color="#fff" style={styles.activityIndicator}/>
                  <Text style={styles.loadingText}>{this.state.loadingText}</Text>
              </View>
          </View>
      }
        <Navbar left={left} right={right} title={this.state.product_id === '' ? 'Product Add' : this.state.product_name } />        
        <Content>
          {
            this.state.images.length > 0 ? imageView : blankImage
          }
          <View style={{ backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center' }}>
            <Grid>
              <Col size={3}/>
              <Col style={{ alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableHighlight style={[{height:45,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom:20,
                                            width:100,
                                            borderRadius:30}, 
                                styles.normalButton]} 
                                //onPress={()=>this.onClickListener('photo')} >
                                onPress={() => this.showPopover()}>
                      <Text style={styles.loginText}>Photo</Text>
                  </TouchableHighlight>
               </View> 
              </Col>
            </Grid>
            <Grid>
              <Col >
                <View style={{ alignItems: 'center' }}>
                  <TextInput 
                    value={this.state.product_name}
                    onChangeText={(text) => this.setState({product_name:text})}
                    placeholder={"Product Name"}
                    style={{ fontSize: 18 , textAlign:'center', width: width * 0.7  ,borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}></TextInput>
                </View>
              </Col>
            </Grid>
            <Grid>
              <Col >
                <View style={{ alignItems: 'center' , margin:10}}>
                  <Dropdown
                        label='Category'
                        value={this.state.product_category_id}
                        data={this.state.categories}                        
                        valueExtractor={(item , index) => item._id}
                        labelExtractor={(item , index) => item.name}
                        containerStyle={{padding:10 , width:width * 0.7 ,borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}
                        onChangeText={this.onCategorySelectIndex.bind(this)}
                    />
                </View>
              </Col>            
            </Grid>
            <Grid>
              <Col >
                <View style={{margin:10,borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)' }}>
                <TextInput 
                    multiline={true}
                    value={this.state.product_description}
                    onChangeText={(text) => this.setState({product_description:text})}
                    placeholder={"Product Description"}
                    style={{ fontSize: 18 , height: 150, width: width,borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)',textAlignVertical: "top"}}></TextInput>                
                </View>
              </Col>            
            </Grid>
            <Grid>
              <Col size={10}/>
              <Col size={2}>
                <View style={{flexDirection:'row',}}>
                  <TextInput 
                      value={this.state.product_price}
                      placeholder={"Price"}
                      keyboardType={'numeric'}
                      onChangeText={(text) => this.setState({product_price:text})}
                      style={{ fontSize: 18 , borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}></TextInput>
                  <Text style={{fontSize:25 , textAlignVertical:'center', textAlignHorizontal:'left'}} >{this.state.product_price_unit}</Text>    
                </View>
              </Col>
            </Grid>
            <View style={{height:10}}/>
            <TouchableHighlight style={[styles.buttonContainer, styles.normalButton]} onPress={() => this.onClickListener('save')} >
                    <Text style={styles.loginText}>Save</Text>
            </TouchableHighlight>
          </View> 
            
        </Content>
        <ActionSheet
                ref={o => this.photoMenu = o}                
                options={['Add','Remove', 'Clear' ,'Cancel']}
                cancelButtonIndex={3}                
                onPress={(index) => { this.clickMenuSelect(index) }}
            />
      </Container>
    );
  }
  

}
export default connect(mapStateToProps,mapDispatchToProps)(ProductEditView);
