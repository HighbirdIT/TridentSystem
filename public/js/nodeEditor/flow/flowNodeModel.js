'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FLOWNODE_VAR_GET = 'var_get';
var FLOWNODE_VAR_SET = 'var_set';
var FLOWNODE_STEP_START = 'stepstart';
var FLOWNODE_QUERY_SQL = 'querysql';
var FLOWNODE_CREATE_SERVERERROR = 'createservererror';
var FLOWNODE_QUERY_KEYRECORD = 'querykeyrecord';
var FLOWNODE_COLUMN_VAR = 'columnvar';
var FLOWNODE_SEND_MESSAGE = 'sendmessage';
var FLOWNODE_CONFIRM_FLOWSTEP = 'confirmflowstep';

var FlowNodeClassMap = {};

var FlowNode_Base = function (_Node_Base) {
    _inherits(FlowNode_Base, _Node_Base);

    function FlowNode_Base(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        _classCallCheck(this, FlowNode_Base);

        var _this = _possibleConstructorReturn(this, (FlowNode_Base.__proto__ || Object.getPrototypeOf(FlowNode_Base)).call(this, initData, parentNode, createHelper, type, label, isContainer, nodeJson));

        _this.processOutputFlowSockets = _this.processOutputFlowSockets.bind(_this);
        return _this;
    }

    _createClass(FlowNode_Base, [{
        key: 'compileFlowNode',
        value: function compileFlowNode(flowLink, helper, usePreNodes_arr, belongBlock) {
            var nextNodeCompileRet = flowLink.inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
            if (nextNodeCompileRet == false) {
                return false;
            }
            var socketOut = nextNodeCompileRet.getSocketOut(flowLink.inSocket);
            if (socketOut.data.parent != belongBlock) {
                belongBlock.pushChild(socketOut.data.clone());
            }
            return nextNodeCompileRet;
        }
    }, {
        key: 'compileOutFlow',
        value: function compileOutFlow(helper, usePreNodes_arr, belongBlock) {
            var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
            if (flowLinks_arr.length > 0) {
                return this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, belongBlock);
            }
            return null;
        }
    }, {
        key: 'isReachable',
        value: function isReachable() {
            if (this.type == FLOWNODE_START) {
                return true;
            }
            if (this.inFlowSocket) {
                var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inFlowSocket);
                if (flowLinks_arr.length > 0) {
                    for (var fi in flowLinks_arr) {
                        var flowLink = flowLinks_arr[fi];
                        var ret = flowLink.outSocket.node.isReachable();
                        if (ret) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }]);

    return FlowNode_Base;
}(Node_Base);

var FlowDef_Variable = function (_FlowNode_Base) {
    _inherits(FlowDef_Variable, _FlowNode_Base);

    function FlowDef_Variable(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowDef_Variable);

        var _this2 = _possibleConstructorReturn(this, (FlowDef_Variable.__proto__ || Object.getPrototypeOf(FlowDef_Variable)).call(this, initData, parentNode, createHelper, JSDEF_VAR, '变量', false, nodeJson));

        _this2.name = ReplaceIfNull(_this2.name, 'unname');
        _this2.valType = ReplaceIfNull(_this2.valType, ValueType.Int);
        _this2.default = ReplaceIfNull(_this2.default, '');
        autoBind(_this2);
        return _this2;
    }

    _createClass(FlowDef_Variable, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowDef_Variable.prototype.__proto__ || Object.getPrototypeOf(FlowDef_Variable.prototype), 'requestSaveAttrs', this).call(this);
            rlt.name = this.name;
            rlt.valType = this.valType;
            rlt.default = this.default;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['name', 'valType', 'default']);
        }
    }, {
        key: 'setProp',
        value: function setProp(data) {
            if (data.name != null) {
                var newName = data.name;
                if (newName.length == 0) {
                    newName = '未命名';
                }
                if (this.bluePrint) {
                    var hadVar = this.bluePrint.getVariableByName(newName);
                    if (hadVar && hadVar != this) {
                        newName += '_1';
                    }
                }
                this.name = newName;
            }
            if (data.valType != null) {
                this.valType = data.valType;
            }
            if (data.default != null) {
                this.default = data.default;
            }
            if (data.editing != null) {
                this.needEdit = data.editing;
            }
            this.fireChanged();
        }
    }, {
        key: 'toString',
        value: function toString() {
            var attrs = this;
            var rlt = attrs.name;

            return rlt;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            return this.name;
        }
    }, {
        key: 'getRealName',
        value: function getRealName() {
            return this.name;
        }
    }, {
        key: 'getValType',
        value: function getValType() {
            return this.valType;
        }
    }, {
        key: 'getDefineString',
        value: function getDefineString() {
            var defaultvar = IsEmptyString(this.default) ? 'null' : isNaN(this.default) ? singleQuotesStr(this.default) : this.default;
            return 'var ' + this.name + ' ' + defaultvar + ';';
        }
    }]);

    return FlowDef_Variable;
}(FlowNode_Base);

var FlowNode_BluePrint = function (_EventEmitter) {
    _inherits(FlowNode_BluePrint, _EventEmitter);

    function FlowNode_BluePrint(initData, bluePrintJson, createHelper) {
        _classCallCheck(this, FlowNode_BluePrint);

        var _this3 = _possibleConstructorReturn(this, (FlowNode_BluePrint.__proto__ || Object.getPrototypeOf(FlowNode_BluePrint)).call(this));

        EnhanceEventEmiter(_this3);
        _this3.flowChangedHandler = _this3.flowChangedHandler.bind(_this3);

        _this3.nodes_arr = [];
        _this3.vars_arr = [];
        _this3.links_arr = [];
        _this3.linkPool = new ScoketLinkPool(_this3);
        Object.assign(_this3, initData);
        var self = _this3;
        if (createHelper == null) {
            createHelper = new NodeCreationHelper();
        }
        _this3.bluePrint = _this3;
        _this3.allNode_map = {};
        _this3.allVars_map = {};
        _this3.nodes_arr = [];

        if (bluePrintJson != null) {
            assginObjByProperties(_this3, bluePrintJson, ['type', 'code', 'name', 'editorLeft', 'editorTop', 'group', 'ctlID']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(function (varJson) {
                    var newVar = new FlowDef_Variable({}, _this3, createHelper, varJson);
                });
            }
            _this3.genNodesByJsonArr(_this3, bluePrintJson.nodes_arr, createHelper);
            _this3.linkPool.restorFromJson(bluePrintJson.links_arr, createHelper);
        }
        if (_this3.flow == null) {
            console.error('new FlowNode_BluePrint flow is null');
            return _possibleConstructorReturn(_this3);
        }
        _this3.flow.on('changed', _this3.flowChangedHandler);
        _this3.flowChangedHandler();

        _this3.name = _this3.flow.name;
        _this3.code = 'flow' + _this3.flow.code;
        _this3.id = _this3.code;
        createHelper.fireEvent('complete', createHelper);
        return _this3;
    }

    _createClass(FlowNode_BluePrint, [{
        key: 'flowChangedHandler',
        value: function flowChangedHandler(ev) {
            for (var stepI in this.flow.steps_arr) {
                var step = this.flow.steps_arr[stepI];
                var hadStepNode = this.nodes_arr.find(function (node) {
                    return node.type == FLOWNODE_STEP_START && node.stepCode == step.code;
                });
                if (hadStepNode == null) {
                    var newStepStartNode = new FlowNode_StepStart({ step: step }, this);
                }
            }
        }
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
            var testI = 0;
            var useID = '';
            while (testI < 9999) {
                useID = prefix + '_' + testI;
                if (this.allNode_map[useID] == null) {
                    break;
                }
                ++testI;
            }
            return useID;
        }
    }, {
        key: 'registerNode',
        value: function registerNode(node, parentNode) {
            if (node.type == JSDEF_VAR) {
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
            parentNode.fireChanged(10);
        }
    }, {
        key: 'addVariable',
        value: function addVariable(varNode) {
            var foundVar = this.vars_arr.find(function (item) {
                return item.name == varNode.name;
            });
            if (foundVar) {
                return;
            }
            var useId = varNode.id;
            if (useId == null) {
                useId = this.genNodeId(varNode.type);
                varNode.id = useId;
            }
            varNode.bluePrint = this;
            varNode.parent = this;
            this.allNode_map[useId] = varNode;
            this.vars_arr.push(varNode);
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
            var rlt = new FlowDef_Variable({ name: varName, valType: ValueType.String }, this);
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
            if (node.isConstNode || node.canDelete && !node.canDelete()) {
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
            var _this4 = this;

            this.banEvent('changed');
            nodes_arr.forEach(function (node) {
                _this4.deleteNode(node);
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
        key: 'getNodesByTypes',
        value: function getNodesByTypes(targetTypes_arr, mustGoodNode) {
            if (targetTypes_arr == null) {
                return null;
            }
            var isArr = Array.isArray(targetTypes_arr);
            var rlt = null;
            for (var si in this.allNode_map) {
                var node = this.allNode_map[si];
                var wanted = node.type == targetTypes_arr;
                if (isArr) {
                    wanted = targetTypes_arr.indexOf(node.type) != -1;
                }
                if (wanted) {
                    if (mustGoodNode && !node.isReachable()) {
                        continue;
                    }
                    if (rlt == null) {
                        rlt = [node];
                    } else {
                        rlt.push(null);
                    }
                }
            }
            return rlt;
        }
    }, {
        key: 'getSocketById',
        value: function getSocketById(socketID) {
            var pos = socketID.indexOf('$');
            var nodeId = socketID.substr(0, pos);
            var theNode = this.getNodeByID(nodeId);
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
    }, {
        key: 'genNodeByJson',
        value: function genNodeByJson(parentNode, nodeJson, createHelper) {
            var setting = FlowNodeClassMap[nodeJson.type];
            if (setting == null) {
                console.warn(nodeJson.type + '节点类型未找到对应class map');
                return null;
            }
            return new setting.modelClass({}, parentNode, createHelper, nodeJson);
        }
    }, {
        key: 'genNodesByJsonArr',
        value: function genNodesByJsonArr(parentNode, jsonArr, createHelper) {
            var rlt_arr = [];
            if (!IsEmptyArray(jsonArr)) {
                var self = this;
                jsonArr.forEach(function (nodeJson) {
                    var newNode = self.genNodeByJson(parentNode, nodeJson, createHelper);
                    if (newNode) {
                        rlt_arr.push(newNode);
                    }
                });
            }
            return rlt_arr;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var self = this;
            // save base info
            var theJson = {
                name: this.flow.name,
                flowCode: this.flow.code
            };
            if (this.editorLeft) {
                theJson.editorLeft = this.editorLeft;
            }
            if (this.editorTop) {
                theJson.editorTop = this.editorTop;
            }
            // save var info
            var varJson_arr = [];
            this.vars_arr.forEach(function (varData) {
                varJson_arr.push(varData.getJson());
            });
            if (varJson_arr.length > 0) {
                theJson.variables_arr = varJson_arr;
            }

            if (this.nodes_arr.length > 0) {
                var nodeJson_arr = [];
                this.nodes_arr.forEach(function (nodeData) {
                    nodeJson_arr.push(nodeData.getJson());
                });
                theJson.nodes_arr = nodeJson_arr;
            }
            theJson.links_arr = this.linkPool.getJson();

            return theJson;
        }
    }, {
        key: 'compile',
        value: function compile(compilHelper) {
            var flow = this.flow;
            if (flow == null) {
                compilHelper.logManager.error('蓝图需要关联Flow');
                return false;
            }
            if (flow.steps_arr.length == 0) {
                compilHelper.logManager.error('流程没有任何一个步骤');
                return false;
            }
            var flowJSFile = new FlowScriptFile(flow);
            var stepSwitchBlock = new JSFile_Switch('step', 'stepCode');
            flowJSFile.processFun.pushChild(stepSwitchBlock);
            // find all stepStart
            var stepNodes_arr = this.nodes_arr.filter(function (node) {
                return node.type == FLOWNODE_STEP_START;
            });
            var si;
            for (si in stepNodes_arr) {
                var stepNode = stepNodes_arr[si];
                var theStep = flow.steps_arr.find(function (step) {
                    return step == stepNode.step;
                });
                if (theStep == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(stepNode.getNodeTitle(), stepNode, helper.clickLogBadgeItemHandler), '不是有效的步骤节点']);
                    continue;
                }
                var stepFun = flowJSFile.scope.getFunction('_dostep' + theStep.code, true, theStep.params_arr);
                compilHelper.compilingStep = theStep;
                compilHelper.compilingStepFun = stepFun;
                flowJSFile.initProcessFun(stepFun);
                var callFunUseParams_arr = [];
                theStep.params_arr.forEach(function (param) {
                    callFunUseParams_arr.push('pram' + (callFunUseParams_arr.length + 1));
                    stepFun.headBlock.pushLine('if(' + param + ' == null){return serverhelper.createErrorRet("确失参数[' + param + ']");}');
                });
                var caseBlock = stepSwitchBlock.getCaseBlock(theStep.code);
                caseBlock.pushLine('return ' + stepFun.name + '(' + callFunUseParams_arr.join(',') + ');');
                stepNode.compile(compilHelper, [], stepFun.bodyBlock);
            }
            flowJSFile.processFun.retBlock.pushLine('return co(function* (){return serverhelper.createErrorRet("无法处理的的步骤" + stepCode);});');
            flowJSFile.compileEnd();
            return flowJSFile;
        }
    }]);

    return FlowNode_BluePrint;
}(EventEmitter);

var FlowNode_Var_Get = function (_FlowNode_Base2) {
    _inherits(FlowNode_Var_Get, _FlowNode_Base2);

    function FlowNode_Var_Get(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_Var_Get);

        var _this5 = _possibleConstructorReturn(this, (FlowNode_Var_Get.__proto__ || Object.getPrototypeOf(FlowNode_Var_Get)).call(this, initData, parentNode, createHelper, FLOWNODE_VAR_GET, '变量-获取', false, nodeJson));

        autoBind(_this5);

        if (nodeJson) {
            if (_this5.outputScokets_arr.length > 0) {
                _this5.outSocket = _this5.outputScokets_arr[0];
            }
        }
        if (_this5.outSocket == null) {
            _this5.outSocket = new NodeSocket('out', _this5, false);
            _this5.addSocket(_this5.outSocket);
        }

        _this5.varData = _this5.bluePrint.getVariableByName(_this5.varName);
        if (_this5.varData != null) {
            _this5.varData.on('changed', _this5.varChangedHandler);
        }
        _this5.varChangedHandler();

        var self = _this5;
        return _this5;
    }

    _createClass(FlowNode_Var_Get, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Var_Get.prototype), 'requestSaveAttrs', this).call(this);
            rlt.varName = this.varName;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['varName']);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Get:' + this.varName;
        }
    }, {
        key: 'varChangedHandler',
        value: function varChangedHandler() {
            if (this.varData == null) {
                this.outSocket.set(MK_NS_Settings(this.varName + '-不存在', ValueType.Unknown, null));
                return;
            }
            var varLabel = '';
            var valType = '';
            if (this.varData.removed) {
                this.varData = null;
                varLabel = this.varName + '-不存在';
                valType = ValueType.Unknown;
            } else {
                varLabel = this.varData.getLabel();
                valType = this.varData.getValType();
                this.varName = this.varData.name;
            }

            this.outSocket.set(MK_NS_Settings(varLabel, valType, null));
            //this.emit('changed');
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(FlowNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Var_Get.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.varData == null || this.varData.removed) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '无效变量']);
                return false;
            }
            var selfCompileRet = new CompileResult(this);
            helper.addUseVariable(this.varData.name, this.varData.valType, this.varData.getDefineString());
            selfCompileRet.setSocketOut(this.outSocket, this.varData.getRealName());
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return FlowNode_Var_Get;
}(FlowNode_Base);

var FlowNode_Var_Set = function (_FlowNode_Base3) {
    _inherits(FlowNode_Var_Set, _FlowNode_Base3);

    function FlowNode_Var_Set(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_Var_Set);

        var _this6 = _possibleConstructorReturn(this, (FlowNode_Var_Set.__proto__ || Object.getPrototypeOf(FlowNode_Var_Set)).call(this, initData, parentNode, createHelper, FLOWNODE_VAR_SET, '变量-设置', false, nodeJson));

        autoBind(_this6);

        if (nodeJson) {
            if (_this6.outputScokets_arr.length > 0) {
                _this6.outSocket = _this6.outputScokets_arr[0];
            }
            if (_this6.inputScokets_arr.length > 0) {
                _this6.inSocket = _this6.inputScokets_arr[0];
            }
        }
        if (_this6.outSocket == null) {
            _this6.outSocket = new NodeSocket('out', _this6, false);
            _this6.addSocket(_this6.outSocket);
        }
        _this6.outSocket.isSimpleVal = true;
        if (_this6.inSocket == null) {
            _this6.inSocket = new NodeSocket('in', _this6, true);
            _this6.addSocket(_this6.inSocket);
        }
        if (_this6.inFlowSocket == null) {
            _this6.inFlowSocket = new NodeFlowSocket('flow_i', _this6, true);
            _this6.addSocket(_this6.inFlowSocket);
        }
        if (_this6.outFlowSocket == null) {
            _this6.outFlowSocket = new NodeFlowSocket('flow_o', _this6, false);
            _this6.addSocket(_this6.outFlowSocket);
        }

        _this6.varData = _this6.bluePrint.getVariableByName(_this6.varName);
        if (_this6.varData != null) {
            _this6.varData.on('changed', _this6.varChangedHandler);
        }
        _this6.varChangedHandler();
        return _this6;
    }

    _createClass(FlowNode_Var_Set, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_Var_Set.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Var_Set.prototype), 'requestSaveAttrs', this).call(this);
            rlt.varName = this.varName;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['varName']);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Set:' + this.varName;
        }
    }, {
        key: 'varChangedHandler',
        value: function varChangedHandler() {
            if (this.varData == null) {
                this.inSocket.set(MK_NS_Settings(this.varName + '-不存在', ValueType.Unknown, null));
                return;
            }
            var varLabel = '';
            var valType = '';
            if (this.varData.removed) {
                this.varData = null;
                varLabel = this.varName + '-不存在';
                valType = ValueType.Unknown;
            } else {
                varLabel = this.varData.getLabel();
                valType = this.varData.getValType();
                this.varName = this.varData.name;
            }

            this.inSocket.set(MK_NS_Settings(varLabel, valType, this.inSocket.defval));
            this.outSocket.set(MK_NS_Settings('', valType, null));
            this.fireChanged();
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_Var_Set.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Var_Set.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketValue = '';

            if (this.varData == null || this.varData.removed) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '无效变量']);
                return false;
            }

            var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
            if (datalinks_arr.length == 0) {
                if (IsEmptyString(this.inSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '必须有输入值']);
                    return false;
                }
                socketValue = this.inSocket.defval;
                if (isNaN(socketValue)) {
                    socketValue = singleQuotesStr(socketValue);
                }
            } else {
                var dataLink = datalinks_arr[0];
                var outNode = dataLink.outSocket.node;
                var compileRet = null;
                if (outNode.isHadFlow()) {
                    compileRet = helper.getCompileRetCache(outNode);
                    if (compileRet == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入接口设置错误']);
                        return false;
                    }
                } else {
                    compileRet = outNode.compile(helper, usePreNodes_arr);
                }
                if (compileRet == false) {
                    return false;
                }
                socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
            }

            belongBlock.getScope().getVar(this.varData.name, true, this.varData.default);

            var myJSBlock = new FormatFileBlock(this.id);
            myJSBlock.pushLine(this.varData.name + ' = ' + socketValue + ';');
            belongBlock.pushChild(myJSBlock);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            selfCompileRet.setSocketOut(this.outSocket, this.varData.name);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }
            return selfCompileRet;
        }
    }]);

    return FlowNode_Var_Set;
}(FlowNode_Base);

var FlowNode_StepStart = function (_FlowNode_Base4) {
    _inherits(FlowNode_StepStart, _FlowNode_Base4);

    function FlowNode_StepStart(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_StepStart);

        var _this7 = _possibleConstructorReturn(this, (FlowNode_StepStart.__proto__ || Object.getPrototypeOf(FlowNode_StepStart)).call(this, initData, parentNode, createHelper, FLOWNODE_STEP_START, '步骤开始', false, nodeJson));

        autoBind(_this7);
        //this.isConstNode = true;

        if (_this7.outFlowSocket == null) {
            _this7.outFlowSocket = new NodeFlowSocket('flow_o', _this7, false);
            _this7.addSocket(_this7.outFlowSocket);
        }

        if (_this7.step == null) {
            _this7.step = _this7.bluePrint.flow.findStepByCode(_this7.stepCode);
        }

        if (_this7.step != null) {
            _this7.step.on('changed', _this7.stepChangedHandler);
            _this7.label = '开始[' + _this7.step.name + ']';
            _this7.stepCode = _this7.step.code;
            _this7.stepChangedHandler();
        }
        return _this7;
    }

    _createClass(FlowNode_StepStart, [{
        key: 'canDelete',
        value: function canDelete() {
            return this.step == null;
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_StepStart.prototype.__proto__ || Object.getPrototypeOf(FlowNode_StepStart.prototype), 'requestSaveAttrs', this).call(this);
            rlt.stepCode = this.stepCode;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['stepCode']);
        }
    }, {
        key: 'stepChangedHandler',
        value: function stepChangedHandler(ev) {
            var paramCount = this.step.params_arr.length;
            while (this.outputScokets_arr.length != paramCount) {
                if (this.outputScokets_arr.length > paramCount) {
                    this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
                } else {
                    this.addSocket(new NodeSocket('out' + this.outputScokets_arr.length, this, false));
                }
            }
            for (var pi in this.step.params_arr) {
                var outScoket = this.outputScokets_arr[pi];
                outScoket.type = ValueType.String;
                outScoket.label = this.step.params_arr[pi];

                outScoket.fireEvent('changed');
            }

            this.label = '开始[' + this.step.name + ']';

            this.emit('changed');
            this.emit(Event_SocketNumChanged);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_StepStart.prototype.__proto__ || Object.getPrototypeOf(FlowNode_StepStart.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outFlowSocket, '', belongBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            this.outputScokets_arr.forEach(function (socket) {
                selfCompileRet.setSocketOut(socket, socket.label);
            });

            if (this.checkCompileFlag(this.step == null, '无效的流程步骤', helper)) {
                return false;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
            if (flowLinks_arr.length == 0) {
                helper.logManager.warnEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '步骤没有后续节点']);
                belongBlock.pushLine('return serverhelper.createErrorRet("没有后续节点");');
            } else {
                flowLinks_arr[0].inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
            }

            return selfCompileRet;
        }
    }]);

    return FlowNode_StepStart;
}(FlowNode_Base);

var FlowNode_QuerySql = function (_JSNode_Base) {
    _inherits(FlowNode_QuerySql, _JSNode_Base);

    function FlowNode_QuerySql(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_QuerySql);

        var _this8 = _possibleConstructorReturn(this, (FlowNode_QuerySql.__proto__ || Object.getPrototypeOf(FlowNode_QuerySql)).call(this, initData, parentNode, createHelper, FLOWNODE_QUERY_SQL, '查询Sql', false, nodeJson));

        autoBind(_this8);

        if (nodeJson) {
            if (_this8.outputScokets_arr.length > 0) {
                _this8.outDataSocket = _this8.outputScokets_arr[0];
            }
        }
        if (_this8.outDataSocket == null) {
            _this8.outDataSocket = new NodeSocket('outdata', _this8, false, { type: ValueType.Any });
            _this8.addSocket(_this8.outDataSocket);
        }
        _this8.outDataSocket.label = '结果';

        if (_this8.targetEntity != null) {
            var tem_arr = _this8.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var project = createHelper.project;
                _this8.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                if (_this8.targetEntity) {
                    _this8.targetEntity.on('syned', _this8.entitySynedHandler);
                }
            } else {
                _this8.targetEntity = null;
            }
        }

        if (_this8.inFlowSocket == null) {
            _this8.inFlowSocket = new NodeFlowSocket('flow_i', _this8, true);
            _this8.addSocket(_this8.inFlowSocket);
        }
        if (_this8.outFlowSocket == null) {
            _this8.outFlowSocket = new NodeFlowSocket('flow_o', _this8, false);
            _this8.addSocket(_this8.outFlowSocket);
        }
        return _this8;
    }

    _createClass(FlowNode_QuerySql, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_QuerySql.prototype.__proto__ || Object.getPrototypeOf(FlowNode_QuerySql.prototype), 'requestSaveAttrs', this).call(this);
            if (this.targetEntity != null) {
                rlt.targetEntity = 'dbe-' + this.targetEntity.code;
            }
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['targetEntity']);
        }
    }, {
        key: 'inputSocketSortFun',
        value: function inputSocketSortFun(sa, sb) {
            return sa.index > sb.index;
        }
    }, {
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            var _this9 = this;

            var entity = this.targetEntity;
            if (entity && entity.loaded) {
                var entity_param_arr = [];
                var params_arr = entity.getParams();
                if (params_arr) {
                    if (!entity.isCustomDS) {
                        params_arr.forEach(function (param, i) {
                            if (param.isreturn == false) {
                                // param.parent != null 说明是自订数据源中的参数
                                entity_param_arr.push(param);
                            }
                        });
                    } else {
                        entity_param_arr = params_arr;
                    }
                }

                this.inputScokets_arr.forEach(function (item) {
                    item._validparam = false;
                });
                var hadChanged = false;
                entity_param_arr.forEach(function (param, i) {
                    var theSocket = _this9.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this9.addSocket(new NodeSocket(param.name, _this9, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
                        hadChanged = true;
                    } else {
                        theSocket._validparam = true;
                        if (theSocket.label != param.name) {
                            theSocket.set({ label: param.name });
                        }
                        theSocket.index = i;
                    }
                });
                var needSort = false;
                for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                    var theSocket = this.inputScokets_arr[si];
                    if (theSocket._validparam == false) {
                        this.removeSocket(theSocket);
                        --si;
                        hadChanged = true;
                    } else {
                        if (!needSort) {
                            needSort = theSocket.index == si;
                        }
                    }
                }
                if (needSort) {
                    this.inputScokets_arr.sort(this.inputSocketSortFun);
                }
                if (hadChanged || needSort) {
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
            if (typeof entity === 'string') {
                if (entity != '0') {
                    entity = g_dataBase.getEntityByCode(entity);
                } else {
                    entity = null;
                }
            }
            if (this.targetEntity == entity) return;
            if (this.targetEntity != null) {
                this.targetEntity.off('syned', this.entitySynedHandler);
            }
            this.targetEntity = entity;
            if (entity) {
                entity.on('syned', this.entitySynedHandler);
                this.outDataSocket.type = entity.isScalar() ? SqlVarType_Scalar : SqlVarType_Table;
            } else {
                this.outDataSocket.type = SqlVarType_Unknown;
            }
            this.entitySynedHandler();
            this.outDataSocket.fireEvent('changed');
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_QuerySql.prototype.__proto__ || Object.getPrototypeOf(FlowNode_QuerySql.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.targetEntity == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要选择一个数据实体']);
                return false;
            }
            if (this.targetEntity.loaded == false) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '数据实体元数据尚未加载完成']);
                return false;
            }

            var myCodeBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myCodeBlock);

            var params_arr = [];
            var compileRet;
            var usePreNodes_arr = preNodes_arr.concat(this);
            if (this.inputScokets_arr.length > 0) {
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var theSocket = this.inputScokets_arr[i];
                    var paramValue = null;
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                    if (tLinks.length == 0) {
                        paramValue = IsEmptyString(theSocket.defval) ? null : theSocket.defval;
                        if (isNaN(paramValue)) {
                            paramValue = "'" + theSocket.defval + "'";
                        }
                    } else {
                        compileRet = tLinks[0].outSocket.node.compile(helper, usePreNodes_arr);
                        if (compileRet == false) {
                            // child compile fail
                            return false;
                        }
                        paramValue = compileRet.getSocketOut(tLinks[0].outSocket).strContent;
                    }
                    if (IsEmptyString(paramValue)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '参数:"' + theSocket.name + '"未设置']);
                        return false;
                    }
                    params_arr.push({ name: theSocket.name.replace('@', ''), value: paramValue });
                }
            }

            var targetEntity = this.targetEntity;
            var isScalar = targetEntity.isScalar();
            var paramVarName = this.id + '_params_arr';
            myCodeBlock.pushLine(makeLine_DeclareVar(paramVarName));
            var paramListStr = '';
            if (params_arr.length > 0) {
                var paramInitBlock = new FormatFileBlock('initparam');
                paramInitBlock.pushLine(paramVarName + "=[", 1);
                params_arr.forEach(function (param) {
                    paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.paramValue + "),");
                });
                paramInitBlock.subNextIndent();
                paramInitBlock.pushLine('];');
                myCodeBlock.pushChild(paramInitBlock);
            }
            var sqlInitValue = '';
            if (targetEntity.group == 'custom') {
                // 定制数据源
                if (helper.sqlBPCacheManager) {
                    sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                } else {
                    var bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                    bpCompileHelper.clickLogBadgeItemHandler = null;
                    compileRet = targetEntity.compile(bpCompileHelper);
                    if (compileRet == false) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '自订数据源' + targetEntity.name + '编译发生错误，无法继续']);
                        return false;
                    }
                    sqlInitValue = compileRet.sql;
                }
            } else {
                if (isScalar) {
                    sqlInitValue = 'select dbo.' + targetEntity.name + '(' + paramListStr + ')';
                } else {
                    sqlInitValue = 'select * from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
                }
            }
            var sqlVarName = this.id + 'sql';
            myCodeBlock.pushLine(makeLine_DeclareVar(sqlVarName, doubleQuotesStr(sqlInitValue)));
            var rcdResultVarName = this.id + '_value';
            myCodeBlock.pushLine(makeLine_DeclareVar(rcdResultVarName));
            var tryBlock = new JSFile_Try('try');
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            myCodeBlock.pushChild(tryBlock);
            if (isScalar) {
                tryBlock.bodyBlock.pushLine(rcdResultVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
            } else {
                var rcdRltVarName = this.id + '_rcdRlt';
                tryBlock.bodyBlock.pushLine('var ' + rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
                tryBlock.bodyBlock.pushLine(rcdResultVarName + '=' + rcdRltVarName + '.recordset;');
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
            selfCompileRet.setSocketOut(this.outDataSocket, rcdResultVarName);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
                return false;
            }
            return selfCompileRet;
        }
    }]);

    return FlowNode_QuerySql;
}(JSNode_Base);

var FlowNode_Create_ServerError = function (_JSNode_Base2) {
    _inherits(FlowNode_Create_ServerError, _JSNode_Base2);

    function FlowNode_Create_ServerError(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_Create_ServerError);

        var _this10 = _possibleConstructorReturn(this, (FlowNode_Create_ServerError.__proto__ || Object.getPrototypeOf(FlowNode_Create_ServerError)).call(this, initData, parentNode, createHelper, FLOWNODE_CREATE_SERVERERROR, '创建错误', false, nodeJson));

        autoBind(_this10);

        if (nodeJson) {
            if (_this10.outputScokets_arr.length > 0) {
                _this10.outSocket = _this10.outputScokets_arr[0];
            }
            if (_this10.inputScokets_arr.length > 0) {
                _this10.inSocket = _this10.inputScokets_arr[0];
            }
        }
        if (_this10.inSocket == null) {
            _this10.inSocket = new NodeSocket('in', _this10, true);
            _this10.addSocket(_this10.inSocket);
        }
        if (_this10.outSocket == null) {
            _this10.outSocket = new NodeSocket('out', _this10, false);
            _this10.addSocket(_this10.outSocket);
        }
        _this10.inSocket.type = ValueType.String;
        _this10.inSocket.inputable = true;
        _this10.outSocket.type = ValueType.Object;
        return _this10;
    }

    _createClass(FlowNode_Create_ServerError, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_Create_ServerError.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Create_ServerError.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inSocket;
            var socketValue = null;
            var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (datalinks_arr.length == 0) {
                socketValue = theSocket.defval;
                if (IsEmptyString(socketValue)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要设置参数']);
                    return false;
                }
                if (!isNaN(socketValue)) {
                    socketValue = singleQuotesStr(socketValue);
                }
            } else {
                var dataLink = datalinks_arr[0];
                var outNode = dataLink.outSocket.node;
                var compileRet = null;
                if (outNode.isHadFlow()) {
                    compileRet = helper.getCompileRetCache(outNode);
                    if (compileRet == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入接口设置错误']);
                        return false;
                    }
                } else {
                    compileRet = outNode.compile(helper, usePreNodes_arr);
                }
                if (compileRet == false) {
                    return false;
                }
                socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, 'serverhelper.createErrorRet(' + socketValue + ')');
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return FlowNode_Create_ServerError;
}(JSNode_Base);

var FlowNode_QueryKeyRecord = function (_JSNode_Base3) {
    _inherits(FlowNode_QueryKeyRecord, _JSNode_Base3);

    function FlowNode_QueryKeyRecord(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_QueryKeyRecord);

        var _this11 = _possibleConstructorReturn(this, (FlowNode_QueryKeyRecord.__proto__ || Object.getPrototypeOf(FlowNode_QueryKeyRecord)).call(this, initData, parentNode, createHelper, FLOWNODE_QUERY_KEYRECORD, '查询关键记录', false, nodeJson));

        autoBind(_this11);

        if (nodeJson) {
            if (_this11.inputScokets_arr.length > 0) {
                _this11.keyInSocket = _this11.inputScokets_arr[0];
            }
        }
        if (_this11.keyInSocket == null) {
            _this11.keyInSocket = new NodeSocket('rcdkey', _this11, true, { type: ValueType.Int });
            _this11.addSocket(_this11.keyInSocket);
        }
        _this11.keyInSocket.label = 'KEY';
        _this11.keyInSocket.index = -1;

        if (_this11.targetEntity != null) {
            var tem_arr = _this11.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var project = createHelper.project;
                _this11.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                if (_this11.targetEntity) {
                    _this11.targetEntity.on('syned', _this11.entitySynedHandler);
                }
            } else {
                _this11.targetEntity = null;
            }
        }

        if (_this11.inFlowSocket == null) {
            _this11.inFlowSocket = new NodeFlowSocket('flow_i', _this11, true);
            _this11.addSocket(_this11.inFlowSocket);
        }
        if (_this11.outFlowSocket == null) {
            _this11.outFlowSocket = new NodeFlowSocket('flow_o', _this11, false);
            _this11.addSocket(_this11.outFlowSocket);
        }
        return _this11;
    }

    _createClass(FlowNode_QueryKeyRecord, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_QueryKeyRecord.prototype.__proto__ || Object.getPrototypeOf(FlowNode_QueryKeyRecord.prototype), 'requestSaveAttrs', this).call(this);
            if (this.targetEntity != null) {
                rlt.targetEntity = 'dbe-' + this.targetEntity.code;
                rlt.keyColumn = this.keyColumn;
            }
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['targetEntity', 'keyColumn']);
        }
    }, {
        key: 'inputSocketSortFun',
        value: function inputSocketSortFun(sa, sb) {
            return sa.index > sb.index;
        }
    }, {
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            var _this12 = this;

            var entity = this.targetEntity;
            if (entity && entity.loaded) {
                var entity_param_arr = [];
                var params_arr = entity.getParams();
                if (params_arr) {
                    if (!entity.isCustomDS) {
                        params_arr.forEach(function (param, i) {
                            if (param.isreturn == false) {
                                // param.parent != null 说明是自订数据源中的参数
                                entity_param_arr.push(param);
                            }
                        });
                    } else {
                        entity_param_arr = params_arr;
                    }
                }

                this.inputScokets_arr.forEach(function (item, i) {
                    item._validparam = i == 0; // 0 是key参数
                });
                var hadChanged = false;
                entity_param_arr.forEach(function (param, i) {
                    var theSocket = _this12.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this12.addSocket(new NodeSocket(param.name, _this12, true, { type: SqlVarType_Scalar, label: param.name, index: i + 1 }));
                        hadChanged = true;
                    } else {
                        theSocket._validparam = true;
                        if (theSocket.label != param.name) {
                            theSocket.set({ label: param.name });
                        }
                        theSocket.index = i;
                    }
                });
                var needSort = false;
                for (var si = 1; si < this.inputScokets_arr.length; ++si) {
                    var theSocket = this.inputScokets_arr[si - 1];
                    if (theSocket._validparam == false) {
                        this.removeSocket(theSocket);
                        --si;
                        hadChanged = true;
                    } else {
                        if (!needSort) {
                            needSort = theSocket.index == si;
                        }
                    }
                }
                if (needSort) {
                    this.inputScokets_arr.sort(this.inputSocketSortFun);
                }
                if (hadChanged || needSort) {
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
            if (typeof entity === 'string') {
                if (entity != '0') {
                    entity = g_dataBase.getEntityByCode(entity);
                } else {
                    entity = null;
                }
            }
            if (this.targetEntity == entity) return;
            if (this.targetEntity != null) {
                this.targetEntity.off('syned', this.entitySynedHandler);
            }
            this.targetEntity = entity;
            if (entity) {
                entity.on('syned', this.entitySynedHandler);
                var kerColumn = entity.columns.find(function (col) {
                    return col.is_identity;
                });
                console.log(kerColumn);
                if (kerColumn) {
                    this.keyColumn = kerColumn.name;
                } else {
                    this.keyColumn = '';
                }
            } else {
                this.keyColumn = '';
            }
            this.entitySynedHandler();
        }
    }, {
        key: 'genOutSocket',
        value: function genOutSocket() {
            var theDS = this.targetEntity;
            if (theDS == null) {
                return null;
            }
            var hadColumns_arr = [];
            for (var si in this.outputScokets_arr) {
                var outSocket = this.outputScokets_arr[si];
                var columnName = outSocket.getExtra('colName');
                if (columnName != null) {
                    hadColumns_arr.push(columnName);
                }
            }
            var emptyCol = theDS.columns.find(function (colItem) {
                return hadColumns_arr.indexOf(colItem.name) == -1;
            });
            if (emptyCol == null) {
                return null;
            }
            var newSocket = new NodeSocket(this.getUseableOutSocketName('col'), this, false, { type: ValueType.String });
            newSocket.setExtra('colName', emptyCol.name);
            return newSocket;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_QueryKeyRecord.prototype.__proto__ || Object.getPrototypeOf(FlowNode_QueryKeyRecord.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.targetEntity == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要选择一个数据实体']);
                return false;
            }
            var targetEntity = this.targetEntity;
            var isScalar = targetEntity.isScalar();
            if (this.checkCompileFlag(isScalar, '目标数据不能是标量值')) {
                return false;
            }
            if (this.checkCompileFlag(targetEntity.loaded == false, '数据实体元数据尚未加载完成')) {
                return false;
            }
            var keyColumnItem = targetEntity.getColumnByName(this.keyColumn);
            if (this.checkCompileFlag(keyColumnItem == null, '关键字段设置错误')) {
                return false;
            }
            if (!keyColumnItem.is_identity) {
                helper.logManager.warnEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '关键字段不是identity字段']);
            }

            var myCodeBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myCodeBlock);

            var params_arr = [];
            var compileRet;
            var usePreNodes_arr = preNodes_arr.concat(this);
            if (this.inputScokets_arr.length > 0) {
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var theSocket = this.inputScokets_arr[i];
                    var paramValue = null;
                    var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                    if (socketComRet.err) {
                        return false;
                    }
                    var paramValue = socketComRet.value;
                    params_arr.push({ name: theSocket.name.replace('@', ''), value: paramValue });
                }
            }
            var paramVarName = this.id + '_params_arr';
            myCodeBlock.pushLine(makeLine_DeclareVar(paramVarName));
            var paramListStr = '';
            if (params_arr.length > 0) {
                var paramInitBlock = new FormatFileBlock('initparam');
                paramInitBlock.pushLine(paramVarName + "=[", 1);
                params_arr.forEach(function (param, i) {
                    if (i != 0) {
                        paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
                });
                paramInitBlock.subNextIndent();
                paramInitBlock.pushLine('];');
                myCodeBlock.pushChild(paramInitBlock);
            }
            var selfCompileRet = new CompileResult(this);
            var rcdResultVarName = this.id + '_record';
            var defOutColumnBlock = new FormatFileBlock('defOut');

            var selectColumns_arr = [];
            for (var si in this.outputScokets_arr) {
                var outSocket = this.outputScokets_arr[si];
                var colName = outSocket.getExtra('colName');
                if (this.checkCompileFlag(!targetEntity.containColumn(colName), '第' + (si + 1) + '个输出接口列[' + colName + ']是非法的')) {
                    return false;
                }
                if (selectColumns_arr.indexOf(colName) == -1) {
                    selectColumns_arr.push('[' + colName + ']');
                }
                defOutColumnBlock.pushLine('var ' + this.id + '_' + colName + '=' + rcdResultVarName + '.' + colName + ';');
                selfCompileRet.setSocketOut(outSocket, this.id + '_' + colName);
            }
            if (this.checkCompileFlag(selectColumns_arr.length == 0, '第没有选择任何一个输出列')) {
                return false;
            }
            var sqlInitValue = '';
            if (targetEntity.group == 'custom') {
                // 定制数据源
                if (helper.sqlBPCacheManager) {
                    sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                } else {
                    var bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                    bpCompileHelper.clickLogBadgeItemHandler = null;
                    compileRet = targetEntity.compile(bpCompileHelper);
                    if (compileRet == false) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '自订数据源' + targetEntity.name + '编译发生错误，无法继续']);
                        return false;
                    }
                    sqlInitValue = compileRet.sql;
                }
            } else {
                sqlInitValue = 'select ' + selectColumns_arr.join(',') + ' from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '') + ' where ' + this.keyColumn + '=@' + this.inputScokets_arr[0].name;
            }
            var sqlVarName = this.id + 'sql';
            myCodeBlock.pushLine(makeLine_DeclareVar(sqlVarName, doubleQuotesStr(sqlInitValue)));
            var rcdRltVarName = this.id + '_rcdRlt';
            myCodeBlock.pushLine(makeLine_DeclareVar(rcdRltVarName));
            var tryBlock = new JSFile_Try('try');
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            myCodeBlock.pushChild(tryBlock);
            tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
            myCodeBlock.pushLine('if(' + rcdRltVarName + '.recordset.length!=1){return serverhelper.createErrorRet("在[' + targetEntity.name + ']中查到了" + ' + rcdResultVarName + '.recordset.length + "条符条件的数据");}');
            myCodeBlock.pushLine('var ' + rcdResultVarName + '=' + rcdRltVarName + '.recordset[0];');
            myCodeBlock.pushChild(defOutColumnBlock);

            selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
                return false;
            }
            return selfCompileRet;
        }
    }]);

    return FlowNode_QueryKeyRecord;
}(JSNode_Base);

var FlowNode_ColumnVar = function (_JSNode_Base4) {
    _inherits(FlowNode_ColumnVar, _JSNode_Base4);

    function FlowNode_ColumnVar(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_ColumnVar);

        var _this13 = _possibleConstructorReturn(this, (FlowNode_ColumnVar.__proto__ || Object.getPrototypeOf(FlowNode_ColumnVar)).call(this, initData, parentNode, createHelper, FLOWNODE_COLUMN_VAR, '列变量', false, nodeJson));

        autoBind(_this13);

        if (nodeJson) {
            if (_this13.outputScokets_arr.length > 0) {
                _this13.outSocket = _this13.outputScokets_arr[0];
            }
        }
        if (_this13.outSocket == null) {
            _this13.outSocket = new NodeSocket('out', _this13, false);
            _this13.addSocket(_this13.outSocket);
        }
        _this13.outSocket.type = ValueType.String;
        _this13.outSocket.inputable = false;
        _this13.headType = 'empty';

        var self = _this13;
        setTimeout(function () {
            self.freshLabel();
        }, 50);
        return _this13;
    }

    _createClass(FlowNode_ColumnVar, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_ColumnVar.prototype.__proto__ || Object.getPrototypeOf(FlowNode_ColumnVar.prototype), 'requestSaveAttrs', this).call(this);
            rlt.keySocketID = this.keySocketID;
            rlt.label = this.label;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['targetEntity', 'keySocketID']);
        }
    }, {
        key: 'freshLabel',
        value: function freshLabel() {
            var label = '';
            var keySocket = this.keySocketID == null ? null : this.bluePrint.getSocketById(this.keySocketID);
            if (keySocket == null) {
                label = '关联节点丢失!';
            } else {
                label = keySocket.getExtra('colName');
            }
            this.keySocket = keySocket;
            this.columnName = label;
            this.outSocket.label = label;
            this.outSocket.fireEvent('changed');
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(FlowNode_ColumnVar.prototype.__proto__ || Object.getPrototypeOf(FlowNode_ColumnVar.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            this.freshLabel();
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();

            if (this.keySocket == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '关联节点无效']);
                return false;
            }
            var theColumn = null;
            if (preNodes_arr.indexOf(this.keySocket.node) == -1) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能早于关联的节点被访问到']);
                return false;
            }
            if (this.keySocket.node.targetEntity != null) {
                theColumn = this.keySocket.node.targetEntity.getColumnByName(this.columnName);
            }
            if (theColumn == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '关联的列名是无效的']);
                return false;
            }
            var value = this.keySocket.node.id + '_' + this.columnName;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, value);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return FlowNode_ColumnVar;
}(JSNode_Base);

var FlowNode_Send_Message = function (_JSNode_Base5) {
    _inherits(FlowNode_Send_Message, _JSNode_Base5);

    function FlowNode_Send_Message(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_Send_Message);

        var _this14 = _possibleConstructorReturn(this, (FlowNode_Send_Message.__proto__ || Object.getPrototypeOf(FlowNode_Send_Message)).call(this, initData, parentNode, createHelper, FLOWNODE_SEND_MESSAGE, '发送通知', false, nodeJson));

        autoBind(_this14);

        if (nodeJson) {
            _this14.inputScokets_arr.forEach(function (socket) {
                switch (socket.name) {
                    case 'sendType':
                        _this14.sendTypeScoket = socket;
                        break;
                    case 'targetType':
                        _this14.targetTypeScoket = socket;
                        break;
                    case 'targetPerson':
                        _this14.targetPersonScoket = socket;
                        break;
                    case 'personEduct':
                        _this14.personEductScoket = socket;
                        break;
                    case 'targetPost':
                        _this14.targetPostScoket = socket;
                        break;
                    case 'encrypted':
                        _this14.encrytedScoket = socket;
                        break;
                    case 'title':
                        _this14.titleScoket = socket;
                        break;
                    case 'content':
                        _this14.contentScoket = socket;
                        break;
                    case 'flowStep':
                        _this14.flowStepScoket = socket;
                        break;
                    case 'msgType':
                        _this14.msgTypeScoket = socket;
                        break;
                    case 'project':
                        _this14.projectScoket = socket;
                        break;
                    case 'intdata':
                        _this14.intdataScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (_this14.inputScokets_arr.length > 0) {
                _this14.outSocket = _this14.outputScokets_arr[0];
            }
        }

        if (_this14.targetTypeScoket == null) {
            _this14.targetTypeScoket = new NodeSocket('targetType', _this14, true, { defval: EMessageTargetType.Person });
            _this14.addSocket(_this14.targetTypeScoket);
        }
        _this14.targetTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageTargetTypes_arr
            },
            hideIcon: true
        });
        _this14.targetTypeScoket.on('changed', _this14.targetTypeChanged);

        if (_this14.encrytedScoket == null) {
            _this14.encrytedScoket = new NodeSocket('encrypted', _this14, true);
            _this14.addSocket(_this14.encrytedScoket);
        }
        _this14.encrytedScoket.set({
            label: '是否加密',
            hideIcon: true,
            inputable: true,
            type: ValueType.Boolean
        });

        if (_this14.targetPersonScoket == null) {
            _this14.targetPersonScoket = new NodeSocket('targetPerson', _this14, true);
            _this14.addSocket(_this14.targetPersonScoket);
        }
        _this14.targetPersonScoket.label = '目标人员';

        if (_this14.personEductScoket == null) {
            _this14.personEductScoket = new NodeSocket('personEduct', _this14, true, { defval: 0 });
            _this14.addSocket(_this14.personEductScoket);
        }
        _this14.personEductScoket.set({
            label: '人员推算',
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: PersonEductOptions_arr
            },
            hideIcon: true
        });

        if (_this14.targetPostScoket == null) {
            _this14.targetPostScoket = new NodeSocket('targetPost', _this14, true);
            _this14.addSocket(_this14.targetPostScoket);
        }
        _this14.targetPostScoket.set({
            label: '目标岗位',
            inputable: true,
            inputDDC_setting: {
                textAttrName: '所属岗位名称',
                valueAttrName: '所属岗位名称代码',
                options_arr: AllPosts_arr
            },
            hideIcon: true
        });

        if (_this14.sendTypeScoket == null) {
            _this14.sendTypeScoket = new NodeSocket('sendType', _this14, true, { defval: EMessageSendType.Normal });
            _this14.addSocket(_this14.sendTypeScoket);
        }
        _this14.sendTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageSendTypes_arr
            },
            hideIcon: true
        });

        if (_this14.msgTypeScoket == null) {
            _this14.msgTypeScoket = new NodeSocket('msgType', _this14, true, { defval: EMessageType.Normal });
            _this14.addSocket(_this14.msgTypeScoket);
        }
        _this14.msgTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageTypes_arr
            },
            hideIcon: true
        });
        _this14.msgTypeScoket.on('changed', _this14.msgTypeChanged);

        if (_this14.flowStepScoket == null) {
            _this14.flowStepScoket = new NodeSocket('flowStep', _this14, true);
            _this14.addSocket(_this14.flowStepScoket);
        }
        _this14.flowStepScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'fullName',
                valueAttrName: 'code',
                options_arr: gFlowMaster.getAllSteps
            },
            hideIcon: true,
            label: '关联流程步骤'
        });

        if (_this14.projectScoket == null) {
            _this14.projectScoket = new NodeSocket('project', _this14, true);
            _this14.addSocket(_this14.projectScoket);
        }
        _this14.projectScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: ProjectRecords_arr
            },
            hideIcon: true,
            label: '关联方案'
        });

        if (_this14.intdataScoket == null) {
            _this14.intdataScoket = new NodeSocket('intdata', _this14, true);
            _this14.addSocket(_this14.intdataScoket);
        }
        _this14.intdataScoket.set({
            type: ValueType.Int,
            label: '关联数据'
        });

        if (_this14.titleScoket == null) {
            _this14.titleScoket = new NodeSocket('title', _this14, true, { type: ValueType.String, inputable: true });
            _this14.addSocket(_this14.titleScoket);
        }
        _this14.titleScoket.label = '标题';
        if (_this14.contentScoket == null) {
            _this14.contentScoket = new NodeSocket('content', _this14, true, { type: ValueType.String, inputable: true });
            _this14.addSocket(_this14.contentScoket);
        }
        _this14.contentScoket.label = '内容';

        _this14.targetTypeChanged();
        _this14.msgTypeChanged();

        if (_this14.inFlowSocket == null) {
            _this14.inFlowSocket = new NodeFlowSocket('flow_i', _this14, true);
            _this14.addSocket(_this14.inFlowSocket);
        }
        if (_this14.outFlowSocket == null) {
            _this14.outFlowSocket = new NodeFlowSocket('flow_o', _this14, false);
            _this14.addSocket(_this14.outFlowSocket);
        }
        return _this14;
    }

    _createClass(FlowNode_Send_Message, [{
        key: 'msgTypeChanged',
        value: function msgTypeChanged(ev) {
            console.log('msgTypeChanged' + ev);
            var isPorcess = this.msgTypeScoket.defval == EMessageType.Process;
            this.flowStepScoket.set({
                visible: isPorcess
            });
            this.projectScoket.set({
                visible: isPorcess
            });
            this.intdataScoket.set({
                visible: isPorcess
            });
        }
    }, {
        key: 'targetTypeChanged',
        value: function targetTypeChanged(ev) {
            console.log('targetTypeChanged' + ev);
            var targetIsPerson = this.targetTypeScoket.defval == EMessageTargetType.Person;
            var targetIsPost = this.targetTypeScoket.defval == EMessageTargetType.Post;
            if (!targetIsPerson) {
                this.bluePrint.linkPool.clearSocketLink(this.targetPersonScoket);
            }
            this.targetPersonScoket.set({
                visible: targetIsPerson
            });
            this.personEductScoket.set({
                visible: targetIsPerson
            });
            this.targetPostScoket.set({
                visible: targetIsPost
            });
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(FlowNode_Send_Message.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Send_Message.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, []);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_Send_Message.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Send_Message.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var theFlowStep = preNodes_arr[0].step;
            var sendType = this.sendTypeScoket.defval;
            var targetType = this.targetTypeScoket.defval;
            var personEduct = this.personEductScoket.defval;
            var targetPost = this.targetPostScoket.defval;
            var encrypted = this.encrytedScoket.defval;
            var flowStep = this.flowStepScoket.defval;
            var msgType = this.msgTypeScoket.defval;
            var project = this.projectScoket.defval;

            var nodeThis = this;
            var usePreNodes_arr = preNodes_arr.concat(this);

            var targetPerson = null;
            var socketComRet = null;
            var intDataValue = null;

            var myCodeBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myCodeBlock);

            var params_arr = [{ name: '操作人ID', value: 0 }, { name: '发送人ID', value: 0 }, { name: '来源流程步骤代码', value: theFlowStep.code }, { name: '加密内容', value: encrypted == true ? 1 : 0 }];

            var personVarName = this.id + '_接收人描述';
            params_arr.push({ name: '接收人描述', value: personVarName });
            if (targetType == EMessageTargetType.Person) {
                socketComRet = this.getSocketCompileValue(helper, this.targetPersonScoket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                targetPerson = socketComRet.value;
                if (!isNaN(personEduct) && personEduct != 0) {
                    // 有推算
                    myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'CP:' + " + targetPerson + " + ' " + personEduct + "'"));
                } else {
                    myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'SP:' + " + targetPerson));
                }
            } else if (targetType == EMessageTargetType.Post) {
                if (this.checkCompileFlag(IsEmptyString(targetPost) || targetPost == 0, '需要选择目标岗位', helper)) {
                    return false;
                }
                myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'CP:0 " + personEduct + "'"));
            }
            if (this.checkCompileFlag(IsEmptyString(sendType), '需要选择发送方式', helper)) {
                return false;
            }
            params_arr.push({ name: '通知发送方式代码', value: sendType });
            if (this.checkCompileFlag(IsEmptyString(msgType), '需要选择消息类型', helper)) {
                return false;
            }
            params_arr.push({ name: '工作通知种类代码', value: msgType });
            if (msgType == EMessageType.Process) {
                // 处置通知 
                if (this.checkCompileFlag(IsEmptyString(flowStep), '需要关联流程步骤', helper)) {
                    return false;
                }
                if (this.checkCompileFlag(IsEmptyString(project), '需要关联方案', helper)) {
                    return false;
                }
                socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                intDataValue = socketComRet.value;
                params_arr.push({ name: '关联方案代码', value: project });
                params_arr.push({ name: '关联步骤代码', value: flowStep });
                params_arr.push({ name: '关联步骤数据', value: intDataValue });
            }

            socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, true);
            if (socketComRet.err) {
                return false;
            }
            var titleValue = socketComRet.value == null ? singleQuotesStr('来自[' + this.bluePrint.flow.name + ']流程的通知') : socketComRet.value;
            var titleVarName = this.id + '_title';
            myCodeBlock.pushLine(makeLine_DeclareVar(titleVarName, titleValue, false));
            params_arr.push({ name: '通知标题', value: titleVarName });

            socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var contentValue = socketComRet.value;
            var copntentVarName = this.id + '_content';
            myCodeBlock.pushLine(makeLine_DeclareVar(copntentVarName, contentValue, false));
            params_arr.push({ name: '通知内容', value: copntentVarName });

            var paramVarName = this.id + 'params_arr';
            myCodeBlock.pushLine('var ' + paramVarName + '=[', 1);
            params_arr.forEach(function (param) {
                myCodeBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
            });
            myCodeBlock.subNextIndent();
            myCodeBlock.pushLine('];');

            var retVarName = this.id + 'ret';
            myCodeBlock.pushLine(makeLine_DeclareVar(retVarName, null));
            var tryBlock = new JSFile_Try('try');
            myCodeBlock.pushChild(tryBlock);
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            tryBlock.bodyBlock.pushLine(retVarName + " = yield dbhelper.asynExcute('P000E发送工作通知'," + paramVarName + ');');

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, myCodeBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return FlowNode_Send_Message;
}(JSNode_Base);

var FlowNode_Confirm_Flowstep = function (_JSNode_Base6) {
    _inherits(FlowNode_Confirm_Flowstep, _JSNode_Base6);

    function FlowNode_Confirm_Flowstep(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, FlowNode_Confirm_Flowstep);

        var _this15 = _possibleConstructorReturn(this, (FlowNode_Confirm_Flowstep.__proto__ || Object.getPrototypeOf(FlowNode_Confirm_Flowstep)).call(this, initData, parentNode, createHelper, FLOWNODE_CONFIRM_FLOWSTEP, '签阅处置通知', false, nodeJson));

        autoBind(_this15);

        if (nodeJson) {
            _this15.inputScokets_arr.forEach(function (socket) {
                switch (socket.name) {
                    case 'flowStep':
                        _this15.flowStepScoket = socket;
                        break;
                    case 'flowStepdata':
                        _this15.flowStepDataScoket = socket;
                        break;
                    case 'operator':
                        _this15.operatorScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (_this15.inputScokets_arr.length > 0) {
                _this15.outSocket = _this15.outputScokets_arr[0];
            }
        }

        if (_this15.flowStepScoket == null) {
            _this15.flowStepScoket = new NodeSocket('flowStep', _this15, true);
            _this15.addSocket(_this15.flowStepScoket);
        }
        _this15.flowStepScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'fullName',
                valueAttrName: 'code',
                options_arr: gFlowMaster.getAllSteps
            },
            hideIcon: true,
            label: '关联流程步骤'
        });

        if (_this15.flowStepDataScoket == null) {
            _this15.flowStepDataScoket = new NodeSocket('flowStepdata', _this15, true);
            _this15.addSocket(_this15.flowStepDataScoket);
        }
        _this15.flowStepDataScoket.set({
            type: ValueType.Int,
            label: '关联数据'
        });

        if (_this15.operatorScoket == null) {
            _this15.operatorScoket = new NodeSocket('operator', _this15, true);
            _this15.addSocket(_this15.operatorScoket);
        }
        _this15.operatorScoket.label = '操作人员';

        if (_this15.inFlowSocket == null) {
            _this15.inFlowSocket = new NodeFlowSocket('flow_i', _this15, true);
            _this15.addSocket(_this15.inFlowSocket);
        }
        if (_this15.outFlowSocket == null) {
            _this15.outFlowSocket = new NodeFlowSocket('flow_o', _this15, false);
            _this15.addSocket(_this15.outFlowSocket);
        }
        return _this15;
    }

    _createClass(FlowNode_Confirm_Flowstep, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(FlowNode_Confirm_Flowstep.prototype.__proto__ || Object.getPrototypeOf(FlowNode_Confirm_Flowstep.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var theFlowStep = preNodes_arr[0].step;

            var nodeThis = this;
            var usePreNodes_arr = preNodes_arr.concat(this);

            var flowStepCode = this.flowStepScoket.defval;
            if (this.checkCompileFlag(IsEmptyString(flowStepCode), '需要关联流程步骤', helper)) {
                return false;
            }
            var socketComRet = this.getSocketCompileValue(helper, this.flowStepDataScoket, usePreNodes_arr, belongBlock, true, false);
            if (socketComRet.err) {
                return false;
            }
            var flowStepData = socketComRet.value;
            socketComRet = this.getSocketCompileValue(helper, this.operatorScoket, usePreNodes_arr, belongBlock, true, false);
            if (socketComRet.err) {
                return false;
            }
            var oprator = socketComRet.value;

            var myCodeBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myCodeBlock);

            var params_arr = [{ name: '关联步骤代码', value: flowStepCode }, { name: '关联步骤数据', value: flowStepData }, { name: '操作确认用户', value: oprator }];

            var paramVarName = this.id + 'params_arr';
            myCodeBlock.pushLine('var ' + paramVarName + '=[', 1);
            params_arr.forEach(function (param) {
                myCodeBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.Int, " + param.value + "),");
            });
            myCodeBlock.subNextIndent();
            myCodeBlock.pushLine('];');

            var retVarName = this.id + 'ret';
            myCodeBlock.pushLine(makeLine_DeclareVar(retVarName, null));
            var tryBlock = new JSFile_Try('try');
            myCodeBlock.pushChild(tryBlock);
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            tryBlock.bodyBlock.pushLine(retVarName + " = yield dbhelper.asynExcute('P196E流程审批确认'," + paramVarName + ');');

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, myCodeBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return FlowNode_Confirm_Flowstep;
}(JSNode_Base);

FlowNodeClassMap[FLOWNODE_VAR_GET] = {
    modelClass: FlowNode_Var_Get,
    comClass: C_FlowNodeDef_Var_Get
};
FlowNodeClassMap[FLOWNODE_VAR_SET] = {
    modelClass: FlowNode_Var_Set,
    comClass: C_FlowNodeDef_Var_Set
};
FlowNodeClassMap[FLOWNODE_STEP_START] = {
    modelClass: FlowNode_StepStart,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[FLOWNODE_QUERY_KEYRECORD] = {
    modelClass: FlowNode_QueryKeyRecord,
    comClass: C_FlowNode_QueryKeyRecord
};
FlowNodeClassMap[FLOWNODE_QUERY_SQL] = {
    modelClass: FlowNode_QuerySql,
    comClass: C_FlowNode_Query_Sql
};
FlowNodeClassMap[FLOWNODE_CREATE_SERVERERROR] = {
    modelClass: FlowNode_Create_ServerError,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[FLOWNODE_COLUMN_VAR] = {
    modelClass: FlowNode_ColumnVar,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[FLOWNODE_SEND_MESSAGE] = {
    modelClass: FlowNode_Send_Message,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[FLOWNODE_CONFIRM_FLOWSTEP] = {
    modelClass: FlowNode_Confirm_Flowstep,
    comClass: C_Node_SimpleNode
};

FlowNodeClassMap[JSNODE_ARRAY_LENGTH] = {
    modelClass: JSNode_Array_Length,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_CONSTVALUE] = {
    modelClass: JSNode_ConstValue,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_RETURN] = {
    modelClass: JSNode_Return,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_NOPERAND] = {
    modelClass: JSNode_NOperand,
    comClass: C_SqlNode_NOperand
};
FlowNodeClassMap[JSNODE_COMPARE] = {
    modelClass: JSNode_Compare,
    comClass: C_SqlNode_Compare
};
FlowNodeClassMap[JSNODE_IF] = {
    modelClass: JSNode_IF,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_SWITCH] = {
    modelClass: JSNode_Switch,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_BREAK] = {
    modelClass: JSNode_Break,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_SEQUENCE] = {
    modelClass: JSNode_Sequence,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_BOOLEANVALUE] = {
    modelClass: JSNode_BooleanValue,
    comClass: C_Node_SimpleNode
};
FlowNodeClassMap[JSNODE_LOGICAL_OPERATOR] = {
    modelClass: JSNode_Logical_Operator,
    comClass: C_JSNode_Logical_Operator
};
FlowNodeClassMap[JSNODE_DATEFUN] = {
    modelClass: JSNode_DateFun,
    comClass: C_JSNode_DateFun
};
FlowNodeClassMap[JSNODE_TERNARY_OPERATOR] = {
    modelClass: JSNode_Ternary_Operator,
    comClass: C_Node_SimpleNode
};