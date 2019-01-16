const SQLNODE_RET_HAVING = 'ret_having';
const SQLNODE_AGGREGATE='aggregate';
const SQLNODE_RET_GROUP = 'ret_group';
const SQLNODE_BETWEEN = 'between';
const SQLNODE_XAPPLY='apply'
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
class SqlNode_XApply extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_XAPPLY, 'apply', true, nodeJson);
        autoBind(this);

        if (this.applyType == null) {
            this.applyType = 'cross apply';
        }

        if (nodeJson) {
            this.conditionNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_CONDITION; });
        }

        if (this.conditionNode == null) {
            this.conditionNode = new SqlNode_Ret_Condition({ left: 100, top: 0 }, this, createHelper);
        }
        this.conditionNode.label = 'ON';

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
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Table }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Table }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Table;
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.applyType = this.applyType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['applyType']);
    }

    preEditing(editor) {
        var cFinder = new ContextFinder(ContextType_DBEntity);
        this.getContext(cFinder);
        this.contextEntities_arr = cFinder.item_arr;
        for (var i in this.entityNodes_arr) {
            this.entityNodes_arr[i].valid = false;
        }
        for (var i = 0; i < this.contextEntities_arr.length; ++i) {
            var contextEntity = this.contextEntities_arr[i];
            var theNode = this.entityNodes_arr.find(x => { return x.label == contextEntity.label });
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

    addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
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

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '必须有输入']);
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
                socketOut.strContent = bracketStr(compileRet.strContent) + ' as ' + outNode.title;
            }
            if (socketOut.data && socketOut.data.tableName) {
                var tableKey = belongSelectNode.id + '_tables_' + socketOut.data.tableName;
                var cacheNode = helper.getCache(tableKey);
                if (cacheNode != null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                    '数据源:[' + socketOut.data.tableName + ']有同名节点']);
                    return false;
                }
                helper.setCache(tableKey, outNode);
            }
            socketOuts_arr.push(socketOut);
        }
        var joinString = socketOuts_arr[0].strContent + clampStr(this.applyType, ' ', ' ') + socketOuts_arr[1].strContent;

        if (this.conditionNode.inputScokets_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                this.conditionNode,
                helper.clickLogBadgeItemHandler),
                '需要指定']);
            return false;
        }

        if (this.applyType != 'cross join') {
            var conditionNodeCompileRet = this.conditionNode.compile(helper, usePreNodes_arr);
            if (conditionNodeCompileRet == false) {
                return false;
            }
            var onString = conditionNodeCompileRet.getDirectOut().strContent;
            if (IsEmptyString(onString)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    this.conditionNode,
                    helper.clickLogBadgeItemHandler),
                    '没有设定正确的输入']);
                return false;
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, joinString + ' on ' + onString);
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
SqlNodeClassMap[SQLNODE_XAPPLY] = {
    modelClass: SqlNode_XApply,
    comClass: C_SqlNode_XApply,
};
SqlNodeEditorControls_arr.push(
    {
        label:'BetWeen',
        nodeClass:SqlNode_BetWeen,
    },
    {
        label:'Apply',
        nodeClass:SqlNode_XApply,
    }
);
