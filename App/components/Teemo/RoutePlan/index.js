import React, { Component } from 'react';
import { ListView } from 'react-native';
import { TabHeading, Footer, FooterTab, Container, Content, Card, CardItem, Text, Icon, Right, Left, List, ListItem, SwipeRow, Button, View, Body, Badge, Segment, Tabs, Tab } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import MyContainer from '../../../common/MyContainer';

import Util from '../../../common/Util';
import styles from './styles';
import RouotePlanServices from '../../../services/RoutePlanServices'

import DayPage from './dayPage'
 
export default class RoutePlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seg: 1
    };
  }


  componentWillMount() {
  }

  render() {
    return (
      <MyContainer Title='Route Plan' {...this.props}>
        <Grid style={styles.mb}>
          <Row size={1} style={{ paddingTop: 1 }}>
            <Left style={{ flexDirection: "row" }}>
              <Button iconLeft primary small onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-back" />
                <Text>Back</Text>
              </Button>
            </Left>
            <Body>
            {/* marginLeft: -215, */}
              <Segment style={{ backgroundColor: "#eeeeef", borderWidth: 0, borderColor: '#eeeeef' }}>
                <Button first active={this.state.seg === 1 ? true : false}
                  onPress={() => this.setState({ seg: 1 })}>
                  <Text>DAY</Text>
                </Button>
                <Button active={this.state.seg === 2 ? true : false}
                  onPress={() => this.setState({ seg: 2 })}>
                  <Text>WEEK</Text>
                </Button>
                <Button last active={this.state.seg === 3 ? true : false}
                  onPress={() => this.setState({ seg: 3 })}>
                  <Text>MAP</Text>
                </Button>
              </Segment>
            </Body>
            <Right>
              <Button iconRight primary small>
                <Text>Start Call</Text>
                <Icon name='arrow-forward' />
              </Button>
            </Right>
          </Row>
          <Row size={9} style={{ paddingTop: 1 }}>
            {this.state.seg === 1 &&
              <DayPage {...this.props}/>
            }
            {this.state.seg === 2 &&
              <Col size={7}>
                <Card>
                  <CardItem header bordered style={styles.bkcolor}>
                    <Text>
                      Week
                     </Text>
                  </CardItem>
                  <CardItem>

                  </CardItem>
                </Card>
              </Col>
            }
            {this.state.seg === 3 &&
              <Grid >
                <Col size={3}>
                  <Card>
                    <CardItem header bordered style={styles.bkcolor}>
                      <Left>
                        <Button style={{ height: 10 }} transparent small>
                          <Icon name='home' />
                        </Button>
                      </Left>
                      <Text>
                        Plan
                      </Text>
                      <Right>
                        <Button style={{ height: 10 }} transparent small>
                          <Icon name='cog' />
                        </Button>
                      </Right>
                    </CardItem>
                    <CardItem>
                    </CardItem>
                  </Card>
                </Col>
                <Col size={7}>
                  <Card>
                    <CardItem header bordered style={styles.bkcolor}>
                      <Text>
                        Map
                    </Text>
                    </CardItem>
                    <CardItem>
                    </CardItem>
                  </Card>
                </Col>
              </Grid>
            }
          </Row>
        </Grid>
      </MyContainer>
    );
  }
}
