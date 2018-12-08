const M_LabelKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('内容',AttrNames.Text,ValueType.String,'标签内容'),
        ]),
    ],
};


class M_LabelKernel extends ControlKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                M_LabelKernel_Type,
                '标签',
                M_LabelKernelAttrsSetting.groups_arr.concat(),
                parentKernel,
                createHelper,kernelJson
            );

        var self = this;
        autoBind(self);
    }

    renderSelf(){
        return (<M_Label key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }
}

class M_Label extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            text:this.props.ctlKernel.getAttribute(AttrNames.Text),
        };

        autoBind(this);
        M_ControlBase(this,['text']);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            text:this.props.ctlKernel.getAttribute(AttrNames.Text),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var className = 'flex-grow-0 flex-shrink-0';
        if(this.props.ctlKernel.__placing){
            className += ' M_placingCtl';
            return (<div className={className} ref={this.rootElemRef}>标签内容</div>);
        }
        className += ctlKernel.getRootDivClass();
        className += ' M_Label border hb-control';
        return(
            <div className={className} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
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