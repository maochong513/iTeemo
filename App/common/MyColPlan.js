
import React, { Component } from 'react';
import {  Col } from 'native-base';
import { StyleSheet } from 'react-native';

import MyTitle from './MyTitle'
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
        <Col size={this.props.size} style={styles.plan_border} >
            <MyTitle Title={this.props.Title} /> 
            {
                this.props.children
            }
        </Col>
    );
  }
}

const styles = StyleSheet.create({
    plan_border:{
    borderWidth:1,
    borderColor:"#b2b0b0",
    borderRadius:3,
    marginRight:10,
    backgroundColor:"#fff"
}
});
