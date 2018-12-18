var helper={};

helper.createErrorRet = (info,code,data)=>{
    return {
            err:{
                info:info,
                code:code,
                data:data,
            }
        };
}

module.exports = helper;