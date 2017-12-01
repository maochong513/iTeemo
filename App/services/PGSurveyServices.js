import SQLite from './../common/SQLite';
import JsonSql from './../common/JsonSql';
import Util from './../common/Util';
import moment from 'moment';

/**
     * getSeruryData - service call to get Serury Data
     * @param {String} id - customer's id
     * */
 const getSeruryData = (customerId)=> {
        return new Promise(function (resolve, reject) {
            var query =  "SELECT sg.Id, sg.ebMobile__Description__c Name,sg.ebMobile__Description__c,sg.ebMobile__Code__c,sg.ebMobile__Type__c,sg.ebMobile__DisplayType__c,sg.ebMobile__IsActive__c,sg.ebMobile__GUID__c,sg.LastModifiedDate,sg.SubType__c as SubType,spf.Id as TaskId,spf.ebMobile__StartDate__c as StartDate, spf.ebMobile__EndDate__c as EndDate,spf.Frequency__c  as Frequency ,spf.SurveyGroupSequence__c as Sequence,sp.ebMobile__SurveyType__c as SurveyType FROM" +
                " ebMobile__SurveyProfileAssign__c spf" +
                " INNER JOIN ebMobile__SurveyProfile__c sp ON sp.Id = spf.ebMobile__SurveyProfileID__c" +
                " INNER JOIN ebMobile__AccountGroup__c ag ON ag.Id = spf.ebMobile__AccountGroupID__c" +
                " INNER JOIN ebMobile__SurveyGroup__c sg ON sg.Id =spf.SurveyGroup__c" +
                " INNER JOIN ebMobile__AccountGroupItem__c agi on agi.ebMobile__AccountGroup__c = ag.Id and agi.ebMobile__IsActive__c=1" +
                " WHERE 1=1 " +
                " AND sp.ebMobile__SurveyType__c = 'Execution'" +
                " AND spf.ebMobile__IsActive__c = 1" +
                " AND agi.ebMobile__IsActive__c = 1" +
                ` AND agi.ebMobile__Account__c = '${customerId}' and sg.id=spf.SurveyGroup__c ` +
                " AND date('now','localtime') BETWEEN  spf.ebMobile__StartDate__c AND spf.ebMobile__EndDate__c" +
                " order by spf.SurveyGroupSequence__c" 
            SQLite.execute(query).then(function (data) { 
                var countryCode = Util.getCountryCode();
                //japan定制需求
                if (countryCode === "JPN") {
                    query=  "SELECT DISTINCT ag.id,ag.Name, ad.EffectiveFrom__c StartDate, ad.EffectiveTo__c EndDate,ad.LastModifiedDate"+
                   " FROM ProductHierarchy__c ph"+
                   " INNER JOIN AuditDetail__c ad ON ad.Category__c = ph.id"+
                   " INNER JOIN ebMobile__AccountGroup__c ag ON ag.Id = ad.AccountGroup__c and ag.ebMobile__IsActive__c=1"+
                   " INNER JOIN ebMobile__AccountGroupItem__c agi ON agi.ebMobile__AccountGroup__c = ag.Id and agi.ebMobile__IsActive__c=1"+
                   ` WHERE ad.IsActive__c=1 and agi.ebMobile__Account__c = '${customerId}'`
                   " AND ad.Type__c = 'PO' and date('now','localtime') BETWEEN  date(ad.EffectiveFrom__c) AND date(ad.EffectiveTo__c)";
                   SQLite.execute(query).then(function(list){
                        if (list.length > 0) {
                            var PrioritiesObj = {
                                EndDate: list[0].EndDate,
                                StartDate: list[0].StartDate,
                                Frequency: "31",
                                Id: "JAPANPOSURVEY",
                                LastModifiedDate: list[0].LastModifiedDate,
                                Name:Util.translateText("PANDGGlobal.PRIORITY_ORDER"),
                                SubType: "",
                                SubType__c: "",
                                TaskId: "a13410000026POSURVEY",
                                ebMobile__Code__c: "POSURVEY",
                                ebMobile__Description__c: Util.translateText("PANDGGlobal.PRIORITY_ORDER"),
                                ebMobile__DisplayType__c: "Activation",
                                ebMobile__GUID__c: "",
                                ebMobile__IsActive__c: 1,
                                ebMobile__Type__c: "Category",
                                SurveyType:"Execution",
                                Sequence:1
                            };
                            data.push(PrioritiesObj);
                        } 
                        query=  "SELECT DISTINCT ag.id,ag.Name, ad.EffectiveFrom__c StartDate, ad.EffectiveTo__c EndDate"+
                            " FROM ProductHierarchy__c ph"+
                            " INNER JOIN PlanogramQuestions__c ad ON ad.Category__c = ph.id"+
                            " INNER JOIN ebMobile__AccountGroup__c ag ON ag.Id = ad.AccountGroup__c and ag.ebMobile__IsActive__c=1"+
                            " INNER JOIN ebMobile__AccountGroupItem__c agi ON agi.ebMobile__AccountGroup__c = ag.Id and agi.ebMobile__IsActive__c=1"+
                            ` WHERE ad.IsActive__c=1 and agi.ebMobile__Account__c = '${customerId}'` +
                            " and date('now','localtime') BETWEEN  date(ad.EffectiveFrom__c) AND date(ad.EffectiveTo__c)";

                        SQLite.execute(query).then(function(gplist){
                            if(gplist.length>0){
                                var PrioritiesObj = {
                                    EndDate: gplist[0].EndDate,
                                    StartDate: gplist[0].StartDate,
                                    Frequency: "31",
                                    Id: "JAPANPLANOGRAMSURVEY",
                                    LastModifiedDate: gplist[0].LastModifiedDate,
                                    Name: Util.translateText("PANDGGlobal.PLANOGRAM_SURVEY"),
                                    SubType: "",
                                    SubType__c: "",
                                    TaskId: "a13410000026PLANOGRAMSURVEY",
                                    ebMobile__Code__c: "PLANOGRAMSURVEY",
                                    ebMobile__Description__c: Util.translateText("PANDGGlobal.PLANOGRAM_SURVEY"),
                                    ebMobile__DisplayType__c: "Activation",
                                    ebMobile__GUID__c: "",
                                    ebMobile__IsActive__c: 1,
                                    ebMobile__Type__c: "Category",
                                    SurveyType:"Execution",
                                    Sequence:2
                                };
                                data.push(PrioritiesObj);
                            }
                            resolve(data);
                        })
                    })
                }else  {resolve(data)};
            });
        });
    };

 const getTrackingId =  (type, gid, cid, date) => {
        return new Promise(function (resolve, reject) {
            date=moment(date, "yyyyMMdd")
            var trackId = `${type}${gid}${cid}${Util.AppUserInfo.userId}${date}`;
            var like = `${type}${gid}${cid}${Util.AppUserInfo.userId}`;
            var query = "";
            if (type == "Survey")
                query = `select 1 from ebMobile__SurveyTransactions__c WHERE TrackingID__c = '${trackId}' LIMIT 1`;
            else {
                if (type == "SKU")
                    query = `select 1 from SKUTransaction__c WHERE TrackingID__c  = '${trackId}' LIMIT 1`;
                else
                    query = `select 1 from AuditTransaction__c WHERE TrackingID__c  = '${trackId}' LIMIT 1`
            }
            SQLite.execute(query).then(function (result) {
                if (result.length > 0) {
                    resolve(trackId)
                } else {
                    if (type == "Survey")
                        query = `select TrackingID__c as TrackingID from ebMobile__SurveyTransactions__c WHERE TrackingID__c like '${like}%' order by StartDate__c desc LIMIT 1`;
                    else {
                        if (type == "SKU")
                            query = `select TrackingID__c as TrackingID from SKUTransaction__c WHERE TrackingID__c  like '${like}%' order by StartTime__c desc LIMIT 1`;
                        else
                            query = `select TrackingID__c as TrackingID from AuditTransaction__c WHERE TrackingID__c like '${like}%' order by StartTime__c desc LIMIT 1`;
                    }
                    SQLite.execute(query).then(function (result) {
                        if (result.length > 0) {
                            resolve(result[0].TrackingID)
                        } else
                            resolve(trackId)
                    });
                }
            });
        });
    }

    const getTrackingIdOver = (group,cid)=> {
        return getTrackingId(group.ebMobile__Type__c,group.Id,cid,group.StartDate)
    }

    /********************************************************************************************************************************************************************************/
    /********************************************************************************************************************************************************************************/
    /********************************************************************************************************************************************************************************/
    /********************************************************************************************************************************************************************************/
    
    const getPOQuestion =  (accountId, type, category, trackingId)=> {
        return new Promise(function (resolve, reject) {
            var query = "select " +
                " ad.*, agi.ebMobile__Account__c  AccountId,ad.AnswerType__c as AnswerType,adt.TaskAnswerValue__c DefaultValue, adt.ReasonText__c ReasonText, adt.ReasonValue__c ReasonValue," +
                ` ifnull((SELECT fq.Id FROM ebMobile__File__c fq where fq.AuditDetailId__c = ad.Id AND fq.TrackingID__c = '${trackingId}' AND fq.ebMobile__IsActive__c = 1 LIMIT 1 ),'') AS QuestionFilePath` +
                " from ProductHierarchy__c ph" +
                " inner join AuditDetail__c ad on ad.Category__c = ph.id" +
                " inner join ebMobile__AccountGroup__c ag on ag.Id=ad.AccountGroup__c and ag.ebMobile__IsActive__c=1" +
                " inner join ebMobile__AccountGroupItem__c agi on agi.ebMobile__AccountGroup__c= ag.Id  and agi.ebMobile__IsActive__c=1" +
                ` left join AuditTransaction__c adt on adt.AuditDetail__c=ad.Id and adt.TrackingID__c='${trackingId}' and adt.Valid__c=1 and adt.IsActive__c=1  and adt.SurveyType__c='PO'` +
                ` WHERE ad.IsActive__c=1 and ag.ebMobile__IsActive__c=1  and agi.ebMobile__IsActive__c=1 and agi.ebMobile__Account__c='${accountId}' and  ad.Type__c='${type}' and date('now','localtime') between date(ad.EffectiveFrom__c) and date(ad.EffectiveTo__c)` +
                " order by ad.Sequence__c";
            if (category != "" && category) {
                query += ` and ad.Category__c='${category}'`;
            }
            console.log(query);
            SQLite.execute(query).then(function (result) {
                resolve(result);
            });
        });
    }


    export default {
        getSeruryData,
        getTrackingIdOver,
        getPOQuestion
    }
