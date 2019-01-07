
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

class DBEntityAgency extends EventEmitter{
    constructor(name,code){
        super();
        this.columns=[];
        this.name=name;
        this.code=code;
    }
    
    containColumn(colName){
        return this.getColumnByName(colName) != null;
    }

    getColumnByName(colName){
        return this.columns.find(x=>{return x.name == colName;});
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
        this.emit('syned', this);
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
        fetchJsonPost('server', { action: 'syndata_bycodes', codes_arr: [this.code] }, this.synComplete);
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
        //var tVar = cus1.createEmptyVariable();
        //tVar.needEdit = false;
        this.BP_sql_arr = [];
        this.project = project;

        this.dataView_usedDBEnities.on('changed',this.usedDBEnitiesChangedHandler);

        /*
        creationHelper = new NodeCreationHelper(); 
        var testJson2 = {"code":"cusDBE46","retNodeId":"select_0","name":"test3333","type":"表值","editorLeft":419,"editorTop":147,"nodes_arr":[{"id":"select_0","type":"select","left":160,"top":-100,"title":"返回表","editorLeft":412,"editorTop":135,"inputScokets_arr":[{"name":"in","isIn":true,"id":"select_0$in","type":"table"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"select_0$out","type":"table"}],"nodes_arr":[{"id":"ret_columns_0","type":"ret_columns","left":150,"top":-160,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"ret_columns_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"ret_columns_0$in1","type":"scalar"},{"name":"in5","isIn":true,"id":"ret_columns_0$in5","type":"scalar","extra":{"alias":"考勤地点代码2"}}]},{"id":"ret_condition_0","type":"ret_condition","left":440,"top":-380,"inputScokets_arr":[{"name":"in","isIn":true,"id":"ret_condition_0$in","type":"boolean"}]},{"id":"ret_order_0","type":"ret_order","left":400,"top":0},{"id":"column_2","type":"column","left":-320,"top":-300,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_2$out","type":"int"}]},{"id":"isnulloperator_0","type":"isnulloperator","left":30,"top":-330,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"isnulloperator_0$in0","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"isnulloperator_0$out","type":"scalar"}]},{"id":"column_3","type":"column","left":-242,"top":-82,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_3$out","type":"varchar"}]},{"id":"column_4","type":"column","left":-248,"top":-44,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记日期","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_4$out"}]},{"id":"column_5","type":"column","left":-370,"top":-220,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记时间","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_5$out"}]},{"id":"isnullfun_0","type":"isnullfun","left":-150,"top":10,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"isnullfun_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"isnullfun_0$in1","defval":"-1","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"isnullfun_0$out","type":"scalar"}]},{"id":"column_6","type":"column","left":-530,"top":40,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记地点代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_6$out"}]},{"id":"column_7","type":"column","left":-390,"top":-170,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记地点代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_7$out"}]}]},{"id":"dbEntity_0","type":"dbEntity","left":-510,"top":-40,"targetEntity":"dbe-1506","inputScokets_arr":[{"name":"@targetDate","isIn":true,"id":"dbEntity_0$@targetDate","defval":"2018-12-8","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"dbEntity_0$out","type":"table"}]},{"id":"dbEntity_1","type":"dbEntity","left":-490,"top":-240,"targetEntity":"dbe-309","outputScokets_arr":[{"name":"out","isIn":false,"id":"dbEntity_1$out","type":"table"}]},{"id":"xjion_0","type":"xjion","left":-140,"top":-160,"editorLeft":-13,"editorTop":378,"joinType":"left join","inputScokets_arr":[{"name":"in0","isIn":true,"id":"xjion_0$in0","type":"table"},{"name":"in1","isIn":true,"id":"xjion_0$in1","type":"table"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"xjion_0$out","type":"table"}],"nodes_arr":[{"id":"ret_condition_1","type":"ret_condition","left":340,"top":-160,"inputScokets_arr":[{"name":"in","isIn":true,"id":"ret_condition_1$in","type":"boolean"}]},{"id":"column_0","type":"column","left":-310,"top":-200,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_0$out","type":"int"}]},{"id":"column_1","type":"column","left":-310,"top":-150,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_1$out"}]},{"id":"compare_0","type":"compare","left":50,"top":-210,"operator":"=","inputScokets_arr":[{"name":"in0","isIn":true,"id":"compare_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"compare_0$in1","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"compare_0$out","type":"boolean"}]}]},{"id":"cast_0","type":"cast","left":-210,"top":130,"inputScokets_arr":[{"name":"in","isIn":true,"id":"cast_0$in","type":"table","extra":{"valType":"decimal","size1":"3","size2":"2"}}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"cast_0$out","type":"boolean"}]}],"links_arr":[{"inSocketID":"xjion_0$in0","outSocketID":"dbEntity_1$out"},{"inSocketID":"xjion_0$in1","outSocketID":"dbEntity_0$out"},{"inSocketID":"compare_0$in0","outSocketID":"column_0$out"},{"inSocketID":"compare_0$in1","outSocketID":"column_1$out"},{"inSocketID":"ret_condition_1$in","outSocketID":"compare_0$out"},{"inSocketID":"select_0$in","outSocketID":"xjion_0$out"},{"inSocketID":"isnulloperator_0$in0","outSocketID":"column_2$out"},{"inSocketID":"ret_columns_0$in0","outSocketID":"column_3$out"},{"inSocketID":"ret_columns_0$in1","outSocketID":"column_4$out"},{"inSocketID":"isnullfun_0$in0","outSocketID":"column_6$out"},{"inSocketID":"ret_columns_0$in5","outSocketID":"isnullfun_0$out"}]};
        var newCus2 = new SqlNode_BluePrint(null, testJson2,creationHelper);
        this.addSqlBP(newCus2);
        */
    }

    addSqlBP(bpItem){
        if(this.BP_sql_arr.indexOf(bpItem) != -1){
            return;
        }
        var useCode = bpItem.code;
        var  i = 0;
        if(IsEmptyString(useCode) || this.getSqlBPByCode(useCode) != null){
            for(i=0;i<9999;++i){
                useCode = 'sqlBP_' + i;
                if(this.getSqlBPByCode(useCode) == null){
                    break;
                }
            }
        }
        var useName = bpItem.name;
        if(IsEmptyString(useName) || this.getSqlBPByName(useName) != null){
            for(i=0;i<9999;++i){
                useName = 'sql蓝图_' + i;
                if(this.getSqlBPByName(useCode) == null){
                    break;
                }
            }
        }
        bpItem.master = this;
        bpItem.name = useName;
        bpItem.code = useCode;
        bpItem.id = useCode;
        this.BP_sql_arr.push(bpItem);
    }

    getSqlBPByName(name){
        return this.BP_sql_arr.find(item=>{return item.name == name});
    }

    getSqlBPByCode(code){
        return this.BP_sql_arr.find(item=>{return item.code == code});
    }

    createSqlBP(name, type){
        var newItem = new SqlNode_BluePrint({name:name,type:type,master:this});
        this.addSqlBP(newItem);
        this.emit('sqlbpchanged');
    }

    modifySqlBP(sqpBP, name, type){
        sqpBP.name = name;
        sqpBP.type = type;
        this.emit('sqlbpchanged');
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
        this.usedDBEnities_arr.push(data);
        this.usedDBEnities_arr.sort((a,b)=>{
            return a.name < b.name;
        })
        this.dataView_usedDBEnities.emit('changed', this);
        return true;
    }

    getJson(){
        var rlt = {
            BP_sql_arr:[]
        };
        this.BP_sql_arr.forEach(bp=>{
            rlt.BP_sql_arr.push(bp.getJson());
        });
        return rlt;
    }

    getDataSourceByCode(code){
        var rlt = this.getSqlBPByCode(code);
        if(rlt == null && !isNaN(code)){
            rlt = g_dataBase.getEntityByCode(code);
        }
        return rlt;
    }

    getAllEntities(){
        return this.BP_sql_arr.concat(g_dataBase.entities_arr);
    }

    restoreFromJson(json){
        if(json == null){
            return;
        }
        if(json.BP_sql_arr){
            json.BP_sql_arr.forEach(bpjson=>{
                var creationHelper = new NodeCreationHelper(); 
                var newbp = new SqlNode_BluePrint(null, bpjson,creationHelper);
                this.addSqlBP(newbp);
            });
        }
    }
}
