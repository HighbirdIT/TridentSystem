const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");

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
            console.error(rlt);
        })
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'syndata_bykeyword':
            return syndata_bykeyword(req.body.keyword);
        case 'syndata_bycodes':
            return GetEntityInfo(req.body.codes_arr);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}


function getDataTable(tableName) {
    return co(function* () {
        var rcdRlt = yield dbhelper.asynQueryWithParams("select * from " + tableName, null);
        return rcdRlt.recordset;
    });
}

function syndata_bykeyword(keyword) {
    return co(function* () {
        if (keyword[0] != '%') {
            keyword = "%" + keyword;
        }
        if (keyword[keyword.Length - 1] != '%') {
            keyword = keyword + "%";
        }
        var sql = "select 库内对象名称代码 from T000E库内对象名称 where 终止确认状态=0 and 库内对象名称 like @param";

        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [dbhelper.makeSqlparam('param', sqlTypes.NVarChar, keyword)]);
        if (rcdRlt.recordset.length == 0) {
            return [];
        }
        var entitiesCode_arr = rcdRlt.recordset.map(r => { return r.库内对象名称代码 });
        var GetEntityInfoRlt = yield GetEntityInfo(entitiesCode_arr);
        return GetEntityInfoRlt;
    });
}

function GetEntityInfo(codes_arr) {
    return co(function* () {
        var rlt = [];
        var inParams_arr = codes_arr.map((item,i)=>{return '@p' + i});
        var inParamsStr = inParams_arr.join(",");

        var sql = "select 库内对象名称,库内对象名称代码,功能模块名称代码 from V001A库内对象名称 where 终止确认状态=0 and 库内对象名称代码 in (" + inParamsStr +")";
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, codes_arr.map((item,i)=>{return dbhelper.makeSqlparam('P' + i, sqlTypes.NVarChar, item)}));

        var 目标库内对象_dic = {};
        //var t = yield WriteEntity(rcdRlt.recordset[0], 目标库内对象_dic);
        
        rlt = yield rcdRlt.recordset.map(entity_dr=>{
            return WriteEntity(entity_dr, 目标库内对象_dic);
        });

        return rlt;
    });
}

function WriteEntity(库内对象_dr, 目标库内对象_dic) {
    return co(function* () {
        var 库内对象名称 = 库内对象_dr.库内对象名称;
        目标库内对象_dic[库内对象名称] = 库内对象_dr;

        var sql = "select id, name, xtype from sysobjects where name = '" + 库内对象名称 + "'";
        var 库内对象Sysinfo_dt = yield dbhelper.asynQueryWithParams(sql, null);
        if (库内对象Sysinfo_dt.recordset.length == 0) {
            return;
        }
        var 库内对象Sysinfo_dr = 库内对象Sysinfo_dt.recordset[0];
        var 库内对象sysid = 库内对象Sysinfo_dr.id;

        var xtype = 库内对象Sysinfo_dr.xtype.trim();
        if (xtype == "PC")
            xtype = "P";
        var 库内对象Tag = xtype;
        switch (xtype) {
            case "IF":
            case "TF":
            case "FT":
                库内对象Tag = "FT";
                break;
            case "FN":
            case "FS":
                库内对象Tag = "FB";
                break;
        }
        var objCode = 库内对象_dr.库内对象名称代码;
        var 库内对象obj = {
            name: 库内对象名称,
            code: objCode,
            type: 库内对象Tag,
            fmCode: 库内对象_dr.功能模块名称代码,
            columns: [],
            params: []
        }

        sql = "select object_id as id,name, is_identity, is_nullable from sys.all_columns where object_id = " + 库内对象sysid;
        var 列信息_dt = yield dbhelper.asynQueryWithParams(sql, null);

        sql = "select PARAMETER_NAME 参数名,DATA_TYPE 值类型,IS_RESULT 作为结果,ORDINAL_POSITION 位置,PARAMETER_MODE 通讯模式 from INFORMATION_SCHEMA.PARAMETERS where SPECIFIC_NAME='" + 库内对象名称 + "'";
        var 参数信息_dt = yield dbhelper.asynQueryWithParams(sql, null);

        //DataTable columnDT = Column(theName);
        if (列信息_dt.recordset.length == 0 && 参数信息_dt.recordset.length == 0) {
            return;   // 无列信息
        }
        var isP = 库内对象名称[0] == 'P';
        if (列信息_dt.recordset.length > 0) {
            sql = "select COLUMN_NAME as 列名称,COLUMN_DEFAULT as 默认值,DATA_TYPE as 值类型 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='" + 库内对象名称 + "'";
            var 列模式信息_dt = yield dbhelper.asynQueryWithParams(sql, null);
            var 列模式信息_dic = {};
            列模式信息_dt.recordset.forEach(temDr => {
                列模式信息_dic[temDr.列名称] = temDr;
            });
            列信息_dt.recordset.forEach(columDR => {
                var columnName = columDR.name;
                var Columns = {};
                Columns.name = columnName;
                var is_identity = columDR.is_identity;
                if (is_identity == "True") {
                    Columns.is_identity = is_identity;
                }
                var is_nullable = columDR.is_nullable;
                if (is_nullable == "True") {
                    Columns.is_nullable = is_nullable;
                }
                库内对象obj.columns.push(Columns);

                var 列模式_dr = 列模式信息_dic[columnName];
                if (列模式_dr != null) {
                    var 默认值 = 列模式_dr.默认值;
                    if (默认值 && 默认值.Length > 0) {
                        while (默认值[0] == '(') {
                            默认值 = 默认值.Substring(1, 默认值.Length - 2);
                        }
                        Columns.cdefault = 默认值;
                    }
                    Columns.cvalType = 列模式_dr.值类型;
                }
            });
        }

        if (参数信息_dt.recordset.length > 0) {
            参数信息_dt.recordset.forEach(pram_dr => {
                var 作为结果 = pram_dr.作为结果 == "YES";
                var paramElem = { isreturn: 作为结果 };
                库内对象obj.params.push(paramElem);
                paramElem.cvalType = pram_dr.值类型;
                if (!作为结果) {
                    paramElem.position = pram_dr.位置;
                    paramElem.mod = pram_dr.通讯模式;
                    paramElem.name = pram_dr.参数名;
                }
            });
        }
        return 库内对象obj;
    });
}

module.exports = process;