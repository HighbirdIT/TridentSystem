const dbhelper = require('../../dbhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const sharp = require('sharp');
const fs = require("fs");


function process(req, res, next) {
    var rlt = {};
    doProcess(req, res)
        .then((data) => {
            rlt.data = data;
            res.json(rlt);
        })
        .catch(err => {
            rlt.err = {
                info: err.message
            };
            res.json(rlt);
        });
}

function doProcess(req, res) {
    switch (req.body.action) {
        case 'pageinit':
            return readyData();
        case 'upload':
            return uploadData(req);
        case 'uploadBlock':
            return uploadBlock(req);
    }

    return co(function* () {
        var data = {};
        return data;
    });
}

function uploadBlock(req) {
    return co(function* () {
        var data = {};

        var theDir = "temp/";
        if(!fs.existsSync(theDir)){
            fs.mkdirSync(theDir);
        }
        theDir = "temp/interviewee/";
        if(!fs.existsSync(theDir)){
            fs.mkdirSync(theDir);
        }
        var filePath = theDir + req.body.name;
        if(req.body.start == 0){
            if(fs.existsSync(filePath)){
                fs.unlinkSync(filePath);
            }
        }
        var fd = fs.openSync(filePath,'a');
        fs.writeSync(fd,req.body.data);
        fs.closeSync(fd);

        return data;
    });
}

function readyData() {
    return co(function* () {
        var data = {};

        var quesResult = yield dbhelper.asynQueryWithParams("select 在线面试问题代码 as id,问题描述 as title, 问题顺序,可以跳过,应届可答,关联岗位代码 as relPost from dbo.T135D在线面试问题 where 终止确认状态 = 0 order by 问题顺序", null);

        data.ques_arr = quesResult.recordset;

        var englishLevelResult = yield dbhelper.asynQueryWithParams("select 能力等级 as label,英语能力等级代码 as id from dbo.T135B英语能力等级 where 终止确认状态 = 0", null);
        data.englishLevels_arr = englishLevelResult.recordset;

        var postsResult = yield dbhelper.asynQueryWithParams("SELECT [招聘岗位信息代码] as id,[招聘部门] + '-' + [岗位名称] as label,[岗位要求] as info FROM [base1].[dbo].[T135C招聘岗位信息] where [终止确认状态] = 0 order by label ", null);
        data.pots_arr = postsResult.recordset;

        return data;
    });
}

function makePostParam(label,name,type,nullable,path,min,max){
    var rlt = {label:label,name:name,type:type,nullable:nullable,path:path,min:min,max:max};
    if(type == 'date'){
        if(min){
            rlt.min = new Date(min);
            if(isNaN(rlt.min)){
                rlt.min = null;
            }
        }
        if(max){
            rlt.max = new Date(max);
            if(isNaN(rlt.max)){
                rlt.max = null;
            }
        }
    }
    return rlt;
}
function makeSelectPostParam(label,name,path){
    return makePostParam(label, name,'select', null, path);
}

function assertPostData(postData, settings_arr) {
    if (postData == null) {
        throw new Error('postData无效');
    }
    if (settings_arr == null) {
        return;
    }
    var errInfo = '';
    var errField = settings_arr.find(field => {
        if (field.nullable == true) {
            return null;
        }
        var valParentObj = postData;
        if (field.path && field.path.length > 0) {
            field.path.split('.').forEach(path_frag => {
                valParentObj = valParentObj[path_frag];
                if (valParentObj == null) {
                    errInfo = '值没有提供';
                    return field;
                }
            });
        }
        var nowVal = valParentObj[field.name];
        if (nowVal == null) {
            return null;
        }
        switch (field.type) {
            case 'select':
            {
                if(nowVal == '=select-default='){
                    errInfo = '没有选择';
                    return field;
                }
                break;
            }
            case 'string':
                {
                    if (field.minLen) {
                        if (field.min != null && nowVal.length < field.min) {
                            errInfo = '长度要大于' + field.min;
                            return field;
                        }
                        if (field.max != null && nowVal.length > field.max) {
                            errInfo = '长度要小于' + field.max;
                            return field;
                        }
                    }
                    break;
                }
            case 'int':
                {
                    nowVal = parseInt(nowVal);
                    valParentObj[field.name] = nowVal;
                    if (isNaN(nowVal)) {
                        errInfo = '值必须是整数';
                        return field;
                    }
                    if (field.min != null && nowVal < field.min) {
                        errInfo = '值要大于' + field.min;
                        return field;
                    }
                    if (field.max != null && nowVal > field.max) {
                        errInfo = '值要小于' + field.max;
                        return field;
                    }
                    break;
                }
            case 'number':
                {
                    nowVal = parseFloat(nowVal);
                    if (isNaN(nowVal)) {
                        errInfo = '值必须是数值类型';
                        return field;
                    }
                    if (field.min != null && nowVal < field.min) {
                        errInfo = '值要大于' + field.min;
                        return field;
                    }
                    if (field.max != null && nowVal > field.max) {
                        errInfo = '值要小于' + field.max;
                        return field;
                    }
                    break;
                }
            case 'date':
                {
                    if(typeof(nowVal) != 'string' && typeof(nowVal) != 'date'){
                        errInfo = '值必须是日期类型';
                        return field;
                    }
                    var dateVal = new Date(Date.parse(nowVal));
                    if(isNaN(dateVal.getDate())){
                        errInfo = '值必须是日期类型';
                        return field;
                    }
                    if (field.min != null && dateVal < field.min) {
                        errInfo = '值要大于' + field.min.toLocaleDateString();
                        return field;
                    }
                    if (field.max != null && dateVal > field.max) {
                        errInfo = '值要小于' + field.max.toLocaleDateString();
                        return field;
                    }
                    break;
                }
        }
        return null;
    });
    if(errField != null){
        throw new Error("'" + errField.label + "'" + errInfo);
    }
}

function uploadData(req) {
    return co(function* () {
        var postData = req.body;
        if (postData.workState == '应届生') {
            postData.workyear = 0;
        }
        var temp = yield Promise.resolve(1);

        var now = new Date(new Date().toLocaleDateString());
        var minBormDate = new Date(now.getFullYear() - 50,1,1);
        var maxBornDate = new Date(now.getFullYear() - 16,1,1);
        var minFastmDate = now;
        var maxFastDate = now + 90;
        var needPostParams = [
            makeSelectPostParam('应聘职位','post'),
            makePostParam('姓名','name','string',false,null,2,10),
            makePostParam('性别','sex','string',false),
            makePostParam('出生日期','borndate','date',false,null,minBormDate,maxBornDate),
            makePostParam('籍贯','jiguan','string',false,null,2,20),
            makeSelectPostParam('当前状态','workState'),
            makePostParam('毕业院校','school','string',false,null,4,30),
            makeSelectPostParam('学历','xueli'),
            makeSelectPostParam('英语能力','englishlevel'),
            makePostParam('手机号码','tel','string',false,null,11,11),
            makePostParam('现居住地','address','string',false,null,2,20),
            makePostParam('期望薪资','money','int',false,null,0),
            makePostParam('工作年限','workyear','int',false,null,0,30),
            makePostParam('最快到岗','date','int',false,null,minFastmDate,maxFastDate),
            makePostParam('健康状态','bodystate','string',false),
        ];

        assertPostData(postData,
            needPostParams
        );

        if(postData.ques_arr == null || !Array.isArray(postData.ques_arr) || postData.ques_arr.length == 0){
            throw new Error('没有答题信息');
        }
        

        var testP = yield dbhelper.asynExcute('P135E应聘资料上传'
            , [dbhelper.makeSqlparam('应聘职位代码', sqlTypes.Int, postData.post)
                , dbhelper.makeSqlparam('人员姓名', sqlTypes.NVarChar(20), postData.name)
                , dbhelper.makeSqlparam('性别', sqlTypes.TinyInt, postData.sex == 'm' ? '1' : '2')
                , dbhelper.makeSqlparam('出生日期', sqlTypes.Date, postData.borndate)
                , dbhelper.makeSqlparam('籍贯', sqlTypes.NVarChar(100), postData.jiguan)
                , dbhelper.makeSqlparam('当前状态', sqlTypes.NVarChar(20), postData.workState)
                , dbhelper.makeSqlparam('学历', sqlTypes.NVarChar(20), postData.xueli)
                , dbhelper.makeSqlparam('专业', sqlTypes.NVarChar(100), postData.zhuanye)
                , dbhelper.makeSqlparam('英语能力等级代码', sqlTypes.Int, postData.englishlevel)
                , dbhelper.makeSqlparam('手机号码', sqlTypes.NVarChar(20), postData.tel)
                , dbhelper.makeSqlparam('现居住地', sqlTypes.NVarChar(100), postData.address)
                , dbhelper.makeSqlparam('期望薪资', sqlTypes.Int, postData.money)
                , dbhelper.makeSqlparam('工作年限', sqlTypes.Int, postData.workyear)
                , dbhelper.makeSqlparam('最快到岗', sqlTypes.Date, postData.fastdate)
                , dbhelper.makeSqlparam('健康状态', sqlTypes.NVarChar(200), postData.bodystate)
                , dbhelper.makeSqlparam('登记确认用户', sqlTypes.Int, 0)
                , dbhelper.makeSqlparam('毕业院校', sqlTypes.NVarChar(50), postData.school)]
            , [dbhelper.makeSqlparam('应聘记录识别码', sqlTypes.NVarChar(40))
                , dbhelper.makeSqlparam('执行成功', sqlTypes.Int)
                , dbhelper.makeSqlparam('错误信息', sqlTypes.NVarChar(200))
                , dbhelper.makeSqlparam('应聘人员记录代码', sqlTypes.Int)
            ]);

        if (testP.output.执行成功 == false) {
            throw new Error(testP.output.错误信息);
        }
        var data = {
            identify: testP.output.应聘记录识别码,
        };
        var rcdId = testP.output.应聘人员记录代码;
        postData.ques_arr.forEach(ques=>{
            var temP = dbhelper.asynExcute('P135E问题作答上传'
            , [dbhelper.makeSqlparam('应聘人员记录代码', sqlTypes.Int, rcdId)
                , dbhelper.makeSqlparam('在线面试问题代码', sqlTypes.Int, ques.id)
                , dbhelper.makeSqlparam('回答内容', sqlTypes.NVarChar(500), ques.answer)]
            ).catch(err=>{
                console.log(err);
            });
        });

        if(postData.photoName != null){
            try
            {
                var filePath = "temp/interviewee/" + postData.photoName;
                if(fs.existsSync(filePath))
                {
                    var fileContent = fs.readFileSync(filePath,'utf8');
                    var base64Data = fileContent.replace(/^data:image\/\w+;base64,/, "");
                    var dataBuffer = new Buffer(base64Data, 'base64');
                    var theimg = sharp(dataBuffer);
                    var theDir = "public/res/img/interviewee/";
                    if(!fs.existsSync(theDir))
                        fs.mkdirSync(theDir);
                    if(!isNaN(postData.Orientation) && postData.Orientation != 0){
                        var rotateDeg = 0;
                        switch (postData.Orientation) {
                            case 1:
                                rotateDeg = 0;
                                break;
                            case 3:
                                rotateDeg = 180;
                                break;
                            case 6:
                                rotateDeg = 90;
                                break;
                            case 8:
                                rotateDeg = -90;
                                break;
                        }
                        theimg.rotate(rotateDeg);
                    }
                    theimg.toFile(theDir + data.identify + '.jpg');
                    theimg= null;
                    dataBuffer = null;
                    fs.unlinkSync(filePath);
                }
            }catch(err){
                console.log(err);
            }
        }

        setTimeout(() => {
            dbhelper.asynExcute('P135E推送应聘资料'
            , [dbhelper.makeSqlparam('应聘记录识别码', sqlTypes.NVarChar(50), data.identify)]
            ).catch(err=>{
                console.log(err);
            });
        }, 1);
        //throw new Error('测试错误');
        return data;
    });
}

module.exports = process;