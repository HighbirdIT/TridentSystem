const co = require('co');
var dbhelper = require('./dbhelper.js');
const sqlTypes = dbhelper.Types;
var fileSystem = require('./fileSystem.js');
var serverhelper = require('./erpserverhelper.js');

var action_map = {
    getSubProjectData:getSubProjectData
};

function process(req, res, next){
    var rlt = {};
    if(req.body == null){
        rlt.err = {
            info: 'no bdoy'
        };
        res.json(rlt);
    }
    else if(req.body.action == null){
        rlt.err = {
            info: 'no action'
        };
        res.json(rlt);
    }
    else{
        var processer = action_map[req.body.action];
        if(processer == null){
            rlt.err = {
                info: '不支持的action:' + req.body.action
            };
            res.json(rlt);
        }
        else{
            processer(req, res)
            .then((data) => {
                if(data){
                    if (data.err) {
                        rlt.err = data.err;
                    }
                    else if (data.banAutoReturn) {
                        return;
                    }
                }
                rlt.data = data;
                res.json(rlt);
            })
            .catch(err => {
                rlt.err = {
                    info: err.message
                };
                res.json(rlt);
            });
        }
    }
}

function getSubProjectData(req, res){
    var projectID = parseInt(req.body.projectID);
    var subProjectID = parseInt(req.body.subProjectID);
    return co(function* () {
        var rcdRlt = null;
        try{
            rcdRlt = yield dbhelper.asynQueryWithParams("SELECT 构件名称 as name,识别令牌 as fileIdentity,文件名称 as fileName,文件类型 as type,文件后缀 as affix,图纸类型名称 as drawingType FROM [dbo].[FTP00E构件图纸记录] (@projectID,@subProjectID) order by 构件名称,图纸类型名称",
            [
                dbhelper.makeSqlparam('projectID', sqlTypes.Int, projectID),
                dbhelper.makeSqlparam('subProjectID', sqlTypes.Int, subProjectID),
            ]);
        }catch(eo){
            return serverhelper.createErrorRet(eo.message);
        }
        var rltJson = {
            drawing:rcdRlt.recordset,
        };
        return rltJson;
    });
}

module.exports = {
    process:process,
}