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

    filterChildKernels(targetType){
        var rlt = [];
        if(targetType == M_AllKernel_Type){
            targetType = null;
        }
        var needFilt = targetType != null;
        if(!needFilt || this.type == targetType){
            rlt.push(this);
        }
        if(rlt.editor && (!needFilt || rlt.editor.type == targetType)){
            rlt.push(rlt.editor);
        }
        var nowKernel = this;
        var parent = nowKernel.parent;
        while(parent != null){
            if(!needFilt|| parent.type == targetType)
            {
                rlt.push(parent);
            }
            parent.children.forEach(child=>{
                if(child != nowKernel){
                    if(!needFilt || child.type == targetType)
                    {
                        rlt.push(child);
                    }
                    if(child.editor && (!needFilt || child.editor.type == targetType)){
                        rlt.push(child.editor);
                    }
                }
            });
            nowKernel = parent;
            parent = parent.parent;
        }
        return rlt;
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

    swapChild(srcIndex, dstIndex) {
        if(srcIndex == dstIndex){
            return false;
        }
        if(srcIndex >= 0 && srcIndex < this.children.length){
            if(dstIndex >= 0 && dstIndex < this.children.length){
                var temp = this.children[srcIndex];
                this.children[srcIndex] = this.children[dstIndex];
                this.children[dstIndex] = temp;
                this.attrChanged(AttrNames.Chidlren);
                return true;
            }
        }
        return false;
    }

    getJson(jsonProf) {
        var rlt = super.getJson(jsonProf);
        rlt.children = [];
        this.children.forEach(child => {
            rlt.children.push(child.getJson(jsonProf));
        });
        return rlt;
    }
}