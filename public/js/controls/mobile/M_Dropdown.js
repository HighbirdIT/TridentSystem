'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_DropdownKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, null, { text: 'name', value: 'code' }), new CAttribute('来源文本字段', AttrNames.FromTextField, ValueType.String, '', true, false, 'getUseDSColumns'), new CAttribute('来源码值字段', AttrNames.FromValueField, ValueType.String, '', true, false, 'getUseDSColumns'), genTextFiledAttribute(), genValueFiledAttribute(), new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null, true, {
    scriptable: true,
    type: FunType_Client,
    group: EJsBluePrintFunGroup.CtlAttr
}), genIsdisplayAttribute(), genNullableAttribute(), genValidCheckerAttribute(), new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true), new CAttribute('自动感应消值', AttrNames.AutoClearValue, ValueType.Boolean, true), new CAttribute('允许多选', AttrNames.MultiSelect, ValueType.Boolean, false), new CAttribute('数据分层', 'datagroup', ValueType.String, '', true, true, 'getCanuseColumns')])]);

var M_DropdownKernel = function (_ControlKernelBase) {
    _inherits(M_DropdownKernel, _ControlKernelBase);

    function M_DropdownKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_DropdownKernel);

        var _this = _possibleConstructorReturn(this, (M_DropdownKernel.__proto__ || Object.getPrototypeOf(M_DropdownKernel)).call(this, initData, M_DropdownKernel_Type, '下拉框', M_DropdownKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var cusDsName = _this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = _this.project.dataMaster.getSqlBPByName(cusDsName);
        if (cusDS_bp == null) {
            cusDS_bp = _this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = _this.id;
        cusDS_bp.ctlKernel = _this;
        cusDS_bp.group = 'ctlcus';
        _this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);

        _this.findAttributeByName(AttrNames.DataSource).options_arr = parentKernel.project.dataMaster.getAllEntities;

        var self = _this;
        autoBind(self);

        _this.autoSetCusDataSource();
        return _this;
    }

    _createClass(M_DropdownKernel, [{
        key: 'autoSetCusDataSource',
        value: function autoSetCusDataSource(groupCols_arr) {
            var cusDS_bp = this.getAttribute(AttrNames.CustomDataSource);
            var theLinks = cusDS_bp.linkPool.getLinksBySocket(cusDS_bp.finalSelectNode.inSocket);
            var dsnode = null;
            var theLink = null;
            if (theLinks.length == 1) {
                theLink = theLinks[0];
                if (theLink.outSocket.node.type == SQLNODE_DBENTITY) {
                    dsnode = theLink.outSocket.node;
                }
            }
            if (theLinks.length == 0 || dsnode == null) {
                if (dsnode == null) {
                    dsnode = new SqlNode_DBEntity({}, cusDS_bp);
                    dsnode.left = cusDS_bp.finalSelectNode.left - 300;
                }
                cusDS_bp.linkPool.addLink(dsnode.outSocket, cusDS_bp.finalSelectNode.inSocket);
            }
            var useDS = this.getAttribute(AttrNames.DataSource);
            dsnode.setEntity(useDS);

            var fromtextfield = this.getAttribute(AttrNames.FromTextField);
            var fromValueField = this.getAttribute(AttrNames.FromValueField);
            var columnNode = cusDS_bp.finalSelectNode.columnNode;
            columnNode.distChecked = true;
            var needSelectColumns_arr = [];
            if (!IsEmptyString(fromtextfield)) {
                needSelectColumns_arr.push(fromtextfield);
            }
            if (!IsEmptyString(fromValueField)) {
                needSelectColumns_arr.push(fromValueField);
            }
            if (groupCols_arr != null && groupCols_arr.length > 0) {
                needSelectColumns_arr = needSelectColumns_arr.concat(groupCols_arr);
            }

            while (columnNode.inputScokets_arr.length < needSelectColumns_arr.length) {
                columnNode.addSocket(columnNode.genInSocket());
            }

            while (columnNode.inputScokets_arr.length > needSelectColumns_arr.length) {
                columnNode.removeSocket(columnNode.inputScokets_arr[columnNode.inputScokets_arr.length - 1]);
            }

            var hadChanged = false;
            var theSocket;
            var colNode = null;
            for (var i = 0; i < needSelectColumns_arr.length; ++i) {
                colNode = null;
                theSocket = columnNode.inputScokets_arr[i];
                theLinks = cusDS_bp.linkPool.getLinksBySocket(theSocket);
                if (theLinks.length == 1) {
                    theLink = theLinks[0];
                    if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                        colNode = theLink.outSocket.node;
                    }
                }
                if (theLinks.length == 0 || colNode == null) {
                    if (colNode == null) {
                        colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);
                        colNode.left = columnNode.left - 400;
                        colNode.top = columnNode.top + 150 + i * 50;
                    }
                    cusDS_bp.linkPool.addLink(colNode.outSocket, theSocket);
                }
                if (colNode.setFromObj({
                    tableCode: useDS.code,
                    tableAlias: null,
                    tableName: useDS.name,
                    columnName: needSelectColumns_arr[i]
                })) {
                    hadChanged = true;
                }
            }

            var orderNode = cusDS_bp.finalSelectNode.orderNode;
            if (orderNode.inputScokets_arr.length == 0) {
                orderNode.addSocket(orderNode.genInSocket());
            }
            theSocket = orderNode.inputScokets_arr[0];
            theLinks = cusDS_bp.linkPool.getLinksBySocket(theSocket);
            colNode = null;
            if (theLinks.length == 1) {
                theLink = theLinks[0];
                if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                    colNode = theLink.outSocket.node;
                }
            }
            if (!IsEmptyString(fromtextfield)) {
                if (theLinks.length == 0 || colNode == null) {
                    if (colNode == null) {
                        colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);
                        colNode.left = orderNode.left - 300;
                        colNode.top = orderNode.top + 50;
                    }
                    cusDS_bp.linkPool.addLink(colNode.outSocket, theSocket);
                }
                colNode.setFromObj({
                    tableCode: useDS.code,
                    tableAlias: null,
                    tableName: useDS.name,
                    columnName: fromtextfield
                });
            }
        }
    }, {
        key: 'getUseDSColumns',
        value: function getUseDSColumns() {
            var rlt = [''];
            var useDS = this.getAttribute(AttrNames.DataSource);
            if (useDS != null) {
                rlt = rlt.concat(useDS.columns.map(function (col) {
                    return col.name;
                }));
            }
            return rlt;
        }
    }, {
        key: 'getCanuseColumns',
        value: function getCanuseColumns() {
            return getDSAttrCanuseColumns.call(this, AttrNames.DataSource, AttrNames.CustomDataSource);
        }
    }, {
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_Dropdown, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_DropdownKernel.prototype.__proto__ || Object.getPrototypeOf(M_DropdownKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            if (attrItem.name == AttrNames.FromTextField) {
                var nowTextField = this.getAttribute(AttrNames.TextField);
                if (nowTextField.length == 0 || nowTextField == oldValue) {
                    this.setAttribute(AttrNames.TextField, newValue);
                }
            } else if (attrItem.name == AttrNames.FromValueField) {
                var nowValueField = this.getAttribute(AttrNames.ValueField);
                if (nowValueField.length == 0 || nowValueField == oldValue) {
                    this.setAttribute(AttrNames.ValueField, newValue);
                }
            }

            switch (attrItem.name) {
                case AttrNames.DataSource:
                case AttrNames.FromTextField:
                case AttrNames.FromValueField:
                    this.autoSetCusDataSource();
                    break;
            }
        }
    }]);

    return M_DropdownKernel;
}(ControlKernelBase);

var M_DropdownKernel_api = new ControlAPIClass(M_DropdownKernel_Type);
M_DropdownKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_DropdownKernelAttrsSetting), 'text', true));
M_DropdownKernel_api.pushApi(new ApiItem_propsetter('value'));
M_DropdownKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.ValueField, M_DropdownKernelAttrsSetting), 'value', true));
g_controlApi_arr.push(M_DropdownKernel_api);

var M_Dropdown = function (_React$PureComponent) {
    _inherits(M_Dropdown, _React$PureComponent);

    function M_Dropdown(props) {
        _classCallCheck(this, M_Dropdown);

        var _this2 = _possibleConstructorReturn(this, (M_Dropdown.__proto__ || Object.getPrototypeOf(M_Dropdown)).call(this, props));

        _this2.state = {
            defaultVal: _this2.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: _this2.props.ctlKernel.getAttribute(AttrNames.TextField),
            value: _this2.props.ctlKernel.getAttribute(AttrNames.ValueField),
            fromtext: _this2.props.ctlKernel.getAttribute(AttrNames.FromTextField),
            fromvalue: _this2.props.ctlKernel.getAttribute(AttrNames.FromValueField)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.DefaultValue, AttrNames.TextField, AttrNames.ValueField, AttrNames.FromTextField, AttrNames.FromValueField, AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr]);
        return _this2;
    }

    _createClass(M_Dropdown, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            this.setState({
                defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
                text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
                value: this.props.ctlKernel.getAttribute(AttrNames.ValueField),
                fromtext: this.props.ctlKernel.getAttribute(AttrNames.FromTextField),
                fromvalue: this.props.ctlKernel.getAttribute(AttrNames.FromValueField)
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
            /*
                <span style={{width:'calc(100% - 30px)'}} className='bg-dark text-light flex-grow-1 flex-shrink-1 dropdown-toggle' >1234</span>
                    <span style={{width:'30px'}} className='bg-dark text-light flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' />
            */
            layoutConfig.addClass('M_Dropdown');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            layoutConfig.addClass('w-100');
            layoutConfig.addClass('btn-group');
            layoutConfig.addClass('h-100');
            var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
            var textParseRet = parseObj_CtlPropJsBind(this.state.text);
            var valueParseRet = parseObj_CtlPropJsBind(this.state.value);
            var fromText = this.state.fromtext;
            var fromValue = this.state.fromvalue;

            var showText = textParseRet.isScript ? '[{脚本}]' : '[' + textParseRet.string + ']';
            /*
            var showText = (textParseRet.isScript ? '[{脚本}' : '[' + textParseRet.string) + (valueParseRet.isScript ? ':{脚本}]' : (IsEmptyString(valueParseRet.string) ? ']' : valueParseRet.string + ']')) 
                            + ('[' + fromText + (IsEmptyString(fromValue) ? ']' : fromValue + ']'));
            */
            return React.createElement(
                'div',
                { className: layoutConfig.getClassName(), onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                React.createElement(
                    'span',
                    { style: { width: 'calc(100% - 30px)' }, className: 'bg-dark text-light flex-grow-1 flex-shrink-1' },
                    showText
                ),
                React.createElement('span', { style: { width: '30px' }, className: 'bg-dark text-light flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' })
            );
        }
    }]);

    return M_Dropdown;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '下拉框',
    type: M_DropdownKernel_Type,
    namePrefix: M_DropdownKernel_Prefix,
    kernelClass: M_DropdownKernel,
    reactClass: M_Dropdown,
    canbeLabeled: true
}, '基础');