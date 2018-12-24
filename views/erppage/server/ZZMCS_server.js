const dbhelper = require('../../../dbhelper.js');
const serverhelper = require('../../../erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require('fs');
const forge = require('node-forge');
var processes_map={pageloaded:pageloaded,};

function process(req,res,next){
	serverhelper.commonProcess(req, res, next, doProcess);
}
function pageloaded(req,res){
return co(function* () {
	var rlt = {};
	return rlt;

});}


module.exports = process;
