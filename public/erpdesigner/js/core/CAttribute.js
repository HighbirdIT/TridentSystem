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
        group: EJsBluePrintFunGroup.CtlAttr
    });
}

function genColumnFieldAttribute(label, name) {
    var def = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    return new CAttribute(label, name, ValueType.String, def, true, false, [], {
        pullDataFun: GetKernelCanUseColumns,
        text: 'name',
        editable: false
    }, true);
}

function genValueFiledAttribute() {
    var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '码值字段';
    var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var editable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    return new CAttribute(label, AttrNames.ValueField, ValueType.String, def, true, false, [], {
        pullDataFun: GetKernelCanUseColumns,
        text: 'name',
        editable: editable
    }, true, {
        scriptable: true,
        type: FunType_Client,
        group: EJsBluePrintFunGroup.CtlAttr
    });
}

function genIsdisplayAttribute() {
    return new CAttribute('是否显示', AttrNames.Isdisplay, ValueType.Boolean, true, true, false, null, null, true, {
        scriptable: true,
        type: FunType_Client,
        group: EJsBluePrintFunGroup.CtlAttr
    });
}

function genNullableAttribute() {
    return new CAttribute('允许空值', AttrNames.Nullable, ValueType.Boolean, false, true);
}

function genValidCheckerAttribute() {
    return new CAttribute('值验证', AttrNames.ValidChecker, ValueType.Script, true, true, false, null, null, true, {
        scriptable: true,
        type: FunType_Client,
        group: EJsBluePrintFunGroup.CtlValid
    });
}

function genScripAttribute(label, name, group) {
    return new CAttribute(label, name, ValueType.Script, null, null, null, null, null, null, { group: group });
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
    }, {
        key: 'setEditable',
        value: function setEditable(target, val) {
            var nowVisible = target[this.name + '_editable'];
            if (nowVisible == val) {
                return;
            }
            target[this.name + '_editable'] = val;
            this.group.fireEvent('changed');
        }
    }]);

    return CAttribute;
}();

function makeFName_activePage(pageKernel) {
    return 'active_' + pageKernel.id;
}

function makeFName_initPage(pageKernel) {
    return 'init_' + pageKernel.id;
}

function makeFName_freshForm(formKernel) {
    return 'fresh_' + formKernel.id;
}

function makeFName_reCalFormStat(formKernel) {
    return 'reCalStat_' + formKernel.id;
}

function makeFName_bindForm(formKernel) {
    return 'bind_' + formKernel.id;
}

function makeFName_bindFormPage(formKernel) {
    return 'bind_' + formKernel.id + 'Page';
}

function makeFName_SaveInsertForm(formKernel) {
    return 'saveInsertCache' + formKernel.id;
}

function makeFName_pull(formKernel) {
    return 'pull_' + formKernel.id;
}

function makeFName_RowBind(formKernel) {
    return 'rowbind_' + formKernel.id;
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

function makeActStr_getGDataCache(key) {
    return VarNames.gDataCache + '.get(' + singleQuotesStr(key) + ')';
}

function makeLine_setGDataCache(key, value) {
    var autoQuote = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    return VarNames.gDataCache + '.set(' + (autoQuote ? singleQuotesStr(key) : key) + ',' + value + ');';
}

function makeLine_FetchPropValue(actStr, baseStr, idStr, propStr, paramObj) {
    var isModel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
    var url = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'appServerUrl';

    if (paramObj == null) {
        paramObj = { action: singleQuotesStr(actStr) };
    } else {
        paramObj.action = singleQuotesStr(actStr);
    }
    return "store.dispatch(fetchJsonPost(" + url + ", " + JsObjectToString(paramObj) + ", makeFTD_Prop(" + baseStr + "," + idStr + ',' + propStr + ',' + isModel + "), EFetchKey.FetchPropValue));";
}

function makeLine_FetchFTDCallBack(theKernel, actStr, bundleVarName, dataVarName, errVarName) {
    var pageid = 'unknow';
    if (theKernel) {
        var belongPageKernel = theKernel.type == M_PageKernel_Type ? theKernel : theKernel.searchParentKernel(M_PageKernel_Type, true);
        if (belongPageKernel) {
            pageid = singleQuotesStr(belongPageKernel.id);
        } else {
            var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
            pageid = (belongUserControl == null ? theKernel.id : belongUserControl.id) + "_path.split('.')[0]";
        }
    }
    return "store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + actStr + "',pageid:" + pageid + "}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{";
}

function makeLine_Return(retStr) {
    return 'return ' + retStr + ';';
}

function makeLine_DeclareVar(varName, initVal, autoQuote) {
    if (initVal != null) {
        if (isNaN(initVal) && autoQuote != false) {
            switch (initVal[0]) {
                case "'":
                case '"':
                case '{':
                    break;
                default:
                    initVal = singleQuotesStr(initVal);
            }
        }
    } else {
        initVal = 'null';
    }
    return 'var ' + varName + '=' + initVal + ';';
}

function makeLine_SetValue(leftName, rightName) {
    return leftName + '=' + rightName + ';';
}

var VarNames = {
    RetProps: 'retProps',
    ReState: 'retState',
    RetDispather: 'retDispather',
    RowBindInfo: 'bindedRow',
    NowPage: 'nowPage',
    NeedSetState: 'needSetState',
    InvalidBundle: 'invalidbundle',
    NowRecord: 'nowRecord',
    RowState: 'rowState',
    RetElem: 'retElem',
    ContentElem: 'contentElem',
    NavElem: 'navElem',
    ThisProps: 'this.props',
    FetchErr: 'fetchingErr',
    Fetching: 'fetching',
    CtlState: 'ctlState',
    Records_arr: 'records_arr',
    RecordIndex: 'recordIndex',
    InsertCache: 'insertCache',
    State: 'state',
    Bundle: 'bundle',
    StartRowIndex: 'startRowIndex',
    EndRowIndex: 'endRowIndex',
    PageCount: 'pageCount',
    PageIndex: 'pageIndex',
    RowPerPage: 'rowPerPage',
    HadStateParam: 'hadStateParam',
    PageRouter: 'pageRouter',
    gDataCache: 'gDataCache',
    RowIndex: 'rowIndex',
    RowKey: 'rowkey',
    CallBack: 'callBack',
    FetchKey: 'fetchKey',
    ParentPath: 'parentPath',
    RowKeyInfo_map: 'rowKeyInfo_map',
    SelectMode: 'selectMode',
    FullPath: 'fullPath',
    FullParentPath: 'fullParentPath',
    SelectedRows_arr: 'selectedRows_arr',
    SelectedValue: 'selectedValue',
    SelectedValues_arr: 'selectedValues_arr',
    SelectedColumns: 'selectedColumns',
    BaseBunlde: 'baseBundle',
    HoldSelected: 'holdSelected',
    HoldScroll: 'holdScroll',
    Userctlpath: 'userctlpath',
    OldValue: 'oldValue',
    SatePath: 'statePath',
    Visible: 'visible',
    NowRow: 'nowrow',
    SelectedProfile: 'selectedProfile',
    BaseValidCheckPath: 'baseValidCheckPath',
    FormXML: 'formxml',
    FormXMLText: 'formxmltext'
};

var AttrNames = {
    ButtonClass: 'btnclass',
    Title: 'title',
    Text: 'text',
    Test: 'test',
    Orientation: 'orientation',
    RealName: 'realName',
    Chidlren: 'children',
    IsMain: 'ismain',
    Label: 'label',
    DataSource: 'datasource',
    CustomDataSource: 'customdatasource',
    ProcessTable: 'processtable',
    Name: 'name',
    ValueType: 'valuetype',
    FloatNum: 'floatnum',
    DefaultValue: 'defaultvalue',
    EditorType: 'editortype',
    TextField: 'textfield',
    ValueField: 'valuefield',
    FormType: 'formtype',
    FromTextField: 'fromtextfield',
    FromValueField: 'fromvaluefield',
    AutoClearValue: 'autoclearvalue',
    Editeable: 'editeable',
    Isdisplay: 'isdisplay',
    Nullable: 'nullable',
    LineType: 'linetype',
    InteractiveType: 'interactivetype',
    InteractiveField: 'interactivefield',
    ValidChecker: 'validchecker',
    InvalidInfo: 'invalidInfo',
    ListFormContent: 'listFormContent',
    PageBreak: 'pageBreak',
    RowPerPage: 'rowPerPage',
    WidthType: 'widthType',
    ColumnWidth: 'columnWidth',
    AutoHeight: 'autoHeight',
    HadScroll: 'hadScroll',
    AutoIndexColumn: 'autoIndexColumn',
    NoDataTip: 'noDataTip',
    NoDataAct: 'noDataAct',
    FetchErrAct: 'fetchErrAct',
    MultiSelect: 'multiselect',
    RelFlowStep: 'relflowstep',
    PermissionGroup: 'permissiongroup',
    GenNavBar: 'gennavbar',
    StableData: 'stableData',
    RecEditeable: 'recEditeable',
    RecDeletable: 'recDeletable',
    NewRowDepend: 'newRowDepend',
    StatFun: 'statfun',
    SelectMode: 'selectMode',
    EntryParam: 'entryParam',
    ExportParam: 'exportParam',
    PopablePage: 'popablepage',
    ParamApi: 'paramapi',
    EventApi: 'eventapi',
    FunctionApi: 'functionapi',
    StarSelectable: 'starSelectable',
    ButtonVisibleType: 'buttonVisibleType',
    InitCollapsed: 'initCollapsed',
    LoadOnUnCollapsed: 'loadOnCollapsed',
    GreedMode: 'greedMode',
    HideTabHead: 'hideTabHead',
    Mode: 'mode',
    TagType: 'tagtype',
    HideLabel: 'hidelabel',
    NoRender: 'norender',
    ClickSelectable: 'clickSelectable',
    TextAlign: 'textalign',
    TipInfo: 'tipinfo',
    HisKey: 'hisKey',
    AcessAssert: 'accessAssert',
    IconType: 'icontype',
    AutoCloseBtn: 'autoclosebtn',
    HaveDoneTip: 'havedonetip',
    DockType: 'dockType',
    HideTitle: 'hidetitle',
    ButtonType: 'buttontype',
    ManualChanged: 'manualChanged',
    RendererCtlType: 'rendererctltype',
    Wrap: 'wrap',
    OutputCharCount: 'outputcharcount',
    AutoHomeBtn: 'autoHomeBtn',
    AutoPull: 'autoPull',
    DefaultVisible: 'defaultvisible',
    InsertBtnLabel: 'insertbtnlabel',
    KeyRecrodID: 'keyrecordid',
    AttachmentID: 'attachmentid',
    ModifyContent: 'modifycontent',
    ToolTip: 'toolTip',
    Growable: 'growable',
    InvalidAct: 'invalidAct',
    KeyColumn: 'keyColumn',
    RefreshIcon: 'refreshicon',
    DefaultSelectFirst: 'defaultSelectFirst',
    WidthFactor: 'widthfactor',
    RenderMode: 'rendermode',
    InitOnRowChanged: 'initOnRowChanged',
    ProjectCode: 'projectCode',
    FlowStepCode: 'flowStepCode',
    FlowStepData: 'flowStepData',
    InvisibleAct: 'invisibleact',
    AwaysEditable: 'awayseditable',
    AttrHook: 'attrhook',
    InsAttrHook: 'insattr_hook',
    AttrChecker: 'attrchecker',
    RowText: 'rowtext',
    AppandColumn: 'appandColumn',
    ColumnName: 'columnname',
    ChartType: 'charttype',

    Event: {
        OnClick: 'onclick',
        OnUpdate: 'onUpdate',
        OnDelete: 'onDelete',
        OnInsert: 'onInsert',
        OnLoad: 'onLoad',
        OnInit: 'onInit',
        OnChanged: 'onChanged',
        OnMouseDown: 'onMouseDown',
        OnSelectedChanged: 'onSelectedChanged',
        OnRowChanged: 'onRowChanged',
        OnUploadComplete: 'onUploadComplate',
        OnDataSourceChanged: 'onDataSourceChanged',
        OnClickCloseBtn: 'onClickCloseBtn',
        OnReceiveMsg: 'onReceiveMsg',
        OnCollapse: 'onCollapse',
        OnUnCollapse: 'onUnCollapse'
    },

    Function: {
        GetXMLRowItem: 'getxmlrowitem',
        GenarateChartData: 'generateChartData',
        GetJSONRowItem: 'getJSONrowitem'
    },

    LayoutNames: {
        APDClass: 'apdClass',
        StyleAttr: 'styleAttr'
    },

    StyleAttrNames: {
        Display: 'display',
        Width: 'width',
        Height: 'height',
        MaxWidth: 'maxWidth',
        MaxHeight: 'maxHeight',
        FlexGrow: 'flex-grow',
        FlexShrink: 'flex-shrink',
        MinWidth: 'minWidth',
        MinHeight: 'minHeight'
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

function gStyleAttrNameToCssName(styleAttrName) {
    switch (styleAttrName) {
        case 'maxWidth':
            return 'max-width';
        case 'maxHeight':
            return 'max-height';
        case 'minWidth':
            return 'min-width';
        case 'minHeight':
            return 'min-height';
    }
    return styleAttrName;
}

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
StyleAttrSetting[AttrNames.StyleAttrNames.MaxWidth] = { type: ValueType.String, def: '' };
StyleAttrSetting[AttrNames.StyleAttrNames.MaxHeight] = { type: ValueType.String, def: '' };
StyleAttrSetting[AttrNames.StyleAttrNames.MinWidth] = { type: ValueType.String, def: '' };
StyleAttrSetting[AttrNames.StyleAttrNames.MinHeight] = { type: ValueType.String, def: '' };

var CouldAppendClasses_arr = [''];