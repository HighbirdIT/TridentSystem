class FormatFile_ItemBase{
    constructor(indent){
        this.indent = ReplaceIfNaN(indent,0);
    }

    addIndent(){
        this.indent += 1;
    }

    subIndent(){
        this.indent -= 1;
    }

    getIndentString(indentChar){
        var indentContent = '';
        for(var i=0;i<this.indent;++i){
            indentContent += indentChar;
        }
        return indentContent;
    }

    getString(prefixStr, indentChar){
        return 'not impleted';
    }

    getScope(){
        var testObj = this;
        while(testObj){
            if(testObj.scope){
                return testObj.scope;
            }
            testObj = testObj.parent;
        }
        return null;
    }
}

class FormatFile_Line extends FormatFile_ItemBase{
    constructor(content, indent, endChar){
        super(indent);
        if(content == null){
            console.warn('FormatFile_Line content is null');
            content = '';
        }
        else{
            content = content.trim();
        }
        this.endChar = endChar;
        this.hadEndChar = !IsEmptyString(endChar);
        if(content.length > 0 && this.hadEndChar){
            if(content[content.length - 1] != endChar){
                content += endChar;
            }
        }
        this.content = content;
    }

    clone(clonedCallback){
        var rlt = new FormatFile_Line(this.content, this.indent, this.endChar);
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    append(content){
        if(content == null){
            console.warn('FormatFile_Line append content is null');
            content = '';
        }
        if(this.hadEndChar){
            this.content = this.content.substr(0, this.content.length - 1) + content;
        }
        this.content = this.content + content;
        if(this.hadEndChar){
            if(content[content.length - 1] != endChar){
                this.content += endChar;
            }
        }
    }

    getString(prefixStr, indentChar){
        return prefixStr + this.getIndentString(indentChar) + this.content;
    }
}


class FormatFileBlock extends FormatFile_ItemBase{
    constructor(name, priority){
        super();
        this.name = name;
        this.priority = ReplaceIfNaN(priority,1);

        this.childs_arr = [];
        this.getStringCallbacker = [];
        this.nextLineIndent = 0;
        this.childs_map = {};
    }

    isEmpty(){
        return this.childs_arr.length == 0;
    }

    clear(){
        this.childs_arr = [];
        this.nextLineIndent = 0;
        this.childs_map = {};
    }

    clone(clonedCallback){
        var rlt = new FormatFileBlock(this.name, this.priority);
        this.childs_arr.forEach(child=>{
            rlt.pushChild(child.clone(clonedCallback));
        });
        rlt.nextLineIndent = this.nextLineIndent;
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    addGetStringLisener(fun){
        var index = this.getStringCallbacker.indexOf(fun);
        if(index == -1)
        {
            this.getStringCallbacker.push(fun);
        }
    }

    removeGetStringLisener(fun){
        var index = this.getStringCallbacker.indexOf(fun);
        if(index != -1)
        {
            this.getStringCallbacker.splice(indent,1);
        }
    }

    addNextIndent(){
        this.nextLineIndent += 1;
    }

    subNextIndent(){
        this.nextLineIndent -= 1;
    }

    pushChild(child){
        if(!IsEmptyString(child.name)){
            this.childs_map[child.name] = child;
        }
        child.parent = this;
        child.indent = this.nextLineIndent;
        this.childs_arr.push(child);
    }

    getChild(childName){
        return this.childs_map[childName];
    }

    pushLine(lineItem, indentOffset){
        var itemType = typeof lineItem;
        if(itemType === 'string'){
            lineItem = new FormatFile_Line(lineItem, this.nextLineIndent);
        }
        else if(!FormatFile_Line.prototype.isPrototypeOf(lineItem)){
            console.error('不支持的lineitem！');
        }
        else{
            lineItem.indent = this.nextLineIndent;
        }
        lineItem.parent = this;
        this.childs_arr.push(lineItem);
        this.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
    }

    getString(prefixStr, indentChar, newLineChar){
        var indentString = this.getIndentString(indentChar);
        var rlt = '';
        this.childs_arr.forEach(child=>{
            var childStr = child.getString(prefixStr + indentString, indentChar, newLineChar);
            if(childStr.length > 0){
                rlt += childStr + (childStr[childStr.length - 1] == newLineChar ? '' : newLineChar);
            }
        });

        this.getStringCallbacker.forEach(callBack=>{
            rlt = callBack(rlt, indentChar, newLineChar, prefixStr);
            if(rlt == null){
                console.error('getStringCallbacker return null');
            }
        });

        return rlt;
    }
}

class FormatHtmlTag extends FormatFile_ItemBase{
    constructor(name, tagName, clientSide){
        super();
        this.name = name;
        this.tagName = tagName;
        this.clientSide = clientSide;
        this.class = {};
        this.style = {};
        this.switch = {};
        this.attrObj = {};
        this.childs_map = {};
        this.childs_arr = [];
        this.getStringCallbacker = [];
    }

    clear(){
        this.childs_arr = [];
        this.childs_map = {};
    }

    clone(clonedCallback){
        var rlt = new FormatHtmlTag(this.name, this.tagName, this.clientSide);
        this.childs_arr.forEach(child=>{
            rlt.pushChild(child.clone(clonedCallback));
        });
        rlt.class = Object.assign({}, this.class);
        rlt.style = Object.assign({}, this.style);
        rlt.switch = Object.assign({}, this.switch);
        rlt.attrObj = Object.assign({}, this.attrObj);
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    addGetStringLisener(fun){
        var index = this.getStringCallbacker.indexOf(fun);
        if(index == -1)
        {
            this.getStringCallbacker.push(fun);
        }
    }

    removeGetStringLisener(fun){
        var index = this.getStringCallbacker.indexOf(fun);
        if(index != -1)
        {
            this.getStringCallbacker.splice(indent,1);
        }
    }

    setAttr(name, value){
        this.attrObj[name] = value;
    }

    

    addSwitchClass(switchName, switchVal, existsProcess) {
        if (this.switch[switchName] != null) {
            switch (existsProcess) {
                case 'set':
                    this.class[this.switch[switchName].name] = 0;
                    break;
                default:
                    return false;
            }
        }
        var className = switchName + '-' + switchVal;
        this.switch[switchName] = { name: className, val: switchVal };
        this.class[className] = 1;
        return true;
    }

    addClass(className, existsProcess) {
        if (IsEmptyString(className)) {
            return false;
        }
        var t_arr = g_switchClassNameReg.exec(className);
        if (t_arr != null) {
            var switchName = className.substr(0, className.length - t_arr[0].length);
            var switchVal = t_arr[0].substr(1);
            return this.addSwitchClass(switchName, switchVal, existsProcess);
        }

        this.class[className] = 1;
        return true;
    }

    addStyle(name, val) {
        if (IsEmptyString(name) || val == null) {
            return false;
        }
        this.style[name] = val;
        return true;
    }

    getClassName() {
        var rlt = '';
        for (var si in this.class) {
            if (this.class[si] == 0)
                continue;
            rlt += si + ' ';
        }
        return rlt;
    }

    pushChild(child){
        if(!IsEmptyString(child.name)){
            this.childs_map[child.name] = child;
        }
        child.parent = this;
        child.indent = this.nextLineIndent;
        this.childs_arr.push(child);
    }

    pushLine(lineItem, indentOffset){
        var itemType = typeof lineItem;
        if(itemType === 'string'){
            lineItem = new FormatFile_Line(lineItem, this.nextLineIndent);
        }
        else if(!FormatFile_Line.prototype.isPrototypeOf(lineItem)){
            console.error('不支持的lineitem！');
        }
        else{
            lineItem.indent = this.nextLineIndent;
        }
        lineItem.parent = this;
        this.childs_arr.push(lineItem);
        this.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
    }

    getChild(childName){
        return this.childs_map[childName];
    }

    getString(prefixStr, indentChar, newLineChar){
        var rlt = prefixStr + '<' + this.tagName;
        var className = this.getClassName();
        if(!IsEmptyString(className)){
            rlt += " className='" + className + "'";
        }
        var styleID = this.attrObj.id + '_style';
        if(this.clientSide.addStyleObject(styleID,this.style)){
            rlt += " style={" + styleID + "}";
        }

        for(var i in this.attrObj){
            var attrVal = this.attrObj[i];
            if(IsEmptyString(attrVal)){
                continue;
            }
            switch(attrVal[0]){
                case '{':
                case "'":
                break;
                default:
                attrVal = "'" + attrVal + "'";
            }
            rlt += ' ' + i + '=' + attrVal;
        }
        if(this.childs_arr.length > 0)
        {
            rlt += '>' + newLineChar;
            for(var ci in this.childs_arr){
                var child = this.childs_arr[ci];
                rlt += child.getString(prefixStr + indentChar, indentChar, newLineChar) + newLineChar;
            }
            rlt += prefixStr + '</' + this.tagName + '>';
        }
        else{
            rlt += ' />';
        }

        this.getStringCallbacker.forEach(callBack=>{
            rlt = callBack(rlt, indentChar, newLineChar, prefixStr);
            if(rlt == null){
                console.error('getStringCallbacker return null');
            }
        });
        return rlt;
    }
}

class FormatFileRegion extends FormatFile_ItemBase{
    constructor(name, priority){
        super();
        this.name = name;
        this.blocks_map = {};
        this.blocks_arr = [];
        this.priority = ReplaceIfNaN(priority,1);
        var defaultBlock = this.getBlock('default', true, 0);
        this.defaultBlock = defaultBlock;
    }

    clone(clonedCallback){
        var rlt = new FormatFileRegion(this.name, this.priority);
        rlt.blocks_map = {};
        rlt.blocks_arr = [];
        this.blocks_arr.forEach(block=>{
            var newBlock = block.clone(clonedCallback);
            rlt.getBlock(newBlock.name, true, newBlock.priority);
        });
        rlt.defaultBlock = rlt.getBlock('default');
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    sortFun(a,b){
        return a.priority <= b.priority;
    }

    getBlock(blockName, autoCreate, priority){
        var rlt = this.blocks_map[blockName];
        if(rlt == null && autoCreate){
            if(priority == null && this.blocks_arr.length > 0){
                var nowMax = 0;
                this.blocks_arr.forEach(x=>{
                    nowMax = Math.max(x.priority, nowMax);
                });
                priority = nowMax + 1;
            }
            
            rlt = new FormatFileBlock(blockName, priority);
            this.blocks_arr.push(rlt);
            this.blocks_map[rlt.name] = rlt;
            rlt.parent = this;
        }
        return rlt;
    }

    getString(prefixStr, indentChar, newLineChar){
        var indentString = this.getIndentString(indentChar);
        var rlt = '';
        
        this.blocks_arr.sort(this.sortFun);
        this.blocks_arr.forEach(block=>{
            rlt += block.getString(prefixStr + indentString, indentChar, newLineChar);
        });
        return rlt;
    }
}

class FormatFileMaker{
    constructor(){
        this.regions_arr = [];
        this.regions_map = {};
        this.defaultRegion = this.getRegion('default', true, 0);
    }

    getRegion(regionName, autoCreate, priority){
        var rlt = this.regions_map[regionName];
        if(priority == null && this.regions_arr.length > 0){
            var nowMax = 0;
            this.regions_arr.forEach(x=>{
                nowMax = Math.max(x.priority, nowMax);
            });
            priority = nowMax + 1;
        }
        if(rlt == null && autoCreate){
            rlt = new FormatFileRegion(regionName, priority);
            rlt.parent = this;
            this.regions_arr.push(rlt);
            this.regions_map[rlt.name] = rlt;
        }
        return rlt;
    }

    sortFun(a,b){
        return a.priority > b.priority;
    }

    getString(indentChar = '\t', newLineChar = '\n'){
        var rlt = '';
        this.regions_arr.sort(this.sortFun);
        this.regions_arr.forEach(region=>{
            rlt += region.getString('', indentChar, newLineChar);
        });
        return rlt;
    }
}

class JSFile_Variable{
    constructor(name, initVal){
        this.name = name;
        this.initVal = initVal;
    }
}

class JSFile_Scope{
    constructor(name, outScope){
        this.name = name;
        this.vars_map = {};
        this.functions_map = {};
        this.outScope = outScope;
    }

    getVar(name, autoCreate, initVal){
        var rlt = this.vars_map[name];
        if(rlt == null && autoCreate){
            if(initVal != null && typeof initVal != 'string'){
                console.error('scope var initval 只支持字符串');
            }
            rlt = new JSFile_Variable(name, initVal);
            this.vars_map[name] = rlt;
        }
        return rlt;
    }

    getFunction(funName, autoCreate, params_arr, declareType){
        var funNameKey = '_' + funName + '_';
        var rlt = this.functions_map[funNameKey];
        if(rlt == null && autoCreate){
            if(params_arr == null){
                //console.error('getFunction autoCreate no params_arr');
                params_arr = [];
            }
            rlt = new JSFile_Funtion(funName, params_arr, declareType);
            this.functions_map[funNameKey] = rlt;
        }
        return rlt;
    }

    getVarDeclareString(preFixStr = '', newLineChar = '\n'){
        var rlt = '';
        for(var varName in this.vars_map){
            var varData = this.vars_map[varName];
            if(varData == null)
            {
                continue;
            }
            rlt += preFixStr + 'var ' + varData.name  + (varData.initVal ? '=' + varData.initVal : '') + ';' + newLineChar;
        }
        return rlt;
    }

    getFunctionDeclareString(prefixStr, indentChar, newLineChar){
        var rlt = '';
        for(var fName in this.functions_map){
            var theFun = this.functions_map[fName];
            rlt += theFun.getString(prefixStr, indentChar, newLineChar);
        }
        return rlt;
    }
}

class JSFile_Switch extends FormatFileBlock{
    constructor(name,flagName){
        super(name);
        this.flagName = flagName;

        this.caseBloks_map = {};
        this.defaultBlock = new FormatFileBlock('default');
        this.defaultBlock.parent = this;
    }

    clone(clonedCallback){
        var rlt = new JSFile_Switch(this.name, this.flagName);
        for(var ci in this.caseBloks_map){
            rlt.caseBloks_map[ci] = this.caseBloks_map[ci].clone(clonedCallback);
            rlt.caseBloks_map[ci].parent = rlt;
        }
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    getCaseBlock(caseVal, autoCreate = true){
        var rlt = this.caseBloks_map[caseVal];
        if(rlt == null && autoCreate){
            rlt = new FormatFileBlock(caseVal);
            this.caseBloks_map[caseVal] = rlt;
            rlt.parent = this;
        }
        return rlt;
    }

    getString(prefixStr, indentChar, newLineChar){
        var indentString = this.getIndentString(indentChar);
        var rlt = prefixStr + indentChar + 'switch(' + this.flagName + '){' + newLineChar;

        for(var si in this.caseBloks_map){
            rlt += prefixStr + indentChar + 'case ' + si + ':{' + newLineChar;
            rlt += this.caseBloks_map[si].getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + indentChar + 'break;}' + newLineChar;
        }

        if(this.defaultBlock.childs_arr.length > 0)
        {
            rlt += prefixStr + indentChar + 'default:{' + newLineChar;
            rlt += this.defaultBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + indentChar + 'break;}' + newLineChar;
        }
        rlt += prefixStr + indentChar + '}';

        return rlt;
    }
}

class JSFile_IF extends FormatFileBlock{
    constructor(name, condition){
        super(name);
        this.condition = condition;

        this.trueBlock = new FormatFileBlock('true');
        this.falseBlock = new FormatFileBlock('false');
        this.elseIfs_arr = [];

        this.trueBlock.parent = this;
        this.falseBlock.parent = this;
    }

    clone(clonedCallback){
        var rlt = new JSFile_IF(this.name, this.condition);
        rlt.trueBlock = this.trueBlock.clone(clonedCallback);
        rlt.falseBlock = this.falseBlock.clone(clonedCallback);
        for(var ci in this.elseIfs_arr){
            rlt.elseIfs_arr.push(this.elseIfs_arr[ci].clone(clonedCallback));
        }
        rlt.trueBlock.parent = rlt;
        rlt.falseBlock.parent = rlt;
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    pushChild(){
        console.error("if block can't call pushChild");
    }

    pushLine(lineItem, indentOffset){
        this.trueBlock.pushLine(lineItem, indentOffset);
    }

    pushElseIf(name, condition){
        var nowBlock = this.getElseIfBlock(name);
        if(nowBlock != null){
            console.error('重复的 else if:' + name);
            return;
        }
        var rltBlock = new FormatFileBlock(name);
        rltBlock.pushLine('else if(' + condition + '){', 1);
        rltBlock.parent = this;
    }

    getElseIfBlock(name){
        return this.elseIfs_arr.filter(item=>{return item.name == name;});
    }

    getString(prefixStr, indentChar, newLineChar){
        if(IsEmptyString(this.condition)){
            console.error('JSFile_IF:' + this.name + ' confition为空');
        }
        var rlt = prefixStr + 'if(' + this.condition + '){' + newLineChar;
        rlt += this.trueBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        rlt += prefixStr + '}' + newLineChar;
        for(var ei in this.elseIfs_arr){
            var elseIfBlock = this.elseIfs_arr[ei];
            rlt += elseIfBlock.getString(prefixStr, indentChar, newLineChar);
            rlt += prefixStr + '}' + newLineChar;
        }
        if(this.falseBlock.childs_arr.length > 0){
            rlt += prefixStr + 'else{' + newLineChar;
            rlt += this.falseBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + '}' + newLineChar;
        }
        return rlt;
    }
}

class JSFile_Try extends FormatFileBlock{
    constructor(name){
        super(name);

        this.bodyBlock = new FormatFileBlock('body');
        this.errorBlock = new FormatFileBlock('error');

        this.bodyBlock.parent = this;
        this.errorBlock.parent = this;
    }

    clone(clonedCallback){
        var rlt = new JSFile_Try(this.name);
        rlt.bodyBlock = this.bodyBlock.clone(clonedCallback);
        rlt.errorBlock = this.errorBlock.clone(clonedCallback);

        rlt.bodyBlock.parent = rlt;
        rlt.errorBlock.parent = rlt;
        if(clonedCallback){
            clonedCallback(rlt, this);
        }
        return rlt;
    }

    pushChild(){
        console.error("try block can't call pushChild");
    }

    pushLine(lineItem, indentOffset){
        this.bodyBlock.pushLine(lineItem, indentOffset);
    }

    getString(prefixStr, indentChar, newLineChar){
        var rlt = prefixStr + 'try{' + newLineChar;
        rlt += this.bodyBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        rlt += prefixStr + '}' + newLineChar;
        rlt += prefixStr + 'catch(eo){' + newLineChar;
        rlt += this.errorBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        rlt += prefixStr + '}' + newLineChar;
        return rlt;
    }
}

class JSFile_Funtion extends FormatFileBlock{
    constructor(name, params_arr, declareType){
        super(name);
        this.params_arr = params_arr == null ? [] : params_arr;
        var paramsStr = '';
        this.params_arr.forEach(e=>{
            paramsStr += (paramsStr.length == 0 ? '' : ',') + e;
        });
        this.declareType = declareType;
        this.clear();
    }

    clear(){
        this.headBlock = new FormatFileBlock('head');
        this.bodyBlock = new FormatFileBlock('body');
        this.retBlock = new FormatFileBlock('ret');
        this.beforeRetBlock = new FormatFileBlock('beforeRet');

        this.scope = new JSFile_Scope('_localfun', this.getScope());
        this.scope.fun = this;
        this.headBlock.parent = this;
        this.bodyBlock.parent = this;
        this.retBlock.parent = this;
        this.beforeRetBlock.parent = this;
    }

    addNextIndent(){
        this.bodyBlock.nextLineIndent += 1;
    }

    subNextIndent(){
        this.bodyBlock.nextLineIndent -= 1;
    }

    pushChild(child){
        if(!IsEmptyString(child.name)){
            this.bodyBlock.childs_map[child.name] = child;
        }
        child.parent = this.bodyBlock;
        child.indent = this.bodyBlock.nextLineIndent;
        this.bodyBlock.childs_arr.push(child);
    }

    getChild(childName){
        return this.bodyBlock.childs_map[childName];
    }

    pushLine(lineItem, indentOffset){
        var itemType = typeof lineItem;
        if(itemType === 'string'){
            lineItem = new FormatFile_Line(lineItem, this.bodyBlock.nextLineIndent);
        }
        else if(!FormatFile_Line.prototype.isPrototypeOf(lineItem)){
            console.error('不支持的lineitem！');
        }
        else{
            lineItem.indent = this.bodyBlock.nextLineIndent;
        }
        lineItem.parent = this.bodyBlock;
        this.bodyBlock.childs_arr.push(lineItem);
        this.bodyBlock.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
    }

    getString(prefixStr, indentChar, newLineChar){
        var paramsStr = '';
        this.params_arr.forEach(e=>{
            if(e == null){
                return;
            }
            paramsStr += (paramsStr.length == 0 ? '' : ',') + e;
        });
        var indentString = this.getIndentString(indentChar);
        var declareLine = 'function ' + this.name + '(' + paramsStr + '){';
        var endDeclareLine = prefixStr + indentString + '}' + newLineChar;
        switch(this.declareType){
            case 'classfun':
            declareLine = this.name + '(' + paramsStr + '){';
            break;
            case 'lambda':
            declareLine = '(' + paramsStr + ')=>{';
            break;
            case 'cofun':
            declareLine += newLineChar + prefixStr + indentString + 'return co(function* () {';
            endDeclareLine = newLineChar + prefixStr + indentString + '});' + endDeclareLine;
            break;
        }
        //this.childs_arr[0].content = declareLine;

        var headStr = '';
        if(this.headBlock.childs_arr.length > 0){
            headStr = this.headBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        }
        var bodyStr = '';
        if(this.bodyBlock.childs_arr.length > 0){
            bodyStr = this.bodyBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        }
        var retStr = '';
        if(this.beforeRetBlock.childs_arr.length > 0){
            retStr = this.beforeRetBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        }
        if(this.retBlock.childs_arr.length > 0){
            retStr += this.retBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
        }
        
        var varDeclareStr = this.scope.getVarDeclareString(prefixStr + indentString + indentChar, newLineChar);
        return prefixStr + indentString + declareLine + newLineChar + varDeclareStr + headStr + bodyStr + retStr + endDeclareLine;
    }
}

class JSFile_Class extends JSFile_Scope{
    constructor(name, parentClassName, outScope){
        super(name, outScope);
        this.parentClassName = parentClassName;
        this.constructorFun = this.getFunction('constructor', true);
    }

    getFunction(funName, autoCreate, params_arr){
        var rlt = super.getFunction(funName, autoCreate, params_arr);
        if(rlt && rlt.declareType != 'classfun'){
            rlt.declareType = 'classfun';
        }
        return rlt;
    }

    getString(prefixStr, indentChar, newLineChar){
        var rlt = prefixStr + 'class ' + this.name + (IsEmptyString(this.parentClassName) ? '' : ' extends ' + this.parentClassName) + '{' + newLineChar;
        for(var fName in this.functions_map){
            var theFun = this.functions_map[fName];
            rlt += theFun.getString(prefixStr + indentChar, indentChar, newLineChar);
        }
        return rlt + newLineChar + prefixStr + '}' + newLineChar;
    }
}

class JSFile_ReactClass extends JSFile_Class{
    constructor(name, outScope){
        super(name, outScope);
        this.parentClassName = 'React.PureComponent';
        this.constructorFun.params_arr = ['props'];
        this.constructorFun.pushLine('super(props);');

        this.renderFun = this.getFunction('render', true);
        this.renderFun.scope.getVar(VarNames.RetElem, true, 'null');
        this.renderFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        this.visibleComScope = new JSFile_Scope('visible' + name, outScope);

        this.mapStateFun = this.visibleComScope.getFunction(name + '_mapstatetoprops', true, ['state','ownprops']);
        this.mapDispathFun = this.visibleComScope.getFunction(name + '_disptchtoprops', true, ['dispatch','ownprops']);

        this.mapStateFun.scope.getVar(VarNames.RetProps, true, '{}');
        this.mapStateFun.retBlock.pushLine('return ' + VarNames.RetProps + ';');
        this.mapDispathFun.scope.getVar('retDispath', true, '{}');
        this.mapDispathFun.retBlock.pushLine('return retDispath;');

        this.mapedState = {};
    }

    getString(prefixStr, indentChar, newLineChar){
        var classStr = super.getString(prefixStr, indentChar, newLineChar);
        var visibleComFunStr = this.visibleComScope.getFunctionDeclareString(prefixStr, indentChar, newLineChar);
        var rlt = classStr + visibleComFunStr;
        rlt += prefixStr + 'const Visible' + this.name + ' = ReactRedux.connect(' + this.mapStateFun.name + ', ' + this.mapDispathFun.name + ')(' + this.name + ');' + newLineChar;
        return rlt;
    }

    addMapState(name, value){
        if(this.mapedState[name] == null){
            this.mapedState[name] = value;
            this.mapStateFun.pushLine(VarNames.RetProps + "['" + name + "']=" + value + ';');
        }
    }
}

class JSFile_PureReactClass extends JSFile_Class{
    constructor(name, outScope){
        super(name, outScope);
        this.parentClassName = 'React.PureComponent';
        this.constructorFun.params_arr = ['props'];
        this.constructorFun.pushLine('super(props);');

        this.renderFun = this.getFunction('render', true);
        this.renderFun.scope.getVar(VarNames.RetElem, true, 'null');
        this.renderFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
    }
}


class JSFileMaker  extends FormatFileMaker{
    constructor(){
        super();
        this.importRegion = this.getRegion('import', true);
        this.importBlock = this.importRegion.defaultBlock;
        this.globalVarRegion = this.getRegion('globalVar', true);
        this.globalVarBlock = this.globalVarRegion.defaultBlock;

        this.globalFunRegion = this.getRegion('globalFun', true);
        this.globalFunBlock = this.globalFunRegion.defaultBlock;

        this.classDefRegion = this.getRegion('classdef', true);
        this.classDefBlock = this.classDefRegion.defaultBlock;

        this.endRegion = this.getRegion('end', true);
        this.endBlock = this.endRegion.defaultBlock;

        this.classes_map = {};
        this.scope = new JSFile_Scope('global');
        this.globalVarGetStringProcess = this.globalVarGetStringProcess.bind(this);
        this.globalVarBlock.addGetStringLisener(this.globalVarGetStringProcess);
        this.classDefGetStringProcess = this.classDefGetStringProcess.bind(this);
        this.classDefBlock.addGetStringLisener(this.classDefGetStringProcess);
        this.globalFunGetStringProcess = this.globalFunGetStringProcess.bind(this);
        this.globalFunBlock.addGetStringLisener(this.globalFunGetStringProcess);
    }

    globalFunGetStringProcess(str, indentStr, newLineChar, prefixStr){
        return str + this.scope.getFunctionDeclareString(prefixStr, indentStr, newLineChar) + newLineChar;
    }

    globalVarGetStringProcess(str, indentStr, newLineChar, prefixStr){
        return str + this.scope.getVarDeclareString(prefixStr, newLineChar) + newLineChar;
    }

    classDefGetStringProcess(str, indentStr, newLineChar, prefixStr){
        var allClassDefStr = '';
        for(var cName in this.classes_map){
            allClassDefStr += this.classes_map[cName].getString('', indentStr, newLineChar);
        }
        
        return str + allClassDefStr + newLineChar;
    }

    getClass(name, autoCreate, parentClassName){
        var rlt = this.classes_map[name];
        if(rlt == null && autoCreate){
            rlt = new JSFile_Class(name, parentClassName, this.scope);
            this.classes_map[name] = rlt;
        }
        return rlt;
    }

    getReactClass(name, autoCreate, noVisibleCom){
        var rlt = this.classes_map[name];
        if(rlt == null && autoCreate){
            if(noVisibleCom){
                rlt = new JSFile_PureReactClass(name, this.scope);
            }
            else
            {
                rlt = new JSFile_ReactClass(name, this.scope);
            }
            this.classes_map[name] = rlt;
        }
        return rlt;
    }
}

class FlowScriptFile extends JSFileMaker{
    constructor(flow){
        super();
        this.flow = flow;
        this.fileName = 'serverFlow' + flow.code;
        this.importModels = {};

        this.importBlock.pushLine("const dbhelper = require('../../../../dbhelper.js');");
        this.importBlock.pushLine("const serverhelper = require('../../../../erpserverhelper.js');");
        this.importBlock.pushLine("const co = require('co');");
        this.importBlock.pushLine("const sqlTypes = dbhelper.Types;");
        this.importBlock.pushLine("const fs = require('fs');");
        this.importBlock.pushLine("const forge = require('node-forge');");

        this.processFun = this.scope.getFunction('process', true, ['stepCode', 'param1', 'param2', 'param3']);
        
    }

    appendImport(name, path){
        if(this.importModels[name] == null){
            this.importModels[name] = 1;
            this.importBlock.pushLine("const " + name + " = require('" + path + "');");
        }
    }

    compile(){
        return true;
    }

    compileEnd(){
        this.endBlock.pushLine('module.exports = process;');
    }

    initProcessFun(theFun){
        if(theFun.inited){
            return;
        }
        theFun.headBlock.pushLine("return co(function* () {");
        theFun.bodyBlock.addNextIndent();
        theFun.retBlock.pushLine("});");
        theFun.inited = true;
        theFun.scope.isServerSide = true;
    }

}

class CP_ServerSide extends JSFileMaker{
    constructor(projectCompiler){
        super();
        this.projectCompiler = projectCompiler;
        this.fileName = projectCompiler.projectName + '_server';
        this.project = projectCompiler.project;
        this.importModels = {};

        this.importBlock.pushLine("const dbhelper = require('../../../../dbhelper.js');");
        this.importBlock.pushLine("const serverhelper = require('../../../../erpserverhelper.js');");
        this.importBlock.pushLine("const co = require('co');");
        this.importBlock.pushLine("const sqlTypes = dbhelper.Types;");
        //this.importBlock.pushLine("const sharp = require('sharp');");
        this.importBlock.pushLine("const fs = require('fs');");
        this.importBlock.pushLine("const forge = require('node-forge');");

        this.processFun = this.scope.getFunction('process', true, ['req', 'res', 'next']);
        this.processFun.pushLine('serverhelper.commonProcess(req, res, next, processes_map);');
        this.pageLoadedFun = this.scope.getFunction('pageloaded', true, ['req', 'res'], 'cofun');
        this.pageLoadedFun.pushLine('var rlt = {};');
        this.permissionCheckFun = this.scope.getFunction('pagePermissionCheck', true, ['req', 'res', 'next']);

        this.processesMapVar = this.scope.getVar('processes_map', true);
        this.processesMapVarInitVal = {
            pageloaded:'pageloaded',
        };
    }

    appendImport(name, path){
        if(this.importModels[name] == null){
            this.importModels[name] = 1;
            this.importBlock.pushLine("const " + name + " = require('" + path + "');");
        }
    }

    compile(){
        return true;
    }

    compileEnd(){
        this.processesMapVar.initVal = JsObjectToString(this.processesMapVarInitVal);
        this.endBlock.pushLine('module.exports = process;');

        this.pageLoadedFun.pushLine('return rlt;');
    }

    initProcessFun(theFun, theKernel, bAccessCheck){
        if(theFun.inited){
            return;
        }
        theFun.headBlock.pushLine('var g_envVar = req.session.g_envVar;');
        theFun.headBlock.pushLine("return co(function* () {");
        theFun.bodyBlock.addNextIndent();
        if(bAccessCheck && theKernel){
            var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
            var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
            var groups_arr;
            if(theKernel.hasAttribute(AttrNames.PermissionGroup) && theKernel.getAttrArrayList(AttrNames.PermissionGroup).length>0){
                // 这个控件带有权限组设置，直接用它的设置
                groups_arr = theKernel.getAttrArrayList(AttrNames.PermissionGroup).map(attr=>{
                    return theKernel.getAttribute(attr.name);
                });
                theFun.bodyBlock.pushLine('var permissiongroup_arr = [' + groups_arr.join(',') +  '];');
            }
            else if(belongPage){
                groups_arr = belongPage.getAttrArrayList(AttrNames.PermissionGroup).map(attr=>{
                    return belongPage.getAttribute(attr.name);
                });
                theFun.bodyBlock.pushLine('var permissiongroup_arr = [' + groups_arr.join(',') +  '];');
            }
            else if(this.projectCompiler.getMidData){
                var templateKernelMidData = this.projectCompiler.getMidData(belongUserControl == null ? theKernel.id : belongUserControl.getTemplateKernel().id);
                if(templateKernelMidData.needCheckAccessFuns_arr == null){
                    templateKernelMidData.needCheckAccessFuns_arr = [];
                }
                templateKernelMidData.needCheckAccessFuns_arr.push(theFun);

                theFun.bodyBlock.pushLine('var permissiongroup_arr=[];');
                var pageSwitch = new JSFile_Switch('switch', 'req.body.pageid');
                pageSwitch.defaultBlock.pushLine("return serverhelper.createErrorRet('错误的访问来源',0,null)");
                theFun.bodyBlock.pushChild(pageSwitch);
                theFun.addPageCheck = (page)=>{
                    var pageGroups_arr = page.getAttrArrayList(AttrNames.PermissionGroup).map(attr=>{
                        return page.getAttribute(attr.name);
                    });
                    var caseBLK = pageSwitch.getCaseBlock(singleQuotesStr(page.id), false);
                    if(caseBLK == null){
                        caseBLK = pageSwitch.getCaseBlock(singleQuotesStr(page.id), true);
                        caseBLK.pushLine("permissiongroup_arr=[" + pageGroups_arr.join(',') +  '];');
                    }
                };
                if(theKernel.type == M_PageKernel_Type){
                    theFun.addPageCheck(theKernel);
                }
            }
            theFun.bodyBlock.pushLine('var bCanAccess = yield serverhelper.CheckPermission(req, ' + (this.projectCompiler.projProfile ? this.projectCompiler.projProfile.code : 'null') +', permissiongroup_arr);');
            theFun.bodyBlock.pushLine("if(!bCanAccess){return serverhelper.createErrorRet('未授权的访问',0,null);}");
        }
        theFun.retBlock.pushLine("});");
        theFun.inited = true;
        theFun.scope.isServerSide = true;
    }
}

class CP_ClientSide extends JSFileMaker{
    constructor(projectCompiler){
        super();
        this.projectCompiler = projectCompiler;
        this.project = projectCompiler.project;

        this.mobileDDApis_map = {};
        this.pcDDApis_map = {};

        this.importBlock.pushLine('var Redux = window.Redux;');
        this.importBlock.pushLine('var Provider = ReactRedux.Provider;');

        this.scope.getVar('appServerUrl', true, "'/erppage/server/" + projectCompiler.projectName + "'");
        this.scope.getVar('thisAppTitle', true, singleQuotesStr(projectCompiler.projectTitle));
        this.appInitStateVar = this.scope.getVar('appInitState', true);
        this.appInitState = this.appInitState = {
            loaded:false,
            ui:{
            },
            _isroot:true,
        };
        this.appClass = this.getReactClass('App', true);
        this.reducers_map = {};

        this.appClass.constructorFun.pushLine("this.renderLoadingTip = baseRenderLoadingTip.bind(this);");

        this.appReducerSettingVar = this.scope.getVar('appReducerSetting', true);
        this.appReducerVar = this.scope.getVar('appReducer', true, 'createReducer(appInitState, Object.assign(baseReducerSetting,appReducerSetting))');
        this.reducerVar = this.scope.getVar('reducer', true, 'appReducer');
        this.storeVar = this.scope.getVar('store', true, 'Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()))');
        this.stateChangedAct_mapVar = this.scope.getVar('appStateChangedAct_map', true);
        this.stateChangedAct = {};

        this.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps,VarNames.NowPage), makeStr_DotProp('state',VarNames.NowPage)));

        var setCusValidCheckerBlock = new FormatFileBlock('setCusValidChecker');
        setCusValidCheckerBlock.parent = this;
        this.endBlock.pushChild(setCusValidCheckerBlock);
        this.setCusValidCheckerBlock = setCusValidCheckerBlock;
    }

    compile(){
        this.styleCounter = 1;
        return true;
    }

    addReducer(reducerKey, reducerName){
        this.reducers_map[reducerKey] = reducerName;
    }

    compileEnd(){
        this.appInitStateVar.initVal = JsObjectToString(this.appInitState);
        this.appReducerSettingVar.initVal = JsObjectToString(this.reducers_map);
        this.stateChangedAct_mapVar.initVal = JsObjectToString(this.stateChangedAct);

        var mobileDDApisValue = 'null';
        var pcDDApisValue = 'null';
        var apiName;
        if(!IsEmptyObject(this.mobileDDApis_map)){
            mobileDDApisValue = '';
            for (apiName in this.mobileDDApis_map) {
                mobileDDApisValue += (mobileDDApisValue.length == 0 ? '' : ',') + singleQuotesStr(apiName);
            }
            mobileDDApisValue = '[' + mobileDDApisValue + ']';
        }
        if(!IsEmptyObject(this.pcDDApis_map)){
            pcDDApisValue = '';
            for (apiName in this.pcDDApis_map) {
                pcDDApisValue += (pcDDApisValue.length == 0 ? '' : ',') + singleQuotesStr(apiName);
            }
            pcDDApisValue = '[' + pcDDApisValue + ']';
        }

        var ifLoginBK = new JSFile_IF('iflogin', 'g_envVar.userid != null');
        this.endBlock.pushChild(ifLoginBK);
        ifLoginBK.trueBlock.pushLine('ErpControlInit();');
        ifLoginBK.trueBlock.pushLine("$(document).ready(function(){", 1);
        ifLoginBK.trueBlock.pushLine('InitDingDing(()=>{', 1);
        ifLoginBK.trueBlock.pushLine('ReactDOM.render(<Provider store={store}>', 1);
        ifLoginBK.trueBlock.pushLine('<VisibleApp />', -1);
        ifLoginBK.trueBlock.pushLine("</Provider>, document.getElementById('reactRoot'));");
        ifLoginBK.trueBlock.subNextIndent();
        ifLoginBK.trueBlock.pushLine('},' + mobileDDApisValue + ',' + pcDDApisValue + ');');
        ifLoginBK.trueBlock.subNextIndent();
        ifLoginBK.trueBlock.pushLine('});');

        ifLoginBK.falseBlock.pushLine("var search = location.search.replace('?','');");
        ifLoginBK.falseBlock.pushLine("location.href = '/?goto=' + location.pathname + '&' + search;");

        this.endBlock.pushLine("AppInit(this);");
        this.endBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));");
    }

    getString(indentChar, newLineChar){
        return super.getString(indentChar, newLineChar);
    }

    addStyleObject(styleId, styleObj){
        if(IsEmptyObject(styleObj)){
            return false;
        }
        var rightSyleObj = {};
        for(var sn in styleObj){
            rightSyleObj[gStyleAttrNameToCssName(sn)] = styleObj[sn];
        }
        if(this.styleDefBlock == null){
            this.styleDefBlock = this.defaultRegion.getBlock('styledef', true, 2);
        }
        var styleBlock = this.styleDefBlock.getChild(styleId);
        if(styleBlock == null){
            styleBlock = new FormatFileBlock(styleId);
            this.styleDefBlock.pushChild(styleBlock);

            styleBlock.pushLine('const ' + styleId + '=' + JSON.stringify(styleObj) + ';');
        }
        return true;
    }
}