const dbhelper = require('../../../../dbhelper.js');
const serverhelper = require('../../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require('fs');
const forge = require('node-forge');
var processes_map={pageloaded:pageloaded};

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



function pulldata_可选全局图纸(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.项目代码 == null){return serverhelper.createErrorRet('没有提供项目代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('项目代码', sqlTypes.NVarChar(4000), bundle.项目代码),
		];
		var sql = "SELECT [DT可选全局图].[项目图纸定义代码], [DT可选全局图].[加工图纸种类], [DT可选全局图].[图纸名称], 关联模型代码, 参数上传记录代码, T参数几何文件.文件路径 AS 参数信息路径 FROM (SELECT FT254C全局图纸定义.[项目图纸定义代码], [加工图纸种类代码], [加工图纸种类], [图纸名称], [关联模型代码], 参数上传记录代码 FROM FT254C全局图纸定义(@项目代码) INNER JOIN (SELECT DISTINCT [项目图纸定义代码] FROM T254D发图记录 WHERE [T254D发图记录].[全局部位记录代码]>0 ) AS T发图记录 ON [FT254C全局图纸定义].[项目图纸定义代码]=[T发图记录].[项目图纸定义代码]) AS [DT可选全局图] cross apply FTB00E查找附件信息(0,29,参数上传记录代码) AS T参数几何文件 where 关联模型代码 > 0 ORDER BY [DT可选全局图].[加工图纸种类],[DT可选全局图].[图纸名称]";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function pulldata_可选构件安装图纸(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.项目代码 == null){return serverhelper.createErrorRet('没有提供项目代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('项目代码', sqlTypes.NVarChar(4000), bundle.项目代码),
		];
		var sql = "SELECT * from FT254E可选安装定位图(@项目代码) order by 图纸名称";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function pulldata_图元明细数据(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
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

function pulldata_ProjectMeta(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.项目代码 == null){return serverhelper.createErrorRet('没有提供项目代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('项目代码', sqlTypes.NVarChar(4000), bundle.项目代码),
		];
		var sql = "SELECT [全局分类代码],[全局分类名称],全局分类全称 FROM [base1].[dbo].[V254C全局分类]  where 项目登记名称代码 = @项目代码";
		var 全局rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		var rlt = {
			全局分类:全局rcdRlt.recordset
		}
		sql = "SELECT [方位名称] as 英文名称,[方位对],[路径代码],[备注信息] as 中文名称  FROM [base1].[dbo].[T254C方位分类] order by 路径代码";
		var 方位rcdRlt = yield dbhelper.asynQueryWithParams(sql, null);
		var rlt = {
			全局_arr:全局rcdRlt.recordset,
			方位_arr:方位rcdRlt.recordset,
		}
		return rlt;
	});
}

function pulldata_全局参数数据(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.图纸代码 == null){return serverhelper.createErrorRet('没有提供图纸代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('图纸代码', sqlTypes.Int, bundle.图纸代码),
		];
		var sql = "SELECT * FROM [dbo].[FT254E查询全局参数数据] (@图纸代码) order by 全局代码,方位名称,部位代码,一级序号,二级序号,参数名称,参数序号";
		var rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rlt.recordset;
	});
}

function pulldata_构件参数数据(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.图纸种类代码 == null){return serverhelper.createErrorRet('没有提供图纸种类代码',0,null);};
		if(bundle.构件代码 == null){return serverhelper.createErrorRet('没有提供构件代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('图纸种类代码', sqlTypes.Int, bundle.图纸种类代码),
			dbhelper.makeSqlparam('构件代码', sqlTypes.Int, bundle.构件代码),
		];
		var sql = "SELECT * FROM [dbo].[FT254E查询构件图纸参数] (@构件代码,@图纸种类代码) order by 全局代码,方位名称,部位代码,一级序号,二级序号,组号,序号,参数名称,参数序号";
		var rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rlt.recordset;
	});
}

function pulldata_图纸关联构件模型(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.图纸代码 == null){return serverhelper.createErrorRet('没有提供图纸代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('图纸代码', sqlTypes.Int, bundle.图纸代码),
		];
		var sql = "SELECT * FROM [dbo].[FT254D图纸关联构件模型] (@图纸代码) order by 全局代码,方位名称,部位代码,一级序号,二级序号,构件代码";
		var rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rlt.recordset;
	});
}

function pulldata_查询附件记录(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.归属流程代码 == null){return serverhelper.createErrorRet('没有提供归属流程代码',0,null);};
		if(bundle.关联记录代码 == null){return serverhelper.createErrorRet('没有提供关联记录代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('归属流程代码', sqlTypes.Int, bundle.归属流程代码),
			dbhelper.makeSqlparam('关联记录代码', sqlTypes.Int, bundle.关联记录代码),
		];
		var sql = "select [FTB00E查找附件信息].[文件上传记录代码],[FTB00E查找附件信息].[附件记录代码],[FTB00E查找附件信息].[文件类型],[FTB00E查找附件信息].[文件路径],[FTB00E查找附件信息].[文件名称] from FTB00E查找附件信息('0',@归属流程代码,@关联记录代码)";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

processes_map.pulldata_图元明细数据 = pulldata_图元明细数据;
processes_map.pulldata_可选全局图纸 = pulldata_可选全局图纸;
processes_map.pulldata_可选构件安装图纸 = pulldata_可选构件安装图纸;
processes_map.pulldata_ProjectMeta = pulldata_ProjectMeta;
processes_map.pulldata_全局参数数据 = pulldata_全局参数数据;
processes_map.pulldata_构件参数数据 = pulldata_构件参数数据;
processes_map.pulldata_查询附件记录 = pulldata_查询附件记录;
processes_map.pulldata_图纸关联构件模型 = pulldata_图纸关联构件模型;

module.exports = process;
