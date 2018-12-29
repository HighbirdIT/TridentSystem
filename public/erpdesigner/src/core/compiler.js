class ProjectCompiler extends EventEmitter{
    constructor(project, projProfile){
        super();
        EnhanceEventEmiter(this);
        this.project = project;
        this.projProfile = projProfile;

        autoBind(this);
    }

    clickSqlCompilerLogBadgeItemHandler(badgeItem){
        console.log('clickSqlCompilerLogBadgeItemHandler');
        if(badgeItem.data){
            var project = this.project;
            var designer = project.designer;
            designer.forcusSqlNode(badgeItem.data);
        }
    }

    stopCompile(isCompleted, stopInfo){
        this.isCompleted = isCompleted;
        var project = this.project;
        var logManager = project.logManager;
        if(!IsEmptyString(stopInfo)){
            logManager.log("发生错误,项目编译已终止");
        }
        logManager.log('项目编译完成,共' + logManager.getCount(LogTag_Warning) + '条警告,' + logManager.getCount(LogTag_Error) + '条错误,');
        this.fireEvent('completed');
    }

    compile(){
        var project = this.project;
        var logManager = project.logManager;
        logManager.clear();
        logManager.log('执行项目编译');
        
        // compile all sql_blueprint
        var ti;
        var BP_sql_arr = project.dataMaster.BP_sql_arr;
        for(ti in BP_sql_arr){
            var sql_blueprint = BP_sql_arr[ti];
            logManager.log("编译[" + sql_blueprint.name + ']');
            var bpCompileHelper = new SqlNode_CompileHelper(logManager, null);
            bpCompileHelper.clickLogBadgeItemHandler = this.clickSqlCompilerLogBadgeItemHandler;
            var compileRet = sql_blueprint.compile(bpCompileHelper);
            if(compileRet == false){
                this.stopCompile(false, "发生错误,项目编译已终止");
                return false;
            }
        }

        this.projectName = this.projProfile ? this.projProfile.enName : project.getAttribute(AttrNames.RealName);
        this.flowName = this.projProfile ? this.projProfile.flowName : '';
        this.projectTitle = project.getAttribute(AttrNames.Title);

        var serverSide = new CP_ServerSide(this);
        this.serverSide = serverSide;

        var mobileContentCompiler = new MobileContentCompiler(this);
        this.mobileContentCompiler = mobileContentCompiler;

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