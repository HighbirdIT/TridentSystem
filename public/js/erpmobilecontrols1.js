'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ctrlCurrentComponent_map = {};
var gFixedContainerRef = React.createRef();
var gFixedItemCounter = 0;

var HashKey_FixItem = 'fixitem';

window.onhashchange = function () {
    var fixedItemNum = 0;
    if (location.hash.length > 0) {
        var nowHash = location.hash.replace('#', '');
        var hash_arr = nowHash.split(',');
        for (var si in hash_arr) {
            var tem_arr = hash_arr[si].split('=');
            if (tem_arr.length == 2) {
                switch (tem_arr[0]) {
                    case HashKey_FixItem:
                        fixedItemNum = parseInt(tem_arr[1]);
                        break;
                }
            }
        }
    }
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.setItemCount(fixedItemNum);
    }
};

function setLocHash(hashName, hashVal) {
    var nowHash = location.hash;
    var newHash;
    if (nowHash.length >= 0) {
        nowHash = nowHash.replace('#', '');
        var hash_arr = nowHash.length == 0 ? [] : nowHash.split(',');
        var found = false;
        for (var si in hash_arr) {
            var tem_arr = hash_arr[si].split('=');
            if (tem_arr.length == 2) {
                if (tem_arr[0] == hashName) {
                    if (hashVal == null) {
                        hash_arr.splice(si, 1);
                    } else {
                        hash_arr[si] = hashName + '=' + hashVal;
                    }
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            if (hashVal != null) {
                hash_arr.push(hashName + '=' + hashVal);
            }
        }
        newHash = hash_arr.join(',');
    } else {
        newHash = hashName + '=' + hashVal;
    }
    location.hash = newHash;
}

var FixedContainer = function (_React$PureComponent) {
    _inherits(FixedContainer, _React$PureComponent);

    function FixedContainer(props) {
        _classCallCheck(this, FixedContainer);

        var _this = _possibleConstructorReturn(this, (FixedContainer.__proto__ || Object.getPrototypeOf(FixedContainer)).call(this, props));

        _this.state = {
            items_arr: []
        };
        _this.item_map = {};
        _this.banItemChange = false;
        return _this;
    }

    _createClass(FixedContainer, [{
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'setItemCount',
        value: function setItemCount(val) {
            var items_arr = this.state.items_arr;
            if (items_arr.length > 0) {
                items_arr = items_arr.concat();
                this.banItemChange = true;
                while (items_arr.length > val) {
                    var topItem = items_arr.pop();
                    if (topItem.ref.current) {
                        topItem.ref.current.foceClose();
                    }
                }
                this.banItemChange = false;
                this.setState({
                    items_arr: items_arr
                });
            }
        }
    }, {
        key: 'addItem',
        value: function addItem(target) {
            if (this.banItemChange) {
                return;
            }
            this.setState(function (state) {
                var index = state.items_arr.indexOf(target);
                if (index != -1) return state;
                setLocHash(HashKey_FixItem, state.items_arr.length + 1);
                return {
                    items_arr: state.items_arr.concat(target)
                };
            });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(target) {
            if (this.banItemChange) {
                return;
            }
            this.setState(function (state) {
                var index = state.items_arr.indexOf(target);
                if (index == -1) return state;
                var newArr = state.items_arr.concat();
                newArr.splice(index, 1);
                setLocHash(HashKey_FixItem, newArr.length == 0 ? null : newArr.length);
                return {
                    items_arr: newArr
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var items_arr = this.state.items_arr;
            if (items_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'd-fixed w-100 h-100 fixedBackGround' },
                items_arr.map(function (item) {
                    return item;
                })
            );
        }
    }]);

    return FixedContainer;
}(React.PureComponent);

function addFixedItem(target) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.addItem(target);
    }
}

function removeFixedItem(target) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.removeItem(target);
    }
}

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
    target.initState = {
        keyword: ''
    };
    target.componentWillUnmount = ERPC_Fun_ComponentWillUnmount.bind(target);
    target.componentWillMount = ERPC_Fun_ComponentWillMount.bind(target);
}

var ERPC_DropDown_PopPanel = function (_React$PureComponent2) {
    _inherits(ERPC_DropDown_PopPanel, _React$PureComponent2);

    function ERPC_DropDown_PopPanel(props) {
        _classCallCheck(this, ERPC_DropDown_PopPanel);

        var _this2 = _possibleConstructorReturn(this, (ERPC_DropDown_PopPanel.__proto__ || Object.getPrototypeOf(ERPC_DropDown_PopPanel)).call(this, props));

        autoBind(_this2);
        _this2.contentDivRef = React.createRef();
        _this2.state = {
            maxCount: 50
        };
        _this2.inited = false;
        return _this2;
    }

    _createClass(ERPC_DropDown_PopPanel, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this3 = this;

            var self = this;
            setTimeout(function () {
                self.inited = true;
                self.setState(_this3.props.dropdownctl.getPopPanelInitState());
            }, 50);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.inited = false;
        }
    }, {
        key: 'foceClose',
        value: function foceClose() {
            this.props.dropdownctl.dropDownClosed();
        }
    }, {
        key: 'clickCloseHandler',
        value: function clickCloseHandler() {
            this.props.dropdownctl.dropDownClosed();
        }
    }, {
        key: 'contentDivScrollHandler',
        value: function contentDivScrollHandler(ev) {
            if (this.contentDivRef.current) {
                var contentDiv = this.contentDivRef.current;
                var height = $(contentDiv).height();
                if ((contentDiv.scrollTop + height) / contentDiv.scrollHeight > 0.95) {
                    if (this.needListedCount > this.state.maxCount) {
                        this.setState({
                            maxCount: this.state.maxCount + 50
                        });
                    }
                    console.log('增加');
                }
            }
        }
    }, {
        key: 'groupListItemClick',
        value: function groupListItemClick(ev) {
            var target = ev.target;
            var value = getAttributeByNode(target, 'value', true, 3);
            if (value == null) {
                console.error('can not find value attr');
            }
            var index = getAttributeByNode(target, 'index', true, 3);
            if (value == null) {
                console.error('can not find index attr');
            }
            var gvname = 'gv' + index;
            var nowgv = this.state[gvname];
            var newState = {};
            newState[gvname] = nowgv == value ? null : value;
            this.setState(newState);
        }
    }, {
        key: 'listItemClick',
        value: function listItemClick(ev) {
            var target = ev.target;
            var value = getAttributeByNode(target, 'value', true, 3);
            if (value == null) {
                console.error('can not find value attr');
            }
            var options_arr = this.state.optionsData.options_arr;
            var theOptionItem = options_arr.find(function (item) {
                return item.value == value;
            });
            if (theOptionItem == null) {
                console.error('没有找到对应的item' + value);
            }
            this.props.dropdownctl.selectItem(theOptionItem);
        }
    }, {
        key: 'keyInputChanged',
        value: function keyInputChanged(ev) {
            var target = ev.target;
            var keyword = target.value;
            this.setState({ keyword: keyword });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var selectedVal = this.state.selectedVal;
            if (!this.inited) {
                return React.createElement(
                    'div',
                    { className: 'fixedBackGround' },
                    React.createElement(
                        'div',
                        { className: 'dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded' },
                        '.'
                    )
                );
            }
            var keyword = this.state.keyword.trim();
            var options_arr = this.state.optionsData.options_arr;
            var groupData_arr = this.state.optionsData.groupData_arr;
            var groupCount = groupData_arr == null ? 0 : groupData_arr.length;
            var groupPanels_arr = [];
            var gi = 0;
            var temName = null;
            var maxRowCount = this.state.maxCount;

            var searchItem = null;
            var contentElem = null;
            var recentElem = null;
            var recentItems_arr = [];
            if (this.state.fetching) {
                contentElem = React.createElement(
                    'div',
                    { className: 'd-flex align-items-center m-auto' },
                    '\u6B63\u5728\u83B7\u53D6\u6570\u636E',
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw fa-2x' })
                );
            } else {
                if (options_arr == null) {
                    options_arr = [];
                }
                var groupValues_arr = [];
                var groupItemCounter = {};
                for (gi = 0; gi < groupCount; ++gi) {
                    groupValues_arr.push(this.state['gv' + gi]);
                }
                var recentUsed = this.state.recentUsed;
                var recentValues_arr = this.state.recentValues_arr;

                if (recentValues_arr.length > 0) {
                    if (groupCount > 0) {
                        // 把最近使用放置在第一分组中
                        var firstGroup = groupData_arr[0];
                        if (firstGroup.options_map['_recent'] == null) {
                            firstGroup.options_arr.unshift({ text: '最近使用', value: '_recent' });
                            firstGroup.options_map['_recent'] = 1;
                        }
                        if (groupValues_arr[0] == null) {
                            groupValues_arr[0] = '_recent';
                        }
                    }
                }

                var filted_arr = options_arr;
                if (keyword.length > 0) {
                    maxRowCount = 100;
                    filted_arr = options_arr.filter(function (item) {
                        if (recentUsed.hasOwnProperty(item.value)) {
                            recentUsed[item.value] = item;
                        }
                        return item.text.indexOf(_this4.state.keyword) >= 0;
                    });
                } else {
                    if (groupCount > 0) {
                        filted_arr = filted_arr.filter(function (item) {
                            var isRecentUsed = recentUsed.hasOwnProperty(item.value);
                            if (isRecentUsed) {
                                recentUsed[item.value] = item;
                            }
                            for (gi = 0; gi < groupCount; ++gi) {
                                temName = 'g' + gi + item['g' + gi];
                                groupItemCounter[temName] = groupItemCounter[temName] == null ? 1 : groupItemCounter[temName] + 1;
                                var gSelectedVal = groupValues_arr[gi];
                                if (gi == 0 && gSelectedVal == '_recent') {
                                    return isRecentUsed;
                                }
                                if (groupValues_arr[gi] != null && groupValues_arr[gi] != item['g' + gi]) {
                                    return false;
                                }
                            }
                            return true;
                        });
                    } else if (recentValues_arr.length > 0) {
                        filted_arr.forEach(function (item) {
                            if (recentUsed.hasOwnProperty(item.value)) {
                                recentUsed[item.value] = item;
                            }
                        });
                    }
                }

                for (gi in recentValues_arr) {
                    var value = recentValues_arr[gi];
                    if (recentUsed[value]) {
                        recentItems_arr.push(recentUsed[value]);
                    }
                }
                if (recentItems_arr.length > 0) {
                    if (groupCount > 0) {
                        groupItemCounter['g0_recent'] = recentItems_arr.length;
                    } else if (keyword.length == 0) {
                        recentElem = [];
                        recentElem.push(React.createElement(
                            'div',
                            { className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 text-secondary', key: '_recentTip' },
                            React.createElement(
                                'div',
                                null,
                                '\u6700\u8FD1\u4F7F\u7528'
                            )
                        ));
                        recentItems_arr.forEach(function (item) {
                            recentElem.push(React.createElement(
                                'div',
                                { onClick: _this4.listItemClick, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : ''), key: '_ck' + item.value, value: item.value },
                                React.createElement(
                                    'div',
                                    null,
                                    item.text
                                )
                            ));
                        });
                        recentElem.push(React.createElement('div', { className: 'dropdown-divider', key: 'divider' }));
                    }
                }

                if (groupCount > 0) {
                    groupData_arr.forEach(function (groupData, index) {
                        var theOptions_arr = groupData.options_arr;
                        var gvSelectedVal = groupValues_arr[index];
                        var selectedActived = false;
                        var groupElem = React.createElement(
                            'div',
                            { className: 'list-group flex-grow-1 flex-shrink-0 autoScroll_Touch', key: groupData.name },
                            theOptions_arr.map(function (item, i) {
                                var count = groupItemCounter['g' + index + item.value];
                                if (count == null) {
                                    count = 0;
                                }
                                if (item.value != gvSelectedVal) {
                                    if (count == 0 && index > 0) {
                                        return null;
                                    }
                                }
                                var isSelected = item.value == gvSelectedVal;
                                return React.createElement(
                                    'div',
                                    { onClick: _this4.groupListItemClick, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (isSelected ? ' active' : ''), key: item.value, value: item.value, index: index },
                                    React.createElement(
                                        'div',
                                        null,
                                        item.text == null ? item.value : item.text,
                                        '(',
                                        count,
                                        ')'
                                    )
                                );
                            })
                        );
                        groupValues_arr.push(selectedActived ? gvSelectedVal : null);
                        groupPanels_arr.push(groupElem);
                    });
                }

                if (filted_arr.length == 0) {
                    contentElem = React.createElement(
                        'span',
                        { className: 'text-nowrap' },
                        '\u6CA1\u6709\u627E\u5230'
                    );
                }
                if (options_arr.length > 20) {
                    searchItem = React.createElement(
                        'div',
                        { className: 'd-flex flex-shrink-0 align-items-center' },
                        React.createElement('span', { className: 'fa fa-search fa-2x text-primary' }),
                        React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 flexinput', type: 'text', value: keyword, onChange: this.keyInputChanged })
                    );
                }

                this.needListedCount = filted_arr.length;

                if (filted_arr.length > 0) {
                    contentElem = React.createElement(
                        'div',
                        { ref: this.contentDivRef, className: 'list-group flex-grow-1 flex-shrink-0 autoScroll_Touch', onScroll: filted_arr.length > maxRowCount ? this.contentDivScrollHandler : null },
                        recentElem,
                        filted_arr.map(function (item, i) {
                            if (i >= maxRowCount) {
                                return null;
                            }
                            return React.createElement(
                                'div',
                                { onClick: _this4.listItemClick, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : ''), key: item.value, value: item.value },
                                React.createElement(
                                    'div',
                                    null,
                                    item.text
                                )
                            );
                        }),
                        filted_arr.length > maxRowCount ? React.createElement(
                            'div',
                            { className: 'text-nowrap' },
                            '\u52A0\u8F7D\u4E2D...'
                        ) : filted_arr.length < 5 ? null : React.createElement(
                            'div',
                            { className: 'text-nowrap' },
                            '\u4EE5\u4E0A\u5171',
                            filted_arr.length,
                            '\u6761'
                        )
                    );
                }
            }

            var finalContentElem = contentElem;
            if (groupPanels_arr.length > 0) {
                finalContentElem = React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1 autoScroll_Touch' },
                    groupPanels_arr,
                    contentElem,
                    React.createElement('div', { className: 'w-20p flex-grow-0 flex-shrink-0' })
                );
            } else {
                finalContentElem = React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1 autoScroll_Touch' },
                    contentElem
                );
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
                                { onClick: this.clickCloseHandler },
                                React.createElement('i', { className: 'fa fa-arrow-left text-primary' })
                            ),
                            React.createElement(
                                'span',
                                { className: 'text-primary' },
                                this.state.label
                            )
                        )
                    ),
                    searchItem,
                    finalContentElem
                )
            );
        }
    }]);

    return ERPC_DropDown_PopPanel;
}(React.PureComponent);

var ERPC_DropDown = function (_React$PureComponent3) {
    _inherits(ERPC_DropDown, _React$PureComponent3);

    function ERPC_DropDown(props) {
        _classCallCheck(this, ERPC_DropDown);

        var _this5 = _possibleConstructorReturn(this, (ERPC_DropDown.__proto__ || Object.getPrototypeOf(ERPC_DropDown)).call(this, props));

        autoBind(_this5);

        ERPControlBase(_this5);
        _this5.state = Object.assign(_this5.initState, {
            keyword: '',
            opened: false
        });

        _this5.editableInputRef = React.createRef();
        _this5.initState = null;
        _this5.contentDivRef = React.createRef();

        _this5.popPanelRef = React.createRef();
        _this5.popPanelItem = React.createElement(ERPC_DropDown_PopPanel, { ref: _this5.popPanelRef, dropdownctl: _this5, key: gFixedItemCounter++ });
        return _this5;
    }

    _createClass(ERPC_DropDown, [{
        key: 'dropDownOpened',
        value: function dropDownOpened() {
            var recentUsed = {};
            var recentValues_arr = [];
            if (this.props.recentCookieKey != null) {
                var cookieValue = Cookies.get(this.props.recentCookieKey);
                if (cookieValue != null && cookieValue.split != null) {
                    recentValues_arr = cookieValue.split(',').filter(function (e) {
                        return e != null && e.length > 0;
                    }).filter(function (e) {
                        if (e.length == 0) {
                            return false;
                        }
                        if (recentUsed.hasOwnProperty(e)) {
                            return false;
                        }
                        recentUsed[e] = null;
                        return true;
                    });
                }
            }
            this.recentValues_arr = recentValues_arr;
            this.recentUsed = recentUsed;
            addFixedItem(this.popPanelItem);

            this.setState({
                keyword: '',
                opened: true
            });
            var needFetch = false;
            if (this.props.pullDataSource) {
                this.props.pullDataSource();
                needFetch = true;
            }
        }
    }, {
        key: 'dropDownClosed',
        value: function dropDownClosed() {
            this.setState({ opened: false });
            removeFixedItem(this.popPanelItem);
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
        key: 'selectItem',
        value: function selectItem(theOptionItem) {
            var value = '';
            var text = '';
            if (theOptionItem) {
                value = theOptionItem.value.toString();
                text = theOptionItem.text;
            }
            if (this.props.recentCookieKey) {
                var index = this.recentValues_arr.indexOf(value);
                if (index != 0) {
                    if (index != -1) {
                        this.recentValues_arr.splice(index, 1);
                    }
                    this.recentValues_arr.unshift(value);
                    if (this.recentValues_arr.length >= 6) {
                        this.recentValues_arr.pop();
                    }
                    Cookies.set(this.props.recentCookieKey, this.recentValues_arr.join(','), { expires: 7 });
                }
            }
            this.dropDownClosed();
            store.dispatch(makeAction_setManyStateByPath({
                value: value,
                text: text
            }, MakePath(this.props.parentPath, this.props.id)));
        }
    }, {
        key: 'getPopPanelInitState',
        value: function getPopPanelInitState() {
            return {
                selectedVal: this.props.value,
                fetching: this.props.fetching,
                optionsData: this.props.optionsData,
                maxCount: 50,
                keyword: '',
                recentValues_arr: this.recentValues_arr,
                recentUsed: this.recentUsed,
                label: this.props.label
            };
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var hadMini = this.props.miniBtn != false;
            var selectedVal = this.props.value;
            var selectedText = this.props.text;
            if (selectedText == null) {
                selectedText = '请选择';
            }

            if (this.state.opened) {
                var popPanelRefCurrent = this.popPanelRef.current;
                if (popPanelRefCurrent) {
                    var newState = {
                        selectedVal: selectedVal,
                        fetching: this.props.fetching,
                        optionsData: this.props.optionsData
                    };
                    setTimeout(function () {
                        popPanelRefCurrent.setState(newState);
                    }, 50);
                }
            }
            //{this.renderPopPanel(selectedVal)}
            return React.createElement(
                'div',
                { className: "d-flex btn-group flex-grow-1 flex-shrink-0 erpc_dropdown", style: this.props.style, ref: this.rootDivRef },
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
                hadMini && React.createElement('button', { type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split' })
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

var selectERPC_DropDown_groupAttrName = function selectERPC_DropDown_groupAttrName(state, ownprops) {
    return ownprops.groupAttr;
};

var formatERPC_DropDown_options = function formatERPC_DropDown_options(orginData_arr, textAttrName, valueAttrName, groupAttr) {
    if (orginData_arr == null) {
        return [];
    }
    if (valueAttrName == null || valueAttrName.length == 0) {
        valueAttrName = textAttrName;
    }
    var groupName_arr = groupAttr == null ? [] : groupAttr.split(',');
    var groupData_arr = [];
    groupName_arr.forEach(function (n) {
        groupData_arr.push({
            name: n,
            options_arr: [],
            options_map: {}
        });
    });
    var rlt = {
        groupData_arr: groupData_arr
    };
    rlt.options_arr = orginData_arr.map(function (item) {
        var itemType = typeof item === 'undefined' ? 'undefined' : _typeof(item);
        if (itemType === 'string' || itemType === 'number') {
            return { text: item, value: item };
        }
        var newItem = { text: item[textAttrName], value: item[valueAttrName], data: item };
        groupData_arr.forEach(function (groupData, index) {
            var data = item[groupData.name];
            if (groupData.options_map[data] == null) {
                var option = { value: data };
                for (var startI = 0; startI < index; ++startI) {
                    option['g' + startI] = newItem['g' + startI];
                }
                groupData.options_arr.push(option);
                groupData.options_map[data] = 1;
            }
            newItem['g' + index] = data;
        });
        return newItem;
    });

    return rlt;
};

var ERPC_DropDown_optionsSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, formatERPC_DropDown_options);

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    if (ctlState.fetching) {
        console.log('ctlState.fetching');
    }
    return {
        value: ctlState.value,
        text: ctlState.text,
        fetching: ctlState.fetching,
        optionsData: ERPC_DropDown_optionsSelector(state, ownprops),
        visible: ctlState.visible
    };
}

function ERPC_DropDown_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var ERPC_Text = function (_React$PureComponent4) {
    _inherits(ERPC_Text, _React$PureComponent4);

    function ERPC_Text(props) {
        _classCallCheck(this, ERPC_Text);

        var _this6 = _possibleConstructorReturn(this, (ERPC_Text.__proto__ || Object.getPrototypeOf(ERPC_Text)).call(this));

        autoBind(_this6);

        ERPControlBase(_this6);
        _this6.state = _this6.initState;
        return _this6;
    }

    _createClass(ERPC_Text, [{
        key: 'inputChanged',
        value: function inputChanged(ev) {
            var text = ev.target.value;
            store.dispatch(makeAction_setStateByPath(text, MakePath(this.props.parentPath, this.props.id, 'value')));
        }
    }, {
        key: 'formatValue',
        value: function formatValue(val) {
            if (IsEmptyString(val)) {
                return '';
            }
            var type = this.props.type;
            var rlt = val;
            switch (type) {
                case 'int':
                    rlt = parseInt(val);
                    if (isNaN(rlt)) {
                        rlt = '';
                    }
                    break;
                case 'boolean':
                    rlt = parseBoolean(val) ? true : false;
                    break;
                case 'float':
                    var precision = tihs.props.precision == null ? 2 : parseInt(tihs.props.precision);
                    rlt = Math.round(val * Math.pow(10, precision));
                    if (isNaN(rlt)) {
                        rlt = '';
                    }
                    break;
                case 'date':
                case 'datetime':
                    if (!checkDate(val)) {
                        rlt = '';
                    }
                    break;
                case 'time':
                    if (!checkTime(val)) {
                        rlt = '';
                    }
                    break;
            }
            return rlt;
        }
    }, {
        key: 'formatInputValue',
        value: function formatInputValue(val) {
            if (IsEmptyString(val)) {
                return '';
            }
            var type = this.props.type;
            var rlt = val;
            switch (type) {
                case 'int':
                    rlt = parseInt(val);
                    if (isNaN(rlt)) {
                        rlt = '';
                    }
                    break;
                case 'float':
                    var precision = this.props.precision == null ? 2 : parseInt(this.props.precision);
                    rlt = Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
                    if (isNaN(rlt)) {
                        rlt = '';
                    }
                    break;
                case 'date':
                    if (val.length > 10) {
                        rlt = getFormatDateString(new Date(Date.parse(val)));
                    }
                    break;
            }
            return rlt;
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var contentElem = null;
            var rootDivClassName = 'd-flex flex-grow-1 flex-shrink-1';
            if (this.props.fetching) {
                contentElem = React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw' });
            } else {
                if (this.props.readonly) {
                    rootDivClassName += ' bg-secondary rounded border p-1';
                    var nowValue = this.props.value;
                    if (nowValue == null || nowValue.length == 0) {
                        rootDivClassName += ' text-secondary';
                        nowValue = '_';
                    } else {
                        rootDivClassName += ' text-light';
                    }
                    contentElem = React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        nowValue
                    );
                } else if (this.props.type == 'multiline') {
                    contentElem = React.createElement('textarea', { onChange: this.inputChanged, className: 'flex-grow-1 flex-shrink-1 form-control textarea-2x', value: this.props.value });
                } else {
                    var useType = this.props.type;
                    var useChecked = null;
                    switch (this.props.type) {
                        case 'string':
                            useType = 'text';
                            break;
                        case 'int':
                        case 'float':
                            useType = 'number';
                            break;
                        case 'boolean':
                            useType = 'checkbox';
                            useChecked = parseBoolean(useType);
                            break;
                    }
                    var useValue = this.formatInputValue(this.props.value);
                    contentElem = React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 form-control invalid ', type: useType, value: useValue, checked: useChecked, onChange: this.inputChanged });
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
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    return {
        value: ctlState.value == null ? '' : ctlState.value,
        fetching: ctlState.fetching,
        visible: ctlState.visible
    };
}

function ERPC_Text_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_LabeledControl = function (_React$PureComponent5) {
    _inherits(ERPC_LabeledControl, _React$PureComponent5);

    function ERPC_LabeledControl(props) {
        _classCallCheck(this, ERPC_LabeledControl);

        var _this7 = _possibleConstructorReturn(this, (ERPC_LabeledControl.__proto__ || Object.getPrototypeOf(ERPC_LabeledControl)).call(this));

        autoBind(_this7);

        ERPControlBase(_this7);
        _this7.state = _this7.initState;
        return _this7;
    }

    _createClass(ERPC_LabeledControl, [{
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'rowlFameOne' },
                React.createElement(
                    'div',
                    { className: 'rowlFameOne_Left' },
                    this.props.label
                ),
                React.createElement(
                    'div',
                    { className: 'rowlFameOne_right' },
                    this.props.children
                )
            );
        }
    }]);

    return ERPC_LabeledControl;
}(React.PureComponent);

function ERPC_LabeledControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    var useLabel = ownprops.label ? ownprops.label : ctlState.label ? ctlState.label : '未知名称';
    return {
        label: useLabel,
        fetching: ctlState.fetching,
        visible: ctlState.visible
    };
}

function ERPC_LabeledControl_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_Form = function (_React$PureComponent6) {
    _inherits(ERPC_Form, _React$PureComponent6);

    function ERPC_Form(props) {
        _classCallCheck(this, ERPC_Form);

        var _this8 = _possibleConstructorReturn(this, (ERPC_Form.__proto__ || Object.getPrototypeOf(ERPC_Form)).call(this));

        autoBind(_this8);

        ERPControlBase(_this8);
        _this8.state = _this8.initState;
        return _this8;
    }

    _createClass(ERPC_Form, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: this.props.className, style: this.props.style },
                '\\',
                this.props.children
            );
        }
    }]);

    return ERPC_Form;
}(React.PureComponent);

function ERPC_Form_mapstatetoprops(state, ownprops) {
    return {};
}

function ERPC_Form_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_Label = function (_React$PureComponent7) {
    _inherits(ERPC_Label, _React$PureComponent7);

    function ERPC_Label(props) {
        _classCallCheck(this, ERPC_Label);

        var _this9 = _possibleConstructorReturn(this, (ERPC_Label.__proto__ || Object.getPrototypeOf(ERPC_Label)).call(this));

        autoBind(_this9);

        ERPControlBase(_this9);
        _this9.state = _this9.initState;
        return _this9;
    }

    _createClass(ERPC_Label, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'span',
                { className: this.props.className },
                this.props.text
            );
        }
    }]);

    return ERPC_Label;
}(React.PureComponent);

function ERPC_Label_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    var useText = ctlState.text ? ctlState.text : ownprops.text ? ownprops.text : '';
    return {
        text: useText,
        visible: ctlState.visible
    };
}

function ERPC_Label_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_DropDown = null;
var VisibleERPC_Text = null;
var VisibleERPC_LabeledControl = null;
var VisibleERPC_Label = null;

function ErpControlInit() {
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
    VisibleERPC_LabeledControl = ReactRedux.connect(ERPC_LabeledControl_mapstatetoprops, ERPC_LabeledControl_dispatchtorprops)(ERPC_LabeledControl);
    VisibleERPC_Label = ReactRedux.connect(ERPC_Label_mapstatetoprops, ERPC_Label_dispatchtorprops)(ERPC_Label);
}

function ERPC_PageForm(target) {
    target.clickPreNavBtnHandler = ERPC_PageForm_clickPreNavBtnHandler.bind(target);
    target.clickNextNavBtnHandler = ERPC_PageForm_clickNextNavBtnHandler.bind(target);
    target.clickPlusNavBtnHandler = ERPC_PageForm_clickPlusNavBtnHandler.bind(target);
    target.clickUnPlusNavBtnHandler = ERPC_PageForm_clickUnPlusNavBtnHandler.bind(target);
    target.renderNavigater = ERPC_PageForm_renderNavigater.bind(target);
}

function ERPC_PageForm_clickPreNavBtnHandler() {
    var nowIndex = this.props.recordIndex;
    var count = this.props.records_arr == null ? 0 : this.props.records_arr.length;
    if (count <= 1) {
        return;
    }
    var newIndex = nowIndex - 1;
    if (newIndex < 0) {
        newIndex += count;
    }
    store.dispatch(makeAction_setStateByPath(newIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickNextNavBtnHandler() {
    var nowIndex = this.props.recordIndex;
    var count = this.props.records_arr == null ? 0 : this.props.records_arr.length;
    if (count <= 1) {
        return;
    }
    var newIndex = (nowIndex + 1) % count;
    store.dispatch(makeAction_setStateByPath(newIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickPlusNavBtnHandler() {
    this.prePlusIndex = this.props.recordIndex;
    store.dispatch(makeAction_setStateByPath(-1, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickUnPlusNavBtnHandler() {
    store.dispatch(makeAction_setStateByPath(this.prePlusIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_renderNavigater() {
    if (this.props.records_arr == null) {
        return null;
    }
    var count = this.props.records_arr.length;
    var plushBtnItem = null;
    var exitPlushBtnItem = null;
    var preBtnItem = null;
    var nextBtnItem = null;
    var infoItem = null;
    var nowIndex = this.props.recordIndex;
    var countInfo = count > 9999 ? '9999..' : count;
    var indexInfo = count == 0 ? '0' : nowIndex > 9999 ? '9999..' : nowIndex + 1;

    if (nowIndex != -1) {
        preBtnItem = React.createElement(
            'button',
            { type: 'button', onClick: this.clickPreNavBtnHandler, className: 'btn flex-grow-1 navigationBtn btn-info' },
            React.createElement('span', { className: 'fa fa-chevron-left' })
        );
        nextBtnItem = React.createElement(
            'button',
            { type: 'button', onClick: this.clickNextNavBtnHandler, className: 'btn flex-grow-1 navigationBtn btn-info' },
            React.createElement('span', { className: 'fa fa-chevron-right' })
        );
        infoItem = React.createElement(
            'span',
            { className: 'bg-info text-light d-flex align-items-center flex-shrink-1 p-1' },
            indexInfo,
            '/',
            countInfo
        );
    }

    if (this.canInsert) {
        if (nowIndex == -1) {
            exitPlushBtnItem = React.createElement(
                'button',
                { type: 'button', onClick: this.clickUnPlusNavBtnHandler, className: 'btn btn-danger flex-grow-1 navigationBtn' },
                React.createElement('span', { className: 'fa fa-undo' })
            );
        } else {
            plushBtnItem = React.createElement(
                'button',
                { type: 'button', onClick: this.clickPlusNavBtnHandler, className: 'btn btn-info flex-grow-1 navigationBtn' },
                React.createElement('span', { className: 'fa fa-plus' })
            );
        }
    }

    return React.createElement(
        'div',
        { className: 'btn-group' },
        preBtnItem,
        infoItem,
        nextBtnItem,
        plushBtnItem,
        exitPlushBtnItem
    );
}