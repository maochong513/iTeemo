import React, { Component } from 'react';
import Echarts from 'native-echarts';

export default class DataItem extends Component {
    constructor(props) {
        super(props);
         this.state = { 
            CustomerDashboardData: null
        };
    } 
    componentWillReceiveProps(){
        if(this.props.Id){ 
            this._LoadKPI();
        }
    } 

    _LoadKPI(){
        function rand(n) {
            return (Math.floor(Math.random() * n + 1));
        }
        var names = [{ name: 'Sales Value' }, { name: 'Sales Volume' }, { name: 'Share Value' }, { name: 'Visit' }, { name: 'Display' }, { name: 'Shelf' }];
        var series = [];
        for (var i = 0; i < names.length; i++) {
            var cen = i == 0 ? 7 : 7 + (i * 12);
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
        this.setState({ CustomerDashboardData: option });
    }

    render() {
        var data = this.props.data;
        return (
            <Echarts option={this.state.CustomerDashboardData} height={this.props.height} width={this.props.width}/>
        );
    }
}