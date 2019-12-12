const FrameSetAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
    ]),
]);


class FrameSet extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            FrameSetKernel_Type,
            'PopperBtn',
            FrameSetAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CFrameSet key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}
var FrameSet_api = new ControlAPIClass(FrameSetKernel_Type);
g_controlApi_arr.push(FrameSet_api);

class CFrameSet extends React.PureComponent {
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
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>框架集</div>);
        }

        layoutConfig.addClass('hb-control');
        var showText = '框架集' + ctlKernel.id;

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
        label: '框架集',
        type: FrameSetKernel_Type,
        namePrefix: FilePreviewer_Prefix,
        kernelClass: FrameSet,
        reactClass: CFrameSet,
        canbeLabeled: true,
    }, '基础');