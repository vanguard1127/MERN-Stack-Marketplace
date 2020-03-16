/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { View, Icon } from 'native-base';
import Gallery from 'react-native-image-gallery';
// import { Actions } from 'react-native-router-flux';

// Our custom files and classes import
import Text from './../../components/Text';

export default class ImageGallery extends Component {
  constructor(props) {
      super(props);
      this.state = {
        images: [],
        position:'',
      };
  }

  componentWillMount() {
    let imgs = [];
    const images = this.props.navigation.getParam('images');
    const position = this.props.navigation.getParam('position');
    images.map((img) => {
      imgs.push({source: img.src})
    });
    this.setState({images: imgs, position:position});
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <Gallery
          initialPage={this.state.position ? this.state.position : 0}
          style={{flex: 1, backgroundColor: 'black'}}
          images={this.state.images}
          keyExtractor={(item, index) => index.toString() }
        />
        <Icon name="ios-close" style={styles.icon} onPress={() => this.props.navigation.goBack()}/>
      </View>
    );
  }
}

const styles = {
  icon: {
    color: 'white',
    fontSize: 46,
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40
  }
};
