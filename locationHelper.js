var co = require('co');
var fs = require("fs");
var path = require("path");
const fetch = require('node-fetch');
var dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
const sqlTypes = dbhelper.Types;

var processing_map = {};
var result_arr = [];
function doWrok() {
    return co(function* () {
        var sql = "select top 25 外勤在岗考勤代码 as 记录代码,定位经度,定位纬度 from T101C外勤在岗考勤 where 考勤登记日期>'2019-10-1' and 所属地域代码=0 order by 外勤在岗考勤代码";
        var ret = null;
        try {
            ret = yield dbhelper.asynQueryWithParams(sql, null);
        }
        catch (eo) {
            serverhelper.InformSysManager(eo.toString(), 'locationHelper');
        }

        if(ret && ret.recordset){
            for(var si in ret.recordset){
                var record = ret.recordset[si];
                //console.log(record.记录代码 + '---start');
                processRecord(record);
            }
        }
    });
}

function processRecord(record){
    if(processing_map[record.记录代码] != null){
        return;
    }
    processing_map[record.记录代码] = 1;    // 1正在处理
    return co(function* () {
        fetch(
            'http://api.map.baidu.com/reverse_geocoding/v3/?ak=QsmV82HINEAPblwWGaLXAj4L5p9BWvY2&output=json&coordtype=wgs84ll&location='+record.定位纬度+','+record.定位经度
        ).then(
            response => {
                //console.log(record.记录代码 + '---response');
                if (response.ok) {
                    //console.log(record.记录代码 + '---response.ok');
                    return response.json();
                }
                else{
                    //console.log(record.记录代码 + '---response.bad');
                    processing_map[record.记录代码] = null;    // null 未曾处理
                }
            }
        ).then(
            json => {
                //console.log(json);
                //console.log(record.记录代码 + '---json');
                if(json.status == 0){
                    result_arr.push({
                        record:record,
                        json:json,
                    });
                    uploadResult();
                }
                else{
                    processing_map[record.记录代码] = null;    // null 未曾处理
                }
            }
        );
    });
}

var uploading = false;
function uploadResult(){
    if(uploading){
        return;
    }
    uploading = true;
    if(result_arr.length == 0){
        uploading = false;
        return;
    }
    var result = result_arr.pop();
    var record = result.record;
    //console.log('process' + record.记录代码);
    var json = result.json;
    try
    {
        dbhelper.asynExcute('P101E提交定位解析', [
            dbhelper.makeSqlparam('记录代码', sqlTypes.Int, record.记录代码),
            dbhelper.makeSqlparam('country_code_iso', sqlTypes.NVarChar, json.result.addressComponent.country_code_iso),
            dbhelper.makeSqlparam('city', sqlTypes.NVarChar, json.result.addressComponent.city),
            dbhelper.makeSqlparam('formatted_address', sqlTypes.NVarChar, json.result.formatted_address),
        ]).then(ret=>{
            console.log(record.记录代码 + '---end');
            //processing_map[record.记录代码] = 2;    // 2 处理完成
            delete processing_map[record.记录代码];
            //result_arr.pop();
            uploading = false;
            uploadResult();
        });
    }catch(eo){
        processing_map[record.记录代码] = null;    // null 未曾处理
        uploading = false;
        uploadResult();
    }
}

module.exports = {
    doWrok:doWrok,
};