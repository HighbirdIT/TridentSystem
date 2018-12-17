const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");
const forge = require("node-forge");

function process(req, res, next) {
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            if(data.err){
                rlt.err = data.err;
            }
            else if(data.banAutoReturn){
                return;
            }
            else{
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
        })
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'test':
            return test(req, res);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}

function test(req, res){
    return co(function* () {
        var data = {
            a:1,
            b:2,
            c:3
        };
        return data;
    });
}



module.exports = process;