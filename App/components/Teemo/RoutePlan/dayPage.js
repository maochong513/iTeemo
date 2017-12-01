import React, { Component } from "react";
import { ListView, Image } from 'react-native';
import { TabHeading, Footer, FooterTab, Container, Content, Card, CardItem, Text, Icon, Right, Left, List, ListItem, Thumbnail, SwipeRow, Button, View, Body, Badge, Segment, Tabs, Tab } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import MyColPlan from '../../../common/MyColPlan';
import DateThumbnail from '../../../common/dateThumbnail';
import Echarts from 'native-echarts';

import Util from '../../../common/Util';
import JsonSql from '../../../common/JsonSql';
import styles from './styles';
import RouotePlanServices from '../../../services/RoutePlanServices'
import PGSurveyServices from '../../../services/PGSurveyServices'

// import { RouotePlanServices , PGSurveyServices } from '../../../services/'

const noImg = require('./../../../../img/default.jpg');

export default class index extends Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            selectCustomer: {},
            listViewData: [],
            listAlterData: [],  // alert List Data
            listNextStepData: [],
            ListNoteData: [],
            CustomerDashboardData: null
        };
    }

    componentWillMount() {
        RouotePlanServices.getDayCustomers().then((data) => {
            if (data.length > 0) {
                this.setState({ selectCustomer: data[0] });
                this._InitCustomerData(data[0]);
            }
            this.setState({ listViewData: data });
        });
    }

    render() {
        const selectCustomer = this.state.selectCustomer;
        return (
            <Grid>
                <MyColPlan size={3} Title="Plan" >
                    <List
                        enableEmptySections={true}
                        dataSource={this.ds.cloneWithRows(this.state.listViewData)}
                        renderRow={(data, secId, rowId, rowMap) => this._renderPlanRow(data, secId, rowId, rowMap, this)}
                        renderLeftHiddenRow={(data, secId, rowId, rowMap) => null}
                        renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                            <Button full danger>
                                <Icon name="trash" />
                            </Button>}
                        leftOpenValue={1}
                        rightOpenValue={-75}
                    />
                </MyColPlan>

                <MyColPlan size={7} Title="Customer Info" >
                    <Grid>
                        <Col size={22}>
                            <Row size={4}>
                                <Grid>
                                    
                                    <Row size={3}>
                                        <Col size={3} style={{overflow:"hidden", alignItems:"center", justifyContent:"center"}}>
                                            {
                                                selectCustomer.AttachmentId ? 
                                                    <Thumbnail resizeMode='contain'  square large source={noImg} style={styles.MainImage} />
                                                    :
                                                    <Thumbnail resizeMode='contain'  square large source={noImg} style={styles.MainImage} />
                                            }
                                        </Col>
                                        <Col size={6} style={{ paddingLeft: 15, margin: 10 }}>
                                            <Row size={4} style={{ flexDirection: "column" }}>
                                                {
                                                    selectCustomer.Name ?
                                                        <View>
                                                            <Text>{selectCustomer.Name}({selectCustomer.AccountNumber})</Text>
                                                            <Text></Text>
                                                            {/* <Text>Classification:{selectCustomer.Segment}</Text> */}
                                                            <Text>Trade:{selectCustomer.Channel}</Text>
                                                            <Text>{selectCustomer.Address}</Text>
                                                            {/* <Text>{selectCustomer.FirstName}</Text>
                                                            <Text>{selectCustomer.Title}</Text> */}
                                                            <Text>{selectCustomer.Phone}</Text>
                                                            <Text>{selectCustomer.Mobile}</Text>
                                                            <Text>{selectCustomer.Email}</Text>
                                                        </View>
                                                        :
                                                        null
                                                }
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row size={2}>
                                        <Echarts option={this.state.CustomerDashboardData} height={180} width={800}/>
                                    </Row>
                                </Grid>
                            </Row>
                            <Row size={5}>
                                <Tabs locked={true}>
                                    <Tab heading={<TabHeading><Icon name="warning" /><Text>Alert</Text></TabHeading>}>
                                        <ListView
                                            enableEmptySections={true}
                                            dataSource={this.ds.cloneWithRows(this.state.listAlterData)}
                                            renderRow={(data, secId, rowId, rowMap) => this._renderAlertRow(data, secId, rowId, rowMap)} />
                                    </Tab>
                                    <Tab heading={<TabHeading><Icon name="bookmark" /><Text>Next Setp</Text></TabHeading>}>
                                        <ListView
                                            enableEmptySections={true}
                                            dataSource={this.ds.cloneWithRows(this.state.listNextStepData)}
                                            renderRow={(data, secId, rowId, rowMap) => this._renderNestStepRow(data, secId, rowId, rowMap)} />
                                    </Tab>
                                    <Tab heading={<TabHeading activeTextStyle={{ backgroundColor: 'red' }}><Icon name="book" /><Text>Note</Text></TabHeading>}>
                                        <List
                                            enableEmptySections={true}
                                            dataSource={this.ds.cloneWithRows(this.state.ListNoteData)}
                                            renderRow={(data, secId, rowId, rowMap) => this._renderNoteRow(data, secId, rowId, rowMap, this)}
                                            renderLeftHiddenRow={(data, secId, rowId, rowMap) => null}
                                            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                                <Button full danger>
                                                    <Icon name="trash" />
                                                </Button>}
                                            leftOpenValue={1}
                                            rightOpenValue={-75}
                                        />
                                    </Tab>
                                </Tabs>
                            </Row>
                        </Col>
                        <Col size={3.2}>
                            <View style={{
                                backgroundColor: "#2e2f33",
                                justifyContent: "flex-end",
                                flexDirection: "column",
                                alignItems: "stretch",
                                borderWidth: 0,
                                flex: 1}}>
                                <Button transparent vertical>
                                    <Icon active={true} name='bookmarks' style={styles.RightButton} />
                                    <Text style={styles.RightButtonIcon}> Document</Text>
                                </Button>
                                <Button transparent vertical>
                                    <Icon active={true} name='speedometer' style={styles.RightButton} />
                                    <Text style={styles.RightButtonIcon}>Dashboard</Text>
                                </Button>
                                <Button transparent vertical>
                                    <Icon active={true} name='paper' style={styles.RightButton} />
                                    <Text style={styles.RightButtonIcon}>  Attbutes</Text>
                                </Button>
                                <Button transparent vertical>
                                    <Icon active={true} name='folder' style={styles.RightButton} />
                                    <Text style={styles.RightButtonIcon}>Profile</Text>
                                </Button>
                            </View>
                        </Col>
                    </Grid>
                </MyColPlan>

            </Grid>
        );
    }

    _renderPlanRow(data, secId, rowId, rowMap, that) {
        var selectCustomer = that.state.selectCustomer;
        return (selectCustomer && selectCustomer.Id == data.Id) ?
            <ListItem selected avatar style={styles.itemSel} key={rowId} button onPress={() => this._planCustomerClick(data)}>
                <Left>
                    <Thumbnail small source={noImg} />
                </Left>
                <Body>
                    <Text numberOfLines={1} style={{ color: '#fff' }}>{data.Name}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Left><Text numberOfLines={1} note style={{ color: '#fff' }}>{data.Type}</Text></Left>
                        {
                            data.ebMobile__IsPlanned__c == "0" ? <Right><Text note style={{ color: '#fff' }}>UNPLANNED</Text></Right> : null
                        }
                    </View>
                </Body>
            </ListItem>
            :
            <ListItem avatar style={styles.item} key={rowId} button onPress={() => this._planCustomerClick(data)}>
                <Thumbnail small source={noImg} />
                <Body>
                    <Text numberOfLines={1}>{data.Name}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Left><Text numberOfLines={1} note>{data.Type}</Text></Left>
                        {
                            data.ebMobile__IsPlanned__c == "0" ? <Right><Text note>UNPLANNED</Text></Right> : null
                        }
                    </View>
                </Body>
            </ListItem>
    }

    _planCustomerClick(selCustomer) {
        var currentSel=this.state.selectCustomer;
        if(currentSel.Id===selCustomer.Id) return;
        this.setState({ selectCustomer: selCustomer });
        this._InitCustomerData(selCustomer);
    }

    //init customer(alter,note,next step)data
    _InitCustomerData(selCustomer) {
        var that = this;
        // get alert data
        PGSurveyServices.getSeruryData(selCustomer.Id).then((data) => {
            var POSURVEY = JsonSql.query("select * from json where (json.ebMobile__Code__c=='POSURVEY') limit 1", data);
            if (POSURVEY.length > 0) {
                PGSurveyServices.getTrackingIdOver(POSURVEY[0], selCustomer.Id).then(function (trackId) {
                    PGSurveyServices.getPOQuestion(selCustomer.Id, "PO", null, trackId).then(function (answerData) {
                        var listAlter = JsonSql.query("select * from json where (json.DefaultValue=='No' || json.DefaultValue == null)", answerData)
                        that.setState({ listAlterData: listAlter });
                    });
                });
            }
        }).then(() => {
            RouotePlanServices.getIssuesData(selCustomer.Id, RouotePlanServices.IssueType.NextStep).then(function (data) {
                that.setState({ listNextStepData: data });
            });
        }).then(() => {
            RouotePlanServices.getNoteData(selCustomer.Id).then(function (data) {
                that.setState({ ListNoteData: data });
            });
        }).then(() => {
            function rand(n) {
                return (Math.floor(Math.random() * n + 1));
            }
            var names = [{ name: 'Sales Value' }, { name: 'Sales Volume' }, { name: 'Share Value' }, { name: 'Visit' }, { name: 'Display' }, { name: 'Shelf' }];
            var series = [];
            for (var i = 0; i < names.length; i++) {
                
                var cen = i==0 ? 7 : 7 + (i * 12);
                var complete = rand(100);
                var color = "";
                if (complete <= 50)
                    color = "#76b4f2";
                if (complete > 50 && complete <= 80)
                    color = "#3480d1";
                if (complete > 80)
                    color = "#007aff";
                series.push({
                    type: 'gauge',
                    center: [cen + '%', '25%'], // 默认全局居中
                    radius: '45%',
                    axisLine: {
                        show: false,
                        lineStyle: { // 属性lineStyle控制线条样式
                            color: [
                                [complete / 100, color],
                                [1, 'rgba(2, 0, 12, 0.3)']
                            ],
                            width: 10
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {

                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    pointer: {
                        show: false,
                        length: '0',
                        width: '0'
                    },
                    detail: {
                        formatter: '{value}%',
                        offsetCenter: [0, '-10%'],
                        textStyle: {
                            fontWeight: 'bolder',
                            fontSize: 20
                        }

                    },
                    data: [{
                        value: complete,
                        name: names[i].name,
                        label: {
                            textStyle: {
                                fontSize: 2
                            }
                        }
                    }],
                    title: {
                        "show": true,
                        "offsetCenter": [0, "100%"], //标题位置设置
                        "textStyle": { //标题样式设置
                            "color": "#007aff",
                            "fontSize": 13,
                            "fontFamily": "微软雅黑",
                            "fontWeight": "bold"
                        }
                    },
                })
            }
            var option = {
                tooltip: {
                    formatter: "{a} <br/>{b} : {c}%"
                },
                series: series
            };
            that.setState({ CustomerDashboardData: option });
        });
    }

    _renderAlertRow(data, secId, rowId, rowMap) {
        return (<ListItem key={rowId}>
            <Row size={1}>
                <DateThumbnail date={data.TaskCreatedDate} />
            </Row>
            <Row size={5}>
                <Text numberOfLines={2}>
                    {data.Title__c}
                </Text>
            </Row>
            <Row size={1}>
                <Text>Priority Completion</Text>
            </Row>
        </ListItem>);
    }

    _renderNestStepRow(data, secId, rowId, rowMap) {
        return (<ListItem key={rowId}>
            <Row size={1}>
                <DateThumbnail date={data.Date} />
            </Row>
            <Row size={4}>
                <Text>
                    {data.Description}
                </Text>
            </Row>
            <Row size={4}>
                <Text>
                    {data.retailerDescription}
                </Text>
            </Row>
            <Row size={1}>
                <Text>
                    {data.Type}
                </Text>
            </Row>
            <Row size={1}>
                <Text>
                    {data.TaskStatus}
                </Text>
            </Row>
            <Row size={1}>
                <Text>
                    {data.ActivityDate}
                </Text>
            </Row>
        </ListItem>);
    }

    _renderNoteRow(data, secId, rowId, rowMap) {
        return (<ListItem key={rowId} style={{ paddingLeft: 20 }}>
            <Row size={1}>
                <DateThumbnail date={data.Date} />
            </Row>
            <Row size={4}>
                <Text numberOfLines={4}>
                    {data.noteBody}
                </Text>
            </Row>
            <Row size={1}>
                <Text>{data.User}</Text>
            </Row>
        </ListItem>);
    }


}