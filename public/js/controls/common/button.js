'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ButtonKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, null, { text: 'name', value: 'code' }), new CAttribute('外观类', AttrNames.ButtonClass, ValueType.String, 'btn-primary', true, false, ButtonClasses_arr)]), new CAttributeGroup('事件', [new CAttribute('OnClick', AttrNames.Event.OnClick, ValueType.Event)])]);

var ButtonKernel = function (_ControlKernelBase) {
    _inherits(ButtonKernel, _ControlKernelBase);

    function ButtonKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, ButtonKernel);

        var _this = _possibleConstructorReturn(this, (ButtonKernel.__proto__ || Object.getPrototypeOf(ButtonKernel)).call(this, initData, ButtonKernel_Type, '按钮', ButtonKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var funName = _this.id + '_' + AttrNames.Event.OnClick;
        var eventBP = _this.project.scriptMaster.getBPByName(funName);
        if (eventBP) {
            eventBP.ctlID = _this.id;
        }
        _this.findAttributeByName(AttrNames.ProcessTable).options_arr = g_dataBase.getAllTable;
        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(ButtonKernel, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return React.createElement(CButton, { key: this.id, ctlKernel: this, onClick: this.clickHandler });
        }
    }, {
        key: 'getLayoutConfig',
        value: function getLayoutConfig() {
            var rlt = _get(ButtonKernel.prototype.__proto__ || Object.getPrototypeOf(ButtonKernel.prototype), 'getLayoutConfig', this).call(this);
            rlt.addClass('btn');
            rlt.addClass(this.getAttribute(AttrNames.ButtonClass));
            return rlt;
        }
    }, {
        key: 'getWantInsertTables',
        value: function getWantInsertTables() {
            var funName = this.id + '_' + AttrNames.Event.OnClick;
            var eventBP = this.project.scriptMaster.getBPByName(funName);
            var rlt = null;
            if (eventBP) {
                var processTableNodes_arr = eventBP.getNodesByTypes([JSNODE_INSERT_TABLE, JSNODE_UPDATE_TABLE], true);
                processTableNodes_arr.forEach(function (node) {
                    if (!IsEmptyString(node.dsCode)) {
                        if (rlt == null) {
                            rlt = [node.dsCode];
                        } else {
                            rlt.push(node.dsCode);
                        }
                    }
                });
            }
            return rlt;
        }
    }]);

    return ButtonKernel;
}(ControlKernelBase);

var CButton = function (_React$PureComponent) {
    _inherits(CButton, _React$PureComponent);

    function CButton(props) {
        _classCallCheck(this, CButton);

        var _this2 = _possibleConstructorReturn(this, (CButton.__proto__ || Object.getPrototypeOf(CButton)).call(this, props));

        _this2.state = {
            label: _this2.props.ctlKernel.getAttribute(AttrNames.Name),
            btnClass: _this2.props.ctlKernel.getAttribute(AttrNames.ButtonClass)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.Name, AttrNames.ButtonClass, AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr]);
        return _this2;
    }

    _createClass(CButton, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
                label: this.props.ctlKernel.getAttribute(AttrNames.Name),
                btnClass: this.props.ctlKernel.getAttribute(AttrNames.ButtonClass)
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
                    '\u6309\u94AE'
                );
            }
            layoutConfig.addClass('hb-control');
            var showText = IsEmptyString(this.state.label) ? '[未命名]' : this.state.label;
            return React.createElement(
                'button',
                { type: 'button', className: layoutConfig.getClassName(), style: layoutConfig.style, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                showText
            );
        }
    }]);

    return CButton;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '按钮',
    type: ButtonKernel_Type,
    namePrefix: ButtonKernel_Prefix,
    kernelClass: ButtonKernel,
    reactClass: CButton,
    canbeLabeled: true
}, '基础');