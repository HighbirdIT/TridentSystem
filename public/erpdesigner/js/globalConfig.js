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