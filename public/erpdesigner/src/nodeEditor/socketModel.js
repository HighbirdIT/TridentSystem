class NodeSocket extends EventEmitter{
    constructor(name, tNode, isIn, initData){
        super();
        Object.assign(this, initData);
        EnhanceEventEmiter(this);
        this.name = name;
        this.node = tNode;
        this.isIn = isIn;
        this.id = tNode.id + '$' + name;
        this.setCurrentComponent = CommonFun_SetCurrentComponent.bind(this);
    }
    
    set(data){
        Object.assign(this, data);
        this.emit('changed');
    }

    getLinks(){
        return this.node.bluePrint.linkPool.getLinksBySocket(this);
    }

    fireLinkChanged(){
        this.emit(Event_LinkChanged);
        var self = this;
        setTimeout(() => {
            self.node.emit('moved');
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
            defval:this.defval,
        };
        if(this.extra){
            for(var si in this.extra){
                var tVal = this.extra[si];
                if(tval != null){
                    rlt[si] = tVal;
                }
            }
        }
        return rlt;
    }
}

