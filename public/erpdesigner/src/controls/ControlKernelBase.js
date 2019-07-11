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
    var useDS = this.getAttribute(dsAttrName);
    if(useDS == null){
        return [];
    }
    var rlt = useDS.columns.map(col=>{
        return col.name;
    });
    if(csAttrName != null){
        var cusDS_bp = this.getAttribute(csAttrName);
        if(cusDS_bp != null){
            var retColumnNode = cusDS_bp.finalSelectNode.columnNode;
            retColumnNode.inputScokets_arr.forEach(socket=>{
                var alias = socket.getExtra('alias');
                if(!IsEmptyString(alias))
                    rlt.push(alias);
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
            Console.error('ControlKernelBase 的 parentKernel不能为空');
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

        if(this.project){
            this.project.registerControl(this);
        }
        if (createHelper) {
            createHelper.saveJsonMap(kernelJson, this);
        }
        if (parentKernel && parentKernel.project != parentKernel) {
            parentKernel.appandChild(this);
        }
        this.readableName = this.getReadableName();
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

        if(attrItem.name == AttrNames.TextField || attrItem.name == AttrNames.Name){
            this.readableName = this.getReadableName();
        }
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

    getJson(jsonProf) {
        var rlt = {
            attr: super.getJson(jsonProf),
            type: this.type,
            id: this.id,
        };
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

    searchSameReactParentKernel(otherKernel){
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
            if(tKernel == UserControlKernel_Type || (tKernel == M_FormKernel_Type && tKernel.isGridForm())){
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
        var nowKernel = this;
        var parent = nowKernel.parent;
        if(parent == null){
            if(this.type == M_PageKernel_Type){
                parent = this;
                rlt.pop();
            }
        }
        var meetParents_map = [];
        while(parent != null){
            meetParents_map[parent.id] = true;
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
                    if(child.type == M_ContainerKernel_Type || child.type == Accordion_Type){
                        // 穿透div
                        if(meetParents_map[child.id] == null){
                            meetParents_map[child.id] = 1;
                            var aidRlt_arr = [];
                            child.aidAccessableKernels(targetType, aidRlt_arr);
                            if(aidRlt_arr.length > 0){
                                rlt = rlt.concat(aidRlt_arr);
                            }
                        }
                    }
                }
            });
            nowKernel = parent;
            parent = parent.parent;
        }
        return rlt;
    }

    getStatePath(stateName, splitChar = '.', rowIndexVar_map = {}, ignoreRowIndex = false, topestParant){
        if(this.parent == null || this == topestParant){
            return stateName;
        }
        var nowKernel = this.parent;
        var rlt = this.id + (IsEmptyString(stateName) ? '' : splitChar + stateName);
        while(nowKernel != null && nowKernel != topestParant){
            switch(nowKernel.type){
                case M_PageKernel_Type:
                case Accordion_Type:
                case TabItem_Type:
                case TabControl_Type:
                rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                break;
                case M_FormKernel_Type:
                if(ignoreRowIndex == true || !nowKernel.isKernelInRow(this)){
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                }
                else{
                    var rowIndexVar = rowIndexVar_map[nowKernel.id];
                    if(rowIndexVar == null && rowIndexVar_map.mapVarName){
                        rowIndexVar = rowIndexVar_map.mapVarName + '.' + nowKernel.id;
                    }
                    if(rowIndexVar == null){
                        console.error('getStatePath 遇到grid表单但是没有rowindex变量信息');
                    }
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + "row_'+" + rowIndexVar + "+'." + rlt;
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

    canAppand(){
        return true;
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