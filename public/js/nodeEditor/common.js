'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var CompileResult = function () {
    function CompileResult(node) {
        _classCallCheck(this, CompileResult);

        this.node = node;
        this.socketOuts = {};
    }

    _createClass(CompileResult, [{
        key: 'setSocketOut',
        value: function setSocketOut(socket, strContent, data) {
            this.socketOuts[socket.id] = {
                strContent: strContent,
                data: data
            };
        }
    }, {
        key: 'setDirectOut',
        value: function setDirectOut(strContent, data) {
            this.directOut = {
                strContent: strContent,
                data: data
            };
        }
    }, {
        key: 'getSocketOut',
        value: function getSocketOut(socket) {
            return this.socketOuts[socket.id];
        }
    }, {
        key: 'getDirectOut',
        value: function getDirectOut() {
            return this.directOut;
        }
    }]);

    return CompileResult;
}();

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
            return this.item_arr[this.item_arr.length - 1];
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

var NodeCreationHelper = function (_EventEmitter) {
    _inherits(NodeCreationHelper, _EventEmitter);

    function NodeCreationHelper() {
        _classCallCheck(this, NodeCreationHelper);

        var _this = _possibleConstructorReturn(this, (NodeCreationHelper.__proto__ || Object.getPrototypeOf(NodeCreationHelper)).call(this));

        EnhanceEventEmiter(_this);
        _this.orginID_map = {};
        _this.newID_map = {};
        _this.idTracer = {};
        return _this;
    }

    _createClass(NodeCreationHelper, [{
        key: 'saveJsonMap',
        value: function saveJsonMap(jsonData, newNode) {
            if (jsonData && jsonData.id) {
                if (this.getObjFromID(jsonData.id) != null) {
                    console.warn(jsonData.id + '被重复saveJsonMap');
                }
                if (jsonData.id != newNode.id) {
                    if (this.getObjFromID(newNode.id) != null) {
                        console.warn(jsonData.id + '被重复saveJsonMap');
                    }
                    this.idTracer[jsonData.id] = this.idTracer[newNode.id];
                }
                this.orginID_map[jsonData.id] = newNode;
            }

            this.newID_map[newNode.id] = newNode;
        }
    }, {
        key: 'getObjFromID',
        value: function getObjFromID(id) {
            var rlt = this.orginID_map[id];
            if (rlt == null) {
                rlt = this.newID_map[id];
            }
            return rlt;
        }
    }]);

    return NodeCreationHelper;
}(EventEmitter);

var Node_Base = function (_EventEmitter2) {
    _inherits(Node_Base, _EventEmitter2);

    function Node_Base(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        _classCallCheck(this, Node_Base);

        var _this2 = _possibleConstructorReturn(this, (Node_Base.__proto__ || Object.getPrototypeOf(Node_Base)).call(this));

        _this2.bluePrint = parentNode.bluePrint;
        Object.assign(_this2, initData);
        EnhanceEventEmiter(_this2);
        var self = _this2;

        _this2.sockets_map = {};
        _this2.inputScokets_arr = [];
        _this2.outputScokets_arr = [];
        if (isContainer) {
            _this2.nodes_arr = [];
            _this2.isContainer = true;
        }

        if (nodeJson != null) {
            assginObjByProperties(_this2, nodeJson, ['id', 'left', 'top', 'title', 'extra', 'editorLeft', 'editorTop']);
            if (_this2.restorFromAttrs) {
                _this2.restorFromAttrs(nodeJson);
            }
            // createSocket
            if (!IsEmptyArray(nodeJson.inputScokets_arr)) {
                nodeJson.inputScokets_arr.forEach(function (socketJson) {
                    self.addSocket(CreateNodeSocketByJson(_this2, socketJson, createHelper));
                });
            }
            if (!IsEmptyArray(nodeJson.outputScokets_arr)) {
                nodeJson.outputScokets_arr.forEach(function (socketJson) {
                    self.addSocket(CreateNodeSocketByJson(_this2, socketJson, createHelper));
                });
            }
            if (nodeJson.inFlowSocket) {
                self.inFlowSocket = self.addSocket(CreateNodeSocketByJson(_this2, nodeJson.inFlowSocket, createHelper));
            }
            if (nodeJson.outFlowSocket) {
                self.outFlowSocket = self.addSocket(CreateNodeSocketByJson(_this2, nodeJson.outFlowSocket, createHelper));
            }
            if (!IsEmptyArray(nodeJson.outFlowSockets_arr)) {
                _this2.outFlowSockets_arr = [];
                nodeJson.outFlowSockets_arr.forEach(function (socketJson) {
                    self.addSocket(CreateNodeSocketByJson(_this2, socketJson, createHelper));
                });
            }
        }

        _this2.label = label;
        _this2.type = type;
        _this2.left = ReplaceIfNaN(_this2.left, 0);
        _this2.top = ReplaceIfNaN(_this2.top, 0);
        _this2.minInSocketCount = 0;
        _this2.minOutSocketCount = 0;

        _this2.hadFlow = false;
        _this2.processInputSockets = _this2.processInputSockets.bind(_this2);
        _this2.processOutputSockets = _this2.processOutputSockets.bind(_this2);
        _this2.frameButtons_arr = [];

        _this2.bluePrint.registerNode(_this2, parentNode);

        if (createHelper) {
            createHelper.saveJsonMap(nodeJson, _this2);
        }

        if (nodeJson) {
            _this2.bluePrint.genNodesByJsonArr(_this2, nodeJson.nodes_arr, createHelper);
        }
        return _this2;
    }

    _createClass(Node_Base, [{
        key: 'isHadFlow',
        value: function isHadFlow() {
            return this.inFlowSocket != null || this.outFlowSocket != null;
        }
    }, {
        key: 'clickFrameButton',
        value: function clickFrameButton(btnName) {
            console.log('clickFrameButton:' + btnName);
            var removeCount = 0;
            var si;
            var socket;
            switch (btnName) {
                case FrameButton_LineSocket:
                    {
                        var links = this.bluePrint.linkPool.getLinksByNode(this, 'i');
                        links.forEach(function (link) {
                            link.straightOut(-150);
                        });
                    }
                    break;
                case FrameButton_ClearEmptyInputSocket:
                    {
                        for (si = this.inputScokets_arr.length - 1; si >= this.minInSocketCount && this.inputScokets_arr.length > 0; --si) {
                            socket = this.inputScokets_arr[si];
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
                case FrameButton_ClearEmptyOutputSocket:
                    {
                        removeCount = 0;
                        for (si = this.outputScokets_arr.length - 1; si >= 0 && this.outputScokets_arr.length > 0; --si) {
                            socket = this.outputScokets_arr[si];
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
        key: 'getUseableInSocketName',
        value: function getUseableInSocketName() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'in';

            var nameI = this.inputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName(prefix + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return prefix + nameI;
        }
    }, {
        key: 'getUseableOutSocketName',
        value: function getUseableOutSocketName() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'out';

            var nameI = this.outputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName(prefix + nameI, false) == null) {
                    break;
                }
                ++nameI;
            }
            return prefix + nameI;
        }
    }, {
        key: 'setTitle',
        value: function setTitle(newTitle) {
            var oldTitle = this.title;
            this.title = newTitle;
            this.fireChanged();

            if (this.cusTitleChanged) {
                this.cusTitleChanged(oldTitle, newTitle);
            }
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
        value: function preEditing(editor) {
            // call pre enter Editing
        }
    }, {
        key: 'postEditing',
        value: function postEditing(editor) {
            // call leve eidting
        }
    }, {
        key: 'isNeedMoveArrowBeforeSocket',
        value: function isNeedMoveArrowBeforeSocket() {
            return this.headType == 'empty' && (this.inputScokets_arr.length == 0 || this.outputScokets_arr.length == 0);
        }
    }, {
        key: 'outputIsSimpleValue',
        value: function outputIsSimpleValue() {
            return SQL_OutSimpleValueNode_arr.indexOf(this.type) != -1;
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
            if (!socketObj.isFlowSocket) {
                if (socketObj.isIn) {
                    this.inputScokets_arr.push(socketObj);
                } else {
                    this.outputScokets_arr.push(socketObj);
                }
            } else {
                if (!socketObj.isIn && socketObj.name != 'flow_o' && this.outFlowSockets_arr != null) {
                    this.outFlowSockets_arr.push(socketObj);
                }
            }
            return socketObj;
        }
    }, {
        key: 'removeSocket',
        value: function removeSocket(socketObj) {
            if (this.preRemoveSocket && this.preRemoveSocket(socketObj) == false) {
                return;
            }
            if (!socketObj.isFlowSocket) {
                if (socketObj.isIn) {
                    removeElemFrommArray(this.inputScokets_arr, socketObj);
                } else {
                    removeElemFrommArray(this.outputScokets_arr, socketObj);
                }
            } else {
                if (this.outFlowSockets_arr != null) {
                    removeElemFrommArray(this.outFlowSockets_arr, socketObj);
                }
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
        key: 'isOutFlowScoketDynamic',
        value: function isOutFlowScoketDynamic() {
            return this.genOutFlowSocket != null;
        }
    }, {
        key: 'processInputSockets',
        value: function processInputSockets(isPlus) {
            var retSocket = null;
            if (isPlus) {
                retSocket = this.genInSocket();
                if (retSocket == null) {
                    return;
                }
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
        key: 'processOutputSockets',
        value: function processOutputSockets(isPlus) {
            if (this.minOutSocketCount == null) {
                this.minOutSocketCount = 0;
            }
            var retSocket = null;
            if (isPlus) {
                retSocket = this.genOutSocket();
                if (retSocket == null) {
                    return;
                }
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
    }, {
        key: 'processOutputFlowSockets',
        value: function processOutputFlowSockets(isPlus) {
            var retSocket = null;
            if (isPlus) {
                retSocket = this.genOutFlowSocket();
                if (retSocket == null) {
                    return;
                }
                this.addSocket(retSocket);
                this.fireEvent(Event_SocketNumChanged);
            } else {
                var needRemoveSocket = this.outFlowSockets_arr[this.outFlowSockets_arr.length - 1];
                this.removeSocket(needRemoveSocket);
                this.fireEvent(Event_SocketNumChanged);
                retSocket = needRemoveSocket;
            }
            return retSocket;
        }

        // can custom socket component

    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = {
                id: this.id,
                type: this.type,
                left: this.left,
                top: this.top
            };
            if (!IsEmptyString(this.title)) {
                rlt.title = this.title;
            }
            if (this.extra != null) {
                rlt.extra = this.extra;
            }
            if (this.editorLeft) {
                rlt.editorLeft = this.editorLeft;
            }
            if (this.editorTop) {
                rlt.editorTop = this.editorTop;
            }
            return rlt;
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
                this.extra = {};
            }
            this.extra[key] = val;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var attrs = this.requestSaveAttrs();
            if (attrs == null) {
                return null;
            }
            var rlt = {};
            for (var pname in attrs) {
                var pval = attrs[pname];
                if (pval == null) {
                    continue;
                }
                var pValType = typeof pval === 'undefined' ? 'undefined' : _typeof(pval);
                var stringVal = null;
                switch (pValType) {
                    case 'string':
                    case 'number':
                        {
                            stringVal = pval;
                            break;
                        }
                }
                rlt[pname] = stringVal;
            }
            // input sockets
            if (this.inputScokets_arr.length > 0) {
                var t_insocketJson_arr = [];
                this.inputScokets_arr.forEach(function (data) {
                    t_insocketJson_arr.push(data.getJson());
                });
                rlt.inputScokets_arr = t_insocketJson_arr;
            }
            if (this.outputScokets_arr.length > 0) {
                var t_outsocketJson_arr = [];
                this.outputScokets_arr.forEach(function (data) {
                    t_outsocketJson_arr.push(data.getJson());
                });
                rlt.outputScokets_arr = t_outsocketJson_arr;
            }
            if (this.outFlowSockets_arr && this.outFlowSockets_arr.length > 0) {
                var t_outflowsocketJson_arr = [];
                this.outFlowSockets_arr.forEach(function (data) {
                    t_outflowsocketJson_arr.push(data.getJson());
                });
                rlt.outFlowSockets_arr = t_outflowsocketJson_arr;
            }
            if (this.inFlowSocket) {
                rlt.inFlowSocket = this.inFlowSocket.getJson();
            }
            if (this.outFlowSocket) {
                rlt.outFlowSocket = this.outFlowSocket.getJson();
            }
            // child node
            if (this.nodes_arr && this.nodes_arr.length > 0) {
                var tNode_arr = [];
                this.nodes_arr.forEach(function (childNode) {
                    var childJson = childNode.getJson();
                    if (childJson) {
                        tNode_arr.push(childJson);
                    }
                });
                rlt.nodes_arr = tNode_arr;
            }

            return rlt;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, isServerSide) {
            helper.meetNode(this);
            if (preNodes_arr.indexOf(this) != -1) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(this.getNodeTitle(), this, helper.clickLogBadgeItemHandler), '处产生了回路!']);
                return false;
            }
            var cacheRet = helper.getCompileRetCache(this, isServerSide);
            return cacheRet;
        }
    }, {
        key: 'getSocketCompileValue',
        value: function getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, canUseDefval, nullable) {
            var socketValue = null;
            var theNode = this;
            var theLink = null;
            var tLinks = theNode.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (tLinks.length == 0) {
                if (canUseDefval) {
                    socketValue = IsEmptyString(theSocket.defval) ? null : theSocket.defval;
                    if (isNaN(socketValue)) {
                        socketValue = "'" + theSocket.defval + "'";
                    }
                }
            } else {
                theLink = tLinks[0];
                var outNode = theLink.outSocket.node;
                var compileRet = null;
                if (outNode.isHadFlow()) {
                    compileRet = helper.getCompileRetCache(outNode);
                    if (this.checkCompileFlag(compileRet == null, '输入接口设置错误', helper)) {
                        return { err: 1 };
                    }
                } else {
                    compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
                }

                if (compileRet == false) {
                    return { err: 1 };
                }
                socketValue = compileRet.getSocketOut(tLinks[0].outSocket).strContent;
            }
            if (this.checkCompileFlag(!nullable && IsEmptyString(socketValue), '接口' + theSocket.label + '需要一个值', helper)) {
                return { err: 1 };
            }
            return { value: socketValue, link: theLink };
        }
    }, {
        key: 'checkCompileFlag',
        value: function checkCompileFlag(flag, errInfo, helper) {
            if (flag) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(this.getNodeTitle(), this, helper.clickLogBadgeItemHandler), errInfo]);
                return true;
            }
            return false;
        }
    }]);

    return Node_Base;
}(EventEmitter);

function C_NodeCom_componentWillMount() {
    this.props.nodedata.currentComponent = this;
    if (this.cus_componentWillMount != null) {
        this.cus_componentWillMount();
    }
}

function C_NodeCom_componentWillUnMount() {
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

function C_NodeCom_Base(target) {
    target.frameRef = React.createRef();
    target.componentWillMount = C_NodeCom_componentWillMount.bind(target);
    target.componentWillUnmount = C_NodeCom_componentWillUnMount.bind(target);
    target.reDraw = C_ReDraw.bind(target);
}

var C_Node_Frame = function (_React$PureComponent) {
    _inherits(C_Node_Frame, _React$PureComponent);

    function C_Node_Frame(props) {
        _classCallCheck(this, C_Node_Frame);

        var _this3 = _possibleConstructorReturn(this, (C_Node_Frame.__proto__ || Object.getPrototypeOf(C_Node_Frame)).call(this, props));

        autoBind(_this3);
        _this3.state = {
            editingTitle: false,
            title: ReplaceIfNull(props.nodedata.title, ''),
            moving: _this3.props.nodedata.newborn == true
        };

        _this3.rootDivRef = React.createRef();

        if (_this3.props.nodedata.newborn) {
            var self = _this3;
            setTimeout(function () {
                if (self.state.moving) {
                    self.startMove(null);
                    _this3.props.editor.setSelectedNF(_this3);
                }
            }, 10);
        }
        return _this3;
    }

    _createClass(C_Node_Frame, [{
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
            this.props.editor.nodeFrameStartMove(this);
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
            if (this.state.editingTitle) {
                this.props.nodedata.setTitle(this.state.title);
            }
            this.setState({
                editingTitle: !this.state.editingTitle
            });
            this.props.nodedata.fireMoved(10);
        }
    }, {
        key: 'nodeTitleInputChangeHandler',
        value: function nodeTitleInputChangeHandler(ev) {
            var inputStr = ev.target.value;
            this.setState({
                title: inputStr.trim()
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
            var offset = {
                x: localPos.x - parseUnitInt(editorDiv.style.left),
                y: localPos.y - parseUnitInt(editorDiv.style.top)
            };
            var newX = offset.x + moveBase.x;
            var newY = offset.y + moveBase.y;
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;
            rootDiv.style.left = newX + 'px';
            rootDiv.style.top = newY + 'px';
            var nodeData = this.props.nodedata;
            nodeData.setPos(newX, newY);

            this.props.editor.nodeFrameMoving(this, offset);
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

            var inFlowElem = null;
            var outFlowElem = null;
            if (nodeData.inFlowSocket) {
                inFlowElem = React.createElement(C_Node_Socket, { socket: nodeData.inFlowSocket, align: 'left', editor: this.props.editor });
            }
            if (nodeData.outFlowSocket) {
                outFlowElem = React.createElement(C_Node_Socket, { socket: nodeData.outFlowSocket, align: 'right', editor: this.props.editor });
            }

            var headType = this.props.headType;
            if (headType == null) headType = 'default';
            if (headType == 'tiny') {
                var headElem = this.props.headText;
                if (this.props.cusHeaderFuc != null) {
                    headElem = this.props.cusHeaderFuc();
                }
                //{nodeData.hadFlow && !nodeData.banOutFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                return React.createElement(
                    'div',
                    { className: 'd-flex nodeHead align-items-center', type: 'tiny' },
                    inFlowElem,
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-0 text-nowrap text-center', 'f-canmove': 1 },
                        headElem
                    ),
                    outFlowElem
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
                            this.state.editingTitle ? React.createElement('input', { className: '', type: 'text', value: this.state.title, onChange: this.nodeTitleInputChangeHandler, onKeyPress: this.nodeTitleInputKeypressHandler }) : React.createElement(
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
            var _this4 = this;

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
                        { key: btnData.name, type: 'button', onClick: _this4.clickFrameButtonHandler, className: 'btn btn-dark', 'd-btnname': btnData.name },
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
            if (nodeData.preRenderFrame) {
                nodeData.preRenderFrame();
            }
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

    return C_Node_Frame;
}(React.PureComponent);