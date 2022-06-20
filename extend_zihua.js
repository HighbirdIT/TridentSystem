const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
var co = require('co');
var fs = require('fs');
var uuid = require('uuid');
const sqlTypes = dbhelper.Types;
var path = require("path");
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
const mineType = require('mime-types');
const fileSystem = require('./fileSystem.js');



function file_transformMd5(_config){
    return co(function* () {
        var rlt = {};
        var scriptDir = path.join(__dirname, 'scripts/python/');
        var scriptPath = path.join(scriptDir, 'md5FileEncryption.py');
        var result = '';
        try {
            _config.files = _config.files.map(x => { return path.join(__dirname, 'public', x); });
            var startPythonCmd = 'python3 -W ignore ' + scriptPath + ' ' + JSON.stringify(_config).replace(/"/g, "'");
            result = execSync(startPythonCmd).toString();
        }
        catch (eo) {
            return {
                err: eo.message
            };
        }
       
        tpos = result.indexOf('result:');
        if (tpos != 1) {
            rlt.result = result.substring(result.indexOf('{', tpos) + 1, result.indexOf('}', tpos)).replace(/:/g, '=').replace(/'/g, '');
        }
        return rlt;
    });
}

module.exports = {
    file_transformMd5: file_transformMd5
};