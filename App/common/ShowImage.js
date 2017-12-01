import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Button,
  Text,
  Body,
  Left,
  Right,
  Icon,
  Badge,ListView,Footer
} from "native-base";
import { View ,WebView,Modal,Image,StyleSheet} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer'; 
import Swiper from 'react-native-swiper'
import PercentageCircle from 'react-native-percentage-circle';
import FileThread from './FileThread';

import Util from './Util';
const noImage= require('./../../img/no-image.jpg');

/**
 * requierd paremeter
 * images:[{CreatedDate:'2017-10-24',AccountName:'上海eBestMobile',uri:'file://user/documents/image/logo.jpg',NoImg:false}]
 * title:'Show Image'
 * index:0
 */

export default class index extends Component {
  constructor(props) {
    super(props);
    //this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
        listImageData: [],
        index:0,
        title:''
    };
  }

  
 componentWillMount(){
    const { params } = this.props.navigation.state; 
    var images=[];
    var source=params.images
    source.forEach(function(element) {
        element.url=element.uri
        images.push(element)
    }, this);
    this.setState({listImageData:images,index:params.index || 0,title:params.title}); 
 }

 _renderImage() {
  var datas= this.state.listImageData;
  var imagesAry = [];
  if (datas) {
    datas.forEach((data, i) => {
      imagesAry.push(
        <View key={i} style={styles.slide} >
        {
          data.NoImg ? 
          <Image resizeMode='contain' style={styles.image} source={data.uri}>
            <View style={styles.buttomTtextView}>
              <Text style={styles.bottomText}>{data.CreatedDate}</Text>
              <Text style={styles.bottomText}>{data.AccountName}</Text>
            </View>
          </Image>
          // <Button transparent onPress={() => this._downloadImg(data, i)} 
          //   style={{paddingLeft:0,paddingRight:0,paddingBottom:0}}>
          //   {
          //     data.start ?
          //     <Image resizeMode='contain' source={data.uri}
          //         style={[styles.image,{alignItems:'center',justifyContent:'center'}]}>  
          //         <PercentageCircle radius={55} percent={data.downloadProgress} color={"#3498db"} />
          //         <View style={styles.buttomTtextViewBtn}>
          //           <Text style={styles.bottomText}>{data.CreatedDate}</Text>
          //           <Text style={styles.bottomText}>{data.AccountName}</Text>
          //         </View>
          //     </Image>
          //     : 
          //     <Image resizeMode='contain' source={data.uri} style={styles.image}>  
          //         <View style={styles.buttomTtextViewBtn}>
          //           <Text style={styles.bottomText}>{data.CreatedDate}</Text>
          //           <Text style={styles.bottomText}>{data.AccountName}</Text>
          //         </View>
          //     </Image>
          // }
          // </Button>
        :
        <Image resizeMode='contain' style={styles.image} source={{uri:data.uri}}>
          <View style={styles.buttomTtextView}>
            <Text style={styles.bottomText}>{data.CreatedDate}</Text>
            <Text style={styles.bottomText}>{data.AccountName}</Text>
          </View>
        </Image>
        }
        </View>
      );
    });
  }
  return imagesAry;
}

_downloadImg(rowData,rowID){
  const newData = [...this.state.listImageData];
  newData[rowID].start = true;
  newData[rowID].downloadProgress = 0; 
  this.setState({ listImageData: newData });

  FileThread.downloadOnDemand(rowData,(pro)=>{
      newData[rowID].downloadProgress = pro; 
      this.setState({ listImageData: newData });
  }).then((newUrl)=>{
      newData[rowID].NoImg=false;
      newData[rowID].uri = newUrl; 
      this.setState({ listImageData: newData });
   },(err)=>{
       //Util.Toast(this,JSON.stringify(err));
   });
}


_renderPagination = (index, total, context) => {
  return (
    <View style={styles.paginationStyle}> 
        <Text style={styles.paginationText}>{index + 1}/{total}</Text>
    </View>
  )
}

render() {
    //ebMobile__FilePath__c
    return (
      <Container style={{ backgroundColor: "#FFF" }}>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.title}</Title>
          </Body>
          <Right> 
          </Right>
        </Header> 
        <View style={{flex: 1, width:Util.windowSize.width, height:Util.windowSize.height }}>
          <Swiper showsButtons
            index={this.state.index*1}
            style={styles.wrapper}
            loadMinimal={true}
            loadMinimalSize={5}
            renderPagination={this._renderPagination}
            loop={false}>
              {this._renderImage()}
          </Swiper>
        </View>
        <Footer> 
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  wrapper:{
    
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    flex: 1,
    width:Util.windowSize.width, 
    height:Util.windowSize.height
  },
  paginationStyle: {
    position: 'absolute',
    bottom: 35,
    right: 20
  },
  paginationText: {
    color: '#fff',
    fontSize: 15
  },
  bottomText:{
    color:'#fff',
    fontSize:14
  },
  buttomTtextView:{
    position: 'absolute',
    bottom:0,
    width:Util.windowSize.width,
    height:60,
    backgroundColor:'#000',
    opacity:0.6,
    padding:5
  },
  buttomTtextViewBtn:{
    position: 'absolute',
    paddingBottom:30,
    width:Util.windowSize.width,
    height:60,
    backgroundColor:'#000',
    opacity:0.4,
    padding:5
  }
});
