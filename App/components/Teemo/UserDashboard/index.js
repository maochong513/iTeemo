import React, { Component } from 'react';
import { ListView, ScrollView } from 'react-native';
import { Container, Content, Card, CardItem, Text, Icon, Right, Left, List, ListItem, SwipeRow, Button, View, Body, Badge } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import Echarts from 'native-echarts';

import MyContainer from '../../../common/MyContainer';
import MyTitle from '../../../common/MyTitle';

import styles from './styles';

export default class UserDashboard extends Component {

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
             DashboardData:null
        };
    }

    renderItem() {
        var datas = [
            { kpiName: '売上金額(千円)', target: 1090, acture: 450, reach: 67.1 },
            { kpiName: '売上数量', target: 1031, acture: 892, reach: 89.1 },
            { kpiName: '本部活動指示', target: 1089, acture: 894, reach: 34.2 },
            { kpiName: 'コール達成率', target: 1054, acture: 835, reach: 62.4 },
            { kpiName: '本部活動指示', target: 1890, acture: 580, reach: 45.9 }];
        var itemAry = [];
        for (var i = 0; i < datas.length; i++) {
            itemAry.push(
                <Card style={{ width: 232, marginRight: 15 }} key={i}>
                    <MyTitle Title={datas[i].kpiName}></MyTitle>
                    <CardItem>
                        <Left>
                            <Text>达成率:{datas[i].reach}%</Text>
                        </Left>
                    </CardItem>
                    <CardItem cardBody style={{ height: 105, justifyContent: "center" }}>
                        <Text>{datas[i].target}</Text>
                    </CardItem>
                    <CardItem footer>
                        <Right>
                            <Text>目标:{datas[i].target}</Text>
                        </Right>
                    </CardItem>
                </Card>
            );
        }
        return itemAry;
    }

    componentWillMount(){
        var option = {
            toolbox: {
                show: true,
                showTitle: true,
                feature: {
                    magicType: {
                        //折线图  柱形图    总数统计 分开平铺
                        type: ['line', 'bar'],
                        show: false
                    },
                }
            },
            xAxis: [
                {
                    //就是一月份这个显示为一个线段，而不是数轴那种一个点点
                    boundaryGap: true,
                    type: 'category',
                    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '销量'
                }
            ],
            //图形的颜色组
            color: ['#046eb8'],
            //需要显示的图形名称，类型，以及数据设置
            series: [
                {
                    name: '苹果',
                    type: 'bar',
                    data: [2, 4, 7, 2, 2, 7, 13, 16, 10, 8, 20, 39]
                }
            ]
        };
        this.setState({DashboardData:option})
    }


    render() { 
        return (
            <MyContainer Title='Dashboard'  {...this.props}>
                <Grid style={styles.mb}>
                    <Row size={1} style={{ paddingTop: 10 }}>
                        <Left>
                            <Button iconLeft primary small onPress={() => this.props.navigation.goBack()}>
                                <Icon name="arrow-back" />
                                <Text>Back</Text>
                            </Button>
                        </Left>
                        <Right>
                            <Button iconRight primary small onPress={() => this.props.navigation.navigate("RoutePlan")}>
                                <Text>Route Plan</Text>
                                <Icon name='arrow-forward' />
                            </Button>
                        </Right>
                    </Row>
                    <Row size={4} style={{ paddingTop: 5 }}>
                        <ScrollView horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            pagingEnabled={true}>
                            {this.renderItem()}
                        </ScrollView>
                    </Row>
                    <Row size={5} style={{ paddingTop: 1 }}>
                        <Card>
                            <MyTitle Title="Category Knowledge"></MyTitle>
                            <CardItem cardBody style={{ flex: 1 }}>
                                <Echarts option={this.state.DashboardData} height={280} />
                            </CardItem>
                        </Card>
                    </Row>
                </Grid>
            </MyContainer>
        );
    }
}
