class ContainerKernelBase extends ControlKernelBase{
    constructor(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson){
        super(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson);
        this.children = [];
    }

    appandChild(childKernel, index) {
        if (childKernel.parent == this){
            if(index >= 0 && index < this.children.length){
                var nowIndex = this.children.indexOf(childKernel);
                if(nowIndex != index){
                    var temp = this.children[index];
                    this.children[index] = childKernel;
                    this.children[nowIndex] = temp;
                    this.attrChanged(AttrNames.Chidlren);
                    //console.log('swap:' + nowIndex + '->' + index);
                }
            }
            return;
        }
        if (childKernel.parent) {
            childKernel.parent.removeChild(childKernel);
        }
        if(index < 0)
            index = 0;
        if(isNaN(index))
            index = this.children.length;
        if(index > this.children.length)
            index = this.children.length;
        
        //console.log('appandIndex:' + index);
        if(index == 0){
            index = index;
        }
        this.children.splice(index, 0, childKernel)
        //this.children.push(childKernel);
        childKernel.parent = this;
        this.attrChanged(AttrNames.Chidlren);
    }

    removeChild(childKernel) {
        var i = this.children.indexOf(childKernel);
        if (i != -1) {
            this.children.splice(i, 1);
            childKernel.parent = null;
            this.attrChanged(AttrNames.Chidlren);
        }
    }

    getChildIndex(childKernel){
        return this.children.indexOf(childKernel);
    }
}