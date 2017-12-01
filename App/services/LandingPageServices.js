import React, {
    NetInfo
} from 'react-native';

import SQLite from './../common/SQLite';

/***
 * 获取汇总问题列表
 * @param issueType
 */
const IssueType={
    Alert:"Alert",
    NextStep:"NextStep"
}
const GetIssuesDataGroup = (issueType) => {
    return new Promise(function (resolve, reject) {
        var query = `SELECT  t.Description,t.IsHighPriority,t.Priority,t.ActivityDate,at.CHQName__c CHQName,min(t.isRead__c) as Read`+
        ` FROM Task t inner join Account at on t.AccountId=at.Id`+
        ` WHERE t.IssueType__c = '${issueType}'`+
        ` AND t.ebMobile__IsActive__c = 1 and at.ebMobile__IsActive__c = 1 and  t.Status<>'完了'`+
        ` group by t.Description,t.Priority,t.ActivityDate,at.CHQName__c`+
        ` order by datetime(t.ActivityDate),at.CHQName__c`
        SQLite.execute(query).then(function (result) {
            resolve(result);
        });
    });
};

const  UpdateIsueCouml = (issueType,obj,type) => {
    return new Promise(function (resolve, reject) {
        var upCouml=''
        if(type=="read"){
            upCouml=" IsRead__c=1,"
        }else{
            upCouml=" Status='完了',"
        }
        var query = `update Task set ${upCouml} ebMobile__RecordAction__c=2 where Description="${obj.Description}" and Priority="${obj.Priority}" and ActivityDate="${obj.ActivityDate}" and IssueType__c="${issueType}"`;
        SQLite.execute(query).then(function (result){
            resolve();
        });
    });
};

export default {
    GetIssuesDataGroup,
    UpdateIsueCouml,
    IssueType
}
