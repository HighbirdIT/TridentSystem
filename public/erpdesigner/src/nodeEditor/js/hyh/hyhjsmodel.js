const JSNODE_JSFOR = 'jsfor';

class JSNode_JsFor extends JSNode_Base{
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SWITCH, 'For', false, nodeJson);
        autoBind(this);

        if(this.inFlowSocket == null){
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if(this.inputSocket == null){
            this.inputSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inputSocket);
        }
        this.inputSocket.label = 'target';
        if(this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0){
            this.outFlowSockets_arr = [];
        }
        else{
            this.outFlowSockets_arr.forEach(item=>{
                item.inputable = true;
            });
        }
    }


    //编译
}


JSNodeEditorControls_arr.push({
    label: 'for循环',
    nodeClass: JSNode_JsFor,
    type: '流控制'
})

///////////////////////////////////
JSNodeClassMap[JSNODE_JSFOR] = {
    modelClass: JSNode_JsFor,
    comClass: C_Node_SimpleNode,
};
