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

const SqlOperator_IsNull ='is null';
const SqlOperator_IsNotNull='is not null';

//2018-12-22黄永恒编辑datepart
const Datepart_yy ='yy';//年
const Datepart_qq ='qq';//季度
const Datepart_mm ='mm';//月
const Datepart_dy ='dy';//年中第几天
const Datepart_dd ='dd';//天
const Datepart_wk ='wk';//周
const Datepart_dw ='dw';//星期几
const Datepart_hh ='hh';//小时
const Datepart_mi ='mi';//分钟
const Datepart_ss ='ss';//秒
const Datepart_ms ='ms';//毫秒
const Datepart_arr = [Datepart_yy,Datepart_qq,Datepart_mm,Datepart_dy,Datepart_dd,Datepart_wk,Datepart_dw,Datepart_hh,Datepart_mi,Datepart_ss,Datepart_ms];

//2018-12-25黄永恒编辑math
const Math_ABS ='ABS';//计算绝对值
const Math_CEILING ='CEILING';//计算大于等于参数的最小整数
const Math_FLOOR ='FLOOR';//计算小于等于参数的最大整数
const Math_RAND ='RAND';//获取随机数
const Math_ROUND ='ROUND';//获取参数制定的长度和精度
const Math_POWER ='POWER';//计算指定表达式的制定幂的值
const Math_SQUARE ='SQUARE';//计算参数的平方值
const Math_SQRT ='SQRT';//计算参数的平方根
const Math_arr =[Math_ABS,Math_CEILING,Math_FLOOR,Math_RAND,Math_ROUND,Math_POWER,Math_SQUARE,Math_SQRT];

/**
 * 逻辑运算符 and or not
 */
var Logical_Operator_and = 'and';
var Logical_Operator_or = 'or';
//var Logical_Operator_not = 'not';
var Logical_Operators_arr = [Logical_Operator_and, Logical_Operator_or];

// union union all

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
    String:'string',
    Int:'int',
    Boolean:'boolean',
    Float:'float',
    Date:'date',
    Time:'time',
    DateTime:'datetime',
    StyleValues:'StyleValues',
    DataSource:'DataSource',
};

const JsValueTypes = [ValueType.String,ValueType.Int,ValueType.Boolean,ValueType.Float,ValueType.Date,ValueType.Time,ValueType.DateTime];