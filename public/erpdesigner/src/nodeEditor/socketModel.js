class NodeSocket extends EventEmitter{
    constructor(name, tNode, isIn, initData, isSimpleVal){
        super();
        Object.assign(this, initData);
        EnhanceEventEmiter(this);
        this.name =  name;
        this.node = tNode;
        this.isIn = isIn;
        this.isSimpleVal = isSimpleVal != false;
        this.setName(this.name);
        this.setCurrentComponent = CommonFun_SetCurrentComponent.bind(this);
    }

    setName(name){
        this.id = this.node.id + '$' + name;
    }
    
    set(data){
        var changed = false;
        for(var name in data){
            if(data[name] != this[name]){
                this[name] = data[name];
                changed = true;
            }
        }
        if(changed){
            this.fireEvent('changed', data);
        }
    }

    getLinks(){
        return this.node.bluePrint.linkPool.getLinksBySocket(this);
    }

    fireLinkChanged(){
        this.emit(Event_LinkChanged);
        var self = this;
        setTimeout(() => {
            self.node.fireMoved();
        }, 20);
    }

    getExtra(key,def){
        if(this.extra == null){
            return def;
        }
        return this.extra[key] == null ? def : this.extra[key];
    }

    setExtra(key, val){
        if(this.extra == null){
            this.extra = {};
        }
        this.extra[key] = val;
    }

    getJson(){
        var rlt = {
            name:this.name,
            isIn:this.isIn,
            id:this.id,
            type:this.type,
        };
        if(this.visible == false){
            rlt.visible = false;
        }
        if(this.defval != null){
            rlt.defval = this.defval;
        }
        if(this.extra){
            rlt.extra={};
            for(var si in this.extra){
                var tVal = this.extra[si];
                if(tVal != null){
                    rlt.extra[si] = tVal;
                }
            }
        }
        return rlt;
    }
}

class NodeFlowSocket extends NodeSocket{
    constructor(name, tNode, isIn, initData){
        super(name, tNode, isIn, initData);
        this.isFlowSocket = true;
        this.type = 'flow';
    }
}

function CreateNodeSocketByJson(theNode, jsonData, createHelper){
    var rlt = null;
    var initData = {defval:jsonData.defval,extra:jsonData.extra};
    if(jsonData.type == 'flow'){
        rlt = new NodeFlowSocket(jsonData.name,theNode,jsonData.isIn, initData);
    }
    else{
        initData.type = jsonData.type;
        rlt = new NodeSocket(jsonData.name,theNode,jsonData.isIn, initData);
    }
    createHelper.saveJsonMap(jsonData, rlt);
    return rlt;
}