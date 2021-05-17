const M_PageKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('标题', AttrNames.Title, ValueType.String, '未命名页面'),
        new CAttribute('主页面', AttrNames.IsMain, ValueType.Boolean, false),
        new CAttribute('隐藏页头', AttrNames.HideTitle, ValueType.Boolean, false),
        new CAttribute('隐藏标题', 'blanktitle', ValueType.Boolean, false),
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr),
        new CAttribute('有滚动条', AttrNames.HadScroll, ValueType.Boolean, true),
        new CAttribute('弹出式页面', AttrNames.PopablePage, ValueType.Boolean, false),
        new CAttribute('强制全屏', 'forcefullscreen', ValueType.Boolean, false),
        new CAttribute('有关闭按钮', AttrNames.AutoCloseBtn, ValueType.Boolean, true),
        new CAttribute('有主页按钮', AttrNames.AutoHomeBtn, ValueType.Boolean, true),
        new CAttribute('关联步骤', AttrNames.RelFlowStep, ValueType.Int, null, true, true, gFlowMaster.getAllSteps, {text:'fullName', value:'code'}),
        new CAttribute('属性列表', AttrNames.ParamApi, ValueType.String, '', true, true),
        new CAttribute('权限组', AttrNames.PermissionGroup, ValueType.Int, null, true, true, [], {text:'name', value:'code',pullDataFun:GetCanUsePermissionGroup}),
    ]),
    new CAttributeGroup('接口设置',[
        new CAttribute('入口参数', AttrNames.EntryParam, ValueType.String, '', true, true),
        new CAttribute('出口参数', AttrNames.ExportParam, ValueType.String, '', true, true),
    ]),
    new CAttributeGroup('事件',[
        new CAttribute('OnLoad', AttrNames.Event.OnLoad, ValueType.Event),
        new CAttribute('点击关闭', AttrNames.Event.OnClickCloseBtn, ValueType.Event),
        new CAttribute('消息处理', AttrNames.Event.OnReceiveMsg, ValueType.Event),
    ]),
    new CAttributeGroup('自订方法', [
        new CAttribute('自订方法', AttrNames.FunctionApi, ValueType.CustomFunction, '', true, true),
    ]),
],false);

class M_PageKernel extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_PageKernel_Type,
            '页面',
            M_PageKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        this.hadReactClass = true;
        var self = this;
        autoBind(self);

        var funName = this.id + '_' + AttrNames.Event.OnLoad;
        var theBP = this.project.scriptMaster.getBPByName(funName);
        if(theBP){
            theBP.ctlID = this.id;
        }
        this.getAttrArrayList(AttrNames.FunctionApi).forEach(funAtrr=>{
            theBP = this.project.scriptMaster.getBPByName(this.id + '_' + funAtrr.name);
            this.scriptCreated(null, theBP);
        });
    }

    getUseFlowSteps(){
        var rlt = [];
        this.getAttrArrayList(AttrNames.RelFlowStep).forEach(attr => {
            var flowStepCode = this[attr.name];
            var theStep = gFlowMaster.findStepByCode(flowStepCode);
            if (theStep && rlt.indexOf(theStep) == -1) {
                rlt.push(theStep);
            }
        });
        return rlt;
    }

    get_name(){
        return this.id;
    }

    set_title(newTitle) {
        if (newTitle.length > 10) {
            newTitle = newTitle.substring(0, 10);
        }

        var flag = this.__setAttribute(AttrNames.Title, newTitle);
        if (flag) {
            this.attrChanged(AttrNames.Title);
        }
        return flag;
    }

    set_ismain(val) {
        var flag = this.__setAttribute(AttrNames.IsMain, val);
        if (flag) {
            if (val) {
                var project = this.project;
                project.mainPageChanged(this);
            }
            this.attrChanged(AttrNames.IsMain);
        }
        return flag;
    }

    getAllEntryParams(){
        var rlt_arr = [];
        this.getAttrArrayList(AttrNames.EntryParam).forEach(attr=>{
            var val = this.getAttribute(attr.name);
            if(!IsEmptyString(val)){
                rlt_arr.push({value:val,name:attr.name});
            }
        });
        return rlt_arr;
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP == null){
            return;
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnReceiveMsg) != -1){
            scriptBP.setFixParam(['msgtype','data']);
        }
        if(scriptBP.name.indexOf(AttrNames.FunctionApi) != -1){
            scriptBP.startIsInReducer = false; 
        }
    }

    getFunctionApiAttrArray() {
        var attrValue;
        var rlt_arr = [];
        var funApis_arr = this.getAttrArrayList(AttrNames.FunctionApi);
        funApis_arr.forEach(attr=>{
            attrValue = this.getAttribute(attr.name);
            if(IsEmptyString(attrValue)){
                return;
            }
            rlt_arr.push({
                label: attrValue,
                name: attr.name,
                fullname: this.id + '_' + attr.name,
            });
        });

        return rlt_arr;
    }

    getParamApiAttrArray() {
        var attrValue;
        var rlt_arr = [];
        var paramApis_arr = this.getAttrArrayList(AttrNames.ParamApi);
        paramApis_arr.forEach(attr=>{
            attrValue = this.getAttribute(attr.name);
            if(IsEmptyString(attrValue)){
                return;
            }
            rlt_arr.push({
                label: attrValue,
                name: attr.name,
            });
        });

        return rlt_arr;
    }
}

var Page_api = new ControlAPIClass(M_PageKernel_Type);
g_controlApi_arr.push(Page_api);
Page_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.ParamApi, M_PageKernelAttrsSetting), AttrNames.ParamApi, false));
Page_api.pushApi(new ApiItem_propsetter('属性接口'));

class M_Page extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
            ctlKernel: this.props.ctlKernel,
            children: this.props.ctlKernel.children,
            orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
            popablePage: this.props.ctlKernel.getAttribute(AttrNames.PopablePage),
            autoCloseBtn: this.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn),
        };

        autoBind(this);
        M_ControlBase(this, [AttrNames.Title,
        AttrNames.Chidlren,
        AttrNames.Orientation,
        AttrNames.PopablePage,
        AttrNames.AutoCloseBtn,
        AttrNames.LayoutNames.APDClass,
        ]);
        M_ContainerBase(this);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        var childrenVal = this.state.children;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = this.props.ctlKernel.children.concat();
        }
        //console.log(changedAttrName);
        this.setState({
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
            children: childrenVal,
            orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
            popablePage: this.props.ctlKernel.getAttribute(AttrNames.PopablePage),
            autoCloseBtn: this.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn),
        });
    }

    renderPCPage() {
        return null;
    }

    renderMobilePage(ctlKernel) {
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-0');
        if (this.state.orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('bg-light');
        //icon-more-vertical
        return (
            <React.Fragment>
                <div className="d-flex flex-grow-0 flex-shrink-0 text-light bg-primary align-items-baseline">
                    <div className="ml-1" href="#"><h5 className='icon icon-left-nav'></h5></div>
                    <div className="flex-grow-1 flex-shrink-1 justify-content-center d-flex" ><h3>{this.state.title}</h3></div>
                    <div className="ml-1" href="#">
                        {this.state.popablePage && this.state.autoCloseBtn && 
                            <button className='btn btn-sm btn-danger'><i className='icon icon-close' /></button>
                        }
                    </div>
                </div>
                <div className={layoutConfig.getClassName()} ref={this.rootElemRef}>
                    {
                        this.state.children.map(childData => {
                            return childData.renderSelf(null, null, this.props.designer)
                        })
                    }
                </div>
            </React.Fragment>
        )
    }

    render() {
        if (this.props.ctlKernel != this.state.ctlKernel) {
            var self = this;
            this.unlistenTarget(this.state.ctlKernel);
            this.listenTarget(this.props.ctlKernel);
            setTimeout(() => {
                self.setState({
                    title: this.props.ctlKernel.getAttribute('title'),
                    ctlKernel: this.props.ctlKernel,
                    children: this.props.ctlKernel.children,
                    orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
                    popablePage: this.props.ctlKernel.getAttribute(AttrNames.PopablePage),
                    autoCloseBtn: this.props.ctlKernel.getAttribute(AttrNames.AutoCloseBtn),
                });
            }, 1);
            return null;
        }
        if (this.propsisPC) {
            return this.renderPCPage(this.props.ctlKernel);
        }
        else {
            return this.renderMobilePage(this.props.ctlKernel);
        }
    }
}

DesignerConfig.registerControl(
    {
        label: '页面',
        type: 'M_Page',
        invisible: true,
        kernelClass: M_PageKernel,
        controlClass: M_Page,
    }, '布局');