'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ERPC_DropDownControl = function (_React$PureComponent) {
    _inherits(ERPC_DropDownControl, _React$PureComponent);

    function ERPC_DropDownControl(props) {
        _classCallCheck(this, ERPC_DropDownControl);

        var _this = _possibleConstructorReturn(this, (ERPC_DropDownControl.__proto__ || Object.getPrototypeOf(ERPC_DropDownControl)).call(this, props));

        autoBind(_this);

        _this.state = {
            keyword: '',
            opened: false
        };

        _this.dropdownbtnRef = React.createRef();
        _this.editableInputRef = React.createRef();
        _this.dropmenudivRef = React.createRef();
        _this.rootDivRef = React.createRef();
        return _this;
    }

    _createClass(ERPC_DropDownControl, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'dropDownOpened',
        value: function dropDownOpened() {
            this.setState({
                keyword: '',
                opened: true
            });
            if (this.props.pullDataSource) {
                this.props.pullDataSource();
            }
        }
    }, {
        key: 'dropDownClosed',
        value: function dropDownClosed() {
            this.setState({ opened: false });
        }
    }, {
        key: 'keyInputChanged',
        value: function keyInputChanged(ev) {
            var target = ev.target;
            var keyword = target.value;
            //var selectedOpt = this.state.options_arr.find(item=>{return item.text == keyword});
            this.setState({ keyword: keyword });
            /*
            if(this.props.editable){
                this.setState({ keyword: keyword,
                    selectedOption:selectedOpt,});
            }
            else{
                if(selectedOpt){
                    this.setState({ keyword: keyword,
                        selectedOption:selectedOpt, });
                }
                else{
                    this.setState({ keyword: keyword });
                }
            }
            */
        }
    }, {
        key: 'listItemClick',
        value: function listItemClick(ev) {
            var target = ev.target;
            var value = getAttributeByNode(target, 'value', true, 3);
            if (value == null) {
                console.error('can not find value attr');
            }

            var theOptionItem = this.props.options_arr.find(function (item) {
                return item.value == value;
            });
            if (theOptionItem == null) {
                console.error('没有找到对应的item' + value);
            }
            this.setState({ opened: false });
            store.dispatch(makeAction_setManyStateByPath({
                value: theOptionItem.value,
                text: theOptionItem.text
            }, this.props.parentPath + '.' + this.props.ctrlID));
        }
    }, {
        key: 'clickOpenHandler',
        value: function clickOpenHandler() {
            if (!this.state.opened) {
                this.dropDownOpened();
            } else {
                this.dropDownClosed();
            }
        }
    }, {
        key: 'clickCloseHandler',
        value: function clickCloseHandler() {
            this.dropDownClosed();
        }
    }, {
        key: 'renderPopPanel',
        value: function renderPopPanel(keyword, filted_arr, item_arr, selectedVal) {
            var _this2 = this;

            if (!this.state.opened) {
                return null;
            }

            var searchItem = null;
            var contentElem = null;
            if (this.props.fetching) {
                contentElem = React.createElement(
                    'div',
                    { className: 'd-flex align-items-center' },
                    '\u6B63\u5728\u83B7\u53D6\u6570\u636E',
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw fa-2x' })
                );
            } else {
                if (item_arr.length > 20) {
                    searchItem = React.createElement(
                        'div',
                        { className: 'd-flex flex-shrink-0 align-items-center' },
                        React.createElement(
                            'span',
                            { className: 'badge badge-primary' },
                            '\u641C\u7D22:'
                        ),
                        React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 flexinput', type: 'text', value: keyword, onChange: this.keyInputChanged })
                    );
                }

                if (filted_arr.length > 0) {
                    contentElem = React.createElement(
                        'div',
                        { className: 'list-group flex-grow-1 flex-shrink-1 autoScroll' },
                        filted_arr.map(function (item, i) {
                            return React.createElement(
                                'div',
                                { onClick: _this2.listItemClick, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : ''), key: item.value, value: item.value },
                                React.createElement(
                                    'div',
                                    null,
                                    item.text
                                )
                            );
                        })
                    );
                } else {
                    contentElem = React.createElement(
                        'span',
                        null,
                        '\u6CA1\u6709\u627E\u5230\u7B26\u5408\u6761\u4EF6\u7684\u9009\u9879'
                    );
                }
            }

            return React.createElement(
                'div',
                { className: 'fixedBackGround' },
                React.createElement(
                    'div',
                    { className: 'dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-shrink-0' },
                        React.createElement(
                            'h3',
                            null,
                            React.createElement(
                                'span',
                                { className: 'badge badge-primary' },
                                this.props.label
                            )
                        ),
                        React.createElement('h3', { className: 'flex-grow-1 flex-shrink-1' }),
                        React.createElement(
                            'h3',
                            { onClick: this.clickCloseHandler },
                            React.createElement(
                                'span',
                                { className: 'badge badge-primary' },
                                React.createElement('i', { className: 'fa fa-close' })
                            )
                        )
                    ),
                    searchItem,
                    contentElem
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var hadMini = this.props.miniBtn != false;
            var keyword = this.state.keyword.trim();
            var filted_arr = this.props.options_arr;
            if (keyword.length > 0) {
                filted_arr = this.props.options_arr.filter(function (item) {
                    return item.text.indexOf(_this3.state.keyword) >= 0;
                });
            }
            var selectedVal = this.props.value;
            var selectedText = this.props.text;
            if (selectedText == null) {
                selectedText = '请选择';
            }
            return React.createElement(
                'div',
                { className: "d-flex btn-group flex-grow-1 flex-shrink-1 erpc_dropdown", style: this.props.style, ref: this.rootDivRef },
                this.props.editable ? React.createElement('input', { onFocus: this.editableInputFocushandler, ref: this.editableInputRef, type: 'text', className: 'flex-grow-1 flex-shrink-1 flexinput', onChange: this.keyChanged, value: selectedOption ? selectedOption.text : this.state.keyword }) : React.createElement(
                    'button',
                    { onClick: this.clickOpenHandler, type: 'button', className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1 erpc_dropdownMainBtn' + (selectedVal == null ? ' text-danger' : ''), hadmini: hadMini ? 1 : null },
                    React.createElement(
                        'div',
                        { style: { overflow: 'hidden' }, className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(
                            'div',
                            null,
                            selectedText
                        )
                    )
                ),
                hadMini && React.createElement('button', { ref: this.dropdownbtnRef, type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split' }),
                this.renderPopPanel(keyword, filted_arr, this.props.options_arr, selectedVal)
            );
        }
    }]);

    return ERPC_DropDownControl;
}(React.PureComponent);

var selectERPC_DropDownControl_options = function selectERPC_DropDownControl_options(state, ownprops) {
    if (ownprops.options_arr != null) {
        return ownprops.options_arr;
    }
    var ctlState = getStateByPath(state, ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return ctlState.options_arr;
};

var selectERPC_DropDownControl_textName = function selectERPC_DropDownControl_textName(state, ownprops) {
    return ownprops.textAttrName;
};

var selectERPC_DropDownControl_valueName = function selectERPC_DropDownControl_valueName(state, ownprops) {
    return ownprops.valueAttrName;
};

var formatERPC_DropDownControl_options = function formatERPC_DropDownControl_options(orginData_arr, textAttrName, valueAttrName) {
    if (orginData_arr == null) {
        return [];
    }
    if (valueAttrName == null || valueAttrName.length == 0) {
        valueAttrName = textAttrName;
    }
    return orginData_arr.map(function (item) {
        var itemType = typeof item === 'undefined' ? 'undefined' : _typeof(item);
        return itemType === 'string' || itemType === 'number' ? { text: item, value: item } : { text: item[textAttrName], value: item[valueAttrName], data: item };
    });
};

var ERPC_DropDownControl_optionsSelector = Reselect.createSelector(selectERPC_DropDownControl_options, selectERPC_DropDownControl_textName, selectERPC_DropDownControl_valueName, formatERPC_DropDownControl_options);

function ERPC_DropDownControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state.app, ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return {
        value: ctlState.value,
        text: ctlState.text,
        fetching: ctlState.fetching,
        options_arr: ERPC_DropDownControl_optionsSelector(state.app, ownprops)
    };
}

function ERPC_DropDownControl_dispatchtoprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {};
}

var VisibleERPC_DropDownControl = null;

function ErpControlInit() {
    VisibleERPC_DropDownControl = ReactRedux.connect(ERPC_DropDownControl_mapstatetoprops, ERPC_DropDownControl_dispatchtoprops)(ERPC_DropDownControl);
}