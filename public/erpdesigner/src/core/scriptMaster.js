class ScriptMaster extends EventEmitter{
    constructor(project){
        super();
        autoBind(this);
        this.blueprints_arr = [];
        this.project = project;

        //this.createBP('test', 'test');
    }

    addBP(bpItem){
        if(this.blueprints_arr.indexOf(bpItem) != -1){
            return;
        }
        var useCode = bpItem.code;
        var  i = 0;
        if(IsEmptyString(useCode) || this.getBPByCode(useCode) != null){
            for(i=0;i<9999;++i){
                useCode = 'scriptBP_' + i;
                if(this.getBPByCode(useCode) == null){
                    break;
                }
            }
        }
        var useName = bpItem.name;
        if(IsEmptyString(useName) || this.getBPByName(useName) != null){
            for(i=0;i<9999;++i){
                useName = '脚本蓝图_' + i;
                if(this.getBPByName(useCode) == null){
                    break;
                }
            }
        }
        bpItem.master = this;
        bpItem.name = useName;
        bpItem.code = useCode;
        bpItem.id = useCode;
        this.blueprints_arr.push(bpItem);
    }

    getBPByName(name){
        return this.blueprints_arr.find(item=>{return item.name == name;});
    }

    getBPByCode(code){
        return this.blueprints_arr.find(item=>{return item.code == code;});
    }

    createBP(name, type, group){
        var newItem = new JSNode_BluePrint({name:name,type:type,master:this,group:group});
        this.addBP(newItem);
        this.emit('bpchanged');
        return newItem;
    }

    modifyBP(sqpBP, name, type){
        sqpBP.name = name;
        sqpBP.type = type;
        this.emit('bpchanged');
    }

    deleteBP(sqpBP){
        var index = this.blueprints_arr.indexOf(sqpBP);
        if(index != -1){
            this.blueprints_arr.splice(index, 1);
        }
        sqpBP.master = null;
    }

    getJson(jsonProf){
        var rlt = {
            blueprints_arr:[]
        };
        this.blueprints_arr.forEach(bp=>{
            rlt.blueprints_arr.push(bp.getJson(jsonProf));
        });
        return rlt;
    }

    restoreFromJson(json){
        if(json == null){
            return;
        }
        if(json.blueprints_arr){
            json.blueprints_arr.forEach(bpjson=>{
                var creationHelper = new NodeCreationHelper(); 
                creationHelper.project = this.project;
                var newbp = new JSNode_BluePrint(null, bpjson, creationHelper);
                this.addBP(newbp);
            });
        }
    }
}