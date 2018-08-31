const M_LabelKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('内容','text',ValueType.String),
        ]),
    ],
};

const M_LabelKernel_Prefix = 'M_Label';
const M_LabelKernel_Type = 'M_Label';

class M_LabelKernel extends ControlKernelBase{
    constructor(initData, project) {
        super(  extractPropsFromObj(initData, 
                [
                    {name:'name',default:project.genControlName(M_LabelKernel_Prefix)},
                    {name:'text',default:'标签内容'},
                ]), 
                project, 
                '标签');

        var self = this;
        autoBind(self);

        this.attrbuteGroups = M_LabelKernelAttrsSetting.groups_arr;
    }

    renderSelf(){
        return (<M_Label key={this.name} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Label extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            text:this.props.ctlKernel.text,
        };

        autoBind(this);
        M_ControlBase(this,['text']);
    }

    aAttrChanged(changedAttrName) {
        this.setState({
            text:this.props.ctlKernel.text,
        });
    }

    render(){
        var className = 'flex-grow-0 flex-shrink-0'
        if(this.props.ctlKernel.__placing){
            className += ' M_placingCtl';
            return (<div className={className} ref={this.rootElemRef}>标签内容</div>);
        }
        className += ' M_Label border hb-control';
        return(
            <div className={className} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.name} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    this.state.text
                }
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : '标签',
        type : M_LabelKernel_Type,
        namePrefix : M_LabelKernel_Prefix,
        kernelClass:M_LabelKernel,
        reactClass:M_Label,
    }, '基础');