import React, { Component } from 'react';
import { Easing, View, Image } from 'react-native';
import PercentageCircle from 'react-native-percentage-circle';

import { Text, Icon, Right, Left, List, ListItem, Thumbnail, Button, Body } from 'native-base';
import styles from './styles';

export default class itemImage extends Component {

    _downloadImg(rowData, rowId) {
        this.props._downloadImg(rowData, rowId);
    }

    _showImage(rowData, rowId) {
        this.props._showImage(rowData, rowId);
    }

    constructor(props) {
        super(props);
    }

    render() {
        var rowData = this.props.rowData;
        return (
            (rowData.NoImg ? 
            <View style={styles.imageView} key={this.props.rowID}>
                <Button transparent style={styles.imageStyle} onPress={() => this._downloadImg(rowData, this.props.rowID)}>
                 { 
                    rowData.start ?
                    <Image source={rowData.uri} style={[styles.imageStyle,{alignItems:'center',justifyContent:'center'}]} >  
                        <PercentageCircle radius={55} percent={rowData.downloadProgress} color={"#3498db"} />
                    </Image>
                    :                                  
                    <Image source={rowData.uri} style={styles.imageStyle} />  
                }
                 </Button>
                <Text style={styles.imageText}>{rowData.CreatedDate}</Text>
                <Text style={styles.imageText}>{rowData.AccountName}</Text>
            </View> 
            :
            <View style={styles.imageView} key={this.props.rowID}>
                <Button transparent style={styles.imageStyle} onPress={() => this._showImage(rowData, this.props.rowID)}>
                    <Image source={{uri:rowData.uri}} style={styles.imageStyle} />
                </Button>
                <Text style={styles.imageText}>{rowData.CreatedDate}</Text>
                <Text style={styles.imageText}>{rowData.AccountName}</Text>
            </View>
            )
        );
    }
}