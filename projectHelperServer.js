var dbhelper = require('./dbhelper.js');
var fileSystem = require('./fileSystem.js');
var serverhelper = require('./erpserverhelper.js');

let action_map = {};

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
            res.json(req.body);
        }
    }
}

module.exports = {
    process:process,
}