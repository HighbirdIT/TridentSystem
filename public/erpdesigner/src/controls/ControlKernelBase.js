class ControlKernelBase extends IAttributeable{
    constructor(initData,project,description){
        super(initData, null, description);
        this.project = project;
    }

    renderSelf(){
        return null;
    }

    fireForceRender(){
        this.emit(EFORCERENDER);
    }
}