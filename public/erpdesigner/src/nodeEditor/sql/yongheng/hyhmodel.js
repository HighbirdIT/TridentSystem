const SQLNODE_DATEADD = 'dateadd';        
const SQLNODE_DATEDIFF = 'datediff';
const SQLNODE_DATENAME = 'datename';   
const SQLNODE_DATEPART = 'datepart'; 
const SQLNODE_MATHFUN = 'mathfun';
const SQLNODE_DATECON = 'datecon';
const SQLNODE_CONVERT = 'convert'; 
const SQLNODE_CHARFUN = 'charfun';
const SQLNODE_NEWID = 'newid';

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
        var format_code=this.inSocket.getExtra('format_code');
        if(format_code==null){
            this.inSocket.setExtra('format_code', '21');
        }
        var varchar_len=this.inSocket.getExtra('varchar_len');
        if(varchar_len==null){
            this.inSocket.setExtra('varchar_len', '10');
        }
    }
requestSaveAttrs() {
    var rlt = super.requestSaveAttrs();
    rlt.code=this.inSocket.getExtra('format_code'); 
    return rlt;
}

restorFromAttrs(attrsJson) {
}

convertTypeDropdownChangedHandler(data, dropCtl) {
    var theSocket = this.inSocket;
    theSocket.setExtra('format_code', data.value);
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
    if(socket.isIn==false){
        return null;
    }
    var varlenInptELem = null;
   
    var varlenValue = socket.getExtra('varchar_len');
    if(varlenValue==null){
        varlenValue = 10;
    }
    var  format_code = socket.getExtra('format_code');
    if (this.inputStyle == null) {
        this.inputStyle = {
            width: '3em',
        };
    }
    var varlenInptELem = (<input type='int' style={this.inputStyle} value={varlenValue} onChange={this.varlenInputChangedHandler} />);
    var formatOptions_arr=[
        {text:'yyyy-mm-dd Thh:mm:ss',value:126},
        {text:'yyyy-mm-dd hh:mm:ss',value:21},
        {text:'hh:mi:ss',value:114},
        {text:'hh:mm:ss',value:108},
    ];
    
    return (
        <React.Fragment>
            <div>varchar:{varlenInptELem}</div>
            <div>
                 格式:<DropDownControl itemChanged={this.convertTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={formatOptions_arr} textAttrName='text' valueAttrName='value' rootclass='flex-grow-1 flex-shrink-1' value={format_code} />    
            </div>
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
    if(isNaN(varchar_len) || varchar_len <= 0 || varchar_len > 20){
        varchar_len = 10;
        helper.logManager.warnEx([helper.logManager.createBadgeItem(
            thisNodeTitle
            , nodeThis
            , helper.clickLogBadgeItemHandler)
            , 'varchar Length使用了默认值10']);
    }
    var code = inSocket.getExtra('format_code');
    if(isNaN(code)){
        code = 21;
        helper.logManager.warnEx([helper.logManager.createBadgeItem(
            thisNodeTitle
            , nodeThis
            , helper.clickLogBadgeItemHandler)
            , 'format_code使用了默认值21']);
    }

    var inputCompileStrContent = compileRet.getSocketOut(link.outSocket).strContent; 
    var finalStr = 'convert(varchar(' + varchar_len + '),' + inputCompileStrContent + ','+code+')';
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
        if(this.charfunType==null){
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
        var inputCount = 0 ;
        var inputLabels_arr = [];
        switch(newcharfunType){
            case CharfunType_ASCII:
            case CharfunType_LOWER:
            case CharfunType_UPPER:
            case CharfunType_LTRIM:
            case CharfunType_RTRIM:
            case CharfunType_REVERSE:
            case CharfunType_LEN:
                 inputCount = 1;
                 inputLabels_arr.push('字符串');
            break;
            case CharfunType_CHAR:
                 inputCount = 1;
                 inputLabels_arr.push('数值');
            break;
            case CharfunType_LEFT:
            case CharfunType_RIGHT:
            case CharfunType_REPLICATE:
                 inputCount = 2;
                 inputLabels_arr.push('字符串','数值');
            break;
            case CharfunType_PATINDEX:
                 inputCount = 2;
                 inputLabels_arr.push('表达式','字符串');
            break;
            case CharfunType_SUBSTRING:
                 inputCount = 3;
                 inputLabels_arr.push('字符串','开始位置','截取长度');
            break;
            case CharfunType_CHARINDEX:
                 inputCount = 3;
                 inputLabels_arr.push('查询字符','字符串','起始位置');
            break;
            case CharfunType_REPLACE:
                 inputCount = 3;
                 inputLabels_arr.push('字符串','被替换字符','替换字符');
            break;
            case CharfunType_SPACE:
                 inputCount = 3;
                 inputLabels_arr.push('字符串1','字符串2','空格数量');
            break;
            case CharfunType_STUFF:
                 inputCount = 4;
                 inputLabels_arr.push('字符串','开始位置','删除长度','替换字符');
            break;
        }
        var nowCount = this.inputScokets_arr.length;
        if(nowCount != inputCount){
            var step = Math.sign(inputCount - nowCount);
            for(var i=nowCount;i != inputCount; i += step){
                if(step > 0){
                    // for(var j=0;j<(inputCount-nowCount);j++){
                    //     this.addSocket(new NodeSocket('in' + j, this, true, { type: SqlVarType_Scalar, inputable: true }));
                    // }
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
        var finalStr='';
        switch (this.charfunType) {
            //一个参数
            case CharfunType_ASCII:
            case CharfunType_CHAR:
            case CharfunType_LOWER:
            case CharfunType_UPPER:
            case CharfunType_LTRIM:
            case CharfunType_RTRIM:
            case CharfunType_REVERSE:
            case CharfunType_LEN:
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
                if(this.charfunType == CharfunType_CHAR){
                    if (isNaN(tValue)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle
                            , nodeThis
                            , helper.clickLogBadgeItemHandler)
                            , '该函数的参数不能为字符']);
                        return false;
                    }
                }
                else{
                    if (isNaN(tValue)) {
                        tValue = singleQuotesStr(tValue);
                    }
                }
                finalStr =this.charfunType+'('+tValue+')';
            break;
            //两个参数
            case CharfunType_LEFT:
            case CharfunType_LEFT:
            case CharfunType_LEFT:
            case CharfunType_LEFT:
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
                    if (isNaN(tValue)) {
                        tValue = singleQuotesStr(tValue);
                    }
                    socketVal_arr.push(tValue);
                }
                finalStr = this.charfunType+'('+socketVal_arr[0] + ',' + socketVal_arr[1] + ')';
            break;
            //三个参数
            case CharfunType_SUBSTRING:
            case CharfunType_CHARINDEX:
            case CharfunType_REPLACE:
            case CharfunType_SPACE:
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
                    if (isNaN(tValue)) {
                        tValue = singleQuotesStr(tValue);
                    }
                    socketVal_arr.push(tValue);
                }
                finalStr = this.charfunType + '(' + socketVal_arr[0] + ',' + socketVal_arr[1] + socketVal_arr[2]+')';
                if(this.charfunType == CharfunType_SPACE){
                    finalStr = socketVal_arr[0]+ '+ '+CharfunType_SPACE+'('+socketVal_arr[2]+') '+ '+' +singleQuotesStr(socketVal_arr[1])
                }
            break;
            //四个参数
            case CharfunType_STUFF:
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
                if (isNaN(tValue)) {
                    tValue = singleQuotesStr(tValue);
                }
                socketVal_arr.push(tValue);
            }
            finalStr = this.charfunType + '(' + socketVal_arr[0] + ',' + socketVal_arr[1] + ',' + socketVal_arr[2] + ',' + socketVal_arr[3]+')';
            break;
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
        var thisNodeTitle = nodeThis.getNodeTitle();
        var finalStr = thisNodeTitle+'()'
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
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
SqlNodeClassMap[SQLNODE_CONVERT] = {
    modelClass: SqlNode_Convert,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CHARFUN] = {
    modelClass: SqlNode_Charfun,
    comClass: C_SqlNode_Charfun,
};
SqlNodeClassMap[SQLNODE_NEWID] = {
    modelClass: SqlNode_NewID,
    comClass: C_SqlNode_SimpleNode,
};
////////////////////////////////////////////////////////
SqlNodeEditorControls_arr.push({
    label:'CONVERT',
    nodeClass:SqlNode_Convert,
});
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
    label:'date函数',
    nodeClass:SqlNode_DateCon,
});
SqlNodeEditorControls_arr.push({
    label:'字符串函数',
    nodeClass:SqlNode_Charfun,
});
SqlNodeEditorControls_arr.push({
    label:'NewID',
    nodeClass:SqlNode_NewID,
});
