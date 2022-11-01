const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
var dingHelper = require('../../../dingHelper');

var processes_map = {
	getConstructState: getConstructState,
};

function getConstructState(req, res){
	// var g_envVar = req.session.g_envVar;
	var bundle = req.body.bundle;
    return co(function* () {
		if(bundle == null){
			return serverhelper.createErrorRet('没有提供bundle', 0, null);
		}
		if (bundle.全局代码 == null) { return serverhelper.createErrorRet('没有提供全局代码', 0, null); };
		// if (bundle.材料种类 == null) { return serverhelper.createErrorRet('没有提供材料种类', 0, null); };
		var params_arr = [
			dbhelper.makeSqlparam('全局代码', sqlTypes.NVarChar(4000), bundle.全局代码),
			// dbhelper.makeSqlparam('材料种类', sqlTypes.NVarChar(4000), bundle.材料种类),
		];
		var sql = "select * from FT203E构件生产状态明细Ex(10429,@全局代码) order by 列号,行号";
		var ret = yield dbhelper.asynQueryWithParams(sql,params_arr);
		return ret.recordset;
	});
}

function process(req, res, next) {
	serverhelper.commonProcess(req, res, next, processes_map, false);
}


module.exports = process;