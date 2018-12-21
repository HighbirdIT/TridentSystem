'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ctrlCurrentComponent_map = {};

function SetCurrentComponent(ctrlProps, component) {
    ctrlCurrentComponent_map[MakePath(ctrlProps.parentPath, ctrlProps.id)] = component;
}

function ERPC_Fun_ComponentWillUnmount() {
    SetCurrentComponent(this.props, null);
    if (this.cusComponentWillMount) {
        this.cusComponentWillMount();
    }
}

function ERPC_Fun_ComponentWillMount() {
    SetCurrentComponent(this.props, this);
    if (this.cusComponentWillUnmount) {
        this.cusComponentWillUnmount();
    }
}

function ERPControlBase(target) {
    target.rootDivRef = React.createRef();
    target.initState = {};
    target.componentWillUnmount = ERPC_Fun_ComponentWillUnmount.bind(target);
    target.componentWillMount = ERPC_Fun_ComponentWillMount.bind(target);
}

var ERPC_DropDown = function (_React$PureComponent) {
    _inherits(ERPC_DropDown, _React$PureComponent);

    function ERPC_DropDown(props) {
        _classCallCheck(this, ERPC_DropDown);

        var _this = _possibleConstructorReturn(this, (ERPC_DropDown.__proto__ || Object.getPrototypeOf(ERPC_DropDown)).call(this, props));

        autoBind(_this);

        ERPControlBase(_this);
        _this.state = Object.assign(_this.initState, {
            keyword: '',
            opened: false
        });

        _this.editableInputRef = React.createRef();
        _this.initState = null;
        return _this;
    }

    _createClass(ERPC_DropDown, [{
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
            }, MakePath(this.props.parentPath, this.props.id)));
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
                hadMini && React.createElement('button', { type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split' }),
                this.renderPopPanel(keyword, filted_arr, this.props.options_arr, selectedVal)
            );
        }
    }]);

    return ERPC_DropDown;
}(React.PureComponent);

var selectERPC_DropDown_options = function selectERPC_DropDown_options(state, ownprops) {
    if (ownprops.options_arr != null) {
        return ownprops.options_arr;
    }
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    return ctlState.options_arr;
};

var selectERPC_DropDown_textName = function selectERPC_DropDown_textName(state, ownprops) {
    return ownprops.textAttrName;
};

var selectERPC_DropDown_valueName = function selectERPC_DropDown_valueName(state, ownprops) {
    return ownprops.valueAttrName;
};

var formatERPC_DropDown_options = function formatERPC_DropDown_options(orginData_arr, textAttrName, valueAttrName) {
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

var ERPC_DropDown_optionsSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, formatERPC_DropDown_options);

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state.app, MakePath(ownprops.parentPath, ownprops.id), {});
    return {
        value: ctlState.value,
        text: ctlState.text,
        fetching: ctlState.fetching,
        options_arr: ERPC_DropDown_optionsSelector(state.app, ownprops)
    };
}

function ERPC_DropDown_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var ERPC_Text = function (_React$PureComponent2) {
    _inherits(ERPC_Text, _React$PureComponent2);

    function ERPC_Text(props) {
        _classCallCheck(this, ERPC_Text);

        var _this4 = _possibleConstructorReturn(this, (ERPC_Text.__proto__ || Object.getPrototypeOf(ERPC_Text)).call(this));

        autoBind(_this4);

        ERPControlBase(_this4);
        _this4.state = _this4.initState;
        return _this4;
    }

    _createClass(ERPC_Text, [{
        key: 'inputChanged',
        value: function inputChanged(ev) {
            var text = ev.target.value;
            store.dispatch(makeAction_setStateByPath(text, MakePath(this.props.parentPath, this.props.id, 'value')));
        }
    }, {
        key: 'render',
        value: function render() {
            var contentElem = null;
            var rootDivClassName = 'd-flex flex-grow-1 flex-shrink-1';
            if (this.props.fetching) {
                contentElem = React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw' });
            } else {
                if (this.props.readonly) {
                    rootDivClassName += ' bg-secondary rounded border';
                    contentElem = React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        this.props.value
                    );
                } else {
                    contentElem = React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 flexinput', type: 'text', value: this.props.text, onChange: this.inputChanged });
                }
            }
            return React.createElement(
                'div',
                { className: rootDivClassName, ref: this.rootDivRef },
                contentElem
            );
        }
    }]);

    return ERPC_Text;
}(React.PureComponent);

function ERPC_Text_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state.app, MakePath(ownprops.parentPath, ownprops.id), {});
    return {
        value: ctlState.value,
        fetching: ctlState.fetching
    };
}

function ERPC_Text_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_DropDown = null;
var VisibleERPC_Text = null;

function ErpControlInit() {
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
}