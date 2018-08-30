class ContainerKernelBase extends ControlKernelBase{
    constructor(initData,project,description){
        super(initData, project, description);

        this.children = [];
    }

    appandChild(childKernel) {
        if (childKernel.parent == this)
            return;
        if (childKernel.parent) {
            childKernel.parent.removeChild(childKernel);
        }
        this.children.push(childKernel);
        childKernel.parent = this;
        this.attrChanged('children');
    }

    removeChild(childKernel) {
        var i = this.children.indexOf(childKernel);
        if (i != -1) {
            this.children.splice(i, 1);
            childKernel.parent = null;
            this.attrChanged('children');
        }
    }
}