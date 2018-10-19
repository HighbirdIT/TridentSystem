'use strict';
var express = require('express');
var http = require('http');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var connect = require('connect');
var React = require('react');
var dbhelper = require('./dbhelper.js');
var co = require('co');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers:{
        section:function(name, options){
            if(!this._sections){
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.set('port', process.env.PORT || 1318);
//app.set('env', process.env.PORT || 'production');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
if(app.get('env') == 'production'){
    //app.set('view cache', true);
}



var staticOptions = { 
    maxAge: app.get('env') == 'production' ? 3600000 : 0
};

app.use(express.static(__dirname + '/public', staticOptions));
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(bodyParser.json({limit:'50mb'}));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({resave:true, saveUninitialized:false, secret:credentials.cookieSecret}));
var compression = require('compression');
app.use(compression());

switch(app.get('env')){
    case 'development':
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        app.use(require('express-logger')({
            path:__dirname + '/log/requests.log'
        }));
        break;
}

//app.use(connect.compress);

app.use(function(req, res, next){
    var cluster = require('cluster');
    if(cluster.isWorker){
        console.log('Worker %d received request', cluster.worker.id);
    }
    res.locals.isproduction = app.get('env') == 'production' ? true : false;
    next();
});

app.use('/ERPDesigner/server',function( req, res, next)
{
    var jspath = __dirname + '/views/ERPDesigner/server.js';
    jspath = jspath.replace(/^\//, ''); 

    require(jspath)(req,res, next);
    return;
});

app.use('/ERPDesigner',function( req, res, next)
{
    return res.render('ERPDesigner/main', {layout:null}); 
});

app.use('/HelloReact',function( req, res, next)
{
    return res.render('study/HelloReact', {layout:null}); 
});

app.use('/ReactKeyList',function( req, res, next)
{
    return res.render('study/ReactKeyList', {layout:null}); 
});

app.use('/helloProcess',function( req, res, next)
{
    var jspath = __dirname + '/views/study/helloProcess.js';
    jspath = jspath.replace(/^\//, ''); 

    require(jspath)(req,res, next);
    return;
});

app.use('/dingdingTest',function( req, res, next)
{
    var jspath = __dirname + '/views/study/dingdingTest.js';
    jspath = jspath.replace(/^\//, ''); 

    require(jspath)(req,res, next);
    return;
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

var autoViews = {};
var jsCache = {};
var fs = require('fs'); 

app.use('/interview',function( req, res, next)
{
    var childPath = req.path.toLowerCase();
    var path = '/interview' + childPath; // 检查 缓存； 如果 它在 那里， 渲染 这个 视图 
    if(childPath != null && childPath.lastIndexOf('_process') == childPath.length -8){
        var jspath = __dirname + '/views' + path + '.js';
        jspath = jspath.replace(/^\//, ''); 
        if(jsCache[jspath] == null){
            jsCache[jspath] = require(jspath);
        }
        else(fs.existsSync(jspath))
        {
            // process操作
            jsCache[jspath](req,res,next);
            return;
        }
    }
    else{
        if(autoViews[path]){
            return res.render(autoViews[path], {layout:'mobilesimple'}); // 如果 它不 在 缓存 里， 那就 看看 有没有. handlebars 文件 能 匹配 
        }
        if(fs.existsSync(__dirname + '/views' + path + '.handlebars'))
        { 
            autoViews[path] = path.replace(/^\//, ''); 
            return res.render(autoViews[path], {layout:'mobilesimple'}); 
        } // 没 发现 视图； 转到 404 处理器
    }
    next(); 
});

app.use(function( req, res, next)
{ 
    var path = req.path.toLowerCase(); // 检查 缓存； 如果 它在 那里， 渲染 这个 视图 
    if(autoViews[path]){
        return res.render(autoViews[path]); // 如果 它不 在 缓存 里， 那就 看看 有没有. handlebars 文件 能 匹配 
    }
    if(fs.existsSync(__dirname + '/views' + path + '.handlebars'))
    { 
        autoViews[path] = path.replace(/^\//, ''); 
        return res.render(autoViews[ path]); 
    } // 没 发现 视图； 转到 404 处理器 
    next(); 
});

app.use(function(req, res){
    res.status(404);
    res.render('404');
    //res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    //res.type('text/plain');
    res.status(500);
    res.render('500');
    //res.send('500 - Server Error');
});

function startServer(){
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express started on http://localhost:' + app.get('port') + '; press Ctl-C to terminate.');
        console.log('env:' + app.get('env'));
    });
}

if(require.main == module){
    startServer();
}
else{
    module.exports = startServer;
}
