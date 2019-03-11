function M_ControlBase_componentWillMount(){
    this.listenTarget(this.props.ctlKernel);
    this.mounted = true;
}

function M_ControlBase_componentWillUnmount(){
    this.mounted = false;
    this.unlistenTarget(this.props.ctlKernel);
}

function M_ControlBase_listenTarget_SetControl(target) {
    if(target)
    {
        target.currentControl = this;
        target.on(EATTRCHANGED, this.attrChangedHandler);
        target.on(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_unlistenTarget_SetControl(target) {
    if(target)
    {
        if(target.currentControl == this){
            target.currentControl = null;
        }
        target.off(EATTRCHANGED, this.attrChangedHandler);
        target.off(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_listenTarget(target) {
    if(target)
    {
        target.on(EATTRCHANGED, this.attrChangedHandler);
        target.on(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_unlistenTarget(target) {
    if(target)
    {
        target.off(EATTRCHANGED, this.attrChangedHandler);
        target.off(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_forceRenderHandler(ev){
    this.setState({magicObj:{}});
}

function M_ControlBase_setSelected(flag){
    this.setState({selected:flag});
}


function M_ControlBase_attrChangedHandler(ev) {
    if(this.watchedAttrs == null)
        return;
    var needFresh = false;
    var changedAttrIndex = -1;
    if (typeof ev.name === 'string') {
        changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
        needFresh = changedAttrIndex != -1;
    }
    else {
        needFresh = ev.name.find(
            attrName => {
                changedAttrIndex = this.watchedAttrs.indexOf(attrName);
                return changedAttrIndex != -1;
            }
        ) != null;
    }
    if (needFresh) {
        var changedAttrName = this.watchedAttrs[changedAttrIndex];
        this.aAttrChanged(changedAttrName);
    }
}

function M_ControlBase_aAttrChangedBase(changedAttrName){
    var ctlKernel = this.props.ctlKernel;
    if(AttrNames.LayoutNames[changedAttrName] != null){
        this.forceUpdate();
        return true;
    }
    return false;
}

function React_Make_AttributeListener(target,watchedAttrs,manageCurrentControl){
    target.watchedAttrs = watchedAttrs;
    target.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;
    if(manageCurrentControl){
        target.listenTarget = M_ControlBase_listenTarget_SetControl.bind(target);
        target.unlistenTarget = M_ControlBase_unlistenTarget_SetControl.bind(target);
    }
    else{
        target.listenTarget = M_ControlBase_listenTarget.bind(target);
        target.unlistenTarget = M_ControlBase_unlistenTarget.bind(target);
    }
    target.forceRenderHandler = M_ControlBase_forceRenderHandler.bind(target);
    target.attrChangedHandler = M_ControlBase_attrChangedHandler.bind(target);
}

function M_ControlBase(target,watchedAttrs){
    var self = this;
    var ctlKernel = target.props.ctlKernel;
    target.rootElemRef = React.createRef();
    React_Make_AttributeListener(target, watchedAttrs, true);
    target.componentWillMount = M_ControlBase_componentWillMount.bind(target);
    target.componentWillUnmount = M_ControlBase_componentWillUnmount.bind(target);
    target.setSelected = M_ControlBase_setSelected.bind(target);
    target.aAttrChangedBase = M_ControlBase_aAttrChangedBase.bind(target);

    var layoutState = {};
    LayoutAttrNames_arr.forEach(name=>{
        layoutState[name] = ctlKernel.getAttribute(name);
    });
    return layoutState;
}


function GetKernelCanUseColumns(theKernel){
    var rlt = null;
    var nowKernel = theKernel.parent;
    do{
        switch(nowKernel.type){
            case M_FormKernel_Type:
            rlt = nowKernel.getCanuseColumns();
            break;
        }
        if(rlt != null){
            break;
        }
        nowKernel = nowKernel.parent;
    }while(nowKernel != null);
    return rlt == null ? [] : rlt;
}

function GetCanInteractiveColumns(theKernel){
    var rlt = [''];
    var formKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
    if(formKernel == null){
        //parentKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
        return rlt;
    }
    var processTable = formKernel.getAttribute(AttrNames.ProcessTable);
    if(processTable != null && processTable.loaded && processTable.columns != null){
        processTable.columns.forEach(column=>{
            rlt.push(column.name);
        });
    }
    /*
    var buttons_arr = parentKernel.searchChildKernel(ButtonKernel_Type, false, true);
    var processTables_map = {};
    buttons_arr.forEach(btnKernel=>{
        var wts_arr = btnKernel.getWantInsertTables();
        if(wts_arr != null){
            wts_arr.forEach(code=>{
                processTables_map[code] = 1;
            });
        }
    });
    for(var dsCode in processTables_map){
        var theDS = g_dataBase.getEntityByCode(dsCode);
        if(theDS != null && theDS.loaded && theDS.columns != null){
            theDS.columns.forEach(column=>{
                rlt.push(column.name);
            });
        }
    }
    */
    return rlt;
}