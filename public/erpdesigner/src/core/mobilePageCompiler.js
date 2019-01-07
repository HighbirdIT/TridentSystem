class ProjectCompiler extends EventEmiter{
    constructor(project){
        super();
        EnhanceEventEmiter(this);
        this.project = project;
    }

    compile(){
        this.project.logManager.clear();
        this.project.logManager.log('开始编译');
    }
}

class MobileProjectCompiler extends ProjectCompiler{
    constructor(project){
        super(project);
    }

    compile(project){
        
    }
}