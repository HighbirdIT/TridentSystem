const EmptyKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
    ]),
], true, false);


class EmptyKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                EmptyKernel_Type,
                'Empty',
                EmptyKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        autoBind(self);
    }

    renderSelf(){
        return null;
    }

    getLayoutConfig(){
        return {};
    }
}

class CEmpty extends React.PureComponent {
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
        invisible : true,
        label : '占位对象',
        type : EmptyKernel_Type,
        namePrefix : EmptyKernel_Prefix,
        kernelClass:EmptyKernel,
        reactClass:CEmpty,
        canbeLabeled:false,
    }, '基础');