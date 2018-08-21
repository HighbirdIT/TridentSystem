'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttributeEditor = function (_React$PureComponent) {
    _inherits(AttributeEditor, _React$PureComponent);

    function AttributeEditor(props) {
        _classCallCheck(this, AttributeEditor);

        var _this = _possibleConstructorReturn(this, (AttributeEditor.__proto__ || Object.getPrototypeOf(AttributeEditor)).call(this, props));

        var initState = {
            value: _this.props.targetattr.nowValue()
        };
        _this.state = initState;

        autoBind(_this, { exclude: ['rednerEditor'] });
        return _this;
    }

    _createClass(AttributeEditor, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.targetattr.group.belongObj.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.targetattr.group.belongObj.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var _this2 = this;

            var myAttrName = this.props.targetattr.name;
            var match = function match(pattern) {
                return typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
            };
            var isMyAttrChaned = false;
            if (typeof ev.name === 'string') {
                isMyAttrChaned = ev.name == myAttrName;
            } else {
                isMyAttrChaned = ev.name.some(match);
            }
            if (isMyAttrChaned) {
                this.setState(function (nowState) {
                    return { value: _this2.props.targetattr.nowValue() };
                });
            }
        }
    }, {
        key: 'rednerEditor',
        value: function rednerEditor(theAttr) {
            if (theAttr.setFun == null) {
                return React.createElement(
                    'div',
                    { className: 'form-control-plaintext text-light', id: theAttr.inputID },
                    this.state.value
                );
            }
            return React.createElement('input', { type: 'text', className: 'form-control', id: theAttr.inputID, value: this.state.value, onChange: this.editorChanged, attrname: theAttr.name });
        }
    }, {
        key: 'render',
        value: function render() {
            var theAttr = this.props.targetattr;
            return React.createElement(
                'div',
                { key: theAttr.name, className: 'bg-dark d-flex align-items-center' },
                React.createElement(
                    'label',
                    { htmlFor: theAttr.inputID, className: 'col-sm-4 col-form-label text-light' },
                    theAttr.label
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 p-1 border-left border-secondary' },
                    this.rednerEditor(theAttr)
                )
            );
        }
    }, {
        key: 'editorChanged',
        value: function editorChanged(ev) {
            var editorElem = ev.target;
            var newVal = null;
            if (editorElem.tagName.toUpperCase() === 'INPUT') {
                newVal = editorElem.value;
            }
            this.props.targetattr.setFun(newVal);
        }
    }]);

    return AttributeEditor;
}(React.PureComponent);