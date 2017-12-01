import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import { Text, Icon, Right, Left, ListItem, Button, Body } from 'native-base';

export default class DataItem extends Component {
    onClick(){
        this.props._SyncVisitData();
    }

    render() {
        return (
            <ListItem>
                <Body>
                    <Text>{this.props.data.Code}</Text>
                    <Text numberOfLines={2} note>{this.props.data.Name}</Text>
                </Body>
                <Body>
                    <Text>{this.props.data.Type}</Text>
                </Body>
                <Body>
                    <Text>{this.props.data.Time}</Text>
                </Body>
                <Right >
                    {
                        !this.props.data.State ?
                            <Button transparent onPress={() => this.onClick() }>
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
                                    <Icon name="md-sync"  style={{fontSize:30}}/>
                                </Animated.View>
                            </Button>
                            :
                            <Button transparent>
                                <Icon name="ios-checkmark-circle" style={{ color: '#00ba4d',fontSize:30 }} />
                            </Button>
                    }
                </Right>
            </ListItem>
        );
    }
}