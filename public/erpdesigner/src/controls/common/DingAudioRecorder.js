const DingAudioRecorderKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('录音完成', AttrNames.Event.OnRecordEnd, ValueType.Event),
    ]),
]);

class DingAudioRecorderKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            DingAudioRecorder_Type,
            '语音输入器',
            DingAudioRecorderKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP.name.indexOf(AttrNames.Event.OnRecordEnd) != -1){
            scriptBP.setFixParam(['fullPath','fileID', 'fileIdentity']);
        }
    }

    
    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CDingAudioRecorderKernel key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var DingAudioRecorder_api = new ControlAPIClass(DingAudioRecorder_Type);
DingAudioRecorder_api.pushApi(new ApiItem_fun({
    label:'Reset',
    name:'Reset',
}));
g_controlApi_arr.push(DingAudioRecorder_api);


class CDingAudioRecorderKernel extends React.PureComponent {
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
        // this.setState({
            
        // });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>钉钉语音输入</div>);
        }
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-0');
        layoutConfig.addClass('flex-shrink-0');
        layoutConfig.addClass('flex-column');

        return (
           <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null} autosize={!layoutConfig.hadSizeSetting() ? 1 : 0}>
                {this.renderHandleBar()}
                <div className='d-flex flex-grow-1 flex-shrink-1 justify-content-center align-items-center '>
                    <i className='fa fa-microphone' /><span>钉钉语音输入</span>
                </div>
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: '钉钉语音输入',
        type: DingAudioRecorder_Type,
        namePrefix: DingAudioRecorder_Prefix,
        kernelClass: DingAudioRecorderKernel,
        reactClass: CDingAudioRecorderKernel,
        canbeLabeled: false,
    }, '基础');