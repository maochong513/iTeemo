import React, { Component } from 'react';
import { ListView, ScrollView, Image } from 'react-native';
import { Container, Content, Card, CardItem, Text, Icon, Right, Left, List, ListItem, SwipeRow, Button, View, Body, Badge } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import MyContainer from '../../../common/MyContainer';
import MyTitle from '../../../common/MyTitle';
import MyColPlan from '../../../common/MyColPlan';
import styles from './styles';
import LandingServices from '../../../services/LandingPageServices'
import DataItem from './dataItem'
import Toast, { DURATION } from 'react-native-easy-toast'
import Util from '../../../common/Util';

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      basic: true,
      listViewData: []
    };
  }
  readNextstep(data, rowId) {
    LandingServices.UpdateIsueCouml(LandingServices.IssueType.NextStep, data, 'read').then(() => {
      const newData = [...this.state.listViewData];
      newData[rowId].Read = true;
      this.setState({ listViewData: newData });
      Util.Toast(this,'success');
    })
  }

  deleteRow(secId, rowId, rowMap, data) {
    LandingServices.UpdateIsueCouml(LandingServices.IssueType.NextStep, data, 'close').then(() => {
      rowMap[`${secId}${rowId}`].props.closeRow();
      const newData = [...this.state.listViewData];
      newData.splice(rowId, 1);
      this.setState({ listViewData: newData });
      Util.Toast(this,'success');
    })
  }
  componentWillMount() {
    LandingServices.GetIssuesDataGroup(LandingServices.IssueType.NextStep).then((data) => {
      this.setState({ listViewData: data });
    });
  }

  _leftClick(data) {
    if (data.route) {
      this.props.navigation.navigate(data.route)
    }
    if (data.url) {
      this.props.navigation.navigate(Util.Component.MyWebView, { Title: data.name, source: data.url });
    }
  }

  _renderMenu() {
    var data = [
      { name: 'User Dashboard', Icon: require('./../../../../img/pgjapan/pg_landing_menu_1.png'), route: Util.Component.UserDashboards },
      { name: 'e-Library', Icon: require('./../../../../img/pgjapan/pg_landing_menu_2.png'), route: Util.Component.eLibrary },
      { name: 'Gallery', Icon: require('./../../../../img/pgjapan/pg_landing_menu_3.png'), route: Util.Component.Gallery },
      { name: 'Route Plan', Icon: require('./../../../../img/pgjapan/pg_landing_menu_4.png'), route: Util.Component.RoutePlan },
      { name: 'POSM Order', Icon: require('./../../../../img/pgjapan/pg_landing_menu_5.png'), url: 'https://www.baidu.com' }//https://www.pgmate2.net
    ];
    return data.map((data, i) => {
      return <ListItem onPress={() => this._leftClick(data)} key={i}>
              <Image source={data.Icon} style={{ width: 40, height: 40 }} />
              <Text style={{ paddingLeft: 20 }}>{data.name}</Text>
            </ListItem>
    });
  }

  render() {
    return (
      <MyContainer Title='Landing Page' {...this.props}>
        <Grid style={styles.mb}>
          <Row size={1} style={{ paddingTop: 1 }}>
            <Right>
              <Button iconRight small primary onPress={() => this.props.navigation.navigate(Util.Component.UserDashboards)}>
                <Text>User DashBoard</Text>
                <Icon name='arrow-forward' />
              </Button>
            </Right>
          </Row>
          <Row size={9} style={{ paddingTop: 1 }}>
            <MyColPlan size={3} Title="MENU" >
              {
                this._renderMenu()
              }
            </MyColPlan>
            <MyColPlan size={8} Title="Next Step Summary">
              <List 
                enableEmptySections={true}
                dataSource={this.ds.cloneWithRows(this.state.listViewData)}
                renderRow={(data, seleid, rowId) => <DataItem data={data} readNextstep={this.readNextstep.bind(this)} rowId={rowId} />}
                renderLeftHiddenRow={data => null}
                renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                  <Button
                    full
                    onPress={_ => this.deleteRow(secId, rowId, rowMap, data)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <Icon active name="trash" />
                  </Button>}
                leftOpenValue={1}
                rightOpenValue={-75}
              />
            </MyColPlan>
          </Row>
        </Grid>
        <Toast ref="toast" />
      </MyContainer>
    );
  }
}
