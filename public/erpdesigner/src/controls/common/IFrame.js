function GetAllFlowStep(tabControlKernel){
    return gFlowMaster.getAllSteps().concat({
        fullName:'无',
        code:'0'
    });
}



const IFrameAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
        new CAttribute('方案', AttrNames.ProjectCode, ValueType.String, '', true, false, [], {text:'text', value:'value', pullDataFun:GetProjectRecords_arr}),
        new CAttribute('关联步骤', AttrNames.FlowStepCode, ValueType.String, 0, true, false, [], {text:'fullName', value:'code', pullDataFun: GetAllFlowStep}),
        new CAttribute('步骤数据', AttrNames.FlowStepData, ValueType.String, '', true, false, null, null, true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('消息处理', AttrNames.Event.OnReceiveMsg, ValueType.Event),
    ]),
]);

class FrameSet extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            IFrameKernel_Type,
            'IFrame',
            IFrameAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CFrameSet key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP == null){
            return;
        }
        if(scriptBP.name.indexOf(AttrNames.Event.OnReceiveMsg) != -1){
            scriptBP.setFixParam(['msgtype','data','fullPath']);
        }
    }
}
var IFrame_api = new ControlAPIClass(IFrameKernel_Type);
g_controlApi_arr.push(IFrame_api);

class CFrameSet extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
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
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>i框架</div>);
        }

        layoutConfig.addClass('hb-control');
        var showText = 'i框架' + ctlKernel.id;

        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {showText}
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: 'i框架',
        type: IFrameKernel_Type,
        namePrefix: FilePreviewer_Prefix,
        kernelClass: FrameSet,
        reactClass: CFrameSet,
        canbeLabeled: true,
    }, '基础');