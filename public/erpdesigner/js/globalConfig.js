'use strict';

var EATTRCHANGED = 'attrChanged';
var EFORCERENDER = 'forcerender';
var ESELECTEDCHANGED = 'selectedchaned';

var Orientation_H = '水平';
var Orientation_V = '垂直';
var Orientation_Options_arr = [Orientation_H, Orientation_V];

var OrderType_DESC = 'desc';
var OrderType_ASCE = 'asce';
var OrderTypes_arr = [OrderType_DESC, OrderType_ASCE];

var SqlVarType_Unknown = 'unknown';
var SqlVarType_Int = 'int';
var SqlVarType_NVarchar = 'nvarchar';
var SqlVarType_Date = 'date';
var SqlVarType_DateTime = 'datetime';
var SqlVarType_Time = 'time';
var SqlVarType_Float = 'float';
var SqlVarType_Decimal = 'decimal';
var SqlVarType_Scalar = 'scalar';
var SqlVarType_Boolean = 'boolean';
var SqlVarTypes_arr = [SqlVarType_Boolean, SqlVarType_Int, SqlVarType_NVarchar, SqlVarType_Date, SqlVarType_DateTime, SqlVarType_Time, SqlVarType_Float, SqlVarType_Decimal];
var SqlVarInputableTypes_arr = [SqlVarType_Boolean, SqlVarType_Int, SqlVarType_NVarchar, SqlVarType_Date, SqlVarType_DateTime, SqlVarType_Time, SqlVarType_Float, SqlVarType_Decimal, SqlVarType_Scalar];
var SqlVarType_Table = 'table';

var JoinType_Inner = 'inner join';
var JoinType_Left = 'left join';
var JoinType_Right = 'right join';
var JoinType_Cross = 'cross join';
var JoinTypes_arr = [JoinType_Inner, JoinType_Left, JoinType_Right, JoinType_Cross];

var SqlOperator_IsNull = 'is null';
var SqlOperator_IsNotNull = 'is not null';

//2018-12-22黄永恒编辑datepart
var Datepart_year = 'year'; //年
var Datepart_quarter = 'quarter'; //季度
var Datepart_month = 'month'; //月
var Datepart_dy = 'dy'; //年中第几天
var Datepart_day = 'day'; //天
var Datepart_wk = 'wk'; //周
var Datepart_week = 'week'; //星期几
var Datepart_hours = 'hours'; //小时
var Datepart_minutes = 'minutes'; //分钟
var Datepart_seconds = 'seconds'; //秒
var Datepart_ms = 'ms'; //毫秒
var Datepart_arr = [Datepart_year, Datepart_quarter, Datepart_month, Datepart_dy, Datepart_day, Datepart_wk, Datepart_week, Datepart_hours, Datepart_minutes, Datepart_seconds, Datepart_ms];

//2018-12-25黄永恒编辑math
var Math_ABS = 'ABS'; //计算绝对值
var Math_CEILING = 'CEILING'; //计算大于等于参数的最小整数
var Math_FLOOR = 'FLOOR'; //计算小于等于参数的最大整数
var Math_RAND = 'RAND'; //获取随机数
var Math_ROUND = 'ROUND'; //获取参数制定的长度和精度
var Math_POWER = 'POWER'; //计算指定表达式的制定幂的值
var Math_SQUARE = 'SQUARE'; //计算参数的平方值
var Math_SQRT = 'SQRT'; //计算参数的平方根
var Math_arr = [Math_ABS, Math_CEILING, Math_FLOOR, Math_RAND, Math_ROUND, Math_POWER, Math_SQUARE, Math_SQRT];

/**
 * 逻辑运算符 and or not
 */
var Logical_Operator_and = 'and';
var Logical_Operator_or = 'or';
//var Logical_Operator_not = 'not';
var Logical_Operators_arr = [Logical_Operator_and, Logical_Operator_or];

var Event_CurrentComponentchanged = 'currentComponentchanged';
var Event_LinkChanged = 'linkChanged';
var Event_SocketNumChanged = 'socketnumChanged';
var Event_FrameComMount = 'framecommount';
var Event_FrameComUnMount = 'framecomunmount';

var ContextType_DBEntity = 'ct-dbentity';

var FrameButton_LineSocket = 'lineSocket';
var FrameButton_ClearEmptySocket = 'ClearEmptySocket';

var DesignerConfig = {
    controlConfig: {
        groups: [],
        configs_obj: {}
    }
};

var WindowMouse = {
    x: 0,
    y: 0
};

DesignerConfig.registerControl = function (ctlConfig, groupName) {
    var ctlGroup = this.controlConfig.groups.find(function (item) {
        return item.name == groupName;
    });
    if (ctlGroup == null) {
        ctlGroup = {
            name: groupName,
            controlsForPC: [],
            controlsForMobile: []
        };
        this.controlConfig.groups.push(ctlGroup);
    }

    if (ctlConfig.forPC) {
        ctlGroup.controlsForPC.push(ctlConfig);
    } else {
        ctlGroup.controlsForMobile.push(ctlConfig);
    }
    this.controlConfig.configs_obj[ctlConfig.type] = ctlConfig;
}.bind(DesignerConfig);

DesignerConfig.findConfigByType = function (ctlType) {
    return this.controlConfig.configs_obj[ctlType];
}.bind(DesignerConfig);

var ValueType = {
    String: 'String',
    Int: 'Int',
    Boolean: 'Boolean',
    Float: 'float',
    StyleValues: 'StyleValues'
};