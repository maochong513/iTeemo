import React, { Component } from "react";
import { Platform} from 'react-native';

import RNFS from 'react-native-fs';
import SQLite from './SQLite';
import Util from './Util';
import Sync from './Sync';

var FileFactory = {
    // syncSchedule: null,
    // emailNotifySchedule: null,
    // fileThreadSync: null,
    // directories: [],
    // activeProccessIndex: null,
    // activeRecord: null,
    // successUpdateQuery: null,
    // uploadIndex: null,
    // downloadIndex: null,
    // rootPath: null,
    // activePath: null,
    // isTransactionSuccess: null,
    // activeDownloadTransfer: [],
    threadStatus: {
        msg: null,
        time: new Date(),
        state: Util.threadState.end //default values for initializing incremental sync
    },
    getDownloadTarget:(rec) => {
        var param = { returnUrl: Util.AppUserInfo.returnUrl, sessionId: Util.AppUserInfo.sessionId };
        return new Promise((resolve, reject) => {
            Util.getSyncUlr(Util.SyncController.DownloadAttachment).then((url) => {
                var target = url + "?AttachmentId=" + rec.Id +
                    "&returnUrl=" + param.returnUrl +
                    "&sessionId=" + param.sessionId +
                    "&apiVersion=" + Util.getSfdcApiVersion() +
                    "&isbase64=false" +
                    "&downloadIfFound=true" +
                    "&isProfilePicture=" + !!rec.isProfilePicture;
                resolve(target);
            });
        });
    },
    // proCallback: 下载进度
    downloadOnDemand:(data,proCallback) => {  
        return new Promise((resolve, reject) => {
            var query = `Select * from Attachment where ParentId = "${data.Id}" order by datetime(LastModifiedDate) desc limit 1`;
            
            if (data.AttachmentId){
                var AttachmentId=data.AttachmentId.split(',').pop();
                query = `Select * from Attachment where Id = "${AttachmentId}"`;
            }
            SQLite.execute(query).then((attachment)=>{
                if (attachment.length === 0) {
                    resolve();
                    return;
                }else{
                    var rec = attachment.pop();
                    FileFactory.getDownloadTarget(rec).then((formUrl) => {
                        var filename = rec.Id + "." + rec.Name.split('.').pop();
                        RNFS.mkdir(`${RNFS.MainBundlePath}/${data.Dictory}`).then(()=>{
                            const downloadDest = `${RNFS.MainBundlePath}/${data.Dictory}/${filename}`;
                            //const downloadDest = `${RNFS.MainBundlePath}/${filename}`;
                            const options = {
                                fromUrl: formUrl,
                                toFile: downloadDest,
                                background: false,
                                begin: (res) => {
                                    //console.log('downloadOnDemand begin', JSON.stringify(res));
                                    //console.log('downloadOnDemand contentLength:', res.contentLength / 1024 / 1024, 'M');
                                },
                                progress: (res) => {
                                    let pro = res.bytesWritten / res.contentLength; 
                                    proCallback((pro*100).toFixed(2));
                                }
                            };
                            try {
                                const ret = RNFS.downloadFile(options);
                                ret.promise.then(res => { 
                                    resolve(Platform.OS === 'android' ? downloadDest : 'file://' + downloadDest)
                                }).catch(err => {
                                    RNFS.moveFile('file://' + downloadDest);
                                    reject(err);
                                });
                            }
                            catch (e) {
                                RNFS.moveFile('file://' +downloadDest);
                                reject(e);
                            }
                        },(e)=> {
                            RNFS.moveFile('file://' +downloadDest);
                            reject(e);
                        })
                        
                    })
                }
            })

            
        });
    }
}


module.exports = FileFactory;
