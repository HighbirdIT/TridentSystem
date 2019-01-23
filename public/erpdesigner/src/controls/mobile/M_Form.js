const M_FormKernelAttrsSetting=GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('方向',AttrNames.Orientation,ValueType.String,Orientation_V,true,false, Orientation_Options_arr),
        new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, null, {text:'name', value:'code'}),
        new CAttribute('操作表', AttrNames.ProcessTable, ValueType.DataSource, null, true, false, null, {text:'name', value:'code'}),
    ]),
]);

class M_FormKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_FormKernel_Type,
                '数据表单',
                M_FormKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        
        this.findAttributeByName(AttrNames.DataSource).options_arr = parentKernel.project.dataMaster.getAllEntities;
        this.findAttributeByName(AttrNames.ProcessTable).options_arr = g_dataBase.getAllTable;
        var self = this;
        autoBind(self);
    }
    
    renderSelf(){
        return (<M_Form key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Form extends React.PureComponent {
    constructor(props){
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this,LayoutAttrNames_arr.concat([AttrNames.Orientation,AttrNames.Chidlren], inintState));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;

        this.state = inintState;
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        var childrenVal = this.state.children;
        var ctlKernel = this.props.ctlKernel;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = ctlKernel.children.concat();
        }
        this.setState({
            orientation:ctlKernel.getAttribute(AttrNames.Orientation),
            children: childrenVal,
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        var rootStyle = layoutConfig.style;

        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            layoutConfig.addClass('M_Form_Empty');
            return (<div className={layoutConfig.getClassName()} style={rootStyle} ref={this.rootElemRef}></div>);
        }
        layoutConfig.addClass('M_Form');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        if(this.state.orientation == Orientation_V){
            layoutConfig.addClass('flex-column');
        }
        if(this.props.ctlKernel.children.length ==0){
            layoutConfig.addClass('M_Form_Empty');
        }

        return(
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    this.props.ctlKernel.children.length == 0 ? 
                        this.props.ctlKernel.id :
                        this.props.ctlKernel.children.map(childKernel=>{
                            return childKernel.renderSelf();
                        })
                }
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : 'Form',
        type : M_FormKernel_Type,
        namePrefix : M_FormKernel_Prefix,
        kernelClass:M_FormKernel,
        reactClass:M_Form,
    }, '布局');