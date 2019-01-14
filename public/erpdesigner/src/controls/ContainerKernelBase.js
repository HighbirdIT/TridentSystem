class ContainerKernelBase extends ControlKernelBase {
    constructor(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        super(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson);
        this.children = [];

        if (kernelJson != null) {
            if (kernelJson.children != null) {
                kernelJson.children.forEach(childJson => {
                    var ctlConfig = DesignerConfig.findConfigByType(childJson.type);
                    if (ctlConfig == null) {
                        console.warn('type:' + childJson.type + '未找到配置数据');
                        return;
                    }
                    var newCtl = new ctlConfig.kernelClass(initData, this, createHelper, childJson);
                });
            }
        }
    }

    getChildIndex(childKernel) {
        return this.children.indexOf(childKernel);
    }

    appandChild(childKernel, index) {
        var temp = null;
        if (childKernel.parent == this) {
            if (index >= this.children.length) {
                index = this.children.length - 1;
            }
            if (index >= 0 && index <= this.children.length) {
                var nowIndex = this.children.indexOf(childKernel);
                if (nowIndex != index) {
                    if (nowIndex != -1) {
                        var step = Math.sign(index - nowIndex);
                        while (nowIndex != index) {
                            this.children[nowIndex] = this.children[nowIndex + step];
                            nowIndex += step;
                        }
                        this.children[index] = childKernel;
                    }
                    else {
                        if (index == this.children.length) {
                            this.children.push(childKernel);
                        }
                        else if (index == 0) {
                            this.children.unshift(childKernel);
                        }
                        else {
                            var moveingIndex = this.children.length + 1;
                            while (moveingIndex != index) {
                                this.children[moveingIndex] = this.children[moveingIndex - 1];
                                --moveingIndex;
                            }
                            this.children[index] = childKernel;
                        }
                    }

                    this.attrChanged(AttrNames.Chidlren);
                    //console.log('swap:' + nowIndex + '->' + index);
                }
            }
            return;
        }
        if (childKernel.parent) {
            childKernel.parent.removeChild(childKernel);
        }
        if (index < 0)
            index = 0;
        if (isNaN(index))
            index = this.children.length;
        if (index > this.children.length)
            index = this.children.length;

        //console.log('appandIndex:' + index);
        if (index == 0) {
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
        childKernel.parent = null;
    }

    getChildIndex(childKernel) {
        return this.children.indexOf(childKernel);
    }

    getJson() {
        var rlt = super.getJson();
        rlt.children = [];
        this.children.forEach(child => {
            rlt.children.push(child.getJson());
        });
        return rlt;
    }
}