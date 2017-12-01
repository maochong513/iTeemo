import React,{Component} from 'react';
import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(true);
var database_name = "TeemoPlus.db";
var database_version = "1.0";
var database_displayname = "TeemoPlus";
var database_size = -1;
var db;
export default class  SQLite extends Component {
    componentWillUnmount(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
    }
    static open(){
        console.log("sqlite open()")
        db = SQLiteStorage.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
            ()=>{
                this._successCB('open');
            },
            (err)=>{
                this._errorCB('open',err);
            });
    }
    static execute(query, params){
        if (!db) {
            this.open();
        }
        var that=this;
        return new Promise(function (resolve, reject) {
            if (typeof (query) === "string")
                query = [{query: query, params: params}];
            else if (query && query.length === 0) {
                resolve({}, {rows: []});
                return;
            }
            db.transaction((tx)=> {
                query.forEach((q,i)=> {
                    //console.log(`execute Sql:${q.query}`);
                    tx.executeSql(q.query,q.params,(tx,results)=> {
                        if (query.length === i + 1){
                            var len = results.rows.length;
                            var datas = [];
                            for(let i=0;i<len;i++){
                              datas.push(results.rows.item(i));
                            }
                            resolve(datas); 
                            }
                        },
                        (err)=> {
                            that._errorCB('executeSql', JSON.stringify(err));
                            reject(err);
                        });
                }, this);
 
            }, (err)=> {
                that._errorCB('transaction', err);
                reject(error);
            }, ()=> {
                that._successCB('transaction');
            })
        }).catch(function (args) {
            that._errorCB('transaction', args);
          reject(error);
        });
    }
    static close(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
        db = null;
    }
    static _successCB(name){
        console.log("SQLiteStorage "+name+" success");
    }
    static _errorCB(name, err){
        console.log("SQLiteStorage "+name+" error:"+err);
    }
}
