'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSNODE_VAR_GET = 'var_get';
var JSNODE_VAR_SET = 'var_set';
var JSNODE_START = 'start';
var JSNODE_RETURN = 'return';
var JSNODE_CONSTVALUE = 'constvalue';
var JSNODE_NOPERAND = 'noperand';
var JSNODE_LOGICAL_OPERATOR = 'logical_operator';
var JSNODE_COMPARE = 'compare';
var JSNODE_IF = 'jsif';
var JSNODE_SWITCH = 'jsswitch';
var JSNODE_BREAK = 'jsbreak';
var JSNODE_SEQUENCE = 'sequence';
var JSNODE_CURRENTDATAROW = 'currentdatarow';
var JSNODE_CTLKERNEL = 'ctlkernel';
var JSNODE_INSERT_TABLE = 'insert_table';
var JSNODE_UPDATE_TABLE = 'update_table';
var JSNODE_CONTROL_API_PROP = 'controlapiprop';
var JSNODE_CONTROL_API_PROPSETTER = 'controlapipropsetter';
var JSNODE_DATEFUN = 'jsdatefun';
var JSNODE_ENV_VAR = 'envvar';
var JSNODE_BOOLEANVALUE = 'booleanvalue';
var JSNODE_QUERY_SQL = 'querysql';
var JSNODE_CALLONFETCHEND = 'callonfetchend';
var JSNODE_ARRAY_LENGTH = 'arraylength';
var JSNODE_CREATE_CUSERROR = 'createcuserror';
var JSNODE_FRESH_FORM = 'freshform';
var JSNODE_DO_FLOWSTEP = 'doflowstep';

var JSDEF_VAR = 'def_variable';

var JSNodeClassMap = {};

var JSNode_Base = function (_Node_Base) {
    _inherits(JSNode_Base, _Node_Base);

    function JSNode_Base(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        _classCallCheck(this, JSNode_Base);

        var _this = _possibleConstructorReturn(this, (JSNode_Base.__proto__ || Object.getPrototypeOf(JSNode_Base)).call(this, initData, parentNode, createHelper, type, label, isContainer, nodeJson));

        _this.processOutputFlowSockets = _this.processOutputFlowSockets.bind(_this);
        return _this;
    }

    _createClass(JSNode_Base, [{
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
            if (this.type == JSNODE_START) {
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

    return JSNode_Base;
}(Node_Base);

var JSDef_Variable = function (_JSNode_Base) {
    _inherits(JSDef_Variable, _JSNode_Base);

    function JSDef_Variable(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSDef_Variable);

        var _this2 = _possibleConstructorReturn(this, (JSDef_Variable.__proto__ || Object.getPrototypeOf(JSDef_Variable)).call(this, initData, parentNode, createHelper, JSDEF_VAR, '变量', false, nodeJson));

        _this2.name = ReplaceIfNull(_this2.name, 'unname');
        _this2.valType = ReplaceIfNull(_this2.valType, ValueType.Int);
        _this2.default = ReplaceIfNull(_this2.default, '');
        _this2.isParam = ReplaceIfNaN(_this2.isParam, 0);
        autoBind(_this2);
        return _this2;
    }

    _createClass(JSDef_Variable, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSDef_Variable.prototype.__proto__ || Object.getPrototypeOf(JSDef_Variable.prototype), 'requestSaveAttrs', this).call(this);
            rlt.name = this.name;
            rlt.valType = this.valType;
            rlt.isParam = this.isParam;
            rlt.default = this.default;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['name', 'valType', 'isParam', 'default']);
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
            if (data.isParam != null) {
                this.isParam = data.isParam == '参数';
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

    return JSDef_Variable;
}(JSNode_Base);

var JSNode_BluePrint = function (_EventEmitter) {
    _inherits(JSNode_BluePrint, _EventEmitter);

    function JSNode_BluePrint(initData, bluePrintJson, createHelper) {
        _classCallCheck(this, JSNode_BluePrint);

        var _this3 = _possibleConstructorReturn(this, (JSNode_BluePrint.__proto__ || Object.getPrototypeOf(JSNode_BluePrint)).call(this));

        EnhanceEventEmiter(_this3);

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
            assginObjByProperties(_this3, bluePrintJson, ['type', 'code', 'name', 'startNodeId', 'editorLeft', 'editorTop', 'group', 'ctlID']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(function (varJson) {
                    var newVar = new JSDef_Variable({}, _this3, createHelper, varJson);
                });
            }
            var newChildNodes_arr = _this3.genNodesByJsonArr(_this3, bluePrintJson.nodes_arr, createHelper);
            _this3.startNode = newChildNodes_arr.find(function (node) {
                return node.id == bluePrintJson.startNodeId;
            });
            if (_this3.startNode == null) {
                _this3.startNode = new JSNode_Start({}, _this3, createHelper);
            }
            _this3.linkPool.restorFromJson(bluePrintJson.links_arr, createHelper);
        }
        if (_this3.type == null) {
            console.error('new JSNode_BluePrint type is null');
        }
        _this3.id = _this3.code;
        if (_this3.group == null) {
            console.error('new JSNode_BluePrint group is null');
            _this3.group = 'custom';
        }

        if (_this3.startNode == null) {
            _this3.startNode = new JSNode_Start({}, _this3);
        } else {
            _this3.startNode.isConstNode = true;
        }
        createHelper.fireEvent('complete', createHelper);

        //var newVar = this.createEmptyVariable();
        //newVar.setProp({editing:false});
        return _this3;
    }

    _createClass(JSNode_BluePrint, [{
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
            var rlt = new JSDef_Variable({ name: varName, valType: ValueType.String }, this);
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
            var setting = JSNodeClassMap[nodeJson.type];
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
                code: self.id,
                startNodeId: this.startNode.id,
                name: this.name,
                type: this.type,
                group: this.group
            };
            if (this.ctlID) {
                theJson.ctlID = this.ctlID;
            }
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
            var _this5 = this;

            var ctlKernel = this.master.project.getControlById(this.ctlID);
            if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid) {
                if (ctlKernel == null) {
                    compilHelper.logManager.error('蓝图关联控件' + this.ctlID + '无法找到');
                    return false;
                }
                this.ctlKernel = ctlKernel;
            }
            var theFun = compilHelper.scope.getFunction(this.name, true);
            compilHelper.compilingFun = theFun;
            var params_arr = [];
            this.vars_arr.forEach(function (varData) {
                if (varData.isParam) {
                    params_arr.push(varData.name);
                } else {
                    theFun.scope.getVar(varData.name, true, varData.default);
                }
            });
            if (params_arr.length > 0) {
                if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                    compilHelper.logManager.error('本蓝图种类不允许出现参数');
                    return false;
                }
            }
            var ret = this.startNode.compile(compilHelper, [], theFun.bodyBlock);
            if (ret == false) {
                return false;
            }
            if (this.group == EJsBluePrintFunGroup.CtlValid) {
                params_arr = ['nowValue', 'comeState', 'comeValidErrState'];
                if (compilHelper.clientSide) {
                    compilHelper.clientSide.setCusValidCheckerBlock.pushLine("gCusValidChecker_map['" + ctlKernel.id + "'] = " + theFun.name + ";");
                }
            }
            var initValue;
            var varName;
            var usectlid;
            var useCtlData;
            var propName;
            var propApiitem;
            var needCheckVars_arr = [];
            var needCheckProps_map = {};
            var ctlStateVarName;
            var ctlParentStateVarName;
            var nullableChecker = null;
            if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid) {
                var hadCallParm = this.group == EJsBluePrintFunGroup.CtlAttr;
                if (!hadCallParm) {
                    theFun.scope.getVar(VarNames.State, true, 'store.getState()');
                }
                if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                    params_arr = [VarNames.State, VarNames.Bundle];
                }
                for (var formId in compilHelper.useForm_map) {
                    var useFormData = compilHelper.useForm_map[formId];
                    var formStateVarName = null;
                    ctlParentStateVarName = null;
                    ctlStateVarName = null;
                    if (!IsEmptyObject(useFormData.useControls_map)) {
                        formStateVarName = formId + '_state';
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                        theFun.scope.getVar(formStateVarName, true, initValue);

                        for (usectlid in useFormData.useControls_map) {
                            useCtlData = useFormData.useControls_map[usectlid];
                            ctlStateVarName = usectlid + '_state';
                            initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(usectlid), '{}');
                            theFun.scope.getVar(ctlStateVarName, true, initValue);
                            if (useCtlData.kernel.isAEditor()) {
                                ctlParentStateVarName = useCtlData.kernel.parent.id + '_state';
                                initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.parent.id), '{}');
                                theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                            }

                            for (propName in useCtlData.useprops_map) {
                                propApiitem = useCtlData.useprops_map[propName];
                                varName = usectlid + '_' + propApiitem.stateName;
                                if (hadCallParm) {
                                    initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + ctlStateVarName + '.' + propApiitem.stateName;
                                    //initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                                } else {
                                    initValue = ctlStateVarName + '.' + propApiitem.stateName;
                                    //makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                                }
                                theFun.scope.getVar(varName, true, initValue);
                                if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                                    needCheckProps_map[varName] = 1;
                                    nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null;
                                    needCheckVars_arr.push({
                                        kernel: useCtlData.kernel,
                                        nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                        visibleStateVar: ctlParentStateVarName == null ? ctlStateVarName : ctlParentStateVarName,
                                        ctlStateVar: ctlStateVarName,
                                        valueVar: varName
                                    });
                                }
                            }
                        }
                    }
                    if (!IsEmptyObject(useFormData.useColumns_map)) {
                        var nowRecordVarName = formId + '_' + VarNames.NowRecord + '';
                        if (hadCallParm) {
                            initValue = 'bundle != null && bundle.' + nowRecordVarName + ' != null ? bundle.' + nowRecordVarName + ' : ' + makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)));
                        } else {
                            initValue = makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, formStateVarName == null ? singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)) : singleQuotesStr(VarNames.NowRecord));
                        }
                        theFun.scope.getVar(nowRecordVarName, true, initValue);
                        needCheckVars_arr.push(nowRecordVarName);

                        for (var columnName in useFormData.useColumns_map) {
                            var useFormColumn = useFormData.useColumns_map[columnName];
                            if (useFormColumn.serverFuns_arr.length > 0) {
                                useFormColumn.serverFuns_arr.forEach(function (serverFun) {
                                    serverFun.bundleCheckBlock.pushLine('if(req.body.' + VarNames.Bundle + '.' + formId + '_' + columnName + "==null){return serverhelper.createErrorRet('缺少参数" + columnName + "');}");
                                });
                                compilHelper.clientInitBundleBlocks_arr.forEach(function (block) {
                                    block.pushLine(formId + '_' + columnName + ':' + formId + '_' + VarNames.NowRecord + "['" + columnName + "']" + ',');
                                });
                            }
                        }
                    }
                }
                for (usectlid in compilHelper.useGlobalControls_map) {
                    useCtlData = compilHelper.useGlobalControls_map[usectlid];
                    ctlStateVarName = usectlid + '_state';
                    if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                        initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()));
                    } else {
                        initValue = makeStr_getStateByPath('store.getState()', singleQuotesStr(useCtlData.kernel.getStatePath()));
                    }
                    theFun.scope.getVar(ctlStateVarName, true, initValue);

                    for (propName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[propName];
                        varName = usectlid + '_' + propApiitem.stateName;
                        theFun.scope.getVar(varName, true, ctlStateVarName + '.' + propApiitem.stateName);
                        if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                            needCheckProps_map[varName] = 1;
                            nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null;
                            needCheckVars_arr.push({
                                kernel: useCtlData.kernel,
                                nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                visibleStateVar: ctlStateVarName,
                                ctlStateVar: ctlStateVarName,
                                valueVar: varName
                            });
                        }
                    }
                }
            }
            var finalCallBack_bk = new FormatFileBlock('finalcallback');
            theFun.headBlock.pushChild(finalCallBack_bk);
            var needFinalCallback = false;
            if (needCheckVars_arr.length > 0) {
                var validErrVar = theFun.scope.getVar('validErr', true);
                var hadValidErrVar = theFun.scope.getVar('hadValidErr', true, 'false');
                var validErrStateVarInitval = '{}';
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    validErrStateVarInitval = 'comeValidErrState == null ? {} : comeValidErrState';
                }
                var validErrStateVar = theFun.scope.getVar('validErrState', true, validErrStateVarInitval);
                needFinalCallback = true;
                var checkVarValidStr = '';
                var validKernelBlock = new FormatFileBlock('validkernel');
                needCheckVars_arr.forEach(function (varObj) {
                    if (typeof varObj === 'string') {
                        checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varObj + ')';
                        return;
                    }
                    var valueType = 'string';
                    if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                        valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                    }
                    var infoStatePath = varObj.kernel.getStatePath('invalidInfo');
                    if (_this5.group == EJsBluePrintFunGroup.CtlValid) {
                        validKernelBlock.pushLine("if(validErrState.hasOwnProperty('" + infoStatePath + "')){validErr=validErrState['" + infoStatePath + "'];}");
                        validKernelBlock.pushLine('else{', 1);
                    }
                    validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [_this5.group == EJsBluePrintFunGroup.CtlValid ? 'comeState' : VarNames.State, varObj.visibleStateVar, varObj.ctlStateVar, varObj.valueVar, singleQuotesStr(valueType), varObj.nullable.toString(), singleQuotesStr(varObj.kernel.id), validErrStateVar.name]) + ";");
                    validKernelBlock.pushLine("validErrState['" + infoStatePath + "']=validErr;");
                    if (_this5.group == EJsBluePrintFunGroup.CtlValid) {
                        validKernelBlock.subNextIndent();
                        validKernelBlock.pushLine('}');
                    }
                    validKernelBlock.pushLine("if(validErr != null) hadValidErr = true;");
                    //checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
                });
                if (checkVarValidStr.length > 0) {
                    var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                    theFun.headBlock.pushChild(checkVarValidIf);
                    checkVarValidIf.trueBlock.pushLine("return callback_final(state, null, {info:gPreconditionInvalidInfo});");
                }
                theFun.headBlock.pushChild(validKernelBlock);
                var stateParam = 'null';
                switch (this.group) {
                    case EJsBluePrintFunGroup.CtlAttr:
                        stateParam = VarNames.State;
                        break;
                }
                theFun.headBlock.pushLine("if(hadValidErr){return callback_final(" + stateParam + ", null, {info:gPreconditionInvalidInfo});}");
            }
            if (theFun.needFetchEndCallBack) {
                // 需要callbackmain
                needFinalCallback = true;
            }
            var startFtech_bk = null;
            if (theFun.hadServerFetch) {
                needFinalCallback = true;

                theFun.headBlock.pushLine("var fetchid = Math.round(Math.random() * 999999);");
                theFun.headBlock.pushLine("fetchTracer['" + theFun.name + "'] = fetchid;");
                startFtech_bk = new FormatFileBlock('startfetch');
                theFun.headBlock.pushChild(startFtech_bk);
                theFun.startFtech_bk = startFtech_bk;
                /*
                var hadActiveCallFinal = compilHelper.compileSeq.find(node=>{return node.type == JSNODE_CALLONFETCHEND;});
                if (!hadActiveCallFinal) {
                    // 检查有没有主动调用final
                    if(this.group != EJsBluePrintFunGroup.CtlEvent){
                        compilHelper.logManager.error('蓝图有后台fetch，但没有主动callfetchend');
                        return false;
                    }
                    // CtlEvent 的蓝图自动加上callfetchend
                    if(theFun.defaultBlock == null){
                        compilHelper.logManager.error('没有设置defaultBlock');
                        return false;
                    }
                    theFun.defaultBlock.pushLine("return callback_final(state,null,null);");
                }
                */
            }
            if (needFinalCallback) {
                finalCallBack_bk.pushLine('var callback_final = (state, data, err)=>{', 1);
                var finalCallBackBody_bk = new FormatFileBlock('finalcallbackbody');
                var finalCallBackReturn_bk = new FormatFileBlock('finalcallbackreturn');
                finalCallBack_bk.pushChild(finalCallBackBody_bk);
                finalCallBack_bk.pushChild(finalCallBackReturn_bk);
                finalCallBack_bk.subNextIndent();
                finalCallBack_bk.pushLine('};');
                theFun.finalCallBackBody_bk = finalCallBackBody_bk;
                theFun.finalCallBackReturn_bk = finalCallBackReturn_bk;

                var setInvalidStateBlock = new FormatFileBlock('setvalidstate');
                finalCallBackBody_bk.pushChild(setInvalidStateBlock);
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    setInvalidStateBlock.pushLine("if(comeValidErrState == null){", 1);
                    setInvalidStateBlock.pushLine("if(comeState){setManyStateByPath(comeState, '', validErrState);}");
                    setInvalidStateBlock.pushLine("else{setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}, 50);}}");
                    //var hadValidErrIf = new JSFile_IF('hadValidErr', 'hadValidErr');
                    //setInvalidStateBlock.pushChild(hadValidErrIf);
                    //hadValidErrIf.trueBlock.pushLine("return err.info;");
                } else if (this.group == EJsBluePrintFunGroup.CtlEvent) {
                    // needMsgBox
                    var msgBoxVarName = this.id + '_msg';
                    theFun.scope.getVar(msgBoxVarName, true, 'null');
                    var ctlName = ctlKernel.getAttribute(AttrNames.Name);
                    if (startFtech_bk) {
                        startFtech_bk.pushLine(makeLine_Assign(msgBoxVarName, "PopMessageBox('',EMessageBoxType.Loading, '" + ctlName + "');"));
                    }

                    if (needCheckVars_arr.length > 0) {
                        setInvalidStateBlock.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}");
                        setInvalidStateBlock.pushLine("else{setManyStateByPath(state,'',validErrState);}");
                        setInvalidStateBlock.pushLine("if(hadValidErr){SendToast('验证失败，无法执行', EToastType.Warning);return;}");
                    }
                    setInvalidStateBlock.pushLine("if(err){", 1);
                    setInvalidStateBlock.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".setData(err.info, EMessageBoxType.Error, '" + ctlName + "');}");
                    setInvalidStateBlock.pushLine("else{SendToast(err.info, EToastType.Error);}");
                    setInvalidStateBlock.pushLine("return;", -1);
                    setInvalidStateBlock.pushLine("}");

                    finalCallBackReturn_bk.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".fireClose();}");
                    finalCallBackReturn_bk.pushLine("SendToast('执行成功');");
                } else {
                    if (needCheckVars_arr.length > 0) {
                        setInvalidStateBlock.pushLine("setManyStateByPath(" + VarNames.State + ", '', validErrState);");
                    }
                }
            }
            theFun.params_arr = params_arr;
            theFun.useForm_map = compilHelper.useForm_map;
            return theFun;
        }
    }]);

    return JSNode_BluePrint;
}(EventEmitter);

var JSNode_Var_Get = function (_JSNode_Base2) {
    _inherits(JSNode_Var_Get, _JSNode_Base2);

    function JSNode_Var_Get(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Var_Get);

        var _this6 = _possibleConstructorReturn(this, (JSNode_Var_Get.__proto__ || Object.getPrototypeOf(JSNode_Var_Get)).call(this, initData, parentNode, createHelper, JSNODE_VAR_GET, '变量-获取', false, nodeJson));

        autoBind(_this6);

        if (nodeJson) {
            if (_this6.outputScokets_arr.length > 0) {
                _this6.outSocket = _this6.outputScokets_arr[0];
            }
        }
        if (_this6.outSocket == null) {
            _this6.outSocket = new NodeSocket('out', _this6, false);
            _this6.addSocket(_this6.outSocket);
        }

        _this6.varData = _this6.bluePrint.getVariableByName(_this6.varName);
        if (_this6.varData != null) {
            _this6.varData.on('changed', _this6.varChangedHandler);
        }
        _this6.varChangedHandler();

        var self = _this6;
        return _this6;
    }

    _createClass(JSNode_Var_Get, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(JSNode_Var_Get.prototype), 'requestSaveAttrs', this).call(this);
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
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(JSNode_Var_Get.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量')) {
                return false;
            }
            var selfCompileRet = new CompileResult(this);
            helper.addUseVariable(this.varData.name, this.varData.valType, this.varData.getDefineString());
            selfCompileRet.setSocketOut(this.outSocket, this.varData.getRealName());
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Var_Get;
}(JSNode_Base);

var JSNode_Var_Set = function (_JSNode_Base3) {
    _inherits(JSNode_Var_Set, _JSNode_Base3);

    function JSNode_Var_Set(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Var_Set);

        var _this7 = _possibleConstructorReturn(this, (JSNode_Var_Set.__proto__ || Object.getPrototypeOf(JSNode_Var_Set)).call(this, initData, parentNode, createHelper, JSNODE_VAR_SET, '变量-设置', false, nodeJson));

        autoBind(_this7);

        if (nodeJson) {
            if (_this7.outputScokets_arr.length > 0) {
                _this7.outSocket = _this7.outputScokets_arr[0];
            }
            if (_this7.inputScokets_arr.length > 0) {
                _this7.inSocket = _this7.inputScokets_arr[0];
            }
        }
        if (_this7.outSocket == null) {
            _this7.outSocket = new NodeSocket('out', _this7, false);
            _this7.addSocket(_this7.outSocket);
        }
        _this7.outSocket.isSimpleVal = true;
        if (_this7.inSocket == null) {
            _this7.inSocket = new NodeSocket('in', _this7, true);
            _this7.addSocket(_this7.inSocket);
        }
        if (_this7.inFlowSocket == null) {
            _this7.inFlowSocket = new NodeFlowSocket('flow_i', _this7, true);
            _this7.addSocket(_this7.inFlowSocket);
        }
        if (_this7.outFlowSocket == null) {
            _this7.outFlowSocket = new NodeFlowSocket('flow_o', _this7, false);
            _this7.addSocket(_this7.outFlowSocket);
        }

        _this7.varData = _this7.bluePrint.getVariableByName(_this7.varName);
        if (_this7.varData != null) {
            _this7.varData.on('changed', _this7.varChangedHandler);
        }
        _this7.varChangedHandler();
        return _this7;
    }

    _createClass(JSNode_Var_Set, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Var_Set.prototype.__proto__ || Object.getPrototypeOf(JSNode_Var_Set.prototype), 'requestSaveAttrs', this).call(this);
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
            var superRet = _get(JSNode_Var_Set.prototype.__proto__ || Object.getPrototypeOf(JSNode_Var_Set.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量', helper)) {
                return false;
            }

            var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

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

    return JSNode_Var_Set;
}(JSNode_Base);

var JSNode_Start = function (_JSNode_Base4) {
    _inherits(JSNode_Start, _JSNode_Base4);

    function JSNode_Start(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Start);

        var _this8 = _possibleConstructorReturn(this, (JSNode_Start.__proto__ || Object.getPrototypeOf(JSNode_Start)).call(this, initData, parentNode, createHelper, JSNODE_START, 'START', false, nodeJson));

        autoBind(_this8);
        _this8.isConstNode = true;

        if (_this8.outFlowSocket == null) {
            _this8.outFlowSocket = new NodeFlowSocket('flow_o', _this8, false);
            _this8.addSocket(_this8.outFlowSocket);
        }

        if (_this8.bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
            if (_this8.outputScokets_arr.length > 0) {
                _this8.newValSocket = _this8.outputScokets_arr[0];
            }
            if (_this8.newValSocket == null) {
                _this8.newValSocket = new NodeSocket('newval', _this8, false, { type: ValueType.String });
                _this8.addSocket(_this8.newValSocket);
            }
            _this8.newValSocket.label = 'NowValue';
        }
        return _this8;
    }

    _createClass(JSNode_Start, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Start.prototype.__proto__ || Object.getPrototypeOf(JSNode_Start.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outFlowSocket, '', belongBlock);
            helper.setCompileRetCache(this, selfCompileRet);
            if (this.bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
                selfCompileRet.setSocketOut(this.newValSocket, 'nowValue');
            }

            var usePreNodes_arr = preNodes_arr.concat(this);
            var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
            if (flowLinks_arr.length == 0) {
                helper.logManager.warnEx([helper.logManager.createBadgeItem(this.bluePrint.name, this.bluePrint, helper.clickLogBadgeItemHandler), '是个空蓝图']);
            } else {
                flowLinks_arr[0].inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_Start;
}(JSNode_Base);

var JSNode_Return = function (_JSNode_Base5) {
    _inherits(JSNode_Return, _JSNode_Base5);

    function JSNode_Return(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Return);

        var _this9 = _possibleConstructorReturn(this, (JSNode_Return.__proto__ || Object.getPrototypeOf(JSNode_Return)).call(this, initData, parentNode, createHelper, JSNODE_RETURN, 'RETURN', false, nodeJson));

        autoBind(_this9);

        if (nodeJson) {
            if (_this9.inputScokets_arr.length > 0) {
                _this9.inSocket = _this9.inputScokets_arr[0];
            }
        }
        if (_this9.inSocket == null) {
            _this9.inSocket = new NodeSocket('in', _this9, true);
            _this9.addSocket(_this9.inSocket);
        }
        _this9.inSocket.inputable = true;
        _this9.inSocket.type = ValueType.Any;

        if (_this9.inFlowSocket == null) {
            _this9.inFlowSocket = new NodeFlowSocket('flow_i', _this9, true);
            _this9.addSocket(_this9.inFlowSocket);
        }
        return _this9;
    }

    _createClass(JSNode_Return, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Return.prototype.__proto__ || Object.getPrototypeOf(JSNode_Return.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

            var setLine = new FormatFile_Line('return ' + socketValue + ';');
            belongBlock.pushChild(setLine);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', setLine);
            helper.setCompileRetCache(this, selfCompileRet);

            return selfCompileRet;
        }
    }]);

    return JSNode_Return;
}(JSNode_Base);

var JSNode_ConstValue = function (_JSNode_Base6) {
    _inherits(JSNode_ConstValue, _JSNode_Base6);

    function JSNode_ConstValue(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_ConstValue);

        var _this10 = _possibleConstructorReturn(this, (JSNode_ConstValue.__proto__ || Object.getPrototypeOf(JSNode_ConstValue)).call(this, initData, parentNode, createHelper, JSNODE_CONSTVALUE, '常量', false, nodeJson));

        autoBind(_this10);

        if (nodeJson) {
            if (_this10.outputScokets_arr.length > 0) {
                _this10.outSocket = _this10.outputScokets_arr[0];
            }
        }
        if (_this10.outSocket == null) {
            _this10.outSocket = new NodeSocket('out', _this10, false);
            _this10.addSocket(_this10.outSocket);
        }
        _this10.outSocket.type = ValueType.String;
        _this10.outSocket.inputable = true;
        _this10.headType = 'empty';
        return _this10;
    }

    _createClass(JSNode_ConstValue, [{
        key: 'getValue',
        value: function getValue() {
            return this.outSocket.defval;
        }
    }, {
        key: 'getValueType',
        value: function getValueType() {
            return this.outSocket.type;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_ConstValue.prototype.__proto__ || Object.getPrototypeOf(JSNode_ConstValue.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var value = this.getValue();
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.checkCompileFlag(IsEmptyString(value), '无效值', helper)) {
                return false;
            }
            if (isNaN(value)) {
                value = "'" + value + "'";
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, value);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_ConstValue;
}(JSNode_Base);

var JSNode_NOperand = function (_JSNode_Base7) {
    _inherits(JSNode_NOperand, _JSNode_Base7);

    function JSNode_NOperand(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_NOperand);

        var _this11 = _possibleConstructorReturn(this, (JSNode_NOperand.__proto__ || Object.getPrototypeOf(JSNode_NOperand)).call(this, initData, parentNode, createHelper, JSNODE_NOPERAND, '四则运算', false, nodeJson));

        autoBind(_this11);

        if (nodeJson) {
            if (_this11.outputScokets_arr.length > 0) {
                _this11.outSocket = _this11.outputScokets_arr[0];
                _this11.outSocket.type = ValueType.String;
            }
        }
        if (_this11.outSocket == null) {
            _this11.outSocket = new NodeSocket('out', _this11, false, { type: ValueType.String });
            _this11.addSocket(_this11.outSocket);
        }
        _this11.outSocket.isSimpleVal = false;
        _this11.insocketInitVal = {
            type: ValueType.String
        };
        if (_this11.inputScokets_arr.length == 0) {
            _this11.addSocket(_this11.genInSocket());
            _this11.addSocket(_this11.genInSocket());
        } else {
            _this11.inputScokets_arr.forEach(function (socket) {
                socket.set(_this11.insocketInitVal);
            });
        }
        if (_this11.operator == null) {
            _this11.operator = '+';
        }
        _this11.minInSocketCount = 2;
        return _this11;
    }

    _createClass(JSNode_NOperand, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_NOperand.prototype.__proto__ || Object.getPrototypeOf(JSNode_NOperand.prototype), 'requestSaveAttrs', this).call(this);
            rlt.operator = this.operator;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['operator']);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '运算:' + this.operator;
        }
    }, {
        key: 'genInSocket',
        value: function genInSocket() {
            return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_NOperand.prototype.__proto__ || Object.getPrototypeOf(JSNode_NOperand.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            var allNumberic = true;
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var tValue = socketComRet.value;
                if (socketComRet.link) {
                    if (!socketComRet.link.outSocket.isSimpleVal) {
                        tValue = '(' + tValue + ')';
                    }
                } else {
                    if (isNaN(tValue)) {
                        allNumberic = false;
                    }
                }

                socketVal_arr.push(tValue);
            }
            if (!allNumberic) {
                // 不是所有的输入都是数值类型，把是数值类型的值转为字符值
                for (var si in socketVal_arr) {
                    if (!isNaN(socketVal_arr[si])) {
                        socketVal_arr[si] = singleQuotesStr(socketVal_arr[si]);
                    }
                }
            }
            var finalStr = '';
            socketVal_arr.forEach(function (x, i) {
                finalStr += (i == 0 ? '' : nodeThis.operator) + x;
            });
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_NOperand;
}(JSNode_Base);

var JSNode_Compare = function (_JSNode_Base8) {
    _inherits(JSNode_Compare, _JSNode_Base8);

    function JSNode_Compare(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Compare);

        var _this12 = _possibleConstructorReturn(this, (JSNode_Compare.__proto__ || Object.getPrototypeOf(JSNode_Compare)).call(this, initData, parentNode, createHelper, JSNODE_COMPARE, '比较', false, nodeJson));

        autoBind(_this12);

        if (nodeJson) {
            if (_this12.outputScokets_arr.length > 0) {
                _this12.outSocket = _this12.outputScokets_arr[0];
                _this12.outSocket.type = ValueType.Boolean;
            }
        }
        if (_this12.outSocket == null) {
            _this12.outSocket = new NodeSocket('out', _this12, false, { type: ValueType.Boolean });
            _this12.addSocket(_this12.outSocket);
        }
        _this12.outSocket.isSimpleVal = false;
        _this12.insocketInitVal = {
            type: ValueType.String
        };
        if (_this12.inputScokets_arr.length == 0) {
            _this12.addSocket(new NodeSocket('in0', _this12, true, { type: ValueType.String }));
            _this12.addSocket(new NodeSocket('in1', _this12, true, { type: ValueType.String }));
        } else {
            _this12.inputScokets_arr.forEach(function (socket) {
                socket.set(_this12.insocketInitVal);
            });
        }
        if (_this12.operator == null) {
            _this12.operator = '==';
        }
        return _this12;
    }

    _createClass(JSNode_Compare, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Compare.prototype.__proto__ || Object.getPrototypeOf(JSNode_Compare.prototype), 'requestSaveAttrs', this).call(this);
            rlt.operator = this.operator;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['operator']);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '比较:' + this.operator;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Compare.prototype.__proto__ || Object.getPrototypeOf(JSNode_Compare.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal1 = '';
            var socketVal2 = '';
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var tValue = socketComRet.value;
                if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
                    tValue = '(' + tValue + ')';
                }
                if (i == 0) {
                    socketVal1 = tValue;
                } else {
                    socketVal2 = tValue;
                }
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, socketVal1 + this.operator + socketVal2);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Compare;
}(JSNode_Base);

var JSNode_IF = function (_JSNode_Base9) {
    _inherits(JSNode_IF, _JSNode_Base9);

    function JSNode_IF(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_IF);

        var _this13 = _possibleConstructorReturn(this, (JSNode_IF.__proto__ || Object.getPrototypeOf(JSNode_IF)).call(this, initData, parentNode, createHelper, JSNODE_IF, 'IF', false, nodeJson));

        autoBind(_this13);

        if (_this13.inFlowSocket == null) {
            _this13.inFlowSocket = new NodeFlowSocket('flow_i', _this13, true);
            _this13.addSocket(_this13.inFlowSocket);
        }
        if (_this13.outFlowSocket == null) {
            _this13.outFlowSocket = new NodeFlowSocket('flow_o', _this13, false);
            _this13.addSocket(_this13.outFlowSocket);
        }

        if (_this13.inputScokets_arr.length > 0) {
            _this13.inputSocket = _this13.inputScokets_arr[0];
            _this13.inputSocket.inputable = false;
        }

        if (_this13.inputSocket == null) {
            _this13.inputSocket = new NodeSocket('in', _this13, true);
            _this13.addSocket(_this13.inputSocket);
        }
        _this13.inputSocket.label = 'flag';
        _this13.inputSocket.type = ValueType.Boolean;

        if (_this13.outFlowSockets_arr == null || _this13.outFlowSockets_arr.length == 0) {
            _this13.outFlowSockets_arr = [];
            _this13.trueFlowSocket = new NodeFlowSocket('true', _this13, false);
            _this13.falseFlowSocket = new NodeFlowSocket('false', _this13, false);
            _this13.addSocket(_this13.trueFlowSocket);
            _this13.addSocket(_this13.falseFlowSocket);
        } else {
            for (var si in _this13.outFlowSockets_arr) {
                if (_this13.outFlowSockets_arr[si].name == 'true') {
                    _this13.trueFlowSocket = _this13.outFlowSockets_arr[si];
                } else {
                    _this13.falseFlowSocket = _this13.outFlowSockets_arr[si];
                }
            }
        }
        _this13.trueFlowSocket.label = "True";
        _this13.falseFlowSocket.label = "False";
        return _this13;
    }

    _createClass(JSNode_IF, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'IF';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_IF.prototype.__proto__ || Object.getPrototypeOf(JSNode_IF.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var socketComRet = this.getSocketCompileValue(helper, this.inputSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

            var myJSBlock = new FormatFileBlock(this.id);
            var myJS = new JSFile_IF('if', socketValue);
            myJSBlock.pushChild(myJS);
            belongBlock.pushChild(myJSBlock);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            var flowLinks_arr = null;
            var flowLink = null;
            var nextNodeCompileRet = null;

            for (var fi = 0; fi < 2; ++fi) {
                var theFlowSocket = fi == 0 ? this.trueFlowSocket : this.falseFlowSocket;
                var useBlock = fi == 0 ? myJS.trueBlock : myJS.falseBlock;
                flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(theFlowSocket);
                if (flowLinks_arr.length != 0) {
                    flowLink = flowLinks_arr[0];
                    nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, useBlock);
                    if (nextNodeCompileRet == false) {
                        return false;
                    }
                }
            }

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_IF;
}(JSNode_Base);

var JSNode_Switch = function (_JSNode_Base10) {
    _inherits(JSNode_Switch, _JSNode_Base10);

    function JSNode_Switch(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Switch);

        var _this14 = _possibleConstructorReturn(this, (JSNode_Switch.__proto__ || Object.getPrototypeOf(JSNode_Switch)).call(this, initData, parentNode, createHelper, JSNODE_SWITCH, 'Switch', false, nodeJson));

        autoBind(_this14);

        if (_this14.inFlowSocket == null) {
            _this14.inFlowSocket = new NodeFlowSocket('flow_i', _this14, true);
            _this14.addSocket(_this14.inFlowSocket);
        }
        if (_this14.outFlowSocket == null) {
            _this14.outFlowSocket = new NodeFlowSocket('flow_o', _this14, false);
            _this14.addSocket(_this14.outFlowSocket);
        }
        if (_this14.inputScokets_arr.length > 0) {
            _this14.inputSocket = _this14.inputScokets_arr[0];
            _this14.inputSocket.inputable = false;
        }
        if (_this14.inputSocket == null) {
            _this14.inputSocket = new NodeSocket('in', _this14, true);
            _this14.addSocket(_this14.inputSocket);
        }
        _this14.inputSocket.label = 'target';
        _this14.inputSocket.type = ValueType.String;

        if (_this14.outFlowSockets_arr == null || _this14.outFlowSockets_arr.length == 0) {
            _this14.outFlowSockets_arr = [];
        } else {
            _this14.outFlowSockets_arr.forEach(function (item) {
                item.inputable = true;
            });
        }
        return _this14;
    }

    _createClass(JSNode_Switch, [{
        key: 'genOutFlowSocket',
        value: function genOutFlowSocket() {
            var nameI = this.outFlowSockets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('case' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeFlowSocket('case' + nameI, this, false, { inputable: true });
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Switch';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Switch.prototype.__proto__ || Object.getPrototypeOf(JSNode_Switch.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketValue = '';

            var socketComRet = this.getSocketCompileValue(helper, this.inputSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

            var myJSBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myJSBlock);
            myJSBlock.pushLine('switch(' + socketValue + '){');
            myJSBlock.addNextIndent();

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.outFlowSockets_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '必须要有case设置']);
                return false;
            }

            var flowLinks_arr = null;
            var flowLink = null;
            var nextNodeCompileRet = null;
            for (var oi in this.outFlowSockets_arr) {
                var caseFlowSocket = this.outFlowSockets_arr[oi];
                if (IsEmptyString(caseFlowSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), 'case输入不能为空']);
                    return false;
                }
                var caseStr = caseFlowSocket.defval;
                if (isNaN(caseStr)) {
                    if (caseStr != 'default') {
                        caseStr = singleQuotesStr(caseStr);
                    }
                }
                flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(caseFlowSocket);
                if (flowLinks_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), 'case 流程不能为空']);
                    return false;
                }
                flowLink = flowLinks_arr[0];
                myJSBlock.pushLine((caseStr == 'default' ? '' : 'case ') + caseStr + ':{');
                var caseBlock = new FormatFileBlock('case' + caseStr);
                myJSBlock.pushChild(caseBlock);
                myJSBlock.pushLine('}');

                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, caseBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_Switch;
}(JSNode_Base);

var JSNode_Break = function (_JSNode_Base11) {
    _inherits(JSNode_Break, _JSNode_Base11);

    function JSNode_Break(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Break);

        var _this15 = _possibleConstructorReturn(this, (JSNode_Break.__proto__ || Object.getPrototypeOf(JSNode_Break)).call(this, initData, parentNode, createHelper, JSNODE_BREAK, 'break', false, nodeJson));

        autoBind(_this15);

        if (_this15.inFlowSocket == null) {
            _this15.inFlowSocket = new NodeFlowSocket('flow_i', _this15, true);
            _this15.addSocket(_this15.inFlowSocket);
        }
        return _this15;
    }

    _createClass(JSNode_Break, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Break.prototype.__proto__ || Object.getPrototypeOf(JSNode_Break.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var setLine = new FormatFile_Line('break;');
            belongBlock.pushChild(setLine);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', setLine);
            helper.setCompileRetCache(this, selfCompileRet);

            return selfCompileRet;
        }
    }]);

    return JSNode_Break;
}(JSNode_Base);

var JSNode_Sequence = function (_JSNode_Base12) {
    _inherits(JSNode_Sequence, _JSNode_Base12);

    function JSNode_Sequence(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Sequence);

        var _this16 = _possibleConstructorReturn(this, (JSNode_Sequence.__proto__ || Object.getPrototypeOf(JSNode_Sequence)).call(this, initData, parentNode, createHelper, JSNODE_SEQUENCE, 'Sequence', false, nodeJson));

        autoBind(_this16);

        if (_this16.inFlowSocket == null) {
            _this16.inFlowSocket = new NodeFlowSocket('flow_i', _this16, true);
            _this16.addSocket(_this16.inFlowSocket);
        }

        if (_this16.outFlowSockets_arr == null || _this16.outFlowSockets_arr.length == 0) {
            _this16.outFlowSockets_arr = [];
        }
        return _this16;
    }

    _createClass(JSNode_Sequence, [{
        key: 'genOutFlowSocket',
        value: function genOutFlowSocket() {
            var nameI = this.outFlowSockets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('outflow' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeFlowSocket('outflow' + nameI, this, false);
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'Sequence';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Sequence.prototype.__proto__ || Object.getPrototypeOf(JSNode_Sequence.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var myJSBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myJSBlock);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);
            if (this.checkCompileFlag(this.outFlowSockets_arr.length == 0, '至少要有一个输出流！', helper)) {
                return false;
            }
            var flowLinks_arr = null;
            var flowLink = null;
            var nextNodeCompileRet = null;
            for (var oi in this.outFlowSockets_arr) {
                var flowSocket = this.outFlowSockets_arr[oi];
                flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(flowSocket);
                if (flowLinks_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第' + (oi + 1) + '个输出流为空']);
                    return false;
                }
                flowLink = flowLinks_arr[0];
                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, myJSBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_Sequence;
}(JSNode_Base);

var JSNode_CurrentDataRow = function (_JSNode_Base13) {
    _inherits(JSNode_CurrentDataRow, _JSNode_Base13);

    function JSNode_CurrentDataRow(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_CurrentDataRow);

        var _this17 = _possibleConstructorReturn(this, (JSNode_CurrentDataRow.__proto__ || Object.getPrototypeOf(JSNode_CurrentDataRow)).call(this, initData, parentNode, createHelper, JSNODE_CURRENTDATAROW, 'DATAROW', false, nodeJson));

        autoBind(_this17);
        _this17.addFrameButton(FrameButton_ClearEmptyOutputSocket, '清理');
        return _this17;
    }

    _createClass(JSNode_CurrentDataRow, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_CurrentDataRow.prototype.__proto__ || Object.getPrototypeOf(JSNode_CurrentDataRow.prototype), 'requestSaveAttrs', this).call(this);
            rlt.formID = this.formID;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['formID']);
        }

        /*
        getColumnType(columnName){
            var formKernel = this.bluePrint.master.project.getControlById(this.formID);
            if(formKernel == null){
                return ValueType.Unknown;
            }
            var theDS = formKernel.getAttribute(AttrNames.DataSource);
            if(theDS == null){
                return ValueType.Unknown;
            }
            var theCol = theDS.getColumnByName(columnName);
            return theCol == null ? ValueType.Unknown : theCol.cvalType;
        }
        */

    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'CurrentRow';
        }
    }, {
        key: 'genOutSocket',
        value: function genOutSocket() {
            var formKernel = this.bluePrint.master.project.getControlById(this.formID);
            if (formKernel == null) {
                return null;
            }
            var theDS = formKernel.getAttribute(AttrNames.DataSource);
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
            var theScope = belongBlock.getScope();
            var blockInServer = theScope.isServerSide;
            var superRet = _get(JSNode_CurrentDataRow.prototype.__proto__ || Object.getPrototypeOf(JSNode_CurrentDataRow.prototype), 'compile', this).call(this, helper, preNodes_arr, blockInServer);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var formKernel = this.bluePrint.master.project.getControlById(this.formID);
            if (this.checkCompileFlag(formKernel == null, this.formID + '没找到！', helper)) {
                return false;
            }
            var theDS = formKernel.getAttribute(AttrNames.DataSource);
            if (this.checkCompileFlag(theDS == null, '关联Form没有数据源！', helper)) {
                return false;
            }
            var selfCompileRet = new CompileResult(this);
            helper.setCompileRetCache(this, selfCompileRet, blockInServer);
            for (var si in this.outputScokets_arr) {
                var outSocket = this.outputScokets_arr[si];
                var colName = outSocket.getExtra('colName');
                var columnItem = theDS.columns.find(function (x) {
                    return x.name == colName;
                });
                if (columnItem == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第' + (si + 1) + '个输出接口列名无效！']);
                    return false;
                }
                helper.addUseColumn(formKernel, colName, blockInServer ? theScope.fun : null);
                if (blockInServer) {
                    selfCompileRet.setSocketOut(outSocket, 'req.body.' + VarNames.Bundle + '.' + this.formID + '_' + colName);
                } else {
                    selfCompileRet.setSocketOut(outSocket, this.formID + '_' + VarNames.NowRecord + "['" + colName + "']");
                }
            }
            return selfCompileRet;
        }
    }]);

    return JSNode_CurrentDataRow;
}(JSNode_Base);

var JSNODE_CtlKernel = function (_JSNode_Base14) {
    _inherits(JSNODE_CtlKernel, _JSNode_Base14);

    function JSNODE_CtlKernel(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNODE_CtlKernel);

        var _this18 = _possibleConstructorReturn(this, (JSNODE_CtlKernel.__proto__ || Object.getPrototypeOf(JSNODE_CtlKernel)).call(this, initData, parentNode, createHelper, JSNODE_CTLKERNEL, 'CtlKernel', false, nodeJson));

        autoBind(_this18);
        _this18.headType = 'empty';
        if (nodeJson) {
            if (_this18.outputScokets_arr.length > 0) {
                _this18.outSocket = _this18.outputScokets_arr[0];
            }
        }
        if (_this18.outSocket == null) {
            _this18.outSocket = new NodeSocket('out', _this18, false);
            _this18.outSocket.label = _this18.ctlID;
            _this18.addSocket(_this18.outSocket);
        }
        _this18.outSocket.type = SocketType_CtlKernel;
        return _this18;
    }

    _createClass(JSNODE_CtlKernel, [{
        key: 'preRenderFrame',
        value: function preRenderFrame() {
            var kernel = this.bluePrint.master.project.getControlById(this.ctlID);
            if (this.outSocket.kernel != kernel) {
                this.outSocket.label = kernel.getReadableName();
                this.outSocket.kernelType = kernel.type;
                this.outSocket.fireEvent('changed', 10);
            } else {
                this.outSocket.kernelType = null;
                this.outSocket.label = this.ctlID + '(不存在)';
            }
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNODE_CtlKernel.prototype.__proto__ || Object.getPrototypeOf(JSNODE_CtlKernel.prototype), 'requestSaveAttrs', this).call(this);
            rlt.ctlID = this.ctlID;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['ctlID']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNODE_CtlKernel.prototype.__proto__ || Object.getPrototypeOf(JSNODE_CtlKernel.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var myJSBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myJSBlock);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);
            if (this.outFlowSockets_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '至少要有一个输出流！']);
                return false;
            }
            var flowLinks_arr = null;
            var flowLink = null;
            var nextNodeCompileRet = null;
            for (var oi in this.outFlowSockets_arr) {
                var flowSocket = this.outFlowSockets_arr[oi];
                flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(flowSocket);
                if (flowLinks_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第' + (oi + 1) + '个输出流为空']);
                    return false;
                }
                flowLink = flowLinks_arr[0];
                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, myJSBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }
            return selfCompileRet;
        }
    }]);

    return JSNODE_CtlKernel;
}(JSNode_Base);

var JSNODE_Insert_table = function (_JSNode_Base15) {
    _inherits(JSNODE_Insert_table, _JSNode_Base15);

    function JSNODE_Insert_table(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNODE_Insert_table);

        var _this19 = _possibleConstructorReturn(this, (JSNODE_Insert_table.__proto__ || Object.getPrototypeOf(JSNODE_Insert_table)).call(this, initData, parentNode, createHelper, JSNODE_INSERT_TABLE, 'Insert', false, nodeJson));

        autoBind(_this19);
        _this19.onlyServerside = true;

        _this19.addFrameButton(FrameButton_LineSocket, '拉平');
        _this19.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');

        _this19.insocketDDC_setting = {
            options_arr: _this19.getUseDSColumns,
            textAttrName: 'name',
            valueAttrName: 'name'
        };

        if (_this19.inFlowSocket == null) {
            _this19.inFlowSocket = new NodeFlowSocket('flow_i', _this19, true);
            _this19.addSocket(_this19.inFlowSocket);
        }
        if (_this19.outputScokets_arr.length > 0) {
            for (var si in _this19.outputScokets_arr) {
                var socket = _this19.outputScokets_arr[si];
                if (socket.name == 'identity') {
                    _this19.identityOutSocket = socket;
                    socket.label = 'id';
                } else if (socket.name == 'err') {
                    _this19.errInfoOutSocket = socket;
                    socket.label = 'errinfo';
                }
            }
        }
        if (_this19.identityOutSocket == null) {
            _this19.identityOutSocket = new NodeSocket('identity', _this19, false, { label: 'Identity', type: ValueType.Int });
            _this19.addSocket(_this19.identityOutSocket);
        }
        if (_this19.errInfoOutSocket == null) {
            _this19.errInfoOutSocket = new NodeSocket('err', _this19, false, { label: '错误信息', type: ValueType.String });
            _this19.addSocket(_this19.errInfoOutSocket);
        }

        if (_this19.outFlowSockets_arr == null || _this19.outFlowSockets_arr.length == 0) {
            _this19.outFlowSockets_arr = [];
            _this19.sucessFlowSocket = new NodeFlowSocket('sucess', _this19, false);
            _this19.failFlowSocket = new NodeFlowSocket('fail', _this19, false);
            _this19.addSocket(_this19.sucessFlowSocket);
            _this19.addSocket(_this19.failFlowSocket);
            _this19.serverSucessFlowSocket = new NodeFlowSocket('serverSucess', _this19, false);
            _this19.serverFailFlowSocket = new NodeFlowSocket('serverFail', _this19, false);
            _this19.addSocket(_this19.serverSucessFlowSocket);
            _this19.addSocket(_this19.serverFailFlowSocket);
        } else {
            for (var si in _this19.outFlowSockets_arr) {
                switch (_this19.outFlowSockets_arr[si].name) {
                    case 'sucess':
                        _this19.sucessFlowSocket = _this19.outFlowSockets_arr[si];
                        break;
                    case 'fail':
                        _this19.failFlowSocket = _this19.outFlowSockets_arr[si];
                        break;
                    case 'serverSucess':
                        _this19.serverSucessFlowSocket = _this19.outFlowSockets_arr[si];
                        break;
                    case 'serverFail':
                        _this19.serverFailFlowSocket = _this19.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!IsEmptyString(_this19.dsCode)) {
            _this19.setDSCode(_this19.dsCode);
        }
        _this19.inputScokets_arr.forEach(function (socket) {
            socket.inputable = true;
            socket.inputDDC_setting = _this19.insocketDDC_setting;
        });
        _this19.sucessFlowSocket.label = '成功';
        _this19.failFlowSocket.label = '失败';
        _this19.serverSucessFlowSocket.label = 'server成功';
        _this19.serverFailFlowSocket.label = 'server失败';
        return _this19;
    }

    _createClass(JSNODE_Insert_table, [{
        key: 'getUseDSColumns',
        value: function getUseDSColumns() {
            var rlt = [];
            var theDS = g_dataBase.getEntityByCode(this.dsCode);
            if (theDS != null && theDS.columns != null) {
                return theDS.columns;
            }
            return rlt;
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNODE_Insert_table.prototype.__proto__ || Object.getPrototypeOf(JSNODE_Insert_table.prototype), 'requestSaveAttrs', this).call(this);
            rlt.dsCode = this.dsCode;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['dsCode']);
        }
    }, {
        key: 'inputSocketSortFun',
        value: function inputSocketSortFun(sa, sb) {
            return sa.index > sb.index;
        }
    }, {
        key: 'genInSocket',
        value: function genInSocket() {
            var theDS = g_dataBase.getEntityByCode(this.dsCode);
            if (theDS == null || theDS.columns == null) {
                return null;
            }
            var useColumn = null;
            for (var ci in theDS.columns) {
                var column = theDS.columns[ci];
                if (column.is_identity) {
                    continue;
                }
                if (this.inputScokets_arr.filter(function (socket) {
                    return socket.defval == column.name;
                }).length == 0) {
                    useColumn = column;
                    break;
                }
            }
            if (useColumn) {
                var useSocketName = null;
                var i = 0;
                while (i < 999) {
                    useSocketName = 'in_' + i;
                    if (this.inputScokets_arr.filter(function (socket) {
                        return socket.name == useSocketName;
                    }).length == 0) {
                        break;
                    }
                    i += 1;
                }
                return new NodeSocket(useSocketName, this, true, {
                    inputable: true,
                    defval: useColumn.name,
                    inputDDC_setting: this.insocketDDC_setting
                });
            }
            return null;
        }
    }, {
        key: 'dsSynedHandler',
        value: function dsSynedHandler() {
            var _this20 = this;

            return;
            var theDS = g_dataBase.getEntityByCode(this.dsCode);
            if (theDS && theDS.loaded) {
                if (theDS.columns == null) {
                    this.bluePrint.master.project.logManager.warn('数据源:' + this.dsCode + '无效');
                    return;
                }
                var hadChanged = false;
                this.inputScokets_arr.forEach(function (item) {
                    item._validcolumn = false;
                });
                var hadIdentity = false;
                theDS.columns.forEach(function (column, i) {
                    if (column.is_identity) {
                        hadIdentity = true;
                        return;
                    }
                    var theSocket = _this20.getScoketByName(column.name);
                    if (theSocket == null) {
                        _this20.addSocket(new NodeSocket(column.name, _this20, true, { type: column.cvalType, label: column.name, index: i }));
                        hadChanged = true;
                    } else {
                        theSocket._validcolumn = true;
                        theSocket.set({ label: column.name });
                        theSocket.index = i;
                        //theSocket.type = column.cvalType;
                        theSocket.fireEvent('changed', 10);
                    }
                });
                var needSort = false;
                for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                    var theSocket = this.inputScokets_arr[si];
                    if (theSocket._validcolumn == false) {
                        this.removeSocket(theSocket);
                        --si;
                        hadChanged = true;
                    } else {
                        if (!needSort) {
                            needSort = theSocket.index == si + (hadIdentity ? 1 : 0);
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
        }
    }, {
        key: 'listenDS',
        value: function listenDS(theDS) {
            if (theDS) {
                theDS.on('syned', this.dsSynedHandler);
            }
            this.listenedDS = theDS;
        }
    }, {
        key: 'unlistenDS',
        value: function unlistenDS(theDS) {
            if (theDS) {
                theDS.off('syned', this.dsSynedHandler);
            }
            this.listenedDS = null;
        }
    }, {
        key: 'setDSCode',
        value: function setDSCode(code) {
            this.dsCode = code;
            var theDS = g_dataBase.getEntityByCode(code);
            this.unlistenDS(this.listenedDS);
            this.listenDS(theDS);
            if (theDS.loaded) {
                this.dsSynedHandler();
            }
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
            if (socket.isIn) {
                return null;
            }
            var kernel = this.bluePrint.master.project.getControlById(this.ctlID);
            var type = '控件';
            var label = this.ctlID;
            if (kernel == null) {
                return React.createElement(
                    'span',
                    { 'f-canmove': 1, className: 'badge badge-danger' },
                    label,
                    '\u4E0D\u5B58\u5728'
                );
            } else {
                type = ReplaceIfNull(GetControlTypeReadableName(kernel.type), kernel.type);
            }
            return React.createElement(
                'span',
                { 'f-canmove': 1 },
                label,
                React.createElement(
                    'span',
                    { 'f-canmove': 1, className: 'badge badge-primary' },
                    type
                )
            );
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNODE_Insert_table.prototype.__proto__ || Object.getPrototypeOf(JSNODE_Insert_table.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var relKernel = this.bluePrint.ctlKernel;
            if (this.checkCompileFlag(relKernel == null || relKernel.type != ButtonKernel_Type, '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
                return false;
            }

            var useDS = g_dataBase.getEntityByCode(this.dsCode);
            if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
                return false;
            }
            if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
                return false;
            }
            var columnProfile_obj = {};
            useDS.columns.forEach(function (column) {
                if (column.is_identity) {
                    return;
                }
                column.is_nullable;
                column.cdefault;
                columnProfile_obj[column.name] = {
                    name: column.name,
                    nullable: column.is_nullable || column.cdefault != null,
                    value: null
                };
            });

            var columnProfile = null;
            // 优先使用设置的节点
            var needInsertColumns_arr = [];
            for (var si in this.inputScokets_arr) {
                var socket = this.inputScokets_arr[si];
                columnProfile = columnProfile_obj[socket.defval];
                if (this.checkCompileFlag(columnProfile == null, '第' + si + '个输入接口不是有效的列名[' + socket.defval + ']', helper)) {
                    return false;
                }
                if (this.checkCompileFlag(columnProfile.value != null, '第' + si + '个输入接口重复设置了[' + socket.defval + ']', helper)) {
                    return false;
                }
                var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                columnProfile.value = socketValue;
            }
            // 在所属Form中搜集交互类型为读写的可访问控件
            var formKernel = relKernel.searchParentKernel([M_FormKernel_Type], true);
            if (formKernel != null) {
                var accessableLabelKernels = formKernel.searchChildKernel(M_LabeledControlKernel_Type, false, true, [M_FormKernel_Type]);
                if (accessableLabelKernels != null) {
                    accessableLabelKernels.forEach(function (labelKernel) {
                        var interType = labelKernel.getAttribute(AttrNames.InteractiveType);
                        if (interType != EInterActiveType.ReadWrite) {
                            // 只要读写的
                            return;
                        }
                        var interField = labelKernel.getAttribute(AttrNames.InteractiveField);
                        columnProfile = columnProfile_obj[interField];
                        if (columnProfile == null) {
                            var textField = labelKernel.getAttribute(AttrNames.TextField);
                            columnProfile = columnProfile_obj[textField];
                        }
                        if (columnProfile == null || columnProfile.value != null) {
                            // not found or already had values
                            return;
                        }
                        var theEditor = labelKernel.editor;
                        var apiItem = null;
                        if (theEditor.hasAttribute(AttrNames.ValueField)) {
                            apiItem = gFindPropApiItem(theEditor.type, AttrNames.ValueField);
                        }
                        if (apiItem == null) {
                            apiItem = gFindPropApiItem(theEditor.type, AttrNames.TextField);
                        }
                        if (apiItem) {
                            helper.addUseControlPropApi(theEditor, apiItem);
                            columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                            columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                        }
                    });
                }
            }

            // make server side code
            var theServerSide = helper.serverSide; // ? helper.serverSide : new JSFileMaker();
            var serverClickFun = null;
            var paramInitBlock = null;
            var postCheckBlock = null;
            var insertPartVar = null;
            var valuePartVar = null;
            var insertSqlStr = '';
            var valuesStr = '';

            var sqlVarName = this.id + '_sql';
            var paramArrVarName = this.id + '_paramArr';
            var paramArrVarBlock = new FormatFileBlock('paramarr');
            var postBundleVarName = this.bluePrint.id + '_bundle';
            var serverCompleteBlock = new FormatFileBlock('complete');;
            var serverFailBlock = new FormatFileBlock('fail');
            var dataVarName = 'data_' + this.id;
            var errorVarName = 'err_' + this.id;
            var needOperator = false;

            if (theServerSide != null) {
                var serverSideActName = '_' + this.id;
                serverClickFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
                theServerSide.initProcessFun(serverClickFun);
                var paramVarName = this.id + 'params_arr';
                serverClickFun.scope.getVar(paramVarName, true, 'null');
                insertPartVar = serverClickFun.scope.getVar(this.id + '_insert', true, "''");
                valuePartVar = serverClickFun.scope.getVar(this.id + '_values', true, "''");
                serverClickFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);

                postCheckBlock = new FormatFileBlock('postCheckBlock');
                serverClickFun.bundleCheckBlock = postCheckBlock;
                serverClickFun.pushChild(postCheckBlock);
                postCheckBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
                paramInitBlock = new FormatFileBlock('initparam');
                serverClickFun.pushChild(paramInitBlock);
                paramInitBlock.pushLine(paramVarName + "=[", 1);

                serverClickFun.pushLine("var " + sqlVarName + " = " + insertPartVar.name + ' + ' + valuePartVar.name + ';');
                serverClickFun.pushLine("var " + dataVarName + " = -1;");
                serverClickFun.pushLine("try{", 1);
                serverClickFun.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select SCOPE_IDENTITY()', " + paramVarName + ");");
                serverClickFun.subNextIndent();
                serverClickFun.pushLine("}catch(" + errorVarName + "){", 1);
                serverClickFun.pushChild(serverFailBlock);
                serverClickFun.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
                serverClickFun.subNextIndent();
                serverClickFun.pushLine('}');
                serverClickFun.pushChild(serverCompleteBlock);
                serverClickFun.pushLine("return " + dataVarName + ";");
                theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
            }

            var mustHadColumns_arr = [];
            var optioniHadColumns_arr = [];
            var initBundleBlock = new FormatFileBlock('initbundle');
            for (var columnName in columnProfile_obj) {
                columnProfile = columnProfile_obj[columnName];
                if (columnProfile.value == null) {
                    switch (columnName) {
                        case '登记确认状态':
                            columnProfile.value = '1';
                            columnProfile.isStatic = true;
                            break;
                        case '登记确认时间':
                            columnProfile.value = 'getdate()';
                            columnProfile.isStatic = true;
                            break;
                        case '登记确认用户':
                            columnProfile.value = '@_operator';
                            columnProfile.isStatic = true;
                            needOperator = true;
                            break;
                        default:
                            if (this.checkCompileFlag(!columnProfile.nullable, 'Insert[' + useDS.name + ']时搜寻不到[' + columnProfile.name + ']的匹配值', helper)) {
                                return false;
                            }
                    }
                }
                if (columnProfile.value == null) {
                    continue;
                }
                if (columnProfile.nullable) {
                    optioniHadColumns_arr.push(columnProfile);
                } else {
                    mustHadColumns_arr.push(columnProfile);
                }
                if (paramInitBlock) {
                    if (columnProfile.isStatic) {
                        insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                        valuesStr += valuesStr.length == 0 ? columnProfile.value : ',' + columnProfile.value;
                    } else {
                        var postName = ReplaceIfNull(columnProfile.postName, columnProfile.name);
                        if (!columnProfile.nullable) {
                            insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                            valuesStr += (valuesStr.length == 0 ? '@' : ',@') + postName;
                            postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){return serverhelper.createErrorRet("缺少参数[' + postName + ']");}');
                        } else {
                            postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){', 1);
                            //postCheckBlock.pushLine(insertPartVar.name + "+=" + insertPartVar.name + ".length == 0 ? '[" + columnProfile.name + "]' : ',[" + columnProfile.name + "]';");
                            //postCheckBlock.pushLine(valuePartVar.name + "+=" + valuePartVar.name + ".length == 0 ? '@" + columnProfile.name + "' : ',@" + columnProfile.name + "';");
                            postCheckBlock.pushLine(insertPartVar.name + "+= ',[" + columnProfile.name + "]';");
                            postCheckBlock.pushLine(valuePartVar.name + "+= ',@" + postName + "';");
                            postCheckBlock.subNextIndent();
                            postCheckBlock.pushLine('}');
                        }
                        paramInitBlock.pushLine("dbhelper.makeSqlparam('" + postName + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + postName + "),");
                        initBundleBlock.pushLine(postName + ':' + columnProfile.value + ',');
                    }
                }
            }

            if (needOperator) {
                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }

            if (optioniHadColumns_arr.length == 0) {
                insertSqlStr += ')';
                valuesStr += ')';
            } else if (postCheckBlock) {
                postCheckBlock.pushLine(insertPartVar.name + " += ')';");
                postCheckBlock.pushLine(valuePartVar.name + " += ')';");
            }
            if (insertPartVar) {
                insertPartVar.initVal = "'insert into " + midbracketStr(useDS.name) + "(" + insertSqlStr + "'";
                valuePartVar.initVal = "'values(" + valuesStr + "'";

                paramInitBlock.subNextIndent();
                paramInitBlock.pushLine('];');
            }

            // make client
            helper.compilingFun.hadServerFetch = true;
            var myJSBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myJSBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            helper.addInitClientBundleBlock(initBundleBlock);
            myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
            helper.addInitClientBundleBlock(initBundleBlock);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myJSBlock.pushChild(callBack_bk);
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
            var fetchEndBlock = new FormatFileBlock('fetchend');
            myJSBlock.pushChild(fetchEndBlock);
            var errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
            fetchEndBlock.pushChild(errCheckIf);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('})))}, 50);');

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            selfCompileRet.setSocketOut(this.identityOutSocket, dataVarName);
            selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
            helper.setCompileRetCache(this, selfCompileRet);

            helper.compilingFun.defaultBlock = errCheckIf.trueBlock;

            var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
            if (trueFlowLinks_arr.length > 0) {
                this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock);
            } else {
                errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }

            var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
            if (falseFlowLinks_arr.length > 0) {
                this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock);
            } else {
                errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }

            var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
            if (theServerSide != null && serverTrueFlowLinks_arr.length > 0) {
                this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock);
            }

            var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
            if (theServerSide != null && serverFalseFlowLinks_arr.length > 0) {
                this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock);
            }

            //var finalStr = 'insert ' + midbracketStr(useDS.name) + '(' + insertColumnStr + ') values(' + insertValueStr + ')'
            //console.log(finalStr);
            return selfCompileRet;
        }
    }]);

    return JSNODE_Insert_table;
}(JSNode_Base);

var JSNode_Control_Api_Prop = function (_JSNode_Base16) {
    _inherits(JSNode_Control_Api_Prop, _JSNode_Base16);

    function JSNode_Control_Api_Prop(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Control_Api_Prop);

        var _this21 = _possibleConstructorReturn(this, (JSNode_Control_Api_Prop.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_Prop)).call(this, initData, parentNode, createHelper, JSNODE_CONTROL_API_PROP, 'CtlApiProp', false, nodeJson));

        autoBind(_this21);
        var apiItem = _this21.apiItem;
        var apiClass = _this21.apiClass;
        if (apiItem == null) {
            apiClass = g_controlApi_arr.find(function (e) {
                return e.ctltype == _this21.ctltype;
            });
            apiItem = apiClass.getApiItemByid(_this21.apiid);
            if (apiClass == null || apiItem == null) {
                console.error('查询控件api失败！');
            }
            _this21.apiClass = apiClass;
            _this21.apiItem = apiItem;
        }
        _this21.label = apiClass.ctllabel + '.' + apiItem.attrItem.label;
        if (nodeJson) {
            if (_this21.outputScokets_arr.length > 0) {
                _this21.outSocket = _this21.outputScokets_arr[0];
            }
            if (_this21.inputScokets_arr.length > 0) {
                _this21.inSocket = _this21.inputScokets_arr[0];
            }
        }
        if (_this21.inSocket == null) {
            _this21.inSocket = new NodeSocket('in', _this21, true);
            _this21.addSocket(_this21.inSocket);
        }
        _this21.inSocket.inputable = false;
        _this21.inSocket.type = SocketType_CtlKernel;
        _this21.inSocket.kernelType = apiClass.ctltype;

        if (_this21.outSocket == null) {
            _this21.outSocket = new NodeSocket('out', _this21, false);
            _this21.addSocket(_this21.outSocket);
        }
        _this21.outSocket.type = apiItem.attrItem.valueType;
        return _this21;
    }

    _createClass(JSNode_Control_Api_Prop, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Control_Api_Prop.prototype.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_Prop.prototype), 'requestSaveAttrs', this).call(this);
            rlt.ctltype = this.apiClass.ctltype;
            rlt.apiid = this.apiItem.id;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['ctltype', 'apiid']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Control_Api_Prop.prototype.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_Prop.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var selectedCtlid = this.inSocket.getExtra('ctlid');
            var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
            if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
                return false;
            }
            var relCtlKernel = this.bluePrint.ctlKernel;
            var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
            if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
                return false;
            }
            helper.addUseControlPropApi(selectedKernel, this.apiItem);

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, selectedKernel.id + '_' + this.apiItem.stateName);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Control_Api_Prop;
}(JSNode_Base);

var JSNode_Control_Api_PropSetter = function (_JSNode_Base17) {
    _inherits(JSNode_Control_Api_PropSetter, _JSNode_Base17);

    function JSNode_Control_Api_PropSetter(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Control_Api_PropSetter);

        var _this22 = _possibleConstructorReturn(this, (JSNode_Control_Api_PropSetter.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_PropSetter)).call(this, initData, parentNode, createHelper, JSNODE_CONTROL_API_PROPSETTER, 'CtlApiPropsetter', false, nodeJson));

        autoBind(_this22);
        var apiItem = _this22.apiItem;
        var apiClass = _this22.apiClass;
        if (apiItem == null) {
            apiClass = g_controlApi_arr.find(function (e) {
                return e.ctltype == _this22.ctltype;
            });
            apiItem = apiClass.getApiItemByid(_this22.apiid);
            if (apiClass == null || apiItem == null) {
                console.error('查询控件api失败！');
            }
            _this22.apiClass = apiClass;
            _this22.apiItem = apiItem;
        }
        if (_this22.inFlowSocket == null) {
            _this22.inFlowSocket = new NodeFlowSocket('flow_i', _this22, true);
            _this22.addSocket(_this22.inFlowSocket);
        }
        if (_this22.outFlowSocket == null) {
            _this22.outFlowSocket = new NodeFlowSocket('flow_o', _this22, false);
            _this22.addSocket(_this22.outFlowSocket);
        }
        _this22.label = 'Set:' + apiClass.ctllabel + '.' + apiItem.stateName;
        if (nodeJson) {
            if (_this22.inputScokets_arr.length > 0) {
                _this22.ctlSocket = _this22.inputScokets_arr[0];
                _this22.valueSocket = _this22.inputScokets_arr[1];
            }
        }
        if (_this22.ctlSocket == null) {
            _this22.ctlSocket = new NodeSocket('ctl', _this22, true);
            _this22.addSocket(_this22.ctlSocket);
        }
        _this22.ctlSocket.inputable = false;
        _this22.ctlSocket.type = SocketType_CtlKernel;
        _this22.ctlSocket.kernelType = apiClass.ctltype;
        if (_this22.valueSocket == null) {
            _this22.valueSocket = new NodeSocket('val', _this22, true);
            _this22.addSocket(_this22.valueSocket);
        }
        _this22.valueSocket.type = ValueType.Any;
        _this22.valueSocket.inputable = true;
        return _this22;
    }

    _createClass(JSNode_Control_Api_PropSetter, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Control_Api_PropSetter.prototype.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_PropSetter.prototype), 'requestSaveAttrs', this).call(this);
            rlt.ctltype = this.apiClass.ctltype;
            rlt.apiid = this.apiItem.id;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['ctltype', 'apiid']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Control_Api_PropSetter.prototype.__proto__ || Object.getPrototypeOf(JSNode_Control_Api_PropSetter.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var selectedCtlid = this.ctlSocket.getExtra('ctlid');
            var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
            if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
                return false;
            }
            var relCtlKernel = this.bluePrint.ctlKernel;
            var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
            if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
                return false;
            }
            var socketComRet = this.getSocketCompileValue(helper, this.valueSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var valueStr = socketComRet.value;

            var myJSBlock = new FormatFileBlock(this.id);
            myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath(" + valueStr + ",'" + selectedKernel.getStatePath(this.apiItem.stateName) + "'))");
            belongBlock.pushChild(myJSBlock);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }
            return selfCompileRet;
        }
    }]);

    return JSNode_Control_Api_PropSetter;
}(JSNode_Base);

var gJSDateFuns_arr = [{
    name: 'CastDate',
    inputs: [{ label: '', type: ValueType.String }],
    outputs: [{ label: '', type: ValueType.Date }]
}, {
    name: 'AddDay',
    inputs: [{ label: '日期', type: ValueType.Date }, { label: '偏移', type: ValueType.Int, inputable: true }],
    outputs: [{ label: '', type: ValueType.Date }]
}, {
    name: 'Format[yyyy-mm-dd]',
    inputs: [{ label: '日期', type: ValueType.Date }],
    outputs: [{ label: '', type: ValueType.String }]
}, {
    name: 'Format[hh:mm:ss]',
    inputs: [{ label: '日期', type: ValueType.Date }],
    outputs: [{ label: '', type: ValueType.String }]
}, {
    name: 'Format[hh:mm]',
    inputs: [{ label: '日期', type: ValueType.Date }],
    outputs: [{ label: '', type: ValueType.String }]
}, {
    name: 'DateDiff',
    inputs: [{ label: '间隔', type: ValueType.String, inputable: true, inputDDC_setting: { options_arr: ['秒', '分', '时', '天', '月', '年'] } }, { label: '日期A', type: ValueType.Date, inputable: true }, { label: '日期B', type: ValueType.Date, inputable: true }],
    outputs: [{ label: '', type: ValueType.Float }]
}, {
    name: 'CutTimePart',
    inputs: [{ label: '日期', type: ValueType.Date }],
    outputs: [{ label: '', type: ValueType.Date }]
}];

var JSNode_DateFun = function (_JSNode_Base18) {
    _inherits(JSNode_DateFun, _JSNode_Base18);

    function JSNode_DateFun(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_DateFun);

        var _this23 = _possibleConstructorReturn(this, (JSNode_DateFun.__proto__ || Object.getPrototypeOf(JSNode_DateFun)).call(this, initData, parentNode, createHelper, JSNODE_DATEFUN, 'datefun', false, nodeJson));

        autoBind(_this23);
        if (_this23.funName == null) {
            _this23.setFunName(gJSDateFuns_arr[1].name);
        } else {
            _this23.setFunName(_this23.funName, true);
        }
        return _this23;
    }

    _createClass(JSNode_DateFun, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_DateFun.prototype.__proto__ || Object.getPrototypeOf(JSNode_DateFun.prototype), 'requestSaveAttrs', this).call(this);
            rlt.funName = this.funName;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['funName']);
        }
    }, {
        key: 'setFunName',
        value: function setFunName(funName, force) {
            if (this.funName == funName && force != true) {
                return;
            }

            this.funName = funName;
            var funData = gJSDateFuns_arr.find(function (e) {
                return e.name == funName;
            });
            var socket_i = 0;
            for (; socket_i < funData.inputs.length; ++socket_i) {
                var socketData = funData.inputs[socket_i];
                var nowSocket = this.inputScokets_arr[socket_i];
                if (nowSocket == null) {
                    nowSocket = this.addSocket(new NodeSocket('in' + socket_i, this, true, {
                        label: socketData.label,
                        type: socketData.type,
                        inputable: socketData.inputable == true,
                        inputDDC_setting: socketData.inputDDC_setting
                    }));
                } else {
                    nowSocket.label = socketData.label;
                    nowSocket.type = socketData.type;
                    nowSocket.inputable = socketData.inputable;
                    nowSocket.inputDDC_setting = socketData.inputDDC_setting;
                    nowSocket.fireEvent('changed');
                }
            }
            while (socket_i < this.inputScokets_arr.length) {
                this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
            }
            socket_i = 0;
            for (; socket_i < funData.outputs.length; ++socket_i) {
                var socketData = funData.outputs[socket_i];
                var nowSocket = this.outputScokets_arr[socket_i];
                if (nowSocket == null) {
                    nowSocket = this.addSocket(new NodeSocket('out' + socket_i, this, false, { label: socketData.label, type: socketData.type }));
                } else {
                    nowSocket.label = socketData.label;
                    nowSocket.type = socketData.type;
                    nowSocket.fireEvent('changed');
                }
            }
            while (socket_i < this.outputScokets_arr.length) {
                this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
            }
            this.fireEvent(Event_SocketNumChanged, 20);
            this.fireMoved(10);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_DateFun.prototype.__proto__ || Object.getPrototypeOf(JSNode_DateFun.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var socketVal_arr = [];
            for (var socket_i = 0; socket_i < this.inputScokets_arr.length; ++socket_i) {
                var theSocket = this.inputScokets_arr[socket_i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                socketVal_arr.push(socketComRet.value);
            }
            var outSocket = this.outputScokets_arr[0];
            var selfCompileRet = new CompileResult(this);
            var callStr = '';
            var blockInServer = belongBlock.getScope().isServerSide;
            var funPreFix = blockInServer ? 'serverhelper.DateFun.' : '';
            switch (this.funName) {
                case 'Format[yyyy-mm-dd]':
                    callStr = funPreFix + 'getFormatDateString(' + socketVal_arr[0] + ')';
                    break;
                case 'AddDay':
                    var varName = socketVal_arr[0];
                    callStr = varName + '.setDate(' + varName + '.getDate() + ' + socketVal_arr[1] + ')';
                    break;
                case 'CastDate':
                    callStr = 'new Date(' + socketVal_arr[0] + ')';
                    break;
                case 'Format[hh:mm:ss]':
                    callStr = funPreFix + 'getFormatTimeString(' + socketVal_arr[0] + ')';
                case 'Format[hh:mm]':
                    callStr = funPreFix + 'getFormatTimeString(' + socketVal_arr[0] + ',false)';
                    break;
                case 'CutTimePart':
                    callStr = funPreFix + 'cutTimePart(' + socketVal_arr[0] + ')';
                    break;
                case 'DateDiff':
                    callStr = funPreFix + 'getDateDiff(' + socketVal_arr[0] + ',' + socketVal_arr[1] + ',' + socketVal_arr[2] + ')';
                    break;
                default:
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不支持的日期方法']);
                    return false;
            }
            selfCompileRet.setSocketOut(outSocket, callStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_DateFun;
}(JSNode_Base);

var JSNode_Env_Var = function (_JSNode_Base19) {
    _inherits(JSNode_Env_Var, _JSNode_Base19);

    function JSNode_Env_Var(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Env_Var);

        var _this24 = _possibleConstructorReturn(this, (JSNode_Env_Var.__proto__ || Object.getPrototypeOf(JSNode_Env_Var)).call(this, initData, parentNode, createHelper, JSNODE_ENV_VAR, '环境变量', false, nodeJson));

        autoBind(_this24);

        if (nodeJson) {
            if (_this24.outputScokets_arr.length > 0) {
                _this24.outSocket = _this24.outputScokets_arr[0];
            }
        }
        if (_this24.outSocket == null) {
            _this24.outSocket = new NodeSocket('out', _this24, false);
            _this24.addSocket(_this24.outSocket);
        }
        _this24.outSocket.type = SqlVarType_Scalar;
        _this24.outSocket.inputable = true;
        _this24.outSocket.inputDDC_setting = {
            options_arr: EnvVariables_arr,
            textAttrName: 'text',
            valueAttrName: 'value'
        };
        _this24.headType = 'empty';
        return _this24;
    }

    _createClass(JSNode_Env_Var, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Env_Var.prototype.__proto__ || Object.getPrototypeOf(JSNode_Env_Var.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var enName = this.outSocket.defval;
            if (this.checkCompileFlag(EnvVariable[enName] == null, '无效值', helper)) {
                return false;
            }

            var outSocket = this.outSocket;
            var selfCompileRet = new CompileResult(this);
            switch (EnvVariable[enName]) {
                case EnvVariable.userid:
                case EnvVariable.username:
                case EnvVariable.workRegionCode:
                case EnvVariable.companyCode:
                case EnvVariable.wokerTypeCode:
                case EnvVariable.departmentCode:
                case EnvVariable.systemCode:
                    selfCompileRet.setSocketOut(outSocket, 'g_envVar.' + enName);
                    break;
                case EnvVariable.nowDate:
                    selfCompileRet.setSocketOut(outSocket, 'getNowDate()');
                    break;
                case EnvVariable.nowTime:
                    selfCompileRet.setSocketOut(outSocket, 'new Date()');
                    break;
                default:
                    if (this.checkCompileFlag(true, '不支持的环境变量:' + enName, helper)) {
                        return false;
                    }
                    break;
            }

            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Env_Var;
}(JSNode_Base);

var JSNode_BooleanValue = function (_JSNode_Base20) {
    _inherits(JSNode_BooleanValue, _JSNode_Base20);

    function JSNode_BooleanValue(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_BooleanValue);

        var _this25 = _possibleConstructorReturn(this, (JSNode_BooleanValue.__proto__ || Object.getPrototypeOf(JSNode_BooleanValue)).call(this, initData, parentNode, createHelper, JSNODE_BOOLEANVALUE, '布尔值', false, nodeJson));

        autoBind(_this25);

        if (nodeJson) {
            if (_this25.outputScokets_arr.length > 0) {
                _this25.outSocket = _this25.outputScokets_arr[0];
            }
        }
        if (_this25.outSocket == null) {
            _this25.outSocket = new NodeSocket('out', _this25, false);
            _this25.addSocket(_this25.outSocket);
        }
        _this25.outSocket.type = ValueType.Boolean;
        _this25.outSocket.inputable = true;
        _this25.headType = 'empty';
        return _this25;
    }

    _createClass(JSNode_BooleanValue, [{
        key: 'getValue',
        value: function getValue() {
            return this.outSocket.defval;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_BooleanValue.prototype.__proto__ || Object.getPrototypeOf(JSNode_BooleanValue.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var value = this.getValue();
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (value == true || value == 'true') {
                value = true;
            } else {
                value = false;
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, value);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_BooleanValue;
}(JSNode_Base);

var JSNode_Query_Sql = function (_JSNode_Base21) {
    _inherits(JSNode_Query_Sql, _JSNode_Base21);

    function JSNode_Query_Sql(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Query_Sql);

        var _this26 = _possibleConstructorReturn(this, (JSNode_Query_Sql.__proto__ || Object.getPrototypeOf(JSNode_Query_Sql)).call(this, initData, parentNode, createHelper, JSNODE_QUERY_SQL, 'Query', false, nodeJson));

        _this26.isServerSide = true;
        autoBind(_this26);

        if (nodeJson) {
            if (_this26.outputScokets_arr.length > 0) {
                _this26.outDataSocket = _this26.outputScokets_arr[0];
            }
            if (_this26.outputScokets_arr.length > 1) {
                _this26.outErrorSocket = _this26.outputScokets_arr[1];
            }
        }
        if (_this26.outDataSocket == null) {
            _this26.outDataSocket = new NodeSocket('outdata', _this26, false, { type: ValueType.Any });
            _this26.addSocket(_this26.outDataSocket);
        }
        if (_this26.outErrorSocket == null) {
            _this26.outErrorSocket = new NodeSocket('outerror', _this26, false, { type: ValueType.Object });
            _this26.addSocket(_this26.outErrorSocket);
        }
        _this26.outDataSocket.label = '结果';
        _this26.outErrorSocket.label = '错误';

        if (_this26.targetEntity != null) {
            var tem_arr = _this26.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var project = createHelper.project;
                _this26.targetEntity = project.dataMaster.getDataSourceByCode(tem_arr[1]);
                if (_this26.targetEntity) {
                    _this26.targetEntity.on('syned', _this26.entitySynedHandler);
                    if (_this26.targetEntity.isCustomDS) {
                        _this26.entitySynedHandler();
                    }
                }
            } else {
                _this26.targetEntity = null;
            }
        }

        if (_this26.inFlowSocket == null) {
            _this26.inFlowSocket = new NodeFlowSocket('flow_i', _this26, true);
            _this26.addSocket(_this26.inFlowSocket);
        }
        if (_this26.outFlowSocket == null) {
            _this26.outFlowSocket = new NodeFlowSocket('flow_o', _this26, false);
            _this26.addSocket(_this26.outFlowSocket);
        }
        return _this26;
    }

    _createClass(JSNode_Query_Sql, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Query_Sql.prototype.__proto__ || Object.getPrototypeOf(JSNode_Query_Sql.prototype), 'requestSaveAttrs', this).call(this);
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
            var _this27 = this;

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
                    var theSocket = _this27.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this27.addSocket(new NodeSocket(param.name, _this27, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
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
                    entity = this.bluePrint.master.project.dataMaster.getDataSourceByCode(entity);
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
            var superRet = _get(JSNode_Query_Sql.prototype.__proto__ || Object.getPrototypeOf(JSNode_Query_Sql.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.checkCompileFlag(this.targetEntity == null, '需要选择一个数据实体', helper)) {
                return false;
            }
            if (this.checkCompileFlag(this.targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
                return false;
            }
            var params_arr = [];
            var usePreNodes_arr = preNodes_arr.concat(this);
            if (this.inputScokets_arr.length > 0) {
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var theSocket = this.inputScokets_arr[i];
                    var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                    if (socketComRet.err) {
                        return false;
                    }
                    var socketValue = socketComRet.value;
                    params_arr.push({ name: theSocket.name.replace('@', ''), value: socketValue });
                }
            }

            var targetEntity = this.targetEntity;
            // make server side code
            var isScalar = targetEntity.isScalar();
            var theServerSide = helper.serverSide; // ? helper.serverSide : new JSFileMaker();
            var postBundleVarName = this.bluePrint.id + '_bundle';
            var serverSideActName = '_query_' + targetEntity.name;
            if (theServerSide != null) {
                var queryFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
                theServerSide.initProcessFun(queryFun);
                queryFun.bundleCheckBlock = new FormatFileBlock('bundleCheck');
                queryFun.bodyBlock.pushChild(queryFun.bundleCheckBlock);
                var paramVarName = this.id + 'params_arr';
                queryFun.scope.getVar(paramVarName, true, 'null');
                queryFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
                queryFun.pushLine(paramVarName + " = null;");
                var paramListStr = '';
                if (params_arr.length > 0) {
                    queryFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
                    var paramInitBlock = new FormatFileBlock('initparam');
                    paramInitBlock.pushLine(paramVarName + "=[", 1);
                    params_arr.forEach(function (param) {
                        paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                        queryFun.bundleCheckBlock.pushLine("if(" + postBundleVarName + '.' + param.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + param.name + ']");}');
                        paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + postBundleVarName + "." + param.name + "),");
                    });
                    paramInitBlock.subNextIndent();
                    paramInitBlock.pushLine('];');
                    queryFun.pushChild(paramInitBlock);
                }
                var sqlInitValue = '';
                if (targetEntity.group == 'custom') {
                    // 定制数据源
                    if (helper.sqlBPCacheManager) {
                        sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                    } else {
                        var bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                        bpCompileHelper.clickLogBadgeItemHandler = null;
                        var compileRet = targetEntity.compile(bpCompileHelper);
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
                queryFun.scope.getVar(sqlVarName, true, doubleQuotesStr(sqlInitValue));
                var rcdRltVarName = this.id + '_rcdRlt';
                if (!isScalar) {
                    queryFun.pushLine("var " + rcdRltVarName + " = null;");
                }
                var tryBlock = new JSFile_Try('try');
                tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
                queryFun.pushChild(tryBlock);
                if (isScalar) {
                    tryBlock.bodyBlock.pushLine("return yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
                } else {
                    tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
                    queryFun.pushLine("return " + rcdRltVarName + '.recordset;');
                }
                theServerSide.processesMapVarInitVal[queryFun.name] = queryFun.name;
            }

            // makeClient
            helper.compilingFun.hadServerFetch = true;
            var myJSBlock = new FormatFileBlock(this.id);
            var initBundleBlock = new FormatFileBlock('initbundle');
            belongBlock.pushChild(myJSBlock);
            params_arr.forEach(function (param) {
                initBundleBlock.pushLine(param.name + ':' + param.value + ',');
            });

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            if (params_arr.length > 0) {
                myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
                helper.addInitClientBundleBlock(initBundleBlock);
                myJSBlock.pushChild(initBundleBlock);
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('};');
            } else {
                myJSBlock.pushLine("var " + bundleVarName + " = {};");
            }
            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myJSBlock.pushChild(callBack_bk);
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("if(fetchTracer['" + helper.compilingFun.name + "'] != fetchid) return;");
            var dataVarName = 'data_' + this.id;
            var errVarName = 'error_' + this.id;
            myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
            var fetchEndBlock = new FormatFileBlock('fetchend');
            myJSBlock.pushChild(fetchEndBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('},false)));');
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');

            helper.compilingFun.defaultBlock = fetchEndBlock;

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
            selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
            return selfCompileRet;
        }
    }]);

    return JSNode_Query_Sql;
}(JSNode_Base);

var JSNode_CallOnFetchEnd = function (_JSNode_Base22) {
    _inherits(JSNode_CallOnFetchEnd, _JSNode_Base22);

    function JSNode_CallOnFetchEnd(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_CallOnFetchEnd);

        var _this28 = _possibleConstructorReturn(this, (JSNode_CallOnFetchEnd.__proto__ || Object.getPrototypeOf(JSNode_CallOnFetchEnd)).call(this, initData, parentNode, createHelper, JSNODE_CALLONFETCHEND, 'CallOnFechEnd', false, nodeJson));

        autoBind(_this28);

        if (nodeJson) {
            if (_this28.inputScokets_arr.length > 0) {
                _this28.inDataSocket = _this28.inputScokets_arr[0];
            }
            if (_this28.inputScokets_arr.length > 1) {
                _this28.inErrorSocket = _this28.inputScokets_arr[1];
            }
        }

        if (_this28.inDataSocket == null) {
            _this28.inDataSocket = new NodeSocket('indata', _this28, true, { type: ValueType.Any });
            _this28.addSocket(_this28.inDataSocket);
        }
        if (_this28.inErrorSocket == null) {
            _this28.inErrorSocket = new NodeSocket('inerror', _this28, true, { type: ValueType.Object });
            _this28.addSocket(_this28.inErrorSocket);
        }
        _this28.inDataSocket.label = '结果';
        _this28.inErrorSocket.label = '错误';

        if (_this28.inFlowSocket == null) {
            _this28.inFlowSocket = new NodeFlowSocket('flow_i', _this28, true);
            _this28.addSocket(_this28.inFlowSocket);
        }
        return _this28;
    }

    _createClass(JSNode_CallOnFetchEnd, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_CallOnFetchEnd.prototype.__proto__ || Object.getPrototypeOf(JSNode_CallOnFetchEnd.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            helper.compilingFun.needFetchEndCallBack = true;

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketValues_arr = [];
            for (var si in this.inputScokets_arr) {
                var theSocket = this.inputScokets_arr[si];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, true);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                socketValues_arr.push(socketValue);
            }
            var dataValue = socketValues_arr[0];
            var errValue = socketValues_arr.length > 1 ? socketValues_arr[1] : null;
            if (this.checkCompileFlag(dataValue == null && errValue == null, '需要设置data、error至少一项', helper)) {
                return false;
            }

            var myJSBlock = new FormatFileBlock('ret');
            myJSBlock.pushLine("var ret = callback_final(state, " + dataValue + ", " + errValue + ");");
            myJSBlock.pushLine("return ret == null ? state : ret;");
            belongBlock.pushChild(myJSBlock);

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_CallOnFetchEnd;
}(JSNode_Base);

var JSNode_Logical_Operator = function (_SqlNode_Base) {
    _inherits(JSNode_Logical_Operator, _SqlNode_Base);

    function JSNode_Logical_Operator(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Logical_Operator);

        var _this29 = _possibleConstructorReturn(this, (JSNode_Logical_Operator.__proto__ || Object.getPrototypeOf(JSNode_Logical_Operator)).call(this, initData, parentNode, createHelper, JSNODE_LOGICAL_OPERATOR, '逻辑', false, nodeJson));

        autoBind(_this29);

        if (_this29.LogicalType == null) {
            _this29.LogicalType = Logical_Operator_and;
        }

        if (nodeJson) {
            if (_this29.outputScokets_arr.length > 0) {
                _this29.outSocket = _this29.outputScokets_arr[0];
                _this29.outSocket.type = ValueType.Boolean;
            }
        }
        if (_this29.outSocket == null) {
            _this29.outSocket = new NodeSocket('out', _this29, false, { type: ValueType.Boolean });
            _this29.addSocket(_this29.outSocket);
        }

        if (_this29.inputScokets_arr.length == 0) {
            _this29.addSocket(new NodeSocket('input1', _this29, true, { type: ValueType.String, inputable: false }));
            _this29.addSocket(new NodeSocket('input2', _this29, true, { type: ValueType.String, inputable: false }));
        } else {
            _this29.inputScokets_arr.forEach(function (socket) {
                socket.type = ValueType.String;
                socket.inputable = false;
            });
            _this29.minInSocketCount = 2;
        }
        return _this29;
    }

    _createClass(JSNode_Logical_Operator, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '逻辑:' + this.LogicalType;
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Logical_Operator.prototype.__proto__ || Object.getPrototypeOf(JSNode_Logical_Operator.prototype), 'requestSaveAttrs', this).call(this);
            rlt.LogicalType = this.LogicalType;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['LogicalType']);
        }
    }, {
        key: 'genInSocket',
        value: function genInSocket() {
            var nameI = this.inputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('in' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeSocket('in' + nameI, this, true, { type: ValueType.String, inputable: false });
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Logical_Operator.prototype.__proto__ || Object.getPrototypeOf(JSNode_Logical_Operator.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
                if (socketComRet.err) {
                    return false;
                }
                tValue = socketComRet.value;
                if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
                    tValue = '(' + tValue + ')';
                }
                socketVal_arr.push(tValue);
            }
            var finalStr = '';
            socketVal_arr.forEach(function (x, i) {
                finalStr += (i == 0 ? '' : nodeThis.LogicalType) + x;
            });

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Logical_Operator;
}(SqlNode_Base);

var JSNode_Array_Length = function (_JSNode_Base23) {
    _inherits(JSNode_Array_Length, _JSNode_Base23);

    function JSNode_Array_Length(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Array_Length);

        var _this30 = _possibleConstructorReturn(this, (JSNode_Array_Length.__proto__ || Object.getPrototypeOf(JSNode_Array_Length)).call(this, initData, parentNode, createHelper, JSNODE_ARRAY_LENGTH, 'ArrayLen', false, nodeJson));

        autoBind(_this30);

        if (nodeJson) {
            if (_this30.outputScokets_arr.length > 0) {
                _this30.outSocket = _this30.outputScokets_arr[0];
            }
            if (_this30.inputScokets_arr.length > 0) {
                _this30.inSocket = _this30.inputScokets_arr[0];
            }
        }
        if (_this30.inSocket == null) {
            _this30.inSocket = new NodeSocket('in', _this30, true);
            _this30.addSocket(_this30.inSocket);
        }
        if (_this30.outSocket == null) {
            _this30.outSocket = new NodeSocket('out', _this30, false);
            _this30.addSocket(_this30.outSocket);
        }
        _this30.inSocket.type = ValueType.Array;
        _this30.inSocket.inputable = false;
        _this30.outSocket.type = ValueType.Int;
        return _this30;
    }

    _createClass(JSNode_Array_Length, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Array_Length.prototype.__proto__ || Object.getPrototypeOf(JSNode_Array_Length.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inSocket;
            var socketValue = null;
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, socketValue + '.length');
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Array_Length;
}(JSNode_Base);

var JSNode_Create_Cuserror = function (_JSNode_Base24) {
    _inherits(JSNode_Create_Cuserror, _JSNode_Base24);

    function JSNode_Create_Cuserror(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Create_Cuserror);

        var _this31 = _possibleConstructorReturn(this, (JSNode_Create_Cuserror.__proto__ || Object.getPrototypeOf(JSNode_Create_Cuserror)).call(this, initData, parentNode, createHelper, JSNODE_CREATE_CUSERROR, '创建错误', false, nodeJson));

        autoBind(_this31);

        if (nodeJson) {
            if (_this31.outputScokets_arr.length > 0) {
                _this31.outSocket = _this31.outputScokets_arr[0];
            }
            if (_this31.inputScokets_arr.length > 0) {
                _this31.inSocket = _this31.inputScokets_arr[0];
            }
        }
        if (_this31.inSocket == null) {
            _this31.inSocket = new NodeSocket('in', _this31, true);
            _this31.addSocket(_this31.inSocket);
        }
        if (_this31.outSocket == null) {
            _this31.outSocket = new NodeSocket('out', _this31, false);
            _this31.addSocket(_this31.outSocket);
        }
        _this31.inSocket.type = ValueType.String;
        _this31.inSocket.inputable = true;
        _this31.outSocket.type = ValueType.Object;
        return _this31;
    }

    _createClass(JSNode_Create_Cuserror, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Create_Cuserror.prototype.__proto__ || Object.getPrototypeOf(JSNode_Create_Cuserror.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inSocket;
            var socketValue = null;

            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, '{info:' + socketValue + '}');
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Create_Cuserror;
}(JSNode_Base);

var JSNode_FreshForm = function (_JSNode_Base25) {
    _inherits(JSNode_FreshForm, _JSNode_Base25);

    function JSNode_FreshForm(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_FreshForm);

        var _this32 = _possibleConstructorReturn(this, (JSNode_FreshForm.__proto__ || Object.getPrototypeOf(JSNode_FreshForm)).call(this, initData, parentNode, createHelper, JSNODE_FRESH_FORM, 'FreshForm', false, nodeJson));

        autoBind(_this32);

        if (nodeJson) {
            if (_this32.inputScokets_arr.length > 0) {
                _this32.inSocket = _this32.inputScokets_arr[0];
            }
        }

        if (_this32.inSocket == null) {
            _this32.inSocket = new NodeSocket('in', _this32, true);
            _this32.addSocket(_this32.inSocket);
        }

        _this32.inSocket.inputable = false;
        _this32.inSocket.type = SocketType_CtlKernel;
        _this32.inSocket.kernelType = M_FormKernel_Type;

        if (_this32.inFlowSocket == null) {
            _this32.inFlowSocket = new NodeFlowSocket('flow_i', _this32, true);
            _this32.addSocket(_this32.inFlowSocket);
        }

        if (_this32.outFlowSocket == null) {
            _this32.outFlowSocket = new NodeFlowSocket('flow_o', _this32, false);
            _this32.addSocket(_this32.outFlowSocket);
        }
        return _this32;
    }

    _createClass(JSNode_FreshForm, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_FreshForm.prototype.__proto__ || Object.getPrototypeOf(JSNode_FreshForm.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketValue = null;
            var theSocket = this.inSocket;
            var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var selectedKernel = null;
            if (datalinks_arr.length == 0) {
                var selectedCtlid = theSocket.getExtra('ctlid');
                selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
                if (selectedKernel != null) {
                    socketValue = selectedCtlid;
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
            if (IsEmptyString(socketValue)) {
                // 探寻目标formkernel
                if (this.checkCompileFlag(this.bluePrint.ctlKernel == null, '无法定目标FORM', helper)) {
                    return false;
                }
                var formKernel = this.bluePrint.ctlKernel.searchParentKernel([M_FormKernel_Type], true);
                if (this.checkCompileFlag(formKernel == null, '无法定目标FORM', helper)) {
                    return false;
                }
                socketValue = formKernel.id;
            }
            var freshFunName = 'fresh_' + socketValue;
            var formDS = selectedKernel.getAttribute(AttrNames.DataSource);

            var myJSBlock = new FormatFileBlock('ret');
            if (formDS != null) {
                freshFunName = makeFName_pull(selectedKernel);
                myJSBlock.pushLine('setTimeout(() => {' + freshFunName + '();},50);');
            } else {
                myJSBlock.pushLine(makeStr_callFun(freshFunName, ['state']));
            }
            belongBlock.pushChild(myJSBlock);

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_FreshForm;
}(JSNode_Base);

var JSNode_Do_FlowStep = function (_JSNode_Base26) {
    _inherits(JSNode_Do_FlowStep, _JSNode_Base26);

    function JSNode_Do_FlowStep(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Do_FlowStep);

        var _this33 = _possibleConstructorReturn(this, (JSNode_Do_FlowStep.__proto__ || Object.getPrototypeOf(JSNode_Do_FlowStep)).call(this, initData, parentNode, createHelper, JSNODE_DO_FLOWSTEP, '执行流程步骤', false, nodeJson));

        autoBind(_this33);

        if (_this33.inFlowSocket == null) {
            _this33.inFlowSocket = new NodeFlowSocket('flow_i', _this33, true);
            _this33.addSocket(_this33.inFlowSocket);
        }

        if (_this33.outFlowSockets_arr == null || _this33.outFlowSockets_arr.length == 0) {
            _this33.outFlowSockets_arr = [];
            _this33.serverFlowSocket = new NodeFlowSocket('server', _this33, false);
            _this33.clientFlowSocket = new NodeFlowSocket('client', _this33, false);
            _this33.addSocket(_this33.serverFlowSocket);
            _this33.addSocket(_this33.clientFlowSocket);
        } else {
            for (var si in _this33.outFlowSockets_arr) {
                switch (_this33.outFlowSockets_arr[si].name) {
                    case 'server':
                        _this33.serverFlowSocket = _this33.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        _this33.clientFlowSocket = _this33.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        _this33.serverFlowSocket.label = 'server';
        _this33.clientFlowSocket.label = 'client';

        gFlowMaster.on('changed', _this33.flwoMasterChanged);
        _this33.fresh();
        return _this33;
    }

    _createClass(JSNode_Do_FlowStep, [{
        key: 'setFlowStep',
        value: function setFlowStep(newValue) {
            this.flowStepCode = newValue ? newValue.code : -1;
            this.fresh();
        }
    }, {
        key: 'flwoMasterChanged',
        value: function flwoMasterChanged() {
            this.fresh();
        }
    }, {
        key: 'fresh',
        value: function fresh() {
            var flowStep = gFlowMaster.findStepByCode(this.flowStepCode);
            this.flowStep = flowStep;
            var paramCount = flowStep ? flowStep.params_arr.length : 0;
            while (this.inputScokets_arr.length > paramCount) {
                this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
            }
            while (this.inputScokets_arr.length < paramCount) {
                this.addSocket(new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: ValueType.String }));
            }
            this.inputScokets_arr.forEach(function (socket, i) {
                socket.label = flowStep.params_arr[i];
                socket.fireEvent('changed');
            });
            this.fireEvent(Event_SocketNumChanged);
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNode_Do_FlowStep.prototype.__proto__ || Object.getPrototypeOf(JSNode_Do_FlowStep.prototype), 'requestSaveAttrs', this).call(this);
            rlt.flowStepCode = this.flowStepCode;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['flowStepCode']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Do_FlowStep.prototype.__proto__ || Object.getPrototypeOf(JSNode_Do_FlowStep.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            this.fresh();
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            if (this.flowStep == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要选择一个流程步骤']);
                return false;
            }

            var blockInServer = belongBlock.getScope().isServerSide;
            var params_arr = [];
            var usePreNodes_arr = preNodes_arr.concat(this);
            if (this.inputScokets_arr.length > 0) {
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var theSocket = this.inputScokets_arr[i];
                    var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                    if (socketComRet.err) {
                        return false;
                    }
                    var paramValue = socketComRet.value;
                    params_arr.push({ name: theSocket.label.replace('@', ''), value: paramValue, inBundleName: this.id + '_' + theSocket.label.replace('@', '') });
                }
            }
            var myServerBlock = new FormatFileBlock('serverblock');
            var postBundleVarName = this.bluePrint.id + '_bundle';
            var paramVarName = this.id + 'params_arr';
            var serverSideActName = '_doflowStep_' + this.flowStep.code;
            if (blockInServer) {
                // 已在serverside之中直接生成代码
                belongBlock.pushChild(myServerBlock);
            } else {
                var theServerSide = helper.serverSide;
                if (theServerSide != null) {
                    var serverSideFun = theServerSide.scope.getFunction(serverSideActName);
                    if (serverSideFun == null) {
                        serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
                        theServerSide.initProcessFun(serverSideFun);
                        serverSideFun.scope.getVar(paramVarName, true, 'null');
                        serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
                        theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
                        serverSideFun.bundleCheckBlock = new FormatFileBlock('bundleCheck');
                        serverSideFun.pushChild(serverSideFun.bundleCheckBlock);
                    }
                    serverSideFun.pushChild(myServerBlock);
                }
            }
            if (params_arr.length > 0) {
                if (!blockInServer) {
                    myServerBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
                    params_arr.forEach(function (param) {
                        myServerBlock.pushLine("if(" + postBundleVarName + '.' + param.inBundleName + "==null){return serverhelper.createErrorRet('缺少参数" + param.name + "');}");
                    });
                }
            }
            myServerBlock.pushLine(paramVarName + '=[', 1);
            params_arr.forEach(function (param, i) {
                if (blockInServer) {
                    myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (i + 1) + "', sqlTypes.NVarChar(4000), " + param.value + "),");
                } else {
                    myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (i + 1) + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + param.inBundleName + "),");
                }
            });
            /*
            for(var pi=params_arr.length; pi <3; ++pi){
                myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (pi+1) + "', sqlTypes.NVarChar, null),");
            }
            */
            myServerBlock.pushLine("dbhelper.makeSqlparam('流程操作步骤代码', sqlTypes.Int, " + this.flowStep.code + "),");
            myServerBlock.pushLine("dbhelper.makeSqlparam('提交用户', sqlTypes.Int, req.session.g_envVar.userid),");
            myServerBlock.pushLine('];', -1);
            var rcdVarName = this.id + 'rcd';
            myServerBlock.pushLine('var ' + rcdVarName + ';');
            var tryBlock = new JSFile_Try('try');
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            myServerBlock.pushChild(tryBlock);
            tryBlock.bodyBlock.pushLine(rcdVarName + " = yield dbhelper.asynExcute('P007E申请执行步骤'," + paramVarName + ',[dbhelper.makeSqlparam("执行记录代码", sqlTypes.Int)]);');

            var myClientBlock = new FormatFileBlock('client');
            var fetchEndBlock = null;

            var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
            var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
            if (blockInServer) {
                if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                    return false;
                }
            } else {
                helper.compilingFun.hadServerFetch = true;
                var initBundleBlock = new FormatFileBlock('initbundle');
                belongBlock.pushChild(myClientBlock);
                params_arr.forEach(function (param) {
                    initBundleBlock.pushLine(param.inBundleName + ':' + param.value + ',');
                });

                var bundleVarName = VarNames.Bundle + '_' + this.id;
                if (params_arr.length > 0) {
                    myClientBlock.pushLine("var " + bundleVarName + " = {", 1);
                    helper.addInitClientBundleBlock(initBundleBlock);
                    myClientBlock.pushChild(initBundleBlock);
                    myClientBlock.subNextIndent();
                    myClientBlock.pushLine('};');
                } else {
                    myClientBlock.pushLine("var " + bundleVarName + " = {};");
                }
                var callBack_bk = new FormatFileBlock('callback' + this.id);
                myClientBlock.pushChild(callBack_bk);
                myClientBlock.pushLine('setTimeout(() => {', 1);
                myClientBlock.pushLine("if(fetchTracer['" + helper.compilingFun.name + "'] != fetchid) return;");
                var dataVarName = 'data_' + this.id;
                var errVarName = 'error_' + this.id;
                myClientBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
                fetchEndBlock = new FormatFileBlock('fetchend');
                myClientBlock.pushChild(fetchEndBlock);
                myClientBlock.subNextIndent();
                myClientBlock.pushLine('},false)));');
                myClientBlock.subNextIndent();
                myClientBlock.pushLine('}, 50);');
            }

            var selfCompileRet = new CompileResult(this);
            helper.setCompileRetCache(this, selfCompileRet);

            if (blockInServer) {
                selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
                if (serverFlow_links.length > 0) {
                    this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock);
                }
            } else {
                selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
                if (clientFlow_links.length > 0) {
                    this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock);
                } else {
                    fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
                }
                if (serverFlow_links.length > 0) {
                    this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock);
                }
            }
            return selfCompileRet;
        }
    }]);

    return JSNode_Do_FlowStep;
}(JSNode_Base);

var JSNODE_Update_table = function (_JSNode_Base27) {
    _inherits(JSNODE_Update_table, _JSNode_Base27);

    function JSNODE_Update_table(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNODE_Update_table);

        var _this34 = _possibleConstructorReturn(this, (JSNODE_Update_table.__proto__ || Object.getPrototypeOf(JSNODE_Update_table)).call(this, initData, parentNode, createHelper, JSNODE_UPDATE_TABLE, 'Update', false, nodeJson));

        autoBind(_this34);
        _this34.onlyServerside = true;

        _this34.addFrameButton(FrameButton_LineSocket, '拉平');
        _this34.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');

        _this34.insocketDDC_setting = {
            options_arr: _this34.getUseDSColumns,
            textAttrName: 'name',
            valueAttrName: 'name'
        };

        if (_this34.inFlowSocket == null) {
            _this34.inFlowSocket = new NodeFlowSocket('flow_i', _this34, true);
            _this34.addSocket(_this34.inFlowSocket);
        }
        if (_this34.outputScokets_arr.length > 0) {
            _this34.rowCountOutSocket = _this34.outputScokets_arr[0];
        }
        if (_this34.rowCountOutSocket == null) {
            _this34.rowCountOutSocket = new NodeSocket('rowcount', _this34, false, { label: '行数', type: ValueType.Int });
            _this34.addSocket(_this34.rowCountOutSocket);
        }
        _this34.rowCountOutSocket.label = '行数';

        var si;
        if (_this34.inputScokets_arr.length > 0) {
            for (si in _this34.inputScokets_arr) {
                if (_this34.inputScokets_arr[si].name == 'key') {
                    _this34.keySocket = _this34.inputScokets_arr[si];
                }
            }
        }
        if (_this34.keySocket == null) {
            _this34.keySocket = new NodeSocket('key', _this34, true, { type: ValueType.Int });
            _this34.addSocket(_this34.keySocket);
        }
        _this34.keySocket.label = 'KEY';
        _this34.keySocket.inputable = false;

        if (_this34.outFlowSockets_arr == null || _this34.outFlowSockets_arr.length == 0) {
            _this34.outFlowSockets_arr = [];
            _this34.sucessFlowSocket = new NodeFlowSocket('sucess', _this34, false);
            _this34.failFlowSocket = new NodeFlowSocket('fail', _this34, false);
            _this34.addSocket(_this34.sucessFlowSocket);
            _this34.addSocket(_this34.failFlowSocket);
            _this34.serverSucessFlowSocket = new NodeFlowSocket('serverSucess', _this34, false);
            _this34.serverFailFlowSocket = new NodeFlowSocket('serverFail', _this34, false);
            _this34.addSocket(_this34.serverSucessFlowSocket);
            _this34.addSocket(_this34.serverFailFlowSocket);
        } else {
            for (var si in _this34.outFlowSockets_arr) {
                switch (_this34.outFlowSockets_arr[si].name) {
                    case 'sucess':
                        _this34.sucessFlowSocket = _this34.outFlowSockets_arr[si];
                        break;
                    case 'fail':
                        _this34.failFlowSocket = _this34.outFlowSockets_arr[si];
                        break;
                    case 'serverSucess':
                        _this34.serverSucessFlowSocket = _this34.outFlowSockets_arr[si];
                        break;
                    case 'serverFail':
                        _this34.serverFailFlowSocket = _this34.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!IsEmptyString(_this34.dsCode)) {
            _this34.setDSCode(_this34.dsCode);
        } else {
            _this34.dsCode = 0;
        }
        _this34.inputScokets_arr.forEach(function (socket) {
            if (socket != _this34.keySocket) {
                socket.inputable = true;
                socket.inputDDC_setting = _this34.insocketDDC_setting;
                socket.autoHideInput = false;
            }
        });
        _this34.sucessFlowSocket.label = '成功';
        _this34.failFlowSocket.label = '失败';
        _this34.serverSucessFlowSocket.label = 'server成功';
        _this34.serverFailFlowSocket.label = 'server失败';
        return _this34;
    }

    _createClass(JSNODE_Update_table, [{
        key: 'preRemoveSocket',
        value: function preRemoveSocket(socket) {
            return socket != this.keySocket;
        }
    }, {
        key: 'getUseDSColumns',
        value: function getUseDSColumns() {
            var rlt = [];
            var theDS = g_dataBase.getEntityByCode(this.dsCode);
            if (theDS != null && theDS.columns != null) {
                return theDS.columns;
            }
            return rlt;
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(JSNODE_Update_table.prototype.__proto__ || Object.getPrototypeOf(JSNODE_Update_table.prototype), 'requestSaveAttrs', this).call(this);
            rlt.dsCode = this.dsCode;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['dsCode']);
        }
    }, {
        key: 'inputSocketSortFun',
        value: function inputSocketSortFun(sa, sb) {
            return sa.index > sb.index;
        }
    }, {
        key: 'genInSocket',
        value: function genInSocket() {
            var theDS = g_dataBase.getEntityByCode(this.dsCode);
            if (theDS == null || theDS.columns == null) {
                return null;
            }
            var useColumn = null;
            for (var ci in theDS.columns) {
                var column = theDS.columns[ci];
                if (column.is_identity) {
                    continue;
                }
                if (this.inputScokets_arr.filter(function (socket) {
                    return socket.defval == column.name;
                }).length == 0) {
                    useColumn = column;
                    break;
                }
            }
            if (useColumn) {
                var useSocketName = null;
                var i = 0;
                while (i < 999) {
                    useSocketName = 'in_' + i;
                    if (this.inputScokets_arr.filter(function (socket) {
                        return socket.name == useSocketName;
                    }).length == 0) {
                        break;
                    }
                    i += 1;
                }
                return new NodeSocket(useSocketName, this, true, {
                    inputable: true,
                    defval: useColumn.name,
                    autoHideInput: false,
                    inputDDC_setting: this.insocketDDC_setting
                });
            }
            return null;
        }
    }, {
        key: 'dsSynedHandler',
        value: function dsSynedHandler() {}
    }, {
        key: 'listenDS',
        value: function listenDS(theDS) {
            if (theDS) {
                theDS.on('syned', this.dsSynedHandler);
            }
            this.listenedDS = theDS;
        }
    }, {
        key: 'unlistenDS',
        value: function unlistenDS(theDS) {
            if (theDS) {
                theDS.off('syned', this.dsSynedHandler);
            }
            this.listenedDS = null;
        }
    }, {
        key: 'setDSCode',
        value: function setDSCode(code) {
            this.dsCode = code;
            var theDS = g_dataBase.getEntityByCode(code);
            this.unlistenDS(this.listenedDS);
            this.listenDS(theDS);
            if (theDS.loaded) {
                this.dsSynedHandler();
            }
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNODE_Update_table.prototype.__proto__ || Object.getPrototypeOf(JSNODE_Update_table.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var relKernel = this.bluePrint.ctlKernel;
            if (this.checkCompileFlag(relKernel == null || relKernel.type != ButtonKernel_Type, '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
                return false;
            }

            var useDS = g_dataBase.getEntityByCode(this.dsCode);
            if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
                return false;
            }
            if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
                return false;
            }
            var columnProfile_obj = {};
            var identityColumn = null;
            useDS.columns.forEach(function (column) {
                if (column.is_identity) {
                    identityColumn = column;
                    return;
                }
                columnProfile_obj[column.name] = {
                    name: column.name,
                    nullable: column.is_nullable,
                    value: null
                };
            });

            if (this.checkCompileFlag(identityColumn == null, useDS + '没有标识列!', helper)) {
                return false;
            }

            var columnProfile = null;
            // 优先使用设置的节点
            var needUpdateColumns_arr = [];
            var identityColumnValue = '';
            var socketComRet;
            var socketValue;

            for (var si in this.inputScokets_arr) {
                var socket = this.inputScokets_arr[si];
                if (socket == this.keySocket) {
                    // 标识字段的设置
                    continue;
                }

                columnProfile = columnProfile_obj[socket.defval];
                if (this.checkCompileFlag(columnProfile == null, '第' + si + '个输入接口不是有效的列名[' + socket.defval + ']', helper)) {
                    return false;
                }
                if (this.checkCompileFlag(columnProfile.value != null, '第' + si + '个输入接口重复设置了[' + socket.defval + ']', helper)) {
                    return false;
                }
                socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                socketValue = socketComRet.value;
                columnProfile.value = socketValue;
            }
            // 在所属Form中搜集交互类型为读写的可访问控件
            var formKernel = relKernel.searchParentKernel([M_FormKernel_Type], true);
            if (formKernel != null) {
                var accessableLabelKernels = formKernel.searchChildKernel(M_LabeledControlKernel_Type, false, true, [M_FormKernel_Type]);
                if (accessableLabelKernels != null) {
                    accessableLabelKernels.forEach(function (labelKernel) {
                        var interType = labelKernel.getAttribute(AttrNames.InteractiveType);
                        if (interType != EInterActiveType.ReadWrite) {
                            // 只要读写的
                            return;
                        }
                        var interField = labelKernel.getAttribute(AttrNames.InteractiveField);
                        columnProfile = columnProfile_obj[interField];
                        if (columnProfile == null) {
                            var textField = labelKernel.getAttribute(AttrNames.TextField);
                            columnProfile = columnProfile_obj[textField];
                        }
                        if (columnProfile == null || columnProfile.value != null) {
                            // not found or already had values
                            return;
                        }
                        var theEditor = labelKernel.editor;
                        var apiItem = null;
                        if (theEditor.hasAttribute(AttrNames.ValueField)) {
                            apiItem = gFindPropApiItem(theEditor.type, AttrNames.ValueField);
                        }
                        if (apiItem == null) {
                            apiItem = gFindPropApiItem(theEditor.type, AttrNames.TextField);
                        }
                        if (apiItem) {
                            helper.addUseControlPropApi(theEditor, apiItem);
                            columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                            columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                        }
                    });
                }
            }

            // make server side code
            var theServerSide = helper.serverSide; // ? helper.serverSide : new JSFileMaker();
            var serverClickFun = null;

            var sqlVarName = this.id + '_sql';
            var paramArrVarName = this.id + '_paramArr';
            var paramArrVarBlock = new FormatFileBlock('paramarr');
            var serverCompleteBlock = new FormatFileBlock('complete');;
            var serverFailBlock = new FormatFileBlock('fail');
            var dataVarName = 'data_' + this.id;
            var errorVarName = 'err_' + this.id;
            var postBundleVarName = this.bluePrint.id + '_bundle';
            var paramInitBlock = new FormatFileBlock('initparam');
            var postCheckBlock = new FormatFileBlock('postCheckBlock');
            var initBundleBlock = new FormatFileBlock('initbundle');

            var belongBlockScope = belongBlock.getScope();
            var serverScope = theServerSide ? theServerSide.scope : null;
            var blockInServer = belongBlockScope.isServerSide;

            var serverSideActName = '_' + this.id;
            var paramVarName = this.id + 'params_arr';
            var myServerBlock = new FormatFileBlock('serverblock');

            if (blockInServer) {
                // 已在serverside之中直接生成代码
                belongBlock.pushChild(myServerBlock);
                serverClickFun = belongBlockScope.fun;
            } else {
                var temServerSide = theServerSide;
                if (temServerSide == null) {
                    temServerSide = new CP_ServerSide({});
                }
                if (serverScope == null) {
                    serverScope = temServerSide.scope;
                }
                serverClickFun = serverScope.getFunction(serverSideActName, true, ['req', 'res']);
                temServerSide.initProcessFun(serverClickFun);
                if (theServerSide == null) {
                    helper.appendOutputItem(serverClickFun);
                }
                serverClickFun.scope.getVar(paramVarName, true, 'null');
                serverClickFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
                serverClickFun.pushChild(myServerBlock);
                serverClickFun.bundleCheckBlock = postCheckBlock;
            }

            var updatePartVar = serverClickFun.scope.getVar(this.id + '_update', true, "''");
            var updateSqlVar = serverClickFun.scope.getVar(this.id + '_sql', true, "''");

            myServerBlock.pushChild(postCheckBlock);
            postCheckBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            myServerBlock.pushChild(paramInitBlock);
            paramInitBlock.pushLine(paramVarName + "=[", 1);

            socketComRet = this.getSocketCompileValue(helper, this.keySocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.RCDKEY)){return serverhelper.createErrorRet("缺少参数[RCDKEY]");}');
            paramInitBlock.pushLine("dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, " + postBundleVarName + '.RCDKEY),');
            initBundleBlock.pushLine('RCDKEY:' + socketComRet.value + ',');

            myServerBlock.pushLine("var " + dataVarName + " = -1;");
            myServerBlock.pushLine("try{", 1);
            myServerBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + updateSqlVar.name + " + ' select @@ROWCOUNT', " + paramVarName + ");");
            myServerBlock.subNextIndent();
            myServerBlock.pushLine("}catch(" + errorVarName + "){", 1);
            myServerBlock.pushChild(serverFailBlock);
            myServerBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
            myServerBlock.subNextIndent();
            myServerBlock.pushLine('}');
            myServerBlock.pushChild(serverCompleteBlock);
            myServerBlock.pushLine("return " + dataVarName + ";");

            if (theServerSide) {
                theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
            }

            var updateSqlInitStr = '';
            var needOperator = false;
            for (var columnName in columnProfile_obj) {
                columnProfile = columnProfile_obj[columnName];
                if (columnProfile.value != null) {
                    if (columnProfile.isStatic) {
                        updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=' + columnProfile.value;
                    } else {
                        var postName = ReplaceIfNull(columnProfile.postName, columnProfile.name);
                        if (!columnProfile.nullable) {
                            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=@' + postName;
                            postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){return serverhelper.createErrorRet("缺少参数[' + postName + ']");}');
                        } else {
                            postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){', 1);
                            postCheckBlock.pushLine(updatePartVar.name + "+= (" + updatePartVar.name + ".length==0 ? '' : ',') + '[" + columnProfile.name + "]=@" + postName + "';");
                            postCheckBlock.subNextIndent();
                            postCheckBlock.pushLine('}');
                        }
                        paramInitBlock.pushLine("dbhelper.makeSqlparam('" + postName + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + postName + "),");
                        initBundleBlock.pushLine(postName + ':' + columnProfile.value + ',');
                    }
                    var keyPos = columnName.indexOf('确认状态');
                    if (keyPos != -1) {
                        var prefix = columnName.substring(0, keyPos);
                        var tempColumnProfile = columnProfile_obj[prefix + '确认时间'];
                        if (tempColumnProfile != null) {
                            if (tempColumnProfile.value == null) {
                                updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '确认时间') + '=getdate()';
                            }
                        }
                        tempColumnProfile = columnProfile_obj[prefix + '确认用户'];
                        if (tempColumnProfile != null) {
                            if (tempColumnProfile.value == null) {
                                needOperator = true;
                                updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '确认用户') + '=@_operator';
                            }
                        }
                    }
                }
            }
            if (needOperator) {
                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }

            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
            postCheckBlock.pushLine(updateSqlVar.name + ' = "update ' + useDS.name + ' set " + ' + updatePartVar.name + ' + " where [' + identityColumn.name + ']=@RCDKEY";');
            updatePartVar.initVal = singleQuotesStr(updateSqlInitStr);

            var myJSBlock = new FormatFileBlock(this.id);
            var errCheckIf = null;
            helper.compilingFun.hadServerFetch = true;
            if (!blockInServer) {
                // make client
                belongBlock.pushChild(myJSBlock);
                var bundleVarName = VarNames.Bundle + '_' + this.id;
                myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
                helper.addInitClientBundleBlock(initBundleBlock);
                myJSBlock.pushChild(initBundleBlock);
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('};');
                var callBack_bk = new FormatFileBlock('callback' + this.id);
                myJSBlock.pushChild(callBack_bk);
                myJSBlock.pushLine('setTimeout(() => {', 1);
                myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
                var fetchEndBlock = new FormatFileBlock('fetchend');
                myJSBlock.pushChild(fetchEndBlock);
                errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
                fetchEndBlock.pushChild(errCheckIf);
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('})))}, 50);');
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', blockInServer ? myServerBlock : myJSBlock);
            selfCompileRet.setSocketOut(this.rowCountOutSocket, dataVarName);
            helper.setCompileRetCache(this, selfCompileRet);

            var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
            if (trueFlowLinks_arr.length > 0) {
                if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                    return false;
                }
                this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock);
            } else {
                if (errCheckIf) {
                    errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
                }
            }

            var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
            if (falseFlowLinks_arr.length > 0) {
                if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端失败出口无效', helper)) {
                    return false;
                }
                this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock);
            } else {
                if (errCheckIf) {
                    errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
                }
            }

            var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
            if (serverTrueFlowLinks_arr.length > 0) {
                this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock);
            }

            var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
            if (serverFalseFlowLinks_arr.length > 0) {
                this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock);
            }
            return selfCompileRet;
        }
    }]);

    return JSNODE_Update_table;
}(JSNode_Base);

JSNodeClassMap[JSNODE_VAR_GET] = {
    modelClass: JSNode_Var_Get,
    comClass: C_JSNode_Var_Get
};
JSNodeClassMap[JSNODE_VAR_SET] = {
    modelClass: JSNode_Var_Set,
    comClass: C_JSNode_Var_Set
};
JSNodeClassMap[JSNODE_START] = {
    modelClass: JSNode_Start,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_CONSTVALUE] = {
    modelClass: JSNode_ConstValue,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_RETURN] = {
    modelClass: JSNode_Return,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_NOPERAND] = {
    modelClass: JSNode_NOperand,
    comClass: C_SqlNode_NOperand
};
JSNodeClassMap[JSNODE_COMPARE] = {
    modelClass: JSNode_Compare,
    comClass: C_SqlNode_Compare
};
JSNodeClassMap[JSNODE_IF] = {
    modelClass: JSNode_IF,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_SWITCH] = {
    modelClass: JSNode_Switch,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_BREAK] = {
    modelClass: JSNode_Break,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_SEQUENCE] = {
    modelClass: JSNode_Sequence,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_CURRENTDATAROW] = {
    modelClass: JSNode_CurrentDataRow,
    comClass: C_JSNode_CurrentDataRow
};
JSNodeClassMap[JSNODE_CTLKERNEL] = {
    modelClass: JSNODE_CtlKernel,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_INSERT_TABLE] = {
    modelClass: JSNODE_Insert_table,
    comClass: C_JSNODE_Insert_table
};
JSNodeClassMap[JSNODE_UPDATE_TABLE] = {
    modelClass: JSNODE_Update_table,
    comClass: C_JSNODE_Insert_table
};
JSNodeClassMap[JSNODE_CONTROL_API_PROP] = {
    modelClass: JSNode_Control_Api_Prop,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_DATEFUN] = {
    modelClass: JSNode_DateFun,
    comClass: C_JSNode_DateFun
};
JSNodeClassMap[JSNODE_CONTROL_API_PROPSETTER] = {
    modelClass: JSNode_Control_Api_PropSetter,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_ENV_VAR] = {
    modelClass: JSNode_Env_Var,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_BOOLEANVALUE] = {
    modelClass: JSNode_BooleanValue,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_QUERY_SQL] = {
    modelClass: JSNode_Query_Sql,
    comClass: C_JSNode_Query_Sql
};
JSNodeClassMap[JSNODE_CALLONFETCHEND] = {
    modelClass: JSNode_CallOnFetchEnd,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_LOGICAL_OPERATOR] = {
    modelClass: JSNode_Logical_Operator,
    comClass: C_JSNode_Logical_Operator
};
JSNodeClassMap[JSNODE_ARRAY_LENGTH] = {
    modelClass: JSNode_Array_Length,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_CREATE_CUSERROR] = {
    modelClass: JSNode_Create_Cuserror,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_FRESH_FORM] = {
    modelClass: JSNode_FreshForm,
    comClass: C_Node_SimpleNode
};
JSNodeClassMap[JSNODE_DO_FLOWSTEP] = {
    modelClass: JSNode_Do_FlowStep,
    comClass: C_JSNODE_Do_FlowStep
};