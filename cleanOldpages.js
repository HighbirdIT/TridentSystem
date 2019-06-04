var fs = require("fs");
//path模块，可以生产相对和绝对路径
var path = require("path");
//配置远程路径
var remotePath = ["/public/js/views/erp/pagesone", "/public/js/views/erp/pagestwo"];


//获取当前目录绝对路径，这里resolve()不传入参数
for (var i = 0; i < remotePath.length; i++) {
    //读取文件存储数组
    var filePath = path.resolve();
    // 拼成相对pages路径
    var pages_path = filePath + remotePath[i]
    deleteOldPages(pages_path);
}


function deleteOldPages(pages_path) {
    //读取文件目录

    fs.readdir(pages_path, function (err, files) {
        if (err) {
            console.log(err);
        } else {
            var fileArr = [];
            for (var i = 0; i < files.length; i++) {
                var filename = files[i]
                if (getsuffix(filename) == 'js') {
                    var file_name = getNaNum(filename, path.join(pages_path, filename));
                    fileArr.push(file_name);
                }
            }
            handleArr(fileArr);
        }
    });
}

//获取名称后缀
function getsuffix(name) {
    var name = name.split('.');
    var len = name.length;
    return name[len - 1];
}
//分离名称
function getNaNum(name, url) {
    var originalName = name;
    var name = name.split('.');
    name = name[0];
    name = name.split('_');
    var module_name = "";
    var module_num
    var directory_file = {};
    module_num = name.pop()
    module_name = name.join('_');
    if (module_name == '' || module_name == null) {
        directory_file['module_name'] = originalName;
        directory_file['module_num'] = isNaN(parseInt(module_num)) == true ? 'null' : parseInt(module_num);
        directory_file['url'] = url;
    } else {
        directory_file['module_name'] = module_name;
        directory_file['module_num'] = parseInt(module_num);
        directory_file['url'] = url;
    }

    return directory_file;
}

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}


function isExistObject(obj, target) {
    for (var key in target) {
        console.log(obj.module_name, key, obj.module_num, target[key])
        if (obj.module_name == key && obj.module_num == target[key]) {
            console.log('bu')
            return false;
        }
    }
    return true;
}
function handleArr(fileArr) {
    var maxnum_map = {};
    for (var i = 0; i < fileArr.length; i++) {
        var flag = false;
        var ai = fileArr[i];
        for (key in maxnum_map) {
            var obj_name = key;
            var obj_num = maxnum_map[key];
            //console.log(key,maxnum_map[key])
            if (obj_name === ai.module_name) {
                flag = true;
                if (obj_num < ai.module_num) {
                    delete maxnum_map[key];
                    maxnum_map[ai.module_name] = ai.module_num;
                }
            }
        }
        if (isEmptyObject(maxnum_map) == true || flag == false) {
            //console.log('空对象')
            maxnum_map[ai.module_name] = ai.module_num;
        }
    }
    //console.log(maxnum_map);
    for (var i = 0; i < fileArr.length; i++) {
        var arr_obj = fileArr[i];
        if (isExistObject(arr_obj, maxnum_map) == true) {
            //console.log('删除',arr_obj)
            fs.unlink(arr_obj.url, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    }
}

