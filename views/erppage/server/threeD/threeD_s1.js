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


function pulldata_项目全局可视模型(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.项目代码 == null){return serverhelper.createErrorRet('没有提供项目代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('项目代码', sqlTypes.NVarChar(4000), bundle.项目代码),
		];
		var sql = "select 全局分类名称,T254D全局可视模型.全局分类代码,文件路径 from T254D全局可视模型 inner join T254C全局分类 on T254C全局分类.全局分类代码 = T254D全局可视模型.全局分类代码 cross apply FTB00E文件信息(模型文件代码) where T254C全局分类.项目登记名称代码 = @项目代码";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
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

function pulldata_查找相邻构件信息(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.上传记录代码 == null){return serverhelper.createErrorRet('没有提供上传记录代码',0,null);};
		if(bundle.最大距离 == null){return serverhelper.createErrorRet('没有提供最大距离',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('上传记录代码', sqlTypes.Int, bundle.上传记录代码),
			dbhelper.makeSqlparam('最大距离', sqlTypes.Float, bundle.最大距离),
		];
		var sql = "select * from FT254E查找相邻构件信息(@上传记录代码,@最大距离)";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function pulldata_查询构件记录图模(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.上传记录代码 == null){return serverhelper.createErrorRet('没有提供上传记录代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('上传记录代码', sqlTypes.Int, bundle.上传记录代码),
		];
		var sql = "select * from FT254E查询构件记录图模(@上传记录代码)";
		if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function pulldata_组网数据查询(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.大连索网代码 == null){return serverhelper.createErrorRet('没有提供大连索网代码',0,null);};
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('大连索网代码', sqlTypes.Int, bundle.大连索网代码),
		];
		var sql = "select T257D拉索节点.* from T257C组网拉索 inner join T257D拉索节点 on T257C组网拉索.构件上传记录代码 = T257D拉索节点.构件上传记录代码 where T257C组网拉索.大连索网代码=@大连索网代码 order by T257D拉索节点.构件上传记录代码,节点序号";
		var 节点Rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		var 索夹sql = "SELECT * FROM [base1].[dbo].[T257C组网索夹] where [大连索网代码] = @大连索网代码";
		var 索夹Rlt = yield dbhelper.asynQueryWithParams(索夹sql, params_arr);
		var 构件sql = "select 关联记录代码 as 构件代码,文件路径 from (select 关联记录代码,max(文件记录代码) as 最新文件 from TB00C附件记录 where 归属流程代码=33 and 关联记录代码 in (257,258,259,260,26,27,29,30,31,33,34,35,3,8,15,14,17,18,20,21,23,24) group by 关联记录代码) as t1 cross apply FTB00E文件信息(最新文件)";
		var 构件Rlt = yield dbhelper.asynQueryWithParams(构件sql);
		var 原竖索节点sql = "select 参数序号,参数值 from (select 构件上传记录代码 from T257C组网拉索 where 大连索网代码 = @大连索网代码 and [项目构件定义代码] in (69,70)) as t1 inner join T254D参数上传数据_索 on T254D参数上传数据_索.构件上传记录代码 = t1.构件上传记录代码 and 加工图纸参数代码 in (142,122,146,130) and 参数序号 > 0 order by 参数序号";
		var 原竖索节点Rlt = yield dbhelper.asynQueryWithParams(原竖索节点sql, params_arr);
		var 组网参数sql = "SELECT [组网参数数据代码],[关联记录代码],T257D组网图纸参数.[组网图纸参数代码],参数名称,[复测文件代码1],case when [复测文件代码1] > 0 then 1 else 0 end as 拍照状态 FROM [T257D组网参数数据] inner join T257D组网图纸参数 on T257D组网图纸参数.[组网图纸参数代码] = [T257D组网参数数据].[组网图纸参数代码] where [大连索网代码] = @大连索网代码 and [T257D组网参数数据].组网图纸参数代码 not in (8,9) order by 组号,序号";
		var 组网参数Rlt = yield dbhelper.asynQueryWithParams(组网参数sql, params_arr);
		
		return {
			节点_arr : 节点Rlt.recordset,
			索夹_arr : 索夹Rlt.recordset,
			构件_arr : 构件Rlt.recordset,
			原竖索节点_arr : 原竖索节点Rlt.recordset,
			组网参数_arr : 组网参数Rlt.recordset,
		};
	});
}

function pulldata_并网数据查询(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if(req.body.bundle == null){return serverhelper.createErrorRet('没有提供bundle',0,null);}
		var bundle=req.body.bundle;
		if(bundle.索网A代码 == null){return serverhelper.createErrorRet('没有提供大连索网A代码',0,null);};
		if(bundle.索网B代码 == null){return serverhelper.createErrorRet('没有提供大连索网B代码',0,null);};
		var dataA = {};
		var dataB = {};
		for(var i=0;i<2;++i){
			var params_arr = null;
			var use索网代码 = bundle.索网A代码;
			var useData = dataA;
			if(i == 1){
				use索网代码 = bundle.索网B代码;
				useData = dataB;
			}
			params_arr=[
				dbhelper.makeSqlparam('大连索网代码', sqlTypes.Int, use索网代码),
			];
			var sql = "select T257D拉索节点.* from T257C组网拉索 inner join T257D拉索节点 on T257C组网拉索.构件上传记录代码 = T257D拉索节点.构件上传记录代码 where T257C组网拉索.大连索网代码=@大连索网代码 order by T257D拉索节点.构件上传记录代码,节点序号";
			var 节点Rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
			var 索夹sql = "SELECT * FROM [base1].[dbo].[T257C组网索夹] where [大连索网代码] = @大连索网代码";
			var 索夹Rlt = yield dbhelper.asynQueryWithParams(索夹sql, params_arr);
			var 组网参数sql = "SELECT [组网参数数据代码],[关联记录代码],T257D组网图纸参数.[组网图纸参数代码],参数名称,[复测文件代码1],case when [复测文件代码1] > 0 then 1 else 0 end as 拍照状态 FROM [T257D组网参数数据] inner join T257D组网图纸参数 on T257D组网图纸参数.[组网图纸参数代码] = [T257D组网参数数据].[组网图纸参数代码] where [大连索网代码] = @大连索网代码 and [T257D组网参数数据].组网图纸参数代码 in (8,9) order by 组号,序号";
			var 组网参数Rlt = yield dbhelper.asynQueryWithParams(组网参数sql, params_arr);
			var sql = "select *,系统编号 as 新的编号 from T257C组网拉索  where T257C组网拉索.大连索网代码=@大连索网代码";
			var 拉索Rlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
			
			useData.拉索_arr = 拉索Rlt.recordset;
			useData.节点_arr = 节点Rlt.recordset;
			useData.索夹_arr = 索夹Rlt.recordset;
			useData.组网参数_arr = 组网参数Rlt.recordset;
		}
		var 构件sql = "select 关联记录代码 as 构件代码,文件路径 from (select 关联记录代码,max(文件记录代码) as 最新文件 from TB00C附件记录 where 归属流程代码=33 and 关联记录代码 in (257,258,259,260,26,27,29,30,31,33,34,35,3,8,15,14,17,18,20,21,23,24) group by 关联记录代码) as t1 cross apply FTB00E文件信息(最新文件)";
		var 构件Rlt = yield dbhelper.asynQueryWithParams(构件sql);
		return {
			网A:dataA,
			网B:dataB,
			构件_arr: 构件Rlt.recordset,
		};
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
processes_map.pulldata_查找相邻构件信息 = pulldata_查找相邻构件信息;
processes_map.pulldata_查询构件记录图模 = pulldata_查询构件记录图模;
processes_map.pulldata_组网数据查询 = pulldata_组网数据查询;
processes_map.pulldata_并网数据查询 = pulldata_并网数据查询;
processes_map.pulldata_项目全局可视模型 = pulldata_项目全局可视模型;


module.exports = process;
