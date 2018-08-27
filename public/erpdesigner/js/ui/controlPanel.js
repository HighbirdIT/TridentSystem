'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControlPanel = function (_React$PureComponent) {
    _inherits(ControlPanel, _React$PureComponent);

    function ControlPanel(props) {
        _classCallCheck(this, ControlPanel);

        var _this = _possibleConstructorReturn(this, (ControlPanel.__proto__ || Object.getPrototypeOf(ControlPanel)).call(this, props));

        var initState = {
            isPC: _this.props.project.designeConfig.editingType == 'PC'
        };
        _this.state = initState;
        _this.watchedAttrs = 'editingType';
        _this.watchAttrMatch = function (attrName) {
            return _this.watchedAttrs.indexOf(attrName) != -1;
        };

        autoBind(_this);
        return _this;
    }

    _createClass(ControlPanel, [{
        key: 'clickControlBtn',
        value: function clickControlBtn(ev) {}
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var needFresh = false;
            if (typeof ev.name === 'string') {
                needFresh = this.watchedAttrs.indexOf(ev.name) != -1;
            } else {
                needFresh = ev.name.some(this.watchAttrMatch);
            }
            if (needFresh) {
                this.setState({
                    isPC: this.props.project.designeConfig.editingType == 'PC'
                });
            }
        }
    }, {
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
        key: 'render',
        value: function render() {
            var _this2 = this;

            var isPC = this.state.isPC;
            var projectName = this.props.project.designeConfig.name;
            return React.createElement(
                'div',
                { style: { width: '200px' }, className: 'flex-grow-0 flex-shrink-0 bg-secondary d-flex flex-column' },
                DesignerConfig.controlConfig.groups.map(function (group) {
                    return React.createElement(
                        React.Fragment,
                        { key: group.name },
                        React.createElement(
                            'button',
                            { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + projectName + group.name + "CtlList", className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                            group.name
                        ),
                        React.createElement(
                            'div',
                            { id: projectName + group.name + "CtlList", className: 'list-group flex-grow-1 flex-shrink-1 collapse show', style: { overflow: 'auto' } },
                            (isPC ? group.controlsForPC : group.controlsForMobile).map(function (ctl) {
                                return ctl.invisible ? null : React.createElement(
                                    'button',
                                    { key: ctl.label, onClick: _this2.clickControlBtn, type: 'button', className: 'list-group-item list-group-item-action flex-grow-0 flex-shrink-0' },
                                    ctl.label
                                );
                            })
                        )
                    );
                })
            );
        }
    }]);

    return ControlPanel;
}(React.PureComponent);