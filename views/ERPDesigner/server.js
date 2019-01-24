const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");
const forge = require("node-forge");
const child_process = require('child_process');
var httpApp = null;
var appErpPageCache = null;

var fileLocker = {};
const FileName_Projects = 'projects';

var rsa = forge.pki.rsa;
const baseFileDir = 'public/erpdesigner/files/';


function lockFile(fileName) {
    if (fileLocker[fileName] == null) {
        fileLocker[fileName] = 0;
    }
    fileLocker[fileName]++;
}

function unlockFile(fileName) {
    fileLocker[fileName]--;
}

function isLock(fileName) {
    return fileLocker[fileName] != null && fileLocker[fileName] > 0;
}

function process(req, res, next, app, erpPageCache) {
    if(httpApp == null)
        httpApp = app;
    if(appErpPageCache == null)
        appErpPageCache = erpPageCache;        
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            if (data.err) {
                rlt.err = data.err;
            }
            else if (data.banAutoReturn) {
                return;
            }
            else {
                rlt.data = data;
            }
            res.json(rlt);
        })
        .catch(err => {
            rlt.err = {
                info: err.message
            };
            res.json(rlt);
            console.error(rlt);
        })
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'syndata_bykeyword':
            return syndata_bykeyword(req.body.keyword);
        case 'syndata_bycodes':
            return GetEntityInfo(req.body.codes_arr);
        case 'getProjectsJson':
            return getProjectsJson();
        case 'createProject':
            return createProject(req.body.title);
        case 'login':
            return userLogin(req, res, req.body.account, req.body.password);
        case 'loginUseCoockie':
            return loginUseCoockie(req);
        case 'getPreLogData':
            return getPreLogData(req, res);
        case 'saveProject':
            return saveProject(req, req.body.projJson);
        case 'getProjectProfile':
            return getProjectProfile(req);
        case 'publishProject':
            return publishProject(req, res);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}

function saveProject(req, projJson) {
    return co(function* () {
        var userData = yield getUserData(req);
        if (userData == null) {
            return { err: { info: '你还没有登录' } };
        }
        if (projJson == null) {
            return { err: { info: '没有提供项目文件' } };
        }
        title = projJson.attr.title;
        if (title == null) {
            title = '';
        }
        else {
            title = title.trim();
        }
        if (title.length < 4 || title.length > 20) {
            return { err: { info: '方案title长度不合法' } };
        }
        if (isLock(FileName_Projects)) {
            return { err: { info: '服务端文件锁定中，请稍后再试' } };
        }
        var rlt = {};
        lockFile(FileName_Projects);
        try {
            var allProjJson = yield getProjectsJson();
            var projItem = null;
            if (allProjJson.projects == null) {
                allProjJson.projects = [];
            }
            else {
                projItem = allProjJson.projects.find(item => {
                    return item.title == title;
                });
            }
            if (projItem == null) {
                projItem = {
                    createTime: new Date(),
                    creator: userData.name,
                    creatorID: userData.id,
                    title: title,
                };
                allProjJson.projects.push(projItem);
            }
            if (projItem.history == null) {
                projItem.history = [];
            }
            projItem.history.push({
                name: userData.name,
                id: userData.name,
                time: new Date(),
            });

            if (!fs.existsSync(baseFileDir))
                fs.mkdirSync(baseFileDir);

            var projDirPath = baseFileDir + 'proj/';
            if (!fs.existsSync(projDirPath))
                fs.mkdirSync(projDirPath);
            var projFilePath = projDirPath + title + ".json";
            fs.writeFileSync(projFilePath, JSON.stringify(projJson));

            var filePath = baseFileDir + "projects.json";
            fs.writeFileSync(filePath, JSON.stringify(allProjJson));
            rlt = projItem;

            // save real proj json file
        }
        catch (err) {
            rlt.err = { info: err.toString() };
        }
        finally {
            unlockFile(FileName_Projects);
        }

        return rlt;
    });
}

function userLogin(req, res, account, password) {
    return co(function* () {
        if (req.session.logRsaPrivateKeyPem == null) {
            return { err: { info: 'session中断，请刷新页面' } };
        }
        if (account == null || password == null) {
            return { err: { info: '参数非法' } };
        }
        var privateKey = forge.pki.privateKeyFromPem(req.session.logRsaPrivateKeyPem);
        var realAccount = privateKey.decrypt(account);
        var realPassword = privateKey.decrypt(password);

        var sql1 = 'SELECT [账号记录代码],[账号名称],[权属姓名],[账号密码],[是否有效],[账号盐] FROM [designer].[dbo].[T账号记录] where [账号名称]=@account';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql1, [dbhelper.makeSqlparam('account', sqlTypes.NVarChar, realAccount)]);
        if (rcdRlt.recordset.length == 0) {
            return { err: { info: '账号不存在' } };
        }
        var accountRow = rcdRlt.recordset[0];
        if (accountRow.是否有效 == '0') {
            return { err: { info: '账号无效了' } };
        }
        var midPassword = accountRow.账号盐 + realPassword;
        var md = forge.md.md5.create();
        md.update(midPassword);
        var md5Password = md.digest().toHex();
        if (md5Password != accountRow.账号密码) {
            return { err: { info: '密码错误' } };
        }

        var logProRet = yield dbhelper.asynExcute('[designer].[dbo].[P用户登录]'
            , [dbhelper.makeSqlparam('账号记录代码', sqlTypes.Int, accountRow.账号记录代码)]
            , [dbhelper.makeSqlparam('登录标识', sqlTypes.NVarChar(36))]
        );
        if (logProRet.output.登录标识 == null) {
            return { err: { info: '登录过程失败' } };
        }
        res.cookie('_designerlogRcdId', logProRet.output.登录标识, { signed: true, maxAge: 259200000, httpOnly: true });
        return {
            name: accountRow.权属姓名,
            id: accountRow.账号记录代码,
        };
    });
}

function getProjectProfile(req) {
    return co(function* () {
        var userData = yield getUserData(req);
        if (userData == null) {
            return { err: { info: '你还没有登录' } };
        }
        var projTitle = req.body.projTitle;
        var sql = 'SELECT [系统方案名称代码],[方案英文名称],系统流程简称,当前版本 FROM [base1].[dbo].[V002C系统方案名称] where [系统方案名称] = @name and 终止确认状态=0';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('name', sqlTypes.NVarChar, projTitle)]);
        if (rcdRlt.recordset.length == 0) {
            return { err: { info: '本项目未在系统中注册' } };
        }
        return {
            enName:rcdRlt.recordset[0]['方案英文名称'],
            code:rcdRlt.recordset[0]['系统方案名称代码'],
            flowName:rcdRlt.recordset[0]['系统流程简称'],
            version:rcdRlt.recordset[0]['当前版本'],
        };
    });
}

function getUserData(req) {
    return co(function* () {
        if (req.session.userData == null) {
            var userData = yield loginUseCoockie(req);
            if (userData.err != null) {
                return null;
            }
        }
        return req.session.userData;
    });
}

function loginUseCoockie(req) {
    return co(function* () {
        var _designerlogRcdId = req.signedCookies._designerlogRcdId;
        if (_designerlogRcdId == null) {
            return { err: { info: '无cookie' } };
        }
        var sql = 'select * from [designer].[dbo].FT查询登录记录(@记录标识)';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('记录标识', sqlTypes.NVarChar, _designerlogRcdId)]);
        if (rcdRlt.recordset.length == 0) {
            return { err: { info: 'cookie失效' } };
        }
        var accountRow = rcdRlt.recordset[0];
        var rlt = {
            name: accountRow.权属姓名,
            id: accountRow.账号记录代码,
        };
        req.session.userData = rlt;
        return rlt;
    });
}

function getPreLogData(req, res) {
    return co(function* () {
        if (req.session.logRsaPublicKeyPem == null) {
            rsa.generateKeyPair({ bits: 512, workers: 2 }, function (err, keypair) {
                //var t = keypair.publicKey.encrypt('abc');
                //var g = keypair.privateKey.decrypt(t);
                //logRsaKeypair = keypair;
                //req.session.logRsaKeypair = keypair;
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


function getDataTable(tableName) {
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("select * from " + tableName, null);
        return rcdRlt.recordset;
    });
}

function createProject(title, creator) {
    return co(function* () {
        if (creator == null) {
            creator = 0;
        }
        if (title == null) {
            return { err: { info: 'no title' } };
        }
        title = title.trim();
        if (title.length < 4 || title.length > 20) {
            return { err: { info: 'title长度不合法' } };
        }
        if (isLock(FileName_Projects)) {
            return { err: { info: '文件锁定中，请稍后再试' } };
        }
        var rlt = {};
        lockFile(FileName_Projects);
        try {
            var projJson = yield getProjectsJson();
            if (projJson.projects == null) {
                projJson.projects = [];
            }
            else {
                var nowItem = projJson.projects.find(item => {
                    return item.title == title;
                });
                if (nowItem != null) {
                    return { err: { info: '同名项目已经存在' } };
                }
            }
            var newProj = {
                title: title,
                creator: creator,
                createTime: new Date(),
            };
            projJson.projects.push(newProj);
            var dirPath = "public/erpdesigner/files/";
            var filePath = dirPath + "projects.json";
            if (!fs.existsSync(dirPath))
                fs.mkdirSync(dirPath);
            fs.writeFileSync(filePath, JSON.stringify(projJson));
            rlt = newProj;
        }
        catch (err) {
            rlt.err = err;
        }
        finally {
            unlockFile(FileName_Projects);
        }
        return rlt;
    });
}

function getProjectsJson() {
    return co(function* () {
        var filePath = "public/erpdesigner/files/projects.json";
        try {
            var rlt = null;
            if (fs.existsSync(filePath)) {
                rlt = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            else {
                return { projects: [] };
            }
            return rlt;
        }
        catch (err) {
            throw err;
        }
    });
}

function syndata_bykeyword(keyword) {
    return co(function* () {
        if (keyword[0] != '%') {
            keyword = "%" + keyword;
        }
        if (keyword[keyword.Length - 1] != '%') {
            keyword = keyword + "%";
        }
        var sql = "select 库内对象名称代码 from T000E库内对象名称 where 终止确认状态=0 and 库内对象名称 like @param";

        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('param', sqlTypes.NVarChar, keyword)]);
        if (rcdRlt.recordset.length == 0) {
            return [];
        }
        var entitiesCode_arr = rcdRlt.recordset.map(r => { return r.库内对象名称代码 });
        var GetEntityInfoRlt = yield GetEntityInfo(entitiesCode_arr);
        return GetEntityInfoRlt;
    });
}

function GetEntityInfo(codes_arr) {
    return co(function* () {
        var rlt = [];
        var inParams_arr = codes_arr.map((item, i) => { return '@p' + i });
        var inParamsStr = inParams_arr.join(",");

        var sql = "select 库内对象名称,库内对象名称代码,功能模块名称代码 from V001A库内对象名称 where 终止确认状态=0 and 库内对象名称代码 in (" + inParamsStr + ")";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, codes_arr.map((item, i) => { return dbhelper.makeSqlparam('P' + i, sqlTypes.NVarChar, item) }));

        var 目标库内对象_dic = {};
        //var t = yield WriteEntity(rcdRlt.recordset[0], 目标库内对象_dic);

        rlt = yield rcdRlt.recordset.map(entity_dr => {
            return WriteEntity(entity_dr, 目标库内对象_dic);
        });

        return rlt;
    });
}

function WriteEntity(库内对象_dr, 目标库内对象_dic) {
    return co(function* () {
        var 库内对象名称 = 库内对象_dr.库内对象名称;
        目标库内对象_dic[库内对象名称] = 库内对象_dr;

        var sql = "select id, name, xtype from sysobjects where name = '" + 库内对象名称 + "'";
        var 库内对象Sysinfo_dt = yield dbhelper.asynQueryWithParams(sql, null);
        if (库内对象Sysinfo_dt.recordset.length == 0) {
            return;
        }
        var 库内对象Sysinfo_dr = 库内对象Sysinfo_dt.recordset[0];
        var 库内对象sysid = 库内对象Sysinfo_dr.id;

        var xtype = 库内对象Sysinfo_dr.xtype.trim();
        if (xtype == "PC")
            xtype = "P";
        var 库内对象Tag = xtype;
        switch (xtype) {
            case "IF":
            case "TF":
            case "FT":
                库内对象Tag = "FT";
                break;
            case "FN":
            case "FS":
                库内对象Tag = "FB";
                break;
        }
        var objCode = 库内对象_dr.库内对象名称代码;
        var 库内对象obj = {
            name: 库内对象名称,
            code: objCode,
            type: 库内对象Tag,
            fmCode: 库内对象_dr.功能模块名称代码,
            columns: [],
            params: []
        }

        sql = "select object_id as id,name, is_identity, is_nullable from sys.all_columns where object_id = " + 库内对象sysid;
        var 列信息_dt = yield dbhelper.asynQueryWithParams(sql, null);

        sql = "select PARAMETER_NAME 参数名,DATA_TYPE 值类型,IS_RESULT 作为结果,ORDINAL_POSITION 位置,PARAMETER_MODE 通讯模式 from INFORMATION_SCHEMA.PARAMETERS where SPECIFIC_NAME='" + 库内对象名称 + "'";
        var 参数信息_dt = yield dbhelper.asynQueryWithParams(sql, null);

        //DataTable columnDT = Column(theName);
        if (列信息_dt.recordset.length == 0 && 参数信息_dt.recordset.length == 0) {
            return;   // 无列信息
        }
        var isP = 库内对象名称[0] == 'P';
        if (列信息_dt.recordset.length > 0) {
            sql = "select COLUMN_NAME as 列名称,COLUMN_DEFAULT as 默认值,DATA_TYPE as 值类型 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='" + 库内对象名称 + "'";
            var 列模式信息_dt = yield dbhelper.asynQueryWithParams(sql, null);
            var 列模式信息_dic = {};
            列模式信息_dt.recordset.forEach(temDr => {
                列模式信息_dic[temDr.列名称] = temDr;
            });
            列信息_dt.recordset.forEach(columDR => {
                var columnName = columDR.name;
                var Columns = {};
                Columns.name = columnName;
                if (columDR.is_identity) {
                    Columns.is_identity = true;
                }
                if (columDR.is_nullable) {
                    Columns.is_nullable = true;
                }
                库内对象obj.columns.push(Columns);

                var 列模式_dr = 列模式信息_dic[columnName];
                if (列模式_dr != null) {
                    var 默认值 = 列模式_dr.默认值;
                    if (默认值 && 默认值.Length > 0) {
                        while (默认值[0] == '(') {
                            默认值 = 默认值.Substring(1, 默认值.Length - 2);
                        }
                        Columns.cdefault = 默认值;
                    }
                    Columns.cvalType = 列模式_dr.值类型;
                }
            });
        }

        if (参数信息_dt.recordset.length > 0) {
            参数信息_dt.recordset.forEach(pram_dr => {
                var 作为结果 = pram_dr.作为结果 == "YES";
                var paramElem = { isreturn: 作为结果 };
                库内对象obj.params.push(paramElem);
                paramElem.cvalType = pram_dr.值类型;
                if (!作为结果) {
                    paramElem.position = pram_dr.位置;
                    paramElem.mod = pram_dr.通讯模式;
                    paramElem.name = pram_dr.参数名;
                }
            });
        }
        return 库内对象obj;
    });
}

function publishProject(req, res){
    return co(function* () {
        var userData = yield getUserData(req);
        if (userData == null) {
            return { err: { info: '你还没有登录' } };
        }
        var compileResult = req.body.compileResult;
        var projTitle = req.body.projTitle;
        if(compileResult == null){
            return {err:{info:'no compileResult'}};
        }
        if(projTitle == null){
            return {err:{info:'no projTitle'}};
        }
        var projProfile = yield getProjectProfile(req);
        if(projProfile.err != null){
            return projProfile;
        }
        if(compileResult.mobilePart == null && compileResult.pcPart == null){
            return {err:{info:'no part content'}};
        }
        var clientJsSrcDir = 'public/src/views/erp/pages/';
        var clientJsOutputDir = 'public/js/views/erp/pages/';
        if (!fs.existsSync(clientJsSrcDir))
        {
            fs.mkdirSync(clientJsSrcDir);
        }
        if (!fs.existsSync(clientJsOutputDir))
        {
            fs.mkdirSync(clientJsOutputDir);
        }
        
        var newVersion = parseInt(projProfile.version) + 1;

        var jsMobileClientName = '';
        var jsMobileClientPath = '';
        var jsPCClientName = '';
        var jsPCClientPath = '';
        var jsServerName = '';
        var jsServerPath = '';
        var modifyRecordID = 0;

        var hostDir = httpApp.get('hostDirName') + '/';
        if(compileResult.mobilePart != null){
            if(compileResult.mbLayoutName == null || compileResult.mbLayoutName.length == 0){
                return {err:{info:'no mbLayoutName'}};
            }
            jsMobileClientName = projProfile.flowName + projProfile.enName + '_mb_' + newVersion;
            jsMobileClientPath = clientJsSrcDir + jsMobileClientName + ".js";
            fs.writeFileSync(jsMobileClientPath, compileResult.mobilePart);

            var srcJsPath = hostDir + jsMobileClientPath;
            var outputJsPath = hostDir + clientJsOutputDir + jsMobileClientName + ".js";
            var execPath = 'npx babel '+ srcJsPath + ' --out-file ' + outputJsPath;
            child_process.exec(execPath,function (error, stdout, stderr) {
                var info = 'OK';
                if (error !== null) {
                    info = error.toString();
                    console.log('exec error: ' + error);
                }
                
            });
        }

        if(compileResult.pcPart != null){
            if(compileResult.pcLayoutName == null || compileResult.pcLayoutName.length == 0){
                return {err:{info:'no pcLayoutName'}};
            }
            jsPCClientName = projProfile.flowName + projProfile.enName + '_pc_' + newVersion;
            jsPCClientPath = clientJsSrcDir + jsPCClientName + ".js";
            fs.writeFileSync(jsPCClientPath, compileResult.pcPart);

            var srcJsPath = hostDir + jsPCClientName;
            var outputJsPath = hostDir + clientJsOutputDir + jsPCClientName + ".js";
            var execPath = 'npx babel '+ srcJsPath + ' --out-file ' + outputJsPath;
            child_process.exec(execPath,function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        }

        if(compileResult.serverPart != null){
            jsServerName = projProfile.enName + '_s' + newVersion;
            jsServerPath = 'views/erppage/server/pages/' + jsServerName + ".js";
            fs.writeFileSync(jsServerPath, compileResult.serverPart);
        }
        
        var hostIP = httpApp.get('hostip') ;
        var hostPort = httpApp.get('port') ;
        var rcdRlt = yield dbhelper.asynExcute('P002E修改方案配置', [
            dbhelper.makeSqlparam('系统方案名称代码', sqlTypes.Int, projProfile.code),
            dbhelper.makeSqlparam('桌面端名称', sqlTypes.NVarChar, jsPCClientName),
            dbhelper.makeSqlparam('移动端名称', sqlTypes.NVarChar, jsMobileClientName),
            dbhelper.makeSqlparam('移动端LN', sqlTypes.NVarChar, compileResult.mbLayoutName),
            dbhelper.makeSqlparam('桌面端LN', sqlTypes.NVarChar, compileResult.pcLayoutName),
            dbhelper.makeSqlparam('源地址ip', sqlTypes.NVarChar, hostIP),
            dbhelper.makeSqlparam('修改用户代码', sqlTypes.Int, userData.id),
            dbhelper.makeSqlparam('版本号', sqlTypes.Int, newVersion),
            dbhelper.makeSqlparam('后台名称', sqlTypes.NVarChar, jsServerName),
            ]);
        modifyRecordID = rcdRlt.returnValue;
        if(modifyRecordID == -1){
            return {err:{info:'数据库里有更新的文件版本，拒绝了你的修改请求'}};
        }

        appErpPageCache[projProfile.enName] = {
            mobileJsPath: jsMobileClientName,
            mobileLayoutName: compileResult.mbLayoutName,
            pcJsPath: jsPCClientName,
            pcLayoutName: compileResult.pcLayoutName,
            serverName: jsServerName,
            title:projTitle,
        }

        if(compileResult.mobilePart != null){
            var srcJsPath = hostDir + jsMobileClientPath;
            var outputJsPath = hostDir + clientJsOutputDir + jsMobileClientName + ".js";
            var execPath = 'npx babel '+ srcJsPath + ' --out-file ' + outputJsPath;
            child_process.exec(execPath,function (error, stdout, stderr) {
                var info = 'OK';
                if (error !== null) {
                    info = error.toString();
                    console.log('exec error: ' + error);
                }
                dbhelper.asynExcute('P002E报告编译结果', [
                    dbhelper.makeSqlparam('方案修改记录代码', sqlTypes.Int, modifyRecordID),
                    dbhelper.makeSqlparam('移动端', sqlTypes.Bit, 1),
                    dbhelper.makeSqlparam('结果', sqlTypes.NVarChar, info),
                ]);
            });
        }

        if(compileResult.pcPart != null){
            var srcJsPath = hostDir + jsPCClientName;
            var outputJsPath = hostDir + clientJsOutputDir + jsPCClientName + ".js";
            var execPath = 'npx babel '+ srcJsPath + ' --out-file ' + outputJsPath;
            child_process.exec(execPath,function (error, stdout, stderr) {
                var info = 'OK';
                if (error !== null) {
                    info = error.toString();
                    console.log('exec error: ' + error);
                }
                dbhelper.asynExcute('P002E报告编译结果', [
                    dbhelper.makeSqlparam('方案修改记录代码', sqlTypes.Int, modifyRecordID),
                    dbhelper.makeSqlparam('移动端', sqlTypes.Bit, 0),
                    dbhelper.makeSqlparam('结果', sqlTypes.NVarChar, info),
                ]);
            });
        }

        var pageMobileUrl = 'http://' + hostIP + ':' + hostPort + '/erppage/mb/' + projProfile.enName;
        var pagePcUrl = 'http://' + hostIP + ':' + hostPort + '/erppage/pc/' + projProfile.enName;
        
        return {
            mobileUrl:pageMobileUrl,
            pcUrl:pagePcUrl,
        };
    });
}

module.exports = process;