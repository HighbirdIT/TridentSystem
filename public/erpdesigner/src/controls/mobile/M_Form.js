const M_FormKernelAttrsSetting=GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('标题',AttrNames.Title,ValueType.String,''),
        new CAttribute('方向',AttrNames.Orientation,ValueType.String,Orientation_V,true,false, Orientation_Options_arr),
        new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, 'getCanUseDataSource', {text:'name', value:'code'}),
        new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, g_dataBase.getAllTable, {text:'name', value:'code'}),
        new CAttribute('表单类别', AttrNames.FormType, ValueType.String, EFormType.Page, true, false, FormTypes_arr),
        new CAttribute('无数据提示',AttrNames.NoDataTip,ValueType.String,''),
        new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true),
        new CAttribute('内容定制', AttrNames.ListFormContent, ValueType.ListFormContent, null, true, false, null, null, false),
        new CAttribute('自动分页',AttrNames.PageBreak,ValueType.Boolean,true),
        new CAttribute('生成导航栏',AttrNames.GenNavBar,ValueType.Boolean,true),
        new CAttribute('每页条数',AttrNames.RowPerPage,ValueType.String, '20', true, false, ['20','50','100','200']),
        new CAttribute('宽度类型',AttrNames.WidthType,ValueType.String,EGridWidthType.Auto,true,false,EGridWidthTypes_arr,{text:'text', value:'value'}),
        new CAttribute('首列序号',AttrNames.AutoIndexColumn,ValueType.Boolean,true),
        new CAttribute('隐藏表头',AttrNames.HideTabHead,ValueType.Boolean,false),
        new CAttribute('自动滚动条', AttrNames.AutoHeight, ValueType.Boolean, false),
        new CAttribute('模式', AttrNames.SelectMode, ValueType.String, ESelectMode.None, true, false, SelectModes_arr),
        new CAttribute('bottomDivID','bottomDivID',ValueType.String,'',true,false,null,null,false),
        genIsdisplayAttribute(),
        new CAttribute('NoRender',AttrNames.NoRender,ValueType.Boolean,false),
        new CAttribute('可点击选择',AttrNames.ClickSelectable,ValueType.Boolean,false),
        new CAttribute('访问控制', AttrNames.AcessAssert, ValueType.Event),
    ]),
    new CAttributeGroup('操作设置',[
        genScripAttribute('Insert', AttrNames.Event.OnInsert,EJsBluePrintFunGroup.GridRowBtnHandler),
        genScripAttribute('Update', AttrNames.Event.OnUpdate,EJsBluePrintFunGroup.GridRowBtnHandler),
        genScripAttribute('Delete', AttrNames.Event.OnDelete,EJsBluePrintFunGroup.GridRowBtnHandler),
    ])
]);


class M_FormKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_FormKernel_Type,
                '数据表单',
                M_FormKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );

        this.hadReactClass = true;
        this.projectLoadedHanlder = this.projectLoadedHanlder.bind(this);
        var cusDsName = this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = this.project.dataMaster.getSqlBPByName(cusDsName);
        if(cusDS_bp == null){
            cusDS_bp = this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = this.id;
        cusDS_bp.ctlKernel = this;
        cusDS_bp.group = 'ctlcus';
        this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);

        var placeHolderKernel = this.searchChildKernel(EmptyKernel_Type,true);
        if(placeHolderKernel == null){
            placeHolderKernel = new EmptyKernel({}, this);
        }
        this.placeHolderKernel = placeHolderKernel;
        placeHolderKernel.isfixed = true;
        var theBP = this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate);
        if(theBP){
            theBP.ctlID = placeHolderKernel.id;
        }
        theBP = this.getRowBtnHandlerBP(AttrNames.Event.OnDelete);
        if(theBP){
            theBP.ctlID = placeHolderKernel.id;
        }

        //this.autoSetCusDataSource();
        var listFormContentValue = this.getAttribute(AttrNames.ListFormContent);
        if(listFormContentValue == null){
            listFormContentValue = new ListFormContent(this);
            this.setAttribute(AttrNames.ListFormContent, listFormContentValue);
        }

        var bottomDivID = this.getAttribute('bottomDivID');
        var gridFormBottomDiv = this.children.find(child=>{
            return child.id == bottomDivID;
        });
        this.gridFormBottomDiv = gridFormBottomDiv;
        if(gridFormBottomDiv == null){
            if(this.project.loaded){
                this.projectLoadedHanlder();
            }
            else{
                this.project.on('loaded', this.projectLoadedHanlder);
            }
        }
        else{
            gridFormBottomDiv.isfixed = true;
        }

        var nowft = this.getAttribute(AttrNames.FormType);
        this[AttrNames.ListFormContent + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.PageBreak + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.RowPerPage + '_visible'] = nowft == EFormType.Grid && this.getAttribute(AttrNames.PageBreak);
        this[AttrNames.WidthType + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.AutoIndexColumn + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.GenNavBar + '_visible'] = nowft != EFormType.Grid;
        this[AttrNames.SelectMode + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.HideTabHead + '_visible'] = nowft == EFormType.Grid;

        this['操作设置_visible'] = nowft == EFormType.Grid;
        
        var self = this;
        autoBind(self);
    }

    aidAccessableKernels(targetType, rlt_arr) {
        var needFilt = targetType != null;
        this.children.forEach(child => {
            if (!needFilt || child.type == targetType) {
                rlt_arr.push(child);
            }
            if (child.editor && (!needFilt || child.editor.type == targetType)) {
                rlt_arr.push(child.editor);
            }
            if (child.type == M_ContainerKernel_Type || child.type == Accordion_Type || (child.type == M_FormKernel_Type && !child.isGridForm())){
                // 穿透div
                child.aidAccessableKernels(targetType, rlt_arr);
            }
        });
    }

    isKernelInRow(theKernel){
        return this.isGridForm() && !theKernel.hadAncestor(this.gridFormBottomDiv);
    }

    getRowLabeledControls(){
        var rlt = [];
        this.children.forEach(child=>{
            if(child == this.gridFormBottomDiv)
            return;
            if(child.type == M_LabeledControlKernel_Type){
                rlt.push(child);
            }
            else if(child.type == M_ContainerKernel_Type){
                child.aidAccessableKernels(M_LabeledControlKernel_Type, rlt);
            }
        });
        return rlt;
    }

    projectLoadedHanlder(){
        var gridFormBottomDiv = new M_ContainerKernel({},this);
        this.gridFormBottomDiv = gridFormBottomDiv;
        gridFormBottomDiv.name = this.id + '底部';
        gridFormBottomDiv.growAttrArray(AttrNames.LayoutNames.StyleAttr);
        gridFormBottomDiv.growAttrArray(AttrNames.LayoutNames.StyleAttr);
        gridFormBottomDiv.setAttribute(AttrNames.LayoutNames.StyleAttr,{name:AttrNames.StyleAttrNames.FlexGrow,value:false},0);
        gridFormBottomDiv.setAttribute(AttrNames.LayoutNames.StyleAttr,{name:AttrNames.StyleAttrNames.FlexShrink,value:false},1);
        this.setAttribute('bottomDivID', gridFormBottomDiv.id);
        gridFormBottomDiv.isfixed = true;
    }

    scriptCreated(attrName, scriptBP){
        if(scriptBP.group == EJsBluePrintFunGroup.GridRowBtnHandler){
            scriptBP.ctlID = this.placeHolderKernel.id;
        }
    }

    getRowBtnHandlerBP(name){
        var funName = this.id + '_' + name;
        return this.project.scriptMaster.getBPByName(funName);
    }

    hadRowBtnHandler(){
        return this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate) != null || this.getRowBtnHandlerBP(AttrNames.Event.OnDelete) != null;
    }

    getInsertSetting(){
        if(!this.isGridForm()){
            return null;
        }
        var btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnInsert);
        if(btnBP != null){
            return {key:'insert', blueprint:btnBP, funName:'submitInsert', actLabel:'新增'};
        }
        return null;
    }

    getRowBtnSetting(){
        var rlt = [];
        var btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnUpdate);
        if(btnBP != null){
            rlt.push({key:'edit', blueprint:btnBP, elemText:"<i className='fa fa-edit' />", funName:AttrNames.Event.OnUpdate, actLabel:'修改'});
        }
        btnBP = this.getRowBtnHandlerBP(AttrNames.Event.OnDelete);
        if(btnBP != null){
            rlt.push({key:'delete', blueprint:btnBP, elemText:"<i className='fa fa-trash text-danger' />", funName:AttrNames.Event.OnDelete, actLabel:'删除'});
        }
        return rlt;
    }

    canAppand(){
        return this.getAttribute(AttrNames.FormType) == EFormType.Page;
    }

    getCanUseDataSource(){
        return this.project.dataMaster.getAllEntities();
    }

    isGridForm(){
        return this.getAttribute(AttrNames.FormType) == EFormType.Grid;
    }

    isPageForm(){
        return this.getAttribute(AttrNames.FormType) == EFormType.Page;
    }

    autoSetCusDataSource(mustSelectColumns_arr){
        if(mustSelectColumns_arr == null){
            mustSelectColumns_arr = [];
        }
        var useDS = this.getAttribute(AttrNames.DataSource);
        if(useDS && useDS.loaded == false){
            // ds 元数据还未加载
            return;
        }
        var cusDS_bp = this.getAttribute(AttrNames.CustomDataSource);
        var theLinks = cusDS_bp.linkPool.getLinksBySocket(cusDS_bp.finalSelectNode.inSocket);
        var dsnode = null;
        var theLink = null;
        if(theLinks.length == 1){
            theLink = theLinks[0];
            if(theLink.outSocket.node.type == SQLNODE_DBENTITY){
                dsnode = theLink.outSocket.node;
            }
        }
        if(theLinks.length == 0 || dsnode == null){
            if(dsnode == null){
                dsnode = new SqlNode_DBEntity({}, cusDS_bp);   
                dsnode.left = cusDS_bp.finalSelectNode.left - 300;
            }
            cusDS_bp.linkPool.addLink(dsnode.outSocket, cusDS_bp.finalSelectNode.inSocket);
        }
        dsnode.setEntity(useDS);
        if(useDS == null){
            return;
        }
        var retColumnNode = cusDS_bp.finalSelectNode.columnNode;
        var needRemoveSockets_arr = [];
        var needRemoveNodes_arr = [];
        var hadColumns_arr = [];
        retColumnNode.inputScokets_arr.forEach(socket=>{
            var alias = socket.getExtra('alias');
            if(!IsEmptyString(alias)){
                hadColumns_arr.push(alias);
                return;
            }
            var links = cusDS_bp.linkPool.getLinksBySocket(socket);
            if(links.length == 0){
                needRemoveSockets_arr.push(socket);
                return;
            }
            var link = links[0];
            if(link.outSocket.node.type != SQLNODE_COLUMN){
                return;
            }
            var columnName = link.outSocket.node.columnName;
            if(mustSelectColumns_arr.indexOf(columnName) == -1){
                needRemoveSockets_arr.push(socket);
                needRemoveNodes_arr.push(link.outSocket.node);
            }
            else{
                hadColumns_arr.push(link.outSocket.node.columnName);
            }
        });

        needRemoveSockets_arr.forEach(socket=>{
            retColumnNode.removeSocket(socket);
        });

        cusDS_bp.deleteNodes(needRemoveNodes_arr);
        
        mustSelectColumns_arr.forEach(colName=>{
            if(hadColumns_arr.indexOf(colName) == -1){
                var colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);   
                colNode.left = retColumnNode.left - 400;
                var newSocket = retColumnNode.genInSocket();
                retColumnNode.addSocket(newSocket);
                cusDS_bp.linkPool.addLink(colNode.outSocket, newSocket);
                colNode.setFromObj({
                    tableCode:useDS.code,
                    tableAlias:null,
                    tableName:useDS.name,
                    columnName:colName,
                });
            };
        });
        cusDS_bp.genColumns();
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        switch(attrItem.name){
            case AttrNames.DataSource:
                this.autoSetCusDataSource();
                break;
            case AttrNames.FormType:
                var isGridForm = newValue == EFormType.Grid;
                this.findAttributeByName(AttrNames.ListFormContent).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.PageBreak).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, isGridForm && this.getAttribute(AttrNames.PageBreak));
                this.findAttributeByName(AttrNames.WidthType).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.AutoIndexColumn).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.GenNavBar).setVisible(this, !isGridForm);
                this.findAttributeByName(AttrNames.SelectMode).setVisible(this, isGridForm);
                this.findAttributeByName(AttrNames.HideTabHead).setVisible(this, isGridForm);
                
                this.findAttrGroupByName('操作设置').setVisible(this, isGridForm);
                break;
            case AttrNames.PageBreak:
                this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, newValue);
                break;
            case AttrNames.Event.OnUpdate:
                console.log('Names.Event.OnUpd');
                break;
        }
    }

    getCanuseColumns(){
        return getDSAttrCanuseColumns.call(this,AttrNames.DataSource,AttrNames.CustomDataSource);
    }
    
    renderSelf(clickHandler, replaceChildClick){
        return (<M_Form key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

class M_Form extends React.PureComponent {
    constructor(props){
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this,LayoutAttrNames_arr.concat([AttrNames.Orientation,AttrNames.Chidlren,AttrNames.FormType,AttrNames.WidthType,AttrNames.AutoIndexColumn,AttrNames.Title,AttrNames.SelectMode], inintState));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;
        inintState.formType = ctlKernel.getAttribute(AttrNames.FormType);
        inintState.widthType = ctlKernel.getAttribute(AttrNames.WidthType);
        inintState.autoIndexColumn = ctlKernel.getAttribute(AttrNames.AutoIndexColumn);
        inintState.title = ctlKernel.getAttribute(AttrNames.Title);
        inintState.selectMode = ctlKernel.getAttribute(AttrNames.SelectMode);

        this.state = inintState;
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        var childrenVal = this.state.children;
        var ctlKernel = this.props.ctlKernel;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = ctlKernel.children.concat();
        }
        this.setState({
            orientation:ctlKernel.getAttribute(AttrNames.Orientation),
            children: childrenVal,
            formType:ctlKernel.getAttribute(AttrNames.FormType),
            widthType:ctlKernel.getAttribute(AttrNames.WidthType),
            autoIndexColumn:ctlKernel.getAttribute(AttrNames.AutoIndexColumn),
            title:ctlKernel.getAttribute(AttrNames.Title),
            selectMode:ctlKernel.getAttribute(AttrNames.SelectMode),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        var rootStyle = layoutConfig.style;

        var childClickHandlerParam = this.props.replaceChildClick ? this.props.onClick : null;

        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            layoutConfig.addClass('M_Form_Empty');
            return (<div className={layoutConfig.getClassName()} style={rootStyle} ref={this.rootElemRef}></div>);
        }
        layoutConfig.addClass('M_Form');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        if(this.state.orientation == Orientation_V){
            layoutConfig.addClass('flex-column');
        }
        if(this.props.ctlKernel.children.length ==0){
            layoutConfig.addClass('M_Form_Empty');
        }
        if(this.state.formType == EFormType.Grid){
            //var labelControls_arr = this.props.ctlKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
            var widthType = this.state.widthType;
            var autoIndexColumn = this.state.autoIndexColumn;
            var selectMode = this.state.selectMode;
            var tableStyle = {};
            var sumTableWidth = 0;
            if(autoIndexColumn){
                sumTableWidth += 3;
            }
            if(selectMode != ESelectMode.None){
                sumTableWidth += 2;
            }

            var tableElem =(
                <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                    <span className='text-light bg-dark'>{this.state.title}</span>
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
                                    {this.props.ctlKernel.children.map(childKernel=>{
                                        if(childKernel.type == M_LabeledControlKernel_Type){
                                            var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                                            var textFieldParseRet = parseObj_CtlPropJsBind(childKernel.getAttribute(AttrNames.TextField));
                                            var textValue = '';
                                            if(textFieldParseRet.isScript){
                                                textValue = '{脚本}';
                                            }
                                            else{
                                                textValue = textFieldParseRet.string;
                                            }
                                            if(columnWidth == 0){
                                                columnWidth = textValue.length * GridHead_PerCharWidth;
                                                if(columnWidth == 0){
                                                    columnWidth = 4 * GridHead_PerCharWidth;
                                                }
                                            }
                                            if(widthType == EGridWidthType.Fixed){
                                                sumTableWidth += columnWidth;
                                            }
                                            return (<th  key={childKernel.id} scope="col" style={{width:columnWidth + 'em'}}>
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
                    {ctlKernel.gridFormBottomDiv && ctlKernel.gridFormBottomDiv.renderSelf(childClickHandlerParam, this.props.replaceChildClick)}
                </div>
            );
            if(widthType == EGridWidthType.Fixed){
                tableStyle.width = sumTableWidth + 'em';
            }
            return tableElem;
        }

        return(
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
            {this.renderHandleBar()}
                <span className='text-light bg-dark'>{this.state.title}</span>
                {
                    this.props.ctlKernel.children.length == 0 ? 
                        this.props.ctlKernel.id :
                        this.props.ctlKernel.children.map(childKernel=>{
                            if(childKernel == ctlKernel.gridFormBottomDiv){
                                return null;
                            }
                            return childKernel.renderSelf(childClickHandlerParam, this.props.replaceChildClick);
                        })
                }
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : 'Form',
        type : M_FormKernel_Type,
        namePrefix : M_FormKernel_Prefix,
        kernelClass:M_FormKernel,
        reactClass:M_Form,
    }, '布局');

    
    class ListFormContent extends EventEmitter
    {
        constructor(kernel) {
            super();
            EnhanceEventEmiter(this);
            this.formKernel = kernel;
            this.selectColumns_map = {};
        }
    
        createControl(){
            var newCtl = new M_LabeledControlKernel({}, this.formKernel, null, null);
            return newCtl;
        }
    
        getJson(){
            return {};
        }
    }