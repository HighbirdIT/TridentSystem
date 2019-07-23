const ButtonKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, null, {text:'name', value:'code'}),
        new CAttribute('外观类', AttrNames.ButtonClass, ValueType.String, 'btn-primary', true, false, ButtonClasses_arr),
        genIsdisplayAttribute(),
        new CAttribute('适用种类', AttrNames.ButtonVisibleType, ValueType.String, EButtonVisibleType.Default, true, false, ButtonVisibleTypes_arr),
        new CAttribute('隐藏名称', AttrNames.HideLabel, ValueType.Boolean, false),
    ]),
    new CAttributeGroup('事件',[
        new CAttribute('OnClick', AttrNames.Event.OnClick, ValueType.Event),
    ]),
]);


class ButtonKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                ButtonKernel_Type,
                '按钮',
                ButtonKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        
        var funName = this.id + '_' + AttrNames.Event.OnClick;
        var eventBP = this.project.scriptMaster.getBPByName(funName);
        if(eventBP){
            eventBP.ctlID = this.id;
        }
        this.findAttributeByName(AttrNames.ProcessTable).options_arr = g_dataBase.getAllTable;
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler){
        return (<CButton key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    getLayoutConfig(){
        var rlt = super.getLayoutConfig();
        rlt.addClass('btn');
        rlt.addClass(this.getAttribute(AttrNames.ButtonClass));
        return rlt;
    }

    getWantInsertTables(){
        var funName = this.id + '_' + AttrNames.Event.OnClick;
        var eventBP = this.project.scriptMaster.getBPByName(funName);
        var rlt = null;
        if(eventBP){
            var processTableNodes_arr = eventBP.getNodesByTypes([JSNODE_INSERT_TABLE,JSNODE_UPDATE_TABLE], true);
            processTableNodes_arr.forEach(node=>{
                if(!IsEmptyString(node.dsCode)){
                    if(rlt == null){
                        rlt = [node.dsCode];
                    }
                    else{
                        rlt.push(node.dsCode);
                    }
                }
            });
        }
        return rlt;
    }
}
var M_Button_api = new ControlAPIClass(ButtonKernel_Type);
M_Button_api.pushApi(new ApiItem_fun({
    label:'点击',
    name:AttrNames.Event.OnClick
}));
g_controlApi_arr.push(M_Button_api);

class CButton extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            label:this.props.ctlKernel.getAttribute(AttrNames.Name),
            btnClass:this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
            hidelabel:this.props.ctlKernel.getAttribute(AttrNames.HideLabel),
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.Name,
            AttrNames.ButtonClass,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
            AttrNames.HideLabel,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            label:this.props.ctlKernel.getAttribute(AttrNames.Name),
            btnClass:this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
            hidelabel:this.props.ctlKernel.getAttribute(AttrNames.HideLabel),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>按钮</div>);
        }
        
        layoutConfig.addClass('hb-control');
        var showText = this.state.hidelabel ? '' : (IsEmptyString(this.state.label) ? '[未命名]' : this.state.label);
        return(
            <button type='button' className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    showText
                }
            </button>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : '按钮',
        type : ButtonKernel_Type,
        namePrefix : ButtonKernel_Prefix,
        kernelClass:ButtonKernel,
        reactClass:CButton,
        canbeLabeled:true,
    }, '基础');