
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
            nowEntity = new DBEntity(entityData);
            this.entities_arr.push(nowEntity);
            this.entityCode_map[code] = nowEntity;
            this.entityCode_map[entityData.name] = nowEntity;
            return true;
        }
        else{
            return nowEntity.synData(entityData);
        }
    }

    getEntityByCode(code){
        return this.entityCode_map[code];
    }
}

class DBEntity extends EventEmitter{
    constructor(initData){
        super();
        Object.assign(this, initData);
    }

    synData(newData){
        return false;
    }
}

class CustomDbEntity extends EventEmitter{
    constructor(initData){
        super();
        Object.assign(this, initData);
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
        this.customDBEntities_arr = [new CustomDbEntity({name:'测试源',code:project.genControlName('cusDBE')}), new CustomDbEntity({name:'测试源2',code:project.genControlName('cusDBE')})];

        this.dataView_usedDBEnities.on('changed',this.usedDBEnitiesChangedHandler);
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
