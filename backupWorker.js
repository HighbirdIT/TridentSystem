var fs = require( 'fs' );
var path = require("path");

var backUpDir_arr = [
    "/public/erpdesigner/files/", 
];

const backUpDst_path = '/backUpFiles/';

function doBackUpWork(source) {
    var today = new Date();
    var backUpDst_abspath = path.join(path.resolve(),backUpDst_path);
    if (!fs.existsSync(backUpDst_abspath)) {
		fs.mkdir(backUpDst_abspath);
    }
    var todayPath = path.join(backUpDst_abspath,today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate());
    if (fs.existsSync(todayPath)) {
		console.log('已备份结束了,检查日志文件');
        if (check_log(todayPath) !== false) {
            console.log('正常');
            return
        } else {
            console.log('文件复制出错，重新复制');
        }
    }
    backUpDir_arr.forEach(dirPath=>{
        backUpDir(path.join(path.resolve(), dirPath), todayPath);
    });
}

function backUpDir(src, dst){
    // 读取目录中的所有文件/目录
    if (!fs.existsSync(dst)) {
		fs.mkdir(dst,(a,e)=>{
            console.log(a,e);
        });
    }
    fs.readdir(src, function( err, childs_arr ){
        if( err ){
            throw err;
        }
  
        childs_arr.forEach(function(childPath ){
            var file_src = path.join(src, childPath);
            var file_dst = path.join(dst, childPath);
            fs.stat(file_src, function( err, stats ){
                if( err ){
                    throw err;
                }
                var readfile_size = stats.size;
                // 判断是否为文件
                if( stats.isFile() ){
                    // 创建读取流
                    var readable = fs.createReadStream( file_src );
                    // 创建写入流
                    var writable = fs.createWriteStream( file_dst ); 
                    // 通过管道来传输流
                    readable.pipe( writable );
                    writable.on('finish', function () {
                        var writefile_size = fs.statSync(file_dst).size;
                        var compare = true;
                        if (readfile_size !== writefile_size) {
                            compare = false
                        }
                        create_log(dst, '"' + file_dst + '":"' + compare + '",');
                    });
                }
                // 如果是目录则递归调用自身
                else if( stats.isDirectory() ){
                    backUpDir(file_src, file_dst);
                }
            });
        });
    });
}
function create_log(dest, data) {
    fs.appendFileSync(path.join(dest, '/logger.txt'), data);
}
function check_log(src) {
    var data = fs.readFileSync(src + '/logger.txt');
    data = data.toString();
    data = data.substr(0, data.length - 1);
    data = JSON.parse('{' + data + '}');
    var result = true;
    var childs_arr = fs.readdirSync(src);
    childs_arr.forEach(function (childPath) {
        if (childPath.substr(0, 1) === '.' || childPath.substr(0, 6) === 'logger') {
            return;
        }
        var file_src = path.join(src, childPath);
        // console.log(file_src, '这是check');
        var statInfo = fs.statSync(file_src);

        if (statInfo.isFile()) {
            if (data[file_src] == null || data[file_src] == false ) {
                console.log('缺失文件备份', file_src);
                result = false;
                return result
            }
        } else if (statInfo.isDirectory()) {
            check_log(file_src);
        }

    });
    return result
}

module.exports={
    doWork:doBackUpWork
};