const TaskSelectorKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genTextFiledAttribute('显示字段','任务名称'),
        genValueFiledAttribute('码值字段','任务名称代码'),
        genIsdisplayAttribute(),
        genNullableAttribute(),
        new CAttribute('提示', AttrNames.TipInfo, ValueType.String, '选择一个任务'),
    ]),
    new CAttributeGroup('事件', [
        new CAttribute('OnChanged', AttrNames.Event.OnChanged, ValueType.Event),
    ]),
]);


class TaskSelctorKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            TaskSelector_Type,
            '任务选择器',
            TaskSelectorKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        var funName = this.id + '_' + AttrNames.Event.OnChanged;
        var eventBP = this.project.scriptMaster.getBPByName(funName);
        if(eventBP){
            eventBP.ctlID = this.id;
            this.scriptCreated(AttrNames.Event.OnChanged,eventBP);
        }
        var self = this;
        autoBind(self);
    }

    scriptCreated(attrName, scriptBP){
        if(attrName == AttrNames.Event.OnChanged){
            scriptBP.setFixParam([VarNames.ParentPath, 'newText', 'newValue']);
        }
    }

    renderSelf(clickHandler) {
        return (<CTaskSelector key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var TaskSelector_api = new ControlAPIClass(TaskSelector_Type);
TaskSelector_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField,TaskSelectorKernelAttrsSetting), 'text', true));
TaskSelector_api.pushApi(new ApiItem_propsetter('value'));
TaskSelector_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.ValueField,TaskSelectorKernelAttrsSetting), 'value', true));
g_controlApi_arr.push(TaskSelector_api);

class CTaskSelector extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            value: this.props.ctlKernel.getAttribute(AttrNames.ValueField),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.TextField,
            AttrNames.ValueField,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            value: this.props.ctlKernel.getAttribute(AttrNames.ValueField),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文本框</div>);
        }
        layoutConfig.addClass('M_Dropdown');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('w-100');
        layoutConfig.addClass('btn-group');
        layoutConfig.addClass('h-100');
        var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
        var textParseRet = parseObj_CtlPropJsBind(this.state.text);
        var valueParseRet = parseObj_CtlPropJsBind(this.state.value);
        var fromText = this.state.fromtext;
        var fromValue = this.state.fromvalue;

        var showText = textParseRet.isScript ? '[{脚本}]' : '[' + textParseRet.string + ']';
        return (
           <div className={layoutConfig.getClassName()} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                <span style={{width:'calc(100% - 30px)'}} className='bg-info text-light flex-grow-1 flex-shrink-1' >{showText}</span>
                <span style={{width:'30px'}} className='bg-dark text-light flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' />
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '任务选择器',
        type: TaskSelector_Type,
        namePrefix: TaskSelector_Prefix,
        kernelClass: TaskSelctorKernel,
        reactClass: CTaskSelector,
        canbeLabeled: true,
    }, '基础');