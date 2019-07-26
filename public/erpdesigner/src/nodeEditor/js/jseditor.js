const JSNodeEditorControls_arr =[
    {
        label:'常量',
        nodeClass:JSNode_ConstValue,
        type:'基础'
    },
    {
        label:'布尔常量',
        nodeClass:JSNode_BooleanValue,
        type:'基础'
    },
    {
        label:'环境变量',
        nodeClass:JSNode_Env_Var,
        type:'基础'
    },
    {
        label:'Return',
        nodeClass:JSNode_Return,
        type:'流控制'
    },
    {
        label:'CallOnFetchEnd',
        nodeClass:JSNode_CallOnFetchEnd,
        type:'流控制'
    },
    {
        label:'IF',
        nodeClass:JSNode_IF,
        type:'流控制'
    },
    {
        label:'逻辑运算',
        nodeClass:JSNode_Logical_Operator,
        type:'数学'
    },
    {
        label:'四则运算',
        nodeClass:JSNode_NOperand,
        type:'数学'
    },
    {
        label:'比较',
        nodeClass:JSNode_Compare,
        type:'数学'
    },
    {
        label:'Switch',
        nodeClass:JSNode_Switch,
        type:'流控制'
    },
    {
        label:'Break',
        nodeClass:JSNode_Break,
        type:'流控制'
    },
    {
        label:'Sequence',
        nodeClass:JSNode_Sequence,
        type:'流控制'
    },
    {
        label:'批量设置控件属性',
        nodeClass:JSNode_Batch_Control_Api_Propsetter,
        type:'控件交互'
    },
    {
        label:'Insert',
        nodeClass:JSNODE_Insert_table,
        type:'数据库交互'
    },
    {
        label:'Update',
        nodeClass:JSNODE_Update_table,
        type:'数据库交互'
    },
    {
        label:'Delete',
        nodeClass:JSNODE_Delete_Table,
        type:'数据库交互'
    },
    {
        label:'执行存储过程',
        nodeClass:JSNode_Excute_Pro,
        type:'数据库交互'
    },
    {
        label:'日期函数',
        nodeClass:JSNode_DateFun,
        type:'运算'
    },
    {
        label:'查询SQL',
        nodeClass:JSNode_Query_Sql,
        type:'数据库交互'
    },
    {
        label:'执行流程步骤',
        nodeClass:JSNode_Do_FlowStep,
        type:'数据库交互'
    },
    {
        label:'数组-长度',
        nodeClass:JSNode_Array_Length,
        type:'操纵数组'
    },
    {
        label:'字符串-长度',
        nodeClass:JSNode_String_Length,
        type:'操纵字符串'
    },
    {
        label:'字符串-substring',
        nodeClass:JSNode_String_Substring,
        type:'操纵字符串'
    },
    {
        label:'字符串-Substr',
        nodeClass:JSNode_String_Substr,
        type:'操纵字符串'
    },
    {
        label:'字符串-IndexOf',
        nodeClass:JSNode_String_IndexOf,
        type:'操纵字符串'
    },
    {
        label:'ParseInt',
        nodeClass:JSNode_ParseInt,
        type:'转换'
    },
    {
        label:'ParseFloat',
        nodeClass:JSNode_ParseFloat,
        type:'转换'
    },
    {
        label:'IsNaN',
        nodeClass:JSNode_IsNaN,
        type:'转换'
    },
    {
        label:'Get页面入口参数',
        nodeClass:JSNode_GetPageEntryParam,
        type:'窗体控制'
    },
    {
        label:'GetURL步骤数据',
        nodeClass:JSNode_GetStepData,
        type:'窗体控制'
    },
    {
        label:'创建自订错误',
        nodeClass:JSNode_Create_Cuserror,
        type:'错误控制'
    },
    {
        label:'刷新表单',
        nodeClass:JSNode_FreshForm,
        type:'表单控制'
    },
    {
        label:'跳转页面',
        nodeClass:JSNode_JumpPage,
        type:'窗体控制'
    },
    {
        label:'弹出页面',
        nodeClass:JSNode_PopPage,
        type:'窗体控制'
    },
    {
        label:'关闭页面',
        nodeClass:JSNode_ClosePage,
        type:'窗体控制'
    },
    {
        label:'弹出消息窗',
        nodeClass:JSNode_PopMessageBox,
        type:'消息窗控制'
    },
    {
        label:'关闭消息窗',
        nodeClass:JSNode_CloseMessageBox,
        type:'消息窗控制'
    },
    {
        label:'隐藏消息窗',
        nodeClass:JSNode_HideMessageBox,
        type:'消息窗控制'
    },
];

var gCopyed_JsNodes_data=null;


const EApiType={
    Prop:'prop',
    Fun:'fun',
    PropSetter:'propsetter',
};

function gCreateControlApiItem(apiType, apiName){

}

const g_controlApi_arr = [];

function gFindPropApiItem(ctltype, attrName){
    var rlt = null;
    var ctlApi = g_controlApi_arr.find(item=>{return item.ctltype == ctltype;});
    if(ctlApi != null){
        rlt = ctlApi.propapi_arr.find(item=>{return item.attrItem.name == attrName;});
    }
    return rlt;
}


class JSNode_CompileHelper extends SqlNode_CompileHelper{
    constructor(logManager,editor,scope){
        super(logManager,editor);

        this.scope = scope == null ? new JSFile_Scope() : scope;
        this.clickLogBadgeItemHandler = this.clickLogBadgeItemHandler.bind(this);
        this.useForm_map = {};
        this.useGlobalControls_map = {};
        this.appendedOutputItems_arr = [];
        this.clientInitBundleBlocks_arr = [];
        this.useEnvVars = {};
        this.usePage_map = {};
        this.useUrlVar_map = {};
    }

    compileEnd(){
        this.clientInitBundleBlocks_arr.forEach(block=>{
            for(var si in block.params_map){
                block.pushLine(si + ':' + block.params_map[si] + ',');
            }
        });
    }

    addUseEnvVars(varKey){
        this.useEnvVars[varKey] = 1;
    }

    appendOutputItem(item){
        this.appendedOutputItems_arr.push(item);
    }

    addInitClientBundleBlock(block){
        if(this.clientInitBundleBlocks_arr.indexOf(block) == -1){
            if(block.params_map == null){
                block.params_map = {};
            }
            this.clientInitBundleBlocks_arr.push(block);
        }
    }

    addUseColumn(formKernel, columnName, serverFun, rowSource){
        if(rowSource == null){
            console.error('rowSource == null');
            return;
        }
        var formObj = this.addUseForm(formKernel, rowSource);
        formObj.useNowRecord = true;
        if(formObj.useColumns_map[columnName] == null){
            formObj.useColumns_map[columnName] = {
                serverFuns_arr:[],
            };
        }
        if(serverFun){
            var useColumnObj = formObj.useColumns_map[columnName];
            if(useColumnObj.serverFuns_arr.indexOf(serverFun) == -1){
                useColumnObj.serverFuns_arr.push(serverFun);
            }
        }
    }

    addUseForm(formKernel, rowSource){
        if(rowSource == null){
            console.error('rowSource == null');
            return;
        }
        var rlt = this.useForm_map[formKernel.id];
        if(rlt == null){
            rlt = {
                useColumns_map:{},
                useControls_map:{},
                useNowRecord:false,
                useSelectedRow:false,
                formKernel:formKernel,
            };
            this.useForm_map[formKernel.id] = rlt;
        }
        switch(rowSource){
            case EFormRowSource.Context:
            rlt.useContextRow = true;
            break;
            case EFormRowSource.Selected:
            rlt.useSelectedRow = true;
            break;
        }
        return rlt;
    }

    createUserKernelData(ctrKernel){
        return {
            kernel:ctrKernel,
            useprops_map:{},
            useevents_map:{},
        };
    }

    addUseControlPropApi(ctrKernel, apiitem, rowSource){
        var rlt = null;
        var belongFormKernel = ctrKernel.searchParentKernel(M_FormKernel_Type,true);
        var attrName = IsEmptyString(apiitem.useAttrName) ? apiitem.attrItem.name : apiitem.useAttrName;
        if(belongFormKernel == null){
            rlt = this.useGlobalControls_map[ctrKernel.id];
            if(rlt == null){
                rlt = this.createUserKernelData(ctrKernel);
                this.useGlobalControls_map[ctrKernel.id] = rlt;
            }
            rlt.useprops_map[attrName] = apiitem;
            return;
        }
        else{
            if(!belongFormKernel.isKernelInRow(ctrKernel)){
                rowSource = EFormRowSource.None;
            }
            var formObj = this.addUseForm(belongFormKernel, rowSource);
            rlt = formObj.useControls_map[ctrKernel.id];
            if(rlt == null){
                rlt = this.createUserKernelData(ctrKernel);
                formObj.useControls_map[ctrKernel.id] = rlt;
            }
        }
        rlt.useprops_map[attrName] = apiitem;
    }

    addUseControlEventApi(ctrKernel, apiitem, rowSource){
        var rlt = null;
        var belongFormKernel = ctrKernel.searchParentKernel(M_FormKernel_Type,true);
        var funName = apiitem.name;
        if(belongFormKernel == null){
            rlt = this.useGlobalControls_map[ctrKernel.id];
            if(rlt == null){
                rlt = this.createUserKernelData(ctrKernel);
                this.useGlobalControls_map[ctrKernel.id] = rlt;
            }
            rlt.useevents_map[funName] = apiitem;
            return;
        }
        else{
            if(!belongFormKernel.isKernelInRow(ctrKernel)){
                rowSource = EFormRowSource.None;
            }
            var formObj = this.addUseForm(belongFormKernel, rowSource);
            rlt = formObj.useControls_map[ctrKernel.id];
            if(rlt == null){
                rlt = this.createUserKernelData(ctrKernel);
                formObj.useControls_map[ctrKernel.id] = rlt;
            }
        }
        rlt.useevents_map[funName] = apiitem;
    }

    addUsePageEnryParam(pageid, paramName, defVal){
        if(this.usePage_map[pageid] == null){
            this.usePage_map[pageid] = {};
        }
        var params_arr = this.usePage_map[pageid].params_arr;
        if(params_arr == null){
            params_arr = [];
            this.usePage_map[pageid].params_arr = params_arr;
        }
        if(params_arr.find(x=>{return x.name == paramName;}) == null){
            params_arr.push({
                name:paramName,
                defVal:defVal,
            });
        }
    }

    addUseURLVairable(varName, defVal){
        this.useUrlVar_map[varName] = defVal;
    }
}

class JSNodeEditorLeftPanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    listenNode(node){
        if(node){
            node.on('changed', this.editingNodeChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('changed', this.editingNodeChangedhandler);
        }
    }

    componentWillMount(){
        //listenNode(this.state.editingNode);
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    editingNodeChangedhandler(){
        this.setState({
            magicObj:{},
        });
    }

    clickOutlineImteHandler(nodeData, ev){
        this.props.editor.showNodeData(nodeData, ev.ctrlKey);
    }

    render() {
        if(this.listenedNode != this.props.editingNode){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode);
        }
        var nowBlueprint = null;
        if(this.props.editingNode){
            nowBlueprint = this.props.editingNode;
        }
        return (
            <SplitPanel 
                fixedOne={true}
                maxSize={200}
                defPercent={0.3}
                flexColumn={true}
                panel1={
                    <div className='w-100 h-100 autoScroll d-flex flex-column'>
                        {
                            this.props.editingNode.nodes_arr.map(nodeData=>{
                                return <SqlNodeOutlineItem key={nodeData.id} nodeData={nodeData} clickHandler={this.clickOutlineImteHandler} />
                            })
                        }
                    </div>
                }
                panel2={
                    <div className='d-flex flex-column h-100 w-100'>
                        <JSNodeEditorVariables editingNode={this.props.editingNode} editor={this.props.editor} />
                        <JSNodeEditorCanUseNodePanel bluePrint={nowBlueprint} onMouseDown={this.props.onMouseDown} editor={this.props.editor} />
                    </div>
                }
            />
        );
    }
}

class JSNodeEditorCanUseNodePanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
        this.state = {
            canUseDS_arr:[],
            canAccessKernel_arr:[],
            showCanUseDS:true,
            showCtlApi:false,
            showCanAccessCtl:false,
        };
        var self = this;
    }

    scanBlueprint(bluePrint){
        this.scanedBP = bluePrint;
        if(bluePrint == null){
            return;
        }
        var scriptMaster = bluePrint.master;
        var project = scriptMaster.project;
        var logManager = this.props.editor.logManager;
        logManager.clear();
        var canUseDS_arr = [];
        var canAccessKernel_arr = [];
        if(bluePrint.group == EJsBluePrintFunGroup.CtlAttr || bluePrint.group == EJsBluePrintFunGroup.CtlEvent || bluePrint.group == EJsBluePrintFunGroup.CtlFun || bluePrint.group == EJsBluePrintFunGroup.CtlValid || bluePrint.group == EJsBluePrintFunGroup.GridRowBtnHandler){
            // 控件类型,获取上下文
            var ctlKernel = project.getControlById(bluePrint.ctlID);
            if(bluePrint.ctlID == null || ctlKernel == null){
                logManager.error('本蓝图没有找到相应的控件[' + bluePrint.ctlID + ']');
                return;
            }
            // 获取可用的数据源
            var parentForms_arr = ctlKernel.getAccessableKernels(M_FormKernel_Type);
            // 还可以使用兄弟form节点
            if(parentForms_arr != null){
                parentForms_arr.forEach(formKernel=>{
                    var useDS = formKernel.getAttribute(AttrNames.DataSource);
                    var isGridForm = formKernel.getAttribute(AttrNames.FormType) == EFormType.Grid;
                    if(useDS != null){
                        canUseDS_arr.push(
                            {
                                entity:useDS,
                                label:formKernel.getReadableName() + '当前行',
                                formID:formKernel.id,
                                key:formKernel.id + '_currentrow',
                                rowfrom:EFormRowSource.Context,
                            }
                        );
                        if(isGridForm){
                            canUseDS_arr.push(
                                {
                                    entity:useDS,
                                    label:formKernel.getReadableName() + '选中行',
                                    formID:formKernel.id,
                                    key:formKernel.id + '_selectedrow',
                                    rowfrom:EFormRowSource.Selected,
                                }
                            );
                        }
                    }
                });
            }

            canAccessKernel_arr = ctlKernel.getAccessableKernels();
        }
        //console.log(canUseDS_arr);
        this.setState({
            canUseDS_arr:canUseDS_arr,
            canAccessKernel_arr:canAccessKernel_arr,
        });
    }

    mouseDownHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var ctlItem = JSNodeEditorControls_arr.find(item=>{return item.label == itemValue});
        if(ctlItem){
            this.props.onMouseDown(ctlItem);
        }
    }

    mouseDownCanUseDSHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var rowfrom = getAttributeByNode(ev.target, 'data-rowfrom');
        if(rowfrom == null)
            return;
        var theDSItem = this.state.canUseDS_arr.find(e=>{return e.formID == itemValue && e.rowfrom == rowfrom});
        if(theDSItem){
            this.props.editor.createCanUseDS(theDSItem);
        }
    }

    mouseDownCanAccessCtlHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        this.props.editor.createCtrlKernel(itemValue);
    }

    clickCanUseDSHeader(ev){
        this.setState({showCanUseDS:!this.state.showCanUseDS});
    }

    clickAccessCtlHeader(ev){
        this.setState({showCanAccessCtl:!this.state.showCanAccessCtl});
    }

    clickCtlApuHeader(ev){
        this.setState({showCtlApi:!this.state.showCtlApi});
    }

    clickControlAPIHandler(ev){
        var ctltype = getAttributeByNode(ev.target, 'data-ctltype');
        if(ctltype == null)
            return;
        var apiid = getAttributeByNode(ev.target, 'data-apiid');
        if(apiid == null)
            return;
        var theApiObj = g_controlApi_arr.find(e=>{return e.ctltype == ctltype;});
        var apiItem = theApiObj.getApiItemByid(apiid);
        this.props.editor.createApiObj(theApiObj,apiItem);
    }

    render() {
        if(this.props.bluePrint != this.scanedBP){
            if(this.scanTimeout == null){
                var self = this;
                setTimeout(() => {
                    self.scanBlueprint(self.props.bluePrint);
                    self.scanTimeout = null;
                }, 10);
            }
            return null;
        }
        var canUseDS_arr = this.state.canUseDS_arr;
        var canAccessKernel_arr = this.state.canAccessKernel_arr;
        var targetID = this.props.bluePrint.code + 'canUseNode';
        var showCanUseDS = this.state.showCanUseDS;
        var showCanAccessCtl = this.state.showCanAccessCtl;
        var showCtlApi = this.state.showCtlApi;
        return (
            <React.Fragment>
                <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}>可用节点</button>
                <div id={targetID} className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        {
                            canUseDS_arr.length > 0 &&
                            <React.Fragment>
                                <div className='d-flex flex-shrink-0'>
                                    <span onClick={this.clickCanUseDSHeader} className='btn btn-info flex-grow-1 flex-shrink-1'>作用域数据{showCanUseDS ? '-' : '+'}</span>
                                </div>
                                {showCanUseDS &&
                                <div className='btn-group-vertical mw-100 flex-shrink-0'>
                                    {canUseDS_arr.map(item=>{
                                        return (<button key={item.key} onMouseDown={this.mouseDownCanUseDSHandler} data-value={item.formID} data-rowfrom={item.rowfrom} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.label}</button>);
                                    })}
                                </div>}
                            </React.Fragment>
                        }
                        {
                            canAccessKernel_arr.length > 0 &&
                            <React.Fragment>
                                <div className='d-flex flex-shrink-0'>
                                    <span onClick={this.clickAccessCtlHeader} className='btn btn-info flex-grow-1 flex-shrink-1'>作用域控件{showCanAccessCtl ? '-' : '+'}</span>
                                </div>
                                {showCanAccessCtl &&
                                <div className='btn-group-vertical mw-100 flex-shrink-0'>
                                    {canAccessKernel_arr.map(item=>{
                                        return (<button key={item.id} onMouseDown={this.mouseDownCanAccessCtlHandler} data-value={item.id} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.getReadableName()}</button>);
                                    })}
                                </div>}
                            </React.Fragment>
                        }
                        <div className='btn-group-vertical mw-100 flex-shrink-0'>
                            <span className='btn btn-info' onClick={this.clickCtlApuHeader}>控件接口{showCtlApi ? '-' : '+'}</span>
                            {showCtlApi &&
                                g_controlApi_arr.map(
                                    ctlApi=>{
                                        var rlt = [];
                                        ctlApi.allapi_arr.forEach((apiItem,index)=>{
                                            rlt.push(<button key={apiItem.uniqueID} onMouseDown={this.clickControlAPIHandler} data-ctltype={ctlApi.ctltype} data-apiid={apiItem.id} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{apiItem.toString()}</button>);
                                        });
                                        return rlt;
                                    }
                                )
                            }
                        </div>
                        <div className='btn-group-vertical mw-100 flex-shrink-0'>
                            <span className='btn btn-info'>节点</span>
                            {
                                JSNodeEditorControls_arr.map(
                                    item=>{
                                        return <button key={item.label} onMouseDown={this.mouseDownHandler} data-value={item.label} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.label}</button>
                                    }
                                )
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class JSNodeEditorVariables extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    clickAddHandler(ev){
        this.props.editingNode.bluePrint.createEmptyVariable();
    }

    varChangedhandler(){
        this.setState({
            magicobj:{}
        });
    }

    listenNode(node){
        if(node){
            node.on('varChanged', this.varChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('varChanged', this.varChangedhandler);
        }
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    render() {
        if(this.listenedNode != this.props.editingNode.bluePrint){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode.bluePrint);
        }
        var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
        var targetID = blueprintPrefix + 'variables';
        return (
            <React.Fragment>
                <div className='flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center'>
                    <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}> 变量</button>
                    <i className='fa fa-plus fa-lg text-light cursor-pointer' onClick={this.clickAddHandler} style={{width:'30px'}} />
                </div>
                <div id={targetID} className="list-group flex-grow-0 flex-shrink-0 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        <div className='btn-group-vertical mw-100'>
                            {
                                this.props.editingNode.bluePrint.vars_arr.map(varData=>{
                                    return <JSDef_Variable_Component belongNode={this.props.editingNode} key={blueprintPrefix + varData.id} varData={varData} editor={this.props.editor} />
                                })
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class C_JSNode_Editor extends React.PureComponent{
    constructor(props){
        super(props);

        this.state={
            draing:false,
            editingNode:this.props.bluePrint,
            showLink:false,
            scale:1,
        }

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            });
        }, 50);

        autoBind(this);
        this.dragingPathRef = React.createRef();
        this.editorDivRef = React.createRef();
        this.containerRef = React.createRef();
        this.topBarRef = React.createRef();
        this.zoomDivRef = React.createRef();
        this.selectRectRef = React.createRef();
        this.logManager = new LogManager('jsnodeEditorLogManager');

        this.selectedNFManager=new SelectItemManager(this.cb_addNF, this.cb_removeNF);
    }

    reDraw(){
        this.setState({
            magicObj:{},
        });
    }

    blueprinkChanged(ev){
        this.reDraw();
    }

    cb_removeNF(target){
        if(target && !target.unmounted){
            target.setSelected(false);
        }
    }

    cb_addNF(target){
        if(target && !target.unmounted){
            target.setSelected(true);
        }
    }

    setSelectedNF(target, addMode){
        if(target == null){
            this.selectedNFManager.clear();
            return;
        }
        if(this.selectedNFManager.isSelected(target)){
            return;
        }
        if(addMode == null || target == null){
            addMode = false;
        }
        if(!addMode){
            this.selectedNFManager.clear();
        }
        this.selectedNFManager.add(target);
    }

    showNodeData(nodeData, autoSelect){
        var editingNode = this.state.editingNode;
        if(nodeData.bluePrint == null || nodeData.bluePrint != editingNode.bluePrint || nodeData.parent == null)
            return;

        if(editingNode != nodeData.parent){
            this.setEditeNode(nodeData.parent);
            var self = this;
            setTimeout(() => {
                self.showNodeData(nodeData, autoSelect);
            }, 50);
            return;
        }
        
        if(nodeData.currentComponent){
            var frameElem = nodeData.currentComponent.frameRef.current;
            if(frameElem == null)
                return null;
            if(autoSelect != false){
                this.setSelectedNF(frameElem);
            }
            var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
            var zoomRect = this.zoomDivRef.current.getBoundingClientRect();
            
            if(!MyMath.intersectRect(frameRect, zoomRect)){
                var targetPos = {
                    x:Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                    y:Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5),
                };
                //console.log(targetPos);
                this.editorDivRef.current.style.left = targetPos.x  + 'px';
                this.editorDivRef.current.style.top = targetPos.y + 'px';
            }
        }
    }

    keyUpHandler(ev){
        if(this.zoomDivRef.current == null){
            return;
        }
        var editorRect = this.zoomDivRef.current.getBoundingClientRect();
        if(!MyMath.isPointInRect(editorRect, WindowMouse)){
            return;
        }
        var editorPos = this.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});
        //console.log(ev);
        switch(ev.keyCode){
            case 27:
                // esc
                if(!this.selectedNFManager.isEmpty()){
                    this.setSelectedNF(null);
                }
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
            break;
            case 46:
                if(!this.selectedNFManager.isEmpty()){
                    var titles = '';
                    var nodes_arr = [];
                    this.selectedNFManager.forEach(nf=>{
                        titles += nf.getNodeTitle(true) + ';';
                        nodes_arr.push(nf.props.nodedata);
                    });
                    this.wantDeleteNode(nodes_arr, titles);
                }
            break;
            case 67:
                if(ev.ctrlKey){
                    var wantCopyNodes_arr = [];
                    if(!this.selectedNFManager.isEmpty()){
                        this.selectedNFManager.forEach(nf=>{
                            wantCopyNodes_arr.push(nf.props.nodedata);
                        });
                        gCopyed_JsNodes_data = this.props.bluePrint.copyNodes(wantCopyNodes_arr);
                        this.logManager.clear();
                        this.logManager.log('复制了' + gCopyed_JsNodes_data.nodeJson_arr.length + '个节点');
                    }
                }
                break;
            case 86:
                if(ev.ctrlKey){
                    var newNodes_arr = this.props.bluePrint.pasteNodes(gCopyed_JsNodes_data, {x:editorPos.x,y:editorPos.y}, this.state.editingNode);
                    this.logManager.clear();
                    this.logManager.log('克隆了' + (newNodes_arr == null ? 0 : newNodes_arr.length) + '个节点');
                }
                break;
        }
    }

    keyDownHandler(ev){
        if(!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40){
            var offset = {x:0,y:0};
            switch(ev.keyCode){
                case 40:
                    offset.y = 10;
                break;
                case 38:
                    offset.y = -10;
                break;
                case 37:
                    offset.x = -10;
                break;
                case 39:
                    offset.x = 10;
                break;
            }
            this.selectedNFManager.forEach(nf=>{
                nf.addOffset(offset);
            });
            ev.preventDefault();
        }
    }

    nodeFrameStartMove(srcNF){
        if(this.selectedNFManager.count()>1){
            var srcPos = {x:srcNF.props.nodedata.left,y:srcNF.props.nodedata.top};
            this.selectedNFManager.forEach(nf=>{
                if(nf == srcNF){
                    return;
                }
                nf.offsetBase = {x:nf.props.nodedata.left - srcPos.x,y:nf.props.nodedata.top - srcPos.y};
            });
        }
    }

    nodeFrameMoving(srcNF){
        if(this.selectedNFManager.count()>1){
            var srcPos = {x:srcNF.props.nodedata.left,y:srcNF.props.nodedata.top};
            this.selectedNFManager.forEach(nf=>{
                if(nf == srcNF){
                    return;
                }
                var theNode = nf.props.nodedata;
                var offsetBase = nf.offsetBase;
                theNode.setPos(srcPos.x + offsetBase.x, srcPos.y + offsetBase.y);
                nf.reDraw();
            });
        }
    }

    wantDeleteNode(nodeData_arr, title){
        gTipWindow.popAlert(makeAlertData('警告','确定删除' + nodeData_arr.length + '个节点:"' + title + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo], nodeData_arr));
    }

    deleteTipCallback(key, nodeData_arr){
        if(key == 'ok'){
            this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
            this.setSelectedNF(null);
        }
    }

    freshZoomDiv(){
        if(this.zoomDivRef.current){
            var zoomDivElem = this.zoomDivRef.current;
            var $containerElem = $(this.containerRef.current);
            var $topBarElem = $(this.topBarRef.current);

            var newZoomDivSize = {
                height : $containerElem.height() - $topBarElem.height(),
                width : $containerElem.width(),
                top : $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
            };

            if(this.preZoomDivSize == null){
                zoomDivElem.style.height = newZoomDivSize.height + 'px';
                zoomDivElem.style.width = newZoomDivSize.width + 'px';
                zoomDivElem.style.top = newZoomDivSize.top + 'px';
            }
            else{
                if(Math.abs(this.preZoomDivSize.height - newZoomDivSize.height)>1){
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                }
                if(Math.abs(this.preZoomDivSize.width - newZoomDivSize.width)>1){
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                }
                if(Math.abs(this.preZoomDivSize.top - newZoomDivSize.top)>1){
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                }
            }

            this.preZoomDivSize = newZoomDivSize;
        }
    }

    listenBlueprint(bp){
        if(bp){
            bp.on('changed', this.blueprinkChanged);
        };
        this.listenedBP = bp;
    }

    unlistenBlueprint(bp){
        if(bp){
            bp.off('changed', this.blueprinkChanged);
        }
    }

    componentWillMount(){
        window.addEventListener('keyup', this.keyUpHandler);
        window.addEventListener('keydown', this.keyDownHandler);

        this.freshInt = setInterval(this.freshZoomDiv, 500);
        this.freshZoomDiv();

        if(this.state.editingNode){
            var theNode = this.state.editingNode;
            setTimeout(() => {
                this.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                this.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
            }, 50);
        }
    }

    componentWillUnmount(){
        window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
        window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('keydown', this.keyDownHandler);
        this.unlistenBlueprint(this.props.bluePrint);
        clearTimeout(this.delaySetTO);
        clearInterval(this.freshZoomDiv);
    }

    mousemoveWidthDragingHandler(ev){
        var rootRect = this.editorDivRef.current.getBoundingClientRect();
        var end = {x:ev.x - rootRect.left, y:ev.y - rootRect.top};
        var dragingPath = this.dragingPathRef.current;
        dragingPath.setState({
            end:end
        });
    }

    mouseupWidthDragingHandler(ev){
        if(ev.target == this.editorDivRef.current){
            if(this.preClickTime != null && (Date.now() - this.preClickTime) < 200){
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
            else{
                this.preClickTime = Date.now();
                return;
            }
        }
    }

    clickSocket(srcSocket){
        var srcNode = srcSocket.node;
        var dragingPath = this.dragingPathRef.current;
        if(dragingPath.state.draging == true){
            var cancelDrag = false;
            if(srcSocket == dragingPath.state.startScoket){
                // 同一个socket连续点击
                cancelDrag = true;
            }
            else if(dragingPath.state.startNode == srcNode){
                // 相同的node 忽略
                //console.log('相同的node');
                return;
            }
            else if(srcSocket.isFlowSocket != dragingPath.state.startScoket.isFlowSocket){
                return;
            }
            else{
                // 点击了不同的socket
                if(srcSocket.isIn != dragingPath.state.startScoket.isIn){
                    // 不同node的in out才能相互链接
                    this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                    cancelDrag = true;
                }
            }
            if(cancelDrag)
            {
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }else{
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            dragingPath.setState({
                draging:true,
                start:srcSocket.currentComponent.getCenterPos(),
                end:{x:WindowMouse.x - rootRect.left,y:WindowMouse.y - rootRect.top},
                startScoket:srcSocket,
                startNode:srcNode,
            });
            window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
        }
    }

    setEditeNode(theNode){
        if(theNode == this.state.editingNode){
            return;
        }
        
        var editingNode = this.state.editingNode;
        if(editingNode){
            editingNode.editorLeft = parseUnitInt(this.editorDivRef.current.style.left);
            editingNode.editorTop = parseUnitInt(this.editorDivRef.current.style.top);
            editingNode.postEditing(this);
        }
        
        this.setState({
            draging:false,
            editingNode:theNode,
            scale:1,
            showLink:false,
        });

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            })
        }, 50);

        if(theNode){
            theNode.preEditing(this);
            theNode.bluePrint.editingNode = theNode;
            setTimeout(() => {
                this.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                this.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
            }, 50);
        }
    }

    genJSNode_Component(CName, nodeData){
        var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
        return <CName key={blueprintPrefix + nodeData.id} nodedata={nodeData} editorDivRef={this.editorDivRef} editor={this} />
    }

    renderNode(nodeData){
        if(nodeData == null)
            return null;
        var settting = JSNodeClassMap[nodeData.type];
        if(settting == null){
            console.warn(nodeData.type + ' 节点类型找不到映射');
            return null;
        }
        return this.genJSNode_Component(settting.comClass, nodeData);
    }

    transToEditorPos(pt){
        var $zoomDivElem = $(this.zoomDivRef.current);
        var zoomOffset = $zoomDivElem.offset();

        var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
        var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
        return{
            x:x,
            y:y
        }
    }

    addVarGSNode(config, windPos){
        var editingNode = this.state.editingNode;
        var editorPos = this.transToEditorPos(windPos);
        var newNodeData = null;
        if(config.isGet){
            newNodeData = new JSNode_Var_Get({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        else{
            newNodeData = new JSNode_Var_Set({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        this.setState({
            magicObj:{},
        });
    }

    createNewNode(nodeClass, initData){
        var editorDiv = this.editorDivRef.current;
        var editingNode = this.state.editingNode;
        var newNode = new nodeClass(
            Object.assign({
                newborn:true,
                left:-parseUnitInt(editorDiv.style.left),
                top:-parseUnitInt(editorDiv.style.top),
            }, initData),
            editingNode
        );

        this.setState({
            magicObj:{},
        });
        return newNode;
    }

    createCanUseDS(dsconfig){
        this.createNewNode(JSNode_CurrentDataRow,{
            formID:dsconfig.formID,
            dscode:dsconfig.entity.code,
            dsentity:dsconfig.entity,
            rowSource:dsconfig.rowfrom,
        });
    }

    createCtrlKernel(ctlID){
        this.createNewNode(JSNODE_CtlKernel,{
            ctlID:ctlID,
        });
    }

    createApiObj(apiClass, apiItem){
        switch(apiItem.type){
            case EApiType.Prop:
            this.createNewNode(JSNode_Control_Api_Prop,{
                apiClass:apiClass,
                apiItem:apiItem,
            });
            break;
            case EApiType.PropSetter:
            this.createNewNode(JSNode_Control_Api_PropSetter,{
                apiClass:apiClass,
                apiItem:apiItem,
            });
            break;
            case EApiType.Fun:
            this.createNewNode(JSNode_Control_Api_CallFun,{
                apiClass:apiClass,
                funItem:apiItem,
            });
            break;
        }
    }

    mouseDownNodeCtlrHandler(ctlData){
        var editorDiv = this.editorDivRef.current;
        var editingNode = this.state.editingNode;
        var newNodeData = new ctlData.nodeClass({newborn:true,left:-parseUnitInt(editorDiv.style.left),top:-parseUnitInt(editorDiv.style.top)},editingNode);
        this.setState({
            magicObj:{},
        });
    }

    mousemoveWithDragHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        //var scrollNode = this.editorDivRef.current.parentNode;
        //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
        //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
        //console.log(offset);
        var editingNode = this.state.editingNode;
        editingNode.editorLeft = this.dragOrgin.left + offset.x;
        editingNode.editorTop = this.dragOrgin.top + offset.y;
        this.editorDivRef.current.style.left = editingNode.editorLeft  + 'px';
        this.editorDivRef.current.style.top = editingNode.editorTop + 'px';
    }

    mouseupWithDragHandler(ev){
        this.draging = false;
        window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
        window.removeEventListener('mouseup', this.mouseupWithDragHandler);
    }

    mousemoveWithSelectHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        this.selectRectRef.current.setSize({
            width:offset.x,
            height:offset.y
        });
    }

    mouseupWithSelectHandler(ev){
        // check
        var theRect = this.selectRectRef.current.getRect();
        var hitNodes_arr = [];
        this.state.editingNode.nodes_arr.forEach(node=>{
            var nodeRect = node.getRect();
            if(MyMath.intersectRect(nodeRect, theRect)){
                hitNodes_arr.push(node);
            }
        });
        if(!ev.ctrlKey){
            this.selectedNFManager.clear();
        }
        if(hitNodes_arr.length > 0){
            for(var i in hitNodes_arr){
                this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
            }
        }

        window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
        window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
        this.selectRectRef.current.setSize({
            width:0,
            height:0
        });
    }

    rootMouseDownHandler(ev){
        if(ev.target == this.zoomDivRef.current && this.draging != true){
            var nowPos = {
                x:parseUnitInt(this.editorDivRef.current.style.left),
                y:parseUnitInt(this.editorDivRef.current.style.top),
            }
            var editorPos = this.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y, left:nowPos.x, top: nowPos.y};
            if(ev.shiftKey){
                if(!this.selectedNFManager.isEmpty()){
                    var rightMostPos = {x:null,y:null};
                    this.selectedNFManager.forEach(nf=>{
                        var nfRect = nf.rootDivRef.current.getBoundingClientRect();
                        var nfRightTop = {x:nf.props.nodedata.left + nfRect.width,y:nf.props.nodedata.top};
                        if(rightMostPos.x == null || nfRightTop.x > rightMostPos.x){
                            rightMostPos.x = nfRightTop.x;
                        }
                        if(rightMostPos.y == null || nfRightTop.y > rightMostPos.y){
                            rightMostPos.y = nfRightTop.y;
                        }
                    });
                    this.selectedNFManager.forEach(nf=>{
                        nf.addOffset({x:editorPos.x - rightMostPos.x,y:editorPos.y - rightMostPos.y});
                    });
                    return;
                }
            }
            if(ev.button == 0){
                // 拉取选择范围
                this.selectRectRef.current.setSize({
                    left:editorPos.x,
                    top:editorPos.y
                });
                window.addEventListener('mousemove', this.mousemoveWithSelectHandler);
                window.addEventListener('mouseup', this.mouseupWithSelectHandler);
                return;
            }
            this.draging = true;
            //var scrollNode = this.editorDivRef.current.parentNode;
            //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
            window.addEventListener('mousemove', this.mousemoveWithDragHandler);
            window.addEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }

    mouseWhileHandler(ev){
        console.log(ev);
    }

    

    clickBigBtnHandler(ev){
        var newScale = Math.min(this.state.scale + 0.1,1);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickSmallBtnHandler(ev){
        var newScale = Math.max(this.state.scale - 0.1,0.3);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickNavBtnHandler(ev){
        var nodeId = getAttributeByNode(ev.target, 'data-id');
        if(nodeId == null)
            return;
        var theNode = this.props.bluePrint.getNodeByID(nodeId);
        if(theNode == this.state.editingNode){
            return;
        }
        this.setEditeNode(theNode);
    }

    clickCompileBtnHandler(ev){
        var theBluePrint = this.props.bluePrint;
        this.logManager.clear();
        this.logManager.log("开始编译[" + theBluePrint.name + ']');
        var compileHelper = new JSNode_CompileHelper(this.logManager, this);
        var compileRet = theBluePrint.compile(compileHelper);
        if(compileRet == false){
            this.logManager.log('[' + theBluePrint.name + ']编译失败');
        }
        else{
            this.logManager.log('[' + theBluePrint.name + ']编译成功');
            this.logManager.log(compileRet.getString('', '\t', '\n'));
            console.log(compileRet.getString('', '\t', '\n'));
            compileHelper.appendedOutputItems_arr.forEach(item=>{
                console.log(item.getString('', '\t', '\n'));
            });
        }
        this.logManager.log('共' + this.logManager.getCount(LogTag_Warning) + '条警告,' + this.logManager.getCount(LogTag_Error) + '条错误,');
    }

    clickExportBtnHandler(ev){
        console.log("Start export");
        var editingNode = this.state.editingNode;
        var json = editingNode.bluePrint.getJson(new AttrJsonProfile());
        var text = JSON.stringify(json);
        console.log(text);
    }

    render(){
        var editingNode = this.state.editingNode;
        var self = this;
        if(editingNode == null && this.props.bluePrint == null){
            return null;
        }
        if(editingNode == null || this.props.bluePrint != editingNode.bluePrint){
            this.selectedNFManager.clear(false);
            clearTimeout(this.delaySetTO);
            this.delaySetTO = setTimeout(() => {
                self.setEditeNode(self.props.bluePrint == null ? null : (self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint)); 
                self.delaySetTO = null;
            }, 10);
        }
        if(editingNode == null){
            return null;
        }
        var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
        nodeParentList.push(editingNode);
        if(this.editorDivRef.current){
            this.editorDivRef.current.scale = this.state.scale;
        }
        var self = this;
        var blueprintPrefix = editingNode.bluePrint.id + '_';
        if(this.listenedBP != editingNode.bluePrint){
            this.unlistenBlueprint(this.listenedBP);
            this.listenBlueprint(editingNode.bluePrint);
        }
        var linkPool = editingNode.bluePrint.linkPool;

        return (<SplitPanel
                defPercent={0.2}
                maxSize='400px'
                barClass='bg-secondary'
                panel1={
                    <JSNodeEditorLeftPanel onMouseDown={this.mouseDownNodeCtlrHandler} editingNode={editingNode} editorDivRef={this.editorDivRef} editor={self} />
                }
                panel2={
                    <SplitPanel
                    defPercent={0.8}
                    barClass='bg-secondary'
                    flexColumn={true}
                    panel1={
                        <div className='flex-grow-1 flex-shrink-1 d-flex flex-column' ref={this.containerRef}>
                            <div className='flex-grow-0 flex-shrink-0 border bg-light ' style={{height:'40px'}} ref={this.topBarRef}>
                                <div className='d-flex flex-grow-1 flex-shrink-1'>
                                    <ul className="nav nav-pills flex-grow-1 flex-shrink-1">
                                        {
                                            nodeParentList.map(nodeData=>{
                                                return (<li className="nav-item" key={nodeData.id}> 
                                                            <a className={"nav-link" + (nodeData == editingNode ? ' active' : '')} href="#" data-id={nodeData.id} onClick={this.clickNavBtnHandler}>
                                                                {nodeData.getNodeTitle()}
                                                                {nodeData != editingNode && <i className='fa fa-angle-right ml-1' />}
                                                            </a>
                                                        </li>)
                                            })
                                        }
                                    </ul>
                                    <div className='btn-group flex-grow-0 flex-shrink-0'>
                                        <button type='button' onClick={this.clickCompileBtnHandler} className='btn btn-dark' >编译</button>
                                        <button type='button' onClick={this.clickExportBtnHandler} className='btn btn-dark' >导出</button>
                                        <button type='button' onClick={this.clickBigBtnHandler} className='btn btn-dark' ><i className='fa fa-search-plus' /></button>
                                        <button type='button' onClick={this.clickSmallBtnHandler} className='btn btn-dark' ><i className='fa fa-search-minus' /></button>
                                    </div>
                                </div>
                            </div>
                            <div className='flex-grow-1 flex-shrink-1 position-absolute hidenOverflow' style={{zoom:this.state.scale}} ref={this.zoomDivRef} onMouseDown={this.rootMouseDownHandler} >
                                <div ref={this.editorDivRef} className='d-block position-absolute bg-dark' style={{width:'10px',height:'10px',overflow:'visible'}}>
                                    {
                                        editingNode.nodes_arr.map(nd=>{
                                            return this.renderNode(nd) //<G_Node key={nd.id} data={nd} />
                                        })
                                    }
                                    <C_Node_Link ref={this.dragingPathRef} editorDivRef={this.editorDivRef} />
                                    {
                                        this.state.showLink && linkPool.getAllLink().map((linkobj=>{
                                            return <C_Node_Link key={blueprintPrefix + linkobj.id} link={linkobj} editorDivRef={this.editorDivRef} />
                                        }))
                                    }
                                    <C_SelectRect ref={this.selectRectRef}/>
                                </div>
                            </div>
                        </div>
                    }
                    panel2={
                        <div className='bg-dark m-100 h-100 flex-grow-1 flex-shrink-1'>
                            <LogOutputPanel source={this.logManager} />
                        </div>
                    }
                    />
                }
                />);
    }
}

class JsNodeOutlineItem extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);

        this.state = {
            label:this.props.nodeData.getNodeTitle(true),
            nodeData:this.props.nodeData,
        }
    }

    listenNode(target){
        target.on('changed', this.nodeChangedhandler);
    }

    unlistenNode(target){
        target.off('changed', this.nodeChangedhandler);
    }

    componentWillMount(){
        this.listenNode(this.state.nodeData);
    }

    componentWillUnmount(){
        this.unlistenNode(this.state.nodeData);
    }

    nodeChangedhandler(){
        this.setState({
            label:this.state.nodeData.getNodeTitle(),
        });
    }

    clickHandler(e){
        this.props.clickHandler(this.state.nodeData, ev);
    }

    render(){
        if(this.state.nodeData != this.props.nodeData){
            this.unlistenNode(this.state.nodeData);
            this.listenNode(this.props.nodeData);
            var self = this;
            var newNodeData = this.props.nodeData;
            setTimeout(() => {
                self.setState({
                    nodeData:newNodeData,
                    label:newNodeData.getNodeTitle(true),
                });
            }, 20);
            return null;
        }
        return <div className='text-nowrap text-light cursor-pointer'  onClick={this.clickHandler}>{this.state.label}</div>
    }
}

class JSDef_Variable_Component extends React.PureComponent{
    constructor(props){
        super(props);
        var varData = this.props.varData;
        this.state = {
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            default:varData.default,
            editing:varData.needEdit == true,
        };

        autoBind(this);
    }

    varChanged(){
        if(this.state.editing){
            return;
        }
        var varData = this.props.varData;
        this.setState({
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            editing:varData.editing,
            default:varData.default,
        });
    }

    componentWillMount(){
        this.props.varData.on('changed', this.varChanged);
    }

    componentWillUnmount(){
        this.props.varData.off('changed', this.varChanged);
    }

    nameInputChangeHanlder(ev){
        this.setState({
            name:ev.target.value,
        });
    }

    valTypeChangedHandler(newData){
        this.setState({
            valType:newData,
        });
    }

    isParamChangedHandler(newCode){
        this.setState({
            isParam:newCode,
        });
    }

    defaultInputChangedHandler(ev){
        this.setState({
            default:ev.target.value,
        });
    }

    clickEditBtnHandler(){
        if(this.state.editing){
            var tval = Object.assign({},this.state);
            tval.editing = false;
            this.props.varData.setProp(tval);
        }
        this.setState({
            editing:!this.state.editing,
        });
    }

    clickTrashHandler(){
        gTipWindow.popAlert(makeAlertData('警告','确定删除变量:"' + this.state.name + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo]));
    }

    deleteTipCallback(key){
        if(key == 'ok'){
            this.props.varData.bluePrint.removeVariable(this.props.varData);
        }
    }

    labelMouseDownHandler(ev) {
        this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
        window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
    }

    labelWindowMouseUpHandler(ev) {
        if (this.dragTimeOut) {
            clearTimeout(this.dragTimeOut);
        }
    }

    genDragContentFun(){
        var varData = this.props.varData;
        return (<span className='text-nowrap border bg-dark text-light'>{'变量:' + varData.name}</span>)
    }

    dragTimeOutHandler() {
        var designer = this.props.varData.bluePrint.master.project.designer;
        designer.startDrag({info:'放置变量'}, this.dragEndHandler, this.genDragContentFun);
    }

    dragMenuCallBack(menuItem, pos){
        var varData = this.props.varData;
        if(menuItem.key == 'SET'){
            this.props.editor.addVarGSNode({isGet:false, varName:varData.name}, pos)
        }
        else if(menuItem.key == 'GET'){
            //console.log('get');
            this.props.editor.addVarGSNode({isGet:true, varName:varData.name}, pos)
        }
    }

    dragEndHandler(pos){
        var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
        if(MyMath.isPointInRect(editorRect, pos)){
            var designer = this.props.varData.bluePrint.master.project.designer;
            var varData = this.props.varData;
            //this.dragMenuCallBack(new QuickMenuItem('Get ' + varData.name, 'GET'), pos);
            designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'),new QuickMenuItem('Get ' + varData.name, 'GET')]
                ,pos
                ,this.dragMenuCallBack
            );
        }
    }

    render() {
        var varData = this.props.varData;
        var editing = this.state.editing;
        if(!editing){
            return(
                <div className='d-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo'>
                    {varData.isfixed != true && <i className={'fa fa-edit fa-lg'} onClick={this.clickEditBtnHandler} />}
                    <div className='flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem'
                         onMouseDown={this.labelMouseDownHandler}>
                        {varData.name}
                        {varData.isParam ? (<span className='m-1 badge badge-info' >{varData.isfixed ? '固定参数' : '参数'}</span>) : null}
                        <span className='m-1 badge badge-secondary' >{varData.valType}</span>
                    </div>
                    {varData.isfixed != true && <i className={'fa fa-trash fa-lg'} onClick={this.clickTrashHandler} />}
                </div>
            );
        }
        return(
        <div className='d-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary'>
            <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center'>
                <i className={'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info')} onClick={this.clickEditBtnHandler} />
                <input onChange={this.nameInputChangeHanlder} type='text' value={this.state.name} className='flexinput flex-grow-1 flex-shrink-1' />
                <span className='text-light flex-shrink-0'>默认值</span>
                <input onChange={this.defaultInputChangedHandler} type='text' value={this.state.default} className='flexinput flex-grow-1 flex-shrink-1' />
            </div>
            <DropDownControl itemChanged={this.valTypeChangedHandler} btnclass='btn-dark' options_arr={JsValueTypes} textAttrName='name' valueAttrName='code' value={this.state.valType} /> 
                <DropDownControl itemChanged={this.isParamChangedHandler} btnclass='btn-dark' options_arr={ISParam_Options_arr} textAttrName='name' valueAttrName='code' value={this.state.isParam} /> 
        </div>);
    }
}