
const SQLNODE_MATHFUN = 'mathfun';
const SQLNODE_DATEFUN = 'datefun';
const SQLNODE_CONVERT = 'convert';
const SQLNODE_CHARFUN = 'charfun';
const SQLNODE_NEWID = 'newid';
const SQLNODE_CAST = 'cast';
const SQLNODE_LIKE = 'like';

//简单值
SQL_OutSimpleValueNode_arr.push(SQLNODE_NEWID,SQLNODE_CAST);

//数学函数
class SqlNode_Mathfun extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_MATHFUN, 'mathfun', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除
        //复原
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
        if (this.mathType == null) {
            this.mathType = Math_ABS;
        }
        this.setMathType(this.mathType);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.mathType = this.mathType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['mathType']);
    }

    setMathType(newMathType) {
        this.mathType = newMathType;
        var inputCount = 1;
        var inputLabels_arr = ['num'];
        switch (newMathType) {
            case Math_RAND:
                inputCount = 0;
                break;
            case Math_ROUND:
                inputCount = 2;
                inputLabels_arr.push('精度');
                break;
            case Math_POWER:
                inputCount = 2;
                inputLabels_arr.push('幂');
                break;
        }
        var nowCount = this.inputScokets_arr.length;
        if (nowCount != inputCount) {
            var step = Math.sign(inputCount - nowCount);
            for (var i = nowCount; i != inputCount; i += step) {
                if (step > 0) {
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: SqlVarType_Scalar, inputable: true }));
                }
                else {

                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket, i) => {
            if (soket.label != inputLabels_arr[i]) {
                soket.label = inputLabels_arr[i];
                soket.fireEvent('changed');
            }
        });
    }



    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var inSocket = this.inSocket;

        var finalStr = this.mathType + '(';
        switch (this.mathType) {
            case Math_ROUND:
            case Math_POWER:
                var socketVal_arr = [];
                for (var i = 0; i < this.inputScokets_arr.length; i++) {
                    var theSocket = this.inputScokets_arr[i];
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                    var tValue = null;
                    if (tLinks.length == 0) {
                        tValue = theSocket.defval;//无link，就取输入框的值
                        if (tValue == null || tValue == '') {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                                thisNodeTitle
                                , nodeThis
                                , helper.clickLogBadgeItemHandler)
                                , '参数不能为空']);
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
                finalStr += socketVal_arr[0] + ',' + socketVal_arr[1] + ')';
                break;
            case Math_ABS:
            case Math_CEILING:
            case Math_FLOOR:
            case Math_SQUARE:
            case Math_SQRT:
                var socketVal_arr = [];
                var theSocket = this.inputScokets_arr[0];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                var tValue = null;
                if (tLinks.length == 0) {
                    tValue = theSocket.defval;//无link，就取输入框的值
                    if (tValue == null || tValue == '') {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle
                            , nodeThis
                            , helper.clickLogBadgeItemHandler)
                            , '参数不能为空']);
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
                finalStr += tValue + ')';
                break;
            case Math_RAND:
                finalStr += ')';
                break;
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
//日期函数整合
class SqlNode_DateFun extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATEFUN, 'datecon', false, nodeJson);
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
        if (this.dateType == null) {
            this.dateType = 'DateAdd';
        }
        if (this.datepartType == null) {
            this.datepartType = Datepart_day;
        }
        this.setDateType(this.dateType);
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.dateType = this.dateType;
        rlt.datepartType = this.datepartType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['dateType', 'datepartType']);
    }

    setDateType(newDateType) {
        this.dateType = newDateType;
        var inputLabels_arr = [];
        switch (newDateType) {
            case 'DateAdd':
                inputLabels_arr.push('数值', '日期时间');
                break;
            case 'DateDiff':
                inputLabels_arr.push('起始日期', '结束日期');
                break;
            case 'DateName':
                inputLabels_arr.push('日期时间');
                break;
            case 'DatePart':
                inputLabels_arr.push('日期时间');
                break;

        }
        var nowCount = this.inputScokets_arr.length;
        if (nowCount != inputLabels_arr.length) {
            var step = Math.sign(inputLabels_arr.length - nowCount);
            for (var i = nowCount; i != inputLabels_arr.length; i += step) {
                if (step > 0) {
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: SqlVarType_Scalar, inputable: true }));
                }
                else {
                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket, i) => {
            if (soket.label != inputLabels_arr[i]) {
                soket.label = inputLabels_arr[i];
                soket.fireEvent('changed');
            }
        });
    }

    //编译
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var finalStr = ' ' + this.dateType + '(' + this.datepartType + ',';
        for (var i = 0; i < this.inputScokets_arr.length; i++) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                tValue = theSocket.defval;//无link，就取输入框的值
                if (tValue == null || tValue == '') {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
                if (i != 0) {
                    tValue = singleQuotesStr(tValue);
                }
                else {
                    if (this.dateType =='DateAdd') {
                        if (isNaN(tValue)) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                                thisNodeTitle
                                , nodeThis
                                , helper.clickLogBadgeItemHandler)
                                , '该函数的第'+(i+1)+'个参数必须为数值']);
                            return false;
                        }
                    }
                    else{
                        tValue = singleQuotesStr(tValue);
                    }
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

            if (i == 0) {
                finalStr += tValue
            }
            else {
                finalStr += ',' + tValue
            }
        }
        finalStr += ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

const gConvertFormatOptions_arr = [
    { text: 'yyyy-mm-dd hh:mm:ss', value: 21 },
    { text: 'hh:mm:ss', value: 108 },
];
//日期类型转换
class SqlNode_Convert extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CONVERT, 'Convert', false, nodeJson);
        this.varchar_len = ReplaceIfNaN(this.varchar_len, 0);
        autoBind(this);
        //复原
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Table });
            this.addSocket(this.inSocket);
        }
        var format_code = this.inSocket.getExtra('format_code');
        if (format_code == null || (format_code != 21 && format_code != 108)) {
            this.inSocket.setExtra('format_code', '21');
        }
        var varchar_len = this.inSocket.getExtra('varchar_len');
        if (varchar_len == null) {
            this.inSocket.setExtra('varchar_len', '10');
        }
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.code = this.inSocket.getExtra('format_code');
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['format_code']);
    }


    convertTypeDropdownChangedHandler(value, dropCtl) {
        var theSocket = this.inSocket;
        theSocket.setExtra('format_code', value);
        theSocket.fireEvent('changed');
    }

    varlenInputChangedHandler(ev) {
        var newVal = ev.target.value;
        if (isNaN(newVal)) {
            return;
        }
        this.inSocket.setExtra('varchar_len', newVal);
        this.inSocket.fireEvent('changed');
    }

    customSocketRender(socket) {
        if (socket.isIn == false) {
            return null;
        }
        var varlenValue = socket.getExtra('varchar_len');
        if (varlenValue == null) {
            varlenValue = 10;
        }
        var format_code = socket.getExtra('format_code');
        if (this.inputStyle == null) {
            this.inputStyle = {
                width: '3em',
            };
        }
        var varlenInptELem = (<input type='int' style={this.inputStyle} value={varlenValue} onChange={this.varlenInputChangedHandler} />);
        return (
            <React.Fragment>
                <div>varchar:{varlenInptELem}</div>
                <DropDownControl itemChanged={this.convertTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={gConvertFormatOptions_arr} textAttrName='text' valueAttrName='value' rootclass='flex-grow-1 flex-shrink-1' value={format_code} />
            </React.Fragment>
        );
    }
    //编译
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();//convert
        var usePreNodes_arr = preNodes_arr.concat(this);

        var inSocket = this.inSocket;
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(inSocket);

        if (tLinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '输入不能为空']);
            return false;
        }
        var link = tLinks[0];
        var outNode = link.outSocket.node;

        var compileRet = outNode.compile(helper, usePreNodes_arr);
        if (compileRet == false) {
            return false;
        }
        var varchar_len = inSocket.getExtra('varchar_len');
        if (isNaN(varchar_len) || varchar_len <= 0 || varchar_len > 20) {
            varchar_len = 10;
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , 'varchar Length使用了默认值10']);
        }
        var code = inSocket.getExtra('format_code');
        if (isNaN(code)) {
            code = 21;
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , 'format_code使用了默认值21']);
        }

        var inputCompileStrContent = compileRet.getSocketOut(link.outSocket).strContent;
        var finalStr = 'convert(varchar(' + varchar_len + '),' + inputCompileStrContent + ',' + code + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Charfun extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CHARFUN, 'charfun', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        var inputLabels_arrs = [];
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除
        //复原
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
        if (this.charfunType == null) {
            this.charfunType = CharfunType_SUBSTRING;
        }
        this.setCharfunType(this.charfunType);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.charfunType = this.charfunType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['charfunType']);
    }

    setCharfunType(newcharfunType) {
        this.charfunType = newcharfunType;
        var inputLabels_arrs = [];
        switch (newcharfunType) {
            case CharfunType_ASCII:
            case CharfunType_LOWER:
            case CharfunType_UPPER:
            case CharfunType_LTRIM:
            case CharfunType_RTRIM:
            case CharfunType_REVERSE:
            case CharfunType_LEN:
                inputLabels_arrs.push('字符串');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_CHAR:
            inputLabels_arrs.push('数值');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_LEFT:
            case CharfunType_RIGHT:
            case CharfunType_REPLICATE:
            inputLabels_arrs.push('字符串', '数值');
                this.inputLabels_arrss = inputLabels_arrs;
                break;
            case CharfunType_PATINDEX:
            inputLabels_arrs.push('表达式', '字符串');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_SUBSTRING:
            inputLabels_arrs.push('字符串', '起始位置', '截取长度');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_CHARINDEX:
            inputLabels_arrs.push('查询字符', '字符串', '起始位置');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_REPLACE:
            inputLabels_arrs.push('字符串', '被替换字符', '替换字符');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_SPACE:
            inputLabels_arrs.push('字符串1', '空格数量', '字符串2');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
            case CharfunType_STUFF:
            inputLabels_arrs.push('字符串', '开始位置', '删除长度', '替换字符');
                this.inputLabels_arrs = inputLabels_arrs;
                break;
        }

        var nowCount = this.inputScokets_arr.length;
        if (nowCount != inputLabels_arrs.length) {
            var step = Math.sign(inputLabels_arrs.length - nowCount);
            for (var i = nowCount; i != inputLabels_arrs.length; i += step) {
                if (step > 0) {
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: SqlVarType_Scalar, inputable: true }));
                }
                else {
                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket, i) => {
            if (soket.label != inputLabels_arrs[i]) {
                soket.label = inputLabels_arrs[i];
                soket.fireEvent('changed');
            }
        });

    }
    //编译
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var finalStr = ' ' + this.charfunType + '(';
        for (var i = 0; i < this.inputLabels_arrs.length; i++) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            //var socketVal_arr = [];
            if (tLinks.length == 0) {
                tValue = theSocket.defval;//无link，就取输入框的值
                if (tValue == null || tValue == '') {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
                //判断是不是第一个输入
                if (i == 0) {
                    //判断是不是char函数
                    if (this.charfunType != CharfunType_CHAR && this.charfunType != CharfunType_PATINDEX) {
                        tValue = singleQuotesStr(tValue);
                    }
                    if (this.charfunType == CharfunType_CHAR) {
                        if (isNaN(tValue)) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                                thisNodeTitle
                                , nodeThis
                                , helper.clickLogBadgeItemHandler)
                                , '该函数的参数不能为字符']);
                            return false;
                        }
                    }

                }
                var nowlabel =this.inputLabels_arrs[i];
                if (nowlabel == '数值' ||
                    nowlabel == '删除长度' ||
                    nowlabel == '开始位置' ||
                    nowlabel == '空格数量' ||
                    nowlabel == '起始位置' ||
                    nowlabel == '截取长度') {
                    //tValue是一个数值型字符串
                    if(isNaN(tValue)){
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle
                            , nodeThis
                            , helper.clickLogBadgeItemHandler)
                            , '第'+(i+1)+'个参数必须为数值']);
                        return false;
                    }
                }
                else{
                    //不是数值类型加引号
                    tValue = singleQuotesStr(tValue);
                }
            }
            //有连线
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
            }
            //获取输入值
           // socketVal_arr.push(tValue);
            if (i == 0) {
                if (this.charfunType == CharfunType_PATINDEX) {
                    finalStr += singleQuotesStr('%' + tValue+ '%');
                }
                else if (this.charfunType == CharfunType_SPACE) {
                    finalStr = ' '+tValue + ' + SPACE(';
                }
                else {
                    finalStr += tValue;
                }

            }
            else { 
                if (this.charfunType == CharfunType_SPACE) {
                    finalStr += tValue;
                    if (i == 1) {
                        finalStr += ') + ';
                    }
                }
                else {
                    finalStr += ',' + tValue;
                }
            }
        }

        if (this.charfunType != CharfunType_SPACE) {
            finalStr += ')'
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }

}

//newid
class SqlNode_NewID extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_NEWID, 'NewID', false, nodeJson);
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除
        //复原
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
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }
    restorFromAttrs(attrsJson) {
        // assginObjByProperties(this, attrsJson, ['charfunType']);
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称

        var finalStr = ' NEWID() ';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Cast extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CAST, 'CAST', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除

        //复原
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Table });
            this.addSocket(this.inSocket);
        }
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
        };
        var castValType = this.inSocket.getExtra('castValType');//一
        if (SqlVarTypes_arr.indexOf(castValType) == -1) {
            this.inSocket.setExtra('castValType', SqlVarType_NVarchar);
        }
    }


    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
    }

    castTypeDropdownChangedHandler(data, dropCtl) {
        var theSocket = this.inSocket;
        theSocket.setExtra('castValType', data);//三
        theSocket.fireEvent('changed');
    }

    sizeOneInputChangedHandler(ev) {
        var newVal = ev.target.value;
        if (isNaN(newVal)) {
            return;
        }
        this.inSocket.setExtra('size1', newVal);
        this.inSocket.fireEvent('changed');
    }

    sizeTwoInputChangedHandler(ev) {
        var newVal = ev.target.value;
        if (isNaN(newVal)) {
            return;
        }
        this.inSocket.setExtra('size2', newVal);
        this.inSocket.fireEvent('changed');
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return;
        }
        var castValType = socket.getExtra('castValType');//四
        var hadSizeOne = false;
        var hadSizeTwo = false;
        switch (castValType) {
            case SqlVarType_Time:
            case SqlVarType_NVarchar:
                hadSizeOne = true;
                break;
            case SqlVarType_Decimal:
                hadSizeOne = true;
                hadSizeTwo = true;
                break;
        }
        var sizeOneInptELem = null;
        var sizeTwoInputElem = null;
        if (this.inputStyle == null) {
            this.inputStyle = {
                width: '3em',
            };
        }
        if (hadSizeOne) {
            var sizeValue = socket.getExtra('size1');
            if (isNaN(sizeValue)) {
                sizeValue = 0;
            }
            sizeOneInptELem = (<input type='int' style={this.inputStyle} value={sizeValue} onChange={this.sizeOneInputChangedHandler} />);
        }
        if (hadSizeTwo) {
            var sizeValue = socket.getExtra('size2');
            if (isNaN(sizeValue)) {
                sizeValue = 0;
            }
            sizeTwoInputElem = (<input type='int' style={this.inputStyle} value={sizeValue} onChange={this.sizeTwoInputChangedHandler} />);
        }

        //创建一个下拉框
        return (
            <React.Fragment>
                <DropDownControl itemChanged={this.castTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={SqlVarTypes_arr} rootclass='flex-grow-1 flex-shrink-1' value={castValType} />
                {sizeOneInptELem}
                {sizeTwoInputElem}
            </React.Fragment>
        );
    }
    //编译

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var inSocket = this.inSocket;
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(inSocket);
        var inscoketValue = null;

        if (tLinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '输入不能为空']);
            return false;
        }
        var link = tLinks[0];
        var outNode = link.outSocket.node;
        var compileRet = outNode.compile(helper, usePreNodes_arr);
        if (compileRet == false) {
            return false;
        }
        inscoketValue = compileRet.getSocketOut(link.outSocket).strContent;
        if (!outNode.outputIsSimpleValue()) {
            inscoketValue = '(' + inscoketValue + ')';
        }

        var castValType = inSocket.getExtra('castValType');

        var hadSizeOne = false;
        var hadSizeTwo = false;
        var sizeOneMax = 0;
        var sizeTwoMax = 0;
        switch (castValType) {
            case SqlVarType_Time:
                sizeOneMax = 7;
                hadSizeOne = true;
                break;
            case SqlVarType_NVarchar:
                sizeOneMax = 4000;
                hadSizeOne = true;
                break;
            case SqlVarType_Decimal:
                sizeOneMax = 20;
                sizeTwoMax = 6;
                hadSizeOne = true;
                hadSizeTwo = true;
                break;
        }
        var sizeStr = '';
        if (hadSizeOne) {
            var sizeValue = parseInt(inSocket.getExtra('size1'));
            if (isNaN(sizeValue) || sizeValue == null || sizeValue < 0) {
                sizeValue = 0;
            }
            if (sizeValue > sizeOneMax) {
                sizeValue = sizeOneMax;
                helper.logManager.warnEx(
                    [helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , this
                        , helper.clickLogBadgeItemHandler)
                        , "size1已被重置为:" + sizeOneMax]
                );
            }
            sizeStr = '(' + sizeValue;
            switch (castValType) {
                case SqlVarType_Decimal:
                    sizeTwoMax = sizeValue;
                    break;
                case SqlVarType_NVarchar:
                    if (sizeValue == 0) {
                        sizeStr = '';
                    }
                    break;
            }
        }
        if (hadSizeTwo) {
            var sizeValue = parseInt(inSocket.getExtra('size2'));
            if (isNaN(sizeValue) || sizeValue == null || sizeValue < 0) {
                sizeValue = 0;
            }
            if (sizeValue > sizeTwoMax) {
                sizeValue = sizeTwoMax;
                helper.logManager.warnEx(
                    [helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , this
                        , helper.clickLogBadgeItemHandler)
                        , "size2已被重置为:" + sizeTwoMax]
                );
            }
        }
        if (sizeStr.length > 0) {
            sizeStr += ')';
        }

        var finalStr = 'cast(' + inscoketValue + ' as ' + castValType + sizeStr + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


//like模糊查询
class SqlNode_Like extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_LIKE, 'Like', false, nodeJson);
        autoBind(this);

        if (this.operator == null) {
            this.operator = 'like';
        }
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

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
            this.inputScokets_arr[0].inputable = false;
            this.inputScokets_arr[1].inputable = true;
        }
    }
    //保存
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }
    //like语句编译
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);//找到当前link
            if (tLinks.length == 0) {
                var tValue = null;
                if (i == 1) {
                    tValue = theSocket.defval;
                    if (!IsEmptyString(tValue)) {//判断输入值是不是一个空值
                        if (isNaN(tValue)) {//判断输入值是不是字符值，如果是返回true，不是返回false
                            tValue = singleQuotesStr(tValue);//如果是字符类型，就给字符两边加上引号
                        }
                    }
                }
                if (IsEmptyString(tValue)) {
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
                tValue = compileRet.getSocketOut(link.outSocket).strContent;//link.outSocket

                if (!outNode.outputIsSimpleValue()) {
                    tValue = '(' + tValue + ')';
                }
            }
            socketVal_arr.push(tValue);
        }

        var finalStr = socketVal_arr[0] + ' ' + this.operator + ' ' + socketVal_arr[1];


        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}


SqlNodeClassMap[SQLNODE_MATHFUN] = {
    modelClass: SqlNode_Mathfun,
    comClass: C_SqlNode_Mathfun,
};
SqlNodeClassMap[SQLNODE_DATEFUN] = {
    modelClass: SqlNode_DateFun,
    comClass: C_SqlNode_DateFun,
};
SqlNodeClassMap[SQLNODE_CONVERT] = {
    modelClass: SqlNode_Convert,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CHARFUN] = {
    modelClass: SqlNode_Charfun,
    comClass: C_SqlNode_Charfun,
};
SqlNodeClassMap[SQLNODE_NEWID] = {
    modelClass: SqlNode_NewID,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CAST] = {
    modelClass: SqlNode_Cast,
    comClass: C_Node_SimpleNode,
};
SqlNodeClassMap[SQLNODE_LIKE] = {
    modelClass: SqlNode_Like,
    comClass: C_Node_SimpleNode,
};

////////////////////////////////////////////////////////
////////////////////
SqlNodeEditorControls_arr.push({
    label: 'CONVERT',
    nodeClass: SqlNode_Convert,
});

SqlNodeEditorControls_arr.push(
    {
        label: 'Math函数',
        nodeClass: SqlNode_Mathfun,
    },
    {
        label: 'date函数',
        nodeClass: SqlNode_DateFun,
    },
    {
        label: '字符串函数',
        nodeClass: SqlNode_Charfun,
    }
    ,{
        label: 'NewID',
        nodeClass: SqlNode_NewID,
    }
    ,{
        label:'Cast',
        nodeClass:SqlNode_Cast,
    }
    ,{
        label:'Like',
        nodeClass:SqlNode_Like,
    },
);