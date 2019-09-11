const MFileUploaderKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('标题',AttrNames.Title,ValueType.String,'', true, false, [], 
        {
            pullDataFun:GetKernelCanUseColumns,
            text:'name',
            editable:true,
        }, true, {
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('所属流程', 'fileFlow', ValueType.String, ValueType.String, null, false, AllFileFlows_arr, { text: 'label', value: 'code' }),
    ]),
    new CAttributeGroup('事件', [
        
    ]),
]);

class MFileUploaderKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            MFileUploader_Type,
            '多文件上传器',
            MFileUploaderKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler) {
        return (<CMFileUploader key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var MFileUploader_api = new ControlAPIClass(MFileUploader_Type);
g_controlApi_arr.push(MFileUploader_api);

class CMFileUploader extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            title:this.props.ctlKernel.getAttribute(AttrNames.Title),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.Title,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            title:this.props.ctlKernel.getAttribute(AttrNames.Title),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文本框</div>);
        }
        layoutConfig.addClass('M_MFileUploader');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-0');
        layoutConfig.addClass('flex-shrink-0');
        layoutConfig.addClass('flex-column');

        var titleParserRet = parseObj_CtlPropJsBind(this.state.title);
        var title = titleParserRet.isScript ? (ReplaceIfNull(this.state.name,'') + '{脚本}') : (IsEmptyString(titleParserRet.string) ? '' : '[' +titleParserRet.string + ']');
        if(IsEmptyString(title)){
            title = '附件列表';
        }

        return (
           <div className={layoutConfig.getClassName()} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                <div className='bg-dark d-flex flex-shrink-0 flex-grow-0 p-1 align-items-center'>
                    <span className='text-light flex-grow-1 flex-shrink-1'><i className='fa fa-list mr-1' />{title}</span>
                    <i className='fa fa-plus text-success' />
                </div>
                <div className='list-group'>
                    <span className='list-group-list' >上传中的附件</span>
                </div>
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: '多文件上传器',
        type: MFileUploader_Type,
        namePrefix: MFileUploader_Prefix,
        kernelClass: MFileUploaderKernel,
        reactClass: CMFileUploader,
        canbeLabeled: false,
    }, '基础');