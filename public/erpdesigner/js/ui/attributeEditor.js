'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
            var rlt = this.props.targetobj.getAttribute(this.props.targetattr.name, this.props.index);
            if (rlt == null) {
                switch (this.props.targetattr.valueType) {
                    case ValueType.StyleValues:
                        rlt = {};
                        break;
                    default:
                        rlt = '';
                }
            } else {
                if ((typeof rlt === 'undefined' ? 'undefined' : _typeof(rlt)) === 'object') {
                    rlt = Object.assign({}, rlt);
                }
            }
            return rlt;
        }
    }, {
        key: 'getRealAttrName',
        value: function getRealAttrName() {
            return this.props.targetattr.name + (this.props.index == null ? '' : '_' + this.props.index);
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

            var myAttrName = this.props.targetattr.name;
            var match = function match(pattern) {
                return typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
            };
            var isMyAttrChaned = false;
            if (typeof ev.name === 'string') {
                isMyAttrChaned = ev.name == myAttrName;
                if (isMyAttrChaned && this.props.index >= 0) {
                    isMyAttrChaned = this.props.index == ev.index;
                }
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
        key: 'doSetAttribute',
        value: function doSetAttribute(newValue) {
            this.props.targetobj.setAttribute(this.props.targetattr.name, newValue, this.props.index);
        }
    }, {
        key: 'itemChangedHandler',
        value: function itemChangedHandler(newItem) {
            this.doSetAttribute(newItem);
        }
    }, {
        key: 'renderStyleAttrEditor',
        value: function renderStyleAttrEditor(nowVal, theAttr, attrName, inputID) {
            var nameDDCValue = ReplaceIfNull(nowVal.name, '');
            var valueElem = null;
            var setting = StyleAttrSetting[nameDDCValue];
            if (setting != null) {
                var value = ReplaceIfNull(nowVal.value, setting.def);
                if (setting.options_arr) {
                    valueElem = React.createElement(DropDownControl, { options_arr: setting.options_arr, value: value, itemChanged: this.styleValueDDCChanged });
                } else {
                    var inputType = 'text';
                    switch (setting.type) {
                        case ValueType.Boolean:
                            inputType = 'checkbox';
                            break;
                    }

                    valueElem = React.createElement('input', { type: inputType, className: 'form-control', checked: value, value: value, onChange: this.styleValueInputChanged });
                }
            }
            this.styleSetting = setting;
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement(DropDownControl, { options_arr: AttrNames.StyleAttrNames.values_arr, value: nameDDCValue, itemChanged: this.styleNameDDCChanged }),
                valueElem
            );
        }
    }, {
        key: 'styleValueInputChanged',
        value: function styleValueInputChanged(ev) {
            if (this.styleSetting == null) {
                return;
            }
            var inputElem = ev.target;
            var inputVal = null;
            switch (this.styleSetting.type) {
                case ValueType.Boolean:
                    inputVal = inputElem.checked;
                    break;
                default:
                    inputVal = inputElem.value;
            }
            var nowVal = this.state.value;

            nowVal.value = inputVal;
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'styleNameDDCChanged',
        value: function styleNameDDCChanged(newName) {
            var nowVal = this.state.value;
            nowVal.name = newName;
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'styleValueDDCChanged',
        value: function styleValueDDCChanged(newVal) {
            var nowVal = this.state.value;
            nowVal.value = newVal;
            this.doSetAttribute(nowVal);
        }
    }, {
        key: 'rednerEditor',
        value: function rednerEditor(theAttr, attrName, inputID) {
            var nowVal = this.state.value;
            if (theAttr.valueType == ValueType.StyleValues) {
                return this.renderStyleAttrEditor(nowVal, theAttr, attrName, inputID);
            }
            if (!theAttr.editable) {
                return React.createElement(
                    'div',
                    { className: 'form-control-plaintext text-light', id: inputID },
                    nowVal
                );
            }
            if (theAttr.options_arr != null) {
                return React.createElement(DropDownControl, { options_arr: theAttr.options_arr, value: nowVal, itemChanged: this.itemChangedHandler });
            }

            var inputType = 'text';
            switch (theAttr.valueType) {
                case ValueType.Boolean:
                    inputType = 'checkbox';
                    break;
            }
            return React.createElement('input', { type: inputType, className: 'form-control', id: inputID, checked: this.state.value, value: this.state.value, onChange: this.editorChanged, attrname: attrName });
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler(ev) {
            var newCount = this.props.targetobj.deleteAttrArrayItem(this.props.targetattr.name, this.getRealAttrName());
            if (this.props.onAttrArrayChanged) {
                this.props.onAttrArrayChanged(this.props.targetattr.name, newCount);
            }
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
            var deleteElem = this.props.index >= 0 ? React.createElement(
                'div',
                { onClick: this.clickTrashHandler, className: 'btn btn-dark flex-grow-0 flex-shrink-0' },
                React.createElement('i', { className: 'fa fa-trash text-danger' })
            ) : null;
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
                ),
                deleteElem
            );
        }
    }, {
        key: 'editorChanged',
        value: function editorChanged(ev) {
            var editorElem = ev.target;
            var newVal = null;
            var theAttr = this.props.targetattr;
            if (editorElem.tagName.toUpperCase() === 'INPUT') {
                newVal = editorElem.value;
                switch (theAttr.valueType) {
                    case ValueType.Boolean:
                        newVal = editorElem.checked;
                        break;
                    default:
                        newVal = editorElem.value;
                }
            }
            this.doSetAttribute(newVal);
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
            this.attrArrayChanged(attrName, newCount);
        }
    }, {
        key: 'attrArrayChanged',
        value: function attrArrayChanged(attrName, newCount) {
            var newState = {};
            newState[attrName + 'count'] = newCount;
            this.setState(newState);
        }
    }, {
        key: 'renderAttribute',
        value: function renderAttribute(attr) {
            var target = this.state.target;
            if (attr.isArray) {
                var rlt_arr = [];
                var attrArrayItem_arr = target.getAttrArrayList(attr.name);
                for (var i = 0; i < attrArrayItem_arr.length; ++i) {
                    var attrArrayItem = attrArrayItem_arr[i];
                    rlt_arr.push(React.createElement(AttributeEditor, { key: attrArrayItem.name, targetattr: attr, targetobj: target, index: attrArrayItem.index, onAttrArrayChanged: this.attrArrayChanged }));
                }
                rlt_arr.push(React.createElement(
                    'button',
                    { key: 'addBtn', attrname: attr.name, onClick: this.clickAddBtnHandler, type: 'button', className: 'btn btn-dark' },
                    React.createElement('span', { className: 'icon icon-plus' }),
                    attr.label
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