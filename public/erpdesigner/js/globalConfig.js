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
var Aggregate_count = 'count';
var Aggregate_sum = 'sum';
var Aggregate_avg = 'avg';
var Aggregate_max = 'max';
var Aggregate_min = 'min';
var Aggregate_arr = [Aggregate_count, Aggregate_sum, Aggregate_avg, Aggregate_max, Aggregate_min];
var SqlOperator_IsNull = 'is null';
var SqlOperator_IsNotNull = 'is not null';

//2018-12-22黄永恒编辑datepart
var Datepart_yy = 'yy'; //年
var Datepart_qq = 'qq'; //季度
var Datepart_mm = 'mm'; //月
var Datepart_dy = 'dy'; //年中第几天
var Datepart_dd = 'dd'; //天
var Datepart_wk = 'wk'; //周
var Datepart_dw = 'dw'; //星期几
var Datepart_hh = 'hh'; //小时
var Datepart_mi = 'mi'; //分钟
var Datepart_ss = 'ss'; //秒
var Datepart_ms = 'ms'; //毫秒
var Datepart_arr = [Datepart_yy, Datepart_qq, Datepart_mm, Datepart_dy, Datepart_dd, Datepart_wk, Datepart_dw, Datepart_hh, Datepart_mi, Datepart_ss, Datepart_ms];

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

// union union all

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