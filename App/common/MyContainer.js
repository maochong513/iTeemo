
import React, { Component } from 'react';
import { Container, Header, Title, Content, Button, Icon, Left, Right, Body, Text, ListItem, List,Thumbnail } from 'native-base';
import Toast, { DURATION } from 'react-native-easy-toast'

import {Animated,Easing,Image,View} from 'react-native';

import Util from "./Util";
import Sync from "./Sync";
import Loading from "./Loading";
import MySorage from "./MySorage";
import moment from 'moment';

export default class MyContainer extends Component{
  static propTypes = {
  }
  constructor(props) {
      super(props); 
      this.state={
        UserName:'',
        nowTime:''
      };
    this.spinValue = new Animated.Value(0);
  }

  //组件挂在完成后执行
  componentWillMount() {
    var that = this; 
    that.setState({UserName:Util.AppUserInfo.firstName})
    Sync.Init(Util.AppSystemConfig, Util.AppUserInfo, Util.syncType.Incremenetal, that, null);
    // var nowTime=moment(new Date()).format('HH:mm:ss');
    // that.setState({nowTime:nowTime});
    
    // setInterval(function() {
    //   var nowTime=moment(new Date()).format('HH:mm:ss');
    //   that.setState({nowTime:nowTime})
    // }, 1000);
    var syncState = this.props.syncState;
    if(syncState!=undefined){ 
      if( syncState!==Util.syncState.end){
        this._animatedStart();    
      }
    }
  }

  componentWillReceiveProps(){
    var syncState = this.props.syncState;
    if(syncState!=undefined){ 
      if(syncState===Util.syncState.end){
        this._animatedEnd();    
      }
    }
  }

 
  _startAnimation() { 
    this._animatedStart();    
    Sync.syncDatabse((message)=>{
      Util.Toast(this,message);
    }).then(() => {
      this._animatedEnd('sync success');
    },(error)=>{
      this._animatedEnd(error.message);
    });
  }

  _animatedStart(){
    this.spinValue.setValue(0);
    Animated.timing(
      this.spinValue,
      {
          toValue: 1000,
          duration: 1500000,
          easing: Easing.linear
      }
    ).start(()=>{this._animatedEnd()}); 
  }

  _animatedEnd(message){
    this.spinValue.setValue(0);
    this.spinValue.stopAnimation(()=>{
      if(message){
        Util.Toast(this,message);
      }
    });
  }

  render() {
    return (
      <Container style={{backgroundColor:"#eeeeef"}}>
        <Header style={{backgroundColor:'#2e2f33'}}>
           <Left style={{flexDirection:"row",alignItems: 'center'}}>
             <Button transparent onPress={() => this.props.navigation.navigate("DrawerOpen")}>
                <Icon name="menu"  style={{ color: '#fff'}} />
             </Button>
             <Text style={{paddingLeft:10,color:'#fff'}}>Hi {this.state.UserName}</Text>
           </Left>
           <Body>
               <Title style={{color:"#fff"}}>{this.props.Title}</Title>
           </Body>
           <Right style={{flexDirection:"row",alignItems: 'center'}}>  
              <Text style={{paddingRight:10,color:'#fff'}}>{this.state.nowTime}</Text>
              <Button transparent  onPress={this._startAnimation.bind(this)}>
                   <Animated.View style={{
                    		          transform: [
                    		            {
                                        rotate:  this.spinValue.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: ['0deg', '360deg']
                                        })
                    		            }
                    		          ]
                    		        }}>
                      <Icon name="md-sync" style={{fontSize:40,color:'#fff' }}/>
                  </Animated.View>
              </Button>
           </Right>
         </Header> 
           {
             this.props.children
           }
        <Toast ref="toast" />
      </Container>
    );
  }
}
