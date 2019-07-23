const M_LabelKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        genTextFiledAttribute(),
        new CAttribute('数据类型', AttrNames.ValueType, ValueType.String, ValueType.String, true, false, JsValueTypes),
        new CAttribute('小数精度', AttrNames.FloatNum, ValueType.Int, 2, true, false, null, null, false),
        genIsdisplayAttribute(),
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

        var nowvt = this.getAttribute(AttrNames.ValueType);
        this[AttrNames.FloatNum + '_visible'] = nowvt == ValueType.Float;

        var self = this;
        autoBind(self);
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        if (attrItem.name == AttrNames.ValueType) {
            // 数据类型更改
            var floatNumAttr = this.findAttributeByName(AttrNames.FloatNum);
            floatNumAttr.setVisible(this, newValue == ValueType.Float);
        }
    }

    renderSelf(clickHandler){
        return (<M_Label key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}

var M_LabelKernel_api = new ControlAPIClass(M_LabelKernel_Type);
M_LabelKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField,M_LabelKernelAttrsSetting), 'text'));
M_LabelKernel_api.pushApi(new ApiItem_propsetter('text'));
g_controlApi_arr.push(M_LabelKernel_api);

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