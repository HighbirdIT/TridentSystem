const HoverModes_arr = ['point', 'nearest'];

const ChartAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
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
        new CAttribute('图表类型', AttrNames.ChartType, ValueType.String, EChartType.Bar, true, false, ChartTypes_arr),
        new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true),
        genScripAttribute('生成图表数据', AttrNames.Function.GenarateChartData, EJsBluePrintFunGroup.CtlFun),
        new CAttribute('智能刷新', AttrNames.AutoPull, ValueType.Boolean, true),
        new CAttribute('Hover模式', 'hovermode', ValueType.String, 'point', true, false, HoverModes_arr),
        new CAttribute('intersect', 'intersect', ValueType.Boolean, true, true),
        new CAttribute(VarNames.Records_arr, VarNames.Records_arr, ValueType.Array, 1, false, false, null, null, false),
    ]),
]);

class ChartKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            ChartKernel_Type,
            'Chart',
            ChartAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var cusDsName = this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = this.project.dataMaster.getSqlBPByName(cusDsName);
        if (cusDS_bp == null) {
            cusDS_bp = this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = this.id;
        cusDS_bp.ctlKernel = this;
        cusDS_bp.group = 'ctlcus';
        this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);
        var self = this;
        autoBind(self);

        var theBP = this.project.scriptMaster.getBPByName(this.id + '_' + AttrNames.Function.GenarateChartData);
        this.scriptCreated(null, theBP);
    }

    getCanuseColumns() {
        return getDSAttrCanuseColumns.call(this, null, AttrNames.CustomDataSource);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CChartKernel key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    scriptCreated(attrName, scriptBP) {
        if (scriptBP == null) {
            return;
        }
        if(scriptBP.name.indexOf(AttrNames.Function.GenarateChartData) != -1) {
            scriptBP.setFixParam([VarNames.State,'records_arr','labelds_arr', 'datasets_arr']);
        }
    }
}
var Chart_api = new ControlAPIClass(ChartKernel_Type);
Chart_api.pushApi(new ApiItem_propsetter('title'));
Chart_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(VarNames.Records_arr, ChartAttrsSetting), VarNames.Records_arr, false));
Chart_api.pushApi(new ApiItem_propsetter(VarNames.Records_arr));
g_controlApi_arr.push(Chart_api);

class CChartKernel extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
        };

        autoBind(this);
        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, [
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
            AttrNames.Title,
        ]);

        inintState.title = ctlKernel.getAttribute(AttrNames.Title);
        this.state = inintState;
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        var ctlKernel = this.props.ctlKernel;
        this.setState({
            title: ctlKernel.getAttribute(AttrNames.Title),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>图表</div>);
        }

        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('border');
        var titleParserRet = parseObj_CtlPropJsBind(this.state.title, ctlKernel.project.scriptMaster);
        var title = titleParserRet.isScript ? (ReplaceIfNull(this.state.name, '') + '{脚本}') : (IsEmptyString(titleParserRet.string) ? '' : '[' + titleParserRet.string + ']');
        var showText = '图表[' + ctlKernel.id + ']' + title;

        return (
            <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {showText}
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: '图表',
        type: ChartKernel_Type,
        namePrefix: ChartKernel_Prefix,
        kernelClass: ChartKernel,
        reactClass: CChartKernel,
        canbeLabeled: true,
    }, '基础');