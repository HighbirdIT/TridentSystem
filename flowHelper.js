const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require("fs");

var flowJs_map = {};

var started = false;

function startFlowProcess(){
    if(started){
        return;
    }
    started = true;
    return co(function* (){
        var sql = 'select * from FT007E等待执行步骤()';
        var ret = null;
        try{
            ret = yield dbhelper.asynQueryWithParams(sql,null);
        }
        catch(eo){
            serverhelper.InformSysManager(eo.toString(), 'startFlowProcess');
        }
        for(var si in ret.recordset){
            var record = ret.recordset[si];
            doStepRecord(record);
        }
        started = false;
    });
}

var doingStep_map = {};

function reportResult(stepCode,rcdid, result, output, useSec){
    dbhelper.asynExcute('P007E执行步骤汇报', [
        dbhelper.makeSqlparam('步骤执行记录代码', sqlTypes.Int, rcdid),
        dbhelper.makeSqlparam('完成状态', sqlTypes.TinyInt, result),
        dbhelper.makeSqlparam('输出结果', sqlTypes.NVarChar(1000), output),
        dbhelper.makeSqlparam('耗用秒数', sqlTypes.Float, useSec),
    ]);
    delete doingStep_map[stepCode];
    stepCode = 0;
}

function doStepRecord(record){
    var flowCode = record.系统流程名称代码;
    var stepCode = record.流程操作步骤代码;
    var rcdID = record.步骤执行记录代码;
    if(doingStep_map[stepCode]){
        return;
    }

    return co(function* (){
        var startTime = (new Date()).getTime();
        var nowVersion = record.当前版本;
        var fileName = 'flow' + flowCode + '_' + nowVersion + '.js';
        var fileFullPath = 'views/erppage/server/flows/' + fileName;
        if(!fs.existsSync(fileFullPath)){
            reportResult(stepCode,rcdID,0,fileName + '未能找到',0);
            return;
        }
        var jsLoadPath = __dirname + '/' + fileFullPath;
        if(flowJs_map[fileName] == null){
            try{
                flowJs_map[fileName] = require(jsLoadPath);
            }
            catch(eo){
                reportResult(stepCode,rcdID,0,eo.toString(),0);
                return;
            }
        }
        var ret = null;
        try
        {
            ret = yield flowJs_map[fileName](stepCode,record.参数1,record.参数2,record.参数3);
        }
        catch(eo){
            reportResult(stepCode,rcdID,0,eo.toString(),0);
            return;
        }
        var endTime = (new Date()).getTime();
        var useSec = Math.round((endTime - startTime) / 10) / 100;
        var isOK = 1;
        var info = '无输出';
        if(ret != null){
            if(typeof ret === 'string'){
                info = ret;
            }
            else if(ret.err){
                isOK = 2;
                info = ret.err.info;
            }
            else if(ret.info){
                info = ret.info;
            }
        }
        reportResult(stepCode,rcdID,isOK,info,useSec);
    });
}

module.exports = {
    startFlowProcess:startFlowProcess,
};