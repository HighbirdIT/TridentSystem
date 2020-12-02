const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fetch = require('node-fetch');
const urlencode = require('urlencode');

function sendToAI(aiid, sendData){
    return co(function* () {
        var ai_tb = yield dbhelper.asynQueryWithParams('SELECT  [钉钉机器人代码],[机器人名称],[webhook] FROM [TA30C钉钉机器人] where [钉钉机器人代码]=@id', [dbhelper.makeSqlparam('id', sqlTypes.Int, aiid)]);
        if(ai_tb.recordset.length == 0){
            throw new Error('没有找到webhook:' + aiid);
        }
        var fetchRet = null;
        switch(sendData.type){
            case 'text':
                fetchRet = yield sendToWebhook(ai_tb.recordset[0]['webhook'], genTextMsg(sendData.content, [], sendData.isAtAll));
                break;
            case 'markdown':
                fetchRet = yield sendToWebhook(ai_tb.recordset[0]['webhook'], genMarkDownMsg(sendData.title, sendData.text, [], sendData.isAtAll));
                break;
            case 'link':
                var msgurl = yield makeDingTalkLink(sendData.proj, sendData.ispc, sendData.flowStep, sendData.stepData);
                fetchRet = yield sendToWebhook(ai_tb.recordset[0]['webhook'], genLinkMsg(sendData.title, sendData.content, null, msgurl));
                break;
            case 'singleActionCard':
                var singleurl = yield makeDingTalkLink(sendData.proj, sendData.ispc, sendData.flowStep, sendData.stepData);
                fetchRet = yield sendToWebhook(ai_tb.recordset[0]['webhook'], genSingleActionCardMsg(sendData.title, sendData.text, sendData.singleTitle, singleurl));
                break;
            case 'actionCard':
                var btns = [];
                for(var btni=0;btni<sendData.btns.length;++btni){
                    var btn = sendData.btns[btni];
                    var actionURL = yield makeDingTalkLink(btn.proj, btn.ispc, btn.flowStep, btn.stepData);
                    btns.push({
                        "title" : btn.title, 
                        "actionURL" : actionURL,
                    });
                }
                fetchRet = yield sendToWebhook(ai_tb.recordset[0]['webhook'], genActionCardMsg(sendData.title, sendData.text, sendData.btnOrientation, btns));
                break;
            default:
                throw new Error('不支持的msgtype:' + sendData.type);
        }
        return fetchRet;
    });
}

function makeDingTalkLink(proj, ispc, flowStep, stepData){
    return co(function* () {
    var prot_dt = yield dbhelper.asynQueryWithParams('SELECT [方案英文名称],[桌面端名称],[移动端名称] FROM [V002C系统方案名称] where [系统方案名称代码]=@id', [dbhelper.makeSqlparam('id', sqlTypes.Int, proj)]);
    if(prot_dt == null || prot_dt.recordset == null || prot_dt.recordset.length == 0){
        throw new Error('没有找到方面:' + proj);
    }
    var projectRecord = prot_dt.recordset[0];
    var isPC = ispc == true;
    if(isPC){
        if(projectRecord.桌面端名称.length == 0){
            isPC = false;
        }
    }
    else if(projectRecord.移动端名称.length == 0){
        isPC = true;
    }
    
    var msgurl = 'https://erp.highbird.cn:1330/erppage/' + (isPC ? 'pc/' : 'mb/') + projectRecord.方案英文名称;
    if(flowStep != -1){
        msgurl += '?flowStep=' + flowStep;
        if(stepData != -1){
            msgurl += '&stepData' + flowStep + '=' + stepData;
        }
    }
    msgurl = 'dingtalk://dingtalkclient/action/openapp?corpid=dingb3f0b56e674e39fd&container_type=work_platform&app_id=31954&redirect_type=jump&redirect_url=' + urlencode(msgurl);
    return msgurl;
    });
}

function sendToWebhook(webhook, sendData){
    return co(function* () {
        var fetchRet = yield fetch(webhook, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify(sendData),
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return { errInfo: 'no response' };
                }
            }
        ).then(
            json => {
                return json;
            }
        );
        console.log(fetchRet);
        if(fetchRet.errcode != 0){
            throw new Error(fetchRet.errmsg);
        }
        return fetchRet;
    });
}

function genTextMsg(content, atids, isAtAll){
    return {
        "msgtype": "text",
        "text": {
            "content": content
        },
        "at": {
            "atDingtalkIds": atids ? atids : [], 
            "isAtAll": isAtAll == true ? true : false
        }
    }
}

function genMarkDownMsg(title ,text, atids, isAtAll){
    return {
        "msgtype": "markdown",
        "markdown": {
            "title": title,
            "text": text
        },
        "at": {
            "atDingtalkIds": atids ? atids : [], 
            "isAtAll": isAtAll == true ? true : false
        }
    }
}

function genLinkMsg(title, content, picUrl, messageUrl){
    return {
        "msgtype": "link",
        "link": {
            "text": content,
            "title": title,
            "picUrl": picUrl,
            "messageUrl": messageUrl
        },
    }
}

function genSingleActionCardMsg(title, text, singleTitle, singleURL){
    return {
        "msgtype": "actionCard",
        "actionCard": {
            "title": title,
            "text": text,
            "singleTitle": singleTitle,
            "singleURL": singleURL
        },
    }
}

function genActionCardMsg(title, text, btnOrientation, btns){
    return {
        "msgtype": "actionCard",
        "actionCard": {
            "title": title,
            "text": text,
            "hideAvatar": "0", 
            "btnOrientation": btnOrientation, 
            "btns":btns
        },
    }
}

module.exports={
    SendToWebhook:sendToWebhook,
    GenTextMsg:genTextMsg,
    SendToAI:sendToAI,
}