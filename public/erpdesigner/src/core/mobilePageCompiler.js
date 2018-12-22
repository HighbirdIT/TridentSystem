class ProjectCompiler extends EventEmiter{
    constructor(project){
        super();
        EnhanceEventEmiter(this);
        this.project = project;
    }

    compile(){
        this.project.logmanager.clear();
        this.project.logmanager.log('开始编译');
    }
}

class MobileProjectCompiler{
    constructor(project){
        super(project);
    }

    compile(project){
        
    }
}