const co = require('co');

var helper = {};

helper.createErrorRet = (info, code, data) => {
    return {
        err: {
            info: info,
            code: code,
            data: data,
        }
    };
};

helper.commonProcess = (req, res, next, action_map) => {
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
                if (data.err) {
                    rlt.err = data.err;
                }
                else if (data.banAutoReturn) {
                    return;
                }
                else {
                    rlt.data = data;
                }
                res.json(rlt);
            })
            .catch(err => {
                rlt.err = {
                    info: err.message
                };
                res.json(rlt);
                console.error(rlt);
            });
        }
    }
};

helper.JsObjectToString = (obj)=>{
	var objtype = typeof obj;
	if(objtype === 'string' || objtype === 'number' || objtype === 'boolean'){
		return obj;
	}
	else if(objtype != 'object'){
		console.error('what is ' + objtype);
	}
	var rltStr = '{';
	if(obj.length != null && typeof obj.length === 'function'){
		rltStr = '[';
		obj.forEach(
			(e,i)=>{
				rltStr += (i == 0 ? '' : ',') + helper.JsObjectToString(e);
			}
		);
		rltStr += ']';
	}
	else{
		for(var si in obj){
			rltStr += si + ':' + helper.JsObjectToString(obj[si]) + ',';
		}
		rltStr += '}';
	}
	
	return rltStr;
};

module.exports = helper;