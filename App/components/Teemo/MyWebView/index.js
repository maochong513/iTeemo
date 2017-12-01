import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Footer,
  FooterTab,
  Text,
  Body,
  Left,
  Right,
  Icon,
  Badge
} from "native-base";
import { View ,WebView,ActivityIndicator} from 'react-native';

import Util from '../../../common/Util';

export default class index extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { params } = this.props.navigation.state;
    return (
      <Container style={{ backgroundColor: "#FFF" }}>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{params.Title || 'title'}</Title>
          </Body>
          <Right>
          <Button transparent onPress={this._goBack}>
              <Icon name="arrow-back" />
            </Button>
            <Button transparent onPress={this._goForward}>
              <Icon name="arrow-forward" />
            </Button>
            <Button transparent onPress={this._reload}>
              <Icon name="refresh" />
            </Button>
          </Right>
        </Header>
        <Content padder>
          <View style={{ backgroundColor: "white", flex: 1 }}>
            <WebView
              ref={webview => this.webview = webview}
              style={{width:Util.windowSize.width,height:Util.windowSize.height}}
              source={{ uri: params.source || 'https://www.ebestglobal.com' }}
              automaticallyAdjustContentInsets={false}
              mixedContentMode="always"
              decelerationRate="normal"
              startInLoadingState={true} 
              renderLoading={() => <ActivityIndicator color='#007fff' size='large' style={{marginTop: 120}}/>}></WebView>
          </View>
        </Content>
      </Container>
    );
  }

  _reload = () => {
    this.webview.reload()
  }
  _goBack = () => {
    this.webview.goBack()
    this._postMessage()
  }

  _goForward = () => {
    this.webview.goForward()
    this._postMessage()
  }
  
  _postMessage = () => {
    if (this.webview) {
      //this.webview.postMessage('window.postMessage(window.location)')
    }
  }
  _onMessage = (e) => {
    this.setState({uri: e.nativeEvent.data})
  }
}