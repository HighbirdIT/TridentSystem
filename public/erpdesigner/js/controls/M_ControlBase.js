'use strict';

function M_ControlBase_componentWillMount() {
    this.listenTarget(this.props.ctlKernel);
}

function M_ControlBase_componentWillUnmount() {
    this.unlistenTarget(this.props.ctlKernel);
}

function M_ControlBase_listenTarget(target) {
    target.on(EATTRCHANGED, this.attrChangedHandler);
    target.on(EFORCERENDER, this.forceRenderHandler);
}

function M_ControlBase_unlistenTarget(target) {
    target.off(EATTRCHANGED, this.attrChangedHandler);
    target.off(EFORCERENDER, this.forceRenderHandler);
}

function M_ControlBase_forceRenderHandler(ev) {
    this.setState({ magicObj: {} });
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

function M_ControlBase(target, watchedAttrs) {
    var _this2 = this;

    var self = this;
    target.props.ctlKernel.currentControl = target;
    target.watchedAttrs = watchedAttrs;
    target.watchAttrMatch = function (attrName) {
        return _this2.watchedAttrs.indexOf(attrName) != -1;
    };

    target.componentWillMount = M_ControlBase_componentWillMount.bind(target);
    target.componentWillUnmount = M_ControlBase_componentWillUnmount.bind(target);
    target.listenTarget = M_ControlBase_listenTarget.bind(target);
    target.unlistenTarget = M_ControlBase_unlistenTarget.bind(target);
    target.forceRenderHandler = M_ControlBase_forceRenderHandler.bind(target);
    target.attrChangedHandler = M_ControlBase_attrChangedHandler.bind(target);
}