class ScriptMaster extends EventEmitter{
    constructor(project){
        super();
        autoBind(this);
        this.blueprints_arr = [];
        this.cusobjects_arr = [];
        this.project = project;

        //this.createBP('test', 'test');
    }

    addCusObj(cobj){
        if(this.cusobjects_arr.indexOf(cobj) != -1){
            return;
        }
        var useCode = cobj.code;
        var i = 0;
        if(IsEmptyString(useCode) || this.getCusObjByCode(useCode) != null){
            for(i=0;i<9999;++i){
                useCode = 'cusobj_' + i;
                if(this.getCusObjByCode(useCode) == null){
                    break;
                }
            }
        }
        var useName = cobj.name;
        if(IsEmptyString(useName) || this.getCusObjByName(useName) != null){
            for(i=0;i<9999;++i){
                useName = '数据对象_' + i;
                if(this.getCusObjByName(useName) == null){
                    break;
                }
            }
        }
        cobj.master = this;
        cobj.name = useName;
        cobj.code = useCode;
        cobj.id = useCode;
        this.cusobjects_arr.push(cobj);
    }

    getAllCustomObject(){
        return this.cusobjects_arr;
    }

    getCusObjByCode(code){
        return this.cusobjects_arr.find(item=>{return item.code == code;});
    }

    getCusObjByName(name){
        return this.cusobjects_arr.find(item=>{return item.name == name;});
    }

    createCusObj(name){
        var newItem = new CustomObject(name);
        this.addCusObj(newItem);
        return newItem;
    }

    modifyCusObj(cobj){
    }

    deleteCusObj(cobj){
        var index = this.cusobjects_arr.indexOf(cobj);
        if(index != -1){
            this.cusobjects_arr.splice(index, 1);
        }
        cobj.master = null;
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
                if(this.getBPByName(useName) == null){
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

    getAllCustomScript(){
        return this.blueprints_arr.filter(item=>{return item.group == EJsBluePrintFunGroup.Custom;});
    }

    getBPByName(name){
        return this.blueprints_arr.find(item=>{return item.name == name;});
    }

    getBPByCode(code){
        return this.blueprints_arr.find(item=>{return item.code == code;});
    }

    getBPByUUID(uuid){
        return this.blueprints_arr.find(item=>{return item.uuid == uuid});
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

    getBPsByControlKernel(ctlID){
        return this.blueprints_arr.filter(bp=>{
            return bp.ctlID == ctlID;
        });
    }

    getJson(jsonProf){
        var rlt = {
            blueprints_arr:[],
            cusobjects_arr:[],
        };
        this.blueprints_arr.forEach(bp=>{
            rlt.blueprints_arr.push(bp.getJson(jsonProf));
        });
        this.cusobjects_arr.forEach(cusobj=>{
            rlt.cusobjects_arr.push(cusobj.getJson());
        });
        return rlt;
    }

    restoreFromJson(json, restoreHelper){
        if(json == null){
            return;
        }

        if(json.cusobjects_arr){
            json.cusobjects_arr.forEach(cusObjJson=>{
                var newCusObj = new CustomObject(cusObjJson.name, cusObjJson.code, cusObjJson.dm);
                newCusObj.code = cusObjJson.code;
                this.addCusObj(newCusObj);
            });
        }
        if(json.blueprints_arr){
            json.blueprints_arr.forEach(bpjson=>{
                var creationHelper = new NodeCreationHelper(); 
                creationHelper.restoreHelper = restoreHelper;
                creationHelper.project = this.project;
                var newbp = new JSNode_BluePrint(null, bpjson, creationHelper);
                this.addBP(newbp);
            });
        }
    }
}

class CustomObject extends EventEmitter{
    constructor(name, code, dataMembers_arr){
        super();
        this.name = name;
        this.code = code;
        this.dataMembers_arr = dataMembers_arr == null ? [] : dataMembers_arr.concat();
    }

    getJson() {
        return {
            name:this.name,
            code:this.code,
            dm:this.dataMembers_arr,
        };
    }
}