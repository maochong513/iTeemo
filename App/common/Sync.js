import React, { Component } from 'react';
import moment from 'moment';

import SQLite from './SQLite';
import Util from './Util';
import MySorage from './MySorage';

export default class SyncUtil {
  static common = { AppSystemConfig: null, AppUserInfo: null, SyncType: null, parentClass: null, CallId: null };

  static Init(AppSystemConfig, AppUserInfo, SyncType, that, CallId) {
    this.common.AppSystemConfig = AppSystemConfig;
    this.common.AppUserInfo = AppUserInfo;
    this.common.SyncType = SyncType;
    this.common.CallId = CallId;
    this.common.parentClass = that;
  }

  static login(name, pass) {
    return new Promise((resolve, reject) => {
      Util.getSyncUlr(Util.SyncController.Login).then((url) => {
        let formData = new FormData();
        formData.append("username", name);
        formData.append("password", pass);
        Util.fetch(url, formData, (data) => {
          resolve(data);
        }, (data) => {
          reject(data)
        });
      });
    });
  }

  static syncDatabse(callback) {
    var that = this;
    var type = this.common.SyncType;
    var param = this.getCommonParams();
    return new Promise((resolve, reject) => {
      if (Util.syncType.Initial === type) {
        let downloadParam = {
          eventFlag: that.getEventFlagStatus(type),
          syncType: type,
          deviceId: Util.Dirver.Manufacturer,
          isBatchDownload: that.common.AppSystemConfig.isBatchDownload,
          maxDownloadGroupNumber: that.common.AppSystemConfig.maxDownloadGroupNumber,
          mobileVersion: Util.AppVersion
        };
        //var start = moment().format('YYYY-MM-DD HH:mm:ss')
        //console.log("downloadSchema start:" + start);
        callback('downloadSchema')
        that.downloadSchema(callback).then(() => {
          // var end = moment().format('YYYY-MM-DD HH:mm:ss')
          // console.log("downloadSchema end  :" + end);
          // var now = moment(start);
          // var then = moment(end);
          // console.log("downloadSchema diff :" + then.diff(now) / 1000 + "s");
          let formData = new FormData();
          formData.append("downloadParams", JSON.stringify(downloadParam));
          formData.append("role", "SalesRep");
          formData.append("returnUrl", param.returnUrl);
          formData.append("sessionId", param.sessionId);
          callback('DownloadData')
          //console.log("DownloadData start:" + end);
          that.DownloadData(formData, downloadParam.eventFlag).then(() => {
            callback('DownloadData success')
            // end1 = moment().format('YYYY-MM-DD HH:mm:ss')
            // console.log("DownloadData end  :" + end1);
            // var now1 = moment(end);
            // var then1 = moment(end1);
            // console.log("DownloadData diff :" + then1.diff(now1) / 1000 + "s");
            resolve();
          },(error)=>{reject(error)});
        })
      }
      else {
        let downloadParam = {
          syncType: type,
          deviceId: Util.Dirver.Manufacturer,
          eventFlag: that.getEventFlagStatus(type),
          mobileVersion: Util.AppVersion
        };
        let formData = new FormData();
        formData.append("downloadParams", JSON.stringify(downloadParam));
        formData.append("role", "SalesRep");
        formData.append("returnUrl", param.returnUrl);
        formData.append("sessionId", param.sessionId);
        callback('DownloadData')
        that.DownloadData(formData, downloadParam.eventFlag).then(() => {
          callback('DownloadData success')
          resolve();
        },(error)=>{reject(error)});
      }
    });
  }

  static downloadSchema(callback) {
    var that = this;
    return new Promise((resolve, reject) => {
      var StaticTables = that.StaticTableSchema();
      that.downloadRemoteSchema().then((data) => {
        if (data) {
          var newSchema = StaticTables.concat(data);
          Util.PromiseFor(newSchema, (Schema) => {
            return that.createTable(Schema);
          }).then((tables) => {
            var newTables = [];
            tables.forEach(function (table) {
              if (table) {
                newTables.push(table)
              }
            }, this);
            that.common.AppUserInfo.modifiableTables = newTables;
            MySorage._save3(Util.SorgaeKeyConfig.AppUserInfo, that.common.AppUserInfo);
            resolve();
          })
        } else {
          resolve();
        }
      })
    });
  }

  static createTable(table) {
    var that = this;
    return new Promise((resolve, reject) => {
      var tableName = table.ObjName, fields = table.FieldInfo, fieldString = "";
      SQLite.execute(`DROP TABLE IF EXISTS [${tableName}]`).then(function () {
        Util.PromiseFor(fields, (value) => {
          return that.getField(value, tableName, table);
        }).then((fields_) => {
          console.log(`createTable fields ${tableName} : ${fields_}`);
          var fields = fields_.join(',');
          var isSfdcTable = fields.indexOf(that.getRecordActionField(tableName)) !== -1, createTableQueries = [];
          var query = `CREATE TABLE IF NOT EXISTS [${tableName}] (${fields})`;
          SQLite.execute(query).then(() => {
            resolve(isSfdcTable ? tableName : null);
          });
        }, (e) => {
          console.log("Create table error " + e)
        })
      })
    });
  }

  static getField(value, tableName, tableObject) {
    var that = this;
    return new Promise(function (resolve, reject) {
      var type = value.type, len = value.byteLength, fieldName = value.fieldApiName, isRequired = value.required, isAccessible = value.isAccessible, fieldLabel = value.fieldLabel, isPrimarykey = value.isPrimaryKey, autoIncrement = value.autoIncrement;
      var field = fieldName, commonModel = that.commonModel;
      var keepSchemaInfoObjects = ['Account', 'ebMobile__Asset__c', 'ebMobile__AssetAccount__c', 'ebMobile__AssetModel__c', 'ebMobile__AssetTrackingTransaction__c', 'ebMobile__AssetOrder__c', 'ebMobile__CustomerOnboarding__c'];
      if (keepSchemaInfoObjects.indexOf(tableName) !== -1) {
        var query = `INSERT INTO [SchemaInfo] (TableName, FieldName, DataType, FieldLabel, IsUpdateable, IsAccessible, IsCreateable, IsDeletable, IsObjectAccessible, IsObjectCreateable, IsObjectDeletable, IsObjectUpdateable) VALUES 
        ("${tableName}", "${field}", "${type}", "${fieldLabel}", ${value.isUpdateable ? 1 : 0}, ${isAccessible ? 1 : 0}, ${value.isCreateable ? 1 : 0}, ${value.IsDeletable ? 1 : 0}, ${tableObject.IsAccessible ? 1 : 0}, ${tableObject.IsCreateable ? 1 : 0}, ${tableObject.IsDeletable ? 1 : 0}, ${tableObject.IsUpdateable ? 1 : 0})`;
        SQLite.execute(query)
      }
      if (type.startsWith("PICKLIST") || type.startsWith("MULTIPICKLIST")) {
        var startIndex = type.indexOf('('), records = [], endIndex = type.lastIndexOf(')'), picklistValues = type.substring(startIndex + 1, endIndex).split(','), fields = "DisplayValue, ParentTableName, ParentFieldName";
        picklistValues.forEach((value) => {
          records.push(value + Util.splitChart + tableName + Util.splitChart + fieldName);
        });
        that.processBulkTableData(records, "eBest__Lookup", fields.split(','), fields, 0).then(function () {
          resolve(that.getFormatedFieldValues(type, field, isPrimarykey, isRequired, autoIncrement));
        });
        return;
      }
      resolve(that.getFormatedFieldValues(type, field, isPrimarykey, isRequired, autoIncrement));
    });
  }

  static downloadRemoteSchema() {
    var that = this;
    return new Promise((resolve, reject) => {
      var param = that.getCommonParams()
      Util.getSyncUlr(Util.SyncController.Schema).then((url) => {
        let formData = new FormData();
        formData.append("role", "SalesRep");
        formData.append("returnUrl", param.returnUrl);
        formData.append("sessionId", param.sessionId);
        Util.fetch(url, formData, (response) => {
          if (response.success) {
            var data = JSON.parse(response.result);
            if (data.length === 0) {
              reject({ error: 'No schema available for this user/role' });
            }
            else if (!data || (data && data[0].ErrorInfo)) {
              reject({ error: data[0].ErrorInfo });
            } else {
              resolve(data);
            }
          } else {
            reject({ error: response.result });
          }
        });
      })
    });
  }


  static DownloadData(formData, eventFlag) {
    var that = this;
    return new Promise((resolve, reject) => {
      Util.getSyncUlr(Util.SyncController.DownloadData).then((url) => {
        Util.fetch(url, formData, (response) => {
          if (response.success) {
            var data = JSON.parse(response.result);
            //var inputParam = JSON.parse(param.downloadParams);
            that.manipulateData(data, eventFlag).then(function () {
              resolve()
            });
          } else {
          }
        }, (data) => {
          reject(data);
        });
      });
    })
  }


  static processBulkTableData(records, tableName, fieldsArray, fields, idFieldIndex, withReplace) {
    var that = this;
    return new Promise(function (resolve, reject) {
      var valuePart = "", commonModel = that.commonModel, count = 0, limit = 500, compountStatements = [];
      if (records.length === 0) {
        resolve();
        return;
      }
      records.forEach(function (record) {
        var res = that.getTableValues(record, fieldsArray, idFieldIndex);
        valuePart += valuePart ? " union all select " + res.valString : " select " + res.valString;
        count++;
        if (count >= limit) {
          compountStatements.push(valuePart);
          count = 0;
          valuePart = "";
        }
      }, this);

      if (valuePart) {
        compountStatements.push(valuePart);
      }
      Util.PromiseFor(compountStatements, (statement) => {
        var query = `INSERT ${withReplace ? 'OR REPLACE' : ''} INTO [${tableName}] (${fields}) ${statement}`;
        console.log("manipulateData query :" + query);
        return SQLite.execute(query);
      }).then(() => {
        console.log("insert into query success");
        resolve();
      });
    });
  }

  static getFormatedFieldValues(type, field, isPrimarykey, isRequired, autoIncrement) {
    var dataType, fieldName = field;
    switch (type) {
      case "BOOLEAN":
        dataType = "NUMERIC";
        break;
      case "LONG":
      case "INT":
      case "INTEGER":
      case "DATE":
      case "DATETIME":
      case "DOUBLE":
      case "REAL":
        dataType = type;
        break;
      default:
        dataType = "TEXT";
        break;
    }
    field += " " + dataType;
    if (isRequired)
      field += " NOT NULL"
    if (isPrimarykey || fieldName === 'Id')
      field += " PRIMARY KEY";
    if (autoIncrement)
      field += " ASC";

    return field;
  }
  static getRecordActionField(tableName) {
    var tabs = ['CustomerProduct__c', 'SKUTransaction__c', 'AuditTransaction__c', 'SKUTransaction__c']
    return tabs.indexOf(tableName) > -1 ? "RecordAction__c" : "ebMobile__RecordAction__c";
  }

  static getCommonParams() {
    return { returnUrl: this.common.AppUserInfo.returnUrl, sessionId: this.common.AppUserInfo.sessionId };
  }

  static getTableValues(record, fieldsArray, idFieldIndex) {
    var that = this;
    var valueFields = record.split(Util.splitChart), values = "", id = 0, updateValues = "";
    valueFields.forEach((value, key) => {

      var val = value.trim();
      var isNum = val.length === 0 ? false : isFinite(Number(val)), isBoolean = false;

      //Condition added for validating number leading zero
      if (isNum)
        isNum = !(val.substring(0, 1) === "0" && val.length > 1);

      if (key === idFieldIndex) {
        id = val;
      }

      if (typeof val === "string" && val.toLowerCase() === "true") {
        isBoolean = true;
        val = 1;
      }

      if (typeof val === "string" && val.toLowerCase() === "false") {
        isBoolean = false;
        val = 0;
      }

      if (isNum) {
        values += `${Number(val)},`;
        updateValues += `${fieldsArray[key]} = ${Number(val)}, `;
      }
      else if (isBoolean) {
        values += `${val}, `;
        updateValues += `${fieldsArray[key]} = ${val}, `;
      }
      else {
        if (typeof (val) === 'string' && val.indexOf('"') != -1)
          val = val.split('"').join("'"); //Replaceing all double coat's to single coat's.

        values += `"${val}",`;
        updateValues += `${fieldsArray[key]} = "${val}", `;
      }
    }, this);

    var valString = values.trim().slice(0, -1);
    var updateValString = updateValues.trim().slice(0, -1);

    return { valueFields: valueFields, valString: valString, id: id, updateValString: updateValString };
  }

  static getEventFlagStatus(syncType) {
    MySorage._load(Util.SorgaeKeyConfig.AppSystemConfig, (info) => {
      if (Util.syncType.Incremenetal == syncType)
        return 0;
      if (!info.lastEventUpdate)
        return 1;

      return info.lastEventUpdate && Util.daysBetween(new Date(info.lastEventUpdate), new Date()) > 0 ? 1 : 0;
    })
  }

  static updateSyncStatus(msg, time, state) {
    var query = `insert into ClientAppLog(Message,Time,State) values('${msg}','${time}',${state})`;
    SQLite.execute(query)
  }

  static manipulateData(data, eventFlag) {
    var that = this;
    return new Promise(function (resolve, reject) {
      var tables = data.records, error = data.Error, isSuccess = true;
      var msg = `Downloaded data and manipulating ${tables ? tables.length : 0} tables records`;
      if (error) {
        msg = `Downloaded data error - ${error}`;
        that.updateSyncStatus(msg, new Date(), Util.syncState.end);
        isSuccess = false;
      }
      that.updateSyncStatus(msg, new Date(), Util.syncState.running);

      Util.PromiseFor(tables, (table) => {
        var tableName = table.name, fields = table.fields, records = table.values, fieldsArray = table.fields.split(','), idFieldIndex = fieldsArray.indexOf("Id");
        if (idFieldIndex === -1)
          idFieldIndex = fieldsArray.indexOf("Id");

        if (idFieldIndex === -1) {
          var err = `Error processing data, table - ${tableName} Id field not found`;
          that.updateSyncStatus(err, new Date(), Util.syncState.error);
          resolve();
          return;
        }

        if (that.common.SyncType === Util.syncType.Initial) {
          if (that.common.AppUserInfo.deleteExistingRecords) {
            SQLite.execute(`DELETE FROM [${tableName}]`).then(function (result) {
              return that.processBulkTableData(records, tableName, fieldsArray, fields, idFieldIndex);
            });
          }
          else {
            return that.processBulkTableData(records, tableName, fieldsArray, fields, idFieldIndex);
          }
        }
        else {
          if (records.length > 0 && eventFlag === 1 && tableName === "Event") {
            return that.deleteEventData().then(function () {
              return that.processTableData(records, tableName, fieldsArray, fields, idFieldIndex).then(function () {
                that.common.AppUserInfo.lastEventUpdate = new Date();
                that.updateAppInfo();
              });
            });
            return;
          }
          return that.processTableDataNew(records, tableName, fieldsArray, fields, idFieldIndex);
        }
      }).then(function () {
        that.common.AppUserInfo.deleteExistingRecords = false;
        if (that.common.SyncType === Util.syncType.Initial) {
          that.common.AppUserInfo.isInitialDataDownloaded = true;
          if (isSuccess) {
            that.common.AppUserInfo.lastEventUpdate = new Date();
          }
          that.updateAppInfo();
        }
        if (isSuccess) {
          that.deleteTempRecords().then(function () {
            that.deleteExistingRecords().then(function () {
              that.updateSyncLog(Util.syncLogStatus.success).then(function () {
                resolve();
              });
            });
          });
        }
        else {
          that.updateSyncLog(Util.syncLogStatus.failed).then(function () {
            resolve();
          });
        }
        that.setLastSyncTime(new Date());
        that.updateSyncStatus("Synchronization completed", new Date(), Util.syncState.end);
      });
    });
  }

  static setLastSyncTime(time) {
    this.updateSyncTimeOnServer();
    console.log('setLastSyncTime');
    MySorage._save3(Util.SorgaeKeyConfig.LastSyncTime, time, null);
  }

  static updateSyncLog(status, customerId, surveyType, associationId) {
    var that = this;
    var callId = this.common.CallId;
    var where = surveyType === Util.syncLogType.redSurvey ? ` CallId = "${callId}"` : `AssociationId = "${associationId}"`;
    var callWhere = 'SELECT CallId FROM SyncLog WHERE LogType IS NULL';
    return new Promise(function (resolve, reject) {
      if (status === Util.syncLogStatus.pending) {
        var query = `DELETE FROM [SyncLog] WHERE ${where}`;
        that.execute(query).then(function (result) {
          var query = `INSERT INTO [SyncLog] (CustomerId, CallId, Type, SyncDate, Status, AssociationId) VALUES ("${customerId}","${callId}", "${surveyType}", datetime("now", "localtime"), "${status}", "${associationId}")`;
          that.execute(query).then(function (result) {
            resolve();
          });
        });
        return;
      }

      if (callId) {
        callWhere = `"${callId}"`;
      }
      var query = `SELECT Id, ebMobile__GUID__c FROM [ebMobile__call__c] WHERE ebMobile__GUID__c IN (${callWhere})`;
      SQLite.execute(query).then((data) => {
        Util.PromiseFor(data, (obj) => {
          return new Promise(function (resolve, reject) {
            var newId = obj.Id, guid = obj.ebMobile__GUID__c;
            query = `UPDATE [SyncLog] SET CallId = "${newId}" WHERE CallId = "${guid}"`;
            SQLite.execute(query).then(function (result) {
              if (callId && callId === guid)
                callId = newId;
              resolve();
            });
          });
        }).then(function () {
          var query = `UPDATE [SyncLog] SET SyncDate = datetime("now", "localtime"), Status = "${status}" WHERE Status <> "${Util.syncLogStatus.success}" AND LogType IS NULL `;
          if (callId)
            query = `UPDATE [SyncLog] SET SyncDate = datetime("now", "localtime"), Status = "${status}" WHERE CallId = "${callId}" AND LogType IS NULL `;

          SQLite.execute(query).then(function (result) {
            resolve();
          });
        });
      });
    });
  }

  callDataUploadConfig() {
    return [
      'SELECT * FROM [ebMobile__AccountNote__c] WHERE ebMobile__AccountId__c IN (SELECT ebMobile__AccountID__c FROM ebMobile__call__c WHERE Id = "{0}")',
      'SELECT * FROM [Task] WHERE AccountId IN (SELECT ebMobile__AccountID__c FROM ebMobile__call__c WHERE Id = "{0}") AND ebMobile__RecordAction__c IN(1,2)',
      'SELECT * FROM [ebMobile__Call__c] WHERE Id = "{0}"',
      'SELECT * FROM [ebMobile__SurveyTransactions__c] WHERE ebMobile__VisitID__c = "{0}"',
      'SELECT * FROM [ebMobile__File__c] WHERE (ebMobile__VisitID__c = "{0}" OR ebMobile__AssetOrder__c IN ( SELECT Id FROM [ebMobile__AssetOrder__c] WHERE ebMobile__VisitID__c = "{0}" ) OR ebMobile__RecordAction__c = 2 )',
      'SELECT * FROM [Event] WHERE ebMobile__RecordAction__c = 1',
      'SELECT * FROM [AuditTransaction__c] WHERE CallID__c = "{0}"',
      'SELECT * FROM [SKUTransaction__c] WHERE CallID__c = "?"',
    ]
  }
  static deleteTempRecords() {
    var that = this;
    var callId = this.common.CallId;
    return new Promise(function (resolve, reject) {
      var data = that.common.AppUserInfo.modifiableTables;
      if (callId) {
        data = that.callDataUploadConfig();
      }
      Util.PromiseFor(data, (tab) => {
        return new Promise(function (resolve, reject) {
          var table = tab.trim(), query = '';
          if (callId) {
            table = table.replace("SELECT * FROM", "DELETE FROM") + ' AND Id LIKE "GUID%"';
            query = table
          }
          else {
            var recordAction = that.getRecordActionField(table);
            query = `DELETE FROM [${table}] WHERE (Id LIKE "GUID%" AND ${recordAction} IN (${1})) OR (Id LIKE "GUID%" AND ${recordAction} = ${Util.recordAction.holdRec})`
          }
          SQLite.execute(query).then(function (result) {
            resolve();
          });
        });
      }).then(function () {
        resolve();
      });

    });

  }

  static deleteExistingRecords() {
    var that = this;
    return new Promise(function (resolve, reject) {
      var data = that.common.keepTableRecordsConfig || [];
      Util.PromiseFor(data, (table) => {
        return that.deleteRecords(table)
      }).then(function () {
        resolve();
      });
    });
  }

  deleteRecords(table) {
    return new Promise(function (resolve, reject) {
      var days = Math.round(Number(table.ebMobile__KeepRecords__c));
      if (!isNaN(days) && days !== 0) {
        var date = new Date(common.serverDateTime);
        var query = `DELETE FROM [${table.Name.trim()}] WHERE LastModifiedDate < datetime('now', '-${days} day')`;
        SQLite.execute(query).then(function (result) {
          resolve();
        });
      }
      else {
        resolve();
      }
    });
  }

  static updateAppInfo(info) {
    MySorage._save3(Util.SorgaeKeyConfig.AppUserInfo, info || this.common.AppUserInfo);
  }

  static updateSyncTimeOnServer() {
    var that = this;
    Util.getSyncUlr("UpdateSyncSuccess").then((url) => {
      let fromData = new FormData();
      fromData.append("deviceId", Util.Dirver.UniqueID);
      fromData.append("role", "SalesRep");
      Util.fetch(url, fromData, () => {
        if (!response.success) {
          that.updateSyncError("Error while updating last sync time - " + response.result);
        }
      }, (result) => {
        that.updateSyncError("Error while updating last sync time - " + JSON.stringify(result));
      });
    });
  }

  static updateSyncError(message, syncType) {
    this.updateSyncStatus(message, new Date(), Util.syncState.end);
    //console.log(message);
    if (syncType == Util.syncType.Initial) {
      //msg.data('messageBox').default(common.translateText('COMMON.ERROR_OCCURED'), message);
    }
  }

  static processTableData(records, tableName, fieldsArray, fields, idFieldIndex) {
    var that = this;
    return new Promise(function (resolve, reject) {
      Util.PromiseFor(records, (record) => {
        return that.updateRecords(record, tableName, fieldsArray, fields, idFieldIndex)
      }).then(() => {
        resolve();
      })
    });
  }

  static processTableDataNew(records, tableName, fieldsArray, fields, idFieldIndex) {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.processBulkTableData(records, tableName, fieldsArray, fields, idFieldIndex, true).then(function () {
        resolve();
      });
    });
  }

  static updateRecords(record, tableName, fieldsArray, fields, idFieldIndex) {
    var that = this;
    var res = that.getTableValues(record, fieldsArray, idFieldIndex);
    var valString = res.valString, updateValString = res.updateValString, id = res.id;

    var promise = new Promise(function (resolve, reject) {
      var query = `SELECT "x" FROM [${tableName}] WHERE Id = "${id}"`
      Util.execute(query).then(function (result) {
        if (result[1].rows.length > 0) {
          query = `UPDATE [${tableName}] SET ${updateValString} WHERE Id="${id}"`;
        }
        else {
          query = `INSERT INTO [${tableName}] (${fields}) VALUES (${valString})`;
        }

        Util.execute(query).then(function (result) {
          resolve();
        });

      });
    });

    return promise;
  }

  static deleteEventData() {
    var that = this;
    return new Promise(function (resolve, reject) {
      var query = String.format("DELETE FROM [Event] WHERE date(ActivityDate) >= date('now','localtime') AND ebMobile__RecordTypeName__c = 'Route'");
      SQLite.execute(query).then(function (result) {
        resolve();
      });
    });
  }

  static getLastSyncTime() {
    return new Promise(function (resolve, reject) {
      MySorage._load(Util.SorgaeKeyConfig.LastSyncTime, (date) => {
        resolve(date ? new Date(date) : new Date());
      })
    });
  }

  static getUploadData() {
    var that = this;
    var callId=this.common.CallId;
    return new Promise(function (resolve, reject) {
      that.getLastSyncTime().then((lastSyncTime) => {
        var lastSyncTime = lastSyncTime;

        var data = that.common.AppUserInfo.modifiableTables,recordActions = Util.recordActionValues,modifiedRecords = [];
        if (callId){
          data = that.callDataUploadConfig(callId);
        }

        Util.PromiseFor(data, (table) => {
          return new Promise(function (resolve, reject) {
            var table = data[i], query = '';
            if (callId) {
              query = table;
              table = that.getTableNameFromQuery(table);
            }
            else {
              var RecordAction = that.getRecordActionField(table)
              query = `SELECT * FROM [${table}] WHERE ${RecordAction} IN (${recordActions}) OR (Id LIKE "GUID%" AND ${RecordAction} = ${Util.recordAction.holdRec})`;
            }
            Util.execute(query).then(function (result) {
              if (result.length === 0) {
                resolve();
                return;
              }
              that.getResultBySchema(result, table, that).then(function (record) {

                var data = { values: [], name: table, fields: null }, values = [], fields = [];

                var firstRow = record[0].row;
                for (var v = 0; v < firstRow.length; v++) {
                  fields.push(Object.keys(firstRow[v])[0]);
                }
                data.fields = fields.join();
                angular.forEach(record, function (rec, key) {
                  var val = "", rows = rec.row;
                  for (var m = 0; m < rows.length; m++) {
                    var obj = rows[m];
                    val += obj[Object.keys(obj)[0]] + me.dataSplitCharacter;
                  }
                  values.push(val.substring(0, val.length - 1));
                });
                data.values = values;
                modifiedRecords.push(data);
                resolve();
              });

            });
          })
        });
      }).then(function () {
        that.updateSyncLog(Util.syncLogStatus.started).then(function () {
          resolve(modifiedRecords);
        });

      });

    });

  }

  static getTableNameFromQuery(query) {
    var start = query.indexOf('['), end = query.indexOf(']');
    return query.substring(start + 1, end);
}

static getResultBySchema(res, table, scope) {
  var that = scope || this;
  return new Promise(function (resolve, reject) {
      if (res.length === 0) {
          resolve([]);
          return;
      }
      var jsonData = [];
      that.getFieldsFromTable(table, scope).then(function (result) {
          for (var i = 0, len = res.length; i < len; i++) {
              var item =    res[i];
              var r = result, resultData = [];
              for (var v = 0; v < r.length; v++) {
                  for (var s in item) {
                      if (r[v] == s) {
                          var val = (item[s] === 'undefined' || item[s] === 'null' || item[s] === null) ? '' : item[s];
                          var obj = {};
                          obj[r[v]] = val;
                          resultData.push(obj);
                          break;
                      }
                  }
              }
              jsonData.push({row: resultData});
          }
          resolve(jsonData);
      });
  });
}

static getFieldsFromTable(table, scope) {
  return new Promise(function (resolve, reject) {
      var me = scope || this;
      var query = `SELECT name, sql FROM sqlite_master WHERE type="table" and name="${table}"`;
      SQLite.execute(query).then(function (result) {
          var record = me.getResultAsArray(result[1].rows)[0];
          var fieldString = record.sql;
          var firstIndex = fieldString.indexOf("(");
          var lastIndex = fieldString.lastIndexOf(")");
          var fieldVal = fieldString.substring(firstIndex + 1, lastIndex);
          var fieldArray = fieldVal.split(",");
          var fields = [];
          fieldArray.forEach(function(item) {
            fields.push(item.split(" ")[0]);
          }, this);
          resolve(fields);
      });
  });
}

  static callDataUploadConfig(callId) {
    return [
      `SELECT * FROM [ebMobile__AccountNote__c] WHERE ebMobile__AccountId__c IN (SELECT ebMobile__AccountID__c FROM ebMobile__call__c WHERE Id = "${callId}")`,
      `SELECT * FROM [Task] WHERE AccountId IN (SELECT ebMobile__AccountID__c FROM ebMobile__call__c WHERE Id = "${callId}") AND ebMobile__RecordAction__c IN(1,2)`,
      `SELECT * FROM [ebMobile__Call__c] WHERE Id = "${callId}"`,
      `SELECT * FROM [ebMobile__SurveyTransactions__c] WHERE ebMobile__VisitID__c = "${callId}"`,
      `SELECT * FROM [ebMobile__File__c] WHERE (ebMobile__VisitID__c = "${callId}" OR ebMobile__AssetOrder__c IN ( SELECT Id FROM [ebMobile__AssetOrder__c] WHERE ebMobile__VisitID__c = "${callId}" ) OR ebMobile__RecordAction__c = 2 )`,
      `SELECT * FROM [Event] WHERE ebMobile__RecordAction__c = 1`,
      `SELECT * FROM [AuditTransaction__c] WHERE CallID__c = "${callId}"`,
      `SELECT * FROM [SKUTransaction__c] WHERE CallID__c = "${callId}"`,
    ]
  }
  static getResultAsArray(res) {
    if (res.length === 0)
      return [];

    var jsonData = []
    res.forEach(function (element) {
      jsonData.push(element, function (result, n, key) {
        result[key] = (n === 'undefined' || n === 'null') ? null : n;
      });
    }, this);
    return jsonData;
  }

  static StaticTableSchema() {
    return [
      {
        ObjName: "eBest__Lookup",
        FieldInfo: [
          {
            type: "INTEGER",
            fieldApiName: "Id",
            isPrimaryKey: true,
            autoIncrement: true
          },
          {
            type: "STRING",
            fieldApiName: "DisplayValue"
          },
          {
            type: "STRING",
            fieldApiName: "ParentTableName"
          },
          {
            type: "STRING",
            fieldApiName: "ParentFieldName"
          }
        ]
      },
      {
        ObjName: "ClientAppLog",
        FieldInfo: [
          {
            type: "INTEGER",
            fieldApiName: "Id",
            isPrimaryKey: true,
            autoIncrement: true
          },
          {
            type: "STRING",
            fieldApiName: "Message"
          },
          {
            type: "DATE",
            fieldApiName: "Time"
          },
          {
            type: "STRING",
            fieldApiName: "State"
          }
        ]
      },
      {
        ObjName: "SchemaInfo",
        FieldInfo: [
          {
            type: "INTEGER",
            fieldApiName: "Id",
            isPrimaryKey: true,
            autoIncrement: true
          },
          {
            type: "STRING",
            fieldApiName: "TableName"
          },
          {
            type: "STRING",
            fieldApiName: "FieldName"
          },
          {
            type: "STRING",
            fieldApiName: "DataType"
          },
          {
            type: "STRING",
            fieldApiName: "FieldLabel"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsUpdateable"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsAccessible"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsCreateable"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsDeletable"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsObjectAccessible"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsObjectCreateable"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsObjectDeletable"
          },
          {
            type: "INTEGER",
            fieldApiName: "IsObjectUpdateable"
          }
        ]
      },
      {
        ObjName: "SyncLog",
        FieldInfo: [
          {
            type: "INTEGER",
            fieldApiName: "Id",
            isPrimaryKey: true,
            autoIncrement: true
          },
          {
            type: "STRING",
            fieldApiName: "CustomerId"
          },
          {
            type: "STRING",
            fieldApiName: "CallId"
          },
          {
            type: "STRING",
            fieldApiName: "Type"
          },
          {
            type: "DATETIME",
            fieldApiName: "SyncDate"
          },
          {
            type: "STRING",
            fieldApiName: "Status"
          },
          {
            type: 'INTEGER',
            fieldApiName: 'LogType'
          },
          {
            type: 'INTEGER',
            fieldApiName: 'AssociationId'
          }
        ]
      }
    ]
  }
}
