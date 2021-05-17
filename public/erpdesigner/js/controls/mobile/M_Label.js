'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_LabelKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [genTextFiledAttribute(), new CAttribute('数据类型', AttrNames.ValueType, ValueType.String, ValueType.String, true, false, JsValueTypes), new CAttribute('小数精度', AttrNames.FloatNum, ValueType.Int, 2, true, false, null, null, false), new CAttribute('输出字数', AttrNames.OutputCharCount, ValueType.Boolean, false), new CAttribute('缩写阈值', 'abbrevlen', ValueType.Int, 0, true, false, null, null, false), genIsdisplayAttribute(), new CAttribute('默认可见', AttrNames.DefaultVisible, ValueType.Boolean, true)]), new CAttributeGroup('事件', [new CAttribute('OnMDown', AttrNames.Event.OnMouseDown, ValueType.Event)])]);

var M_LabelKernel = function (_ControlKernelBase) {
    _inherits(M_LabelKernel, _ControlKernelBase);

    function M_LabelKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_LabelKernel);

        var _this = _possibleConstructorReturn(this, (M_LabelKernel.__proto__ || Object.getPrototypeOf(M_LabelKernel)).call(this, initData, M_LabelKernel_Type, '标签', M_LabelKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var nowvt = _this.getAttribute(AttrNames.ValueType);
        _this[AttrNames.FloatNum + '_visible'] = nowvt == ValueType.Float;
        _this['abbrevlen_visible'] = nowvt == ValueType.String;

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_LabelKernel, [{
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_LabelKernel.prototype.__proto__ || Object.getPrototypeOf(M_LabelKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            if (attrItem.name == AttrNames.ValueType) {
                // 数据类型更改
                var floatNumAttr = this.findAttributeByName(AttrNames.FloatNum);
                floatNumAttr.setVisible(this, newValue == ValueType.Float);

                var abbrevLenAttr = this.findAttributeByName('abbrevlen');
                abbrevLenAttr.setVisible(this, newValue == ValueType.String);
            }
        }
    }, {
        key: 'renderSelf',
        value: function renderSelf(clickHandler, replaceChildClick, designer) {
            return React.createElement(M_Label, { key: this.id, designer: designer, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }]);

    return M_LabelKernel;
}(ControlKernelBase);

var M_LabelKernel_api = new ControlAPIClass(M_LabelKernel_Type);
M_LabelKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_LabelKernelAttrsSetting), 'text'));
M_LabelKernel_api.pushApi(new ApiItem_propsetter('text'));
g_controlApi_arr.push(M_LabelKernel_api);

var M_Label = function (_React$PureComponent) {
    _inherits(M_Label, _React$PureComponent);

    function M_Label(props) {
        _classCallCheck(this, M_Label);

        var _this2 = _possibleConstructorReturn(this, (M_Label.__proto__ || Object.getPrototypeOf(M_Label)).call(this, props));

        _this2.state = {
            text: _this2.props.ctlKernel.getAttribute(AttrNames.TextField)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.TextField, AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr]);
        return _this2;
    }

    _createClass(M_Label, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
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
                    '\u6807\u7B7E\u5185\u5BB9'
                );
            }
            layoutConfig.addClass('M_Label');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            var textParseRet = parseObj_CtlPropJsBind(this.state.text);
            var showText = textParseRet.isScript ? '{脚本}' : IsEmptyString(textParseRet.string) ? '[空标签]' : textParseRet.string;
            return React.createElement(
                'div',
                { className: layoutConfig.getClassName(), style: layoutConfig.style, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                this.renderHandleBar(),
                showText
            );
        }
    }]);

    return M_Label;
}(React.PureComponent);

DesignerConfig.registerControl({
    label: '标签',
    type: M_LabelKernel_Type,
    namePrefix: M_LabelKernel_Prefix,
    kernelClass: M_LabelKernel,
    reactClass: M_Label,
    canbeLabeled: true
}, '基础');