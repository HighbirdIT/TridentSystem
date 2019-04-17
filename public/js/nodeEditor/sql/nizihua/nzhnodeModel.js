'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SQLNODE_EXISTS = 'exists';
var SQLNODE_CASE_WHEN = 'case_when';
var SQLNODE_CW_WHEN = 'cw_when';
var SQLNODE_CW_ELSE = 'cw_else';
var SQLNODE_GETDATE = 'getdate';
var SQLNODE_LOGICAL_NOT = 'logical_not';
var SQLNODE_IN_OPERATOR = 'in_operator';
var SQLNODE_TOSTRING = 'makestring';
var SQLNODE_UNION = 'union';
var SQLNODE_CASEWHEN = 'casewhen';
var SQLNODE_FBSOURCE = 'fbsource';

SQL_OutSimpleValueNode_arr.push(SQLNODE_GETDATE);

//exists

var SqlNode_Exists = function (_SqlNode_Base) {
    _inherits(SqlNode_Exists, _SqlNode_Base);

    function SqlNode_Exists(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Exists);

        var _this = _possibleConstructorReturn(this, (SqlNode_Exists.__proto__ || Object.getPrototypeOf(SqlNode_Exists)).call(this, initData, parentNode, createHelper, SQLNODE_EXISTS, 'exists', false, nodeJson));

        autoBind(_this);

        if (_this.operator == null) {
            _this.operator = 'exists';
        }
        if (nodeJson) {
            if (_this.outputScokets_arr.length > 0) {
                _this.outSocket = _this.outputScokets_arr[0];
                _this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (_this.outSocket == null) {
            _this.outSocket = new NodeSocket('out', _this, false, { type: SqlVarType_Scalar });
            _this.addSocket(_this.outSocket);
        }
        if (_this.inputScokets_arr.length == 0) {
            _this.addSocket(new NodeSocket('in', _this, true, { type: SqlVarType_Scalar, inputable: false }));
        } else {
            _this.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
        return _this;
    }
    //保存


    _createClass(SqlNode_Exists, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Exists.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Exists.prototype), 'requestSaveAttrs', this).call(this);
            rlt.operator = this.operator;
            return rlt;ss;
        }
        //复原

    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['operator']);
        }

        //exists语句编译

    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Exists.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Exists.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inputScokets_arr[0];
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
            }
            var finalStr = this.operator + '(' + tValue + ')';
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Exists;
}(SqlNode_Base);

/*
    case when

*/


var SqlNode_Case_When = function (_SqlNode_Base2) {
    _inherits(SqlNode_Case_When, _SqlNode_Base2);

    function SqlNode_Case_When(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Case_When);

        var _this2 = _possibleConstructorReturn(this, (SqlNode_Case_When.__proto__ || Object.getPrototypeOf(SqlNode_Case_When)).call(this, initData, parentNode, createHelper, SQLNODE_CASE_WHEN, 'case_when', false, nodeJson));

        autoBind(_this2);

        if (nodeJson) {
            if (_this2.outputScokets_arr.length > 0) {
                _this2.outSocket = _this2.outputScokets_arr[0];
                _this2.outSocket.type = SqlVarType_Scalar;
            }
        } //给出标量
        if (_this2.outSocket == null) {
            _this2.outSocket = new NodeSocket('out', _this2, false, { type: SqlVarType_Scalar });
            _this2.addSocket(_this2.outSocket);
        }

        if (_this2.inputScokets_arr.length == 0) {
            _this2.addSocket(new NodeSocket('input1', _this2, true, { type: SqlVarType_Scalar, inputable: false }));
            _this2.addSocket(new NodeSocket('input2', _this2, true, { type: SqlVarType_Scalar, inputable: false }));
        } else {
            _this2.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
            _this2.minInSocketCount = 1;
        }

        _this2.contextEntities_arr = [];
        _this2.entityNodes_arr = [];
        _this2.autoCreateHelper = {};

        return _this2;
    }

    _createClass(SqlNode_Case_When, [{
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'case when';
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Case_When.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Case_When.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
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
            var superRet = _get(SqlNode_Case_When.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Case_When.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];
            /*if(this.inputScokets_arr.length < 1){
              helper.logManager.errorEx([helper.logManager.createBadgeItem(
                  thisNodeTitle
                  , nodeThis
                  , helper.clickLogBadgeItemHandler)
                  , '缺少when条件或者else条件输入']);
              return false;
             }*/

            var tValue_else = null;
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

                    var nodetype = outNode.type;
                    //||outNode.getNodeTitle() !='cw_else'
                    if (nodetype != 'cw_when' && nodetype != 'cw_else') {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能输入除了when和else以外节点']);
                        return false;
                    }
                    if (nodetype == 'cw_when') {
                        tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    }
                    if (tValue_else != null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '只能输入一次else节点']);
                        return false;
                    } else {
                        if (nodetype == 'cw_else') {
                            tValue_else = compileRet.getSocketOut(link.outSocket).strContent;
                        }
                    }

                    /*if (!outNode.outputIsSimpleValue()) {
                        tValue = '' + tValue + '';
                        }*/
                }
                if (tValue != null) {
                    socketVal_arr.push(tValue);
                }
            }
            var finalSql = '';
            socketVal_arr.forEach(function (x, i) {
                finalSql += x;
            });
            finalSql = 'case ' + finalSql + ' else ' + tValue_else + ' end ';
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Case_When;
}(SqlNode_Base);
/**
 *     when
 */


var SqlNode_CW_When = function (_SqlNode_Base3) {
    _inherits(SqlNode_CW_When, _SqlNode_Base3);

    function SqlNode_CW_When(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_CW_When);

        var _this3 = _possibleConstructorReturn(this, (SqlNode_CW_When.__proto__ || Object.getPrototypeOf(SqlNode_CW_When)).call(this, initData, parentNode, createHelper, SQLNODE_CW_WHEN, 'then', false, nodeJson));

        autoBind(_this3);

        if (nodeJson) {
            if (_this3.outputScokets_arr.length > 0) {
                _this3.outSocket = _this3.outputScokets_arr[0];
                _this3.outSocket.type = SqlVarType_Scalar;
            }
        } //给出标量
        if (_this3.outSocket == null) {
            _this3.outSocket = new NodeSocket('out', _this3, false, { type: SqlVarType_Scalar });
            _this3.addSocket(_this3.outSocket);
        }

        if (_this3.inputScokets_arr.length == 0) {
            _this3.addSocket(new NodeSocket('input1', _this3, true, { type: SqlVarType_Boolean, inputable: false }));
            _this3.addSocket(new NodeSocket('input2', _this3, true, { type: SqlVarType_Scalar, inputable: true }));
        } else {
            _this3.inputScokets_arr.forEach(function (socket) {
                if (socket.type == SqlVarType_Boolean) {
                    socket.type = SqlVarType_Boolean;
                    socket.inputable = false;
                } else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }
        return _this3;
    }

    _createClass(SqlNode_CW_When, [{
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'then';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_CW_When.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CW_When.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);

            var first_socket = this.inputScokets_arr[0];
            var first_socketlinks = this.bluePrint.linkPool.getLinksBySocket(first_socket);
            if (first_socketlinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第一个输入不能为空']);
                return false;
            }
            var firstvalue = '';
            var firstLink = first_socketlinks[0];
            var firstoutNode = firstLink.outSocket.node;
            var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
            if (firstLink.outSocket.type != SqlVarType_Boolean) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '应该输入一个boolean值']);
                return false;
            }
            if (firstcompileRet == false) {
                // child compile fail
                return false;
            }
            firstvalue = firstcompileRet.getSocketOut(firstLink.outSocket).strContent;
            if (!firstoutNode.outputIsSimpleValue()) {
                firstvalue = '' + firstvalue + '';
            }

            var finalSql = '';

            var socket = this.inputScokets_arr[1];
            var tValue = null;
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);

            if (tLinks.length == 0) {
                if (!IsEmptyString(socket.defval)) {
                    tValue = socket.defval; // 判断手输入值
                    if (isNaN(tValue)) {
                        tValue = singleQuotesStr(tValue);
                    }
                }
                if (tValue == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能有空输入']);
                    return false;
                }
            } else {
                var theLink = tLinks[0];
                var outNode = theLink.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    // child compile fail
                    return false;
                }
                tValue = compileRet.getSocketOut(theLink.outSocket).strContent;
                if (!outNode.outputIsSimpleValue()) {
                    tValue = '' + tValue + '';
                }
            }
            finalSql = 'when ' + firstvalue + ' then ' + tValue;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_CW_When;
}(SqlNode_Base);
/**
 *  else
 */

var SqlNode_CW_Else = function (_SqlNode_Base4) {
    _inherits(SqlNode_CW_Else, _SqlNode_Base4);

    function SqlNode_CW_Else(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_CW_Else);

        var _this4 = _possibleConstructorReturn(this, (SqlNode_CW_Else.__proto__ || Object.getPrototypeOf(SqlNode_CW_Else)).call(this, initData, parentNode, createHelper, SQLNODE_CW_ELSE, 'else', false, nodeJson));

        autoBind(_this4);

        if (nodeJson) {
            if (_this4.outputScokets_arr.length > 0) {
                _this4.outSocket = _this4.outputScokets_arr[0];
                _this4.outSocket.type = SqlVarType_Scalar;
            }
        } //给出标量
        if (_this4.outSocket == null) {
            _this4.outSocket = new NodeSocket('out', _this4, false, { type: SqlVarType_Scalar });
            _this4.addSocket(_this4.outSocket);
        }

        if (_this4.inputScokets_arr.length == 0) {
            _this4.addSocket(new NodeSocket('input1', _this4, true, { type: SqlVarType_Scalar, inputable: true }));
        } else {
            _this4.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
            });
        }

        _this4.contextEntities_arr = [];
        _this4.entityNodes_arr = [];
        _this4.autoCreateHelper = {};
        return _this4;
    }

    _createClass(SqlNode_CW_Else, [{
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'else';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_CW_Else.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CW_Else.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inputScokets_arr[0];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (!IsEmptyString(theSocket.defval)) {
                    tValue = theSocket.defval; // 判断手输入值
                    if (isNaN(tValue)) {
                        tValue = singleQuotesStr(tValue);
                    }
                }
                if (tValue == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), 'else条件不能有空输入']);
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
            }
            var finalStr = tValue;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_CW_Else;
}(SqlNode_Base);

/**
 * 获取当前时间
 */

var SqlNode_Getdate = function (_SqlNode_Base5) {
    _inherits(SqlNode_Getdate, _SqlNode_Base5);

    function SqlNode_Getdate(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Getdate);

        var _this5 = _possibleConstructorReturn(this, (SqlNode_Getdate.__proto__ || Object.getPrototypeOf(SqlNode_Getdate)).call(this, initData, parentNode, createHelper, SQLNODE_GETDATE, 'Getdate', false, nodeJson));

        autoBind(_this5);

        if (nodeJson) {
            if (_this5.outputScokets_arr.length > 0) {
                _this5.outSocket = _this5.outputScokets_arr[0];
                _this5.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (_this5.outSocket == null) {
            _this5.outSocket = new NodeSocket('out', _this5, false);
            _this5.addSocket(_this5.outSocket);
        }
        return _this5;
    }

    _createClass(SqlNode_Getdate, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Getdate.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Getdate.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {}
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Getdate.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Getdate.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var value = "getdate()";
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, value);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Getdate;
}(SqlNode_Base);

/**
 * 逻辑运算符  not
 */


var SqlNode_Logical_Not = function (_SqlNode_Base6) {
    _inherits(SqlNode_Logical_Not, _SqlNode_Base6);

    function SqlNode_Logical_Not(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Logical_Not);

        var _this6 = _possibleConstructorReturn(this, (SqlNode_Logical_Not.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Not)).call(this, initData, parentNode, createHelper, SQLNODE_LOGICAL_NOT, 'not', false, nodeJson));

        autoBind(_this6);

        if (nodeJson) {
            if (_this6.outputScokets_arr.length > 0) {
                _this6.outSocket = _this6.outputScokets_arr[0];
                _this6.outSocket.type = SqlVarType_Boolean;
            }
        } //给出标量
        if (_this6.outSocket == null) {
            _this6.outSocket = new NodeSocket('out', _this6, false, { type: SqlVarType_Boolean, inputable: false });
            _this6.addSocket(_this6.outSocket);
        }

        if (_this6.inputScokets_arr.length == 0) {
            _this6.addSocket(new NodeSocket('input1', _this6, true, { type: SqlVarType_Scalar, inputable: false }));
        } else {
            _this6.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
        return _this6;
    }

    _createClass(SqlNode_Logical_Not, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return '逻辑:not';
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Logical_Not.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Not.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
        //复原

    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            //assginObjByProperties(this, attrsJson, ['LogicalType']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Logical_Not.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Logical_Not.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var selectCs_arr = [];
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

                    tValue = compileRet.getSocketOut(link.outSocket);
                }
                if (!outNode.outputIsSimpleValue()) {
                    tValue = ' (' + tValue + ')';
                }
            }

            var finalStr = ' not ' + tValue;
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Logical_Not;
}(SqlNode_Base);

/*
   操作符 in
*/

var SqlNode_In_Operator = function (_SqlNode_Base7) {
    _inherits(SqlNode_In_Operator, _SqlNode_Base7);

    function SqlNode_In_Operator(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_In_Operator);

        var _this7 = _possibleConstructorReturn(this, (SqlNode_In_Operator.__proto__ || Object.getPrototypeOf(SqlNode_In_Operator)).call(this, initData, parentNode, createHelper, SQLNODE_IN_OPERATOR, 'In', false, nodeJson));

        autoBind(_this7);

        if (nodeJson) {
            if (_this7.outputScokets_arr.length > 0) {
                _this7.outSocket = _this7.outputScokets_arr[0];
                _this7.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (_this7.outSocket == null) {

            _this7.outSocket = new NodeSocket('out', _this7, false, { type: SqlVarType_Boolean });
            _this7.addSocket(_this7.outSocket);
        }

        if (_this7.inputScokets_arr.length != 0) {
            var self = _this7;
            _this7.inputScokets_arr.forEach(function (socket, i) {

                if (socket.type == SqlVarType_Table) {
                    self.tablesocket = socket;
                } else if (socket.type != SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        } else {
            _this7.addSocket(new NodeSocket('ziduan', _this7, true, { type: SqlVarType_Scalar, inputable: false }));
            _this7.minInSocketCount = 2;
        }
        if (_this7.tablesocket == null) {
            _this7.tablesocket = _this7.addSocket(new NodeSocket('intable', _this7, true, { type: SqlVarType_Table }));
        }
        return _this7;
    }

    _createClass(SqlNode_In_Operator, [{
        key: 'genInSocket',
        value: function genInSocket() {
            return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_In_Operator.prototype.__proto__ || Object.getPrototypeOf(SqlNode_In_Operator.prototype), 'requestSaveAttrs', this).call(this);
            //rlt.joinType = this.joinType;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            //assginObjByProperties(this, attrsJson, ['joinType']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_In_Operator.prototype.__proto__ || Object.getPrototypeOf(SqlNode_In_Operator.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketOuts_arr = [];

            var first_socket = this.inputScokets_arr[0];
            var first_socketlinks = this.bluePrint.linkPool.getLinksBySocket(first_socket);
            if (first_socketlinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第一个输入不能为空']);
                return false;
            }
            var firstvalue = '';
            var firstLink = first_socketlinks[0];
            var firstoutNode = firstLink.outSocket.node;
            var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
            if (firstcompileRet == false) {
                // child compile fail
                return false;
            }
            if (this.inputScokets_arr[0].type == SqlVarType_Table) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '第一个输入不得为table类型']);
                return false;
            }
            firstvalue = firstcompileRet.getSocketOut(firstLink.outSocket).strContent;
            if (!firstoutNode.outputIsSimpleValue()) {
                firstvalue = ' (' + firstvalue + ')';
            }

            var finalSql = '';
            var tablesocketlinks = this.bluePrint.linkPool.getLinksBySocket(this.tablesocket);
            if (tablesocketlinks.length != 0) {
                var theLink = tablesocketlinks[0]; //insocket 只有一个输入值
                var outNode = theLink.outSocket.node; //一根线 指向另一端输出端口
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    // child compile fail
                    return false;
                }
                var socketOut = compileRet.getSocketOut(theLink.outSocket).strContent;
                finalSql = firstvalue + ' in ( ' + socketOut + ' ) ';
            } else {
                var socketOutstrs_arr = [];

                for (var i = 1; i < this.inputScokets_arr.length; ++i) {
                    var socket = this.inputScokets_arr[i];
                    if (socket == this.tablesocket) {
                        continue;
                    }
                    var tValue = null;
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);

                    if (tLinks.length == 0) {
                        if (!IsEmptyString(socket.defval)) {
                            tValue = socket.defval; // 判断手输入值
                            if (isNaN(tValue)) {
                                tValue = singleQuotesStr(tValue);
                            }
                        }
                        if (tValue == null && socket.type != SqlVarType_Table) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '不能有空输入']);
                            return false;
                        }
                    } else {
                        var theLink = tLinks[0];
                        var outNode = theLink.outSocket.node;
                        var compileRet = outNode.compile(helper, usePreNodes_arr);
                        if (compileRet == false) {
                            // child compile fail
                            return false;
                        }
                        tValue = compileRet.getSocketOut(theLink.outSocket).strContent;
                        if (!outNode.outputIsSimpleValue()) {
                            tValue = ' (' + tValue + ')';
                        }
                    }
                    socketOutstrs_arr.push(tValue);
                }
                if (socketOutstrs_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '至少输入一个 in 条件']);
                    return false;
                }
                finalSql = firstvalue + ' in ( ' + socketOutstrs_arr.join(',') + ' ) ';
            }

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_In_Operator;
}(SqlNode_Base);

/*
   拼接字符串
*/


var SqlNode_ToString = function (_SqlNode_Base8) {
    _inherits(SqlNode_ToString, _SqlNode_Base8);

    function SqlNode_ToString(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_ToString);

        var _this8 = _possibleConstructorReturn(this, (SqlNode_ToString.__proto__ || Object.getPrototypeOf(SqlNode_ToString)).call(this, initData, parentNode, createHelper, SQLNODE_TOSTRING, 'makestring()', false, nodeJson));

        autoBind(_this8);

        if (nodeJson) {
            if (_this8.outputScokets_arr.length > 0) {
                _this8.outSocket = _this8.outputScokets_arr[0];
                _this8.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (_this8.outSocket == null) {
            _this8.outSocket = new NodeSocket('out', _this8, false, { type: SqlVarType_Scalar });
            _this8.addSocket(_this8.outSocket);
        }

        if (_this8.inputScokets_arr.length == 0) {
            _this8.addSocket(new NodeSocket('input1', _this8, true, { type: SqlVarType_Scalar, inputable: true }));
        } else {
            _this8.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = true;
            });
        }

        return _this8;
    }

    _createClass(SqlNode_ToString, [{
        key: 'genInSocket',
        value: function genInSocket() {
            return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_ToString.prototype.__proto__ || Object.getPrototypeOf(SqlNode_ToString.prototype), 'requestSaveAttrs', this).call(this);
            //rlt.joinType = this.joinType;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            //assginObjByProperties(this, attrsJson, ['joinType']);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_ToString.prototype.__proto__ || Object.getPrototypeOf(SqlNode_ToString.prototype), 'compile', this).call(this, helper, preNodes_arr);
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
                    tValue = theSocket.defval.replace(/\'/g, '');
                    tValue = "'" + tValue + "'";
                } else {
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue = compileRet.getSocketOut(link.outSocket).strContent; //.replace(/\'/g, '');
                    //if(tValue.outputIsSimpleValue()){
                    //  tValue= '' + tValue+''
                    //}
                }
                socketVal_arr.push(tValue);
            }
            var finalStr = '';
            socketVal_arr.forEach(function (x, i) {
                finalStr += (i == 0 ? '' : '+') + x;
            });
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_ToString;
}(SqlNode_Base);

var SqlNode_Union = function (_SqlNode_Base9) {
    _inherits(SqlNode_Union, _SqlNode_Base9);

    function SqlNode_Union(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_Union);

        var _this9 = _possibleConstructorReturn(this, (SqlNode_Union.__proto__ || Object.getPrototypeOf(SqlNode_Union)).call(this, initData, parentNode, createHelper, SQLNODE_UNION, 'union', false, nodeJson));

        autoBind(_this9);

        if (_this9.unionType == null) {
            _this9.unionType = 'union';
        }

        if (nodeJson) {
            if (_this9.outputScokets_arr.length > 0) {
                _this9.outSocket = _this9.outputScokets_arr[0];
                _this9.outSocket.type = SqlVarType_Table;
            }
        }
        if (_this9.outSocket == null) {
            _this9.outSocket = new NodeSocket('out', _this9, false, { type: SqlVarType_Table });
            _this9.addSocket(_this9.outSocket);
        }

        if (_this9.inputScokets_arr.length == 0) {
            _this9.addSocket(new NodeSocket('input1', _this9, true, { type: SqlVarType_Table, inputable: false }));
            _this9.addSocket(new NodeSocket('input2', _this9, true, { type: SqlVarType_Table, inputable: false }));
        } else {
            _this9.inputScokets_arr.forEach(function (socket) {
                if (socket.type == SqlVarType_Table) {
                    socket.type = SqlVarType_Table;
                    socket.inputable = false;
                } else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }

        _this9.contextEntities_arr = [];
        _this9.entityNodes_arr = [];
        _this9.autoCreateHelper = {};
        return _this9;
    }

    _createClass(SqlNode_Union, [{
        key: 'genInSocket',
        value: function genInSocket() {
            var nameI = this.inputScokets_arr.length;
            while (nameI < 999) {
                if (this.getScoketByName('in' + nameI, true) == null) {
                    break;
                }
                ++nameI;
            }
            return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Table, inputable: false });
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_Union.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Union.prototype), 'requestSaveAttrs', this).call(this);
            rlt.unionType = this.unionType;
            return rlt;
        }
    }, {
        key: 'restorFromAttrs',
        value: function restorFromAttrs(attrsJson) {
            assginObjByProperties(this, attrsJson, ['unionType']);
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'union';
        }
    }, {
        key: 'getContext',
        value: function getContext(finder, depth) {
            var firstSocket = this.inputScokets_arr[0];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(firstSocket);
            if (tLinks.length == 0) {
                return;
            }
            var temLink = tLinks[0];
            var outNode = temLink.outSocket.node;
            if (outNode.type != SQLNODE_SELECT) {
                return;
            }
            return outNode.getContext(finder, depth + 1);
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_Union.prototype.__proto__ || Object.getPrototypeOf(SqlNode_Union.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketVal_arr = [];

            var colName_number = null;
            var firstColumname_arr = [];

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
                    var column_name_arr = compileRet.getSocketOut(link.outSocket).data.columsName_arr;
                    if (i == 0) {
                        firstColumname_arr = column_name_arr;
                    }
                    if (column_name_arr.length != colName_number && colName_number != null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入列出现不相同数目']);
                        return false;
                    }
                    colName_number = column_name_arr.length;
                }
                socketVal_arr.push(tValue);
            }
            var theoutsocket = this.outputScokets_arr[0];
            var outLinks = this.bluePrint.linkPool.getLinksBySocket(theoutsocket);
            if (outLinks.length != 0) {
                var inNode = outLinks[0].inSocket.node;
                var inSocketype = inNode.type;
                if (inSocketype != SQLNODE_SELECT) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入连接必须是select节点']);
                    return false;
                }
            }
            var finalStr = '';
            socketVal_arr.forEach(function (x, i) {
                finalStr += (i == 0 ? '' : ' ' + nodeThis.unionType + ' ') + x;
            });
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, finalStr, { columnsName_arr: firstColumname_arr });
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_Union;
}(SqlNode_Base);

/*
    case when(*)

*/


var SqlNode_CaseWhen = function (_SqlNode_Base10) {
    _inherits(SqlNode_CaseWhen, _SqlNode_Base10);

    function SqlNode_CaseWhen(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_CaseWhen);

        var _this10 = _possibleConstructorReturn(this, (SqlNode_CaseWhen.__proto__ || Object.getPrototypeOf(SqlNode_CaseWhen)).call(this, initData, parentNode, createHelper, SQLNODE_CASEWHEN, 'case_when(*)', false, nodeJson));

        autoBind(_this10);

        if (nodeJson) {
            if (_this10.outputScokets_arr.length > 0) {
                _this10.outSocket = _this10.outputScokets_arr[0];
                _this10.outSocket.type = SqlVarType_Boolean;
            }
        } //给出标量
        if (_this10.outSocket == null) {
            _this10.outSocket = new NodeSocket('out', _this10, false, { type: SqlVarType_Boolean });
            _this10.addSocket(_this10.outSocket);
        }

        if (_this10.inputScokets_arr.length == 0) {
            _this10.addSocket(new NodeSocket('input1', _this10, true, { type: SqlVarType_Scalar, inputable: false }));
            _this10.addSocket(new NodeSocket('input2', _this10, true, { type: SqlVarType_Scalar, inputable: false }));
        } else {
            _this10.inputScokets_arr.forEach(function (socket) {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
        var inputLabels_arr = ['列名', '变量'];
        _this10.inputScokets_arr.forEach(function (soket, i) {
            soket.label = inputLabels_arr[i];
        });
        return _this10;
    }

    _createClass(SqlNode_CaseWhen, [{
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            return null;
        }
    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'case when(*)';
        }
    }, {
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_CaseWhen.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CaseWhen.prototype), 'requestSaveAttrs', this).call(this);
            return rlt;
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr) {
            var superRet = _get(SqlNode_CaseWhen.prototype.__proto__ || Object.getPrototypeOf(SqlNode_CaseWhen.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var tValue = null;
            var column_value = null;
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);

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
                    if (i == 0) {
                        column_value = compileRet.getSocketOut(link.outSocket).strContent;
                    } else {
                        tValue = compileRet.getSocketOut(link.outSocket).strContent;
                    }
                }
            }
            var finalSql = '';
            finalSql = 'case when ' + tValue + "='*'" + ' then 1 when ' + column_value + '=' + tValue + ' then 1 else 0 end=1 ';
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_CaseWhen;
}(SqlNode_Base);

var SqlNode_FbSource = function (_SqlNode_Base11) {
    _inherits(SqlNode_FbSource, _SqlNode_Base11);

    function SqlNode_FbSource(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, SqlNode_FbSource);

        var _this11 = _possibleConstructorReturn(this, (SqlNode_FbSource.__proto__ || Object.getPrototypeOf(SqlNode_FbSource)).call(this, initData, parentNode, createHelper, SQLNODE_FBSOURCE, 'FB', false, nodeJson));

        autoBind(_this11);

        if (nodeJson) {
            if (_this11.outputScokets_arr.length > 0) {
                _this11.outSocket = _this11.outputScokets_arr[0];
                _this11.outSocket.type = SqlVarType_Scalar;
            }
        } else {
            _this11.outSocket = new NodeSocket('out', _this11, false, { type: SqlVarType_Scalar });
            _this11.addSocket(_this11.outSocket);
        }

        if (_this11.targetEntity != null) {
            var tem_arr = _this11.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                _this11.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                _this11.targetEntity.on('syned', _this11.entitySynedHandler);
                //console.log(this.targetEntity);
            } else {
                _this11.targetEntity = null;
            }
        }

        var self = _this11;
        return _this11;
    }

    _createClass(SqlNode_FbSource, [{
        key: 'requestSaveAttrs',
        value: function requestSaveAttrs() {
            var rlt = _get(SqlNode_FbSource.prototype.__proto__ || Object.getPrototypeOf(SqlNode_FbSource.prototype), 'requestSaveAttrs', this).call(this);
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
            var _this12 = this;

            var entity = this.targetEntity;
            if (entity && entity.loaded) {
                var paramCount = entity.params.length;
                var entity_param_arr = [];
                entity.params.forEach(function (param, i) {
                    if (param.isreturn == false) {
                        entity_param_arr.push(param);
                    }
                });
                //alert(entity_param_arr);
                this.inputScokets_arr.forEach(function (item) {
                    item._validparam = false;
                });
                var hadChanged = false;
                entity_param_arr.forEach(function (param, i) {
                    var theSocket = _this12.getScoketByName(param.name);
                    if (theSocket == null) {
                        _this12.addSocket(new NodeSocket(param.name, _this12, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
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
            var fbtype = this.targetEntity.type;

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
            var superRet = _get(SqlNode_FbSource.prototype.__proto__ || Object.getPrototypeOf(SqlNode_FbSource.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            if (this.targetEntity == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '没有选择FB']);
                return false;
            }
            if (this.targetEntity.loaded == false) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), 'FB数据尚未加载完成']);
                return false;
            }
            var paramsStr = '';
            var params_arr = [];
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
                params_arr.forEach(function (item, index) {
                    paramsStr += (index == 0 ? '' : ',') + item.value;
                });
            }
            helper.addUseEntity(this.targetEntity);
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, 'DBO.' + this.targetEntity.name + (paramsStr.length == 0 ? '' : '(' + paramsStr + ')') + (IsEmptyString(this.title) ? '' : ' as [' + this.title + ']'), { tableName: IsEmptyString(this.title) ? this.targetEntity.name : this.title });
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return SqlNode_FbSource;
}(SqlNode_Base);

SqlNodeClassMap[SQLNODE_EXISTS] = {
    modelClass: SqlNode_Exists,
    comClass: C_SqlNode_Exists
};

SqlNodeClassMap[SQLNODE_CASE_WHEN] = {
    modelClass: SqlNode_Case_When,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_CW_WHEN] = {
    modelClass: SqlNode_CW_When,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_CW_ELSE] = {
    modelClass: SqlNode_CW_Else,
    comClass: C_Node_SimpleNode
};

SqlNodeClassMap[SQLNODE_GETDATE] = {
    modelClass: SqlNode_Getdate,
    comClass: C_Node_SimpleNode
};

SqlNodeClassMap[SQLNODE_LOGICAL_NOT] = {
    modelClass: SqlNode_Logical_Not,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_IN_OPERATOR] = {
    modelClass: SqlNode_In_Operator,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_TOSTRING] = {
    modelClass: SqlNode_ToString,
    comClass: C_Node_SimpleNode
};

SqlNodeClassMap[SQLNODE_UNION] = {
    modelClass: SqlNode_Union,
    comClass: C_SqlNode_Union
};
SqlNodeClassMap[SQLNODE_CASEWHEN] = {
    modelClass: SqlNode_CaseWhen,
    comClass: C_Node_SimpleNode
};
SqlNodeClassMap[SQLNODE_FBSOURCE] = {
    modelClass: SqlNode_FbSource,
    comClass: C_SqlNode_FbSource
};
SqlNodeEditorControls_arr.push({
    label: 'exists',
    nodeClass: SqlNode_Exists
}, {
    label: 'case_when',
    nodeClass: SqlNode_Case_When
}, {
    label: 'then',
    nodeClass: SqlNode_CW_When
}, {
    label: 'else',
    nodeClass: SqlNode_CW_Else
}, {
    label: 'Getdate',
    nodeClass: SqlNode_Getdate
}, {
    label: 'Not',
    nodeClass: SqlNode_Logical_Not
}, {
    label: 'In',
    nodeClass: SqlNode_In_Operator
}, {
    label: '字符串拼接',
    nodeClass: SqlNode_ToString
}, {
    label: 'union',
    nodeClass: SqlNode_Union
}, {
    label: 'casewhen(*)',
    nodeClass: SqlNode_CaseWhen
}, {
    label: 'DBO.FB()',
    nodeClass: SqlNode_FbSource
});