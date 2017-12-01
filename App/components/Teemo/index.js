import React, { Component } from 'react';
import { StyleSheet, Image, View, TouchableHighlight } from 'react-native';
import { Container, Footer, FooterTab, CheckBox, ListItem, Header, Title, Button, Icon, Left, Content, Thumbnail, Right, Body, Text, Form, Item, Label, Input, Fab, H1, H2, Card, CardItem, Picker } from 'native-base';
import { Grid, Col, Row } from 'react-native-easy-grid';
import ModalDropdown from 'react-native-modal-dropdown';
import Toast, { DURATION } from 'react-native-easy-toast'
import Modal from 'react-native-simple-modal';

import Util from "./../../common/Util";
import MySorage from "./../../common/MySorage";
import Sync from "./../../common/Sync";
import Loading from "./../../common/Loading";
import MyTitle from "./../../common/MyTitle";
import NetWorkTool from "./../../common/NetWorkTool";
import JsonSql from "./../../common/JsonSql";

export default class Login extends Component {
  constructor(props) {
    super(props);
    var that = this;

    this.state = {
      userName: "",
      OldUserName:"",
      passWord: "",
      showSeeting: false,
      showLoading: false,
      LoadingText: "loading...",
      Sync_Name: "",
      Sync_Server: "",
      Sync_Port: "",
      Sync_Middleware: "",
      Sync_SSL: false,
      NetWork: false
    };

  }

  componentWillMount() {
    var that = this;
    //add nte work event listener
    NetWorkTool.addEventListener(NetWorkTool.TAG_NETWORK_CHANGE, (status) => {
      //Util.Toast(that, (status ? 'online' : 'offline'), 300);
      that.setState({ NetWork: status });
    });

    //review name password
    MySorage._load(Util.SorgaeKeyConfig.LoginInfo, (data) => {
      if (data) {
        that.setState({ userName: data.userName, passWord: data.passWord,OldUserName: data.userName})
      }
    });
  }

  componentWillUnmount() {
    //remove net work event listener
    NetWorkTool.removeEventListener(NetWorkTool.TAG_NETWORK_CHANGE, (isConnected) => { });
  }

  _Login() {
    var NetWork = this.state.NetWork;
    var name = this.state.userName;
    var pass = this.state.passWord;
    if (name == "" || pass == "") {
      Util.Toast(this, 'Please enter both username and password.');
      return;
    }
    if (NetWork) {
      this._LoginOnline(name, pass);
    } else {
      MySorage._load(Util.SorgaeKeyConfig.LastSyncTime, (d) => {
        if (d) {
          var loginSpanDay = Util.daysBetween(new Date(d), new Date()) > 0;
          if (loginSpanDay) {
            Util.Toast(this, 'Day first login must be online login.');
          } else {
            this._LoginOffline(name, pass);
          }
        } else {
          Util.Toast(this, 'first login must be online login.');
        }
      });
    }
  }

  // Off line
  _LoginOffline(name, pass) {
    var that = this;
    MySorage._load(Util.SorgaeKeyConfig.LoginInfo, (data) => {
      if (data) {
        var sName = data.userName;
        var sPass = data.passWord;
        if (name == sName && pass == sPass) {
          Util.Toast(this, 'login success');
          MySorage._load(Util.SorgaeKeyConfig.AppUserInfo, (data) => {
            global.AppUserInfo = data;
            Util.AppUserInfo=data;
            MySorage._load(Util.SorgaeKeyConfig.AppSystemConfig, (data) => {
              global.AppSystemConfig = data;
              Util.AppSystemConfig=data;
              setTimeout(function () {
                Util.showMain().then((screen) => {
                  that.props.navigation.navigate(screen);
                }, () => {
                  Util.Toast(this, 'Home Page error');
                });
              }, 300);
            });
          });
        } else {
          Util.Toast(this, 'Invalid username and password');
        }
      }
    });
  }

  // On line
  _LoginOnline(name, pass) {
    MySorage._load(Util.SorgaeKeyConfig.LastSyncTime, (LastSyncTime) => {
      if (name !== "" && pass !== "") {
        this.setState({
          showLoading: true,
          LoadingText: "login..."
        });
      }
      let that = this;
      Sync.login(name, pass).then((data) => {
        if (data.ServerUrl && data.SessionID) {
          //解析登录返回结果 并保存到Sorage中
          var dataMap = Util.LoginConfigDataParse(data);
          var userInfo = Util.getLoginConfigData(dataMap, Util.LoginConfigTable.User).Data[0];
          var settings = Util.getLoginConfigData(dataMap, Util.LoginConfigTable.eBestSFASetting).Data[0];
          var Configuration = Util.getLoginConfigData(dataMap, Util.LoginConfigTable.Configuration);

          // mobile version 
          var mobileVersion = JsonSql.query("select * from json where (json.ebMobile__CodeCategory__c=='MobileVersionControl' && json.ebMobile__CodeDescription__c=='Html' && json.ebMobile__IsActive__c=='true') limit 1", Configuration.Data)[0]
          // Ios download url
          var IosDownloadUrl = JsonSql.query("select * from json where (json.ebMobile__CodeCategory__c=='IosDownloadUrl' && json.ebMobile__IsActive__c=='true') limit 1", Configuration.Data)[0]
          //survey photo clear config
          var configPhotoSapn = null;
          var PhotoConfigResult = JsonSql.query("select * from json where (json.ebMobile__CodeCategory__c=='PhotoExpiredDay' && json.ebMobile__IsActive__c=='true') limit 1", Configuration.Data);
          if (PhotoConfigResult.length > 0) {
            configPhotoSapn = PhotoConfigResult[0];
          }
          else {
            configPhotoSapn = { ebMobile__CodeValue__c: 50 };
          }

          // app user info 
          var AppUserInfo = {
            returnUrl: data.ServerUrl,
            sessionId: data.SessionID,
            username: userInfo.Username,
            firstName: userInfo.FirstName,
            name: userInfo.Name,
            password: pass,
            version: mobileVersion ? mobileVersion.ebMobile__CodeValue__c : Util.AppVersion,
            roleId: userInfo.UserRoleId,
            userId: userInfo.Id,
            lastEventUpdate: null,
            userCode: userInfo.ebMobile__UserCode__c,
            sfdcApiVersion: settings.ebMobile__SFDCApiVersion__c,
            isSchemaCreated: false,
            isPriceEngineInitSyncDone: false,
            isInitialDataDownloaded: false,
            deleteExistingRecords: false,
            lastOnlineLogin: null,
            modifiableTables: [],
            photoExpiredDay: 20,
            iosDownloadUrl: IosDownloadUrl ? IosDownloadUrl.ebMobile__CodeValue__c : '',
            iMentorVersion: settings.ebMobile__iMentorVersion__c,
            lastOnlineLogin: new Date(),
            countryCode: userInfo.ebMobile__CountryCode__c,
            isSuperVisor: Util.getBoolean(userInfo.ebMobile__IsSupervisor__c),
            IsKam: Util.getBoolean(userInfo.IsKam__c)
          }

          //系统配置信息
          var AppSystemConfig = {
            serverDateTime: userInfo.ebMobile__ServerTime__c === "Invalid Date" ? new Date() : userInfo.ebMobile__ServerTime__c,
            enableOfflinePricing: false,
            enableOfflinePricing: Util.getBoolean(settings.ebMobile__OfflinePricing__c),
            isSyncFromLogin: true,
            isBatchDownload: settings.ebMobile__IsBatchDownload__c && Util.getBoolean(settings.ebMobile__IsBatchDownload__c),
            maxDownloadGroupNumber: Number(settings.ebMobile__MaxGroupNumber__c),
            fileThreadScheduleTime: Number(settings.ebMobile__FileThreadScheduleTime__c) * 60,
            scheduleTime: Math.round(Number(settings.ebMobile__IncrementalSyncDelayMinutes__c)) * 60,
            isDbSchemaChanged: Util.getBoolean(userInfo.ebMobile__RequireInitSync__c),
            photoExpiredDay: configPhotoSapn.ebMobile__CodeValue__c//surver照片默认保留50天以内的照片
          }

          global.AppUserInfo = AppUserInfo;
          global.AppSystemConfig = AppSystemConfig;
          Util.AppUserInfo=AppUserInfo;
          Util.AppSystemConfig=AppSystemConfig;
          MySorage._load(Util.SorgaeKeyConfig.LoginInfo, (data) => {
            if (!data) {
              LastSyncTime = null;
            }
            if (data) {
              if (data.userName != name) {
                LastSyncTime = null;
              }
            }
            //保存 app user info 
            MySorage._save3(Util.SorgaeKeyConfig.AppUserInfo, AppUserInfo, null);
            //保存系统配置信息
            MySorage._save3(Util.SorgaeKeyConfig.AppSystemConfig, AppSystemConfig, null);
            //保存用户账号密码
            MySorage._save3(Util.SorgaeKeyConfig.LoginInfo, { userName: name, passWord: pass }, null);
            this.setState({
              showLoading: false
            });
            var syncType = (LastSyncTime == null || name !== this.state.OldUserName) ? Util.syncType.Initial : Util.syncType.Incremenetal;
            Util.Toast(this, 'login success');
            setTimeout(function () {
              that.props.navigation.navigate(Util.Component.SyncPage, { syncType: syncType })
            }, 300);
          })
        } else {
          this.setState({
            showLoading: false
          });
          Util.Toast(this, 'Invalid username and password');
        }
      }, (error) => {
        this.setState({
          showLoading: false
        });
        Util.Toast(this, error.message);
      });
    });
  }

  _showSeeting() {
    var that = this;
    MySorage._load(Util.SorgaeKeyConfig.SyncConfigInfo, function (data) {
      if (data) {
        that.setState({ Sync_Name: data.Name, Sync_Server: data.Server, Sync_Port: data.Port, Sync_SSL: data.SSL, Sync_Middleware: data.Middleware })
      } else {
        data = Util.SyncDefaultConfig[0];
        that.setState({ Sync_Name: data.Name, Sync_Server: data.Config.Server, Sync_Port: data.Config.Port, Sync_SSL: data.Config.SSL, Sync_Middleware: data.Config.Middleware })
      }
      that.setState({ showSeeting: !that.state.showSeeting })
    });
  }
  /**
   * save Sync setting
   */
  _SaveSyncSetting() {
    var Server = this.state.Sync_Server;
    var Port = this.state.Sync_Port;
    var Middleware = this.state.Sync_Middleware;
    var SSL = this.state.Sync_SSL;
    if (Server == "" || Port == "") {
      Util.Toast(this, '请填写完整配置信息');
      return;
    }
    console.log({ Name: this.state.Sync_Name, Server: Server, Port: Port, Middleware: Middleware, SSL: SSL })
    MySorage._save3(Util.SorgaeKeyConfig.SyncConfigInfo, { Name: this.state.Sync_Name, Server: Server, Port: Port, Middleware: Middleware, SSL: SSL }, null);
    this.setState({ showSeeting: !this.state.showSeeting })
  }

  _dropdown_onSelect(rowID, rowData) {
    this.setState({ Sync_Name: rowData.Name, Sync_Server: rowData.Config.Server, Sync_Port: rowData.Config.Port, Sync_Middleware: rowData.Config.Middleware, Sync_SSL: rowData.Config.SSL })
  }

  _toggle_SSl() {
    this.setState({ Sync_SSL: !this.state.Sync_SSL });
  }
  componentDidMount() {

  }
  render() {
    return (
      <Container style={{ justifyContent: "center" }}>
        <Grid style={{ backgroundColor: "#fff" }}>
          <Col size={3}>
            <Row size={2} style={[styles.modal, { paddingTop: 10 }]}>
              <Thumbnail square source={require('./../../../img/logo.png')} style={{ width: 150, height: 150 }} />
            </Row>
            <Row size={1} style={styles.modal} >
              <H2>Sales Force Automation</H2>
            </Row>
            <Row size={3}>
              <Content >
                <Form>
                  <Item>
                    <Icon active name='md-person' style={{ color: '#387ef5', fontSize: 30 }} />
                    <Input placeholder='User name' onChangeText={(name) => this.setState({ userName: name })} value={this.state.userName} />
                  </Item>
                  <Item>
                    <Icon active name='md-unlock' style={{ color: '#387ef5', fontSize: 30 }} />
                    <Input placeholder='Password' secureTextEntry={true} onChangeText={(pwd) => this.setState({ passWord: pwd })} value={this.state.passWord} />
                  </Item>
                </Form>
                <Button block style={{ margin: 15 }}
                  onPress={this._Login.bind(this)}>
                  <Text>Login</Text>
                </Button>
                <Text style={{ margin: 15 }}>v {Util.AppVersion}</Text>
              </Content>
            </Row>
          </Col>
          <Col size={5}>
            <Image source={require('./../../../img/welcome.jpg')}
              style={{ width: Util.windowSize.width * 0.625, height: Util.windowSize.height }}>
              <View style={styles.settings}>
                <Button style={{ borderRadius: 10 }} onPress={this._showSeeting.bind(this)}>
                  <Icon name='settings' />
                </Button>
              </View>
            </Image>
          </Col>
        </Grid>
        <Modal
          open={this.state.showSeeting}
          modalDidOpen={() => console.log('modal did open')}
          modalDidClose={() => this.setState({ showSeeting: false })}
          modalStyle={{
            margin: 250,
            height: 300,
            padding: 0
          }}>
          <MyTitle Title="Setting" />
          <Form style={{ height: 200 }}>
            <Item>
              <Icon active name='md-card' style={{ color: '#387ef5', fontSize: 30 }} />
              <ModalDropdown defaultValue={this.state.Sync_Name}
                RightIcon="globe"
                style={styles.dropdown}
                textStyle={styles.dropdown_text}
                dropdownStyle={styles.dropdown_dropdown}
                options={Util.SyncDefaultConfig}
                renderRow={this._dropdown_renderRow.bind(this)}
                onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
              </ModalDropdown>
            </Item>
            <Item>
              <Icon active name='globe' style={{ color: '#387ef5', fontSize: 30 }} />
              <Input placeholder='server' onChangeText={(val) => this.setState({ Sync_Server: val })} value={this.state.Sync_Server} />
            </Item>
            <Item>
              <Icon active name='md-git-network' style={{ color: '#387ef5', fontSize: 30 }} />
              <Input placeholder="Port" onChangeText={(val) => this.setState({ Sync_Port: val })} value={this.state.Sync_Port} />
            </Item>
            <ListItem button onPress={() => this._toggle_SSl()}>
              <Icon name='md-lock' style={{ color: '#387ef5', fontSize: 30, paddingRight: 15 }} />
              <CheckBox color="#387ef5" checked={this.state.Sync_SSL} onPress={() => this._toggle_SSl()} />
              <Body>
                <Text>SSL</Text>
              </Body>
            </ListItem>
          </Form>
          <View style={styles.buttonView}>
            <Button iconLeft style={{ marginRight: 10 }} onPress={() => this.setState({ showSeeting: false })}>
              <Icon active name="md-close" />
              <Text>Cancel</Text>
            </Button>
            <Button iconLeft onPress={this._SaveSyncSetting.bind(this)}>
              <Icon active name="md-checkbox-outline" />
              <Text>Save</Text>
            </Button>
          </View>
        </Modal>
        <Toast ref="toast" />
        <Loading showLoading={this.state.showLoading} LoadingText={this.state.LoadingText} />
      </Container>
    );
  }

  _dropdown_renderRow(rowData, rowID, highlighted) {
    return (
      <TouchableHighlight underlayColor='cornflowerblue'>
        <View style={[styles.dropdown_row]}>
          <Text style={[styles.dropdown_row_text, highlighted && { color: 'mediumaquamarine' }]}>
            {`${rowData.Name}`}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  settings: {
    position: 'absolute',
    bottom: 30,
    right: 30
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-end",
    paddingRight: 10
  },
  dropdown: {
    alignSelf: 'flex-end',
    width: 150,
    right: 8,
    borderWidth: 0,
    marginLeft: 10
  },
  dropdown_text: {
    marginVertical: 10,
    marginHorizontal: 6,
    fontSize: 16,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  dropdown_dropdown: {
    width: 150,
    height: 100,
    borderColor: '#eeeeef',
    borderWidth: 1,
    borderRadius: 3,
  },
  dropdown_row: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_image: {
    marginLeft: 4,
    width: 30,
    height: 30,
  },
  dropdown_row_text: {
    marginHorizontal: 4,
    fontSize: 16,
    color: 'navy',
    textAlignVertical: 'center',
  },
  dropdown_separator: {
    height: 1
  }
});
