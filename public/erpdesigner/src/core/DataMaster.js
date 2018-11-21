
class DataBase extends EventEmitter{
    constructor(){
        super();
        this.entities_arr = [];
        this.entityCode_map = {};
        this.entityName_map = {};
    }

    synEnityFromFetch(data_arr){
        var changed_arr = [];
        data_arr.forEach(entityData=>{
            if(this.synEntity(entityData)){
                changed_arr.push(this.getEntityByCode(entityData.code));
            }
        });
        console.log(changed_arr);
    }
    
    synEntity(entityData){
        if(entityData == null)
            return false;
        var code = entityData.code;
        if(isNaN(code)){
            console.warn('错误的entityData.code' + code);
            return false;
        }
        var nowEntity = this.entityCode_map[code];
        if(nowEntity == null){
            nowEntity = this.createEnity(entityData);
            nowEntity.loaded = true;
            return true;
        }
        else{
            this.entityCode_map[entityData.name] = nowEntity;
            nowEntity.synData(entityData);
        }
        return true;
    }

    createEnity(initData){
        if(initData.code == null){
            console.error('createEnity的参数必须要有code!');
            return null;
        }
        var newEntity = new DBEntity(initData);
        this.entities_arr.push(newEntity);
        this.entityCode_map[initData.code] = newEntity;
        if(initData.name){
            this.entityCode_map[initData.name] = newEntity;
        }
        return newEntity;
    }

    getEntityByCode(code){
        var rlt = this.entityCode_map[code.toString()];
        if(rlt == null){
            rlt = this.createEnity({code:code});
            rlt.loaded = false;
            rlt.doSyn();
        }
        return this.entityCode_map[code.toString()];
    }

    synBykeyword(callback){

    }
}

class DBEntity extends EventEmitter{
    constructor(initData){
        super();
        Object.assign(this, initData);
        autoBind(this);
    }

    synData(newData){
        Object.assign(this, newData);
        this.syning = false;
        this.synErr = null;
        this.loaded = true;
        this.emit('syned');
        return true;
    }

    synComplete(fetchData){
        console.log('synComplete');
        this.syning = false;
        this.loaded = true;
        var json = fetchData.json;
        if(json.err){
            console.error(json.err);
            this.synErr = err;
            return;
        }
        else if(json.data.length == 0){
            console.warn(this.code + '没有在数据库中找到');
            this.synErr = {info:'不存在了' + this.code};
            return;
        }
        else{
            this.synData(json.data[0]);
        }
    }

    doSyn(){
        if(this.syning)
            return;
        this.syning = true;
        fetchJsonPosts('server', { action: 'syndata_bycodes', codes_arr: [this.code] }, this.synComplete);
    }
}

var g_dataBase = new DataBase();

const E_USED_ENITIES_CHANGED = 'E_USED_ENITIES_CHANGED';

class DataMaster extends EventEmitter{
    constructor(project){
        super();
        autoBind(this);
        this.database = g_dataBase;
        this.usedDBEnities_arr = [];
        this.dataView_usedDBEnities = new ListDataView(this.usedDBEnities_arr,'name','code');
        var cus1 = new CustomDbEntity({name:'test',code:project.genControlName('cusDBE'),type:'表值',master:this});
        var cus2 = new CustomDbEntity({name:'test2',code:project.genControlName('cusDBE'),type:'表值',master:this});
        var tVar = cus1.createEmptyVariable();
        tVar.needEdit = false;
        this.customDBEntities_arr = [cus1,cus2];
        this.project = project;

        this.dataView_usedDBEnities.on('changed',this.usedDBEnitiesChangedHandler);
    }

    hadCusDBE(name){
        return this.customDBEntities_arr.find(item=>{return item.name == name}) != null;
    }

    createCusDBE(name, type){
        this.customDBEntities_arr.push(new CustomDbEntity({name:name,code:this.project.genControlName('cusDBE'),type:type,master:this}));
        this.emit('customDBEChanged');
    }

    usedDBEnitiesChangedHandler(source){
        this.emit(E_USED_ENITIES_CHANGED);
    }

    synEnityFromFetch(data_arr){
        this.database.synEnityFromFetch(data_arr);
    }

    useEnity(data){
        if(this.usedDBEnities_arr.find(e=>{return e.code == data.code})){
            return false;
        }
        var index = this.usedDBEnities_arr;
        this.usedDBEnities_arr.push(data);
        this.usedDBEnities_arr.sort((a,b)=>{
            return a.name < b.name;
        })
        this.dataView_usedDBEnities.emit('changed', this);
        return true;
    }
}
