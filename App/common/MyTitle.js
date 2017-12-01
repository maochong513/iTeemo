
import React, { Component } from 'react';
import {  CardItem,Header, Title, Button, Icon, Left, Right, Body, Text } from 'native-base';

export default class Index extends Component{
  static propTypes = {

  }

  constructor(props) {
      super(props);
      this.state = {

      };
  }
  render() {
    return (
      <Header header bordered style={{backgroundColor:"#eeeeef",height:50}}>
        <Text style={{color:"#007aff"}}>
           {this.props.Title}
        </Text>
      </Header>
    );
  }
}
