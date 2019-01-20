'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function genTextFiledAttribute() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '显示字段';
    var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var editable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    return new CAttribute(label, AttrNames.TextField, ValueType.String, def, true, false, [], {
        pullDataFun: GetKernelCanUseColumns,
        text: 'name',
        editable: editable
    }, true, {
        scriptable: true,
        type: FunType_Client,
        group: FunGroup.CtlAttr
    });
}

var CAttribute = function () {
    function CAttribute(label, name, valueType, defaultVal, editable, isArray, options_arr, dropdownSetting, visible, scriptSetting) {
        _classCallCheck(this, CAttribute);

        Object.assign(this, {
            label: label,
            name: name,
            valueType: valueType,
            editable: editable != false,
            inputID: name + '_input',
            isArray: isArray,
            options_arr: options_arr,
            defaultVal: defaultVal,
            dropdownSetting: dropdownSetting,
            visible: visible != false,
            scriptSetting: scriptSetting
        });
    }

    _createClass(CAttribute, [{
        key: 'setVisible',
        value: function setVisible(target, val) {
            var nowVisible = target[this.name + '_visible'];
            if (nowVisible == val) {
                return;
            }
            target[this.name + '_visible'] = val;
            this.group.fireEvent('changed');
        }
    }]);

    return CAttribute;
}();

function makeFName_activePage(pageKernel) {
    return 'active_' + pageKernel.id;
}

function makeFName_freshForm(formKernel) {
    return 'fresh_' + formKernel.id;
}

function makeFName_bindForm(formKernel) {
    return 'bind_' + formKernel.id;
}

function makeFName_pull(formKernel) {
    return 'pull_' + formKernel.id;
}

function makeStr_callFun(funName, params_arr) {
    var endChar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    var realParams_arr = params_arr == null ? null : params_arr.filter(function (e) {
        return e != null;
    });

    return funName + '(' + (realParams_arr == null || realParams_arr.length == 0 ? '' : realParams_arr.join(',')) + ')' + endChar;
}

function makeStr_getStateByPath(state, path, defValue) {
    return makeStr_callFun('getStateByPath', [state, path, defValue]);
}

function makeStr_DynamicAttr(objStr, propName) {
    return objStr + (propName[0] == "'" ? '[' : "['") + propName + (propName[propName.length - 1] == "'" ? ']' : "']");
}

function makeActStr_pullKernel(formKernel) {
    return 'pulldata_' + formKernel.id;
}

function makeLine_FetchPropValue(actStr, baseStr, idStr, propStr) {
    var isModel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var url = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'appServerUrl';

    return "store.dispatch(fetchJsonPost(" + url + ", { action: '" + actStr + "' }, makeFTD_Prop(" + baseStr + "," + idStr + ',' + propStr + ',' + isModel + "), EFetchKey.FetchPropValue));";
}

function makeLine_Return(retStr) {
    return 'return ' + retStr + ';';
}

var VarNames = {
    RetProps: 'retProps',
    ReState: 'retState',
    RetDispather: 'retDispather',
    NowPage: 'nowPage',
    NeedSetState: 'needSetState',
    NowRecord: 'nowRecord',
    RetElem: 'retElem',
    ThisProps: 'this.props',
    FetchErr: 'fetchErr',
    Fetching: 'fetching',
    CtlState: 'ctlState',
    Records_arr: 'records_arr',
    RecordIndex: 'recordIndex',
    InsertCache: 'insertCache',
    State: 'state',
    Bundle: 'bundle'
};

var AttrNames = {
    Title: 'title',
    Text: 'text',
    Test: 'test',
    Orientation: 'orientation',
    RealName: 'realName',
    Chidlren: 'children',
    IsMain: 'ismain',
    Label: 'label',
    DataSource: 'datasource',
    ProcessTable: 'processtable',
    Name: 'name',
    ValueType: 'valuetype',
    FloatNum: 'floatnum',
    DefaultValue: 'defaultvalue',
    EditorType: 'editortype',
    TextField: 'textfield',

    LayoutNames: {
        APDClass: 'apdClass',
        StyleAttr: 'styleAttr'
    },

    StyleAttrNames: {
        Display: 'display',
        Width: 'width',
        Height: 'height',
        FlexGrow: 'flex-grow',
        FlexShrink: 'flex-shrink'
    },

    StyleValues: {
        Display: {
            None: 'none',
            Block: 'block',
            Inline: 'inline',
            InlineBlock: 'inline-block',
            Flex: 'flex'
        }
    }
};

function InitAttrNames(target) {
    var values_arr = [];
    var names_arr = [];
    for (var si in target) {
        var val = target[si];
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
            InitAttrNames(val);
        } else {
            if (target[val] != null) {
                console.error('AttrName:' + si + '设置错误!');
            }
            target[val] = 1;
            values_arr.push(val);
            names_arr.push(si);
        }
    }
    target.values_arr = values_arr;
    target.names_arr = names_arr;
}

InitAttrNames(AttrNames);

var StyleAttrSetting = {};

StyleAttrSetting[AttrNames.StyleAttrNames.Display] = { type: ValueType.String, def: AttrNames.StyleValues.Display.Flex, options_arr: AttrNames.StyleValues.Display.values_arr };
StyleAttrSetting[AttrNames.StyleAttrNames.FlexGrow] = { type: ValueType.Boolean, def: true };
StyleAttrSetting[AttrNames.StyleAttrNames.FlexShrink] = { type: ValueType.Boolean, def: true };
StyleAttrSetting[AttrNames.StyleAttrNames.Width] = { type: ValueType.String, def: '' };
StyleAttrSetting[AttrNames.StyleAttrNames.Height] = { type: ValueType.String, def: '' };

var CouldAppendClasses_arr = [''];