const dbhelper = require('../../../../dbhelper.js');
const serverhelper = require('../../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require('fs');
const forge = require('node-forge');
var processes_map={pageloaded:pageloaded,pulldata_DrawingSelectorForm:pulldata_DrawingSelectorForm,};

function process(req,res,next){
	serverhelper.commonProcess(req, res, next, processes_map);
}
function pageloaded(req,res){
return co(function* () {
	var rlt = {};
	return rlt;

});}
function pagePermissionCheck(req,res,next){
}
function pulldata_DrawingSelectorForm(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var permissiongroup_arr = [];
		var bCanAccess = yield serverhelper.CheckPermission(req, 39, permissiongroup_arr);
		if(!bCanAccess){return serverhelper.createErrorRet('未授权的访问',0,null);}
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.项目代码 == null){return serverhelper.createErrorRet('没有提供项目代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('项目代码', sqlTypes.NVarChar(4000), bundle.项目代码),
		];
		var sql = "select [DT可选全局图].[项目图纸定义代码],[DT可选全局图].[加工图纸种类],[DT可选全局图].[图纸名称],[模型文件路径],可视模型图元代码 from (select FT254C全局图纸定义.[项目图纸定义代码],[加工图纸种类代码],[加工图纸种类],[图纸名称],[关联模型图元] from FT254C全局图纸定义(@项目代码) inner join (select  distinct [T254D发图记录].[项目图纸定义代码] from T254D发图记录 where [T254D发图记录].[全局部位记录代码]>0) as T发图记录 on [FT254C全局图纸定义].[项目图纸定义代码]=[T发图记录].[项目图纸定义代码]) as [DT可选全局图] inner join FT254C可视模型图元(@项目代码) as T可视模型 on T可视模型.模型图元代号 = [DT可选全局图].[关联模型图元] order by [DT可选全局图].[加工图纸种类],[DT可选全局图].[图纸名称]";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function pulldata_图元明细数据(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var permissiongroup_arr = [];
		var bCanAccess = yield serverhelper.CheckPermission(req, 39, permissiongroup_arr);
		if(!bCanAccess){return serverhelper.createErrorRet('未授权的访问',0,null);}
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.图元代码 == null){return serverhelper.createErrorRet('没有提供图元代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('图元代码', sqlTypes.NVarChar(4000), bundle.图元代码),
		];
		var sql = "SELECT [图元路径],[全局代码],[方位名称],[部位代码],[放置点],全局分类全称 as 全局名称 FROM [base1].[dbo].[T254D模型图元明细] inner join V254C全局分类 on 全局分类代码 = 全局代码 where 可视模型图元代码 = @图元代码 and 终止状态=0 order by 全局名称,方位名称,部位代码";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}
processes_map.pulldata_图元明细数据 = pulldata_图元明细数据;


module.exports = process;
