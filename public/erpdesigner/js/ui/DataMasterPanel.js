'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ISParam_Options_arr = [{ name: '参数', code: '1' }, { name: '变量', code: '0' }];
var BundleMode_Options_arr = [{ name: '强制传服务端', code: '1' }, { name: '根据需要传值', code: '0' }];
var gCopiedCustomEntity = null;

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
        /*
        setTimeout(() => {
            self.startSynAction('keyword','T101');
        }, 100);
        */
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
        fetchJsonPost('server',{action:'matchGet',keyword:'T922'}, function(rlt){
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
                if (keyword == null || keyword.length < 2) return;
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
                    fetchJsonPost('server', { action: 'syndata_bykeyword', keyword: keyword }, callBack);
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

var SqlBPEditor = function (_React$PureComponent4) {
    _inherits(SqlBPEditor, _React$PureComponent4);

    function SqlBPEditor(props) {
        _classCallCheck(this, SqlBPEditor);

        var _this6 = _possibleConstructorReturn(this, (SqlBPEditor.__proto__ || Object.getPrototypeOf(SqlBPEditor)).call(this, props));

        _this6.state = {};
        autoBind(_this6);
        _this6.editorDivRef = React.createRef();
        _this6.bluePrintRef = React.createRef();
        return _this6;
    }

    _createClass(SqlBPEditor, [{
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
        key: 'forcusSqlNode',
        value: function forcusSqlNode(nodeData) {
            if (this.bluePrintRef.current == null) {
                return;
            }
            var self = this;
            setTimeout(function () {
                self.bluePrintRef.current.showNodeData(nodeData);
            }, 200);
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

    return SqlBPEditor;
}(React.PureComponent);

var NameInputRow = function (_React$PureComponent5) {
    _inherits(NameInputRow, _React$PureComponent5);

    function NameInputRow(props) {
        _classCallCheck(this, NameInputRow);

        var _this7 = _possibleConstructorReturn(this, (NameInputRow.__proto__ || Object.getPrototypeOf(NameInputRow)).call(this, props));

        _this7.state = {
            value: _this7.props.default ? _this7.props.default : '',
            isagent: _this7.props.isagent == true
        };
        autoBind(_this7);
        return _this7;
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

var SqlBPEditPanel = function (_React$PureComponent6) {
    _inherits(SqlBPEditPanel, _React$PureComponent6);

    function SqlBPEditPanel(props) {
        _classCallCheck(this, SqlBPEditPanel);

        var _this8 = _possibleConstructorReturn(this, (SqlBPEditPanel.__proto__ || Object.getPrototypeOf(SqlBPEditPanel)).call(this, props));

        _this8.state = {};
        autoBind(_this8);

        _this8.nameRef = React.createRef();
        _this8.typeRef = React.createRef();
        return _this8;
    }

    _createClass(SqlBPEditPanel, [{
        key: 'clickConfirmHandler',
        value: function clickConfirmHandler() {
            var targetBP = this.props.targetBP;
            var name = this.nameRef.current.getValue().trim();
            if (name.length <= 2) {
                this.setState({
                    errinfo: '名字的长度必须大于2'
                });
                return;
            }
            var nowBP = this.props.dataMaster.getSqlBPByName(name);
            if (nowBP != null && nowBP != targetBP) {
                this.setState({
                    errinfo: '已有同名的蓝图存在'
                });
                return;
            }
            var type = this.typeRef.current.getValue();
            var title = this.typeRef;
            if (type.length == 0) {
                this.setState({
                    errinfo: '必须选择类型'
                });
                return;
            }
            if (targetBP == null) {
                targetBP = this.props.dataMaster.createSqlBP(name, type);
            } else {
                targetBP = this.props.dataMaster.modifySqlBP(targetBP, name, type);
            }
            this.props.onComplete(targetBP);
        }
    }, {
        key: 'clickCancelHandler',
        value: function clickCancelHandler() {
            this.props.onComplete(null);
        }
    }, {
        key: 'render',
        value: function render() {
            var targetBP = this.props.targetBP;
            var title = '新建Sql蓝图';
            if (targetBP != null) {
                title = '修改' + targetBP.name;
            }
            var value = targetBP == null ? '' : targetBP.name;
            var type = targetBP == null ? '表值' : targetBP.type;
            var nameWidth = 100;
            return React.createElement(
                FloatPanelbase,
                { title: title, width: 480, height: 320, initShow: true, sizeable: false, closeable: false, ismodel: true },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column autoScroll flex-grow-1 flex-shrink-1' },
                        React.createElement(NameInputRow, { label: '\u540D\u79F0', type: 'text', rootClass: 'm-1', nameWidth: nameWidth, ref: this.nameRef, 'default': value }),
                        React.createElement(NameInputRow, { label: '\u7C7B\u578B', type: 'select', rootClass: 'm-1', nameWidth: nameWidth, options_arr: ['表值', '标量值', 'delete'], 'default': type, ref: this.typeRef }),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 text-info' },
                            this.state.errinfo5
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-0 flex-shrink-0 btn-group' },
                        React.createElement(
                            'button',
                            { type: 'button', onClick: this.clickConfirmHandler, className: 'btn btn-success flex-grow-1 flex-shrink-1' },
                            targetBP ? '修改' : '创建'
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

    return SqlBPEditPanel;
}(React.PureComponent);

var SqlBPItemPanel = function (_React$PureComponent7) {
    _inherits(SqlBPItemPanel, _React$PureComponent7);

    function SqlBPItemPanel(props) {
        _classCallCheck(this, SqlBPItemPanel);

        var _this9 = _possibleConstructorReturn(this, (SqlBPItemPanel.__proto__ || Object.getPrototypeOf(SqlBPItemPanel)).call(this, props));

        _this9.state = {
            items_arr: _this9.props.project.dataMaster.BP_sql_arr,
            selectedItem: null,
            sourceKeyword: ''
        };
        _this9.sqlbpEditorRef = React.createRef();
        autoBind(_this9);
        return _this9;
    }

    _createClass(SqlBPItemPanel, [{
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
        key: 'clickEditBtnHandler',
        value: function clickEditBtnHandler(ev) {
            if (this.state.selectedItem) {
                this.setState({
                    modifing: true
                });
            }
        }
    }, {
        key: 'clickTrashBtnHandler',
        value: function clickTrashBtnHandler(ev) {
            if (this.state.selectedItem) {
                gTipWindow.popAlert(makeAlertData('警告', '确定删除"' + this.state.selectedItem.name + '"吗?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], this.state.selectedItem));
            }
        }
    }, {
        key: 'clickCopyBtnHandler',
        value: function clickCopyBtnHandler(ev) {
            if (this.state.selectedItem) {
                var cusDSJsonProf = new AttrJsonProfile();
                var dsJson = this.state.selectedItem.getJson(cusDSJsonProf);
                gCopiedCustomEntity = dsJson;
                this.sqlbpEditorRef.current.bluePrintRef.current.logManager.log('已复制蓝图');
            }
        }
    }, {
        key: 'clickPasteBtnHandler',
        value: function clickPasteBtnHandler(ev) {
            if (gCopiedCustomEntity) {
                var useJson = JSON.parse(JSON.stringify(gCopiedCustomEntity));
                var dataMaster = this.props.project.dataMaster;
                var ti = 0;
                var useName;
                while (ti < 999) {
                    useName = useJson.name + (ti == 0 ? '' : '(' + ti + ')');
                    if (dataMaster.getSqlBPByName(useName) == null) {
                        break;
                    }
                    ++ti;
                }
                useJson.name = useName;
                useJson.uuid = null;
                var sqlBPCreationHelper = new NodeCreationHelper();
                sqlBPCreationHelper.project = dataMaster.project;
                var newbp = new SqlNode_BluePrint({ master: dataMaster }, useJson, sqlBPCreationHelper);
                dataMaster.addSqlBP(newbp);
                this.setState({ selectedItem: newbp });
            }
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key, target) {
            if (key == 'ok') {
                this.props.project.dataMaster.deleteSqlBP(target);
                this.setState({
                    magicObj: {}
                });
            }
        }
    }, {
        key: 'newItemCompleteHandler',
        value: function newItemCompleteHandler(newDBE) {
            this.setState({
                creating: false,
                modifing: false
            });
        }
    }, {
        key: 'forcusSqlNode',
        value: function forcusSqlNode(nodeData) {
            this.setState({ selectedItem: nodeData.bluePrint });
            var self = this;
            setTimeout(function () {
                if (self.sqlbpEditorRef.current == null) {
                    return;
                }
                self.sqlbpEditorRef.current.forcusSqlNode(nodeData);
            }, 200);
        }
    }, {
        key: 'sourceInputChange',
        value: function sourceInputChange(e) {
            this.setState({
                sourceKeyword: e.target.value
            });
        }
    }, {
        key: 'renderSourceList',
        value: function renderSourceList() {
            var _this10 = this;

            var items_sourceArr = this.state.items_arr;
            var selectedItem = this.state.selectedItem;
            var show_arr = [];
            if (items_sourceArr == null) {
                return null;
            }
            if (this.state.sourceKeyword == null || this.state.sourceKeyword == '') {
                show_arr = items_sourceArr;
            } else {
                for (var i = 0, len = items_sourceArr.length; i < len; i++) {
                    if (items_sourceArr[i].name.indexOf(this.state.sourceKeyword) >= 0) {
                        show_arr.push(items_sourceArr[i]);
                    }
                }
            }
            return show_arr.map(function (item) {
                if (item.group != 'custom') {
                    return null;
                }
                return React.createElement(
                    'div',
                    { onClick: _this10.clickListItemHandler, key: item.code, 'data-itemvalue': item.code, className: 'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '') },
                    item.name + '-' + item.type
                );
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var selectedItem = this.state.selectedItem;
            return React.createElement(
                React.Fragment,
                null,
                this.state.creating || this.state.modifing ? React.createElement(SqlBPEditPanel, { targetBP: this.state.modifing ? selectedItem : null, dataMaster: this.props.project.dataMaster, onComplete: this.newItemCompleteHandler }) : null,
                React.createElement(SplitPanel, {
                    defPercent: 0.45,
                    maxSize: '200px',
                    barClass: 'bg-secondary',
                    panel1: React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 w-100' },
                        React.createElement(
                            'div',
                            { className: 'input-group input-group-sm flex-grow-0 flex-shrink-0' },
                            React.createElement(
                                'span',
                                { className: 'input-group-addon', id: 'sizing-addon3' },
                                '\u6570\u636E\u6E90:'
                            ),
                            React.createElement('input', { type: 'text', className: 'form-control', placeholder: '\u8BF7\u8F93\u5165', 'aria-describedby': 'sizing-addon3',
                                onChange: this.sourceInputChange })
                        ),
                        React.createElement(
                            'div',
                            { className: 'list-group flex-grow-1 flex-shrink-1 bg-dark autoScroll' },

                            /*this.state.items_arr.map(item => {
                                if (item.group != 'custom') {
                                    return null;
                                }
                                return <div onClick={this.clickListItemHandler} key={item.code} data-itemvalue={item.code} className={'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '')}>
                                    {item.name + '-' + item.type}
                                </div>
                            })*/
                            this.renderSourceList(),
                            React.createElement('span', { className: 'dropdown-divider' }),
                            React.createElement(
                                'span',
                                { className: 'text-light' },
                                '\u4EE5\u4E0B\u662F\u63A7\u4EF6\u5B9A\u5236\u6570\u636E\u6E90'
                            ),
                            this.state.items_arr.map(function (item) {
                                if (item.group == 'custom') {
                                    return null;
                                }
                                return React.createElement(
                                    'div',
                                    { onClick: _this11.clickListItemHandler, key: item.code, 'data-itemvalue': item.code, className: 'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '') },
                                    item.name + '-' + item.type
                                );
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'flex-shrink-0 btn-group' },
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickTrashBtnHandler, className: 'btn' },
                                React.createElement('i', { className: 'fa fa-trash text-danger' })
                            ),
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickAddBtnhandler, className: 'btn btn-success flex-grow-1' },
                                React.createElement('i', { className: 'fa fa-plus' })
                            ),
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickEditBtnHandler, className: 'btn' },
                                React.createElement('i', { className: 'fa fa-edit' })
                            ),
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickCopyBtnHandler, className: 'btn' },
                                React.createElement('i', { className: 'fa fa-copy' })
                            ),
                            React.createElement(
                                'button',
                                { type: 'button', onClick: this.clickPasteBtnHandler, className: 'btn' },
                                React.createElement('i', { className: 'fa fa-paste' })
                            )
                        )
                    ),
                    panel2: React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 bg-dark mw-100' },
                        React.createElement(SqlBPEditor, { ref: this.sqlbpEditorRef, item: selectedItem })
                    )
                })
            );
        }
    }]);

    return SqlBPItemPanel;
}(React.PureComponent);

var DataMasterPanel = function (_React$PureComponent8) {
    _inherits(DataMasterPanel, _React$PureComponent8);

    function DataMasterPanel(props) {
        _classCallCheck(this, DataMasterPanel);

        var _this12 = _possibleConstructorReturn(this, (DataMasterPanel.__proto__ || Object.getPrototypeOf(DataMasterPanel)).call(this, props));

        _this12.panelBaseRef = React.createRef();
        _this12.navbarRef = React.createRef();
        _this12.sqlBPPanelRef = React.createRef();
        _this12.state = {};

        autoBind(_this12);

        var navItems = [CreateNavItemData('数据库', React.createElement(DataBasePanel, { project: _this12.props.project })), CreateNavItemData('创造数据', React.createElement(SqlBPItemPanel, { ref: _this12.sqlBPPanelRef, project: _this12.props.project }))];

        _this12.navData = {
            selectedItem: navItems[1],
            items: navItems
        };
        return _this12;
    }

    _createClass(DataMasterPanel, [{
        key: 'forcusSqlNode',
        value: function forcusSqlNode(nodeData) {
            if (this.navbarRef.current == null) {
                return;
            }
            this.navbarRef.current.selectByText('创造数据');
            var self = this;
            setTimeout(function () {
                if (self.sqlBPPanelRef.current == null) {
                    return;
                }
                self.sqlBPPanelRef.current.forcusSqlNode(nodeData);
            }, 200);
        }
    }, {
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
            var _this13 = this;

            return React.createElement(
                FloatPanelbase,
                { title: '\u6570\u636E\u5927\u5E08', ref: this.panelBaseRef, initShow: false, initMax: true },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0' },
                    React.createElement(TabNavBar, { ref: this.navbarRef, navData: this.navData, navChanged: this.navChanged })
                ),
                this.navData.items.map(function (item) {
                    return React.createElement(
                        'div',
                        { key: item.text, className: 'flex-grow-1 flex-shrink-1 ' + (item == _this13.navData.selectedItem ? ' d-flex' : ' d-none') },
                        item.content
                    );
                })
            );
        }
    }]);

    return DataMasterPanel;
}(React.PureComponent);

var QuickSqlBPEditPanel = function (_React$PureComponent9) {
    _inherits(QuickSqlBPEditPanel, _React$PureComponent9);

    function QuickSqlBPEditPanel(props) {
        _classCallCheck(this, QuickSqlBPEditPanel);

        var _this14 = _possibleConstructorReturn(this, (QuickSqlBPEditPanel.__proto__ || Object.getPrototypeOf(QuickSqlBPEditPanel)).call(this, props));

        _this14.state = {
            blueprints_arr: []
        };
        autoBind(_this14);
        return _this14;
    }

    _createClass(QuickSqlBPEditPanel, [{
        key: 'showBlueprint',
        value: function showBlueprint(target) {
            var index = this.state.blueprints_arr.indexOf(target);
            if (index == -1) {
                this.setState({
                    blueprints_arr: this.state.blueprints_arr.concat(target)
                });
            }
        }
    }, {
        key: 'hideBlueprint',
        value: function hideBlueprint(target) {
            var index = this.state.blueprints_arr.indexOf(target);
            if (index != -1) {
                var newArr = this.state.blueprints_arr.concat();
                newArr.splice(index, 1);
                this.setState({
                    blueprints_arr: newArr
                });
            }
        }
    }, {
        key: 'prePanelCloseHandler',
        value: function prePanelCloseHandler(thePanel) {
            this.hideBlueprint(thePanel.props.targetBP);
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

            var bpArr = this.state.blueprints_arr;
            if (bpArr.length == 0) {
                return null;
            }
            return bpArr.map(function (bp) {
                return React.createElement(
                    FloatPanelbase,
                    { preClose: _this15.prePanelCloseHandler, key: bp.code, title: '编辑:' + bp.name, initShow: true, initMax: false, width: 800, height: 640, targetBP: bp },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 bg-dark mw-100' },
                        React.createElement(C_SqlNode_Editor, { bluePrint: bp })
                    )
                );
            });
        }
    }]);

    return QuickSqlBPEditPanel;
}(React.PureComponent);

var QuickKeyWordSynBar = function (_React$PureComponent10) {
    _inherits(QuickKeyWordSynBar, _React$PureComponent10);

    function QuickKeyWordSynBar(props) {
        _classCallCheck(this, QuickKeyWordSynBar);

        var _this16 = _possibleConstructorReturn(this, (QuickKeyWordSynBar.__proto__ || Object.getPrototypeOf(QuickKeyWordSynBar)).call(this, props));

        _this16.state = {
            keyword: '',
            syning: false
        };
        autoBind(_this16);

        _this16.barStyle = {
            maxWidth: '200px'
        };
        return _this16;
    }

    _createClass(QuickKeyWordSynBar, [{
        key: 'kerwordChangedHandler',
        value: function kerwordChangedHandler(ev) {
            this.setState({
                keyword: ev.target.value
            });
        }
    }, {
        key: 'fetchEndCallBack',
        value: function fetchEndCallBack(result) {
            var fetchData = result.json;
            if (fetchData.data && fetchData.data.length > 0) {
                g_dataBase.synEnityFromFetch(fetchData.data);
            }
            this.setState({
                syning: false
            });
        }
    }, {
        key: 'synClickHandler',
        value: function synClickHandler(ev) {
            var keyword = this.state.keyword;
            if (keyword == null || keyword.length < 2) return;

            fetchJsonPost('server', { action: 'syndata_bykeyword', keyword: keyword }, this.fetchEndCallBack);
            this.setState({
                syning: true
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var synItem = null;
            if (this.state.syning) {
                synItem = React.createElement('i', { className: 'fa fa-refresh fa-spin' });
            }
            return React.createElement(
                'div',
                { className: 'input-group flex-grow-0 flex-shrink-0', style: this.barStyle },
                React.createElement('input', { type: 'text', className: 'form-control', placeholder: '\u5173\u952E\u5B57', value: this.state.keyword, onChange: this.kerwordChangedHandler }),
                React.createElement(
                    'div',
                    { className: 'input-group-append' },
                    React.createElement(
                        'button',
                        { className: "btn btn-" + (this.state.syning ? 'secondary' : 'dark'), type: 'button', onClick: this.syning ? null : this.synClickHandler },
                        '\u540C\u6B65\u6570\u636E',
                        synItem
                    )
                )
            );
        }
    }]);

    return QuickKeyWordSynBar;
}(React.PureComponent);