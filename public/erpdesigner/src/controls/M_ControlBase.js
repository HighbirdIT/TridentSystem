function M_ControlBase_componentWillMount(){
    this.listenTarget(this.props.ctlKernel);
}

function M_ControlBase_componentWillUnmount(){
    this.unlistenTarget(this.props.ctlKernel);
}

function M_ControlBase_listenTarget(target) {
    if(target)
    {
        target.currentControl = this;
        target.on(EATTRCHANGED, this.attrChangedHandler);
        target.on(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_unlistenTarget(target) {
    if(target)
    {
        if(target.currentControl == this){
            target.currentControl = null;
        }
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

function React_Make_AttributeListener(target,watchedAttrs){
    target.watchedAttrs = watchedAttrs;
    target.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;
    target.listenTarget = M_ControlBase_listenTarget.bind(target);
    target.unlistenTarget = M_ControlBase_unlistenTarget.bind(target);
    target.forceRenderHandler = M_ControlBase_forceRenderHandler.bind(target);
    target.attrChangedHandler = M_ControlBase_attrChangedHandler.bind(target);
}

function M_ControlBase(target,watchedAttrs){
    var self = this;
    var ctlKernel = target.props.ctlKernel;
    target.rootElemRef = React.createRef();
    React_Make_AttributeListener(target, watchedAttrs);
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

