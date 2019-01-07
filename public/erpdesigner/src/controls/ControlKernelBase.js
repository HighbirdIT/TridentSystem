const M_ControlKernelBaseAttrsSetting = {
    layoutGrop: new CAttributeGroup('布局设置', [
        new CAttribute('Style', AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true),
        new CAttribute('Class', AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true),
    ]),
};

/*
new CAttribute('宽度',AttrNames.Width,ValueType.String,''),
            new CAttribute('高度',AttrNames.Height,ValueType.String,''),
            new CAttribute('FlexGrow',AttrNames.FlexGrow,ValueType.Boolean,true),
            new CAttribute('FlexShrink',AttrNames.FlexShrink,ValueType.Boolean,true),
*/

const LayoutAttrNames_arr = M_ControlKernelBaseAttrsSetting.layoutGrop.attrs_arr.map(e => { return e.name; });

class ControlKernelBase extends IAttributeable {
    constructor(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        super(initData, null, description);
        this.lisenedDSSyned = this.lisenedDSSyned.bind(this);
        this.project = parentKernel.project;
        this.type = type;
        if (attrbuteGroups == null) {
            attrbuteGroups = [];
        }
        if (attrbuteGroups[0] != M_ControlKernelBaseAttrsSetting.layoutGrop) {
            attrbuteGroups.unshift(M_ControlKernelBaseAttrsSetting.layoutGrop);
        }
        this.attrbuteGroups = attrbuteGroups;
        this.clickHandler = this.clickHandler.bind(this);
        this.listendDS_map = {};

        if (kernelJson != null) {
            // restore attr from json
            if (kernelJson.attr != null) {
                Object.assign(this, kernelJson.attr);

                this.attrbuteGroups.forEach(group => {
                    group.attrs_arr.forEach(attr => {
                        if (!attr.editable)
                            return;
                        var attrItemArray = null;
                        if(attr.isArray){
                            attrItemArray = this.getAttrArrayList(attr.name).map(e=>{return e.name;});
                        }
                        else{
                            attrItemArray = [attr.name];
                        }
                        attrItemArray.forEach(attrName=>{
                            var val = this[attrName];
                            if(val == null || val == attr.defaultVal){
                                return;
                            }
                            switch(attr.valueType){
                                case ValueType.DataSource:
                                if(!IsEmptyString(val)){
                                    var theDS = parentKernel.project.dataMaster.getDataSourceByCode(val);
                                    if(theDS != null){
                                        this[attrName] = theDS;
                                        this.listenDS(theDS, attr.name);
                                    }
                                    else{
                                        parentKernel.project.logManager.warn(val + '不是合法的数据源代码');
                                    }
                                }
                                break;
                            }
                        });
                    });
                });
            }
        }

        this.project.registerControl(this);
        if (createHelper) {
            createHelper.saveJsonMap(kernelJson, this);
        }
        if (parentKernel.project != parentKernel) {
            parentKernel.appandChild(this);
        }
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray){
        var attrItem = this.findAttributeByName(attrName);
        if(attrItem.valueType == ValueType.DataSource){
            this.unlistenDS(oldValue, attrName);
            this.listenDS(newValue, attrName);
        }
    }

    delete(){
        for(var dsCode in this.listendDS_map){
            var t_arr = this.listendDS_map[dsCode];
            if(t_arr == null){
                continue;
            }
            var theDS = parentKernel.project.dataMaster.getDataSourceByCode(val);
            if(theDS){
                this.unlistenDS(theDS);
            }
        }
        if(this.children){
            for(var ci in this.children){
                this.children[ci].delete();
            }
        }
        this.project.unRegisterControl(this);
        this.parent.removeChild(this);
    }

    listenDS(target, attrName){
        if(target == null){
            return;
        }
        var t_arr = this.listendDS_map[target.code];
        if(t_arr == null){
            this.listendDS_map[target.code] = [attrName];
            target.on('syned', this.lisenedDSSyned);
        }
        else{
            var index = t_arr.indexOf(attrName);
            if(index == -1){
                t_arr.push(attrName);
            }
        }
    }

    unlistenDS(target, attrName){
        if(target == null){
            return;
        }
        var t_arr = this.listendDS_map[target.code];
        if(t_arr != null){
            var index = t_arr.indexOf(attrName);
            if(index != -1){
                t_arr.splice(index, 1);
            }
            if(t_arr.length == 0){
                this.listendDS_map[target.code] = null;
                target.off('syned', this.lisenedDSSyned);
            }
        }
    }

    lisenedDSSyned(theDS){
        console.log('lisenedDSSyned');
        console.log(theDS);
        var t_arr = this.listendDS_map[theDS.code];
        if(t_arr == null || t_arr.length == 0){
            console.warn('lisenedDSSyned but not in listendDS_map');
            return;
        }
        if(t_arr.length == 1){
            this.attrChanged(t_arr[0]);
        }
        else{
            this.attrChanged(t_arr);
        }
    }

    getReadableName(){
        return this.id + (IsEmptyString(this[AttrNames.Name]) ? '' : '(' + this[AttrNames.Name] + ')');
    }

    getReactClassName(isRedux) {
        return (isRedux ? 'VisibleC' : 'C') + this.id;
    }


    renderSelf() {
        return null;
    }

    fireForceRender() {
        this.emit(EFORCERENDER);
    }

    setSelected(flag) {
        if (this.currentControl) {
            this.currentControl.setSelected(flag);
        }
        this.attrChanged(flag ? 'selected' : 'unselected');
    }

    clickHandler(ev) {
        //return;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if (ctlid == this.id && this.project.designer) {
            //this.project.designer.attributePanel.setTarget(this);
            this.project.designer.selectKernel(this);
        }
        ev.preventDefault();
    }

    getLayoutConfig() {
        var rlt = new ControlLayoutConfig();
        var apdAttrList = this.getAttrArrayList(AttrNames.LayoutNames.APDClass);
        var self = this;
        apdAttrList.forEach(attrArrayItem => {
            var val = this.getAttribute(attrArrayItem.name);
            rlt.addClass(val);
        });

        var styleAttrList = this.getAttrArrayList(AttrNames.LayoutNames.StyleAttr);
        styleAttrList.forEach(attrArrayItem => {
            var val = this.getAttribute(attrArrayItem.name);
            if (val != null && !IsEmptyString(val.name) && !IsEmptyString(val.value)) {
                var styleName = val.name;
                var styleValue = val.value;
                switch (styleName) {
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

                if (styleName != null) {
                    rlt.addStyle(styleName, styleValue);
                }
            }
        });
        return rlt;
    }

    getJson() {
        var rlt = {
            attr: super.getJson(),
            type: this.type,
            id: this.id,
        };
        return rlt;
    }
}

const g_switchClassNameReg = /-\d+$/;

class ControlLayoutConfig {
    constructor() {
        this.class = {};
        this.style = {};
        this.switch = {};
    }

    addSwitchClass(switchName, switchVal, existsProcess) {
        if (this.switch[switchName] != null) {
            switch (existsProcess) {
                case 'set':
                    this.class[this.switch[switchName].name] = 0;
                    break;
                default:
                    return false;
            }
        }
        var className = switchName + '-' + switchVal;
        this.switch[switchName] = { name: className, val: switchVal };
        this.class[className] = 1;
        return true;
    }

    addClass(className, existsProcess) {
        if (IsEmptyString(className)) {
            return false;
        }
        var t_arr = g_switchClassNameReg.exec(className);
        if (t_arr != null) {
            var switchName = className.substr(0, className.length - t_arr[0].length);
            var switchVal = t_arr[0].substr(1);
            return this.addSwitchClass(switchName, switchVal, existsProcess);
        }

        this.class[className] = 1;
        return true;
    }

    addStyle(name, val) {
        if (IsEmptyString(name) || val == null) {
            return false;
        }
        this.style[name] = val;
        return true;
    }

    getClassName() {
        var rlt = '';
        for (var si in this.class) {
            if (this.class[si] == 0)
                continue;
            rlt += si + ' ';
        }
        return rlt;
    }
}

class CtlKernelCreationHelper extends EventEmitter {
    constructor() {
        super();
        EnhanceEventEmiter(this);
        this.orginID_map = {};
        this.newID_map = {};
        this.idTracer = {};
    }

    saveJsonMap(jsonData, newKernel) {
        if (jsonData && jsonData.id) {
            if (this.getObjFromID(jsonData.id) != null) {
                console.warn(jsonData.id + '被重复saveJsonMap');
            }
            if (jsonData.id != newKernel.id) {
                if (this.getObjFromID(newKernel.id) != null) {
                    console.warn(jsonData.id + '被重复saveJsonMap');
                }
                this.idTracer[jsonData.id] = this.idTracer[newKernel.id]
            }
            this.orginID_map[jsonData.id] = newKernel;
        }

        this.newID_map[newKernel.id] = newKernel;
    }

    getObjFromID(id) {
        var rlt = this.orginID_map[id];
        if (rlt == null) {
            rlt = this.newID_map[id];
        }
        return rlt;
    }
}