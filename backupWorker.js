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
    var todayPath = path.join(backUpDst_abspath,today.getFullYear() + '_' + today.getMonth() + '_' + today.getDate());
    if (fs.existsSync(todayPath)) {
		return;
    }
    backUpDir_arr.forEach(dirPath=>{
        backUpDir(path.join(path.resolve(), dirPath), todayPath);
    });
}

function backUpDir(src, dst){
    // 读取目录中的所有文件/目录
    if (!fs.existsSync(dst)) {
		fs.mkdir(dst,(a,e)=>{
            console.log(a);
        });
    }
    fs.readdir(src, function( err, childs_arr ){
        if( err ){
            throw err;
        }
  
        childs_arr.forEach(function(childPath ){
            var file_src = path.join(src, childPath);
            var file_dst = path.join(dst, childPath);
            fs.stat(file_src, function( err, st ){
                if( err ){
                    throw err;
                }
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    var readable = fs.createReadStream( file_src );
                    // 创建写入流
                    var writable = fs.createWriteStream( file_dst ); 
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    backUpDir(file_src, file_dst);
                }
            });
        });
    });
}

module.exports={
    doWork:doBackUpWork
};