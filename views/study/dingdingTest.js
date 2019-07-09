const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require("fs");
var request=require("request");


function process(req, res, next) {
    var rlt = {};
    
    try{
        getAttendanceRecord(res);
    }
    catch(err){
        rlt.err = {
            info: err.message
        };
        res.json(rlt);
    }
}


function getAttendanceRecord(res) {
    return co(function* () {
        var accessToken = yield dbhelper.asynGetScalar("select [dbo].[FBDDAccessToken]()", null);
        var getUrl = "https://oapi.dingtalk.com/attendance/listRecord?access_token=" + accessToken;
        
        
        var postData = {
            "userIds": ["061940371620736301","022405694335642103"],
            "checkDateFrom": "2018-10-15 00:00:00",
            "checkDateTo": "2018-10-19 00:00:00",
            "isI18n":"false"
        };
        

        request({
            url: getUrl,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: postData
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(body);
            }
            else{
                res.json({err:error});
            }
        }); 
    });
}

module.exports = process;