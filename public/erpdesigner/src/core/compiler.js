class ProjectCompiler extends EventEmitter{
    constructor(project, projProfile){
        super();
        EnhanceEventEmiter(this);
        this.project = project;
        this.projProfile = projProfile;

        autoBind(this);
    }

    getMidData(key){
        if(typeof key !== 'string'){
            console.error('getMidData key must string');
        }
        var rlt = this.midData_map[key];
        if(rlt== null){
            rlt = {
                needSetStates_arr:[],
                useColumns_map:[],
                useControls_map:[],
            };
            this.midData_map[key] = rlt;
        }
        return rlt;
    }

    getCache(key){
        if(typeof key !== 'string'){
            console.error('getCache key must string');
        }
        return this.cache_map[key];
    }

    setCache(key, value){
        this.cache_map[key] = value;
    }

    clickSqlCompilerLogBadgeItemHandler(badgeItem){
        if(badgeItem.data){
            var project = this.project;
            var designer = project.designer;
            designer.forcusSqlNode(badgeItem.data);
        }
    }

    clickJSCompilerLogBadgeItemHandler(badgeItem){
        if(badgeItem.data){
            var blueprint = badgeItem.data.bluePrint;
            if(blueprint && blueprint.master){
                var project = blueprint.master.project;
                project.designer.editScriptBlueprint(blueprint);
            }
        }
    }

    clickKernelLogBadgeItemHandler(badgeItem){
        if(badgeItem.data){
            var project = this.project;
            var designer = project.designer;
            designer.selectKernel(badgeItem.data);
        }
    }

    stopCompile(isCompleted, stopInfo){
        var project = this.project;
        var logManager = project.logManager;
        var errCount = logManager.getCount(LogTag_Error);
        this.isCompleted = errCount == 0 && isCompleted;
        if(!IsEmptyString(stopInfo)){
            logManager.log("发生错误,项目编译已终止");
            this.isCompleted = false;
        }
        logManager.log('项目编译完成,共' + logManager.getCount(LogTag_Warning) + '条警告,' + logManager.getCount(LogTag_Error) + '条错误,');
        this.fireEvent('completed');
    }

    compile(){
        var project = this.project;
        var logManager = project.logManager;
        this.midData_map = {};
        this.cache_map = {};
        logManager.clear();
        logManager.log('执行项目编译');
        
        // compile all sql_blueprint
        var ti;
        var BP_sql_arr = project.dataMaster.BP_sql_arr;
        for(ti in BP_sql_arr){
            var sql_blueprint = BP_sql_arr[ti];
            if(sql_blueprint.group != 'custom'){
                continue;
            }
            logManager.log("编译[" + sql_blueprint.name + ']');
            var bpCompileHelper = new SqlNode_CompileHelper(logManager, null);
            bpCompileHelper.clickLogBadgeItemHandler = this.clickSqlCompilerLogBadgeItemHandler;
            var compileRet = sql_blueprint.compile(bpCompileHelper);
            if(compileRet == false){
                this.stopCompile(false, "发生错误,项目编译已终止");
                return false;
            }
            this.setCache(sql_blueprint.code + '_sql', compileRet.sql);
            this.setCache(sql_blueprint.code + '_helper', bpCompileHelper);
        }

        this.projectName = this.projProfile ? this.projProfile.enName : project.getAttribute(AttrNames.RealName);
        this.flowName = this.projProfile ? this.projProfile.flowName : '';
        this.projectTitle = project.getAttribute(AttrNames.Title);

        var serverSide = new CP_ServerSide(this);
        this.serverSide = serverSide;

        var mobileContentCompiler = new MobileContentCompiler(this);
        this.mobileContentCompiler = mobileContentCompiler;

        // 编辑自订脚本
        var BP_script_arr = project.scriptMaster.blueprints_arr.filter(x=>{return x.group == EJsBluePrintFunGroup.Custom;});
        for(ti in BP_script_arr){
            var js_blueprint = BP_script_arr[ti];
            logManager.log("编译脚本[" + js_blueprint.name + ']');

            var jsCompileHelper = new JSNode_CompileHelper(logManager, null,  js_blueprint.type == FunType_Client ? mobileContentCompiler.clientSide.scope : serverSide.scope);
            jsCompileHelper.clickLogBadgeItemHandler = this.clickJSCompilerLogBadgeItemHandler;
            jsCompileHelper.serverSide = serverSide;
            jsCompileHelper.clientSide = mobileContentCompiler.clientSide;
            jsCompileHelper.sqlBPCacheManager = this;
            var jscompileRet = js_blueprint.compile(jsCompileHelper);
            if(jscompileRet == false){
                this.stopCompile(false, "发生错误,项目编译已终止");
                return false;
            }

            this.setCache(js_blueprint.code + '_fun', jscompileRet);
        }

        mobileContentCompiler.compile();

        mobileContentCompiler.compileEnd();
        this.serverSide.compileEnd();

        console.log(mobileContentCompiler.getString());
        console.log(this.serverSide.getString());

        this.stopCompile(true);
    }
}

class ContentCompiler extends EventEmitter{
    constructor(projectCompiler){
        super();
        EnhanceEventEmiter(this);
        this.project = projectCompiler.project;
        this.projectCompiler = projectCompiler;
        this.serverSide = projectCompiler.serverSide;
        this.logManager = projectCompiler.logManager;
        //this.handlebars = new CP_HandleBarsItem(this);

        this.clientSide = new CP_ClientSide(projectCompiler);
    }

    compile(){
        return true;
    }

    compileEnd(){
        this.clientSide.compileEnd();
    }
}


class CP_HandleBarsItem{
    constructor(belongCompiler){
        this.belongCompiler = belongCompiler;
        this.headItemKeys = {};
        this.scriptItemKeys = {};
        this.headItems_arr = [];
        this.scriptItems_arr = [];
    }

    pushHeadItem(key, target){
        if(target == null){
            console.warn('pushHeadItem target is null');
            return false;
        }
        if(IsEmptyString(key)){
            console.warn('pushHeadItem key is null');
            return false;
        }
        if(this.headItemKeys[key] != null){
            this.belongCompiler.warn('Head item:' + key + ' 重复声明');
            return false;
        }
        this.headItems_arr.push(target);
        this.headItemKeys[key] = key;
        return true;
    }

    pushScriptPath(key, path){
        if(IsEmptyString(path)){
            console.warn('pushScriptPath path is null');
            return false;
        }
        if(IsEmptyString(key)){
            console.warn('pushScriptPath key is null');
            return false;
        }
        if(this.scriptItemKeys[key] != null){
            this.belongCompiler.warn('script path:' + key + ' 重复声明');
            return false;
        }
        this.scriptItems_arr.push(path);
        this.scriptItemKeys[key] = key;
        return true;
    }

    compileEnd(){
        var fileMaker = new FormatFileMaker();
        var targetBlock = fileMaker.defaultRegion.defaultBlock;
        if(this.headItems_arr.length > 0){
            targetBlock.pushLine("{{#section 'head'}}", 1);
            this.headItems_arr.forEach(item=>{
                targetBlock.pushLine(item);
            });
            targetBlock.subNextIndent();
            targetBlock.pushLine("{{/section}}");
        }
        if(this.scriptItems_arr.length > 0){
            targetBlock.pushLine("{{#section 'script'}}", 1);
            this.scriptItems_arr.forEach(path=>{
                targetBlock.pushLine('<script src="' + path + '"></script>');
            });
            targetBlock.subNextIndent();
            targetBlock.pushLine("{{/section}}");
        }
        this.fileMaker = fileMaker;
    }

    getString(){
        return this.fileMaker.getString();
    }
}