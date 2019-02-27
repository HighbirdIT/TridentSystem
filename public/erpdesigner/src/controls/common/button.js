const ButtonKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, null, {text:'name', value:'code'}),
        new CAttribute('外观类', AttrNames.ButtonClass, ValueType.String, 'btn-primary', true, false, ButtonClasses_arr),
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
        
        this.findAttributeByName(AttrNames.ProcessTable).options_arr = g_dataBase.getAllTable;
        var self = this;
        autoBind(self);
    }

    renderSelf(){
        return (<CButton key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }

    getLayoutConfig(){
        var rlt = super.getLayoutConfig();
        rlt.addClass('btn');
        rlt.addClass(this.getAttribute(AttrNames.ButtonClass));
        return rlt;
    }
}

class CButton extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            label:this.props.ctlKernel.getAttribute(AttrNames.Name),
            btnClass:this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.Name,
            AttrNames.ButtonClass,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            label:this.props.ctlKernel.getAttribute(AttrNames.Name),
            btnClass:this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
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
        var showText = IsEmptyString(this.state.label) ? '[未命名]' : this.state.label;
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