import React from "react";
import App from "./App/App";

import MySorage from "./App/common/MySorage";
import SplashScreen from 'react-native-splash-screen'
import codePush from 'react-native-code-push'
export default class App1 extends React.Component {
  constructor() {
    super();
    this.state = {
      isReady: false
    };
    var storage =MySorage._getStorage();
    global.storage = storage;
  }
  componentDidMount() {
    SplashScreen.hide();
    codePush.sync();
  }

  render() {
    return <App />;
  }
}
