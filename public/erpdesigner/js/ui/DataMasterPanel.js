'use strict';

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
            self.startSynAction('keyword', 'T503B');
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
                var self = this;
                setTimeout(function () {
                    self.bluePrint.emit('changed');
                }, 10);
            }
            return this.link_map[id];
        }
    }, {
        key: 'removeLink',
        value: function removeLink(link) {
            if (this._deleteLink(link)) {
                this.cacheData = null;
                this.bluePrint.emit('changed');
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
        value: function getLinksByNode(theNode) {
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket.node == theNode || theLink.outSocket.node == theNode) {
                    rlt_arr.push(theLink);
                }
            }
            return rlt_arr;
        }
    }, {
        key: 'getLinksBySocket',
        value: function getLinksBySocket(theSocket) {
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket == theSocket || theLink.outSocket == theSocket) {
                    rlt_arr.push(theLink);
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
            this.emit('changed');
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
            this.emit('varChanged');
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
                this.emit('varChanged');
                varData.emit('changed');
            }
        }
    }, {
        key: 'deleteNode',
        value: function deleteNode(node) {
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
                this.emit('changed');
            }
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
    }]);

    return CustomDbEntity;
}(EventEmitter);

var SqlNode_Base = function (_EventEmitter3) {
    _inherits(SqlNode_Base, _EventEmitter3);

    function SqlNode_Base(initData, parentNode, creationInfo, type, label) {
        _classCallCheck(this, SqlNode_Base);

        var _this7 = _possibleConstructorReturn(this, (SqlNode_Base.__proto__ || Object.getPrototypeOf(SqlNode_Base)).call(this));

        _this7.bluePrint = parentNode.bluePrint;
        Object.assign(_this7, initData);
        _this7.label = label;
        if (_this7.type == null) _this7.type = type;
        if (_this7.left == null) _this7.left = 0;
        if (_this7.top == null) _this7.top = 0;
        _this7.hadFlow = true;

        _this7.bluePrint.registerNode(_this7, parentNode);

        if (creationInfo) {
            creationInfo.save(initData, _this7);
        }

        _this7.sockets_map = {};
        _this7.inputScokets_arr = [];
        _this7.outputScokets_arr = [];
        return _this7;
    }

    _createClass(SqlNode_Base, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return this.title == null ? '未命名' : this.title;
        }
    }, {
        key: 'getScoketByName',
        value: function getScoketByName(name, isIn) {
            if (isIn == null) isIn = '*';
            var rlt = [];
            if (isIn != false) {
                rlt.concat(this.inputScokets_arr.filter(function (item) {
                    return item.name == name;
                }));
            }

            if (isIn != true) {
                rlt.concat(this.outputScokets_arr.filter(function (item) {
                    return item.name == name;
                }));
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
        key: 'removedSocket',
        value: function removedSocket(socketObj) {
            if (socketObj.isIn) {
                removeElemFrommArray(this.inputScokets_arr, socketObj);
            } else {
                removeElemFrommArray(this.outputScokets_arr, socketObj);
            }
            this.sockets_map[socketObj.id] = null;
        }
    }, {
        key: 'setPos',
        value: function setPos(newx, newy) {
            this.left = newx;
            this.top = newy;
            this.emit('moved');
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
        this.emit(Event_CurrentComponentchanged);
    }
}

var NodeSocket = function (_EventEmitter4) {
    _inherits(NodeSocket, _EventEmitter4);

    function NodeSocket(name, tNode, isIn, initData) {
        _classCallCheck(this, NodeSocket);

        var _this8 = _possibleConstructorReturn(this, (NodeSocket.__proto__ || Object.getPrototypeOf(NodeSocket)).call(this));

        Object.assign(_this8, initData);
        _this8.name = name;
        _this8.node = tNode;
        _this8.isIn = isIn;
        _this8.id = tNode.id + '$' + name;
        _this8.setCurrentComponent = CommonFun_SetCurrentComponent.bind(_this8);
        return _this8;
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
    }]);

    return NodeSocket;
}(EventEmitter);

var SqlDef_Variable = function (_SqlNode_Base) {
    _inherits(SqlDef_Variable, _SqlNode_Base);

    function SqlDef_Variable(bluePrint, name, valType, size_1, size_2) {
        _classCallCheck(this, SqlDef_Variable);

        var _this9 = _possibleConstructorReturn(this, (SqlDef_Variable.__proto__ || Object.getPrototypeOf(SqlDef_Variable)).call(this, {
            name: name,
            valType: valType,
            size_1: isNaN(size_1) ? 0 : parseInt(size_1),
            size_2: isNaN(size_2) ? 0 : parseInt(size_2),
            isParam: 0
        }, bluePrint, null, SQLDEF_VAR, '变量'));

        autoBind(_this9);
        return _this9;
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
            this.emit('changed');
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

        var _this10 = _possibleConstructorReturn(this, (SqlDef_Variable_Component.__proto__ || Object.getPrototypeOf(SqlDef_Variable_Component)).call(this, props));

        var varData = _this10.props.varData;
        _this10.state = {
            name: varData.name,
            valType: varData.valType,
            isParam: varData.isParam,
            size_1: varData.size_1,
            size_2: varData.size_2,
            editing: varData.needEdit == true
        };

        autoBind(_this10);
        return _this10;
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

        var _this11 = _possibleConstructorReturn(this, (SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity)).call(this, initData, parentNode, creationInfo, SQLNODE_BDBENTITY, '数据源'));

        autoBind(_this11);

        if (_this11.targetentity != null) {
            var tem_arr = _this11.targetentity.split('-');
            if (tem_arr[0] == 'dbe') {
                _this11.targetentity = g_dataBase.getEntityByCode(tem_arr[1]);
                _this11.targetentity.on('syned', _this11.entitySynedHandler);
                //console.log(this.targetentity);
            } else {
                _this11.targetentity = null;
            }
        }

        var self = _this11;
        return _this11;
    }

    _createClass(SqlNode_DBEntity, [{
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            this.emit('changed');
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
            this.emit('changed');
        }
    }]);

    return SqlNode_DBEntity;
}(SqlNode_Base);

var SqlNode_Select = function (_SqlNode_Base3) {
    _inherits(SqlNode_Select, _SqlNode_Base3);

    function SqlNode_Select(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Select);

        var _this12 = _possibleConstructorReturn(this, (SqlNode_Select.__proto__ || Object.getPrototypeOf(SqlNode_Select)).call(this, initData, parentNode, creationInfo, SQLNODE_SELECT, '选择'));

        autoBind(_this12);

        if (_this12.columns_arr == null) {
            _this12.columns_ar = [];
        }
        if (_this12.nodes_arr == null) {
            _this12.nodes_arr = [];
        }

        if (_this12.innerSocket == null) {
            _this12.innerSocket = new NodeSocket({}, _this12, true);
        }
        return _this12;
    }

    _createClass(SqlNode_Select, [{
        key: 'setEntity',
        value: function setEntity(entity) {}
    }]);

    return SqlNode_Select;
}(SqlNode_Base);

var SqlNode_Var_Get = function (_SqlNode_Base4) {
    _inherits(SqlNode_Var_Get, _SqlNode_Base4);

    function SqlNode_Var_Get(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Var_Get);

        var _this13 = _possibleConstructorReturn(this, (SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(SqlNode_Var_Get)).call(this, initData, parentNode, creationInfo, SQLNODE_VAR_GET, '变量-获取'));

        autoBind(_this13);
        _this13.hadFlow = false;
        _this13.outSocket = new NodeSocket('out', _this13, false);
        _this13.addSocket(_this13.outSocket);

        _this13.varData = _this13.bluePrint.getVariableByName(_this13.varName);
        if (_this13.varData != null) {
            _this13.varData.on('changed', _this13.varChangedHandler);
        }
        _this13.varChangedHandler();

        var self = _this13;
        return _this13;
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

var SqlNode_Var_Set = function (_SqlNode_Base5) {
    _inherits(SqlNode_Var_Set, _SqlNode_Base5);

    function SqlNode_Var_Set(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_Var_Set);

        var _this14 = _possibleConstructorReturn(this, (SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(SqlNode_Var_Set)).call(this, initData, parentNode, creationInfo, SQLNODE_VAR_SET, '变量-设置'));

        autoBind(_this14);

        _this14.outSocket = new NodeSocket('out', _this14, false);
        _this14.addSocket(_this14.outSocket);
        _this14.inSocket = new NodeSocket('in', _this14, true);
        _this14.addSocket(_this14.inSocket);

        _this14.varData = _this14.bluePrint.getVariableByName(_this14.varName);
        if (_this14.varData != null) {
            _this14.varData.on('changed', _this14.varChangedHandler);
        }
        _this14.varChangedHandler();

        var self = _this14;
        return _this14;
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
            this.emit('changed');
        }
    }]);

    return SqlNode_Var_Set;
}(SqlNode_Base);

var SqlNode_NOperand = function (_SqlNode_Base6) {
    _inherits(SqlNode_NOperand, _SqlNode_Base6);

    function SqlNode_NOperand(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_NOperand);

        var _this15 = _possibleConstructorReturn(this, (SqlNode_NOperand.__proto__ || Object.getPrototypeOf(SqlNode_NOperand)).call(this, initData, parentNode, creationInfo, SQLNODE_NOPERAND, '运算'));

        autoBind(_this15);

        _this15.outSocket = new NodeSocket('out', _this15, false);
        _this15.addSocket(_this15.outSocket);
        _this15.insocketInitVal = {
            type: SqlVarType_Scalar
        };
        _this15.addSocket(_this15.genInSocket());
        _this15.addSocket(_this15.genInSocket());
        if (_this15.operator == null) {
            _this15.operator = '+';
        }
        _this15.hadFlow = false;

        var self = _this15;
        return _this15;
    }

    _createClass(SqlNode_NOperand, [{
        key: 'genInSocket',
        value: function genInSocket() {
            return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
        }
    }, {
        key: 'processInputSockets',
        value: function processInputSockets(isPlus) {
            if (isPlus) {
                this.addSocket(this.genInSocket());
                this.emit(Event_SocketNumChanged);
            } else {
                if (this.inputScokets_arr.length > 2) {
                    var needRemoveSocket = this.inputScokets_arr.pop();
                    this.bluePrint.linkPool.clearSocketLink(needRemoveSocket);
                    this.emit(Event_SocketNumChanged);
                }
            }
        }
    }]);

    return SqlNode_NOperand;
}(SqlNode_Base);

var SqlNode_JoinNode = function (_SqlNode_Base7) {
    _inherits(SqlNode_JoinNode, _SqlNode_Base7);

    function SqlNode_JoinNode(initData) {
        _classCallCheck(this, SqlNode_JoinNode);

        var _this16 = _possibleConstructorReturn(this, (SqlNode_JoinNode.__proto__ || Object.getPrototypeOf(SqlNode_JoinNode)).call(this));

        Object.assign(_this16, initData);
        var self = _this16;
        _this16.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this16;
    }

    return SqlNode_JoinNode;
}(SqlNode_Base);

var D_Node = function (_EventEmitter5) {
    _inherits(D_Node, _EventEmitter5);

    function D_Node(initData) {
        _classCallCheck(this, D_Node);

        var _this17 = _possibleConstructorReturn(this, (D_Node.__proto__ || Object.getPrototypeOf(D_Node)).call(this));

        _this17.id = Object.assign(_this17, initData);
        var self = _this17;
        _this17.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this17;
    }

    return D_Node;
}(EventEmitter);

var C_Node_Socket = function (_React$PureComponent5) {
    _inherits(C_Node_Socket, _React$PureComponent5);

    function C_Node_Socket(props) {
        _classCallCheck(this, C_Node_Socket);

        var _this18 = _possibleConstructorReturn(this, (C_Node_Socket.__proto__ || Object.getPrototypeOf(C_Node_Socket)).call(this, props));

        autoBind(_this18);

        _this18.flagRef = React.createRef();
        _this18.inputRef = React.createRef();
        _this18.state = {
            socket: _this18.props.socket
        };
        return _this18;
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

            var iconElem = React.createElement('i', { ref: this.flagRef, onClick: this.clickHandler, className: 'fa fa-circle-o cursor-pointer nodesocket', vt: socket.type });
            return React.createElement(
                'div',
                { className: 'd-flex align-items-center text-nowrap text-light socketCell' },
                this.props.align == 'left' && iconElem,
                this.props.align == 'left' && inputElem,
                socket.label,
                this.props.align != 'left' && iconElem
            );
        }
    }]);

    return C_Node_Socket;
}(React.PureComponent);

var C_SqlNode_Frame = function (_React$PureComponent6) {
    _inherits(C_SqlNode_Frame, _React$PureComponent6);

    function C_SqlNode_Frame(props) {
        _classCallCheck(this, C_SqlNode_Frame);

        var _this19 = _possibleConstructorReturn(this, (C_SqlNode_Frame.__proto__ || Object.getPrototypeOf(C_SqlNode_Frame)).call(this, props));

        autoBind(_this19);
        _this19.state = {
            editingTitle: false,
            moving: _this19.props.nodedata.newborn == true
        };

        _this19.rootDivRef = React.createRef();

        if (_this19.props.nodedata.newborn) {
            var self = _this19;
            setTimeout(function () {
                if (self.state.moving) {
                    self.startMove(null);
                    _this19.props.editor.setSelectedNF(_this19);
                }
            }, 10);
        }
        return _this19;
    }

    _createClass(C_SqlNode_Frame, [{
        key: 'addOffset',
        value: function addOffset(offset) {
            var nodeData = this.props.nodedata;
            nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
            this.setState({
                magicobj: {}
            });
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
        }
    }, {
        key: 'nodeTitleInputChangeHandler',
        value: function nodeTitleInputChangeHandler(ev) {
            var inputStr = ev.target.value;
            this.props.nodedata.title = inputStr.trim();
            this.setState({
                magicobj: {}
            });
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
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.nodedata.currentFrameCom = this;
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
            if (this.props.clickHandler) {
                if (this.lastClickTime == null || Date.now() - this.lastClickTime > 300) {
                    this.lastClickTime = Date.now();
                } else {
                    this.props.clickHandler();
                    return;
                }
            }
            this.props.editor.setSelectedNF(this);
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
        value: function getNodeTitle() {
            var nodeData = this.props.nodedata;
            return this.props.getTitleFun == null ? nodeData.title == null ? '未命名' : nodeData.title : this.props.getTitleFun();
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
                return React.createElement(
                    'div',
                    { className: 'd-flex nodeHead align-items-center', type: 'tiny' },
                    nodeData.hadFlow && React.createElement('i', { className: 'fa fa-arrow-circle-right nodeFlow' }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-0 text-nowrap text-center', 'f-canmove': 1 },
                        this.props.headText
                    ),
                    nodeData.hadFlow && React.createElement('i', { className: 'fa fa-arrow-circle-right nodeFlow' })
                );
            }

            if (headType == 'default') {
                var nodeTitle = this.getNodeTitle();
                return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        'div',
                        { className: 'bg-light d-flex align-items-center text-dark', style: { fontSize: '0.5em' } },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 text-nowrap' },
                            nodeData.label,
                            ':',
                            this.state.editingTitle ? React.createElement('input', { className: '', type: 'text', value: nodeTitle, onChange: this.nodeTitleInputChangeHandler, onKeyPress: this.nodeTitleInputKeypressHandler }) : React.createElement(
                                React.Fragment,
                                null,
                                React.createElement(
                                    'span',
                                    { className: '' },
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
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var posStyle = { left: parseInt(nodeData.left) + 'px', 'top': parseInt(nodeData.top), 'paddingTop': this.props.isPure ? '0.5em' : null };
            return React.createElement(
                'div',
                { ref: this.rootDivRef, onMouseDown: this.moveBarMouseDownHandler, className: 'position-absolute d-flex flex-column nodeRoot', style: posStyle, 'd-selected': this.state.selected ? '1' : null },
                this.renderHead(nodeData),
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

        var _this20 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity)).call(this, props));

        autoBind(_this20);

        _this20.state = {
            nodedata: _this20.props.nodedata
        };
        _this20.listenData(_this20.props.nodedata);
        _this20.dropdownRef = React.createRef();
        return _this20;
    }

    _createClass(C_SqlNode_DBEntity, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            var nodeData = this.state.nodedata;
            var entity = nodeData.targetentity;
            this.dropdownRef.current.setValue(entity.code);
            this.setState({ magicObj: {} });
        }
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
            var nodeData = this.state.nodedata;
            var entity = nodeData.targetentity;
            var nodeTitle = entity == null ? '新节点' : nodeData.title ? nodeData.title : entity.loaded ? entity.name : '正在加载:' + entity.code;
            return nodeTitle;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this21 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this21.setState({
                        nodedata: _this21.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            var entity = nodeData.targetentity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_SqlNode_Frame,
                { nodedata: nodeData, getTitleFun: this.getNodeTitle, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.entities_arr, rootclass: 'flex-grow-0 flex-shrink-0', style: { width: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-0 flex-shrink-0 align-items-center d-flex flex-column' },
                        React.createElement(C_Node_Socket, { clickHandler: this.socketOnClickHandler, height: '40px' })
                    )
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

        var _this22 = _possibleConstructorReturn(this, (C_SqlNode_Select.__proto__ || Object.getPrototypeOf(C_SqlNode_Select)).call(this, props));

        autoBind(_this22);

        _this22.state = {
            nodedata: _this22.props.nodedata
        };
        _this22.listenData(_this22.props.nodedata);
        return _this22;
    }

    _createClass(C_SqlNode_Select, [{
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
        key: 'clickHandler',
        value: function clickHandler() {
            //console.log('clickHandler');
            this.props.editor.setEditeNode(this.props.nodedata);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this23 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this23.setState({
                        nodedata: _this23.props.nodedata
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

    return C_SqlNode_Select;
}(React.PureComponent);

var C_SqlNode_Select_Output = function (_React$PureComponent9) {
    _inherits(C_SqlNode_Select_Output, _React$PureComponent9);

    function C_SqlNode_Select_Output(props) {
        _classCallCheck(this, C_SqlNode_Select_Output);

        var _this24 = _possibleConstructorReturn(this, (C_SqlNode_Select_Output.__proto__ || Object.getPrototypeOf(C_SqlNode_Select_Output)).call(this, props));

        autoBind(_this24);

        _this24.state = {
            nodedata: _this24.props.nodedata
        };
        return _this24;
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
            var _this25 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this25.setState({
                        nodedata: _this25.props.nodedata
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

        var _this26 = _possibleConstructorReturn(this, (C_SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Get)).call(this, props));

        autoBind(_this26);

        C_SqlNode_Base(_this26);
        _this26.state = {
            //nodedata:this.props.nodedata,
        };
        return _this26;
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
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
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

        var _this27 = _possibleConstructorReturn(this, (C_SqlNode_NOperand.__proto__ || Object.getPrototypeOf(C_SqlNode_NOperand)).call(this, props));

        autoBind(_this27);

        C_SqlNode_Base(_this27);
        _this27.state = {
            //nodedata:this.props.nodedata,
        };
        return _this27;
    }

    _createClass(C_SqlNode_NOperand, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: nodeData.operator },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.processInputSockets }),
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.processOutputSockets })
                )
            );
        }
    }]);

    return C_SqlNode_NOperand;
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

function C_SqlNode_Base(target) {
    target.frameRef = React.createRef();
    target.componentWillMount = C_SqlNode_componentWillMount.bind(target);
    target.componentWillUnmount = C_SqlNode_componentWillUnMount.bind(target);
}

var C_SqlNode_Var_Set = function (_React$PureComponent12) {
    _inherits(C_SqlNode_Var_Set, _React$PureComponent12);

    function C_SqlNode_Var_Set(props) {
        _classCallCheck(this, C_SqlNode_Var_Set);

        var _this28 = _possibleConstructorReturn(this, (C_SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Set)).call(this, props));

        autoBind(_this28);

        C_SqlNode_Base(_this28);

        _this28.state = {};
        return _this28;
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
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_SqlNode_Var_Set;
}(React.PureComponent);

var C_SqlNode_ScoketsPanel = function (_React$PureComponent13) {
    _inherits(C_SqlNode_ScoketsPanel, _React$PureComponent13);

    function C_SqlNode_ScoketsPanel(props) {
        _classCallCheck(this, C_SqlNode_ScoketsPanel);

        var _this29 = _possibleConstructorReturn(this, (C_SqlNode_ScoketsPanel.__proto__ || Object.getPrototypeOf(C_SqlNode_ScoketsPanel)).call(this, props));

        autoBind(_this29);

        if (_this29.props.processFun != null) {
            // add listen
            var nodedata = _this29.props.data[0].node;
            nodedata.on(Event_SocketNumChanged, _this29.reRender);
        }
        return _this29;
    }

    _createClass(C_SqlNode_ScoketsPanel, [{
        key: 'reRender',
        value: function reRender() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.processFun != null) {
                var nodedata = this.props.data[0].node;
                nodedata.off(Event_SocketNumChanged, this.reRender);
            }
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
        key: 'render',
        value: function render() {
            var _this30 = this;

            if (this.props.data.length == 0) return null;

            return React.createElement(
                'div',
                { className: 'd-flex flex-column align-items-' + this.props.align },
                this.props.data.map(function (socketObj) {
                    return React.createElement(C_Node_Socket, { key: socketObj.id, socket: socketObj, align: _this30.props.align == 'start' ? 'left' : 'right', editor: _this30.props.editor });
                }),
                this.renderDynamic()
            );
        }
    }]);

    return C_SqlNode_ScoketsPanel;
}(React.PureComponent);

var C_SqlNode_Editor = function (_React$PureComponent14) {
    _inherits(C_SqlNode_Editor, _React$PureComponent14);

    function C_SqlNode_Editor(props) {
        _classCallCheck(this, C_SqlNode_Editor);

        var _this31 = _possibleConstructorReturn(this, (C_SqlNode_Editor.__proto__ || Object.getPrototypeOf(C_SqlNode_Editor)).call(this, props));

        _this31.state = {
            draing: false,
            editingNode: _this31.props.bluePrint,
            showLink: false,
            scale: 1
        };

        var self = _this31;
        setTimeout(function () {
            _this31.setState({
                showLink: true
            });
        }, 50);

        autoBind(_this31);
        _this31.dragingPathRef = React.createRef();
        _this31.editorDivRef = React.createRef();
        _this31.containerRef = React.createRef();
        _this31.topBarRef = React.createRef();
        _this31.zoomDivRef = React.createRef();
        return _this31;
    }

    _createClass(C_SqlNode_Editor, [{
        key: 'blueprinkChanged',
        value: function blueprinkChanged(ev) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'setSelectedNF',
        value: function setSelectedNF(target) {
            if (this.selectedNF == target) {
                return;
            }
            if (this.selectedNF && !this.selectedNF.unmounted) {
                this.selectedNF.setSelected(false);
            }
            if (target) {
                target.setSelected(true);
            }
            this.selectedNF = target;
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
                    if (this.selectedNF) {
                        this.setSelectedNF(null);
                    }
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                case 46:
                    if (this.selectedNF) {
                        this.wantDeleteNode(this.selectedNF.props.nodedata, this.selectedNF.getNodeTitle());
                    }
                    break;
            }
        }
    }, {
        key: 'keyDownHandler',
        value: function keyDownHandler(ev) {
            if (this.selectedNF && ev.keyCode >= 37 && ev.keyCode <= 40) {
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
                this.selectedNF.addOffset(offset);
                ev.preventDefault();
            }
        }
    }, {
        key: 'wantDeleteNode',
        value: function wantDeleteNode(nodeData, title) {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除节点:"' + title + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], nodeData));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key, nodeData) {
            if (key == 'ok') {
                this.state.editingNode.deleteNode(nodeData);
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
                        this.state.editingNode.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
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
            var _this32 = this;

            if (theNode == this.state.editingNode) {
                return;
            }
            this.setSelectedNF(null);
            var editingNode = this.state.editingNode;
            var scrollNode = this.editorDivRef.current.parentNode;
            if (editingNode) {
                editingNode.scrollLeft = scrollNode.scrollLeft;
                editingNode.scrollTop = scrollNode.scrollTop;
            }

            this.setState({
                draging: false,
                editingNode: theNode,
                scale: 1,
                showLink: false
            });

            var self = this;
            setTimeout(function () {
                _this32.setState({
                    showLink: true
                });
            }, 50);

            if (theNode) {
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
            }

            return null;
        }
    }, {
        key: 'addVarGSNode',
        value: function addVarGSNode(config, windPos) {
            var editingNode = this.state.editingNode;
            var $zoomDivElem = $(this.zoomDivRef.current);
            var zoomOffset = $zoomDivElem.offset();

            var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
            var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
            var newNodeData = null;
            if (config.isGet) {
                newNodeData = new SqlNode_Var_Get({ left: x, top: y, varName: config.varName }, editingNode);
            } else {
                newNodeData = new SqlNode_Var_Set({ left: x, top: y, varName: config.varName }, editingNode);
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
        key: 'rootMouseDownHandler',
        value: function rootMouseDownHandler(ev) {
            if (ev.target == this.zoomDivRef.current && this.draging != true) {
                this.draging = true;
                //var scrollNode = this.editorDivRef.current.parentNode;
                //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
                var nowPos = {
                    x: parseUnitInt(this.editorDivRef.current.style.left),
                    y: parseUnitInt(this.editorDivRef.current.style.top)
                };
                this.dragOrgin = { x: WindowMouse.x, y: WindowMouse.y, left: nowPos.x, top: nowPos.y };
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
            var _this33 = this;

            var editingNode = this.state.editingNode;
            if (this.props.bluePrint != editingNode.bluePrint) {
                var self = this;
                clearTimeout(this.delaySetTO);
                this.delaySetTO = setTimeout(function () {
                    _this33.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint);
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
            nodeParentList.push(editingNode);
            if (this.editorDivRef.current) {
                this.editorDivRef.current.scale = this.state.scale;
            }
            var self = this;
            var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
            if (this.listenedBP != editingNode.bluePrint) {
                this.unlistenBlueprint(this.listenedBP);
                this.listenBlueprint(editingNode.bluePrint);
            }

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
                                                { className: "nav-link" + (nodeData == editingNode ? ' active' : ''), href: '#', 'data-id': nodeData.id, onClick: _this33.clickNavBtnHandler },
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
                                    return _this33.renderNode(nd); //<G_Node key={nd.id} data={nd} />
                                }),
                                React.createElement(C_Node_Path, { ref: this.dragingPathRef, editorDivRef: this.editorDivRef }),
                                this.state.showLink && editingNode.linkPool.getAllLink().map(function (linkobj) {
                                    return React.createElement(C_Node_Path, { key: blueprintPrefix + linkobj.id, link: linkobj, editorDivRef: _this33.editorDivRef });
                                })
                            )
                        )
                    )
                )
            });
        }
    }]);

    return C_SqlNode_Editor;
}(React.PureComponent);

var C_Node_Path = function (_React$PureComponent15) {
    _inherits(C_Node_Path, _React$PureComponent15);

    function C_Node_Path(props) {
        _classCallCheck(this, C_Node_Path);

        var _this34 = _possibleConstructorReturn(this, (C_Node_Path.__proto__ || Object.getPrototypeOf(C_Node_Path)).call(this, props));

        autoBind(_this34);
        var initState = {};
        if (_this34.props.link) {
            initState.start = _this34.props.link.outSocket.currentComponent ? _this34.props.link.outSocket.currentComponent.getCenterPos() : null;
            initState.end = _this34.props.link.inSocket.currentComponent ? _this34.props.link.inSocket.currentComponent.getCenterPos() : null;
            initState.link = _this34.props.link;
        } else {
            initState.start = _this34.props.start;
            initState.end = _this34.props.end;
        }
        _this34.state = initState;

        _this34.rootDivRef = React.createRef();
        return _this34;
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

var G_Node = function (_React$PureComponent16) {
    _inherits(G_Node, _React$PureComponent16);

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

var CusDBEEditor = function (_React$PureComponent17) {
    _inherits(CusDBEEditor, _React$PureComponent17);

    function CusDBEEditor(props) {
        _classCallCheck(this, CusDBEEditor);

        var _this36 = _possibleConstructorReturn(this, (CusDBEEditor.__proto__ || Object.getPrototypeOf(CusDBEEditor)).call(this, props));

        _this36.state = {};
        autoBind(_this36);
        _this36.editorDivRef = React.createRef();
        _this36.bluePrintRef = React.createRef();
        return _this36;
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

var SqlNodeOutlineItem = function (_React$PureComponent18) {
    _inherits(SqlNodeOutlineItem, _React$PureComponent18);

    function SqlNodeOutlineItem(props) {
        _classCallCheck(this, SqlNodeOutlineItem);

        var _this37 = _possibleConstructorReturn(this, (SqlNodeOutlineItem.__proto__ || Object.getPrototypeOf(SqlNodeOutlineItem)).call(this, props));

        autoBind(_this37);

        _this37.state = {
            label: _this37.props.nodeData.getNodeTitle()
        };
        return _this37;
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

var CusDBEEditorLeftPanel = function (_React$PureComponent19) {
    _inherits(CusDBEEditorLeftPanel, _React$PureComponent19);

    function CusDBEEditorLeftPanel(props) {
        _classCallCheck(this, CusDBEEditorLeftPanel);

        var _this38 = _possibleConstructorReturn(this, (CusDBEEditorLeftPanel.__proto__ || Object.getPrototypeOf(CusDBEEditorLeftPanel)).call(this, props));

        autoBind(_this38);
        return _this38;
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
            this.unlistenNode(this.state.editingNode);
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
            var _this39 = this;

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
                        return React.createElement(SqlNodeOutlineItem, { key: nodeData.id, nodeData: nodeData, clickHandler: _this39.clickOutlineImteHandler });
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

var CusDBEEditorCanUseNodePanel = function (_React$PureComponent20) {
    _inherits(CusDBEEditorCanUseNodePanel, _React$PureComponent20);

    function CusDBEEditorCanUseNodePanel(props) {
        _classCallCheck(this, CusDBEEditorCanUseNodePanel);

        var _this40 = _possibleConstructorReturn(this, (CusDBEEditorCanUseNodePanel.__proto__ || Object.getPrototypeOf(CusDBEEditorCanUseNodePanel)).call(this, props));

        autoBind(_this40);
        return _this40;
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
            var _this41 = this;

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
                                    { key: item.label, onMouseDown: _this41.mouseDownHandler, 'data-value': item.label, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
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

var CusDBEEditorVariables = function (_React$PureComponent21) {
    _inherits(CusDBEEditorVariables, _React$PureComponent21);

    function CusDBEEditorVariables(props) {
        _classCallCheck(this, CusDBEEditorVariables);

        var _this42 = _possibleConstructorReturn(this, (CusDBEEditorVariables.__proto__ || Object.getPrototypeOf(CusDBEEditorVariables)).call(this, props));

        autoBind(_this42);
        return _this42;
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
            var _this43 = this;

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
                                return React.createElement(SqlDef_Variable_Component, { belongNode: _this43.props.editingNode, key: blueprintPrefix + varData.id, varData: varData, editor: _this43.props.editor });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return CusDBEEditorVariables;
}(React.PureComponent);

var NameInputRow = function (_React$PureComponent22) {
    _inherits(NameInputRow, _React$PureComponent22);

    function NameInputRow(props) {
        _classCallCheck(this, NameInputRow);

        var _this44 = _possibleConstructorReturn(this, (NameInputRow.__proto__ || Object.getPrototypeOf(NameInputRow)).call(this, props));

        _this44.state = {
            value: _this44.props.default ? _this44.props.default : '',
            isagent: _this44.props.isagent == true
        };
        autoBind(_this44);
        return _this44;
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

var AddNewCusDSItemPanel = function (_React$PureComponent23) {
    _inherits(AddNewCusDSItemPanel, _React$PureComponent23);

    function AddNewCusDSItemPanel(props) {
        _classCallCheck(this, AddNewCusDSItemPanel);

        var _this45 = _possibleConstructorReturn(this, (AddNewCusDSItemPanel.__proto__ || Object.getPrototypeOf(AddNewCusDSItemPanel)).call(this, props));

        _this45.state = {};
        autoBind(_this45);

        _this45.nameRef = React.createRef();
        _this45.typeRef = React.createRef();
        return _this45;
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

var CreateDSItemPanel = function (_React$PureComponent24) {
    _inherits(CreateDSItemPanel, _React$PureComponent24);

    function CreateDSItemPanel(props) {
        _classCallCheck(this, CreateDSItemPanel);

        var _this46 = _possibleConstructorReturn(this, (CreateDSItemPanel.__proto__ || Object.getPrototypeOf(CreateDSItemPanel)).call(this, props));

        _this46.state = {
            items_arr: _this46.props.project.dataMaster.customDBEntities_arr,
            selectedItem: null
        };
        autoBind(_this46);
        return _this46;
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
            var _this47 = this;

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
                                    { onClick: _this47.clickListItemHandler, key: item.code, 'data-itemvalue': item.code, className: 'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '') },
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

var DataMasterPanel = function (_React$PureComponent25) {
    _inherits(DataMasterPanel, _React$PureComponent25);

    function DataMasterPanel(props) {
        _classCallCheck(this, DataMasterPanel);

        var _this48 = _possibleConstructorReturn(this, (DataMasterPanel.__proto__ || Object.getPrototypeOf(DataMasterPanel)).call(this, props));

        _this48.panelBaseRef = React.createRef();
        _this48.state = {};

        autoBind(_this48);

        var navItems = [CreateNavItemData('数据库', React.createElement(DataBasePanel, { project: _this48.props.project })), CreateNavItemData('创造数据', React.createElement(CreateDSItemPanel, { project: _this48.props.project }))];
        _this48.navData = {
            selectedItem: navItems[1],
            items: navItems
        };
        return _this48;
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
            var _this49 = this;

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
                        { key: item.text, className: 'flex-grow-1 flex-shrink-1 ' + (item == _this49.navData.selectedItem ? ' d-flex' : ' d-none') },
                        item.content
                    );
                })
            );
        }
    }]);

    return DataMasterPanel;
}(React.PureComponent);