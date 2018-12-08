'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ContainerKernelAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr)])]
};

var M_ContainerKernel = function (_ContainerKernelBase) {
    _inherits(M_ContainerKernel, _ContainerKernelBase);

    function M_ContainerKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_ContainerKernel);

        var _this = _possibleConstructorReturn(this, (M_ContainerKernel.__proto__ || Object.getPrototypeOf(M_ContainerKernel)).call(this, initData, M_ContainerKernel_Type, 'Flex容器', M_ContainerKernelAttrsSetting.groups_arr.concat(), parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_ContainerKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(M_Container, { key: this.id, ctlKernel: this, onClick: this.clickHandler });
        }
    }]);

    return M_ContainerKernel;
}(ContainerKernelBase);

var M_Container = function (_React$PureComponent) {
    _inherits(M_Container, _React$PureComponent);

    function M_Container(props) {
        _classCallCheck(this, M_Container);

        var _this2 = _possibleConstructorReturn(this, (M_Container.__proto__ || Object.getPrototypeOf(M_Container)).call(this, props));

        autoBind(_this2);

        var ctlKernel = _this2.props.ctlKernel;
        var inintState = M_ControlBase(_this2, LayoutAttrNames_arr.concat([AttrNames.Orientation, AttrNames.Chidlren], inintState));
        M_ContainerBase(_this2);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;

        _this2.state = inintState;
        return _this2;
    }

    _createClass(M_Container, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            var childrenVal = this.state.children;
            var ctlKernel = this.props.ctlKernel;
            if (changedAttrName == AttrNames.Chidlren) {
                childrenVal = ctlKernel.children.concat();
            }
            this.setState({
                orientation: ctlKernel.getAttribute(AttrNames.Orientation),
                children: childrenVal
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var ctlKernel = this.props.ctlKernel;
            var className = 'd-flex ';
            className += ctlKernel.getRootDivClass();
            className += ' flex-grow-' + (this.state[AttrNames.FlexGrow] != false ? '1' : '0');
            className += ' flex-shrink-' + (this.state[AttrNames.FlexShrink] != false ? '1' : '0');
            var rootStyle = {};
            if (this.state.width) {
                rootStyle.width = this.state.width + (!isNaN(this.state.width) ? 'px' : '');
            }
            if (this.state.height) {
                rootStyle.height = this.state.height + (!isNaN(this.state.height) ? 'px' : '');
            }

            if (this.props.ctlKernel.__placing) {
                className += ' M_Container_Empty M_placingCtl' + (this.state.orientation == Orientation_V ? ' flex-column' : '');
                return React.createElement('div', { className: className, style: rootStyle, ref: this.rootElemRef });
            }
            className += ' M_Container border hb-control' + (this.state.orientation == Orientation_V ? ' flex-column' : '') + (this.props.ctlKernel.children.length == 0 ? ' M_Container_Empty' : '');

            return React.createElement(
                'div',
                { className: className, style: rootStyle, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                this.props.ctlKernel.children.length == 0 ? this.props.ctlKernel.id : this.props.ctlKernel.children.map(function (childKernel) {
                    return childKernel.renderSelf();
                })
            );
        }
    }]);

    return M_Container;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: 'Flex容器',
    type: M_ContainerKernel_Type,
    namePrefix: M_ContainerKernel_Prefix,
    kernelClass: M_ContainerKernel,
    reactClass: M_Container
}, '布局');