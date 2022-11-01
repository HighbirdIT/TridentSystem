
const DaLianStatusViewerAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
    ]),
]);

class DaLianStatusViewer extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            DaLianStatusViewerKernel_Type,
            'DaLianStatusViewer',
            DaLianStatusViewerAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CDaLianStatusViewer key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP == null){
            return;
        }
    }
}
var DaLianStatusViewer_api = new ControlAPIClass(DaLianStatusViewerKernel_Type);
// DaLianStatusViewer_api.pushApi(new ApiItem_propsetter('targetRecordID'));
g_controlApi_arr.push(DaLianStatusViewer_api);

class CDaLianStatusViewer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>大连构件加工追踪</div>);
        }

        layoutConfig.addClass('hb-control');
        var showText = '大连构件加工追踪' + ctlKernel.id;

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
        label: '大连构件加工追踪',
        type: DaLianStatusViewerKernel_Type,
        namePrefix: DaLianStatusViewerKernel_Prefix,
        kernelClass: DaLianStatusViewer,
        reactClass: CDaLianStatusViewer,
        canbeLabeled: false,
    }, '特殊');