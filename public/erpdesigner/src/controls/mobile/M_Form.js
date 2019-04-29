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
        new CAttribute('自动滚动条', AttrNames.AutoHeight, ValueType.Boolean, false),
    ]),
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

        var cusDsName = this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = this.project.dataMaster.getSqlBPByName(cusDsName);
        if(cusDS_bp == null){
            cusDS_bp = this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = this.id;
        cusDS_bp.ctlKernel = this;
        cusDS_bp.group = 'ctlcus';
        this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);
        //this.autoSetCusDataSource();
        var listFormContentValue = this.getAttribute(AttrNames.ListFormContent);
        if(listFormContentValue == null){
            listFormContentValue = new ListFormContent(this);
            this.setAttribute(AttrNames.ListFormContent, listFormContentValue);
        }

        var nowft = this.getAttribute(AttrNames.FormType);
        this[AttrNames.ListFormContent + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.PageBreak + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.RowPerPage + '_visible'] = nowft == EFormType.Grid && this.getAttribute(AttrNames.PageBreak);
        this[AttrNames.WidthType + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.AutoIndexColumn + '_visible'] = nowft == EFormType.Grid;
        this[AttrNames.GenNavBar + '_visible'] = nowft != EFormType.Grid;
        
        var self = this;
        autoBind(self);
    }

    canAppand(){
        return this.getAttribute(AttrNames.FormType) == EFormType.Page;
    }

    getCanUseDataSource(){
        return this.project.dataMaster.getAllEntities();
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
                
                break;
            case AttrNames.PageBreak:
                this.findAttributeByName(AttrNames.RowPerPage).setVisible(this, newValue);
                break;
        }
    }

    getCanuseColumns(){
        return getDSAttrCanuseColumns.call(this,AttrNames.DataSource,AttrNames.CustomDataSource);
    }
    
    renderSelf(clickHandler){
        return (<M_Form key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}

class M_Form extends React.PureComponent {
    constructor(props){
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this,LayoutAttrNames_arr.concat([AttrNames.Orientation,AttrNames.Chidlren,AttrNames.FormType,AttrNames.WidthType,AttrNames.AutoIndexColumn], inintState));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;
        inintState.formType = ctlKernel.getAttribute(AttrNames.FormType);
        inintState.widthType = ctlKernel.getAttribute(AttrNames.WidthType);
        inintState.autoIndexColumn = ctlKernel.getAttribute(AttrNames.AutoIndexColumn);

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
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        var rootStyle = layoutConfig.style;

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
            var tableStyle = {};
            var sumTableWidth = 0;
            if(autoIndexColumn){
                sumTableWidth += 3;
            }

            var tableElem =(
                <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    <div className='mw-100 autoScroll'>
                        <table className='table' style={tableStyle}>
                        <thead className="thead-dark">
                            <tr>
                            {
                                this.props.ctlKernel.children.length == 0 ? 
                                    <th scope="col">空</th> :
                                    <React.Fragment>
                                    {!autoIndexColumn ? null : <th scope='col' className='indexTableHeader' >序号</th>}
                                    {this.props.ctlKernel.children.map(childKernel=>{
                                        if(childKernel.type == M_LabeledControlKernel_Type){
                                            var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                                            if(columnWidth == 0){
                                                var textValue = childKernel.getAttribute(AttrNames.TextField);
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
                                                    {childKernel.getAttribute(AttrNames.TextField)}
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
                </div>
            );
            if(widthType == EGridWidthType.Fixed){
                tableStyle.width = sumTableWidth + 'em';
            }
            return tableElem;
        }

        return(
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    this.props.ctlKernel.children.length == 0 ? 
                        this.props.ctlKernel.id :
                        this.props.ctlKernel.children.map(childKernel=>{
                            return childKernel.renderSelf();
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