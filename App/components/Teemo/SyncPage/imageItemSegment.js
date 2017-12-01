import React, { Component } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Text, Icon, Right, Left, List, ListItem, Thumbnail, Button, Body } from 'native-base';

export default class ImageItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ShowDetail: false,
            fadeAnim: new Animated.Value(0), //设置初始值
        };
    }

    _onSyncClick() {
        this.props._SyncVisitImg();
    }

    _itemClick() {
        this.setState({ ShowDetail: !this.state.ShowDetail })
        Animated.timing(
            this.state.fadeAnim,//初始值
            { toValue: this.state.ShowDetail ? 0 : 1, duration: 800}//结束值
        ).start();//开始
    }

    _itemSyncClick(){
        this.props._SyncVisitImg();
    }

    render() {
        return (
            <View> 
                <ListItem>
                    <Left>
                        <Button transparent onPress={this.props._ShowImageProp} >
                            <Thumbnail square size={55} source={this.props.data.src} />
                        </Button>
                    </Left>
                    <Body>
                        <Text>{this.props.data.time}</Text>
                    </Body>
                    <Right >
                        <Button transparent>
                            <Icon name="ios-checkmark-circle" style={{ color: '#00ba4d', fontSize: 30 }} />
                        </Button>  
                    </Right>
                </ListItem>
            </View>
        );
    }
}