'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ContainerKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr)])]);

var M_ContainerKernel = function (_ContainerKernelBase) {
    _inherits(M_ContainerKernel, _ContainerKernelBase);

    function M_ContainerKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_ContainerKernel);

        var _this = _possibleConstructorReturn(this, (M_ContainerKernel.__proto__ || Object.getPrototypeOf(M_ContainerKernel)).call(this, initData, M_ContainerKernel_Type, 'Flex容器', M_ContainerKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_ContainerKernel, [{
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_Container, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
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
        key: 'getDescendantControls',
        value: function getDescendantControls(rlt_arr) {
            this.children.forEach(function (child) {
                switch (child.type) {
                    case M_ContainerKernel_Type:
                        child.getDescendantControls(rlt_arr);
                        break;
                    case M_FormKernel_Type:
                        break;
                    default:
                        rlt_arr.push(child);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var ctlKernel = this.props.ctlKernel;
            var layoutConfig = ctlKernel.getLayoutConfig();
            layoutConfig.addClass('d-flex');
            layoutConfig.addClass('flex-grow-1');
            layoutConfig.addClass('flex-shrink-1');
            var rootStyle = layoutConfig.style;

            if (this.props.ctlKernel.__placing) {
                layoutConfig.addClass('M_Container_Empty');
                layoutConfig.addClass('M_placingCtl');
                return React.createElement('div', { className: layoutConfig.getClassName(), style: rootStyle, ref: this.rootElemRef });
            }
            layoutConfig.addClass('M_Container');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            if (this.state.orientation == Orientation_V) {
                layoutConfig.addClass('flex-column');
            }
            if (this.props.ctlKernel.children.length == 0) {
                layoutConfig.addClass('M_Container_Empty');
            }

            return React.createElement(
                'div',
                { className: layoutConfig.getClassName(), style: rootStyle, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
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
    label: 'DIV',
    type: M_ContainerKernel_Type,
    namePrefix: M_ContainerKernel_Prefix,
    kernelClass: M_ContainerKernel,
    reactClass: M_Container
}, '布局');