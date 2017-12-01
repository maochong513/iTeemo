  
import React, { Component } from "react";
import { 
  StyleSheet,
  Text,
  View,
  WebView
} from 'react-native';
import {
  Content
} from "native-base";
 

export default class MyWebView extends Component {
  constructor(props) {
    super(props);
  } 
  render() {
    return (
        <Content padder>
          <View style={{ backgroundColor: "white", flex: 1 }}>
            <WebView source={{ uri: this.props.source || 'https://www.ebestglobal.com' }}></WebView>
          </View>
        </Content> 
    );
  }
} 
