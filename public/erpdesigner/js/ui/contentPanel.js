'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContentPanel = function (_React$PureComponent) {
    _inherits(ContentPanel, _React$PureComponent);

    function ContentPanel(props) {
        _classCallCheck(this, ContentPanel);

        var _this = _possibleConstructorReturn(this, (ContentPanel.__proto__ || Object.getPrototypeOf(ContentPanel)).call(this, props));

        var project = _this.props.project;
        var initState = {
            isPC: project.config.isPC
        };
        _this.state = initState;
        _this.switchProjectVersion = _this.switchProjectVersion.bind(_this);
        return _this;
    }

    _createClass(ContentPanel, [{
        key: 'switchProjectVersion',
        value: function switchProjectVersion() {
            var project = this.props.project;
            project.projectManager.switchProjectVersion(project.projectIndex);
        }
    }, {
        key: 'render',
        value: function render() {
            var project = this.props.project;
            return React.createElement(
                'div',
                { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column' },
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 d-flex bg-secondary justify-content-center align-items-center text-light', style: { height: '2.5em', overflow: 'hidden' } },
                    React.createElement(
                        'h4',
                        null,
                        project.config.title
                    ),
                    React.createElement(
                        'button',
                        { type: 'button', className: "ml-1 p-0 btn btn-secondary dropdown-toggle dropdown-toggle-split", 'data-toggle': 'dropdown' },
                        React.createElement(
                            'div',
                            { className: "badge badge-pill ml-1 badge-" + (project.config.isPC ? "danger" : "success") },
                            project.config.isPC ? "电脑版" : "手机版"
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'dropdown-menu' },
                        React.createElement(
                            'button',
                            { onClick: this.switchProjectVersion, className: 'dropdown-item', type: 'button' },
                            project.config.isPC ? '切换手机版' : '切换电脑版'
                        )
                    )
                ),
                React.createElement('div', { className: 'flex-grow-1 flex-shrink-1' })
            );
        }
    }]);

    return ContentPanel;
}(React.PureComponent);