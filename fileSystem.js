const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
var co = require('co');
var fs = require('fs');
var uuid = require('uuid');
const sqlTypes = dbhelper.Types;
var path = require("path");

const EFileSystemError = {
    WRONGSTART : 1001,
    UPLOADCOMPLATE : 1002,
    EMPTYDATA: 1003,
    DATATOOLONG: 1004,
    FILELOCKED: 1005,
};

const gFileHouseRootPath = 'public/filehouse/';

var fileSystem = {};
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

fileSystem.process = (req,res,next) => {
    serverhelper.commonProcess(req, res, next, processes_map);
};

fileSystem.applyForTempFile = (req,res) => {
    var bundle=req.body.bundle;
    return co(function* () {
        var inparams_arr=[
			dbhelper.makeSqlparam('文件名称', sqlTypes.NVarChar(100), bundle.name),
            dbhelper.makeSqlparam('文件大小', sqlTypes.Int, bundle.size),
            dbhelper.makeSqlparam('操作用户', sqlTypes.Int, req.session.g_envVar.userid),
			dbhelper.makeSqlparam('文件类型', sqlTypes.NVarChar(100), bundle.type),
		];
		var ret;
		try{
            ret = yield dbhelper.asynExcute('PB00E创建上传文件',inparams_arr,[dbhelper.makeSqlparam("文件令牌", sqlTypes.NVarChar(50)),dbhelper.makeSqlparam("文件记录代码", sqlTypes.Int)]);
        }
        catch(eo){
            return serverhelper.createErrorRet(eo.message);
        }
        return {code:ret.output.文件记录代码,identity:ret.output.文件令牌};
    });
};

fileSystem.uploadBlock = (req,res) => {
    var bundle=req.body.bundle;
    var fileIdentity = bundle.fileIdentity;
    var blockData = bundle.data;
    return co(function* () {
        var sql = "select * from [TB00C文件上传记录] where [文件令牌] = @identity";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('identity', sqlTypes.NVarChar(50), fileIdentity)]);
        if(rcdRlt.recordset.length == 0){
            return serverhelper.createErrorRet('服务端文件记录不存在'); 
        }
        if(isLock(fileIdentity)){
            return serverhelper.createErrorRet('文件锁定中', EFileSystemError.FILELOCKED); 
        }
        lockFile(fileIdentity);
        var fd = null;
        try{
            var fileRecord = rcdRlt.recordset[0];
            if(fileRecord.已上传大小 == fileRecord.文件大小){
                return serverhelper.createErrorRet('已上传完成', EFileSystemError.UPLOADCOMPLATE);
            }
            var belongDirPath = fileRecord.创建时间.getFullYear() + '_' + (fileRecord.创建时间.getMonth() + 1);
            var targetDirPath = path.join(gFileHouseRootPath,belongDirPath);
            if (!fs.existsSync(targetDirPath))
            {
                fs.mkdirSync(targetDirPath);
            }
            var fileFullName = fileIdentity;
            if(fileRecord.文件后缀.length > 0){
                fileFullName += '.' + fileRecord.文件后缀;
            }
            var targetFilePath = path.join(targetDirPath, fileFullName);
            var nowFileSize = 0;
            if(fs.existsSync(targetFilePath)){
                var fileStats = fs.statSync(targetFilePath);
                nowFileSize = fileStats.size;
            }
            if(nowFileSize != bundle.startPos){
                return serverhelper.createErrorRet('起点错误', EFileSystemError.WRONGSTART, nowFileSize);
            }
            if(blockData == null || typeof blockData != 'string' || blockData.length == 0){
                return serverhelper.createErrorRet('块数据不可为空', EFileSystemError.EMPTYDATA);
            }
            if((fileRecord.已上传大小 + (blockData.length) / 2) > fileRecord.文件大小){
                return serverhelper.createErrorRet('块数据长度不合法', EFileSystemError.DATATOOLONG);
            }
            var blockBuf = new Buffer(blockData, 'hex');
            fd = fs.openSync(targetFilePath, 'a');
            var bytesWritten = fs.writeSync(fd, blockBuf, 0, blockBuf.length, bundle.startPos);

            var inparams_arr=[
                dbhelper.makeSqlparam('临时文件令牌', sqlTypes.NVarChar(100), fileIdentity),
                dbhelper.makeSqlparam('已上传文件大小', sqlTypes.Int, nowFileSize + bytesWritten),
                dbhelper.makeSqlparam('操作用户', sqlTypes.Int, req.session.g_envVar.userid),
            ];
            var proRet;
            try{
                proRet = yield dbhelper.asynExcute('PB00E同步文件信息',inparams_arr);
            }
            catch(eo){
                return serverhelper.createErrorRet(eo.message);
            }

            var rlt = {
                bytesWritten:bytesWritten,
            };
            if(nowFileSize + bytesWritten >= fileRecord.文件大小){
                rlt.previewUrl = '/filehouse/' + belongDirPath + '/' + fileFullName;
            }

            return rlt;
        }
        catch(eo){
            return serverhelper.createErrorRet(eo.message);
        }
        finally{
            unlockFile(fileIdentity);
            if(fd){
                fs.closeSync(fd);
                fd = null;
            }
        }
    });
};

var processes_map={
    applyForTempFile:fileSystem.applyForTempFile,
    uploadBlock:fileSystem.uploadBlock,
};

module.exports = fileSystem;