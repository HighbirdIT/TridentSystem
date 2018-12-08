const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");
const forge = require("node-forge");

var fileLocker = {};
const FileName_Projects = 'projects';

var rsa = forge.pki.rsa;
/*
rsa.generateKeyPair({bits: 512, workers: 2}, function(err, keypair) {
    //var t = keypair.publicKey.encrypt('abc');
    //var g = keypair.privateKey.decrypt(t);
    logRsaKeypair = keypair;
});
*/


function lockFile(fileName){
    if(fileLocker[fileName] == null){
        fileLocker[fileName] = 0;
    }
    fileLocker[fileName]++;
}

function unlockFile(fileName){
    fileLocker[fileName]--;
}

function isLock(fileName){
    return fileLocker[fileName] != null && fileLocker[fileName] > 0;
}

function process(req, res, next) {
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            if(data.err){
                rlt.err = data.err;
            }
            else if(data.banAutoReturn){
                return;
            }
            else{
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
            return userLogin(req,res,req.body.account,req.body.password);
        case 'loginUseCoockie':
            return loginUseCoockie(req);
        case 'getPreLogData':
            return getPreLogData(req, res);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}

function userLogin(req,res,account, password){
    return co(function* () {
        if(req.session.logRsaPrivateKeyPem == null){
            return {err:{info:'session中断，请刷新页面'}};
        }
        if(account == null || password == null){
            return {err:{info:'参数非法'}};
        }
        var privateKey = forge.pki.privateKeyFromPem(req.session.logRsaPrivateKeyPem);
        var realAccount = privateKey.decrypt(account);
        var realPassword = privateKey.decrypt(password);

        var sql1 = 'SELECT [账号记录代码],[账号名称],[权属姓名],[账号密码],[是否有效],[账号盐] FROM [designer].[dbo].[T账号记录] where [账号名称]=@account';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql1, [dbhelper.makeSqlparam('account', sqlTypes.NVarChar, realAccount)]);
        if (rcdRlt.recordset.length == 0) {
            return {err:{info:'账号不存在'}};
        }
        var accountRow = rcdRlt.recordset[0];
        if(accountRow.是否有效 == '0'){
            return {err:{info:'账号无效了'}};
        }
        var midPassword = accountRow.账号盐 + realPassword;
        var md = forge.md.md5.create();
        md.update(midPassword);
        var md5Password = md.digest().toHex();
        if(md5Password != accountRow.账号密码){
            return {err:{info:'密码错误'}};
        }

        var logProRet = yield dbhelper.asynExcute('[designer].[dbo].[P用户登录]'
                ,[dbhelper.makeSqlparam('账号记录代码', sqlTypes.Int, accountRow.账号记录代码)]
                ,[dbhelper.makeSqlparam('登录标识', sqlTypes.NVarChar(36))]
            );
        if(logProRet.output.登录标识 == null){
            return {err:{info:'登录过程失败'}};
        }
        res.cookie('_designerlogRcdId', logProRet.output.登录标识, {signed:true, maxAge:new Date(Date.now() + 259200000), httpOnly:true});
        return {
            name:accountRow.权属姓名,
            id:accountRow.账号记录代码,
        };
    });
}

function loginUseCoockie(req){
    return co(function* () {
        var _designerlogRcdId = req.signedCookies._designerlogRcdId;
        if(_designerlogRcdId == null){
            return {err:{info:'无cookie'}};
        }
        var sql = 'select * from [designer].[dbo].FT查询登录记录(@记录标识)';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('记录标识', sqlTypes.NVarChar, _designerlogRcdId)]);
        if(rcdRlt.recordset.length == 0){
            return {err:{info:'cookie失效'}};
        }
        var accountRow = rcdRlt.recordset[0];
        return {
            name:accountRow.权属姓名,
            id:accountRow.账号记录代码,
        };
    });
}

function getPreLogData(req, res){
    return co(function* () {
        if(req.session.logRsaPublicKeyPem == null){
            rsa.generateKeyPair({bits: 512, workers: 2}, function(err, keypair) {
                //var t = keypair.publicKey.encrypt('abc');
                //var g = keypair.privateKey.decrypt(t);
                //logRsaKeypair = keypair;
                //req.session.logRsaKeypair = keypair;
                req.session.logRsaPrivateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey); 
                req.session.logRsaPublicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
                res.json({data:{
                    publicKey: req.session.logRsaPublicKeyPem,
                }});
            });
        }
        else{
            res.json({data:{
                publicKey: req.session.logRsaPublicKeyPem,
            }});
        }
        return {banAutoReturn:true};
    });
}


function getDataTable(tableName) {
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("select * from " + tableName, null);
        return rcdRlt.recordset;
    });
}

function createProject(title,creator){
    return co(function* () {
        if(creator == null){
            creator = 0;
        }
        if(title == null){
            return {err:{info:'no title'}};
        }
        title = title.trim();
        if(title.length < 4 || title.length > 20){
            return {err:{info:'title长度不合法'}};
        }
        if(isLock(FileName_Projects)){
            return {err:{info:'文件锁定中，请稍后再试'}};
        }
        var rlt = {};
        lockFile(FileName_Projects);
        try
        {
            var projJson = yield getProjectsJson();
            if(projJson.projects == null){
                projJson.projects = [];
            }
            else{
                var nowItem = projJson.projects.find(item=>{
                    return item.title == title;
                });
                if(nowItem != null){
                    return {err:{info:'同名项目已经存在'}};
                }
            }
            var newProj = {
                title:title,
                creator:creator,
                createTime:new Date(),
            };
            projJson.projects.push(newProj);
            var dirPath = "public/erpdesigner/files/";
            var filePath = dirPath + "projects.json";
            if(!fs.existsSync(dirPath))
                fs.mkdirSync(dirPath);
            fs.writeFileSync(filePath, JSON.stringify(projJson));
            rlt = newProj;
        }
        catch(err){
            rlt.err = err;
        }
        finally{
            unlockFile(FileName_Projects);
        }
        return rlt;
    });
}

function getProjectsJson(){
    return co(function* () {
        var filePath = "public/erpdesigner/files/projects.json";
        try{
            var rlt = null;
            if(fs.existsSync(filePath))
            {
                rlt = JSON.parse(fs.readFileSync(filePath,'utf8'));
            }
            else{
                return {projects:[]};
            }
            return rlt;
        }
        catch(err){
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
        var inParams_arr = codes_arr.map((item,i)=>{return '@p' + i});
        var inParamsStr = inParams_arr.join(",");

        var sql = "select 库内对象名称,库内对象名称代码,功能模块名称代码 from V001A库内对象名称 where 终止确认状态=0 and 库内对象名称代码 in (" + inParamsStr +")";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, codes_arr.map((item,i)=>{return dbhelper.makeSqlparam('P' + i, sqlTypes.NVarChar, item)}));

        var 目标库内对象_dic = {};
        //var t = yield WriteEntity(rcdRlt.recordset[0], 目标库内对象_dic);
        
        rlt = yield rcdRlt.recordset.map(entity_dr=>{
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
                var is_identity = columDR.is_identity;
                if (is_identity == "True") {
                    Columns.is_identity = is_identity;
                }
                var is_nullable = columDR.is_nullable;
                if (is_nullable == "True") {
                    Columns.is_nullable = is_nullable;
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

module.exports = process;