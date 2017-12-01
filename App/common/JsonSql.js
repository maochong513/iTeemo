
import React,{
    NetInfo
} from 'react-native'; 

//jsonsql.query("select title,url from json.channel.items where (category=='javascript' || category=='vista') order by title,category asc limit 3",json); 
const query  = (sql,json)=>{
    var returnfields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);
    var ops = {
      fields: returnfields[2].replace(' ', '').split(','),
      from: returnfields[3].replace(' ', ''),
      where: (returnfields[4] == undefined) ? "true" : returnfields[4],
      orderby: (returnfields[5] == undefined) ? [] : returnfields[5].replace(' ', '').split(','),
      order: (returnfields[6] == undefined) ? "asc" : returnfields[6],
      limit: (returnfields[7] == undefined) ? [] : returnfields[7].replace(' ', '').split(',')
    };
    return parse(json, ops);
}

var parse =(json,ops)=>{
    var o = { fields: ["*"], from: "json", where: "", orderby: [], order: "asc", limit: [] };
    for (i in ops) o[i] = ops[i];

    var result = [];
    result = returnFilter(json, o);
    result = returnOrderBy(result, o.orderby, o.order);
    result = returnLimit(result, o.limit);
    return result;
}

var returnFilter =(json,jsonsql_o)=>{
    var jsonsql_scope = eval(jsonsql_o.from);
    var jsonsql_result = [];
    var jsonsql_rc = 0;

    if (jsonsql_o.where == "")
        jsonsql_o.where = "true";

    for (var jsonsql_i in jsonsql_scope) { 
        var json=jsonsql_scope[jsonsql_i];
        if (eval(jsonsql_o.where)) {
            jsonsql_result[jsonsql_rc++] = returnFields(json, jsonsql_o.fields);
        }
    }
    return jsonsql_result;
}
 
var returnFields= (scope, fields) =>{

    if (fields.length == 0)
      fields = ["*"];

    if (fields[0] == "*")
      return scope;

    var returnobj = {};
    for (var i in fields)
      returnobj[fields[i]] = scope[fields[i]];

    return returnobj;
  }
 
const returnOrderBy =(result, orderby, order)=>{
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
} 

var returnLimit =(result, limit)=>{ 
    switch (limit.length) {
        case 0: return result;
        case 1: return result.splice(0, limit[0]);
        case 2: return result.splice(limit[0] - 1, limit[1]);
      }
}

export default{
    query
}

  