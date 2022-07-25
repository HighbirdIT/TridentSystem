'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_PageKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('标题', AttrNames.Title, ValueType.String, '未命名页面'), new CAttribute('主页面', AttrNames.IsMain, ValueType.Boolean, false), new CAttribute('隐藏页头', AttrNames.HideTitle, ValueType.Boolean, false), new CAttribute('隐藏标题', 'blanktitle', ValueType.Boolean, false), new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr), new CAttribute('有滚动条', AttrNames.HadScroll, ValueType.Boolean, true), new CAttribute('是常驻页面', AttrNames.PersistentPage, ValueType.Boolean, false), new CAttribute('弹出式页面', AttrNames.PopablePage, ValueType.Boolean, false), new CAttribute('强制全屏', 'forcefullscreen', ValueType.Boolean, false), new CAttribute('有关闭按钮', AttrNames.AutoCloseBtn, ValueType.Boolean, true), new CAttribute('有主页按钮', AttrNames.AutoHomeBtn, ValueType.Boolean, true), new CAttribute('关联步骤', AttrNames.RelFlowStep, ValueType.Int, null, true, true, gFlowMaster.getAllSteps, { text: 'fullName', value: 'code' }), genScripAttribute('获取出口值', AttrNames.Function.GetOutputData, EJsBluePrintFunGroup.CtlFun), new CAttribute('属性列表', AttrNames.ParamApi, ValueType.String, '', true, true), new CAttribute('权限组', AttrNames.PermissionGroup, ValueType.Int, null, true, true, [], { text: 'name', value: 'code', pullDataFun: GetCanUsePermissionGroup })]), new CAttributeGroup('接口设置', [new CAttribute('入口参数', AttrNames.EntryParam, ValueType.String, '', true, true), new CAttribute('出口参数', AttrNames.ExportParam, ValueType.String, '', true, true)]), new CAttributeGroup('事件', [new CAttribute('OnLoad', AttrNames.Event.OnLoad, ValueType.Event), new CAttribute('点击关闭', AttrNames.Event.OnClickCloseBtn, ValueType.Event), new CAttribute('消息处理', AttrNames.Event.OnReceiveMsg, ValueType.Event)]), new CAttributeGroup('自订方法', [new CAttribute('自订方法', AttrNames.FunctionApi, ValueType.CustomFunction, '', true, true)])], false);

var M_PageKernel = function (_ContainerKernelBase) {
    _inherits(M_PageKernel, _ContainerKernelBase);

    function M_PageKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_PageKernel);

        var _this = _possibleConstructorReturn(this, (M_PageKernel.__proto__ || Object.getPrototypeOf(M_PageKernel)).call(this, initData, M_PageKernel_Type, '页面', M_PageKernelAttrsSetting, parentKernel, createHelper, kernelJson));

        _this.hadReactClass = true;
        var self = _this;
        autoBind(self);

        var funName = _this.id + '_' + AttrNames.Event.OnLoad;
        var theBP = _this.project.scriptMaster.getBPByName(funName);
        if (theBP) {
            theBP.ctlID = _this.id;
        }

        theBP = _this.project.scriptMaster.getBPByName(_this.id + '_' + AttrNames.Function.GetOutputData);
        _this.scriptCreated(null, theBP);

        _this.getAttrArrayList(AttrNames.FunctionApi).forEach(function (funAtrr) {
            theBP = _this.project.scriptMaster.getBPByName(_this.id + '_' + funAtrr.name);
            _this.scriptCreated(null, theBP);
        });
        return _this;
    }

    _createClass(M_PageKernel, [{
        key: 'getUseFlowSteps',
        value: function getUseFlowSteps() {
            var _this2 = this;

            var rlt = [];
            this.getAttrArrayList(AttrNames.RelFlowStep).forEach(function (attr) {
                var flowStepCode = _this2[attr.name];
                var theStep = gFlowMaster.findStepByCode(flowStepCode);
                if (theStep && rlt.indexOf(theStep) == -1) {
                    rlt.push(theStep);
                }
            });
            return rlt;
        }
    }, {
        key: 'get_name',
        value: function get_name() {
            return this.id;
        }
    }, {
        key: 'set_title',
        value: function set_title(newTitle) {
            if (newTitle.length > 10) {
                newTitle = newTitle.substring(0, 10);
            }

            var flag = this.__setAttribute(AttrNames.Title, newTitle);
            if (flag) {
                this.attrChanged(AttrNames.Title);
            }
            return flag;
        }
    }, {
        key: 'set_ismain',
        value: function set_ismain(val) {
            var flag = this.__setAttribute(AttrNames.IsMain, val);
            if (flag) {
                if (val) {
                    var project = this.project;
                    project.mainPageChanged(this);
                }
                this.attrChanged(AttrNames.IsMain);
            }
            return flag;
        }
    }, {
        key: 'getAllEntryParams',
        value: function getAllEntryParams() {
            var _this3 = this;

            var rlt_arr = [];
            this.getAttrArrayList(AttrNames.EntryParam).forEach(function (attr) {
                var val = _this3.getAttribute(attr.name);
                if (!IsEmptyString(val)) {
                    rlt_arr.push({ value: val, name: attr.name });
                }
            });
            return rlt_arr;
        }
    }, {
        key: 'scriptCreated',
        value: function scriptCreated(attrName, scriptBP) {
            var _this4 = this;

            if (scriptBP == null) {
                return;
            }
            if (scriptBP.name.indexOf(AttrNames.Event.OnReceiveMsg) != -1) {
                scriptBP.setFixParam(['msgtype', 'data']);
            }
            if (scriptBP.name.indexOf(AttrNames.FunctionApi) != -1) {
                scriptBP.startIsInReducer = false;
            }

            if (scriptBP.name.indexOf(AttrNames.Function.GetOutputData) != -1) {
                scriptBP.setFixParam([VarNames.State]);

                // var rowTextParam = scriptBP.returnVars_arr.find(item=>{return item.name == AttrNames.RowText;});
                // if(rowTextParam == null){
                //     rowTextParam = scriptBP.createEmptyVariable(true);
                //     rowTextParam.name = AttrNames.RowText;
                //     rowTextParam.needEdit = false;
                // }

                var returnVars_arr = scriptBP.returnVars_arr;
                var var_dic = {};
                returnVars_arr.forEach(function (varData) {
                    var_dic[varData.tag] = varData;
                    varData.needRemove = true;
                });
                var pageExportAttrs_arr = this.getAttrArrayList(AttrNames.ExportParam);
                pageExportAttrs_arr.forEach(function (attrItem, index) {
                    var retVar = null;
                    var paramLabel = _this4.getAttribute(attrItem.name);
                    var paramTag = attrItem.name;
                    if (var_dic[paramTag] == null) {
                        retVar = scriptBP.createEmptyVariable(true);
                        retVar.needEdit = false;
                        retVar.name = paramLabel;
                        retVar.tag = paramTag;
                    } else {
                        retVar = var_dic[paramTag];
                        retVar.needRemove = false;
                        retVar.name = paramLabel;
                        retVar.emit('changed');
                    }
                });
                var needRemoveVars = returnVars_arr.filter(function (item) {
                    return item.needRemove == true;
                });
                if (needRemoveVars.length > 0) {
                    needRemoveVars.forEach(function (varData) {
                        var index = returnVars_arr.indexOf(varData);
                        if (index != -1) {
                            returnVars_arr.splice(index, 1);
                            varData.removed = true;
                        }
                        varData.removed = true;
                    });
                    scriptBP.fireEvent('varChanged');
                }

                scriptBP.canCustomReturnValue = true;
            }
        }
    }, {
        key: '__attributeChanged',
        value: function __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
            _get(M_PageKernel.prototype.__proto__ || Object.getPrototypeOf(M_PageKernel.prototype), '__attributeChanged', this).call(this, attrName, oldValue, newValue, realAtrrName, indexInArray);
            var attrItem = this.findAttributeByName(attrName);
            switch (attrItem.name) {
                case AttrNames.ExportParam:
                    var theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Function.GetOutputData);
                    this.scriptCreated(null, theBP);
                    break;
            }
        }
    }, {
        key: 'getFunctionApiAttrArray',
        value: function getFunctionApiAttrArray() {
            var _this5 = this;

            var attrValue;
            var rlt_arr = [];
            var funApis_arr = this.getAttrArrayList(AttrNames.FunctionApi);
            funApis_arr.forEach(function (attr) {
                attrValue = _this5.getAttribute(attr.name);
                if (IsEmptyString(attrValue)) {
                    return;
                }
                rlt_arr.push({
                    label: attrValue,
                    name: attr.name,
                    fullname: _this5.id + '_' + attr.name
                });
            });

            return rlt_arr;
        }
    }, {
        key: 'getParamApiAttrArray',
        value: function getParamApiAttrArray() {
            var _this6 = this;

            var attrValue;
            var rlt_arr = [];
            var paramApis_arr = this.getAttrArrayList(AttrNames.ParamApi);
            paramApis_arr.forEach(function (attr) {
                attrValue = _this6.getAttribute(attr.name);
                if (IsEmptyString(attrValue)) {
                    return;
                }
                rlt_arr.push({
                    label: attrValue,
                    name: attr.name
                });
            });

            return rlt_arr;
        }
    }]);

    return M_PageKernel;
}(ContainerKernelBase);

var Page_api = new ControlAPIClass(M_PageKernel_Type);
g_controlApi_arr.push(Page_api);
Page_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.ParamApi, M_PageKernelAttrsSetting), AttrNames.ParamApi, false));
Page_api.pushApi(new ApiItem_propsetter('属性接口'));

var M_Page = function (_React$PureComponent) {
    _inherits(M_Page, _React$PureComponent);

    function M_Page(props) {
        _classCallCheck(this, M_Page);

        var _this7 = _possibleConstructorReturn(this, (M_Page.__proto__ || Object.getPrototypeOf(M_Page)).call(this, props));

        _this7.state = {
            title: _this7.props.ctlKernel.getAttribute(AttrNames.Title),
            ctlKernel: _this7.props.ctlKernel,
            children: _this7.props.ctlKernel.children,
            orientation: _this7.props.ctlKernel.getAttribute(AttrNames.Orientation),
            popablePage: _this7.props.ctlKernel.getAttribute(AttrNames.PopablePage),
            autoCloseBtn: _this7.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn)
        };

        autoBind(_this7);
        M_ControlBase(_this7, [AttrNames.Title, AttrNames.Chidlren, AttrNames.Orientation, AttrNames.PopablePage, AttrNames.AutoCloseBtn, AttrNames.LayoutNames.APDClass]);
        M_ContainerBase(_this7);
        return _this7;
    }

    _createClass(M_Page, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (this.aAttrChangedBase(changedAttrName)) {
                return;
            }
            var childrenVal = this.state.children;
            if (changedAttrName == AttrNames.Chidlren) {
                childrenVal = this.props.ctlKernel.children.concat();
            }
            //console.log(changedAttrName);
            this.setState({
                title: this.props.ctlKernel.getAttribute(AttrNames.Title),
                children: childrenVal,
                orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
                popablePage: this.props.ctlKernel.getAttribute(AttrNames.PopablePage),
                autoCloseBtn: this.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn)
            });
        }
    }, {
        key: 'renderPCPage',
        value: function renderPCPage() {
            return null;
        }
    }, {
        key: 'renderMobilePage',
        value: function renderMobilePage(ctlKernel) {
            var _this8 = this;

            var layoutConfig = ctlKernel.getLayoutConfig();
            layoutConfig.addClass('d-flex');
            layoutConfig.addClass('flex-grow-1');
            layoutConfig.addClass('flex-shrink-0');
            if (this.state.orientation == Orientation_V) {
                layoutConfig.addClass('flex-column');
            }
            layoutConfig.addClass('bg-light');
            //icon-more-vertical
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 text-light bg-primary align-items-baseline' },
                    React.createElement(
                        'div',
                        { className: 'ml-1', href: '#' },
                        React.createElement('h5', { className: 'icon icon-left-nav' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 justify-content-center d-flex' },
                        React.createElement(
                            'h3',
                            null,
                            this.state.title
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'ml-1', href: '#' },
                        this.state.popablePage && this.state.autoCloseBtn && React.createElement(
                            'button',
                            { className: 'btn btn-sm btn-danger' },
                            React.createElement('i', { className: 'icon icon-close' })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: layoutConfig.getClassName(), ref: this.rootElemRef },
                    this.state.children.map(function (childData) {
                        return childData.renderSelf(null, null, _this8.props.designer);
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this9 = this;

            if (this.props.ctlKernel != this.state.ctlKernel) {
                var self = this;
                this.unlistenTarget(this.state.ctlKernel);
                this.listenTarget(this.props.ctlKernel);
                setTimeout(function () {
                    self.setState({
                        title: _this9.props.ctlKernel.getAttribute('title'),
                        ctlKernel: _this9.props.ctlKernel,
                        children: _this9.props.ctlKernel.children,
                        orientation: _this9.props.ctlKernel.getAttribute(AttrNames.Orientation),
                        popablePage: _this9.props.ctlKernel.getAttribute(AttrNames.PopablePage),
                        autoCloseBtn: _this9.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn)
                    });
                }, 1);
                return null;
            }
            if (this.propsisPC) {
                return this.renderPCPage(this.props.ctlKernel);
            } else {
                return this.renderMobilePage(this.props.ctlKernel);
            }
        }
    }]);

    return M_Page;
}(React.PureComponent);

DesignerConfig.registerControl({
    label: '页面',
    type: 'M_Page',
    invisible: true,
    kernelClass: M_PageKernel,
    controlClass: M_Page
}, '布局');