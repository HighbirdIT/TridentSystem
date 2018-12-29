'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_PageKernelAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('标题', AttrNames.Title, ValueType.String, '未命名页面'), new CAttribute('主页面', AttrNames.IsMain, ValueType.Boolean, false), new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr)]), new CAttributeGroup('测试设置', [new CAttribute('测试', AttrNames.Test, ValueType.String, '', true, 1)])]
};

var M_PageKernel = function (_ContainerKernelBase) {
    _inherits(M_PageKernel, _ContainerKernelBase);

    function M_PageKernel(initData, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, M_PageKernel);

        var _this = _possibleConstructorReturn(this, (M_PageKernel.__proto__ || Object.getPrototypeOf(M_PageKernel)).call(this, initData, M_PageKernel_Type, '页面', M_PageKernelAttrsSetting.groups_arr.concat(), parentKernel, createHelper, kernelJson));

        var self = _this;
        autoBind(self);

        /*
        var nowParent = this;
        for(var i=0;i<1;++i){
            var newC = new M_ContainerKernel(null, project);
            nowParent.appandChild(newC);
            nowParent = newC;
            for(var j=0;j<5;++j){
                newC.appandChild(new M_LabelKernel(null, project));
            }
        }
        */
        return _this;
    }

    _createClass(M_PageKernel, [{
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
    }]);

    return M_PageKernel;
}(ContainerKernelBase);

var M_Page = function (_React$PureComponent) {
    _inherits(M_Page, _React$PureComponent);

    function M_Page(props) {
        _classCallCheck(this, M_Page);

        var _this2 = _possibleConstructorReturn(this, (M_Page.__proto__ || Object.getPrototypeOf(M_Page)).call(this, props));

        _this2.state = {
            title: _this2.props.ctlKernel.getAttribute(AttrNames.Title),
            ctlKernel: _this2.props.ctlKernel,
            children: _this2.props.ctlKernel.children,
            orientation: _this2.props.ctlKernel.getAttribute(AttrNames.Orientation)
        };

        autoBind(_this2);
        M_ControlBase(_this2, [AttrNames.Title, AttrNames.Chidlren, AttrNames.Orientation, AttrNames.LayoutNames.APDClass]);
        M_ContainerBase(_this2);
        return _this2;
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
                orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation)
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
            var layoutConfig = ctlKernel.getLayoutConfig();
            var rootDivClass = 'flex-grow-1 felx-shrink-0 d-flex' + (this.state.orientation == Orientation_V ? ' flex-column' : '');
            rootDivClass += layoutConfig.baseClassName;
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-1 text-light bg-primary align-items-baseline' },
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
                        React.createElement('span', { className: 'icon icon-more-vertical mr-1' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: rootDivClass, ref: this.rootElemRef },
                    this.state.children.map(function (childData) {
                        return childData.renderSelf();
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.props.ctlKernel != this.state.ctlKernel) {
                var self = this;
                this.unlistenTarget(this.state.ctlKernel);
                this.listenTarget(this.props.ctlKernel);
                setTimeout(function () {
                    self.setState({
                        title: _this3.props.ctlKernel.getAttribute('title'),
                        ctlKernel: _this3.props.ctlKernel,
                        children: _this3.props.ctlKernel.children,
                        orientation: _this3.props.ctlKernel.orientation
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
    forPC: false,
    label: '页面',
    type: 'M_Page',
    invisible: true,
    kernelClass: M_PageKernel,
    controlClass: M_Page
}, '布局');