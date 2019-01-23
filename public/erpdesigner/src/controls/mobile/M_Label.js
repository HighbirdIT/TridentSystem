const M_LabelKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        genTextFiledAttribute(),
    ]),
]);


class M_LabelKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_LabelKernel_Type,
                '标签',
                M_LabelKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );

        var self = this;
        autoBind(self);
    }

    renderSelf(){
        return (<M_Label key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Label extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            text:this.props.ctlKernel.getAttribute(AttrNames.TextField),
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.TextField,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            text:this.props.ctlKernel.getAttribute(AttrNames.TextField),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>标签内容</div>);
        }
        layoutConfig.addClass('M_Label');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        var textParseRet = parseObj_CtlPropJsBind(this.state.text);
        var showText = textParseRet.isScript ? '{脚本}' : (IsEmptyString(textParseRet.string) ? '[空标签]' : textParseRet.string);
        return(
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    showText
                }
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : '标签',
        type : M_LabelKernel_Type,
        namePrefix : M_LabelKernel_Prefix,
        kernelClass:M_LabelKernel,
        reactClass:M_Label,
        canbeLabeled:true,
    }, '基础');