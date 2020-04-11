var cluster = require('cluster');
var flowhelper = require('./flowhelper.js');
var fs = require('fs');
var path = require("path");
var util = require('util')
var now=new Date();

var logDir = path.join(__dirname, 'log');
if (!fs.existsSync(logDir))
{
    fs.mkdirSync(logDir);
}
logDir = path.join(logDir, 'cluster');
if (!fs.existsSync(logDir))
{
    fs.mkdirSync(logDir);
}
var logFilePath = path.join(logDir, now.getFullYear() + '_' + now.getMonth() + '_' + now.getDate() + '.txt');

console.error = function() {
    fs.appendFileSync(logFilePath, util.format.apply(null, arguments) + '\n');
    process.stderr.write(util.format.apply(null, arguments) + '\n');
}

function startWorker(){
    var worker = cluster.fork();
    fs.appendFileSync(logFilePath, 'CLUSTER: Worker ' + worker.id + ' started\n');
    console.log('CLUSTER: Worker %d start.', worker.id);
}

if(cluster.isMaster){
    fs.appendFileSync(logFilePath, 'master start');
    require('os').cpus().forEach(function(){
        startWorker();
    });

    cluster.on('disconnect', function(worker){
        fs.appendFileSync(logFilePath, 'CLUSTER: Worker ' + worker.id + ' disconnect\n');
        console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    cluster.on('exit', function(woker, code, signal){
        fs.appendFileSync(logFilePath, 'CLUSTER: Worker ' + worker.id + ' exit:' + code + ',signal:' + signal + '\n');
        console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
        startWorker();
    });

    flowhelper.startWork();
}
else{
    require('./hbnewsite.js')();
}