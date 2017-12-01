import React, { Component } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Text, Icon, Right, Left, List, ListItem, Thumbnail, Button, Body } from 'native-base';

export default class ImageItem extends Component {
    
    _onSyncClick() {
        this.props._SyncVisitImg();
    }
 
    _itemClick() {
        // this.setState({ ShowDetail: !this.state.ShowDetail })
        // Animated.timing(
        //     this.state.fadeAnim,//初始值
        //     { toValue: this.state.ShowDetail ? 0 : 1, duration: 800}//结束值
        // ).start();//开始
        this.props._ItemClick(this.props.data,this.props._rowId)
    }

    _itemSyncClick(){
        this.props._SyncVisitImg();
    }

    constructor(props) {
        super(props);
        this.state = {
            ShowDetail: false,
            fadeAnim: new Animated.Value(0), //设置初始值
        };
    }

    render() {
        return (
            <View>
                <ListItem onPress={this._itemClick.bind(this)}>
                    <Body>
                        <Text>{this.props.data.Code}</Text>
                        <Text numberOfLines={2} note>{this.props.data.Name}</Text>
                    </Body>
                    <Right>
                        <Text>{this.props.data.Time}</Text>
                    </Right>
                    <Right >
                        <Text>{this.props.data.imgSuccess}/{this.props.data.imgTotal}</Text>
                    </Right >
                    <Right >
                        {
                            !this.props.data.State ?
                                <Button transparent onPress={() => this._onSyncClick()}>
                                    <Animated.View style={{
                                        transform: [
                                            {
                                                rotate: this.props.data.Animated.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '360deg']
                                                })
                                            }
                                        ]
                                    }}>
                                    <Icon name="md-sync" style={{ fontSize: 30 }} />
                                    </Animated.View>
                                </Button>
                                :
                                <Button transparent>
                                    <Icon name="ios-checkmark-circle" style={{ color: '#00ba4d', fontSize: 30 }} />
                                </Button>
                        }
                    </Right>
                </ListItem>
                 
            </View>
        );
    }
}