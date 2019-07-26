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

sql.makeSqlparam = (name,type,value)=>{
    return value != null ? {name:name, 'value':value, type:type} : {name:name, type:type};
};

sql.queryWithParams = function (sqltext, params, func) {
    try {
        var connection = new mssql.Connection(sqlconfig.advancerUser, function (err) {
            if (err)
                func(err);
            else {
                var request = new mssql.Request(connection);
                request.multiple = true;

                if (params) {
                    for (var index in params) {
                        request.input(index, params[index].sqlType, params[index].inputValue);
                    }
                }

                request.query(sqltext).then(function (recordset) {
                    func(recordset);
                }).catch(function (err) {
                    console.log(err);
                });
            }
        });
        connection.on("error", func);
    } catch (e) {
        func(e);
    }
};

sql.query = function (sqltext, func) {
    sql.queryWithParams(sqltext, null, func);
};

sql.asynQuery = function (sqltext) {
    return sql.asynQueryWithParams(sqltext, null);
};

sql.asynGetScalar = function (sqltext,params) {
    return sql.asynQueryWithParams(sqltext, params, {scalar:true});
};

sql.asynQueryWithParams = function (sqltext, params, config) {
    if(config == null){
        config = {};
    }
    var rlt =  co(function* () {
            var thePool = yield new Promise((rs,re)=>{
                var usePool = new mssql.ConnectionPool(sqlconfig.advancerUser,err=>{
                    if(err != null){
                        rs({err:err});
                    }
                    rs(usePool);
                });
            }).catch(err=>{
                console.log(err);
            });
            if(thePool.err != null){
                throw new Error(thePool.err.originalError.message);
            }
            var request = thePool.request();
            request.multiple = config.scalar == null || config.scalar == false;
    
            if (params) {
                params.forEach(param => {
                    request.input(param.name, param.type, param.value);
                });
            }
            var data = yield request.query(sqltext);
            //console.log('data loaded');
            
            if(config.scalar){
                if(data.recordset.length == 0)
                    return null;
                for(var colName in data.recordset[0]){
                    return data.recordset[0][colName];
                }
            }
            
            return data;
        })
        .catch(err=>{
            throw err;
        });
    return rlt;
};

sql.asynExcute = function (excutableName, inputParams, outputParams) {
    var rlt =  co(function* () {
            var thePool = yield new Promise((rs,re)=>{
                var usePool = new mssql.ConnectionPool(sqlconfig.advancerUser,err=>{
                    if(err != null){
                        rs({err:err});
                    }
                    rs(usePool);
                });
            }).catch(err=>{
                console.log(err);
            });
            if(thePool.err != null){
                throw new Error(thePool.err.originalError.message);
            }
            var request = thePool.request();
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
        .catch(err=>{
            throw err;
        });
    return rlt;
};


module.exports = sql;
