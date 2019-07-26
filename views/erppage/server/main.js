const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require('fs');
const forge = require('node-forge');
var MD5 = require('md5.js');
var dingHelper = require('../../../dingHelper');

var rsa = forge.pki.rsa;


var processes_map = {
    getMenu: getMenu,
    userlogin: userLogin,
    readyLogin: readyLogin,
    reportError: reportErr
};

function process(req, res, next) {
    var ignoreENVCheck = false;
    switch (req.body.action) {
        case 'userlogin':
        case 'readyLogin':
        case 'reportError':
            ignoreENVCheck = true;
            break;
    }
    serverhelper.commonProcess(req, res, next, processes_map, ignoreENVCheck);
}

function reportErr(req, res) {
    return co(function* () {
        //console.log(req.body.docStr);
        return {};
    });
}

function userLogin(req, res) {
    //userLogin(req.body.account,req.body.password);
    return co(function* () {
        if (req.session.logRsaPrivateKeyPem == null) {
            return { err: { info: 'session中断，请刷新页面' } };
        }
        if (req.body.account == null || req.body.password == null) {
            return { err: { info: '参数非法' } };
        }

        var privateKey = forge.pki.privateKeyFromPem(req.session.logRsaPrivateKeyPem);
        var realAccount = privateKey.decrypt(req.body.account);
        var realPassword = privateKey.decrypt(req.body.password);
        var sql = 'select 用户登录密码,员工登记姓名代码,登录锁定状态 from V123A有效用户密码 where 用户登录名称=@name';
        var queryRet = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('name', sqlTypes.NVarChar(100), realAccount)]);
        if (queryRet.recordset.length == 0) {
            return { err: { info: '账号不存在' } };
        }
        var accountRow = queryRet.recordset[0];
        sql = "select 随机标识令牌,钉钉标识 from T122C用户登录名称 where 员工登记姓名代码=" + accountRow.员工登记姓名代码;
        queryRet = yield dbhelper.asynQueryWithParams(sql);
        var logAccountRow = queryRet.recordset[0];
        var theMd5 = new MD5().update(logAccountRow.随机标识令牌 + realPassword).digest('hex');
        if (theMd5.toUpperCase() != accountRow.用户登录密码.toUpperCase()) {
            return { err: { info: '密码错误' } };
        }
        if (accountRow.登录锁定状态 == '1') {
            return { err: { info: '账号被锁定了' } };
        }
        var clientIp = req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress || '';
        if (clientIp.split(',').length > 0) {
            clientIp = clientIp.split(',')[0];
        }
        var logProRet = yield dbhelper.asynExcute('P121E钉钉用户直登',
            [dbhelper.makeSqlparam('userid', sqlTypes.NVarChar, logAccountRow.钉钉标识),
            dbhelper.makeSqlparam('userIP', sqlTypes.NVarChar, clientIp),],
            [
                dbhelper.makeSqlparam('errInfo', sqlTypes.NVarChar),
                dbhelper.makeSqlparam('logrcdid', sqlTypes.NVarChar),
            ]);
        if (logProRet.returnValue != '1') {
            return { err: { info: logProRet.output.errInfo } };
        }
        var logrcd = logProRet.output.logrcdid;
        var userData = yield dingHelper.aysnLoginfFromRcdID(logrcd, req, res);
        if (userData == null) {
            return { err: { info: '快捷登录失败' } };
        }

        return {
            info: '登录成功',
        };
    });
}

function readyLogin(req, res) {
    return co(function* () {
        if (req.session.logRsaPublicKeyPem == null) {
            rsa.generateKeyPair({ bits: 512, workers: 2 }, function (err, keypair) {
                req.session.logRsaPrivateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
                req.session.logRsaPublicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
                res.json({
                    data: {
                        publicKey: req.session.logRsaPublicKeyPem,
                    }
                });
            });
        }
        else {
            res.json({
                data: {
                    publicKey: req.session.logRsaPublicKeyPem,
                }
            });
        }
        return { banAutoReturn: true };
    });
}

function getMenu() {
    return co(function* () {
        var sql = 'SELECT [系统方案名称代码],[系统方案名称],[方案英文名称],[桌面端名称],[移动端名称],[是否列表可见],[完成确认状态],[系统流程名称],[系统流程简称] FROM [base1].[dbo].[V002C系统方案名称] where [是否列表可见] = 1 and [终止确认状态] = 0';
        var ret = yield dbhelper.asynQueryWithParams(sql);
        return ret.recordset;
    });
}


module.exports = process;