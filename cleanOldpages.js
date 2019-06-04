var fs = require("fs");
//path模块，可以生产相对和绝对路径
var path = require("path");
//配置远程路径
var remotePath = [
    "/public/js/views/erp/pages/", 
    "/public/src/views/erp/pages/",
    "/views/erppage/server/pages/",
    "/views/erppage/server/flows/",
];

//doCleanWork();

function doCleanWork(){
    //获取当前目录绝对路径，这里resolve()不传入参数
    for (var i = 0; i < remotePath.length; i++) {
        //读取文件存储数组
        var filePath = path.resolve();
        // 拼成相对pages路径
        var pages_path = filePath + remotePath[i]
        deleteOldPages(pages_path);
    }
}

function deleteOldPages(pages_path) {
    //读取文件目录
    fs.readdir(pages_path, function (err, files) {
        if (err) {
            console.error(err);
        } else {
            var fileArr = [];
            for (var i = 0; i < files.length; i++) {
                var fileProfile = getFileProfile(files[i], path.join(pages_path + files[i]));
                if (fileProfile.suffix == 'js') {
                    fileArr.push(fileProfile);
                }
            }
            handleArr(fileArr);
        }
    });
}

//分离名称
function getFileProfile(fullName, url) {
    var rlt = {
    };

    var t_arr = fullName.split('.');
    if(t_arr.length != 2){
        return {};
    }
    var fileName = t_arr[0];
    var suffix = t_arr[1];
    rlt.suffix = suffix;
    var index = fileName.lastIndexOf('_');
    if(index == -1){
        return {};
    }
    var module_name = fileName.substring(0, index);
    var module_num = fileName.substring(index + 1);
    if(module_num[0].toLocaleLowerCase() == 's'){
        module_num = module_num.substring(1);
    }
    if(isNaN(module_num)){
        return {};
    }
    module_num = parseInt(module_num);
    rlt.module_name = module_name;
    rlt.module_num = module_num;
    rlt.url = url;

    return rlt;
}

function handleArr(fileArr) {
    var maxnum_map = {};
    var file;
    var i;
    for (i = 0; i < fileArr.length; i++) {
        file = fileArr[i];
        if(maxnum_map[file.module_name] == null || maxnum_map[file.module_name] < file.module_num){
            maxnum_map[file.module_name] = file.module_num;
        }
    }
    for (i = 0; i < fileArr.length; i++) {
        file = fileArr[i];
        if (maxnum_map[file.module_name] > file.module_num) {
            console.log('delete:' + file.url);
            fs.unlink(file.url, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    }
}

module.exports = {
    doCleanWork:doCleanWork,
};