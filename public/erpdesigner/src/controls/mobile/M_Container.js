const M_ContainerKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('方向','orientation',ValueType.String,true,false, Orientation_Options_arr),
        ]),
    ],
};

const M_ContainerKernel_Prefix = 'M_C';
const M_ContainerKernel_Type = 'M_ContainerKernel';

class M_ContainerKernel extends ContainerKernelBase{
    constructor(initData, project) {
        super(  extractPropsFromObj(initData, 
                [
                    {name:'orientation',default:Orientation_H},
                    {name:'name',default:project.genControlName(M_ContainerKernel_Prefix)},
                ]), 
                project, 
                'Flex容器');

        var self = this;
        autoBind(self);

        this.attrbuteGroups = M_ContainerKernelAttrsSetting.groups_arr;
    }

    clickHandler(ev){
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if(ctlid == this.name && this.project.designer.attributePanel){
            this.project.designer.attributePanel.setTarget(this);
        }
        ev.preventDefault();
    }

    renderSelf(){
        return (<M_Container key={this.name} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Container extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            orientation:this.props.ctlKernel.orientation,
            children: this.props.ctlKernel.children,
        };

        autoBind(this);
        M_ControlBase(this,['orientation','children']);
        M_ContainerBase(this);
    }

    aAttrChanged(changedAttrName) {
        var childrenVal = this.state.children;
        if (changedAttrName == 'children') {
            childrenVal = this.props.ctlKernel.children.concat();
        }
        this.setState({
            orientation:this.props.ctlKernel.orientation,
            children: childrenVal,
        });
    }

    render(){
        var className = 'd-flex flex-grow-1 flex-shrink-1'
        if(this.props.ctlKernel.__placing){
            className += ' M_Container_Empty M_placingCtl'
                        +(this.state.orientation == Orientation_V ? ' flex-column' : '')
            return (<div className={className}></div>);
        }
        className += ' M_Container border' 
                        + (this.state.orientation == Orientation_V ? ' flex-column' : '')
                        + (this.props.ctlKernel.children.length ==0 ? ' M_Container_Empty' : '');
                        
        return(
            <div className={className} onClick={this.props.onClick} ref={this.childContainerRef} ctlid={this.props.ctlKernel.name}>
                {
                    this.props.ctlKernel.children.length == 0 ? 
                        this.props.ctlKernel.name :
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