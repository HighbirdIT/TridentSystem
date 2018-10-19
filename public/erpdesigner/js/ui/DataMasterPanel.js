'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var SQLNODE_VAR = 'variable';

var CustomDbEntity = function (_EventEmitter2) {
    _inherits(CustomDbEntity, _EventEmitter2);

    function CustomDbEntity(initData) {
        _classCallCheck(this, CustomDbEntity);

        var _this6 = _possibleConstructorReturn(this, (CustomDbEntity.__proto__ || Object.getPrototypeOf(CustomDbEntity)).call(this));

        _this6.nodes_arr = [];
        _this6.vars_arr = [];
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
            if (node.type == SQLNODE_VAR) {
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
            var rlt = new SqlNode_Variable(this, varName, SqlVarType_Int);
            rlt.needEdit = true;
            return rlt;
        }
    }, {
        key: 'removeVariable',
        value: function removeVariable(varData) {
            var index = this.vars_arr.indexOf(varData);
            if (index != -1) {
                this.vars_arr.splice(index, 1);
                this.emit('varChanged');
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

        _this7.bluePrint.registerNode(_this7, parentNode);

        if (creationInfo) {
            creationInfo.save(initData, _this7);
        }

        _this7.sockets_map = {};
        return _this7;
    }

    _createClass(SqlNode_Base, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return this.title == null ? '未命名' : this.title;
        }
    }, {
        key: 'genSocketID',
        value: function genSocketID(isIn) {
            var preFix = this.id + '_' + (isIn ? 'i' : 'o') + '_';
            for (var i = 0; i < 999; ++i) {
                var id = preFix + i;
                if (this.sockets_map[id] == null) return id;
            }
            return null;
        }
    }]);

    return SqlNode_Base;
}(EventEmitter);

var SqlNode_Variable = function (_SqlNode_Base) {
    _inherits(SqlNode_Variable, _SqlNode_Base);

    function SqlNode_Variable(bluePrint, name, valType, size_1, size_2) {
        _classCallCheck(this, SqlNode_Variable);

        var _this8 = _possibleConstructorReturn(this, (SqlNode_Variable.__proto__ || Object.getPrototypeOf(SqlNode_Variable)).call(this, {
            name: name,
            valType: valType,
            size_1: isNaN(size_1) ? 0 : parseInt(size_1),
            size_2: isNaN(size_2) ? 0 : parseInt(size_2)
        }, bluePrint, null, SQLNODE_VAR, '变量'));

        autoBind(_this8);
        return _this8;
    }

    return SqlNode_Variable;
}(SqlNode_Base);

var SqlNode_Variable_Component = function (_React$PureComponent4) {
    _inherits(SqlNode_Variable_Component, _React$PureComponent4);

    function SqlNode_Variable_Component(props) {
        _classCallCheck(this, SqlNode_Variable_Component);

        var _this9 = _possibleConstructorReturn(this, (SqlNode_Variable_Component.__proto__ || Object.getPrototypeOf(SqlNode_Variable_Component)).call(this, props));

        var varData = _this9.props.varData;
        _this9.state = {
            name: varData.name,
            valType: varData.valType,
            isParam: varData.isParam == true,
            size_1: varData.size_1,
            size_2: varData.size_2,
            editing: varData.needEdit == true
        };

        autoBind(_this9);
        return _this9;
    }

    _createClass(SqlNode_Variable_Component, [{
        key: 'varChanged',
        value: function varChanged() {
            var varData = this.props.varData;
            this.setState({
                name: varData.name,
                valType: varData.valType,
                isParam: varData.isParam == true,
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
        key: 'render',
        value: function render() {
            var varData = this.props.varData;
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary' },
                React.createElement(
                    'div',
                    { className: 'd-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center' },
                    React.createElement('input', { onChange: this.nameInputChangeHanlder, type: 'text', value: this.state.name, className: 'flexinput flex-grow-1 flex-shrink-1' }),
                    React.createElement('i', { className: 'fa fa-edit fa-lg text-success' })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex w-100 flex-grow-0 flex-shrink-0' },
                    React.createElement(DropDownControl, { itemChanged: this.valTypeChangedHandler, btnclass: 'btn-dark', options_arr: SqlVarTypes_arr, rootclass: 'flex-grow-1 flex-shrink-1', textAttrName: 'name', valueAttrName: 'code', value: this.state.valType })
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

    return SqlNode_Variable_Component;
}(React.PureComponent);

var SqlNode_DBEntity = function (_SqlNode_Base2) {
    _inherits(SqlNode_DBEntity, _SqlNode_Base2);

    function SqlNode_DBEntity(initData, parentNode, creationInfo) {
        _classCallCheck(this, SqlNode_DBEntity);

        var _this10 = _possibleConstructorReturn(this, (SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity)).call(this, initData, parentNode, creationInfo, SQLNODE_BDBENTITY, '数据源'));

        autoBind(_this10);

        if (_this10.targetentity != null) {
            var tem_arr = _this10.targetentity.split('-');
            if (tem_arr[0] == 'dbe') {
                _this10.targetentity = g_dataBase.getEntityByCode(tem_arr[1]);
                _this10.targetentity.on('syned', _this10.entitySynedHandler);
                //console.log(this.targetentity);
            } else {
                _this10.targetentity = null;
            }
        }

        var self = _this10;
        return _this10;
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

        var _this11 = _possibleConstructorReturn(this, (SqlNode_Select.__proto__ || Object.getPrototypeOf(SqlNode_Select)).call(this, initData, parentNode, creationInfo, SQLNODE_SELECT, '选择'));

        autoBind(_this11);

        if (_this11.columns_arr == null) {
            _this11.columns_ar = [];
        }
        if (_this11.nodes_arr == null) {
            _this11.nodes_arr = [];
        }

        if (_this11.innerSocket == null) {
            _this11.innerSocket = new NodeSocket({}, _this11, true);
        }
        return _this11;
    }

    _createClass(SqlNode_Select, [{
        key: 'setEntity',
        value: function setEntity(entity) {}
    }]);

    return SqlNode_Select;
}(SqlNode_Base);

var SqlNode_JoinNode = function (_SqlNode_Base4) {
    _inherits(SqlNode_JoinNode, _SqlNode_Base4);

    function SqlNode_JoinNode(initData) {
        _classCallCheck(this, SqlNode_JoinNode);

        var _this12 = _possibleConstructorReturn(this, (SqlNode_JoinNode.__proto__ || Object.getPrototypeOf(SqlNode_JoinNode)).call(this));

        Object.assign(_this12, initData);
        var self = _this12;
        _this12.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this12;
    }

    return SqlNode_JoinNode;
}(SqlNode_Base);

var D_Node = function (_EventEmitter4) {
    _inherits(D_Node, _EventEmitter4);

    function D_Node(initData) {
        _classCallCheck(this, D_Node);

        var _this13 = _possibleConstructorReturn(this, (D_Node.__proto__ || Object.getPrototypeOf(D_Node)).call(this));

        _this13.id = Object.assign(_this13, initData);
        var self = _this13;
        _this13.inSockets_arr.forEach(function (sd, i) {
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        });
        return _this13;
    }

    return D_Node;
}(EventEmitter);

var NodeSocket = function (_EventEmitter5) {
    _inherits(NodeSocket, _EventEmitter5);

    function NodeSocket(initData, tNode, isIn) {
        _classCallCheck(this, NodeSocket);

        var _this14 = _possibleConstructorReturn(this, (NodeSocket.__proto__ || Object.getPrototypeOf(NodeSocket)).call(this));

        Object.assign(_this14, initData);
        _this14.node = tNode;
        _this14.isIn = isIn;
        return _this14;
    }

    return NodeSocket;
}(EventEmitter);

var C_Node_Socket = function (_React$PureComponent5) {
    _inherits(C_Node_Socket, _React$PureComponent5);

    function C_Node_Socket(props) {
        _classCallCheck(this, C_Node_Socket);

        var _this15 = _possibleConstructorReturn(this, (C_Node_Socket.__proto__ || Object.getPrototypeOf(C_Node_Socket)).call(this, props));

        autoBind(_this15);

        _this15.flagRef = React.createRef();
        return _this15;
    }

    _createClass(C_Node_Socket, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.clickHandler(this);
        }
    }, {
        key: 'getCenterPos',
        value: function getCenterPos(offsetRect) {
            var rect = this.flagRef.current.getBoundingClientRect();
            return { x: Math.round(rect.left + rect.width * 0.5 - offsetRect.left), y: Math.round(rect.top + rect.height * 0.5 - offsetRect.top) };
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { style: { height: this.props.height, width: this.props.width }, className: 'd-flex align-items-center nodesocket', type: 'dbe' },
                ' ',
                React.createElement('i', { ref: this.flagRef, onClick: this.clickHandler, className: 'fa fa-circle-o cursor-pointer' }),
                ' '
            );
        }
    }]);

    return C_Node_Socket;
}(React.PureComponent);

var C_SqlNode_Frame = function (_React$PureComponent6) {
    _inherits(C_SqlNode_Frame, _React$PureComponent6);

    function C_SqlNode_Frame(props) {
        _classCallCheck(this, C_SqlNode_Frame);

        var _this16 = _possibleConstructorReturn(this, (C_SqlNode_Frame.__proto__ || Object.getPrototypeOf(C_SqlNode_Frame)).call(this, props));

        autoBind(_this16);
        _this16.state = {
            editingTitle: false,
            moving: _this16.props.nodedata.newborn == true
        };

        _this16.rooDivRef = React.createRef();

        if (_this16.props.nodedata.newborn) {
            var self = _this16;
            setTimeout(function () {
                if (self.state.moving) {
                    self.startMove(null);
                }
            }, 10);
        }
        return _this16;
    }

    _createClass(C_SqlNode_Frame, [{
        key: 'startMove',
        value: function startMove(moveBase) {
            this.moveBase = moveBase;
            window.addEventListener('mousemove', this.mousemoveWidthMoveHandler);
            window.addEventListener('mouseup', this.mouseupWidthMoveHandler);
            this.setState({
                moving: true
            });

            this.movingInt = setInterval(this.movingIntHandler, 100);
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
        }
    }, {
        key: 'mousemoveWidthMoveHandler',
        value: function mousemoveWidthMoveHandler(ev) {
            var moveBase = this.moveBase;
            var scrollDiv = this.props.editorDivRef.current.parentNode;
            var scrollDivRect = scrollDiv.getBoundingClientRect();
            var editorScale = this.props.editorDivRef.current.scale;
            if (editorScale == null || isNaN(editorScale)) {
                editorScale = 1;
            }
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
            var rootDivRect = this.rooDivRef.current.getBoundingClientRect();
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
            this.rooDivRef.current.style.left = newX + 'px';
            this.rooDivRef.current.style.top = newY + 'px';
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
        value: function moveBarMouseDownHandler(ev) {
            if (ev.target != this.rooDivRef.current) {
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
            var rootDivRect = this.rooDivRef.current.getBoundingClientRect();
            this.moveBase = { x: rootDivRect.left - WindowMouse.x, y: rootDivRect.top - WindowMouse.y };
            this.startMove(this.moveBase);
        }
    }, {
        key: 'clickDeleteHandler',
        value: function clickDeleteHandler(ev) {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除节点:"' + this.getNodeTitle() + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo]));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key) {
            if (key == 'ok') {
                this.props.nodedata.bluePrint.deleteNode(this.props.nodedata);
            }
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            var nodeData = this.props.nodedata;
            return this.props.getTitleFun == null ? nodeData.title == null ? '未命名' : nodeData.title : this.props.getTitleFun();
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeTitle = this.getNodeTitle();
            var nodeData = this.props.nodedata;
            var posStyle = { left: parseInt(nodeData.left) + 'px', 'top': parseInt(nodeData.top) };
            return React.createElement(
                'div',
                { ref: this.rooDivRef, onMouseDown: this.moveBarMouseDownHandler, className: 'position-absolute d-flex flex-column nodeRoot', style: posStyle, moving: this.state.moving ? '1' : null },
                React.createElement(
                    'div',
                    { className: 'bg-light d-flex align-items-center text-dark', style: { fontSize: '0.5em' } },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
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
                    ),
                    React.createElement('i', { className: 'fa fa-close ml-1 cursor-pointer mr-1', onClick: this.clickDeleteHandler })
                ),
                React.createElement('div', { className: 'dropdown-divider' }),
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

        var _this17 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity)).call(this, props));

        autoBind(_this17);

        _this17.state = {
            nodedata: _this17.props.nodedata
        };
        _this17.listenData(_this17.props.nodedata);
        _this17.dropdownRef = React.createRef();
        return _this17;
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
        key: 'socketOnClickHandler',
        value: function socketOnClickHandler(srcSocket) {
            this.props.onClickSocket(srcSocket, this);
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
            var _this18 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this18.setState({
                        nodedata: _this18.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            var entity = nodeData.targetentity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_SqlNode_Frame,
                { nodedata: nodeData, getTitleFun: this.getNodeTitle, editorDivRef: this.props.editorDivRef },
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

        var _this19 = _possibleConstructorReturn(this, (C_SqlNode_Select.__proto__ || Object.getPrototypeOf(C_SqlNode_Select)).call(this, props));

        autoBind(_this19);

        _this19.state = {
            nodedata: _this19.props.nodedata
        };
        _this19.listenData(_this19.props.nodedata);
        return _this19;
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
        key: 'socketOnClickHandler',
        value: function socketOnClickHandler(srcSocket) {
            this.props.onClickSocket(srcSocket, this);
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
            var _this20 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this20.setState({
                        nodedata: _this20.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { nodedata: nodeData, editorDivRef: this.props.editorDivRef, clickHandler: this.clickHandler },
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

        var _this21 = _possibleConstructorReturn(this, (C_SqlNode_Select_Output.__proto__ || Object.getPrototypeOf(C_SqlNode_Select_Output)).call(this, props));

        autoBind(_this21);

        _this21.state = {
            nodedata: _this21.props.nodedata
        };
        return _this21;
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
        key: 'socketOnClickHandler',
        value: function socketOnClickHandler(srcSocket) {
            this.props.onClickSocket(srcSocket, this);
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
            var _this22 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this22.setState({
                        nodedata: _this22.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            return React.createElement(
                C_SqlNode_Frame,
                { nodedata: nodeData, editorDivRef: this.props.editorDivRef, clickHandler: this.clickHandler },
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

var C_SqlNode_Editor = function (_React$PureComponent10) {
    _inherits(C_SqlNode_Editor, _React$PureComponent10);

    function C_SqlNode_Editor(props) {
        _classCallCheck(this, C_SqlNode_Editor);

        var _this23 = _possibleConstructorReturn(this, (C_SqlNode_Editor.__proto__ || Object.getPrototypeOf(C_SqlNode_Editor)).call(this, props));

        _this23.state = {
            draing: false,
            editingNode: _this23.props.bluePrint,
            scale: 1
        };

        autoBind(_this23);
        _this23.dragingPathRef = React.createRef();
        _this23.editorDivRef = React.createRef();
        return _this23;
    }

    _createClass(C_SqlNode_Editor, [{
        key: 'blueprinkChanged',
        value: function blueprinkChanged(ev) {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.bluePrint.on('changed', this.blueprinkChanged);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            this.props.bluePrint.off('changed', this.blueprinkChanged);
            clearTimeout(this.delaySetTO);
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
                        draing: false,
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
        key: 'onClickSocket',
        value: function onClickSocket(srcSocket, srcNode) {
            //console.log(srcSocket);
            //console.log(srcNode);
            var dragingPath = this.dragingPathRef.current;
            if (dragingPath.state.draing == true) {
                dragingPath.setState({
                    draing: false,
                    start: null,
                    end: null
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            } else {
                var rootRect = this.editorDivRef.current.getBoundingClientRect();
                dragingPath.setState({
                    draing: true,
                    start: srcSocket.getCenterPos(rootRect),
                    end: { x: WindowMouse.x - rootRect.left, y: WindowMouse.y - rootRect.top }
                });
                window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }
    }, {
        key: 'setEditeNode',
        value: function setEditeNode(theNode) {
            if (theNode == this.state.editingNode) {
                return;
            }
            var editingNode = this.state.editingNode;
            var scrollNode = this.editorDivRef.current.parentNode;
            if (editingNode) {
                editingNode.scrollLeft = scrollNode.scrollLeft;
                editingNode.scrollTop = scrollNode.scrollTop;
            }

            this.setState({
                draing: false,
                editingNode: theNode,
                scale: 1
            });

            if (theNode) {
                theNode.bluePrint.editingNode = theNode;
                setTimeout(function () {
                    scrollNode.scrollLeft = theNode.scrollLeft == null ? 0 : theNode.scrollLeft;
                    scrollNode.scrollTop = theNode.scrollTop == null ? 0 : theNode.scrollTop;
                }, 50);
            }
        }
    }, {
        key: 'renderNode',
        value: function renderNode(nodeData) {
            if (nodeData == null) return null;
            switch (nodeData.type) {
                case SQLNODE_BDBENTITY:
                    return React.createElement(C_SqlNode_DBEntity, { onClickSocket: this.onClickSocket, key: nodeData.id, nodedata: nodeData, editorDivRef: this.editorDivRef, editor: this });
                    break;
                case SQLNODE_SELECT:
                    return React.createElement(C_SqlNode_Select, { onClickSocket: this.onClickSocket, key: nodeData.id, nodedata: nodeData, editorDivRef: this.editorDivRef, editor: this });
                    break;
            }
            return null;
        }
    }, {
        key: 'mouseDownNodeCtlrHandler',
        value: function mouseDownNodeCtlrHandler(ctlData) {
            var scrollNode = this.editorDivRef.current.parentNode;
            var editingNode = this.state.editingNode;
            var newNodeData = new ctlData.nodeClass({ newborn: true, left: scrollNode.scrollLeft, top: scrollNode.scrollTop }, editingNode);
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'mousemoveWithDragHandler',
        value: function mousemoveWithDragHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            var scrollNode = this.editorDivRef.current.parentNode;
            scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
            scrollNode.scrollTop = this.dragOrgin.st - offset.y;
            //console.log(offset);
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
            if (ev.target == this.editorDivRef.current && this.draging != true) {
                this.draging = true;
                var scrollNode = this.editorDivRef.current.parentNode;
                this.dragOrgin = { x: WindowMouse.x, y: WindowMouse.y, sl: scrollNode.scrollLeft, st: scrollNode.scrollTop };
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
            var _this24 = this;

            var editingNode = this.state.editingNode;
            if (this.props.bluePrint != editingNode.bluePrint) {
                var self = this;
                clearTimeout(this.delaySetTO);
                this.delaySetTO = setTimeout(function () {
                    _this24.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint);
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
            nodeParentList.push(editingNode);
            if (this.editorDivRef.current) {
                this.editorDivRef.current.scale = this.state.scale;
            }

            return React.createElement(SplitPanel, {
                defPercent: 0.2,
                maxSize: '200px',
                barClass: 'bg-secondary',
                panel1: React.createElement(CusDBEEditorLeftPanel, { onMouseDown: this.mouseDownNodeCtlrHandler, editingNode: editingNode }),
                panel2: React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column mw-100', style: {} },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-0 flex-shrink-0 border bg-light ' },
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
                                                { className: "nav-link" + (nodeData == editingNode ? ' active' : ''), href: '#', 'data-id': nodeData.id, onClick: _this24.clickNavBtnHandler },
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
                            { className: 'flex-grow-1 flex-shrink-1 autoScroll ', style: { zoom: this.state.scale } },
                            React.createElement(
                                'div',
                                { onMouseDown: this.rootMouseDownHandler, ref: this.editorDivRef, className: 'd-block position-relative bg-dark', style: { minWidth: '4000px', minHeight: '4000px' } },
                                editingNode.nodes_arr.map(function (nd) {
                                    return _this24.renderNode(nd); //<G_Node key={nd.id} data={nd} />
                                }),
                                React.createElement(C_Node_Path, { ref: this.dragingPathRef, editorDivRef: this.editorDivRef, draging: '1' })
                            )
                        )
                    )
                )
            });
        }
    }]);

    return C_SqlNode_Editor;
}(React.PureComponent);

var C_Node_Path = function (_React$PureComponent11) {
    _inherits(C_Node_Path, _React$PureComponent11);

    function C_Node_Path(props) {
        _classCallCheck(this, C_Node_Path);

        var _this25 = _possibleConstructorReturn(this, (C_Node_Path.__proto__ || Object.getPrototypeOf(C_Node_Path)).call(this, props));

        autoBind(_this25);
        _this25.state = {
            start: _this25.props.start,
            end: _this25.props.end
        };

        _this25.rootDivRef = React.createRef();
        return _this25;
    }

    _createClass(C_Node_Path, [{
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
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
            return React.createElement('div', { ref: this.rootDivRef, className: 'nodepath', style: thisStyle, draging: this.props.draging });
        }
    }]);

    return C_Node_Path;
}(React.PureComponent);

var G_Node = function (_React$PureComponent12) {
    _inherits(G_Node, _React$PureComponent12);

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

var CusDBEEditor = function (_React$PureComponent13) {
    _inherits(CusDBEEditor, _React$PureComponent13);

    function CusDBEEditor(props) {
        _classCallCheck(this, CusDBEEditor);

        var _this27 = _possibleConstructorReturn(this, (CusDBEEditor.__proto__ || Object.getPrototypeOf(CusDBEEditor)).call(this, props));

        _this27.state = {};
        autoBind(_this27);
        _this27.editorDivRef = React.createRef();
        _this27.bluePrintRef = React.createRef();
        return _this27;
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
}];

var CusDBEEditorLeftPanel = function (_React$PureComponent14) {
    _inherits(CusDBEEditorLeftPanel, _React$PureComponent14);

    function CusDBEEditorLeftPanel(props) {
        _classCallCheck(this, CusDBEEditorLeftPanel);

        var _this28 = _possibleConstructorReturn(this, (CusDBEEditorLeftPanel.__proto__ || Object.getPrototypeOf(CusDBEEditorLeftPanel)).call(this, props));

        autoBind(_this28);
        return _this28;
    }

    _createClass(CusDBEEditorLeftPanel, [{
        key: 'render',
        value: function render() {
            return React.createElement(SplitPanel, {
                fixedOne: true,
                maxSize: 200,
                defPercent: 0.3,
                flexColumn: true,
                panel1: React.createElement(
                    'div',
                    { className: 'w-100 h-100 bg-info' },
                    '\u5927\u7EB2'
                ),
                panel2: React.createElement(
                    'div',
                    { className: 'd-flex flex-column h-100 w-100' },
                    React.createElement(CusDBEEditorVariables, { editingNode: this.props.editingNode }),
                    React.createElement(CusDBEEditorCanUseNodePanel, { editingNode: this.props.editingNode, onMouseDown: this.props.onMouseDown })
                )
            });
        }
    }]);

    return CusDBEEditorLeftPanel;
}(React.PureComponent);

var CusDBEEditorCanUseNodePanel = function (_React$PureComponent15) {
    _inherits(CusDBEEditorCanUseNodePanel, _React$PureComponent15);

    function CusDBEEditorCanUseNodePanel(props) {
        _classCallCheck(this, CusDBEEditorCanUseNodePanel);

        var _this29 = _possibleConstructorReturn(this, (CusDBEEditorCanUseNodePanel.__proto__ || Object.getPrototypeOf(CusDBEEditorCanUseNodePanel)).call(this, props));

        autoBind(_this29);
        return _this29;
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
            var _this30 = this;

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
                                    { key: item.label, onMouseDown: _this30.mouseDownHandler, 'data-value': item.label, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
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

var CusDBEEditorVariables = function (_React$PureComponent16) {
    _inherits(CusDBEEditorVariables, _React$PureComponent16);

    function CusDBEEditorVariables(props) {
        _classCallCheck(this, CusDBEEditorVariables);

        var _this31 = _possibleConstructorReturn(this, (CusDBEEditorVariables.__proto__ || Object.getPrototypeOf(CusDBEEditorVariables)).call(this, props));

        autoBind(_this31);
        return _this31;
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
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.editingNode.bluePrint.on('varChanged', this.varChangedhandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.editingNode.bluePrint.off('varChanged', this.varChangedhandler);
        }
    }, {
        key: 'render',
        value: function render() {
            var targetID = this.props.editingNode.bluePrint.code + 'variables';
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
                                return React.createElement(SqlNode_Variable_Component, { key: varData.id, varData: varData });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return CusDBEEditorVariables;
}(React.PureComponent);

var NameInputRow = function (_React$PureComponent17) {
    _inherits(NameInputRow, _React$PureComponent17);

    function NameInputRow(props) {
        _classCallCheck(this, NameInputRow);

        var _this32 = _possibleConstructorReturn(this, (NameInputRow.__proto__ || Object.getPrototypeOf(NameInputRow)).call(this, props));

        _this32.state = {
            value: _this32.props.default ? _this32.props.default : '',
            isagent: _this32.props.isagent == true
        };
        autoBind(_this32);
        return _this32;
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

var AddNewCusDSItemPanel = function (_React$PureComponent18) {
    _inherits(AddNewCusDSItemPanel, _React$PureComponent18);

    function AddNewCusDSItemPanel(props) {
        _classCallCheck(this, AddNewCusDSItemPanel);

        var _this33 = _possibleConstructorReturn(this, (AddNewCusDSItemPanel.__proto__ || Object.getPrototypeOf(AddNewCusDSItemPanel)).call(this, props));

        _this33.state = {};
        autoBind(_this33);

        _this33.nameRef = React.createRef();
        _this33.typeRef = React.createRef();
        return _this33;
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

var CreateDSItemPanel = function (_React$PureComponent19) {
    _inherits(CreateDSItemPanel, _React$PureComponent19);

    function CreateDSItemPanel(props) {
        _classCallCheck(this, CreateDSItemPanel);

        var _this34 = _possibleConstructorReturn(this, (CreateDSItemPanel.__proto__ || Object.getPrototypeOf(CreateDSItemPanel)).call(this, props));

        _this34.state = {
            items_arr: _this34.props.project.dataMaster.customDBEntities_arr,
            selectedItem: null
        };
        autoBind(_this34);
        return _this34;
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
            var _this35 = this;

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
                                    { onClick: _this35.clickListItemHandler, key: item.code, 'data-itemvalue': item.code, className: 'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '') },
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

var DataMasterPanel = function (_React$PureComponent20) {
    _inherits(DataMasterPanel, _React$PureComponent20);

    function DataMasterPanel(props) {
        _classCallCheck(this, DataMasterPanel);

        var _this36 = _possibleConstructorReturn(this, (DataMasterPanel.__proto__ || Object.getPrototypeOf(DataMasterPanel)).call(this, props));

        _this36.panelBaseRef = React.createRef();
        _this36.state = {};

        autoBind(_this36);

        var navItems = [CreateNavItemData('数据库', React.createElement(DataBasePanel, { project: _this36.props.project })), CreateNavItemData('创造数据', React.createElement(CreateDSItemPanel, { project: _this36.props.project }))];
        _this36.navData = {
            selectedItem: navItems[1],
            items: navItems
        };
        return _this36;
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
            var _this37 = this;

            return React.createElement(
                FloatPanelbase,
                { title: '\u6570\u636E\u5927\u5E08', ref: this.panelBaseRef, initShow: true },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0' },
                    React.createElement(TabNavBar, { navData: this.navData, navChanged: this.navChanged })
                ),
                this.navData.items.map(function (item) {
                    return React.createElement(
                        'div',
                        { key: item.text, className: 'flex-grow-1 flex-shrink-1 ' + (item == _this37.navData.selectedItem ? ' d-flex' : ' d-none') },
                        item.content
                    );
                })
            );
        }
    }]);

    return DataMasterPanel;
}(React.PureComponent);

/*
var 员工_arr = ['杨建','刘峰','蒋蔚','姜玉恒','顾熙','赵智淼','唐媛','卢彩琴','金茂永','郭其宝','李旭','陈伟','吴溢华','吕承梅','陆敏','吴安琴','谢颖清','张亚飞','张光运','孙红闯','龙腾云','盛琴','葛添添','任思杰','孙詹','马晓霞','施闻','艾贻娟','张念刚','龙正华','曾庆洪','王保华','周和兵','文刚','鲁全峰','李小阳','卢世志','白勇军','白雯','刘旗','沈立新','胡琛','严于胜','卢惠云','张开宏','苏元兰','石磊磊','廉雪超','杨哲亮','张留权','李世芹','刘志沛','金林军','高连花','黄婷婷','庄毓霞','潘锦波','江晓彦','赵晶','王彦武','金兵兵','刘立群','徐贤生','沈珏茹','马健'];
var 金额_arr = [59115,36105,27015,6081.9,20283,22605,8827,20805,11640,5121.6,16063.2,2473.5,9603,12901,7333.2,4074,5121.6,4481.4,7760,5674.5,11640,4811.2,12367.5,60555,16490,17460,5868.5,16005,16665,21822,13095,16296,12222,13269.6,27465,12222,6790,28185,9253.8,24585,8245,16296,54555,44555,19995,11203.5,6693,9166.5,6111,16975,3880,4656,8487.5,194,18105,4850,10088,3734.5,1940,465.6,11737,10476,21480,40605,14550]
var minDif = 999999;
var minDif_arr = [];


var startData = []
var startNum = 15000 - 450
var targetNum = 222199.81
var count = 0;

var found = false;

function detectFun(now员工_arr, nowNum){
    var turnIndex = ++count;
    //console.log('turn' + turnIndex + ':' + now员工_arr.join(','));
    var dif = Math.abs(nowNum - targetNum);
    if(dif < minDif){
        minDif = dif;
        minDif_arr = now员工_arr;

        console.log('min:' + minDif + ',num:' + nowNum);
        console.log('arr:' + minDif_arr);
        console.log(now员工_arr.map(x=>{return 员工_arr[x];}));
     }
    if(dif < 0){
        //found = true;
        return;
    }
    if(nowNum > targetNum){
        return;
    }

    var len = now员工_arr.length;
    var index = len == 0 ? -1 : now员工_arr[len - 1];
    for(var ci=index + 1;ci<员工_arr.length && !found;++ci){
        var test员工_arr = now员工_arr.concat();
        test员工_arr.push(ci);
        detectFun(test员工_arr, nowNum + 金额_arr[ci]);
    }
}

detectFun(startData,startNum)
*/