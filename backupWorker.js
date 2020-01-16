var fs = require( 'fs' );
var path = require("path");
const serverhelper = require('./erpserverhelper.js');

var backUpDir_arr = [
    "/public/erpdesigner/files/", 
];

const EReportType={
    Log:'log',
    Err:'error',
};
const backUpDst_path = '/backUpFiles/';

function doBackUpWork(source) {
    var today = new Date();
    var backUpDst_abspath = path.join(path.resolve(),backUpDst_path);
    if (!fs.existsSync(backUpDst_abspath)) {
		fs.mkdir(backUpDst_abspath);
    }
    var todayPath = path.join(backUpDst_abspath,today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate());
    /*
    if (fs.existsSync(todayPath)) {
		console.log('已备份结束了,检查日志文件');
        if (check_log(todayPath) !== false) {
            console.log('正常');
            return
        } else {
            console.log('文件复制出错，重新复制');
        }
    }
    */
    var counter = {
        fileCount:0,
        copiledCount:0,
    };

    var dir_index = 0;
    var doBackUp;
    var endBackup = ()=>{
        ++dir_index;
        if(dir_index < backUpDir_arr.length){
            doBackUp(backUpDir_arr[dir_index]);
        }
        else{
            serverhelper.InformSysManager('文件备份日报:' + counter.copiledCount + '/' + counter.fileCount, 'Node文件备份器');
        }
    };

    doBackUp = (dirPath)=>{
        backUpDir(path.join(path.resolve(), dirPath), todayPath, endBackup, counter);
    };
    if(backUpDir_arr.length > 0){
        doBackUp(backUpDir_arr[0]);
    }
}

function backUpDir(src, dst, callBack, counter) {
    // 读取目录中的所有文件/目录
    var coypiedFiles_arr=[];
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    }
    else{
        var logPath = path.join(dst, EReportType.Log + '.txt');
        if(fs.existsSync(logPath)){
            var logText = fs.readFileSync(logPath, {encoding:'utf-8'});
            if(logText){
                coypiedFiles_arr = logText.split(';');
            }
        }
    }
    var childs_arr = fs.readdirSync(src);
    var child_index = 0;
    var copyChild;
    var childCopyEnd = ()=>{
        ++child_index;
        if(child_index < childs_arr.length){
            copyChild(childs_arr[child_index]);
        }
        else{
            if(callBack){
                callBack();
            }
        }
    };
    copyChild = (childName)=>{
        if(coypiedFiles_arr.indexOf(childName) != -1){
            counter.fileCount += 1;
            counter.copiledCount += 1;
            childCopyEnd();
            return;
        }
        var file_src = path.join(src, childName);
        var file_dst = path.join(dst, childName);
        var statInfo = fs.statSync(file_src);
        // 判断是否为文件
        // console.log(statInfo.size, file_src);
        var readfile_size = statInfo.size;
        if (statInfo.isFile()) {
            counter.fileCount += 1;
            // 创建读取流
            var readable = fs.createReadStream(file_src);
            // 创建写入流
            var writable = fs.createWriteStream(file_dst);
            // 通过管道来传输流
            readable.pipe(writable);
            // console.log(fs.statSync(file_dst).size)
            writable.on('finish', function () {
                counter.copiledCount += 1;
                /*
                var writefile_size = fs.statSync(file_dst).size;
                var compare = true;
                if (readfile_size !== writefile_size) {
                    result = false
                }
                */
                reprot_info(dst,EReportType.Log,childName + ';');
                childCopyEnd();
            });
            writable.on('error',function (err) {
                reprot_info(dst,EReportType.Err,childName + ':' + JSON.stringify(err));
                childCopyEnd();
            });
        }
        // 如果是目录则递归调用自身
        else if (statInfo.isDirectory()) {
            backUpDir(file_src, file_dst, childCopyEnd, counter);
        }
    };
    if(childs_arr.length > 0){
        copyChild(childs_arr[0]);
    }
}

function reprot_info(dstPath, type, info) {
    fs.appendFileSync(path.join(dstPath, type + '.txt'), info);
}
/*
function check_log(src) {
    var data = fs.readFileSync(src + '/logger.txt', {encoding:'utf-8'});
    var ts = '{' + data.substring(1, data.length-1) + '}';
    data = JSON.parse(ts);
    var result = true;
    var childs_arr = fs.readdirSync(src);
    childs_arr.forEach(function (childPath) {
        if (childPath.substr(0, 1) === '.' || childPath.substr(0, 6) === 'logger') {
            return;
        }
        var file_src = path.join(src, childPath);
        var statInfo = fs.statSync(file_src);

        if (statInfo.isFile()) {
            if (data[file_src] == null || data[file_src] === false || data['err'] != null) {
                console.log('缺失文件备份', file_src);
                result = false;
                return false;
            }
        } else if (statInfo.isDirectory()) {
            check_log(file_src);
        }
    });
    return result;
}
*/
module.exports={
    doWork:doBackUpWork
};

//doBackUpWork();