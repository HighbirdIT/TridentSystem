const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require("fs");

var flowJs_map = {};

var started = false;
var workInt = 0;

function startWork(){
    if(workInt == 0){
        workInt = setInterval(()=>{
            startFlowProcess();
        },5 * 1000);
    }
}

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
        if(ret && ret.recordset){
            for(var si in ret.recordset){
                var record = ret.recordset[si];
                doStepRecord(record);
            }
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

function execFromNotify(req, res){
    if(req.path == '/')
    {
        if(req.query.id == null){
            res.locals.errTitle = '严重错误';
            res.locals.errinfo = 'fromNotify没有关键参数';
            res.render('erppage/errorpage', { layout: null });
        }
        else{
            var isPC = req.query.isPC != null;
            return co(function* (){
                var sqlRet = null;
                try{
                    sqlRet = yield dbhelper.asynQueryWithParams('select 流程审批记录代码 FROM [T196C工作通知记录] where 工作通知记录代码 = @id', [dbhelper.makeSqlparam('id', sqlTypes.Int, req.query.id)]);
                }
                catch(eo){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = eo.toString();
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                if(sqlRet == null || sqlRet.recordset == null || sqlRet.recordset.length == 0){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = '指定的通知记录未找到-' + req.query.id;
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                var theRecord = sqlRet.recordset[0];
                if(theRecord.流程审批记录代码 == 0){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = '指定的通知记录里没有处置信息-' + req.query.id;
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                try{
                    sqlRet = yield dbhelper.asynQueryWithParams('SELECT [关联步骤代码],[关联步骤数据],[关联方案代码]  FROM [base1].[dbo].[T196D流程审批记录] where [流程审批记录代码] = @id', [dbhelper.makeSqlparam('id', sqlTypes.Int, theRecord.流程审批记录代码)]);
                }
                catch(eo){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = eo.toString();
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                if(sqlRet.recordset.length == 0){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = '无法找到通知关联的审批记录-' + theRecord.流程审批记录代码;
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                var shenpiRecord = sqlRet.recordset[0];
                try{
                    sqlRet = yield dbhelper.asynQueryWithParams('SELECT [方案英文名称],[桌面端名称],[移动端名称] FROM [V002C系统方案名称] where [系统方案名称代码]=@id', [dbhelper.makeSqlparam('id', sqlTypes.Int, shenpiRecord.关联方案代码)]);
                }
                catch(eo){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = eo.toString();
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                if(sqlRet == null || sqlRet.recordset == null || sqlRet.recordset.length == 0){
                    res.locals.errTitle = '严重错误';
                    res.locals.errinfo = '通知指定的页面未能找到-' + req.query.id + '.' + theRecord.关联方案代码;
                    res.render('erppage/errorpage', { layout: null });
                    return false;
                }
                var projectRecord = sqlRet.recordset[0];
                if(isPC){
                    if(projectRecord.桌面端名称.length == 0){
                        isPC = false;
                    }
                }
                else if(projectRecord.移动端名称.length == 0){
                    isPC = true;
                }
                res.redirect('/erppage/' + (isPC ? 'pc/' : 'ma/') + projectRecord.方案英文名称 + '?flowStep=' + shenpiRecord.关联步骤代码 + '&flowStepData=' + shenpiRecord.关联步骤数据);

                return true;
                //[关联方案代码]
                //,[关联步骤代码]
                //,[关联步骤数据]
                //res.json({err:'没有指定id'});
            });
        }
        return true;
    }
    return false;
}

module.exports = {
    startFlowProcess:startFlowProcess,
    execFromNotify:execFromNotify,
    startWork:startWork,
};