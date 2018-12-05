'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_PageKernelAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('标题', 'title', ValueType.String, true), new CAttribute('方向', 'orientation', ValueType.String, true, false, Orientation_Options_arr)]), new CAttributeGroup('测试设置', [new CAttribute('测试', 'test', ValueType.String, true, 1)])]
};

var M_PageKernel_Type = 'M_PageKernel';
var M_PageKernel_Prefix = 'M_P';

var M_PageKernel = function (_ContainerKernelBase) {
    _inherits(M_PageKernel, _ContainerKernelBase);

    function M_PageKernel(initData, project) {
        _classCallCheck(this, M_PageKernel);

        var thisInitData = extractPropsFromObj(initData, [{ name: 'title', default: '未命名页面' }, { name: 'name', default: project.genControlName(M_PageKernel_Prefix) }, { name: 'orientation', default: Orientation_V }]);

        var _this = _possibleConstructorReturn(this, (M_PageKernel.__proto__ || Object.getPrototypeOf(M_PageKernel)).call(this, thisInitData, project, '页面'));

        var self = _this;
        autoBind(self);
        _this.attrbuteGroups = M_PageKernelAttrsSetting.groups_arr;

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

            var flag = this.__setAttribute('title', newTitle);
            if (flag) {
                this.attrChanged('title');
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
            title: _this2.props.ctlKernel.getAttribute('title'),
            ctlKernel: _this2.props.ctlKernel,
            children: _this2.props.ctlKernel.children,
            orientation: _this2.props.ctlKernel.orientation
        };

        autoBind(_this2);
        M_ControlBase(_this2, ['title', 'children', 'orientation']);
        M_ContainerBase(_this2);
        return _this2;
    }

    _createClass(M_Page, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            var childrenVal = this.state.children;
            if (changedAttrName == 'children') {
                childrenVal = this.props.ctlKernel.children.concat();
            }
            //console.log(changedAttrName);
            this.setState({
                title: this.props.ctlKernel.getAttribute('title'),
                children: childrenVal,
                orientation: this.props.ctlKernel.orientation
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
            var s = 'div';
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
                    { className: 'flex-grow-1 felx-shrink-0 d-flex' + (this.state.orientation == Orientation_V ? ' flex-column' : ''), ref: this.rootElemRef },
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