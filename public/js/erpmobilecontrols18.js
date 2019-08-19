'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var gEmptyArr = [];

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
    nowHash = nowHash.replace('#', '');
    if (nowHash.length >= 0) {
        var hash_arr = nowHash.length == 0 ? [] : nowHash.split(',');
        var newHash_arr = [];
        var found = false;
        for (var si in hash_arr) {
            var tem_arr = hash_arr[si].split('=');
            if (tem_arr.length == 2) {
                if (tem_arr[0] == hashName) {
                    if (hashVal != null) {
                        newHash_arr.push(hashName + '=' + hashVal);
                    }
                    found = true;
                    break;
                } else {
                    newHash_arr.push(hash_arr[si]);
                }
            } else if (hash_arr[si] != 'empty') {
                newHash_arr.push(hash_arr[si]);
            }
        }
        if (!found) {
            if (hashVal != null) {
                newHash_arr.push(hashName + '=' + hashVal);
            }
        }
        newHash = newHash_arr.length == 0 ? 'empty' : newHash_arr.join(',');
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
            items_arr: [],
            pages_arr: []
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
        key: 'popPage',
        value: function popPage(id, pageElem) {
            this.setState(function (state) {
                var foundElem = state.pages_arr.find(function (x) {
                    return x.id == id;
                });
                if (foundElem != null) return state;
                return {
                    pages_arr: state.pages_arr.concat({ id: id, elem: pageElem })
                };
            });
        }
    }, {
        key: 'closePage',
        value: function closePage(id) {
            this.setState(function (state) {
                var foundElem = state.pages_arr.find(function (x) {
                    return x.id == id;
                });
                if (foundElem == null) return state;
                var newArr = state.pages_arr.filter(function (x) {
                    return x != foundElem;
                });
                return {
                    pages_arr: newArr
                };
            });
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
            var pages_arr = this.state.pages_arr;
            if (items_arr.length == 0 && pages_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'd-fixed w-100 h-100 fixedBackGround' },
                pages_arr.map(function (item) {
                    return item.elem;
                }),
                items_arr
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

function popPage(pid, pelem) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.popPage(pid, pelem);
    }
}

function closePage(pid) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.closePage(pid);
    }
}

function SetCurrentComponent(ctrlProps, component) {
    ctrlCurrentComponent_map[MakePath(ctrlProps.parentPath, ctrlProps.id)] = component;
}

function ERPC_Fun_ComponentWillUnmount() {
    SetCurrentComponent(this.props, null);
    if (this.cusComponentWillUnmount) {
        this.cusComponentWillUnmount();
    }
}

function ERPC_Fun_ComponentWillMount() {
    SetCurrentComponent(this.props, this);
    if (this.cusComponentWillmount) {
        this.cusComponentWillmount();
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
                if (!Array.isArray(this.state.selectOpt)) {
                    this.props.dropdownctl.selectItem([theOptionItem]);
                } else if (this.state.selectOpt.find(function (item) {
                    return item.value == theOptionItem.value;
                }) == null) {
                    this.props.dropdownctl.selectItem(this.state.selectOpt.concat(theOptionItem));
                }
            } else {
                this.props.dropdownctl.selectItem(theOptionItem);
            }
        }
    }, {
        key: 'clickStarItem',
        value: function clickStarItem(ev) {
            this.props.dropdownctl.selectItem('*');
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
        key: 'clickFreshHandler',
        value: function clickFreshHandler() {
            this.props.dropdownctl.foreFresh();
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
                if (selectedOption == null) {
                    selectedOption = [];
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
            var freshIconElem = null;
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
                freshIconElem = React.createElement('i', { onClick: this.clickFreshHandler, className: 'fa fa-refresh text-success ml-1' });
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
                if (multiselect && Array.isArray(selectedOption)) {
                    multiSelectedElem = React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0 mb-1 flex-wrap' },
                        selectedOption && selectedOption.map(function (item) {
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
                        'div',
                        { ref: this.contentDivRef, className: 'list-group flex-grow-1 flex-shrink-0' },
                        this.state.starSelectable && React.createElement(
                            'div',
                            { onClick: this.clickStarItem, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedVal == '*' ? ' active' : '') },
                            '*'
                        ),
                        React.createElement(
                            'span',
                            { className: 'text-nowrap' },
                            '\u6CA1\u6709\u6570\u636E'
                        )
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
                        this.state.starSelectable && React.createElement(
                            'div',
                            { onClick: this.clickStarItem, className: 'd-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedVal == '*' ? ' active' : '') },
                            '*'
                        ),
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

            var titleBarRightElem = null;
            if (this.props.dropdownctl.props.createTitleBarRightElem) {
                titleBarRightElem = this.props.dropdownctl.props.createTitleBarRightElem();
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
                                { onClick: this.clickCloseHandler, className: 'text-primary' },
                                this.state.label,
                                multiselect ? '(可多选)' : ''
                            ),
                            freshIconElem,
                            titleBarRightElem
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

        _this5.hadValueAttr = _this5.props.valueAttrName != null;
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
            if (this.props.pullDataSource) {
                if (this.props.pullOnce != true || this.props.optionsData.options_arr == null) {
                    if (this.props.pullDataSource(this.props.fullParentPath) == false) {
                        return;
                    }
                }
            }
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
        }
    }, {
        key: 'foreFresh',
        value: function foreFresh() {
            if (this.props.pullDataSource) {
                this.props.pullDataSource(this.props.fullParentPath);
            }
        }
    }, {
        key: 'dropDownClosed',
        value: function dropDownClosed() {
            if (this.state.opened) {
                this.setState({ opened: false });
                removeFixedItem(this.popPanelItem);
            }
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
        value: function selectItem(theOptionItem, autoClose) {
            var value = null;
            var text = null;
            var multiselect = this.props.multiselect;
            if (theOptionItem == '*') {
                value = '*';
                text = '*';
            } else {
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
                    if (this.props.recentCookieKey && this.recentValues_arr) {
                        var index = this.recentValues_arr.indexOf(value);
                        if (index != 0) {
                            if (index != -1) {
                                this.recentValues_arr.splice(index, 1);
                            }
                            this.recentValues_arr.unshift(value);
                            if (this.recentValues_arr.length >= 11) {
                                this.recentValues_arr.pop();
                            }
                            Cookies.set(this.props.recentCookieKey, this.recentValues_arr.join(','), { expires: 7 });
                        }
                    }
                }
            }

            if (autoClose != false && (value == '*' || !this.props.multiselect)) {
                this.dropDownClosed();
            }

            this.confirmChanged(text, value, theOptionItem);
        }
    }, {
        key: 'confirmChanged',
        value: function confirmChanged(text, value, theOptionItem) {
            var invalidInfo = BaseIsValueValid(null, null, null, value == null || text == null ? null : value, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setManyStateByPath({
                value: value,
                text: text,
                invalidInfo: invalidInfo,
                selectOpt: theOptionItem
            }, this.props.fullPath));
            if (typeof this.props.onchanged === 'function') {
                this.props.onchanged(this.props.fullParentPath, text, value);
            }
        }
    }, {
        key: 'getPopPanelInitState',
        value: function getPopPanelInitState() {
            var multiselect = this.props.multiselect;
            var selectedVal = this.props.value;
            var selectOpt = this.props.selectOpt;
            if (multiselect) {
                if (selectOpt == null) {
                    selectOpt = [];
                }
            }
            return {
                selectedVal: this.props.value,
                fetching: this.props.fetching,
                fetchingErr: this.props.fetchingErr,
                optionsData: this.props.optionsData,
                starSelectable: this.props.starSelectable,
                maxCount: 50,
                keyword: '',
                recentValues_arr: this.recentValues_arr,
                recentUsed: this.recentUsed,
                multiselect: this.props.multiselect,
                selectOpt: selectOpt,
                label: ReplaceIfNull(this.props.label, this.props.textAttrName)
            };
        }
    }, {
        key: 'editableInputChanged',
        value: function editableInputChanged(ev) {
            this.setState({
                inputingValue: ev.target.value
            });
        }
    }, {
        key: 'editableInputFocushandler',
        value: function editableInputFocushandler(ev) {
            this.setState({
                focused: true,
                inputingValue: this.props.value
            });
        }
    }, {
        key: 'editableInputBlurhandler',
        value: function editableInputBlurhandler(ev) {
            this.confirmChanged(this.state.inputingValue, this.state.inputingValue);
            this.setState({
                focused: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            if (this.props.visible == false) {
                return null;
            }
            var hadMini = this.props.miniBtn != false;
            var selectedVal = this.props.value;
            var selectedText = this.props.text;
            var self = this;
            var multiselect = this.props.multiselect;
            var selectedItems_arr;

            var inputingValue = null;
            if (this.props.editable) {
                if (this.state.focused) {
                    inputingValue = this.state.inputingValue;
                } else {
                    inputingValue = this.props.value;
                }
                if (inputingValue == null) {
                    inputingValue = '';
                }
            } else {
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
                                            self.props.pullDataSource(_this6.props.fullParentPath);
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
                        if (selectedVal != '*') {
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
                                        self.selectItem(null, false);
                                    }, 50);
                                }
                            } else {
                                var selectedOptionItem = this.props.optionsData.options_arr.find(function (item) {
                                    return item.value == selectedVal;
                                });
                                if (selectedOptionItem) {
                                    if (selectedOptionItem.text != selectedText) {
                                        setTimeout(function () {
                                            self.selectItem(selectedOptionItem, false);
                                        }, 50);
                                    }
                                } else {
                                    setTimeout(function () {
                                        self.selectItem(null, false);
                                    }, 50);
                                }
                            }
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
                        selectOpt: !multiselect ? null : this.props.selectOpt ? this.props.selectOpt : []
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
                if (!this.props.nullable) {
                    textColor = selectedVal == null ? ' text-danger' : '';
                    textElem = React.createElement(
                        'div',
                        null,
                        selectedText == null ? '请选择' : selectedText
                    );
                } else {
                    textColor = selectedVal == null ? ' text-warning' : '';
                    textElem = React.createElement(
                        'div',
                        null,
                        selectedText == null ? '请选择(可以不选)' : selectedText
                    );
                }
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
            if (this.props.plainTextMode) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                    textElem,
                    errTipElem
                );
            }
            var dropDownElem = null;
            if (this.props.editable) {
                dropDownElem = React.createElement(
                    'div',
                    { className: "d-flex btn-group flex-grow-1 flex-shrink-0 erpc_dropdown input-group", style: this.props.style, ref: this.rootDivRef },
                    React.createElement('input', { onFocus: this.editableInputFocushandler, onBlur: this.editableInputBlurhandler, ref: this.editableInputRef, type: 'text', className: 'flex-grow-1 flex-shrink-1 flexinput form-control', onChange: this.editableInputChanged, value: inputingValue, placeholder: '\u8F93\u5165\u6216\u9009\u62E9' }),
                    React.createElement(
                        'div',
                        { className: 'input-group-append' },
                        React.createElement('button', { type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split' })
                    )
                );
            } else {
                dropDownElem = React.createElement(
                    'div',
                    { className: "d-flex btn-group flex-grow-1 flex-shrink-0 erpc_dropdown", style: this.props.style, ref: this.rootDivRef },
                    React.createElement(
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
            }

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
    var propProfile = getControlPropProfile(ownprops, state);
    return propProfile.ctlState.options_arr;
};

var selectERPC_DropDown_multiValues = function selectERPC_DropDown_multiValues(xmlstr) {
    return ERPXMLToolKit.extractColumn(xmlstr, 1);
};

var selectERPC_DropDown_value = function selectERPC_DropDown_value(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    return propProfile.ctlState.value;
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

function getControlPropProfile(ownprops, useState) {
    var ctlState;
    var rowState;
    var fullParentPath;
    var fullPath;
    if (ownprops.rowIndex == null) {
        fullParentPath = ownprops.parentPath;
        fullPath = MakePath(ownprops.parentPath, ownprops.id);
        if (useState) {
            ctlState = getStateByPath(useState, fullPath, {});
        }
    } else {
        fullParentPath = MakePath(ownprops.parentPath, 'row_' + ownprops.rowIndex);
        fullPath = fullParentPath + '.' + ownprops.id;
        if (useState) {
            rowState = getStateByPath(useState, fullParentPath, {});
            ctlState = getStateByPath(rowState, ownprops.id, {});
        }
    }
    return {
        ctlState: ctlState,
        rowState: rowState,
        fullParentPath: fullParentPath,
        fullPath: fullPath,
        rowIndex: ownprops.rowIndex
    };
}

var ERPC_selector_map = {};

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = propProfile.fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (useValue) {
        if (ownprops.multiselect && useValue != '*') {
            if (useValue[0] == '<') {
                selectorid = propProfile.fullPath + 'value';
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
    } else {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowIndex != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_DropDown_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var ERPC_Text = function (_React$PureComponent4) {
    _inherits(ERPC_Text, _React$PureComponent4);

    function ERPC_Text(props) {
        _classCallCheck(this, ERPC_Text);

        var _this7 = _possibleConstructorReturn(this, (ERPC_Text.__proto__ || Object.getPrototypeOf(ERPC_Text)).call(this));

        autoBind(_this7);

        ERPControlBase(_this7);
        _this7.state = _this7.initState;
        return _this7;
    }

    _createClass(ERPC_Text, [{
        key: 'inputChanged',
        value: function inputChanged(ev) {
            var text = ev.target.value;
            var invalidInfo = BaseIsValueValid(null, null, null, text, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setManyStateByPath({
                value: text,
                invalidInfo: invalidInfo
            }, this.props.fullPath));
            if (typeof this.props.onchanged === 'function') {
                this.props.onchanged(this.props.fullParentPath, text);
            }
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
                    rlt = Math.floor(val * Math.pow(10, precision)) / Math.pow(10, precision);
                    if (isNaN(rlt)) {
                        rlt = '';
                    }
                    break;
                case 'date':
                    if (val.length > 10) {
                        rlt = getFormatDateString(new Date(Date.parse(val)));
                    }
                    break;
                case 'time':
                    rlt = getFormatTimeString(castDateFromTimePart(val), false);
                    break;
            }
            return rlt;
        }
    }, {
        key: 'endInputHandler',
        value: function endInputHandler() {
            var invalidInfo = BaseIsValueValid(null, null, null, this.props.value, this.props.type, this.props.nullable, this.props.id);
            store.dispatch(makeAction_setStateByPath(invalidInfo, MakePath(this.props.fullPath, 'invalidInfo')));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            if (this.props.visible == false) {
                return null;
            }
            var contentElem = null;
            var errTipElem = null;
            var rootDivClassName = 'd-flex ' + (this.props.className == null ? '' : this.props.className);
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
                if (this.props.plainTextMode) {
                    var nowValue = FormatStringValue(this.props.value, this.props.type, this.props.precision);
                    contentElem = React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        nowValue
                    );
                } else if (this.props.readonly) {
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
                    contentElem = React.createElement('textarea', { onChange: this.inputChanged, className: 'flex-grow-1 flex-shrink-1 w-100 form-control textarea-' + this.props.linetype + (this.props.align ? ' text-' + this.props.align : ''), value: this.props.value, onBlur: this.endInputHandler });
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
                    if (useValue != this.props.value) {
                        if (!IsEmptyString(useValue) && !IsEmptyString(this.props.value) && useValue != this.props.value && (this.props.type == 'time' || this.props.type == 'date' || this.props.type == 'float')) {
                            setTimeout(function () {
                                store.dispatch(makeAction_setStateByPath(useValue, _this8.props.fullPath + '.value'));
                            }, 10);
                        }
                    }
                    contentElem = React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 form-control invalid ' + (this.props.align ? ' text-' + this.props.align : ''), type: useType, value: useValue, checked: useChecked, onChange: this.inputChanged, onBlur: this.endInputHandler });
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
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        value: ctlState.value == null ? '' : ctlState.value,
        fetching: ctlState.fetching,
        visible: ctlState.visible,
        fetchingErr: ctlState.fetchingErr,
        invalidInfo: ctlState.invalidInfo == gPreconditionInvalidInfo ? null : ctlState.invalidInfo,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowIndex != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_Text_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_LabeledControl = function (_React$PureComponent5) {
    _inherits(ERPC_LabeledControl, _React$PureComponent5);

    function ERPC_LabeledControl(props) {
        _classCallCheck(this, ERPC_LabeledControl);

        var _this9 = _possibleConstructorReturn(this, (ERPC_LabeledControl.__proto__ || Object.getPrototypeOf(ERPC_LabeledControl)).call(this));

        autoBind(_this9);

        ERPControlBase(_this9);
        _this9.state = _this9.initState;
        return _this9;
    }

    _createClass(ERPC_LabeledControl, [{
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'rowlFameOne' + (this.props.className ? ' ' + this.props.className : '') },
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

        var _this10 = _possibleConstructorReturn(this, (ERPC_Form.__proto__ || Object.getPrototypeOf(ERPC_Form)).call(this));

        autoBind(_this10);

        ERPControlBase(_this10);
        _this10.state = _this10.initState;
        return _this10;
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

        var _this11 = _possibleConstructorReturn(this, (ERPC_Label.__proto__ || Object.getPrototypeOf(ERPC_Label)).call(this));

        autoBind(_this11);

        ERPControlBase(_this11);
        _this11.state = _this11.initState;
        return _this11;
    }

    _createClass(ERPC_Label, [{
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var rootDivClassName = 'erpc_label ' + (this.props.className == null ? '' : this.props.className);
            var contentElem = null;
            if (this.props.fetching) {
                rootDivClassName += ' rounded border p-1';
                contentElem = React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw' }),
                    '\u901A\u8BAF\u4E2D'
                );
            } else if (this.props.fetchingErr) {
                var errInfo = this.props.fetchingErr.info;
                if (errInfo == gPreconditionInvalidInfo) {
                    errInfo = '';
                }
                rootDivClassName += ' rounded border p-1 text-danger';
                contentElem = React.createElement(
                    'span',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement('i', { className: 'fa fa-warning' }),
                    errInfo
                );
            } else if (this.props.type == 'boolean') {
                var value = this.props.text;
                var checked = checked = !(value == false || value == 0 || value == 'false' || value == 'FALSE');
                contentElem = React.createElement('i', { className: 'fa ' + (checked ? ' fa-check text-success' : ' fa-close text-danger') });
            } else {
                contentElem = FormatStringValue(this.props.text, this.props.type, this.props.precision);
            }
            return React.createElement(
                'span',
                { className: rootDivClassName },
                contentElem
            );
        }
    }]);

    return ERPC_Label;
}(React.PureComponent);

function ERPC_Label_mapstatetoprops(state, ownprops) {
    var _ref;

    var ctlPath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
    var ctlState = getStateByPath(state, ctlPath, {});
    var useText = ctlState.text != null ? ctlState.text : ownprops.text ? ownprops.text : '';
    return _ref = {
        text: useText,
        visible: ctlState.visible,
        fetching: ctlState.fetching
    }, _defineProperty(_ref, 'visible', ctlState.visible), _defineProperty(_ref, 'fetchingErr', ctlState.fetchingErr), _ref;
}

function ERPC_Label_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_CheckBox = function (_React$PureComponent8) {
    _inherits(ERPC_CheckBox, _React$PureComponent8);

    function ERPC_CheckBox(props) {
        _classCallCheck(this, ERPC_CheckBox);

        var _this12 = _possibleConstructorReturn(this, (ERPC_CheckBox.__proto__ || Object.getPrototypeOf(ERPC_CheckBox)).call(this));

        autoBind(_this12);

        ERPControlBase(_this12);
        _this12.state = _this12.initState;
        return _this12;
    }

    _createClass(ERPC_CheckBox, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            store.dispatch(makeAction_setManyStateByPath({
                value: this.checked ? 0 : 1
            }, MakePath(this.props.parentPath, this.props.id)));
            if (typeof this.props.onchanged === 'function') {
                this.props.onchanged(this.props.fullParentPath, this.checked ? 0 : 1);
            }
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
            if (this.props.readonly) {
                return React.createElement(
                    'span',
                    { className: 'erpc_checkbox ' + (this.props.className == null ? '' : this.props.className) },
                    React.createElement('i', { className: 'fa ' + (checked ? ' fa-check text-success' : ' fa-close text-danger') })
                );
            }
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
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        value: ctlState.value,
        visible: ctlState.visible,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_CheckBox_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_Button = function (_React$PureComponent9) {
    _inherits(ERPC_Button, _React$PureComponent9);

    function ERPC_Button(props) {
        _classCallCheck(this, ERPC_Button);

        var _this13 = _possibleConstructorReturn(this, (ERPC_Button.__proto__ || Object.getPrototypeOf(ERPC_Button)).call(this));

        autoBind(_this13);

        ERPControlBase(_this13);
        _this13.state = _this13.initState;
        return _this13;
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
                { className: className, style: this.props.style, onClick: this.props.onClick, 'ctl-fullpath': this.props.fullPath },
                this.props.children
            );
        }
    }]);

    return ERPC_Button;
}(React.PureComponent);

function ERPC_Button_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
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
var gNeedCallOnErpControlInit_arr = [];

function ErpControlInit() {
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
    VisibleERPC_LabeledControl = ReactRedux.connect(ERPC_LabeledControl_mapstatetoprops, ERPC_LabeledControl_dispatchtorprops)(ERPC_LabeledControl);
    VisibleERPC_Label = ReactRedux.connect(ERPC_Label_mapstatetoprops, ERPC_Label_dispatchtorprops)(ERPC_Label);
    VisibleERPC_CheckBox = ReactRedux.connect(ERPC_CheckBox_mapstatetoprops, ERPC_CheckBox_dispatchtorprops)(ERPC_CheckBox);
    VisibleERPC_Button = ReactRedux.connect(ERPC_Button_mapstatetoprops, ERPC_Button_dispatchtorprops)(ERPC_Button);

    gNeedCallOnErpControlInit_arr.forEach(function (elem) {
        if (typeof elem == 'function') {
            elem.call();
        }
    });
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
    var nowIndex = this.props.recordIndex == null ? -1 : this.props.recordIndex;
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
            if (count > 0) {
                exitPlushBtnItem = React.createElement(
                    'button',
                    { type: 'button', onClick: this.clickUnPlusNavBtnHandler, className: 'btn btn-danger flex-grow-1 navigationBtn' },
                    React.createElement('span', { className: 'fa fa-undo' }),
                    '\u653E\u5F03\u767B\u8BB0'
                );
            }
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

function SmartSetScrollTop(theElem) {
    if (theElem == null) {
        return;
    }
    var offsetTop = 0;
    while (theElem.parentElement) {
        var parent = theElem.parentElement;
        if (parent.scrollTop > 0) {
            if (theElem.offsetTop < parent.scrollTop) {
                parent.scrollTop = offsetTop - 40;
                offsetTop = 0;
            }
        }
        offsetTop += theElem.offsetTop;
        theElem = parent;
        parent = parent.parentElement;
    }
}

function ERPC_GridForm(target) {
    target.rootRef = React.createRef();
    target.rowPerPageChangedHandler = ERPC_GridForm_RowPerPageChangedHandler.bind(target);
    target.pageIndexChangedHandler = ERPC_GridForm_PageIndexChangedHandler.bind(target);
    target.prePageClickHandler = ERPC_GridForm_PrePageClickHandler.bind(target);
    target.nxtPageClickHandler = ERPC_GridForm_NxtPageClickHandler.bind(target);
    target.setRowPerPage = ERPC_GridForm_SetRowPerPage.bind(target);
    target.setPageIndex = ERPC_GridForm_SetPageIndex.bind(target);
    target.getRowPath = ERPC_GridForm_GetRowPath.bind(target);
    target.getRowState = ERPC_GridForm_GetRowState.bind(target);
    target.roweditClicked = ERPC_GridForm_RoweditClicked.bind(target);
    target.rowcanceleditClicked = ERPC_GridForm_RowcanceleditClicked.bind(target);
    target.rowdeleteClicked = ERPC_GridForm_RowdeleteClicked.bind(target);
    target.rowconfirmeditClicked = ERPC_GridForm_RowconfirmeditClicked.bind(target);
    target.clickNewRowHandler = ERPC_GridForm_ClickNewRowHandler.bind(target);
    target.cancelInsert = ERPC_GridForm_CancelInsert.bind(target);
    target.confrimInsert = ERPC_GridForm_ConfirmInsert.bind(target);
    target.getSelectedRowIndex = ERPC_GridForm_GetSelectedRowIndex.bind(target);
    target.selectorClicked = ERPC_GridForm_SelectorClicked.bind(target);
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
    SmartSetScrollTop(this.rootRef.current);
    var statePath = MakePath(this.props.parentPath, this.props.rowIndex == null ? null : 'row_' + this.props.rowIndex, this.props.id, 'pageIndex');
    store.dispatch(makeAction_setStateByPath(value, statePath));
}

function ERPC_GridForm_GetRowPath(rowIndex) {
    return MakePath(this.props.parentPath, this.props.id, 'row_' + rowIndex);
}

function ERPC_GridForm_GetRowState(rowIndex, state) {
    if (state == null) {
        state = store.getState();
    }
    var path = this.getRowPath(rowIndex);
    return getStateByPath(state, path);
}

function ERPC_GridForm_RoweditClicked(rowIndex) {
    var rowPath = this.getRowPath(rowIndex);
    var rowState = this.getRowState(rowIndex);
    var rowStateShot = JSON.stringify(rowState);
    store.dispatch(makeAction_setManyStateByPath({
        editing: true,
        stateshot: rowStateShot
    }, rowPath));
}

function ERPC_GridForm_RowcanceleditClicked(rowIndex) {
    var rowPath = this.getRowPath(rowIndex);
    var rowState = this.getRowState(rowIndex);
    var needSetState = JSON.parse(rowState.stateshot);
    needSetState.editing = false;
    store.dispatch(makeAction_setManyStateByPath(needSetState, rowPath));
}

function ERPC_GridForm_RowdeleteClicked(rowIndex) {
    var deleteBtn = this.btns.find(function (x) {
        return x.key == 'delete';
    });
    deleteBtn.handler(rowIndex);
}

function ERPC_GridForm_RowconfirmeditClicked(rowIndex) {
    var self = this;
    var rowPath = self.getRowPath(rowIndex);
    var editBtn = this.btns.find(function (x) {
        return x.key == 'edit';
    });
    editBtn.handler(rowIndex, function (state) {
        if (state == null) {
            store.dispatch(makeAction_setStateByPath(false, rowPath + '.editing'));
        } else {
            setStateByPath(state, rowPath + '.editing', false);
        }
    });
}

function ERPC_GridForm_ClickNewRowHandler() {
    this.setState({
        hadNewRow: true
    });
}

function ERPC_GridForm_CancelInsert() {
    this.setState({
        hadNewRow: false
    });
}

function ERPC_GridForm_ConfirmInsert() {
    var self = this;
    this.submitInsert(function () {
        setTimeout(function () {
            self.setState({
                hadNewRow: false
            });
        }, 50);
    });
}

function ERPC_GridForm_GetSelectedRowIndex() {
    return this.props.selectedRows_arr.length == 0 ? -1 : this.props.selectedRows_arr[0];
}

function ERPC_GridForm_SelectorClicked(rowIndex) {
    var needSetState = {};
    if (this.props.selectMode == 'single') {
        if (this.getSelectedRowIndex() == rowIndex) {
            return;
        }
        needSetState[this.props.fullPath + '.selectedRows_arr'] = [rowIndex];
    } else {
        var index = this.props.selectedRows_arr.indexOf(rowIndex);
        if (index == -1) {
            needSetState[this.props.fullPath + '.selectedRows_arr'] = this.props.selectedRows_arr.concat(rowIndex);
        } else {
            var newArr = this.props.selectedRows_arr.concat();
            newArr.splice(index, 1);
            needSetState[this.props.fullPath + '.selectedRows_arr'] = newArr;
        }
    }

    store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
}

var ERPC_GridForm_BtnCol = function (_React$PureComponent10) {
    _inherits(ERPC_GridForm_BtnCol, _React$PureComponent10);

    function ERPC_GridForm_BtnCol(props) {
        _classCallCheck(this, ERPC_GridForm_BtnCol);

        var _this14 = _possibleConstructorReturn(this, (ERPC_GridForm_BtnCol.__proto__ || Object.getPrototypeOf(ERPC_GridForm_BtnCol)).call(this, props));

        autoBind(_this14);
        return _this14;
    }

    _createClass(ERPC_GridForm_BtnCol, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            if (this.props.rowIndex == null) {
                return;
            }
            var key = getAttributeByNode(ev.target, 'd-key', true, 5);
            if (key == null) {
                console.warn('no key');
                return;
            }
            var btnSetting = this.props.form.btns.find(function (x) {
                return x.key == key;
            });
            switch (key) {
                case 'edit':
                    this.props.form['roweditClicked'](this.props.rowIndex);
                    break;
                case 'delete':
                    this.props.form['rowdeleteClicked'](this.props.rowIndex);
                    break;
                case 'confirmedit':
                    this.props.form['rowconfirmeditClicked'](this.props.rowIndex);
                    break;
                case 'canceledit':
                    this.props.form['rowcanceleditClicked'](this.props.rowIndex);
                    break;
                case 'cancelInsert':
                    this.props.form.cancelInsert();
                    break;
                case 'confirminsert':
                    this.props.form.confrimInsert();
                    break;
                default:
                    btnSetting.handler(this.props.rowIndex);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

            if (this.props.rowIndex == 'new') {
                return React.createElement(
                    'div',
                    { className: 'btn-group gridFormBtnsCol' },
                    React.createElement(
                        'button',
                        { onClick: this.clickHandler, 'd-key': 'confirminsert', className: 'btn btn-dark', type: 'button' },
                        React.createElement('i', { className: 'fa fa-upload text-success' })
                    ),
                    React.createElement(
                        'button',
                        { onClick: this.clickHandler, 'd-key': 'cancelInsert', className: 'btn btn-dark', type: 'button' },
                        React.createElement('i', { className: 'fa fa-close text-danger' })
                    )
                );
            }
            if (this.props.editing == true) {
                return React.createElement(
                    'div',
                    { className: 'btn-group gridFormBtnsCol' },
                    React.createElement(
                        'button',
                        { onClick: this.clickHandler, 'd-key': 'confirmedit', className: 'btn btn-dark', type: 'button' },
                        React.createElement('i', { className: 'fa fa-save text-success' })
                    ),
                    React.createElement(
                        'button',
                        { onClick: this.clickHandler, 'd-key': 'canceledit', className: 'btn btn-dark', type: 'button' },
                        React.createElement('i', { className: 'fa fa-close text-danger' })
                    )
                );
            }

            return React.createElement(
                'div',
                { className: 'btn-group gridFormBtnsCol' },
                this.props.form.btns.map(function (btn) {
                    return React.createElement(
                        'button',
                        { key: btn.key, onClick: _this15.clickHandler, 'd-key': btn.key, className: 'btn btn-dark', type: 'button' },
                        btn.content
                    );
                })
            );
        }
    }]);

    return ERPC_GridForm_BtnCol;
}(React.PureComponent);

function ERPC_GridForm_BtnCol_mapstatetoprops(state, ownprops) {
    var rowState = ownprops.form.getRowState(ownprops.rowIndex);
    return {
        editing: rowState && rowState.editing
    };
}

function ERPC_GridForm_BtnCol_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_GridSelectableRow = function (_React$PureComponent11) {
    _inherits(ERPC_GridSelectableRow, _React$PureComponent11);

    function ERPC_GridSelectableRow(props) {
        _classCallCheck(this, ERPC_GridSelectableRow);

        var _this16 = _possibleConstructorReturn(this, (ERPC_GridSelectableRow.__proto__ || Object.getPrototypeOf(ERPC_GridSelectableRow)).call(this, props));

        _this16.clickHandler = _this16.clickHandler.bind(_this16);
        return _this16;
    }

    _createClass(ERPC_GridSelectableRow, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.form.selectorClicked(this.props.rowIndex);
        }
    }, {
        key: 'render',
        value: function render() {
            var selectMode = this.props.form.props.selectMode;
            var checked = this.props.selected;
            var selectElem = null;
            if (selectMode == 'multi') {
                selectElem = React.createElement(
                    'span',
                    { onClick: this.clickHandler, className: 'fa-stack fa-lg' },
                    React.createElement('i', { className: "fa fa-square-o fa-stack-2x" }),
                    React.createElement('i', { className: 'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : '') })
                );
            } else if (selectMode == 'single') {
                selectElem = React.createElement(
                    'span',
                    { onClick: this.clickHandler, className: 'fa-stack fa-lg' },
                    React.createElement('i', { className: "fa fa-circle-o fa-stack-2x" }),
                    React.createElement('i', { className: 'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : '') })
                );
            }
            return React.createElement(
                'tr',
                { className: checked ? 'bg-warning' : null },
                React.createElement(
                    'td',
                    { className: 'selectorTableHeader' },
                    selectElem
                ),
                this.props.children
            );
        }
    }]);

    return ERPC_GridSelectableRow;
}(React.PureComponent);

function ERPC_GridSelectableRow_mapstatetoprops(state, ownprops) {
    return {
        selected: ownprops.form.props.selectedRows_arr.indexOf(ownprops.rowIndex) != -1
    };
}

function ERPC_GridSelectableRow_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_GridSelectableRow = ReactRedux.connect(ERPC_GridSelectableRow_mapstatetoprops, ERPC_GridSelectableRow_dispatchtorprops)(ERPC_GridSelectableRow);
var VisibleERPC_GridForm_BtnCol = ReactRedux.connect(ERPC_GridForm_BtnCol_mapstatetoprops, ERPC_GridForm_BtnCol_dispatchtorprops)(ERPC_GridForm_BtnCol);

function ERPC_Accordion_ClickHeaderHander(ev) {
    store.dispatch(makeAction_setStateByPath(!this.props.collapsed, this.props.fullPath + '.collapsed'));
}

function ERPC_Accordion_Render() {
    var bodyElem = null;
    if (this.props.visible == false) {
        return null;
    }
    if (!this.props.collapsed) {
        if (!this.props.inited) {
            this.rebind();
        } else {
            this.rebindging = false;
            bodyElem = React.createElement(
                'div',
                { className: 'accordionBody ' + (this.props.bodyIsColumn == true ? ' flex-column' : '') },
                this.rednerBody()
            );
        }
    }
    switch (this.props.mode) {
        case 'listitem':
            return React.createElement(
                'div',
                { className: 'erp-control erp-accrodion flex-grow-0 flex-shrink-0', userctlpath: this.props.fullPath },
                React.createElement(
                    'div',
                    { className: 'd-flex accordion_listitemheader align-items-center', onClick: this.clickHanderHandler },
                    React.createElement(
                        'span',
                        { className: 'flex-grow-1' },
                        this.props.title
                    ),
                    React.createElement('span', { className: "fa flex-grow-0 " + (this.props.collapsed ? 'fa-angle-right' : 'fa-angle-down') })
                ),
                bodyElem
            );
        default:
            return React.createElement(
                'div',
                { className: 'erp-control card flex-grow-0 flex-shrink-0', userctlpath: this.props.fullPath },
                React.createElement(
                    'div',
                    { className: 'card-header pl-0 btn btn-link text-left', onClick: this.clickHanderHandler },
                    React.createElement(
                        'span',
                        { className: 'fa-stack' },
                        React.createElement('i', { className: 'fa fa-square-o fa-stack-2x' }),
                        React.createElement('i', { className: "fa fa-stack-1x " + (this.props.collapsed ? 'fa-plus' : 'fa-minus') })
                    ),
                    this.props.title
                ),
                bodyElem
            );
    }
}

function ERPC_Accordion_Rebind() {
    var self = this;
    if (this.rebindging) {
        this.rebindging = true;
    }
    this.rebindging = true;
    this.rebindBody();
}

function ERPC_Accordion(target) {
    target.clickHanderHandler = ERPC_Accordion_ClickHeaderHander.bind(target);
    target.commonRender = ERPC_Accordion_Render.bind(target);
    target.rebind = ERPC_Accordion_Rebind.bind(target);

    return {};
}

var CBaseGridFormNavBar = function (_React$PureComponent12) {
    _inherits(CBaseGridFormNavBar, _React$PureComponent12);

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

var CToastManger = function (_React$PureComponent13) {
    _inherits(CToastManger, _React$PureComponent13);

    function CToastManger(props) {
        _classCallCheck(this, CToastManger);

        var _this18 = _possibleConstructorReturn(this, (CToastManger.__proto__ || Object.getPrototypeOf(CToastManger)).call(this, props));

        autoBind(_this18);

        _this18.state = {
            msg_arr: []
        };
        _this18.ticker = null;
        _this18.msgID = 0;
        return _this18;
    }

    _createClass(CToastManger, [{
        key: 'toast',
        value: function toast(info, type, timeTime) {
            if (info.length > 50) {
                info = info.substr(0, 50) + '……';
            }
            var newMsg = {
                text: info,
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
    Loading: 'loading',
    Blank: 'blank'
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
        key: 'fireHide',
        value: function fireHide() {
            this.hidden = true;
            if (this.hideAct != null) {
                this.hideAct();
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
    }, {
        key: 'query',
        value: function query(tip, btns_arr, callBack) {
            this.text = tip;
            this.btns = btns_arr;
            this.callBack = callBack;
            this.type = EMessageBoxType.Tip;
            this.fireChanged();
        }
    }]);

    return MessageBoxItem;
}();

var CMessageBox = function (_React$PureComponent14) {
    _inherits(CMessageBox, _React$PureComponent14);

    function CMessageBox(props) {
        _classCallCheck(this, CMessageBox);

        var _this19 = _possibleConstructorReturn(this, (CMessageBox.__proto__ || Object.getPrototypeOf(CMessageBox)).call(this, props));

        autoBind(_this19);

        _this19.state = {
            hidden: _this19.props.msgItem.hidden
        };
        _this19.props.msgItem.changedAct = _this19.msgItemChanedHandler;
        _this19.props.msgItem.closeAct = _this19.msgItemCloseHandler;
        _this19.props.msgItem.hideAct = _this19.msgItemHideHandler;
        return _this19;
    }

    _createClass(CMessageBox, [{
        key: 'msgItemChanedHandler',
        value: function msgItemChanedHandler(ev) {
            if (this.state.hidden) {
                this.props.msgItem.hidden = false;
                this.props.manager.redraw();
            }
            this.setState({
                magicObj: {},
                hidden: false
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
            var autoClose = true;
            if (msgItem.callBack) {
                if (msgItem.callBack(ev.target.getAttribute('d-type')) == false) {
                    autoClose = false;
                }
            }
            if (autoClose) {
                this.props.manager.delete(this);
            }
        }
    }, {
        key: 'msgItemCloseHandler',
        value: function msgItemCloseHandler(ev) {
            this.props.manager.delete(this);
        }
    }, {
        key: 'msgItemHideHandler',
        value: function msgItemHideHandler(ev) {
            this.setState({
                hidden: true
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this20 = this;

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
                            { onClick: _this20.clickBtnHandler, key: btn.label, 'd-type': btn.key, type: 'button', className: btn.class == null ? 'btn btn-light' : btn.class },
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

var CMessageBoxManger = function (_React$PureComponent15) {
    _inherits(CMessageBoxManger, _React$PureComponent15);

    function CMessageBoxManger(props) {
        _classCallCheck(this, CMessageBoxManger);

        var _this21 = _possibleConstructorReturn(this, (CMessageBoxManger.__proto__ || Object.getPrototypeOf(CMessageBoxManger)).call(this, props));

        autoBind(_this21);

        _this21.state = {
            msg_arr: []
        };
        _this21.msgID = 0;
        return _this21;
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
        key: 'redraw',
        value: function redraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this22 = this;

            var visibleMsg_arr = this.state.msg_arr.filter(function (x) {
                return !x.hidden && x.type != EMessageBoxType.Blank;
            });
            if (visibleMsg_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'messageBoxMask' },
                visibleMsg_arr.map(function (msg, index) {
                    return React.createElement(CMessageBox, { key: 1, msgItem: msg, manager: _this22 });
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

function getPageEntryParam(pageid, paramName, defValue) {
    var entryObj = gDataCache.get(pageid + 'entryParam');
    if (entryObj && entryObj[paramName] == null) {
        return defValue;
    }
    return entryObj[paramName];
}