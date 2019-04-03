const JSNODE_JSFOR = 'jsfor';

class JSNode_JsFor extends JSNode_Base{
    constructor(initData, parentNode, createHelper, nodeJson) {
<<<<<<< HEAD
        super(initData, parentNode, createHelper, JSNODE_COMPARE, '比较', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = ValueType.Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: ValueType.Boolean});
            this.addSocket(this.outSocket);
        }
        this.insocketInitVal = {
            type: ValueType.String,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: ValueType.String }));
            this.addSocket(new NodeSocket('in1', this, true, { type: ValueType.String }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.operator == null) {
            this.operator = '==';
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }

    getNodeTitle() {
        return '比较:' + this.operator;
=======
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
>>>>>>> master
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
<<<<<<< HEAD
};

////
=======
};
>>>>>>> master
