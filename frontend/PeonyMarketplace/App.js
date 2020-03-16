/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import AppRootContainer from './src/AppRootContainer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './src/screens/components/redux/reducer';
const store = createStore(rootReducer);

class App extends Component {
  render() {
    return (
      <Provider store={ store }>
         <AppRootContainer />          
      </Provider>
    );
  }
}
export default  App;