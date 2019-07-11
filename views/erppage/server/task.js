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

function getUserTask() {
    return co(function* () {
        var sql = 'SELECT [系统方案名称代码],[系统方案名称],[方案英文名称],[桌面端名称],[移动端名称],[是否列表可见],[完成确认状态],[系统流程名称],[系统流程简称] FROM [base1].[dbo].[V002C系统方案名称] where [是否列表可见] = 1 and [终止确认状态] = 0';
        var ret = yield dbhelper.asynQueryWithParams(sql);
        return ret.recordset;
    });
}

function get用系统的用户(req,res){
	return co(function* () {
		var sql = "select  distinct [使用系统人员].[员工登记姓名],[使用系统人员].[员工登记姓名代码],[使用系统人员].[所属系统名称],[使用系统人员].[所属部门名称] from (select [T113E员工信息快照].[员工登记姓名],[T113E员工信息快照].[员工登记姓名代码],[T113E员工信息快照].[所属系统名称],[T113E员工信息快照].[所属系统名称代码],[T113E员工信息快照].[所属部门名称],[T113E员工信息快照].[所属部门名称代码] from T113E员工信息快照 where ([T113E员工信息快照].[员工在职种类代码]=1)and([T113E员工信息快照].[是否使用系统]=1)) as [使用系统人员] order by [使用系统人员].[员工登记姓名]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function get所属工作组List(req,res){
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

function get可用项目List(req,res){
	return co(function* () {
		var sql = "select  distinct [T203E项目状态快照].[项目登记名称],[T203E项目状态快照].[项目登记名称代码],[T203E项目状态快照].[项目运行阶段] from T203E项目状态快照 where  [T203E项目状态快照].[项目运行阶段代码] in (1,3 )  order by [T203E项目状态快照].[项目登记名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function get汇报频率List(req,res){
	return co(function* () {
		var sql = "select  distinct [TA02B任务汇报频率].[汇报频率名称],[TA02B任务汇报频率].[任务汇报频率代码] from TA02B任务汇报频率 order by [TA02B任务汇报频率].[汇报频率名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}
function get周期单位List(req,res){
	return co(function* () {
		var sql = "select  distinct [TA02B任务周期单位].[周期单位],[TA02B任务周期单位].[任务周期单位代码] from TA02B任务周期单位 order by [TA02B任务周期单位].[周期单位]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}
function get重要程度List(req,res){
	return co(function* () {
		var params_arr = null;
		var sql = "select  distinct [TA02B任务重要程度].[重要程度名称],[TA02B任务重要程度].[任务重要程度代码] from TA02B任务重要程度 order by [TA02B任务重要程度].[重要程度名称]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql);
		return rcdRlt.recordset;
	});
}

function getTCKFormData(req,res){
	var g_envVar = req.session.g_envVar;
	return co(function* () {
		var params_arr = null;
		params_arr=[
			dbhelper.makeSqlparam('userid', sqlTypes.NVarChar(4000), req.session.g_envVar.userid),
		];
		var sql = "select [创建中的任务].[工作任务记录代码],[创建中的任务].[任务标题],[创建中的任务].[任务描述],[创建中的任务].[发起人员代码],[创建中的任务].[执行人员代码],[创建中的任务].[关联工作小组代码],[创建中的任务].[关联项目代码],[创建中的任务].[抄送人员明细],[创建中的任务].[有无期限],[创建中的任务].[开始日期],[创建中的任务].[截止日期],[创建中的任务].[汇报频率代码],[创建中的任务].[是否周期任务],[创建中的任务].[周期数值],[创建中的任务].[周期单位],[创建中的任务].[重要程度代码] from (select [TA02C工作任务记录].[工作任务记录代码],[TA02C工作任务记录].[任务标题],[TA02C工作任务记录].[任务描述],[TA02C工作任务记录].[发起人员代码],[TA02C工作任务记录].[执行人员代码],[TA02C工作任务记录].[关联工作小组代码],[TA02C工作任务记录].[关联项目代码],[TA02C工作任务记录].[抄送人员明细],[TA02C工作任务记录].[有无期限],[TA02C工作任务记录].[开始日期],[TA02C工作任务记录].[截止日期],[TA02C工作任务记录].[汇报频率代码],[TA02C工作任务记录].[是否周期任务],[TA02C工作任务记录].[周期数值],[TA02C工作任务记录].[周期单位],[TA02C工作任务记录].[重要程度代码],[TA02C工作任务记录].[登记确认状态],[TA02C工作任务记录].[登记确认用户],[TA02C工作任务记录].[登记确认时间],[TA02C工作任务记录].[最新所处状态代码] from TA02C工作任务记录 inner join TA02D任务所处状态 on ([TA02C工作任务记录].[最新所处状态代码]=[TA02D任务所处状态].[任务所处状态代码])and([TA02D任务所处状态].[任务状态类型代码]=1)and([TA02C工作任务记录].[登记确认用户]=@userid)) as [创建中的任务]";
		var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
		return rcdRlt.recordset;
	});
}

module.exports = process;