const M_ControlKernelBaseAttrsSetting={
    layoutGrop:new CAttributeGroup('布局设置',[
        new CAttribute('Style', AttrNames.LayoutNames.StyleAttr,ValueType.StyleValues,null, true, true),
        new CAttribute('Class', AttrNames.LayoutNames.APDClass,ValueType.String, '', true, true),
            ]),
};

/*
new CAttribute('宽度',AttrNames.Width,ValueType.String,''),
            new CAttribute('高度',AttrNames.Height,ValueType.String,''),
            new CAttribute('FlexGrow',AttrNames.FlexGrow,ValueType.Boolean,true),
            new CAttribute('FlexShrink',AttrNames.FlexShrink,ValueType.Boolean,true),
*/

const LayoutAttrNames_arr = M_ControlKernelBaseAttrsSetting.layoutGrop.attrs_arr.map(e=>{return e.name;});

class ControlKernelBase extends IAttributeable{
    constructor(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson ){
        super(initData, null, description);
        this.project = parentKernel.project;
        this.type = type;
        if(attrbuteGroups == null){
            attrbuteGroups = [];
        }
        if(attrbuteGroups[0] != M_ControlKernelBaseAttrsSetting.layoutGrop){
            attrbuteGroups.unshift(M_ControlKernelBaseAttrsSetting.layoutGrop);
        }
        this.attrbuteGroups = attrbuteGroups;

        this.clickHandler = this.clickHandler.bind(this);

        this.project.registerControl(this);
        if(parentKernel.project != parentKernel){
            parentKernel.appandChild(this);
        }
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
        if(ctlid == this.id && this.project.designer){
            //this.project.designer.attributePanel.setTarget(this);
            this.project.designer.selectKernel(this);
        }
        ev.preventDefault();
    }

    getRootDivClass(){
        var apdAttrList = this.getAttrArrayList(AttrNames.LayoutNames.APDClass);
        var temmap = {};
        var self = this;
        apdAttrList.forEach(attrArrayItem=>{
            var val = this.getAttribute(attrArrayItem.name);
            if(!IsEmptyString(val) && temmap[val] == null){
                temmap[val] = 1;
            }
        });
        var rlt = '';
        for(var si in temmap){
            rlt += ' ' + si;
        }
        return rlt;
    }
}