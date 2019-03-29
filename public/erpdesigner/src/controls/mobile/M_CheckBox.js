const M_CheckBoxKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genTextFiledAttribute(),
        new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null,true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('可否编辑', AttrNames.Editeable, ValueType.Boolean, true),
        genIsdisplayAttribute(),
    ]),
]);


class M_CheckBoxKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_CheckBoxKernel_Type,
            '文本框',
            M_CheckBoxKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler) {
        return (<M_CheckBox key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
    }
}

var M_CheckBoxKernel_api = new ControlAPIClass(M_CheckBoxKernel_Type);
M_CheckBoxKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField,M_CheckBoxKernelAttrsSetting), 'value', true));
M_CheckBoxKernel_api.pushApi(new ApiItem_propsetter('value'));
g_controlApi_arr.push(M_CheckBoxKernel_api);

class M_CheckBox extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.DefaultValue,
            AttrNames.TextField,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文本框</div>);
        }
        layoutConfig.addClass('M_CheckBox');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('w-100');
        var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
        var textParseRet = parseObj_CtlPropJsBind(this.state.text);
        var checked = false;
        var showText = textParseRet.isScript ? '复选框{脚本}' : (IsEmptyString(textParseRet.string) ? '' : '[' + textParseRet.string + ']') + (defaultParseRet.isScript ? '{脚默}' : '');
        if(!defaultParseRet.isScript){
            if(defaultParseRet.string == '1' || defaultParseRet.string == 'true'){
                checked = true;
            }
        }
        return (
            <span className={layoutConfig.getClassName()} style={layoutConfig.style} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null} onClick={this.props.onClick} >
                <span className="fa-stack fa-lg">
                    <i className={"fa fa-square-o fa-stack-2x"}></i>
                    {checked && <i className={'fa fa-stack-1x fa-check text-success'}></i>}
                </span>
                <span>{showText}</span>
            </span>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '复选框',
        type: M_CheckBoxKernel_Type,
        namePrefix: M_CheckBoxKernel_Prefix,
        kernelClass: M_CheckBoxKernel,
        reactClass: M_CheckBox,
        canbeLabeled: true,
    }, '基础');