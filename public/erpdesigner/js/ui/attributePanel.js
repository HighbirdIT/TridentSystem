'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttributePanel = function (_React$PureComponent) {
    _inherits(AttributePanel, _React$PureComponent);

    function AttributePanel(props) {
        _classCallCheck(this, AttributePanel);

        var _this = _possibleConstructorReturn(this, (AttributePanel.__proto__ || Object.getPrototypeOf(AttributePanel)).call(this, props));

        var initState = {};
        if (_this.props.project) {
            var editingPage = _this.props.project.getEditingPage();
            initState = {
                target: editingPage == null ? _this.props.project : editingPage
            };
            _this.props.project.designer.attributePanel = _this;
        }
        _this.state = initState;

        autoBind(_this, { exclude: ['renderAttribute'] });
        return _this;
    }

    _createClass(AttributePanel, [{
        key: 'getTarget',
        value: function getTarget() {
            return this.state.target;
        }
    }, {
        key: 'getAttrValue',
        value: function getAttrValue(attr) {
            return this.state.target.getAttribute(attr.name);
        }
    }, {
        key: 'setAttrValue',
        value: function setAttrValue(attr, newvalue) {
            this.state.target.setAttibute(attr.name, newvalue);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.state.target);
        }
    }, {
        key: 'targetAttributeGroupChangedhandler',
        value: function targetAttributeGroupChangedhandler(ev) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'listenTarget',
        value: function listenTarget(target) {
            if (target == null) {
                return;
            }
            target.on('AttributeGroupChanged', this.targetAttributeGroupChangedhandler);
        }
    }, {
        key: 'unlistenTarget',
        value: function unlistenTarget(target) {
            if (target == null) {
                return;
            }
            target.off('AttributeGroupChanged', this.targetAttributeGroupChangedhandler);
        }
    }, {
        key: 'setTarget',
        value: function setTarget(newTarget) {
            if (newTarget == this.state.target) {
                return;
            }
            this.unlistenTarget(this.state.target);
            if (this.state.target && this.state.target.setSelected) {
                this.state.target.setSelected(false);
            }
            if (newTarget && newTarget.setSelected) {
                newTarget.setSelected(true);
            }
            if (this.props.project) {
                this.props.project.emit(ESELECTEDCHANGED);
            }
            this.listenTarget(newTarget);
            this.setState({
                target: newTarget
            });
        }
    }, {
        key: 'renderAttribute',
        value: function renderAttribute(target) {
            if (target == null) {
                return React.createElement(
                    'div',
                    null,
                    '\u672A\u9009\u4E2D\u4EFB\u4F55\u5BF9\u8C61'
                );
            }
            if (target.attrbuteGroups == null) {
                return React.createElement(
                    'div',
                    null,
                    '\u6B64\u5BF9\u8C61\u6CA1\u6709\u5C5E\u6027'
                );
            }
            var projectName = this.props.project ? this.props.project.designeConfig.name : '未知';
            return target.attrbuteGroups.map(function (attrGroup, attrGroupIndex) {
                return React.createElement(AttributeGroup, { key: attrGroup.label, projectName: projectName, attrGroup: attrGroup, attrGroupIndex: attrGroupIndex, target: target });
            });
        }
    }, {
        key: 'gotoUserControlTemplate',
        value: function gotoUserControlTemplate() {
            var target = this.state.target;
            if (this.props.project && target.refID) {
                this.props.project.setEditingControlById(target.refID);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var target = this.state.target;
            var title = '';
            var ctlBtn = null;
            if (target) {
                if (target.getReadableName) {
                    title = target.getReadableName();
                } else {
                    title = target.description + (target.id ? '[' + target.id + ']' : '') + (target.name ? '(' + target.name + ')' : '');
                }
                if (target.type && target.type == UserControlKernel_Type && !target.isTemplate()) {
                    ctlBtn = React.createElement('span', { type: 'button', className: 'btn btn-sm btn-dark fa fa-share ml-1', onClick: this.gotoUserControlTemplate });
                }
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column minh-0', style: this.props.nofixwidth ? null : { width: '300px' } },
                React.createElement(
                    'button',
                    { type: 'button', className: 'mw-100 btn flex-grow-0 flex-shrink-0 bg-secondary text-light', style: { borderRadius: '0em', height: '2.5em', overflow: 'hidden' } },
                    title,
                    ctlBtn
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column autoScroll' },
                    this.renderAttribute(target)
                )
            );
        }
    }]);

    return AttributePanel;
}(React.PureComponent);