const EATTRCHANGED = 'attrChanged';
const EFORCERENDER = 'forcerender';
const ESELECTEDCHANGED = 'selectedchaned';

const Orientation_H = '水平';
const Orientation_V = '垂直';
const Orientation_Options_arr = [Orientation_H,Orientation_V];

const OrderType_DESC = 'desc';
const OrderType_ASCE = 'asce';
const OrderTypes_arr = [OrderType_DESC,OrderType_ASCE];

const SqlVarType_Unknown = 'unknown';
const SqlVarType_Int = 'int';
const SqlVarType_NVarchar = 'nvarchar';
const SqlVarType_Date = 'date';
const SqlVarType_DateTime = 'datetime';
const SqlVarType_Time = 'time';
const SqlVarType_Float = 'float';
const SqlVarType_Decimal = 'decimal';
const SqlVarType_Scalar = 'scalar';
const SqlVarType_Boolean = 'boolean';
const SqlVarTypes_arr = [SqlVarType_Boolean,SqlVarType_Int,SqlVarType_NVarchar,SqlVarType_Date,SqlVarType_DateTime,SqlVarType_Time,SqlVarType_Float,SqlVarType_Decimal];
const SqlVarInputableTypes_arr = [SqlVarType_Boolean,SqlVarType_Int,SqlVarType_NVarchar,SqlVarType_Date,SqlVarType_DateTime,SqlVarType_Time,SqlVarType_Float,SqlVarType_Decimal,SqlVarType_Scalar];
const SqlVarType_Table = 'table';

const JoinType_Inner = 'inner join';
const JoinType_Left = 'left join';
const JoinType_Right = 'right join';
const JoinType_Cross = 'cross join';
const JoinTypes_arr = [JoinType_Inner,JoinType_Left,JoinType_Right,JoinType_Cross];
const Aggregate_count = 'count';
const Aggregate_sum = 'sum';
const Aggregate_avg = 'avg';
const Aggregate_max = 'max';
const Aggregate_min = 'min';
const Aggregate_arr = [Aggregate_count,Aggregate_sum,Aggregate_avg,Aggregate_max,Aggregate_min];
const SqlOperator_IsNull ='is null';
const SqlOperator_IsNotNull='is not null';
/**
 * 逻辑运算符 and or not
 */
var Logical_Operator_and = 'and';
var Logical_Operator_or = 'or';
//var Logical_Operator_not = 'not';
var Logical_Operators_arr = [Logical_Operator_and, Logical_Operator_or];


const Event_CurrentComponentchanged = 'currentComponentchanged';
const Event_LinkChanged = 'linkChanged';
const Event_SocketNumChanged = 'socketnumChanged';
const Event_FrameComMount = 'framecommount';
const Event_FrameComUnMount = 'framecomunmount';

const ContextType_DBEntity = 'ct-dbentity';

const FrameButton_LineSocket = 'lineSocket';
const FrameButton_ClearEmptySocket = 'ClearEmptySocket';

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
    Boolean:'Boolean',
    Float:'float',
    StyleValues:'StyleValues',
};