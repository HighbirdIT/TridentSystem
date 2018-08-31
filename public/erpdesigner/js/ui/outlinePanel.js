'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OutlineItem = function (_React$PureComponent) {
    _inherits(OutlineItem, _React$PureComponent);

    function OutlineItem(props) {
        _classCallCheck(this, OutlineItem);

        var _this = _possibleConstructorReturn(this, (OutlineItem.__proto__ || Object.getPrototypeOf(OutlineItem)).call(this, props));

        _this.state = {
            collapsed: false,
            selected: false
        };
        autoBind(_this);
        React_Make_AttributeListener(_this, ['children', 'selected', 'unselected']);
        return _this;
    }

    _createClass(OutlineItem, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (changedAttrName == 'children') {
                this.setState({
                    magicObj: {}
                });
            } else if (changedAttrName == 'selected') {
                this.setState({
                    selected: true
                });
            } else if (changedAttrName == 'unselected') {
                this.setState({
                    selected: false
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.kernel);
        }
    }, {
        key: 'toggleCollapse',
        value: function toggleCollapse() {
            this.setState({
                collapsed: !this.state.collapsed
            });
        }
    }, {
        key: 'clickhandler',
        value: function clickhandler() {
            this.state.kernel.project.designer.selectKernel(this.state.kernel);
        }
    }, {
        key: 'render',
        value: function render() {
            var self = this;
            if (this.state.kernel != this.props.kernel) {
                if (this.state.kernel) {
                    this.unlistenTarget(this.state.kernel);
                }
                if (this.props.kernel) {
                    this.listenTarget(this.props.kernel);
                }
                setTimeout(function () {
                    self.setState({
                        kernel: self.props.kernel
                    });
                }, 1);
                return null;
            }

            var kernel = this.state.kernel;
            if (kernel == null) return null;
            var isContainer = kernel.children != null;
            var hasChild = isContainer && kernel.children.length > 0;
            return React.createElement(
                'div',
                { key: kernel.name, className: 'outlineItemDiv' + (kernel.parent.parent ? ' ' : ' topest') + (isContainer ? " d-felx flex-column" : '') },
                !hasChild ? React.createElement(
                    'div',
                    { className: 'outlineItem flex-grow-1 flex-shrink-1', onClick: this.clickhandler },
                    kernel.name
                ) : React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement('span', { onClick: this.toggleCollapse, className: 'ml-1 icon-sm btn-secondary btn-sm' + (this.state.collapsed ? ' icon-right' : ' icon-down') }),
                    React.createElement(
                        'div',
                        { className: 'outlineItem flex-grow-1 flex-shrink-1', onClick: this.clickhandler },
                        kernel.name
                    )
                ),
                this.state.collapsed || kernel.children == null || kernel.children.length == 0 ? null : React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    kernel.children.map(function (childKernel) {
                        return React.createElement(OutlineItem, { key: childKernel.name, kernel: childKernel });
                    })
                )
            );
        }
    }]);

    return OutlineItem;
}(React.PureComponent);

var OutlinePanel = function (_React$PureComponent2) {
    _inherits(OutlinePanel, _React$PureComponent2);

    function OutlinePanel(props) {
        _classCallCheck(this, OutlinePanel);

        var _this2 = _possibleConstructorReturn(this, (OutlinePanel.__proto__ || Object.getPrototypeOf(OutlinePanel)).call(this, props));

        var editingPage = _this2.props.project.getEditingPage();
        _this2.state = { editingPage: editingPage };
        React_Make_AttributeListener(_this2, ['editingPage', 'children']);

        _this2.listenTarget(editingPage);
        return _this2;
    }

    _createClass(OutlinePanel, [{
        key: 'selectKernel',
        value: function selectKernel(kernel) {
            this.setState({ selectedKernel: kernel });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenTarget(this.props.project);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.project);
        }
    }, {
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (changedAttrName == 'children') {
                this.setState({ magicObj: {} });
            } else if (changedAttrName == 'editingPage') {
                var newEditingPage = this.props.project.getEditingPage();
                if (newEditingPage != this.state.editingPage) {
                    if (this.state.editingPage) {
                        this.unlistenTarget(this.state.editingPage);
                    }
                    if (newEditingPage) {
                        this.listenTarget(newEditingPage);
                    }
                    this.setState({
                        editingPage: newEditingPage
                    });
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { id: 'outlineRoot', className: 'flex-grow-1 flex-shrink-1 bg-light d-flex flex-column mw-100' },
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light', style: { borderRadius: '0em', height: '2.5em', overflow: 'hidden' } },
                    '\u5927\u7EB2'
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 autoScroll' },
                    this.state.editingPage && this.state.editingPage.children.map(function (kernal) {
                        return React.createElement(OutlineItem, { key: kernal.name, kernel: kernal });
                    })
                )
            );
        }
    }]);

    return OutlinePanel;
}(React.PureComponent);