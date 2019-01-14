const SQLNODE_RET_HAVING = 'ret_having';
const SQLNODE_AGGREGATE='aggregate';
const SQLNODE_RET_GROUP = 'ret_group';
const SQLNODE_BETWEEN = 'between';
SQL_OutSimpleValueNode_arr.push(SQLNODE_AGGREGATE);

class SqlNode_Ret_Having extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_HAVING, 'having', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
                this.inSocket.inputable = false;
                this.inSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Boolean, inputable: false });
            this.addSocket(this.inSocket);
        }
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
        }
        else {
            selfCompileRet.setDirectOut('');
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Ret_Group extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_GROUP, 'group', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        this.inputScokets_arr.forEach(socket => {
            socket.inputable = false;
        });

    }



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




    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var groupColumns_arr = [];
        var selfCompileRet = new CompileResult(this);
        if (this.inputScokets_arr.length > 0) {
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var socket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '有空输入']);
                    return false;
                }
                var link = tLinks[0];
                var compileRet = link.outSocket.node.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                var compileData = compileRet.getSocketOut(link.outSocket);
                groupColumns_arr.push(compileData.strContent);
            }
            var strContent = '';
            groupColumns_arr.forEach((x, i) => { strContent += (i == 0 ? '' : ',') + x });
            selfCompileRet.setDirectOut(strContent, { groupColumns_arr: groupColumns_arr });
        }
        else {
            selfCompileRet.setDirectOut('', { groupColumns_arr: groupColumns_arr });
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Aggregate extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_AGGREGATE, '聚合函数', false, nodeJson);
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
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
            inputable: false,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.aggregate == null) {
            this.aggregate = 'count';
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.aggregate = this.aggregate;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['aggregate']);
    }

    getNodeTitle() {
        return this.aggregate;
    }

    compile(helper, preNodes_arr) { //preNodes_arr 前面的节点
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var belongSelectNode = null;
        for (var i = preNodes_arr.length - 1; i >= 0; i--) {
            if (preNodes_arr[i].type == SQLNODE_SELECT) {
                belongSelectNode = preNodes_arr[i];
                break;
            }
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (belongSelectNode == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '没有找到归属select节点']);
            return false;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue = null;
        if (tLinks.length == 0) {
            if (this.aggregate != 'count') {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入接口没有值']);
                return false;
            }
            else {
                tValue = '*';
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
        if(helper[belongSelectNode.id + '_complingSocket_complingSocket'] != null)
        {
            if (helper[belongSelectNode.id + '_complingSocket_isolated'] == true) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '不能和独立列一起使用']);
                return false;
            }
        }
        helper[belongSelectNode.id + '_complingSocket_isolated'] = false;
        var finalStr = this.aggregate + '(' + tValue + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

//  SQL_between
class SqlNode_BetWeen extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_BETWEEN, 'BetWeen', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        //定义输出接口标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        //定义输入接口标量
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
            this.addSocket(new NodeSocket('in2', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });

            this.inputScokets_arr[0].inputable = false;
            this.inputScokets_arr[1].inputable = true;
            this.inputScokets_arr[2].inputable = true;
        }

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
        var socketVal_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (i > 0) {
                    if (!IsEmptyString(theSocket.defval)) {
                        tValue = theSocket.defval;
                        if (isNaN(tValue)) {
                            tValue = singleQuotesStr(tValue);
                        }
                    }
                }
                if (tValue == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
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
            socketVal_arr.push(tValue);
        }
        //SQL语句拼接
        var finalStr = socketVal_arr[0] + ' between ' + socketVal_arr[1] + ' and ' + socketVal_arr[2];
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


SqlNodeClassMap[SQLNODE_AGGREGATE] = {
    modelClass: SqlNode_Aggregate,
    comClass: C_SqlNode_Aggregate,
};
SqlNodeClassMap[SQLNODE_RET_HAVING] = {
    modelClass: SqlNode_Ret_Having,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_RET_GROUP] = {
    modelClass: SqlNode_Ret_Group,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_BETWEEN] = {
    modelClass: SqlNode_BetWeen,
    comClass: C_Node_SimpleNode,
};

SqlNodeEditorControls_arr.push(
    {
        label:'BetWeen',
        nodeClass:SqlNode_BetWeen,
    }
);