const co = require('co');
const dbhelper = require('../../dbhelper.js');
const sqlTypes = dbhelper.Types;
const fetch = require('node-fetch');
const dingAIHelper = require('./dingAIHelper.js');

function RecevieMessage(req, res){
    console.log(req.body);
    return co(function* () {
        var retData = {
            "msgtype": "empty"
        };
        var bodyData = req.body;
        //var sessionWebhook = bodyData.sessionWebhook;
        var msgText = bodyData.text && bodyData.text.content ? bodyData.text.content.trim() : null;
        if(msgText == null){
            // nothing
        }
        else if(msgText.substring(0,2) == '查人'){
            var keyword = msgText.substring(2).trim();
            if(keyword.length == 0){
                retData = dingAIHelper.GenTextMsg("请提供关键字，数字或文字", [bodyData.senderId]);
            }
            else{
                var ret_tb = null;
                if(isNaN(keyword)){
                    keyword = '%' + keyword + '%';
                    try{
                        ret_tb = yield dbhelper.asynQueryWithParams('select 员工登记姓名,员工登记姓名代码 from T100A员工登记姓名 where 员工登记姓名 like @keyword order by 员工登记姓名', [dbhelper.makeSqlparam('keyword', sqlTypes.NVarChar, keyword)]);
                    }
                    catch(eo){
                        console.log(eo);
                    }
                }
                else{
                    keyword = parseInt(keyword);
                    if(isNaN(keyword)){
                        retData = dingAIHelper.GenTextMsg("只接受整数查询", [bodyData.senderId]);
                    }
                    else{
                        try{
                            ret_tb = yield dbhelper.asynQueryWithParams('select 员工登记姓名,员工登记姓名代码 from T100A员工登记姓名 where 员工登记姓名代码 = @keyword', [dbhelper.makeSqlparam('keyword', sqlTypes.Int, keyword)]);
                        }
                        catch(eo){
                            console.log(eo);
                        }
                    }
                }

                if(ret_tb){
                    var rettext = '查询结果:';
                    if(ret_tb.recordset.length == 0){
                        rettext = '没有查到任何信息';
                    }
                    else{
                        for(var ri in ret_tb.recordset){
                            rettext += '[' + ret_tb.recordset[ri]['员工登记姓名'] + ' ' + ret_tb.recordset[ri]['员工登记姓名代码'] + ']';
                        }
                    }
                    dingAIHelper.SendToWebhook(bodyData.sessionWebhook, dingAIHelper.GenTextMsg(rettext, [bodyData.senderId]));
                }
            }
        }
        else{
            retData = dingAIHelper.GenTextMsg("我无法理解您的信息", [bodyData.senderId]);
        }

        res.json(retData);
    });
}

module.exports = RecevieMessage;