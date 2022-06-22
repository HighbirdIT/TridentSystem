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
const fileSystem = require('./fileSystem.js');



function file_transformMd5(token){
    return co(function* () {
        var rlt = '';
        var querysql_1params_arr=[
            dbhelper.makeSqlparam('文件代码', sqlTypes.Int, token)
        ];
        var querysql_1sql="select 文件路径 from FTB00E文件信息(@文件代码)";
        var querysql_1_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_1sql, querysql_1params_arr);
        var row_文件信息 = querysql_1_rcdRlt.recordset[0];
        var baseDir = __dirname + '\\public';
        var cong = {
            filePath: (baseDir + row_文件信息.文件路径).replace(/\\/g,'/'),
        }
        


        var scriptDir = path.join(__dirname, 'scripts/python/');
        var scriptPath = path.join(scriptDir, 'md5FileEncryption.py');
        var result = '';
        try {
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + JSON.stringify(cong).replace(/"/g, "'");
            console.log(startPythonCmd)
            result = execSync(startPythonCmd).toString();
        }
        catch (eo) {
            return {
                err: eo.message,
            };
        }
        
        
        tpos = result.indexOf('result:');
        console.log(result)
        
        if (tpos != -1) {
            rlt = result.substring(tpos + 7);
        }
        console.log(rlt)
        return rlt;
        
    });
}


module.exports = {
    file_transformMd5: file_transformMd5
};