'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ListKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr), new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, null, { text: 'name', value: 'code' })])]);

var M_ListKernel = function (_ContainerKernelBase) {
    _inherits(M_ListKernel, _ContainerKernelBase);

    function M_ListKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_ListKernel);

        var _this = _possibleConstructorReturn(this, (M_ListKernel.__proto__ || Object.getPrototypeOf(M_ListKernel)).call(this, initData, M_ListKernel_Type, '列表', M_ListKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        _this.findAttributeByName(AttrNames.DataSource).options_arr = parentKernel.project.dataMaster.getAllEntities;
        _this.findAttributeByName(AttrNames.ProcessTable).options_arr = g_dataBase.getAllTable;
        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_ListKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(M_List, { key: this.id, ctlKernel: this, onClick: this.clickHandler });
        }
    }]);

    return M_ListKernel;
}(ContainerKernelBase);

var M_List = function (_React$PureComponent) {
    _inherits(M_List, _React$PureComponent);

    function M_List(props) {
        _classCallCheck(this, M_List);

        var _this2 = _possibleConstructorReturn(this, (M_List.__proto__ || Object.getPrototypeOf(M_List)).call(this, props));

        autoBind(_this2);

        var ctlKernel = _this2.props.ctlKernel;
        var inintState = M_ControlBase(_this2, LayoutAttrNames_arr.concat([AttrNames.Orientation, AttrNames.Chidlren], inintState));
        M_ContainerBase(_this2);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;

        _this2.state = inintState;
        return _this2;
    }

    _createClass(M_List, [{
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
            var layoutConfig = ctlKernel.getLayoutConfig();
            layoutConfig.addClass('d-flex');
            layoutConfig.addClass('flex-grow-1');
            layoutConfig.addClass('flex-shrink-1');
            var rootStyle = layoutConfig.style;

            if (this.props.ctlKernel.__placing) {
                layoutConfig.addClass('M_placingCtl');
                layoutConfig.addClass('M_List_Empty');
                return React.createElement('div', { className: layoutConfig.getClassName(), style: rootStyle, ref: this.rootElemRef });
            }
            layoutConfig.addClass('M_List');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            if (this.state.orientation == Orientation_V) {
                layoutConfig.addClass('flex-column');
            }
            if (this.props.ctlKernel.children.length == 0) {
                layoutConfig.addClass('M_List_Empty');
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

    return M_List;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: 'Form',
    type: M_ListKernel_Type,
    namePrefix: M_ListKernel_Prefix,
    kernelClass: M_ListKernel,
    reactClass: M_List
}, '布局');