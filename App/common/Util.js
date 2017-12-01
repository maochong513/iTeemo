import React, { Component } from "react";
import {
  Dimensions
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

import SQLite from './SQLite';
import MySorage from './MySorage';

var Util = {
  AppVersion: '1.0.0.1',
  syncType: {
    Initial: 0,
    Incremenetal: 1
  },
  syncState: {
    start: 0,
    running: 1,
    end: 2,
    error: 3
  },
  threadState: {
    running: 4,
    end: 5,
    error: 6
  },
  recordAction: {
    defaultAction: 0,
    insertRec: 1,
    updateRec: 2,
    deleteRec: 3,
    holdRec: 4,
    updateHoldRec: 5
  },
  fileFolders: {
    asset: "CustomerAsset",
    accountGroup: "AccountGroup",
    customerResources: "CustomerResources",
    salesrepResources: "SalesRepResources",
    gallery: "CustomerGallery",
    logs: "Logs",
    cimagine: "Cimagine",
    SurveyPhoto: "SurveyPhoto"
  },

  recordActionValues: [1, 2, 3, 5],
  //sync timeout
  SyncNetworkTimeout: {
    Initial: 720000, // 12 minutes,
    Incremenetal: 180000 // 3 minutes 
  },
  AppSystemConfig: null,
  AppUserInfo: null,
  SyncController: {
    Login: "Login",
    DownloadData: "DownloadData",
    Schema: "Schema",
    DownloadAttachment: "DownloadAttachment"
  },
  Dirver: {
    UniqueID: DeviceInfo.getUniqueID(),
    Manufacturer: DeviceInfo.getManufacturer(),
    Model: DeviceInfo.getModel(),
    DeviceId: DeviceInfo.getDeviceId()
  },
  //Sorgae key
  SorgaeKeyConfig: {
    LoginInfo: "LoginInfo",//登录用户账号密码
    SyncConfigInfo: "SyncConfigInfo", //同步配置信息
    LoginConfigData: "LoginConfigData", //登录时返回系统配置信息,
    //UserInfo: "UserInfo", //用户登录信息
    AppUserInfo: "AppInfo",//用户信息
    AppSystemConfig: "AppSystemConfig", //系统配置信息
    ModifiableTables: "ModifiableTables",
    LastSyncTime: "lastSyncTime"
  },
  //Login Config Table
  LoginConfigTable: {
    MobileObjectConfigure: "ebMobile__MobileObjectConfigure__c",
    eBestSFASetting: "ebMobile__eBestSFASetting__c",
    User: "User",
    Configuration: "ebMobile__Configuration__c",
    DynamicPageConfig: "ebMobile__DynamicPageConfig__c",
    CallConfiguration: "ebMobile__CallConfiguration__c",
    InvoiceCalendarConfig: "ebMobile__InvoiceCalendarConfig__c"
  },
  //屏幕尺寸
  windowSize: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  },
  getBoolean: function (val) {
    return (val && val.trim() === "true");
  },
  daysBetween: function (lastDate, newDate) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;
    var date1_ms = lastDate.getTime();
    var date2_ms = newDate.getTime();
    var difference_ms = date2_ms - date1_ms;
    var diff = Math.round(difference_ms / one_day);
    if (diff === 0) {
      //This is to validate for next day starts from morning 12 AM
      return newDate.getDate() - lastDate.getDate();
    }
    return diff;
  },
  validateUserTime: function (date, timeZone) {
    var now = new Date(), tz = now.toString().match(/([A-Z]+[\+-][0-9]+)/)[1], userTime = null, userTz = null, variation = 180 * 1000; //3 min
    var gmtIndex;

    if (!timeZone)
      return this.translateText('COMMON.NOT_VALID_TIMEZONE_CONTACT_ADMINISTARTOR');

    if (date && timeZone) {
      gmtIndex = date.length - 5;

      if (date.indexOf("GMT") == -1) {
        date = date.splice(gmtIndex, 0, "GMT");
      }
      userTime = moment(date, "YYYY-MM-DD hh:mm:ss a").tz(timeZone).toDate();
    }

    if (userTime) {
      userTz = date.substring(gmtIndex);

      if (userTz !== tz)
        return this.translateText('COMMON.CHANGE_DEVICE_TIMEZONE') + timeZone + " " + userTz + this.translateText('COMMON.RESTART_DEVICE');

      var userDate = userTime;//moment(userTime, "MM/DD/YYYY hh:mm:ss a").toDate();
      var timeDiff = now.getTime() - userDate.getTime();

      return (Math.abs(timeDiff) <= variation) || this.translateText('COMMON.INVALID_TIME') + date + this.translateText('COMMON.RESTART_DEVICE');
    }
    return this.translateText('COMMON.NOT_VALID_SERVER_TIME');
    //new Date("2015-11-4 10:44:27 +0800").toLocaleString("en-US", {timeZone: "Asia/Shanghai"})
  },
  //网络请求
  getRequest: function (url, succrssClk, erroClk) {
    fetch(url)
      .then((response) => response.json())
      .then((jsonData) => succrssClk(jsonData))
      .catch((err) => erroClk(err))
  },
  fetch: function (url, formData, succrssClk, erroClk) {
    console.log(`fetch  ${url}`);
    var start = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("fetch data :" + JSON.stringify(formData));
    console.log("fetch start:" + start);
    fetch(url, {
      method: 'POST',
      headers: {
        //'Accept': 'application/json',
        //'Content-Type': 'application/json',
      },
      body: formData
    }).then((response) => response.json())
      .then((jsonData) => {
        var end = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log("fetch end  :" + end);
        var now = moment(start);
        var then = moment(end);
        console.log("fetch diff :" + then.diff(now) / 1000 + "s");
        //console.log("fetch resp :" + JSON.stringify(jsonData));
        succrssClk(jsonData);
      }).catch((err) => {
        console.log("fetch error :" + JSON.stringify(err));
        erroClk({ message: 'Network error', error: err });
      })
  },
  Toast: function (that, msg, time) {
    that.refs.toast.show(msg, time || 1200);
  },
  translateText: (tranlsate) => {
    return tranlsate;
  },
  //sync server list
  SyncDefaultConfig: [
    {
      Name: "Production",
      Config:
      {
        Server: "sfa5s.ebestmobile.net",
        Port: "80",
        Middleware: "PGSFAMiddleware",
        SSL: false
      }
    },
    {
      Name: "Sandbox",
      Config:
      {
        Server: "180.166.98.86",
        Port: "9529",
        Middleware: "PGSFAMiddleware",
        SSL: false
      }
    }
  ],
  splitChart: "▏",
  getSyncUlr: function (action) {
    return new Promise((resolve, reject) => {
      MySorage._load(this.SorgaeKeyConfig.SyncConfigInfo, (data) => {
        if (!data) {
          data = this.SyncDefaultConfig[0].Config
        }
        var url = `${data.SSL ? 'https' : 'http'}://${data.Server}:${data.Port}/${data.Middleware}/Api/${action}`
        resolve(url)

      })
    });
  },
  getSfdcApiVersion: function () {
    return "v" + this.AppUserInfo.sfdcApiVersion;
  },
  /**
   * 解析在线登录时返回配置信息
   * 保存配置信息
   */
  LoginConfigDataParse: function (data) {
    var dataMap = [];
    var confingJson = JSON.parse(data.ConfigData.Data.result).records;
    confingJson.forEach(function (table) {
      var result = [];
      var currentFields = table.fields.split(','), fieldIndex = 0, TableName = table.name, records = table.values;
      for (var j = 0; j < records.length; j++) {
        var value = {};
        for (var i = 0; i < currentFields.length; i++) {
          var val = records[j].split(this.splitChart)[i];
          value[currentFields[i]] = typeof val === "string" ? val.trim() : val;
        }
        result.push(value);
      }
      var Table = {
        Name: TableName,
        Data: result
      }
      dataMap.push(Table);
    }, this);
    MySorage._save3(this.SorgaeKeyConfig.LoginConfigData, dataMap, null);
    return dataMap;
  },
  /**
   * 获取在线登录返回表数据
   */
  getLoginConfig: function (tableName) {
    return new Promise((resolve, reject) => {
      MySorage._load(this.SorgaeKeyConfig.LoginConfigData, (data) => {
        if (data) {
          data.forEach(function (table) {
            if (table.Name === tableName) {
              resolve(table)
            }
          }, this);
        } else {
          resolve()
        }
      })
    });
  },
  /**
   * 获取在线登录返回表数据
   */
  getLoginConfigData: function (data, tableName) {
    var findData = null;
    data.forEach(function (table) {
      if (table.Name == tableName) {
        findData = table;
      }
    }, this);
    return findData;
  },
  jsonsql: {
    //jsonsql.query("select title,url from json.channel.items where (category=='javascript' || category=='vista') order by title,category asc limit 3",json); 
    query: function (sql, json) {
      var returnfields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);

      var ops = {
        fields: returnfields[2].replace(' ', '').split(','),
        from: returnfields[3].replace(' ', ''),
        where: (returnfields[4] == undefined) ? "true" : returnfields[4],
        orderby: (returnfields[5] == undefined) ? [] : returnfields[5].replace(' ', '').split(','),
        order: (returnfields[6] == undefined) ? "asc" : returnfields[6],
        limit: (returnfields[7] == undefined) ? [] : returnfields[7].replace(' ', '').split(',')
      };
      return this.parse(json, ops);
    },
    parse: function (json, ops) {
      var o = { fields: ["*"], from: "json", where: "", orderby: [], order: "asc", limit: [] };
      for (i in ops) o[i] = ops[i];

      var result = [];
      result = this.returnFilter(json, o);
      result = this.returnOrderBy(result, o.orderby, o.order);
      result = this.returnLimit(result, o.limit);

      return result;
    },

    returnFilter: function (json, jsonsql_o) {
      var jsonsql_scope = eval(jsonsql_o.from);

      var jsonsql_result = [];
      var jsonsql_rc = 0;

      if (jsonsql_o.where == "")
        jsonsql_o.where = "true";

      for (var jsonsql_i in jsonsql_scope) {
        var json = jsonsql_scope[jsonsql_i];
        if (eval(jsonsql_o.where)) {
          jsonsql_result[jsonsql_rc++] = this.returnFields(json, jsonsql_o.fields);
        }
        //  with (jsonsql_scope[jsonsql_i]) {
        //    if (eval(jsonsql_o.where)) {
        //      jsonsql_result[jsonsql_rc++] = this.returnFields(jsonsql_scope[jsonsql_i], jsonsql_o.fields);
        //    }
        //  }
      }
      return jsonsql_result;
    },

    returnFields: function (scope, fields) {
      if (fields.length == 0)
        fields = ["*"];

      if (fields[0] == "*")
        return scope;

      var returnobj = {};
      for (var i in fields)
        returnobj[fields[i]] = scope[fields[i]];

      return returnobj;
    },

    returnOrderBy: function (result, orderby, order) {
      if (orderby.length == 0)
        return result;

      result.sort(function (a, b) {
        switch (order.toLowerCase()) {
          case "desc": return (eval('a.' + orderby[0] + ' < b.' + orderby[0])) ? 1 : -1;
          case "asc": return (eval('a.' + orderby[0] + ' > b.' + orderby[0])) ? 1 : -1;
          case "descnum": return (eval('a.' + orderby[0] + ' - b.' + orderby[0]));
          case "ascnum": return (eval('b.' + orderby[0] + ' - a.' + orderby[0]));
        }
      });
      return result;
    },
    returnLimit: function (result, limit) {
      switch (limit.length) {
        case 0: return result;
        case 1: return result.splice(0, limit[0]);
        case 2: return result.splice(limit[0] - 1, limit[1]);
      }
    }
  },
  PromiseFor: function (arr, cb) {
    let realResult = []
    let result = Promise.resolve()
    arr.forEach((a, index) => {
      result = result.then(() => {
        return cb(a, index).then((res) => {
          realResult.push(res)
        })
      })
    })
    return result.then(() => {
      return realResult
    })
  },
  syncLogType: {
    order: "Order",
    modify: "Modify",
    redSurvey: "Customer Visit",
    add: "Add",
    request: "Request",
    cdeOrder: 'CDE Order',
    onBoarding: 'Customer OnBoarding',
    contact: 'Contact'
  },
  syncLogStatus: {
    pending: "New",
    started: "Started",
    success: "Success",
    failed: "Failed"
  },
  Component: {
    Login: "Login",
    LandingPage: "LandingPage",
    SyncPage: "SyncPage",
    UserDashboards: "UserDashboard",
    RoutePlan: "RoutePlan",
    Welcome: "Welcome",
    SyncPage: "SyncPage",
    Gallery: "Gallery",
    eLibrary: "eLibrary",
    MyWebView: "MyWebView",
    ShowImage: "ShowImage"
  },
  getNextScreen: (screen, allowedVisitScreens) => {
    var screens = ["welcome", "landing page", "sr dashboard", "route-plan"];
    var index = screens.indexOf(screen);
    var screenName = "";
    for (var i = index, len = screens.length; i < len; i++) {
      if (allowedVisitScreens.indexOf(screens[i].toLowerCase()) > -1 || screens[i] == "route-plan") {  // we have done this staticly we will change when we get all the screens in the configuration.
        screenName = screens[i];
        break;
      }
    }

    if (screenName == 'welcome') {
      screenName = Util.Component.Welcome;
    }
    if (screenName == 'sr dashboard') {
      screenName = Util.Component.UserDashboards;
    }
    if (screenName == "landing page") {
      screenName = Util.Component.LandingPage;
    }
    return screenName;
  },
  showMain: () => {
    return new Promise((resolve, reject) => {
      var query = "SELECT ebMobile__TaskDetail__c FROM ebMobile__CallConfiguration__c WHERE LOWER(ebMobile__VisitType__c)= 'customer visit' AND ebMobile__IsActive__c = 1";
      SQLite.execute(query).then((result) => {
        if (result.length > 0 && result[0].ebMobile__TaskDetail__c.length > 0) {
          var allowedVisitScreens = result[0].ebMobile__TaskDetail__c.toLowerCase().split(';');
          var screenName = Util.getNextScreen('welcome', allowedVisitScreens);
          resolve(screenName);
        } else {
          reject();
        }
      });
    });
  },
  getCountryCode: () => {
    if (this.AppUserInfo && this.AppUserInfo.countryCode) {
      return this.AppUserInfo.countryCode
    }
    else {
      return "";
    }
  }
}

module.exports = Util;
