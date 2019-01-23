'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_LabelKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [genTextFiledAttribute()])]);

var M_LabelKernel = function (_ControlKernelBase) {
    _inherits(M_LabelKernel, _ControlKernelBase);

    function M_LabelKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_LabelKernel);

        var _this = _possibleConstructorReturn(this, (M_LabelKernel.__proto__ || Object.getPrototypeOf(M_LabelKernel)).call(this, initData, M_LabelKernel_Type, '标签', M_LabelKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_LabelKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(M_Label, { key: this.id, ctlKernel: this, onClick: this.clickHandler });
        }
    }]);

    return M_LabelKernel;
}(ControlKernelBase);

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
                showText
            );
        }
    }]);

    return M_Label;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '标签',
    type: M_LabelKernel_Type,
    namePrefix: M_LabelKernel_Prefix,
    kernelClass: M_LabelKernel,
    reactClass: M_Label,
    canbeLabeled: true
}, '基础');