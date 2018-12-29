const SQLNODE_DATEADD = 'dateadd';        
const SQLNODE_DATEDIFF = 'datediff';
const SQLNODE_DATENAME = 'datename';   
const SQLNODE_DATEPART = 'datepart'; 
const SQLNODE_MATHFUN = 'mathfun';
const SQLNODE_DATECON = 'datecon';

//日期函数 dateadd  
class SqlNode_Dateadd extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATEADD, 'Dateadd', false, nodeJson);
        autoBind(this);
        
        // if (this.operator == null) {
        //     this.operator = 'Datediff';
        // }
        if(this.datepartValue == null){
            this.datepartValue = 'day';
        }
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
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: true }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
     
    }
     
    //保存
    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
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
        var socketVal_arr = [];
        //var inSocket = this.inSocket;
        var dataone=null;
        var datatwo=null;
        for(var i = 0;i<this.inputScokets_arr.length;i++){
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue=null;
            if(tLinks.length == 0){
                tValue=theSocket.defval;//无link，就取输入框的值
                if(tValue==null || tValue==''){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '参数不能为空']);
                    return false;
                }
            }
            else{
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue=compileRet.getSocketOut(link.outSocket).strContent;
            }   
            if(isNaN(tValue)){
                tValue = singleQuotesStr(tValue);
            }
            socketVal_arr.push(tValue);         
        }
        var datepartValue=this.datepartValue;
        
        
        var finalStr = ' dateadd('+datepartValue+','+socketVal_arr[0]+','+socketVal_arr[1]+')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

//日期函数 datediff  
class SqlNode_Datediff extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATEDIFF, 'Datediff', false, nodeJson);
        autoBind(this);
        
        if(this.datepartValue == null){
            this.datepartValue = 'dd';
        }
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
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: true }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
     
    }
     
    //保存
    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        rlt.datepartValue=this.datepartValue;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator','datepartValue']);
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
        var socketVal_arr = [];
        for(var i = 0;i<this.inputScokets_arr.length;i++){
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue=null;
            if(tLinks.length == 0){
                tValue=theSocket.defval;//无link，就取输入框的值
                if(tValue==null || tValue==''){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '参数不能为空']);
                    return false;
                }
            }
            else{
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue=compileRet.getSocketOut(link.outSocket).strContent;
            }   
            if(isNaN(tValue)){
                tValue = singleQuotesStr(tValue);
            }
            socketVal_arr.push(tValue);         
        }
        var datepartValue=this.datepartValue;
        
        
        var finalStr = ' datediff('+datepartValue+','+socketVal_arr[0]+','+socketVal_arr[1]+')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

//日期函数 datename  
class SqlNode_Datename extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATENAME, 'Datename', false, nodeJson);
        autoBind(this);
        
        if(this.datepartValue == null){
            this.datepartValue = 'dd';
        }
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
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
     
    }
     
    //保存
    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.datepartValue = this.datepartValue;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['datepartValue']);
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
        var socketVal_arr = [];
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue=null;
        if(tLinks.length == 0){
            tValue=theSocket.defval;//无link，就取输入框的值
            if(tValue==null || tValue==''){
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                     thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '参数不能为空']);
                 return false;
            }
        }
        else{
            var link = tLinks[0];
            var outNode = link.outSocket.node;
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                return false;
            }
            tValue=compileRet.getSocketOut(link.outSocket).strContent;
            }   
            if(isNaN(tValue)){
                tValue = singleQuotesStr(tValue);
            }
            socketVal_arr.push(tValue);         
        
        var datepartValue=this.datepartValue;
        
        
        var finalStr = ' datename('+datepartValue+','+socketVal_arr[0]+')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}//日期函数 datepart 
class SqlNode_Datepart extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATEPART, 'Datepart', false, nodeJson);
        autoBind(this);
        
        if(this.datepartValue == null){
            this.datepartValue = 'dd';
        }
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
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
     
    }
     
    //保存
    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.datepartValue = this.datepartValue;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['datepartValue']);
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
        var socketVal_arr = [];
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue=null;
        if(tLinks.length == 0){
            tValue=theSocket.defval;//无link，就取输入框的值
            if(tValue==null || tValue==''){
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                     thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '参数不能为空']);
                 return false;
            }
        }
        else{
            var link = tLinks[0];
            var outNode = link.outSocket.node;
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                return false;
            }
            tValue=compileRet.getSocketOut(link.outSocket).strContent;
            }   
            if(isNaN(tValue)){
                tValue = singleQuotesStr(tValue);
            }
            socketVal_arr.push(tValue);         
        
        var datepartValue=this.datepartValue;
        
        
        var finalStr = ' datepart('+datepartValue+','+socketVal_arr[0]+')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

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
        if(this.mathType==null){
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
        switch(newMathType){
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
        if(nowCount != inputCount){
            var step = Math.sign(inputCount - nowCount);
            for(var i=nowCount;i != inputCount; i += step){
                if(step > 0){
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: SqlVarType_Scalar, inputable: true }));
                }
                else{

                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket,i)=>{
            if(soket.label != inputLabels_arr[i]){
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
        
        var finalStr=this.mathType + '(';
        switch (this.mathType) {
            case Math_ROUND:
            case Math_POWER:
                var socketVal_arr = [];
                for(var i = 0;i<this.inputScokets_arr.length;i++){
                    var theSocket = this.inputScokets_arr[i];
                    var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                    var tValue=null;
                    if(tLinks.length==0){
                        tValue=theSocket.defval;//无link，就取输入框的值
                        if(tValue==null || tValue==''){
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                                thisNodeTitle
                                , nodeThis
                                , helper.clickLogBadgeItemHandler)
                                , '参数不能为空']);
                            return false;
                        }
                    }
                    else{
                        var link = tLinks[0];
                        var outNode = link.outSocket.node;
                        var compileRet = outNode.compile(helper, usePreNodes_arr);
                        if (compileRet == false) {
                            return false;
                        }
                        tValue=compileRet.getSocketOut(link.outSocket).strContent;  
                    }
                    socketVal_arr.push(tValue);  
                }
                finalStr += socketVal_arr[0]+','+socketVal_arr[1]+')';
            break;
            case Math_ABS:
            case Math_CEILING:
            case Math_FLOOR:
            case Math_SQUARE:
            case Math_SQRT:
                 var socketVal_arr = [];
                 var theSocket = this.inputScokets_arr[0];
                 var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                 var tValue=null;
                 if(tLinks.length == 0){
                    tValue=theSocket.defval;//无link，就取输入框的值
                    if(tValue==null || tValue==''){
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                             thisNodeTitle
                            , nodeThis
                            , helper.clickLogBadgeItemHandler)
                            , '参数不能为空']);
                         return false;
                    }
                }
                else{
                    var link = tLinks[0];
                    var outNode = link.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        return false;
                    }
                    tValue=compileRet.getSocketOut(link.outSocket).strContent;
                } 
                finalStr +=tValue+')';
                break;
            case Math_RAND:
                finalStr +=')';
                break;
        }
       
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
//日期函数整合
class SqlNode_DateCon extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DATECON, 'datecon', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
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
        if(this.dateType==null){
            this.dateType = 'DateAdd';
        }
        if(this.datepartType==null){
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
        assginObjByProperties(this, attrsJson, ['mathType','datepartType']);
    }

    setDateType(newDateType){
        this.dateType = newDateType;
        var inputCount = 1;
        var inputLabels_arr = ['日期时间'];
        switch(newDateType){
            case 'DateAdd':
                 inputCount  = 2;
                 inputLabels_arr.push('数值');
            break;
            case 'DateDiff':
                 inputCount  = 2;
                 inputLabels_arr.push('日期时间');
            break;
        }
        var nowCount  = this.inputScokets_arr.length;
        if(nowCount != inputCount){
            var step = Math.sign(inputCount - nowCount);
            for(var i=nowCount;i != inputCount; i +=step){
                if(step>0){
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: SqlVarType_Scalar, inputable: true }));
                }
                else{
                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket,i)=>{
            if(soket.label != inputLabels_arr[i]){
                soket.label = inputLabels_arr[i];
                soket.fireEvent('changed');
            }
        });
    }

    //编译
}

SqlNodeClassMap[SQLNODE_DATEADD] = {
    modelClass: SqlNode_Dateadd,
    comClass: C_SqlNode_Dateadd,
};
SqlNodeClassMap[SQLNODE_DATEDIFF] = {
    modelClass: SqlNode_Datediff,
    comClass: C_SqlNode_Datediff,
};
SqlNodeClassMap[SQLNODE_DATENAME] = {
    modelClass: SqlNode_Datename,
    comClass: C_SqlNode_Datename,
};
SqlNodeClassMap[SQLNODE_DATEPART] = {
    modelClass: SqlNode_Datepart,
    comClass: C_SqlNode_Datepart,
};
SqlNodeClassMap[SQLNODE_MATHFUN] = {
    modelClass: SqlNode_Mathfun,
    comClass: C_SqlNode_Mathfun,
};
SqlNodeClassMap[SQLNODE_DATECON] = {
    modelClass: SqlNode_DateCon,
    comClass: C_SqlNode_DateCon,
};
////////////////////////////////////////////////////////
SqlNodeEditorControls_arr.push({
    label:'DateAdd',
    nodeClass:SqlNode_Dateadd,
});
SqlNodeEditorControls_arr.push({
    label:'DateDiff',
    nodeClass:SqlNode_Datediff,
});
SqlNodeEditorControls_arr.push({
    label:'DateName',
    nodeClass:SqlNode_Datename,
});
SqlNodeEditorControls_arr.push({
    label:'DatePart',
    nodeClass:SqlNode_Datepart,
});

SqlNodeEditorControls_arr.push({
    label:'Math函数',
    nodeClass:SqlNode_Mathfun,
});
SqlNodeEditorControls_arr.push({
    label:'Math函数',
    nodeClass:SqlNode_Mathfun,
});
SqlNodeEditorControls_arr.push({
    label:'date函数',
    nodeClass:SqlNode_DateCon,
});
