const PopperButtonAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('标题', AttrNames.Title, ValueType.String, '', true, false, [],
            {
                pullDataFun: GetKernelCanUseColumns,
                text: 'name',
                editable: true,
            }, true, {
                scriptable: true,
                type: FunType_Client,
                group: EJsBluePrintFunGroup.CtlAttr,
            }),
        new CAttribute('外观类', AttrNames.ButtonClass, ValueType.String, 'btn-link', true, false, ButtonClasses_arr),
        genIsdisplayAttribute(),
        new CAttribute('图标类型', AttrNames.IconType, ValueType.String, ''),
        new CAttribute('弹出位置', 'anchor', ValueType.String, 'left', true, false, ['left', 'right', 'top', 'bottom']),
        new CAttribute('面板定制', AttrNames.ModifyContent, ValueType.ModifyContent),
    ]),
    new CAttributeGroup('面板样式', [
        new CAttribute('PopperStyle', 'panel' + AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true),
        new CAttribute('PopperClass', 'panel' + AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true),
    ]),
]);


class PopperButton extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            PopperButtonKernel_Type,
            'PopperBtn',
            PopperButtonAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
        this.staticChild = true;
        this.hideAllChildOutline = true;

        if(this.children.length == 0){
            var childdiv = new M_ContainerKernel({}, this);
            childdiv.isfixed = true;
            childdiv.growAttrArray(AttrNames.LayoutNames.APDClass);
            var classAttr = childdiv.getAttrArrayList(AttrNames.LayoutNames.APDClass)[0];
            childdiv.setAttribute(AttrNames.LayoutNames.APDClass, 'card', classAttr.index);
        }

    }

    aidAccessableKernels(targetType, rlt_arr) {
        var needFilt = targetType != null;
        this.children.forEach(child => {
            if (!needFilt || child.type == targetType) {
                rlt_arr.push(child);
            }
            if(child.editor){
                if(!needFilt || child.editor.type == targetType){
                    rlt_arr.push(child.editor);
                }
                if(child.editor.type == M_ContainerKernel_Type){
                    // 穿透div
                    child.editor.aidAccessableKernels(targetType, rlt_arr);
                }
            }
            if(child.type == M_ContainerKernel_Type || child.type == Accordion_Type || (child.type == M_FormKernel_Type && child.isPageForm()) || child.type == PopperButtonKernel_Type){
                // 穿透div
                child.aidAccessableKernels(targetType, rlt_arr);
            }
        });
    }

    getContentKernel(){
        var childdiv = this.children[0];
        childdiv.name = this.readableName;
        return childdiv;
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CPopperButton key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    getLayoutConfig(classAttrName, styleAttrName) {
        var rlt = super.getLayoutConfig(classAttrName, styleAttrName);
        if(classAttrName == null || classAttrName == AttrNames.LayoutNames.APDClass){
            rlt.addClass('btn');
            rlt.addClass(this.getAttribute(AttrNames.ButtonClass));
        }
        return rlt;
    }
}
var PopperButton_api = new ControlAPIClass(PopperButtonKernel_Type);
PopperButton_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.Title, PopperButtonAttrsSetting), 'title', true));
PopperButton_api.pushApi(new ApiItem_propsetter('title'));
g_controlApi_arr.push(PopperButton_api);

class CPopperButton extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            btnClass: this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
            icontype: this.props.ctlKernel.getAttribute(AttrNames.IconType),
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.ButtonClass,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
            AttrNames.IconType,
            AttrNames.Title,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            btnClass: this.props.ctlKernel.getAttribute(AttrNames.ButtonClass),
            icontype: this.props.ctlKernel.getAttribute(AttrNames.IconType),
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>PopperBtn</div>);
        }

        layoutConfig.addClass('hb-control');
        var showText = (IsEmptyString(this.state.title) ? '[未命名]' : this.state.title);
        var iconElem = null;
        if (!IsEmptyString(this.state.icontype)) {
            iconElem = <i className={'fa fa-' + this.state.icontype} />
        }
        var titleParserRet = parseObj_CtlPropJsBind(this.state.title);
        var title = titleParserRet.isScript ? '{脚本}' : (IsEmptyString(titleParserRet.string) ? '[未命名]' : titleParserRet.string);

        var childElem = null;
        var btnClassName = layoutConfig.getClassName();

        childElem = <React.Fragment>
            {iconElem}
            {title}
        </React.Fragment>;

        return (
            <div className={btnClassName} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {childElem}
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: 'PopperBtn',
        type: PopperButtonKernel_Type,
        namePrefix: FilePreviewer_Prefix,
        kernelClass: PopperButton,
        reactClass: CPopperButton,
        canbeLabeled: true,
    }, '基础');