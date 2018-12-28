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
                    rlt.errInfo = '快捷登录失败';
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
            };
            req.session.userid = rlt.userid;
            req.session.username = rlt.username;
            return rlt;
        }
        return null;
    });
};

module.exports = dingHelper;