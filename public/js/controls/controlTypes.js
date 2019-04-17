'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var M_AllKernel_Type = 'M_All';
var M_LabelKernel_Type = 'M_Label';
var M_PageKernel_Type = 'M_Page';
var M_ContainerKernel_Type = 'M_Div';
var M_LabeledControlKernel_Type = 'M_LC';
var M_FormKernel_Type = 'M_Form';
var M_TextKernel_Type = 'M_Text';
var M_ListKernel_Type = 'M_List';
var M_DropdownKernel_Type = 'M_Dropdown';
var ButtonKernel_Type = 'button';
var M_CheckBoxKernel_Type = 'M_CheckBox';

var M_LabelKernel_Prefix = 'M_Label';
var M_PageKernel_Prefix = 'M_Page';
var M_ContainerKernel_Prefix = 'M_Div';
var M_LabeledControlKernel_Prefix = 'M_LC';
var M_FormKernel_Prefix = 'M_Form';
var M_TextKernel_Prefix = 'M_Text';
var M_ListKernel_Prefix = 'M_List';
var M_DropdownKernel_Prefix = 'M_Dropdown';
var ButtonKernel_Prefix = 'Btn';
var M_CheckBoxKernel_Prefix = 'M_Check';

function GetControlTypeReadableName(type) {
    switch (type) {
        case M_LabelKernel_Type:
            return '标签';
        case M_PageKernel_Type:
            return '页面';
        case M_ContainerKernel_Type:
            return 'DIV';
        case M_LabeledControlKernel_Type:
            return '操作控件';
        case M_FormKernel_Type:
            return 'Form';
        case M_TextKernel_Type:
            return '文本框';
        case M_ListKernel_Type:
            return '列表';
        case ButtonKernel_Type:
            return '按钮';
        case M_DropdownKernel_Type:
            return '下拉框';
        case M_AllKernel_Type:
            return '任意';
        case M_CheckBoxKernel_Type:
            return '开关';
    }
    return type;
}

var ControlAPIClass = function () {
    function ControlAPIClass(ctltype) {
        _classCallCheck(this, ControlAPIClass);

        this.name = ctltype;
        this.ctltype = ctltype, this.ctllabel = GetControlTypeReadableName(ctltype);
        this.propapi_arr = [];
        this.funapi_arr = [];
        this.allapi_arr = [];
        this.api_map = {};
    }

    _createClass(ControlAPIClass, [{
        key: 'toString',
        value: function toString() {
            return this.ctllabel;
        }
    }, {
        key: 'pushApi',
        value: function pushApi(apiItem) {
            apiItem.setApiClass(this);
            this.api_map[apiItem.id] = apiItem;
            switch (apiItem.type) {
                case EApiType.Prop:
                    this.propapi_arr.push(apiItem);
                    break;
                case EApiType.Fun:
                    this.funapi_arr.push(apiItem);
                    break;
            }
            this.allapi_arr.push(apiItem);
        }
    }, {
        key: 'getApiItemByid',
        value: function getApiItemByid(apiid) {
            return this.api_map[apiid];
        }
    }]);

    return ControlAPIClass;
}();

var ApiItem_prop = function () {
    function ApiItem_prop(attrItem, stateName, needValid) {
        _classCallCheck(this, ApiItem_prop);

        this.type = EApiType.Prop;
        this.attrItem = attrItem;
        this.needValid = needValid == true;
        this.stateName = stateName == null ? attrItem.name : stateName;
    }

    _createClass(ApiItem_prop, [{
        key: 'toString',
        value: function toString() {
            return 'Get:' + this.apiClass + '.' + this.attrItem.label;
        }
    }, {
        key: 'setApiClass',
        value: function setApiClass(apiClass) {
            this.apiClass = apiClass;
            this.id = 'P-' + this.attrItem.label;
            this.uniqueID = apiClass.name + this.id;
        }
    }]);

    return ApiItem_prop;
}();

var ApiItem_propsetter = function () {
    function ApiItem_propsetter(stateName) {
        _classCallCheck(this, ApiItem_propsetter);

        this.type = EApiType.PropSetter;
        this.stateName = stateName;
    }

    _createClass(ApiItem_propsetter, [{
        key: 'toString',
        value: function toString() {
            return 'Set:' + this.apiClass + '.' + this.stateName;
        }
    }, {
        key: 'setApiClass',
        value: function setApiClass(apiClass) {
            this.apiClass = apiClass;
            this.id = 'SP-' + this.stateName;
            this.uniqueID = apiClass.name + this.id;
        }
    }]);

    return ApiItem_propsetter;
}();

var ApiItem_fun = function () {
    function ApiItem_fun(funName) {
        _classCallCheck(this, ApiItem_fun);

        this.type = EApiType.Fun;
    }

    _createClass(ApiItem_fun, [{
        key: 'toString',
        value: function toString() {
            return 'Call:' + this.apiClass + '.' + this.attrItem.label;
        }
    }, {
        key: 'setApiClass',
        value: function setApiClass(apiClass) {
            this.apiClass = apiClass;
            this.id = 'P-' + this.attrItem.label;
            this.uniqueID = apiClass.name + this.id;
        }
    }]);

    return ApiItem_fun;
}();