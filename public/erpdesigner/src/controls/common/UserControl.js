const UserControlKernelTempleAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
        new CAttribute('属性列表', AttrNames.ParamApi, ValueType.String, '', true, true),
    ]),
],  true);


const UserControlKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        genIsdisplayAttribute(),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
    ]),
    new CAttributeGroup('属性接口',[
    ]),
], true, false);

const gUserControlAttsByType_map={};
const gUserControlParamApiAttr = new CAttribute('属性接口', AttrNames.ParamApi);


class UserControlKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                UserControlKernel_Type,
                '自订控件',
                parentKernel == null ? UserControlKernelTempleAttrsSetting : gUserControlAttsByType_map[parentKernel.project.designeConfig.name + '_' + (kernelJson != null ? kernelJson.attr.refID : initData.refID)],
                parentKernel,
                createHelper,kernelJson
            );
        this.hadReactClass = true;
        if(parentKernel == null){
            this.attrsSettingID = this.project.designeConfig.name + '_' + this.id;
            gUserControlAttsByType_map[this.attrsSettingID] = UserControlKernelAttrsSetting.map(group=>{
                return group.clone();
            });
            this.synControlAttrs();
        }
        else{
            if(kernelJson){
                this.attrsSettingID = parentKernel.project.designeConfig.name + '_' + kernelJson.attr.refID;
            }
            else{
                this.attrsSettingID = parentKernel.project.designeConfig.name + '_' + this.refID;
            }
        }
        var self = this;
        autoBind(self);
    }

    getParamApiAttrArray(){
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group=>{return group.label == '属性接口';});
        return theGroup.attrs_arr.map(attr=>{
            return {
                label:attr.label,
                name:attr.name,
            };
        });
    }

    getParamAttrByName(targetName){
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group=>{return group.label == '属性接口';});
        return theGroup.attrs_arr.find(attr=>{
            return attr.name == targetName;
        });
    }

    __attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray){
        if(attrName == AttrNames.ParamApi){
            this.synControlAttrs();
        }
    }

    synControlAttrs(){
        if(this.attrsSettingID == null){
            return;
        }
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var paramGroup = attrsSetting.find(group=>{return group.label == '属性接口';});
        var paramsApis_arr = this.getAttrArrayList(AttrNames.ParamApi);
        var i;
        paramGroup.attrs_arr.forEach(attr=>{
            attr.invalid = true;
        });
        paramsApis_arr.forEach(attr=>{
            var attrAlias = attr.name.replace('_','#');
            var paramAttr = paramGroup.findAttrByName(attrAlias);
            if(paramAttr == null){
                paramAttr = new CAttribute(this.getAttribute(attr.name), attrAlias, ValueType.String,'',true,false,[],{
                    pullDataFun:GetKernelCanUseColumns,
                    text:'name',
                    editable:true,
                },true,
                {
                    scriptable:true,
                    type:FunType_Client,
                    group:EJsBluePrintFunGroup.CtlAttr,
                });
                paramGroup.appandAttr(paramAttr);
            }
            else{
                paramAttr.label = this.getAttribute(attr.name);
            }
            paramAttr.invalid = false;
        });

        for(i=0;i<paramGroup.attrs_arr.length;++i){
            if(paramGroup.attrs_arr[i].invalid){
                paramGroup.attrs_arr.splice(i,1);
                --i;
            }
        }
    }

    renderSelf(clickHandler){
        return (<CUserControl key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} hadClickProxy={clickHandler != null} />)
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

var CustomControl_api = new ControlAPIClass(UserControlKernel_Type);
g_controlApi_arr.push(CustomControl_api);
CustomControl_api.pushApi(new ApiItem_prop(gUserControlParamApiAttr, AttrNames.ParamApi, false));
CustomControl_api.pushApi(new ApiItem_propsetter('属性接口'));

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
        if(ev.preventDefault){
            ev.preventDefault();
        }
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
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.clickInsHandler}  ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
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
        type : UserControlKernel_Type,
        namePrefix : UserControlKernel_Prefix,
        kernelClass:UserControlKernel,
        reactClass:CUserControl,
        canbeLabeled:false,
    }, '特殊');