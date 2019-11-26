const M_LabeledControlKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genTextFiledAttribute(),
        new CAttribute('控件类型', AttrNames.EditorType, ValueType.String, M_TextKernel_Type, true, false, [], { text: 'label', value: 'type', pullDataFun: getCanLabeledControls }),
        genIsdisplayAttribute(),
        new CAttribute('交互类型', AttrNames.InteractiveType, ValueType.String, EInterActiveType.ReadWrite, true, false, EInterActiveTypes_arr, { text: 'text', value: 'value' }),
        new CAttribute('交互字段', AttrNames.InteractiveField, ValueType.String, '', true, false, [], {
            pullDataFun: GetCanInteractiveColumns,
        }),
        genNullableAttribute(),
        new CAttribute('渲染模式', AttrNames.RenderMode, ValueType.String, ERenderMode.Auto, true, false, RenderModes_arr, { text: 'text', value: 'value' }),
        new CAttribute('标题字数', 'WordNum', ValueType.Int, '6', true, false, ['2','4','6']),
        new CAttribute('占宽', AttrNames.WidthFactor, ValueType.Int, EWidthFactor.Default, true, false, WidthFactors_arr, { text: 'text', value: 'value' }),
        new CAttribute('列宽设置', AttrNames.ColumnWidth, ValueType.Int, 0),
        new CAttribute('新行依赖', AttrNames.NewRowDepend, ValueType.Boolean, false),
        new CAttribute('帮助提示', AttrNames.ToolTip, ValueType.String, '', true, false, null,
            null, true, {
                scriptable: true,
                type: FunType_Client,
                group: EJsBluePrintFunGroup.CtlAttr,
            }),
    ]),
]);

class M_LabeledControlKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_LabeledControlKernel_Type,
            '操作控件',
            M_LabeledControlKernelAttrsSetting,
            parentKernel,
            createHelper,
            kernelJson
        );

        var self = this;
        autoBind(self);
        this.staticChild = true;
        this.newAdded = kernelJson == null;
        this.__genEditor(createHelper, kernelJson == null ? null : kernelJson.editor);
    }

    appandChild(cildKernel) {
        cildKernel.parent = this;
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<M_LabeledControl key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />);
    }

    canAppand() {
        return false;
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        switch (attrItem.name) {
            case AttrNames.EditorType:
                this.__genEditor();
                break;
            case AttrNames.TextField:
                var labelParseRet = parseObj_CtlPropJsBind(newValue);
                if (labelParseRet.isScript) {
                    return;
                }
                if (this.editor.hasAttribute(AttrNames.TextField)) {
                    var editorTextField = this.editor.getAttribute(AttrNames.TextField);
                    if (editorTextField == '') {
                        this.editor.setAttribute(AttrNames.TextField, newValue);
                    }
                    else {
                        var canUseCols_arr = GetKernelCanUseColumns(this);
                        if (canUseCols_arr.indexOf(newValue) != -1) {
                            this.editor.setAttribute(AttrNames.TextField, newValue);
                        }
                    }
                }
                break;
            case AttrNames.Nullable:
                if (this.editor.hasAttribute(AttrNames.Nullable)) {
                    this.editor.setAttribute(AttrNames.Nullable, newValue);
                }
                break;
        }
    }

    __genEditor(createHelper, editorKernelJson) {
        if (this.editor != null) {
            this.editor.parent = null;
            this.editor.delete(true);
            this.editor = null;
            this.children.length = 0;
        }
        var editorType = this.getAttribute(AttrNames.EditorType);
        var creatParam = {};
        var editorKernelConfig;
        var isUserControl = false;
        if (editorType.indexOf(UserControlKernel_Type) == 0) {
            isUserControl = true;
            var tem_arr = editorType.split('-');
            editorType = UserControlKernel_Type;
            creatParam.refID = tem_arr[1];
        }
        editorKernelConfig = DesignerConfig.findConfigByType(editorType);
        if (editorKernelConfig != null) {
            this.editor = new editorKernelConfig.kernelClass(creatParam, this, createHelper, editorKernelJson);
            if (createHelper == null && !isUserControl) {
                if (this.editor.hasAttribute(AttrNames.TextField)) {
                    var editorTextField = this.editor.getAttribute(AttrNames.TextField);
                    if (IsEmptyString(editorTextField)) {
                        this.editor.setAttribute(AttrNames.TextField, this.getAttribute(AttrNames.TextField));
                    }
                }
            }
            var editorNullableAttr = this.editor.findAttributeByName(AttrNames.Nullable);
            if (editorNullableAttr) {
                this.editor.setAttribute(AttrNames.Nullable, this.getAttribute(AttrNames.Nullable));
                editorNullableAttr.setVisible(this.editor, false);
            }
            var editorIsDisplayAttr = this.editor.findAttributeByName(AttrNames.Isdisplay);
            if (editorIsDisplayAttr) {
                editorIsDisplayAttr.setVisible(this.editor, false);
            }
            this.editor.isfixed = true;
            this.children = [this.editor];
        }
    }

    removeChild() {
        // valid
    }

    getTextValueFieldValue() {
        var rlt = super.getTextValueFieldValue();
        if (this.getAttribute(AttrNames.InteractiveType) == EInterActiveType.ReadWrite) {
            rlt.interact = this.getAttribute(AttrNames.InteractiveField);
        }
        return rlt;
    }

    getJson(jsonProf) {
        var rlt = super.getJson(jsonProf);
        rlt.editor = this.editor == null ? null : this.editor.getJson(jsonProf);
        return rlt;
    }
}

var M_LabeledControl_api = new ControlAPIClass(M_LabeledControlKernel_Type);
M_LabeledControl_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField, M_LabeledControlKernelAttrsSetting), 'label'));
M_LabeledControl_api.pushApi(new ApiItem_propsetter('label'));

g_controlApi_arr.push(M_LabeledControl_api);

class M_LabeledControl extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            label: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            editor: this.props.ctlKernel.editor,
            widthFactor: this.props.ctlKernel.getAttribute(AttrNames.WidthFactor),
            renderMode: this.props.ctlKernel.getAttribute(AttrNames.RenderMode),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.TextField,
            AttrNames.EditorType,
            AttrNames.InteractiveType,
            AttrNames.Nullable,
            AttrNames.WidthFactor,
            AttrNames.RenderMode,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            label: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            editor: this.props.ctlKernel.editor,
            widthFactor: this.props.ctlKernel.getAttribute(AttrNames.WidthFactor),
            renderMode: this.props.ctlKernel.getAttribute(AttrNames.RenderMode),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        var labelParseRet = parseObj_CtlPropJsBind(this.state.label);
        var showLabel = labelParseRet.isScript ? '{脚本}' : (IsEmptyString(labelParseRet.string) ? '[未设置]' : labelParseRet.string);
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>{showLabel}</div>);
        }
        var editor = ctlKernel.editor;
        var isUserControl = editor && editor.type == UserControlKernel_Type;
        if (editor.type == M_ContainerKernel_Type) {
            if (this.tryPlaceKernel == null) {
                this.tryPlaceKernel = M_ContainerBase_tryPlaceKernel.bind(this);
            }
        }
        else {
            this.tryPlaceKernel = null;
        }

        layoutConfig.addClass('hb-control');
        var interType = ctlKernel.getAttribute(AttrNames.InteractiveType);
        var interField = ctlKernel.getAttribute(AttrNames.InteractiveField);
        var nullable = ctlKernel.getAttribute(AttrNames.Nullable);
        var interFlag = interType == EInterActiveType.ReadOnly ? (<i className='fa fa-long-arrow-down text-info' />) : null;
        var nullableFlag = nullable ? (<i className='fa fa-square-o text-info' />) : null;
        var interFieldElem = IsEmptyString(interField) ? null : <span className='badge badge-info'>{interField}</span>;
        var leftElem = null;
        var belongPage = ctlKernel.searchParentKernel(M_PageKernel_Type, true);
        var renderMode = this.state.renderMode;
        var parentIsGridForm = ctlKernel.parent && ctlKernel.parent.type == M_FormKernel_Type && ctlKernel.parent.isGridForm() ? ctlKernel.parent : null;
        if (parentIsGridForm) {
            renderMode = ERenderMode.Mobile;
        }
        if (renderMode == ERenderMode.Auto) {
            if (belongPage) {
                renderMode = belongPage.ispcPage ? ERenderMode.PC : ERenderMode.Mobile;
            }
            else
            {
                var belongUserCtls_arr = ctlKernel.searchParentKernel(UserControlKernel_Type, false);
                var topest = belongUserCtls_arr[0];
                renderMode = topest.getAttribute('DefRender') == '电脑' ? ERenderMode.PC : ERenderMode.Mobile;
            }
        }

        if (renderMode == ERenderMode.PC) {
            var widthFactor = parseInt(this.state.widthFactor);
            layoutConfig.addClass('rowlFameTwo');
            layoutConfig.addClass('border');
            if (interFieldElem == null) {
                leftElem = <label className='d-flex flex-grow-0 flex-shrink-0' onClick={this.props.onClick}>
                    {showLabel}
                    {interFlag}
                    {nullableFlag}
                </label>;
            }
            else {
                leftElem = <div className='rowlFameOne_Left' onClick={this.props.onClick}>
                    <div className='d-flex flex-column'>
                        <div className='d-flex align-items-center'>
                            {showLabel}
                            {interFlag}
                            {nullableFlag}
                        </div>
                        {interFieldElem}
                    </div>
                </div>;
            }
            var widthValue = 150;
            switch (widthFactor) {
                case EWidthFactor.Half:
                    widthValue = 75;
                    break;
                case EWidthFactor.Scale:
                    widthValue = 0;
                    break;
                case EWidthFactor.Twice:
                    widthValue = 360;
                    break;
                case EWidthFactor.Triple:
                    widthValue = 550;
                    break;
            }
            if (widthValue > 0) {
                layoutConfig.style.width = widthValue + 'px';
            }
            else {
                layoutConfig.style.flexGrow = 1;
            }
            return (
                <div className={layoutConfig.getClassName()} style={layoutConfig.style} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {leftElem}
                    <div>
                        {editor != null && editor.renderSelf(this.props.onClick == ctlKernel.clickHandler ? null : this.props.onClick, null, this.props.designer)}
                    </div>
                </div>
            );
        }
        layoutConfig.addClass('rowlFameOne');

        if (interFieldElem == null) {
            leftElem = <div className='rowlFameOne_Left' onClick={this.props.onClick}>
                {showLabel}
                {interFlag}
                {nullableFlag}
            </div>;
        }
        else {
            leftElem = <div className='rowlFameOne_Left' onClick={this.props.onClick}>
                <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center'>
                        {showLabel}
                        {interFlag}
                        {nullableFlag}
                    </div>
                    {interFieldElem}
                </div>
            </div>;
        }
        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {leftElem}
                <div className='rowlFameOne_right'>
                    {editor != null && editor.renderSelf(this.props.onClick == ctlKernel.clickHandler ? null : this.props.onClick, null, this.props.designer)}
                </div>
            </div>
        );
    }
}


DesignerConfig.registerControl(
    {
        label: '操作控件',
        type: M_LabeledControlKernel_Type,
        namePrefix: M_LabeledControlKernel_Prefix,
        kernelClass: M_LabeledControlKernel,
        reactClass: M_LabeledControl,
    }, '基础');
