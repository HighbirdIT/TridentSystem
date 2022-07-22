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
        // console.log(result)
        
        if (tpos != -1) {
            rlt = result.substring(tpos + 7);
        }
        console.log(rlt)
        return rlt;
        
    });
}

function file_BiaxialStretchingLength(config){
    
    return co(function*(){
        var rlt = {};

       
        var fileid = config.file_code
       

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
        config.filepath = filePath
        

        var scriptDir = path.join(__dirname, 'scripts/python/shuangzhoutest/');
        var scriptPath = path.join(scriptDir, 'tensileParameters.py');
        var result = '';
        try {
            // console.log(JSON.stringify(config).replace(/"/g, "'"),'------')

            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + '"'+JSON.stringify(config).replace(/"/g, "'")+'"';
            result = execSync(startPythonCmd).toString();
        }
        catch (eo) {
            return {
                err: eo.message
            };
        }
        console.log(result);

        
        var ex_pattern = /ex':\s*(\S*),/
        if (result.match(ex_pattern)){
            rlt.ex = result.match(ex_pattern)[1]
        }

        var ey_pattern = /ey':\s*(\S*),/
        if ( result.match(ey_pattern)){
            rlt.ey = result.match(ey_pattern)[1]
        }
        

        var area_pattern = /area_ratio':\s*(\S*),/
        if (result.match(area_pattern)){
            rlt.area_ratio = result.match(area_pattern)[1]
        }
        
        var fill_pattern = /fill_tensile':\s*(\S*),/
        if(result.match(fill_pattern)){
            rlt.fill_tensile = result.match(fill_pattern)[1]
        }
        

        var warp_sPattern = /warp_stretched_len':\s*(\S*),/
        if(result.match(warp_sPattern)){
            rlt.warp_stretched_len = result.match(warp_sPattern)[1]
        }
        
        var fill_sPattern = /fill_stretched_len':\s*(\S*),/
        if(result.match(fill_sPattern)){
            rlt.fill_stretched_len=result.match(fill_sPattern)[1]
        }
        var pic_pattern = /pic_path':\s*(\S*),/
        if (result.match(pic_pattern)){
            rlt.pic_path = result.match(pic_pattern)[1]
        }
        var err_pattern = /err':\s*(\S*),/
        if(result.match(err_pattern)){
            rlt.err = result.match(err_pattern)[1]
        }else{
            rlt.err =null
        }
        
        console.log(rlt)
        
        return rlt;
    });
}


module.exports = {
    file_transformMd5: file_transformMd5,
    file_BiaxialStretchingLength:file_BiaxialStretchingLength
};