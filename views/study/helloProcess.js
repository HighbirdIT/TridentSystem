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
        case 'getDataTable':
            return getDataTable(req.body.tableName);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}


function getDataTable(tableName) {
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("declare @id int = 17 select * from " + tableName + " where 员工登记姓名代码=@id", null);
        return rcdRlt.recordset;
    });
}

module.exports = process;