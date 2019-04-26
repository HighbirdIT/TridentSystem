var cluster = require('cluster');
var flowhelper = require('./flowhelper.js');

function startWorker(){
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if(cluster.isMaster){
    require('os').cpus().forEach(function(){
        startWorker();
    });

    cluster.on('disconnect', function(worker){
        console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    cluster.on('exit', function(woker, code, signal){
        console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code. signal);
        startWorker();
    });

    flowhelper.startWork();
}
else{
    require('./hbnewsite.js')();
}