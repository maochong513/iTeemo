import SQLite from './../common/SQLite';

const getPictures = (accountId , where)=> {
    return new Promise(function (resolve, reject) {
        var condition = '';
        if (accountId) {
            condition +=  ` AND f.ebMobile__Account__c = '${accountId}' `;
        }
        var query ="SELECT f.*,"+
            " f.ebMobile__AttachmentId__c,"+
            " Attachment.ContentType,"+
            " ifnull(Account.Name,'') AS AccountName,"+
            " ifnull(AccountNumber,'') as AccountNumber,"+
            " Account.CHQName__c CHQName,Account.CHQID__c CHQID"+
            " FROM ebMobile__File__c f"+
            " LEFT JOIN Attachment ON f.Id = Attachment.ParentId"+
            " LEFT JOIN Account ON f.ebMobile__Account__c = Account.Id"+
            " LEFT JOIN ProductHierarchy__c ph ON f.ProductHierarchyId__c = ph.Id"+
            " WHERE f.ebMobile__FileType__c IN('Photos','SurveyPhoto','TaskPhoto')" +
            " and f.ebMobile__IsActive__c=1" +
            " and (f.ebMobile__AttachmentId__c <>'' or f.ebMobile__FilePath__c<>'')"+condition;
        if(where!="" && where)
        {
            query+=where;
        }
        SQLite.execute(query + " ORDER BY f.CreatedDate DESC").then(function (result) {
            resolve(result);
        });
    });
}

export default {
    getPictures
}
