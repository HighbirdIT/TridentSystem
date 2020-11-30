﻿var express = require('express');
var https = require('https');
var http = require('http');
var url = require('url');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var connect = require('connect');
var React = require('react');
var dbhelper = require('./dbhelper.js');
var flowhelper = require('./flowhelper.js');
var fileSystem = require('./fileSystem.js');
var co = require('co');
var dingTalkCrypt = require('./dingTalkCrypt');
var dingHelper = require('./dingHelper');
var developconfig = require('./developconfig');
var debug = require('debug');
var serverhelper = require('./erpserverhelper.js');
var cluster = require('cluster');
var QRCode = require('qrcode');
var fs = require("fs");

const bUseHttps = true;
var httpPrefix = bUseHttps ? 'https' : 'http';

var emailHelper = require('./emailHelper');
emailHelper.getETCInvoice();

global.parseBoolean = function(val){
    if(val == null){
        return false;
    }
    if(typeof val === 'boolean'){
        return val == true;
    }
    if(typeof val === 'number'){
        return val > 0;
    }
    if(typeof val === 'string'){
        if(val.length == 0){
            return false;
        }
        if(!isNaN(val)){
            val = this.parseFloat(val);
            return val > 0;
        }
        if(val.toLowerCase() == 'false'){
            return false;
        }
        return true;
    }
    return true;
}

global.getHttpPrefix = function(){
    return httpPrefix;
}

debug.enabled = () => {
    return false;
};
/*
var temDing = dingTalkCrypt.CreateDingTalkCrypt('ibj41N1p4ZMI9Qzm', 'xwr2exx10uyns59sqwqzaf86deykmfmfgxbigmta8l5', 'suiteez10hnwwjhpkogt6');
//var ff = temDing.DecryptMsg('8e682dfb3b484800619a84ea0aa00f8f35c4e898', '1573545773331', 'wUGOh8p5', 'zDSToIIyL3H4LNcAaREQzKITDYbG8588GRxYD0HyTclR0w7iE26cHF8KHnN4x1jji3oICWvjuz1Uux6xfPBInfTZrW5QHsZBePyNcHQMv2xCWz6BmpJuUgketbLvB+mgbdoJ8A0lD3eCHwRfOBrJig2MQeriK5idixU6J+Rb0ttkZbJerpqd3n0LXR4AIq7hDPkh8D/667oeUBG+ONQ5vw==');
//var ff = temDing.DecryptMsg('8150fd782ab6d3cefe3f66906d952ebe6a129fff', '1573545091568', 'HvZpfo2e', '83gT/TSrHF8OyTQmXRngDQ==');
var ff = temDing.EncryptMsg('hahababwawayayalala','1573542495654','b00t7jde');
var ff2 = temDing.DecryptMsg(ff.signature, '1573542495654', 'b00t7jde',ff.sEncryptMsg);
console.log(ff);
*/



const sqlTypes = dbhelper.Types;

var app = express();
app.disable('x-powered-by');
app.bUseHttps = bUseHttps;

var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        },
        encodeMyString: function (inputData) {
            var t = this;
            return new handlebars.handlebars.SafeString(inputData);
        },
        toString: function (inputData) {
            return inputData.toString();
        }
    }
});

app.set('http_port', process.env.PORT || 1330);
app.set('https_port', 1332);
app.set('port', bUseHttps ? 1332: (process.env.PORT || 1330));
//app.set('env', process.env.PORT || 'production');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var inProduction = app.get('env') == 'production';
if (inProduction) {
    app.set('view cache', true);
}

function getIPV4() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias;
            }
        }
    }
    return 'NaN';
}

var localIP = getIPV4();


app.set('hostip', localIP.address);
app.set('hostDirName', __dirname);

//3600000
var staticOptions = {
    maxAge: app.get('env') == 'production' ? 3600000 : 0
};

app.use(express.static(__dirname + '/public', staticOptions));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    var child = req.path;
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ resave: true, saveUninitialized: false, secret: credentials.cookieSecret, cookie: { secure: false } }));
var compression = require('compression');
app.use(compression());

switch (app.get('env')) {
    case 'development':
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

//app.use(connect.compress);

app.use(function (req, res, next) {
    var cluster = require('cluster');
    if (cluster.isWorker) {
        console.log('Worker %d received request', cluster.worker.id);
    }
    next();
});

function checkLogState(req, res, next, process) {
    if (req.session.g_envVar == null) {
        if (!inProduction) {
            req.session.g_envVar = developconfig.envVar;
            process(req, res, next);
        }
        else {
            var logrcd = req.signedCookies._erplogrcdid;
            if (logrcd != null) {
                dingHelper.aysnLoginfFromRcdID(logrcd, req, res).then(data => {
                    process(req, res, next);
                });
            }
            else {
                process(req, res, next);
            }
        }
    }
    else {
        if (req.session.g_envVar.userid == 0) {
            req.session.g_envVar.userid = null;
        }
        process(req, res, next);
    }
}

app.use('/', function (req, res, next) {
    if (req.path == '/' || req.path == '#') {
        /*
        res.locals.clientJs = '/js/views/erp/pages/test2.js';
        res.locals.title = '测试';
        return res.render('erppage/client', { layout: 'erppagetype_MA' });
        */
        var ua = req.headers['user-agent'];
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/) != null;
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/) != null;
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/) != null;
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/) != null;
        res.locals.isMobile = android || ipad || ipod || iphone;
        res.locals.isMobileStr = res.locals.isMobile ? 'true' : 'false';
        
        var fromHttp = req.client.ssl == null;
        dingHelper.asynGetDingDingTicket((fromHttp ? 'http' : 'https') + '://' + req.headers.host + req.originalUrl).then((data) => {
            res.locals.Signature = data.Signature == null ? '' : data.Signature;
            res.locals.TimeStamp = data.TimeStamp == null ? '' : data.TimeStamp;
            res.locals.NonceStr = data.NonceStr == null ? '' : data.NonceStr;
            res.locals.DingErrInfo = data.errInfo == null ? '' : data.errInfo;
            res.locals.isProduction = app.get('env') == 'production';

            if (!res.locals.isProduction) {

                res.locals.cacheUserid = developconfig.envVar.userid;
                res.locals.cacheUserName = developconfig.envVar.username;
                res.locals.g_envVar = JSON.stringify(developconfig.envVar);
                req.session.g_envVar = developconfig.envVar;
            }
            else {
                var cookiesUer = {
                    userid: -1,
                    username: '未知用户',
                    envVar: {},
                };
                var logrcd = req.signedCookies._erplogrcdid;
                //logrcd='5FE1EC04-4271-4650-AB4D-193A9F9D1DEA';
                if (logrcd != null) {
                    dingHelper.aysnLoginfFromRcdID(logrcd, req, res).then(
                        userData => {
                            if (userData != null) {
                                cookiesUer = userData;
                            }
                            res.locals.cacheUserid = cookiesUer.userid;
                            res.locals.cacheUserName = cookiesUer.username;
                            res.locals.g_envVar = JSON.stringify(cookiesUer);
                            return res.render('erppage/mobileerp', { layout: 'erppagetype_MA' });
                        }
                    );
                    return;
                }
                res.locals.cacheUserid = cookiesUer.userid;
                res.locals.cacheUserName = cookiesUer.username;
                res.locals.g_envVar = JSON.stringify(cookiesUer);
            }

            return res.render('erppage/mobileerp', { layout: 'erppagetype_MA' });
        });
        return;
    }

    next();
});

app.use('/fileSystem', function (req, res, next) {
    var hostIp = app.get('hostip');
    if (hostIp == '192.168.0.202') {
        hostIp = 'erp.highbird.cn';
    }
    var fromHttp = req.client.ssl == null;
    res.locals.rootUrl = (fromHttp ? 'http' : 'https') + '://' + hostIp + ':' + app.get('port');
    if(req.body && req.body.userpwd == 'csZiTqtL1O6KXWul'){
        req.session.g_envVar = developconfig.sysVar;
    }
    checkLogState(req, res, next, fileSystem.process);
});

app.use('/fromNotify', function (req, res, next) {
    if (!flowhelper.execFromNotify(req, res, next)) {
        next();
    }
});

app.use('/fromNotifyOption', function (req, res, next) {
    if (!flowhelper.execFromNotifyOption(req, res, next)) {
        next();
    }
});

app.use('/dingUtility', function (req, res, next) {
    if (req.path == '/') {
        dingHelper.doAction(req, res).then(rlt => {
            res.json(rlt);
        });
        return;
    }
    next();
});
/*
mac 系统更改
*/
app.use('/ERPDesigner/server', function (req, res, next) {
    var jspath = __dirname + '/views/ERPDesigner/server.js';
    //jspath = jspath.replace(/^\//, '');
    var serverMode = require(jspath);
    serverMode(req, res, next, app, erpPageCache);
    return;
});

/*
app.use('/mobileerp', function (req, res, next) {
    var ua = req.headers['user-agent'];
    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/) != null;
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/) != null;
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/) != null;
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/) != null;
    res.locals.isMobile = android || ipad || ipod || iphone;
    res.locals.isMobileStr = res.locals.isMobile ? 'true' : 'false';

    dingHelper.asynGetDingDingTicket(req.originalUrl).then((data)=>{
        res.locals.Signature = data.Signature == null? '' : data.Signature;
        res.locals.TimeStamp = data.TimeStamp == null? '' : data.TimeStamp;
        res.locals.NonceStr = data.NonceStr == null? '' : data.NonceStr;
        res.locals.DingErrInfo = data.errInfo == null? '' : data.errInfo;
        res.locals.isProduction = app.get('env') == 'production';
        res.locals.isProductionStr = app.get('env') == 'production' ? 'true' : 'false';

        return res.render('erppage/mobileerp', { layout: 'erppagetype_MA' });
    });
});
*/

app.use('/ERPDesigner/main', function (req, res, next) {
    return res.render('ERPDesigner/main', { layout: null });
});

app.use('/HelloReact', function (req, res, next) {
    return res.render('study/HelloReact', { layout: null });
});
app.use('/MessageBox', function (req, res, next) {
    return res.render('study/MessageBox', { layout: null });
});

app.use('/ReactKeyList', function (req, res, next) {
    return res.render('study/ReactKeyList', { layout: null });
});

app.use('/helloProcess', function (req, res, next) {
    var jspath = __dirname + '/views/study/helloProcess.js';
    jspath = jspath.replace(/^\//, '');

    require(jspath)(req, res, next);
    return;
});

app.use('/dingdingTest', function (req, res, next) {
    var jspath = __dirname + '/views/study/dingdingTest.js';
    jspath = jspath.replace(/^\//, '');

    require(jspath)(req, res, next);
    return;
});

app.get('/sessionTest', function (req, res) {
    var money = req.cookies.money;
    var id = req.signedCookies.id;
    res.cookie('money', '100');
    res.cookie('id', '980', { signed: true, maxAge: 1000000, httpOnly: true });
    if (req.session.count == null) {
        req.session.count = 0;
    }
    req.session.count += 1;

    res.json({ money: money, id: id, count: req.session.count });
});

/*
app.get('/about',function(req, res){
    res.render('about',{fortune:fortune.getFortune()});
    //res.render('about');
});

app.get('/headers',function(req, res){
    res.type('text/plain');
    var s = '';
    for(var name in req.headers){
        s += name + ':' + req.headers[name] + '\n';
    }
    res.json(req.headers);
    //res.render('about');
});

app.get('/flex',function(req, res){
    res.render('flexTest',{layout:'flex'});
});


app.get('/newsletter', function(req, res){
    var money = req.cookies.money;
    var id = req.signedCookies.id;
    res.cookie('money', '100');
    res.cookie('id', '980', {signed:true, maxAge:1000000, httpOnly:true});
    if(req.session.count == null){
        req.session.count = 0;
    }
    req.session.count += 1;

    res.render('newsletter', {csrf:'CSRF token goes here',id:id,count:req.session.count});
});

app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json')==='json'){
        res.send({success:true});
    }else{
        res.redirect(303, '/thank-you');
    }
});

let myFirstPromise = new Promise((resolve, reject) => {
    // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
    // In this example, we use setTimeout(...) to simulate async code. 
    // In reality, you will probably be using something like XHR or an HTML5 API.
    setTimeout(function(){
      resolve("Success434!"); // Yay! Everything went well!
    }, 250);
  });


/*
co(function *(){
    // yield any promise
    var result = yield dbhelper.asynQueryWithParams("select * from dbo.T135D在线面试问题2",null);
    console.log('haha result=' + JSON.stringify(result));
}).catch((err)=>{console.log(err);});
*/

/*
dbhelper.query("select * from dbo.T135D在线面试问题",(data)=>{
    console.log(data);
});
*/
//flowhelper.startWork();

var autoViews = {};
var erpPageCache = {};
var fs = require('fs');

//var tjspath = __dirname + '/views/erppage/server/pages/WLXXGL_s40.js'
//var tt = require(tjspath);

function processErppageServer(req, res, next) {
    var pageName = req.path.substr(1).toUpperCase();
    var cache = erpPageCache[pageName];
    var jspath = null;
    if (cache == null) {
        jspath = __dirname + '/views/erppage/server' + req.path + '.js';
        if (fs.existsSync(jspath)) {
            var jsModel = require(jspath);
            return jsModel(req, res, next, app);
        }
        return res.json(serverhelper.createErrorRet(req.path + '.js未找到'));
    }

    resoreUserLogin(req, res).then(envar => {
        jspath = __dirname + '/views/erppage/server/pages/' + cache.serverName + '.js';
        if (!fs.existsSync(jspath)) {
            return res.json(serverhelper.createErrorRet(req.path + '.js未找到'));
        }
        return require(jspath)(req, res, next, app);
    });
}

app.use('/erppage/server', function (req, res, next) {
    checkLogState(req, res, next, processErppageServer);
});

app.use('/erppage/login', function (req, res, next) {
    res.locals.isProduction = app.get('env') == 'production';
    var jsFilePath = '/js/views/erp/loginpage.js';
    if (fs.existsSync(__dirname + '/public' + jsFilePath)) {
        res.locals.clientJs = jsFilePath;
        res.locals.title = '用户登录';
        res.locals.g_envVar = req.session.g_envVar == null ? '{}' : JSON.stringify(req.session.g_envVar);
        return res.render('erppage/client', { layout: 'erppagetype_MA' });
    }
    else {
        res.status(404);
        return res.render('404');
    }
});

app.use('/erppage/QRlogin', function (req, res, next) {
    res.locals.isProduction = app.get('env') == 'production';
    var jsFilePath = '/js/views/erp/QRCodeLogin.js';
    if (fs.existsSync(__dirname + '/public' + jsFilePath)) {
        res.locals.clientJs = jsFilePath;
        res.locals.title = '扫码登录';
        res.locals.g_envVar = req.session.g_envVar == null ? '{}' : JSON.stringify(req.session.g_envVar);
        return res.render('erppage/client', { layout: 'erppagetype_MA' });
    }
    else {
        res.status(404);
        return res.render('404');
    }
});

app.use('/server/queryqrloginstate', function (req, res, next) {
    var id = req.query.id;
    res.writeHead(200,{
        "Content-Type":"text/plain;charset=utf-8"
    });
    if(id == null || id.length == 0){
        res.write('0');
        res.end();
    }
    else{
        dbhelper.asynQueryWithParams('SELECT dbo.FB员工登记姓名([登录用户代码]) as 姓名,登录用户代码 as 代码 FROM [base1].[dbo].[T124C外部快捷登录] where [登录令牌] = @id and datediff(minute, [登录时间], getdate()) < 30', [dbhelper.makeSqlparam('id', sqlTypes.NVarChar(50), id)])
        .then(record=>{
            if(record.recordset.length == 1){
                res.write('1' + record.recordset[0]['姓名'] + ',' + record.recordset[0]['代码']);
            }
            else{
                res.write('0');
            }
            res.end();
        });
    }
    return;
});

app.use('/makeqrcode', function (req, res, next) {
    var text = req.query.text;
    if(text == null || text.length == 0){
        res.write('需要参数');
        res.end();
    }
    else{
        text = text.replace(/\|and\|/g, '&');
        QRCode.toDataURL(text, function (err, url) {
            res.write(url);
            res.end();
        });
    }
    return;
});

app.use('/makeqrcode2', function (req, res, next) {
    var text = req.body ? req.body.text : null;
    if(text == null || text.length == 0){
        return res.json(serverhelper.createErrorRet('需要参数'));
    }
    else{
        text = text.replace(/\|and\|/g, '&');
        QRCode.toDataURL(text, function (err, url) {
            return res.json({data:url});
        });
    }
    return;
});

app.use('/videoplayer', function (req, res, next) {
    return res.render('empty', { layout: 'videoPlayer' });
});

app.use('/audioplayer', function (req, res, next) {
    return res.render('empty', { layout: 'audioPlayer' });
});

function renderErpPage(req, res, next) {
    res.locals.isProduction = app.get('env') == 'production';
    var childPath = req.path;
    var t_arr = childPath.split('/');
    if (t_arr.length != 3 && (t_arr.length != 4 || t_arr[3] != '')) {
        res.status(404);
        return res.render('404');
    }
    var pageName = t_arr[2].toUpperCase();
    pageName = pageName.replace('#', '');
    var isPC = t_arr[1].toLowerCase() == 'pc';
    var cache = erpPageCache[pageName];

    if (cache != null) {
        var layoutName = isPC ? cache.pcLayoutName : cache.mobileLayoutName;
        var jsFilePath = '/js/views/erp/pages/' + (isPC ? cache.pcJsPath : cache.mobileJsPath) + '.js';
        if (fs.existsSync(__dirname + '/public' + jsFilePath)) {
            var ua = req.headers['user-agent'];
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/) != null;
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/) != null;
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/) != null;
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/) != null;
            res.locals.isMobile = android || ipad || ipod || iphone;
            res.locals.isMobileStr = res.locals.isMobile ? 'true' : 'false';

            var fromHttp = req.client.ssl == null;
            dingHelper.asynGetDingDingTicket((fromHttp ? 'http' : 'https') + '://' + req.headers.host + req.originalUrl).then((data) => {
                res.locals.Signature = data.Signature == null ? '' : data.Signature;
                res.locals.TimeStamp = data.TimeStamp == null ? '' : data.TimeStamp;
                res.locals.NonceStr = data.NonceStr == null ? '' : data.NonceStr;
                res.locals.DingErrInfo = data.errInfo == null ? '' : data.errInfo;

                res.locals.clientJs = jsFilePath;
                res.locals.title = cache.title;
                res.locals.g_envVar = req.session.g_envVar == null ? '{}' : JSON.stringify(req.session.g_envVar);
                return res.render('erppage/client', { layout: layoutName });
            });
            return;
        }
    }
    res.status(404);
    return res.render('404');
}

app.use('/erppage', function (req, res, next) {
    checkLogState(req, res, next, renderErpPage);
});

var jsCache = {};
app.use('/interview', function (req, res, next) {
    var childPath = req.path.toLowerCase();
    var path = '/interview' + childPath; // 检查 缓存； 如果 它在 那里， 渲染 这个 视图 
    if (childPath != null && childPath.lastIndexOf('_process') == childPath.length - 8) {
        var jspath = __dirname + '/views' + path + '.js';
        jspath = jspath.replace(/^\//, '');
        if (jsCache[jspath] == null) {
            jsCache[jspath] = require(jspath);
        }
        else (fs.existsSync(jspath))
        {
            // process操作
            jsCache[jspath](req, res, next);
            return;
        }
    }
    else {
        if (autoViews[path]) {
            return res.render(autoViews[path], { layout: 'mobilesimple' }); // 如果 它不 在 缓存 里， 那就 看看 有没有. handlebars 文件 能 匹配 
        }
        if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
            autoViews[path] = path.replace(/^\//, '');
            return res.render(autoViews[path], { layout: 'mobilesimple' });
        } // 没 发现 视图； 转到 404 处理器
    }
    next();
});

app.use('/dingcallback', function (req, res, next) {
    if (req.query.signature == null || req.query.timestamp == null || req.query.nonce == null) {
        res.json({ err: '缺失参数' });
        return;
    }
    if (req.body.encrypt == null) {
        res.json({ err: '缺失body参数' });
        return;
    }
    var theDingTalkCrypt = dingTalkCrypt.CreateDingTalkCrypt('ibj41N1p4ZMI9Qzm', 'xwr2exx10uyns59sqwqzaf86deykmfmfgxbigmta8l5', 'suiteez10hnwwjhpkogt6');
    var msg = theDingTalkCrypt.DecryptMsg(req.query.signature, req.query.timestamp, req.query.nonce, req.body.encrypt);
    if (msg == false) {
        res.json({ err: '解析失败' });
        return;
    }
    /*
    msg_signature	消息体签名
    timeStamp	时间戳
    nonce	随机字符串
    encrypt	"success"字段的加密字符串
    */
    var msgJson = JSON.parse(msg);
    var retMsg = dingHelper.receiveCallback(msgJson);
    var rlt = theDingTalkCrypt.EncryptMsg(retMsg, req.query.timestamp, req.query.nonce);
    
    res.json({
        msg_signature: rlt.signature,
        encrypt: rlt.sEncryptMsg,
        timeStamp: req.query.timestamp,
        nonce: req.query.nonce,
    });
    return;
});

app.use('/download', function (req, res, next) {
    if(req.query.excelid != null){
        fileSystem.downloadExcelFile(req, res);
    }
    else{
        res.json({ err: '缺失参数' });
        return;
    }
});

app.use('/ai', function (req, res, next) {
    var childPath = req.path;
    if (childPath.length < 2) {
        res.json({ err: '未指定ai处理器' });
        return;
    }
    var jspath = __dirname + '/dingding/ai/' + childPath.substr(1) + '_ai.js';
    var jspath = jspath.replace(/^\//, '');
    if (jsCache[jspath] != null) {
        jsCache[jspath](req, res, next);
    }
    else if (fs.existsSync(jspath))
    {
        jsCache[jspath] = require(jspath);
        jsCache[jspath](req, res, next);
    }
    else{
        res.json({ err: '不存在的ai处理器' });
    }
    return;
});

app.use(function (req, res, next) {
    var path = req.path.toLowerCase(); // 检查 缓存； 如果 它在 那里， 渲染 这个 视图 
    if (autoViews[path]) {
        return res.render(autoViews[path]); // 如果 它不 在 缓存 里， 那就 看看 有没有. handlebars 文件 能 匹配 
    }
    if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
        autoViews[path] = path.replace(/^\//, '');
        return res.render(autoViews[path]);
    } // 没 发现 视图； 转到 404 处理器 
    next();
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
    //res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    //res.type('text/plain');
    res.status(500);
    res.render('500');
    //res.send('500 - Server Error');
});


function startServer() {
    freshPageCache();
    setInterval(freshPageCache, 1000 * 30);
    if(bUseHttps){
        var privateKey = fs.readFileSync('key.pem').toString();
        var certificate = fs.readFileSync('cert.pem').toString();

        var opts = {
            key : privateKey,
            cert : certificate
        }
        https.createServer(opts,app).listen(app.get('https_port'), function () {
            var hostIp = app.get('hostip');
            if (hostIp == '192.168.0.202') {
                hostIp = 'erp.highbird.cn';
            }
            console.log('Express started on https://' + hostIp + ':' + app.get('https_port') + '; press Ctl-C to terminate.');
            console.log('env:' + app.get('env'));
        });
    }
    http.createServer(app).listen(app.get('http_port'), function () {
        var hostIp = app.get('hostip');
        if (hostIp == '192.168.0.202') {
            hostIp = 'erp.highbird.cn';
        }
        console.log('Express started on http://' + hostIp + ':' + app.get('http_port') + '; press Ctl-C to terminate.');
        console.log('env:' + app.get('env'));
    });
}

if (require.main == module) {
    startServer();
}
else {
    module.exports = startServer;
}

function freshPageCache() {
    console.log('freshPageCache');
    var sql = 'SELECT [系统方案名称],[桌面端名称],[移动端名称],[桌面端LN],[移动端LN],[后台名称],[当前版本],[方案英文名称] FROM [base1].[dbo].[V002C系统方案名称] where (len([桌面端名称]) > 0 or len([移动端名称]) > 0)';
    dbhelper.asynQueryWithParams(sql)
        .then(ret => {
            ret.recordset.forEach(
                row => {
                    var mobileJsPath = row.移动端名称;
                    var mobileLayoutName = row.移动端LN;
                    var pcJsPath = row.桌面端名称;
                    var pcLayoutName = row.桌面端LN;
                    var serverName = row.后台名称;
                    var nowCache = erpPageCache[row.系统方案名称];
                    if (nowCache != null && nowCache.version == row.当前版本) {
                        return;
                    }

                    if (mobileJsPath.length == 0) {
                        mobileJsPath = pcJsPath;
                        mobileLayoutName = pcLayoutName;
                    }
                    else if (pcJsPath.length == 0) {
                        pcJsPath = mobileJsPath;
                        pcLayoutName = mobileLayoutName;
                    }

                    nowCache = {
                        mobileJsPath: mobileJsPath,
                        mobileLayoutName: mobileLayoutName,
                        pcJsPath: pcJsPath,
                        pcLayoutName: pcLayoutName,
                        serverName: serverName,
                        title: row.系统方案名称,
                        version: row.当前版本,
                    };
                    erpPageCache[row.方案英文名称] = nowCache;
                }
            );
            console.log('freshPageCache end');
        });
}

function resoreUserLogin(req, res) {
    return co(function* () {
        if (req.session.g_envVar != null) {
            return req.session.g_envVar;
        }
        var logrcd = req.signedCookies._erplogrcdid;
        if (logrcd == null) {
            return null;
        }
        var envar = yield dingHelper.aysnLoginfFromRcdID(logrcd, req, res);
        return envar;
    });
}