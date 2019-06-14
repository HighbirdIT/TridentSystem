const UserControlKernelTempleAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
    ]),
],  true);


const UserControlKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        genIsdisplayAttribute(),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
    ]),
], true, false);


class UserontrolKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                UserContrlKernel_Type,
                '自订控件',
                (initData == null || initData.refID == null) && (kernelJson == null || kernelJson.refID == null) ? UserControlKernelTempleAttrsSetting : UserControlKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        var self = this;
        autoBind(self);
    }

    renderSelf(){
        return (<CUserControl key={this.id} ctlKernel={this} onClick={this.clickHandler} />)
    }

    getLayoutConfig(){
        var rlt = super.getLayoutConfig();
        return rlt;
    }

    isTemplate(){
        return this.getAttribute('refID') == 'none';
    }

    getTemplateKernel(){
        if(this.templateKernel == null){
            if(this.isTemplate()){
                this.templateKernel = this;
            }
            else{
                this.templateKernel = this.project.getUserControlById(this.refID);
            }
        }
        return this.templateKernel;
    }
}

var CustomControl_api = new ControlAPIClass(UserContrlKernel_Type);
g_controlApi_arr.push(CustomControl_api);

class CUserControl extends React.PureComponent {
    constructor(props){
        super(props);

        var ctlKernel = this.props.ctlKernel;
        var templateKernel = ctlKernel.getTemplateKernel();
        var isTempalte = templateKernel == ctlKernel;

        var initState = {
            templateKernel: templateKernel,
            isTempalte : isTempalte,
        };
        if(isTempalte){
            initState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
            initState.children = ctlKernel.children;

            M_ControlBase(this,[
                AttrNames.Name,
                AttrNames.Orientation,
                AttrNames.Chidlren,
                AttrNames.LayoutNames.APDClass,
                AttrNames.LayoutNames.StyleAttr,
            ]);
        }
        else{
            M_ControlBase(this,[
                AttrNames.Name,
            ]);
        }

        this.state=initState;

        autoBind(this);
        
        if(isTempalte){
            M_ContainerBase(this);
        }
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
        if(this.state.isTempalte){
            this.setState({
                orientation: ctlKernel.getAttribute(AttrNames.Orientation),
                children: childrenVal,
            });
        }
    }

    clickInsHandler(ev){
        this.props.onClick({target:this.rootElemRef.current});
    }

    renderTempalte(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        if (this.state.orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('d-flex');
        var contentElem = null;
        
        var showText = IsEmptyString(this.state.label) ? '[未命名]' : this.state.label;
        return(
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    ctlKernel.children.length == 0 ?
                    ctlKernel.id :
                    ctlKernel.children.map(childKernel => {
                        return childKernel.renderSelf();
                    })
                }
            </div>
        );
    }

    renderInstance(){
        var ctlKernel = this.props.ctlKernel;
        var templateKernel = this.state.templateKernel;
        var layoutConfig = templateKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        if (templateKernel.getAttribute(AttrNames.Orientation) == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('d-flex');
        
        return(
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    templateKernel.children.length == 0 ?
                    ctlKernel.id :
                    templateKernel.children.map(childKernel => {
                        return childKernel.renderSelf(this.clickInsHandler, true);
                    })
                }
            </div>
        );
    }

    render(){
        if(this.state.isTempalte){
            return this.renderTempalte();
        }
        return this.renderInstance();   
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        invisible : true,
        label : '自订控件',
        type : UserContrlKernel_Type,
        namePrefix : UserContrlKernel_Prefix,
        kernelClass:UserontrolKernel,
        reactClass:CUserControl,
        canbeLabeled:true,
    }, '特殊');