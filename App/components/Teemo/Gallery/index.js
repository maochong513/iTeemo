import React, { Component } from 'react';
import { Platform,ListView, ScrollView, Image } from 'react-native';
import { Container, Content, Thumbnail, Card, Form, Item, CardItem, Text, Icon, Right, Left, List, ListItem, SwipeRow, Button, View, Body, Badge } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import ModalDropdown from 'react-native-modal-dropdown';
import RNFS from 'react-native-fs';

import MyContainer from '../../../common/MyContainer';
import MyTitle from '../../../common/MyTitle';
import MyColPlan from '../../../common/MyColPlan';
import styles from './styles';
import Toast, { DURATION } from 'react-native-easy-toast'
import Util from '../../../common/Util';
import FileThread from '../../../common/FileThread';
import ItemImage from './itemImage';

import GalleryServices from '../../../services/GalleryServices'
const noImage= require('./../../../../img/no-image.jpg');
export default class Gallery extends Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            listImageData: [],
            seachKey: {
                Category: 'Category'
            }
        };
    }

    componentWillMount() {
        GalleryServices.getPictures(null, "").then((data) => {
            Util.PromiseFor(data, (picture,index) => {
                return new Promise((resolve, reject) => {
                    picture.NoImg = false;
                    picture.FilePath = picture.ebMobile__FilePath__c;
                    //SurveyPhoto
                    if (picture.ebMobile__FileType__c == Util.fileFolders.SurveyPhoto) {
                        picture.Dictory = Util.fileFolders.customerResources;
                    } else {
                        picture.Dictory = Util.fileFolders.gallery; 
                    }
                    if (picture.ebMobile__AttachmentId__c) {
                        picture.FilePath = picture.ebMobile__AttachmentId__c.split(',') + ".jpg";
                        picture.uri =  RNFS.MainBundlePath+'/'+picture.Dictory + '/' + picture.ebMobile__AttachmentId__c.split(',').pop() + ".jpg";
                    } else {
                        if (picture.ebMobile__FilePath__c) {
                            picture.uri =  RNFS.MainBundlePath+'/'+picture.Dictory + '/' + picture.ebMobile__FilePath__c;
                        } else {
                            picture.uri = noImage;
                        }
                    }

                    RNFS.exists(`${RNFS.MainBundlePath}/${picture.Dictory}/${picture.FilePath}`).then((result)=>{
                        picture.NoImg=!result;
                        if(!result){
                            picture.uri = noImage;
                        }
                        resolve(picture);
                    },()=>{
                        picture.NoImg=true;
                        picture.uri = noImage;
                        resolve(picture);
                    });
                });
            }).then((data)=>{
                this.setState({ listImageData: data });
            });
        });
    }

    updateComponent(){
        console.log("updateComponent");
    }

    render() {
        return (
            <MyContainer Title='Gallery' {...this.props}>
                <Grid style={styles.mb}>
                    <Row style={{ paddingTop: 10 }}>
                        <MyColPlan Title="Gallery">
                            <Row size={2} style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
                                <Grid>
                                    <Row>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                        <Col>
                                            <Item regular>
                                                <ModalDropdown defaultValue={this.state.seachKey.Category}
                                                    style={styles.dropdown}
                                                    textStyle={styles.dropdown_text}
                                                    dropdownStyle={styles.dropdown_dropdown}
                                                    renderRow={this._dropdown_renderRow.bind(this)}
                                                    onSelect={(rowID, rowData) => this._dropdown_onSelect(rowID, rowData)}>
                                                </ModalDropdown>
                                            </Item>
                                        </Col>
                                    </Row>
                                </Grid>
                            </Row>
                            <Row size={12}>
                                <ListView
                                    enableEmptySections={true}
                                    dataSource={this.ds.cloneWithRows(this.state.listImageData)}
                                    renderRow={(data, sectionId, rowId) =><ItemImage rowData={data} _showImage={()=>this._showImage(data,rowId)}  _downloadImg={()=>this._downloadImg(data,rowId)} rowId={rowId}/>}
                                    contentContainerStyle={styles.listViewStyle}
                                    pageSize={20}/>
                            </Row>
                        </MyColPlan>
                    </Row>
                </Grid>
                <Toast ref="toast" />
            </MyContainer>
        );
    }

    _dropdown_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={[styles.dropdown_row]}>
                    <Text style={[styles.dropdown_row_text, highlighted && { color: 'mediumaquamarine' }]}>
                        {`${rowData.Name}`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    _dropdown_onSelect(rowID, rowData) {

    }
    
    _downloadImg(rowData,rowID){
        const newData = [...this.state.listImageData];
        newData[rowID].start = true;
        newData[rowID].downloadProgress = 0; 
        this.setState({ listImageData: newData });

        FileThread.downloadOnDemand(rowData,(pro)=>{
            newData[rowID].downloadProgress = pro; 
            this.setState({ listImageData: newData });
        }).then((newUrl)=>{
            newData[rowID].NoImg=false;
            newData[rowID].uri = newUrl; 
            this.setState({ listImageData: newData });
         },(err)=>{
             Util.Toast(this,JSON.stringify(err));
         });
    }

    _showImage(rowData,rowID){     
        this.props.navigation.navigate(Util.Component.ShowImage, { images: this.state.listImageData,index:rowID,title:"Gallery" })   
    }
}
