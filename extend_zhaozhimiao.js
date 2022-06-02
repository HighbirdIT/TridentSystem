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

function checkStationData(锚点配置_arr,项目代码,组号,顺序号,分序号,数据文件代码,最大容差,最小间距,最小垂距) {
    return co(function* () {
        var rlt = {};
        try{
            var thisAnchor_arr = []
            for(var i in 锚点配置_arr){
                var d = 锚点配置_arr[i];
                thisAnchor_arr.push({index:-1,key:d.测点名称,anchorCode:d.锚点代码, offsetZ:d.Z偏移});
            }
            var querysql_0params_arr=[
                dbhelper.makeSqlparam('组号', sqlTypes.Int, 组号),
                dbhelper.makeSqlparam('顺序号', sqlTypes.Int, 顺序号),
                dbhelper.makeSqlparam('分序号', sqlTypes.Int, 分序号),
                dbhelper.makeSqlparam('项目代码', sqlTypes.Int, 项目代码),
                dbhelper.makeSqlparam('数据文件代码', sqlTypes.NVarChar(4000), 数据文件代码),
            ];
            var querysql_0sql="select [本测站文件路径],[本测站全称],[上个测站文件路径],[上个测站全称],[下个测站文件路径],[下个测站全称],上个测站记录代码,下个测站记录代码 from FT254E查询关联测站(@项目代码,@组号,@顺序号,@分序号,@数据文件代码)";
            var querysql_0_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_0sql, querysql_0params_arr);
            var row_querysql_0 = querysql_0_rcdRlt.recordset[0];
            var querysql_0_本测站文件路径=row_querysql_0.本测站文件路径;
            var querysql_0_本测站全称=row_querysql_0.本测站全称;
            var querysql_0_上个测站文件路径=row_querysql_0.上个测站文件路径;
            var querysql_0_上个测站全称=row_querysql_0.上个测站全称;
            var querysql_0_下个测站文件路径=row_querysql_0.下个测站文件路径;
            var querysql_0_下个测站全称=row_querysql_0.下个测站全称;
            var querysql_0_上个测站记录代码=row_querysql_0.上个测站记录代码;
            var querysql_0_下个测站记录代码=row_querysql_0.下个测站记录代码;

            var querysql_1params_arr=[
                dbhelper.makeSqlparam('项目代码', sqlTypes.Int, 项目代码)
            ];
            var querysql_1sql="select 项目全局锚点代码 as code,锚点名称 as name,X,Y,Z FROM [base1].[dbo].[T254C项目全局锚点] where 项目登记名称代码=@项目代码";
            var querysql_1_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_1sql, querysql_1params_arr);

            var baseDir = __dirname + '\\public';
            var cong = {
                fileName: querysql_0_本测站全称,
                filePath: (baseDir + querysql_0_本测站文件路径).replace(/\\/g,'/'),
                preFileName: querysql_0_上个测站全称,
                preFilePath: (querysql_0_上个测站文件路径.length > 0 ? baseDir + querysql_0_上个测站文件路径 : '').replace(/\\/g,'/'),
                aftFileName: querysql_0_下个测站全称,
                aftFilePath: (querysql_0_下个测站文件路径.length > 0 ? baseDir + querysql_0_下个测站文件路径 : '').replace(/\\/g,'/'),
                maxDif: 最大容差,
                minDistance:最小间距,
                minVDistance:最小垂距,
            }
            cong.anchor_arr = querysql_1_rcdRlt.recordset;
            cong.preAnchor_arr = [];
            cong.nxtAnchor_arr = [];
            cong.thisAnchor_arr = thisAnchor_arr;

            if(querysql_0_上个测站记录代码 > 0){
                var querysql_2params_arr=[
                    dbhelper.makeSqlparam('记录代码', sqlTypes.Int, querysql_0_上个测站记录代码)
                ];
                var querysql_2sql="select [序号] as [index],[全局锚点代码] as anchorCode, [Z向偏移] offsetZ FROM [base1].[dbo].[T254D测站数据明细] where 项目测站记录代码=@记录代码 and [全局锚点代码] > 0";
                var querysql_2_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_2sql, querysql_2params_arr);
                cong.preAnchor_arr = querysql_2_rcdRlt.recordset;
            }
            if(querysql_0_下个测站记录代码 > 0){
                var querysql_2params_arr=[
                    dbhelper.makeSqlparam('记录代码', sqlTypes.Int, querysql_0_下个测站记录代码)
                ];
                var querysql_2sql="select [序号] as [index],[全局锚点代码] as anchorCode, [Z向偏移] offsetZ FROM [base1].[dbo].[T254D测站数据明细] where 项目测站记录代码=@记录代码 and [全局锚点代码] > 0";
                var querysql_2_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_2sql, querysql_2params_arr);
                cong.nxtAnchor_arr = querysql_2_rcdRlt.recordset;
            }

            var scriptPath = path.join(__dirname, 'scripts/python/checkStationMeasureData.py');
            var result = '';
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + JSON.stringify(cong).replace(/"/g, "'");
            result = execSync(startPythonCmd).toString();
            var pos_s = result.indexOf('<result>');
            if (pos_s != -1) {
                var pos_e = result.indexOf('</result>', pos_s);
                var jsonStr = result.substring(pos_s + 8, pos_e);
                var rltJson = JSON.parse(jsonStr);
                if(rltJson.errList != null) {
                    var newErrList = [];
                    for(var i in rltJson.errList){
                        newErrList.push({序号:i,错误信息:rltJson.errList[i]});
                    }
                    rltJson.errList = newErrList;
                }
                else{
                    rltJson.errList = [];
                }
                rlt = rltJson;
            }
        }catch(eo){
            return {
                err: eo.message
            };
        }
        return rlt;
    });
}

function loadStationData(数据文件代码) {
    return co(function* () {
        var rlt = {};
        try{
            var querysql_1params_arr=[
                dbhelper.makeSqlparam('文件代码', sqlTypes.Int, 数据文件代码)
            ];
            var querysql_1sql="select 文件路径 from FTB00E文件信息(@文件代码)";
            var querysql_1_rcdRlt = yield dbhelper.asynQueryWithParams(querysql_1sql, querysql_1params_arr);
            var row_文件信息 = querysql_1_rcdRlt.recordset[0];
            var baseDir = __dirname + '\\public';
            var cong = {
                filePath: (baseDir + row_文件信息.文件路径).replace(/\\/g,'/'),
            }
            var scriptPath = path.join(__dirname, 'scripts/python/loadStationMeasureData.py');
            var result = '';
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + JSON.stringify(cong).replace(/"/g, "'");
            result = execSync(startPythonCmd).toString();
            var pos_s = result.indexOf('<result>');
            if (pos_s != -1) {
                var pos_e = result.indexOf('</result>', pos_s);
                var jsonStr = result.substring(pos_s + 8, pos_e);
                var rltJson = JSON.parse(jsonStr);
                if(rltJson.errList != null) {
                    var newErrList = [];
                    for(var i in rltJson.errList){
                        newErrList.push({序号:i,错误信息:rltJson.errList[i]});
                    }
                    rltJson.errList = newErrList;
                }
                else{
                    rltJson.errList = [];
                }
                rlt = rltJson;
            }
        }catch(eo){
            return {
                err: eo.message
            };
        }
        return rlt;
    });
}

module.exports = {
    checkStationData: checkStationData,
    loadStationData: loadStationData,
};
