function MK_NS_Settings(label, type, defval){
    return{
        label:label,
        type:type,
        defval:defval
    };
}

function CommonFun_SetCurrentComponent(target){
    if(this.currentComponent != target){
        this.currentComponent = target;
        this.emit(Event_CurrentComponentchanged, this);
    }
}

class CompileResult{
    constructor(node){
        this.node = node;
        this.socketOuts = {};
    }
    
    setSocketOut(socket, strContent, data){
        this.socketOuts[socket.id]={
            strContent:strContent,
            data:data,
        }
    }

    setDirectOut(strContent,data){
        this.directOut={
            strContent:strContent,
            data:data,
        }
    }

    getSocketOut(socket){
        return this.socketOuts[socket.id];
    }

    getDirectOut(){
        return this.directOut;
    }
}

class ContextFinder{
    constructor(type){
        this.type = type;
        this.item_arr = [];
    }

    addItem(label,data){
        if(data == null){
            return;
        }
        if(label == null){
            console.warn('context meet null label');
            label = 'unname';
        }
        this.item_arr.push({label:label,data:data});
        return this.item_arr[this.item_arr.length - 1];
    }

    setTest(key){
        this['test-' + key] = 1;
    }

    isTest(key){
        return this['test-' + key] == 1;
    }

    count(){
        return this.item_arr.length;
    }
}

class NodeCreationHelper extends EventEmitter {
    constructor() {
        super();
        EnhanceEventEmiter(this);
        this.orginID_map = {};
        this.newID_map = {};
        this.idTracer = {};
    }

    saveJsonMap(jsonData, newNode) {
        if (jsonData && jsonData.id) {
            if (this.getObjFromID(jsonData.id) != null) {
                console.warn(jsonData.id + '被重复saveJsonMap');
            }
            if (jsonData.id != newNode.id) {
                if (this.getObjFromID(newNode.id) != null) {
                    console.warn(jsonData.id + '被重复saveJsonMap');
                }
                this.idTracer[jsonData.id] = this.idTracer[newNode.id]
            }
            this.orginID_map[jsonData.id] = newNode;
        }

        this.newID_map[newNode.id] = newNode;
    }

    getObjFromID(id) {
        var rlt = this.orginID_map[id];
        if (rlt == null) {
            rlt = this.newID_map[id];
        }
        return rlt;
    }
}