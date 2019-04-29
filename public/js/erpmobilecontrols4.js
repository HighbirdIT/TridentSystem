'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ctrlCurrentComponent_map = {};
var gFixedContainerRef = React.createRef();
var gFixedItemCounter = 0;
var gCusValidChecker_map = {};
var gPreconditionInvalidInfo = '前置条件不足';
var gCantNullInfo = '不能为空值';

var HashKey_FixItem = 'fixitem';

var DataCache = function () {
    function DataCache(label) {
        _classCallCheck(this, DataCache);

        this.label = label;
        this.data_map = {};
    }

    _createClass(DataCache, [{
        key: 'set',
        value: function set(key, value) {
            this.data_map[key] = value;
        }
    }, {
        key: 'get',
        value: function get(key) {
            return this.data_map[key];
        }
    }]);

    return DataCache;
}();

var gDataCache = new DataCache('global');

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

function ERPControlBase(target, initState) {
    target.rootDivRef = React.createRef();
    target.initState = initState == null ? {} : initState;
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
            var multiselect = this.state.multiselect;
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
            if (multiselect) {
                if (this.state.selectOpt.find(function (item) {
                    return item.value == theOptionItem.value;
                }) == null) {
                    this.props.dropdownctl.selectItem(this.state.selectOpt.concat(theOptionItem));
                }
            } else {
                this.props.dropdownctl.selectItem(theOptionItem);
            }
        }
    }, {
        key: 'clickSelectedItemTag',
        value: function clickSelectedItemTag(ev) {
            var target = ev.target;
            var value = getAttributeByNode(target, 'value', true, 3);
            if (value == null) {
                console.error('can not find value attr');
            }
            var selectedOption = this.state.selectOpt;
            var newArr = selectedOption.filter(function (item) {
                return item.value != value;
            });
            this.props.dropdownctl.selectItem(newArr);
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

            var multiselect = this.state.multiselect;
            var selectedVal = this.state.selectedVal;
            var selectedOption = this.state.selectOpt;
            if (multiselect) {
                if (selectedVal == null) {
                    selectedVal = [];
                }
            }
            //console.log(selectedElem);
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
            if (this.state.fetchingErr) {
                contentElem = renderFetcingErrDiv(this.state.fetchingErr.info);
            } else if (this.state.fetching) {
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
                var tItemSelected = false;
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
                            if (multiselect) {
                                tItemSelected = selectedVal.indexOf(item.value + '') != -1;
                            } else {
                                tItemSelected = item.value == selectedVal;
                            }
                            recentElem.push(React.createElement(
                                'div',
                                { onClick: _this4.listItemClick, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (tItemSelected ? ' active' : ''), key: '_ck' + item.value, value: item.value },
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

                var multiSelectedElem = null;
                if (multiselect) {
                    multiSelectedElem = React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0 mb-1 flex-wrap' },
                        selectedOption.map(function (item) {
                            return React.createElement(
                                'span',
                                { key: item.value, onClick: _this4.clickSelectedItemTag, value: item.value, className: 'border btn' },
                                item.text,
                                React.createElement('i', { className: 'fa fa-close' })
                            );
                        }),
                        React.createElement('input', { type: 'text', className: 'flex-grow-1 flex-shrink-0 multiddcsearchinput', placeholder: '\u641C\u7D22', value: keyword, onChange: this.keyInputChanged })
                    );
                }
                if (filted_arr.length == 0) {
                    contentElem = React.createElement(
                        'span',
                        { className: 'text-nowrap' },
                        '\u6CA1\u6709\u627E\u5230'
                    );
                }
                if (!multiselect && options_arr.length > 20) {
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
                            if (multiselect) {
                                tItemSelected = selectedVal.indexOf(item.value + '') != -1;
                            } else {
                                tItemSelected = item.value == selectedVal;
                            }
                            return React.createElement(
                                'div',
                                { onClick: _this4.listItemClick, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (tItemSelected ? ' active' : ''), key: item.value, value: item.value },
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
                                this.state.label,
                                multiselect ? '(可多选)' : ''
                            )
                        )
                    ),
                    multiSelectedElem,
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
            if (this.props.pullDataSource) {
                if (this.props.pullOnce != true || this.props.options_arr == null) {
                    this.props.pullDataSource();
                }
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
            if (this.props.fetching) {
                return;
            }
            if (!this.state.opened) {
                this.dropDownOpened();
            } else {
                this.dropDownClosed();
            }
        }
    }, {
        key: 'addSelectItem',
        value: function addSelectItem(theOptionItem) {
            if (theOptionItem == null || !this.props.multiselect) {
                return;
            }
        }
    }, {
        key: 'selectItem',
        value: function selectItem(theOptionItem) {
            var value = null;
            var text = null;
            var multiselect = this.props.multiselect;
            if (multiselect) {
                if (!Array.isArray(theOptionItem)) {
                    console.error("multiselect's selectItem theOptionItem must array!");
                }
                var values_arr = [];
                theOptionItem.forEach(function (item) {
                    values_arr.push(item.value);
                    //value = (value == null ? '' : value + ',') + item.value;
                    text = (text == null ? '' : text + ',') + item.text;
                });
                value = ERPXMLToolKit.convertToXmlString(values_arr, [this.props.valueAttrName]);
            } else {
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
            }

            if (!this.props.multiselect) {
                this.dropDownClosed();
            }

            var invalidInfo = BaseIsValueValid(null, null, null, value == null || text == null ? null : value, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setManyStateByPath({
                value: value,
                text: text,
                invalidInfo: invalidInfo,
                selectOpt: theOptionItem
            }, MakePath(this.props.parentPath, this.props.id)));
        }
    }, {
        key: 'getPopPanelInitState',
        value: function getPopPanelInitState() {
            var multiselect = this.props.multiselect;
            var selectedVal = this.props.value;
            if (multiselect) {}
            return {
                selectedVal: this.props.value,
                fetching: this.props.fetching,
                fetchingErr: this.props.fetchingErr,
                optionsData: this.props.optionsData,
                maxCount: 50,
                keyword: '',
                recentValues_arr: this.recentValues_arr,
                recentUsed: this.recentUsed,
                multiselect: this.props.multiselect,
                selectOpt: this.props.selectOpt,
                label: ReplaceIfNull(this.props.label, this.props.textAttrName)
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
            var self = this;
            var multiselect = this.props.multiselect;
            var selectedItems_arr;

            if (!IsEmptyString(selectedVal)) {
                if (IsEmptyString(selectedText)) {
                    if (this.props.fetchingErr != null) {
                        setTimeout(function () {
                            self.selectItem(null);
                        }, 50);
                    } else {
                        if (this.props.optionsData.options_arr == null) {
                            selectedVal = null;
                            if (!this.props.fetching) {
                                if (this.autoPullTO == null) {
                                    this.autoPullTO = setTimeout(function () {
                                        self.props.pullDataSource();
                                        self.autoPullTO = null;
                                    }, 50);
                                }
                            }
                        } else {
                            if (multiselect) {
                                selectedItems_arr = this.props.optionsData.options_arr.filter(function (item) {
                                    return selectedVal.indexOf(item.value + '') != -1;
                                });
                                selectedText = '';
                                selectedItems_arr.forEach(function (item) {
                                    selectedText += item.text;
                                });
                                setTimeout(function () {
                                    self.selectItem(selectedItems_arr);
                                }, 50);
                            } else {
                                var theOptionItem = this.props.optionsData.options_arr.find(function (item) {
                                    return item.value == selectedVal;
                                });
                                selectedText = theOptionItem ? theOptionItem.text : null;
                                setTimeout(function () {
                                    self.selectItem(theOptionItem);
                                }, 50);
                            }
                        }
                    }
                } else if (this.props.optionsData.options_arr) {
                    if (multiselect) {
                        selectedItems_arr = this.props.optionsData.options_arr.filter(function (item) {
                            return selectedVal.indexOf(item.value + '') != -1;
                        });
                        if (selectedItems_arr) {
                            if (selectedItems_arr.length != this.props.selectOpt.length) {
                                setTimeout(function () {
                                    self.selectItem(selectedItems_arr);
                                }, 50);
                            }
                        } else {
                            setTimeout(function () {
                                self.selectItem(null);
                            }, 50);
                        }
                    } else {
                        var selectedOptionItem = this.props.optionsData.options_arr.find(function (item) {
                            return item.value == selectedVal;
                        });
                        if (selectedOptionItem) {
                            if (selectedOptionItem.text != selectedText) {
                                setTimeout(function () {
                                    self.selectItem(selectedOptionItem);
                                }, 50);
                            }
                        } else {
                            setTimeout(function () {
                                self.selectItem(null);
                            }, 50);
                        }
                    }
                }
            }

            if (this.state.opened) {
                var popPanelRefCurrent = this.popPanelRef.current;
                if (popPanelRefCurrent) {
                    var newState = {
                        selectedVal: selectedVal,
                        fetching: this.props.fetching,
                        fetchingErr: this.props.fetchingErr,
                        optionsData: this.props.optionsData,
                        selectOpt: this.props.selectOpt
                    };
                    setTimeout(function () {
                        popPanelRefCurrent.setState(newState);
                    }, 50);
                }
            }
            var textElem = null;
            var textColor = '';
            if (!this.state.opened && this.props.fetching) {
                textElem = React.createElement(
                    'div',
                    { className: 'm-auto d-flex align-items-center' },
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw fa-2x' }),
                    React.createElement(
                        'div',
                        { className: 'text-nowrap' },
                        '\u52A0\u8F7D\u4E2D'
                    )
                );
            } else {
                textColor = selectedVal == null ? ' text-danger' : '';
                textElem = React.createElement(
                    'div',
                    null,
                    selectedText == null ? '请选择' : selectedText
                );
            }
            var errTipElem = null;
            if (this.props.invalidInfo) {
                errTipElem = React.createElement(
                    'span',
                    { className: 'text-danger' },
                    React.createElement('i', { className: 'fa fa-warning' }),
                    this.props.invalidInfo
                );
            }
            var dropDownElem = React.createElement(
                'div',
                { className: "d-flex btn-group flex-grow-1 flex-shrink-0 erpc_dropdown", style: this.props.style, ref: this.rootDivRef },
                this.props.editable ? React.createElement('input', { onFocus: this.editableInputFocushandler, ref: this.editableInputRef, type: 'text', className: 'flex-grow-1 flex-shrink-1 flexinput', onChange: this.keyChanged, value: selectedOption ? selectedOption.text : this.state.keyword }) : React.createElement(
                    'button',
                    { onClick: this.clickOpenHandler, type: 'button', className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1 erpc_dropdownMainBtn' + textColor, hadmini: hadMini ? 1 : null },
                    React.createElement(
                        'div',
                        { style: { overflow: 'hidden' }, className: 'flex-grow-1 flex-shrink-1' },
                        textElem
                    )
                ),
                hadMini && React.createElement('button', { type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split' })
            );
            if (errTipElem == null) {
                return dropDownElem;
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                dropDownElem,
                errTipElem
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

var selectERPC_DropDown_multiValues = function selectERPC_DropDown_multiValues(xmlstr) {
    return ERPXMLToolKit.extractColumn(xmlstr, 1);
};

var selectERPC_DropDown_value = function selectERPC_DropDown_value(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    return ctlState.value;
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

var selectERPC_DropDown_textType = function selectERPC_DropDown_textType(state, ownprops) {
    return ownprops.textType;
};

var formatERPC_DropDown_options = function formatERPC_DropDown_options(orginData_arr, textAttrName, valueAttrName, groupAttr, textType) {
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
        switch (textType) {
            case 'date':
                newItem.text = FormatStringValue(newItem.text, 'date');
                break;
        }
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

var ERPC_selector_map = {};

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var fullPath = MakePath(ownprops.parentPath, ownprops.id);
    var ctlState = getStateByPath(state, fullPath, {});
    if (ctlState.fetching) {
        console.log('ctlState.fetching');
    }
    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    if (useValue) {
        if (ownprops.multiselect) {
            if (useValue[0] == '<') {
                selectorid = fullPath + 'value';
                var valueSelector = ERPC_selector_map[selectorid];
                if (valueSelector == null) {
                    valueSelector = Reselect.createSelector(selectERPC_DropDown_value, selectERPC_DropDown_multiValues);
                    ERPC_selector_map[selectorid] = valueSelector;
                }
                //useValue = ERPXMLToolKit.extractColumn(useValue, 1);
                useValue = valueSelector(state, ownprops);
            } else {
                useValue = (useValue + '').split(',');
            }
        }
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: ctlState.selectOpt
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
            var invalidInfo = BaseIsValueValid(null, null, null, text, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setManyStateByPath({
                value: text,
                invalidInfo: invalidInfo
            }, MakePath(this.props.parentPath, this.props.id)));
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
        key: 'endInputHandler',
        value: function endInputHandler() {
            var invalidInfo = BaseIsValueValid(null, null, null, this.props.value, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setStateByPath(invalidInfo, MakePath(this.props.parentPath, this.props.id, 'invalidInfo')));
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var contentElem = null;
            var errTipElem = null;
            var rootDivClassName = 'd-flex ' + (this.props.class == null ? '' : this.props.class);
            if (this.props.fetching) {
                rootDivClassName += 'rounded border p-1';
                contentElem = React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw' }),
                    '\u901A\u8BAF\u4E2D'
                );
            } else if (this.props.fetchingErr) {
                rootDivClassName += 'rounded border p-1 text-danger';
                var errInfo = this.props.fetchingErr.info;
                if (errInfo == gPreconditionInvalidInfo) {
                    errInfo = '';
                }
                contentElem = React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement('i', { className: 'fa fa-warning' }),
                    errInfo
                );
            } else {
                if (this.props.readonly) {
                    rootDivClassName += ' bg-secondary rounded border p-1';
                    var nowValue = FormatStringValue(this.props.value, this.props.type, this.props.precision);
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
                } else if (this.props.type == 'string' && this.props.linetype != null && this.props.linetype != 'single') {
                    contentElem = React.createElement('textarea', { onChange: this.inputChanged, className: 'flex-grow-1 flex-shrink-1 w-100 form-control textarea-' + this.props.linetype, value: this.props.value, onBlur: this.endInputHandler });
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
                    contentElem = React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 form-control invalid ', type: useType, value: useValue, checked: useChecked, onChange: this.inputChanged, onBlur: this.endInputHandler });
                }

                if (this.props.invalidInfo) {
                    rootDivClassName += ' flex-column';
                    errTipElem = React.createElement(
                        'span',
                        { className: 'text-danger' },
                        React.createElement('i', { className: 'fa fa-warning' }),
                        this.props.invalidInfo
                    );
                }
            }
            return React.createElement(
                'div',
                { className: rootDivClassName, ref: this.rootDivRef, style: this.props.style },
                contentElem,
                errTipElem
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
        visible: ctlState.visible,
        fetchingErr: ctlState.fetchingErr,
        invalidInfo: ctlState.invalidInfo == gPreconditionInvalidInfo ? null : ctlState.invalidInfo
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
    var useLabel = ownprops.label != null ? ownprops.label : ctlState.label != null ? ctlState.label : '';
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
            if (this.props.visible == false) {
                return null;
            }
            var text = FormatStringValue(this.props.text, this.props.type, this.props.precision);
            return React.createElement(
                'span',
                { className: 'erpc_label ' + (this.props.className == null ? '' : this.props.className) },
                text
            );
        }
    }]);

    return ERPC_Label;
}(React.PureComponent);

function ERPC_Label_mapstatetoprops(state, ownprops) {
    var ctlPath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
    var ctlState = getStateByPath(state, ctlPath, {});
    var useText = ctlState.text ? ctlState.text : ownprops.text ? ownprops.text : '';
    return {
        text: useText,
        visible: ctlState.visible
    };
}

function ERPC_Label_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_CheckBox = function (_React$PureComponent8) {
    _inherits(ERPC_CheckBox, _React$PureComponent8);

    function ERPC_CheckBox(props) {
        _classCallCheck(this, ERPC_CheckBox);

        var _this10 = _possibleConstructorReturn(this, (ERPC_CheckBox.__proto__ || Object.getPrototypeOf(ERPC_CheckBox)).call(this));

        autoBind(_this10);

        ERPControlBase(_this10);
        _this10.state = _this10.initState;
        return _this10;
    }

    _createClass(ERPC_CheckBox, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            store.dispatch(makeAction_setManyStateByPath({
                value: this.checked ? 0 : 1
            }, MakePath(this.props.parentPath, this.props.id)));
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var checked = false;
            var value = this.props.value;
            if (value != null) {
                checked = !(value == false || value == 0 || value == 'false' || value == 'FALSE');
            }
            this.checked = checked;
            return React.createElement(
                'span',
                { className: 'erpc_checkbox ' + (this.props.className == null ? '' : this.props.className) },
                React.createElement(
                    'span',
                    { onClick: this.props.readonly ? null : this.clickHandler, className: 'fa-stack fa-lg' },
                    React.createElement('i', { className: "fa fa-square-o fa-stack-2x" + (this.props.readonly ? ' text-secondary' : '') }),
                    React.createElement('i', { className: 'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : ' fa-close text-danger') })
                )
            );
        }
    }]);

    return ERPC_CheckBox;
}(React.PureComponent);

function ERPC_CheckBox_mapstatetoprops(state, ownprops) {
    var ctlPath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
    var ctlState = getStateByPath(state, ctlPath, {});
    return {
        value: ctlState.value,
        visible: ctlState.visible
    };
}

function ERPC_CheckBox_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_Button = function (_React$PureComponent9) {
    _inherits(ERPC_Button, _React$PureComponent9);

    function ERPC_Button(props) {
        _classCallCheck(this, ERPC_Button);

        var _this11 = _possibleConstructorReturn(this, (ERPC_Button.__proto__ || Object.getPrototypeOf(ERPC_Button)).call(this));

        autoBind(_this11);

        ERPControlBase(_this11);
        _this11.state = _this11.initState;
        return _this11;
    }

    _createClass(ERPC_Button, [{
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var className = this.props.className;
            if (className.indexOf('flex-shrink-') == -1) {
                className += ' flex-shrink-0';
            }
            return React.createElement(
                'button',
                { className: className, onClick: this.props.onClick },
                this.props.children
            );
        }
    }]);

    return ERPC_Button;
}(React.PureComponent);

function ERPC_Button_mapstatetoprops(state, ownprops) {
    var ctlPath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
    var ctlState = getStateByPath(state, ctlPath, {});
    return {
        visible: ctlState.visible
    };
}

function ERPC_Button_dispatchtorprops(dispatch, ownprops) {
    return {
        onClick: ownprops.onClick
    };
}

var VisibleERPC_DropDown = null;
var VisibleERPC_Text = null;
var VisibleERPC_LabeledControl = null;
var VisibleERPC_Label = null;
var VisibleERPC_CheckBox = null;
var VisibleERPC_Button = null;

function ErpControlInit() {
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
    VisibleERPC_LabeledControl = ReactRedux.connect(ERPC_LabeledControl_mapstatetoprops, ERPC_LabeledControl_dispatchtorprops)(ERPC_LabeledControl);
    VisibleERPC_Label = ReactRedux.connect(ERPC_Label_mapstatetoprops, ERPC_Label_dispatchtorprops)(ERPC_Label);
    VisibleERPC_CheckBox = ReactRedux.connect(ERPC_CheckBox_mapstatetoprops, ERPC_CheckBox_dispatchtorprops)(ERPC_CheckBox);
    VisibleERPC_Button = ReactRedux.connect(ERPC_Button_mapstatetoprops, ERPC_Button_dispatchtorprops)(ERPC_Button);
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
        { className: 'btn-group flex-grow-0 flex-shrink-0' },
        preBtnItem,
        infoItem,
        nextBtnItem,
        plushBtnItem,
        exitPlushBtnItem
    );
}

function ERPC_GridForm(target) {
    target.rowPerPageChangedHandler = ERPC_GridForm_RowPerPageChangedHandler.bind(target);
    target.pageIndexChangedHandler = ERPC_GridForm_PageIndexChangedHandler.bind(target);
    target.prePageClickHandler = ERPC_GridForm_PrePageClickHandler.bind(target);
    target.nxtPageClickHandler = ERPC_GridForm_NxtPageClickHandler.bind(target);
    target.setRowPerPage = ERPC_GridForm_SetRowPerPage.bind(target);
    target.setPageIndex = ERPC_GridForm_SetPageIndex.bind(target);
}

function ERPC_GridForm_RowPerPageChangedHandler(ev) {
    this.setRowPerPage(ev.target.value);
}

function ERPC_GridForm_PageIndexChangedHandler(ev) {
    this.setPageIndex(ev.target.value);
}

function ERPC_GridForm_PrePageClickHandler(ev) {
    this.setPageIndex(this.props.pageIndex - 1);
}

function ERPC_GridForm_NxtPageClickHandler(ev) {
    this.setPageIndex(this.props.pageIndex + 1);
}

function ERPC_GridForm_SetRowPerPage(value) {
    if (value == this.props.rowPerPage) {
        return;
    }
    value = parseInt(value);
    var pageCount = Math.ceil(this.props.records_arr.length / value);
    var pageIndex = this.props.pageIndex >= pageCount ? pageCount - 1 : this.props.pageIndex;
    var pageIndexChanaged = pageIndex != this.props.pageIndex;
    var formPath = MakePath(this.props.parentPath, this.props.rowIndex == null ? null : 'row_' + this.props.rowIndex, this.props.id);
    store.dispatch(makeAction_setManyStateByPath({
        rowPerPage: value,
        pageIndex: pageIndex,
        pageCount: pageCount
    }, formPath));
    if (!pageIndexChanaged) {
        store.dispatch({ type: this.props.reBindAT });
    }
}

function ERPC_GridForm_SetPageIndex(value) {
    value = parseInt(value);
    if (value == this.props.pageIndex) {
        return;
    }
    if (value < 0) {
        value = this.props.pageCount - 1;
    } else if (value >= this.props.pageCount) {
        value = 0;
    }
    var statePath = MakePath(this.props.parentPath, this.props.rowIndex == null ? null : 'row_' + this.props.rowIndex, this.props.id, 'pageIndex');
    store.dispatch(makeAction_setStateByPath(value, statePath));
}

var CBaseGridFormNavBar = function (_React$PureComponent10) {
    _inherits(CBaseGridFormNavBar, _React$PureComponent10);

    function CBaseGridFormNavBar(props) {
        _classCallCheck(this, CBaseGridFormNavBar);

        return _possibleConstructorReturn(this, (CBaseGridFormNavBar.__proto__ || Object.getPrototypeOf(CBaseGridFormNavBar)).call(this, props));
    }

    _createClass(CBaseGridFormNavBar, [{
        key: 'render',
        value: function render() {
            var pageOptions_arr = [];
            for (var pi = 0; pi < this.props.pageCount; ++pi) {
                pageOptions_arr.push(React.createElement(
                    'option',
                    { key: pi, value: pi },
                    '\u7B2C',
                    pi + 1,
                    '\u9875'
                ));
            }
            return React.createElement(
                'div',
                { className: 'btn-group flex-shrink-0' },
                React.createElement(
                    'button',
                    { onClick: this.props.prePageClickHandler, type: 'button', className: 'btn btn-dark flex-grow-1' },
                    React.createElement('i', { className: 'fa fa-long-arrow-left' })
                ),
                React.createElement(
                    'button',
                    { onClick: this.props.nxtPageClickHandler, type: 'button', className: 'btn btn-dark flex-grow-1' },
                    React.createElement('i', { className: 'fa fa-long-arrow-right' })
                ),
                React.createElement(
                    'select',
                    { className: 'btn btn-dark', value: this.props.rowPerPage, onChange: this.props.rowPerPageChangedHandler },
                    React.createElement(
                        'option',
                        { value: 20 },
                        '20\u6761/\u9875'
                    ),
                    React.createElement(
                        'option',
                        { value: 50 },
                        '50\u6761/\u9875'
                    ),
                    React.createElement(
                        'option',
                        { value: 100 },
                        '100\u6761/\u9875'
                    ),
                    React.createElement(
                        'option',
                        { value: 200 },
                        '200\u6761/\u9875'
                    )
                ),
                React.createElement(
                    'select',
                    { className: 'btn btn-dark', value: this.props.pageIndex, onChange: this.props.pageIndexChangedHandler },
                    pageOptions_arr
                )
            );
        }
    }]);

    return CBaseGridFormNavBar;
}(React.PureComponent);

function BaseIsValueValid(nowState, visibleBelongState, ctlState, value, valueType, nullable, ctlID, validErrState) {
    if (visibleBelongState && visibleBelongState.visible == false) {
        // not visible is always valid
        return null;
    }
    if (ctlState != null) {
        if (ctlState.fetching) {
            return '等待通讯完成';
        } else if (ctlState.fetchingErr) {
            return ctlState.fetchingErr.info;
        }
    }
    if (nullable != true && IsEmptyString(value)) {
        return gCantNullInfo;
    }
    switch (valueType) {
        case 'int':
        case 'float':
            if (isNaN(value)) {
                return '必须是数字';
            }
            break;
        case 'date':
        case 'datetime':
            if (!checkDate(value)) {
                return '不是有效的日期格式';
            }
            break;
        case 'time':
            if (!checkTime(value)) {
                return '不是有效的时间格式';
            }
            break;
    }
    if (gCusValidChecker_map[ctlID]) {
        return gCusValidChecker_map[ctlID](value, nowState, validErrState);
    }
    return null;
}

var gCToastMangerRef = React.createRef();
var gCMessageBoxMangerRef = React.createRef();
function SendToast(info, type, timeTime) {
    if (gCToastMangerRef.current) {
        gCToastMangerRef.current.toast(info, type, timeTime);
    } else {
        console.warn('gCToastMangerRef为空');
    }
}

function PopMessageBox(text, type, title, btns, callBack) {
    if (gCMessageBoxMangerRef.current) {
        var msg = new MessageBoxItem(text, type, title, btns, callBack);
        gCMessageBoxMangerRef.current.addMessage(msg);
        return msg;
    } else {
        console.warn('gCMessageBoxMangerRef为空');
    }
}

var EToastTime = {
    Normal: 5,
    Long: 10,
    Small: 3
};

var EToastType = {
    Info: 'info',
    Warning: 'warning',
    Error: 'error'
};

var CToastManger = function (_React$PureComponent11) {
    _inherits(CToastManger, _React$PureComponent11);

    function CToastManger(props) {
        _classCallCheck(this, CToastManger);

        var _this13 = _possibleConstructorReturn(this, (CToastManger.__proto__ || Object.getPrototypeOf(CToastManger)).call(this, props));

        autoBind(_this13);

        _this13.state = {
            msg_arr: []
        };
        _this13.ticker = null;
        _this13.msgID = 0;
        return _this13;
    }

    _createClass(CToastManger, [{
        key: 'toast',
        value: function toast(info, type, timeTime) {
            if (info.length > 50) {
                info = info.substr(0, 50) + '……';
            }
            var newMsg = { text: info,
                timeType: timeTime == null ? EToastTime.Normal : timeTime,
                type: type == null ? EToastType.Info : type
            };
            newMsg.id = this.msgID++;
            this.setState({
                msg_arr: this.state.msg_arr.concat(newMsg)
            });
        }
    }, {
        key: 'tickHandler',
        value: function tickHandler() {
            var msg_arr = this.state.msg_arr;
            var new_arr = [];
            msg_arr.forEach(function (msg) {
                if (msg.time == null) {
                    msg.time = msg.timeType;
                    msg.opacity = 1;
                } else {
                    msg.time -= 0.2;
                    if (msg.time <= 1) {
                        msg.opacity = 0;
                    }
                }
                if (msg.time > 0) {
                    new_arr.push(msg);
                }
            });
            this.setState({
                msg_arr: new_arr
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var msg_arr = this.state.msg_arr;
            if (msg_arr.length == 0) {
                if (this.ticker) {
                    clearInterval(this.ticker);
                    this.ticker = null;
                }
                return null;
            }
            if (this.ticker == null) {
                this.ticker = setInterval(this.tickHandler, 200);
            }
            return React.createElement(
                'div',
                { className: 'toastMsgContainer' },
                msg_arr.map(function (msg, index) {
                    return React.createElement(
                        'div',
                        { key: msg.id, type: msg.type, className: 'toastMsg bg-light rounded shadow', style: { opacity: msg.opacity == null ? 0 : msg.opacity } },
                        msg.text
                    );
                })
            );
        }
    }]);

    return CToastManger;
}(React.PureComponent);

var EMessageBoxType = {
    Tip: 'tip',
    Warning: 'warning',
    Error: 'error',
    Loading: 'loading'
};

var EMessageBoxBtnType = {
    Ok: {
        label: '确认',
        key: 'OK',
        class: 'btn btn-success'
    },
    Aware: {
        label: '知道了',
        key: 'OK',
        class: 'btn btn-info'
    },
    Cancel: {
        label: '取消',
        key: 'CANCEL',
        class: 'btn btn-danger'
    }
};

var MessageBoxItem = function () {
    function MessageBoxItem(text, type, title, btns, callBack) {
        _classCallCheck(this, MessageBoxItem);

        this.type = type;
        this.text = text;
        this.btns = btns;
        this.title = title;
        this.callBack = callBack;
    }

    _createClass(MessageBoxItem, [{
        key: 'setData',
        value: function setData(text, type, title, btns) {
            var changed = false;
            if (type != this.type) {
                this.type = type;
                changed = true;
            }
            if (text != this.text) {
                this.text = text;
                changed = true;
            }
            if (title != this.title) {
                this.title = title;
                changed = true;
            }
            if (btns != this.btns) {
                this.btns = btns;
                changed = true;
            }
            if (changed) {
                this.fireChanged();
            }
        }
    }, {
        key: 'fireChanged',
        value: function fireChanged() {
            if (this.changedAct != null) {
                this.changedAct();
            }
        }
    }, {
        key: 'fireClose',
        value: function fireClose() {
            if (this.closeAct != null) {
                this.closeAct();
            }
        }
    }, {
        key: 'setType',
        value: function setType(val) {
            this.type = val;
            this.fireChanged();
        }
    }, {
        key: 'setText',
        value: function setText(val) {
            this.text = val;
            this.fireChanged();
        }
    }, {
        key: 'setTitle',
        value: function setTitle(val) {
            this.title = val;
            this.fireChanged();
        }
    }, {
        key: 'setBtns',
        value: function setBtns(val) {
            this.btns = val;
            this.fireChanged();
        }
    }]);

    return MessageBoxItem;
}();

var CMessageBox = function (_React$PureComponent12) {
    _inherits(CMessageBox, _React$PureComponent12);

    function CMessageBox(props) {
        _classCallCheck(this, CMessageBox);

        var _this14 = _possibleConstructorReturn(this, (CMessageBox.__proto__ || Object.getPrototypeOf(CMessageBox)).call(this, props));

        autoBind(_this14);

        _this14.state = {};
        _this14.props.msgItem.changedAct = _this14.msgItemChanedHandler;
        _this14.props.msgItem.closeAct = _this14.msgItemCloseHandler;
        return _this14;
    }

    _createClass(CMessageBox, [{
        key: 'msgItemChanedHandler',
        value: function msgItemChanedHandler(ev) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.msgItem.changedAct = null;
            this.props.msgItem.closeAct = null;

            if (this.timeInt) {
                clearInterval(this.timeInt);
                this.timeInt = null;
            }
        }
    }, {
        key: 'timerHander',
        value: function timerHander(ev) {
            var now = new Date().getTime();
            var pssSec = Math.round((now - this.startTime) / 100) / 10;
            this.setState({
                passSec: pssSec
            });
        }
    }, {
        key: 'clickBtnHandler',
        value: function clickBtnHandler(ev) {
            var msgItem = this.props.msgItem;
            this.props.manager.delete(this);
            if (msgItem.callBack) {
                msgItem.callBack(ev.target.getAttrbute('d-type'));
            }
        }
    }, {
        key: 'msgItemCloseHandler',
        value: function msgItemCloseHandler(ev) {
            this.props.manager.delete(this);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

            var msgItem = this.props.msgItem;
            var type = msgItem.type;

            var contentElem = null;
            var headerElem = null;
            var btnsElem = null;

            if (type == EMessageBoxType.Loading) {
                var passSec = 0;
                if (this.timeInt == null) {
                    this.startTime = new Date().getTime();
                    this.timeInt = setInterval(this.timerHander, 200);
                } else {
                    passSec = this.state.passSec;
                }
                headerElem = React.createElement(
                    'span',
                    null,
                    msgItem.title,
                    React.createElement(
                        'span',
                        { className: 'badge badge-primary' },
                        '\u5904\u7406\u4E2D'
                    ),
                    React.createElement('i', { className: 'fa fa-spinner fa-spin' }),
                    passSec,
                    's'
                );
                contentElem = React.createElement(
                    'p',
                    { className: 'messageBoxContent' },
                    msgItem.text
                );
            } else {
                if (this.timeInt != null) {
                    clearInterval(this.timeInt);
                    this.timeInt = null;
                }
                switch (type) {
                    case EMessageBoxType.Tip:
                        headerElem = React.createElement(
                            'span',
                            null,
                            React.createElement(
                                'span',
                                { className: 'badge badge-info' },
                                '\u4FE1\u606F'
                            ),
                            msgItem.title
                        );
                        break;
                    case EMessageBoxType.Error:
                        headerElem = React.createElement(
                            'span',
                            null,
                            React.createElement(
                                'span',
                                { className: 'badge badge-danger' },
                                '\u9519\u8BEF'
                            ),
                            msgItem.title
                        );
                        btnsElem = React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-danger' },
                            '\u4E86\u89E3'
                        );
                        break;
                    case EMessageBoxType.Warning:
                        headerElem = React.createElement(
                            'span',
                            null,
                            React.createElement(
                                'span',
                                { className: 'badge badge-warning' },
                                '\u8B66\u544A'
                            ),
                            msgItem.title
                        );
                        btnsElem = React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-warning' },
                            '\u4E86\u89E3'
                        );
                        break;
                }
                if (msgItem.btns == null) {
                    btnsElem = React.createElement(
                        'button',
                        { onClick: this.clickBtnHandler, 'd-type': EMessageBoxBtnType.Aware.key, type: 'button', className: EMessageBoxBtnType.Aware.class },
                        EMessageBoxBtnType.Aware.label
                    );
                } else {
                    btnsElem = msgItem.btns.map(function (btn) {
                        return React.createElement(
                            'button',
                            { onClick: _this15.clickBtnHandler, key: btn.label, 'd-type': btn.key, type: 'button', className: btn.class },
                            btn.label
                        );
                    });
                }
                contentElem = React.createElement(
                    'p',
                    { className: 'messageBoxContent' },
                    msgItem.text
                );
                /*
                iconElem = <i className='fa fa-window-close text-danger' />
                times-circle
                exclamation-circle
                commenting
                */
            }

            return React.createElement(
                'div',
                { className: 'messageBox autoScroll_Touch', tabIndex: '-1', role: 'dialog' },
                React.createElement(
                    'div',
                    { className: 'modal-content' },
                    React.createElement(
                        'div',
                        { className: 'modal-header' },
                        React.createElement(
                            'h5',
                            { className: 'modal-title' },
                            headerElem
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'modal-body' },
                        contentElem
                    ),
                    React.createElement(
                        'div',
                        { className: 'modal-footer' },
                        btnsElem
                    )
                )
            );
        }
    }]);

    return CMessageBox;
}(React.PureComponent);

var CMessageBoxManger = function (_React$PureComponent13) {
    _inherits(CMessageBoxManger, _React$PureComponent13);

    function CMessageBoxManger(props) {
        _classCallCheck(this, CMessageBoxManger);

        var _this16 = _possibleConstructorReturn(this, (CMessageBoxManger.__proto__ || Object.getPrototypeOf(CMessageBoxManger)).call(this, props));

        autoBind(_this16);

        _this16.state = {
            msg_arr: []
        };
        _this16.msgID = 0;
        return _this16;
    }

    _createClass(CMessageBoxManger, [{
        key: 'addMessage',
        value: function addMessage(msgItem) {
            this.setState({
                msg_arr: this.state.msg_arr.concat(msgItem)
            });
        }
    }, {
        key: 'delete',
        value: function _delete(item) {
            var newarr = this.state.msg_arr.filter(function (msg) {
                return item == msg;
            });
            this.setState({
                msg_arr: newarr
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this17 = this;

            var msg_arr = this.state.msg_arr;
            if (msg_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'messageBoxMask' },
                msg_arr.map(function (msg, index) {
                    return React.createElement(CMessageBox, { key: 1, msgItem: msg, manager: _this17 });
                })
            );
        }
    }]);

    return CMessageBoxManger;
}(React.PureComponent);

var ERPXMLToolKit = {
    createDocFromString: function createDocFromString(xmlString) {
        var xmlDoc = null;
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlString, "text/xml");
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlString);
        }
        return xmlDoc;
    },

    extractColumn: function extractColumn(xmldoc, colIndex) {
        var rlt = [];
        if (typeof xmldoc === 'string' && xmldoc[0] == '<') {
            xmldoc = ERPXMLToolKit.createDocFromString(xmldoc);
        }
        if (xmldoc == null || xmldoc.childNodes.length == 0) {
            return rlt;
        }
        var rootNode = xmldoc.childNodes[0];
        rootNode.childNodes.forEach(function (node) {
            if (node.nodeType != 1) {
                return;
            }
            var val = node.attributes['f' + colIndex];
            if (val != null) {
                rlt.push(val.value);
            }
            //console.log(val.value);
        });
        return rlt;
    },

    convertToXmlString: function convertToXmlString(item_arr, attrs_arr) {
        if (item_arr == null || item_arr.length == 0) {
            return '';
        }
        if (attrs_arr.length == 0) {
            console.error('convertToXmlString attrs_arr length==0');
        }
        var itemStr_arr = item_arr.map(function (item) {
            var itemType = typeof item === 'undefined' ? 'undefined' : _typeof(item);
            var valueStr = '';
            if (itemType === 'string' || itemType === 'number') {
                valueStr = '<Item f1="' + item + '" />';
            } else {
                valueStr = '<Item ';
                attrs_arr.forEach(function (attrName, i) {
                    var fName = 'f' + (i + 1);
                    valueStr += (i == 0 ? '' : ' ') + fName + '="' + item[attrName] + '"';
                });
                valueStr += ' />';
            }
            return valueStr;
        });
        var rltStr = '<Data fNum="' + attrs_arr.length + '"';
        attrs_arr.forEach(function (name, i) {
            rltStr += ' f' + (i + 1) + '="' + name + '"';
        });
        rltStr += '>' + itemStr_arr.join('') + '</Data>';
        return rltStr;
    }
};

var TaskSelector = function (_React$PureComponent14) {
    _inherits(TaskSelector, _React$PureComponent14);

    function TaskSelector(poros) {
        _classCallCheck(this, TaskSelector);

        var _this18 = _possibleConstructorReturn(this, (TaskSelector.__proto__ || Object.getPrototypeOf(TaskSelector)).call(this, props));

        autoBind(_this18);
        ERPControlBase(_this18);

        _this18.state = Object.assign(_this18.initState, {
            keyword: '',
            opened: false
        });

        _this18.contentDivRef = React.createRef();
        _this18.popPanelRef = React.createRef();
        _this18.popPanelRef = React.createRef();
        _this18.popPanelItem = React.createElement(ERPC_DropDown_PopPanel, { ref: _this18.popPanelRef, dropdownctl: _this18, key: gFixedItemCounter++ });
        return _this18;
    }

    _createClass(TaskSelector, [{
        key: 'pullUserTask',
        value: function pullUserTask() {
            var ownprops = this.props;
            var parentStatePath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
            store.dispatch(fetchJsonPost('/erppage/server/task', { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentStatePath, ownprops.id), 'options_arr', false), EFetchKey.FetchPropValue);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            React.createElement(ERPC_DropDown, { value: this.props.value,
                text: this.props.text,
                fetching: this.props.fetching,
                fetchingErr: this.props.fetchingErr,
                optionsData: this.props.optionsData,
                invalidInfo: this.props.invalidInfo,
                selectOpt: this.props.selectOpt,
                rowIndex: this.props.rowIndex,
                id: this.props.id,
                parentPath: this.props.parentPath,
                type: 'string',
                pullOnce: true,
                pullDataSource: this.pullUserTask,
                options_arr: this.props.options_arr

            });
        }
    }]);

    return TaskSelector;
}(React.PureComponent);