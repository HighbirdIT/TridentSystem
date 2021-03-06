'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttributeEditor = function (_React$PureComponent) {
    _inherits(AttributeEditor, _React$PureComponent);

    function AttributeEditor(props) {
        _classCallCheck(this, AttributeEditor);

        var _this = _possibleConstructorReturn(this, (AttributeEditor.__proto__ || Object.getPrototypeOf(AttributeEditor)).call(this, props));

        autoBind(_this);

        var initState = {
            value: _this.getAttrNowValue(),
            targetobj: _this.props.targetobj
        };
        _this.state = initState;
        _this.ddc_ref = React.createRef();
        return _this;
    }

    _createClass(AttributeEditor, [{
        key: 'getAttrNowValue',
        value: function getAttrNowValue(notclone) {
            var rlt = this.props.targetobj.getAttribute(this.props.targetattr.name, this.props.index);
            if (rlt == null) {
                switch (this.props.targetattr.valueType) {
                    case ValueType.StyleValues:
                    case ValueType.UserControlEvent:
                    case ValueType.AttrHook:
                    case ValueType.AttrChecker:
                    case ValueType.NameAndScript:
                        rlt = {};
                        break;
                    default:
                        rlt = '';
                }
            } else {
                if ((typeof rlt === 'undefined' ? 'undefined' : _typeof(rlt)) === 'object') {
                    rlt = notclone ? rlt : Object.assign({}, rlt);
                }
            }
            switch (this.props.targetattr.valueType) {
                case ValueType.StyleValues:
                case ValueType.AttrHook:
                case ValueType.UserControlEvent:
                case ValueType.AttrChecker:
                case ValueType.NameAndScript:
                    if (typeof rlt === 'string') {
                        rlt = {};
                    }
                    break;
            }
            return rlt;
        }
    }, {
        key: 'getRealAttrName',
        value: function getRealAttrName() {
            return this.props.targetattr.name + (this.props.index == null ? '' : '_' + this.props.index);
        }
    }, {
        key: 'getRealAttrLabel',
        value: function getRealAttrLabel() {
            return this.props.targetattr.label + (this.props.index == null ? '' : this.props.index);
        }
    }, {
        key: 'getRealAttrInputID',
        value: function getRealAttrInputID() {
            return this.props.targetattr.inputID + (this.props.index == null ? '' : this.props.index);
        }
    }, {
        key: 'listenTarget',
        value: function listenTarget(target) {
            target.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'unlistenTarget',
        value: function unlistenTarget(target) {
            target.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenTarget(this.props.targetobj);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.targetobj);
        }
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var myAttrName = this.props.targetattr.name;
            var match = function match(pattern) {
                return typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
            };
            var isMyAttrChaned = false;
            if (typeof ev.name === 'string') {
                isMyAttrChaned = ev.name == myAttrName;
                if (isMyAttrChaned && this.props.index >= 0) {
                    isMyAttrChaned = this.props.index == ev.index;
                }
            } else {
                isMyAttrChaned = ev.name.some(match);
            }
            if (isMyAttrChaned) {
                var self = this;
                this.setState(function (nowState) {
                    var newValue = self.getAttrNowValue();
                    if (self.ddc_ref && self.ddc_ref.current) {
                        self.ddc_ref.current.setValue(newValue);
                    }
                    return { value: newValue };
                });
            }
        }
    }, {
        key: 'doSetAttribute',
        value: function doSetAttribute(newValue) {
            this.props.targetobj.setAttribute(this.props.targetattr.name, newValue, this.props.index);
        }
    }, {
        key: 'itemChangedHandler',
        value: function itemChangedHandler(newItem) {
            this.doSetAttribute(newItem);
        }
    }, {
        key: 'renderStyleAttrEditor',
        value: function renderStyleAttrEditor(nowVal, theAttr, attrName, inputID) {
            var nameDDCValue = ReplaceIfNull(nowVal.name, '');
            var valueElem = null;
            var setting = StyleAttrSetting[nameDDCValue];
            if (setting != null) {
                var value = ReplaceIfNull(nowVal.value, setting.def);
                if (setting.options_arr) {
                    valueElem = React.createElement(DropDownControl, { options_arr: setting.options_arr, value: value, itemChanged: this.styleValueDDCChanged });
                } else {
                    var inputType = 'text';
                    switch (setting.type) {
                        case ValueType.Boolean:
                            inputType = 'checkbox';
                            break;
                    }

                    valueElem = React.createElement('input', { type: inputType, className: 'form-control', checked: value, value: value, onChange: this.styleValueInputChanged });
                }
            }
            this.styleSetting = setting;
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement(DropDownControl, { options_arr: AttrNames.StyleAttrNames.values_arr, value: nameDDCValue, itemChanged: this.styleNameDDCChanged }),
                valueElem
            );
        }
    }, {
        key: 'styleValueInputChanged',
        value: function styleValueInputChanged(ev) {
            if (this.styleSetting == null) {
                return;
            }
            var inputElem = ev.target;
            var inputVal = null;
            switch (this.styleSetting.type) {
                case ValueType.Boolean:
                    inputVal = inputElem.checked;
                    break;
                default:
                    inputVal = inputElem.value;
            }
            var nowVal = this.state.value;

            if (nowVal.value != inputVal) {
                nowVal.value = inputVal;
                this.doSetAttribute(nowVal);
            }
        }
    }, {
        key: 'styleNameDDCChanged',
        value: function styleNameDDCChanged(newName) {
            var nowVal = this.state.value;
            nowVal.name = newName;
            var setting = StyleAttrSetting[newName];
            if (setting != null) {
                nowVal.value = setting.def;
            }
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'styleValueDDCChanged',
        value: function styleValueDDCChanged(newVal) {
            var nowVal = this.state.value;
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'UCENameChanged',
        value: function UCENameChanged(ev) {
            var nowVal = this.state.value;
            var newName = ev.target.value; //.trim();
            if (newName != nowVal.name) {
                nowVal.name = newName;
                this.doSetAttribute(nowVal);
            }
        }
    }, {
        key: 'UCEParamsChanged',
        value: function UCEParamsChanged(ev) {
            var nowVal = this.state.value;
            var newParams = ev.target.value; //.trim();
            if (newParams != nowVal.params) {
                nowVal.params = newParams;
                this.doSetAttribute(nowVal);
            }
        }
    }, {
        key: 'renderUserControlEventAttrEditor',
        value: function renderUserControlEventAttrEditor(nowVal, theAttr, attrName, inputID) {
            var name = ReplaceIfNull(nowVal.name, '');
            var params = ReplaceIfNull(nowVal.params, '');
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement(
                    'div',
                    { className: 'input-group mb-3' },
                    React.createElement(
                        'div',
                        { className: 'input-group-prepend' },
                        React.createElement(
                            'span',
                            { className: 'input-group-text', id: 'basic-addon1' },
                            '\u540D\u79F0'
                        )
                    ),
                    React.createElement('input', { onChange: this.UCENameChanged, type: 'text', className: 'form-control', value: name, placeholder: '\u65B9\u6CD5\u540D' })
                ),
                React.createElement(
                    'div',
                    { className: 'input-group mb-3' },
                    React.createElement(
                        'div',
                        { className: 'input-group-prepend' },
                        React.createElement(
                            'span',
                            { className: 'input-group-text', id: 'basic-addon1' },
                            '\u53C2\u6570'
                        )
                    ),
                    React.createElement('input', { onChange: this.UCEParamsChanged, type: 'text', className: 'form-control', value: params, placeholder: ';\u5206\u5272\u53C2\u6570\u540D' })
                )
            );
        }
    }, {
        key: 'NAS_nameChanged',
        value: function NAS_nameChanged(ev) {
            var nowVal = this.state.value;
            var newName = ev.target.value; //.trim();
            if (newName != nowVal.name) {
                nowVal.name = newName;
                this.doSetAttribute(nowVal);
            }
        }
    }, {
        key: 'NAS_nameddcChanged',
        value: function NAS_nameddcChanged(newVal) {
            var nowVal = this.state.value;
            nowVal.name = newVal;
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'renderNameAndScriptAttrEditor',
        value: function renderNameAndScriptAttrEditor(nowVal, theAttr, attrName, inputID) {
            var project = this.props.targetobj.project;
            var name = ReplaceIfNull(nowVal.name, '');
            var funName = this.props.targetobj.id + '_' + attrName;
            var jsBP = project.scriptMaster.getBPByName(funName);
            var options_arr = theAttr.options_arr;
            var nameCtl = null;
            if (options_arr == null) {
                nameCtl = React.createElement('input', { onChange: this.NAS_nameChanged, type: 'text', className: 'form-control flex-grow-1 flex-shrink-1', value: name });
            } else {
                var useOptioins_arr = options_arr;
                if (typeof options_arr === 'string') {
                    useOptioins_arr = this.props.targetobj[options_arr];
                    if (useOptioins_arr == null) {
                        console.error('没有找到:' + options_arr);
                    }
                }
                nameCtl = React.createElement(DropDownControl, { options_arr: useOptioins_arr, value: name, itemChanged: this.NAS_nameddcChanged });
            }

            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                nameCtl,
                React.createElement(
                    'div',
                    { className: 'btn-group' },
                    React.createElement(
                        'span',
                        { onClick: this.clickModifyScriptBtnHandler, className: 'btn btn-dark flex-grow-1 flex-shrink-1' },
                        jsBP ? '编辑' : '创建'
                    ),
                    jsBP ? React.createElement('span', { onClick: this.clickTrshScriptBtnHandler, className: 'btn btn-danger flex-grow-0 flex-shrink-0 fa fa-trash' }) : null
                )
            );
        }
    }, {
        key: 'UCAttrHookParamChanged',
        value: function UCAttrHookParamChanged(ev) {
            var nowVal = this.state.value;
            nowVal.params = ev.target.value; //.trim();
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'renderUserControlAttrHookEditor',
        value: function renderUserControlAttrHookEditor(nowVal, theAttr, attrName, inputID) {
            var project = this.props.targetobj.project;
            var params = ReplaceIfNull(nowVal.params, '');
            var funName = this.props.targetobj.id + '_' + attrName;
            var jsBP = project.scriptMaster.getBPByName(funName);

            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement('input', { onChange: this.UCAttrHookParamChanged, type: 'text', className: 'form-control flex-grow-1 flex-shrink-1', value: params, placeholder: ';\u5206\u5272\u5C5E\u6027\u540D' }),
                React.createElement(
                    'span',
                    { onClick: this.clickModifyScriptBtnHandler, className: 'btn btn-dark flex-grow-1 flex-shrink-1' },
                    jsBP ? '编辑' : '创建'
                )
            );
        }
    }, {
        key: 'renderUserControlAttrCheckerEditor',
        value: function renderUserControlAttrCheckerEditor(nowVal, theAttr, attrName, inputID) {
            var project = this.props.targetobj.project;
            var params = ReplaceIfNull(nowVal.params, '');
            var funName = this.props.targetobj.id + '_' + attrName;
            var jsBP = project.scriptMaster.getBPByName(funName);

            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement('input', { onChange: this.UCAttrHookParamChanged, type: 'text', className: 'form-control flex-grow-1 flex-shrink-1', value: params, placeholder: ';\u5206\u5272\u5C5E\u6027\u540D' }),
                React.createElement(
                    'span',
                    { onClick: this.clickModifyScriptBtnHandler, className: 'btn btn-dark flex-grow-1 flex-shrink-1' },
                    jsBP ? '编辑' : '创建'
                )
            );
        }
    }, {
        key: 'CusFunNameChanged',
        value: function CusFunNameChanged(ev) {
            this.doSetAttribute(ev.target.value);
        }
    }, {
        key: 'renderCustomFunctonAttrEditor',
        value: function renderCustomFunctonAttrEditor(nowVal, theAttr, attrName) {
            var project = this.props.targetobj.project;
            var funName = this.props.targetobj.id + '_' + attrName;
            var jsBP = project.scriptMaster.getBPByName(funName);
            return React.createElement(
                'div',
                { className: 'd-flex w-100 h-100 align-items-center' },
                React.createElement(
                    'div',
                    { className: 'input-group mb-3' },
                    React.createElement('input', { onChange: this.CusFunNameChanged, type: 'text', className: 'form-control', value: nowVal, placeholder: '\u65B9\u6CD5\u540D' }),
                    React.createElement(
                        'div',
                        { className: 'input-group-append' },
                        React.createElement(
                            'span',
                            { onClick: this.clickModifyScriptBtnHandler, className: 'btn btn-dark flex-grow-1' },
                            jsBP ? '编辑' : '创建'
                        )
                    )
                )
            );
        }
    }, {
        key: 'clickjsIconHandler',
        value: function clickjsIconHandler(ev) {
            var nowValParseRet = parseObj_CtlPropJsBind(this.state.value);
            var newVal = '';
            if (nowValParseRet.isScript) {
                newVal = nowValParseRet.oldtext == null ? '' : nowValParseRet.oldtext;
            } else {
                newVal = makeObj_CtlPropJsBind(this.props.targetobj.id, this.props.targetattr.name, 'get', nowValParseRet.string);
            }
            this.doSetAttribute(newVal);
        }
    }, {
        key: 'clickModifyJSBtnHandler',
        value: function clickModifyJSBtnHandler(ev) {
            var project = this.props.targetobj.project;
            if (project == null) {
                return;
            }
            var nowValParseRet = parseObj_CtlPropJsBind(this.state.value, project.scriptMaster);
            if (!nowValParseRet.isScript) {
                return;
            }
            var targetBP = nowValParseRet.jsBp;
            if (targetBP == null) {
                var theAttr = this.props.targetattr;
                targetBP = project.scriptMaster.createBP(nowValParseRet.funName, this.props.targetattr.scriptSetting.type, theAttr.scriptSetting.group);
                targetBP.ctlID = this.props.targetobj.id;
                this.setState({
                    magicObj: {}
                });
            }
            project.designer.editScriptBlueprint(targetBP);
        }
    }, {
        key: 'clickModifyScriptBtnHandler',
        value: function clickModifyScriptBtnHandler(ev) {
            var project = this.props.targetobj.project;
            if (project == null) {
                return;
            }
            var theAttr = this.props.targetattr;
            var funName = this.props.targetobj.id + '_' + this.getRealAttrName();
            var targetBP = project.scriptMaster.getBPByName(funName);
            if (targetBP == null) {
                var jsGroup = null;
                var fixParams_arr = null;
                if (theAttr.scriptSetting != null) {
                    jsGroup = theAttr.scriptSetting.group;
                    fixParams_arr = theAttr.scriptSetting.fixParams_arr;
                } else if (theAttr.valueType == ValueType.Event || theAttr.valueType == ValueType.AttrHook) {
                    jsGroup = EJsBluePrintFunGroup.CtlEvent;
                } else if (theAttr.valueType == ValueType.CustomFunction) {
                    jsGroup = EJsBluePrintFunGroup.CtlFun;
                } else if (theAttr.valueType == ValueType.AttrChecker) {
                    jsGroup = EJsBluePrintFunGroup.CtlAttr;
                }

                if (jsGroup == null) {
                    console.error("bad jsgroup!");
                }
                targetBP = project.scriptMaster.createBP(funName, FunType_Client, jsGroup);
                targetBP.ctlID = this.props.targetobj.id;
                targetBP.eventName = theAttr.name;
                if (this.props.targetobj.scriptCreated) {
                    this.props.targetobj.scriptCreated(theAttr.name, targetBP);
                }
                if (fixParams_arr) {
                    targetBP.setFixParam(fixParams_arr);
                }
                this.setState({
                    magicObj: {}
                });
            }
            project.designer.editScriptBlueprint(targetBP);
        }
    }, {
        key: 'clickTrshScriptBtnHandler',
        value: function clickTrshScriptBtnHandler(ev) {
            var theAttr = this.props.targetattr;
            var funName = this.props.targetobj.id + '_' + this.getRealAttrName();
            var project = this.props.targetobj.project;
            var jsBP = project.scriptMaster.getBPByName(funName);
            if (jsBP != null) {
                gTipWindow.popAlert(makeAlertData('警告', '确定要删除这个脚本:' + jsBP.name, this.clickDeleteJSTipCallback, [makeAlertBtnData('确定', 'ok'), makeAlertBtnData('取消', 'cancel')], jsBP));
            }
        }
    }, {
        key: 'clickDeleteJSTipCallback',
        value: function clickDeleteJSTipCallback(key, jsBP) {
            if (key == 'ok') {
                jsBP.master.deleteBP(jsBP);
                this.setState({
                    magicObj: {}
                });
            }
        }
    }, {
        key: 'renderPureScriptAttrEditor',
        value: function renderPureScriptAttrEditor(nowVal, theAttr, attrName, inputID) {
            var project = this.props.targetobj.project;
            var funName = this.props.targetobj.id + '_' + attrName;
            var jsBP = project.scriptMaster.getBPByName(funName);
            var trushIconElem = jsBP == null ? null : React.createElement(
                'span',
                { onClick: this.clickTrshScriptBtnHandler, className: 'fa-stack cursor-pointer text-danger' },
                React.createElement('i', { className: 'fa fa-trash fa-stack-1x' }),
                React.createElement('i', { className: 'fa fa-square-o fa-stack-2x' })
            );
            return React.createElement(
                'div',
                { className: 'd-flex w-100 h-100 align-items-center' },
                React.createElement(
                    'span',
                    { onClick: this.clickModifyScriptBtnHandler, className: 'btn btn-dark flex-grow-1' },
                    jsBP ? '编辑' : '创建'
                ),
                trushIconElem
            );
        }
    }, {
        key: 'clickCusdatasourcebtn',
        value: function clickCusdatasourcebtn() {
            var theBP = this.getAttrNowValue(true);
            if (theBP) {
                var project = this.props.targetobj.project;
                project.designer.editSqlBlueprint(theBP);
            }
        }
    }, {
        key: 'renderCustomDataSource',
        value: function renderCustomDataSource(nowVal, theAttr, attrName, inputID) {
            return React.createElement(
                'button',
                { type: 'button', className: 'btn btn-dark w-100', onClick: this.clickCusdatasourcebtn },
                '\u5B9A\u5236\u6570\u636E\u6E90'
            );
        }
    }, {
        key: 'clickListFormContent',
        value: function clickListFormContent() {
            var project = this.props.targetobj.project;
            project.designer.editListFormContent(this.props.targetobj);
        }
    }, {
        key: 'clickEditKernelContent',
        value: function clickEditKernelContent() {
            var project = this.props.targetobj.project;
            project.designer.editKernelContent(this.props.targetobj.getContentKernel());
        }
    }, {
        key: 'renderListFormContent',
        value: function renderListFormContent(nowVal, theAttr, attrName, inputID) {
            return React.createElement(
                'button',
                { type: 'button', className: 'btn btn-dark w-100', onClick: this.clickListFormContent },
                '\u5B9A\u5236\u5217\u8868\u6570\u636E'
            );
        }
    }, {
        key: 'renderEditKernelContent',
        value: function renderEditKernelContent(nowVal, theAttr, attrName, inputID) {
            return React.createElement(
                'button',
                { type: 'button', className: 'btn btn-dark w-100', onClick: this.clickEditKernelContent },
                '\u7F16\u8F91\u5185\u5BB9'
            );
        }
    }, {
        key: 'rednerEditor',
        value: function rednerEditor(theAttr, attrName, inputID) {
            var nowVal = this.state.value;
            if (theAttr.valueType == ValueType.Event || theAttr.valueType == ValueType.Script) {
                return this.renderPureScriptAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.StyleValues) {
                return this.renderStyleAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.UserControlEvent) {
                return this.renderUserControlEventAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.NameAndScript) {
                return this.renderNameAndScriptAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.AttrHook) {
                return this.renderUserControlAttrHookEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.AttrChecker) {
                return this.renderUserControlAttrCheckerEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.CustomFunction) {
                return this.renderCustomFunctonAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.CustomDataSource) {
                return this.renderCustomDataSource(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.ListFormContent) {
                return this.renderListFormContent(nowVal, theAttr, attrName, inputID);
            }
            if (theAttr.valueType == ValueType.ModifyContent) {
                return this.renderEditKernelContent(nowVal, theAttr, attrName, inputID);
            }
            var attrEditable = ReplaceIfNull(this.props.targetobj[attrName + '_editable'], theAttr.editable);
            if (!attrEditable) {
                switch (theAttr.valueType) {
                    case ValueType.Boolean:
                        return React.createElement('input', { autoComplete: 'off', type: 'checkbox', readOnly: 'readonly', className: 'form-control', id: inputID, checked: nowVal, value: nowVal });
                    default:
                        return React.createElement(
                            'div',
                            { className: 'form-control-plaintext text-light', id: inputID },
                            nowVal.toString()
                        );
                }
            }
            var jsIconElem = null;
            var project = this.props.targetobj.project;
            var scriptable = theAttr.scriptSetting && theAttr.scriptSetting.scriptable;
            if (scriptable && project) {
                // 可脚本化
                var parseRet = parseObj_CtlPropJsBind(nowVal, project.scriptMaster);
                jsIconElem = React.createElement(
                    'span',
                    { onClick: this.clickjsIconHandler, className: 'fa-stack cursor-pointer text-' + (parseRet.isScript ? 'info' : 'light') },
                    React.createElement('i', { className: 'fa fa-plug fa-stack-1x' }),
                    React.createElement('i', { className: 'fa fa-square-o fa-stack-2x' })
                );
                if (parseRet.isScript) {
                    return React.createElement(
                        'div',
                        { className: 'd-flex w-100 h-100 align-items-center' },
                        React.createElement(
                            'span',
                            { onClick: this.clickModifyJSBtnHandler, className: 'btn btn-dark flex-grow-1' },
                            parseRet.jsBp ? '编辑' : '创建'
                        ),
                        jsIconElem
                    );
                }
            }
            if (theAttr.options_arr != null) {
                var dropdownSetting = theAttr.dropdownSetting == null ? {} : theAttr.dropdownSetting;
                var useOptioins_arr = theAttr.options_arr;
                if (dropdownSetting.pullDataFun != null) {
                    var pullDataFun = dropdownSetting.pullDataFun;
                    var nowTarget = this.props.targetobj;
                    useOptioins_arr = function useOptioins_arr() {
                        return pullDataFun(nowTarget);
                    };
                }
                if (typeof theAttr.options_arr === 'string') {
                    useOptioins_arr = this.props.targetobj[theAttr.options_arr];
                    if (useOptioins_arr == null) {
                        console.error('没有找到:' + theAttr.options_arr);
                    }
                }

                if (theAttr.valueType == ValueType.DataSource) {
                    if (nowVal && nowVal.loaded == false) {
                        return React.createElement(
                            'div',
                            { className: 'text-light' },
                            '\u52A0\u8F7D\u4E2D'
                        );
                    }
                }
                var ddc = React.createElement(DropDownControl, { ref: this.ddc_ref, options_arr: useOptioins_arr, value: nowVal, itemChanged: this.itemChangedHandler, textAttrName: dropdownSetting.text, valueAttrName: dropdownSetting.value, editable: dropdownSetting.editable });
                if (jsIconElem == null) {
                    return ddc;
                }
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                        ddc
                    ),
                    jsIconElem
                );
            }

            var inputType = 'text';
            switch (theAttr.valueType) {
                case ValueType.Boolean:
                    inputType = 'checkbox';
                    break;
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 align-items-center' },
                React.createElement('input', { autoComplete: 'off', type: inputType, className: 'form-control', id: inputID, checked: this.state.value, value: this.state.value, onChange: this.editorChanged, attrname: attrName }),
                jsIconElem
            );
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler(ev) {
            var newCount = this.props.targetobj.deleteAttrArrayItem(this.props.targetattr.name, this.getRealAttrName());
            if (this.props.onAttrArrayChanged) {
                this.props.onAttrArrayChanged(this.props.targetattr.name, newCount);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (this.state.targetobj != this.props.targetobj) {
                var self = this;
                self.unlistenTarget(this.state.targetobj);
                setTimeout(function () {
                    self.setState({
                        targetobj: self.props.targetobj,
                        value: self.getAttrNowValue()
                    });
                    self.listenTarget(_this2.props.targetobj);
                }, 1);
                return null;
            }
            var theAttr = this.props.targetattr;
            var attrName = this.getRealAttrName();
            var label = this.getRealAttrLabel();
            var inputID = this.getRealAttrInputID();
            var deleteElem = this.props.index >= 0 ? React.createElement(
                'div',
                { onClick: this.clickTrashHandler, className: 'btn btn-dark flex-grow-0 flex-shrink-0' },
                React.createElement('i', { className: 'fa fa-trash text-danger' })
            ) : null;
            return React.createElement(
                'div',
                { key: attrName, className: 'bg-dark d-flex align-items-center flex-grow-0 flex-shrink-0' },
                React.createElement(
                    'label',
                    { htmlFor: inputID, className: 'col-form-label text-light flex-grow-0 flex-shrink-0 attrEditorLabel' },
                    label
                ),
                React.createElement(
                    'div',
                    { className: 'p-1 border-left border-secondary attrEditorContent flex-grow-1 flex-shrink-1', hadtrash: deleteElem ? 1 : null },
                    this.rednerEditor(theAttr, attrName, inputID)
                ),
                deleteElem
            );
        }
    }, {
        key: 'editorChanged',
        value: function editorChanged(ev) {
            var editorElem = ev.target;
            var newVal = null;
            var theAttr = this.props.targetattr;
            if (editorElem.tagName.toUpperCase() === 'INPUT') {
                newVal = editorElem.value;
                switch (theAttr.valueType) {
                    case ValueType.Boolean:
                        newVal = editorElem.checked;
                        break;
                    default:
                        newVal = editorElem.value;
                }
            }
            this.doSetAttribute(newVal);
        }
    }]);

    return AttributeEditor;
}(React.PureComponent);

var AttributeGroup = function (_React$PureComponent2) {
    _inherits(AttributeGroup, _React$PureComponent2);

    function AttributeGroup(props) {
        _classCallCheck(this, AttributeGroup);

        var _this3 = _possibleConstructorReturn(this, (AttributeGroup.__proto__ || Object.getPrototypeOf(AttributeGroup)).call(this, props));

        autoBind(_this3);

        var initState = {
            target: _this3.props.target
        };
        _this3.state = initState;
        return _this3;
    }

    _createClass(AttributeGroup, [{
        key: 'clickAddBtnHandler',
        value: function clickAddBtnHandler(ev) {
            var attrName = ev.target.getAttribute('attrname');
            if (attrName == null) {
                attrName = ev.target.parentNode.getAttribute('attrname');
                if (attrName == null) return;
            }

            var newCount = this.state.target.growAttrArray(attrName);
            this.attrArrayChanged(attrName, newCount);
        }
    }, {
        key: 'groupChangedhandler',
        value: function groupChangedhandler(ev) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.listenGroup(this.props.attrGroup);
        }
    }, {
        key: 'listenGroup',
        value: function listenGroup(group) {
            this.listeningGroup = group;
            if (group == null) {
                return;
            }
            group.on('changed', this.groupChangedhandler);
        }
    }, {
        key: 'unlistenGroup',
        value: function unlistenGroup(group) {
            this.listeningGroup = null;
            if (targroupget == null) {
                return;
            }
            group.off('changed', this.groupChangedhandler);
        }
    }, {
        key: 'attrArrayChanged',
        value: function attrArrayChanged(attrName, newCount) {
            var newState = {};
            newState[attrName + 'count'] = newCount;
            this.setState(newState);
        }
    }, {
        key: 'renderAttribute',
        value: function renderAttribute(attr) {
            var target = this.state.target;
            if (attr.visible) {
                if (target[attr.name + '_visible'] == false) {
                    return null;
                }
            } else if (target[attr.name + '_visible'] != true) {
                return null;
            }
            if (attr.isArray) {
                var rlt_arr = [];
                var attrArrayItem_arr = target.getAttrArrayList(attr.name);
                for (var i = 0; i < attrArrayItem_arr.length; ++i) {
                    var attrArrayItem = attrArrayItem_arr[i];
                    rlt_arr.push(React.createElement(AttributeEditor, { key: attrArrayItem.name, targetattr: attr, targetobj: target, index: attrArrayItem.index, onAttrArrayChanged: this.attrArrayChanged }));
                }
                rlt_arr.push(React.createElement(
                    'button',
                    { key: 'addBtn', attrname: attr.name, onClick: this.clickAddBtnHandler, type: 'button', className: 'btn btn-dark' },
                    React.createElement('span', { className: 'icon icon-plus' }),
                    attr.label
                ));
                return rlt_arr;
            }
            return React.createElement(AttributeEditor, { key: attr.name, targetattr: attr, targetobj: target });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var self = this;
            var attrGroup = this.props.attrGroup;
            if (this.state.target != this.props.target) {
                var newState = {
                    target: this.props.target
                };
                attrGroup.attrs_arr.map(function (attr) {
                    if (attr.isArray) {
                        var attrArrayItem_arr = _this4.props.target.getAttrArrayList(attr.name);
                        newState[attr.name + 'count'] = attrArrayItem_arr.length;
                    }
                });

                setTimeout(function () {
                    self.setState(newState);
                }, 1);
                return null;
            }
            var projectName = this.props.projectName;
            var attrGroupIndex = this.props.attrGroupIndex;
            if (this.state.target[attrGroup.label + '_visible'] == false) {
                return null;
            }
            if (this.listeningGroup != attrGroup) {
                this.listenGroup(attrGroup);
            }
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'button',
                    { type: 'button', 'data-toggle': 'collapse', 'data-target': "#attrGroup" + projectName + attrGroup.label, className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' + (attrGroupIndex >= 0 ? '' : ' collapsed'), style: { borderRadius: '0em', height: '2.5em' } },
                    attrGroup.label
                ),
                React.createElement(
                    'div',
                    { id: "attrGroup" + projectName + attrGroup.label, className: "list-group flex-grow-0 flex-shrink-0 collapse" + (attrGroupIndex >= 0 ? ' show' : '') },
                    attrGroup.attrs_arr.map(function (attr) {
                        return _this4.renderAttribute(attr);
                    })
                )
            );
        }
    }]);

    return AttributeGroup;
}(React.PureComponent);