const M_TextKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('name',AttrNames.Name,ValueType.String),
            new CAttribute('数据类型',AttrNames.ValueType,ValueType.String,ValueType.String, true, false, JsValueTypes),
            new CAttribute('小数精度',AttrNames.FloatNum,ValueType.Int, 2, true, false, null, null, false),
            new CAttribute('默认值',AttrNames.DefaultValue,ValueType.String, ''),
        ]),
    ],
};


class M_TextKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_TextKernel_Type,
                '文本框',
                M_TextKernelAttrsSetting.groups_arr.concat(),
                parentKernel,
                createHelper,kernelJson
            );

        var self = this;
        autoBind(self);

        
        this[AttrNames.FloatNum + '_visible'] = this[AttrNames.ValueType] == ValueType.Float;
    }

    renderSelf(){
        return (<M_Text key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray){
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        if(attrItem.name == AttrNames.ValueType){
            // 数据类型更改
            var floatNumAttr = this.findAttributeByName(AttrNames.FloatNum);
            floatNumAttr.setVisible(this, newValue == ValueType.Float);
        }
    }
}

class M_Text extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            defaultVal:this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            ValueType:this.props.ctlKernel.getAttribute(AttrNames.ValueType),
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.DefaultValue,
            AttrNames.ValueType,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            defaultVal:this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            ValueType:this.props.ctlKernel.getAttribute(AttrNames.ValueType),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文本框</div>);
        }
        layoutConfig.addClass('M_Text');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('w-100');
        var showText = IsEmptyString(this.state.defaultVal) ? '输入框' : this.state.defaultVal;
        showText += "[" + this.state.ValueType + ']';
        return(
            <input className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}
                value={showText}
                readOnly={true}
            />
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : '文本框',
        type : M_TextKernel_Type,
        namePrefix : M_TextKernel_Prefix,
        kernelClass:M_TextKernel,
        reactClass:M_Text,
    }, '基础');