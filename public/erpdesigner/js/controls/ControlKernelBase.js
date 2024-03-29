'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ControlKernelBaseAttrsSetting = {
    layoutGrop: new CAttributeGroup('布局设置', [new CAttribute('Style', AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true), new CAttribute('Class', AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true)]),
    baseGroup: new CAttributeGroup('基本设置', [new CAttribute('name', AttrNames.Name, ValueType.String)])
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

function findAttrInGroupArrayByName(attName, groupArr) {
    var rlt = null;
    for (var gi in groupArr) {
        rlt = groupArr[gi].findAttrByName(attName);
        if (rlt != null) {
            return rlt;
        }
    }
    return null;
}

function GenControlKernelAttrsSetting(cusGroups_arr, includeDefault, includeLayout) {
    if (includeDefault == null) {
        includeDefault = true;
    }
    if (includeLayout == null) {
        includeLayout = true;
    }
    var rlt = includeLayout ? [M_ControlKernelBaseAttrsSetting.layoutGrop] : [];

    for (var si in cusGroups_arr) {
        var cusGroup = cusGroups_arr[si];
        if (includeDefault != false && cusGroup.label == M_ControlKernelBaseAttrsSetting.baseGroup.label) {
            cusGroup.setAttrs(M_ControlKernelBaseAttrsSetting.baseGroup.attrs_arr.concat(cusGroup.attrs_arr));
        }
        rlt.push(cusGroup);
    }
    return rlt;
}

function getDSAttrCanuseColumns(dsAttrName, csAttrName) {
    var rlt = [];
    if (dsAttrName != null) {
        var useDS = this.getAttribute(dsAttrName);
        if (useDS == null || !useDS.loaded) {
            return [];
        }
        rlt = useDS.columns.map(function (col) {
            return col.name;
        });
    }
    if (csAttrName != null) {
        var cusDS_bp = this.getAttribute(csAttrName);
        if (cusDS_bp != null) {
            cusDS_bp.columns.forEach(function (colItem) {
                if (rlt.indexOf(colItem.name) == -1) {
                    rlt.push(colItem.name);
                }
            });
        }
    }
    return rlt;
}

var LayoutAttrNames_arr = M_ControlKernelBaseAttrsSetting.layoutGrop.attrs_arr.map(function (e) {
    return e.name;
});

var ControlKernelBase = function (_IAttributeable) {
    _inherits(ControlKernelBase, _IAttributeable);

    function ControlKernelBase(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, ControlKernelBase);

        var _this = _possibleConstructorReturn(this, (ControlKernelBase.__proto__ || Object.getPrototypeOf(ControlKernelBase)).call(this, initData, null, description));

        _this.lisenedDSSyned = _this.lisenedDSSyned.bind(_this);
        if (parentKernel == null && type != UserControlKernel_Type) {
            console.error('ControlKernelBase 的 parentKernel不能为空');
        }
        if (_this.project == null) {
            _this.project = parentKernel ? parentKernel.project : null;
        }
        _this.type = type;
        if (attrbuteGroups == null) {
            attrbuteGroups = [];
        }
        _this.attrbuteGroups = attrbuteGroups;
        _this.clickHandler = _this.clickHandler.bind(_this);
        _this.getAccessableKernels = _this.getAccessableKernels.bind(_this);
        _this.listendDS_map = {};

        _this.freshByKernelJson(_this.project, kernelJson);

        if (_this.project) {
            _this.project.registerControl(_this);
        }
        if (createHelper) {
            createHelper.saveJsonMap(kernelJson, _this);
        }
        if (parentKernel && parentKernel.project != parentKernel) {
            parentKernel.appandChild(_this, _this.hintIndexInParent);
            _this.hintIndexInParent = null;
        }
        _this.readableName = _this.getReadableName();
        return _this;
    }

    _createClass(ControlKernelBase, [{
        key: 'freshByKernelJson',
        value: function freshByKernelJson(project, kernelJson) {
            var _this2 = this;

            if (kernelJson != null) {
                // restore attr from json
                this.id = kernelJson.id;
                if (kernelJson.attr != null) {
                    Object.assign(this, kernelJson.attr);

                    this.attrbuteGroups.forEach(function (group) {
                        group.attrs_arr.forEach(function (attr) {
                            if (!attr.editable) return;
                            var attrItemArray = null;
                            if (attr.isArray) {
                                attrItemArray = _this2.getAttrArrayList(attr.name).map(function (e) {
                                    return e.name;
                                });
                            } else {
                                attrItemArray = [attr.name];
                            }
                            attrItemArray.forEach(function (attrName) {
                                var val = _this2[attrName];
                                if (val == null || val == attr.defaultVal) {
                                    return;
                                }
                                switch (attr.valueType) {
                                    case ValueType.DataSource:
                                        if (!IsEmptyString(val)) {
                                            var theDS = project.dataMaster.getDataSourceByCode(val);
                                            if (theDS != null) {
                                                _this2[attrName] = theDS;
                                                _this2.listenDS(theDS, attr.name);
                                            } else {
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
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            var attrItem = this.findAttributeByName(attrName);
            if (attrItem.valueType == ValueType.DataSource) {
                this.unlistenDS(oldValue, attrName);
                if (typeof newValue === 'string') {
                    newValue = this.project.dataMaster.getDataSourceByCode(newValue);
                    if (newValue != null && newValue.code == 0) {
                        newValue = null;
                    }
                    this[realAtrrName] = newValue;
                }
                if (newValue) {
                    this.listenDS(newValue, attrName);
                }
            }
            var bpname = this.id + '_' + realAtrrName;
            var jsbp = this.project.scriptMaster.getBPByName(bpname);
            if (jsbp != null) {
                //this.project.scriptMaster.deleteBP(jsbp);
            }

            if (attrItem.name == AttrNames.TextField || attrItem.name == AttrNames.Name) {
                this.readableName = this.getReadableName();
            }
        }
    }, {
        key: '__removeFromProject',
        value: function __removeFromProject() {
            if (this.children) {
                var myChildren = this.children.concat();
                for (var ci in myChildren) {
                    myChildren[ci].__removeFromProject();
                }
            }
            this.project.unRegisterControl(this, false);
            this.parent = null;
            this.children = [];
        }
    }, {
        key: 'delete',
        value: function _delete(forceDelete) {
            var _this3 = this;

            if (!forceDelete && this.isfixed) {
                return;
            }
            // delete all customdatasource
            var cusdsAttr_arr = this.filterAttributesByValType(ValueType.CustomDataSource);
            cusdsAttr_arr.forEach(function (cusdsAttr) {
                var cusds = _this3.getAttribute(cusdsAttr.name);
                if (cusds != null) {
                    _this3.project.dataMaster.deleteSqlBP(cusds);
                }
            });

            for (var dsCode in this.listendDS_map) {
                var t_arr = this.listendDS_map[dsCode];
                if (t_arr == null) {
                    continue;
                }
                var theDS = this.project.dataMaster.getDataSourceByCode(dsCode);
                if (theDS) {
                    this.unlistenDS(theDS);
                }
            }
            if (this.children) {
                for (var ci in this.children) {
                    this.children[ci].delete(true);
                }
            }
            this.project.unRegisterControl(this);
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }
    }, {
        key: 'listenDS',
        value: function listenDS(target, attrName) {
            if (target == null) {
                return;
            }
            var t_arr = this.listendDS_map[target.code];
            if (t_arr == null) {
                this.listendDS_map[target.code] = [attrName];
                target.on('syned', this.lisenedDSSyned);
            } else {
                var index = t_arr.indexOf(attrName);
                if (index == -1) {
                    t_arr.push(attrName);
                }
            }
        }
    }, {
        key: 'unlistenDS',
        value: function unlistenDS(target, attrName) {
            if (target == null) {
                return;
            }
            var t_arr = this.listendDS_map[target.code];
            if (t_arr != null) {
                var index = t_arr.indexOf(attrName);
                if (index != -1) {
                    t_arr.splice(index, 1);
                }
                if (t_arr.length == 0) {
                    this.listendDS_map[target.code] = null;
                    target.off('syned', this.lisenedDSSyned);
                }
            }
        }
    }, {
        key: 'lisenedDSSyned',
        value: function lisenedDSSyned(theDS) {
            console.log('lisenedDSSyned');
            console.log(theDS);
            var t_arr = this.listendDS_map[theDS.code];
            if (t_arr == null || t_arr.length == 0) {
                console.warn('lisenedDSSyned but not in listendDS_map');
                return;
            }
            if (t_arr.length == 1) {
                this.attrChanged(t_arr[0]);
            } else {
                this.attrChanged(t_arr);
            }
        }
    }, {
        key: 'getReadableName',
        value: function getReadableName() {
            var rlt = null;
            if (!IsEmptyString(this[AttrNames.Name])) {
                rlt = this[AttrNames.Name];
            } else {
                var textField = this[AttrNames.TextField];
                if (textField != null) {
                    rlt = typeof textField === 'string' ? textField : '{脚本}';
                } else {
                    rlt = '';
                }
            }
            return rlt + '[' + this.id + ']';
        }
    }, {
        key: 'getReactClassName',
        value: function getReactClassName(isRedux) {
            return (isRedux ? 'VisibleC' : 'C') + this.id;
        }
    }, {
        key: 'renderSelf',
        value: function renderSelf() {
            return null;
        }
    }, {
        key: 'fireForceRender',
        value: function fireForceRender() {
            this.emit(EFORCERENDER);
        }
    }, {
        key: 'setSelected',
        value: function setSelected(flag) {
            if (this.currentControl) {
                this.currentControl.setSelected(flag);
            }
            this.attrChanged(flag ? 'selected' : 'unselected');
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            //return;
            var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
            if (ctlid == this.id && this.project.designer) {
                //this.project.designer.attributePanel.setTarget(this);
                this.project.designer.selectKernel(this);
            }
            if (ev.preventDefault) {
                ev.preventDefault();
            }
        }
    }, {
        key: 'getLayoutConfig',
        value: function getLayoutConfig(classAttrName, styleAttrName) {
            var _this4 = this;

            var rlt = new ControlLayoutConfig();
            var apdAttrList = this.getAttrArrayList(classAttrName ? classAttrName : AttrNames.LayoutNames.APDClass);
            var self = this;
            apdAttrList.forEach(function (attrArrayItem) {
                var val = _this4.getAttribute(attrArrayItem.name);
                rlt.addClass(val);
            });

            var styleAttrList = this.getAttrArrayList(styleAttrName ? styleAttrName : AttrNames.LayoutNames.StyleAttr);
            styleAttrList.forEach(function (attrArrayItem) {
                var val = _this4.getAttribute(attrArrayItem.name);
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
    }, {
        key: 'getJson',
        value: function getJson(jsonProf) {
            var rlt = {
                attr: _get(ControlKernelBase.prototype.__proto__ || Object.getPrototypeOf(ControlKernelBase.prototype), 'getJson', this).call(this, jsonProf),
                type: this.type,
                id: this.id
            };
            if (jsonProf) {
                jsonProf.useControl(this);
            }
            return rlt;
        }
    }, {
        key: 'getReactParentKernel',
        value: function getReactParentKernel(justFirst) {
            var rlt = null;
            var tKernel = this.parent;
            var isArray = false;
            while (tKernel != null) {
                if (tKernel.hadReactClass) {
                    if (justFirst) {
                        return tKernel;
                    }
                    if (rlt == null) {
                        rlt = [tKernel];
                    } else {
                        rlt.push(tKernel);
                    }
                }
                tKernel = tKernel.parent;
            }
            return rlt;
        }
    }, {
        key: 'getUnDivParentKernel',
        value: function getUnDivParentKernel() {
            var tKernel = this.parent;
            while (tKernel != null) {
                if (tKernel.type != M_ContainerKernel_Type) {
                    return tKernel;
                }
                tKernel = tKernel.parent;
            }
            return null;
        }
    }, {
        key: 'searchSameReactParentKernel',
        value: function searchSameReactParentKernel(otherKernel) {
            if (this.type == M_PageKernel_Type) {
                return this;
            } else if (otherKernel.type == M_PageKernel_Type) {
                return otherKernel;
            }
            var selfParents_arr = this.getReactParentKernel();
            var otherParents_arr = otherKernel.getReactParentKernel();
            for (var i = 0; i < selfParents_arr.length; ++i) {
                if (otherParents_arr.indexOf(selfParents_arr[i]) != -1) {
                    return selfParents_arr[i];
                }
            }
            return null;
        }
    }, {
        key: 'hadAncestor',
        value: function hadAncestor(ancestorKernel) {
            if (ancestorKernel == null) {
                return false;
            }
            var tparent = this.parent;
            while (tparent) {
                if (tparent == ancestorKernel) {
                    return true;
                }
                tparent = tparent.parent;
            }
            return false;
        }
    }, {
        key: 'searchParentKernel',
        value: function searchParentKernel(targetType, justFirst) {
            var rlt = null;
            var tKernel = this.parent;
            var isArray = false;
            if (targetType == null) {
                targetType = '*';
            } else if (Array.isArray(targetType)) {
                isArray = true;
            }
            while (tKernel != null) {
                if (targetType == '*' || !isArray && tKernel.type == targetType || isArray && targetType.indexOf(tKernel.type) != -1) {
                    if (justFirst) {
                        return tKernel;
                    }
                    if (rlt == null) {
                        rlt = [tKernel];
                    } else {
                        rlt.push(tKernel);
                    }
                }
                tKernel = tKernel.parent;
            }
            return rlt;
        }
    }, {
        key: 'isComplicatedPath',
        value: function isComplicatedPath() {
            var tKernel = this.parent;
            while (tKernel != null) {
                if (tKernel == UserControlKernel_Type || tKernel == M_FormKernel_Type && !tKernel.isPageForm()) {
                    return true;
                }
                tKernel = tKernel.parent;
            }
            return false;
        }
    }, {
        key: 'searchChildKernel',
        value: function searchChildKernel(targetType, justFirst, deepSearch, ignoreTypes) {
            var rlt = null;
            var isArray = false;
            if (targetType == null) {
                targetType = '*';
            } else if (Array.isArray(targetType)) {
                isArray = true;
            }
            if (this.children && this.children.length > 0) {
                for (var ci in this.children) {
                    var child = this.children[ci];
                    if (ignoreTypes != null && ignoreTypes.indexOf(child.type) != -1) {
                        continue;
                    }
                    if (targetType == '*' || !isArray && child.type == targetType || isArray && targetType.indexOf(child.type) != -1) {
                        if (justFirst) {
                            return child;
                        }
                        if (rlt == null) {
                            rlt = [];
                        }
                        rlt.push(child);
                    }
                    if (deepSearch) {
                        var childRet = child.searchChildKernel(targetType, justFirst, deepSearch);
                        if (childRet != null) {
                            if (justFirst) {
                                return childRet;
                            } else {
                                if (rlt == null) {
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
    }, {
        key: 'getAccessableKernels',
        value: function getAccessableKernels(targetType) {
            var rlt = [];
            if (targetType == M_AllKernel_Type) {
                targetType = null;
            }
            var needFilt = targetType != null;
            if (!needFilt || this.type == targetType) {
                rlt.push(this);
            }
            if (rlt.editor && (!needFilt || rlt.editor.type == targetType)) {
                rlt.push(rlt.editor);
            }
            var meetParents_map = [];
            var nowKernel = this;
            var parent = nowKernel.parent;
            var aidRlt_arr;
            if (nowKernel.type == M_FormKernel_Type) {
                if (nowKernel.isPageForm()) {
                    parent = nowKernel; // page型的form可以访问到孩子控件
                } else if (nowKernel.isGridForm()) {
                    // grid型的form可以访问到bottom的控件
                    meetParents_map[nowKernel.gridFormBottomDiv.id] = 1;
                    aidRlt_arr = [];
                    nowKernel.gridFormBottomDiv.aidAccessableKernels(targetType, aidRlt_arr);
                    if (aidRlt_arr && aidRlt_arr.length > 0) {
                        aidRlt_arr.forEach(function (x) {
                            if (rlt.indexOf(x) == -1) {
                                rlt.push(x);
                            }
                        });
                    }
                }
            }
            if (nowKernel.type == Accordion_Type) {
                parent = nowKernel; // 折叠控件可以访问到孩子控件
            }
            if (parent == null) {
                if (this.type == M_PageKernel_Type || this.type == UserControlKernel_Type) {
                    parent = this;
                    rlt.pop();
                }
            }
            while (parent != null) {
                if (meetParents_map[parent.id]) {
                    return;
                }
                meetParents_map[parent.id] = true;
                if (!needFilt || parent.type == targetType) {
                    if (rlt.indexOf(parent) == -1) {
                        rlt.push(parent);
                    }
                }
                parent.children.forEach(function (child) {
                    if (child != nowKernel) {
                        if (!needFilt || child.type == targetType) {
                            if (rlt.indexOf(child) == -1) {
                                rlt.push(child);
                            }
                        }
                        if (child.editor) {
                            if (!needFilt || child.editor.type == targetType) {
                                if (rlt.indexOf(child.editor) == -1) {
                                    rlt.push(child.editor);
                                }
                            }
                            if (child.editor.type == M_ContainerKernel_Type || child.editor.type == PopperButtonKernel_Type) {
                                // 穿透div
                                if (meetParents_map[child.editor.id] == null) {
                                    meetParents_map[child.editor.id] = 1;
                                    aidRlt_arr = [];
                                    child.editor.aidAccessableKernels(targetType, aidRlt_arr, true);
                                }
                            }
                        }
                        if (child.type == M_ContainerKernel_Type || child.type == Accordion_Type || child.type == M_FormKernel_Type || child.type == PopperButtonKernel_Type) {
                            // 穿透div
                            if (meetParents_map[child.id] == null) {
                                meetParents_map[child.id] = 1;
                                aidRlt_arr = [];
                                child.aidAccessableKernels(targetType, aidRlt_arr, true);
                            }
                        }

                        if (aidRlt_arr && aidRlt_arr.length > 0) {
                            aidRlt_arr.forEach(function (x) {
                                if (rlt.indexOf(x) == -1) {
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
    }, {
        key: 'getParentStatePath',
        value: function getParentStatePath() {
            var splitChar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.';
            var rowKeyVar_map = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var ignoreRowKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var topestParant = arguments[3];

            var rlt = this.getStatePath('', splitChar, rowKeyVar_map, ignoreRowKey, topestParant);
            var index = rlt.lastIndexOf(splitChar);
            return index != -1 ? rlt.substring(0, index) : rlt;
        }
    }, {
        key: 'getStatePath',
        value: function getStatePath(stateName) {
            var splitChar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.';
            var rowKeyVar_map = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var ignoreRowKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var topestParant = arguments[4];

            var rlt = this.id + (IsEmptyString(stateName) ? '' : splitChar + stateName);
            /*
            switch(this.type){
                case M_ContainerKernel_Type:
                console.warn('getStatePath M_ContainerKernel_Type');
                rlt = '';
                break;
            }
            */
            if (this.parent == null || this == topestParant) {
                return rlt;
            }
            var nowKernel = this.parent;
            while (nowKernel != null && nowKernel != topestParant) {
                switch (nowKernel.type) {
                    case M_PageKernel_Type:
                    case Accordion_Type:
                    case TabItem_Type:
                    case TabControl_Type:
                        rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                        break;
                    case M_FormKernel_Type:
                        if (ignoreRowKey == true || !nowKernel.isKernelInRow(this)) {
                            rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                        } else {
                            var rowKeyVar = rowKeyVar_map[nowKernel.id];
                            if (rowKeyVar == null && rowKeyVar_map.mapVarName) {
                                rowKeyVar = rowKeyVar_map.mapVarName + '.' + nowKernel.id;
                            }
                            if (rowKeyVar == null) {
                                console.error('getStatePath 遇到grid表单但是没有rowkey变量信息');
                            }
                            rlt = nowKernel.id + splitChar + "row_'+" + rowKeyVar + (rlt.length == 0 ? "+'" : "+'" + splitChar + rlt);
                        }
                        break;
                }
                if (nowKernel && nowKernel != topestParant) {
                    nowKernel = nowKernel.parent;
                }
            }
            return rlt;
        }
    }, {
        key: 'isAEditor',
        value: function isAEditor() {
            return this.parent && this.parent.editor == this;
        }
    }, {
        key: 'getParentLabledCtl',
        value: function getParentLabledCtl() {
            return this.searchParentKernel(M_LabeledControlKernel_Type, true);
        }
    }, {
        key: 'canAppand',
        value: function canAppand() {
            return true;
        }
    }, {
        key: 'slideInParent',
        value: function slideInParent(offset) {
            if (this.parent) {
                var nowPos = this.parent.children.indexOf(this);
                this.parent.swapChild(nowPos, nowPos + offset);
            }
        }
    }, {
        key: 'getTextValueFieldValue',
        value: function getTextValueFieldValue() {
            var rlt = {};
            var textAttr = this.findAttributeByName(AttrNames.TextField);
            if (textAttr) {
                rlt.text = this.getAttribute(AttrNames.TextField);
            }
            var valueAttr = this.findAttributeByName(AttrNames.ValueField);
            if (valueAttr) {
                rlt.value = this.getAttribute(AttrNames.ValueField);
            }
            return rlt;
        }
    }]);

    return ControlKernelBase;
}(IAttributeable);

var g_switchClassNameReg = /-\d+$/;

var ControlLayoutConfig = function () {
    function ControlLayoutConfig() {
        _classCallCheck(this, ControlLayoutConfig);

        this.class = {};
        this.style = {};
        this.switch = {};
    }

    _createClass(ControlLayoutConfig, [{
        key: 'addSwitchClass',
        value: function addSwitchClass(switchName, switchVal, existsProcess) {
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
    }, {
        key: 'addClass',
        value: function addClass(value, existsProcess) {
            var _this5 = this;

            var class_arr = value.trim().split(' ');
            var added = false;
            class_arr.forEach(function (className) {
                if (IsEmptyString(className)) {
                    return;
                }
                var t_arr = g_switchClassNameReg.exec(className);
                if (t_arr != null) {
                    var switchName = className.substr(0, className.length - t_arr[0].length);
                    var switchVal = t_arr[0].substr(1);
                    if (_this5.addSwitchClass(switchName, switchVal, existsProcess)) {
                        added = true;
                    }
                    return;
                }
                added = true;
                _this5.class[className] = 1;
            });
            return added;
        }
    }, {
        key: 'removeClass',
        value: function removeClass(className) {
            delete this.class[className];
            delete this.switch[className];
        }
    }, {
        key: 'addStyle',
        value: function addStyle(name, val) {
            if (IsEmptyString(name) || val == null) {
                return false;
            }
            this.style[name] = val;
            return true;
        }
    }, {
        key: 'removeStyle',
        value: function removeStyle(name) {
            delete style[name];
        }
    }, {
        key: 'getClassName',
        value: function getClassName() {
            var rlt = '';
            for (var si in this.class) {
                if (this.class[si] == 0) continue;
                rlt += si + ' ';
            }
            return rlt;
        }
    }, {
        key: 'hadClass',
        value: function hadClass(name) {
            return this.class[name] != null;
        }
    }, {
        key: 'hadStyle',
        value: function hadStyle(name) {
            return this.class[name] != null;
        }
    }, {
        key: 'hadSizeSetting',
        value: function hadSizeSetting() {
            return this.switch['flex-grow'] != null || this.switch['flex-shrink'] != null || this.width != null || this.style.height != null || this.style.maxWidth != null || this.style.maxHeight != null;
        }
    }, {
        key: 'overrideBy',
        value: function overrideBy(taget) {
            this.style = Object.assign(this.style, taget.style);
            this.addClass(taget.getClassName(), 'set');
        }
    }, {
        key: 'clone',
        value: function clone() {
            var rlt = new ControlLayoutConfig();
            rlt.class = Object.assign({}, this.class);
            rlt.style = Object.assign({}, this.style);
            rlt.switch = Object.assign({}, this.switch);
            return rlt;
        }
    }]);

    return ControlLayoutConfig;
}();

var CtlKernelCreationHelper = function (_EventEmitter) {
    _inherits(CtlKernelCreationHelper, _EventEmitter);

    function CtlKernelCreationHelper() {
        _classCallCheck(this, CtlKernelCreationHelper);

        var _this6 = _possibleConstructorReturn(this, (CtlKernelCreationHelper.__proto__ || Object.getPrototypeOf(CtlKernelCreationHelper)).call(this));

        EnhanceEventEmiter(_this6);
        _this6.orginID_map = {};
        _this6.newID_map = {};
        _this6.idTracer = {};
        return _this6;
    }

    _createClass(CtlKernelCreationHelper, [{
        key: 'saveJsonMap',
        value: function saveJsonMap(jsonData, newKernel) {
            if (jsonData && jsonData.id) {
                if (this.getObjFromID(jsonData.id) != null) {
                    console.warn(jsonData.id + '被重复saveJsonMap');
                }
                if (jsonData.id != newKernel.id) {
                    if (this.getObjFromID(newKernel.id) != null) {
                        console.warn(jsonData.id + '被重复saveJsonMap');
                    }
                    this.idTracer[jsonData.id] = this.idTracer[newKernel.id];
                }
                this.orginID_map[jsonData.id] = newKernel;
            }

            this.newID_map[newKernel.id] = newKernel;
        }
    }, {
        key: 'getObjFromID',
        value: function getObjFromID(id) {
            var rlt = this.orginID_map[id];
            if (rlt == null) {
                rlt = this.newID_map[id];
            }
            return rlt;
        }
    }]);

    return CtlKernelCreationHelper;
}(EventEmitter);