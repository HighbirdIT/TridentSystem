class ProjectCompiler extends EventEmitter{
    constructor(project){
        super();
        EnhanceEventEmiter(this);
        this.project = project;

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

    compile(){
        var project = this.project;
        var logManager = project.logmanager;
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
                logManager.log("发生错误,项目编译已终止");
                return false;
            }
        }
        logManager.log('项目编译完成,共' + logManager.getCount(LogTag_Warning) + '条警告,' + logManager.getCount(LogTag_Error) + '条错误,');
    }
}

class MobileProjectCompiler{
    constructor(project){
        
    }

    compile(project){
        
    }
}