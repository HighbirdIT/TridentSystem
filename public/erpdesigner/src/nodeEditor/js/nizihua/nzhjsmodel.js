const JSNODE_WHILE = 'jswhile';

class JSNode_While extends JSNode_Base{
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_WHILE, 'While', false, nodeJson);
        autoBind(this);

        if(this.inFlowSocket == null){
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if(this.outFlowSocket == null){
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputSocket = this.inputScokets_arr[0];
            this.inputSocket.inputable = false;
        }
        if(this.inputSocket == null){
            this.inputSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inputSocket);
        }
        this.inputSocket.label = 'condition';

        if(this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0){
            this.outFlowSockets_arr = [];
        }
        else{
            this.outFlowSockets_arr.forEach(item=>{
                item.inputable = true;
            });
        }

    }   

    getNodeTitle() {
        return 'While';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketValue = '';

        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inputSocket);
        if(datalinks_arr.length == 0){
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '必须有输入']);
            return false;
        }
        else{
            var dataLink = datalinks_arr[0];
            var outNode = dataLink.outSocket.node;
            var compileRet = null;
            if(outNode.isHadFlow()){
                compileRet = helper.getCompileRetCache(outNode);
                if(compileRet == null){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '输入接口设置错误']);
                    return false;
                }
            }
            else{
                compileRet = outNode.compile(helper,usePreNodes_arr);
            }
            if(compileRet == false){
                return false;
            }
            socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
        }
        
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine('switch(' + socketValue + '){');
        myJSBlock.addNextIndent();

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if(this.outFlowSockets_arr.length == 0){
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '必须要有case设置']);
            return false;
        }

        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;
        for(var oi in this.outFlowSockets_arr){
            var caseFlowSocket = this.outFlowSockets_arr[oi];
            if(IsEmptyString(caseFlowSocket.defval)){
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    'case输入不能为空']);
                return false;
            }
            var caseStr = caseFlowSocket.defval;
            if(isNaN(caseStr)){
                if(caseStr != 'default'){
                    caseStr = singleQuotesStr(caseStr);
                }
            }
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(caseFlowSocket);
            if(flowLinks_arr.length == 0){
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    'case 流程不能为空']);
                return false;
            }
            flowLink = flowLinks_arr[0];
            myJSBlock.pushLine((caseStr == 'default' ? '' : 'case ') + caseStr + ':{');
            var caseBlock = new FormatFileBlock('case' + caseStr);
            myJSBlock.pushChild(caseBlock);
            myJSBlock.pushLine('}');

            nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, caseBlock);
            if(nextNodeCompileRet == false){
                return false;
            }
        }
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');
        
        if(this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false){
            return false;
        }

        return selfCompileRet;
    }
}


JSNodeClassMap[JSNODE_WHILE] = {
    modelClass: JSNode_While,
    comClass: C_Node_SimpleNode,
};

JSNodeEditorControls_arr.push(
    {
        label:'while',
        nodeClass:JSNode_While,
        type:'流控制'
    },
)