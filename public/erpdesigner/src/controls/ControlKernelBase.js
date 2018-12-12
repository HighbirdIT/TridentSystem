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

    getLayoutConfig(){
        var rlt = new ControlLayoutConfig();
        var apdAttrList = this.getAttrArrayList(AttrNames.LayoutNames.APDClass);
        var self = this;
        apdAttrList.forEach(attrArrayItem=>{
            var val = this.getAttribute(attrArrayItem.name);
            rlt.addClass(val);
        });

        var styleAttrList = this.getAttrArrayList(AttrNames.LayoutNames.StyleAttr);
        styleAttrList.forEach(attrArrayItem=>{
            var val = this.getAttribute(attrArrayItem.name);
            if(val != null && !IsEmptyString(val.name) && !IsEmptyString(val.value)){
                var styleName = val.name;
                var styleValue = val.value;
                switch(styleName){
                    case AttrNames.StyleAttrNames.Width:
                    case AttrNames.StyleAttrNames.Height:
                    {
                        styleValue = isNaN(styleValue) ? styleValue : styleValue + 'px';
                        break;
                    }
                    case AttrNames.StyleAttrNames.FlexGrow:
                    {
                        rlt.addSwitchClass(AttrNames.StyleAttrNames.FlexGrow, styleValue ? 1 : 0);
                        styleName = null;
                        break;
                    }
                    case AttrNames.StyleAttrNames.FlexShrink:
                    {
                        rlt.addSwitchClass(AttrNames.StyleAttrNames.FlexShrink, styleValue ? 1 : 0);
                        styleName = null;
                        break;
                    }
                }

                if(styleName != null){
                    rlt.addStyle(styleName,styleValue);
                }
            }
        });
        return rlt;
    }
}

const g_switchClassNameReg = /-\d+$/;

class ControlLayoutConfig{
    constructor(){
        this.class = {};
        this.style = {};
        this.switch = {};
    }

    addSwitchClass(switchName, switchVal, existsProcess){
        if(this.switch[switchName] != null){
            switch(existsProcess){
                case 'set':
                this.class[this.switch[switchName].name] = 0;
                break;
                default:
                return false;
            }
        }
        var className = switchName + '-' + switchVal;
        this.switch[switchName] = {name:className, val:switchVal};
        this.class[className] = 1;
        return true;
    }

    addClass(className, existsProcess){
        if(IsEmptyString(className)){
            return false;
        }
        var t_arr = g_switchClassNameReg.exec(className);
        if(t_arr != null){
            var switchName = className.substr(0, className.length - t_arr[0].length);
            var switchVal = t_arr[0].substr(1);
            return this.addSwitchClass(switchName, switchVal, existsProcess);
        }

        this.class[className] = 1;
        return true;
    }

    addStyle(name,val){
        if(IsEmptyString(name) || val == null){
            return false;
        }
        this.style[name] = val;
        return true;
    }

    getClassName(){
        var rlt = '';
        for(var si in this.class){
            if(this.class[si] == 0)
            continue;
            rlt += si + ' ';
        }
        return rlt;
    }
}