import React, { Component } from 'react';
import { Text, Thumbnail } from 'native-base';
import moment from 'moment';
export default class DateThumbnail extends Component {

  render() {
    var mdate = moment(this.props.date);
    var day = mdate.format('DD')
    var month = mdate.format('MM')
    var year = mdate.format('YYYY')
    return (
      <Thumbnail size={1000} style={{  borderWidth:2, borderColor: '#eeeeef', alignItems: "center", justifyContent: "center" }}>
        <Text>
          {day}
        </Text>
        <Text style={{ fontSize: 11 }}>
          {month}/{year}
        </Text>
      </Thumbnail>
    );
  }
}
