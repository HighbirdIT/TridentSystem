var fs = require("fs");
//path模块，可以生产相对和绝对路径
var path = require("path");
var exec = require('child_process').exec;
var iconv = require('iconv-lite');

var exportDirPath = path.join(__dirname, 'filedata');
if (!fs.existsSync(exportDirPath)) {
    fs.mkdirSync(exportDirPath);
}
exportDirPath = path.join(exportDirPath, 'ETCInvoice');
if (!fs.existsSync(exportDirPath)) {
    fs.mkdirSync(exportDirPath);
}


function doETCInvoice() {
    console.log('doETCInvoice');
    var scriptPath = path.join(__dirname, 'scripts/python/GetETCInvoice.py');
    var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + exportDirPath + '\\';
    exec(startPythonCmd, (error, stdout, stderr) => {
        var output = stdout;
        if (output.substr(0, 2) == 'OK') {
            var uids = output.substring(4, output.length - 1).split(',');
            uids.forEach(processUID);
        }
    });
}

function processUID(uid) {
    if(uid == null || uid.length == 0){
        return;
    }
    console.log('processUID:' + uid);
    var uidDir = path.join(exportDirPath, 'UID' + uid);
    var fileContent = fs.readFileSync(path.join(uidDir, 'invoice_info.json'),{encoding:'utf8'});
    var jsonData = JSON.parse(fileContent);
    jsonData = null;
}

module.exports = {
    getETCInvoice: doETCInvoice,
};