var co = require('co');
var fs = require("fs");
var path = require("path");
var dbhelper = require('./dbhelper.js');

var execSync = require('child_process').execSync;

var sql = 'select top 100 * from T100A员工登记姓名 where 员工登记姓名代码 =247';
var exName='read.xls';
url ='/Users/mac/Downloads/test';

createExcel(sql,exName,url);


//之搜索一个字段时候就出现中括号
function createExcel(sql, exName, url) {
    var promise = new Promise(function (resolve, reject) {
        var ret = dbhelper.asynQueryWithParams(sql);
        resolve(ret);
    });
    //尝试使用promise 规避异步出现的问题
    promise.then(function (result) {
        //then第一个函数是成功的回调，参数是resolve(err)中的data

        //console.log(result.recordset);
        var infor_arr = result.recordset;
        var downloadurl = path.join(url,exName);
        execCmd(infor_arr,downloadurl);
    }, function (err) {
        //then第二个函数是失败的回调函数，参数是reject(err)中的err错误对象
        console.log('失败：' + err);
    });
}
//该方法用于命令行执行python命令 类似于:  python py_test.py arg1
//这样在python中就可以接受传递过去的参数
function execCmd(infor_arr,downloadurl) {
    infor_arr.forEach(function (item, index) {
        var json_information = JSON.stringify(item);
        var result = execSync('python3 pyExcel.py ' + index + ' ' +downloadurl+' '+ json_information);
        console.log('sync: ' + result)
    });

}

