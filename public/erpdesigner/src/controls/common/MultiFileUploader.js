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
        genIsdisplayAttribute(),
        genNullableAttribute(),
        genValidCheckerAttribute(),
        new CAttribute('fileListStr', 'fileListStr', ValueType.String, '', false, false,null,null,false),
        new CAttribute('fileListArray', 'fileListArray', ValueType.Array, '', false, false,null,null,false),
        new CAttribute('接受的类型', 'accept', ValueType.String, '*', null, false, FileAcceptType_arr),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('上传完成', AttrNames.Event.OnUploadComplete, ValueType.Event),
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

        var theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Event.OnUploadComplete);
        if(theBP){
            theBP.setFixParam(['fullPath','fileID']);
        }
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP.name.indexOf(AttrNames.Event.OnUploadComplete) != -1){
            scriptBP.setFixParam(['fullPath','fileID']);
        }
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CMFileUploader key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var MFileUploader_api = new ControlAPIClass(MFileUploader_Type);
MFileUploader_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName('fileListStr',MFileUploaderKernelAttrsSetting), 'fileListStr', true, (ctlStateVarName)=>{
    return makeStr_AddAll(ctlStateVarName,'==null || ', ctlStateVarName, '.uploaders == null ? "" : ', ctlStateVarName, '.uploaders.map(u=>{return u.fileProfile.code;}).join(",")');
}));
MFileUploader_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName('fileListArray',MFileUploaderKernelAttrsSetting), 'fileListArray', true, (ctlStateVarName)=>{
    return makeStr_AddAll(ctlStateVarName,'==null || ', ctlStateVarName, '.uploaders == null ? [] : ', ctlStateVarName, '.uploaders.map(u=>{return u.fileProfile.code;})');
}));
MFileUploader_api.pushApi(new ApiItem_fun({
    label:'Reset',
    name:'Reset',
}));
MFileUploader_api.pushApi(new ApiItem_propsetter('title'));
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
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>多文件上传器</div>);
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