const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;

function process(req, res, next) {
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            rlt.data = data;
            res.json(rlt);
        })
        .catch(err => {
            rlt.err = {
                info: err.message
            };
            res.json(rlt);
        })
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'pageinit':
            return readyData(req.body.rcdUID);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}


function readyData(rcdUID) {
    return co(function* () {
        var data = {};

        var rcdRlt = yield dbhelper.asynQueryWithParams("select 应聘人员记录代码,[人员姓名],应聘岗位,性别,[出生日期],[籍贯],[当前状态],[毕业院校],[学历],[专业],英语能力,[手机号码],[现居住地],[期望薪资],[工作年限],[最快到岗],[健康状态],登记日期 from FT135C应聘人员记录(@guid)", [ dbhelper.makeSqlparam('guid', sqlTypes.NVarChar(36), rcdUID)]);
        var rcdRow = null;
        var ques = null;
        if(rcdRlt.recordset.length > 0){
            rcdRow = rcdRlt.recordset[0];
            var 应聘人员记录代码 = rcdRow.应聘人员记录代码;
            delete rcdRow.应聘人员记录代码;
            var quesRlt = yield dbhelper.asynQueryWithParams("select 回答内容 as answer,问题描述 as title from FT135D在线问题作答(@应聘人员记录代码)", [ dbhelper.makeSqlparam('应聘人员记录代码', sqlTypes.Int, 应聘人员记录代码)]);
            ques = quesRlt.recordset;
        }
        data.rcdRow = rcdRow;
        data.ques = ques;
        return data;
    });
}

module.exports = process;