const EATTRCHANGED = 'attrChanged';
const EFORCERENDER = 'forcerender';
const ESELECTEDCHANGED = 'selectedchaned';

const Orientation_H = '水平';
const Orientation_V = '垂直';
const Orientation_Options_arr = [Orientation_H,Orientation_V];

const SqlVarType_Int = 'int';
const SqlVarType_NVarchar = 'nvarchar';
const SqlVarType_Date = 'date';
const SqlVarType_DateTime = 'datetime';
const SqlVarType_Time = 'time';
const SqlVarType_Float = 'float';
const SqlVarType_Decimal = 'decimal';
const SqlVarTypes_arr = [SqlVarType_Int,SqlVarType_NVarchar,SqlVarType_Date,SqlVarType_DateTime,SqlVarType_Time,SqlVarType_Float,SqlVarType_Decimal];

const DesignerConfig={
    controlConfig:{
        groups:[],
        configs_obj:{}
    }
};

var WindowMouse = {
    x:0,
    y:0,
};

DesignerConfig.registerControl=(function(ctlConfig,groupName){
    var ctlGroup = this.controlConfig.groups.find(item=>{
        return item.name == groupName;
    });
    if(ctlGroup == null){
        ctlGroup = {
            name:groupName,
            controlsForPC:[],
            controlsForMobile:[],
        };
        this.controlConfig.groups.push(ctlGroup);
    }

    if(ctlConfig.forPC){
        ctlGroup.controlsForPC.push(ctlConfig);
    }
    else{
        ctlGroup.controlsForMobile.push(ctlConfig);
    }
    this.controlConfig.configs_obj[ctlConfig.type] = ctlConfig;
}).bind(DesignerConfig);

DesignerConfig.findConfigByType=(function(ctlType){
    return this.controlConfig.configs_obj[ctlType];
}).bind(DesignerConfig);

const ValueType={
    String:'String',
    Int:'Int',
};

