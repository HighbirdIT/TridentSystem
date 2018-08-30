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

        autoBind(_this);

        var initState = {
            value: _this.getAttrNowValue(),
            targetobj: _this.props.targetobj
        };
        _this.state = initState;
        return _this;
    }

    _createClass(AttributeEditor, [{
        key: 'getAttrNowValue',
        value: function getAttrNowValue() {
            var rlt = this.props.targetobj.getAttribute(this.getRealAttrName());
            return rlt == null ? '' : rlt;
        }
    }, {
        key: 'getRealAttrName',
        value: function getRealAttrName() {
            return this.props.targetattr.name + (this.props.index == null ? '' : this.props.index);
        }
    }, {
        key: 'getRealAttrLabel',
        value: function getRealAttrLabel() {
            return this.props.targetattr.label + (this.props.index == null ? '' : this.props.index);
        }
    }, {
        key: 'getRealAttrInputID',
        value: function getRealAttrInputID() {
            return this.props.targetattr.inputID + (this.props.index == null ? '' : this.props.index);
        }
    }, {
        key: 'listenTarget',
        value: function listenTarget(target) {
            target.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'unlistenTarget',
        value: function unlistenTarget(target) {
            target.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenTarget(this.props.targetobj);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.targetobj);
        }
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var _this2 = this;

            var myAttrName = this.getRealAttrName();
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
                    return { value: _this2.getAttrNowValue() };
                });
            }
        }
    }, {
        key: 'itemChangedHandler',
        value: function itemChangedHandler(newItem) {
            this.props.targetobj.setAttribute(this.getRealAttrName(), newItem);
        }
    }, {
        key: 'rednerEditor',
        value: function rednerEditor(theAttr, attrName, inputID) {
            if (!theAttr.editable) {
                return React.createElement(
                    'div',
                    { className: 'form-control-plaintext text-light', id: inputID },
                    this.state.value
                );
            }
            var realAttrName = this.getRealAttrName();
            if (theAttr.options_arr != null) {
                return React.createElement(DropDownControl, { options_arr: theAttr.options_arr, value: this.state.value, itemChanged: this.itemChangedHandler });
            }
            return React.createElement('input', { type: 'text', className: 'form-control', id: inputID, value: this.state.value, onChange: this.editorChanged, attrname: attrName });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.state.targetobj != this.props.targetobj) {
                var self = this;
                self.unlistenTarget(this.state.targetobj);
                setTimeout(function () {
                    self.setState({
                        targetobj: self.props.targetobj,
                        value: self.getAttrNowValue()
                    });
                    self.listenTarget(_this3.props.targetobj);
                }, 1);
                return null;
            }
            var theAttr = this.props.targetattr;
            var attrName = this.getRealAttrName();
            var label = this.getRealAttrLabel();
            var inputID = this.getRealAttrInputID();
            return React.createElement(
                'div',
                { key: attrName, className: 'bg-dark d-flex align-items-center' },
                React.createElement(
                    'label',
                    { htmlFor: inputID, className: 'col-sm-4 col-form-label text-light' },
                    label
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 p-1 border-left border-secondary' },
                    this.rednerEditor(theAttr, attrName, inputID)
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
            this.props.targetobj.setAttribute(this.getRealAttrName(), newVal);
        }
    }]);

    return AttributeEditor;
}(React.PureComponent);

var AttributeGroup = function (_React$PureComponent2) {
    _inherits(AttributeGroup, _React$PureComponent2);

    function AttributeGroup(props) {
        _classCallCheck(this, AttributeGroup);

        var _this4 = _possibleConstructorReturn(this, (AttributeGroup.__proto__ || Object.getPrototypeOf(AttributeGroup)).call(this, props));

        autoBind(_this4);

        var initState = {
            target: _this4.props.target
        };
        _this4.state = initState;
        return _this4;
    }

    _createClass(AttributeGroup, [{
        key: 'clickAddBtnHandler',
        value: function clickAddBtnHandler(ev) {
            var attrName = ev.target.getAttribute('attrname');
            if (attrName == null) {
                attrName = ev.target.parentNode.getAttribute('attrname');
                if (attrName == null) return;
            }
            var newCount = this.state.target.growAttrArray(attrName);
            this.setState({
                count: newCount
            });
        }
    }, {
        key: 'renderAttribute',
        value: function renderAttribute(attr) {
            var target = this.state.target;
            if (attr.isArray) {
                var rlt_arr = [];
                var count = target.getAttrArrayCount(attr.name);
                for (var i = 0; i < count; ++i) {
                    rlt_arr.push(React.createElement(AttributeEditor, { key: attr.name + i, targetattr: attr, targetobj: target, index: i }));
                }
                rlt_arr.push(React.createElement(
                    'button',
                    { key: 'addBtn', attrname: attr.name, onClick: this.clickAddBtnHandler, type: 'button', className: 'btn btn-dark' },
                    React.createElement('span', { className: 'icon icon-plus' })
                ));
                return rlt_arr;
            }
            return React.createElement(AttributeEditor, { key: attr.name, targetattr: attr, targetobj: target });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var self = this;
            if (this.state.target != this.props.target) {
                setTimeout(function () {
                    self.setState({
                        target: _this5.props.target
                    });
                }, 1);
                return null;
            }
            var projectName = this.props.projectName;
            var attrGroup = this.props.attrGroup;
            var attrGroupIndex = this.props.attrGroupIndex;
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'button',
                    { type: 'button', 'data-toggle': 'collapse', 'data-target': "#attrGroup" + projectName + attrGroup.label, className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' + (attrGroupIndex >= 0 ? '' : ' collapsed'), style: { borderRadius: '0em', height: '2.5em' } },
                    attrGroup.label
                ),
                React.createElement(
                    'div',
                    { id: "attrGroup" + projectName + attrGroup.label, className: "list-group flex-grow-0 flex-shrink-0 collapse" + (attrGroupIndex >= 0 ? ' show' : '') },
                    attrGroup.attrs_arr.map(function (attr) {
                        return _this5.renderAttribute(attr);
                    })
                )
            );
        }
    }]);

    return AttributeGroup;
}(React.PureComponent);