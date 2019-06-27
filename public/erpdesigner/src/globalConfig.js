const EATTRCHANGED = 'attrChanged';
const EFORCERENDER = 'forcerender';
const ESELECTEDCHANGED = 'selectedchaned';

const Orientation_H = '水平';
const Orientation_V = '垂直';
const Orientation_Options_arr = [Orientation_H, Orientation_V];

const OrderType_DESC = 'desc';
const OrderType_ASCE = 'asce';
const OrderTypes_arr = [OrderType_DESC, OrderType_ASCE];

const EMessageType={
    Normal:0,
    Process:2,
};
const MessageTypes_arr=[{text:'要求阅读',value:EMessageType.Normal},{text:'要求处置',value:EMessageType.Process}];

const EMessageSendType={
    Normal:1,
    Fortwith:2,
};
const MessageSendTypes_arr=[{text:'普通消息',value:EMessageSendType.Normal},{text:'即时消息',value:EMessageSendType.Fortwith}];

const EMessageTargetType={
    Person:1,
    Post:2,
};
const MessageTargetTypes_arr=[{text:'指定人员',value:EMessageTargetType.Person},{text:'指定岗位',value:EMessageTargetType.Post}];

const PersonEductOptions_arr = [];
const AllPosts_arr = [];
const ProjectRecords_arr = [];

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
const SqlVarTypes_arr = [SqlVarType_Boolean, SqlVarType_Int, SqlVarType_NVarchar, SqlVarType_Date, SqlVarType_DateTime, SqlVarType_Time, SqlVarType_Float, SqlVarType_Decimal];
const SqlVarInputableTypes_arr = [SqlVarType_Boolean, SqlVarType_Int, SqlVarType_NVarchar, SqlVarType_Date, SqlVarType_DateTime, SqlVarType_Time, SqlVarType_Float, SqlVarType_Decimal, SqlVarType_Scalar];
const SqlVarType_Table = 'table';

const JoinType_Inner = 'inner join';
const JoinType_Left = 'left join';
const JoinType_Right = 'right join';
const JoinType_Cross = 'cross join';
const JoinTypes_arr = [JoinType_Inner, JoinType_Left, JoinType_Right, JoinType_Cross];
const Aggregate_count = 'count';
const Aggregate_sum = 'sum';
const Aggregate_avg = 'avg';
const Aggregate_max = 'max';
const Aggregate_min = 'min';
const Aggregate_arr = [Aggregate_count, Aggregate_sum, Aggregate_avg, Aggregate_max, Aggregate_min];
const SqlOperator_IsNull = 'is null';
const SqlOperator_IsNotNull = 'is not null';

//2018-12-22黄永恒编辑datepart
const Datepart_year = 'year';//年
const Datepart_quarter = 'quarter';//季度
const Datepart_month = 'month';//月
const Datepart_dy = 'dy';//年中第几天
const Datepart_day = 'day';//天
const Datepart_wk = 'wk';//周
const Datepart_week = 'week';//星期几
const Datepart_hour = 'hour';//小时
const Datepart_minutes = 'minute';//分钟
const Datepart_seconds = 'second';//秒
const Datepart_ms = 'ms';//毫秒
const Datepart_arr = [Datepart_year, Datepart_quarter, Datepart_month, Datepart_dy, Datepart_day, Datepart_wk, Datepart_week, Datepart_hour, Datepart_minutes, Datepart_seconds, Datepart_ms];

const SocketType_CtlKernel = 'st_ctlkernel';

//2018-12-25黄永恒编辑math
const Math_ABS = 'ABS';//计算绝对值
const Math_CEILING = 'CEILING';//计算大于等于参数的最小整数
const Math_FLOOR = 'FLOOR';//计算小于等于参数的最大整数
const Math_RAND = 'RAND';//获取随机数
const Math_ROUND = 'ROUND';//获取参数制定的长度和精度
const Math_POWER = 'POWER';//计算指定表达式的制定幂的值
const Math_SQUARE = 'SQUARE';//计算参数的平方值
const Math_SQRT = 'SQRT';//计算参数的平方根
const Math_arr = [Math_ABS, Math_CEILING, Math_FLOOR, Math_RAND, Math_ROUND, Math_POWER, Math_SQUARE, Math_SQRT];

//2018-23-31黄永恒编辑charfunType
const CharfunType_ASCII = 'ASCII';//返回字符表达式中最左侧字符的ASCII代码值  select ASCII('a')--97
const CharfunType_CHAR = 'CHAR';//将整数ASCII代码转换为字符 select CHAR(97)--a
const CharfunType_LEFT = 'LEFT';//返回字符表达式最左侧指定数目的字符串 --select LEFT('abcdefg',1)--'a'
const CharfunType_RIGHT = 'RIGHT';//返回字符表达式最右侧指定数目的字符串  --select RIGHT('abcdefg',1)--'g'
const CharfunType_SUBSTRING = 'SUBSTRING';//SUBSTRING（被截取字符串,开始位置,长度） --SELECT SUBSTRING('abcd',1,1)--a 
const CharfunType_LOWER = 'LOWER';//返回转换为小写的字符串 --select LOWER('abcdefg')--'abcdefg'
const CharfunType_UPPER = 'UPPER';//返回转换为大写的字符串 --select UPPER('abcdefg')--ABCDEFG
const CharfunType_LTRIM = 'LTRIM';//返回去左空格的字符串 --select LTRIM('  abcdefg')--'abcdefg'
const CharfunType_RTRIM = 'RTRIM';//返回去右空格的字符串 --select RTRIM('abcdefg    ')--'abcdefg'
const CharfunType_CHARINDEX = 'CHARINDEX';//返回表达式中指定字符的开始位置  --select CHARINDEX('a','abcdefg',1)--1
const CharfunType_PATINDEX = 'PATINDEX';//返回指定表达式中模式第一次出现的开始位置 --select PATINDEX('%cd%','abcdefg')--3
const CharfunType_REPLACE = 'REPLACE';//replace（被搜索字符串,要被替换的字符串，替换的字符串） --select REPLACE('abcdefg','cd','a')--abaefg
const CharfunType_REPLICATE = 'REPLICATE';//返回指定次数重复的表达式  --select REPLICATE('abc|',4)--abc|abc|abc|abc|
const CharfunType_REVERSE = 'REVERSE';//返回反转后的字符串  --select REVERSE('ABC')--CBA
const CharfunType_LEN = 'LEN';//返回字符串长度 --select LEN('abcdefg')--7
const CharfunType_STUFF = 'STUFF';//删除指定长度的字符,并在指定的起点处插入另一组字符  
//--stuff(character_expression , start , length ,character_expression)
//character_expression被搜索字符串
//start开始位置
//length要删除的长度
//character_expression替换字符串
const CharfunType_SPACE = 'SPACE';//--返回指定个数空格的字符串 --select 'A'+ space(2)+'B'--A  B
const CharfunType_arr = [CharfunType_ASCII, CharfunType_CHAR, CharfunType_LEFT, CharfunType_RIGHT, CharfunType_SUBSTRING, CharfunType_LOWER,
    CharfunType_UPPER, CharfunType_LTRIM, CharfunType_RTRIM, CharfunType_CHARINDEX, CharfunType_PATINDEX, CharfunType_REPLACE,
    CharfunType_REPLICATE, CharfunType_REVERSE, CharfunType_LEN, CharfunType_STUFF, CharfunType_SPACE];

const FunType_Client = 'client';
const FunType_Server = 'server';
const EJsBluePrintFunGroup={
    CtlAttr:'ctlattr',
    CtlEvent:'ctlevent',
    CtlValid: 'ctlvalid',
    ServerScript:'serverscript',
    GridRowBtnHandler: 'gridrowbtnhandler'
}

const ESqlBluePrintGroup={
    Custom:'custom',
    ControlCustom:'ctlcus',
}

const EFormType={
    Page:'page',
    Grid:'grid',
}

const FormTypes_arr = [EFormType.Page, EFormType.Grid];

const ESelectMode={
    None:'none',
    Single:'single',
    Multi:'multi',
}
const SelectModes_arr = [ESelectMode.None, ESelectMode.Single, ESelectMode.Multi];

const ButtonClasses_arr = ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info', 'btn-light', 'btn-dark', 'btn-link'];

const EButtonVisibleType={
    Insert:'insert',
    Update:'update',
    Both:'both',
    Default:'default',
}
const ButtonVisibleTypes_arr = [EButtonVisibleType.Insert,EButtonVisibleType.Update,EButtonVisibleType.Both,EButtonVisibleType.Default];

const EUseEntityStage={
    Select:'select',
    Insert:'isnert',
    Update:'update',
    Delete:'delete',
}

const GridHead_PerCharWidth = 1.4;
const EGridWidthType={
    Auto:'auto',
    Fixed:'fixed',
}

const EGridWidthTypes_arr = [{text:'自动列宽', value:EGridWidthType.Auto}, {text:'固定列宽', value:EGridWidthType.Fixed}];

const EInterActiveType={
    ReadOnly:'readonly',
    ReadWrite:'readwrite',
}

const EInterActiveTypes_arr = [{text:'只读', value:EInterActiveType.ReadOnly}, {text:'读写', value:EInterActiveType.ReadWrite}];

const EFormRowSource={
    Context:'context',
    Selected:'selected',
}

const EFormRowSources_arr = [{text:'所在行', value:EFormRowSource.Context}, {text:'选中行', value:EFormRowSource.Selected}];

/**
 * 逻辑运算符 and or not
 */
var Logical_Operator_and = 'and';
var Logical_Operator_or = 'or';
//var Logical_Operator_not = 'not';
var Logical_Operators_arr = [Logical_Operator_and, Logical_Operator_or];

const LineType_Single = '单行';
const LineType_SmallMulti = '多行-小';
const LineType_BigMulti = '多行-大';
const LinteTypes_arr = [LineType_Single, LineType_SmallMulti, LineType_BigMulti];
// union union all

const Event_CurrentComponentchanged = 'currentComponentchanged';
const Event_LinkChanged = 'linkChanged';
const Event_SocketNumChanged = 'socketnumChanged';
const Event_FrameComMount = 'framecommount';
const Event_FrameComUnMount = 'framecomunmount';

const ContextType_DBEntity = 'ct-dbentity';

const FrameButton_LineSocket = 'lineSocket';
const FrameButton_ClearEmptyInputSocket = 'ClearEmptyInputSocket';
const FrameButton_ClearEmptyOutputSocket = 'ClearEmptyOutputSocket';

const VisibleStyle_Insert = 'insert';
const VisibleStyle_Update = 'update';
const VisibleStyle_Both = 'both';

const ScriptBindMode={
    OnForm:'OnForm',
    OnRelAttrChanged:'OnRelAttrChanged',
    OnNewRow:'OnNewRow',
}

const DesignerConfig = {
    controlConfig: {
        groups: [],
        configs_obj: {}
    }
};

var WindowMouse = {
    x: 0,
    y: 0,
};

DesignerConfig.registerControl = (function (ctlConfig, groupName) {
    var ctlGroup = this.controlConfig.groups.find(item => {
        return item.name == groupName;
    });
    if (ctlGroup == null) {
        ctlGroup = {
            name: groupName,
            controlsForPC: [],
            controlsForMobile: [],
        };
        this.controlConfig.groups.push(ctlGroup);
    }

    if (ctlConfig.forPC) {
        ctlGroup.controlsForPC.push(ctlConfig);
    }
    else {
        ctlGroup.controlsForMobile.push(ctlConfig);
    }
    this.controlConfig.configs_obj[ctlConfig.type] = ctlConfig;
}).bind(DesignerConfig);

DesignerConfig.findConfigByType = (function (ctlType) {
    return this.controlConfig.configs_obj[ctlType];
}).bind(DesignerConfig);

DesignerConfig.getMobileCanLabeledControls = (function () {
    var rlt = [];
    for (var si in this.controlConfig.configs_obj) {
        var item = this.controlConfig.configs_obj[si];
        if (item.canbeLabeled) {
            rlt.push(item);
        }
    }
    return rlt;
}).bind(DesignerConfig);

const ValueType = {
    String: 'string',
    Array: 'array',
    Int: 'int',
    Boolean: 'boolean',
    Float: 'float',
    Date: 'date',
    Time: 'time',
    DateTime: 'datetime',
    StyleValues: 'StyleValues',
    DataSource: 'DataSource',
    CustomDataSource: 'CustomDataSource',
    ListFormContent:'listFormContent',
    Unknown: 'Unknown',
    Any: '任意',
    Event:'event',
    Script:'script',
    Object:'Object',
    XML:'xml',
};

const VarInputableTypes_arr = [ValueType.String, ValueType.Int, ValueType.Boolean, ValueType.Float, ValueType.Date, ValueType.Time];

const JsValueTypes = [ValueType.String, ValueType.Int, ValueType.Boolean, ValueType.Float, ValueType.Date, ValueType.Time];

function TransSVTToJSVT(sqlType) {
    switch (sqlType) {
        case 'bigint':
            return ValueType.Int;
        case 'bit':
            return ValueType.Boolean;
        case 'char':
            return ValueType.String;
        case 'date':
            return ValueType.Date;
        case 'datetime':
            return ValueType.Date;
        case 'datetime2':
            return ValueType.Date;
        case 'decimal':
            return ValueType.Float;
        case 'float':
            return ValueType.Float;
        case 'int':
            return ValueType.Int;
        case 'money':
            return ValueType.Float;
        case 'nchar':
            return ValueType.String;
        case 'numeric':
            return ValueType.Float;
        case 'nvarchar':
            return ValueType.String;
        case 'smalldatetime':
            return ValueType.Date;
        case 'smallint':
            return ValueType.Int;
        case 'text':
            return ValueType.String;
        case 'time':
            return ValueType.Date;
        case 'tinyint':
            return ValueType.Int;
        case 'varchar':
            return ValueType.String;
    }
    return sqlType;
}