'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SQLNODE_DBENTITY = 'dbEntity';
var SQLNODE_SELECT = 'select';
var SQLNODE_VAR_GET = 'var_get';
var SQLNODE_VAR_SET = 'var_set';
var SQLNODE_NOPERAND = 'noperand';
var SQLNODE_COMPARE = 'compare';
var SQLNODE_COLUMN = 'column';
var SQLNODE_XJOIN = 'xjion';
var SQLNODE_CONSTVALUE = 'constvalue';
var SQLNODE_DBENTITY_COLUMNSELECTOR = 'dbentity_columnselector';
var SQLNODE_RET_CONDITION = 'ret_condition';
var SQLNODE_RET_COLUMNS = 'ret_columns';
var SQLNODE_RET_ORDER = 'ret_order';
var SQLNODE_ROWNUMBER = 'rownumber';
var SQLNODE_ISNULL = 'isnullfun';
var SQLNODE_ISNULLOPERATOR = 'isnulloperator';
var SQLNODE_LOGICAL_OPERATOR = 'logical_operator';
var SQLDEF_VAR = 'def_variable';
var SQLNODE_CONTROL_API_PROP = 'controlapiprop';
var SQLNODE_ENV_VAR = 'envvar';
var SQLNODE_CURRENTDATAROW = 'currentdatarow';

var SqlNodeClassMap = {};
// CONSTSQLNODES_ARR output是常量的节点类型
var SQL_OutSimpleValueNode_arr = [SQLNODE_COLUMN, SQLNODE_VAR_GET, SQLNODE_CONSTVALUE, SQLNODE_CONTROL_API_PROP, SQLNODE_ENV_VAR, SQLNODE_CURRENTDATAROW];

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

var SqlNode_BluePrint = function (_EventEmitter2) {
    _inherits(SqlNode_BluePrint, _EventEmitter2);

    function SqlNode_BluePrint(initData, bluePrintJson, createHelper) {
        _classCallCheck(this, SqlNode_BluePrint);

        var _this2 = _possibleConstructorReturn(this, (SqlNode_BluePrint.__proto__ || Object.getPrototypeOf(SqlNode_BluePrint)).call(this));

        EnhanceEventEmiter(_this2);

        _this2.nodes_arr = [];
        _this2.vars_arr = [];
        _this2.links_arr = [];
        _this2.linkPool = new ScoketLinkPool(_this2);
        Object.assign(_this2, initData);
        var self = _this2;
        if (createHelper == null) {
            createHelper = new NodeCreationHelper();
        }
        _this2.bluePrint = _this2;
        _this2.allNode_map = {};
        _this2.allVars_map = {};
        _this2.nodes_arr = [];
        _this2.loaded = true;
        _this2.isCustomDS = true;

        if (bluePrintJson != null) {
            assginObjByProperties(_this2, bluePrintJson, ['type', 'code', 'name', 'retNodeId', 'editorLeft', 'editorTop', 'group']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(function (varJson) {
                    var newVar = new SqlDef_Variable({}, _this2, createHelper, varJson);
                });
            }
            var newChildNodes_arr = _this2.genNodesByJsonArr(_this2, bluePrintJson.nodes_arr, createHelper);
            _this2.finalSelectNode = newChildNodes_arr.find(function (node) {
                return node.id == bluePrintJson.retNodeId;
            });
            _this2.linkPool.restorFromJson(bluePrintJson.links_arr, createHelper);
        }
        _this2.id = _this2.code;

        if (_this2.group == null) {
            _this2.group = 'custom';
        }

        /*
        this.nodes_arr = this.nodes_arr.map((nodeData,i)=>{
            if(nodeData.type == SQLNODE_DBENTITY){
                return new SqlNode_DBEntity(nodeData, self, createHelper);
            }
            else{
                console.log('不支持的sql节点:' + nodeData.type);
                console.warn(nodeData);
            }
        });
        */
        _this2.returnSelectNode(createHelper);
        _this2.finalSelectNode.isConstNode = true;
        _this2.genColumns();
        createHelper.fireEvent('complete', createHelper);
        return _this2;
    }

    _createClass(SqlNode_BluePrint, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_BluePrint.prototype.__proto__ || Object.getPrototypeOf(SqlNode_BluePrint.prototype), 'requestSaveAttrs', this).call(this);
            rlt.inSocket.type = this.finalSelectNode.inSocket.type;
            rlt.inSocket.inputable = this.finalSelectNode.inSocket.inputable;
            return rlt;
        }
    }, {
        key: 'isScalar',
        value: function isScalar() {
            return this.type == "标量值";
        }
    }, {
        key: 'isFunction',
        value: function isFunction() {
            return false;
        }
    }, {
        key: 'getParams',
        value: function getParams() {
            var rlt = this.vars_arr.filter(function (varData) {
                return varData.isParam;
            });
            return rlt.length == 0 ? null : rlt;
        }
    }, {
        key: 'genColumns',
        value: function genColumns() {
            this.columns = this.finalSelectNode.getColumns_arr();
        }
    }, {
        key: 'containColumn',
        value: function containColumn(colname) {
            if (this.columns == null) {
                this.genColumns();
            }
            return this.getColumnByName(colname) != null;
        }
    }, {
        key: 'returnSelectNode',
        value: function returnSelectNode(createHelper) {
            if (this.finalSelectNode == null) {
                if (this.type == "标量值") {
                    this.finalSelectNode = new SqlNode_Select({ title: '返回值' }, this, createHelper);
                } else {
                    this.finalSelectNode = new SqlNode_Select({ title: '返回表' }, this, createHelper);
                }
                this.finalSelectNode.removeSocket(this.finalSelectNode.outSocket);
            } else {
                if (this.type == "标量值") {
                    this.finalSelectNode.title = '返回值';
                } else {
                    this.finalSelectNode.title = '返回表';
                }
                this.finalSelectNode.removeSocket(this.finalSelectNode.outSocket);
            }
        }
    }, {
        key: 'getColumnByName',
        value: function getColumnByName(colName) {
            return this.columns.find(function (col) {
                return col.name == colName;
            });
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
            this.genColumns();
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
            var rlt = new SqlDef_Variable({ name: varName, valType: SqlVarType_Int }, this);
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
            var _this3 = this;

            if (nodes_arr.length == 0) {
                return;
            }
            this.banEvent('changed');
            nodes_arr.forEach(function (node) {
                _this3.deleteNode(node);
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
            var setting = SqlNodeClassMap[nodeJson.type];
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
                retNodeId: this.finalSelectNode.id,
                name: this.name,
                type: this.type,
                group: this.group
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
            this.genColumns();
            var ret = this.finalSelectNode.compile(compilHelper, []);
            if (ret == false) {
                return false;
            }
            var varDeclareString = '';
            for (var si in compilHelper.useVariables_arr) {
                varDeclareString += compilHelper.useVariables_arr[si].declareStr + ' ';
            }
            return {
                sql: ret.getSocketOut(this.finalSelectNode.outSocket).strContent,
                varDeclareStr: varDeclareString,
                vars_arr: compilHelper.useVariables_arr
            };
        }
    }]);

    return SqlNode_BluePrint;
}(EventEmitter);

var SqlNode_Base = function (_Node_Base) {
    _inherits(SqlNode_Base, _Node_Base);

    function SqlNode_Base(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        _classCallCheck(this, SqlNode_Base);

        return _possibleConstructorReturn(this, (SqlNode_Base.__proto__ || Object.getPrototypeOf(SqlNode_Base)).call(this, initData, parentNode, createHelper, type, label, isContainer, nodeJson));
    }

    return SqlNode_Base;
}(Node_Base);

var SqlDef_Variable = function (_SqlNode_Base) {
    _inherits(SqlDef_Variable, _SqlNode_Base);

    function SqlDef_Variable(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlDef_Variable);

        var _this5 = _possibleConstructorReturn(this, (SqlDef_Variable.__proto__ || Object.getPrototypeOf(SqlDef_Variable)).call(this, initData, parentNode, createHelper, SQLDEF_VAR, '变量', false, nodeJson));

        _this5.name = ReplaceIfNull(_this5.name, 'unname');
        _this5.valType = ReplaceIfNull(_this5.valType, SqlVarType_Int);
        _this5.size_1 = ReplaceIfNaN(_this5.size_1, 0);
        _this5.size_2 = ReplaceIfNaN(_this5.size_2, 0);
        _this5.isParam = ReplaceIfNaN(_this5.isParam, 0);
        autoBind(_this5);
        return _this5;
    }

    _createClass(SqlDef_Variable, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlDef_Variable.prototype.__proto__ || Object.getPrototypeOf(SqlDef_Variable.prototype), 'requestSaveAttrs', this).call(this);
            rlt.name = this.name;
            rlt.valType = this.valType;
            rlt.size_1 = this.size_1;
            rlt.size_2 = this.size_2;
            rlt.isParam = this.isParam;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['name', 'valType', 'size_1', 'size_2', 'isParam']);
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
            var attrs = this;
            var rlt = (attrs.isParam ? '@' : '') + attrs.name + '  ' + this.getDefType();

            return rlt;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            return (this.isParam ? '@' : '') + this.name;
        }
    }, {
        key: 'getRealName',
        value: function getRealName() {
            return (this.name[0] == '@' ? '' : '@') + this.name;
        }
    }, {
        key: 'getValType',
        value: function getValType() {
            return this.valType;
        }
    }, {
        key: 'getDefType',
        value: function getDefType() {
            var rlt = this.valType;
            switch (this.valType) {
                case SqlVarType_NVarchar:
                    rlt += '(' + this.size_1 + ')';
                    break;
                case SqlVarType_Time:
                    rlt += '(0)';
                    break;
                case SqlVarType_Decimal:
                    rlt += '(' + this.size_1 + ',' + this.size_2 + ')';
                    break;
            }
            return rlt;
        }
    }, {
        key: 'getDefineString',
        value: function getDefineString() {
            return 'declare ' + (this.name[0] == '@' ? '' : '@') + this.name + ' ' + this.getDefType();
        }
    }]);

    return SqlDef_Variable;
}(SqlNode_Base);

var SqlNode_DBEntity = function (_SqlNode_Base2) {
    _inherits(SqlNode_DBEntity, _SqlNode_Base2);

    function SqlNode_DBEntity(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_DBEntity);

        var _this6 = _possibleConstructorReturn(this, (SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity)).call(this, initData, parentNode, createHelper, SQLNODE_DBENTITY, '数据源', false, nodeJson));

        autoBind(_this6);

        if (nodeJson) {
            if (_this6.outputScokets_arr.length > 0) {
                _this6.outSocket = _this6.outputScokets_arr[0];
                _this6.outSocket.type = SqlVarType_Table;
            }
        } else {
            _this6.outSocket = new NodeSocket('out', _this6, false, { type: SqlVarType_Table });
            _this6.addSocket(_this6.outSocket);
        }

        if (_this6.targetEntity != null) {
            var tem_arr = _this6.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                if (isNaN(tem_arr[1])) {
                    var self = _this6;
                    _this6.targetEntity = null;
                    setTimeout(function () {
                        var targetEntity = self.bluePrint.master.getDataSourceByCode(tem_arr[1]);
                        if (targetEntity) {
                            self.targetEntity = targetEntity;
                            targetEntity.on('syned', self.entitySynedHandler);
                        }
                    }, 50);
                } else {
                    _this6.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                    _this6.targetEntity.on('syned', _this6.entitySynedHandler);
                }
                //console.log(this.targetEntity);
            } else {
                _this6.targetEntity = null;
            }
        }

        var self = _this6;
        return _this6;
    }

    _createClass(SqlNode_DBEntity, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_DBEntity.prototype.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity.prototype), 'requestSaveAttrs', this).call(this);
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
        key: 'cusTitleChanged',
        value: function cusTitleChanged(oldTitle, newTitle) {
            if (this.targetEntity == null) {
                return;
            }
            if (IsEmptyString(newTitle)) {
                return;
            }
            var compareType = IsEmptyString(oldTitle) ? 'code' : 'alias';
            var key = IsEmptyString(oldTitle) ? this.targetEntity.code : oldTitle;
            var newTool = new SqlNodeTool_SynColumnNodeAlias(this, compareType, key, newTitle);
        }
    }, {
        key: 'inputSocketSortFun',
        value: function inputSocketSortFun(sa, sb) {
            return sa.index > sb.index;
        }
    }, {
        key: 'entitySynedHandler',
        value: function entitySynedHandler() {
            var _this7 = this;

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
                    var theSocket = _this7.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this7.addSocket(new NodeSocket(param.name, _this7, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
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
                entity = this.bluePrint.master.getDataSourceByCode(entity);
            }
            if (this.targetEntity == entity) return;
            if (this.targetEntity != null) {
                this.targetEntity.off('syned', this.entitySynedHandler);
            }
            this.targetEntity = entity;
            if (entity) {
                entity.on('syned', this.entitySynedHandler);
            }
            this.entitySynedHandler();
        }
    }, {
        key: 'getContext',
        value: function getContext(finder) {
            finder.setTest(this.id);
            if (this.targetEntity == null) {
                return;
            }
            if (finder.type == ContextType_DBEntity) {
                var theLabel = this.title;
                if (IsEmptyString(theLabel)) {
                    theLabel = this.targetEntity.loaded ? this.targetEntity.name : this.targetEntity.code;
                }
                finder.addItem(theLabel, this.targetEntity);
            }
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_DBEntity.prototype.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.targetEntity == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '没有选择数据源']);
                return false;
            }
            if (this.targetEntity.loaded == false) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '数据源尚未加载完成']);
                return false;
            }
            if (this.targetEntity.isCustomDS) {
                if (this.targetEntity == this.bluePrint) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能选择自身作为数据源']);
                    return false;
                }
            }
            this.entitySynedHandler();
            var params_arr = [];
            var usePreNodes_arr = preNodes_arr.concat(this);
            if (this.inputScokets_arr.length > 0) {
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var theSocket = this.inputScokets_arr[i];
                    var paramValue = null;
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                    if (tLinks.length == 0) {
                        paramValue = IsEmptyString(theSocket.defval) ? null : "'" + theSocket.defval + "'";
                    } else {
                        var compileRet = tLinks[0].outSocket.node.compile(helper, usePreNodes_arr);
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
                    params_arr.push({ name: theSocket.name, value: paramValue });
                }
            }
            helper.addUseEntity(this.targetEntity);
            var selfCompileRet = new CompileResult(this);
            if (!this.targetEntity.isCustomDS) {
                var paramsStr = '';
                params_arr.forEach(function (item, index) {
                    paramsStr += (index == 0 ? '' : ',') + item.value;
                });
                selfCompileRet.setSocketOut(this.outSocket, this.targetEntity.name + (paramsStr.length == 0 ? '' : '(' + paramsStr + ')') + (IsEmptyString(this.title) ? '' : ' as [' + this.title + ']'), { tableName: IsEmptyString(this.title) ? this.targetEntity.name : this.title });
            } else {
                helper.logManager.log('开始编译自定数据源:' + this.targetEntity.name);
                var varMap = {};
                params_arr.forEach(function (item) {
                    varMap[item.name] = item.value;
                });
                var targetEntityCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                targetEntityCompileHelper.varValue_map = varMap;
                var targetEntityCompileRet = this.targetEntity.finalSelectNode.compile(targetEntityCompileHelper, []);
                if (targetEntityCompileRet == false) {
                    return false;
                }
                var targetEntitySqlStr = targetEntityCompileRet.getSocketOut(this.targetEntity.finalSelectNode.outSocket).strContent;
                selfCompileRet.setSocketOut(this.outSocket, '(' + targetEntitySqlStr + ') as [' + (IsEmptyString(this.title) ? this.targetEntity.name : this.title) + ']', { tableName: IsEmptyString(this.title) ? this.targetEntity.name : this.title });
                helper.logManager.log('完成编译自定数据源:' + this.targetEntity.name);
            }

            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_DBEntity;
}(SqlNode_Base);

var SqlNode_XJoin = function (_SqlNode_Base3) {
    _inherits(SqlNode_XJoin, _SqlNode_Base3);

    function SqlNode_XJoin(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_XJoin);

        var _this8 = _possibleConstructorReturn(this, (SqlNode_XJoin.__proto__ || Object.getPrototypeOf(SqlNode_XJoin)).call(this, initData, parentNode, createHelper, SQLNODE_XJOIN, 'Join', true, nodeJson));

        autoBind(_this8);

        if (_this8.joinType == null) {
            _this8.joinType = JoinType_Inner;
        }

        if (nodeJson) {
            _this8.conditionNode = _this8.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_CONDITION;
            });
        }

        if (_this8.conditionNode == null) {
            _this8.conditionNode = new SqlNode_Ret_Condition({ left: 100, top: 0 }, _this8, createHelper);
        }
        _this8.conditionNode.label = 'ON';

        if (nodeJson) {
            if (_this8.outputScokets_arr.length > 0) {
                _this8.outSocket = _this8.outputScokets_arr[0];
                _this8.outSocket.type = SqlVarType_Table;
            }
        }
        if (_this8.outSocket == null) {
            _this8.outSocket = new NodeSocket('out', _this8, false, { type: SqlVarType_Table });
            _this8.addSocket(_this8.outSocket);
        }

        if (_this8.inputScokets_arr.length == 0) {
            _this8.addSocket(new NodeSocket('in0', _this8, true, { type: SqlVarType_Table }));
            _this8.addSocket(new NodeSocket('in1', _this8, true, { type: SqlVarType_Table }));
        } else {
            _this8.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Table;
            });
        }

        _this8.contextEntities_arr = [];
        _this8.entityNodes_arr = [];
        _this8.autoCreateHelper = {};
        return _this8;
    }

    _createClass(SqlNode_XJoin, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_XJoin.prototype.__proto__ || Object.getPrototypeOf(SqlNode_XJoin.prototype), 'requestSaveAttrs', this).call(this);
            rlt.joinType = this.joinType;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['joinType']);
        }
    }, {
        key: 'preEditing',
        value: function preEditing(editor) {
            var cFinder = new ContextFinder(ContextType_DBEntity);
            this.getContext(cFinder);
            this.contextEntities_arr = cFinder.item_arr;
            for (var i in this.entityNodes_arr) {
                this.entityNodes_arr[i].valid = false;
            }
            for (var i = 0; i < this.contextEntities_arr.length; ++i) {
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
        key: 'addNewColumn',
        value: function addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
            return new SqlNode_Column({
                tableCode: tableCode,
                tableAlias: tableAlias,
                tableName: tableName,
                columnName: columnName,
                cvalType: cvalType,
                left: x,
                top: y,
                newborn: newborn
            }, this, null);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_XJoin.prototype.__proto__ || Object.getPrototypeOf(SqlNode_XJoin.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var belongSelectNode = null;
            for (var i = preNodes_arr.length - 1; i >= 0; --i) {
                if (preNodes_arr[i].type == SQLNODE_SELECT) {
                    belongSelectNode = preNodes_arr[i];
                    break;
                }
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketOuts_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var socket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '必须有输入']);
                    return false;
                }
                var theLink = tLinks[0];
                var outNode = theLink.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    // child compile fail
                    return false;
                }
                var socketOut = compileRet.getSocketOut(theLink.outSocket);
                if (outNode.type == SQLNODE_SELECT) {
                    // select node 需要嵌套括号以及别名
                    socketOut.strContent = bracketStr(socketOut.strContent) + ' as ' + outNode.title;
                }
                if (socketOut.data && socketOut.data.tableName) {
                    var tableKey = belongSelectNode.id + '_tables_' + socketOut.data.tableName;
                    var cacheNode = helper.getCache(tableKey);
                    if (cacheNode != null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '数据源:[' + socketOut.data.tableName + ']有同名节点']);
                        return false;
                    }
                    helper.setCache(tableKey, outNode);
                }
                socketOuts_arr.push(socketOut);
            }
            var joinString = socketOuts_arr[0].strContent + clampStr(this.joinType, ' ', ' ') + socketOuts_arr[1].strContent;

            if (this.conditionNode.inputScokets_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, this.conditionNode, helper.clickLogBadgeItemHandler), '需要指定']);
                return false;
            }

            if (this.joinType != 'cross join') {
                var conditionNodeCompileRet = this.conditionNode.compile(helper, usePreNodes_arr);
                if (conditionNodeCompileRet == false) {
                    return false;
                }
                var onString = conditionNodeCompileRet.getDirectOut().strContent;
                if (IsEmptyString(onString)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, this.conditionNode, helper.clickLogBadgeItemHandler), '没有设定正确的输入']);
                    return false;
                }
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, joinString + ' on ' + onString);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_XJoin;
}(SqlNode_Base);

var SqlNode_Column = function (_SqlNode_Base4) {
    _inherits(SqlNode_Column, _SqlNode_Base4);

    function SqlNode_Column(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Column);

        var _this9 = _possibleConstructorReturn(this, (SqlNode_Column.__proto__ || Object.getPrototypeOf(SqlNode_Column)).call(this, initData, parentNode, createHelper, SQLNODE_COLUMN, '列', false, nodeJson));

        autoBind(_this9);

        //this.label = this.tableName + '.' + this.columnName;
        _this9.headType = 'empty';
        if (nodeJson) {
            if (_this9.outputScokets_arr.length > 0) {
                _this9.outSocket = _this9.outputScokets_arr[0];
                _this9.outSocket.label = _this9.getSocketLabel();
            }
        }
        if (_this9.outSocket == null) {
            _this9.outSocket = new NodeSocket('out', _this9, false, { type: _this9.cvalType, label: _this9.getSocketLabel() });
            _this9.addSocket(_this9.outSocket);
        }

        _this9.scoketNameMoveable = true;
        return _this9;
    }

    _createClass(SqlNode_Column, [{
        key: 'freshSocketLabel',
        value: function freshSocketLabel() {
            this.outSocket.label = this.getSocketLabel();
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Column.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Column.prototype), 'requestSaveAttrs', this).call(this);
            rlt.tableAlias = this.tableAlias;
            rlt.tableName = this.tableName;
            rlt.tableCode = this.tableCode;
            rlt.columnName = this.columnName;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['tableAlias', 'tableName', 'columnName', 'tableCode']);
        }
    }, {
        key: 'setFromObj',
        value: function setFromObj(obj) {
            var changed = false;
            if (obj.hasOwnProperty('tableCode') && obj.tableCode != this.tableCode) {
                this.tableCode = obj.tableCode;
                changed = true;
            }
            if (obj.hasOwnProperty('tableAlias') && obj.tableAlias != this.tableAlias) {
                this.tableAlias = obj.tableAlias;
                changed = true;
            }
            if (obj.hasOwnProperty('tableName') && obj.tableName != this.tableName) {
                this.tableName = obj.tableName;
                changed = true;
            }
            if (obj.hasOwnProperty('columnName') && obj.columnName != this.columnName) {
                this.columnName = obj.columnName;
                changed = true;
            }
            if (obj.hasOwnProperty('cvalType') && obj.cvalType != this.cvalType) {
                this.cvalType = obj.cvalType;
                changed = true;
            }
            if (changed) {
                this.freshSocketLabel();
                this.outSocket.fireEvent('changed');
                return true;
            }
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '列:' + this.getSocketLabel();
        }
    }, {
        key: 'getSocketLabel',
        value: function getSocketLabel() {
            if (this.tableAlias == null && this.tableName == null && this.tableCode != null && !isNaN(this.tableCode)) {
                var ds = g_dataBase.getEntityByCode(this.tableCode);
                if (ds.name != null) {
                    this.tableName = ds.name;
                    this.freshSocketLabel();
                }
            }
            return (this.tableAlias == null ? this.tableName : this.tableAlias) + '.' + this.columnName;
        }
    }, {
        key: 'getCompareKey',
        value: function getCompareKey() {
            return (this.tableAlias == null ? this.tableCode : this.tableAlias) + '.' + this.columnName;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Column.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Column.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var belongSelectNode = null;
            var isolatedColumn = true;
            for (var i = preNodes_arr.length - 1; i >= 0; i--) {
                if (preNodes_arr[i].type == SQLNODE_SELECT) {
                    belongSelectNode = preNodes_arr[i];
                    break;
                } else if (preNodes_arr[i].type == SQLNODE_AGGREGATE) {
                    isolatedColumn = false;
                }
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (belongSelectNode == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '没有找到归属select节点']);
                return false;
            }
            if (isolatedColumn) {
                if (helper[belongSelectNode.id + '_complingSocket_complingSocket'] != null) {
                    if (helper[belongSelectNode.id + '_complingSocket_isolated'] == false) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能和聚合函数混用！']);
                        return false;
                    }
                    helper[belongSelectNode.id + '_complingSocket_isolated'] = true;
                }
            }
            var compareLabel = this.tableAlias == null ? this.tableName : this.tableAlias;
            var selectNodeContext = helper.getContext(belongSelectNode, new ContextFinder(ContextType_DBEntity));
            var columnItem = null;
            for (var i = 0; i < selectNodeContext.item_arr.length; ++i) {
                var item = selectNodeContext.item_arr[i];
                if (item.label == compareLabel) {
                    columnItem = item.data.getColumnByName(this.columnName);
                    if (columnItem != null) {
                        break;
                    }
                }
            }
            if (columnItem == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '没有在上下文中找到:' + compareLabel]);
                return false;
            }
            if (columnItem.cvalType != null && this.outSocket.type != columnItem.cvalType) {
                this.outSocket.set({ type: columnItem.cvalType });
            }
            var selfCompileRet = new CompileResult(this);
            var columnLabel = '[' + compareLabel + '].[' + this.columnName + ']';
            selfCompileRet.setSocketOut(this.outSocket, columnLabel);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Column;
}(SqlNode_Base);

var SqlNode_DBEntity_ColumnSelector = function (_SqlNode_Base5) {
    _inherits(SqlNode_DBEntity_ColumnSelector, _SqlNode_Base5);

    function SqlNode_DBEntity_ColumnSelector(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_DBEntity_ColumnSelector);

        var _this10 = _possibleConstructorReturn(this, (SqlNode_DBEntity_ColumnSelector.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity_ColumnSelector)).call(this, initData, parentNode, createHelper, SQLNODE_DBENTITY_COLUMNSELECTOR, '实体', false, nodeJson));

        autoBind(_this10);
        _this10.isConstNode = true;

        var bCanSlect = parentNode.isSelectColumn != null;
        if (bCanSlect) {
            _this10.addFrameButton('select-all', '全选');
            _this10.addFrameButton('unselect-all', '全不选');
            _this10.addFrameButton('fresh', '刷新');
        }

        return _this10;
    }

    _createClass(SqlNode_DBEntity_ColumnSelector, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            // 临时节点不需保存
            return null;
        }
    }, {
        key: 'clickFrameButton',
        value: function clickFrameButton(btnName) {
            if (_get(SqlNode_DBEntity_ColumnSelector.prototype.__proto__ || Object.getPrototypeOf(SqlNode_DBEntity_ColumnSelector.prototype), 'clickFrameButton', this).call(this, btnName)) {
                return;
            }
            if (this.bluePrint.type == "标量值") {
                return false;
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

var SqlNode_Select = function (_SqlNode_Base6) {
    _inherits(SqlNode_Select, _SqlNode_Base6);

    function SqlNode_Select(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Select);

        var _this11 = _possibleConstructorReturn(this, (SqlNode_Select.__proto__ || Object.getPrototypeOf(SqlNode_Select)).call(this, initData, parentNode, createHelper, SQLNODE_SELECT, 'Select', true, nodeJson));

        autoBind(_this11);

        if (nodeJson) {
            if (_this11.inputScokets_arr.length > 0) {
                _this11.inSocket = _this11.inputScokets_arr[0];
                _this11.inSocket.type = SqlVarType_Table;
            }
            if (_this11.outputScokets_arr.length > 0) {
                _this11.outSocket = _this11.outputScokets_arr[0];
                _this11.outSocket.type = SqlVarType_Table;
            }
            _this11.columnNode = _this11.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_COLUMNS;
            });
            _this11.conditionNode = _this11.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_CONDITION;
            });
            _this11.orderNode = _this11.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_ORDER;
            });
            _this11.groupNode = _this11.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_GROUP;
            });
            _this11.havingNode = _this11.nodes_arr.find(function (node) {
                return node.type == SQLNODE_RET_HAVING;
            });
        }
        if (_this11.inSocket == null) {
            _this11.inSocket = new NodeSocket('in', _this11, true, { type: SqlVarType_Table });
            _this11.addSocket(_this11.inSocket);
        }
        if (_this11.outSocket == null) {
            _this11.outSocket = new NodeSocket('out', _this11, false, { type: SqlVarType_Table });
            _this11.addSocket(_this11.outSocket);
        }
        if (IsEmptyString(_this11.title)) {
            _this11.title = '未命名';
        }

        if (_this11.columnNode == null) {
            _this11.columnNode = new SqlNode_Ret_Columns({ left: 100, top: 0 }, _this11, createHelper);
        }
        if (_this11.conditionNode == null) {
            _this11.conditionNode = new SqlNode_Ret_Condition({ left: 250, top: 0 }, _this11, createHelper);
        }
        if (_this11.orderNode == null) {
            _this11.orderNode = new SqlNode_Ret_Order({ left: 300, top: 0 }, _this11, createHelper);
        }
        if (_this11.groupNode == null) {
            _this11.groupNode = new SqlNode_Ret_Group({ left: 400, top: 0 }, _this11, createHelper);
        }
        if (_this11.havingNode == null) {
            _this11.havingNode = new SqlNode_Ret_Having({ left: 500, top: 0 }, _this11, createHelper);
        }
        if (_this11.columns_arr == null) {
            _this11.columns_arr = [];
        }
        if (_this11.orderColumns_arr == null) {
            _this11.orderColumns_arr = [];
        }
        _this11.contextEntities_arr = [];
        _this11.entityNodes_arr = [];
        _this11.autoCreateHelper = {};

        if (createHelper) {
            createHelper.on('complete', _this11.createHelperCompleteHandler);
        }
        return _this11;
    }

    _createClass(SqlNode_Select, [{
        key: 'createHelperCompleteHandler',
        value: function createHelperCompleteHandler(createHelper) {
            createHelper.off('complete', this.createHelperCompleteHandler);
            this.postEditing(null);
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Select.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Select.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['tableAlias', 'tableName', 'columnName', 'tableCode']);
        }
    }, {
        key: 'getContext',
        value: function getContext(finder, depth) {
            finder.setTest(this.id);
            if (depth == null) {
                depth = 0;
            }
            if (depth == 0) {
                return _get(SqlNode_Select.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Select.prototype), 'getContext', this).call(this, finder, 1);
            }
            //判断输入口是否是 union
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
            if (tLinks.length > 0) {
                var temlink = tLinks[0];
                var outNode = temlink.outSocket.node;
                if (outNode.type == SQLNODE_UNION) {
                    var theNewEntity = outNode.getContext(finder, depth + 1);
                    theNewEntity.label = this.title;
                    return;
                }
            }

            // 其他情况下只返回自身即可
            var retLinks = this.bluePrint.linkPool.getLinksByNode(this.columnNode, 'i');
            if (retLinks.length == 0) {
                return;
            }
            var temEntity = new DBEntityAgency(this.getNodeTitle(), this.id);
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
            return finder.addItem(this.title, temEntity);
        }
    }, {
        key: 'preEditing',
        value: function preEditing(editor) {
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
            if (this.bluePrint.type == "标量值") {
                if (this.columnNode.inputScokets_arr.length == 0) {
                    this.columnNode.addSocket(this.columnNode.genInSocket());
                }
                for (var i = 1; i < this.columnNode.inputScokets_arr.length; i++) {
                    var socket = this.columnNode.inputScokets_arr[i];
                    var tlinks = this.columnNode.bluePrint.linkPool.getLinksBySocket(socket);
                    var colNode = null;
                    if (tlinks.length > 0) {
                        var theLink = tlinks[0];
                        {
                            this.columnNode.bluePrint.deleteNode(theLink.outSocket.node);
                        }
                    }
                }
                for (var i = this.columnNode.inputScokets_arr.length - 1; i > 0; i--) {
                    this.columnNode.removeSocket(this.columnNode.inputScokets_arr[i]);
                }
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
        key: 'getColumns_arr',
        value: function getColumns_arr() {
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
            return newColumns_arr;
        }
    }, {
        key: 'postEditing',
        value: function postEditing(editor) {
            this.columns_arr = this.getColumns_arr();

            var orderBySockets = this.orderNode.inputScokets_arr;
            var newOrderByColumns_arr = [];
            var temMap = {};
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
        key: 'addNewColumn',
        value: function addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
            return new SqlNode_Column({
                tableCode: tableCode,
                tableAlias: tableAlias,
                tableName: tableName,
                columnName: columnName,
                cvalType: cvalType,
                left: x,
                top: y,
                newborn: newborn
            }, this, null);
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
                if (this.bluePrint.type == "标量值") {
                    if (newSocket.currentComponent) {
                        this.socketComponentCreated(newSocket);
                    }
                    if (this.columnNode.inputScokets_arr.length > 1) {
                        var inSocket = this.columnNode.inputScokets_arr[0];
                        var link = this.bluePrint.linkPool.getLinksBySocket(inSocket);
                        if (link.length > 0) {
                            this.columnNode.bluePrint.deleteNode(link[0].outSocket.node);
                        }
                        this.columnNode.removeSocket(this.columnNode.inputScokets_arr[0]);
                        this.columnNode.fireEvent(Event_SocketNumChanged);
                    }
                }
            } else {
                // 删除
                if (theLink == null) {
                    return false;
                }
                var needRemoveSocket = theLink.inSocket;
                this.bluePrint.deleteNode(theLink.outSocket.node);
                if (this.bluePrint.type != "标量值") {
                    this.columnNode.removeSocket(needRemoveSocket);
                }
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
                    var newLink = this.bluePrint.linkPool.addLink(newColNode.outSocket, createInfo.newSocket);
                    newLink.straightOut(-150);
                }
                this.autoCreateHelper[createInfo.compareKey + '_creating'] = null;
            }
            newColNode.off(Event_FrameComMount, this.newColumNodeFrameComMounted);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Select.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Select.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var columnNode = this.columnNode;
            var columnNode_inSockets = columnNode.inputScokets_arr;
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var selfCompileRet = new CompileResult(this);
            if (IsEmptyString(this.title)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要指定title']);
                return false;
            }
            var usePreNodes_arr = preNodes_arr.concat(this);
            //判断输入口是否是 union
            var theSocket = this.inputScokets_arr[0];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (tLinks.length > 0) {
                var unionlink = tLinks[0];
                var outNode = unionlink.outSocket.node;
                var uniontValue = null;
                if (outNode.type == SQLNODE_UNION) {
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    var socketout = compileRet.getSocketOut(unionlink.outSocket);
                    uniontValue = socketout.strContent;
                    selfCompileRet.setSocketOut(this.outSocket, uniontValue, { tableName: this.title, columnsName_arr: socketout.data.columsName_arr });
                    helper.setCompileRetCache(this, selfCompileRet);
                    return selfCompileRet;
                }
            }

            if (columnNode_inSockets.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), '没有选择任何返回列。']);
                return false;
            }
            if (this.bluePrint.type == "标量值" && columnNode_inSockets.length > 1) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), '返回列不能大于1。']);
                return false;
            }
            var emptySocket = null;
            var emptySocketIndex = 0;
            for (var socketI = 0; socketI < columnNode_inSockets.length; ++socketI) {
                var socket = columnNode_inSockets[socketI];
                if (helper.getLinksBySocket(socket).length == 0) {
                    emptySocket = socket;
                    emptySocketIndex = socketI;
                    break;
                }
            }
            if (emptySocket) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), '第' + (emptySocketIndex + 1) + '个输入接口是空链接']);
                return false;
            }

            // compile from
            var fromString = '';
            if (this.inputScokets_arr.length == 0) {
                helper.logManager.warnEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '没有输入接口']);
            }
            var fromScoket = this.inputScokets_arr[0];
            var t_links = helper.getLinksBySocket(fromScoket);
            if (t_links.length > 0) {
                var fromLink = t_links[0];
                if (fromLink.outSocket != null && fromLink.outSocket.node != null) {
                    if (fromLink.outSocket.type != SqlVarType_Table) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '的输入不是一个关系']);
                        return false;
                    }
                    var fromNode = fromLink.outSocket.node;
                    var compileRet = fromNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        // child compile fail
                        return false;
                    }
                    fromString = compileRet.getSocketOut(fromLink.outSocket).strContent;
                    if (fromNode.type == SQLNODE_SELECT) {
                        // select node 中断
                        fromString = bracketStr(fromString) + ' as ' + fromNode.title;
                    }
                }
            }
            var selectColumns_arr = [];
            var isolatedColumns_arr = [];
            var outColumns_arr = [];
            var selectColumns_map = {};
            var socketOutData = null;
            var columsName_arr = [];
            var hadAggregateColumn = false;
            for (var socketI = 0; socketI < columnNode_inSockets.length; ++socketI) {
                var socket = columnNode_inSockets[socketI];
                var link = helper.getLinksBySocket(socket)[0];
                var outNode = link.outSocket.node;
                var isColumnNode = outNode.type == SQLNODE_COLUMN;
                var nodeType = outNode.type;
                var alias = socket.getExtra('alias');
                var colName = alias;
                if (IsEmptyString(alias)) {
                    if (!isColumnNode) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), '第' + (socketI + 1) + '列没有指定列名!']);
                        return false;
                    }
                    colName = outNode.columnName;
                }
                if (selectColumns_map[colName]) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), "列名:'" + colName + "'重复了!"]);
                    return false;
                }
                selectColumns_map[colName] = 1;
                helper[this.id + '_complingSocket_isolated'] = null;
                helper[this.id + '_complingSocket_complingSocket'] = socket;
                var outNodeCompileRet = outNode.compile(helper, usePreNodes_arr);
                if (outNodeCompileRet == false) {
                    return false;
                }
                var socketOutData = outNodeCompileRet.getSocketOut(link.outSocket);
                if (helper[this.id + '_complingSocket_isolated']) {
                    isolatedColumns_arr.push(socketOutData.strContent);
                } else if (helper[this.id + '_complingSocket_isolated'] == false) {
                    hadAggregateColumn = true;
                }
                helper[this.id + '_complingSocket_complingSocket'] = null;
                columsName_arr.push(colName);
                selectColumns_arr.push({
                    alias: alias,
                    strContent: socketOutData.strContent,
                    strcolName: outNode.columnName
                });
            }
            var sortNodeCompileRet = this.orderNode.compile(helper, usePreNodes_arr);
            if (sortNodeCompileRet == false) {
                return false;
            }
            var sortString = sortNodeCompileRet.getDirectOut().strContent;

            var conditionNodeCompileRet = this.conditionNode.compile(helper, usePreNodes_arr);
            if (conditionNodeCompileRet == false) {
                return false;
            }
            var whereString = conditionNodeCompileRet.getDirectOut().strContent;

            var groupNodeCompileRet = this.groupNode.compile(helper, usePreNodes_arr);
            if (groupNodeCompileRet == false) {
                return false;
            }
            var groupstring = groupNodeCompileRet.getDirectOut().strContent;
            var havingNodeCompileRet = this.havingNode.compile(helper, usePreNodes_arr);
            if (havingNodeCompileRet == false) {
                return false;
            }
            var havingString = havingNodeCompileRet.getDirectOut().strContent;
            var havingNodeInputLenth = havingNodeCompileRet.node.inputScokets_arr.length;
            var groupNodeInputLenth = groupNodeCompileRet.node.inputScokets_arr.length;
            if (hadAggregateColumn && groupNodeInputLenth == 0 || havingString.length > 0 && groupNodeInputLenth == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, this.groupNode, helper.clickLogBadgeItemHandler), "必须设置group节点！"]);
                return false;
            }
            var groupnodeOut = groupNodeCompileRet.getDirectOut();
            if (hadAggregateColumn) {
                for (var i = 0; i < isolatedColumns_arr.length; ++i) {
                    var targetStr = isolatedColumns_arr[i];
                    if (groupnodeOut.data.groupColumns_arr.indexOf(targetStr) == -1) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, this.groupNode, helper.clickLogBadgeItemHandler), targetStr + "不存在Group里面"]);
                        return false;
                    }
                }
            }

            var selfCompileRet = new CompileResult(this);
            var columnsStr = '';
            selectColumns_arr.forEach(function (x, i) {
                columnsStr += (i == 0 ? '' : ',') + x.strContent + (x.alias == null ? '' : ' as [' + x.alias + ']');
            });

            var topString = '';
            if (this.bluePrint.type == "标量值") {
                topString = 'top 1 ';
            } else {
                if (!IsEmptyString(columnNode.topValue)) {
                    if (isNaN(columnNode.topValue)) {
                        var reg = /^\d+%$/;
                        if (!reg.test(columnNode.topValue)) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), "top值不合法"]);
                            return false;
                        }
                        var num = columnNode.topValue.substr(0, columnNode.topValue.length - 1);
                        if (num == 0) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), "top值不合法"]);
                            return false;
                        } else if (num > 100) {
                            helper.logManager.warnEx([helper.logManager.createBadgeItem(thisNodeTitle, columnNode, helper.clickLogBadgeItemHandler), "top百分比值被修改为100%"]);
                            num = 100;
                        }
                        topString = 'top ' + num + ' percent ';
                    } else {
                        topString = 'top ' + columnNode.topValue + ' ';
                    }
                }
            }
            var isCheckedString = '';

            if (columnNode.distChecked == true) {
                isCheckedString = ' distinct ';
            } else {
                isCheckedString = '';
            }

            var finalSql = 'select ' + isCheckedString + topString + columnsStr + (IsEmptyString(fromString) ? '' : ' from ' + fromString) + (IsEmptyString(whereString) ? '' : ' where ' + whereString) + (IsEmptyString(groupstring) ? '' : ' group by ' + groupstring) + (IsEmptyString(havingString) ? '' : ' having ' + havingString) + (IsEmptyString(sortString) ? '' : ' order by ' + sortString);
            selfCompileRet.setSocketOut(this.outSocket, finalSql, { tableName: this.title, columsName_arr: columsName_arr });
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Select;
}(SqlNode_Base);

var SqlNode_Var_Get = function (_SqlNode_Base7) {
    _inherits(SqlNode_Var_Get, _SqlNode_Base7);

    function SqlNode_Var_Get(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Var_Get);

        var _this12 = _possibleConstructorReturn(this, (SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(SqlNode_Var_Get)).call(this, initData, parentNode, createHelper, SQLNODE_VAR_GET, '变量-获取', false, nodeJson));

        autoBind(_this12);

        if (nodeJson) {
            if (_this12.outputScokets_arr.length > 0) {
                _this12.outSocket = _this12.outputScokets_arr[0];
            }
        }
        if (_this12.outSocket == null) {
            _this12.outSocket = new NodeSocket('out', _this12, false);
            _this12.addSocket(_this12.outSocket);
        }

        _this12.varData = _this12.bluePrint.getVariableByName(_this12.varName);
        if (_this12.varData != null) {
            _this12.varData.on('changed', _this12.varChangedHandler);
        }
        _this12.varChangedHandler();

        var self = _this12;
        return _this12;
    }

    _createClass(SqlNode_Var_Get, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Var_Get.prototype), 'requestSaveAttrs', this).call(this);
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
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Var_Get.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Var_Get.prototype), 'compile', this).call(this, helper, preNodes_arr);
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
            if (helper.varValue_map[this.varData.name]) {
                selfCompileRet.setSocketOut(this.outSocket, helper.varValue_map[this.varData.name]);
            } else {
                helper.addUseVariable(this.varData.name, this.varData.valType, this.varData.getDefineString());
                selfCompileRet.setSocketOut(this.outSocket, this.varData.getRealName());
            }
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Var_Get;
}(SqlNode_Base);

var SqlNode_Var_Set = function (_SqlNode_Base8) {
    _inherits(SqlNode_Var_Set, _SqlNode_Base8);

    function SqlNode_Var_Set(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Var_Set);

        var _this13 = _possibleConstructorReturn(this, (SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(SqlNode_Var_Set)).call(this, initData, parentNode, createHelper, SQLNODE_VAR_SET, '变量-设置', false, nodeJson));

        autoBind(_this13);

        if (nodeJson) {
            if (_this13.outputScokets_arr.length > 0) {
                _this13.outSocket = _this13.outputScokets_arr[0];
            }
            if (_this13.inputScokets_arr.length > 0) {
                _this13.inSocket = _this13.inputScokets_arr[0];
            }
        }
        if (_this13.outSocket == null) {
            _this13.outSocket = new NodeSocket('out', _this13, false);
            _this13.addSocket(_this13.outSocket);
        }
        if (_this13.inSocket == null) {
            _this13.inSocket = new NodeSocket('in', _this13, true);
            _this13.addSocket(_this13.inSocket);
        }

        _this13.varData = _this13.bluePrint.getVariableByName(_this13.varName);
        if (_this13.varData != null) {
            _this13.varData.on('changed', _this13.varChangedHandler);
        }
        _this13.varChangedHandler();

        var self = _this13;
        return _this13;
    }

    _createClass(SqlNode_Var_Set, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Var_Set.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Var_Set.prototype), 'requestSaveAttrs', this).call(this);
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

var SqlNode_NOperand = function (_SqlNode_Base9) {
    _inherits(SqlNode_NOperand, _SqlNode_Base9);

    function SqlNode_NOperand(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_NOperand);

        var _this14 = _possibleConstructorReturn(this, (SqlNode_NOperand.__proto__ || Object.getPrototypeOf(SqlNode_NOperand)).call(this, initData, parentNode, createHelper, SQLNODE_NOPERAND, '运算', false, nodeJson));

        autoBind(_this14);

        if (nodeJson) {
            if (_this14.outputScokets_arr.length > 0) {
                _this14.outSocket = _this14.outputScokets_arr[0];
                _this14.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (_this14.outSocket == null) {
            _this14.outSocket = new NodeSocket('out', _this14, false, { type: SqlVarType_Scalar });
            _this14.addSocket(_this14.outSocket);
        }
        _this14.insocketInitVal = {
            type: SqlVarType_Scalar
        };
        if (_this14.inputScokets_arr.length == 0) {
            _this14.addSocket(_this14.genInSocket());
            _this14.addSocket(_this14.genInSocket());
        } else {
            _this14.inputScokets_arr.forEach(function (socket) {
                socket.set(_this14.insocketInitVal);
            });
        }
        if (_this14.operator == null) {
            _this14.operator = '+';
        }
        _this14.minInSocketCount = 2;

        var self = _this14;
        return _this14;
    }

    _createClass(SqlNode_NOperand, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_NOperand.prototype.__proto__ || Object.getPrototypeOf(SqlNode_NOperand.prototype), 'requestSaveAttrs', this).call(this);
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
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_NOperand.prototype.__proto__ || Object.getPrototypeOf(SqlNode_NOperand.prototype), 'compile', this).call(this, helper, preNodes_arr);
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
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    if (IsEmptyString(theSocket.defval)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                        return false;
                    }
                    tValue = theSocket.defval;
                    if (isNaN(tValue)) {
                        allNumberic = false;
                        tValue = singleQuotesStr(tValue);
                    }
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = '(' + tValue + ')';
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

    return SqlNode_NOperand;
}(SqlNode_Base);

var SqlNode_Ret_Condition = function (_SqlNode_Base10) {
    _inherits(SqlNode_Ret_Condition, _SqlNode_Base10);

    function SqlNode_Ret_Condition(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Ret_Condition);

        var _this15 = _possibleConstructorReturn(this, (SqlNode_Ret_Condition.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Condition)).call(this, initData, parentNode, createHelper, SQLNODE_RET_CONDITION, 'Where', false, nodeJson));

        autoBind(_this15);
        _this15.isConstNode = true;

        if (nodeJson) {
            if (_this15.inputScokets_arr.length > 0) {
                _this15.inSocket = _this15.inputScokets_arr[0];
                _this15.inSocket.inputable = false;
                _this15.inSocket.type = SqlVarType_Boolean;
            }
        }
        if (_this15.inSocket == null) {
            _this15.inSocket = new NodeSocket('in', _this15, true, { type: SqlVarType_Boolean, inputable: false });
            _this15.addSocket(_this15.inSocket);
        }
        var self = _this15;
        return _this15;
    }

    _createClass(SqlNode_Ret_Condition, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Ret_Condition.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Condition.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var selfCompileRet = new CompileResult(this);
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
            if (tLinks.length > 0) {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var tCompileRet = outNode.compile(helper, preNodes_arr);
                if (tCompileRet == false) {
                    return false;
                }
                selfCompileRet.setDirectOut(tCompileRet.getSocketOut(link.outSocket).strContent);
            } else {
                selfCompileRet.setDirectOut('');
            }
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Ret_Condition;
}(SqlNode_Base);

var SqlNode_Ret_Order = function (_SqlNode_Base11) {
    _inherits(SqlNode_Ret_Order, _SqlNode_Base11);

    function SqlNode_Ret_Order(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Ret_Order);

        var _this16 = _possibleConstructorReturn(this, (SqlNode_Ret_Order.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Order)).call(this, initData, parentNode, createHelper, SQLNODE_RET_ORDER, 'Order', false, nodeJson));

        autoBind(_this16);
        _this16.isConstNode = true;
        return _this16;
    }

    _createClass(SqlNode_Ret_Order, [{
        key: 'genInSocket',
        value: function genInSocket() {
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
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Ret_Order.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Order.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var sortColumns_arr = [];
            var selfCompileRet = new CompileResult(this);
            if (this.inputScokets_arr.length > 0) {
                var nodeThis = this;
                var thisNodeTitle = nodeThis.getNodeTitle();
                var usePreNodes_arr = preNodes_arr.concat(this);
                for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                    var socket = this.inputScokets_arr[i];
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                    if (tLinks.length == 0) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '有空输入']);
                        return false;
                    }
                    var link = tLinks[0];
                    var compileRet = link.outSocket.node.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    var compileData = compileRet.getSocketOut(link.outSocket);
                    sortColumns_arr.push({ name: compileData.strContent, type: socket.getExtra('orderType') });
                }
                var strContent = '';
                sortColumns_arr.forEach(function (x, i) {
                    strContent += (i == 0 ? '' : ',') + x.name + (x.type == OrderType_DESC ? ' desc' : '');
                });
                selfCompileRet.setDirectOut(strContent, sortColumns_arr.name);
            } else {
                selfCompileRet.setDirectOut('');
            }
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Ret_Order;
}(SqlNode_Base);

var SqlNode_Ret_Columns = function (_SqlNode_Base12) {
    _inherits(SqlNode_Ret_Columns, _SqlNode_Base12);

    function SqlNode_Ret_Columns(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Ret_Columns);

        var _this17 = _possibleConstructorReturn(this, (SqlNode_Ret_Columns.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Columns)).call(this, initData, parentNode, createHelper, SQLNODE_RET_COLUMNS, 'RET 列', false, nodeJson));

        autoBind(_this17);
        _this17.isConstNode = true;
        _this17.addFrameButton(FrameButton_LineSocket, '拉平');
        _this17.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');
        if (nodeJson) {
            _this17.inputScokets_arr.forEach(function (x) {
                x.inputable = false;
                x.type = SqlVarType_Scalar;
            });
        }
        if (parentNode.bluePrint.type == "标量值" && _this17.inputScokets_arr.length == 0) {
            _this17.inSocket = new NodeSocket('in0', _this17, true, { type: SqlVarType_Scalar, inputable: false });
            _this17.addSocket(_this17.inSocket);
        }
        return _this17;
    }

    _createClass(SqlNode_Ret_Columns, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Ret_Columns.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Ret_Columns.prototype), 'requestSaveAttrs', this).call(this);
            rlt.topValue = this.topValue;
            rlt.distChecked = this.distChecked;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['topValue', 'distChecked']);
        }
    }, {
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

var SqlNode_ConstValue = function (_SqlNode_Base13) {
    _inherits(SqlNode_ConstValue, _SqlNode_Base13);

    function SqlNode_ConstValue(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_ConstValue);

        var _this18 = _possibleConstructorReturn(this, (SqlNode_ConstValue.__proto__ || Object.getPrototypeOf(SqlNode_ConstValue)).call(this, initData, parentNode, createHelper, SQLNODE_CONSTVALUE, '常量', false, nodeJson));

        autoBind(_this18);

        if (nodeJson) {
            if (_this18.outputScokets_arr.length > 0) {
                _this18.outSocket = _this18.outputScokets_arr[0];
            }
        }
        if (_this18.outSocket == null) {
            _this18.outSocket = new NodeSocket('out', _this18, false);
            _this18.addSocket(_this18.outSocket);
        }
        _this18.outSocket.type = SqlVarType_Scalar;
        _this18.outSocket.inputable = true;
        _this18.headType = 'empty';

        var self = _this18;
        return _this18;
    }

    _createClass(SqlNode_ConstValue, [{
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
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_ConstValue.prototype.__proto__ || Object.getPrototypeOf(SqlNode_ConstValue.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var value = this.getValue();
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (IsEmptyString(value)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '无效值']);
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

    return SqlNode_ConstValue;
}(SqlNode_Base);

var SqlNode_Compare = function (_SqlNode_Base14) {
    _inherits(SqlNode_Compare, _SqlNode_Base14);

    function SqlNode_Compare(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Compare);

        var _this19 = _possibleConstructorReturn(this, (SqlNode_Compare.__proto__ || Object.getPrototypeOf(SqlNode_Compare)).call(this, initData, parentNode, createHelper, SQLNODE_COMPARE, '比较', false, nodeJson));

        autoBind(_this19);

        if (nodeJson) {
            if (_this19.outputScokets_arr.length > 0) {
                _this19.outSocket = _this19.outputScokets_arr[0];
                _this19.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (_this19.outSocket == null) {
            _this19.outSocket = new NodeSocket('out', _this19, false, { type: SqlVarType_Boolean });
            _this19.addSocket(_this19.outSocket);
        }
        _this19.insocketInitVal = {
            type: SqlVarType_Scalar
        };
        if (_this19.inputScokets_arr.length == 0) {
            _this19.addSocket(new NodeSocket('in0', _this19, true, { type: SqlVarType_Scalar }));
            _this19.addSocket(new NodeSocket('in1', _this19, true, { type: SqlVarType_Scalar }));
        } else {
            _this19.inputScokets_arr.forEach(function (socket) {
                socket.set(_this19.insocketInitVal);
            });
        }
        if (_this19.operator == null) {
            _this19.operator = '==';
        }
        return _this19;
    }

    _createClass(SqlNode_Compare, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Compare.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Compare.prototype), 'requestSaveAttrs', this).call(this);
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
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Compare.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Compare.prototype), 'compile', this).call(this, helper, preNodes_arr);
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
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    if (IsEmptyString(theSocket.defval)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                        return false;
                    }
                    tValue = theSocket.defval;
                    if (isNaN(tValue)) {
                        tValue = "'" + tValue + "'";
                    }
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = '(' + tValue + ')';
                    }
                }
                if (i == 0) {
                    socketVal1 = tValue;
                } else {
                    socketVal2 = tValue;
                }
            }

            var operator = this.operator;
            switch (operator) {
                case '==':
                    operator = '=';
                    break;
                case '!=':
                    operator = '<>';
                    break;
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, socketVal1 + operator + socketVal2);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Compare;
}(SqlNode_Base);

var SqlNodeTool_SynColumnNodeAlias = function () {
    function SqlNodeTool_SynColumnNodeAlias(srcNode, compareType, key, newAlias) {
        _classCallCheck(this, SqlNodeTool_SynColumnNodeAlias);

        this.srcNode = srcNode;
        this.compareType = compareType;
        this.key = key;
        this.newAlias = newAlias;
        this.meetMap = {};

        this.doSyn(srcNode);
    }

    _createClass(SqlNodeTool_SynColumnNodeAlias, [{
        key: 'doSyn',
        value: function doSyn(node) {
            if (this.meetMap[node.id]) {
                return;
            }
            if (node.type == SQLNODE_COLUMN) {
                var hited = false;
                switch (this.compareType) {
                    case 'code':
                        hited = node.tableCode == this.key;
                        break;
                    case 'alias':
                        hited = node.tableAlias == this.key;
                        break;
                }
                if (hited) {
                    node.tableAlias = this.newAlias;
                    node.freshSocketLabel();
                }
            } else if (node.nodes_arr && node.nodes_arr.length > 0) {
                // syn self
                for (var si in node.nodes_arr) {
                    var childNode = node.nodes_arr[si];
                    this.doSyn(childNode);
                }
            }
            if (node.parent == this.srcNode.parent && (node.type != SQLNODE_SELECT || node == this.srcNode)) {
                var outLinks = node.bluePrint.linkPool.getLinksByNode(node, 'o');
                for (var si in outLinks) {
                    this.doSyn(outLinks[si].inSocket.node);
                }
            }

            this.meetMap[node.id] = 1;
        }
    }]);

    return SqlNodeTool_SynColumnNodeAlias;
}();

var SqlNode_RowNumber = function (_SqlNode_Base15) {
    _inherits(SqlNode_RowNumber, _SqlNode_Base15);

    function SqlNode_RowNumber(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_RowNumber);

        var _this20 = _possibleConstructorReturn(this, (SqlNode_RowNumber.__proto__ || Object.getPrototypeOf(SqlNode_RowNumber)).call(this, initData, parentNode, createHelper, SQLNODE_ROWNUMBER, 'RowNumber', false, nodeJson));

        autoBind(_this20);

        if (nodeJson) {
            if (_this20.outputScokets_arr.length > 0) {
                _this20.outSocket = _this20.outputScokets_arr[0];
                _this20.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (_this20.outSocket == null) {
            _this20.outSocket = new NodeSocket('out', _this20, false, { type: SqlVarType_Scalar });
            _this20.addSocket(_this20.outSocket);
        }
        if (_this20.inputScokets_arr.length > 0) {
            _this20.inputScokets_arr.forEach(function (x) {
                x.inputable = false;
            });
        }
        return _this20;
    }

    _createClass(SqlNode_RowNumber, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_RowNumber.prototype.__proto__ || Object.getPrototypeOf(SqlNode_RowNumber.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {}
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
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var _this21 = this;

            var superRet = _get(SqlNode_RowNumber.prototype.__proto__ || Object.getPrototypeOf(SqlNode_RowNumber.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                    return false;
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = '(' + tValue + ')';
                    }
                }
                socketVal_arr.push(tValue);
            }
            var finalStr = 'ROW_NUMBER() over (order by ';
            if (socketVal_arr.length == 0) {
                finalStr += '(select 0))';
            } else {
                socketVal_arr.forEach(function (x, i) {
                    var orderType = _this21.inputScokets_arr[i].getExtra('orderType');
                    finalStr += (i == 0 ? '' : ',') + x + (orderType == OrderType_DESC ? ' desc' : '');
                });
                finalStr += ')';
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_RowNumber;
}(SqlNode_Base);

var SqlNode_IsNullFun = function (_SqlNode_Base16) {
    _inherits(SqlNode_IsNullFun, _SqlNode_Base16);

    function SqlNode_IsNullFun(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_IsNullFun);

        var _this22 = _possibleConstructorReturn(this, (SqlNode_IsNullFun.__proto__ || Object.getPrototypeOf(SqlNode_IsNullFun)).call(this, initData, parentNode, createHelper, SQLNODE_ISNULL, 'Isnull()', false, nodeJson));

        autoBind(_this22);

        if (nodeJson) {
            if (_this22.outputScokets_arr.length > 0) {
                _this22.outSocket = _this22.outputScokets_arr[0];
                _this22.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (_this22.outSocket == null) {
            _this22.outSocket = new NodeSocket('out', _this22, false, { type: SqlVarType_Scalar });
            _this22.addSocket(_this22.outSocket);
        }

        if (_this22.inputScokets_arr.length == 0) {
            _this22.addSocket(new NodeSocket('in0', _this22, true, { type: SqlVarType_Scalar, inputable: false }));
            _this22.addSocket(new NodeSocket('in1', _this22, true, { type: SqlVarType_Scalar, inputable: true }));
        } else {
            _this22.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
            });
            _this22.inputScokets_arr[0].inputable = false;
            _this22.inputScokets_arr[1].inputable = true;
        }

        return _this22;
    }

    _createClass(SqlNode_IsNullFun, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_IsNullFun.prototype.__proto__ || Object.getPrototypeOf(SqlNode_IsNullFun.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_IsNullFun.prototype.__proto__ || Object.getPrototypeOf(SqlNode_IsNullFun.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    if (i == 1) {
                        tValue = theSocket.defval;
                        if (!IsEmptyString(tValue)) {
                            if (isNaN(tValue)) {
                                tValue = singleQuotesStr(tValue);
                            }
                        }
                        if (IsEmptyString(tValue)) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                            return false;
                        }
                    }
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                }
                socketVal_arr.push(tValue);
            }
            var finalStr = 'ISNULL(';
            socketVal_arr.forEach(function (x, i) {
                finalStr += (i == 0 ? '' : ',') + x;
            });
            finalStr += ')';

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_IsNullFun;
}(SqlNode_Base);

var SqlNode_IsNullOperator = function (_SqlNode_Base17) {
    _inherits(SqlNode_IsNullOperator, _SqlNode_Base17);

    function SqlNode_IsNullOperator(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_IsNullOperator);

        var _this23 = _possibleConstructorReturn(this, (SqlNode_IsNullOperator.__proto__ || Object.getPrototypeOf(SqlNode_IsNullOperator)).call(this, initData, parentNode, createHelper, SQLNODE_ISNULLOPERATOR, 'IsNullOperator', false, nodeJson));

        autoBind(_this23);

        if (_this23.operator == null) {
            _this23.operator = SqlOperator_IsNull;
        }
        if (nodeJson) {
            if (_this23.outputScokets_arr.length > 0) {
                _this23.outSocket = _this23.outputScokets_arr[0];
                _this23.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (_this23.outSocket == null) {
            _this23.outSocket = new NodeSocket('out', _this23, false, { type: SqlVarType_Boolean });
            _this23.addSocket(_this23.outSocket);
        }

        if (_this23.inputScokets_arr.length == 0) {
            _this23.addSocket(new NodeSocket('in0', _this23, true, { type: SqlVarType_Scalar, inputable: false }));
        } else {
            _this23.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }

        return _this23;
    }

    _createClass(SqlNode_IsNullOperator, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_IsNullOperator.prototype.__proto__ || Object.getPrototypeOf(SqlNode_IsNullOperator.prototype), 'requestSaveAttrs', this).call(this);
            rlt.operator = this.operator;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsIsNull) {
            assginObjByProperties(this, attrsIsNull, ['operator']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    if (tValue == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                        return false;
                    }
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = '(' + tValue + ')';
                    }
                }
                socketVal_arr.push(tValue);
            }
            var finalStr = tValue + ' ' + this.operator;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_IsNullOperator;
}(SqlNode_Base);
/**
 * 逻辑运算符 and or not
 */


var SqlNode_Logical_Operator = function (_SqlNode_Base18) {
    _inherits(SqlNode_Logical_Operator, _SqlNode_Base18);

    function SqlNode_Logical_Operator(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Logical_Operator);

        var _this24 = _possibleConstructorReturn(this, (SqlNode_Logical_Operator.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Operator)).call(this, initData, parentNode, createHelper, SQLNODE_LOGICAL_OPERATOR, '逻辑', false, nodeJson));

        autoBind(_this24);

        if (_this24.LogicalType == null) {
            _this24.LogicalType = Logical_Operator_and;
        }

        if (nodeJson) {
            if (_this24.outputScokets_arr.length > 0) {
                _this24.outSocket = _this24.outputScokets_arr[0];
                _this24.outSocket.type = SqlVarType_Scalar;
            }
        } //给出标量
        if (_this24.outSocket == null) {
            _this24.outSocket = new NodeSocket('out', _this24, false, { type: SqlVarType_Table });
            _this24.addSocket(_this24.outSocket);
        }

        if (_this24.inputScokets_arr.length == 0) {
            _this24.addSocket(new NodeSocket('input1', _this24, true, { type: SqlVarType_Table, inputable: false }));
            _this24.addSocket(new NodeSocket('input2', _this24, true, { type: SqlVarType_Table, inputable: false }));
        } else {
            _this24.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
            });
            _this24.minInSocketCount = 2;
        }

        _this24.contextEntities_arr = [];
        _this24.entityNodes_arr = [];
        _this24.autoCreateHelper = {};
        return _this24;
    }

    _createClass(SqlNode_Logical_Operator, [{
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '逻辑:' + this.LogicalType;
        }
        //保存 and or

    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Logical_Operator.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Operator.prototype), 'requestSaveAttrs', this).call(this);
            rlt.LogicalType = this.LogicalType;
            return rlt;
        }
        //复原

    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['LogicalType']);
        }
        //增加输入接口

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
            return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.outSocket.defval;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Logical_Operator.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Operator.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入不能为空']);
                    return false;
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = '(' + tValue + ')';
                    }
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

    return SqlNode_Logical_Operator;
}(SqlNode_Base);

var SqlNode_Control_Api_Prop = function (_SqlNode_Base19) {
    _inherits(SqlNode_Control_Api_Prop, _SqlNode_Base19);

    function SqlNode_Control_Api_Prop(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Control_Api_Prop);

        var _this25 = _possibleConstructorReturn(this, (SqlNode_Control_Api_Prop.__proto__ || Object.getPrototypeOf(SqlNode_Control_Api_Prop)).call(this, initData, parentNode, createHelper, SQLNODE_CONTROL_API_PROP, 'CtlApiProp', false, nodeJson));

        autoBind(_this25);
        var apiItem = _this25.apiItem;
        var apiClass = _this25.apiClass;
        if (apiItem == null) {
            apiClass = g_controlApi_arr.find(function (e) {
                return e.ctltype == _this25.ctltype;
            });
            apiItem = apiClass.getApiItemByid(_this25.apiid);
            if (apiClass == null || apiItem == null) {
                console.error('查询控件api失败！');
            }
            _this25.apiClass = apiClass;
            _this25.apiItem = apiItem;
        }
        _this25.label = apiClass.ctllabel + '.' + apiItem.attrItem.label;
        if (nodeJson) {
            if (_this25.outputScokets_arr.length > 0) {
                _this25.outSocket = _this25.outputScokets_arr[0];
            }
            if (_this25.inputScokets_arr.length > 0) {
                _this25.inSocket = _this25.inputScokets_arr[0];
            }
        }
        if (_this25.inSocket == null) {
            _this25.inSocket = new NodeSocket('in', _this25, true);
            _this25.addSocket(_this25.inSocket);
        }
        _this25.inSocket.inputable = false;
        _this25.inSocket.type = SocketType_CtlKernel;
        _this25.inSocket.kernelType = apiClass.ctltype;

        if (_this25.outSocket == null) {
            _this25.outSocket = new NodeSocket('out', _this25, false);
            _this25.addSocket(_this25.outSocket);
        }
        _this25.outSocket.type = apiItem.attrItem.valueType;
        return _this25;
    }

    _createClass(SqlNode_Control_Api_Prop, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Control_Api_Prop.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Control_Api_Prop.prototype), 'requestSaveAttrs', this).call(this);
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
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Control_Api_Prop.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Control_Api_Prop.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();

            var selectedCtlid = this.inSocket.getExtra('ctlid');
            var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
            if (selectedKernel == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要选择控件']);
                return false;
            }
            var relCtlKernel = this.bluePrint.ctlKernel;
            var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
            if (canAccessCtls_arr.indexOf(selectedKernel) == -1) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '指定的控件不可访问']);
                return false;
            }
            helper.addUseControlPropApi(selectedKernel, this.apiItem);

            var finalStr = '@' + selectedCtlid + '_' + this.apiItem.stateName;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Control_Api_Prop;
}(SqlNode_Base);

var EnvVariable = {
    userid: 'ENV:用户代码',
    username: 'ENV:用户姓名',
    workRegionCode: 'ENV:常驻工作地域代码',
    companyCode: 'ENV:所属公司名称代码',
    wokerTypeCode: 'ENV:员工工时状态代码',
    departmentCode: 'ENV:所属部门名称代码',
    systemCode: 'ENV:所属系统名称代码',
    nowDate: 'ENV:当前日期',
    nowTime: 'ENV:当前日期时间'
};

var EnvVariables_arr = [];
for (var ei in EnvVariable) {
    EnvVariables_arr.push({ text: EnvVariable[ei], value: ei });
}

var SqlNode_Env_Var = function (_SqlNode_Base20) {
    _inherits(SqlNode_Env_Var, _SqlNode_Base20);

    function SqlNode_Env_Var(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Env_Var);

        var _this26 = _possibleConstructorReturn(this, (SqlNode_Env_Var.__proto__ || Object.getPrototypeOf(SqlNode_Env_Var)).call(this, initData, parentNode, createHelper, SQLNODE_ENV_VAR, '环境变量', false, nodeJson));

        autoBind(_this26);

        if (nodeJson) {
            if (_this26.outputScokets_arr.length > 0) {
                _this26.outSocket = _this26.outputScokets_arr[0];
            }
        }
        if (_this26.outSocket == null) {
            _this26.outSocket = new NodeSocket('out', _this26, false);
            _this26.addSocket(_this26.outSocket);
        }
        _this26.outSocket.type = SqlVarType_Scalar;
        _this26.outSocket.inputable = true;
        _this26.outSocket.inputDDC_setting = {
            options_arr: EnvVariables_arr,
            textAttrName: 'text',
            valueAttrName: 'value'
        };
        _this26.headType = 'empty';

        var self = _this26;
        return _this26;
    }

    _createClass(SqlNode_Env_Var, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Env_Var.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Env_Var.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var enName = this.outSocket.defval;
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (EnvVariable[enName] == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '无效值']);
                return false;
            }

            var selfCompileRet = new CompileResult(this);
            switch (EnvVariable[enName]) {
                case EnvVariable.userid:
                case EnvVariable.username:
                case EnvVariable.workRegionCode:
                case EnvVariable.companyCode:
                case EnvVariable.wokerTypeCode:
                case EnvVariable.departmentCode:
                case EnvVariable.systemCode:
                    helper.addUseEnvVars(enName);
                    selfCompileRet.setSocketOut(this.outSocket, '@' + enName);
                    break;
                default:
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不支持的环境变量:' + enName]);
                    return false;
            }

            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Env_Var;
}(SqlNode_Base);

var SqlNode_CurrentDataRow = function (_SqlNode_Base21) {
    _inherits(SqlNode_CurrentDataRow, _SqlNode_Base21);

    function SqlNode_CurrentDataRow(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_CurrentDataRow);

        var _this27 = _possibleConstructorReturn(this, (SqlNode_CurrentDataRow.__proto__ || Object.getPrototypeOf(SqlNode_CurrentDataRow)).call(this, initData, parentNode, createHelper, SQLNODE_CURRENTDATAROW, '作用域数据行', false, nodeJson));

        autoBind(_this27);
        _this27.addFrameButton(FrameButton_ClearEmptyOutputSocket, '清理');
        return _this27;
    }

    _createClass(SqlNode_CurrentDataRow, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_CurrentDataRow.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CurrentDataRow.prototype), 'requestSaveAttrs', this).call(this);
            rlt.formID = this.formID;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['formID']);
        }
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
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_CurrentDataRow.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CurrentDataRow.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();

            var formKernel = this.bluePrint.master.project.getControlById(this.formID);
            if (this.checkCompileFlag(formKernel == null, this.formID + '没找到！', helper)) {
                return false;
            }
            var theDS = formKernel.getAttribute(AttrNames.DataSource);
            if (this.checkCompileFlag(theDS == null, '关联Form没有数据源！', helper)) {
                return false;
            }

            var selfCompileRet = new CompileResult(this);
            helper.setCompileRetCache(this, selfCompileRet);

            var columns_arr = [];
            for (var si in this.outputScokets_arr) {
                var outSocket = this.outputScokets_arr[si];
                var columnName = outSocket.getExtra('colName');
                var columnVar = theDS.code + '_' + columnName;
                if (this.checkCompileFlag(theDS.getColumnByName(columnName) == null, columnName + '不是数据源中的有效列名', helper)) {
                    return false;
                }
                selfCompileRet.setSocketOut(outSocket, '@' + columnVar);
                columns_arr.push(columnName);
            }
            helper.addUseFormDS(formKernel, columns_arr);

            return selfCompileRet;
        }
    }]);

    return SqlNode_CurrentDataRow;
}(SqlNode_Base);

SqlNodeClassMap[SQLNODE_DBENTITY] = {
    modelClass: SqlNode_DBEntity,
    comClass: C_SqlNode_DBEntity
};
SqlNodeClassMap[SQLNODE_SELECT] = {
    modelClass: SqlNode_Select,
    comClass: C_SqlNode_Select
};
SqlNodeClassMap[SQLNODE_VAR_GET] = {
    modelClass: SqlNode_Var_Get,
    comClass: C_SqlNode_Var_Get
};
SqlNodeClassMap[SQLNODE_VAR_SET] = {
    modelClass: SqlNode_Var_Set,
    comClass: C_SqlNode_Var_Set
};
SqlNodeClassMap[SQLNODE_NOPERAND] = {
    modelClass: SqlNode_NOperand,
    comClass: C_SqlNode_NOperand
};
SqlNodeClassMap[SQLNODE_COLUMN] = {
    modelClass: SqlNode_Column,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_XJOIN] = {
    modelClass: SqlNode_XJoin,
    comClass: C_SqlNode_XJoin
};
SqlNodeClassMap[SQLNODE_DBENTITY_COLUMNSELECTOR] = {
    modelClass: SqlNode_DBEntity_ColumnSelector,
    comClass: C_SqlNode_DBEntity_ColumnSelector
};
SqlNodeClassMap[SQLNODE_RET_CONDITION] = {
    modelClass: SqlNode_Ret_Condition,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_RET_COLUMNS] = {
    modelClass: SqlNode_Ret_Columns,
    comClass: C_SqlNode_Ret_Columns
};
SqlNodeClassMap[SQLNODE_RET_ORDER] = {
    modelClass: SqlNode_Ret_Order,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_CONSTVALUE] = {
    modelClass: SqlNode_ConstValue,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_COMPARE] = {
    modelClass: SqlNode_Compare,
    comClass: C_SqlNode_Compare
};
SqlNodeClassMap[SQLNODE_ROWNUMBER] = {
    modelClass: SqlNode_RowNumber,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_ISNULL] = {
    modelClass: SqlNode_IsNullFun,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_ISNULLOPERATOR] = {
    modelClass: SqlNode_IsNullOperator,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_LOGICAL_OPERATOR] = {
    modelClass: SqlNode_Logical_Operator,
    comClass: C_SqlNode_Logical_Operator
};
SqlNodeClassMap[SQLDEF_VAR] = {
    modelClass: SqlDef_Variable,
    comClass: C_Node_SimpleNode
};

SqlNodeClassMap[SQLNODE_CONTROL_API_PROP] = {
    modelClass: SqlNode_Control_Api_Prop,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_ENV_VAR] = {
    modelClass: SqlNode_Env_Var,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_CURRENTDATAROW] = {
    modelClass: SqlNode_CurrentDataRow,
    comClass: C_JSNode_CurrentDataRow
};