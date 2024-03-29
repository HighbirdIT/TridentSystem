const M_ControlKernelBaseAttrsSetting = {
    layoutGrop: new CAttributeGroup('布局设置', [
        new CAttribute('Style', AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true),
        new CAttribute('Class', AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true),
    ]),
    baseGroup: new CAttributeGroup('基本设置',[
        new CAttribute('name',AttrNames.Name,ValueType.String),
    ]),
};

var M_ControlKernel_api = new ControlAPIClass(M_AllKernel_Type);
M_ControlKernel_api.pushApi(new ApiItem_prop(genIsdisplayAttribute(), 'visible'));
M_ControlKernel_api.pushApi(new ApiItem_propsetter('visible'));

M_ControlKernel_api.pushApi(new ApiItem_prop(genDynamicStyleAttribute(), 'style'));
M_ControlKernel_api.pushApi(new ApiItem_propsetter('style'));
M_ControlKernel_api.pushApi(new ApiItem_prop(genDynamicClassAttribute(), 'class'));
M_ControlKernel_api.pushApi(new ApiItem_propsetter('class'));
g_controlApi_arr.push(M_ControlKernel_api);
/*
new CAttribute('宽度',AttrNames.Width,ValueType.String,''),
            new CAttribute('高度',AttrNames.Height,ValueType.String,''),
            new CAttribute('FlexGrow',AttrNames.FlexGrow,ValueType.Boolean,true),
            new CAttribute('FlexShrink',AttrNames.FlexShrink,ValueType.Boolean,true),
*/

function findAttrInGroupArrayByName(attName, groupArr){
    var rlt = null;
    for(var gi in groupArr){
        rlt = groupArr[gi].findAttrByName(attName);
        if(rlt != null){
            return rlt;
        }
    }
    return null;
}


function GenControlKernelAttrsSetting(cusGroups_arr, includeDefault, includeLayout){
    if(includeDefault == null){
        includeDefault = true;
    }
    if(includeLayout == null){
        includeLayout = true;
    }
    var rlt = includeLayout ? [M_ControlKernelBaseAttrsSetting.layoutGrop] : [];
    
    for(var si in cusGroups_arr){
        var cusGroup = cusGroups_arr[si];
        if(includeDefault != false && cusGroup.label == M_ControlKernelBaseAttrsSetting.baseGroup.label){
            cusGroup.setAttrs(M_ControlKernelBaseAttrsSetting.baseGroup.attrs_arr.concat(cusGroup.attrs_arr));
        }
        rlt.push(cusGroup);
    }
    return rlt;
}


function getDSAttrCanuseColumns(dsAttrName, csAttrName){
    var rlt = [];
    if(dsAttrName != null){
        var useDS = this.getAttribute(dsAttrName);
        if(useDS == null || !useDS.loaded){
            return [];
        }
        rlt = useDS.columns.map(col=>{
            return col.name;
        });
    }
    if(csAttrName != null){
        var cusDS_bp = this.getAttribute(csAttrName);
        if(cusDS_bp != null){
            cusDS_bp.columns.forEach(colItem=>{
                if(rlt.indexOf(colItem.name) == -1){
                    rlt.push(colItem.name);
                }
            });
        }
    }
    return rlt;
}

const LayoutAttrNames_arr = M_ControlKernelBaseAttrsSetting.layoutGrop.attrs_arr.map(e => { return e.name; });

class ControlKernelBase extends IAttributeable {
    constructor(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        super(initData, null, description);
        this.lisenedDSSyned = this.lisenedDSSyned.bind(this);
        if(parentKernel == null && type != UserControlKernel_Type){
            console.error('ControlKernelBase 的 parentKernel不能为空');
        }
        if(this.project == null){
            this.project = parentKernel ? parentKernel.project : null;
        }
        this.type = type;
        if (attrbuteGroups == null) {
            attrbuteGroups = [];
        }
        this.attrbuteGroups = attrbuteGroups;
        this.clickHandler = this.clickHandler.bind(this);
        this.getAccessableKernels = this.getAccessableKernels.bind(this);
        this.listendDS_map = {};

        this.freshByKernelJson(this.project, kernelJson);

        if(this.project){
            this.project.registerControl(this);
        }
        if (createHelper) {
            createHelper.saveJsonMap(kernelJson, this);
        }
        if (parentKernel && parentKernel.project != parentKernel) {
            parentKernel.appandChild(this, this.hintIndexInParent);
            this.hintIndexInParent = null;
        }
        this.readableName = this.getReadableName();
    }

    freshByKernelJson(project, kernelJson){
        if (kernelJson != null) {
            // restore attr from json
            this.id = kernelJson.id;
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
                                    var theDS = project.dataMaster.getDataSourceByCode(val);
                                    if(theDS != null){
                                        this[attrName] = theDS;
                                        this.listenDS(theDS, attr.name);
                                    }
                                    else{
                                        project.logManager.warn(val + '不是合法的数据源代码');
                                    }
                                }
                                break;
                            }
                        });
                    });
                });
            }
        }
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray){
        var attrItem = this.findAttributeByName(attrName);
        if(attrItem.valueType == ValueType.DataSource){
            this.unlistenDS(oldValue, attrName);
            if(typeof newValue === 'string'){
                newValue = this.project.dataMaster.getDataSourceByCode(newValue);
                if(newValue != null && newValue.code == 0){
                    newValue = null;
                }
                this[realAtrrName] = newValue;
            }
            if(newValue){
                this.listenDS(newValue, attrName);
            }
        }
        var bpname = this.id + '_' + realAtrrName;
        var jsbp = this.project.scriptMaster.getBPByName(bpname);
        if (jsbp != null) {
            //this.project.scriptMaster.deleteBP(jsbp);
        }

        if(attrItem.name == AttrNames.TextField || attrItem.name == AttrNames.Name){
            this.readableName = this.getReadableName();
        }
    }

    __removeFromProject(){
        if(this.children){
            var myChildren = this.children.concat();
            for(var ci in myChildren){
                myChildren[ci].__removeFromProject();
            }
        }
        this.project.unRegisterControl(this, false);
        this.parent = null;
        this.children = [];
    }

    delete(forceDelete){
        if(!forceDelete && this.isfixed){
            return;
        }
        // delete all customdatasource
        var cusdsAttr_arr = this.filterAttributesByValType(ValueType.CustomDataSource);
        cusdsAttr_arr.forEach(cusdsAttr=>{
            var cusds = this.getAttribute(cusdsAttr.name);
            if(cusds != null){
                this.project.dataMaster.deleteSqlBP(cusds);
            }
        });

        for(var dsCode in this.listendDS_map){
            var t_arr = this.listendDS_map[dsCode];
            if(t_arr == null){
                continue;
            }
            var theDS = this.project.dataMaster.getDataSourceByCode(dsCode);
            if(theDS){
                this.unlistenDS(theDS);
            }
        }
        if(this.children){
            for(var ci in this.children){
                this.children[ci].delete(true);
            }
        }
        this.project.unRegisterControl(this);
        if(this.parent)
        {
            this.parent.removeChild(this);
        }
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
        var rlt = null;
        if(!IsEmptyString(this[AttrNames.Name])){
            rlt = this[AttrNames.Name];
        }
        else{
            var textField = this[AttrNames.TextField];
            if(textField != null){
                rlt = typeof textField === 'string' ? textField : '{脚本}';
            }
            else{
                rlt = '';
            }
        }
        return rlt + '[' + this.id + ']';
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
        if(ev.preventDefault){
            ev.preventDefault();
        }
    }

    getLayoutConfig(classAttrName, styleAttrName) {
        var rlt = new ControlLayoutConfig();
        var apdAttrList = this.getAttrArrayList(classAttrName ? classAttrName : AttrNames.LayoutNames.APDClass);
        var self = this;
        apdAttrList.forEach(attrArrayItem => {
            var val = this.getAttribute(attrArrayItem.name);
            rlt.addClass(val);
        });

        var styleAttrList = this.getAttrArrayList(styleAttrName ? styleAttrName : AttrNames.LayoutNames.StyleAttr);
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

    getJson(jsonProf) {
        var rlt = {
            attr: super.getJson(jsonProf),
            type: this.type,
            id: this.id,
        };
        if(jsonProf){
            jsonProf.useControl(this);
        }
        return rlt;
    }

    
    getReactParentKernel(justFirst){
        var rlt = null;
        var tKernel = this.parent;
        var isArray = false;
        while(tKernel != null){
            if(tKernel.hadReactClass) {
                if(justFirst){
                    return tKernel;
                }
                if(rlt == null){
                    rlt = [tKernel];
                }
                else{
                    rlt.push(tKernel);
                }
            }
            tKernel = tKernel.parent;
        }
        return rlt;
    }

    getUnDivParentKernel(){
        var tKernel = this.parent;
        while(tKernel != null){
            if(tKernel.type != M_ContainerKernel_Type) {
                return tKernel;
            }
            tKernel = tKernel.parent;
        }
        return null;
    }

    searchSameReactParentKernel(otherKernel){
        if(this.type == M_PageKernel_Type){
            return this;
        }
        else if(otherKernel.type == M_PageKernel_Type){
            return otherKernel;
        }
        var selfParents_arr = this.getReactParentKernel();
        var otherParents_arr = otherKernel.getReactParentKernel();
        for(var i=0; i < selfParents_arr.length; ++i){
            if(otherParents_arr.indexOf(selfParents_arr[i]) != -1){
                return selfParents_arr[i];
            }
        }
        return null;
    }

    hadAncestor(ancestorKernel){
        if(ancestorKernel == null){
            return false;
        }
        var tparent = this.parent;
        while(tparent){
            if(tparent == ancestorKernel){
                return true;
            }
            tparent = tparent.parent;
        }
        return false;
    }

    searchParentKernel(targetType, justFirst){
        var rlt = null;
        var tKernel = this.parent;
        var isArray = false;
        if(targetType == null){
            targetType = '*';
        }
        else if(Array.isArray(targetType)){
            isArray = true;
        }
        while(tKernel != null){
            if(targetType == '*' || (!isArray && tKernel.type == targetType) || (isArray && targetType.indexOf(tKernel.type)!=-1)) {
                if(justFirst){
                    return tKernel;
                }
                if(rlt == null){
                    rlt = [tKernel];
                }
                else{
                    rlt.push(tKernel);
                }
            }
            tKernel = tKernel.parent;
        }
        return rlt;
    }

    isComplicatedPath(){
        var tKernel = this.parent;
        while(tKernel != null){
            if(tKernel == UserControlKernel_Type || (tKernel == M_FormKernel_Type && !tKernel.isPageForm())){
                return true;
            }
            tKernel = tKernel.parent;
        }
        return false;
    }

    searchChildKernel(targetType, justFirst, deepSearch, ignoreTypes){
        var rlt = null;
        var isArray = false;
        if(targetType == null){
            targetType = '*';
        }
        else if(Array.isArray(targetType)){
            isArray = true;
        }
        if(this.children && this.children.length > 0){
            for(var ci in this.children){
                var child = this.children[ci];
                if(ignoreTypes != null && ignoreTypes.indexOf(child.type) != -1){
                    continue;
                }
                if(targetType == '*' || (!isArray && child.type == targetType) || (isArray && targetType.indexOf(child.type)!=-1)) {
                    if(justFirst){
                        return child;
                    }
                    if(rlt == null){
                        rlt = [];
                    }
                    rlt.push(child);
                }
                if(deepSearch)
                {
                    var childRet = child.searchChildKernel(targetType, justFirst, deepSearch);
                    if(childRet != null){
                        if(justFirst){
                            return childRet;
                        }
                        else{
                            if(rlt == null){
                                rlt = [];
                            }
                            rlt = rlt.concat(childRet);
                        }
                    }
                }
            }
        }
        return rlt;
    }

    getAccessableKernels(targetType){
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
        var meetParents_map = [];
        var nowKernel = this;
        var parent = nowKernel.parent;
        var aidRlt_arr;
        if(nowKernel.type == M_FormKernel_Type){
            if(nowKernel.isPageForm()){
                parent = nowKernel; // page型的form可以访问到孩子控件
            }
            else if(nowKernel.isGridForm()){
                // grid型的form可以访问到bottom的控件
                meetParents_map[nowKernel.gridFormBottomDiv.id] = 1;
                aidRlt_arr = [];
                nowKernel.gridFormBottomDiv.aidAccessableKernels(targetType, aidRlt_arr);
                if(aidRlt_arr && aidRlt_arr.length > 0){
                    aidRlt_arr.forEach(x=>{
                        if(rlt.indexOf(x) == -1){
                            rlt.push(x);
                        }
                    });
                }
            }
        }
        if(nowKernel.type == Accordion_Type){
            parent = nowKernel; // 折叠控件可以访问到孩子控件
        }
        if(parent == null){
            if(this.type == M_PageKernel_Type || this.type == UserControlKernel_Type){
                parent = this;
                rlt.pop();
            }
        }
        while(parent != null){
            if(meetParents_map[parent.id]){
                return;
            }
            meetParents_map[parent.id] = true;
            if(!needFilt|| parent.type == targetType)
            {
                if(rlt.indexOf(parent) == -1){
                    rlt.push(parent);
                }
            }
            parent.children.forEach(child=>{
                if(child != nowKernel){
                    if(!needFilt || child.type == targetType)
                    {
                        if(rlt.indexOf(child) == -1){
                            rlt.push(child);
                        }
                    }
                    if(child.editor){
                        if(!needFilt || child.editor.type == targetType){
                            if(rlt.indexOf(child.editor) == -1){
                                rlt.push(child.editor);
                            }
                        }
                        if(child.editor.type == M_ContainerKernel_Type || child.editor.type == PopperButtonKernel_Type){
                            // 穿透div
                            if(meetParents_map[child.editor.id] == null){
                                meetParents_map[child.editor.id] = 1;
                                aidRlt_arr = [];
                                child.editor.aidAccessableKernels(targetType, aidRlt_arr, true);
                            }
                        }
                    }
                    if(child.type == M_ContainerKernel_Type || child.type == Accordion_Type || child.type == M_FormKernel_Type || child.type == PopperButtonKernel_Type){
                        // 穿透div
                        if(meetParents_map[child.id] == null){
                            meetParents_map[child.id] = 1;
                            aidRlt_arr = [];
                            child.aidAccessableKernels(targetType, aidRlt_arr, true);
                        }
                    }

                    if(aidRlt_arr && aidRlt_arr.length > 0){
                        aidRlt_arr.forEach(x=>{
                            if(rlt.indexOf(x) == -1){
                                rlt.push(x);
                            }
                        });
                    }
                }
            });
            nowKernel = parent;
            parent = parent.parent;
        }
        return rlt;
    }

    getParentStatePath(splitChar = '.', rowKeyVar_map = {}, ignoreRowKey = false, topestParant){
        var rlt = this.getStatePath('',splitChar,rowKeyVar_map,ignoreRowKey, topestParant);
        var index = rlt.lastIndexOf(splitChar);
        return index != -1 ? rlt.substring(0, index) : rlt;
    }

    getStatePath(stateName, splitChar = '.', rowKeyVar_map = {}, ignoreRowKey = false, topestParant){
        var rlt = this.id + (IsEmptyString(stateName) ? '' : splitChar + stateName);
        /*
        switch(this.type){
            case M_ContainerKernel_Type:
            console.warn('getStatePath M_ContainerKernel_Type');
            rlt = '';
            break;
        }
        */
        if(this.parent == null || this == topestParant){
            return rlt;
        }
        var nowKernel = this.parent;
        while(nowKernel != null && nowKernel != topestParant){
            switch(nowKernel.type){
                case M_PageKernel_Type:
                case Accordion_Type:
                case TabItem_Type:
                case TabControl_Type:
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                break;
                case M_FormKernel_Type:
                if(ignoreRowKey == true || !nowKernel.isKernelInRow(this)){
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                }
                else{
                    var rowKeyVar = rowKeyVar_map[nowKernel.id];
                    if(rowKeyVar == null && rowKeyVar_map.mapVarName){
                        rowKeyVar = rowKeyVar_map.mapVarName + '.' + nowKernel.id;
                    }
                    if(rowKeyVar == null){
                        console.error('getStatePath 遇到grid表单但是没有rowkey变量信息');
                    }
                    rlt = nowKernel.id + splitChar + "row_'+" + rowKeyVar + (rlt.length == 0 ? "+'" : ("+'" + splitChar + rlt));
                }
                break;
            }
            if(nowKernel && nowKernel != topestParant){
                nowKernel = nowKernel.parent;
            }
        }
        return rlt;
    }

    isAEditor(){
        return this.parent && this.parent.editor == this;
    }

    getParentLabledCtl(){
        return this.searchParentKernel(M_LabeledControlKernel_Type, true);
    }

    canAppand(){
        return true;
    }

    slideInParent(offset){
        if(this.parent){
            var nowPos = this.parent.children.indexOf(this);
            this.parent.swapChild(nowPos, nowPos +offset);
        }
    }

    getTextValueFieldValue(){
        var rlt = {};
        var textAttr = this.findAttributeByName(AttrNames.TextField);
        if(textAttr){
            rlt.text = this.getAttribute(AttrNames.TextField);
        }
        var valueAttr = this.findAttributeByName(AttrNames.ValueField);
        if(valueAttr){
            rlt.value = this.getAttribute(AttrNames.ValueField);
        }
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

    addClass(value, existsProcess) {
        var class_arr = value.trim().split(' ');
        var added = false;
        class_arr.forEach(className=>{
            if (IsEmptyString(className)) {
                return;
            }
            var t_arr = g_switchClassNameReg.exec(className);
            if (t_arr != null) {
                var switchName = className.substr(0, className.length - t_arr[0].length);
                var switchVal = t_arr[0].substr(1);
                if(this.addSwitchClass(switchName, switchVal, existsProcess)){
                    added = true;
                }
                return;
            }
            added = true;
            this.class[className] = 1;
        });
        return added;
    }

    removeClass(className){
        delete this.class[className];
        delete this.switch[className];
    }

    addStyle(name, val) {
        if (IsEmptyString(name) || val == null) {
            return false;
        }
        this.style[name] = val;
        return true;
    }

    removeStyle(name) {
        delete style[name];
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

    hadClass(name){
        return this.class[name] != null;
    }

    hadStyle(name){
        return this.class[name] != null;
    }

    hadSizeSetting(){
        return this.switch['flex-grow'] != null || this.switch['flex-shrink'] != null  || this.width != null  || this.style.height != null  || this.style.maxWidth != null  || this.style.maxHeight != null;
    }

    overrideBy(taget){
        this.style = Object.assign(this.style, taget.style);
        this.addClass(taget.getClassName(), 'set');
    }

    clone(){
        var rlt = new ControlLayoutConfig();
        rlt.class = Object.assign({}, this.class);
        rlt.style = Object.assign({}, this.style);
        rlt.switch = Object.assign({}, this.switch);
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