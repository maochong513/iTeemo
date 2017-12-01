import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import { Text, ListItem, Button, Body ,Row,Badge,Icon} from 'native-base';

import DateThumbnail from '../../../common/dateThumbnail';

export default class DataItem extends Component {
    readNextstep() {
        this.props.readNextstep(this.props.data,this.props.rowId);
    }

    render() {
        var data = this.props.data;
        return (
            <ListItem style={{ paddingLeft: 20 }}>
                <Row size={3}>
                    <DateThumbnail date={data.ActivityDate} />
                </Row>
                <Row size={3}>
                    <Text>
                        {data.CHQName}
                    </Text>
                </Row>
                <Row size={3}>
                    {
                        data.Priority.toLowerCase() == 'high' || data.Priority == '緊急' ?
                            <Text style={{ color: 'red' }}>
                                {data.Priority}
                            </Text>
                            :
                            <Text>
                                {data.Priority}
                            </Text>
                    }
                </Row>
                <Row size={10}>
                    <Text>
                        {data.Description}
                    </Text>
                </Row>
                <Row size={2}>{
                    data.Read == 0 ?
                        <Button transparent onPress={() => this.readNextstep()}>
                            <Badge primary>
                                <Icon name="chatboxes" style={{ fontSize: 15, color: "#fff", lineHeight: 20 }} />
                            </Badge>
                        </Button> :
                        <Button transparent>
                        </Button>
                }
                </Row>
            </ListItem>
        );
    }
}