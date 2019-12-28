'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_PageKernelAttrsSetting = GenControlKernelAttrsSetting([new CAttributeGroup('基本设置', [new CAttribute('标题', AttrNames.Title, ValueType.String, '未命名页面'), new CAttribute('主页面', AttrNames.IsMain, ValueType.Boolean, false), new CAttribute('隐藏标题', AttrNames.HideTitle, ValueType.Boolean, false), new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr), new CAttribute('有滚动条', AttrNames.HadScroll, ValueType.Boolean, true), new CAttribute('弹出式页面', AttrNames.PopablePage, ValueType.Boolean, false), new CAttribute('有关闭按钮', AttrNames.AutoCloseBtn, ValueType.Boolean, true), new CAttribute('有主页按钮', AttrNames.AutoHomeBtn, ValueType.Boolean, true), new CAttribute('关联步骤', AttrNames.RelFlowStep, ValueType.Int, null, true, true, gFlowMaster.getAllSteps, { text: 'fullName', value: 'code' })]), new CAttributeGroup('接口设置', [new CAttribute('入口参数', AttrNames.EntryParam, ValueType.String, '', true, true), new CAttribute('出口参数', AttrNames.ExportParam, ValueType.String, '', true, true)]), new CAttributeGroup('事件', [new CAttribute('OnLoad', AttrNames.Event.OnLoad, ValueType.Event), new CAttribute('点击关闭', AttrNames.Event.OnClickCloseBtn, ValueType.Event), new CAttribute('消息处理', AttrNames.Event.OnReceiveMsg, ValueType.Event)]), new CAttributeGroup('自订方法', [new CAttribute('自订方法', AttrNames.FunctionApi, ValueType.CustomFunction, '', true, true)])], false);

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
            if (scriptBP == null) {
                return;
            }
            if (scriptBP.name.indexOf(AttrNames.Event.OnReceiveMsg) != -1) {
                scriptBP.setFixParam(['msgtype', 'data']);
            }
            if (scriptBP.name.indexOf(AttrNames.FunctionApi) != -1) {
                scriptBP.startIsInReducer = false;
            }
        }
    }, {
        key: 'getFunctionApiAttrArray',
        value: function getFunctionApiAttrArray() {
            var _this4 = this;

            var attrValue;
            var rlt_arr = [];
            var funApis_arr = this.getAttrArrayList(AttrNames.FunctionApi);
            funApis_arr.forEach(function (attr) {
                attrValue = _this4.getAttribute(attr.name);
                if (IsEmptyString(attrValue)) {
                    return;
                }
                rlt_arr.push({
                    label: attrValue,
                    name: attr.name,
                    fullname: _this4.id + '_' + attr.name
                });
            });

            return rlt_arr;
        }
    }]);

    return M_PageKernel;
}(ContainerKernelBase);

var M_Page = function (_React$PureComponent) {
    _inherits(M_Page, _React$PureComponent);

    function M_Page(props) {
        _classCallCheck(this, M_Page);

        var _this5 = _possibleConstructorReturn(this, (M_Page.__proto__ || Object.getPrototypeOf(M_Page)).call(this, props));

        _this5.state = {
            title: _this5.props.ctlKernel.getAttribute(AttrNames.Title),
            ctlKernel: _this5.props.ctlKernel,
            children: _this5.props.ctlKernel.children,
            orientation: _this5.props.ctlKernel.getAttribute(AttrNames.Orientation),
            popablePage: _this5.props.ctlKernel.getAttribute(AttrNames.PopablePage),
            autoCloseBtn: _this5.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn)
        };

        autoBind(_this5);
        M_ControlBase(_this5, [AttrNames.Title, AttrNames.Chidlren, AttrNames.Orientation, AttrNames.PopablePage, AttrNames.AutoCloseBtn, AttrNames.LayoutNames.APDClass]);
        M_ContainerBase(_this5);
        return _this5;
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
            var _this6 = this;

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
                        return childData.renderSelf(null, null, _this6.props.designer);
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            if (this.props.ctlKernel != this.state.ctlKernel) {
                var self = this;
                this.unlistenTarget(this.state.ctlKernel);
                this.listenTarget(this.props.ctlKernel);
                setTimeout(function () {
                    self.setState({
                        title: _this7.props.ctlKernel.getAttribute('title'),
                        ctlKernel: _this7.props.ctlKernel,
                        children: _this7.props.ctlKernel.children,
                        orientation: _this7.props.ctlKernel.getAttribute(AttrNames.Orientation),
                        popablePage: _this7.props.ctlKernel.getAttribute(AttrNames.PopablePage),
                        autoCloseBtn: _this7.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn)
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