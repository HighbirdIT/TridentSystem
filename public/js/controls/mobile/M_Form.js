'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_FormKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('标题', AttrNames.Title, ValueType.String, ''), new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr), new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, 'getCanUseDataSource', { text: 'name', value: 'code' }), new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, g_dataBase.getAllTable, { text: 'name', value: 'code' }), new CAttribute('表单类别', AttrNames.FormType, ValueType.String, EFormType.Page, true, false, FormTypes_arr), new CAttribute('无数据提示', AttrNames.NoDataTip, ValueType.String, ''), new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true), new CAttribute('内容定制', AttrNames.ListFormContent, ValueType.ListFormContent, null, true, false, null, null, false), new CAttribute('自动分页', AttrNames.PageBreak, ValueType.Boolean, true), new CAttribute('每页条数', AttrNames.RowPerPage, ValueType.String, '20', true, false, ['20', '50', '100', '200']), new CAttribute('宽度类型', AttrNames.WidthType, ValueType.String, EGridWidthType.Auto, true, false, EGridWidthTypes_arr, { text: 'text', value: 'value' }), new CAttribute('首列序号', AttrNames.AutoIndexColumn, ValueType.Boolean, true), new CAttribute('自动滚动条', AttrNames.AutoHeight, ValueType.Boolean, false)])]);

var M_FormKernel = function (_ContainerKernelBase) {
    _inherits(M_FormKernel, _ContainerKernelBase);

    function M_FormKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_FormKernel);

        var _this = _possibleConstructorReturn(this, (M_FormKernel.__proto__ || Object.getPrototypeOf(M_FormKernel)).call(this, initData, M_FormKernel_Type, '数据表单', M_FormKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        var cusDsName = _this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = _this.project.dataMaster.getSqlBPByName(cusDsName);
        if (cusDS_bp == null) {
            cusDS_bp = _this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = _this.id;
        cusDS_bp.ctlKernel = _this;
        cusDS_bp.group = 'ctlcus';
        _this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);
        //this.autoSetCusDataSource();
        var listFormContentValue = _this.getAttribute(AttrNames.ListFormContent);
        if (listFormContentValue == null) {
            listFormContentValue = new ListFormContent(_this);
            _this.setAttribute(AttrNames.ListFormContent, listFormContentValue);
        }

        var nowft = _this.getAttribute(AttrNames.FormType);
        _this[AttrNames.ListFormContent + '_visible'] = nowft == EFormType.Grid;
        _this[AttrNames.PageBreak + '_visible'] = nowft == EFormType.Grid;
        _this[AttrNames.RowPerPage + '_visible'] = nowft == EFormType.Grid && _this.getAttribute(AttrNames.PageBreak);
        _this[AttrNames.WidthType + '_visible'] = nowft == EFormType.Grid;
        _this[AttrNames.AutoIndexColumn + '_visible'] = nowft == EFormType.Grid;

        var self = _this;
        autoBind(self);
        return _this;
    }

    _createClass(M_FormKernel, [{
        key: 'canAppand',
        value: function canAppand() {
            return this.getAttribute(AttrNames.FormType) == EFormType.Page;
        }
    }, {
        key: 'getCanUseDataSource',
        value: function getCanUseDataSource() {
            return this.project.dataMaster.getAllEntities();
        }
    }, {
        key: 'autoSetCusDataSource',
        value: function autoSetCusDataSource(mustSelectColumns_arr) {
            if (mustSelectColumns_arr == null) {
                mustSelectColumns_arr = [];
            }
            var useDS = this.getAttribute(AttrNames.DataSource);
            if (useDS && useDS.loaded == false) {
                // ds 元数据还未加载
                return;
            }
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
            dsnode.setEntity(useDS);
            if (useDS == null) {
                return;
            }
            var retColumnNode = cusDS_bp.finalSelectNode.columnNode;
            var needRemoveSockets_arr = [];
            var needRemoveNodes_arr = [];
            var hadColumns_arr = [];
            retColumnNode.inputScokets_arr.forEach(function (socket) {
                var alias = socket.getExtra('alias');
                if (!IsEmptyString(alias)) {
                    hadColumns_arr.push(alias);
                    return;
                }
                var links = cusDS_bp.linkPool.getLinksBySocket(socket);
                if (links.length == 0) {
                    needRemoveSockets_arr.push(socket);
                    return;
                }
                var link = links[0];
                if (link.outSocket.node.type != SQLNODE_COLUMN) {
                    return;
                }
                var columnName = link.outSocket.node.columnName;
                if (mustSelectColumns_arr.indexOf(columnName) == -1) {
                    needRemoveSockets_arr.push(socket);
                    needRemoveNodes_arr.push(link.outSocket.node);
                } else {
                    hadColumns_arr.push(link.outSocket.node.columnName);
                }
            });

            needRemoveSockets_arr.forEach(function (socket) {
                retColumnNode.removeSocket(socket);
            });

            cusDS_bp.deleteNodes(needRemoveNodes_arr);

            mustSelectColumns_arr.forEach(function (colName) {
                if (hadColumns_arr.indexOf(colName) == -1) {
                    var colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);
                    colNode.left = retColumnNode.left - 400;
                    var newSocket = retColumnNode.genInSocket();
                    retColumnNode.addSocket(newSocket);
                    cusDS_bp.linkPool.addLink(colNode.outSocket, newSocket);
                    colNode.setFromObj({
                        tableCode: useDS.code,
                        tableAlias: null,
                        tableName: useDS.name,
                        columnName: colName
                    });
                };
            });
            cusDS_bp.genColumns();
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_FormKernel.prototype.__proto__ || Object.getPrototypeOf(M_FormKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            switch (attrItem.name) {
                case AttrNames.DataSource:
                    this.autoSetCusDataSource();
                    break;
                case AttrNames.FormType:
                    var isGridForm = newValue == EFormType.Grid;
                    this.findAttributeByName(AttrNames.ListFormContent).setVisible(this, isGridForm);
                    this.findAttributeByName(AttrNames.PageBreak).setVisible(this, isGridForm);
                    this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, isGridForm && this.getAttribute(AttrNames.PageBreak));
                    this.findAttributeByName(AttrNames.WidthType).setVisible(this, isGridForm);
                    this.findAttributeByName(AttrNames.AutoIndexColumn).setVisible(this, isGridForm);
                    break;
                case AttrNames.PageBreak:
                    this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, newValue);
                    break;
            }
        }
    }, {
        key: 'getCanuseColumns',
        value: function getCanuseColumns() {
            return getDSAttrCanuseColumns.call(this, AttrNames.DataSource, AttrNames.CustomDataSource);
        }
    }, {
        key: 'renderSelf',
        value: function renderSelf(clickHandler) {
            return React.createElement(M_Form, { key: this.id, ctlKernel: this, onClick: clickHandler ? clickHandler : this.clickHandler });
        }
    }]);

    return M_FormKernel;
}(ContainerKernelBase);

var M_Form = function (_React$PureComponent) {
    _inherits(M_Form, _React$PureComponent);

    function M_Form(props) {
        _classCallCheck(this, M_Form);

        var _this2 = _possibleConstructorReturn(this, (M_Form.__proto__ || Object.getPrototypeOf(M_Form)).call(this, props));

        autoBind(_this2);

        var ctlKernel = _this2.props.ctlKernel;
        var inintState = M_ControlBase(_this2, LayoutAttrNames_arr.concat([AttrNames.Orientation, AttrNames.Chidlren, AttrNames.FormType, AttrNames.WidthType, AttrNames.AutoIndexColumn], inintState));
        M_ContainerBase(_this2);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;
        inintState.formType = ctlKernel.getAttribute(AttrNames.FormType);
        inintState.widthType = ctlKernel.getAttribute(AttrNames.WidthType);
        inintState.autoIndexColumn = ctlKernel.getAttribute(AttrNames.AutoIndexColumn);

        _this2.state = inintState;
        return _this2;
    }

    _createClass(M_Form, [{
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
                children: childrenVal,
                formType: ctlKernel.getAttribute(AttrNames.FormType),
                widthType: ctlKernel.getAttribute(AttrNames.WidthType),
                autoIndexColumn: ctlKernel.getAttribute(AttrNames.AutoIndexColumn)
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
                layoutConfig.addClass('M_Form_Empty');
                return React.createElement('div', { className: layoutConfig.getClassName(), style: rootStyle, ref: this.rootElemRef });
            }
            layoutConfig.addClass('M_Form');
            layoutConfig.addClass('border');
            layoutConfig.addClass('hb-control');
            if (this.state.orientation == Orientation_V) {
                layoutConfig.addClass('flex-column');
            }
            if (this.props.ctlKernel.children.length == 0) {
                layoutConfig.addClass('M_Form_Empty');
            }
            if (this.state.formType == EFormType.Grid) {
                //var labelControls_arr = this.props.ctlKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
                var widthType = this.state.widthType;
                var autoIndexColumn = this.state.autoIndexColumn;
                var tableStyle = {};
                var sumTableWidth = 0;
                if (autoIndexColumn) {
                    sumTableWidth += 3;
                }

                var tableElem = React.createElement(
                    'div',
                    { className: layoutConfig.getClassName(), style: rootStyle, onClick: this.props.onClick, ctlid: this.props.ctlKernel.id, ref: this.rootElemRef, ctlselected: this.state.selected ? '1' : null },
                    React.createElement(
                        'div',
                        { className: 'mw-100 autoScroll' },
                        React.createElement(
                            'table',
                            { className: 'table', style: tableStyle },
                            React.createElement(
                                'thead',
                                { className: 'thead-dark' },
                                React.createElement(
                                    'tr',
                                    null,
                                    this.props.ctlKernel.children.length == 0 ? React.createElement(
                                        'th',
                                        { scope: 'col' },
                                        '\u7A7A'
                                    ) : React.createElement(
                                        React.Fragment,
                                        null,
                                        !autoIndexColumn ? null : React.createElement(
                                            'th',
                                            { scope: 'col', className: 'indexTableHeader' },
                                            '\u5E8F\u53F7'
                                        ),
                                        this.props.ctlKernel.children.map(function (childKernel) {
                                            if (childKernel.type == M_LabeledControlKernel_Type) {
                                                var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                                                if (columnWidth == 0) {
                                                    var textValue = childKernel.getAttribute(AttrNames.TextField);
                                                    columnWidth = textValue.length * GridHead_PerCharWidth;
                                                    if (columnWidth == 0) {
                                                        columnWidth = 4 * GridHead_PerCharWidth;
                                                    }
                                                }
                                                if (widthType == EGridWidthType.Fixed) {
                                                    sumTableWidth += columnWidth;
                                                }
                                                return React.createElement(
                                                    'th',
                                                    { key: childKernel.id, scope: 'col', style: { width: columnWidth + 'em' } },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'd-flex flex-column' },
                                                        childKernel.getAttribute(AttrNames.TextField),
                                                        React.createElement(
                                                            'div',
                                                            { className: 'd-flex' },
                                                            React.createElement(
                                                                'span',
                                                                { className: 'badge badge-primary' },
                                                                GetControlTypeReadableName(childKernel.editor.type)
                                                            )
                                                        )
                                                    )
                                                );
                                            }
                                        })
                                    )
                                )
                            )
                        )
                    )
                );
                if (widthType == EGridWidthType.Fixed) {
                    tableStyle.width = sumTableWidth + 'em';
                }
                return tableElem;
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

    return M_Form;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: 'Form',
    type: M_FormKernel_Type,
    namePrefix: M_FormKernel_Prefix,
    kernelClass: M_FormKernel,
    reactClass: M_Form
}, '布局');

var ListFormContent = function (_EventEmitter) {
    _inherits(ListFormContent, _EventEmitter);

    function ListFormContent(kernel) {
        _classCallCheck(this, ListFormContent);

        var _this3 = _possibleConstructorReturn(this, (ListFormContent.__proto__ || Object.getPrototypeOf(ListFormContent)).call(this));

        EnhanceEventEmiter(_this3);
        _this3.formKernel = kernel;
        _this3.selectColumns_map = {};
        return _this3;
    }

    _createClass(ListFormContent, [{
        key: 'createControl',
        value: function createControl() {
            var newCtl = new M_LabeledControlKernel({}, this.formKernel, null, null);
            return newCtl;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            return {};
        }
    }]);

    return ListFormContent;
}(EventEmitter);