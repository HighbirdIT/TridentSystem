'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_LabelKernelAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('内容', 'text', ValueType.String)])]
};

var M_LabelKernel_Prefix = 'M_Label';
var M_LabelKernel_Type = 'M_Label';

var M_LabelKernel = function (_ControlKernelBase) {
    _inherits(M_LabelKernel, _ControlKernelBase);

    function M_LabelKernel(initData, project) {
        _classCallCheck(this, M_LabelKernel);

        var _this = _possibleConstructorReturn(this, (M_LabelKernel.__proto__ || Object.getPrototypeOf(M_LabelKernel)).call(this, extractPropsFromObj(initData, [{ name: 'name', default: project.genControlName(M_LabelKernel_Prefix) }, { name: 'text', default: '标签内容' }]), project, '标签'));

        var self = _this;
        autoBind(self);

        _this.attrbuteGroups = M_LabelKernelAttrsSetting.groups_arr;
        return _this;
    }

    _createClass(M_LabelKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(M_Label, { key: this.name, ctlKernel: this, onClick: this.clickHandler });
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
            text: _this2.props.ctlKernel.text
        };

        autoBind(_this2);
        M_ControlBase(_this2, ['text']);
        return _this2;
    }

    _createClass(M_Label, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            this.setState({
                text: this.props.ctlKernel.text
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var className = 'flex-grow-0 flex-shrink-0';
            if (this.props.ctlKernel.__placing) {
                className += ' M_placingCtl';
                return React.createElement(
                    'div',
                    { className: className, ref: this.rootElemRef },
                    '\u6807\u7B7E\u5185\u5BB9'
                );
            }
            className += ' M_Label border hb-control';
            return React.createElement(
                'div',
                { className: className, onClick: this.props.onClick, ctlid: this.props.ctlKernel.name, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                this.state.text
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
    reactClass: M_Label
}, '基础');