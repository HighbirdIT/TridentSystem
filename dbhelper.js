var mssql = require('mssql');
var sqlconfig = require('./dbconfig.js');
var co = require('co');
var sql = {};

sql.Types = mssql.TYPES;

sql.direction = {
    //输入参数
    Input: "input",
    //输出参数
    Output: "output",
    //返回参数
    Return: "return"
};

var restoreDefaults = function () {
    conf;
};
const advancerConPool = new mssql.ConnectionPool(sqlconfig.advancerUser);

advancerConPool.on('error', err => {
    if (err) {
        throw err;
    }
});

advancerConPool.connect(err => {
    if (err) {
        console.error(err);
    }
    console.log('sql server connected');
});

function makePoolConnected(thePool) {
    return new Promise(function(reslove) {
        if (thePool.connecting) {
            var checker = () => {
                if (!thePool.connecting) {
                    reslove();
                }
                else
                    setTimeout(checker, 500);
            }
            setTimeout(checker, 500);
        }
        else if (!thePool.connected) {
            thePool.connect(err => {
                reslove(err);
            });
        }
        else {
            reslove();
        }
    });
}

sql.makeSqlparam = (name, type, value) => {
    return value != null ? { name: name, 'value': value, type: type } : { name: name, type: type };
};

sql.queryWithParams = function (sqltext, params, func) {
    makePoolConnected(advancerConPool).then(err=>{
        try {
            if(err){
                throw err;
            }
            if (!advancerConPool.connected) {
                throw new Error('无法链接到数据库');
            }
            var ps = new mssql.PreparedStatement(advancerConPool);
            var useParams = {};
            if (params != null) {
                for (var index in params) {
                    ps.input(params[index].name, params[index].type);
                    useParams[params[index].name] = params[index].value;
                }
            }
            ps.prepare(sqltext, err => {
                if (err)
                    func(err);
                ps.execute(useParams, (err, recordset) => {
                    func(recordset);
                    ps.unprepare(err => {
                        if (err)
                            console.log(err);
                    });
                });
            });
        } catch (e) {
            func(e);
        }
    });
};

sql.query = function (sqltext, func) {
    sql.queryWithParams(sqltext, null, func);
};

sql.asynQuery = function (sqltext) {
    return sql.asynQueryWithParams(sqltext, null);
};

sql.asynGetScalar = function (sqltext, params) {
    return sql.asynQueryWithParams(sqltext, params, { scalar: true });
};

sql.asynQueryWithParams = function (sqltext, inparams, config) {
    if (config == null) {
        config = {};
    }
    var rlt = co(function* () {
        var poolErr = yield makePoolConnected(advancerConPool);
        if(poolErr){
            throw poolErr;
        }
        if (!advancerConPool.connected) {
            throw new Error('无法链接到数据库');
        }
        /*
        var ps = new mssql.PreparedStatement(advancerConPool);
        var useParams = {};
        if (inparams != null) {
            inparams.forEach(param => {
                ps.input(param.name, param.type);
                useParams[param.name] = param.value;
            });
        }
        var data = yield new Promise((rs, re) => {
            ps.prepare(sqltext, err => {
                if (err){
                    rs(err);
                }
                ps.execute(useParams, (err, recordset) => {
                    ps.unprepare();
                    if(err){
                        rs(err);
                    }
                    rs(recordset);
                });
            });
        });
        if(data instanceof Error){
            throw data;
        }
        */
        var request = advancerConPool.request();
        request.multiple = config.scalar == null || config.scalar == false;
        if (inparams) {
            inparams.forEach(param => {
                request.input(param.name, param.type, param.value);
            });
        }
        var data = yield request.query(sqltext);

        if (config.scalar) {
            if (data.recordset == null || data.recordset.length == 0)
                return null;
            for (var colName in data.recordset[0]) {
                return data.recordset[0][colName];
            }
        }

        return data;
    }).catch(err => {
        throw err;
    });
    return rlt;
};

sql.asynExcute = function (excutableName, inputParams, outputParams) {
    var rlt = co(function* () {
        var poolErr = yield makePoolConnected(advancerConPool);
        if(poolErr){
            throw poolErr;
        }
        if (!advancerConPool.connected) {
            throw new Error('无法链接到数据库');
        }
        var request = advancerConPool.request();
        request.multiple = true;

        if (inputParams) {
            inputParams.forEach(param => {
                request.input(param.name, param.type, param.value);
            });
        }
        if (outputParams) {
            outputParams.forEach(param => {
                request.output(param.name, param.type);
            });
        }
        var data = yield request.execute(excutableName);
        //console.log('data loaded');
        return data;
    })
        .catch(err => {
            throw err;
        });
    return rlt;
};


module.exports = sql;
