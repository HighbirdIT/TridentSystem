const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
var co = require('co');
var fs = require('fs');
var uuid = require('uuid');
const sqlTypes = dbhelper.Types;
var path = require("path");
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;

const EFileSystemError = {
    WRONGSTART: 1001,
    UPLOADCOMPLATE: 1002,
    EMPTYDATA: 1003,
    DATATOOLONG: 1004,
    FILELOCKED: 1005,
};

const gFileHouseRootPath = 'public/filehouse/';

var fileSystem = {
    FileHouseRootPath: gFileHouseRootPath
};
var fileLocker = {};

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

function guid2() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function getUserID(req) {
    if (req.headers['user-agent'] == 'python_fileuploader') {
        return 0;
    }
    return req.session.g_envVar.userid;
}

fileSystem.process = (req, res, next) => {
    serverhelper.commonProcess(req, res, next, processes_map);
};

fileSystem.deleteAttachment = (req, res) => {
    var bundle = req.body.bundle;
    if (isNaN(bundle.附件id)) {
        return '没有指定附件';
    }
    return co(function* () {
        var inparams_arr = [
            dbhelper.makeSqlparam('附件id', sqlTypes.Int, bundle.附件id),
            dbhelper.makeSqlparam('userid', sqlTypes.Int, req.session.g_envVar.userid),
        ];
        var ret;
        try {
            ret = yield dbhelper.asynGetScalar('update [TB00C附件记录] set [终止确认状态]=1,[终止确认时间]=getdate(),[终止确认用户]=@userid where [附件记录代码]=@附件id', inparams_arr);
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        return { jobdone: 1 };
    });
};

fileSystem.applyForTempFile = (req, res) => {
    var userid = getUserID(req);
    var bundle = req.body.bundle;
    return co(function* () {
        var inparams_arr = [
            dbhelper.makeSqlparam('文件名称', sqlTypes.NVarChar(100), bundle.name),
            dbhelper.makeSqlparam('文件大小', sqlTypes.Int, bundle.size),
            dbhelper.makeSqlparam('操作用户', sqlTypes.Int, userid),
            dbhelper.makeSqlparam('文件类型', sqlTypes.NVarChar(100), bundle.type),
            dbhelper.makeSqlparam('电子指纹', sqlTypes.NVarChar(200), bundle.md5),
        ];
        var ret;
        try {
            ret = yield dbhelper.asynExcute('PB00E创建上传文件', inparams_arr, [dbhelper.makeSqlparam("文件令牌", sqlTypes.NVarChar(50)), dbhelper.makeSqlparam("文件记录代码", sqlTypes.Int)]);
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        return { code: ret.output.文件记录代码, identity: ret.output.文件令牌 };
    });
};

fileSystem.uploadBlock = (req, res) => {
    var bundle = req.body.bundle;
    var fileIdentity = bundle.fileIdentity;
    var blockData = bundle.data;
    return co(function* () {
        var sql = "select * from [TB00C文件上传记录] where [文件令牌] = @identity";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('identity', sqlTypes.NVarChar(50), fileIdentity)]);
        if (rcdRlt.recordset.length == 0) {
            return serverhelper.createErrorRet('服务端文件记录不存在');
        }
        if (isLock(fileIdentity)) {
            return serverhelper.createErrorRet('文件锁定中', EFileSystemError.FILELOCKED);
        }
        lockFile(fileIdentity);
        var fd = null;
        try {
            var fileRecord = rcdRlt.recordset[0];
            var fileFullName = fileIdentity;
            if (fileRecord.文件后缀.length > 0) {
                fileFullName += '.' + fileRecord.文件后缀;
            }
            var belongDirPath = fileRecord.创建时间.getFullYear() + '_' + (fileRecord.创建时间.getMonth() + 1);
            if (fileRecord.已上传大小 == fileRecord.文件大小) {
                return {
                    bytesWritten: fileRecord.文件大小 - bundle.startPos,
                    previewUrl: '/filehouse/' + belongDirPath + '/' + fileFullName
                };
            }
            var targetDirPath = path.join(__dirname, gFileHouseRootPath, belongDirPath);
            if (!fs.existsSync(targetDirPath)) {
                fs.mkdirSync(targetDirPath);
            }
            var targetFilePath = path.join(targetDirPath, fileFullName);
            var nowFileSize = 0;
            fd = fs.openSync(targetFilePath, 'a');
            if (fs.existsSync(targetFilePath)) {
                var fileStats = fs.statSync(targetFilePath);
                nowFileSize = fileStats.size;
            }
            if (nowFileSize != bundle.startPos) {
                return serverhelper.createErrorRet('起点错误', EFileSystemError.WRONGSTART, nowFileSize);
            }
            if (blockData == null || typeof blockData != 'string' || blockData.length == 0) {
                return serverhelper.createErrorRet('块数据不可为空', EFileSystemError.EMPTYDATA);
            }
            if ((fileRecord.已上传大小 + (blockData.length) / 2) > fileRecord.文件大小) {
                return serverhelper.createErrorRet('块数据长度不合法', EFileSystemError.DATATOOLONG);
            }
            var blockBuf = new Buffer(blockData, 'hex');

            var bytesWritten = fs.writeSync(fd, blockBuf, 0, blockBuf.length, bundle.startPos);

            var inparams_arr = [
                dbhelper.makeSqlparam('临时文件令牌', sqlTypes.NVarChar(100), fileIdentity),
                dbhelper.makeSqlparam('已上传文件大小', sqlTypes.Int, nowFileSize + bytesWritten),
                dbhelper.makeSqlparam('操作用户', sqlTypes.Int, req.session.g_envVar.userid),
                dbhelper.makeSqlparam('归属流程代码', sqlTypes.Int, bundle.fileFlow == null ? 0 : bundle.fileFlow),
                dbhelper.makeSqlparam('关联记录代码', sqlTypes.Int, bundle.relrecordid == null ? 0 : bundle.relrecordid),
            ];
            var outparams_arr = [
                dbhelper.makeSqlparam('附件记录代码', sqlTypes.Int)
            ];
            var proRet;
            try {
                proRet = yield dbhelper.asynExcute('PB00E同步文件信息', inparams_arr, outparams_arr);
            }
            catch (eo) {
                return serverhelper.createErrorRet(eo.message);
            }

            var rlt = {
                bytesWritten: bytesWritten,
                attachmentID: proRet.output.附件记录代码,
            };
            if (nowFileSize + bytesWritten >= fileRecord.文件大小) {
                rlt.previewUrl = '/filehouse/' + belongDirPath + '/' + fileFullName;
            }

            return rlt;
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        finally {
            unlockFile(fileIdentity);
            if (fd) {
                fs.closeSync(fd);
                fd = null;
            }
        }
    });
};

fileSystem.downloadBlock = (req, res) => {
    var bundle = req.body;
    var fileIdentity = bundle.fileIdentity ? bundle.fileIdentity : bundle.fileidentity;
    var startPos = parseInt(bundle.startPos == null ? bundle.startpos : bundle.startPos);
    return co(function* () {
        var sql = "select * from [TB00C文件上传记录] where [文件令牌] = @identity";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('identity', sqlTypes.NVarChar(50), fileIdentity)]);
        if (rcdRlt.recordset.length == 0) {
            return serverhelper.createErrorRet('服务端文件记录不存在');
        }
        var fd = null;
        try {
            var fileRecord = rcdRlt.recordset[0];
            var fileFullName = fileIdentity;
            if (fileRecord.文件后缀.length > 0) {
                fileFullName += '.' + fileRecord.文件后缀;
            }
            var belongDirPath = fileRecord.创建时间.getFullYear() + '_' + (fileRecord.创建时间.getMonth() + 1);
            var targetDirPath = path.join(__dirname, gFileHouseRootPath, belongDirPath);
            var targetFilePath = path.join(targetDirPath, fileFullName);
            if (!fs.existsSync(targetFilePath)) {
                return serverhelper.createErrorRet('服务端文件不存在');
            }
            if (startPos >= fileRecord.文件大小) {
                return serverhelper.createErrorRet('startPos 错误', EFileSystemError.DATATOOLONG);
            }
            fd = fs.openSync(targetFilePath, 'r');
            var lastSize = fileRecord.文件大小 - startPos;
            var maxRead = 1024 * 10;
            var needRead = lastSize < maxRead ? lastSize : maxRead;
            var blockBuf = new Buffer(needRead);

            var bytesRead = fs.readSync(fd, blockBuf, 0, needRead, startPos);
            var rlt = {
                nextPos: startPos + bytesRead,
                hexData: blockBuf.toString('hex'),
                totalSize: fileRecord.文件大小
            };
            
            return rlt;
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        finally {
            if (fd) {
                fs.closeSync(fd);
                fd = null;
            }
        }
    });
};

fileSystem.getFileRecord = (req, res) => {
    var bundle = req.body.bundle;
    return co(function* () {
        var rcdRlt = null;
        if(bundle.fileIdentity && bundle.fileIdentity.length == 36){
            rcdRlt = yield dbhelper.asynQueryWithParams("select * from [FTB00E文件信息Ex](@文件令牌)",
            [
                dbhelper.makeSqlparam('文件令牌', sqlTypes.NVarChar(50), bundle.fileIdentity)
            ]);
        }
        else{
            rcdRlt = yield dbhelper.asynQueryWithParams("select * from FTB00E查找附件信息(@附件记录代码,@归属流程代码,@关联记录代码)",
            [
                dbhelper.makeSqlparam('附件记录代码', sqlTypes.Int, bundle.attachmentID == null ? 0 : bundle.attachmentID),
                dbhelper.makeSqlparam('归属流程代码', sqlTypes.Int, bundle.fileFlow == null ? 0 : bundle.fileFlow),
                dbhelper.makeSqlparam('关联记录代码', sqlTypes.Int, bundle.relrecordid == null ? 0 : bundle.relrecordid),
            ]);
        }
        
        if (rcdRlt.recordset.length == 0) {
            return null;
        }
        return rcdRlt.recordset[0];
    });
};

fileSystem.queryExcelFileState = (req, res) => {
    var bundle = req.body.bundle;
    if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
    var fileIdentity = bundle.fileIdentity;
    if (fileIdentity == null) { return serverhelper.createErrorRet('缺少参数fileIdentity'); }
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("SELECT [记录令牌],[分享令牌],[生成状态],[状态说明] FROM [base1].[dbo].[T721C表格文件请求] where [记录令牌]=@记录令牌",
            [
                dbhelper.makeSqlparam('记录令牌', sqlTypes.NVarChar(100), fileIdentity),
            ]);
        if (rcdRlt.recordset.length == 0) {
            if (bundle == null) { return serverhelper.createErrorRet('指定文件未找到'); }
            return;
        }
        var row = rcdRlt.recordset[0];
        var rlt = {
            state: row['生成状态'],
            stateinfo: row['状态说明'],
        };
        if (rlt.state == 1) {
            rlt.url = '/download?excelid=' + fileIdentity + '&shareKey=' + row['分享令牌'];
        }
        return rlt;
    });
};

fileSystem.saveExcelJsonData = (name, json, bAutoIndex, bQuotePrefix, recordid, templateSetting) => {
    var jsonDirPath = path.join(__dirname, 'filedata');
    if (!fs.existsSync(jsonDirPath)) {
        fs.mkdirSync(jsonDirPath);
    }
    jsonDirPath = path.join(jsonDirPath, 'exceljson');
    if (!fs.existsSync(jsonDirPath)) {
        fs.mkdirSync(jsonDirPath);
    }
    var jsonFilePath = path.join(jsonDirPath, name + '.json');
    fs.writeFileSync(jsonFilePath, json);

    var excelFilePath = path.join(__dirname, 'filedata');
    if (!fs.existsSync(excelFilePath)) {
        fs.mkdirSync(excelFilePath);
    }
    excelFilePath = path.join(excelFilePath, 'excel');
    if (!fs.existsSync(excelFilePath)) {
        fs.mkdirSync(excelFilePath);
    }
    var scriptPath = path.join(__dirname, 'scripts/python/creatExcelFromJson.py');
    excelFilePath = path.join(excelFilePath, name + '.xlsx');
    var startPythonCmd;
    if (templateSetting.templatePath) {
        startPythonCmd = 'python3 -W ignore ' + templateSetting.scriptPath + ' ' + excelFilePath + ' ' + jsonFilePath + ' ' + templateSetting.templatePath;
    }
    else {
        startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + excelFilePath + ' ' + jsonFilePath + ' ' + (bAutoIndex == true ? '1' : '0') + ' ' + (bQuotePrefix == true ? '1' : '0');
    }
    exec(startPythonCmd, (error, stdout, stderr) => {
        var errmsg = error ? error.message : (stdout != 'OK' ? stdout : '');
        try {
            dbhelper.asynExcute('P721E处理结果报告',
                [dbhelper.makeSqlparam("错误描述", sqlTypes.NVarChar(2000), errmsg.substr(0, 2000)),
                dbhelper.makeSqlparam("文件请求代码", sqlTypes.Int, recordid),
                dbhelper.makeSqlparam("处理步骤", sqlTypes.Int, 1)]);
        }
        catch (eo) {
            serverhelper.InformSysManager(eo.message, 'fileSystem.saveExcelJsonData')
        }
        if (errmsg == '') {
            fs.unlink(jsonFilePath);
        }
    });
};

fileSystem.exportExcelFileFromJson = (req, res) => {
    var bundle = req.body.bundle;
    var g_envVar = req.session.g_envVar;
    return co(function* () {
        if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
        var title = bundle.title;
        if (title == null) { return serverhelper.createErrorRet('参数[title]传入值错误'); }
        var jsonData = bundle.data;
        if (jsonData == null) { return serverhelper.createErrorRet('参数[data]传入值错误'); }
        var 记录令牌 = serverhelper.guid2();
        var 分享令牌 = serverhelper.guid2();
        var templateCode = bundle.templateCode;
        var templateSetting = {};
        if (templateCode > 0) {
            var tempalteRcdRlt = yield dbhelper.asynQueryWithParams('SELECT 模板标识,脚本名称 FROM [base1].[dbo].[T721C表格模板记录] where [表格模板记录代码]=@id', [
                dbhelper.makeSqlparam('id', sqlTypes.Int, templateCode)
            ]);
            var templateFileExits = false;
            var scriptFileExits = true;
            var templateFilePath = '';
            var scriptPath = '';
            if (tempalteRcdRlt.recordset.length > 0) {
                var templateRcd = tempalteRcdRlt.recordset[0];
                templateFilePath = path.join(__dirname, 'filedata\\exceltemplate\\' + templateRcd['模板标识']);
                templateFileExits = fs.existsSync(templateFilePath);
                scriptPath = path.join(__dirname, 'scripts/python/' + templateRcd['脚本名称'] + '.py');
                scriptFileExits = fs.existsSync(scriptPath);
            }
            if (!templateFileExits) {
                return serverhelper.createErrorRet('模板文件不存在');
            }
            if (!scriptFileExits) {
                return serverhelper.createErrorRet('脚本文件不存在');
            }
            templateSetting.templatePath = templateFilePath;
            templateSetting.scriptPath = scriptPath;
        }
        try {
            var 记录代码 = yield dbhelper.asynGetScalar('INSERT INTO [dbo].[T721C表格文件请求](文件标题,记录令牌,请求用户,分享令牌) values(@title, @记录令牌, @_operator,@分享令牌)  select SCOPE_IDENTITY()',
                [
                    dbhelper.makeSqlparam('title', sqlTypes.NVarChar(100), title),
                    dbhelper.makeSqlparam('记录令牌', sqlTypes.NVarChar(50), 记录令牌),
                    dbhelper.makeSqlparam('_operator', sqlTypes.Int, g_envVar.userid),
                    dbhelper.makeSqlparam('分享令牌', sqlTypes.NVarChar(50), 分享令牌)
                ]);

            fileSystem.saveExcelJsonData(记录令牌, JSON.stringify(jsonData), bundle.bAutoIndex, bundle.bQuotePrefix, 记录代码, templateSetting);
            return 记录令牌;
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        return serverhelper.createErrorRet('创建文件失败');
    });
};

fileSystem.downloadExcelFile = (req, res) => {
    var excelid = req.query.excelid;
    var shareKey = req.query.shareKey;
    var userid = req.session && req.session.g_envVar ? req.session.g_envVar.userid : 0;
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("select [表格文件请求代码],[请求用户],[文件标题],[分享令牌],[分享时间] FROM [base1].[dbo].[T721C表格文件请求] where [记录令牌]=@记录令牌",
            [
                dbhelper.makeSqlparam('记录令牌', sqlTypes.NVarChar(100), excelid),
            ]);
        if (rcdRlt.recordset.length == 0) {
            res.setHeader("Content-Type", "text/plain;charset=utf-8");
            res.end("目标文件未找到");
            return;
        }
        var 下载类型 = '下载';
        var row = rcdRlt.recordset[0];
        if (row['请求用户'] != userid) {
            if (shareKey == row['分享令牌']) {
                if (serverhelper.DateFun.getDateDiff('时', row['分享时间'], new Date()) > 12) {
                    res.setHeader("Content-Type", "text/plain;charset=utf-8");
                    res.end("这个分享链接已失效");
                    return;
                }
                下载类型 = '分享';
            }
            else {
                res.setHeader("Content-Type", "text/plain;charset=utf-8");
                res.end("这个文件不是你的");
                return;
            }
        }
        var excelFilePath = path.join(__dirname, 'filedata/excel', excelid + '.xlsx');
        fs.readFile(excelFilePath, function (error, data) {
            if (error) {
                res.setHeader("Content-Type", "text/plain;charset=utf-8");
                res.end("文件读取失败");
            } else {
                res.setHeader("Content-Type", "application/vnd.ms-excel");
                res.setHeader('Content-Disposition', 'attachment;filename="' + encodeURIComponent(rcdRlt.recordset[0]['文件标题']) + '.xlsx"');
                res.end(data);
            }
        });
        try {
            dbhelper.asynExcute('P721E记录表格下载',
                [dbhelper.makeSqlparam("表格文件请求代码", sqlTypes.Int, row['表格文件请求代码']),
                dbhelper.makeSqlparam("下载类型", sqlTypes.NVarChar(), 下载类型),
                dbhelper.makeSqlparam("下载用户", sqlTypes.Int, userid)]);
        }
        catch (eo) {

        }
    });
};

fileSystem.queryLongProcessResult = (req, res) => {
    return co(function* () {
        var bundle = req.body.bundle;
        if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
        var key = bundle.key;
        if (key == null) { return serverhelper.createErrorRet('缺少参数key'); }
        var filePath = path.join(__dirname, 'filedata/longprocess/' + key + '.json');
        if (fs.existsSync(filePath)) {
            var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
            if(fileContent.length == 0){
                return null;    //文件还未写入完毕
            }
            return JSON.parse(fileContent);
        }
        return null;
    });
};

fileSystem.readExcelContent = (req, res) => {
    return co(function* () {
        var bundle = req.body.bundle;
        if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
        var fileIdentity = bundle.fileIdentity;
        if (fileIdentity == null) { return serverhelper.createErrorRet('缺少参数fileIdentity'); }
        var sql = "select * from [TB00C文件上传记录] where [文件令牌] = @identity and 已上传大小=文件大小";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('identity', sqlTypes.NVarChar(50), fileIdentity)]);
        if (rcdRlt.recordset.length == 0) {
            return serverhelper.createErrorRet('服务端文件记录不存在');
        }
        var fileRecord = rcdRlt.recordset[0];
        var fileFullName = fileIdentity;
        if (fileRecord.文件后缀.length > 0) {
            fileFullName += '.' + fileRecord.文件后缀;
        }
        var belongDirPath = fileRecord.创建时间.getFullYear() + '_' + (fileRecord.创建时间.getMonth() + 1);
        var targetDirPath = path.join(__dirname, gFileHouseRootPath, belongDirPath);
        var targetFilePath = path.join(targetDirPath, fileFullName);
        if (!fs.existsSync(targetFilePath)) {
            return serverhelper.createErrorRet('文件不存在' + fileIdentity);
        }

        var process_key = serverhelper.guid2();
        var jsonFilePath = path.join(__dirname, 'filedata/longprocess/' + process_key + '.json');
        var scriptPath;
        var startPythonCmd;
        scriptPath = path.join(__dirname, 'scripts/python/castExcelToJson.py');
        startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + targetFilePath + ' ' + jsonFilePath;
        exec(startPythonCmd, (error, stdout, stderr) => {
            var errmsg = error ? error.message : (stdout != 'OK' ? stdout : '');
            if (errmsg != null && errmsg.length > 0) {
                serverhelper.SaveLongProcessResult(process_key, serverhelper.createErrorRet(errmsg));
            }
        });

        return process_key;
    });
};

fileSystem.queryQRCodeFiles = (req, res) => {
    return co(function* () {
        var bundle = req.body.bundle;
        if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
        var key = bundle.key;
        if (key == null) { return serverhelper.createErrorRet('缺少参数key'); }

        var sql = "SELECT T文件信息.* FROM [TB00D扫码上传记录] cross apply FTB00E文件信息(文件代码) as T文件信息 where [扫码令牌]=@令牌";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('令牌', sqlTypes.NVarChar(50), key)]);
        return rcdRlt.recordset.length > 0 ? rcdRlt.recordset : null;
    });
};

fileSystem.makeAttachment = (req, res) => {
    var userid = getUserID(req);
    return co(function* () {
        var bundle = req.body.bundle;
        if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
        var fileFlow = bundle.fileFlow;
        if (fileFlow == null) { return serverhelper.createErrorRet('缺少参数fileFlow'); }
        var relrecordid = bundle.relrecordid;
        if (relrecordid == null) { return serverhelper.createErrorRet('缺少参数relrecordid'); }
        var fileid = bundle.fileid;
        if (fileid == null) { return serverhelper.createErrorRet('缺少参数fileid'); }

        var inparams_arr = [
            dbhelper.makeSqlparam('操作种类', sqlTypes.NVarChar(100), 'add'),
            dbhelper.makeSqlparam('归属流程代码', sqlTypes.Int, fileFlow),
            dbhelper.makeSqlparam('关联记录代码', sqlTypes.Int, relrecordid),
            dbhelper.makeSqlparam('数据', sqlTypes.NVarChar(2000), fileid),
            dbhelper.makeSqlparam('操作用户', sqlTypes.NVarChar(200), userid),
        ];
        var ret;
        try {
            ret = yield dbhelper.asynExcute('PB00E操作附件', inparams_arr);
        }
        catch (eo) {
            return serverhelper.createErrorRet(eo.message);
        }
        return {
            attachmentID:ret.returnValue,
        };
    });
};

fileSystem.getPreviewUrl = (req, res) => {
    return co(function* () {
        var identity = req.query.identity;
        if(!identity){
            identity = req.body.identity;
        }
        if(identity){
            rcdRlt = yield dbhelper.asynQueryWithParams("select * from [FTB00E文件信息Ex](@文件令牌)",
            [
                dbhelper.makeSqlparam('文件令牌', sqlTypes.NVarChar(50), identity)
            ]);
        }
        
        if (rcdRlt != null && rcdRlt.recordset.length > 0) {
            res.write(rcdRlt.recordset[0].文件路径);
        }
        else{
            res.write('404');
        }
        res.end();
    });
}

var processes_map = {
    applyForTempFile: fileSystem.applyForTempFile,
    uploadBlock: fileSystem.uploadBlock,
    deleteAttachment: fileSystem.deleteAttachment,
    getFileRecord: fileSystem.getFileRecord,
    exportExcelFileFromJson: fileSystem.exportExcelFileFromJson,
    queryExcelFileState: fileSystem.queryExcelFileState,
    queryLongProcessResult: fileSystem.queryLongProcessResult,
    readExcelContent: fileSystem.readExcelContent,
    queryQRCodeFiles: fileSystem.queryQRCodeFiles,
    makeAttachment: fileSystem.makeAttachment,
    getPreviewUrl: fileSystem.getPreviewUrl,
    downloadBlock: fileSystem.downloadBlock,
};

module.exports = fileSystem;