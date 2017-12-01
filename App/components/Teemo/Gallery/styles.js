
const React = require('react-native');

const { StyleSheet, Dimensions, Platform } = React;

import Util from '../../../common/Util';


export default {
  bkcolor: {
    backgroundColor: "#eeeeef"
  },
  mb: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 20
  },
  listViewStyle: {
    flexDirection: 'row', //设置横向布局       
    flexWrap: 'wrap',    //设置换行显示,
    justifyContent: 'flex-start',
  },
  
  imageStyle: {
    width: (Util.windowSize.width - 40) / 7+42,
    height: 200,
    marginLeft:0,
    paddingLeft:0
  },

  imageText:{
    width: (Util.windowSize.width - 40) / 7+42,
    marginLeft:0,
    fontSize:10
  },

  imageView: {
    marginLeft:10,
    marginTop:5,
    borderWidth:1,
    borderRadius:2,
    borderColor:'#eeeeef'
  },

  dropdown: {
    alignSelf: 'flex-end',
    flex: 1,
    right: 8,
    borderWidth: 0,
    marginLeft: 10
  },
  dropdown_text: {
    marginVertical: 10,
    marginHorizontal: 6,
    fontSize: 16,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  dropdown_dropdown: {
    width: 230,
    height: 100,
    borderColor: '#eeeeef',
    borderWidth: 1,
    borderRadius: 3,
  },
  dropdown_row: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_image: {
    marginLeft: 4,
    width: 30,
    height: 30,
  },
  dropdown_row_text: {
    marginHorizontal: 4,
    fontSize: 16,
    color: 'navy',
    textAlignVertical: 'center',
  },
  dropdown_separator: {
    height: 1
  }
};
