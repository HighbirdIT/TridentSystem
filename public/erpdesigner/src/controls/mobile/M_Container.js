const M_ContainerKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('方向',AttrNames.Orientation,ValueType.String,Orientation_H,true,false, Orientation_Options_arr),
        ]),
    ],
};

class M_ContainerKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData, 
                M_ContainerKernel_Type, 
                'Flex容器',
                M_ContainerKernelAttrsSetting.groups_arr.concat(),
                parentKernel,
                createHelper,kernelJson
            );

        var self = this;
        autoBind(self);
    }
    
    renderSelf(){
        return (<M_Container key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Container extends React.PureComponent {
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
        var className = 'd-flex ';
        className += ctlKernel.getRootDivClass();
        className += ' flex-grow-' + (this.state[AttrNames.FlexGrow] != false ? '1' : '0');
        className += ' flex-shrink-' + (this.state[AttrNames.FlexShrink] != false ? '1' : '0');
        var rootStyle = {};
        if(this.state.width){
            rootStyle.width = this.state.width + (!isNaN(this.state.width) ? 'px' : '');
        }
        if(this.state.height){
            rootStyle.height = this.state.height + (!isNaN(this.state.height) ? 'px' : '');
        }

        if(this.props.ctlKernel.__placing){
            className += ' M_Container_Empty M_placingCtl'
                        +(this.state.orientation == Orientation_V ? ' flex-column' : '')
            return (<div className={className} style={rootStyle} ref={this.rootElemRef}></div>);
        }
        className += ' M_Container border hb-control' 
                        + (this.state.orientation == Orientation_V ? ' flex-column' : '')
                        + (this.props.ctlKernel.children.length ==0 ? ' M_Container_Empty' : '')
                        ;
                        

        return(
            <div className={className} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id}  ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
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
        label : 'Flex容器',
        type : M_ContainerKernel_Type,
        namePrefix : M_ContainerKernel_Prefix,
        kernelClass:M_ContainerKernel,
        reactClass:M_Container,
    }, '布局');