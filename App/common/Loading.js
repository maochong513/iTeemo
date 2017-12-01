import React, { Component } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Modal,Text
} from 'react-native';
const { width, height } = Dimensions.get('window')
import loadingImage from './../../img/loading.gif'
export default class LoadingView extends Component{
    constructor(props) {
        super(props);
    }
    _close(){
        console.log("onRequestClose ---- ")
    }
    render() {
        const { showLoading, opacity, backgroundColor } = this.props
        return (
            <Modal onRequestClose={() => this._close()} visible={showLoading} transparent>
                <View style={ [styles.loadingView, {opacity: opacity||0.3, backgroundColor: backgroundColor||'gray'}]}></View>
                 <View style={ styles.loadingImageView }>
                      <View style={ [styles.loadingImage] }>
                        {
                          this.props.loadingViewClick?
                           <TouchableOpacity onPress={ this.props.loadingViewClick }>
                              <Image source={ loadingImage }/>
                          </TouchableOpacity>
                          :
                          <Image source={ loadingImage }/>
                        }
                        <Text style={styles.loadingImage_text}>
                            {this.props.LoadingText}
                        </Text>
                     </View>
                 </View>
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    loadingView: {
        flex: 1,
        height,
        width,
        position: 'absolute'
    },
    loadingImage: {
        width: 200,
        height: 230,
        backgroundColor:"#e8e5e5",
        borderRadius:15,
        alignItems:"center",
        justifyContent:"center"
    },
    loadingImage_text: {
      alignSelf: 'center',
      color:'#007aff',
      fontSize:18
    },
    loadingImageView: {
        position: 'absolute',
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
