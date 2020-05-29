const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
var co = require('co');
var fs = require('fs');
var uuid = require('uuid');
const sqlTypes = dbhelper.Types;
var path = require("path");
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
const mineType = require('mime-types');

function cal_shuangzhoutest(_config) {
    return co(function* () {
        var rlt = {};
        var scriptDir = path.join(__dirname, 'scripts/python/shuangzhoutest/');
        var scriptPath = path.join(scriptDir, 'main.py');
        var result = '';
        try {
            _config.files = _config.files.map(x => { return path.join(__dirname, 'public', x); });
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + JSON.stringify(_config).replace(/"/g, "'");
            result = execSync(startPythonCmd).toString();
        }
        catch (eo) {
            return {
                err: eo.message
            };
        }
        var tpos = result.indexOf('middata:');
        if (tpos != 1) {
            rlt.middata = result.substring(result.indexOf('{', tpos) + 1, result.indexOf('}', tpos)).replace(/:/g, '=').replace(/'/g, '');
        }
        tpos = result.indexOf('result:');
        if (tpos != 1) {
            rlt.result = result.substring(result.indexOf('{', tpos) + 1, result.indexOf('}', tpos)).replace(/:/g, '=').replace(/'/g, '');
        }
        tpos = result.indexOf('errinfo:');
        if (tpos != 1) {
            rlt.errinfo = result.substring(result.indexOf('{', tpos) + 1, result.indexOf('}', tpos));
        }
        tpos = result.indexOf('picresult:');
        if (tpos != 1) {
            var picResult = JSON.parse(result.substring(result.indexOf('{', tpos), result.indexOf('}', tpos) + 1));
            for (var si in picResult) {
                var filePath = path.join(scriptDir, 'output/' + picResult[si]);  // 如果是本地文件
                var data = fs.readFileSync(filePath);
                var base64 = 'data:' + mineType.lookup(filePath) + ';base64,' + data.toString('base64');
                rlt[si] = base64;
                fs.unlink(filePath);
            }
        }
        return rlt;
    });
}

function draw_suangzhoudatafile(fileid) {
    return co(function* () {
        var rlt = {};
        var sql = 'SELECT 文件路径 FROM [FTB00E文件信息] (@fileid)';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [
            dbhelper.makeSqlparam('fileid', sqlTypes.Int, fileid),
        ]);
        if (rcdRlt.recordset.length == 0) {
            return serverhelper.createErrorRet('指定文件未找到' + fileid);
        }
        var filePath = path.join(__dirname, 'public', rcdRlt.recordset[0].文件路径);
        if(!fs.existsSync(filePath)){
            return {
                err: '文件不存在' + fileid
            };
        }
        var scriptDir = path.join(__dirname, 'scripts/python/shuangzhoutest/');
        var scriptPath = path.join(scriptDir, 'drawfile.py');
        var result = '';
        try {
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + filePath;
            result = execSync(startPythonCmd).toString();
        }
        catch (eo) {
            return {
                err: eo.message
            };
        }
        var tpos = result.indexOf('picname:');
        if (tpos != 1) {
            var picName = result.substring(result.indexOf('{', tpos) + 1, result.indexOf('}', tpos));
            var picPath = path.join(scriptDir, 'output/' + picName);  // 如果是本地文件
            var data = fs.readFileSync(picPath);
            var base64 = 'data:' + mineType.lookup(picPath) + ';base64,' + data.toString('base64');
            rlt.picdata = base64;
            fs.unlink(picPath);
        }
        return rlt;
    });
}

module.exports = {
    cal_shuangzhoutest: cal_shuangzhoutest,
    draw_suangzhoudatafile: draw_suangzhoudatafile,
};