'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_LabeledControlKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [genTextFiledAttribute(), new CAttribute('控件类型', AttrNames.EditorType, ValueType.String, M_TextKernel_Type, true, false, DesignerConfig.getMobileCanLabeledControls, { text: 'label', value: 'type' }), genIsdisplayAttribute(), new CAttribute('交互类型', AttrNames.InteractiveType, ValueType.String, EInterActiveType.ReadWrite, true, false, EInterActiveTypes_arr, { text: 'text', value: 'value' }), new CAttribute('交互字段', AttrNames.InteractiveField, ValueType.String, '', true, false, [], {
    pullDataFun: GetCanInteractiveColumns
}), genNullableAttribute(), new CAttribute('列宽设置', AttrNames.ColumnWidth, ValueType.Int, 0)])]);

var M_LabeledControlKernel = function (_ControlKernelBase) {
    _inherits(M_LabeledControlKernel, _ControlKernelBase);

    function M_LabeledControlKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_LabeledControlKernel);

        var _this = _possibleConstructorReturn(this, (M_LabeledControlKernel.__proto__ || Object.getPrototypeOf(M_LabeledControlKernel)).call(this, initData, M_LabeledControlKernel_Type, '操作控件', M_LabeledControlKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);
        _this.staticChild = true;
        _this.newAdded = kernelJson == null;

        _this.__genEditor(createHelper, kernelJson == null ? null : kernelJson.editor);
        return _this;
    }

    _createClass(M_LabeledControlKernel, [{
        key: 'appandChild',
        value: function appandChild(cildKernel) {
            cildKernel.parent = this;
        }
    }, {
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_LabeledControl, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }, {
        key: 'canAppand',
        value: function canAppand() {
            return false;
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_LabeledControlKernel.prototype.__proto__ || Object.getPrototypeOf(M_LabeledControlKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            switch (attrItem.name) {
                case AttrNames.EditorType:
                    this.__genEditor();
                    break;
                case AttrNames.TextField:
                    var labelParseRet = parseObj_CtlPropJsBind(newValue);
                    if (labelParseRet.isScript) {
                        return;
                    }
                    var editorTextField = this.editor.getAttribute(AttrNames.TextField);
                    if (editorTextField == '' || (oldValue ? oldValue : '') == editorTextField) {
                        this.editor.setAttribute(AttrNames.TextField, newValue);
                    }
                    break;
                case AttrNames.Nullable:
                    if (this.editor.hasAttribute(AttrNames.Nullable)) {
                        this.editor.setAttribute(AttrNames.Nullable, newValue);
                    }
                    break;
            }
        }
    }, {
        key: '__genEditor',
        value: function __genEditor(createHelper, editorKernelJson) {
            if (this.editor != null) {
                this.editor.parent = null;
                this.editor.delete(true);
                this.editor = null;
                this.children.length = 0;
            }
            var editorKernelConfig = DesignerConfig.findConfigByType(this.getAttribute(AttrNames.EditorType));
            if (editorKernelConfig != null) {
                this.editor = new editorKernelConfig.kernelClass({}, this, createHelper, editorKernelJson);
                if (createHelper == null) {
                    var editorTextField = this.editor.getAttribute(AttrNames.TextField);
                    if (IsEmptyString(editorTextField)) {
                        this.editor.setAttribute(AttrNames.TextField, this.getAttribute(AttrNames.TextField));
                    }
                }
                var editorNullableAttr = this.editor.findAttributeByName(AttrNames.Nullable);
                if (editorNullableAttr) {
                    this.editor.setAttribute(AttrNames.Nullable, this.getAttribute(AttrNames.Nullable));
                    editorNullableAttr.setVisible(this.editor, false);
                }
                var editorIsDisplayAttr = this.editor.findAttributeByName(AttrNames.Isdisplay);
                if (editorIsDisplayAttr) {
                    editorIsDisplayAttr.setVisible(this.editor, false);
                }
                this.editor.isfixed = true;
                this.children = [this.editor];
            }
        }
    }, {
        key: 'removeChild',
        value: function removeChild() {
            // valid
        }
    }, {
        key: 'getTextValueFieldValue',
        value: function getTextValueFieldValue() {
            var rlt = _get(M_LabeledControlKernel.prototype.__proto__ || Object.getPrototypeOf(M_LabeledControlKernel.prototype), 'getTextValueFieldValue', this).call(this);
            if (this.getAttribute(AttrNames.InteractiveType) == EInterActiveType.ReadWrite) {
                rlt.interact = this.getAttribute(AttrNames.InteractiveField);
            }
            return rlt;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var rlt = _get(M_LabeledControlKernel.prototype.__proto__ || Object.getPrototypeOf(M_LabeledControlKernel.prototype), 'getJson', this).call(this);
            rlt.editor = this.editor == null ? null : this.editor.getJson();
            return rlt;
        }
    }]);

    return M_LabeledControlKernel;
}(ControlKernelBase);

var M_LabeledControl_api = new ControlAPIClass(M_LabeledControlKernel_Type);
M_LabeledControl_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_LabeledControlKernelAttrsSetting), 'label'));

g_controlApi_arr.push(M_LabeledControl_api);

var M_LabeledControl = function (_React$PureComponent) {
    _inherits(M_LabeledControl, _React$PureComponent);

    function M_LabeledControl(props) {
        _classCallCheck(this, M_LabeledControl);

        var _this2 = _possibleConstructorReturn(this, (M_LabeledControl.__proto__ || Object.getPrototypeOf(M_LabeledControl)).call(this, props));

        _this2.state = {
            label: _this2.props.ctlKernel.getAttribute(AttrNames.TextField),
            editor: _this2.props.ctlKernel.editor
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.TextField, AttrNames.EditorType, AttrNames.InteractiveType, AttrNames.Nullable, AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr]);
        return _this2;
    }

    _createClass(M_LabeledControl, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
                label: this.props.ctlKernel.getAttribute(AttrNames.TextField),
                editor: this.props.ctlKernel.editor
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var ctlKernel = this.props.ctlKernel;
            var layoutConfig = ctlKernel.getLayoutConfig();
            var labelParseRet = parseObj_CtlPropJsBind(this.state.label);
            var showLabel = labelParseRet.isScript ? '{脚本}' : IsEmptyString(labelParseRet.string) ? '[未设置]' : labelParseRet.string;
            if (this.props.ctlKernel.__placing) {
                layoutConfig.addClass('M_placingCtl');
                return React.createElement(
                    'div',
                    { className: layoutConfig.getClassName(), style: layoutConfig.style, ref: this.rootElemRef },
                    showLabel
                );
            }
            var editor = ctlKernel.editor;
            layoutConfig.addClass('rowlFameOne');
            layoutConfig.addClass('hb-control');
            var interType = ctlKernel.getAttribute(AttrNames.InteractiveType);
            var interField = ctlKernel.getAttribute(AttrNames.InteractiveField);
            var nullable = ctlKernel.getAttribute(AttrNames.Nullable);
            var interFlag = interType == EInterActiveType.ReadOnly ? React.createElement('i', { className: 'fa fa-long-arrow-down text-info' }) : null;
            var nullableFlag = nullable ? React.createElement('i', { className: 'fa fa-square-o text-info' }) : null;
            var interFieldElem = IsEmptyString(interField) ? null : React.createElement(
                'span',
                { className: 'badge badge-info' },
                interField
            );
            var leftElem = null;
            if (interFieldElem == null) {
                leftElem = React.createElement(
                    'div',
                    { className: 'rowlFameOne_Left' },
                    showLabel,
                    interFlag,
                    nullableFlag
                );
            } else {
                leftElem = React.createElement(
                    'div',
                    { className: 'rowlFameOne_Left' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'd-flex align-items-center' },
                            showLabel,
                            interFlag,
                            nullableFlag
                        ),
                        interFieldElem
                    )
                );
            }
            return React.createElement(
                'div',
                { className: layoutConfig.getClassName(), style: layoutConfig.style, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                leftElem,
                React.createElement(
                    'div',
                    { className: 'rowlFameOne_right' },
                    editor != null && editor.renderSelf(this.props.onClick == ctlKernel.clickHandler ? null : this.props.onClick)
                )
            );
        }
    }]);

    return M_LabeledControl;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '操作控件',
    type: M_LabeledControlKernel_Type,
    namePrefix: M_LabeledControlKernel_Prefix,
    kernelClass: M_LabeledControlKernel,
    reactClass: M_LabeledControl
}, '基础');