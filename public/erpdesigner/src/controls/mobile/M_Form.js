const M_FormKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('标题',AttrNames.Title,ValueType.String,'', true, false, [], 
        {
            pullDataFun:GetKernelCanUseColumns,
            text:'name',
            editable:true,
        }, true, {
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('标题对齐', AttrNames.TextAlign, ValueType.String, ETextAlign.Left, true, false, TextAligns_arr),
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr),
        new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, 'getCanUseDataSource', { text: 'name', value: 'code' }),
        new CAttribute('Key列', AttrNames.KeyColumn, ValueType.String, '', true, false, 'getKeyCanuseColumns'),
        new CAttribute('稳定的数据', AttrNames.StableData, ValueType.Boolean, false),
        new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, g_dataBase.getAllTable, { text: 'name', value: 'code' }),
        new CAttribute('表单类别', AttrNames.FormType, ValueType.String, EFormType.Page, true, false, FormTypes_arr),
        new CAttribute('控件类型', AttrNames.EditorType, ValueType.String, M_TextKernel_Type, true, false, [], { text: 'label', value: 'type', pullDataFun: getCanLabeledControls }),
        new CAttribute('无数据提示', AttrNames.NoDataTip, ValueType.String, ''),
        new CAttribute('无数据动作', AttrNames.NoDataAct, ValueType.String, ENoDataAct.ShowTip, true, false, ENoDataActs_arr),
        new CAttribute('获取错误动作', AttrNames.FetchErrAct, ValueType.String, ENoDataAct.ShowTip, true, false, ENoDataActs_arr),
        new CAttribute('缺少前置动作', AttrNames.InvalidAct, ValueType.String, ENoDataAct.ShowTip, true, false, ENoDataActs_arr),
        new CAttribute('新增按钮标签', AttrNames.InsertBtnLabel, ValueType.String, '新增'),
        new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true),
        new CAttribute('内容定制', AttrNames.ListFormContent, ValueType.ListFormContent, null, true, false, null, null, false),
        new CAttribute('Wrap', AttrNames.Wrap, ValueType.Boolean, true),
        new CAttribute('智能刷新', AttrNames.AutoPull, ValueType.Boolean, true),
        new CAttribute('自动表头重置', 'autoResetHeader', ValueType.Boolean, false),
        new CAttribute('自动分页', AttrNames.PageBreak, ValueType.Boolean, true),
        new CAttribute('生成导航栏', AttrNames.GenNavBar, ValueType.Boolean, true),
        new CAttribute('每页条数', AttrNames.RowPerPage, ValueType.String, '20', true, false, ['5','10','20', '50', '100', '200']),
        new CAttribute('宽度类型', AttrNames.WidthType, ValueType.String, EGridWidthType.Auto, true, false, EGridWidthTypes_arr, { text: 'text', value: 'value' }),
        new CAttribute('首列序号', AttrNames.AutoIndexColumn, ValueType.Boolean, true),
        new CAttribute('隐藏表头', AttrNames.HideTabHead, ValueType.Boolean, false),
        new CAttribute('有滚动条', AttrNames.AutoHeight, ValueType.Boolean, false),
        new CAttribute('有刷新图标', AttrNames.RefreshIcon, ValueType.Boolean, true),
        new CAttribute('永远可编辑', AttrNames.AwaysEditable, ValueType.Boolean, false),
        new CAttribute('align', 'alignitems', ValueType.String, 'initial', true, false, ['initial','baseline','center', 'end', 'start', 'stretch']),
        new CAttribute('justify', 'justifycontent', ValueType.String, 'initial', true, false, ['flex-start','flex-end','center','space-between','space-evenly','space-around','initial','inherit']),
        new CAttribute('模式', AttrNames.SelectMode, ValueType.String, ESelectMode.None, true, false, SelectModes_arr),
        new CAttribute('维持选中行', AttrNames.DefaultSelectFirst, ValueType.Boolean, false),
        new CAttribute('bottomDivID', 'bottomDivID', ValueType.String, '', true, false, null, null, false),
        new CAttribute('editorID', 'editorID', ValueType.String, '', true, false, null, null, false),
        genIsdisplayAttribute(),
        new CAttribute('默认可见', AttrNames.DefaultVisible, ValueType.Boolean, true),
        new CAttribute('NoRender', AttrNames.NoRender, ValueType.Boolean, false),
        new CAttribute('点选模式', AttrNames.ClickSelectable, ValueType.Boolean, false),
        new CAttribute('隐藏选择器', 'hideSelector', ValueType.Boolean, false),
        new CAttribute('访问控制', AttrNames.AcessAssert, ValueType.Event),
        genScripAttribute('获取XML行', AttrNames.Function.GetXMLRowItem, EJsBluePrintFunGroup.CtlFun),
        genScripAttribute('获取JSON行', AttrNames.Function.GetJSONRowItem, EJsBluePrintFunGroup.CtlFun),
        new CAttribute(VarNames.NowRecord, VarNames.NowRecord, ValueType.Object, 1, false, false, null, null, false),
        new CAttribute(VarNames.RecordIndex, VarNames.RecordIndex, ValueType.Int, 1, false, false, null, null, false),
        new CAttribute(VarNames.Records_arr, VarNames.Records_arr, ValueType.Array, 1, false, false, null, null, false),
        new CAttribute(VarNames.SelectedValue, VarNames.SelectedValue, ValueType.Int, 1, false, false, null, null, false),
        new CAttribute(VarNames.SelectedValues_arr, VarNames.SelectedValues_arr, ValueType.Array, 1, false, false, null, null, false),
        new CAttribute(VarNames.SelectedColumns, VarNames.SelectedColumns, ValueType.Array, 1, false, false, null, null, false),
        new CAttribute('固定行高', 'fixedHeight', ValueType.Int, 0),
        new CAttribute('分割列号', 'splitColIndex', ValueType.Int, 0),
        new CAttribute('强制获取', 'forceget', ValueType.String, '', true, true, 'getCanuseColumns'),
    ]),
    new CAttributeGroup('操作设置', [
        genScripAttribute('Insert', AttrNames.Event.OnInsert, EJsBluePrintFunGroup.GridRowBtnHandler),
        genScripAttribute('Update', AttrNames.Event.OnUpdate, EJsBluePrintFunGroup.GridRowBtnHandler),
        genScripAttribute('Delete', AttrNames.Event.OnDelete, EJsBluePrintFunGroup.GridRowBtnHandler),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('数据源变更', AttrNames.Event.OnDataSourceChanged, ValueType.Event),
        new CAttribute('数据行变更', AttrNames.Event.OnRowChanged, ValueType.Event),
        new CAttribute('选择行变更', AttrNames.Event.OnSelectedChanged, ValueType.Event),
        new CAttribute('行绑定', AttrNames.Event.OnRowBind, ValueType.Event),
        new CAttribute('点击刷新时', AttrNames.Event.OnClickRefresh, ValueType.Event),
        //new CAttribute('点击行时', AttrNames.Event.OnClickRow, ValueType.Event),
    ]),
    new CAttributeGroup('List设置', [
        new CAttribute('ItemStyle', 'item' + AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true),
        new CAttribute('ItemClass', 'item' + AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true),
    ]),
]);


class M_FormKernel extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_FormKernel_Type,
            '数据表单',
            M_FormKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        this.hadReactClass = true;
        this.projectLoadedHanlder = this.projectLoadedHanlder.bind(this);
        var cusDsName = this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = this.project.dataMaster.getSqlBPByName(cusDsName);
        if (cusDS_bp == null) {
            cusDS_bp = this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = this.id;
        cusDS_bp.ctlKernel = this;
        cusDS_bp.group = 'ctlcus';
        this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);

        var placeHolderKernel = this.searchChildKernel(EmptyKernel_Type, true);
        if (placeHolderKernel == null) {
            placeHolderKernel = new EmptyKernel({}, this);
        }
        this.placeHolderKernel = placeHolderKernel;
        placeHolderKernel.isfixed = true;
        var theBP = this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate);
        if (theBP) {
            theBP.ctlID = placeHolderKernel.id;
        }
        theBP = this.getRowBtnHandlerBP(AttrNames.Event.OnDelete);
        if (theBP) {
            theBP.ctlID = placeHolderKernel.id;
        }

        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnSelectedChanged);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnRowChanged);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnDataSourceChanged);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Function.GetXMLRowItem);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Function.GetJSONRowItem);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnClickRefresh);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnInsert);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnUpdate);
        this.scriptCreated(null, theBP);
        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnDelete);
        this.scriptCreated(null, theBP);

        //this.autoSetCusDataSource();
        var listFormContentValue = this.getAttribute(AttrNames.ListFormContent);
        if (listFormContentValue == null) {
            listFormContentValue = new ListFormContent(this);
            this.setAttribute(AttrNames.ListFormContent, listFormContentValue);
        }

        var bottomDivID = this.getAttribute('bottomDivID');
        var gridFormBottomDiv = this.children.find(child => {
            return child.id == bottomDivID;
        });
        this.gridFormBottomDiv = gridFormBottomDiv;
        if (gridFormBottomDiv == null) {
            if (this.project.loaded) {
                this.projectLoadedHanlder();
            }
            else {
                this.project.on('loaded', this.projectLoadedHanlder);
            }
        }
        else {
            gridFormBottomDiv.isfixed = true;
        }

        theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnRowBind);
        this.scriptCreated(null, theBP);

        var nowft = this.getAttribute(AttrNames.FormType);
        this[AttrNames.ListFormContent + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.PageBreak + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.RowPerPage + '_visible'] = nowft == EFormType.Grid && this.getAttribute(AttrNames.PageBreak);
        this[AttrNames.WidthType + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.AutoIndexColumn + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.GenNavBar + '_visible'] = nowft == EFormType.Grid || nowft == EFormType.Page;
        this[AttrNames.SelectMode + '_visible'] = nowft == EFormType.Grid || nowft == EFormType.List;
        this[AttrNames.DefaultSelectFirst + '_visible'] = this[AttrNames.SelectMode + '_visible'] && (this.getAttribute(AttrNames.ClickSelectable) || this.getAttribute(AttrNames.SelectMode) != ESelectMode.None);
        this[AttrNames.HideTabHead + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.EditorType + '_visible'] = nowft == EFormType.List;
        this[AttrNames.NoRender + '_visible'] = nowft == EFormType.Page;
        this[AttrNames.Wrap + '_visible'] = nowft == EFormType.List || nowft == EFormType.Page;
        this[AttrNames.ClickSelectable + '_visible'] = nowft == EFormType.List || nowft == EFormType.Grid;
        this['hideSelector_visible'] = nowft == EFormType.Grid;
        this[AttrNames.AwaysEditable + '_visible'] = nowft == EFormType.Grid;
        
        this.findAttrGroupByName('List设置').setVisible(this, nowft == EFormType.List);

        this[AttrNames.Event.OnSelectedChanged + '_visible'] = nowft == EFormType.List || nowft == EFormType.Grid;
        this[AttrNames.Event.OnRowChanged + '_visible'] = nowft == EFormType.Page;
        this[AttrNames.Event.OnRowBind + '_visible'] = nowft != EFormType.Page;
        this[AttrNames.Event.OnDelete + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.Event.OnUpdate + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.Event.OnInsert + '_visible'] = nowft == EFormType.Grid;

        var KeyColumn = this.getAttribute(AttrNames.KeyColumn);
        if(IsEmptyString(KeyColumn)){
            var columns_arr = this.getCanuseColumns();
            if(columns_arr.length > 0){
                this.setAttribute(AttrNames.KeyColumn, columns_arr[0]);    
            }
        }

        var self = this;
        autoBind(self);

        if (nowft == EFormType.List) {
            this.editor = this.children.find(child=>{
                return child.id == this.editorID;
            });
            if(this.editor == null){
                this.clearChildren();
                this.__genEditor(createHelper);
            }
        }
    }

    aidAccessableKernels(targetType, rlt_arr, isInChain) {
        var needFilt = targetType != null;
        var needCheck_arr = this.children;
        if(isInChain){
            if(this.isListForm()){
                return;
            }
            if(this.isGridForm()){
                if(this.gridFormBottomDiv){
                    needCheck_arr = [this.gridFormBottomDiv];
                }
            }
        }
        
        needCheck_arr.forEach(child => {
            if (!needFilt || child.type == targetType) {
                rlt_arr.push(child);
            }
            if(child.editor){
                if(!needFilt || child.editor.type == targetType){
                    rlt_arr.push(child.editor);
                }
                if(child.editor.type == M_ContainerKernel_Type || child.editor.type == PopperButtonKernel_Type){
                    // 穿透div
                    child.editor.aidAccessableKernels(targetType, rlt_arr, true);
                }
            }
            if (child.type == M_ContainerKernel_Type || child.type == Accordion_Type || child.type == M_FormKernel_Type || child.type == PopperButtonKernel_Type) {
                // 穿透div
                child.aidAccessableKernels(targetType, rlt_arr, true);
            }
        });
    }

    isKernelInRow(theKernel) {
        if(this.isPageForm()){
            return false;
        }
        if(theKernel == this.gridFormBottomDiv || !theKernel.hadAncestor(this)){
            return false;
        }
        return !theKernel.hadAncestor(this.gridFormBottomDiv);
    }

    getRowLabeledControls() {
        var rlt = [];
        this.children.forEach(child => {
            if (child == this.gridFormBottomDiv)
                return;
            if (child.type == M_LabeledControlKernel_Type) {
                rlt.push(child);
            }
            else if (child.type == M_ContainerKernel_Type) {
                child.aidAccessableKernels(M_LabeledControlKernel_Type, rlt);
            }
        });
        return rlt;
    }

    getAllRowControls(targetType){
        var rlt = [];
        this.children.forEach(child => {
            if (child == this.gridFormBottomDiv || child == this.placeHolderKernel)
                return;
            if(child.type == M_ContainerKernel_Type){
                child.aidAccessableKernels(null, rlt);
            }
            else{
                rlt.push(child);
            }
        });
        var ret = [];
        var bIsGrid = this.isGridForm();
        var bIsList = this.isListForm();
        rlt.forEach(item=>{
            if(item.type == M_LabeledControlKernel_Type){
                if(!bIsGrid){
                    ret.push(item);
                }
                if(item.parent == this){
                    ret.push(item.editor);
                    if(item.editor.type == M_ContainerKernel_Type || item.editor.type == PopperButtonKernel_Type){
                        // 穿透div
                        item.editor.aidAccessableKernels(targetType, ret, true);
                    }
                }
            }
            else{
                ret.push(item);
            }
        });

        if(targetType != null && targetType != 'M_All'){
            return ret.filter(x=>{
                return x.type == targetType;
            });
        }
        
        return ret;
    }

    projectLoadedHanlder() {
        var gridFormBottomDiv = new M_ContainerKernel({}, this);
        this.gridFormBottomDiv = gridFormBottomDiv;
        gridFormBottomDiv.name = this.id + '底部';
        gridFormBottomDiv.growAttrArray(AttrNames.LayoutNames.StyleAttr);
        gridFormBottomDiv.growAttrArray(AttrNames.LayoutNames.StyleAttr);
        gridFormBottomDiv.setAttribute(AttrNames.LayoutNames.StyleAttr, { name: AttrNames.StyleAttrNames.FlexGrow, value: false }, 0);
        gridFormBottomDiv.setAttribute(AttrNames.LayoutNames.StyleAttr, { name: AttrNames.StyleAttrNames.FlexShrink, value: false }, 1);
        this.setAttribute('bottomDivID', gridFormBottomDiv.id);
        gridFormBottomDiv.isfixed = true;

        var theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnRowBind);
        if(theBP){
            theBP.scopeCtlID = this.gridFormBottomDiv.id;
        }
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP == null){
            return;
        }
        if (scriptBP.group == EJsBluePrintFunGroup.GridRowBtnHandler) {
            scriptBP.ctlID = this.placeHolderKernel.id;
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnSelectedChanged) != -1){
            var selectMode = this.getAttribute(AttrNames.SelectMode);
            var fixParams_arr = ['state','fullPath','record', 'rowIndex', 'rowKey'];
            if(selectMode == ESelectMode.Multi){
                fixParams_arr = ['state','fullPath','records_arr','rowIndexes_arr', 'rowKeys_arr'];
            }
            scriptBP.setFixParam(fixParams_arr);
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnClickRow) != -1){
            var fixParams_arr = ['state','fullPath','record', 'rowIndex', 'rowKey'];
            scriptBP.setFixParam(fixParams_arr);
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnRowChanged) != -1){
            scriptBP.setFixParam(['fullPath','rowIndex','record']);
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnRowBind) != -1){
            scriptBP.setFixParam([VarNames.State, this.id + '_path', this.id + '_state', this.id + '_rowpath', this.id + '_rowstate', this.id + '_' + VarNames.NowRecord]);
            if(this.gridFormBottomDiv){
                scriptBP.scopeCtlID = this.gridFormBottomDiv.id;
            }
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnDataSourceChanged) != -1){
            scriptBP.setFixParam(['fullPath','records_arr']);
        }
        var rowTextParam;
        if(scriptBP.name.indexOf(AttrNames.Function.GetXMLRowItem) != -1){
            scriptBP.setFixParam([VarNames.State,this.id + '_rowState',this.id + '_rowpath',this.id + '_' + VarNames.NowRecord,this.id + '_state']);
            rowTextParam = scriptBP.returnVars_arr.find(item=>{return item.name == AttrNames.RowText;});
            if(rowTextParam == null){
                rowTextParam = scriptBP.createEmptyVariable(true);
                rowTextParam.name = AttrNames.RowText;
                rowTextParam.needEdit = false;
            }
            scriptBP.canCustomReturnValue = true;
        }
        if(scriptBP.name.indexOf(AttrNames.Function.GetJSONRowItem) != -1){
            scriptBP.setFixParam([this.id + '_rowpath',this.id + '_' + VarNames.NowRecord, VarNames.State]);
            scriptBP.canCustomReturnValue = true;
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnDelete) != -1){
            scriptBP.setFixParam([this.id + '_' + VarNames.RowKey, 'callBack']);
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnClickRefresh) != -1){
            scriptBP.setFixParam([this.id + '_path']);
        }
    }

    getRowBtnHandlerBP(name) {
        var funName = this.id + '_' + name;
        return this.project.scriptMaster.getBPByName(funName);
    }

    hadRowBtnHandler() {
        return this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate) != null || this.getRowBtnHandlerBP(AttrNames.Event.OnDelete) != null;
    }

    getInsertSetting() {
        if (!this.isGridForm()) {
            return null;
        }
        var btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnInsert);
        if (btnBP != null) {
            return { key: 'insert', blueprint: btnBP, funName: 'submitInsert', actLabel: '新增' };
        }
        return null;
    }

    getRowBtnSetting() {
        var rlt = [];
        var btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate);
        if (btnBP != null) {
            rlt.push({ key: 'edit', blueprint: btnBP, elemText: "<i className='fa fa-edit' />", funName: AttrNames.Event.OnUpdate, actLabel: '修改' });
        }
        btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnDelete);
        if (btnBP != null) {
            rlt.push({ key: 'delete', blueprint: btnBP, elemText: "<i className='fa fa-trash text-danger' />", funName: AttrNames.Event.OnDelete, actLabel: '删除' });
        }
        return rlt;
    }

    canAppand() {
        return this.isPageForm();
    }

    getCanUseDataSource() {
        return this.project.dataMaster.getAllEntities();
    }

    isGridForm() {
        return this.getAttribute(AttrNames.FormType) == EFormType.Grid;
    }

    isPageForm() {
        return this.getAttribute(AttrNames.FormType) == EFormType.Page;
    }

    isListForm() {
        return this.getAttribute(AttrNames.FormType) == EFormType.List;
    }
    
    getSelectedValueStateName(){
        if(this.isGridForm() || this.isListForm()){
            var selectMode = this.getAttribute(AttrNames.SelectMode);
            if(selectMode == ESelectMode.None){
                return null;
            }
            return selectMode == ESelectMode.Single ? VarNames.SelectedValue : VarNames.SelectedValues_arr;
        }
        return VarNames.RecordIndex;
    }
    
    autoSetCusDataSource(mustSelectColumns_arr) {
        if (mustSelectColumns_arr == null) {
            mustSelectColumns_arr = [];
        }
        var forcegetAttr_arr = this.getAttrArrayList('forceget');
        if (forcegetAttr_arr.length > 0) {
            for (var agai in forcegetAttr_arr) {
                var atrrItem = forcegetAttr_arr[agai];
                var colName = this[atrrItem.name];
                if (IsEmptyString(colName)) {
                    continue;
                }
                if(mustSelectColumns_arr.indexOf(colName) == -1){
                    mustSelectColumns_arr.push(colName);
                }
            }
        }
        var useDS = this.getAttribute(AttrNames.DataSource);
        if (useDS && useDS.loaded == false) {
            // ds 元数据还未加载
            return;
        }
        var cusDS_bp = this.getAttribute(AttrNames.CustomDataSource);
        var theLinks = cusDS_bp.linkPool.getLinksBySocket(cusDS_bp.finalSelectNode.inSocket);
        var dsnode = null;
        var theLink = null;
        if (theLinks.length == 1) {
            theLink = theLinks[0];
            if (theLink.outSocket.node.type == SQLNODE_DBENTITY) {
                dsnode = theLink.outSocket.node;
            }
        }
        if (theLinks.length == 0 || dsnode == null) {
            if (dsnode == null) {
                dsnode = new SqlNode_DBEntity({}, cusDS_bp);
                dsnode.left = cusDS_bp.finalSelectNode.left - 300;
            }
            cusDS_bp.linkPool.addLink(dsnode.outSocket, cusDS_bp.finalSelectNode.inSocket);
        }
        dsnode.setEntity(useDS);
        if (useDS == null) {
            return;
        }
        var retColumnNode = cusDS_bp.finalSelectNode.columnNode;
        var needRemoveSockets_arr = [];
        var needRemoveNodes_arr = [];
        var hadColumns_arr = [];
        retColumnNode.inputScokets_arr.forEach(socket => {
            var alias = socket.getExtra('alias');
            if (!IsEmptyString(alias)) {
                hadColumns_arr.push(alias);
                return;
            }
            var links = cusDS_bp.linkPool.getLinksBySocket(socket);
            if (links.length == 0) {
                needRemoveSockets_arr.push(socket);
                return;
            }
            var link = links[0];
            if (link.outSocket.node.type != SQLNODE_COLUMN) {
                return;
            }
            var columnName = link.outSocket.node.columnName;
            if (mustSelectColumns_arr.indexOf(columnName) == -1) {
                needRemoveSockets_arr.push(socket);
                needRemoveNodes_arr.push(link.outSocket.node);
            }
            else {
                hadColumns_arr.push(link.outSocket.node.columnName);
            }
        });

        needRemoveSockets_arr.forEach(socket => {
            retColumnNode.removeSocket(socket);
        });

        cusDS_bp.deleteNodes(needRemoveNodes_arr);

        mustSelectColumns_arr.forEach(colName => {
            if (hadColumns_arr.indexOf(colName) == -1) {
                var colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);
                colNode.left = retColumnNode.left - 400;
                var newSocket = retColumnNode.genInSocket();
                retColumnNode.addSocket(newSocket);
                cusDS_bp.linkPool.addLink(colNode.outSocket, newSocket);
                colNode.setFromObj({
                    tableCode: useDS.code,
                    tableAlias: null,
                    tableName: useDS.name,
                    columnName: colName,
                });
            }
        });
        cusDS_bp.genColumns();
    }

    clearChildren(){
        this.children.filter(child=>{
            return child != this.placeHolderKernel && child != this.gridFormBottomDiv;
        }).forEach(child=>{
            child.delete(true);
        });
        this.editor = null;
        this.editorID = null;
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        var keyColumnVisible;
        switch (attrItem.name) {
            case AttrNames.DataSource:
                this.autoSetCusDataSource();
                var columns_arr = this.getCanuseColumns();
                this.setAttribute(AttrNames.KeyColumn, columns_arr.length == 0 ? '' : columns_arr[0]);    
                
                break;
            case AttrNames.FormType:
                var isGridForm = newValue == EFormType.Grid;
                var isPageForm = newValue == EFormType.Page;
                var isListForm = newValue == EFormType.List;
                this.findAttributeByName(AttrNames.ListFormContent).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.PageBreak).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, isGridForm && this.getAttribute(AttrNames.PageBreak));
                this.findAttributeByName(AttrNames.WidthType).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.AutoIndexColumn).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.GenNavBar).setVisible(this, isGridForm || isPageForm);
                this.findAttributeByName(AttrNames.SelectMode).setVisible(this, isGridForm || isListForm);
                this.findAttributeByName(AttrNames.DefaultSelectFirst).setVisible(this, (isGridForm || isListForm) && (this.getAttribute(AttrNames.ClickSelectable) || (this.getAttribute(AttrNames.SelectMode) != ESelectMode.None)));
                this.findAttributeByName(AttrNames.HideTabHead).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.EditorType).setVisible(this, isListForm);
                this.findAttributeByName(AttrNames.NoRender).setVisible(this, isPageForm);
                this.findAttributeByName(AttrNames.Wrap).setVisible(this, isListForm || isPageForm);
                this.findAttributeByName(AttrNames.ClickSelectable).setVisible(this, !isPageForm);
                this.findAttributeByName('hideSelector').setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.AwaysEditable).setVisible(this, isGridForm);
                
                this.findAttributeByName(AttrNames.Event.OnSelectedChanged).setVisible(this, isGridForm || isListForm);
                this.findAttributeByName(AttrNames.Event.OnRowChanged).setVisible(this, isPageForm);
                this.findAttributeByName(AttrNames.Event.OnRowBind).setVisible(this, isGridForm || isListForm);
                this.findAttributeByName(AttrNames.Event.OnDelete).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.Event.OnUpdate).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.Event.OnInsert).setVisible(this, isGridForm);

                this.findAttrGroupByName('List设置').setVisible(this, isListForm);
                
                if (isListForm) {
                    this.clearChildren();
                    this.__genEditor();
                }
                else if (oldValue == EFormType.List) {
                    this.clearChildren();
                }
                break;
            case AttrNames.EditorType:
                this.clearChildren();
                this.__genEditor();
            break;
            case AttrNames.PageBreak:
                this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, newValue);
                break;
            case AttrNames.Event.OnUpdate:
                console.log('Names.Event.OnUpd');
                break;
            case AttrNames.SelectMode:
                //this.findAttributeByName(AttrNames.KeyColumn).setVisible(this, newValue != ESelectMode.None && (this.isGridForm() || this.isListForm()));
                this.findAttributeByName(AttrNames.DefaultSelectFirst).setVisible(this, keyColumnVisible);
                var theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnSelectedChanged);
                this.scriptCreated(null, theBP);
                break;
        }
    }

    __genEditor(createHelper) {
        var editorType = this.getAttribute(AttrNames.EditorType);
        var creatParam = {};
        var editorKernelConfig;
        if (editorType.indexOf(UserControlKernel_Type) == 0) {
            var tem_arr = editorType.split('-');
            editorType = UserControlKernel_Type;
            creatParam.refID = tem_arr[1];
        }
        editorKernelConfig = DesignerConfig.findConfigByType(editorType);
        var newEditor = new editorKernelConfig.kernelClass(creatParam, this, createHelper);
        newEditor.isfixed = true;
        this.editorID = newEditor.id;
        this.editor = newEditor;
    }

    getCanuseColumns() {
        return getDSAttrCanuseColumns.call(this, AttrNames.DataSource, AttrNames.CustomDataSource);
    }

    getKeyCanuseColumns() {
        return getDSAttrCanuseColumns.call(this, AttrNames.DataSource, AttrNames.CustomDataSource).concat(DefaultKeyColumn);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<M_Form key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

var MForm_api = new ControlAPIClass(M_FormKernel_Type);
MForm_api.pushApi(new ApiItem_propsetter('title'));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.RecordIndex, M_FormKernelAttrsSetting), VarNames.RecordIndex, false));
MForm_api.pushApi(new ApiItem_propsetter(VarNames.RecordIndex));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.NowRecord, M_FormKernelAttrsSetting), VarNames.NowRecord, false));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.Records_arr, M_FormKernelAttrsSetting), VarNames.Records_arr, false));
MForm_api.pushApi(new ApiItem_propsetter(VarNames.Records_arr));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.SelectedValue, M_FormKernelAttrsSetting), VarNames.SelectedValue, true));
MForm_api.pushApi(new ApiItem_propsetter(VarNames.SelectedValue));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.SelectedValues_arr, M_FormKernelAttrsSetting), VarNames.SelectedValues_arr, true));
MForm_api.pushApi(new ApiItem_propsetter(VarNames.SelectedValues_arr));
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.SelectedColumns, M_FormKernelAttrsSetting), VarNames.SelectedColumns, true,(ctlStateVarName, ctlKernel, propApiitem)=>{
    return makeStr_AddAll(ctlStateVarName,'==null ? "" : ', makeStr_callFun('GetFormSelectedColumns',[ctlStateVarName,singleQuotesStr(ctlKernel.getAttribute(AttrNames.KeyColumn)), singleQuotesStr(propApiitem.colname)]) + '.join(",")');
}));
MForm_api.pushApi(new ApiItem_propsetter(VarNames.Fetching)); 
MForm_api.pushApi(new ApiItem_fun({
    label:'刷新统计列',
    name:'RecalStat',
}));
/*
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.FormXML, M_FormKernelAttrsSetting), VarNames.FormXML, true,(ctlStateVarName, ctlKernel, propApiitem)=>{
    return ctlKernel.id + '_xmldata.xml';
    var formPath = ctlKernel.getStatePath('', '.');
    var belongUserCtl = ctlKernel.searchParentKernel(UserControlKernel_Type, true);
    if(belongUserCtl){
        formPath = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + ctlKernel.getStatePath('', '.'));
    }
    else{
        formPath = singleQuotesStr(formPath);
    }
    return makeStr_callFun('GenFormXmlData',[ctlStateVarName, ctlKernel.id + '_' + AttrNames.Function.GetXMLRowItem, ctlKernel.id + '_xmlconfig', singleQuotesStr(ctlKernel.getAttribute(AttrNames.KeyColumn)), formPath]);
})); 
MForm_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.FormXMLText, M_FormKernelAttrsSetting), VarNames.FormXMLText, true,(ctlStateVarName, ctlKernel, propApiitem)=>{
    return ctlKernel.id + '_xmldata.text';
})); 
*/

g_controlApi_arr.push(MForm_api);

class M_Form extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, LayoutAttrNames_arr.concat([AttrNames.Wrap,AttrNames.Orientation, AttrNames.Chidlren, AttrNames.FormType, AttrNames.WidthType, AttrNames.AutoIndexColumn, AttrNames.Title, AttrNames.SelectMode, 'item' + AttrNames.LayoutNames.StyleAttr, 'item' + AttrNames.LayoutNames.APDClass, AttrNames.AutoHeight], inintState));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;
        inintState.formType = ctlKernel.getAttribute(AttrNames.FormType);
        inintState.widthType = ctlKernel.getAttribute(AttrNames.WidthType);
        inintState.autoIndexColumn = ctlKernel.getAttribute(AttrNames.AutoIndexColumn);
        inintState.title = ctlKernel.getAttribute(AttrNames.Title);
        inintState.selectMode = ctlKernel.getAttribute(AttrNames.SelectMode);
        inintState.wrap = ctlKernel.getAttribute(AttrNames.Wrap);
        inintState.autoHeight = ctlKernel.getAttribute(AttrNames.AutoHeight);

        this.state = inintState;
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        var childrenVal = this.state.children;
        var ctlKernel = this.props.ctlKernel;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = ctlKernel.children.concat();
        }
        this.setState({
            orientation: ctlKernel.getAttribute(AttrNames.Orientation),
            children: childrenVal,
            formType: ctlKernel.getAttribute(AttrNames.FormType),
            widthType: ctlKernel.getAttribute(AttrNames.WidthType),
            autoIndexColumn: ctlKernel.getAttribute(AttrNames.AutoIndexColumn),
            title: ctlKernel.getAttribute(AttrNames.Title),
            selectMode: ctlKernel.getAttribute(AttrNames.SelectMode),
            wrap: ctlKernel.getAttribute(AttrNames.Wrap),
            autoHeight: ctlKernel.getAttribute(AttrNames.AutoHeight),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-0');
        layoutConfig.addClass('flex-shrink-0');
        var rootStyle = layoutConfig.style;

        var childClickHandlerParam = this.props.replaceChildClick ? this.props.onClick : null;

        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            layoutConfig.addClass('M_Form_Empty');
            return (<div className={layoutConfig.getClassName()} style={rootStyle} ref={this.rootElemRef}></div>);
        }
        layoutConfig.addClass('M_Form');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        
        var outerDivClassStr = layoutConfig.getClassName() + ' flex-column';
        if (this.props.ctlKernel.children.length == 0) {
            layoutConfig.addClass('M_Form_Empty');
        }
        var titleParserRet = parseObj_CtlPropJsBind(this.state.title, ctlKernel.project.scriptMaster);
        var title = titleParserRet.isScript ? (ReplaceIfNull(this.state.name,'') + '{脚本}') : (IsEmptyString(titleParserRet.string) ? '' : '[' +titleParserRet.string + ']');
        var selectMode = this.state.selectMode;
        if (this.state.formType == EFormType.Grid) {
            //var labelControls_arr = this.props.ctlKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
            var widthType = this.state.widthType;
            var autoIndexColumn = this.state.autoIndexColumn;
            var tableStyle = {};
            var sumTableWidth = 0;
            if (autoIndexColumn) {
                sumTableWidth += 3;
            }
            if (selectMode != ESelectMode.None) {
                sumTableWidth += 2;
            }

            var tableElem = (
                <div className={outerDivClassStr} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    <span className='text-light bg-dark'>{title}</span>
                    <div className='mw-100 autoScroll'>
                        <table className='table' style={tableStyle}>
                            <thead className="thead-dark">
                                <tr>
                                    {
                                        this.props.ctlKernel.children.length == 0 ?
                                            <th scope="col">空</th> :
                                            <React.Fragment>
                                                {selectMode == ESelectMode.None ? null : <th scope='col' className='selectorTableHeader'><input type={selectMode == ESelectMode.Multi ? 'checkbox' : 'radio'} /></th>}
                                                {!autoIndexColumn ? null : <th scope='col' className='indexTableHeader' >序号</th>}
                                                {this.props.ctlKernel.children.map(childKernel => {
                                                    if (childKernel.type == M_LabeledControlKernel_Type) {
                                                        var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                                                        var textFieldParseRet = parseObj_CtlPropJsBind(childKernel.getAttribute(AttrNames.TextField));
                                                        var textValue = '';
                                                        if (textFieldParseRet.isScript) {
                                                            textValue = '{脚本}';
                                                        }
                                                        else {
                                                            textValue = textFieldParseRet.string;
                                                        }
                                                        if (columnWidth == 0) {
                                                            columnWidth = textValue.length * GridHead_PerCharWidth;
                                                            if (columnWidth == 0) {
                                                                columnWidth = 4 * GridHead_PerCharWidth;
                                                            }
                                                        }
                                                        if (widthType == EGridWidthType.Fixed) {
                                                            sumTableWidth += columnWidth;
                                                        }
                                                        return (<th key={childKernel.id} scope="col" style={{ width: columnWidth + 'em' }}>
                                                            <div className='d-flex flex-column'>
                                                                {textValue}
                                                                <div className='d-flex'>
                                                                    <span className='badge badge-primary'>{GetControlTypeReadableName(childKernel.editor.type)}</span>
                                                                </div>
                                                            </div>
                                                        </th>);
                                                    }
                                                })}
                                            </React.Fragment>
                                    }
                                </tr>
                            </thead>
                        </table>
                    </div>
                    {ctlKernel.gridFormBottomDiv && ctlKernel.gridFormBottomDiv.renderSelf(childClickHandlerParam, this.props.replaceChildClick, this.props.designer)}
                </div>
            );
            if (widthType == EGridWidthType.Fixed) {
                tableStyle.width = sumTableWidth + 'em';
            }
            return tableElem;
        }

        var childElem = null;
        if(this.props.ctlKernel.children.length > 0){
            childElem = this.props.ctlKernel.children.map(childKernel => {
                if (childKernel == ctlKernel.gridFormBottomDiv) {
                    return null;
                }
                return childKernel.renderSelf(childClickHandlerParam, this.props.replaceChildClick, this.props.designer);
            })
        }
        else{
            childElem = this.props.ctlKernel.id;
        }

        var contentElem = childElem;
        if(this.state.formType == EFormType.List) {
            var itemLayoutConfig = this.props.ctlKernel.getLayoutConfig('item' + AttrNames.LayoutNames.APDClass, 'item' + AttrNames.LayoutNames.StyleAttr);
            itemLayoutConfig.addClass('list-group-item');
            if (selectMode != ESelectMode.None) {
                itemLayoutConfig.addClass('list-group-item-action');
                itemLayoutConfig.addClass('active');
            }
            contentElem = <div className={itemLayoutConfig.getClassName()} style={itemLayoutConfig.style} >
                {childElem}
            </div>
        }

        return (
            <div className={outerDivClassStr} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                <span className='text-light bg-dark'>{title}</span>
                <div className={'d-flex flex-grow-1 flex-shrink-1' + (this.state.orientation == Orientation_V ? ' flex-column' : '') + (this.state.wrap ? ' flex-wrap' : '') + (this.state.formType == EFormType.Page && this.state.autoHeight ? ' autoScroll' : '')} style={rootStyle}>
                    {contentElem}
                </div>
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: 'Form',
        type: M_FormKernel_Type,
        namePrefix: M_FormKernel_Prefix,
        kernelClass: M_FormKernel,
        reactClass: M_Form,
    }, '布局');


class ListFormContent extends EventEmitter {
    constructor(kernel) {
        super();
        EnhanceEventEmiter(this);
        this.formKernel = kernel;
        this.selectColumns_map = {};
    }

    createControl() {
        var newCtl = new M_LabeledControlKernel({}, this.formKernel, null, null);
        return newCtl;
    }

    getJson() {
        return {};
    }
}