const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require('fs');
const forge = require('node-forge');


var processes_map={
    getMenu:getMenu,
};

function process(req,res,next){
    if(req.session.userid == null){
        return res.json(serverhelper.createErrorRet('请登录后使用', 1001));
    }
	serverhelper.commonProcess(req, res, next, processes_map);
}

function getMenu(){
    return co(function* () {
        var sql = 'SELECT [系统方案名称代码],[系统方案名称],[方案英文名称],[桌面端名称],[移动端名称],[是否列表可见],[完成确认状态],[系统流程名称],[系统流程简称] FROM [base1].[dbo].[V002C系统方案名称] where [是否列表可见] = 1 and [终止确认状态] = 0';
        var ret = yield dbhelper.asynQueryWithParams(sql);
        return ret.recordset;
    });
}


module.exports = process;