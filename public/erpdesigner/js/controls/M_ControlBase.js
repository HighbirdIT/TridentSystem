'use strict';

var gCopiedKernelData = null;

function M_ControlBase_componentWillMount() {
    this.listenTarget(this.props.ctlKernel);
    this.mounted = true;
}

function M_ControlBase_componentWillUnmount() {
    this.mounted = false;
    this.unlistenTarget(this.props.ctlKernel);
}

function M_ControlBase_listenTarget_SetControl(target) {
    if (target) {
        target.currentControl = this;
        target.on(EATTRCHANGED, this.attrChangedHandler);
        target.on(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_unlistenTarget_SetControl(target) {
    if (target) {
        if (target.currentControl == this) {
            target.currentControl = null;
        }
        target.off(EATTRCHANGED, this.attrChangedHandler);
        target.off(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_listenTarget(target) {
    if (target) {
        target.on(EATTRCHANGED, this.attrChangedHandler);
        target.on(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_unlistenTarget(target) {
    if (target) {
        target.off(EATTRCHANGED, this.attrChangedHandler);
        target.off(EFORCERENDER, this.forceRenderHandler);
    }
}

function M_ControlBase_forceRenderHandler(ev) {
    this.setState({ magicObj: {} });
}

function M_ControlBase_setSelected(flag) {
    this.setState({ selected: flag });
}

function M_ControlBase_attrChangedHandler(ev) {
    var _this = this;

    if (this.watchedAttrs == null) return;
    var needFresh = false;
    var changedAttrIndex = -1;
    if (typeof ev.name === 'string') {
        changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
        needFresh = changedAttrIndex != -1;
    } else {
        needFresh = ev.name.find(function (attrName) {
            changedAttrIndex = _this.watchedAttrs.indexOf(attrName);
            return changedAttrIndex != -1;
        }) != null;
    }
    if (needFresh) {
        var changedAttrName = this.watchedAttrs[changedAttrIndex];
        this.aAttrChanged(changedAttrName);
    }
}

function M_ControlBase_aAttrChangedBase(changedAttrName) {
    var ctlKernel = this.props.ctlKernel;
    if (AttrNames.LayoutNames[changedAttrName] != null) {
        this.forceUpdate();
        return true;
    }
    return false;
}

function React_Make_AttributeListener(target, watchedAttrs, manageCurrentControl) {
    var _this2 = this;

    target.watchedAttrs = watchedAttrs;
    target.watchAttrMatch = function (attrName) {
        return _this2.watchedAttrs.indexOf(attrName) != -1;
    };
    if (manageCurrentControl) {
        target.listenTarget = M_ControlBase_listenTarget_SetControl.bind(target);
        target.unlistenTarget = M_ControlBase_unlistenTarget_SetControl.bind(target);
    } else {
        target.listenTarget = M_ControlBase_listenTarget.bind(target);
        target.unlistenTarget = M_ControlBase_unlistenTarget.bind(target);
    }
    target.forceRenderHandler = M_ControlBase_forceRenderHandler.bind(target);
    target.attrChangedHandler = M_ControlBase_attrChangedHandler.bind(target);
}

function M_ControlBase(target, watchedAttrs) {
    var self = this;
    var ctlKernel = target.props.ctlKernel;
    target.rootElemRef = React.createRef();
    React_Make_AttributeListener(target, watchedAttrs, true);
    target.componentWillMount = M_ControlBase_componentWillMount.bind(target);
    target.componentWillUnmount = M_ControlBase_componentWillUnmount.bind(target);
    target.renderHandleBar = M_ControlBase_RenderHandleBar.bind(target);
    target.clickHandleTrash = M_ControlBase_ClickHandle_Trash.bind(target);
    target.clickHandleMove = M_ControlBase_ClickHandle_Move.bind(target);
    target.clickHandleCopy = M_ControlBase_ClickHandle_Copy.bind(target);
    target.clickHandlePaste = M_ControlBase_ClickHandle_Paste.bind(target);
    target.clickHandleEraser = M_ControlBase_ClickHandle_Eraser.bind(target);
    target.clickHandleGoParent = M_ControlBase_ClickHandle_GoParent.bind(target);

    target.setSelected = M_ControlBase_setSelected.bind(target);
    target.aAttrChangedBase = M_ControlBase_aAttrChangedBase.bind(target);
    target.reDraw = C_ReDraw.bind(target);

    var layoutState = {};
    LayoutAttrNames_arr.forEach(function (name) {
        if (ctlKernel.hasAttribute(name)) {
            layoutState[name] = ctlKernel.getAttribute(name);
        }
    });
    return layoutState;
}

function M_ControlBase_ClickHandle_Trash() {
    this.props.ctlKernel.project.designer.deleteSelectedKernel();
}

function M_ControlBase_ClickHandle_Move() {
    if (this.props.ctlKernel.project.designer.outlineRef.current) {
        this.props.ctlKernel.project.designer.outlineRef.current.startDragKernel(this.props.ctlKernel);
    }
}

function M_ControlBase_ClickHandle_Copy() {
    gCopiedKernelData = this.props.ctlKernel.project.copyKernel(this.props.ctlKernel);
    console.log(gCopiedKernelData);
    this.reDraw();
}

function M_ControlBase_ClickHandle_Paste() {
    if (gCopiedKernelData) {
        var theKernel = this.props.ctlKernel;
        var targetParent = theKernel.parent;
        if (targetParent == null) {
            targetParent = theKernel;
        }
        var targetIndex = targetParent.getChildIndex(theKernel);
        this.props.ctlKernel.project.pasteKernel(gCopiedKernelData, this.props.ctlKernel.parent, targetIndex);
    }
}

function M_ControlBase_ClickHandle_Eraser() {
    gCopiedKernelData = null;
    this.reDraw();
}

function M_ControlBase_ClickHandle_GoParent() {
    var theKernel = this.props.ctlKernel;
    if (theKernel.parent) {
        theKernel.project.designer.selectKernel(theKernel.parent);
    }
}

function M_ControlBase_RenderHandleBar() {
    if (this.state.selected != true || this.props.ctlKernel.isfixed) {
        return null;
    }

    return React.createElement(
        'div',
        { className: 'controlHandleBar' },
        React.createElement(
            'div',
            { className: 'btn-group' },
            React.createElement(
                'button',
                { className: 'btn btn-dark', onMouseDown: this.clickHandleMove },
                React.createElement('i', { className: 'fa fa-arrows' })
            ),
            this.props.ctlKernel.parent ? React.createElement(
                'button',
                { className: 'btn btn-dark', onClick: this.clickHandleGoParent },
                React.createElement('i', { className: 'fa fa-reply' })
            ) : null,
            React.createElement(
                'button',
                { className: 'btn btn-dark', onClick: this.clickHandleCopy },
                React.createElement('i', { className: 'fa fa-copy' })
            ),
            gCopiedKernelData && React.createElement(
                'button',
                { className: 'btn btn-dark', onClick: this.clickHandlePaste },
                React.createElement('i', { className: 'fa fa-paste' })
            ),
            gCopiedKernelData && React.createElement(
                'button',
                { className: 'btn btn-dark', onClick: this.clickHandleEraser },
                React.createElement('i', { className: 'fa fa-eraser' })
            ),
            React.createElement(
                'button',
                { className: 'btn btn-danger', onClick: this.clickHandleTrash },
                React.createElement('i', { className: 'fa fa-trash' })
            )
        )
    );
}

function GetKernelCanUseColumns(theKernel) {
    var rlt = null;
    var nowKernel = theKernel.parent;
    do {
        switch (nowKernel.type) {
            case M_FormKernel_Type:
                rlt = nowKernel.getCanuseColumns();
                break;
        }
        if (rlt != null) {
            break;
        }
        nowKernel = nowKernel.parent;
    } while (nowKernel != null);
    return rlt == null ? [] : rlt;
}

function GetCanInteractiveColumns(theKernel) {
    var rlt = [''];
    var formKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
    if (formKernel == null) {
        //parentKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
        return rlt;
    }
    var processTable = formKernel.getAttribute(AttrNames.ProcessTable);
    if (processTable != null && processTable.loaded && processTable.columns != null) {
        processTable.columns.forEach(function (column) {
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