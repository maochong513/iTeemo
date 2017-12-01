import SQLite from './../common/SQLite';
import Util from './../common/Util';

const getDayCustomers = () => {
    return new Promise((resolve, reject) => {
        var sortfield = 'StartDateTime, allDayEvent';
        SQLite.execute('SELECT * FROM  ebMobile__Configuration__c WHERE ebMobile__CodeCategory__c = "RouteSequenceSort"').then((result) => {
            var codeValue = result.length > 0 ? result[0].ebMobile__CodeValue__c : 'CustomerName';
            if (['Sequence', 'CustomerName'].indexOf(codeValue) > -1) {
                sortfield = codeValue === 'CustomerName' ? 'ebMobile__Sequence__c, ebMobile__IsPlanned__c, Account.NAME' : 'ebMobile__Sequence__c';
            }
            var query = 'SELECT distinct [Account].TraxEnable__c,[Account].ebMobile__ShippingCondition__c,[Account].AccountSource,[Account].ebMobile__MEPCustomerNumber__c,[Account].ebMobile__SalesRoute__c, Call.ebMobile__NoVisitReason__c, Call.ebMobile__NoOrderReason__c, IFNULL([RedSurvey].ebMobile__SurveyTotalScore__c, 0) as ebMobile__SurveyTotalScore__c, [Attachment].Id as AttachmentId, [Attachment].Name as AttachmentName, Account.ebMobile__AccountPhotoId__c, Account.Id,Account.Id AS AccountId, ebMobile__Sequence__c As SequenceNumber, IFNULL(ebMobile__Address__c,"") AS Address, ebMobile__TradeChannel__c As TradeChannel, ebMobile__SubTradeChannel__c AS Channel,' +
                'ebMobile__GeoCode__Latitude__s As lat, ebMobile__GeoCode__Longitude__s AS long, ' +
                'ebMobile__Segment__c AS Segment, Email AS Email, Type, [Account].[ebMobile__isActive__C], ' +
                'IFNULL(Account.NAME,"") AS Name, Account.ebMobile__SalesOrg__c, Account.ebMobile__Division__c, Account.ebMobile__DistributionChannel__c, Account.ebMobile__SaleGroup__c, Account.ebMobile__SalesOffice__c, AccountNumber, IFNULL(Contact.Name,"") AS ContactName, IFNULL(Contact.FirstName,"") AS FirstName, IFNULL(Contact.LastName,"") AS LastName, IsAllDayEvent AS allDayEvent, Account.AccountSource, ' +
                'IFNULL(Contact.Phone,"") AS Phone, IFNULL(Contact.MobilePhone,"") AS Mobile, ' +
                'Contact.Title, StartDateTime AS start, EndDateTime AS end, ebMobile__Sequence__c, ebMobile__IsPlanned__c, [Call].[ebMobile__CallType__c] AS [CallType], [Call].[Id] AS [CallId], [Call].ebMobile__RecordAction__c, Account.ebMobile__BlockByCredit__c, Account.ebMobile__PaymentTerms__c, Account.ebMobile__OrderBlock__c, ebMobile__Configuration__c.[ebMobile__CodeDescription__c] AS ebMobile__CodeDescription__c, ebMobile__TradeGroup__c,[Account].CallTarget__c as CallTarget,' +
                "(select am.ebMobile__Value__c Value from ebMobile__AccountMetrics__c  am inner join ebMobile__RoleMetrics__c rm on rm.ebMobile__MetricsID__c=am.ebMobile__MetricsType__c where am.ebMobile__PeriodType__c='Monthly' and am.ebMobile__IsActive__c=1 and rm.ebMobile__MetricType__c='Call Rate' and datetime(am.ebMobile__Period__c) between datetime('now','start of month') and  datetime('now','start of month','+1 month','-1 second') and am.ebMobile__AccountID__c=[Account].Id) as CallComplate," +
                "Account.CHQID__c CHQID,Account.CHQName__c CHQName " +
                'FROM [Event] ' +
                'LEFT OUTER JOIN [Account] ON [Event].[AccountId] = [Account].[Id] ' +
                'LEFT OUTER JOIN  [Contact] ON [Account].[Id] = [Contact].[AccountId] AND [Contact].[ebMobile__Primary__c] = 1 AND Contact.Id = (SELECT MIN(Id) FROM Contact con WHERE con.AccountId = [Account].[Id]  AND con.[ebMobile__Primary__c] = 1) ' +
                'LEFT JOIN (SELECT * FROM ebMobile__Call__c WHERE DATE(ebMobile__CallDate__c)= DATE("now", "localtime") and ebMobile__RecordAction__c<>-1  group BY ebmobile__accountid__c) Call ON [Account].[Id] = [Call].[ebmobile__accountid__c] ' +
                'LEFT JOIN (SELECT a1.* FROM [Attachment] a1 LEFT JOIN [Attachment] a2	ON (a1.ParentId = a2.ParentId AND a1.LastModifiedDate < a2.LastModifiedDate) WHERE a2.Id IS NULL) Attachment ON [Attachment].[ParentId] = [Account].[Id] ' +
                'LEFT JOIN (SELECT r1.* FROM [ebMobile__REDSurveys__c] r1 LEFT JOIN [ebMobile__REDSurveys__c] r2 ON (r1.ebMobile__AccountID__c = r2.ebMobile__AccountID__c AND r1.ebMobile__SurveyDate__c < r2.ebMobile__SurveyDate__c) WHERE r2.Id IS NULL GROUP BY r1.ebMobile__VisitID__c) RedSurvey ON [RedSurvey].[ebMobile__AccountID__c] = [Account].[Id] ' +
                'LEFT OUTER JOIN ebMobile__Configuration__c ON ebMobile__Configuration__c.[ebMobile__CodeValue__c] = Account.[ebMobile__TradeGroup__c] AND ebMobile__Configuration__c.[ebMobile__CodeCategory__c] = "StillRoute" ' +
                'WHERE [Event].[ebMobile__RecordTypeName__c] LIKE "%Route%" AND [Account].[ebMobile__isActive__C] = 1 AND [Event].[ebMobile__isActive__C] = 1 AND [Account].[Id] IS NOT NULL ' +
                'AND date(ActivityDate) = date("now", "localtime") ORDER BY ' + sortfield;
            SQLite.execute(query).then(function (result) {
                resolve(result);
            });
        });
    });
}

    /**
     * getIssuesData - service call to get issue data from issue table
     * @param {String} accountId - accountId is the current user's ID
     * */
    const getIssuesData = (accountId, issueType) => {
        return new Promise(function (resolve, reject) {
            var query = 'select ifnull(ebMobile__CodeValue__c,10) as len from ebMobile__Configuration__c where ebMobile__CodeCategory__c="CustomerHistoryItems" and ebMobile__CodeDescription__c="Notes" and ebMobile__IsActive__c=1 order by LastModifiedDate DESC LIMIT 1';
            SQLite.execute(query).then(function (limit) {
                query = `SELECT Id,OwnerId,ebMobile__UserName__c As User, AccountId, Description, retailerDescription__c as retailerDescription, IsHighPriority,Priority, IsClosed, CASE WHEN Type ="" THEN "N/A" ELSE Type END AS Type , ActivityDate, ebMobile__IsActive__c, CreatedDate AS TaskCreatedDate, Subject As TaskSubject, CASE WHEN Status IS NULL THEN "N/A" ELSE Status END AS TaskStatus, LastModifiedDate AS Date, ebMobile__RecordAction__c,GTIN__c,HelpNeeded__c as HelpNeeded FROM [Task] WHERE AccountId = "${accountId}" and IssueType__c="${issueType}" and ebMobile__IsActive__c=1`;
                if (Util.getCountryCode() == "JPN" && issueType == IssueType.NextStep) {
                    query += " and  Status<>'完了'"
                }
                query = query + ` Order BY datetime(LastModifiedDate) DESC LIMIT ${limit[0].len || 10}`;
                SQLite.execute(query).then(function (result) {
                    resolve(result);
                });
            });
        });
    };

    const getNoteData =  (id)=> {
        return new Promise(function (resolve, reject) {
            var query = 'SELECT Id, ebMobile__Body__c AS noteBody, ebMobile__AccountId__c AS ParentId, CreatedDate AS Date, Name AS User, ebMobile__UserId__c AS UserId '+
                'FROM ebMobile__AccountNote__c ' +
                `WHERE ebMobile__AccountId__c = "${id}" and ebMobile__IsActive__c="1" `+
                'Order BY datetime(CreatedDate) DESC  LIMIT 10';
                SQLite.execute(query).then(function (result) { 
                resolve(result);
            });
        });
    };

    const getIssuesDataGroup = (issueType) => {
        return new Promise(function (resolve, reject) {
            var query = "SELECT  t.Description,t.IsHighPriority,t.Priority,t.ActivityDate,at.CHQName__c CHQName,min(t.isRead__c) as Read" +
                " FROM Task t inner join Account at on t.AccountId=at.Id" +
                ` WHERE t.IssueType__c = '${issueType}'` +
                " AND t.ebMobile__IsActive__c = 1 and at.ebMobile__IsActive__c = 1 and  t.Status<>'完了'" +
                " group by t.Description,t.Priority,t.ActivityDate,at.CHQName__c" +
                " order by datetime(t.ActivityDate),at.CHQName__c";
            SQLite.execute(query).then(function (result) {
                resolve(result);
            });
        });
    };

    const IssueType = {
        Alert: "Alert",
        NextStep: "NextStep"
    }


export default {
    getDayCustomers,
    IssueType,
    getIssuesData,
    getIssuesDataGroup,
    getNoteData

}
