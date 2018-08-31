'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ContainerKernelAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('方向', 'orientation', ValueType.String, true, false, Orientation_Options_arr)])]
};

var M_ContainerKernel_Prefix = 'M_C';
var M_ContainerKernel_Type = 'M_ContainerKernel';

var M_ContainerKernel = function (_ContainerKernelBase) {
    _inherits(M_ContainerKernel, _ContainerKernelBase);

    function M_ContainerKernel(initData, project) {
        _classCallCheck(this, M_ContainerKernel);

        var _this = _possibleConstructorReturn(this, (M_ContainerKernel.__proto__ || Object.getPrototypeOf(M_ContainerKernel)).call(this, extractPropsFromObj(initData, [{ name: 'orientation', default: Orientation_H }, { name: 'name', default: project.genControlName(M_ContainerKernel_Prefix) }]), project, 'Flex容器'));

        var self = _this;
        autoBind(self);

        _this.attrbuteGroups = M_ContainerKernelAttrsSetting.groups_arr;
        return _this;
    }

    _createClass(M_ContainerKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(M_Container, { key: this.name, ctlKernel: this, onClick: this.clickHandler });
        }
    }]);

    return M_ContainerKernel;
}(ContainerKernelBase);

var M_Container = function (_React$PureComponent) {
    _inherits(M_Container, _React$PureComponent);

    function M_Container(props) {
        _classCallCheck(this, M_Container);

        var _this2 = _possibleConstructorReturn(this, (M_Container.__proto__ || Object.getPrototypeOf(M_Container)).call(this, props));

        _this2.state = {
            orientation: _this2.props.ctlKernel.orientation,
            children: _this2.props.ctlKernel.children
        };

        autoBind(_this2);
        M_ControlBase(_this2, ['orientation', 'children']);
        M_ContainerBase(_this2);
        return _this2;
    }

    _createClass(M_Container, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            var childrenVal = this.state.children;
            if (changedAttrName == 'children') {
                childrenVal = this.props.ctlKernel.children.concat();
            }
            this.setState({
                orientation: this.props.ctlKernel.orientation,
                children: childrenVal
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var className = 'd-flex flex-grow-1 flex-shrink-1';
            if (this.props.ctlKernel.__placing) {
                className += ' M_Container_Empty M_placingCtl' + (this.state.orientation == Orientation_V ? ' flex-column' : '');
                return React.createElement('div', { className: className, ref: this.rootElemRef });
            }
            className += ' M_Container border hb-control' + (this.state.orientation == Orientation_V ? ' flex-column' : '') + (this.props.ctlKernel.children.length == 0 ? ' M_Container_Empty' : '');

            return React.createElement(
                'div',
                { className: className, onClick: this.props.onClick, ctlid: this.props.ctlKernel.name, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                this.props.ctlKernel.children.length == 0 ? this.props.ctlKernel.name : this.props.ctlKernel.children.map(function (childKernel) {
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