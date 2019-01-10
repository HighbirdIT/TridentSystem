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

//2018-23-31黄永恒编辑charfunType
var CharfunType_ASCII = 'ASCII'; //返回字符表达式中最左侧字符的ASCII代码值  select ASCII('a')--97
var CharfunType_CHAR = 'CHAR'; //将整数ASCII代码转换为字符 select CHAR(97)--a
var CharfunType_LEFT = 'LEFT'; //返回字符表达式最左侧指定数目的字符串 --select LEFT('abcdefg',1)--'a'
var CharfunType_RIGHT = 'RIGHT'; //返回字符表达式最右侧指定数目的字符串  --select RIGHT('abcdefg',1)--'g'
var CharfunType_SUBSTRING = 'SUBSTRING'; //SUBSTRING（被截取字符串,开始位置,长度） --SELECT SUBSTRING('abcd',1,1)--a 
var CharfunType_LOWER = 'LOWER'; //返回转换为小写的字符串 --select LOWER('abcdefg')--'abcdefg'
var CharfunType_UPPER = 'UPPER'; //返回转换为大写的字符串 --select UPPER('abcdefg')--ABCDEFG
var CharfunType_LTRIM = 'LTRIM'; //返回去左空格的字符串 --select LTRIM('  abcdefg')--'abcdefg'
var CharfunType_RTRIM = 'RTRIM'; //返回去右空格的字符串 --select RTRIM('abcdefg    ')--'abcdefg'
var CharfunType_CHARINDEX = 'CHARINDEX'; //返回表达式中指定字符的开始位置  --select CHARINDEX('a','abcdefg',1)--1
var CharfunType_PATINDEX = 'PATINDEX'; //返回指定表达式中模式第一次出现的开始位置 --select PATINDEX('%cd%','abcdefg')--3
var CharfunType_REPLACE = 'REPLACE'; //replace（被搜索字符串,要被替换的字符串，替换的字符串） --select REPLACE('abcdefg','cd','a')--abaefg
var CharfunType_REPLICATE = 'REPLICATE'; //返回指定次数重复的表达式  --select REPLICATE('abc|',4)--abc|abc|abc|abc|
var CharfunType_REVERSE = 'REVERSE'; //返回反转后的字符串  --select REVERSE('ABC')--CBA
var CharfunType_LEN = 'LEN'; //返回字符串长度 --select LEN('abcdefg')--7
var CharfunType_STUFF = 'STUFF'; //删除指定长度的字符,并在指定的起点处插入另一组字符  
//--stuff(character_expression , start , length ,character_expression)
//character_expression被搜索字符串
//start开始位置
//length要删除的长度
//character_expression替换字符串
var CharfunType_SPACE = 'SPACE'; //--返回指定个数空格的字符串 --select 'A'+ space(2)+'B'--A  B
var CharfunType_arr = [CharfunType_ASCII, CharfunType_CHAR, CharfunType_LEFT, CharfunType_RIGHT, CharfunType_SUBSTRING, CharfunType_LOWER, CharfunType_UPPER, CharfunType_LTRIM, CharfunType_RTRIM, CharfunType_CHARINDEX, CharfunType_PATINDEX, CharfunType_REPLACE, CharfunType_REPLICATE, CharfunType_REVERSE, CharfunType_LEN, CharfunType_STUFF, CharfunType_SPACE];

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

DesignerConfig.getMobileCanLabeledControls = function () {
    var rlt = [];
    for (var si in this.controlConfig.configs_obj) {
        var item = this.controlConfig.configs_obj[si];
        if (item.canbeLabeled) {
            rlt.push(item);
        }
    }
    return rlt;
}.bind(DesignerConfig);

var ValueType = {
    String: 'string',
    Int: 'int',
    Boolean: 'boolean',
    Float: 'float',
    Date: 'date',
    Time: 'time',
    DateTime: 'datetime',
    StyleValues: 'StyleValues',
    DataSource: 'DataSource'
};

var JsValueTypes = [ValueType.String, ValueType.Int, ValueType.Boolean, ValueType.Float, ValueType.Date, ValueType.Time, ValueType.DateTime];