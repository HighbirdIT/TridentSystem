'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ISParam_Options_arr = [{ name: '参数', code: '1' }, { name: '变量', code: '0' }];

var __SynAction_count = 0;

var SynAction = function (_EventEmitter) {
    _inherits(SynAction, _EventEmitter);

    function SynAction(initValues) {
        _classCallCheck(this, SynAction);

        var _this = _possibleConstructorReturn(this, (SynAction.__proto__ || Object.getPrototypeOf(SynAction)).call(this));

        initValues.complete = false;
        Object.assign(_this, initValues);
        _this.id = __SynAction_count++;
        _this.passedtime = 0;
        autoBind(_this);
        return _this;
    }

    _createClass(SynAction, [{
        key: 'startFetch',
        value: function startFetch(fetchFun) {
            this.startFetchTime = Date.now();
            this.timeInt = setInterval(this.growTime, 200);
            var self = this;
            this.fetchFun = fetchFun;
            this.complete = false;
            this.passedtime = 0;
            fetchFun(function (rlt) {
                self.fetchComplete(rlt.err ? rlt.err : rlt.json);
            });
        }
    }, {
        key: 'reFetch',
        value: function reFetch() {
            if (this.fetchFun != null) {
                this.startFetch(this.fetchFun);
            }
        }
    }, {
        key: 'fetchComplete',
        value: function fetchComplete(fetchData) {
            this.fetchData = fetchData;
            this.complete = true;
            this.passedtime = Math.round((Date.now() - this.startFetchTime) / 1000.0 * 10) / 10.0;
            this.emit('fetchend');
            clearInterval(this.timeInt);
        }
    }, {
        key: 'growTime',
        value: function growTime() {
            this.passedtime = Math.round((Date.now() - this.startFetchTime) / 1000.0 * 10) / 10.0;
            //this.passed = (new Date() - this.startFetchTime);
            //console.log(this.passedtime);
            this.emit('timechange');
        }
    }]);

    return SynAction;
}(EventEmitter);

var SynActionControl = function (_React$PureComponent) {
    _inherits(SynActionControl, _React$PureComponent);

    function SynActionControl(props) {
        _classCallCheck(this, SynActionControl);

        var _this2 = _possibleConstructorReturn(this, (SynActionControl.__proto__ || Object.getPrototypeOf(SynActionControl)).call(this, props));

        _this2.state = {
            complete: _this2.props.action.complete,
            passedtime: _this2.props.action.passedtime
        };
        autoBind(_this2);
        return _this2;
    }

    _createClass(SynActionControl, [{
        key: 'actionFetchend',
        value: function actionFetchend() {
            this.setState({
                complete: this.props.action.complete,
                passedtime: this.props.action.passedtime
            });
            this.props.synFetchComplete(this.props.action.fetchData);
        }
    }, {
        key: 'actionTimeChange',
        value: function actionTimeChange() {
            this.setState({
                passedtime: this.props.action.passedtime,
                complete: this.props.action.complete
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.action.on('fetchend', this.actionFetchend);
            this.props.action.on('timechange', this.actionTimeChange);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.action.off('fetchend', this.actionFetchend);
            this.props.action.off('timechange', this.actionTimeChange);
        }
    }, {
        key: 'renderActionBody',
        value: function renderActionBody(action) {
            if (!action.complete) {
                return React.createElement(
                    'div',
                    null,
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse mr-1' }),
                    '正在同步,用时' + this.state.passedtime + 's'
                );
            }
            if (action.fetchData.err) {
                return action.fetchData.err.info;
            }
            return React.createElement(
                React.Fragment,
                null,
                '查得:' + action.fetchData.data.length + '项,用时' + this.state.passedtime + 's',
                action.fetchData.data.length == 0 ? null : React.createElement('span', { className: 'icon icon-info', 'data-toggle': 'collapse', 'data-target': "#actioninfo" + action.id }),
                action.fetchData.data.length == 0 ? null : React.createElement(
                    'div',
                    { id: "actioninfo" + action.id, className: 'list-group flex-grow-0 flex-shrink-0 border collapse', style: { overflow: 'auto', maxHeight: '300px', padding: '5px' } },
                    action.fetchData.data.map(function (item, i) {
                        if (item == null) {
                            return null;
                        }
                        return React.createElement(
                            'div',
                            { className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item-sm list-group-item-action', key: i },
                            item.name
                        );
                    })
                )
            );
        }
    }, {
        key: 'clickCloseHandler',
        value: function clickCloseHandler(ev) {
            this.props.removeSynAction(this.props.action);
        }
    }, {
        key: 'render',
        value: function render() {
            var action = this.props.action;
            return React.createElement(
                'div',
                { className: 'list-group-item mt-1' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                        React.createElement(
                            'div',
                            { className: '' },
                            action.synflag == 'keyword' ? '同步关键字:' + action.keyword : ''
                        ),
                        React.createElement(
                            'div',
                            { className: !this.state.complete ? 'text-info' : action.fetchData.err != null || action.fetchData.data.length == 0 ? 'text-danger' : 'text-success' },
                            this.renderActionBody(action)
                        )
                    ),
                    action.complete && React.createElement(
                        'div',
                        { className: 'd-flex flex-column' },
                        React.createElement('span', { onClick: this.clickCloseHandler, className: 'icon icon-close' }),
                        React.createElement('span', { onClick: this.props.action.reFetch, className: 'icon icon-refresh' })
                    )
                )
            );
        }
    }]);

    return SynActionControl;
}(React.PureComponent);

var UsedDSEnityPanel = function (_React$PureComponent2) {
    _inherits(UsedDSEnityPanel, _React$PureComponent2);

    function UsedDSEnityPanel(props) {
        _classCallCheck(this, UsedDSEnityPanel);

        var _this3 = _possibleConstructorReturn(this, (UsedDSEnityPanel.__proto__ || Object.getPrototypeOf(UsedDSEnityPanel)).call(this, props));

        autoBind(_this3);
        _this3.state = {
            selectedIndexes_arr: []
        };
        _this3.alldbdropdownRef = React.createRef();
        return _this3;
    }

    _createClass(UsedDSEnityPanel, [{
        key: 'clickAddHandler',
        value: function clickAddHandler(ev) {
            if (this.alldbdropdownRef.current) {
                var selected = this.alldbdropdownRef.current.getSelectedData();
                if (selected) {
                    this.props.dataMaster.useEnity(selected);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 align-items-baseline', style: { borderBottom: 'solid white 2px' } },
                    React.createElement(
                        'div',
                        { className: 'text-light flex-grow-1 flex-shrink-1 ml-1' },
                        '\u4F7F\u7528\u6570\u636E\u6E90'
                    ),
                    React.createElement('div', { className: 'text-light flex-grow-0 flex-shrink-0 d-flex btn-group' })
                ),
                React.createElement(
                    'div',
                    { className: 'list-group autoScroll flex-grow-1 flex-shrink-1' },
                    React.createElement(ListDataEditor, { dataView: this.props.dataMaster.dataView_usedDBEnities })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(DropDownControl, { ref: this.alldbdropdownRef, btnclass: 'btn-primary', options_arr: g_dataBase.entities_arr, rootclass: 'flex-grow-1 flex-shrink-1', editable: true, textAttrName: 'name', valueAttrName: 'code' }),
                    React.createElement(
                        'button',
                        { onClick: this.clickAddHandler, type: 'button', className: 'btn btn-primary ml-1' },
                        '\u6DFB\u52A0'
                    )
                )
            );
        }
    }]);

    return UsedDSEnityPanel;
}(React.PureComponent);

var DataBasePanel = function (_React$PureComponent3) {
    _inherits(DataBasePanel, _React$PureComponent3);

    function DataBasePanel(props) {
        _classCallCheck(this, DataBasePanel);

        var _this4 = _possibleConstructorReturn(this, (DataBasePanel.__proto__ || Object.getPrototypeOf(DataBasePanel)).call(this, props));

        var initState = _this4.props.project.cacheState.DataBasePanel;

        if (initState == null) {
            initState = {
                matchKeyword: '',
                synQueue_arr: []
            };
        }
        _this4.state = initState;
        autoBind(_this4);
        var self = _this4;
        setTimeout(function () {
            self.startSynAction('keyword', 'T101');
        }, 100);
        return _this4;
    }

    _createClass(DataBasePanel, [{
        key: 'matchKeywordInputChangedhandler',
        value: function matchKeywordInputChangedhandler(ev) {
            this.setState({
                matchKeyword: ev.target.value
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.project.cacheState.DataBasePanel = this.state;
        }

        /*
        fetchJsonPosts('server',{action:'matchGet',keyword:'T922'}, function(rlt){
            console.log(rlt);
        });
        */

    }, {
        key: 'clickSynBtnHandler',
        value: function clickSynBtnHandler(ev) {
            var synflag = getAttributeByNode(ev.target, 'synflag', true, 10);
            this.startSynAction(synflag, this.state.matchKeyword.trim());
        }
    }, {
        key: 'startSynAction',
        value: function startSynAction(synflag, param) {
            if (synflag == 'keyword') {
                var keyword = param;
                if (keyword.length < 2) return;
                var hadAction = this.state.synQueue_arr.find(function (synAction) {
                    return !synAction.complete && synAction.synflag == synflag && synAction.keyword == keyword;
                });
                if (hadAction) return;

                var newAction = new SynAction({
                    keyword: keyword,
                    synflag: synflag
                });

                this.appendSynAction(newAction);
                newAction.startFetch(function (callBack) {
                    fetchJsonPosts('server', { action: 'syndata_bykeyword', keyword: keyword }, callBack);
                });
            }
        }
    }, {
        key: 'appendSynAction',
        value: function appendSynAction(theAction) {
            var nowArr = this.state.synQueue_arr.concat();
            nowArr.unshift(theAction);
            this.setState({
                synQueue_arr: nowArr
            });
        }
    }, {
        key: 'removeSynAction',
        value: function removeSynAction(theAction) {
            var index = this.state.synQueue_arr.indexOf(theAction);
            if (index >= 0) {
                var nowArr = this.state.synQueue_arr.concat();
                nowArr.splice(index, 1);
                this.setState({
                    synQueue_arr: nowArr
                });
            }
        }
    }, {
        key: 'keywordKeypressHandler',
        value: function keywordKeypressHandler(ev) {
            if (ev.nativeEvent.keyCode == 13) {
                this.startSynAction('keyword');
            }
        }
    }, {
        key: 'synFetchComplete',
        value: function synFetchComplete(fetchData) {
            if (fetchData.data && fetchData.data.length > 0) {
                this.props.project.dataMaster.synEnityFromFetch(fetchData.data);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 bg-dark' },
                React.createElement(SplitPanel, {
                    defPercent: 0.45,
                    maxSize: '300px',
                    barClass: 'bg-secondary',
                    panel1: React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column autoScroll' },
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-primary mt-1 flex-shrink-0' },
                            '\u540C\u6B65\u57FA\u7840\u914D\u7F6E'
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-primary mt-1 flex-shrink-0' },
                            '\u540C\u6B65\u672C\u65B9\u6848'
                        ),
                        React.createElement(
                            'div',
                            { className: 'd-flex mt-1  flex-shrink-0' },
                            React.createElement('input', { type: 'text', className: 'flex-grow-1 flex-shrink-1', value: this.state.matchKeyword, onChange: this.matchKeywordInputChangedhandler, onKeyDown: this.keywordKeypressHandler }),
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickSynBtnHandler, synflag: 'keyword', className: 'btn btn-primary ml-1' },
                                '\u5339\u914D\u540C\u6B65'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'list-group flex-grow-1 flex-shrink-1 autoScroll' },
                            this.state.synQueue_arr.map(function (syndata) {
                                return React.createElement(SynActionControl, { key: syndata.id, action: syndata, removeSynAction: _this5.removeSynAction, synFetchComplete: _this5.synFetchComplete });
                            })
                        )
                    ),
                    panel2: React.createElement(UsedDSEnityPanel, { dataMaster: this.props.project.dataMaster })
                })
            );
        }
    }]);

    return DataBasePanel;
}(React.PureComponent);

var node_Counter = 1;

var SQLNODE_BDBENTITY = 'dbEntity';
var SQLNODE_SELECT = 'select';
var SQLNODE_VAR_GET = 'var_get';
var SQLNODE_VAR_SET = 'var_set';
var SQLNODE_NOPERAND = 'noperand';
var SQLNODE_COLUMN = 'column';
var SQLNODE_DBENTITY_COLUMNSELECTOR = 'dbentity_columnselector';
var SQLNODE_RET_CONDITION = 'ret_condition';
var SQLNODE_RET_COLUMNS = 'ret_columns';

var SQLDEF_VAR = 'def_variable';

var SocketLink = function () {
    function SocketLink(outSocket, inSocket, pool) {
        _classCallCheck(this, SocketLink);

        this.outID = outSocket.id;
        this.inID = inSocket.id;
        this.pool = pool;
        this.outSocket = outSocket;
        this.inSocket = inSocket;

        this.id = this.outID + '|L|' + this.inID;
        //this.revid = inID + '|L|' + outID;
    }

    _createClass(SocketLink, [{
        key: 'fireChanged',
        value: function fireChanged() {
            this.inSocket.fireLinkChanged();
            this.outSocket.fireLinkChanged();
        }
    }, {
        key: 'straightOut',
        value: function straightOut(offsetX) {
            var inSocket = this.inSocket;
            var outSocket = this.outSocket;
            if (outSocket.node.currentFrameCom == null || inSocket.node.currentFrameCom == null) {
                return;
            }
            if (isNaN(offsetX)) {
                offsetX = 100;
            }
            var inSocketCenter = inSocket.currentComponent.getCenterPos();
            var outSocketCenter = outSocket.currentComponent.getCenterPos();
            var offset = { x: inSocketCenter.x - outSocketCenter.x, y: inSocketCenter.y - outSocketCenter.y };
            offset.x += offsetX;
            outSocket.node.setPos(outSocket.node.left + offset.x, outSocket.node.top + offset.y);
            outSocket.node.currentFrameCom.reDraw();
        }
    }]);

    return SocketLink;
}();

var ScoketLinkPool = function () {
    function ScoketLinkPool(bluePrint) {
        _classCallCheck(this, ScoketLinkPool);

        this.bluePrint = bluePrint;
        this.link_map = {};
    }

    _createClass(ScoketLinkPool, [{
        key: '_deleteLink',
        value: function _deleteLink(linkObj) {
            if (this.link_map[linkObj.id] == null) {
                return false;
            }
            if (linkObj) {
                this.link_map[linkObj.id] = null;
                delete this.link_map[linkObj.id];
                linkObj.fireChanged();

                linkObj.inSocket.node.linkRemoved(linkObj);
                linkObj.outSocket.node.linkRemoved(linkObj);
            }
            return true;
        }
    }, {
        key: 'addLink',
        value: function addLink(outSocket, inSocket) {
            if (outSocket.isIn == inSocket.isIn) {
                throw new Error("两个socket流方向不能一样");
            }
            if (outSocket.isIn) {
                var t = outSocket;
                outSocket = inSocket;
                inSocket = t;
            }
            var id = outSocket.id + '|L|' + inSocket.id;
            if (this.link_map[id] == null) {
                // 把已有的inSocket删除掉
                for (var si in this.link_map) {
                    var theLink = this.link_map[si];
                    if (theLink == null) continue;
                    if (theLink.inSocket == inSocket) {
                        this._deleteLink(this.link_map[si]);
                        break;
                    }
                }
                var newLink = new SocketLink(outSocket, inSocket, this);
                this.link_map[id] = newLink;
                newLink.fireChanged();
                this.cacheData = null;
                this.bluePrint.fireChanged(10);

                inSocket.node.linkAdded(newLink);
                outSocket.node.linkAdded(newLink);
            }
            return this.link_map[id];
        }
    }, {
        key: 'removeLink',
        value: function removeLink(link) {
            if (this._deleteLink(link)) {
                this.cacheData = null;
                this.bluePrint.fireChanged();
            }
        }
    }, {
        key: 'clearNodeLink',
        value: function clearNodeLink(theNode) {
            var needClearids_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket.node == theNode || theLink.outSocket.node == theNode) {
                    needClearids_arr.push(si);
                }
            }
            if (needClearids_arr.length > 0) {
                for (var si in needClearids_arr) {
                    var id = needClearids_arr[si];
                    this._deleteLink(this.link_map[id]);
                }
                this.cacheData = null;
            }
            return needClearids_arr.length > 0;
        }
    }, {
        key: 'clearSocketLink',
        value: function clearSocketLink(theSocket) {
            var needClearids_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket == theSocket || theLink.outSocket == theSocket) {
                    needClearids_arr.push(si);
                }
            }
            if (needClearids_arr.length > 0) {
                for (var si in needClearids_arr) {
                    var id = needClearids_arr[si];
                    this._deleteLink(this.link_map[id]);
                }
                this.cacheData = null;
            }
            return needClearids_arr.length > 0;
        }
    }, {
        key: 'getLinksByNode',
        value: function getLinksByNode(theNode, type) {
            if (type == null) {
                type = '*';
            }
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket.node == theNode) {
                    if (type == '*' || type == 'i') {
                        rlt_arr.push(theLink);
                    }
                } else if (theLink.outSocket.node == theNode) {
                    if (type == '*' || type == 'o') {
                        rlt_arr.push(theLink);
                    }
                }
            }
            return rlt_arr;
        }
    }, {
        key: 'getLinksBySocket',
        value: function getLinksBySocket(theSocket, type) {
            if (type == null) {
                type = '*';
            }
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket == theSocket) {
                    if (type == '*' || type == 'i') {
                        rlt_arr.push(theLink);
                    }
                } else if (theLink.outSocket == theSocket) {
                    if (type == '*' || type == 'o') {
                        rlt_arr.push(theLink);
                    }
                }
            }
            return rlt_arr;
        }
    }, {
        key: 'getAllLink',
        value: function getAllLink() {
            if (this.cacheData == null) {
                this.cacheData = [];
                for (var si in this.link_map) {
                    if (this.link_map[si]) {
                        this.cacheData.push(this.link_map[si]);
                    }
                }
            }
            return this.cacheData;
        }
    }]);

    return ScoketLinkPool;
}();

var CustomDbEntity = function (_EventEmitter2) {
    _inherits(CustomDbEntity, _EventEmitter2);

    function CustomDbEntity(initData) {
        _classCallCheck(this, CustomDbEntity);

        var _this6 = _possibleConstructorReturn(this, (CustomDbEntity.__proto__ || Object.getPrototypeOf(CustomDbEntity)).call(this));

        _this6.nodes_arr = [];
        _this6.vars_arr = [];
        _this6.links_arr = [];
        _this6.linkPool = new ScoketLinkPool(_this6);
        Object.assign(_this6, initData);
        _this6.nodeIdCounterPool = {};
        var self = _this6;
        var creationInfo = {
            orginID_map: {},
            newID_map: {}
        };
        _this6.bluePrint = _this6;
        _this6.id = _this6.code;
        EnhanceEventEmiter(_this6);

        creationInfo.save = function (initData, node) {
            if (initData.id) {
                creationInfo.orginID_map[initData.id] = node;
            }
            creationInfo.newID_map[node.id] = node;
        };

        _this6.allNode_map = {};

        _this6.nodes_arr = _this6.nodes_arr.map(function (nodeData, i) {
            if (nodeData.type == SQLNODE_BDBENTITY) {
                return new SqlNode_DBEntity(nodeData, self, creationInfo);
            } else {
                console.log('不支持的sql节点:' + nodeData.type);
                console.warn(nodeData);
            }
        });

        return _this6;
    }

    _createClass(CustomDbEntity, [{
        key: 'preEditing',
        value: function preEditing() {
            // call pre enter Editing
        }
    }, {
        key: 'postEditing',
        value: function postEditing() {
            // call leve eidting
        }
    }, {
        key: 'getNodeParentList',
        value: function getNodeParentList(theNode) {
            var rlt = [];
            while (theNode.parent) {
                rlt.unshift(theNode.parent);
                theNode = theNode.parent;
            }

            return rlt;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return this.name;
        }
    }, {
        key: 'genNodeId',
        value: function genNodeId(prefix) {
            if (prefix == null) {
                console.warn('genNodeId参数不能为空');
                return;
            }
            if (this.nodeIdCounterPool[prefix] == null) {
                this.nodeIdCounterPool[prefix] = 0;
            }
            return prefix + ++this.nodeIdCounterPool[prefix];
        }
    }, {
        key: 'registerNode',
        value: function registerNode(node, parentNode) {
            if (node.type == SQLDEF_VAR) {
                this.addVariable(node); // 变量需要注册到根节点中
                return;
            }
            if (parentNode == null) {
                parentNode = this;
            }
            if (parentNode.nodes_arr == null) {
                parentNode.nodes_arr = [];
            }
            var useNodes_arr = parentNode.nodes_arr;
            var useId = node.id;
            if (useId == null || this.allNode_map[useId] && this.allNode_map[useId] != node) {
                useId = this.genNodeId(node.type);
            }
            if (useNodes_arr.indexOf(node) == -1) {
                useNodes_arr.push(node);
            }
            node.parent = parentNode;
            node.id = useId;
            this.allNode_map[useId] = node;
            parentNode.fireChanged();
        }
    }, {
        key: 'addVariable',
        value: function addVariable(varData) {
            var foundVar = this.vars_arr.find(function (item) {
                return item.name == varData.name;
            });
            if (foundVar) {
                return;
            }
            var useId = varData.id;
            if (useId == null) {
                useId = this.genNodeId(varData.type);
                varData.id = useId;
            }
            varData.bluePrint = this;
            this.vars_arr.push(varData);
            this.fireEvent('varChanged');
        }
    }, {
        key: 'getVariableByName',
        value: function getVariableByName(varName) {
            return this.vars_arr.find(function (item) {
                return item.name == varName;
            });
        }
    }, {
        key: 'createEmptyVariable',
        value: function createEmptyVariable() {
            var varName;
            for (var i = 0; i < 999; ++i) {
                varName = '未命名_' + i;
                if (this.getVariableByName(varName) == null) break;
            }
            var rlt = new SqlDef_Variable(this, varName, SqlVarType_Int);
            rlt.needEdit = true;
            return rlt;
        }
    }, {
        key: 'removeVariable',
        value: function removeVariable(varData) {
            var index = this.vars_arr.indexOf(varData);
            if (index != -1) {
                this.vars_arr.splice(index, 1);
                varData.removed = true;
                this.fireEvent('varChanged');
                varData.emit('changed');
            }
        }
    }, {
        key: 'deleteNode',
        value: function deleteNode(node) {
            if (node.isConstNode) {
                return;
            }
            var useId = node.id;
            if (this.allNode_map[useId]) {
                this.allNode_map[useId] = null;
                var index = node.parent.nodes_arr.indexOf(node);
                if (index != -1) {
                    node.parent.nodes_arr.splice(index, 1);
                }
                node.bluePrint = null;
                node.parent = null;
                this.linkPool.clearNodeLink(node);
                this.fireChanged();
            }
        }
    }, {
        key: 'deleteNodes',
        value: function deleteNodes(nodes_arr) {
            var _this7 = this;

            this.banEvent('changed');
            nodes_arr.forEach(function (node) {
                _this7.deleteNode(node);
            });
            this.allowEvent('changed');
            this.fireChanged();
        }
    }, {
        key: 'getNodeByID',
        value: function getNodeByID(id) {
            if (id == this.id) {
                return this;
            }
            return this.allNode_map[id];
        }
    }, {
        key: 'getSocketById',
        value: function getSocketById(socketID) {
            var pos = socketID.indexOf('$');
            var nodeId = socketID.substr(0, pos);
            var theNode = getNodeByID(nodeId);
            if (theNode == null) return null;
            return theNode.sockets_map[socketID];
        }
    }, {
        key: 'fireMoved',
        value: function fireMoved(delay) {
            this.fireEvent('moved', delay);
        }
    }, {
        key: 'fireChanged',
        value: function fireChanged(delay) {
            this.fireEvent('changed', delay);
        }
    }]);

    return CustomDbEntity;
}(EventEmitter);

var SqlNode_Base = function (_EventEmitter3) {
    _inherits(SqlNode_Base, _EventEmitter3);

    function SqlNode_Base(initData, parentNode, creationInfo, type, label, isContainer) {
        _classCallCheck(this, SqlNode_Base);

        var _this8 = _possibleConstructorReturn(this, (SqlNode_Base.__proto__ || Object.getPrototypeOf(SqlNode_Base)).call(this));

        _this8.bluePrint = parentNode.bluePrint;
        Object.assign(_this8, initData);
        EnhanceEventEmiter(_this8);
        _this8.label = label;
        if (_this8.type == null) _this8.type = type;
        if (_this8.left == null) _this8.left = 0;
        if (_this8.top == null) _this8.top = 0;
        _this8.hadFlow = false;

        _this8.bluePrint.registerNode(_this8, parentNode);

        if (creationInfo) {
            creationInfo.save(initData, _this8);
        }

        _this8.sockets_map = {};
        _this8.inputScokets_arr = [];
        _this8.outputScokets_arr = [];
        if (isContainer) {
            _this8.nodes_arr = [];
            _this8.isContainer = true;
        }

        _this8.processInputSockets = _this8.processInputSockets.bind(_this8);
        _this8.processOutSockets = _this8.processOutSockets.bind(_this8);
        _this8.frameButtons_arr = [];
        return _this8;
    }

    _createClass(SqlNode_Base, [{
        key: 'clickFrameButton',
        value: function clickFrameButton(btnName) {
            console.log('clickFrameButton:' + btnName);
            switch (btnName) {
                case FrameButton_LineSocket:
                    {
                        var links = this.bluePrint.linkPool.getLinksByNode(this, 'i');
                        links.forEach(function (link) {
                            link.straightOut(-150);
                        });
                    }
                    break;
                case FrameButton_ClearEmptySocket:
                    {
                        var removeCount = 0;
                        for (var si = this.inputScokets_arr.length - 1; si >= this.minInSocketCount && this.inputScokets_arr.length > 0; --si) {
                            var socket = this.inputScokets_arr[si];
                            if (this.bluePrint.linkPool.getLinksBySocket(socket).length == 0) {
                                this.removeSocket(socket);
                                ++removeCount;
                            }
                        }
                        if (removeCount > 0) {
                            this.fireEvent(Event_SocketNumChanged);
                            this.fireMoved(10);
                        }
                    }
                    break;
                case 'fresh':
                    {
                        if (this.currentComponent) {
                            this.currentComponent.reDraw();
                        }
                    }
            }
            return false;
        }
    }, {
        key: 'addFrameButton',
        value: function addFrameButton(name, label) {
            this.frameButtons_arr.push({ name: name, label: label });
        }
    }, {
        key: 'linkRemoved',
        value: function linkRemoved(link) {}
    }, {
        key: 'linkAdded',
        value: function linkAdded(link) {}
    }, {
        key: 'preEditing',
        value: function preEditing() {
            // call pre enter Editing
        }
    }, {
        key: 'postEditing',
        value: function postEditing() {
            // call leve eidting
        }
    }, {
        key: 'getRect',
        value: function getRect() {
            if (this.currentFrameCom == null) return null;
            var frameRootDiv = this.currentFrameCom.rootDivRef.current;
            if (frameRootDiv == null) return null;
            var bcr = frameRootDiv.getBoundingClientRect();
            return {
                left: this.left,
                top: this.top,
                right: this.left + bcr.width,
                bottom: this.top + bcr.height,
                width: bcr.width,
                height: bcr.height
            };
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return this.label + (this.title == null ? '' : ':' + this.title);
        }
    }, {
        key: 'getScoketByName',
        value: function getScoketByName(name, isIn) {
            if (isIn == null) isIn = '*';
            var rlt = null;
            if (isIn != false) {
                rlt = this.inputScokets_arr.find(function (x) {
                    return x.name == name;
                });
            }

            if (rlt == null && isIn != true) {
                rlt = this.outputScokets_arr.find(function (x) {
                    return x.name == name;
                });
            }
            return rlt;
        }
    }, {
        key: 'addSocket',
        value: function addSocket(socketObj) {
            this.sockets_map[socketObj.id] = socketObj;
            if (socketObj.isIn) {
                this.inputScokets_arr.push(socketObj);
            } else {
                this.outputScokets_arr.push(socketObj);
            }
        }
    }, {
        key: 'removeSocket',
        value: function removeSocket(socketObj) {
            if (socketObj.isIn) {
                removeElemFrommArray(this.inputScokets_arr, socketObj);
            } else {
                removeElemFrommArray(this.outputScokets_arr, socketObj);
            }
            this.sockets_map[socketObj.id] = null;
            this.bluePrint.linkPool.clearSocketLink(socketObj);
        }
    }, {
        key: 'getSocketById',
        value: function getSocketById(socketID) {
            return this.sockets_map[socketID];
        }
    }, {
        key: 'setPos',
        value: function setPos(newx, newy) {
            this.left = newx;
            this.top = newy;
            this.fireMoved();
        }
    }, {
        key: 'fireMoved',
        value: function fireMoved(delay) {
            this.fireEvent('moved', delay);
        }
    }, {
        key: 'fireChanged',
        value: function fireChanged(delay) {
            this.fireEvent('changed', delay);
        }
    }, {
        key: 'getContext',
        value: function getContext(finder, depth) {
            if (depth == null) {
                depth = 0;
            }
            finder.setTest(this.id);
            var inlinks = this.bluePrint.linkPool.getLinksByNode(this, 'i');
            for (var i in inlinks) {
                var tLink = inlinks[i];
                var outNode = tLink.outSocket.node;
                if (!finder.isTest(outNode.id)) {
                    outNode.getContext(finder, depth + 1);
                }
            }
        }
    }, {
        key: 'isInScoketDynamic',
        value: function isInScoketDynamic() {
            return this.genInSocket != null;
        }
    }, {
        key: 'isOutScoketDynamic',
        value: function isOutScoketDynamic() {
            return this.genOutSocket != null;
        }
    }, {
        key: 'processInputSockets',
        value: function processInputSockets(isPlus) {
            if (this.minInSocketCount == null) {
                this.minInSocketCount = 0;
            }
            var retSocket = null;
            if (isPlus) {
                retSocket = this.genInSocket();
                this.addSocket(retSocket);
                this.fireEvent(Event_SocketNumChanged);
            } else {
                if (this.inputScokets_arr.length > this.minInSocketCount) {
                    var needRemoveSocket = this.inputScokets_arr[this.inputScokets_arr.length - 1];
                    this.removeSocket(needRemoveSocket);
                    this.fireEvent(Event_SocketNumChanged);
                    retSocket = needRemoveSocket;
                }
            }
            return retSocket;
        }
    }, {
        key: 'processOutSockets',
        value: function processOutSockets(isPlus) {
            if (this.minOutSocketCount == null) {
                this.minOutSocketCount = 0;
            }
            var retSocket = null;
            if (isPlus) {
                retSocket = this.genOutSocket();
                this.addSocket(retSocket);
                this.fireEvent(Event_SocketNumChanged);
            } else {
                if (this.outputScokets_arr.length > this.minOutSocketCount) {
                    var needRemoveSocket = this.outputScokets_arr[this.outputScokets_arr.length - 1];
                    this.removeSocket(needRemoveSocket);
                    this.fireEvent(Event_SocketNumChanged);
                    retSocket = needRemoveSocket;
                }
            }
            return retSocket;
        }

        // can custom socket component

    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }]);

    return SqlNode_Base;
}(EventEmitter);

function MK_NS_Settings(label, type, defval) {
    return {
        label: label,
        type: type,
        defval: defval
    };
}

function CommonFun_SetCurrentComponent(target) {
    if (this.currentComponent != target) {
        this.currentComponent = target;
        this.emit(Event_CurrentComponentchanged, this);
    }
}

var NodeSocket = function (_EventEmitter4) {
    _inherits(NodeSocket, _EventEmitter4);

    function NodeSocket(name, tNode, isIn, initData) {
        _classCallCheck(this, NodeSocket);

        var _this9 = _possibleConstructorReturn(this, (NodeSocket.__proto__ || Object.getPrototypeOf(NodeSocket)).call(this));

        Object.assign(_this9, initData);
        EnhanceEventEmiter(_this9);
        _this9.name = name;
        _this9.node = tNode;
        _this9.isIn = isIn;
        _this9.id = tNode.id + '$' + name;
        _this9.setCurrentComponent = CommonFun_SetCurrentComponent.bind(_this9);
        return _this9;
    }

    _createClass(NodeSocket, [{
        key: 'set',
        value: function set(data) {
            Object.assign(this, data);
            this.emit('changed');
        }
    }, {
        key: 'getLinks',
        value: function getLinks() {
            return this.node.bluePrint.linkPool.getLinksBySocket(this);
        }
    }, {
        key: 'fireLinkChanged',
        value: function fireLinkChanged() {
            this.emit(Event_LinkChanged);
            var self = this;
            setTimeout(function () {
                self.node.emit('moved');
            }, 20);
        }
    }, {
        key: 'getExtra',
        value: function getExtra(key, def) {
            if (this.extra == null) {
                return def;
            }
            return this.extra[key] == null ? def : this.extra[key];
        }
    }, {
        key: 'setExtra',
        value: function setExtra(key, val) {
            if (this.extra == null) {
                this.extra = {};;
            }
            this.extra[key] = val;
        }
    }]);

    return NodeSocket;
}(EventEmitter);

var SqlDef_Variable = function (_SqlNode_Base) {
    _inherits(SqlDef_Variable, _SqlNode_Base);

    function SqlDef_Variable(bluePrint, name, valType, size_1, size_2) {
        _classCallCheck(this, SqlDef_Variable);

        var _this10 = _possibleConstructorReturn(this, (SqlDef_Variable.__proto__ || Object.getPrototypeOf(SqlDef_Variable)).call(this, {
            name: name,
            valType: valType,
            size_1: isNaN(size_1) ? 0 : parseInt(size_1),
            size_2: isNaN(size_2) ? 0 : parseInt(size_2),
            isParam: 0
        }, bluePrint, null, SQLDEF_VAR, '变量'));

        autoBind(_this10);
        return _this10;
    }

    _createClass(SqlDef_Variable, [{
        key: 'setProp',
        value: function setProp(data) {
            if (data.name != null) {
                this.name = data.name;
            }
            if (data.valType != null) {
                this.valType = data.valType;
            }
            if (data.size_1 != null) {
                this.size_1 = isNaN(data.size_1) ? 0 : parseInt(data.size_1);
            }
            if (data.size_2 != null) {
                this.size_2 = isNaN(data.size_2) ? 0 : parseInt(data.size_2);
            }
            if (data.isParam != null) {
                this.isParam = data.isParam;
            }
            if (data.editing != null) {
                this.needEdit = data.editing;
            }
            this.fireChanged();
        }
    }, {
        key: 'toString',
        value: function toString() {
            var rlt = (this.isParam ? '@' : '') + this.name + '  ' + this.valType;
            switch (this.valType) {
                case SqlVarType_NVarchar:
                    rlt += '(' + this.size_1 + ')';
                    break;
                case SqlVarType_Decimal:
                    rlt += '(' + this.size_1 + ',' + this.size_2 + ')';
                    break;
            }

            return rlt;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            return (this.isParam ? '@' : '') + this.name;
        }
    }, {
        key: 'getValType',
        value: function getValType() {
            return this.valType;
        }
    }]);

    return SqlDef_Variable;
}(SqlNode_Base);

var SqlDef_Variable_Component = function (_React$PureComponent4) {
    _inherits(SqlDef_Variable_Component, _React$PureComponent4);

    function SqlDef_Variable_Component(props) {
        _classCallCheck(this, SqlDef_Variable_Component);

        var _this11 = _possibleConstructorReturn(this, (SqlDef_Variable_Component.__proto__ || Object.getPrototypeOf(SqlDef_Variable_Component)).call(this, props));

        var varData = _this11.props.varData;
        _this11.state = {
            name: varData.name,
            valType: varData.valType,
            isParam: varData.isParam,
            size_1: varData.size_1,
            size_2: varData.size_2,
            editing: varData.needEdit == true
        };

        autoBind(_this11);
        return _this11;
    }

    _createClass(SqlDef_Variable_Component, [{
        key: 'varChanged',
        value: function varChanged() {
            if (this.state.editing) {
                return;
            }
            var varData = this.props.varData;
            this.setState({
                name: varData.name,
                valType: varData.valType,
                isParam: varData.isParam,
                size_1: varData.size_1,
                size_2: varData.size_2
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.varData.on('changed', this.varChanged);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.varData.off('changed', this.varChanged);
        }
    }, {
        key: 'nameInputChangeHanlder',
        value: function nameInputChangeHanlder(ev) {
            this.setState({
                name: ev.target.value
            });
        }
    }, {
        key: 'valTypeChangedHandler',
        value: function valTypeChangedHandler(newData) {
            this.setState({
                valType: newData
            });
        }
    }, {
        key: 'isParamChangedHandler',
        value: function isParamChangedHandler(newData) {
            this.setState({
                isParam: newData.code
            });
        }
    }, {
        key: 'size1InputChangedHandler',
        value: function size1InputChangedHandler(newVal) {
            this.setState({
                size_1: isNaN(newVal) ? 0 : parseInt(newVal)
            });
        }
    }, {
        key: 'size2InputChangedHandler',
        value: function size2InputChangedHandler(newVal) {
            this.setState({
                size_2: isNaN(newVal) ? 0 : parseInt(newVal)
            });
        }
    }, {
        key: 'renderSize',
        value: function renderSize() {
            var sizeCount = 0;
            switch (this.state.valType) {
                case SqlVarType_NVarchar:
                    sizeCount = 1;
                    break;
                case SqlVarType_Decimal:
                    sizeCount = 2;
                    break;
            }
            if (sizeCount > 0) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 w-100' },
                    React.createElement(NameInputRow, { isagent: true, label: 'S1', type: 'int', rootClass: 'flex-grow-1 flex-shrink-1', value: this.state.size_1, nameWidth: '50px', nameColor: 'rgb(255,255,255)', onValueChanged: this.size1InputChangedHandler }),
                    sizeCount == 2 ? React.createElement(NameInputRow, { isagent: true, label: 'S2', type: 'int', rootClass: 'flex-grow-1 flex-shrink-1', value: this.state.size_2, nameWidth: '50px', nameColor: 'rgb(255,255,255)', onValueChanged: this.size2InputChangedHandler }) : null
                );
            }
            return null;
        }
    }, {
        key: 'clickEditBtnHandler',
        value: function clickEditBtnHandler() {
            if (this.state.editing) {
                var tval = Object.assign({}, this.state);
                tval.editing = false;
                this.props.varData.setProp(tval);
            }
            this.setState({
                editing: !this.state.editing
            });
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler() {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除变量:"' + this.state.name + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo]));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key) {
            if (key == 'ok') {
                this.props.varData.bluePrint.removeVariable(this.props.varData);
            }
        }
    }, {
        key: 'labelMouseDownHandler',
        value: function labelMouseDownHandler(ev) {
            this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
            window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
        }
    }, {
        key: 'labelWindowMouseUpHandler',
        value: function labelWindowMouseUpHandler(ev) {
            if (this.dragTimeOut) {
                clearTimeout(this.dragTimeOut);
            }
        }
    }, {
        key: 'genDragContentFun',
        value: function genDragContentFun() {
            var varData = this.props.varData;
            return React.createElement(
                'span',
                { className: 'text-nowrap border bg-dark text-light' },
                '变量:' + varData.name
            );
        }
    }, {
        key: 'dragTimeOutHandler',
        value: function dragTimeOutHandler() {
            var designer = this.props.varData.bluePrint.master.project.designer;
            designer.startDrag({ info: '放置变量' }, this.dragEndHandler, this.genDragContentFun);
        }
    }, {
        key: 'dragMenuCallBack',
        value: function dragMenuCallBack(menuItem, pos) {
            var varData = this.props.varData;
            if (menuItem.key == 'SET') {
                this.props.editor.addVarGSNode({ isGet: false, varName: varData.name }, pos);
            } else if (menuItem.key == 'GET') {
                //console.log('get');
                this.props.editor.addVarGSNode({ isGet: true, varName: varData.name }, pos);
            }
        }
    }, {
        key: 'dragEndHandler',
        value: function dragEndHandler(pos) {
            var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
            if (MyMath.isPointInRect(editorRect, pos)) {
                var designer = this.props.varData.bluePrint.master.project.designer;
                var varData = this.props.varData;
                designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'), new QuickMenuItem('Get ' + varData.name, 'GET')], pos, this.dragMenuCallBack);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var varData = this.props.varData;
            var editing = this.state.editing;
            if (!editing) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg', onClick: this.clickEditBtnHandler }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem',
                            onMouseDown: this.labelMouseDownHandler },
                        '' + varData
                    ),
                    React.createElement('i', { className: 'fa fa-trash fa-lg', onClick: this.clickTrashHandler })
                );
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary' },
                React.createElement(
                    'div',
                    { className: 'd-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info'), onClick: this.clickEditBtnHandler }),
                    React.createElement('input', { onChange: this.nameInputChangeHanlder, type: 'text', value: this.state.name, className: 'flexinput flex-grow-1 flex-shrink-1' })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex w-100 flex-grow-0 flex-shrink-0 align-items-center' },
                    React.createElement(DropDownControl, { itemChanged: this.valTypeChangedHandler, btnclass: 'btn-dark', options_arr: SqlVarTypes_arr, rootclass: 'flex-grow-1 flex-shrink-1', textAttrName: 'name', valueAttrName: 'code', value: this.state.valType }),
                    React.createElement(DropDownControl, { itemChanged: this.isParamChangedHandler, btnclass: 'btn-dark', options_arr: ISParam_Options_arr, rootclass: 'flex-grow-0 flex-shrink-0', textAttrName: 'name', valueAttrName: 'code', value: this.state.isParam })
                ),
                this.renderSize()
            );
            /*
            if(this.state.editing){
                return <div className='d-flex bg-dark flex-grow-0 flex-shrink-0'><button type='button' className='btn btndark flex-grow-1 flex-shrink-1'>{this.state.name + '  ' + this.state.valType}</button></div>
            }
            else{
                return <div className='d-flex bg-dark flex-grow-0 flex-shrink-0'><button type='button' className='btn btndark flex-grow-1 flex-shrink-1'>{this.state.name + '  ' + this.state.valType}</button></div>
            }
            */
        }
    }]);

    return SqlDef_Variable_Component;
}(React.PureComponent);

var SqlNode_DBEntity = function (_SqlNode_Base2) {
    _inherits(SqlNode_DBEntity, _SqlNode_Base2);

    function SqlNode_DBEntity(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_DBEntity);

        var _this12 = _possibleConstructorReturn(this, (SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity)).call(this, initData, parentNode, creationInfo, SQLNODE_BDBENTITY, '数据源'));

        autoBind(_this12);

        _this12.outSocket = new NodeSocket('out', _this12, false, { type: SqlVarType_Table });
        _this12.addSocket(_this12.outSocket);

        if (_this12.targetentity != null) {
            var tem_arr = _this12.targetentity.split('-');
            if (tem_arr[0] == 'dbe') {
                _this12.targetentity = g_dataBase.getEntityByCode(tem_arr[1]);
                _this12.targetentity.on('syned', _this12.entitySynedHandler);
                //console.log(this.targetentity);
            } else {
                _this12.targetentity = null;
            }
        }

        var self = _this12;
        return _this12;
    }

    _createClass(SqlNode_DBEntity, [{
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            var _this13 = this;

            var entity = this.targetentity;
            if (entity && entity.loaded) {
                var paramCount = entity.params.length;
                this.inputScokets_arr.forEach(function (item) {
                    item._validparam = false;
                });
                var hadChanged = false;
                entity.params.forEach(function (param) {
                    var theSocket = _this13.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this13.addSocket(new NodeSocket(param.name, _this13, true, { type: SqlVarType_Scalar, label: param.name }));
                        hadChanged = true;
                    }
                });
                for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                    var theSocket = this.inputScokets_arr[si];
                    if (theSocket._validparam == false) {
                        this.removeSocket(theSocket);
                        --si;
                        hadChanged = true;
                    }
                }
                if (hadChanged) {
                    this.fireEvent(Event_SocketNumChanged, 20);
                    this.bluePrint.fireChanged();
                }
            }

            this.fireChanged();
            this.fireMoved(10);
        }
    }, {
        key: 'setEntity',
        value: function setEntity(entity) {
            if (this.targetentity == entity) return;
            if (this.targetentity != null) {
                this.targetentity.off('syned', this.entitySynedHandler);
            }
            this.targetentity = entity;
            if (entity) {
                entity.on('syned', this.entitySynedHandler);
            }
            this.entitySynedHandler();
        }
    }, {
        key: 'getContext',
        value: function getContext(finder) {
            finder.setTest(this.id);
            if (this.targetentity == null) {
                return;
            }
            if (finder.type == ContextType_DBEntity) {
                var theLabel = this.title;
                if (IsEmptyString(theLabel)) {
                    theLabel = this.targetentity.loaded ? this.targetentity.name : this.targetentity.code;
                }
                finder.addItem(theLabel, this.targetentity);
            }
        }
    }]);

    return SqlNode_DBEntity;
}(SqlNode_Base);

var ContextFinder = function () {
    function ContextFinder(type) {
        _classCallCheck(this, ContextFinder);

        this.type = type;
        this.item_arr = [];
    }

    _createClass(ContextFinder, [{
        key: 'addItem',
        value: function addItem(label, data) {
            if (data == null) {
                return;
            }
            if (label == null) {
                console.warn('context meet null label');
                label = 'unname';
            }
            this.item_arr.push({ label: label, data: data });
        }
    }, {
        key: 'setTest',
        value: function setTest(key) {
            this['test-' + key] = 1;
        }
    }, {
        key: 'isTest',
        value: function isTest(key) {
            return this['test-' + key] == 1;
        }
    }, {
        key: 'count',
        value: function count() {
            return this.item_arr.length;
        }
    }]);

    return ContextFinder;
}();

var SqlNode_Column = function (_SqlNode_Base3) {
    _inherits(SqlNode_Column, _SqlNode_Base3);

    function SqlNode_Column(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Column);

        var _this14 = _possibleConstructorReturn(this, (SqlNode_Column.__proto__ || Object.getPrototypeOf(SqlNode_Column)).call(this, initData, parentNode, creationInfo, SQLNODE_COLUMN, '列', false));

        autoBind(_this14);

        //this.label = this.tableName + '.' + this.columnName;
        _this14.headType = 'empty';
        _this14.outSocket = new NodeSocket('out', _this14, false, { type: _this14.cvalType, label: _this14.getSocketLabel() });
        _this14.addSocket(_this14.outSocket);

        _this14.scoketNameMoveable = true;
        return _this14;
    }

    _createClass(SqlNode_Column, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '列:' + this.getSocketLabel();
        }
    }, {
        key: 'getSocketLabel',
        value: function getSocketLabel() {
            return (this.tableAlias == null ? this.tableName : this.tableAlias) + '.' + this.columnName;
        }
    }, {
        key: 'getCompareKey',
        value: function getCompareKey() {
            return (this.tableAlias == null ? this.tableCode : this.tableAlias) + '.' + this.columnName;
        }
    }]);

    return SqlNode_Column;
}(SqlNode_Base);

var SqlNode_DBEntity_ColumnSelector = function (_SqlNode_Base4) {
    _inherits(SqlNode_DBEntity_ColumnSelector, _SqlNode_Base4);

    function SqlNode_DBEntity_ColumnSelector(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_DBEntity_ColumnSelector);

        var _this15 = _possibleConstructorReturn(this, (SqlNode_DBEntity_ColumnSelector.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity_ColumnSelector)).call(this, initData, parentNode, creationInfo, SQLNODE_DBENTITY_COLUMNSELECTOR, '实体', false));

        autoBind(_this15);
        _this15.isConstNode = true;

        _this15.addFrameButton('select-all', '全选');
        _this15.addFrameButton('unselect-all', '全不选');
        _this15.addFrameButton('fresh', '刷新');
        return _this15;
    }

    _createClass(SqlNode_DBEntity_ColumnSelector, [{
        key: 'clickFrameButton',
        value: function clickFrameButton(btnName) {
            if (_get(SqlNode_DBEntity_ColumnSelector.prototype.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity_ColumnSelector.prototype), 'clickFrameButton', this).call(this, btnName)) {
                return;
            }
            switch (btnName) {
                case 'select-all':
                    {
                        var entity = this.entity;
                        for (var si in this.entity.columns) {
                            var theColumn = this.entity.columns[si];
                            this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, true);
                        }
                        break;
                    }
                case 'unselect-all':
                    {
                        var entity = this.entity;
                        for (var si in this.entity.columns) {
                            var theColumn = this.entity.columns[si];
                            this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, false);
                        }
                        break;
                    }
            }
            return false;
        }
    }, {
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            this.fireChanged();
        }
    }, {
        key: 'setEntity',
        value: function setEntity(label, target) {
            this.entity = target;
            if (label == target.name) {
                this.alias = null;
            } else {
                this.alias = label;
            }
            this.label = label;
            if (target.on != null) {
                target.on('syned', this.entitySynedHandler);
            }
        }
    }]);

    return SqlNode_DBEntity_ColumnSelector;
}(SqlNode_Base);

var SqlNode_Select = function (_SqlNode_Base5) {
    _inherits(SqlNode_Select, _SqlNode_Base5);

    function SqlNode_Select(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Select);

        var _this16 = _possibleConstructorReturn(this, (SqlNode_Select.__proto__ || Object.getPrototypeOf(SqlNode_Select)).call(this, initData, parentNode, creationInfo, SQLNODE_SELECT, '选择', true));

        autoBind(_this16);
        _this16.inSocket = new NodeSocket('in', _this16, true, { type: SqlVarType_Table });
        _this16.addSocket(_this16.inSocket);
        _this16.outSocket = new NodeSocket('out', _this16, false, { type: SqlVarType_Table });
        _this16.addSocket(_this16.outSocket);
        if (IsEmptyString(_this16.title)) {
            _this16.title = '未命名';
        }

        _this16.columnNode = new SqlNode_Ret_Columns({ left: 100, top: 0 }, _this16, creationInfo);
        _this16.conditionNode = new SqlNode_Ret_Condition({ left: 250, top: 0 }, _this16, creationInfo);
        _this16.orderNode = new SqlNode_Ret_Order({ left: 400, top: 0 }, _this16, creationInfo);

        if (_this16.columns_arr == null) {
            _this16.columns_arr = [];
        }
        if (_this16.orderColumns_arr == null) {
            _this16.orderColumns_arr = [];
        }
        _this16.contextEntities_arr = [];
        _this16.entityNodes_arr = [];
        _this16.autoCreateHelper = {};
        return _this16;
    }

    _createClass(SqlNode_Select, [{
        key: 'getContext',
        value: function getContext(finder) {
            finder.setTest(this.id);
            if (finder.type == ContextType_DBEntity) {
                var links = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
                for (var i in links) {
                    var tLink = links[i];
                    var outNode = tLink.outSocket.node;
                    if (!finder.isTest(outNode.id)) {
                        outNode.getContext(finder);
                    }
                }
            }
        }
    }, {
        key: 'getContext',
        value: function getContext(finder, depth) {
            if (depth == null) {
                depth = 0;
            }
            if (depth == 0) {
                return _get(SqlNode_Select.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Select.prototype), 'getContext', this).call(this, finder, 0);
            }
            // 其他情况下只返回自身即可
            var retLinks = this.bluePrint.linkPool.getLinksByNode(this.columnNode, 'i');
            if (retLinks.length == 0) {
                return;
            }
            var temEntity = {
                code: this.id,
                name: 'temp',
                columns: []
            };
            for (var i in retLinks) {
                var link = retLinks[i];
                var theSocket = link.inSocket;
                var colName = theSocket.getExtra('alias');
                var cvalType = SqlVarType_NVarchar;
                if (IsEmptyString(colName)) {
                    if (link.outSocket.node.type == SQLNODE_COLUMN) {
                        colName = link.outSocket.node.columnName;
                        cvalType = link.outSocket.node.cvalType;
                    }
                }
                if (!IsEmptyString(colName)) {
                    temEntity.columns.push({ name: colName, cvalType: cvalType });
                }
            }
            finder.addItem(this.title, temEntity);
        }
    }, {
        key: 'preEditing',
        value: function preEditing() {
            var cFinder = new ContextFinder(ContextType_DBEntity);
            this.getContext(cFinder);
            this.contextEntities_arr = cFinder.item_arr;
            for (var i in this.entityNodes_arr) {
                this.entityNodes_arr[i].valid = false;
            }
            for (var i in this.contextEntities_arr) {
                var contextEntity = this.contextEntities_arr[i];
                var theNode = this.entityNodes_arr.find(function (x) {
                    return x.label == contextEntity.label;
                });
                if (theNode == null) {
                    theNode = new SqlNode_DBEntity_ColumnSelector({ left: (i + 1) * -200 }, this, null);
                    theNode.setEntity(contextEntity.label, contextEntity.data);
                    this.entityNodes_arr.push(theNode);
                }
                theNode.valid = true;
            }
            this.bluePrint.banEvent('changed');
            for (var i = 0; i < this.entityNodes_arr.length; ++i) {
                var tNode = this.entityNodes_arr[i];
                if (!tNode.valid) {
                    this.entityNodes_arr.splice(i, 1);
                    --i;
                    tNode.isConstNode = false;
                    this.bluePrint.deleteNode(tNode);
                }
            }
            this.bluePrint.allowEvent('changed');
        }
    }, {
        key: 'postEditing',
        value: function postEditing() {
            var colSockets = this.columnNode.inputScokets_arr;
            var newColumns_arr = [];
            var temMap = {};
            for (var i in colSockets) {
                var socket = colSockets[i];
                var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                var colNode = null;
                if (tlinks.length > 0) {
                    var theLink = tlinks[0];
                    if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                        colNode = theLink.outSocket.node;
                    }
                }
                var colName = socket.getExtra('alias');
                var cvalType = colNode ? colNode.cvalType : SqlVarType_NVarchar;
                if (IsEmptyString(colName) && colNode) {
                    colName = colNode.columnName;
                }
                if (!IsEmptyString(colName)) {
                    if (temMap[colName] == null) {
                        newColumns_arr.push({ name: colName, cvalType: cvalType });
                        temMap[colName] = 1;
                    }
                }
            }
            this.columns_arr = newColumns_arr;

            var orderBySockets = this.orderNode.inputScokets_arr;
            var newOrderByColumns_arr = [];
            temMap = {};
            for (var i in orderBySockets) {
                var socket = orderBySockets[i];
                var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                var colNode = null;
                if (tlinks.length > 0) {
                    var theLink = tlinks[0];
                    if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                        colNode = theLink.outSocket.node;
                    }
                }
                if (colNode) {
                    newOrderByColumns_arr.push({ name: colNode.columnName, orderType: socket.getExtra('orderType', '') });;
                }
            }

            this.orderColumns_arr = newOrderByColumns_arr;
        }
    }, {
        key: 'isSelectColumn',
        value: function isSelectColumn(compareKey) {
            return this.getSelectColumnLink(compareKey) != null;
        }
    }, {
        key: 'getSelectColumnLink',
        value: function getSelectColumnLink(compareKey) {
            if (this.autoCreateHelper[compareKey + '_creating']) {
                return true;
            }
            var columnNode = this.columnNode;
            for (var i in columnNode.inputScokets_arr) {
                var inSocket = columnNode.inputScokets_arr[i];
                var links_arr = this.bluePrint.linkPool.getLinksBySocket(inSocket);
                if (links_arr.length > 0) {
                    var link = links_arr[0];
                    var outNode = link.outSocket.node;
                    if (outNode.type == SQLNODE_COLUMN) {
                        if (compareKey == outNode.getCompareKey()) {
                            return link;
                        }
                    }
                }
            }
            return null;
        }
    }, {
        key: 'addNewColumn',
        value: function addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
            return new SqlNode_Column({ tableCode: tableCode,
                tableAlias: tableAlias,
                tableName: tableName,
                columnName: columnName,
                cvalType: cvalType,
                left: x,
                top: y,
                newborn: newborn }, this, null);
        }
    }, {
        key: 'columnCheckChanged',
        value: function columnCheckChanged(tableCode, tableAlias, tableName, columnName, cvalType, isCheck) {
            var compareKey = (tableAlias == null ? tableCode : tableAlias) + '.' + columnName;
            var theLink = this.getSelectColumnLink(compareKey);
            if (isCheck) {
                // 加入
                if (theLink != null) {
                    return false;
                }
                var newSocket = this.columnNode.processInputSockets(true);
                newSocket.on(Event_CurrentComponentchanged, this.socketComponentCreated);
                this.newSocket = newSocket;
                this.autoCreateHelper[compareKey + '_creating'] = 1;
                this.autoCreateHelper[newSocket.id] = {
                    newSocket: newSocket,
                    step: 'created-socket',
                    columnName: columnName,
                    tableName: tableName,
                    tableAlias: tableAlias,
                    cvalType: cvalType,
                    tableCode: tableCode,
                    compareKey: compareKey
                };
            } else {
                // 删除
                if (theLink == null) {
                    return false;
                }
                var needRemoveSocket = theLink.inSocket;
                this.bluePrint.deleteNode(theLink.outSocket.node);
                this.columnNode.removeSocket(needRemoveSocket);
                this.columnNode.fireEvent(Event_SocketNumChanged);
            }
            return true;
        }
    }, {
        key: 'socketComponentCreated',
        value: function socketComponentCreated(socket) {
            if (socket.currentComponent) {
                var createInfo = this.autoCreateHelper[socket.id];
                if (createInfo.step == 'created-socket') {
                    var newColNode = this.addNewColumn(createInfo.tableCode, createInfo.tableAlias, createInfo.tableName, createInfo.columnName, createInfo.cvalType);
                    createInfo.newColNode = newColNode;
                    this.autoCreateHelper[newColNode.id] = createInfo;
                    this.bluePrint.fireChanged(10);
                    createInfo.step = 'created-column';

                    newColNode.on(Event_FrameComMount, this.newColumNodeFrameComMounted);
                }
            }
            socket.off(Event_CurrentComponentchanged, this.socketComponentCreated);
        }
    }, {
        key: 'newColumNodeFrameComMounted',
        value: function newColumNodeFrameComMounted(newColNode) {
            var createInfo = this.autoCreateHelper[newColNode.id];
            if (createInfo) {
                if (createInfo.step == 'created-column') {
                    /*
                    var inSocket = createInfo.newSocket;
                    var outSocket = newColNode.outSocket;
                    var inSocketCenter = inSocket.currentComponent.getCenterPos();
                    var outSocketCenter = outSocket.currentComponent.getCenterPos();
                    var offset = {x:inSocketCenter.x - outSocketCenter.x, y:inSocketCenter.y - outSocketCenter.y};
                    offset.x -= 150;
                    createInfo.newColNode.setPos(newColNode.left + offset.x, newColNode.top + offset.y);
                    createInfo.newColNode.currentFrameCom.reDraw();
                    */
                    // addLink
                    var newLink = this.bluePrint.linkPool.addLink(newColNode.outSocket, createInfo.newSocket);
                    newLink.straightOut(-150);
                }
                this.autoCreateHelper[createInfo.compareKey + '_creating'] = null;
            }
            newColNode.off(Event_FrameComMount, this.newColumNodeFrameComMounted);
        }
    }]);

    return SqlNode_Select;
}(SqlNode_Base);

var SqlNode_Var_Get = function (_SqlNode_Base6) {
    _inherits(SqlNode_Var_Get, _SqlNode_Base6);

    function SqlNode_Var_Get(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Var_Get);

        var _this17 = _possibleConstructorReturn(this, (SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(SqlNode_Var_Get)).call(this, initData, parentNode, creationInfo, SQLNODE_VAR_GET, '变量-获取'));

        autoBind(_this17);
        _this17.outSocket = new NodeSocket('out', _this17, false);
        _this17.addSocket(_this17.outSocket);

        _this17.varData = _this17.bluePrint.getVariableByName(_this17.varName);
        if (_this17.varData != null) {
            _this17.varData.on('changed', _this17.varChangedHandler);
        }
        _this17.varChangedHandler();

        var self = _this17;
        return _this17;
    }

    _createClass(SqlNode_Var_Get, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Get:' + this.varName;
        }
    }, {
        key: 'varChangedHandler',
        value: function varChangedHandler() {
            if (this.varData == null) {
                this.outSocket.set(MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null));
                return;
            }
            var varLabel = '';
            var valType = '';
            if (this.varData.removed) {
                this.varData = null;
                varLabel = this.varName + '-不存在';
                valType = SqlVarType_Unknown;
            } else {
                varLabel = this.varData.getLabel();
                valType = this.varData.getValType();
                this.varName = this.varData.name;
            }

            this.outSocket.set(MK_NS_Settings(varLabel, valType, null));
            //this.emit('changed');
        }
    }]);

    return SqlNode_Var_Get;
}(SqlNode_Base);

var SqlNode_Var_Set = function (_SqlNode_Base7) {
    _inherits(SqlNode_Var_Set, _SqlNode_Base7);

    function SqlNode_Var_Set(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Var_Set);

        var _this18 = _possibleConstructorReturn(this, (SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(SqlNode_Var_Set)).call(this, initData, parentNode, creationInfo, SQLNODE_VAR_SET, '变量-设置'));

        autoBind(_this18);

        _this18.outSocket = new NodeSocket('out', _this18, false);
        _this18.addSocket(_this18.outSocket);
        _this18.inSocket = new NodeSocket('in', _this18, true);
        _this18.addSocket(_this18.inSocket);

        _this18.varData = _this18.bluePrint.getVariableByName(_this18.varName);
        if (_this18.varData != null) {
            _this18.varData.on('changed', _this18.varChangedHandler);
        }
        _this18.varChangedHandler();

        var self = _this18;
        return _this18;
    }

    _createClass(SqlNode_Var_Set, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Set:' + this.varName;
        }
    }, {
        key: 'varChangedHandler',
        value: function varChangedHandler() {
            if (this.varData == null) {
                this.inSocket.set(MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null));
                return;
            }
            var varLabel = '';
            var valType = '';
            if (this.varData.removed) {
                this.varData = null;
                varLabel = this.varName + '-不存在';
                valType = SqlVarType_Unknown;
            } else {
                varLabel = this.varData.getLabel();
                valType = this.varData.getValType();
                this.varName = this.varData.name;
            }

            this.inSocket.set(MK_NS_Settings(varLabel, valType, null));
            this.outSocket.set(MK_NS_Settings('', valType, null));
            this.fireChanged();
        }
    }]);

    return SqlNode_Var_Set;
}(SqlNode_Base);

var SqlNode_NOperand = function (_SqlNode_Base8) {
    _inherits(SqlNode_NOperand, _SqlNode_Base8);

    function SqlNode_NOperand(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_NOperand);

        var _this19 = _possibleConstructorReturn(this, (SqlNode_NOperand.__proto__ || Object.getPrototypeOf(SqlNode_NOperand)).call(this, initData, parentNode, creationInfo, SQLNODE_NOPERAND, '运算'));

        autoBind(_this19);

        _this19.outSocket = new NodeSocket('out', _this19, false, { type: SqlVarType_Scalar });
        _this19.addSocket(_this19.outSocket);
        _this19.insocketInitVal = {
            type: SqlVarType_Scalar
        };
        _this19.addSocket(_this19.genInSocket());
        _this19.addSocket(_this19.genInSocket());
        if (_this19.operator == null) {
            _this19.operator = '+';
        }
        _this19.minInSocketCount = 2;

        var self = _this19;
        return _this19;
    }

    _createClass(SqlNode_NOperand, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '运算:' + this.operator;
        }
    }, {
        key: 'genInSocket',
        value: function genInSocket() {
            return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
        }
    }]);

    return SqlNode_NOperand;
}(SqlNode_Base);

var SqlNode_Ret_Condition = function (_SqlNode_Base9) {
    _inherits(SqlNode_Ret_Condition, _SqlNode_Base9);

    function SqlNode_Ret_Condition(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Ret_Condition);

        var _this20 = _possibleConstructorReturn(this, (SqlNode_Ret_Condition.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Condition)).call(this, initData, parentNode, creationInfo, SQLNODE_RET_CONDITION, 'Where'));

        autoBind(_this20);
        _this20.isConstNode = true;

        _this20.inSocket = new NodeSocket('in', _this20, true, { type: SqlVarType_Boolean, inputable: false });
        _this20.addSocket(_this20.inSocket);
        var self = _this20;
        return _this20;
    }

    return SqlNode_Ret_Condition;
}(SqlNode_Base);

var SqlNode_Ret_Order = function (_SqlNode_Base10) {
    _inherits(SqlNode_Ret_Order, _SqlNode_Base10);

    function SqlNode_Ret_Order(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Ret_Order);

        var _this21 = _possibleConstructorReturn(this, (SqlNode_Ret_Order.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Order)).call(this, initData, parentNode, creationInfo, SQLNODE_RET_CONDITION, 'Order'));

        autoBind(_this21);
        _this21.isConstNode = true;
        return _this21;
    }

    _createClass(SqlNode_Ret_Order, [{
        key: 'genInSocket',
        value: function genInSocket() {
            var socketName = 'in' + this.inputScokets_arr.length;
            var nameI = this.inputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('in' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
        }
    }, {
        key: 'orderTypeDropdownChangedHandler',
        value: function orderTypeDropdownChangedHandler(data, dropCtl) {
            var theSocketID = getAttributeByNode(dropCtl.rootDivRef.current, 'd-socketid');
            if (theSocketID == null) return;
            var theSocket = this.getSocketById(theSocketID);
            if (theSocket == null) return;
            theSocket.setExtra('orderType', data);
            //console.log(data);
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            if (!socket.isIn) {
                return;
            }
            var orderType = socket.getExtra('orderType');
            if (orderType == null) {
                orderType = OrderType_ASCE;
            }
            return React.createElement(DropDownControl, { itemChanged: this.orderTypeDropdownChangedHandler, btnclass: 'btn-dark', options_arr: OrderTypes_arr, rootclass: 'flex-grow-1 flex-shrink-1', value: orderType });
        }
    }]);

    return SqlNode_Ret_Order;
}(SqlNode_Base);

var SqlNode_Ret_Columns = function (_SqlNode_Base11) {
    _inherits(SqlNode_Ret_Columns, _SqlNode_Base11);

    function SqlNode_Ret_Columns(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Ret_Columns);

        var _this22 = _possibleConstructorReturn(this, (SqlNode_Ret_Columns.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Columns)).call(this, initData, parentNode, creationInfo, SQLNODE_RET_COLUMNS, 'RET 列'));

        autoBind(_this22);
        _this22.isConstNode = true;
        _this22.addFrameButton(FrameButton_LineSocket, '拉平');
        _this22.addFrameButton(FrameButton_ClearEmptySocket, '清理');
        return _this22;
    }

    _createClass(SqlNode_Ret_Columns, [{
        key: 'genInSocket',
        value: function genInSocket() {
            var socketName = 'in' + this.inputScokets_arr.length;
            var nameI = this.inputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('in' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
        }
    }, {
        key: 'freshContext',
        value: function freshContext() {}
    }, {
        key: 'linkAdded',
        value: function linkAdded(link) {
            _get(SqlNode_Ret_Columns.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Columns.prototype), 'linkAdded', this).call(this, link);
            var outNode = link.outSocket.node;
            if (outNode.type == SQLNODE_COLUMN) {
                this.parent.fireEvent('selectchanged', 0, {
                    tableCode: outNode.tableCode,
                    tableAlias: outNode.tableAlias,
                    columnName: outNode.columnName
                });
            }
        }
    }, {
        key: 'linkRemoved',
        value: function linkRemoved(link) {
            _get(SqlNode_Ret_Columns.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Columns.prototype), 'linkRemoved', this).call(this, link);
            var outNode = link.outSocket.node;
            if (outNode.type == SQLNODE_COLUMN) {
                this.parent.fireEvent('selectchanged', 0, {
                    tableCode: outNode.tableCode,
                    tableAlias: outNode.tableAlias,
                    columnName: outNode.columnName
                });
            }
        }
    }, {
        key: 'aliasInputChangedHanlder',
        value: function aliasInputChangedHanlder(ev) {
            var theSocketID = getAttributeByNode(ev.target, 'd-socketid');
            if (theSocketID == null) return;
            var theSocket = this.getSocketById(theSocketID);
            if (theSocket == null) return;
            theSocket.setExtra('alias', ev.target.value);
            theSocket.fireEvent('changed');
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            if (!socket.isIn) {
                return;
            }
            var alias = socket.getExtra('alias');
            if (alias == null) {
                alias = '';
            }
            return React.createElement(
                'div',
                null,
                'AS:',
                React.createElement('input', { type: 'text', className: 'socketInputer', big: '1', onChange: this.aliasInputChangedHanlder, value: alias })
            );
        }
    }]);

    return SqlNode_Ret_Columns;
}(SqlNode_Base);

var SqlNode_JoinNode = function (_SqlNode_Base12) {
    _inherits(SqlNode_JoinNode, _SqlNode_Base12);

    function SqlNode_JoinNode(initData) {
        _classCallCheck(this, SqlNode_JoinNode);

        var _this23 = _possibleConstructorReturn(this, (SqlNode_JoinNode.__proto__ || Object.getPrototypeOf(SqlNode_JoinNode)).call(this));

        Object.assign(_this23, initData);
        var self = _this23;
        _this23.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this23;
    }

    return SqlNode_JoinNode;
}(SqlNode_Base);

var D_Node = function (_EventEmitter5) {
    _inherits(D_Node, _EventEmitter5);

    function D_Node(initData) {
        _classCallCheck(this, D_Node);

        var _this24 = _possibleConstructorReturn(this, (D_Node.__proto__ || Object.getPrototypeOf(D_Node)).call(this));

        _this24.id = Object.assign(_this24, initData);
        var self = _this24;
        _this24.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this24;
    }

    return D_Node;
}(EventEmitter);

var C_Node_Socket = function (_React$PureComponent5) {
    _inherits(C_Node_Socket, _React$PureComponent5);

    function C_Node_Socket(props) {
        _classCallCheck(this, C_Node_Socket);

        var _this25 = _possibleConstructorReturn(this, (C_Node_Socket.__proto__ || Object.getPrototypeOf(C_Node_Socket)).call(this, props));

        autoBind(_this25);

        _this25.flagRef = React.createRef();
        _this25.inputRef = React.createRef();
        _this25.state = {
            socket: _this25.props.socket,
            draging: _this25.props.draging == true
        };
        return _this25;
    }

    _createClass(C_Node_Socket, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.editor.clickSocket(this.props.socket);
        }
    }, {
        key: 'getCenterPos',
        value: function getCenterPos() {
            var socket = this.state.socket;
            var nodeData = socket.node;
            if (nodeData.currentFrameCom == null || nodeData.currentFrameCom.rootDivRef.current == null) {
                return null;
            }
            var baseRect = nodeData.currentFrameCom.rootDivRef.current.getBoundingClientRect();
            var rect = this.flagRef.current.getBoundingClientRect();
            return { x: Math.round(nodeData.left + (rect.left - baseRect.left) + rect.width * 0.5), y: Math.round(nodeData.top + (rect.top - baseRect.top) + rect.height * 0.5) };
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenData(this.state.socket);
            this.state.socket.setCurrentComponent(this);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenData(this.state.socket);
            this.state.socket.setCurrentComponent(null);
        }
    }, {
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler(ev) {
            var socket = this.state.socket;
            if (socket.node.parent == null) {
                return; // node removed
            }
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'getContent',
        value: function getContent() {}
    }, {
        key: 'listenData',
        value: function listenData(socket) {
            if (socket) {
                socket.on('changed', this.nodeDataChangedHandler);
                socket.on(Event_LinkChanged, this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(socket) {
            if (socket) {
                socket.off('changed', this.nodeDataChangedHandler);
                socket.off(Event_LinkChanged, this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            var socket = this.props.socket;
            socket.set({ defval: ev.target.value });
        }
    }, {
        key: 'mouseDownDragIconHandler',
        value: function mouseDownDragIconHandler(ev) {
            if (this.props.startDragAct != null) {
                this.props.startDragAct(this);
            }
        }
    }, {
        key: 'setDraging',
        value: function setDraging(val) {
            this.setState({
                draging: val == true
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var socket = this.props.socket;
            if (this.props.socket != this.state.socket) {
                var self = this;
                this.unlistenData(this.state.socket);
                this.listenData(socket);
                setTimeout(function () {
                    self.setState({
                        socket: socket
                    });
                }, 10);
                return null;
            }
            var inputable = socket.isIn && SqlVarInputableTypes_arr.indexOf(socket.type) != -1;
            if (socket.inputable == false) {
                inputable = false;
            }
            var inputElem = null;
            if (inputable) {
                var links = socket.getLinks();
                if (links.length > 0) {
                    inputable = false;
                }
            }
            if (inputable) {
                inputElem = React.createElement('input', { type: 'text', ref: this.inputRef, className: 'socketInputer', onChange: this.inputChangedHandler, value: socket.defval == null ? '' : socket.defval });
            }
            var dragElem = null;
            if (this.props.startDragAct) {
                dragElem = React.createElement(
                    'div',
                    { className: 'btn btn-' + (this.state.draging ? 'primary' : 'dark'), onMouseDown: this.mouseDownDragIconHandler },
                    React.createElement('i', { className: 'fa fa-arrows-v cursor-pointer' })
                );
            }
            var cusElem = socket.node.customSocketRender(socket);

            var iconElem = React.createElement('i', { ref: this.flagRef, onClick: this.clickHandler, className: 'fa fa-circle-o cursor-pointer nodesocket', vt: socket.type });
            return React.createElement(
                'div',
                { className: 'd-flex align-items-center text-nowrap text-light socketCell', 'd-socketid': socket.id },
                this.props.align == 'left' && React.createElement(
                    React.Fragment,
                    null,
                    iconElem,
                    dragElem,
                    inputElem,
                    cusElem
                ),
                React.createElement(
                    'div',
                    { 'f-canmove': this.props.nameMoveable ? '1' : null },
                    socket.label
                ),
                this.props.align != 'left' && React.createElement(
                    React.Fragment,
                    null,
                    cusElem,
                    inputElem,
                    dragElem,
                    iconElem
                )
            );
        }
    }]);

    return C_Node_Socket;
}(React.PureComponent);

var C_SqlNode_Frame = function (_React$PureComponent6) {
    _inherits(C_SqlNode_Frame, _React$PureComponent6);

    function C_SqlNode_Frame(props) {
        _classCallCheck(this, C_SqlNode_Frame);

        var _this26 = _possibleConstructorReturn(this, (C_SqlNode_Frame.__proto__ || Object.getPrototypeOf(C_SqlNode_Frame)).call(this, props));

        autoBind(_this26);
        _this26.state = {
            editingTitle: false,
            moving: _this26.props.nodedata.newborn == true
        };

        _this26.rootDivRef = React.createRef();

        if (_this26.props.nodedata.newborn) {
            var self = _this26;
            setTimeout(function () {
                if (self.state.moving) {
                    self.startMove(null);
                    _this26.props.editor.setSelectedNF(_this26);
                }
            }, 10);
        }
        return _this26;
    }

    _createClass(C_SqlNode_Frame, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'addOffset',
        value: function addOffset(offset) {
            var nodeData = this.props.nodedata;
            nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
            this.reDraw();
        }
    }, {
        key: 'startMove',
        value: function startMove(moveBase) {
            this.moveBase = moveBase;
            window.addEventListener('mousemove', this.mousemoveWidthMoveHandler);
            window.addEventListener('mouseup', this.mouseupWidthMoveHandler);
            this.setState({
                moving: true
            });

            if (this.movingInt == null) {
                this.movingInt = setInterval(this.movingIntHandler, 100);
            }
            this.targetScroll = null;
        }
    }, {
        key: 'endMove',
        value: function endMove() {
            window.removeEventListener('mousemove', this.mousemoveWidthMoveHandler);
            window.removeEventListener('mouseup', this.mouseupWidthMoveHandler);
            this.props.nodedata.newborn = false;

            if (this.state.moving) {
                this.setState({
                    moving: false
                });
            }
            if (this.movingInt) {
                clearInterval(this.movingInt);
                this.movingInt = null;
            }
        }
    }, {
        key: 'clickEditTitleHandler',
        value: function clickEditTitleHandler() {
            this.setState({
                editingTitle: !this.state.editingTitle
            });
            this.props.nodedata.fireMoved(10);
        }
    }, {
        key: 'nodeTitleInputChangeHandler',
        value: function nodeTitleInputChangeHandler(ev) {
            var inputStr = ev.target.value;
            this.props.nodedata.title = inputStr.trim();
            this.props.nodedata.fireChanged();
            this.reDraw();
        }
    }, {
        key: 'nodeTitleInputKeypressHandler',
        value: function nodeTitleInputKeypressHandler(ev) {
            if (ev.nativeEvent.keyCode == 13) {
                this.setState({
                    editingTitle: false
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.endMove();
            this.unmounted = true;
            this.props.nodedata.currentFrameCom = null;
            this.props.nodedata.fireEvent(Event_FrameComUnMount, 10);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.nodedata.currentFrameCom = this;
            this.props.nodedata.fireEvent(Event_FrameComMount, 10);
        }
    }, {
        key: 'mousemoveWidthMoveHandler',
        value: function mousemoveWidthMoveHandler(ev) {
            var moveBase = this.moveBase;
            if (moveBase == null) {
                moveBase = {
                    x: 0,
                    y: 0
                };
            }
            var editorRootDiv = this.props.editor.zoomDivRef.current;
            var rootDiv = this.rootDivRef.current;
            var editorRootDivRect = editorRootDiv.getBoundingClientRect();
            var editorScale = editorRootDivRect.scale;
            if (editorScale == null || isNaN(editorScale)) {
                editorScale = 1;
            }
            var mouseX = ev.x;
            var mouseY = ev.y;
            var localPos = {
                x: mouseX - editorRootDivRect.left,
                y: mouseY - editorRootDivRect.top
            };
            var editorDiv = this.props.editor.editorDivRef.current;
            var newX = localPos.x - parseUnitInt(editorDiv.style.left) + moveBase.x;
            var newY = localPos.y - parseUnitInt(editorDiv.style.top) + moveBase.y;
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;
            rootDiv.style.left = newX + 'px';
            rootDiv.style.top = newY + 'px';
            var nodeData = this.props.nodedata;
            nodeData.setPos(newX, newY);
            return;

            scrollDivRect = {
                left: Math.round(scrollDivRect.left * editorScale),
                right: Math.round(scrollDivRect.right * editorScale),
                top: Math.round(scrollDivRect.top * editorScale),
                bottom: Math.round(scrollDivRect.bottom * editorScale),
                width: Math.round(scrollDivRect.width * editorScale),
                height: Math.round(scrollDivRect.height * editorScale)
            };
            //console.log(scrollDivRect);
            //console.log(WindowMouse);
            if (!MyMath.isPointInRect(scrollDivRect, WindowMouse)) {
                console.log('not hit : ');
                return;
            }
            var editorDivRect = this.props.editorDivRef.current.getBoundingClientRect();
            var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
            if (moveBase == null) {
                moveBase = {
                    x: 0,
                    y: 0
                    //x:-(editorDivRect.left + Math.round(rootDivRect.width * 0.5)), 
                    //y:-(editorDivRect.top + Math.round(rootDivRect.height * 0.5))
                };
            } else {}
            /*
            moveBase = {
                x:-(editorDivRect.left - moveBase.x), 
                y:-(editorDivRect.top - moveBase.y), 
            }
            */

            //console.log(moveBase);
            var mouseX = ev.x;
            var mouseY = ev.y;
            var localMouseX = ev.x - scrollDivRect.left + scrollDiv.scrollLeft;
            var localMouseY = ev.y - scrollDivRect.top + scrollDiv.scrollTop;
            localMouseX /= editorScale;
            localMouseY /= editorScale;
            var newX = localMouseX + moveBase.x;
            var newY = localMouseY + moveBase.y;
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;
            var newRight = newX + rootDivRect.width;
            var newBottom = newY + rootDivRect.height;
            //console.log('moveBase:' + JSON.stringify(moveBase));
            //console.log('mouseX:' + mouseX + 'mouseY:' + mouseY);
            //console.log('localMouseX:' + localMouseX + 'localMouseY:' + localMouseY);
            //console.log('editorScale:' + editorScale);
            if (newX < 0) {
                newX = 0;
            } else if (newRight > editorDivRect.width) {
                newX = editorDivRect.width - rootDivRect.width;
            }
            if (newY < 0) {
                newY = 0;
            } else if (newBottom > editorDivRect.height) {
                newY = editorDivRect.height - rootDivRect.height;
            }
            this.rootDivRef.current.style.left = newX + 'px';
            this.rootDivRef.current.style.top = newY + 'px';
            //console.log('nx:' + newX + ';ny:' + newY);

            var nodeData = this.props.nodedata;
            nodeData.left = newX;
            nodeData.top = newY;

            var targetScroll = {
                x: scrollDiv.scrollLeft,
                y: scrollDiv.scrollTop
            };
            var scrollgap = 50;
            if (newRight > scrollDiv.scrollLeft + scrollDivRect.width - scrollgap) {
                targetScroll.x += newRight - scrollDiv.scrollLeft - scrollDivRect.width + scrollgap;
            } else if (newX < scrollDiv.scrollLeft + scrollgap) {
                targetScroll.x += newX - scrollDiv.scrollLeft - scrollgap;
            }
            if (newBottom > scrollDiv.scrollTop + scrollDivRect.height - scrollgap) {
                targetScroll.y += newBottom - scrollDiv.scrollTop - scrollDivRect.height + scrollgap;
            } else if (newY < scrollDiv.scrollTop + scrollgap) {
                targetScroll.y += newY - scrollDiv.scrollTop - scrollgap;
            }

            this.targetScroll = {
                x: Math.round(targetScroll.x * editorScale),
                y: Math.round(targetScroll.y * editorScale)
            };
        }
    }, {
        key: 'movingIntHandler',
        value: function movingIntHandler() {
            var editorRootDiv = this.props.editor.zoomDivRef.current;
            var editorDiv = this.props.editor.editorDivRef.current;
            var theRect = editorRootDiv.getBoundingClientRect();
            var offset = {
                left: WindowMouse.x - theRect.left,
                top: WindowMouse.y - theRect.top,
                bottom: theRect.bottom - WindowMouse.y,
                right: theRect.right - WindowMouse.x
            };
            var gap = 100;
            var autoMove = { x: 0, y: 0 };
            if (offset.left > 0 && offset.left < gap) {
                autoMove.x = 1;
            } else if (offset.right > 0 && offset.right < gap) {
                autoMove.x = -1;
            }
            if (offset.top > 0 && offset.top < gap) {
                autoMove.y = 1;
            } else if (offset.bottom > 0 && offset.bottom < gap) {
                autoMove.y = -1;
            }
            if (autoMove.x != 0 || autoMove.y != 0) {
                editorDiv.style.left = parseUnitInt(editorDiv.style.left) + autoMove.x * 30 + 'px';
                editorDiv.style.top = parseUnitInt(editorDiv.style.top) + autoMove.y * 30 + 'px';
            }
            return;
            if (this.targetScroll) {
                var scrollDiv = this.props.editorDivRef.current.parentNode;
                var difX = this.targetScroll.x - scrollDiv.scrollLeft;
                var difY = this.targetScroll.y - scrollDiv.scrollTop;
                if (Math.abs(difX) > 1) {
                    var xstep = Math.sign(difX) * Math.min(Math.abs(difX), 50);
                    scrollDiv.scrollLeft += xstep;
                }
                if (Math.abs(difY) > 1) {
                    var ystep = Math.sign(difY) * Math.min(Math.abs(difY), 50);
                    scrollDiv.scrollTop += ystep;
                }
            }
        }
    }, {
        key: 'mouseupWidthMoveHandler',
        value: function mouseupWidthMoveHandler(ev) {
            this.endMove();
        }
    }, {
        key: 'moveBarMouseDownHandler',
        value: function moveBarMouseDownHandler(ev, forcedo) {
            if (!forcedo && ev.target != this.rootDivRef.current && ev.target.getAttribute('f-canmove') == null) {
                return;
            }
            var nodeData = this.props.nodedata;
            if (nodeData.isContainer) {
                if (this.lastClickTime == null || Date.now() - this.lastClickTime > 300) {
                    this.lastClickTime = Date.now();
                } else {
                    this.props.editor.setEditeNode(nodeData);
                    return;
                }
            }
            this.props.editor.setSelectedNF(this, ev != null && ev.ctrlKey);
            var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
            this.moveBase = { x: rootDivRect.left - WindowMouse.x, y: rootDivRect.top - WindowMouse.y };
            this.startMove(this.moveBase);
        }
    }, {
        key: 'setSelected',
        value: function setSelected(val) {
            this.setState({ selected: val });
        }

        /*
        clickDeleteHandler(ev){
            this.props.editor.wantDeleteNode(this.props.nodedata, this.getNodeTitle());
        }
        */

    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle(readable) {
            var nodeData = this.props.nodedata;
            if (readable) {
                return nodeData.getNodeTitle();
            }
            return this.props.getTitleFun == null ? nodeData.title == null ? '' : nodeData.title : this.props.getTitleFun();
        }
    }, {
        key: 'renderHead',
        value: function renderHead(nodeData) {
            if (this.props.isPure) {
                return null;
            }

            var headType = this.props.headType;
            if (headType == null) headType = 'default';
            if (headType == 'tiny') {
                var headElem = this.props.headText;
                if (this.props.cusHeaderFuc != null) {
                    headElem = this.props.cusHeaderFuc();
                }
                return React.createElement(
                    'div',
                    { className: 'd-flex nodeHead align-items-center', type: 'tiny' },
                    nodeData.hadFlow && React.createElement('i', { className: 'fa fa-arrow-circle-right nodeFlow' }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-0 text-nowrap text-center', 'f-canmove': 1 },
                        headElem
                    ),
                    nodeData.hadFlow && React.createElement('i', { className: 'fa fa-arrow-circle-right nodeFlow' })
                );
            } else if (headType == 'empty') {
                return null;
            }

            if (headType == 'default') {
                var nodeTitle = this.getNodeTitle();
                return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        'div',
                        { className: 'bg-light d-flex align-items-center text-dark', style: { fontSize: '1em' } },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 text-nowrap', 'f-canmove': 1 },
                            nodeData.label,
                            ':',
                            this.state.editingTitle ? React.createElement('input', { className: '', type: 'text', value: nodeTitle, onChange: this.nodeTitleInputChangeHandler, onKeyPress: this.nodeTitleInputKeypressHandler }) : React.createElement(
                                React.Fragment,
                                null,
                                React.createElement(
                                    'span',
                                    { className: '', 'f-canmove': 1 },
                                    nodeTitle
                                )
                            ),
                            React.createElement('i', { className: 'fa fa-edit ml-1 cursor-pointer', onClick: this.clickEditTitleHandler })
                        )
                    ),
                    React.createElement('div', { className: 'dropdown-divider' })
                );
            }
            return null;
        }
    }, {
        key: 'renderButtons',
        value: function renderButtons() {
            var _this27 = this;

            var nodeData = this.props.nodedata;
            if (nodeData.frameButtons_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'btn-group flex-grow-1 flex-shrink-1' },
                nodeData.frameButtons_arr.map(function (btnData) {
                    return React.createElement(
                        'button',
                        { key: btnData.name, type: 'button', onClick: _this27.clickFrameButtonHandler, className: 'btn btn-dark', 'd-btnname': btnData.name },
                        btnData.label
                    );
                })
            );
        }
    }, {
        key: 'clickFrameButtonHandler',
        value: function clickFrameButtonHandler(ev) {
            var btnName = getAttributeByNode(ev.target, 'd-btnname', true);
            if (btnName != null) {
                this.props.nodedata.clickFrameButton(btnName);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var posStyle = { left: parseInt(nodeData.left) + 'px', 'top': parseInt(nodeData.top), 'paddingTop': this.props.isPure ? '0.5em' : null };
            return React.createElement(
                'div',
                { ref: this.rootDivRef, onMouseDown: this.moveBarMouseDownHandler, className: 'position-absolute d-flex flex-column nodeRoot', style: posStyle, 'd-selected': this.state.selected ? '1' : null },
                this.renderHead(nodeData),
                this.renderButtons(),
                this.props.children
            );
        }
    }]);

    return C_SqlNode_Frame;
}(React.PureComponent);

var C_SqlNode_DBEntity = function (_React$PureComponent7) {
    _inherits(C_SqlNode_DBEntity, _React$PureComponent7);

    function C_SqlNode_DBEntity(props) {
        _classCallCheck(this, C_SqlNode_DBEntity);

        var _this28 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity)).call(this, props));

        autoBind(_this28);
        C_SqlNode_Base(_this28);

        _this28.state = {};

        _this28.dropdownRef = React.createRef();
        return _this28;
    }

    _createClass(C_SqlNode_DBEntity, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetentity;
            if (entity) {
                this.dropdownRef.current.setValue(entity.code);
            }
            this.setState({ magicObj: {} });
        }
    }, {
        key: 'cus_componentWillMount',
        value: function cus_componentWillMount() {
            this.listenData(this.props.nodedata);
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            this.unlistenData(this.props.nodedata);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {
            if (nodeData) {
                nodeData.on('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {
            if (nodeData) {
                nodeData.off('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'dropdownCtlChangedHandler',
        value: function dropdownCtlChangedHandler(selectedDBE) {
            var nodeData = this.props.nodedata;
            nodeData.setEntity(selectedDBE);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetentity;
            if (nodeData.title && nodeData.title.length > 0) {
                return nodeData.title;
            }
            var nodeTitle = entity == null ? '' : entity.loaded ? '' : '正在加载:' + entity.code;
            return nodeTitle;
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetentity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, getTitleFun: this.getNodeTitle, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.entities_arr, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_SqlNode_DBEntity;
}(React.PureComponent);

var C_SqlNode_Select = function (_React$PureComponent8) {
    _inherits(C_SqlNode_Select, _React$PureComponent8);

    function C_SqlNode_Select(props) {
        _classCallCheck(this, C_SqlNode_Select);

        var _this29 = _possibleConstructorReturn(this, (C_SqlNode_Select.__proto__ || Object.getPrototypeOf(C_SqlNode_Select)).call(this, props));

        autoBind(_this29);
        C_SqlNode_Base(_this29);

        _this29.state = {};
        return _this29;
    }

    _createClass(C_SqlNode_Select, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {}
    }, {
        key: 'cus_componentWillMount',
        value: function cus_componentWillMount() {
            this.listenData(this.props.nodedata);
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            this.unlistenData(this.props.nodedata);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {
            if (nodeData) {
                nodeData.on('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {
            if (nodeData) {
                nodeData.off('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'renderColumns',
        value: function renderColumns() {
            var nodeData = this.props.nodedata;
            var columns_arr = nodeData.columns_arr;
            if (columns_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement('div', { className: 'dropdown-divider' }),
                React.createElement(
                    'div',
                    null,
                    'Select'
                ),
                columns_arr.map(function (column) {
                    return React.createElement(
                        'div',
                        { key: column.name, className: 'text-nowrap' },
                        column.name
                    );
                })
            );
        }
    }, {
        key: 'renderOrderColumns',
        value: function renderOrderColumns() {
            var nodeData = this.props.nodedata;
            var columns_arr = nodeData.orderColumns_arr;
            if (columns_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement('div', { className: 'dropdown-divider' }),
                React.createElement(
                    'div',
                    null,
                    'Order by'
                ),
                columns_arr.map(function (column) {
                    return React.createElement(
                        'div',
                        { key: column.name, className: 'text-nowrap' },
                        column.name + '  ' + column.orderType
                    );
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                ),
                this.renderColumns(),
                this.renderOrderColumns()
            );
        }
    }]);

    return C_SqlNode_Select;
}(React.PureComponent);

var C_SqlNode_Select_Output = function (_React$PureComponent9) {
    _inherits(C_SqlNode_Select_Output, _React$PureComponent9);

    function C_SqlNode_Select_Output(props) {
        _classCallCheck(this, C_SqlNode_Select_Output);

        var _this30 = _possibleConstructorReturn(this, (C_SqlNode_Select_Output.__proto__ || Object.getPrototypeOf(C_SqlNode_Select_Output)).call(this, props));

        autoBind(_this30);

        _this30.state = {
            nodedata: _this30.props.nodedata
        };
        return _this30;
    }

    _createClass(C_SqlNode_Select_Output, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {}
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenData(this.state.nodedata);
            clearTimeout(this.delaySetTO);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {}
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {}
    }, {
        key: 'clickHandler',
        value: function clickHandler() {
            //console.log('clickHandler');
            this.props.editor.setEditeNode(this.props.nodedata);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this31 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this31.setState({
                        nodedata: _this31.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { nodedata: nodeData, clickHandler: this.clickHandler, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    '\u5217\u540D'
                )
            );
        }
    }]);

    return C_SqlNode_Select_Output;
}(React.PureComponent);

var C_SqlNode_Var_Get = function (_React$PureComponent10) {
    _inherits(C_SqlNode_Var_Get, _React$PureComponent10);

    function C_SqlNode_Var_Get(props) {
        _classCallCheck(this, C_SqlNode_Var_Get);

        var _this32 = _possibleConstructorReturn(this, (C_SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Get)).call(this, props));

        autoBind(_this32);

        C_SqlNode_Base(_this32);
        _this32.state = {
            //nodedata:this.props.nodedata,
        };
        return _this32;
    }

    _createClass(C_SqlNode_Var_Get, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: 'GET' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_SqlNode_Var_Get;
}(React.PureComponent);

var C_SqlNode_NOperand = function (_React$PureComponent11) {
    _inherits(C_SqlNode_NOperand, _React$PureComponent11);

    function C_SqlNode_NOperand(props) {
        _classCallCheck(this, C_SqlNode_NOperand);

        var _this33 = _possibleConstructorReturn(this, (C_SqlNode_NOperand.__proto__ || Object.getPrototypeOf(C_SqlNode_NOperand)).call(this, props));

        autoBind(_this33);

        C_SqlNode_Base(_this33);
        _this33.state = {
            operator: _this33.props.nodedata.operator
        };
        return _this33;
    }

    _createClass(C_SqlNode_NOperand, [{
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(newoperator) {
            var nodeData = this.props.nodedata;
            nodeData.operator = newoperator;
            this.setState({
                operator: newoperator
            });
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    width: '40px',
                    margin: 'auto'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(DropDownControl, { options_arr: ['+', '-', '×', '÷'], value: nodeData.operator, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle });
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null })
                )
            );
        }
    }]);

    return C_SqlNode_NOperand;
}(React.PureComponent);

var C_SqlNode_SimpleNode = function (_React$PureComponent12) {
    _inherits(C_SqlNode_SimpleNode, _React$PureComponent12);

    function C_SqlNode_SimpleNode(props) {
        _classCallCheck(this, C_SqlNode_SimpleNode);

        var _this34 = _possibleConstructorReturn(this, (C_SqlNode_SimpleNode.__proto__ || Object.getPrototypeOf(C_SqlNode_SimpleNode)).call(this, props));

        autoBind(_this34);

        C_SqlNode_Base(_this34);
        _this34.state = {};
        return _this34;
    }

    _createClass(C_SqlNode_SimpleNode, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: headType, headText: nodeData.label },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                )
            );
        }
    }]);

    return C_SqlNode_SimpleNode;
}(React.PureComponent);

var C_SqlNode_DBEntity_ColumnSelector = function (_React$PureComponent13) {
    _inherits(C_SqlNode_DBEntity_ColumnSelector, _React$PureComponent13);

    function C_SqlNode_DBEntity_ColumnSelector(props) {
        _classCallCheck(this, C_SqlNode_DBEntity_ColumnSelector);

        var _this35 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity_ColumnSelector.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity_ColumnSelector)).call(this, props));

        autoBind(_this35);
        C_SqlNode_Base(_this35);

        _this35.state = {};

        _this35.checkmap = {};
        return _this35;
    }

    _createClass(C_SqlNode_DBEntity_ColumnSelector, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            this.reDraw();
        }
    }, {
        key: 'selectChangedHandler',
        value: function selectChangedHandler(data) {
            var nodeData = this.props.nodedata;
            var needReDraw = false;
            if (data.tableAlias) {
                needReDraw = data.tableAlias == nodeData.alias;
            } else {
                needReDraw = data.tableCode == data.tableCode;
            }
            if (needReDraw) {
                this.reDraw();
            }
        }
    }, {
        key: 'cus_componentWillMount',
        value: function cus_componentWillMount() {
            this.listenData(this.props.nodedata);
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            this.unlistenData(this.props.nodedata);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {
            if (nodeData) {
                nodeData.on('changed', this.nodeDataChangedHandler);
                nodeData.parent.on('selectchanged', this.selectChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {
            if (nodeData) {
                nodeData.off('changed', this.nodeDataChangedHandler);
                nodeData.parent.off('selectchanged', this.selectChangedHandler);
            }
        }
    }, {
        key: 'mouseDownColumnNameHandler',
        value: function mouseDownColumnNameHandler(ev) {
            if (ev.button == 0) {
                var nodeData = this.props.nodedata;
                var parentNodeData = nodeData.parent;
                var entity = nodeData.entity;
                var initPos = this.props.editor.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });

                var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
                var column = entity.columns.find(function (x) {
                    return x.name == columnName;
                });
                if (column) {
                    var newNode = parentNodeData.addNewColumn(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, initPos.x, initPos.y, true);
                }
                this.props.editor.reDraw();
            }
        }
    }, {
        key: 'checkboxChangeHandler',
        value: function checkboxChangeHandler(ev) {
            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
            var column = entity.columns.find(function (x) {
                return x.name == columnName;
            });
            if (column) {
                parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, !this.checkmap[columnName]);
            }
        }
    }, {
        key: 'renderColumn',
        value: function renderColumn(entity, column, parentNodeData, nodeData) {
            var nodeData = this.props.nodedata;
            var compareKey = (nodeData.alias == null ? entity.code : nodeData.alias) + '.' + column.name;
            var isCheck = parentNodeData.isSelectColumn(compareKey);
            this.checkmap[column.name] = isCheck;
            return React.createElement(
                'div',
                { key: column.name, className: 'd-flex flex-grow-1 align-items-center ', 'data-colname': column.name },
                React.createElement('input', { type: 'checkbox', onChange: this.checkboxChangeHandler, checked: isCheck }),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 text-nowrap', onMouseDown: this.checkboxChangeHandler },
                    column.name
                ),
                React.createElement('i', { className: 'fa fa-hand-paper-o cursor-pointer', onMouseDown: this.mouseDownColumnNameHandler })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this36 = this;

            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: nodeData.label },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    entity.columns.map(function (column) {
                        return _this36.renderColumn(entity, column, parentNodeData, nodeData);
                    })
                )
            );
        }
    }]);

    return C_SqlNode_DBEntity_ColumnSelector;
}(React.PureComponent);

function C_SqlNode_componentWillMount() {
    this.props.nodedata.currentComponent = this;
    if (this.cus_componentWillMount != null) {
        this.cus_componentWillMount();
    }
}

function C_SqlNode_componentWillUnMount() {
    this.props.nodedata.currentComponent = null;
    if (this.cus_componentWillUnmount != null) {
        this.cus_componentWillUnmount();
    }
}

function C_ReDraw() {
    this.setState({
        magicobj: {}
    });
}

function C_SqlNode_Base(target) {
    target.frameRef = React.createRef();
    target.componentWillMount = C_SqlNode_componentWillMount.bind(target);
    target.componentWillUnmount = C_SqlNode_componentWillUnMount.bind(target);
    target.reDraw = C_ReDraw.bind(target);
}

function EV_BanEvent(et) {
    var nowVal = this.suspressEvents[et];
    this.suspressEvents[et] = nowVal == null ? 1 : nowVal + 1;
}

function EV_AllowEvent(et) {
    var nowVal = this.suspressEvents[et];
    if (nowVal > 0) {
        this.suspressEvents[et] = nowVal - 1;
    } else {
        console.warn('allowEvent执行时count等于' + nowVal);
    }
}

function EV_FireEvent(et, delay, arg) {
    if (this.suspressEvents[et] > 0) {
        console.warn(et + '被压抑了');
        return; // 压抑了此事件
    }
    if (delay == null || isNaN(delay)) {
        delay = 0;
    }
    if (delay < 0) {
        delay = 0;
    } else if (delay > 500) {
        console.warn('长达' + delay + '毫秒的延迟fire' + et);
    }
    var self = this;
    if (delay > 0) {
        setTimeout(function () {
            self.emit(et, arg == null ? self : arg);
        }, delay);
    } else {
        self.emit(et, arg == null ? self : arg);
    }
}

function EnhanceEventEmiter(target) {
    target.suspressEvents = {};
    target.fireEvent = EV_FireEvent.bind(target);
    target.banEvent = EV_BanEvent.bind(target);
    target.allowEvent = EV_AllowEvent.bind(target);
}

var C_SqlNode_Var_Set = function (_React$PureComponent14) {
    _inherits(C_SqlNode_Var_Set, _React$PureComponent14);

    function C_SqlNode_Var_Set(props) {
        _classCallCheck(this, C_SqlNode_Var_Set);

        var _this37 = _possibleConstructorReturn(this, (C_SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Set)).call(this, props));

        autoBind(_this37);

        C_SqlNode_Base(_this37);

        _this37.state = {};
        return _this37;
    }

    _createClass(C_SqlNode_Var_Set, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: 'SET' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_SqlNode_Var_Set;
}(React.PureComponent);

var C_SqlNode_ScoketsPanel = function (_React$PureComponent15) {
    _inherits(C_SqlNode_ScoketsPanel, _React$PureComponent15);

    function C_SqlNode_ScoketsPanel(props) {
        _classCallCheck(this, C_SqlNode_ScoketsPanel);

        var _this38 = _possibleConstructorReturn(this, (C_SqlNode_ScoketsPanel.__proto__ || Object.getPrototypeOf(C_SqlNode_ScoketsPanel)).call(this, props));

        autoBind(_this38);

        _this38.socketParentRef = React.createRef();
        return _this38;
    }

    _createClass(C_SqlNode_ScoketsPanel, [{
        key: 'reRender',
        value: function reRender() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.nodedata.on(Event_SocketNumChanged, this.reRender);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.nodedata.off(Event_SocketNumChanged, this.reRender);
        }
    }, {
        key: 'clickAddIconHandler',
        value: function clickAddIconHandler(ev) {
            this.props.processFun(true);
        }
    }, {
        key: 'clickSubIconHandler',
        value: function clickSubIconHandler(ev) {
            this.props.processFun(false);
        }
    }, {
        key: 'renderDynamic',
        value: function renderDynamic() {
            if (this.props.processFun == null) return null;
            return React.createElement(
                'div',
                { className: 'socketDynamicDiv d-flex' },
                React.createElement('i', { className: 'fa fa-plus-square ml-1 text-primary fa-2x cursor-pointer', onClick: this.clickAddIconHandler }),
                React.createElement('i', { className: 'fa fa-minus-square ml-1 text-danger fa-2x cursor-pointer', onClick: this.clickSubIconHandler })
            );
        }
    }, {
        key: 'startDragSocket',
        value: function startDragSocket(targetSocketCom) {
            this.dragingSocket = targetSocketCom.props.socket;
            window.addEventListener('mouseup', this.mouseUpWhenDragingHandler);
            window.addEventListener('mousemove', this.mouseMoveWhenDragingHandler);
            targetSocketCom.setDraging(true);

            var theLinks = this.dragingSocket.node.bluePrint.linkPool.getLinksBySocket(this.dragingSocket);
            if (theLinks.length > 0) {
                var theLink = theLinks[0];
                var otherNode = theLink.inSocket == this.dragingSocket ? theLink.outSocket.node : theLink.inSocket.node;
                var designer = otherNode.bluePrint.master.project.designer;
                designer.startDrag({ info: otherNode.getNodeTitle() }, null, null);
            }
        }
    }, {
        key: 'mouseUpWhenDragingHandler',
        value: function mouseUpWhenDragingHandler(ev) {
            if (this.dragingSocket.currentComponent) {
                this.dragingSocket.currentComponent.setDraging(false);
            }
            window.removeEventListener('mouseup', this.mouseUpWhenDragingHandler);
            window.removeEventListener('mousemove', this.mouseMoveWhenDragingHandler);
            this.dragingSocket = null;
        }
    }, {
        key: 'mouseMoveWhenDragingHandler',
        value: function mouseMoveWhenDragingHandler(ev) {
            if (this.dragingSocket == null) {
                mouseUpWhenDragingHandler(null);
                return;
            }
            if (this.socketParentRef.current == null) {
                return;
            }
            var sockets_arr = this.props.data;
            for (var i = 0; i < sockets_arr.length; ++i) {
                var theSocket = sockets_arr[i];
                var socketRect = theSocket.currentComponent.flagRef.current.getBoundingClientRect();
                if (ev.y > socketRect.top && ev.y < socketRect.bottom) {
                    if (theSocket == this.dragingSocket) {
                        return; // same socket
                    }
                    // swap socket
                    var dragingIndex = sockets_arr.indexOf(this.dragingSocket);
                    if (dragingIndex == -1) {
                        console.warn("dragingIndex = -1!");
                        return;
                    }
                    sockets_arr[dragingIndex] = theSocket;
                    sockets_arr[i] = this.dragingSocket;
                    this.dragingSocket.node.fireEvent(Event_SocketNumChanged);
                    this.dragingSocket.node.fireMoved(10);
                    return;
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this39 = this;

            if (this.props.data.length == 0) return React.createElement(
                'div',
                { className: 'flex-grow-1 flex-shrink-1' },
                this.renderDynamic()
            );

            var isDynamic = this.props.processFun != null;
            return React.createElement(
                'div',
                { ref: this.socketParentRef, className: 'd-flex flex-grow-1 flex-shrink-1 flex-column align-items-' + this.props.align },
                this.props.data.map(function (socketObj) {
                    return React.createElement(C_Node_Socket, { key: socketObj.id, socket: socketObj, align: _this39.props.align == 'start' ? 'left' : 'right', editor: _this39.props.editor, nameMoveable: _this39.props.nameMoveable, startDragAct: isDynamic ? _this39.startDragSocket : null, draging: socketObj == _this39.dragingSocket });
                }),
                this.renderDynamic()
            );
        }
    }]);

    return C_SqlNode_ScoketsPanel;
}(React.PureComponent);

var SelectItemManager = function () {
    function SelectItemManager(addCallBack, removeCallBack) {
        _classCallCheck(this, SelectItemManager);

        this.items_arr = [];
        this.removeCallBack = removeCallBack;
        this.addCallBack = addCallBack;

        autoBind(this);
    }

    _createClass(SelectItemManager, [{
        key: 'getIndex',
        value: function getIndex(item) {
            return this.items_arr.indexOf(item);
        }
    }, {
        key: 'isSelected',
        value: function isSelected(item) {
            return this.getIndex(item) != -1;
        }
    }, {
        key: 'add',
        value: function add(item) {
            if (item == null) return false;
            var index = this.getIndex(item);
            if (index == -1) {
                this.items_arr.push(item);
                if (this.addCallBack != null) {
                    this.addCallBack(item);
                }
            }
            return true;
        }
    }, {
        key: 'remove',
        value: function remove(item) {
            var index = this.getIndex(item);
            if (index == -1) {
                return false;
            }
            if (this.removeCallBack != null) {
                this.removeCallBack(item);
            }
            this.items_arr.splice(index, 1);
            return true;
        }
    }, {
        key: 'clear',
        value: function clear() {
            if (this.items_arr.length == 0) return;
            if (this.removeCallBack != null) {
                this.forEach(this.removeCallBack);
            }
            this.items_arr = [];
        }
    }, {
        key: 'forEach',
        value: function forEach(act) {
            this.items_arr.forEach(act);
        }
    }, {
        key: 'isEmpty',
        value: function isEmpty() {
            return this.count() == 0;
        }
    }, {
        key: 'count',
        value: function count() {
            return this.items_arr.length;
        }
    }]);

    return SelectItemManager;
}();

var C_SqlNode_Editor = function (_React$PureComponent16) {
    _inherits(C_SqlNode_Editor, _React$PureComponent16);

    function C_SqlNode_Editor(props) {
        _classCallCheck(this, C_SqlNode_Editor);

        var _this40 = _possibleConstructorReturn(this, (C_SqlNode_Editor.__proto__ || Object.getPrototypeOf(C_SqlNode_Editor)).call(this, props));

        _this40.state = {
            draing: false,
            editingNode: _this40.props.bluePrint,
            showLink: false,
            scale: 1
        };

        var self = _this40;
        setTimeout(function () {
            _this40.setState({
                showLink: true
            });
        }, 50);

        autoBind(_this40);
        _this40.dragingPathRef = React.createRef();
        _this40.editorDivRef = React.createRef();
        _this40.containerRef = React.createRef();
        _this40.topBarRef = React.createRef();
        _this40.zoomDivRef = React.createRef();
        _this40.selectRectRef = React.createRef();

        var editor = _this40;
        _this40.selectedNFManager = new SelectItemManager(_this40.cb_addNF, _this40.cb_removeNF);
        return _this40;
    }

    _createClass(C_SqlNode_Editor, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'blueprinkChanged',
        value: function blueprinkChanged(ev) {
            this.reDraw();
        }
    }, {
        key: 'cb_removeNF',
        value: function cb_removeNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(false);
            }
        }
    }, {
        key: 'cb_addNF',
        value: function cb_addNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(true);
            }
        }
    }, {
        key: 'setSelectedNF',
        value: function setSelectedNF(target, addMode) {
            if (target == null) {
                this.selectedNFManager.clear();
                return;
            }
            if (this.selectedNFManager.isSelected(target)) {
                return;
            }
            if (addMode == null || target == null) {
                addMode = false;
            }
            if (!addMode) {
                this.selectedNFManager.clear();
            }
            this.selectedNFManager.add(target);
        }
    }, {
        key: 'showNodeData',
        value: function showNodeData(nodeData) {
            if (nodeData.currentComponent) {
                var frameElem = nodeData.currentComponent.frameRef.current;
                if (frameElem == null) return null;
                this.setSelectedNF(frameElem);
                var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
                var zoomRect = this.zoomDivRef.current.getBoundingClientRect();

                if (!MyMath.intersectRect(frameRect, zoomRect)) {
                    var targetPos = {
                        x: Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                        y: Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5)
                    };
                    //console.log(targetPos);
                    this.editorDivRef.current.style.left = targetPos.x + 'px';
                    this.editorDivRef.current.style.top = targetPos.y + 'px';
                }
            }
        }
    }, {
        key: 'keyUpHandler',
        value: function keyUpHandler(ev) {
            //console.log(ev);
            switch (ev.keyCode) {
                case 27:
                    // esc
                    if (!this.selectedNFManager.isEmpty()) {
                        this.setSelectedNF(null);
                    }
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                case 46:
                    if (!this.selectedNFManager.isEmpty()) {
                        var titles = '';
                        var nodes_arr = [];
                        this.selectedNFManager.forEach(function (nf) {
                            titles += nf.getNodeTitle(true) + ';';
                            nodes_arr.push(nf.props.nodedata);
                        });
                        this.wantDeleteNode(nodes_arr, titles);
                    }
                    break;
            }
        }
    }, {
        key: 'keyDownHandler',
        value: function keyDownHandler(ev) {
            if (!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40) {
                var offset = { x: 0, y: 0 };
                switch (ev.keyCode) {
                    case 40:
                        offset.y = 10;
                        break;
                    case 38:
                        offset.y = -10;
                        break;
                    case 37:
                        offset.x = -10;
                        break;
                    case 39:
                        offset.x = 10;
                        break;
                }
                this.selectedNFManager.forEach(function (nf) {
                    nf.addOffset(offset);
                });
                ev.preventDefault();
            }
        }
    }, {
        key: 'wantDeleteNode',
        value: function wantDeleteNode(nodeData_arr, title) {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除' + nodeData_arr.length + '个节点:"' + title + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], nodeData_arr));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key, nodeData_arr) {
            if (key == 'ok') {
                this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
                this.setSelectedNF(null);
            }
        }
    }, {
        key: 'freshZoomDiv',
        value: function freshZoomDiv() {
            if (this.zoomDivRef.current) {
                var zoomDivElem = this.zoomDivRef.current;
                var $containerElem = $(this.containerRef.current);
                var $topBarElem = $(this.topBarRef.current);

                var newZoomDivSize = {
                    height: $containerElem.height() - $topBarElem.height(),
                    width: $containerElem.width(),
                    top: $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
                };

                if (this.preZoomDivSize == null) {
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                } else {
                    if (Math.abs(this.preZoomDivSize.height - newZoomDivSize.height) > 1) {
                        zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.width - newZoomDivSize.width) > 1) {
                        zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.top - newZoomDivSize.top) > 1) {
                        zoomDivElem.style.top = newZoomDivSize.top + 'px';
                    }
                }

                this.preZoomDivSize = newZoomDivSize;
            }
        }
    }, {
        key: 'listenBlueprint',
        value: function listenBlueprint(bp) {
            if (bp) {
                bp.on('changed', this.blueprinkChanged);
            };
            this.listenedBP = bp;
        }
    }, {
        key: 'unlistenBlueprint',
        value: function unlistenBlueprint(bp) {
            if (bp) {
                bp.off('changed', this.blueprinkChanged);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            window.addEventListener('keyup', this.keyUpHandler);
            window.addEventListener('keydown', this.keyDownHandler);

            this.freshInt = setInterval(this.freshZoomDiv, 500);
            this.freshZoomDiv();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            window.removeEventListener('keyup', this.keyUpHandler);
            window.removeEventListener('keydown', this.keyDownHandler);
            this.unlistenBlueprint(this.props.bluePrint);
            clearTimeout(this.delaySetTO);
            clearInterval(this.freshZoomDiv);
        }
    }, {
        key: 'mousemoveWidthDragingHandler',
        value: function mousemoveWidthDragingHandler(ev) {
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            var end = { x: ev.x - rootRect.left, y: ev.y - rootRect.top };
            var dragingPath = this.dragingPathRef.current;
            dragingPath.setState({
                end: end
            });
        }
    }, {
        key: 'mouseupWidthDragingHandler',
        value: function mouseupWidthDragingHandler(ev) {
            if (ev.target == this.editorDivRef.current) {
                if (this.preClickTime != null && Date.now() - this.preClickTime < 200) {
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                } else {
                    this.preClickTime = Date.now();
                    return;
                }
            }
        }
    }, {
        key: 'clickSocket',
        value: function clickSocket(srcSocket) {
            console.log(srcSocket);
            var srcNode = srcSocket.node;
            var dragingPath = this.dragingPathRef.current;
            if (dragingPath.state.draging == true) {
                var cancelDrag = false;
                if (srcSocket == dragingPath.state.startScoket) {
                    // 同一个socket连续点击
                    cancelDrag = true;
                } else if (dragingPath.state.startNode == srcNode) {
                    // 相同的node 忽略
                    //console.log('相同的node');
                    return;
                } else {
                    // 点击了不同的socket
                    if (srcSocket.isIn != dragingPath.state.startScoket.isIn) {
                        // 不同node的in out才能相互链接
                        this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                        cancelDrag = true;
                    }
                }
                if (cancelDrag) {
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                }
            } else {
                var rootRect = this.editorDivRef.current.getBoundingClientRect();
                dragingPath.setState({
                    draging: true,
                    start: srcSocket.currentComponent.getCenterPos(),
                    end: { x: WindowMouse.x - rootRect.left, y: WindowMouse.y - rootRect.top },
                    startScoket: srcSocket,
                    startNode: srcNode
                });
                window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }
    }, {
        key: 'setEditeNode',
        value: function setEditeNode(theNode) {
            var _this41 = this;

            if (theNode == this.state.editingNode) {
                return;
            }

            var editingNode = this.state.editingNode;
            var scrollNode = this.editorDivRef.current.parentNode;
            if (editingNode) {
                editingNode.scrollLeft = scrollNode.scrollLeft;
                editingNode.scrollTop = scrollNode.scrollTop;

                editingNode.postEditing();
            }

            this.setState({
                draging: false,
                editingNode: theNode,
                scale: 1,
                showLink: false
            });

            var self = this;
            setTimeout(function () {
                _this41.setState({
                    showLink: true
                });
            }, 50);

            if (theNode) {
                theNode.preEditing();
                theNode.bluePrint.editingNode = theNode;
                setTimeout(function () {
                    scrollNode.scrollLeft = theNode.scrollLeft == null ? 0 : theNode.scrollLeft;
                    scrollNode.scrollTop = theNode.scrollTop == null ? 0 : theNode.scrollTop;
                }, 50);
            }
        }
    }, {
        key: 'genSqlNode_Component',
        value: function genSqlNode_Component(CName, nodeData) {
            var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
            return React.createElement(CName, { key: blueprintPrefix + nodeData.id, nodedata: nodeData, editorDivRef: this.editorDivRef, editor: this });
        }
    }, {
        key: 'renderNode',
        value: function renderNode(nodeData) {
            if (nodeData == null) return null;
            switch (nodeData.type) {
                case SQLNODE_BDBENTITY:
                    return this.genSqlNode_Component(C_SqlNode_DBEntity, nodeData);
                    break;
                case SQLNODE_SELECT:
                    return this.genSqlNode_Component(C_SqlNode_Select, nodeData);
                    break;
                case SQLNODE_VAR_GET:
                    return this.genSqlNode_Component(C_SqlNode_Var_Get, nodeData);
                    break;
                case SQLNODE_VAR_SET:
                    return this.genSqlNode_Component(C_SqlNode_Var_Set, nodeData);
                    break;
                case SQLNODE_NOPERAND:
                    return this.genSqlNode_Component(C_SqlNode_NOperand, nodeData);
                    break;
                case SQLNODE_DBENTITY_COLUMNSELECTOR:
                    return this.genSqlNode_Component(C_SqlNode_DBEntity_ColumnSelector, nodeData);
                    break;
                default:
                    return this.genSqlNode_Component(C_SqlNode_SimpleNode, nodeData);
                    break;
            }

            return null;
        }
    }, {
        key: 'transToEditorPos',
        value: function transToEditorPos(pt) {
            var $zoomDivElem = $(this.zoomDivRef.current);
            var zoomOffset = $zoomDivElem.offset();

            var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
            var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
            return {
                x: x,
                y: y
            };
        }
    }, {
        key: 'addVarGSNode',
        value: function addVarGSNode(config, windPos) {
            var editingNode = this.state.editingNode;
            //var $zoomDivElem = $(this.zoomDivRef.current);
            //var zoomOffset = $zoomDivElem.offset();

            //var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
            //var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
            var editorPos = this.transToEditorPos(windPos);
            var newNodeData = null;
            if (config.isGet) {
                newNodeData = new SqlNode_Var_Get({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            } else {
                newNodeData = new SqlNode_Var_Set({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            }
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'mouseDownNodeCtlrHandler',
        value: function mouseDownNodeCtlrHandler(ctlData) {
            var editorDiv = this.editorDivRef.current;
            var editingNode = this.state.editingNode;
            var newNodeData = new ctlData.nodeClass({ newborn: true, left: -parseUnitInt(editorDiv.style.left), top: -parseUnitInt(editorDiv.style.top) }, editingNode);
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'mousemoveWithDragHandler',
        value: function mousemoveWithDragHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            //var scrollNode = this.editorDivRef.current.parentNode;
            //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
            //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
            //console.log(offset);
            this.editorDivRef.current.style.left = this.dragOrgin.left + offset.x + 'px';
            this.editorDivRef.current.style.top = this.dragOrgin.top + offset.y + 'px';
        }
    }, {
        key: 'mouseupWithDragHandler',
        value: function mouseupWithDragHandler(ev) {
            this.draging = false;
            window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
            window.removeEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }, {
        key: 'mousemoveWithSelectHandler',
        value: function mousemoveWithSelectHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            this.selectRectRef.current.setSize({
                width: offset.x,
                height: offset.y
            });
        }
    }, {
        key: 'mouseupWithSelectHandler',
        value: function mouseupWithSelectHandler(ev) {
            // check
            var theRect = this.selectRectRef.current.getRect();
            var hitNodes_arr = [];
            this.state.editingNode.nodes_arr.forEach(function (node) {
                var nodeRect = node.getRect();
                if (MyMath.intersectRect(nodeRect, theRect)) {
                    hitNodes_arr.push(node);
                }
            });
            if (!ev.ctrlKey) {
                this.selectedNFManager.clear();
            }
            if (hitNodes_arr.length > 0) {
                for (var i in hitNodes_arr) {
                    this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
                }
            }

            window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
            window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
            this.selectRectRef.current.setSize({
                width: 0,
                height: 0
            });
        }
    }, {
        key: 'rootMouseDownHandler',
        value: function rootMouseDownHandler(ev) {
            if (ev.target == this.zoomDivRef.current && this.draging != true) {
                var nowPos = {
                    x: parseUnitInt(this.editorDivRef.current.style.left),
                    y: parseUnitInt(this.editorDivRef.current.style.top)
                };
                this.dragOrgin = { x: WindowMouse.x, y: WindowMouse.y, left: nowPos.x, top: nowPos.y };
                if (ev.button == 0) {
                    // 拉取选择范围
                    var editorPos = this.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });
                    this.selectRectRef.current.setSize({
                        left: editorPos.x,
                        top: editorPos.y
                    });
                    window.addEventListener('mousemove', this.mousemoveWithSelectHandler);
                    window.addEventListener('mouseup', this.mouseupWithSelectHandler);
                    return;
                }
                this.draging = true;
                //var scrollNode = this.editorDivRef.current.parentNode;
                //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
                window.addEventListener('mousemove', this.mousemoveWithDragHandler);
                window.addEventListener('mouseup', this.mouseupWithDragHandler);
            }
        }
    }, {
        key: 'mouseWhileHandler',
        value: function mouseWhileHandler(ev) {
            console.log(ev);
        }
    }, {
        key: 'clickBigBtnHandler',
        value: function clickBigBtnHandler(ev) {
            var newScale = Math.min(this.state.scale + 0.1, 1);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickSmallBtnHandler',
        value: function clickSmallBtnHandler(ev) {
            var newScale = Math.max(this.state.scale - 0.1, 0.3);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickNavBtnHandler',
        value: function clickNavBtnHandler(ev) {
            var nodeId = getAttributeByNode(ev.target, 'data-id');
            if (nodeId == null) return;
            var theNode = this.props.bluePrint.getNodeByID(nodeId);
            if (theNode == this.state.editingNode) {
                return;
            }
            this.setEditeNode(theNode);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this42 = this;

            var editingNode = this.state.editingNode;
            if (this.props.bluePrint != editingNode.bluePrint) {
                var self = this;
                clearTimeout(this.delaySetTO);
                this.delaySetTO = setTimeout(function () {
                    _this42.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint);
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
            nodeParentList.push(editingNode);
            if (this.editorDivRef.current) {
                this.editorDivRef.current.scale = this.state.scale;
            }
            var self = this;
            var blueprintPrefix = editingNode.bluePrint.id + '_';
            if (this.listenedBP != editingNode.bluePrint) {
                this.unlistenBlueprint(this.listenedBP);
                this.listenBlueprint(editingNode.bluePrint);
            }
            var linkPool = editingNode.bluePrint.linkPool;

            return React.createElement(SplitPanel, {
                defPercent: 0.2,
                maxSize: '400px',
                barClass: 'bg-secondary',
                panel1: React.createElement(CusDBEEditorLeftPanel, { onMouseDown: this.mouseDownNodeCtlrHandler, editingNode: editingNode, editorDivRef: this.editorDivRef, editor: self }),
                panel2: React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column mw-100' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column', ref: this.containerRef },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-0 flex-shrink-0 border bg-light ', style: { height: '40px' }, ref: this.topBarRef },
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-grow-1 flex-shrink-1' },
                                React.createElement(
                                    'ul',
                                    { className: 'nav nav-pills flex-grow-1 flex-shrink-1' },
                                    nodeParentList.map(function (nodeData) {
                                        return React.createElement(
                                            'li',
                                            { className: 'nav-item', key: nodeData.id },
                                            React.createElement(
                                                'a',
                                                { className: "nav-link" + (nodeData == editingNode ? ' active' : ''), href: '#', 'data-id': nodeData.id, onClick: _this42.clickNavBtnHandler },
                                                nodeData.getNodeTitle(),
                                                nodeData != editingNode && React.createElement('i', { className: 'fa fa-angle-right ml-1' })
                                            )
                                        );
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'btn-group flex-grow-0 flex-shrink-0' },
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickBigBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-plus' })
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickSmallBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-minus' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 position-absolute hidenOverflow', style: { zoom: this.state.scale }, ref: this.zoomDivRef, onMouseDown: this.rootMouseDownHandler },
                            React.createElement(
                                'div',
                                { ref: this.editorDivRef, className: 'd-block position-absolute bg-dark', style: { width: '10px', height: '10px', overflow: 'visible' } },
                                editingNode.nodes_arr.map(function (nd) {
                                    return _this42.renderNode(nd); //<G_Node key={nd.id} data={nd} />
                                }),
                                React.createElement(C_Node_Path, { ref: this.dragingPathRef, editorDivRef: this.editorDivRef }),
                                this.state.showLink && linkPool.getAllLink().map(function (linkobj) {
                                    return React.createElement(C_Node_Path, { key: blueprintPrefix + linkobj.id, link: linkobj, editorDivRef: _this42.editorDivRef });
                                }),
                                React.createElement(C_SelectRect, { ref: this.selectRectRef })
                            )
                        )
                    )
                )
            });
        }
    }]);

    return C_SqlNode_Editor;
}(React.PureComponent);

var C_SelectRect = function (_React$PureComponent17) {
    _inherits(C_SelectRect, _React$PureComponent17);

    function C_SelectRect(props) {
        _classCallCheck(this, C_SelectRect);

        var _this43 = _possibleConstructorReturn(this, (C_SelectRect.__proto__ || Object.getPrototypeOf(C_SelectRect)).call(this, props));

        autoBind(_this43);

        _this43.state = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
        return _this43;
    }

    _createClass(C_SelectRect, [{
        key: 'setSize',
        value: function setSize(size) {
            this.setState(size);
        }
    }, {
        key: 'getRect',
        value: function getRect() {
            var nowSize = this.state;
            var rlt = {
                left: this.state.left + (nowSize.width < 0 ? nowSize.width : 0),
                top: this.state.top + (nowSize.height < 0 ? nowSize.height : 0),
                width: Math.abs(this.state.width),
                height: Math.abs(this.state.height)
            };
            rlt.right = rlt.left + rlt.width;
            rlt.bottom = rlt.top + rlt.height;
            return rlt;
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.width == 0 || this.state.height == 0) return null;

            var nowSize = this.state;
            var style = {
                left: this.state.left + (nowSize.width < 0 ? nowSize.width : 0) + 'px',
                top: this.state.top + (nowSize.height < 0 ? nowSize.height : 0) + 'px',
                width: Math.abs(this.state.width) + 'px',
                height: Math.abs(this.state.height) + 'px'
            };
            return React.createElement('div', { className: 'selectRect', style: style });
        }
    }]);

    return C_SelectRect;
}(React.PureComponent);

var C_Node_Path = function (_React$PureComponent18) {
    _inherits(C_Node_Path, _React$PureComponent18);

    function C_Node_Path(props) {
        _classCallCheck(this, C_Node_Path);

        var _this44 = _possibleConstructorReturn(this, (C_Node_Path.__proto__ || Object.getPrototypeOf(C_Node_Path)).call(this, props));

        autoBind(_this44);
        var initState = {};
        if (_this44.props.link) {
            initState.start = _this44.props.link.outSocket.currentComponent ? _this44.props.link.outSocket.currentComponent.getCenterPos() : null;
            initState.end = _this44.props.link.inSocket.currentComponent ? _this44.props.link.inSocket.currentComponent.getCenterPos() : null;
            initState.link = _this44.props.link;
        } else {
            initState.start = _this44.props.start;
            initState.end = _this44.props.end;
        }
        _this44.state = initState;

        _this44.rootDivRef = React.createRef();
        return _this44;
    }

    _createClass(C_Node_Path, [{
        key: 'startNodeMovedHandler',
        value: function startNodeMovedHandler() {
            var newVal = this.state.link.outSocket.currentComponent ? this.state.link.outSocket.currentComponent.getCenterPos() : null;
            this.setState({
                start: newVal
            });
        }
    }, {
        key: 'endNodeMovedHandler',
        value: function endNodeMovedHandler() {
            var newVal = this.state.link.inSocket.currentComponent ? this.state.link.inSocket.currentComponent.getCenterPos() : null;
            this.setState({
                end: newVal
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            if (this.props.link) {
                this.props.link.outSocket.node.on('moved', this.startNodeMovedHandler);
                this.props.link.outSocket.node.on(Event_CurrentComponentchanged, this.startNodeMovedHandler);
                this.props.link.inSocket.node.on('moved', this.endNodeMovedHandler);
                this.props.link.inSocket.node.on(Event_CurrentComponentchanged, this.endNodeMovedHandler);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.link) {
                this.props.link.outSocket.node.off('moved', this.startNodeMovedHandler);
                this.props.link.outSocket.node.off(Event_CurrentComponentchanged, this.startNodeMovedHandler);
                this.props.link.inSocket.node.off('moved', this.endNodeMovedHandler);
                this.props.link.inSocket.node.off(Event_CurrentComponentchanged, this.endNodeMovedHandler);
            }
        }
    }, {
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            if (ev.altKey) {
                console.log('delete link');
                if (this.props.link) {
                    this.props.link.pool.removeLink(this.props.link);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var start = this.state.start;
            var end = this.state.end;
            if (start == null || end == null) return null;
            var dis = Math.round(MyMath.disBetweenPoint(start, end));
            //console.log('dis:' + dis);
            var angle = dis == 0 ? 0 : Math.asin((end.y - start.y) / dis) * (180 / Math.PI);
            if (end.x < start.x) {
                if (end.y > start.y) angle = 180 - angle;else angle = -180 - angle;
            }
            //console.log(angle);
            var thisStyle = { width: dis + 'px', height: '2px', transform: 'rotate(' + angle + 'deg)', left: start.x + 'px', top: start.y + 'px' };
            return React.createElement('div', { ref: this.rootDivRef, className: 'nodepath', style: thisStyle, draging: this.state.draging ? 1 : null, onMouseDown: this.mouseDownHandler });
        }
    }]);

    return C_Node_Path;
}(React.PureComponent);

var G_Node = function (_React$PureComponent19) {
    _inherits(G_Node, _React$PureComponent19);

    function G_Node(props) {
        _classCallCheck(this, G_Node);

        return _possibleConstructorReturn(this, (G_Node.__proto__ || Object.getPrototypeOf(G_Node)).call(this, props));
    }

    _createClass(G_Node, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'position-absolute border d-flex flex-column', style: { left: '100px', top: '80px' } },
                React.createElement(
                    'div',
                    { className: 'text-center border-bottom' },
                    React.createElement(
                        'h3',
                        null,
                        '\u8282\u70B9\u6807\u9898'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1' },
                        '\u8F93\u5165',
                        React.createElement(
                            'div',
                            { className: 'd-flex align-items-baseline' },
                            React.createElement('i', { className: 'fa fa-circle-o' }),
                            React.createElement(
                                'div',
                                { className: 'ml-1' },
                                '\u6211\u5F53\u4F60\u7FFB\u5F00\u5386\u53F2\u5F97\u5206\u4EBA\u4F1A'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1 border-left' },
                        '\u8F93\u51FA',
                        React.createElement(
                            'div',
                            { className: 'd-flex align-items-baseline' },
                            React.createElement(
                                'div',
                                { className: 'ml-1' },
                                'a'
                            ),
                            React.createElement('i', { className: 'fa fa-circle-o' })
                        )
                    )
                )
            );
        }
    }]);

    return G_Node;
}(React.PureComponent);

var CusDBEEditor = function (_React$PureComponent20) {
    _inherits(CusDBEEditor, _React$PureComponent20);

    function CusDBEEditor(props) {
        _classCallCheck(this, CusDBEEditor);

        var _this46 = _possibleConstructorReturn(this, (CusDBEEditor.__proto__ || Object.getPrototypeOf(CusDBEEditor)).call(this, props));

        _this46.state = {};
        autoBind(_this46);
        _this46.editorDivRef = React.createRef();
        _this46.bluePrintRef = React.createRef();
        return _this46;
    }

    _createClass(CusDBEEditor, [{
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.draging) {
                window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
                window.removeEventListener('mouseup', this.mouseupWithDragHandler);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var editingItem = this.props.item;
            if (editingItem == null) {
                return null;
            }
            return React.createElement(C_SqlNode_Editor, { ref: this.bluePrintRef, bluePrint: editingItem, editorDivRef: this.editorDivRef });
        }
    }]);

    return CusDBEEditor;
}(React.PureComponent);

var cusDBEditorControls_arr = [{
    label: '源',
    nodeClass: SqlNode_DBEntity
}, {
    label: '选择',
    nodeClass: SqlNode_Select
}, {
    label: '多元运算',
    nodeClass: SqlNode_NOperand
}];

var SqlNodeOutlineItem = function (_React$PureComponent21) {
    _inherits(SqlNodeOutlineItem, _React$PureComponent21);

    function SqlNodeOutlineItem(props) {
        _classCallCheck(this, SqlNodeOutlineItem);

        var _this47 = _possibleConstructorReturn(this, (SqlNodeOutlineItem.__proto__ || Object.getPrototypeOf(SqlNodeOutlineItem)).call(this, props));

        autoBind(_this47);

        _this47.state = {
            label: _this47.props.nodeData.getNodeTitle(true)
        };
        return _this47;
    }

    _createClass(SqlNodeOutlineItem, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.nodeData.on('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.nodeData.off('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'nodeChangedhandler',
        value: function nodeChangedhandler() {
            this.setState({
                label: this.props.nodeData.getNodeTitle()
            });
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.clickHandler(this.props.nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'text-nowrap text-light cursor-pointer', onClick: this.clickHandler },
                this.state.label
            );
        }
    }]);

    return SqlNodeOutlineItem;
}(React.PureComponent);

var CusDBEEditorLeftPanel = function (_React$PureComponent22) {
    _inherits(CusDBEEditorLeftPanel, _React$PureComponent22);

    function CusDBEEditorLeftPanel(props) {
        _classCallCheck(this, CusDBEEditorLeftPanel);

        var _this48 = _possibleConstructorReturn(this, (CusDBEEditorLeftPanel.__proto__ || Object.getPrototypeOf(CusDBEEditorLeftPanel)).call(this, props));

        autoBind(_this48);
        return _this48;
    }

    _createClass(CusDBEEditorLeftPanel, [{
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('changed', this.editingNodeChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('changed', this.editingNodeChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            //listenNode(this.state.editingNode);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'editingNodeChangedhandler',
        value: function editingNodeChangedhandler() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'clickOutlineImteHandler',
        value: function clickOutlineImteHandler(nodeData) {
            this.props.editor.showNodeData(nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this49 = this;

            if (this.listenedNode != this.props.editingNode) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode);
            }
            return React.createElement(SplitPanel, {
                fixedOne: true,
                maxSize: 200,
                defPercent: 0.3,
                flexColumn: true,
                panel1: React.createElement(
                    'div',
                    { className: 'w-100 h-100 autoScroll d-flex flex-column' },
                    this.props.editingNode.nodes_arr.map(function (nodeData) {
                        return React.createElement(SqlNodeOutlineItem, { key: nodeData.id, nodeData: nodeData, clickHandler: _this49.clickOutlineImteHandler });
                    })
                ),
                panel2: React.createElement(
                    'div',
                    { className: 'd-flex flex-column h-100 w-100' },
                    React.createElement(CusDBEEditorVariables, { editingNode: this.props.editingNode, editor: this.props.editor }),
                    React.createElement(CusDBEEditorCanUseNodePanel, { editingNode: this.props.editingNode, onMouseDown: this.props.onMouseDown, editor: this.props.editor })
                )
            });
        }
    }]);

    return CusDBEEditorLeftPanel;
}(React.PureComponent);

var CusDBEEditorCanUseNodePanel = function (_React$PureComponent23) {
    _inherits(CusDBEEditorCanUseNodePanel, _React$PureComponent23);

    function CusDBEEditorCanUseNodePanel(props) {
        _classCallCheck(this, CusDBEEditorCanUseNodePanel);

        var _this50 = _possibleConstructorReturn(this, (CusDBEEditorCanUseNodePanel.__proto__ || Object.getPrototypeOf(CusDBEEditorCanUseNodePanel)).call(this, props));

        autoBind(_this50);
        return _this50;
    }

    _createClass(CusDBEEditorCanUseNodePanel, [{
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var ctlItem = cusDBEditorControls_arr.find(function (item) {
                return item.label == itemValue;
            });
            if (ctlItem) {
                this.props.onMouseDown(ctlItem);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this51 = this;

            var targetID = this.props.editingNode.bluePrint.code + 'canUseNode';
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'button',
                    { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                    '\u53EF\u7528\u8282\u70B9'
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-1 flex-shrink-1 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100' },
                            cusDBEditorControls_arr.map(function (item) {
                                return React.createElement(
                                    'button',
                                    { key: item.label, onMouseDown: _this51.mouseDownHandler, 'data-value': item.label, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                    item.label
                                );
                            })
                        )
                    )
                )
            );
        }
    }]);

    return CusDBEEditorCanUseNodePanel;
}(React.PureComponent);

var CusDBEEditorVariables = function (_React$PureComponent24) {
    _inherits(CusDBEEditorVariables, _React$PureComponent24);

    function CusDBEEditorVariables(props) {
        _classCallCheck(this, CusDBEEditorVariables);

        var _this52 = _possibleConstructorReturn(this, (CusDBEEditorVariables.__proto__ || Object.getPrototypeOf(CusDBEEditorVariables)).call(this, props));

        autoBind(_this52);
        return _this52;
    }

    _createClass(CusDBEEditorVariables, [{
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var ctlItem = cusDBEditorControls_arr.find(function (item) {
                return item.label == itemValue;
            });
            if (ctlItem && this.props.onMouseDown) {
                this.props.onMouseDown(ctlItem);
            }
        }
    }, {
        key: 'clickAddHandler',
        value: function clickAddHandler(ev) {
            this.props.editingNode.bluePrint.createEmptyVariable();
        }
    }, {
        key: 'varChangedhandler',
        value: function varChangedhandler() {
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('varChanged', this.varChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('varChanged', this.varChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this53 = this;

            if (this.listenedNode != this.props.editingNode) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode);
            }
            var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
            var targetID = blueprintPrefix + 'variables';
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center' },
                    React.createElement(
                        'button',
                        { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                        ' \u53D8\u91CF'
                    ),
                    React.createElement('i', { className: 'fa fa-plus fa-lg text-light cursor-pointer', onClick: this.clickAddHandler, style: { width: '30px' } })
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-1 flex-shrink-1 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100' },
                            this.props.editingNode.bluePrint.vars_arr.map(function (varData) {
                                return React.createElement(SqlDef_Variable_Component, { belongNode: _this53.props.editingNode, key: blueprintPrefix + varData.id, varData: varData, editor: _this53.props.editor });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return CusDBEEditorVariables;
}(React.PureComponent);

var NameInputRow = function (_React$PureComponent25) {
    _inherits(NameInputRow, _React$PureComponent25);

    function NameInputRow(props) {
        _classCallCheck(this, NameInputRow);

        var _this54 = _possibleConstructorReturn(this, (NameInputRow.__proto__ || Object.getPrototypeOf(NameInputRow)).call(this, props));

        _this54.state = {
            value: _this54.props.default ? _this54.props.default : '',
            isagent: _this54.props.isagent == true
        };
        autoBind(_this54);
        return _this54;
    }

    _createClass(NameInputRow, [{
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            if (!this.state.isagent) {
                this.setState({
                    value: ev.target.value
                });
            }
            if (this.props.onValueChanged) {
                this.props.onValueChanged(ev.target.value);
            }
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.state.isagent ? this.props.value : this.state.value;
        }
    }, {
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(data) {
            if (!this.state.isagent) {
                this.setState({
                    value: data
                });
            }
            if (this.props.onValueChanged) {
                this.props.onValueChanged(data);
            }
        }
    }, {
        key: 'renderInput',
        value: function renderInput() {
            var type = this.props.type;
            var value = this.state.isagent ? this.props.value : this.state.value;
            switch (type) {
                case 'text':
                case 'int':
                case 'float':
                case 'number':
                    return React.createElement('input', { type: 'string', onChange: this.inputChangedHandler, className: 'flex-grow-1 flex-shrink-1 flexinput', value: value });
                case 'date':
                    return React.createElement('input', { type: 'date', onChange: this.inputChangedHandler, className: 'flex-grow-1 flex-shrink-1 flexinput', value: value });
                case 'select':
                    return React.createElement(DropDownControl, { options_arr: this.props.options_arr, value: value, itemChanged: this.selectItemChangedHandler, rootclass: 'flex-grow-1 flex-shrink-1' });
            }

            return null;
        }
    }, {
        key: 'render',
        value: function render() {
            var nameStyle = {
                width: this.props.nameWidth ? this.props.nameWidth : '100px',
                color: this.props.nameColor
            };

            return React.createElement(
                'div',
                { className: 'd-flex ' + (this.props.rootClass ? this.props.rootClass : ''), style: this.props.rootStyle },
                React.createElement(
                    'div',
                    { className: 'text-center', style: nameStyle },
                    this.props.label
                ),
                this.renderInput()
            );
        }
    }]);

    return NameInputRow;
}(React.PureComponent);

var AddNewCusDSItemPanel = function (_React$PureComponent26) {
    _inherits(AddNewCusDSItemPanel, _React$PureComponent26);

    function AddNewCusDSItemPanel(props) {
        _classCallCheck(this, AddNewCusDSItemPanel);

        var _this55 = _possibleConstructorReturn(this, (AddNewCusDSItemPanel.__proto__ || Object.getPrototypeOf(AddNewCusDSItemPanel)).call(this, props));

        _this55.state = {};
        autoBind(_this55);

        _this55.nameRef = React.createRef();
        _this55.typeRef = React.createRef();
        return _this55;
    }

    _createClass(AddNewCusDSItemPanel, [{
        key: 'clickConfirmHandler',
        value: function clickConfirmHandler() {
            var name = this.nameRef.current.getValue().trim();
            if (name.length <= 2) {
                this.setState({
                    errinfo: '名字的长度必须大于2'
                });
                return;
            }
            if (this.props.dataMaster.hadCusDBE(name)) {
                this.setState({
                    errinfo: '已有同名的自订数据存在'
                });
                return;
            }
            var type = this.typeRef.current.getValue();
            if (type.length == 0) {
                this.setState({
                    errinfo: '必须选择类型'
                });
                return;
            }
            var newDBE = this.props.dataMaster.createCusDBE(name, type);
            this.props.onComplete(newDBE);
        }
    }, {
        key: 'clickCancelHandler',
        value: function clickCancelHandler() {
            this.props.onComplete(null);
        }
    }, {
        key: 'render',
        value: function render() {
            var nameWidth = 100;
            return React.createElement(
                FloatPanelbase,
                { title: '\u65B0\u5EFA\u81EA\u8BA2\u6570\u636E', width: 480, height: 320, initShow: true, sizeable: false, closeable: false, ismodel: true },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column autoScroll flex-grow-1 flex-shrink-1' },
                        React.createElement(NameInputRow, { label: '\u540D\u79F0', type: 'text', rootClass: 'm-1', nameWidth: nameWidth, ref: this.nameRef }),
                        React.createElement(NameInputRow, { label: '\u7C7B\u578B', type: 'select', rootClass: 'm-1', nameWidth: nameWidth, options_arr: ['表值', '标量值'], ref: this.typeRef }),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 text-info' },
                            this.state.errinfo
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0' },
                        React.createElement(
                            'button',
                            { type: 'button', onClick: this.clickConfirmHandler, className: 'btn btn-success flex-grow-1 flex-shrink-1' },
                            '\u521B\u5EFA'
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', onClick: this.clickCancelHandler, className: 'btn btn-danger flex-grow-1 flex-shrink-1' },
                            '\u53D6\u6D88'
                        )
                    )
                )
            );
        }
    }]);

    return AddNewCusDSItemPanel;
}(React.PureComponent);

var CreateDSItemPanel = function (_React$PureComponent27) {
    _inherits(CreateDSItemPanel, _React$PureComponent27);

    function CreateDSItemPanel(props) {
        _classCallCheck(this, CreateDSItemPanel);

        var _this56 = _possibleConstructorReturn(this, (CreateDSItemPanel.__proto__ || Object.getPrototypeOf(CreateDSItemPanel)).call(this, props));

        _this56.state = {
            items_arr: _this56.props.project.dataMaster.customDBEntities_arr,
            selectedItem: null
        };
        autoBind(_this56);
        return _this56;
    }

    _createClass(CreateDSItemPanel, [{
        key: 'clickListItemHandler',
        value: function clickListItemHandler(ev) {
            var targetCode = getAttributeByNode(ev.target, 'data-itemvalue', true, 5);
            var targetItem = this.state.items_arr.find(function (item) {
                return item.code == targetCode;
            });
            this.setState({ selectedItem: targetItem });
        }
    }, {
        key: 'clickAddBtnhandler',
        value: function clickAddBtnhandler(ev) {
            this.setState({
                creating: true
            });
        }
    }, {
        key: 'newCusCompleteHandler',
        value: function newCusCompleteHandler(newDBE) {
            this.setState({
                creating: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this57 = this;

            var selectedItem = this.state.selectedItem;
            return React.createElement(
                React.Fragment,
                null,
                this.state.creating ? React.createElement(AddNewCusDSItemPanel, { dataMaster: this.props.project.dataMaster, onComplete: this.newCusCompleteHandler }) : null,
                React.createElement(SplitPanel, {
                    defPercent: 0.45,
                    maxSize: '200px',
                    barClass: 'bg-secondary',
                    panel1: React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                        '\u5DF2\u521B\u5EFA\u7684:',
                        React.createElement(
                            'div',
                            { className: 'list-group flex-grow-1 flex-shrink-1 bg-dark autoScroll' },
                            this.state.items_arr.map(function (item) {
                                return React.createElement(
                                    'div',
                                    { onClick: _this57.clickListItemHandler, key: item.code, 'data-itemvalue': item.code, className: 'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '') },
                                    item.name + '-' + item.type
                                );
                            })
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', onClick: this.clickAddBtnhandler, className: 'btn btn-success' },
                            React.createElement('i', { className: 'fa fa-plus' })
                        )
                    ),
                    panel2: React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 bg-dark mw-100' },
                        React.createElement(CusDBEEditor, { item: selectedItem })
                    )
                })
            );
        }
    }]);

    return CreateDSItemPanel;
}(React.PureComponent);

var DataMasterPanel = function (_React$PureComponent28) {
    _inherits(DataMasterPanel, _React$PureComponent28);

    function DataMasterPanel(props) {
        _classCallCheck(this, DataMasterPanel);

        var _this58 = _possibleConstructorReturn(this, (DataMasterPanel.__proto__ || Object.getPrototypeOf(DataMasterPanel)).call(this, props));

        _this58.panelBaseRef = React.createRef();
        _this58.state = {};

        autoBind(_this58);

        var navItems = [CreateNavItemData('数据库', React.createElement(DataBasePanel, { project: _this58.props.project })), CreateNavItemData('创造数据', React.createElement(CreateDSItemPanel, { project: _this58.props.project }))];
        _this58.navData = {
            selectedItem: navItems[1],
            items: navItems
        };
        return _this58;
    }

    _createClass(DataMasterPanel, [{
        key: 'show',
        value: function show() {
            this.panelBaseRef.current.show();
        }
    }, {
        key: 'close',
        value: function close() {
            this.panelBaseRef.current.close();
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            this.panelBaseRef.current.toggle();
        }
    }, {
        key: 'navChanged',
        value: function navChanged(oldItem, newItem) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this59 = this;

            return React.createElement(
                FloatPanelbase,
                { title: '\u6570\u636E\u5927\u5E08', ref: this.panelBaseRef, initShow: true, initMax: true },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0' },
                    React.createElement(TabNavBar, { navData: this.navData, navChanged: this.navChanged })
                ),
                this.navData.items.map(function (item) {
                    return React.createElement(
                        'div',
                        { key: item.text, className: 'flex-grow-1 flex-shrink-1 ' + (item == _this59.navData.selectedItem ? ' d-flex' : ' d-none') },
                        item.content
                    );
                })
            );
        }
    }]);

    return DataMasterPanel;
}(React.PureComponent);