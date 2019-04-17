'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_CheckBoxKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [genTextFiledAttribute(), new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null, true, {
    scriptable: true,
    type: FunType_Client,
    group: EJsBluePrintFunGroup.CtlAttr
}), new CAttribute('可否编辑', AttrNames.Editeable, ValueType.Boolean, true), genIsdisplayAttribute()])]);

var M_CheckBoxKernel = function (_ControlKernelBase) {
    _inherits(M_CheckBoxKernel, _ControlKernelBase);

    function M_CheckBoxKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_CheckBoxKernel);

        var _this = _possibleConstructorReturn(this, (M_CheckBoxKernel.__proto__ || Object.getPrototypeOf(M_CheckBoxKernel)).call(this, initData, M_CheckBoxKernel_Type, '文本框', M_CheckBoxKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_CheckBoxKernel, [{
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_CheckBox, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_CheckBoxKernel.prototype.__proto__ || Object.getPrototypeOf(M_CheckBoxKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
        }
    }]);

    return M_CheckBoxKernel;
}(ControlKernelBase);

var M_CheckBoxKernel_api = new ControlAPIClass(M_CheckBoxKernel_Type);
M_CheckBoxKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_CheckBoxKernelAttrsSetting), 'value', true));
M_CheckBoxKernel_api.pushApi(new ApiItem_propsetter('value'));
g_controlApi_arr.push(M_CheckBoxKernel_api);

var M_CheckBox = function (_React$PureComponent) {
    _inherits(M_CheckBox, _React$PureComponent);

    function M_CheckBox(props) {
        _classCallCheck(this, M_CheckBox);

        var _this2 = _possibleConstructorReturn(this, (M_CheckBox.__proto__ || Object.getPrototypeOf(M_CheckBox)).call(this, props));

        _this2.state = {
            defaultVal: _this2.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: _this2.props.ctlKernel.getAttribute(AttrNames.TextField)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.DefaultValue, AttrNames.TextField]);
        return _this2;
    }

    _createClass(M_CheckBox, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
                defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
                text: this.props.ctlKernel.getAttribute(AttrNames.TextField)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var ctlKernel = this.props.ctlKernel;
            var layoutConfig = ctlKernel.getLayoutConfig();
            if (this.props.ctlKernel.__placing) {
                layoutConfig.addClass('M_placingCtl');
                return React.createElement(
                    'div',
                    { className: layoutConfig.getClassName(), style: layoutConfig.style, ref: this.rootElemRef },
                    '\u6587\u672C\u6846'
                );
            }
            layoutConfig.addClass('M_CheckBox');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            layoutConfig.addClass('w-100');
            var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
            var textParseRet = parseObj_CtlPropJsBind(this.state.text);
            var checked = false;
            var showText = textParseRet.isScript ? '复选框{脚本}' : (IsEmptyString(textParseRet.string) ? '' : '[' + textParseRet.string + ']') + (defaultParseRet.isScript ? '{脚默}' : '');
            if (!defaultParseRet.isScript) {
                if (defaultParseRet.string == '1' || defaultParseRet.string == 'true') {
                    checked = true;
                }
            }
            return React.createElement(
                'span',
                { className: layoutConfig.getClassName(), style: layoutConfig.style, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null, onClick: this.props.onClick },
                React.createElement(
                    'span',
                    { className: 'fa-stack fa-lg' },
                    React.createElement('i', { className: "fa fa-square-o fa-stack-2x" }),
                    checked && React.createElement('i', { className: 'fa fa-stack-1x fa-check text-success' })
                ),
                React.createElement(
                    'span',
                    null,
                    showText
                )
            );
        }
    }]);

    return M_CheckBox;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '复选框',
    type: M_CheckBoxKernel_Type,
    namePrefix: M_CheckBoxKernel_Prefix,
    kernelClass: M_CheckBoxKernel,
    reactClass: M_CheckBox,
    canbeLabeled: true
}, '基础');