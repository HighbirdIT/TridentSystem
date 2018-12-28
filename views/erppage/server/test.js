const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");
const forge = require("node-forge");

function process(req, res, next) {
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            if(data.err){
                rlt.err = data.err;
            }
            else if(data.banAutoReturn){
                return;
            }
            else{
                rlt.data = data;
            }
            res.json(rlt);
        })
        .catch(err => {
            rlt.err = {
                info: err.message
            };
            res.json(rlt);
            console.error(rlt);
        })
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'getData':
            return getData(req, res);
        case 'getPersonCode':
            return getPersonCode(req, res);
        case 'getPersonList':
            return getPersonList(req, res);
        case 'getPersonIdentify':
            return getPersonIdentify(req, res);
        case 'pageloaded':
            return pageloaded(req, res);
        case 'getControl01_ds':
            return getControl01_ds(req, res);
        case 'getControl02_ds':
            return getControl02_ds(req, res);
    }

    return co(function* () {
        return serverhelper.createErrorRet('action不合法:' + req.body.action);
    });
}

function pageloaded(req, res){
    return co(function* () {
        return {};
    });
}

function getData(req, res){
    return co(function* () {
        var ctrlId = req.body.ctrlId;
        if(ctrlId == null){
            return serverhelper.createErrorRet('没有传入ctrlId');
        }
        var sql = null;
        var params_arr = null;
        switch(ctrlId){
            case 't_0':
            sql = 'select 员工登记姓名,员工登记姓名代码 from T100A员工登记姓名 where 员工登记姓名代码 between 1 and 20';
            break;
        }
        if(sql == null){
            return serverhelper.createErrorRet('生成sql失败');
        }
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        return rcdRlt.recordset;
    });
}

function getPersonList(req, res){
    return co(function* () {
        var sql = null;
        var params_arr = null;
        sql = 'select 员工登记姓名,员工登记姓名代码 from T100A员工登记姓名 where 员工登记姓名代码 between 1 and 200 order by 员工登记姓名';
        if(sql == null){
            return serverhelper.createErrorRet('生成sql失败');
        }
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        return rcdRlt.recordset;
    });
}

function getControl01_ds(req, res){
    return co(function* () {
        var sql = null;
        var params_arr = null;
        sql = 'select 员工登记姓名,员工登记姓名代码,员工工时状态,员工在职状态,所属部门名称,所属系统名称 from V113A名册员工全部  order by 所属公司名称,所属系统名称,所属部门名称,员工登记姓名';
        if(sql == null){
            return serverhelper.createErrorRet('生成sql失败');
        }
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        return rcdRlt.recordset;
    });
}

function getControl02_ds(req, res){
    return co(function* () {
        var sql = null;
        var params_arr = null;
        sql = 'select 项目登记名称代码,项目登记名称,项目运行阶段 from T203E项目状态快照 order by 项目登记名称';
        if(sql == null){
            return serverhelper.createErrorRet('生成sql失败');
        }
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        return rcdRlt.recordset;
    });
}



function getPersonCode(req, res){
    return co(function* () {
        var name = req.body.name;
        if(name == null){
            return serverhelper.createErrorRet('没有传入name');
        }
        var sql = null;
        var params_arr = [
            dbhelper.makeSqlparam('name', sqlTypes.NVarChar, name)
        ];
        sql = 'select 员工登记姓名代码 from T100A员工登记姓名 where 员工登记姓名=@name ';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        if(rcdRlt.recordset.length == 0){
            return serverhelper.createErrorRet('未找到'); 
        }
        return rcdRlt.recordset[0]['员工登记姓名代码'];
    });
}

function getPersonIdentify(req, res){
    return co(function* () {
        var id = req.body.id;
        if(id == null){
            return serverhelper.createErrorRet('没有传入id');
        }
        var sql = null;
        var params_arr = [
            dbhelper.makeSqlparam('id', sqlTypes.NVarChar, id)
        ];
        sql = 'select 身份证件号码 from T100A员工登记姓名 where 员工登记姓名代码=@id ';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);
        if(rcdRlt.recordset.length == 0){
            return serverhelper.createErrorRet('未找到'); 
        }
        return rcdRlt.recordset[0]['身份证件号码'];
    });
}

function test(req, res){
    return co(function* () {
        var data = {
            a:1,
            b:2,
            c:3
        };
        return data;
    });
}



module.exports = process;