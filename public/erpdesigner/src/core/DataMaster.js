
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

    containColumn(colName){
        return this.getColumnByName(colName) != null;
    }

    getColumnByName(colName){
        return this.columns.find(x=>{return x.name == colName;});
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
        //var cus1 = new SqlNode_BluePrint({name:'test',code:project.genControlName('cusDBE'),type:'表值',master:this});
        //var cus2 = new SqlNode_BluePrint({name:'test2',code:project.genControlName('cusDBE'),type:'表值',master:this});
        //var tVar = cus1.createEmptyVariable();
        //tVar.needEdit = false;
        this.customDBEntities_arr = [];
        this.project = project;

        this.dataView_usedDBEnities.on('changed',this.usedDBEnitiesChangedHandler);

        var testJson = {"code":"cusDBE3","retNodeId":"select_0","name":"dfsdfsdf","type":"表值","editorLeft":563,"editorTop":768,"nodes_arr":[{"id":"select_0","type":"select","left":-290,"top":-410,"title":"返回表","editorLeft":-200,"editorTop":639,"inputScokets_arr":[{"name":"in","isIn":true,"id":"select_0$in","type":"table"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"select_0$out","type":"table"}],"nodes_arr":[{"id":"ret_columns_0","type":"ret_columns","left":100,"top":0,"inputScokets_arr":[{"name":"in5","isIn":true,"id":"ret_columns_0$in5","type":"scalar","extra":{"alias":"testcode"}},{"name":"in6","isIn":true,"id":"ret_columns_0$in6","type":"scalar"},{"name":"in7","isIn":true,"id":"ret_columns_0$in7","type":"scalar"},{"name":"in3","isIn":true,"id":"ret_columns_0$in3","type":"scalar"}]},{"id":"ret_condition_0","type":"ret_condition","left":930,"top":-270,"inputScokets_arr":[{"name":"in","isIn":true,"id":"ret_condition_0$in","type":"boolean"}]},{"id":"ret_order_0","type":"ret_order","left":990,"top":350,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"ret_order_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"ret_order_0$in1","type":"scalar","extra":{"orderType":"desc"}}]},{"id":"constvalue_1","type":"constvalue","left":-166,"top":78,"outputScokets_arr":[{"name":"out","isIn":false,"id":"constvalue_1$out","defval":"56","type":"scalar"}]},{"id":"column_0","type":"column","left":-298,"top":116,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记日期","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_0$out"}]},{"id":"column_1","type":"column","left":-298,"top":154,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记种类","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_1$out"}]},{"id":"column_2","type":"column","left":-330,"top":192,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_2$out"}]},{"id":"column_3","type":"column","left":250,"top":330,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_3$out"}]},{"id":"column_4","type":"column","left":280,"top":370,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记时间","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_4$out"}]},{"id":"column_5","type":"column","left":330,"top":-380,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_5$out"}]},{"id":"compare_0","type":"compare","left":720,"top":-390,"operator":"=","inputScokets_arr":[{"name":"in0","isIn":true,"id":"compare_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"compare_0$in1","defval":"17","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"compare_0$out","type":"boolean"}]},{"id":"noperand_1","type":"noperand","left":380,"top":-260,"operator":"+","inputScokets_arr":[{"name":"in0","isIn":true,"id":"noperand_1$in0","defval":"1","type":"scalar"},{"name":"in1","isIn":true,"id":"noperand_1$in1","defval":"16","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"noperand_1$out","type":"scalar"}]}]},{"id":"noperand_0","type":"noperand","left":-320,"top":-50,"operator":"+","inputScokets_arr":[{"name":"in0","isIn":true,"id":"noperand_0$in0","defval":"1","type":"scalar"},{"name":"in1","isIn":true,"id":"noperand_0$in1","defval":"2","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"noperand_0$out","type":"scalar"}]},{"id":"dbEntity_0","type":"dbEntity","left":-640,"top":-550,"targetEntity":"dbe-1506","inputScokets_arr":[{"name":"@targetDate","isIn":true,"id":"dbEntity_0$@targetDate","defval":"2018-12-1","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"dbEntity_0$out","type":"table"}]},{"id":"constvalue_0","type":"constvalue","left":-650,"top":-370,"outputScokets_arr":[{"name":"out","isIn":false,"id":"constvalue_0$out","defval":"2018-8-2","type":"scalar"}]}],"links_arr":[{"inSocketID":"select_0$in","outSocketID":"dbEntity_0$out"},{"inSocketID":"ret_columns_0$in5","outSocketID":"constvalue_1$out"},{"inSocketID":"ret_columns_0$in6","outSocketID":"column_0$out"},{"inSocketID":"ret_columns_0$in7","outSocketID":"column_1$out"},{"inSocketID":"ret_columns_0$in3","outSocketID":"column_2$out"},{"inSocketID":"ret_order_0$in0","outSocketID":"column_3$out"},{"inSocketID":"ret_order_0$in1","outSocketID":"column_4$out"},{"inSocketID":"compare_0$in0","outSocketID":"column_5$out"},{"inSocketID":"ret_condition_0$in","outSocketID":"compare_0$out"},{"inSocketID":"compare_0$in1","outSocketID":"noperand_1$out"}]};
        //console.log(testJson);
        var creationHelper = new NodeCreationHelper(); 
        var newCus = new SqlNode_BluePrint(null, testJson,creationHelper);
        newCus.master = this;
        this.customDBEntities_arr.push(newCus);
    }

    hadCusDBE(name){
        return this.customDBEntities_arr.find(item=>{return item.name == name}) != null;
    }

    createCusDBE(name, type){
        this.customDBEntities_arr.push(new SqlNode_BluePrint({name:name,code:this.project.genControlName('cusDBE'),type:type,master:this}));
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
