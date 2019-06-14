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
    var useDS = this.getAttribute(dsAttrName);
    if (useDS == null) {
        return [];
    }
    var rlt = useDS.columns.map(function (col) {
        return col.name;
    });
    if (csAttrName != null) {
        var cusDS_bp = this.getAttribute(csAttrName);
        if (cusDS_bp != null) {
            var retColumnNode = cusDS_bp.finalSelectNode.columnNode;
            retColumnNode.inputScokets_arr.forEach(function (socket) {
                var alias = socket.getExtra('alias');
                if (!IsEmptyString(alias)) rlt.push(alias);
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
        if (parentKernel == null && type != UserContrlKernel_Type) {
            Console.error('ControlKernelBase 的 parentKernel不能为空');
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

        if (kernelJson != null) {
            // restore attr from json
            _this.id = kernelJson.id;
            if (kernelJson.attr != null) {
                Object.assign(_this, kernelJson.attr);

                _this.attrbuteGroups.forEach(function (group) {
                    group.attrs_arr.forEach(function (attr) {
                        if (!attr.editable) return;
                        var attrItemArray = null;
                        if (attr.isArray) {
                            attrItemArray = _this.getAttrArrayList(attr.name).map(function (e) {
                                return e.name;
                            });
                        } else {
                            attrItemArray = [attr.name];
                        }
                        attrItemArray.forEach(function (attrName) {
                            var val = _this[attrName];
                            if (val == null || val == attr.defaultVal) {
                                return;
                            }
                            switch (attr.valueType) {
                                case ValueType.DataSource:
                                    if (!IsEmptyString(val)) {
                                        var theDS = parentKernel.project.dataMaster.getDataSourceByCode(val);
                                        if (theDS != null) {
                                            _this[attrName] = theDS;
                                            _this.listenDS(theDS, attr.name);
                                        } else {
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

        if (_this.project) {
            _this.project.registerControl(_this);
        }
        if (createHelper) {
            createHelper.saveJsonMap(kernelJson, _this);
        }
        if (parentKernel && parentKernel.project != parentKernel) {
            parentKernel.appandChild(_this);
        }
        _this.readableName = _this.getReadableName();
        return _this;
    }

    _createClass(ControlKernelBase, [{
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

            if (attrItem.name == AttrNames.TextField || attrItem.name == AttrNames.Name) {
                this.readableName = this.getReadableName();
            }
        }
    }, {
        key: 'delete',
        value: function _delete(forceDelete) {
            var _this2 = this;

            if (!forceDelete && this.isfixed) {
                return;
            }
            // delete all customdatasource
            var cusdsAttr_arr = this.filterAttributesByValType(ValueType.CustomDataSource);
            cusdsAttr_arr.forEach(function (cusdsAttr) {
                var cusds = _this2.getAttribute(cusdsAttr.name);
                if (cusds != null) {
                    _this2.project.dataMaster.deleteSqlBP(cusds);
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
        value: function getLayoutConfig() {
            var _this3 = this;

            var rlt = new ControlLayoutConfig();
            var apdAttrList = this.getAttrArrayList(AttrNames.LayoutNames.APDClass);
            var self = this;
            apdAttrList.forEach(function (attrArrayItem) {
                var val = _this3.getAttribute(attrArrayItem.name);
                rlt.addClass(val);
            });

            var styleAttrList = this.getAttrArrayList(AttrNames.LayoutNames.StyleAttr);
            styleAttrList.forEach(function (attrArrayItem) {
                var val = _this3.getAttribute(attrArrayItem.name);
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
            return rlt;
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
            var nowKernel = this;
            var parent = nowKernel.parent;
            if (parent == null) {
                if (this.type == M_PageKernel_Type) {
                    parent = this;
                    rlt.pop();
                }
            }
            var meetParents_map = [];
            while (parent != null) {
                meetParents_map[parent.id] = true;
                if (!needFilt || parent.type == targetType) {
                    rlt.push(parent);
                }
                parent.children.forEach(function (child) {
                    if (child != nowKernel) {
                        if (!needFilt || child.type == targetType) {
                            rlt.push(child);
                        }
                        if (child.editor && (!needFilt || child.editor.type == targetType)) {
                            rlt.push(child.editor);
                        }
                        if (child.type == M_ContainerKernel_Type) {
                            // 穿透div
                            if (meetParents_map[child.id] == null) {
                                meetParents_map[child.id] = 1;
                                var aidRlt_arr = [];
                                child.aidAccessableKernels(targetType, aidRlt_arr);
                                if (aidRlt_arr.length > 0) {
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
    }, {
        key: 'getStatePath',
        value: function getStatePath(stateName) {
            var splitChar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.';
            var rowIndexVar_map = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var ignoreRowIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var nowKernel = this.parent;
            var rlt = this.id + (IsEmptyString(stateName) ? '' : splitChar + stateName);
            do {
                switch (nowKernel.type) {
                    case M_PageKernel_Type:
                        rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                        break;
                    case M_FormKernel_Type:
                        if (ignoreRowIndex != true && nowKernel.isGridForm()) {
                            var rowIndexVar = rowIndexVar_map[nowKernel.id];
                            if (rowIndexVar == null && rowIndexVar_map.mapVarName) {
                                rowIndexVar = rowIndexVar_map.mapVarName + '.' + nowKernel.id;
                            }
                            if (rowIndexVar == null) {
                                console.error('getStatePath 遇到grid表单但是没有rowindex变量信息');
                            }
                            rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + "row_'+" + rowIndexVar + "+'." + rlt;
                        } else {
                            rlt = nowKernel.id + (rlt.length == 0 ? '' : splitChar) + rlt;
                        }
                        break;
                }
                if (nowKernel) {
                    nowKernel = nowKernel.parent;
                }
            } while (nowKernel != null);
            return rlt;
        }
    }, {
        key: 'isAEditor',
        value: function isAEditor() {
            return this.parent && this.parent.editor == this;
        }
    }, {
        key: 'canAppand',
        value: function canAppand() {
            return true;
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
        value: function addClass(className, existsProcess) {
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
        key: 'getClassName',
        value: function getClassName() {
            var rlt = '';
            for (var si in this.class) {
                if (this.class[si] == 0) continue;
                rlt += si + ' ';
            }
            return rlt;
        }
    }]);

    return ControlLayoutConfig;
}();

var CtlKernelCreationHelper = function (_EventEmitter) {
    _inherits(CtlKernelCreationHelper, _EventEmitter);

    function CtlKernelCreationHelper() {
        _classCallCheck(this, CtlKernelCreationHelper);

        var _this4 = _possibleConstructorReturn(this, (CtlKernelCreationHelper.__proto__ || Object.getPrototypeOf(CtlKernelCreationHelper)).call(this));

        EnhanceEventEmiter(_this4);
        _this4.orginID_map = {};
        _this4.newID_map = {};
        _this4.idTracer = {};
        return _this4;
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