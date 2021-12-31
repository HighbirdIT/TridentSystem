const SingleFileUploaderKernelAttrsSetting = GenControlKernelAttrsSetting([
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
        new CAttribute('关联记录代码',AttrNames.KeyRecrodID,ValueType.String,'', true, false, [], 
        {
            pullDataFun:GetKernelCanUseColumns,
            text:'name',
            editable:true,
        }, true, {
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('附件记录代码',AttrNames.AttachmentID,ValueType.String,'', true, false, [], 
        {
            pullDataFun:GetKernelCanUseColumns,
            text:'name',
            editable:true,
        }, true, {
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('文件记录标识',AttrNames.FileIdentity,ValueType.String,'', true, false, [], 
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
        new CAttribute('fileID', 'fileID', ValueType.String, '', false, false,null,null,false),
        new CAttribute('attachmentid', 'attachmentID', ValueType.String, '', false, false,null,null,false),
        new CAttribute('接受的类型', 'accept', ValueType.String, '*', null, false, FileAcceptType_arr,{ text: 'name', value: 'code' }),
        new CAttribute('压缩图片', 'doDompress', ValueType.Boolean, true, null, false),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('上传完成', AttrNames.Event.OnUploadComplete, ValueType.Event),
    ]),
]);

class SingleFileUploaderKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            SingleFileUploader_Type,
            '单文件上传器',
            SingleFileUploaderKernelAttrsSetting,
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
            scriptBP.setFixParam(['fullPath','fileID', 'fileIdentity']);
        }
    }

    
    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CSingleFileUploader key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var SingleFileUploader_api = new ControlAPIClass(SingleFileUploader_Type);
SingleFileUploader_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName('fileID',SingleFileUploaderKernelAttrsSetting), 'fileID', true, (ctlStateVarName)=>{
    var uploaderStr = ctlStateVarName + '.uploader';
    return makeStr_AddAll(ctlStateVarName,' == null ? null : (', uploaderStr, ' == null || ',uploaderStr + '.fileProfile == null ? ',ctlStateVarName + '.fileID : ', uploaderStr + '.fileProfile.code)');
}));
SingleFileUploader_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName('attachmentID',SingleFileUploaderKernelAttrsSetting), 'attachmentID', true, (ctlStateVarName)=>{
    var uploaderStr = ctlStateVarName + '.uploader';
    return makeStr_AddAll(ctlStateVarName,' == null ? null : (', uploaderStr, ' == null || ',uploaderStr + '.fileProfile == null ? ',ctlStateVarName + '.attachmentID : ', uploaderStr + '.fileProfile.attachmentID)');
}));
SingleFileUploader_api.pushApi(new ApiItem_fun({
    label:'Reset',
    name:'Reset',
}));
SingleFileUploader_api.pushApi(new ApiItem_propsetter('title'));
SingleFileUploader_api.pushApi(new ApiItem_propsetter('fileID'));
SingleFileUploader_api.pushApi(new ApiItem_propsetter('fileIdentity'));
g_controlApi_arr.push(SingleFileUploader_api);


class CSingleFileUploader extends React.PureComponent {
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
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>单文件上传器</div>);
        }
        layoutConfig.addClass('M_SingleFileUploader');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-0');
        layoutConfig.addClass('flex-shrink-0');
        layoutConfig.addClass('flex-column');

        var titleParserRet = parseObj_CtlPropJsBind(this.state.title);
        var title = titleParserRet.isScript ? (ReplaceIfNull(this.state.name,'') + '{脚本}') : (IsEmptyString(titleParserRet.string) ? '' : '[' +titleParserRet.string + ']');

        return (
           <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null} autosize={!layoutConfig.hadSizeSetting() ? 1 : 0}>
                {this.renderHandleBar()}
                {title}
                <div className='' style={{width:'7em',height:'7em'}}>
                    <div className='m-a'>
                        <i className='fa fa-plus' />上传附件
                    </div>
                </div>
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: '单文件上传器',
        type: SingleFileUploader_Type,
        namePrefix: SingleFileUploader_Prefix,
        kernelClass: SingleFileUploaderKernel,
        reactClass: CSingleFileUploader,
        canbeLabeled: true,
    }, '基础');