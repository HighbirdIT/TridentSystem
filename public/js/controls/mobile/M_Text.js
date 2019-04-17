'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_TextKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [genTextFiledAttribute(), new CAttribute('数据类型', AttrNames.ValueType, ValueType.String, ValueType.String, true, false, JsValueTypes), new CAttribute('小数精度', AttrNames.FloatNum, ValueType.Int, 2, true, false, null, null, false), new CAttribute('行类型', AttrNames.LineType, ValueType.String, LineType_Single, true, false, LinteTypes_arr, null, false), new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null, true, {
    scriptable: true,
    type: FunType_Client,
    group: EJsBluePrintFunGroup.CtlAttr
}), new CAttribute('可否编辑', AttrNames.Editeable, ValueType.Boolean, true), genIsdisplayAttribute(), genNullableAttribute(), genValidCheckerAttribute()])]);

var M_TextKernel = function (_ControlKernelBase) {
    _inherits(M_TextKernel, _ControlKernelBase);

    function M_TextKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_TextKernel);

        var _this = _possibleConstructorReturn(this, (M_TextKernel.__proto__ || Object.getPrototypeOf(M_TextKernel)).call(this, initData, M_TextKernel_Type, '文本框', M_TextKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);

        var nowvt = _this.getAttribute(AttrNames.ValueType);
        _this[AttrNames.FloatNum + '_visible'] = nowvt == ValueType.Float;
        _this[AttrNames.LineType + '_visible'] = nowvt == ValueType.String;
        return _this;
    }

    _createClass(M_TextKernel, [{
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_Text, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_TextKernel.prototype.__proto__ || Object.getPrototypeOf(M_TextKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            if (attrItem.name == AttrNames.ValueType) {
                // 数据类型更改
                var floatNumAttr = this.findAttributeByName(AttrNames.FloatNum);
                floatNumAttr.setVisible(this, newValue == ValueType.Float);
                var lineTypeAttr = this.findAttributeByName(AttrNames.LineType);
                lineTypeAttr.setVisible(this, newValue == ValueType.String);
            }
        }
    }]);

    return M_TextKernel;
}(ControlKernelBase);

var M_TextKernel_api = new ControlAPIClass(M_TextKernel_Type);
M_TextKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_TextKernelAttrsSetting), 'value', true));
M_TextKernel_api.pushApi(new ApiItem_propsetter('value'));
g_controlApi_arr.push(M_TextKernel_api);

var M_Text = function (_React$PureComponent) {
    _inherits(M_Text, _React$PureComponent);

    function M_Text(props) {
        _classCallCheck(this, M_Text);

        var _this2 = _possibleConstructorReturn(this, (M_Text.__proto__ || Object.getPrototypeOf(M_Text)).call(this, props));

        _this2.state = {
            defaultVal: _this2.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            ValueType: _this2.props.ctlKernel.getAttribute(AttrNames.ValueType),
            text: _this2.props.ctlKernel.getAttribute(AttrNames.TextField)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.DefaultValue, AttrNames.ValueType, AttrNames.TextField, AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr]);
        return _this2;
    }

    _createClass(M_Text, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
                defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
                ValueType: this.props.ctlKernel.getAttribute(AttrNames.ValueType),
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
            layoutConfig.addClass('M_Text');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            layoutConfig.addClass('w-100');
            var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
            var textParseRet = parseObj_CtlPropJsBind(this.state.text);
            var showText = textParseRet.isScript ? '文本框{脚本}' : '编辑' + (IsEmptyString(textParseRet.string) ? '' : '[' + textParseRet.string + ']') + (defaultParseRet.isScript ? '{脚默}' : '[' + defaultParseRet.string + ']') + "[" + this.state.ValueType + ']';
            return React.createElement('input', { className: layoutConfig.getClassName(), style: layoutConfig.style, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null,
                value: showText,
                readOnly: true
            });
        }
    }]);

    return M_Text;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '文本框',
    type: M_TextKernel_Type,
    namePrefix: M_TextKernel_Prefix,
    kernelClass: M_TextKernel,
    reactClass: M_Text,
    canbeLabeled: true
}, '基础');