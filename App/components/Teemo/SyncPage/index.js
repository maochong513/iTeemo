import React, { Component } from 'react';
import { ListView, ScrollView, Animated, Easing, Image } from 'react-native';
import { Container, Content, Tabs, Tab, TabHeading, Thumbnail, Text, Icon, Right, Left, List, ListItem, Button, View, Body, Badge } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import Modal from 'react-native-simple-modal';
import Toast, { DURATION } from 'react-native-easy-toast'
import ImageViewer from 'react-native-image-zoom-viewer';
import Swiper from 'react-native-swiper';
//Component
import MyContainer from './../../../common/MyContainer';
import MyTitle from './../../../common/MyTitle';
import DataItem from './dataItem';
import ImageItem from './imageItem';
import ImageItemSegment from './imageItemSegment';
//Util
import Sync from "./../../../common/Sync";
import Loading from "./../../../common/Loading";
import MySorage from "./../../../common/MySorage";
import NetWorkTool from "./../../../common/NetWorkTool";
import Util from "./../../../common/Util";

import styles from './styles';
import failImg from "../../../../img/contacts/pratik.png";

const datas = [
  {
    Name: "ドラッグストアマツモトキヨシ下板橋店",
    Code: "SH2019018282",
    Time: "3:43 pm",
    State: false,
    showImage: false,
    Type: "Customer Visit",
    imgTotal: 10,
    imgSuccess: 9,
    Images: [{
      src: require("../../../../img/1.jpg"),
      time: '3:25 pm',
      State: true
    }, {
      src: require("../../../../img/2.jpg"),
      time: '3:27 pm',
      State: false
    }, {
      src: require("../../../../img/3.jpg"),
      time: '3:28 pm',
      State: false
    }]
  },
  {
    Name: "くすりの福太郎上池袋店 くすりの福太郎上池袋店",
    Code: "SDJ019018282",
    Time: "3:49 pm",
    State: false,
    showImage: false,
    Type: "Customer Visit",
    imgTotal: 15,
    imgSuccess: 8,
    Images: [{
      src: require("../../../../img/1.jpg"),
      time: '3:25 pm',
      State: true
    }, {
      src: require("../../../../img/2.jpg"),
      time: '3:27 pm',
      State: false
    }, {
      src: require("../../../../img/3.jpg"),
      time: '3:28 pm',
      State: false
    }]
  }
];

export default class SyncPage extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      showLoading: false,
      LoadingText: "loading...",
      listViewData: datas,
      listImageData: datas,
      showImage: false,
      imageIndex: 0,
      PropImage: null,
      AppSystemConfig: null,
      AppUserInfo: null,
      syncState:Util.syncState.end
    };
  }

  //组件挂载完成后执行
  componentWillMount() {
    var that = this;
    const { params } = this.props.navigation.state;

    datas.forEach((data, index, array) => {
      data.Animated = new Animated.Value(0);
    });
    this.setState({ listViewData: datas, listImageData: datas });

    if (params != null) {
      const SyncType = params.syncType;
      Sync.Init(Util.AppSystemConfig, Util.AppUserInfo, SyncType, that, null);
      this.setState({ showLoading: true, LoadingText: "please wait...",syncState:Util.syncState.start });
      Sync.syncDatabse((message)=>{
        this.setState({ LoadingText: message });
      }).then(() => {
        this.setState({ LoadingText: "success...",syncState:Util.syncState.end });     
        setTimeout(() => {
          this.setState({ showLoading: false });
          Util.showMain().then((screen) => {
            this._gotoScreen(screen)
          }, () => {
            Util.Toast(that, 'show main page error');
          });
        }, 800);
      }, (error) => {
        Util.Toast(that, error.message);
      });
    }
  }

  _gotoScreen(screen) {
    this.props.navigation.navigate(screen)
  }

  componentWillUnmount() {

  }

  _SyncVisitData(data, rowId) {
    const newData = [...this.state.listViewData];
    //newData[rowId].State = true;
    this._spin(data);
    this.setState({ listViewData: newData });
  }

  _SyncVisitImg(data, rowId) {
    const newData = [...this.state.listImageData];
    newData[rowId].State = true;
    this._spin(data);
    this.setState({ listImageData: newData });
  }

  //Start upload animated
  _spin(data) {
    data.Animated.setValue(0)
    Animated.timing(
      data.Animated,
      {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear
      }
    ).start(() => { this._spin(data) })
  }

  //show image prop
  _ShowImageProp(data, rowId) {
    var Images = [];
    data.Images.forEach((d) => {
      Images.push({ url: d.src });
    });
    this.setState({ showImage: true, PropImage: Images, imageIndex: rowId })
  }

  _renderPropImage() {
    var datas = this.state.PropImage;
    var imagesAry = [];
    if (datas) {
      datas.forEach((data, i) => {
        imagesAry.push(
          <View key={i} style={styles.slide1} >
            <Button active={false} transparent onPress={() => this.setState({ showImage: false })}>
              <Image resizeMode='contain' style={styles.image} source={data.url} />
            </Button>
          </View>
        );
      });
    }
    return imagesAry;
  }

  _ImgItemClick(data, rowId) {
    const newData = [...this.state.listImageData];
    newData[rowId].showImage = !data.showImage;
    this.setState({ listImageData: newData });
  }

  _syncDataBtn() {
    const { params } = this.props.navigation.state;
    this.setState({ showLoading: true, LoadingText: "loading..." });
    Sync.syncDatabse((message)=>{
      this.setState({ LoadingText: message });
    }).then(() => {
      this.setState({ LoadingText: "loading success.." });
      setTimeout(() => {
        this.setState({ showLoading: false });
      }, 1500);
    });
  }

  render() {
    return (
      <MyContainer Title='SyncPage' {...this.props} syncState={this.state.syncState}>
        <Grid style={styles.mb}>
          <Row size={9} style={{ paddingTop: 10 }}>
            <Col style={styles.plan_border}>
              <Tabs>
                <Tab heading={<TabHeading>
                  <Icon name="md-bicycle" /><Text>Customer Visit</Text>
                  <Badge><Text>2</Text></Badge>
                </TabHeading>}>
                  <ListView
                    dataSource={this.ds.cloneWithRows(this.state.listViewData)}
                    renderRow={(data, sectionId, rowId) =><DataItem data={data} _SyncVisitData={() => this._SyncVisitData(data, rowId)} />}
                  />
                </Tab>
                <Tab heading={
                  <TabHeading>
                    <Icon name="ios-images" /><Text>Image</Text>
                    <Badge><Text>10</Text></Badge>
                  </TabHeading>}>
                  <ListView
                    enableEmptySections={true}
                    dataSource={this.ds.cloneWithRows(this.state.listImageData)}
                    renderRow={(data, sectionId, rowId) =>
                      <View>
                        <ImageItem data={data}
                          _rowId={rowId}
                          _ShowImageProp={this._ShowImageProp}
                          _SyncVisitImg={() => this._SyncVisitImg(data, rowId)}
                          _ItemClick={() => this._ImgItemClick(data, rowId)} />
                        {
                          data.showImage &&
                          <View>
                            <List
                              dataArray={data.Images}
                              renderRow={(da, sectionId, rowId) =>
                                <ImageItemSegment data={da} _ShowImageProp={() => this._ShowImageProp(data, rowId)} />
                              } />
                          </View>
                        }
                      </View>
                    } />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
        <Modal
          open={this.state.showImage}
          modalDidOpen={() => console.log('modal did open')}
          modalDidClose={() => this.setState({ showImage: false })}
          modalStyle={{ flex: 1, padding: 0, margin: 0 }}>
          <Swiper style={styles.wrapper}>
            {this._renderPropImage()}
          </Swiper>
          {/* <ImageViewer imageUrls={this.state.PropImage}/> */}
        </Modal>
        <Loading showLoading={this.state.showLoading} LoadingText={this.state.LoadingText} />
        <Toast ref="toast" />
      </MyContainer>
    );
  }
}
