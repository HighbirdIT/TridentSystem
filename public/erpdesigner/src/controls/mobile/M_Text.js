const M_TextKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genTextFiledAttribute(),
        new CAttribute('数据类型', AttrNames.ValueType, ValueType.String, ValueType.String, true, false, JsValueTypes),
        new CAttribute('小数精度', AttrNames.FloatNum, ValueType.Int, 2, true, false, null, null, false),
        new CAttribute('行类型', AttrNames.LineType, ValueType.String, LineType_Single, true, false, LinteTypes_arr, null, false),
        new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null,true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('可否编辑', AttrNames.Editeable, ValueType.Boolean, true),
        genIsdisplayAttribute(),
        genNullableAttribute(),
        genValidCheckerAttribute(),
    ]),
    new CAttributeGroup('事件',[
        new CAttribute('OnChanged', AttrNames.Event.OnChanged, ValueType.Event),
    ]),
]);


class M_TextKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_TextKernel_Type,
            '文本框',
            M_TextKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        var self = this;
        autoBind(self);


        var nowvt = this.getAttribute(AttrNames.ValueType);
        this[AttrNames.FloatNum + '_visible'] = nowvt == ValueType.Float;
        this[AttrNames.LineType + '_visible'] = nowvt == ValueType.String;

        var funName = this.id + '_' + AttrNames.Event.OnChanged;
        var eventBP = this.project.scriptMaster.getBPByName(funName);
        if(eventBP){
            eventBP.ctlID = this.id;
            this.scriptCreated(AttrNames.Event.OnChanged,eventBP);
        }
    }

    scriptCreated(attrName, scriptBP){
        if(attrName == AttrNames.Event.OnChanged){
            scriptBP.setFixParam([VarNames.ParentPath, 'newValue']);
        }
    }

    renderSelf(clickHandler) {
        return (<M_Text key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        if (attrItem.name == AttrNames.ValueType) {
            // 数据类型更改
            var floatNumAttr = this.findAttributeByName(AttrNames.FloatNum);
            floatNumAttr.setVisible(this, newValue == ValueType.Float);
            var lineTypeAttr = this.findAttributeByName(AttrNames.LineType);
            lineTypeAttr.setVisible(this, newValue == ValueType.String);
        }
    }
}

var M_TextKernel_api = new ControlAPIClass(M_TextKernel_Type);
M_TextKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField,M_TextKernelAttrsSetting), 'value', true));
M_TextKernel_api.pushApi(new ApiItem_propsetter('value'));
g_controlApi_arr.push(M_TextKernel_api);

class M_Text extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            ValueType: this.props.ctlKernel.getAttribute(AttrNames.ValueType),
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.DefaultValue,
            AttrNames.ValueType,
            AttrNames.TextField,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            ValueType: this.props.ctlKernel.getAttribute(AttrNames.ValueType),
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
        layoutConfig.addClass('M_Text');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('w-100');
        var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
        var textParseRet = parseObj_CtlPropJsBind(this.state.text);
        var showText = textParseRet.isScript ? '文本框{脚本}' : '编辑' + (IsEmptyString(textParseRet.string) ? '' : '[' + textParseRet.string + ']') + (defaultParseRet.isScript ? '{脚默}' : '[' + defaultParseRet.string + ']') + "[" + this.state.ValueType + ']';
        return (
            <input className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}
                value={showText}
                readOnly={true}
            />
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '文本框',
        type: M_TextKernel_Type,
        namePrefix: M_TextKernel_Prefix,
        kernelClass: M_TextKernel,
        reactClass: M_Text,
        canbeLabeled: true,
    }, '基础');