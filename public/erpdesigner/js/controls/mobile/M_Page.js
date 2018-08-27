'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Page = function (_React$PureComponent) {
    _inherits(M_Page, _React$PureComponent);

    function M_Page(props) {
        _classCallCheck(this, M_Page);

        var _this = _possibleConstructorReturn(this, (M_Page.__proto__ || Object.getPrototypeOf(M_Page)).call(this, props));

        ApplyControlBase(_this);
        _this.state = {
            title: _this.props.pageData.getAttribute('title'),
            pageData: _this.props.pageData
        };

        autoBind(_this);

        _this.watchedAttrs = ['pagetitle'];
        _this.watchAttrMatch = function (attrName) {
            return _this.watchedAttrs.indexOf(attrName) != -1;
        };
        return _this;
    }

    _createClass(M_Page, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var _this2 = this;

            var needFresh = false;
            var changedAttrIndex = -1;
            if (typeof ev.name === 'string') {
                changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
                needFresh = changedAttrIndex != -1;
            } else {
                needFresh = ev.name.find(function (attrName) {
                    changedAttrIndex = _this2.watchedAttrs.indexOf(attrName);
                    return changedAttrIndex != -1;
                }) != null;
            }
            if (needFresh) {
                var changedAttrName = this.watchedAttrs[changedAttrIndex];
                console.log(changedAttrName);
                this.setState({
                    title: this.props.pageData.getAttribute('title')
                });
            }
        }
    }, {
        key: 'renderPCPage',
        value: function renderPCPage() {
            return null;
        }
    }, {
        key: 'renderMobilePage',
        value: function renderMobilePage(pageData) {
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
                        React.createElement('span', { className: 'icon icon-more-vertical mr-1' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 felx-shrink-1 ' },
                    '\u5185\u5BB9\u533A'
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 felx-shrink-0 bg-primary' },
                    '\u64CD\u4F5C\u533A'
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.props.pageData != this.state.pageData) {
                var self = this;
                setTimeout(function () {
                    self.setState({
                        title: _this3.props.pageData.getAttribute('title'),
                        pageData: _this3.props.pageData
                    });
                }, 1);
                return null;
            }
            if (this.propsisPC) {
                return this.renderPCPage(this.props.pageData);
            } else {
                return this.renderMobilePage(this.props.pageData);
            }
        }
    }]);

    return M_Page;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: '页面',
    type: 'M_Page',
    invisible: true
}, '布局');