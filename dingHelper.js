const dbhelper = require('./dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fetch = require('node-fetch');

dingHelper = {};

dingHelper.doAction = (req, res) => {
    var rlt = {
        errCode: 0,
        errInfo: '',
    };
    return co(function* () {
        var action = req.body.action;
        if (action == null) {
            rlt.errInfo = '没有action';
            rlt.errCode = 1;
            return rlt;
        }
        switch (action) {
            case 'resetDingDingTicket':
                dingHelper.resetDingDingTicket();
                break;
            case 'login':
                var loginCode = req.body.code;
                if (loginCode == null) {
                    rlt.errInfo = '没有loginCode';
                    rlt.errCode = 1;
                    return rlt;
                }
                var logRet = yield dingHelper.dingdinserLogin(loginCode);
                if (logRet.errcode != '0') {
                    rlt.errInfo = logRet.errmsg;
                    rlt.errCode = logRet.errmsg;
                    return rlt;
                }
                var clientIp = req.headers['x-real-ip'] ||
                    req.headers['x-forwarded-for'] ||
                    req.socket.remoteAddress || '';
                if (clientIp.split(',').length > 0) {
                    clientIp = clientIp.split(',')[0];
                }

                var logProRet = yield dbhelper.asynExcute('P121E钉钉用户直登',
                    [dbhelper.makeSqlparam('userid', sqlTypes.NVarChar, logRet.userid),
                    dbhelper.makeSqlparam('userIP', sqlTypes.NVarChar, clientIp),],
                    [
                        dbhelper.makeSqlparam('errInfo', sqlTypes.NVarChar),
                        dbhelper.makeSqlparam('logrcdid', sqlTypes.NVarChar),
                    ]);
                if (logProRet.returnValue != '1') {
                    rlt.errInfo = logProRet.output.errInfo;
                    rlt.errCode = 1;
                    return rlt;
                }
                var logrcd = logProRet.output.logrcdid;
                var userData = yield dingHelper.aysnLoginfFromRcdID(logrcd, req, res);
                if (userData == null) {
                    rlt.errInfo = '快捷登录失败[' + logRet.userid + ']';
                    rlt.errCode = 1;
                    return rlt;
                }
                rlt.user = userData;
                break;
        }
        return rlt;
    });
};

dingHelper.asynGetAccessToken = () => {
    return co(function* () {
        var sql = 'select dbo.FBDDAccessToken()';
        var ret = yield dbhelper.asynQueryWithParams(sql, null, { scalar: 1 });
        return ret;
    });
};

dingHelper.asynGetDingDingTicket = (pageUrl) => {
    return co(function* () {
        var ret = yield dbhelper.asynExcute('PGetDingDingTicket', [dbhelper.makeSqlparam('pageurl', sqlTypes.NVarChar, pageUrl)],
            [
                dbhelper.makeSqlparam('signature', sqlTypes.NVarChar),
                dbhelper.makeSqlparam('timeStamp', sqlTypes.NVarChar),
                dbhelper.makeSqlparam('nonceStr', sqlTypes.NVarChar),
                dbhelper.makeSqlparam('errCode', sqlTypes.NVarChar),
                dbhelper.makeSqlparam('errMsg', sqlTypes.NVarChar),
            ]);
        if (ret.output.errCode != 0) {
            console.log(ret.output.errMsg);
            return {
                errInfo: ret.output.errMsg
            };
        }
        return {
            Signature: ret.output.signature,
            TimeStamp: ret.output.timeStamp,
            NonceStr: ret.output.nonceStr,
        };
    });
};

dingHelper.resetDingDingTicket = () => {
    dbhelper.asynExcute('resetDingDingTicket', null, null);
};

dingHelper.dingdinserLogin = (code) => {
    return co(function* () {
        if (code == null) {
            return { errInfo: 'node code' };
        }
        var accessToken = yield dingHelper.asynGetAccessToken();
        var url = "https://oapi.dingtalk.com/user/getuserinfo?access_token=" + accessToken + "&code=" + code;
        var fetchRet = yield fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            },
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );

        return fetchRet;
    });
};

dingHelper.aysnLoginfFromRcdID = (logrcdid, req, res) => {
    return co(function* () {
        var userInfoRet = yield dbhelper.asynQueryWithParams('SELECT * FROM FT121E查询直登记录(@key)', [dbhelper.makeSqlparam('key', sqlTypes.NVarChar, logrcdid)])
        if (userInfoRet.recordset.length > 0) {
            var firstRow = userInfoRet.recordset[0];
            res.cookie('_erplogrcdid', logrcdid, { signed: true, maxAge: 518400000, httpOnly: true });
            var rlt = {
                username: firstRow['员工姓名'],
                userid: firstRow['员工代码'],
                workRegionCode:firstRow['常驻工作地域代码'],
                companyCode:firstRow['所属公司名称代码'],
                wokerTypeCode:firstRow['员工工时状态代码'],
                departmentCode:firstRow['所属部门名称代码'],
                systemCode:firstRow['所属系统名称代码'],
                logrcdid:logrcdid,
            };
            req.session.g_envVar = rlt;

            return rlt;
        }
        return null;
    });
};

const baseServerUrl = 'https://oapi.dingtalk.com/service/';
function saveAppConfig(){
    inparams_arr=[
        dbhelper.makeSqlparam('ticket', sqlTypes.NVarChar(100), appTicket == null ? '' : appTicket),
        dbhelper.makeSqlparam('accessToken', sqlTypes.NVarChar(100), appAccessToken == null ? '' : appAccessToken),
        dbhelper.makeSqlparam('tokenexpiretime', sqlTypes.BigInt, appAccessToken_expiretime),
    ];
    try{
        dbhelper.asynExcute('P更新钉APP配置',inparams_arr);
    }
    catch(eo){
    }
}

function getAppAccessToken(){
    return co(function* () {
        if(appAccessToken){
            var nowTime = new Date().getTime();
            if(nowTime > appAccessToken_expiretime){
                appAccessToken = null;  // expired
            }
        }
        if(appAccessToken != null){
            return appAccessToken;
        }
        var rcd_ret;
        var rcd;
        if(appTicket == null){
            rcd_ret = yield dbhelper.asynQuery('select [ticket],[accessToken],[tokenexpiretime] from [T钉钉APP配置]');
            if(rcd_ret.recordset.length == 0){
                return;
            }
            rcd = rcd_ret.recordset[0];
            appTicket = rcd.ticket;
            appAccessToken = rcd.accessToken;
            appAccessToken_expiretime = parseInt(rcd.tokenexpiretime);
        }
        if(appTicket == null || appTicket.length == 0){
            return null;
        }
        if(appAccessToken == null){
            rcd_ret = yield dbhelper.asynQuery('select [accessToken],[tokenexpiretime] from [T钉钉APP配置]');
            if(rcd_ret.recordset.length == 0){
                return;
            }
            rcd = rcd_ret.recordset[0];
            appAccessToken = rcd.accessToken;
            appAccessToken_expiretime = parseInt(rcd.tokenexpiretime);
        }
        if(appAccessToken == null || appAccessToken.length == 0){
            var get_tokenRet = yield fetch(baseServerUrl + "get_suite_token", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({suite_ticket:appTicket,suite_key:'suiteez10hnwwjhpkogt6',suite_secret:'9BD28PzqV1BQKaVvh-bVEA_YMOdvT8iv4oO9IxbR5rAwC6Frga5_CbkhMdM1DsX0'}),
            }).then(
                response => {
                    if (response.ok) {
                        return response.json();
                    }
                    else {
                        return { errInfo: 'no response' };
                    }
                }
            ).then(
                json => {
                    return json;
                }
            );
            appAccessToken = get_tokenRet.suite_access_token;
            appAccessToken_expiretime = new Date().getTime() + (get_tokenRet.expires_in - 60) * 1000;
            saveAppConfig();
        }
        return appAccessToken;
    });
}

function activeCorp(tem_authCode, auth_corpid){
    return co(function* () {
        var accessToken = yield getAppAccessToken();
        if(accessToken == null){
            return;
        }
        var get_permanentRet = yield fetch(baseServerUrl + "get_permanent_code?suite_access_token=" + accessToken, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({tmp_auth_code: tem_authCode}),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );

        console.log(JSON.stringify(get_permanentRet));
        /*
        "permanent_code": "xxxx",
            "auth_corp_info":
            {
              "corpid": "xxxx",
              "corp_name": "name"
            }
        */
        var activateRet = yield fetch(baseServerUrl + "activate_suite?suite_access_token=" + accessToken, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({suite_key: 'suiteez10hnwwjhpkogt6',auth_corpid:auth_corpid,permanent_code:get_permanentRet.permanent_code}),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );
        console.log(JSON.stringify(activateRet));
    });
}

dingHelper.createChat = (name, owner, useridlist)=>{
    return co(function* () {
        var accessToken = yield getAppAccessToken();
        if(accessToken == null){
            return;
        }
        //accessToken = '0bc5b543b97d31f98ba0d9f03c71cc40';
        var creatChatRet = yield fetch("https://oapi.dingtalk.com/chat/create?access_token=" + accessToken, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({name: name, owner:owner, useridlist:useridlist}),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );

        console.log(JSON.stringify(creatChatRet));
        if(creatChatRet.errcode != 0){
            return { errInfo: creatChatRet.errmsg };
        }
        return {
            chatid:creatChatRet.chatid
        };
    });
}

dingHelper.sendMsgToChat = (charid, msgjson)=>{
    return co(function* () {
        var accessToken = yield getAppAccessToken();
        if(accessToken == null){
            return;
        }
        //accessToken = '0bc5b543b97d31f98ba0d9f03c71cc40';
        var sendChatRet = yield fetch("https://oapi.dingtalk.com/chat/send?access_token=" + accessToken, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                chatid:charid,
                msg:msgjson
            }),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );
        if(sendChatRet.errcode != 0){
            return { errInfo: sendChatRet.errmsg };
        }
        return {
            messageId:sendChatRet.messageId
        };
    });
}

dingHelper.ORCFile = (type, fileID)=>{
    return co(function* () {
        var accessToken = yield getAppAccessToken();
        if(accessToken == null){
            return { errInfo: 'accessToken获取失败' };
        }
        var fileURL = yield dbhelper.asynGetScalar("SELECT 'http://erp.highbird.cn:1330' + 文件路径 FROM [dbo].[FTB00E文件信息] (@fileid)", [dbhelper.makeSqlparam('fileid', sqlTypes.Int, fileID)]);
        if(fileURL == null){
            return { errInfo: '文件未找到' };
        }
        var orcRet = yield fetch("https://oapi.dingtalk.com/topapi/ocr/structured/recognize?access_token=" + accessToken, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                type:type,
                image_url:fileURL
            }),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );
        if(orcRet.errcode != 0){
            return { errInfo: orcRet.errmsg };
        }
        return sendChatRet.result;
    });
}

var appTicket = null;
var appAccessToken = null;
var appAccessToken_expiretime = 0;
dingHelper.receiveCallback = (msgJson)=>{
    console.log(JSON.stringify(msgJson));
    var retMsg = 'success';
    var inparams_arr = null;
    switch(msgJson.EventType){
        case 'check_update_suite_url':
        case 'check_create_suite_url':
        retMsg = msgJson.Random;
        break;
        case 'suite_ticket':
        var ticket = msgJson.SuiteTicket;
        appTicket = ticket;
        appAccessToken = null;
        appAccessToken_expiretime = 0;
        saveAppConfig();
        break;
        case 'tmp_auth_code':
        var authCode = msgJson.AuthCode;
        var corpId = msgJson.AuthCorpId;
        activeCorp(authCode, corpId);
        break;
    }
    return retMsg;
};

module.exports = dingHelper;