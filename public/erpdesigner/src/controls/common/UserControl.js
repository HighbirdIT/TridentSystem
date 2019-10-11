const UserControlKernelTempleAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
        new CAttribute('属性列表', AttrNames.ParamApi, ValueType.String, '', true, true),
        new CAttribute('自订事件', AttrNames.EventApi, ValueType.UserControlEvent, '', true, true),
        new CAttribute('自订方法', AttrNames.FunctionApi, ValueType.CustomFunction, '', true, true),
    ]),
], true);

const UserControlKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
        new CAttribute('默认可见', AttrNames.DefaultVisible, ValueType.Boolean, true),
        new CAttribute('refID', 'refID', ValueType.String, 'none', true, false, null, null, false),
    ]),
    new CAttributeGroup('属性接口', [
    ]),
    new CAttributeGroup('事件接口', [
    ]),
    new CAttributeGroup('原生事件',[
        new CAttribute('OnMDown', AttrNames.Event.OnMouseDown, ValueType.Event),
    ]),
], true, false);

const gUserControlAttsByType_map = {};
const gUserControlParamApiAttr = new CAttribute('属性接口', AttrNames.ParamApi);


class UserControlKernel extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            UserControlKernel_Type,
            '自订控件',
            parentKernel == null ? UserControlKernelTempleAttrsSetting : gUserControlAttsByType_map[parentKernel.project.designeConfig.name + '_' + (kernelJson != null ? kernelJson.attr.refID : initData.refID)],
            parentKernel,
            createHelper, kernelJson
        );
        this.hadReactClass = true;
        if (parentKernel == null) {
            if(kernelJson != null){
                this.uuid = kernelJson.uuid;
            }
            if(this.uuid == null){
                this.uuid = guid2();
            }
            this.attrsSettingID = this.project.designeConfig.name + '_' + this.id;
            var oldAttrsSettingID = this.project.designeConfig.name + '_' + this.id[0].toLowerCase() + this.id.substr(1);
            gUserControlAttsByType_map[this.attrsSettingID] = UserControlKernelAttrsSetting.map(group => {
                return group.clone();
            });
            gUserControlAttsByType_map[oldAttrsSettingID] = gUserControlAttsByType_map[this.attrsSettingID];
            this.synControlAttrs();
        }
        else {
            if (kernelJson) {
                var refID = kernelJson.attr.refID;
                refID = refID[0].toUpperCase() + refID.substr(1);
                this.attrsSettingID = parentKernel.project.designeConfig.name + '_' + refID;
                this.refID = refID;
            }
            else {
                this.attrsSettingID = parentKernel.project.designeConfig.name + '_' + this.refID;
            }
        }
        var self = this;
        autoBind(self);
    }

    __restoreChildren(createHelper, kernelJson) {
        kernelJson.children.forEach(childJson => {
            var ctlConfig = DesignerConfig.findConfigByType(childJson.type);
            if (ctlConfig == null) {
                console.warn('type:' + childJson.type + '未找到配置数据');
                return;
            }
            var childCtl = new ctlConfig.kernelClass(null, this, createHelper, childJson);
        });
    }

    getParamApiAttrArray() {
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group => { return group.label == '属性接口'; });
        return theGroup.attrs_arr.map(attr => {
            return {
                label: attr.label,
                name: attr.name,
            };
        });
    }

    getEventApiAttrArray() {
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group => { return group.label == '事件接口'; });
        return theGroup.attrs_arr.map(attr => {
            return {
                label: attr.label,
                name: attr.name,
            };
        });
    }

    getFunctionApiAttrArray() {
        var templateKernel = this.getTemplateKernel();
        var attrValue;
        var rlt_arr = [];
        var funApis_arr = templateKernel.getAttrArrayList(AttrNames.FunctionApi);
        funApis_arr.forEach(attr=>{
            attrValue = templateKernel.getAttribute(attr.name);
            if(IsEmptyString(attrValue)){
                return;
            }
            rlt_arr.push({
                label: attrValue,
                name: attr.name,
            });
        });

        return rlt_arr;
    }

    getParamAttrByName(targetName) {
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group => { return group.label == '属性接口'; });
        return theGroup.attrs_arr.find(attr => {
            return attr.name == targetName;
        });
    }

    getEventAttrByName(targetName) {
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var theGroup = attrsSetting.find(group => { return group.label == '事件接口'; });
        return theGroup.attrs_arr.find(attr => {
            return attr.name == targetName;
        });
    }

    genFixParams_arr(str) {
        var fixParams_arr = [];
        if (!IsEmptyString(str)) {
            str.split(';').forEach(x => {
                if (x.length > 0 && fixParams_arr.indexOf(x) == -1) {
                    fixParams_arr.push(x);
                }
            });
        }
        return fixParams_arr;
    }

    __attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray) {
        if (attrName == AttrNames.ParamApi || attrName == AttrNames.EventApi) {
            this.synControlAttrs();
        }

        var project = this.project;
        if (attrName == AttrNames.EventApi) {
            var instances_arr = this.project.getControlsByType(UserControlKernel_Type).filter(p => {
                return p.refID == this.id;
            });

            if (value != null) {
                var fixParams_arr = this.genFixParams_arr(value.params);
                instances_arr.forEach(instance => {
                    var eventBPname = instance.id + '_' + realAtrrName.replace('_', '#');
                    var eventBp = project.scriptMaster.getBPByName(eventBPname);
                    if (eventBp != null) {
                        eventBp.setFixParam(fixParams_arr);
                    }
                });
            }
            else {
                instances_arr.forEach(instance => {
                    var eventBPname = instance.id + '_' + realAtrrName.replace('_', '#');
                    var eventBp = project.scriptMaster.getBPByName(eventBPname);
                    if (eventBp != null) {
                        project.scriptMaster.deleteBP(eventBp);
                    }
                });
            }
        }
        if (attrName == AttrNames.FunctionApi) {
            if (value == null) {
                var funBPname = this.id + '_' + realAtrrName;
                var funBp = project.scriptMaster.getBPByName(funBPname);
                if (funBp != null) {
                    project.scriptMaster.deleteBP(funBp);
                }
            }
        }
    }

    synControlAttrs() {
        if (this.attrsSettingID == null) {
            return;
        }
        var attrsSetting = gUserControlAttsByType_map[this.attrsSettingID];
        var paramGroup = attrsSetting.find(group => { return group.label == '属性接口'; });
        var paramsApis_arr = this.getAttrArrayList(AttrNames.ParamApi);
        var i;
        var attrAlias;
        var paramAttr;
        paramGroup.attrs_arr.forEach(attr => {
            attr.invalid = true;
        });
        paramsApis_arr.forEach(attr => {
            attrAlias = attr.name.replace('_', '#');
            paramAttr = paramGroup.findAttrByName(attrAlias);
            if (paramAttr == null) {
                paramAttr = new CAttribute(this.getAttribute(attr.name), attrAlias, ValueType.String, '', true, false, [], {
                    pullDataFun: GetKernelCanUseColumns,
                    text: 'name',
                    editable: true,
                }, true,
                    {
                        scriptable: true,
                        type: FunType_Client,
                        group: EJsBluePrintFunGroup.CtlAttr,
                    });
                paramGroup.appandAttr(paramAttr);
            }
            else {
                paramAttr.label = this.getAttribute(attr.name);
            }
            paramAttr.invalid = false;
        });

        for (i = 0; i < paramGroup.attrs_arr.length; ++i) {
            if (paramGroup.attrs_arr[i].invalid) {
                paramGroup.attrs_arr.splice(i, 1);
                --i;
            }
        }

        paramGroup = attrsSetting.find(group => { return group.label == '事件接口'; });
        var eventApis_arr = this.getAttrArrayList(AttrNames.EventApi);
        paramGroup.attrs_arr.forEach(attr => {
            attr.invalid = true;
        });
        eventApis_arr.forEach(attr => {
            attrAlias = attr.name.replace('_', '#');
            paramAttr = paramGroup.findAttrByName(attrAlias);
            var fixParams_arr = [];
            var attrValue = this.getAttribute(attr.name);
            if (!IsEmptyString(attrValue.params)) {
                fixParams_arr = this.genFixParams_arr(attrValue.params);
            }
            var scriptSetting = {
                group: EJsBluePrintFunGroup.CtlEvent,
                fixParams_arr: fixParams_arr
            };
            if (paramAttr == null) {
                paramAttr = new CAttribute(attrValue.name, attrAlias, ValueType.Event, null, null, null, null, null, null, scriptSetting);
                paramGroup.appandAttr(paramAttr);
            }
            else {
                paramAttr.label = attrValue.name;
                paramAttr.scriptSetting = scriptSetting;
            }
            paramAttr.invalid = false;
        });

        for (i = 0; i < paramGroup.attrs_arr.length; ++i) {
            if (paramGroup.attrs_arr[i].invalid) {
                paramGroup.attrs_arr.splice(i, 1);
                --i;
            }
        }
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CUserControl key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} hadClickProxy={clickHandler != null} />)
    }

    getLayoutConfig() {
        var rlt = super.getLayoutConfig();
        return rlt;
    }

    isTemplate() {
        return this.getAttribute('refID') == 'none';
    }

    getTemplateKernel() {
        if (this.templateKernel == null) {
            if (this.isTemplate()) {
                this.templateKernel = this;
            }
            else {
                this.templateKernel = this.project.getUserControlById(this.refID);
            }
        }
        return this.templateKernel;

    }

    getJson(jsonProf) {
        var rlt = super.getJson(jsonProf);
        rlt.uuid = this.uuid;
        if(!this.isTemplate()){
            jsonProf.useUserControl(this.getTemplateKernel());
        }
        return rlt;
    }

    getReadableName(){
        var template = this.getTemplateKernel();
        if(template == this){
            return this.id;
        }
        return this.id + '[' + template.getAttribute(AttrNames.Name) + ']';
    }
}

var CustomControl_api = new ControlAPIClass(UserControlKernel_Type);
g_controlApi_arr.push(CustomControl_api);
CustomControl_api.pushApi(new ApiItem_prop(gUserControlParamApiAttr, AttrNames.ParamApi, false));
CustomControl_api.pushApi(new ApiItem_propsetter('属性接口'));
CustomControl_api.pushApi(new ApiItem_fun({
    label: '自订事件',
    name: 'unknown'
}));
CustomControl_api.pushApi(new ApiItem_fun({
    label: '自订方法',
    name: 'unknown'
}));


class CUserControl extends React.PureComponent {
    constructor(props) {
        super(props);

        var ctlKernel = this.props.ctlKernel;
        var templateKernel = ctlKernel.getTemplateKernel();
        var isTempalte = templateKernel == ctlKernel;

        var initState = {
            templateKernel: templateKernel,
            isTempalte: isTempalte,
        };
        if (isTempalte) {
            initState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
            initState.children = ctlKernel.children;

            M_ControlBase(this, [
                AttrNames.Name,
                AttrNames.Orientation,
                AttrNames.Chidlren,
                AttrNames.LayoutNames.APDClass,
                AttrNames.LayoutNames.StyleAttr,
            ]);
        }
        else {
            M_ControlBase(this, [
                AttrNames.Name,
            ]);
        }

        this.state = initState;

        autoBind(this);

        if (isTempalte) {
            M_ContainerBase(this);
        }
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        var childrenVal = this.state.children;
        var ctlKernel = this.props.ctlKernel;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = ctlKernel.children.concat();
        }
        if (this.state.isTempalte) {
            this.setState({
                orientation: ctlKernel.getAttribute(AttrNames.Orientation),
                children: childrenVal,
            });
        }
    }

    clickInsHandler(ev) {
        this.props.onClick({ target: this.rootElemRef.current });
        if (ev.preventDefault) {
            ev.preventDefault();
        }
    }

    renderTempalte() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        if (this.state.orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-shrink-0');
        layoutConfig.addClass('bg-light');
        var contentElem = null;

        var showText = IsEmptyString(this.state.label) ? '[未命名]' : this.state.label;
        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    ctlKernel.children.length == 0 ?
                        ctlKernel.id :
                        ctlKernel.children.map(childKernel => {
                            return childKernel.renderSelf(null, null, this.props.designer);
                        })
                }
            </div>
        );
    }

    renderInstance() {
        var ctlKernel = this.props.ctlKernel;
        var templateKernel = ctlKernel.getTemplateKernel();
        var layoutConfig = templateKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        if (templateKernel.getAttribute(AttrNames.Orientation) == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('d-flex');

        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.clickInsHandler} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {
                    templateKernel.children.length == 0 ?
                        ctlKernel.id :
                        templateKernel.children.map(childKernel => {
                            return childKernel.renderSelf(this.clickInsHandler, true, this.props.designer);
                        })
                }
            </div>
        );
    }

    render() {
        if (this.state.isTempalte) {
            if (this.state.templateKernel != this.props.ctlKernel) {
                this.unlistenTarget(this.state.templateKernel);
                this.listenTarget(this.props.ctlKernel);
                var self = this;
                var ctlKernel = this.props.ctlKernel;
                setTimeout(() => {
                    self.setState({
                        templateKernel: ctlKernel,
                        orientation: ctlKernel.getAttribute(AttrNames.Orientation),
                    });
                }, 50);
            }
            return this.renderTempalte();
        }
        return this.renderInstance();
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        invisible: true,
        label: '自订控件',
        type: UserControlKernel_Type,
        namePrefix: UserControlKernel_Prefix,
        kernelClass: UserControlKernel,
        reactClass: CUserControl,
        canbeLabeled: false,
    }, '特殊');