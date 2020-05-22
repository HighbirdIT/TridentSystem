const M_ImageKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('src', 'src', ValueType.String, '', true, false, [],
            {
                pullDataFun: GetKernelCanUseColumns,
                text: 'name',
                editable: true,
            }, true, {
                scriptable: true,
                type: FunType_Client,
                group: EJsBluePrintFunGroup.CtlAttr,
            }),
        genIsdisplayAttribute(),
        new CAttribute('默认可见', AttrNames.DefaultVisible, ValueType.Boolean, true),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('OnMDown', AttrNames.Event.OnMouseDown, ValueType.Event),
    ]),
]);


class M_ImageKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_ImageKernel_Type,
            '标签',
            M_ImageKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<M_Image key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}

var M_ImageKernel_api = new ControlAPIClass(M_ImageKernel_Type);
M_ImageKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName('src', M_ImageKernelAttrsSetting), 'src'));
M_ImageKernel_api.pushApi(new ApiItem_propsetter('src'));
g_controlApi_arr.push(M_ImageKernel_api);

class M_Image extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            src:this.props.ctlKernel.getAttribute('src'),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            src:this.props.ctlKernel.getAttribute('src'),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>标签内容</div>);
        }
        layoutConfig.addClass('M_Image');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        var srcParseRet = parseObj_CtlPropJsBind(this.state.src);
        var showText = srcParseRet.isScript ? '{脚本}' : (IsEmptyString(srcParseRet.string) ? '[未指定]' : srcParseRet.string);
        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {
                    'src:' + showText
                }
            </div>
        );
    }
}


DesignerConfig.registerControl(
    {
        label: '图像',
        type: M_ImageKernel_Type,
        namePrefix: M_ImageKernel_Prefix,
        kernelClass: M_ImageKernel,
        reactClass: M_Image,
        canbeLabeled: true,
    }, '基础');