const M_LabeledControlKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('name',AttrNames.Name,ValueType.String),
            new CAttribute('标签',AttrNames.Label,ValueType.String, '未命名'),
        ]),
    ],
};


class M_LabeledControlKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_LabeledControlKernel_Type,
                '操作控件',
                M_LabeledControlKernelAttrsSetting.groups_arr.concat(),
                parentKernel,
                createHelper,
                kernelJson
            );
        
        var self = this;
        autoBind(self);

        this.editor = new M_TextKernel({}, this, createHelper, kernelJson.editor);
        this.children = [this.editor];
    }

    appandChild(cildKernel){
        cildKernel.parent = this;
    }

    renderSelf(){
        return (<M_LabeledControl key={this.id} ctlKernel={this} onClick={this.clickHandler} />);
    }
}


class M_LabeledControl extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            label:this.props.ctlKernel.getAttribute(AttrNames.Label),
            editor:this.props.ctlKernel.editor,
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.Label,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            label:this.props.ctlKernel.getAttribute(AttrNames.Label),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>{this.state.label}</div>);
        }
        var editor = ctlKernel.editor;
        layoutConfig.addClass('rowlFameOne');
        layoutConfig.addClass('hb-control');
        return(
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                <div className='rowlFameOne_Left'>
                    {this.state.label}
                </div>
                <div className='rowlFameOne_right'>
                    {editor != null && editor.renderSelf()}
                </div>
            </div>
        );
    }
}


DesignerConfig.registerControl(
    {
        forPC : false,
        label : '操作控件',
        type : M_LabeledControlKernel_Type,
        namePrefix : M_LabeledControlKernel_Prefix,
        kernelClass:M_LabeledControlKernel,
        reactClass:M_LabeledControl,
    }, '基础');