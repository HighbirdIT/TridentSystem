class ControlKernelBase extends IAttributeable{
    constructor(initData,project,description){
        super(initData, null, description);
        this.project = project;
        //autoBind(this);

        this.clickHandler = this.clickHandler.bind(this);
    }

    renderSelf(){
        return null;
    }

    fireForceRender(){
        this.emit(EFORCERENDER);
    }

    setSelected(flag){
        if(this.currentControl){
            this.currentControl.setSelected(flag);
        }
        this.attrChanged(flag ? 'selected' : 'unselected');
    }

    clickHandler(ev){
        //return;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if(ctlid == this.name && this.project.designer){
            //this.project.designer.attributePanel.setTarget(this);
            this.project.designer.selectKernel(this);
        }
        ev.preventDefault();
    }
}