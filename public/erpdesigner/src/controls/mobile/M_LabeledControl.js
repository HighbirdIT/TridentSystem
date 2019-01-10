const M_LabeledControlKernelAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('name',AttrNames.Name,ValueType.String),
            genTextFiledAttribute(),
            new CAttribute('控件类型',AttrNames.EditorType,ValueType.String, M_TextKernel_Type, true, false,DesignerConfig.getMobileCanLabeledControls, {text:'label', value:'type'}),
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

        this.__genEditor(createHelper, kernelJson == null ? null : kernelJson.editor);
    }

    appandChild(cildKernel){
        cildKernel.parent = this;
    }

    renderSelf(){
        return (<M_LabeledControl key={this.id} ctlKernel={this} onClick={this.clickHandler} />);
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray){
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        switch(attrItem.name){
            case AttrNames.EditorType:
            this.__genEditor();
            break;
            case AttrNames.TextField:
            var editorTextField = this.editor.getAttribute(AttrNames.TextField);
            if(editorTextField == '' || (oldValue ? oldValue : '') == editorTextField){
                this.editor.setAttribute(AttrNames.TextField, newValue);
            }
            break;
        }
    }

    __genEditor(createHelper, editorKernelJson){
        if(this.editor != null){
            this.editor.parent = null;
            this.editor.delete();
            this.editor = null;
            this.children.length = 0;
        }
        var editorKernelConfig = DesignerConfig.findConfigByType(this.getAttribute(AttrNames.EditorType));
        if(editorKernelConfig != null){
            this.editor = new editorKernelConfig.kernelClass({}, this, createHelper, editorKernelJson);
            var editorTextField = this.editor.getAttribute(AttrNames.TextField);
            if(IsEmptyString(editorTextField)){
                this.editor.setAttribute(AttrNames.TextField, this.getAttribute(AttrNames.TextField));
            }
            this.editor.isfixed = true;
            this.children = [this.editor];
        }
    }

    getJson(){
        var rlt = super.getJson();
        rlt.editor = this.editor == null ? null : this.editor.getJson();
        return rlt;
    }
}


class M_LabeledControl extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            label:this.props.ctlKernel.getAttribute(AttrNames.TextField),
            editor:this.props.ctlKernel.editor,
        };

        autoBind(this);
        M_ControlBase(this,[
            AttrNames.TextField,
            AttrNames.EditorType,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        this.setState({
            label:this.props.ctlKernel.getAttribute(AttrNames.TextField),
            editor:this.props.ctlKernel.editor,
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        var showLabel = IsEmptyString(this.state.label) ? '[未设置]' : this.state.label;
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>{showLabel}</div>);
        }
        var editor = ctlKernel.editor;
        layoutConfig.addClass('rowlFameOne');
        layoutConfig.addClass('hb-control');
        return(
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                <div className='rowlFameOne_Left'>
                    {showLabel}
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