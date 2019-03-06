const SQLNODE_EXISTS = 'exists';
const SQLNODE_CASE_WHEN='case_when';
const SQLNODE_CW_WHEN='cw_when';
const SQLNODE_CW_ELSE='cw_else';
const SQLNODE_GETDATE = 'getdate';
const SQLNODE_LOGICAL_NOT = 'logical_not';
const SQLNODE_IN_OPERATOR = 'in_operator';
const SQLNODE_TOSTRING='makestring';
const SQLNODE_UNION='union';
const SQLNODE_CASEWHEN = 'casewhen'
const SQLNODE_FBSOURCE ='fbsource'

SQL_OutSimpleValueNode_arr.push(SQLNODE_GETDATE);

//exists
class SqlNode_Exists extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_EXISTS, 'exists', false, nodeJson);
        autoBind(this);

        if (this.operator == null) {
            this.operator = 'exists';
        }
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
    }
    //保存
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt; ss
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }

    //exists语句编译
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
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
}

/*
    case when

*/
class SqlNode_Case_When extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CASE_WHEN, 'case_when', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Scalar, inputable: false }));

        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
            this.minInSocketCount = 1;
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};

    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'case when';
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    //增加输入接口
    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }
    getValue() {
        return this.outSocket.defval;
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                
            var nodetype=outNode.type
            //||outNode.getNodeTitle() !='cw_else'
                if(nodetype!='cw_when'&&nodetype !='cw_else'){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '不能输入除了when和else以外节点']);
                    return false;
                }
                if (nodetype == 'cw_when') {
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                }
                if(tValue_else !=null){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '只能输入一次else节点']);
                        return false;
                }else{
                    if(nodetype =='cw_else'){
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
        socketVal_arr.forEach((x, i) => {
            finalSql += x;
        });
        finalSql = 'case ' + finalSql + ' else ' + tValue_else + ' end ';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
/**
 *     when
 */
class SqlNode_CW_When extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CW_WHEN, 'then', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Boolean, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Scalar, inputable: true }));

        }
        else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == SqlVarType_Boolean) {
                    socket.type = SqlVarType_Boolean;
                    socket.inputable = false;
                }
                else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'then';
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var first_socket = this.inputScokets_arr[0];
        var first_socketlinks = this.bluePrint.linkPool.getLinksBySocket(first_socket);
        if (first_socketlinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不能为空']);
            return false;
        }
        var firstvalue = ''
        var firstLink = first_socketlinks[0];
        var firstoutNode = firstLink.outSocket.node;
        var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
        if (firstLink.outSocket.type != SqlVarType_Boolean) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '应该输入一个boolean值']);
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
                tValue = socket.defval;// 判断手输入值
                if (isNaN(tValue)) {
                    tValue = singleQuotesStr(tValue);
                }
            }
            if (tValue == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '不能有空输入']);
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
            finalSql ='when '+ firstvalue + ' then ' + tValue ;
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
/**
 *  else
 */

class SqlNode_CW_Else extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CW_ELSE, 'else', false, nodeJson);
        autoBind(this);

   
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'else';
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                tValue = theSocket.defval;// 判断手输入值
                if (isNaN(tValue)) {
                    tValue = singleQuotesStr(tValue);
                }
            }
            if (tValue == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    'else条件不能有空输入']);
                return false;
            }
        }
        else {
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

}

/**
 * 获取当前时间
 */

class SqlNode_Getdate extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_GETDATE, 'Getdate', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var value = "getdate()";
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


/**
 * 逻辑运算符  not
 */
class SqlNode_Logical_Not extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_LOGICAL_NOT, 'not', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean, inputable: false });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
    }
    getNodeTitle() {
        return '逻辑:not';
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['LogicalType']);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
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
}

/*
   操作符 in
*/

class SqlNode_In_Operator extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_IN_OPERATOR, 'In', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {

            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length != 0) {
            var self = this;
            this.inputScokets_arr.forEach((socket, i) => {

                if (socket.type == SqlVarType_Table) {
                    self.tablesocket = socket;
                }
                else if (socket.type != SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }

            });
        } else {
            this.addSocket(new NodeSocket('ziduan', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.minInSocketCount = 2;
        }
        if (this.tablesocket == null) {
            this.tablesocket = this.addSocket(new NodeSocket('intable', this, true, { type: SqlVarType_Table }));
        }
    }
    genInSocket() {
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        //rlt.joinType = this.joinType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['joinType']);
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不能为空']);
            return false;
        }
        var firstvalue = ''
        var firstLink = first_socketlinks[0];
        var firstoutNode = firstLink.outSocket.node;
        var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
        if (firstcompileRet == false) {
            // child compile fail
            return false;
        }
        if (this.inputScokets_arr[0].type == SqlVarType_Table) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不得为table类型']);
            return false;
        }
        firstvalue = firstcompileRet.getSocketOut(firstLink.outSocket).strContent;
        if (!firstoutNode.outputIsSimpleValue()) {
            firstvalue = ' (' + firstvalue + ')';
        }

        var finalSql = '';
        var tablesocketlinks = this.bluePrint.linkPool.getLinksBySocket(this.tablesocket);
        if (tablesocketlinks.length != 0) {
            var theLink = tablesocketlinks[0];//insocket 只有一个输入值
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
                        tValue = socket.defval;// 判断手输入值
                        if (isNaN(tValue)) {
                            tValue = singleQuotesStr(tValue);
                        }
                    }
                    if (tValue == null  && socket.type!=SqlVarType_Table ) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            '不能有空输入']);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '至少输入一个 in 条件']);
                return false;
            }
            finalSql = firstvalue + ' in ( ' + socketOutstrs_arr.join(',') + ' ) ';
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}

/*
   拼接字符串
*/
class SqlNode_ToString extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_TOSTRING, 'makestring()', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = true;
            });
        }


    }
    genInSocket() {
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        //rlt.joinType = this.joinType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['joinType']);
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval.replace(/\'/g, '');
                tValue = "'" + tValue + "'";
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;//.replace(/\'/g, '');
                //if(tValue.outputIsSimpleValue()){
                  //  tValue= '' + tValue+''
                //}
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : '+') + x;
        });
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Union extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_UNION, 'union', false, nodeJson);
        autoBind(this);

        if (this.unionType == null) {
            this.unionType = 'union';
        }

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Table;
            }

        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Table, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Table, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == SqlVarType_Table) {
                    socket.type = SqlVarType_Table;
                    socket.inputable = false;
                }
                else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Table , inputable: false });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.unionType = this.unionType;
        return rlt;
    }
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['unionType']);
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'union';
    }

    getContext(finder, depth){
        var firstSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(firstSocket);
        if(tLinks.length == 0){
            return;
        }
        var temLink = tLinks[0];
        var outNode = temLink.outSocket.node;
        if(outNode.type != SQLNODE_SELECT){
            return;
        }
        return outNode.getContext(finder, depth + 1);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal_arr = [];

        var colName_number= null;
        var firstColumname_arr = [];
        
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
                var column_name_arr = compileRet.getSocketOut(link.outSocket).data.columsName_arr;
                if( i == 0) {
                    firstColumname_arr = column_name_arr;
                }
                if(column_name_arr.length != colName_number && colName_number != null){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入列出现不相同数目']);
                    return false;
                }
                colName_number = column_name_arr.length
            }
            socketVal_arr.push(tValue);
        }
        var theoutsocket = this.outputScokets_arr[0]
        var outLinks = this.bluePrint.linkPool.getLinksBySocket(theoutsocket);
        if(outLinks.length != 0){
            var inNode = outLinks[0].inSocket.node;
            var inSocketype = inNode.type;
            if(inSocketype !=SQLNODE_SELECT){
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入连接必须是select节点']);
                return false;
            }
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : ' '+nodeThis.unionType+' ') + x;
        });
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr,{ columnsName_arr:firstColumname_arr });
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


/*
    case when(*)

*/
class SqlNode_CaseWhen extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CASEWHEN, 'case_when(*)', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
        var inputLabels_arr=['列名','变量'];
        this.inputScokets_arr.forEach((soket, i) => {
            soket.label = inputLabels_arr[i];
        });
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'case when(*)';
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var tValue = null;
        var column_value=null;
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                if (i==0){
                    column_value=compileRet.getSocketOut(link.outSocket).strContent;
                }else{
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                }
            }
        }
        var finalSql = '';
        finalSql = 'case when ' + tValue + "='*'" +' then 1 when ' +column_value+'=' +tValue+' then 1 else 0 end=1 ';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
class SqlNode_FbSource extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_FBSOURCE, 'FB', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        else {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                this.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                this.targetEntity.on('syned', this.entitySynedHandler);
                //console.log(this.targetEntity);
            }
            else {
                this.targetEntity = null;
            }
        }

        var self = this;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
        }
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity']);
    }

    cusTitleChanged(oldTitle, newTitle) {
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

    inputSocketSortFun(sa, sb) {
        return sa.index > sb.index;
    }

    entitySynedHandler() {
        var entity = this.targetEntity;
        if (entity && entity.loaded) {
            var paramCount = entity.params.length;
            var entity_param_arr = [];
            entity.params.forEach((param,i) =>{
                if(param.isreturn == false){
                    entity_param_arr.push(param);
                }
            })
            //alert(entity_param_arr);
            this.inputScokets_arr.forEach(item => {
                item._validparam = false;
            });
            var hadChanged = false;
            entity_param_arr.forEach((param, i) => {
                var theSocket = this.getScoketByName(param.name);
                if (theSocket == null) {
                    this.addSocket(new NodeSocket(param.name, this, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
                    hadChanged = true;
                }
                else {
                    theSocket._validparam = true;
                    if (theSocket.label != param.name) {
                        theSocket.set({ label: param.name });
                    }
                    theSocket.index = i;
                }
            }
            );
            var needSort = false;
            for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                var theSocket = this.inputScokets_arr[si];
                if (theSocket._validparam == false) {
                    this.removeSocket(theSocket);
                    --si;
                    hadChanged = true;
                }
                else {
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

    setEntity(entity) {
        
        if(typeof entity === 'string'){
            entity = this.bluePrint.master.getDataSourceByCode(entity);
        }
        var fbtype = this.targetEntity.type

        if (this.targetEntity == entity)
            return;
        if (this.targetEntity != null) {
            this.targetEntity.off('syned', this.entitySynedHandler);
        }
        this.targetEntity = entity;
        if (entity) {
            entity.on('syned', this.entitySynedHandler);
        }
        this.entitySynedHandler();
        
        
    }

    getContext(finder) {
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
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.targetEntity == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '没有选择FB']);
            return false;
        }
        if (this.targetEntity.loaded == false) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                'FB数据尚未加载完成']);
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
                }
                else {
                    var compileRet = tLinks[0].outSocket.node.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        // child compile fail
                        return false;
                    }
                    paramValue = compileRet.getSocketOut(tLinks[0].outSocket).strContent;
                }
                if (IsEmptyString(paramValue)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                    '参数:"' + theSocket.name + '"未设置']);
                    return false;
                }
                params_arr.push({ name: theSocket.name, value: paramValue });
            }
            params_arr.forEach((item, index) => {
                paramsStr += (index == 0 ? '' : ',') + item.value;
            });
        }
        helper.addUseEntity(this.targetEntity);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'DBO.'+this.targetEntity.name + (paramsStr.length == 0 ? '' : '(' + paramsStr + ')') +
            (IsEmptyString(this.title) ? '' : ' as [' + this.title + ']'), { tableName: IsEmptyString(this.title) ? this.targetEntity.name : this.title });
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
SqlNodeClassMap[SQLNODE_EXISTS] = {
    modelClass: SqlNode_Exists,
    comClass: C_SqlNode_Exists,
};

SqlNodeClassMap[SQLNODE_CASE_WHEN] = {
    modelClass: SqlNode_Case_When,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_WHEN] = {
    modelClass: SqlNode_CW_When,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_ELSE] = {
    modelClass: SqlNode_CW_Else,
    comClass: C_Node_SimpleNode,
};

SqlNodeClassMap[SQLNODE_GETDATE] = {
    modelClass: SqlNode_Getdate,
    comClass: C_Node_SimpleNode,
};


SqlNodeClassMap[SQLNODE_LOGICAL_NOT] = {
    modelClass: SqlNode_Logical_Not,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_IN_OPERATOR] = {
    modelClass: SqlNode_In_Operator,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_TOSTRING] = {
    modelClass: SqlNode_ToString,
    comClass: C_Node_SimpleNode,
};

SqlNodeClassMap[SQLNODE_UNION]={
    modelClass:SqlNode_Union,
    comClass:C_SqlNode_Union,
};
SqlNodeClassMap[SQLNODE_CASEWHEN]={
    modelClass:SqlNode_CaseWhen,
    comClass:C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_FBSOURCE]={
    modelClass:SqlNode_FbSource,
    comClass:C_SqlNode_FbSource,
};
SqlNodeEditorControls_arr.push(
    {
        label:'exists',
        nodeClass:SqlNode_Exists,
    },
    {
        label:'case_when',
        nodeClass:SqlNode_Case_When,
    },
    {
        label:'then',
        nodeClass:SqlNode_CW_When,
    }
    ,{
        label:'else',
        nodeClass:SqlNode_CW_Else,
    },
    {
        label:'Getdate',
        nodeClass:SqlNode_Getdate,
    },
    {
        label:'Not',
        nodeClass:SqlNode_Logical_Not,
    }
    ,{
        label:'In',
        nodeClass:SqlNode_In_Operator,
    }
    ,{
        label:'字符串拼接',
        nodeClass:SqlNode_ToString,
    }
    ,
    {
        label:'union',
        nodeClass:SqlNode_Union,
    },
    {
        label:'casewhen(*)',
        nodeClass:SqlNode_CaseWhen,
    },
    {
        label:'DBO.FB()',
        nodeClass:SqlNode_FbSource,
    }
);
