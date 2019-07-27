const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require('fs');
const forge = require('node-forge');
var MD5 = require('md5.js');
var dingHelper = require('../../../dingHelper');

var rsa = forge.pki.rsa;


var processes_map = {
	getUserTask: getUserTask,
	get用系统的用户: get用系统的用户,
	get所属工作组List: get所属工作组List,
	get可用项目List: get可用项目List,
	get汇报频率List: get汇报频率List,
	get周期单位List: get周期单位List,
	get重要程度List: get重要程度List,
	getTCKFormData: getTCKFormData,
	modifyTask: modifyTask,
	createTask: createTask,
	repealTask: repealTask,
	get任务类别: get任务类别List,
	get任务目标: get任务目标,
	modifyTaskGoal: modifyTaskGoal,
	deleteTaskGoal: deleteTaskGoal,
	createTaskGoal: createTaskGoal,
	comfirmTask: comfirmTask,
};

function process(req, res, next) {
	serverhelper.commonProcess(req, res, next, processes_map, false);
}

function readyLogin(req, res) {
	return co(function* () {
		if (req.session.logRsaPublicKeyPem == null) {
			rsa.generateKeyPair({ bits: 512, workers: 2 }, function (err, keypair) {
				req.session.logRsaPrivateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
				req.session.logRsaPublicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
				res.json({
					data: {
						publicKey: req.session.logRsaPublicKeyPem,
					}
				});
			});
		}
		else {
			res.json({
				data: {
					publicKey: req.session.logRsaPublicKeyPem,
				}
			});
		}
		return { banAutoReturn: true };
	});
}

function getUserTask(req, res) {
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var params_arr = [
			dbhelper.makeSqlparam('userid', sqlTypes.NVarChar(4000), g_envVar.userid),
		];
		var sql = 'select * from FTA02E员工可选任务(@userid)';
		var ret = yield dbhelper.asynQueryWithParams(sql,params_arr);
		return ret.recordset;
	});
}

function get用系统的用户(req, res) {
	return co(function* () {
		var sql = "select  distinct [使用系统人员].[员工登记姓名],[使用系统人员].[员工登记姓名代码],[使用系统人员].[所属系统名称],[使用系统人员].[所属部门名称] from (select [T113E员工信息快照].[员工登记姓名],[T113E员工信息快照].[员工登记姓名代码],[T113E员工信息快照].[所属系统名称],[T113E员工信息快照].[所属系统名称代码],[T113E员工信息快照].[所属部门名称],[T113E员工信息快照].[所属部门名称代码] from T113E员工信息快照 where ([T113E员工信息快照].[员工在职种类代码]=1)and([T113E员工信息快照].[是否使用系统]=1)) as [使用系统人员] order by [使用系统人员].[员工登记姓名]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function get所属工作组List(req, res) {
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var params_arr = [
			dbhelper.makeSqlparam('userid', sqlTypes.NVarChar(4000), g_envVar.userid),
		];
		var sql = "select  distinct [FTA01E归属小组某日].[工作小组名称],[FTA01E归属小组某日].[工作小组代码] from FTA01E归属小组某日(getdate(),@userid) order by [FTA01E归属小组某日].[工作小组名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function get可用项目List(req, res) {
	return co(function* () {
		var sql = "select [T203E项目状态快照].[项目登记名称],[T203E项目状态快照].[项目登记名称代码],项目运行阶段,case when 项目登记名称代码<=0 then 1 else 0 end 是否公共项目 from T203E项目状态快照 where [T203E项目状态快照].[项目运行阶段代码] in (1,3 ) order by 是否公共项目 desc,[T203E项目状态快照].[项目登记名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function get汇报频率List(req, res) {
	return co(function* () {
		var sql = "select  distinct [TA02B任务汇报频率].[汇报频率名称],[TA02B任务汇报频率].[任务汇报频率代码] from TA02B任务汇报频率 order by [TA02B任务汇报频率].[汇报频率名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}
function get周期单位List(req, res) {
	return co(function* () {
		var sql = "select  distinct [TA02B任务周期单位].[周期单位],[TA02B任务周期单位].[任务周期单位代码] from TA02B任务周期单位 order by [TA02B任务周期单位].[周期单位]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}
function get重要程度List(req, res) {
	return co(function* () {
		var params_arr = null;
		var sql = "select  distinct [TA02B任务重要程度].[重要程度名称],[TA02B任务重要程度].[任务重要程度代码] from TA02B任务重要程度 order by [TA02B任务重要程度].[重要程度名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function get任务类别List(req, res) {
	return co(function* () {
		var params_arr = null;
		var sql = "select  distinct [TA02B任务所属类别].[任务所属类别],[TA02B任务所属类别].[任务所属类别代码] from TA02B任务所属类别 order by [TA02B任务所属类别].[任务所属类别]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function getTCKFormData(req, res) {
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var params_arr = null;
		params_arr = [
			dbhelper.makeSqlparam('userid', sqlTypes.NVarChar(4000), req.session.g_envVar.userid),
		];
		var sql = "select [创建中的任务].[工作任务记录代码],[创建中的任务].[任务标题],[创建中的任务].[任务描述],[创建中的任务].[发起人员代码],[创建中的任务].[执行人员代码],[创建中的任务].[关联工作小组代码],[创建中的任务].[关联项目代码],[创建中的任务].[抄送人员明细],[创建中的任务].[有无期限],[创建中的任务].[开始日期],[创建中的任务].[截止日期],[创建中的任务].[汇报频率代码],[创建中的任务].[是否周期任务],[创建中的任务].[周期数值],[创建中的任务].[周期单位],[创建中的任务].[重要程度代码],[创建中的任务].[任务所属类别代码] from (select [TA02C工作任务记录].[工作任务记录代码],[TA02C工作任务记录].[任务标题],[TA02C工作任务记录].[任务描述],[TA02C工作任务记录].[发起人员代码],[TA02C工作任务记录].[执行人员代码],[TA02C工作任务记录].[关联工作小组代码],[TA02C工作任务记录].[关联项目代码],[TA02C工作任务记录].[抄送人员明细],[TA02C工作任务记录].[有无期限],[TA02C工作任务记录].[开始日期],[TA02C工作任务记录].[截止日期],[TA02C工作任务记录].[汇报频率代码],[TA02C工作任务记录].[是否周期任务],[TA02C工作任务记录].[周期数值],[TA02C工作任务记录].[周期单位],[TA02C工作任务记录].[重要程度代码],[TA02C工作任务记录].[登记确认状态],[TA02C工作任务记录].[登记确认用户],[TA02C工作任务记录].[登记确认时间],[TA02C工作任务记录].[最新所处状态代码],[TA02C工作任务记录].[任务所属类别代码] from TA02C工作任务记录 inner join TA02D任务所处状态 on ([TA02C工作任务记录].[最新所处状态代码]=[TA02D任务所处状态].[任务所处状态代码])and([TA02D任务所处状态].[任务状态类型代码]=1)and([TA02C工作任务记录].[登记确认用户]=@userid)) as [创建中的任务]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function get任务目标(req, res) {
	return co(function* () {
		if (req.body.taskid == null) { return serverhelper.createErrorRet('没有提供任务代码', 0, null); };
		var params_arr = null;
		params_arr = [
			dbhelper.makeSqlparam('pagein_任务代码', sqlTypes.Int, req.body.taskid),
		];
		var sql = "select [TA03D任务目标记录].[目标描述],[TA03D任务目标记录].[任务目标记录代码] from TA03D任务目标记录 where [TA03D任务目标记录].[工作任务记录代码]=(@pagein_任务代码)";
		if (sql == null || sql.length == 0) { return serverhelper.createErrorRet('生成sql失败'); }
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

function modifyTaskGoal(req, res) {
	var update_table_0params_arr = null;
	var scriptBP_18_bundle = req.body.bundle;
	var Form1_nowRecord;
	var update_table_0_sql = '';
	var TK_Text_7_value;
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if (scriptBP_18_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var update_table_0_update = '[目标描述]=@update_table_0_目标描述';
		Form1_nowRecord = scriptBP_18_bundle.Form1_nowRecord;
		TK_Text_7_value = scriptBP_18_bundle.TK_Text_7_value;
		var update_table_0_RCDKEY = Form1_nowRecord['任务目标记录代码'];
		if (serverhelper.IsEmptyString(update_table_0_RCDKEY)) { return serverhelper.createErrorRet("参数[RCDKEY]传入错误"); }
		var update_table_0_目标描述 = TK_Text_7_value;
		if (serverhelper.IsEmptyString(update_table_0_目标描述)) { return serverhelper.createErrorRet("列[目标描述]的传入值错误"); }
		update_table_0_sql = "update TA03D任务目标记录 set " + update_table_0_update + " where [任务目标记录代码]=@RCDKEY";
		update_table_0params_arr = [
			dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, update_table_0_RCDKEY),
			dbhelper.makeSqlparam('update_table_0_目标描述', sqlTypes.NVarChar(4000), update_table_0_目标描述),
		];
		var data_update_table_0 = -1;
		try {
			data_update_table_0 = yield dbhelper.asynGetScalar(update_table_0_sql + ' select @@ROWCOUNT', update_table_0params_arr);
		} catch (err_update_table_0) {
			return serverhelper.createErrorRet(err_update_table_0.message);
		}
		return data_update_table_0;
	});
}

function deleteTaskGoal(req, res) {
	var scriptBP_19_bundle = req.body.bundle;
	var delete_table_0params_arr = null;
	var Form1_nowRecord;
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		Form1_nowRecord = scriptBP_19_bundle.Form1_nowRecord;
		if (scriptBP_19_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var delete_table_0_目标记录代码 = Form1_nowRecord['任务目标记录代码'];
		if (delete_table_0_目标记录代码 == null) { return serverhelper.createErrorRet("缺少参数[目标记录代码]"); }
		delete_table_0params_arr = [
			dbhelper.makeSqlparam('目标记录代码', sqlTypes.NVarChar(4000), delete_table_0_目标记录代码),
			dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),
		];
		try {
			data_delete_table_0 = yield dbhelper.asynGetScalar("delete [TA03D任务目标记录] where [TA03D任务目标记录].[任务目标记录代码]=@目标记录代码" + ' select @@ROWCOUNT', delete_table_0params_arr);
		} catch (err_delete_table_0) {
			return serverhelper.createErrorRet(err_delete_table_0.message);
		}
		return data_delete_table_0;
	});
}

function createTaskGoal(req, res) {
	var insert_table_0params_arr = null;
	var scriptBP_17_bundle = req.body.bundle;
	var TaskGoalSetter_任务代码;
	var TK_Text_7_value;
	var excute_pro_0params_arr = null;
	var excute_pro_0outparams_arr = null;
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if (scriptBP_17_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var insert_table_0_insert = 'insert into [TA03D任务目标记录]([工作任务记录代码],[目标描述],[登记确认状态],[登记确认用户],[登记确认时间])';
		var insert_table_0_values = ' values(@insert_table_0_工作任务记录代码,@insert_table_0_目标描述,1,@_operator,getdate())';
		TaskGoalSetter_任务代码 = scriptBP_17_bundle.TaskGoalSetter_任务代码;
		TK_Text_7_value = scriptBP_17_bundle.TK_Text_7_value;
		var insert_table_0_工作任务记录代码 = TaskGoalSetter_任务代码;
		if (serverhelper.IsEmptyString(insert_table_0_工作任务记录代码)) { return serverhelper.createErrorRet("列[工作任务记录代码]的传入值错误"); }
		var insert_table_0_目标描述 = TK_Text_7_value;
		if (serverhelper.IsEmptyString(insert_table_0_目标描述)) { return serverhelper.createErrorRet("列[目标描述]的传入值错误"); }
		insert_table_0params_arr = [
			dbhelper.makeSqlparam('insert_table_0_工作任务记录代码', sqlTypes.NVarChar(4000), insert_table_0_工作任务记录代码),
			dbhelper.makeSqlparam('insert_table_0_目标描述', sqlTypes.NVarChar(4000), insert_table_0_目标描述),
			dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),
		];
		var insert_table_0_sql = insert_table_0_insert + insert_table_0_values;
		var data_insert_table_0 = -1;
		try {
			data_insert_table_0 = yield dbhelper.asynGetScalar(insert_table_0_sql + ' select SCOPE_IDENTITY()', insert_table_0params_arr);
		} catch (err_insert_table_0) {
			return serverhelper.createErrorRet(err_insert_table_0.message);
		}
		var excute_pro_0_p目标记录代码 = data_insert_table_0;
		if (excute_pro_0_p目标记录代码 == null) { return serverhelper.createErrorRet("参数[目标记录代码]传入值错误"); }
		var excute_pro_0_p状态类型代码 = 2;
		if (excute_pro_0_p状态类型代码 == null) { return serverhelper.createErrorRet("参数[状态类型代码]传入值错误"); }
		var excute_pro_0_p操作用户 = g_envVar.userid;
		if (excute_pro_0_p操作用户 == null) { return serverhelper.createErrorRet("参数[操作用户]传入值错误"); }
		excute_pro_0params_arr = [
			dbhelper.makeSqlparam('目标记录代码', sqlTypes.NVarChar(4000), excute_pro_0_p目标记录代码),
			dbhelper.makeSqlparam('状态类型代码', sqlTypes.NVarChar(4000), excute_pro_0_p状态类型代码),
			dbhelper.makeSqlparam('操作用户', sqlTypes.NVarChar(4000), excute_pro_0_p操作用户),
		];
		excute_pro_0outparams_arr = [
			dbhelper.makeSqlparam('执行成功', sqlTypes.Int),
			dbhelper.makeSqlparam('错误描述', sqlTypes.NVarChar(4000)),
		];
		var excute_pro_0_ret = null;
		try {
			excute_pro_0_ret = yield dbhelper.asynExcute('PA03E设置任务目标状态', excute_pro_0params_arr, excute_pro_0outparams_arr);
			if (excute_pro_0_ret.output.执行成功 != 1) {
				return serverhelper.createErrorRet(excute_pro_0_ret.output.错误描述 ? excute_pro_0_ret.output.错误描述 : '[PA03E设置任务目标状态]执行失败但未给出失败理由。');
			}
		}
		catch (eo) {
			return serverhelper.createErrorRet(eo.message);
		}
		return data_insert_table_0;
	});
}

function comfirmTask(req, res) {
	var bundle = req.body.bundle;
	var querysql_0params_arr = null;
	var querysql_0sql = "select top 1 count([TA03D任务目标记录].[任务目标记录代码]) as [数量] from TA03D任务目标记录 where [TA03D任务目标记录].[工作任务记录代码]=@任务代码 group by [TA03D任务目标记录].[工作任务记录代码]";
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if (bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var querysql_0_p任务代码 = bundle.任务代码;
		if (querysql_0_p任务代码 == null) { return serverhelper.createErrorRet("参数[任务代码]传入值错误"); }
		querysql_0params_arr = [
			dbhelper.makeSqlparam('任务代码', sqlTypes.Int, querysql_0_p任务代码),
		];
		var goalCount = null;
		try {
			goalCount = yield dbhelper.asynGetScalar(querysql_0sql, querysql_0params_arr);
			if (goalCount == 0) {
				return serverhelper.createErrorRet('任务需要至少一个目标');
			}
			var excute_pro_0params_arr = [
				dbhelper.makeSqlparam('任务记录代码', sqlTypes.Int, querysql_0_p任务代码),
				dbhelper.makeSqlparam('状态类型代码', sqlTypes.Int, 2),
				dbhelper.makeSqlparam('操作用户', sqlTypes.Int, g_envVar.userid),
			];
			var excute_pro_0outparams_arr = [
				dbhelper.makeSqlparam('执行成功', sqlTypes.Int),
				dbhelper.makeSqlparam('错误描述', sqlTypes.NVarChar(4000)),
			];
			var excute_pro_0_ret = null;
			excute_pro_0_ret = yield dbhelper.asynExcute('PA02E设置任务状态', excute_pro_0params_arr, excute_pro_0outparams_arr);
			if (excute_pro_0_ret.output.执行成功 != 1) {
				return serverhelper.createErrorRet(excute_pro_0_ret.output.错误描述 ? excute_pro_0_ret.output.错误描述 : '[PA02E设置任务状态]执行失败但未给出失败理由。');
			}
		}
		catch (eo) {
			return serverhelper.createErrorRet(eo.message);
		}
		return goalCount;
	});
}

function modifyTask(req, res) {
	var update_table_0params_arr = null;
	var scriptBP_12_bundle = req.body.bundle;
	var Form0_nowRecord;
	var update_table_0_sql = '';
	var TK_Text_0_value;
	var TK_Text_1_value;
	var TK_Dropdown_8_value;
	var TK_Dropdown_0_value;
	var TK_Dropdown_1_value;
	var TK_Dropdown_2_value;
	var TK_Dropdown_3_value;
	var TK_Dropdown_4_value;
	var TK_CheckBox_0_value;
	var TK_Text_4_value;
	var TK_Text_2_value;
	var TK_Dropdown_5_value;
	var TK_CheckBox_1_value;
	var TK_Text_3_value;
	var TK_Dropdown_6_value;
	var TK_Dropdown_7_value;
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if (scriptBP_12_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var update_table_0_update = '[任务标题]=@update_table_0_任务标题,[任务描述]=@update_table_0_任务描述,[发起人员代码]=@update_table_0_发起人员代码,[执行人员代码]=@update_table_0_执行人员代码,[关联工作小组代码]=@update_table_0_关联工作小组代码,[关联项目代码]=@update_table_0_关联项目代码,[有无期限]=@update_table_0_有无期限,[开始日期]=@update_table_0_开始日期,[汇报频率代码]=@update_table_0_汇报频率代码,[是否周期任务]=@update_table_0_是否周期任务,[重要程度代码]=@update_table_0_重要程度代码';
		Form0_nowRecord = scriptBP_12_bundle.Form0_nowRecord;
		TK_Text_0_value = scriptBP_12_bundle.TK_Text_0_value;
		TK_Text_1_value = scriptBP_12_bundle.TK_Text_1_value;
		TK_Dropdown_8_value = scriptBP_12_bundle.TK_Dropdown_8_value;
		TK_Dropdown_0_value = scriptBP_12_bundle.TK_Dropdown_0_value;
		TK_Dropdown_1_value = scriptBP_12_bundle.TK_Dropdown_1_value;
		TK_Dropdown_2_value = scriptBP_12_bundle.TK_Dropdown_2_value;
		TK_Dropdown_3_value = scriptBP_12_bundle.TK_Dropdown_3_value;
		TK_Dropdown_4_value = scriptBP_12_bundle.TK_Dropdown_4_value;
		TK_CheckBox_0_value = scriptBP_12_bundle.TK_CheckBox_0_value;
		TK_Text_4_value = scriptBP_12_bundle.TK_Text_4_value;
		TK_Text_2_value = scriptBP_12_bundle.TK_Text_2_value;
		TK_Dropdown_5_value = scriptBP_12_bundle.TK_Dropdown_5_value;
		TK_CheckBox_1_value = scriptBP_12_bundle.TK_CheckBox_1_value;
		TK_Text_3_value = scriptBP_12_bundle.TK_Text_3_value;
		TK_Dropdown_6_value = scriptBP_12_bundle.TK_Dropdown_6_value;
		TK_Dropdown_7_value = scriptBP_12_bundle.TK_Dropdown_7_value;
		var update_table_0_RCDKEY = Form0_nowRecord['工作任务记录代码'];
		if (serverhelper.IsEmptyString(update_table_0_RCDKEY)) { return serverhelper.createErrorRet("参数[RCDKEY]传入错误"); }
		var update_table_0_任务标题 = TK_Text_0_value;
		if (serverhelper.IsEmptyString(update_table_0_任务标题)) { return serverhelper.createErrorRet("列[任务标题]的传入值错误"); }
		var update_table_0_任务描述 = TK_Text_1_value;
		if (serverhelper.IsEmptyString(update_table_0_任务描述)) { return serverhelper.createErrorRet("列[任务描述]的传入值错误"); }
		var update_table_0_任务所属类别代码 = TK_Dropdown_8_value;
		if (!serverhelper.IsEmptyString(update_table_0_任务所属类别代码)) {
			update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[任务所属类别代码]=@update_table_0_任务所属类别代码';
		}
		else { update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[任务所属类别代码]=default'; }
		var update_table_0_发起人员代码 = TK_Dropdown_0_value;
		if (serverhelper.IsEmptyString(update_table_0_发起人员代码)) { return serverhelper.createErrorRet("列[发起人员代码]的传入值错误"); }
		var update_table_0_执行人员代码 = TK_Dropdown_1_value;
		if (serverhelper.IsEmptyString(update_table_0_执行人员代码)) { return serverhelper.createErrorRet("列[执行人员代码]的传入值错误"); }
		var update_table_0_关联工作小组代码 = TK_Dropdown_2_value;
		if (serverhelper.IsEmptyString(update_table_0_关联工作小组代码)) { return serverhelper.createErrorRet("列[关联工作小组代码]的传入值错误"); }
		var update_table_0_关联项目代码 = TK_Dropdown_3_value;
		if (serverhelper.IsEmptyString(update_table_0_关联项目代码)) { return serverhelper.createErrorRet("列[关联项目代码]的传入值错误"); }
		var update_table_0_抄送人员明细 = TK_Dropdown_4_value;
		if (!serverhelper.IsEmptyString(update_table_0_抄送人员明细)) {
			update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[抄送人员明细]=@update_table_0_抄送人员明细';
		}
		else { update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[抄送人员明细]=default'; }
		var update_table_0_有无期限 = TK_CheckBox_0_value;
		if (serverhelper.IsEmptyString(update_table_0_有无期限)) { return serverhelper.createErrorRet("列[有无期限]的传入值错误"); }
		var update_table_0_开始日期 = TK_Text_4_value;
		if (serverhelper.IsEmptyString(update_table_0_开始日期)) { return serverhelper.createErrorRet("列[开始日期]的传入值错误"); }
		var update_table_0_截止日期 = TK_Text_2_value;
		if (!serverhelper.IsEmptyString(update_table_0_截止日期)) {
			update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[截止日期]=@update_table_0_截止日期';
		}
		else { update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[截止日期]=default'; }
		var update_table_0_汇报频率代码 = TK_Dropdown_5_value;
		if (serverhelper.IsEmptyString(update_table_0_汇报频率代码)) { return serverhelper.createErrorRet("列[汇报频率代码]的传入值错误"); }
		var update_table_0_是否周期任务 = TK_CheckBox_1_value;
		if (serverhelper.IsEmptyString(update_table_0_是否周期任务)) { return serverhelper.createErrorRet("列[是否周期任务]的传入值错误"); }
		var update_table_0_周期数值 = TK_Text_3_value;
		if (!serverhelper.IsEmptyString(update_table_0_周期数值)) {
			update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[周期数值]=@update_table_0_周期数值';
		}
		else { update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[周期数值]=default'; }
		var update_table_0_周期单位 = TK_Dropdown_6_value;
		if (!serverhelper.IsEmptyString(update_table_0_周期单位)) {
			update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[周期单位]=@update_table_0_周期单位';
		}
		else { update_table_0_update += (update_table_0_update.length == 0 ? '' : ',') + '[周期单位]=default'; }
		var update_table_0_重要程度代码 = TK_Dropdown_7_value;
		if (serverhelper.IsEmptyString(update_table_0_重要程度代码)) { return serverhelper.createErrorRet("列[重要程度代码]的传入值错误"); }
		update_table_0_sql = "update TA02C工作任务记录 set " + update_table_0_update + " where [工作任务记录代码]=@RCDKEY";
		update_table_0params_arr = [
			dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, update_table_0_RCDKEY),
			dbhelper.makeSqlparam('update_table_0_任务标题', sqlTypes.NVarChar(4000), update_table_0_任务标题),
			dbhelper.makeSqlparam('update_table_0_任务描述', sqlTypes.NVarChar(4000), update_table_0_任务描述),
			dbhelper.makeSqlparam('update_table_0_任务所属类别代码', sqlTypes.NVarChar(4000), update_table_0_任务所属类别代码),
			dbhelper.makeSqlparam('update_table_0_发起人员代码', sqlTypes.NVarChar(4000), update_table_0_发起人员代码),
			dbhelper.makeSqlparam('update_table_0_执行人员代码', sqlTypes.NVarChar(4000), update_table_0_执行人员代码),
			dbhelper.makeSqlparam('update_table_0_关联工作小组代码', sqlTypes.NVarChar(4000), update_table_0_关联工作小组代码),
			dbhelper.makeSqlparam('update_table_0_关联项目代码', sqlTypes.NVarChar(4000), update_table_0_关联项目代码),
			dbhelper.makeSqlparam('update_table_0_抄送人员明细', sqlTypes.NVarChar(4000), update_table_0_抄送人员明细),
			dbhelper.makeSqlparam('update_table_0_有无期限', sqlTypes.NVarChar(4000), update_table_0_有无期限),
			dbhelper.makeSqlparam('update_table_0_开始日期', sqlTypes.NVarChar(4000), update_table_0_开始日期),
			dbhelper.makeSqlparam('update_table_0_截止日期', sqlTypes.NVarChar(4000), update_table_0_截止日期),
			dbhelper.makeSqlparam('update_table_0_汇报频率代码', sqlTypes.NVarChar(4000), update_table_0_汇报频率代码),
			dbhelper.makeSqlparam('update_table_0_是否周期任务', sqlTypes.NVarChar(4000), update_table_0_是否周期任务),
			dbhelper.makeSqlparam('update_table_0_周期数值', sqlTypes.NVarChar(4000), update_table_0_周期数值),
			dbhelper.makeSqlparam('update_table_0_周期单位', sqlTypes.NVarChar(4000), update_table_0_周期单位),
			dbhelper.makeSqlparam('update_table_0_重要程度代码', sqlTypes.NVarChar(4000), update_table_0_重要程度代码),
		];
		var data_update_table_0 = -1;
		try {
			data_update_table_0 = yield dbhelper.asynGetScalar(update_table_0_sql + ' select @@ROWCOUNT', update_table_0params_arr);
		} catch (err_update_table_0) {
			return serverhelper.createErrorRet(err_update_table_0.message);
		}
		return data_update_table_0;
	});
}

function repealTask(req, res) {
	var scriptBP_11_bundle = req.body.bundle;
	var excute_pro_0params_arr = null;
	var excute_pro_0outparams_arr = null;
	var Form0_nowRecord;
	return co(function* () {
		if (scriptBP_11_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		Form0_nowRecord = scriptBP_11_bundle.Form0_nowRecord;
		var excute_pro_0_p任务记录代码 = Form0_nowRecord['工作任务记录代码'];
		if (excute_pro_0_p任务记录代码 == null) { return serverhelper.createErrorRet("参数[任务记录代码]传入值错误"); }
		excute_pro_0params_arr = [
			dbhelper.makeSqlparam('任务记录代码', sqlTypes.NVarChar(4000), excute_pro_0_p任务记录代码),
		];
		excute_pro_0outparams_arr = [
			dbhelper.makeSqlparam('执行成功', sqlTypes.Int),
			dbhelper.makeSqlparam('错误描述', sqlTypes.NVarChar(4000)),
		];
		var excute_pro_0_ret = null;
		try {
			excute_pro_0_ret = yield dbhelper.asynExcute('PA02E撤销工作任务', excute_pro_0params_arr, excute_pro_0outparams_arr);
			if (excute_pro_0_ret.output.执行成功 != 1) {
				return serverhelper.createErrorRet(excute_pro_0_ret.output.错误描述 ? excute_pro_0_ret.output.错误描述 : '[PA02E撤销工作任务]执行失败但未给出失败理由。');
			}
		}
		catch (eo) {
			return serverhelper.createErrorRet(eo.message);
		}
		return excute_pro_0_ret;
	});
}

function createTask(req, res) {
	var insert_table_0params_arr = null;
	var scriptBP_9_bundle = req.body.bundle;
	var TK_Text_0_value;
	var TK_Text_1_value;
	var TK_Dropdown_8_value;
	var TK_Dropdown_0_value;
	var TK_Dropdown_1_value;
	var TK_Dropdown_2_value;
	var TK_Dropdown_3_value;
	var TK_Dropdown_4_value;
	var TK_CheckBox_0_value;
	var TK_Text_4_value;
	var TK_Text_2_value;
	var TK_Dropdown_5_value;
	var TK_CheckBox_1_value;
	var TK_Text_3_value;
	var TK_Dropdown_6_value;
	var TK_Dropdown_7_value;
	var excute_pro_0params_arr = null;
	var excute_pro_0outparams_arr = null;
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		if (scriptBP_9_bundle == null) { return serverhelper.createErrorRet('缺少参数bundle'); }
		var insert_table_0_insert = 'insert into [TA02C工作任务记录]([任务标题],[任务描述],[发起人员代码],[执行人员代码],[关联工作小组代码],[关联项目代码],[有无期限],[开始日期],[汇报频率代码],[是否周期任务],[重要程度代码],[登记确认状态],[登记确认用户],[登记确认时间]';
		var insert_table_0_values = ' values(@insert_table_0_任务标题,@insert_table_0_任务描述,@insert_table_0_发起人员代码,@insert_table_0_执行人员代码,@insert_table_0_关联工作小组代码,@insert_table_0_关联项目代码,@insert_table_0_有无期限,@insert_table_0_开始日期,@insert_table_0_汇报频率代码,@insert_table_0_是否周期任务,@insert_table_0_重要程度代码,1,@_operator,getdate()';
		TK_Text_0_value = scriptBP_9_bundle.TK_Text_0_value;
		TK_Text_1_value = scriptBP_9_bundle.TK_Text_1_value;
		TK_Dropdown_8_value = scriptBP_9_bundle.TK_Dropdown_8_value;
		TK_Dropdown_0_value = scriptBP_9_bundle.TK_Dropdown_0_value;
		TK_Dropdown_1_value = scriptBP_9_bundle.TK_Dropdown_1_value;
		TK_Dropdown_2_value = scriptBP_9_bundle.TK_Dropdown_2_value;
		TK_Dropdown_3_value = scriptBP_9_bundle.TK_Dropdown_3_value;
		TK_Dropdown_4_value = scriptBP_9_bundle.TK_Dropdown_4_value;
		TK_CheckBox_0_value = scriptBP_9_bundle.TK_CheckBox_0_value;
		TK_Text_4_value = scriptBP_9_bundle.TK_Text_4_value;
		TK_Text_2_value = scriptBP_9_bundle.TK_Text_2_value;
		TK_Dropdown_5_value = scriptBP_9_bundle.TK_Dropdown_5_value;
		TK_CheckBox_1_value = scriptBP_9_bundle.TK_CheckBox_1_value;
		TK_Text_3_value = scriptBP_9_bundle.TK_Text_3_value;
		TK_Dropdown_6_value = scriptBP_9_bundle.TK_Dropdown_6_value;
		TK_Dropdown_7_value = scriptBP_9_bundle.TK_Dropdown_7_value;
		var insert_table_0_任务标题 = TK_Text_0_value;
		if (serverhelper.IsEmptyString(insert_table_0_任务标题)) { return serverhelper.createErrorRet("列[任务标题]的传入值错误"); }
		var insert_table_0_任务描述 = TK_Text_1_value;
		if (serverhelper.IsEmptyString(insert_table_0_任务描述)) { return serverhelper.createErrorRet("列[任务描述]的传入值错误"); }
		var insert_table_0_任务所属类别代码 = TK_Dropdown_8_value;
		if (!serverhelper.IsEmptyString(insert_table_0_任务所属类别代码)) {
			insert_table_0_insert += ',[任务所属类别代码]';
			insert_table_0_values += ',@insert_table_0_任务所属类别代码';
		}
		var insert_table_0_发起人员代码 = TK_Dropdown_0_value;
		if (serverhelper.IsEmptyString(insert_table_0_发起人员代码)) { return serverhelper.createErrorRet("列[发起人员代码]的传入值错误"); }
		var insert_table_0_执行人员代码 = TK_Dropdown_1_value;
		if (serverhelper.IsEmptyString(insert_table_0_执行人员代码)) { return serverhelper.createErrorRet("列[执行人员代码]的传入值错误"); }
		var insert_table_0_关联工作小组代码 = TK_Dropdown_2_value;
		if (serverhelper.IsEmptyString(insert_table_0_关联工作小组代码)) { return serverhelper.createErrorRet("列[关联工作小组代码]的传入值错误"); }
		var insert_table_0_关联项目代码 = TK_Dropdown_3_value;
		if (serverhelper.IsEmptyString(insert_table_0_关联项目代码)) { return serverhelper.createErrorRet("列[关联项目代码]的传入值错误"); }
		var insert_table_0_抄送人员明细 = TK_Dropdown_4_value;
		if (!serverhelper.IsEmptyString(insert_table_0_抄送人员明细)) {
			insert_table_0_insert += ',[抄送人员明细]';
			insert_table_0_values += ',@insert_table_0_抄送人员明细';
		}
		var insert_table_0_有无期限 = TK_CheckBox_0_value;
		if (serverhelper.IsEmptyString(insert_table_0_有无期限)) { return serverhelper.createErrorRet("列[有无期限]的传入值错误"); }
		var insert_table_0_开始日期 = TK_Text_4_value;
		if (serverhelper.IsEmptyString(insert_table_0_开始日期)) { return serverhelper.createErrorRet("列[开始日期]的传入值错误"); }
		var insert_table_0_截止日期 = TK_Text_2_value;
		if (!serverhelper.IsEmptyString(insert_table_0_截止日期)) {
			insert_table_0_insert += ',[截止日期]';
			insert_table_0_values += ',@insert_table_0_截止日期';
		}
		var insert_table_0_汇报频率代码 = TK_Dropdown_5_value;
		if (serverhelper.IsEmptyString(insert_table_0_汇报频率代码)) { return serverhelper.createErrorRet("列[汇报频率代码]的传入值错误"); }
		var insert_table_0_是否周期任务 = TK_CheckBox_1_value;
		if (serverhelper.IsEmptyString(insert_table_0_是否周期任务)) { return serverhelper.createErrorRet("列[是否周期任务]的传入值错误"); }
		var insert_table_0_周期数值 = TK_Text_3_value;
		if (!serverhelper.IsEmptyString(insert_table_0_周期数值)) {
			insert_table_0_insert += ',[周期数值]';
			insert_table_0_values += ',@insert_table_0_周期数值';
		}
		var insert_table_0_周期单位 = TK_Dropdown_6_value;
		if (!serverhelper.IsEmptyString(insert_table_0_周期单位)) {
			insert_table_0_insert += ',[周期单位]';
			insert_table_0_values += ',@insert_table_0_周期单位';
		}
		var insert_table_0_重要程度代码 = TK_Dropdown_7_value;
		if (serverhelper.IsEmptyString(insert_table_0_重要程度代码)) { return serverhelper.createErrorRet("列[重要程度代码]的传入值错误"); }
		insert_table_0_insert += ')';
		insert_table_0_values += ')';
		insert_table_0params_arr = [
			dbhelper.makeSqlparam('insert_table_0_任务标题', sqlTypes.NVarChar(4000), insert_table_0_任务标题),
			dbhelper.makeSqlparam('insert_table_0_任务描述', sqlTypes.NVarChar(4000), insert_table_0_任务描述),
			dbhelper.makeSqlparam('insert_table_0_任务所属类别代码', sqlTypes.NVarChar(4000), insert_table_0_任务所属类别代码),
			dbhelper.makeSqlparam('insert_table_0_发起人员代码', sqlTypes.NVarChar(4000), insert_table_0_发起人员代码),
			dbhelper.makeSqlparam('insert_table_0_执行人员代码', sqlTypes.NVarChar(4000), insert_table_0_执行人员代码),
			dbhelper.makeSqlparam('insert_table_0_关联工作小组代码', sqlTypes.NVarChar(4000), insert_table_0_关联工作小组代码),
			dbhelper.makeSqlparam('insert_table_0_关联项目代码', sqlTypes.NVarChar(4000), insert_table_0_关联项目代码),
			dbhelper.makeSqlparam('insert_table_0_抄送人员明细', sqlTypes.NVarChar(4000), insert_table_0_抄送人员明细),
			dbhelper.makeSqlparam('insert_table_0_有无期限', sqlTypes.NVarChar(4000), insert_table_0_有无期限),
			dbhelper.makeSqlparam('insert_table_0_开始日期', sqlTypes.NVarChar(4000), insert_table_0_开始日期),
			dbhelper.makeSqlparam('insert_table_0_截止日期', sqlTypes.NVarChar(4000), insert_table_0_截止日期),
			dbhelper.makeSqlparam('insert_table_0_汇报频率代码', sqlTypes.NVarChar(4000), insert_table_0_汇报频率代码),
			dbhelper.makeSqlparam('insert_table_0_是否周期任务', sqlTypes.NVarChar(4000), insert_table_0_是否周期任务),
			dbhelper.makeSqlparam('insert_table_0_周期数值', sqlTypes.NVarChar(4000), insert_table_0_周期数值),
			dbhelper.makeSqlparam('insert_table_0_周期单位', sqlTypes.NVarChar(4000), insert_table_0_周期单位),
			dbhelper.makeSqlparam('insert_table_0_重要程度代码', sqlTypes.NVarChar(4000), insert_table_0_重要程度代码),
			dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),
		];
		var insert_table_0_sql = insert_table_0_insert + insert_table_0_values;
		var data_insert_table_0 = -1;
		try {
			data_insert_table_0 = yield dbhelper.asynGetScalar(insert_table_0_sql + ' select SCOPE_IDENTITY()', insert_table_0params_arr);
		} catch (err_insert_table_0) {
			return serverhelper.createErrorRet(err_insert_table_0.message);
		}
		var excute_pro_0_p任务记录代码 = data_insert_table_0;
		if (excute_pro_0_p任务记录代码 == null) { return serverhelper.createErrorRet("参数[任务记录代码]传入值错误"); }
		var excute_pro_0_p状态类型代码 = 1;
		if (excute_pro_0_p状态类型代码 == null) { return serverhelper.createErrorRet("参数[状态类型代码]传入值错误"); }
		var excute_pro_0_p操作用户 = g_envVar.userid;
		if (excute_pro_0_p操作用户 == null) { return serverhelper.createErrorRet("参数[操作用户]传入值错误"); }
		excute_pro_0params_arr = [
			dbhelper.makeSqlparam('任务记录代码', sqlTypes.NVarChar(4000), excute_pro_0_p任务记录代码),
			dbhelper.makeSqlparam('状态类型代码', sqlTypes.NVarChar(4000), excute_pro_0_p状态类型代码),
			dbhelper.makeSqlparam('操作用户', sqlTypes.NVarChar(4000), excute_pro_0_p操作用户),
		];
		excute_pro_0outparams_arr = [
			dbhelper.makeSqlparam('执行成功', sqlTypes.Int),
			dbhelper.makeSqlparam('错误描述', sqlTypes.NVarChar(4000)),
		];
		var excute_pro_0_ret = null;
		try {
			excute_pro_0_ret = yield dbhelper.asynExcute('PA02E设置任务状态', excute_pro_0params_arr, excute_pro_0outparams_arr);
			if (excute_pro_0_ret.output.执行成功 != 1) {
				return serverhelper.createErrorRet(excute_pro_0_ret.output.错误描述 ? excute_pro_0_ret.output.错误描述 : '[PA02E设置任务状态]执行失败但未给出失败理由。');
			}
		}
		catch (eo) {
			return serverhelper.createErrorRet(eo.message);
		}
		return data_insert_table_0;
	});
}

module.exports = process;