
const ThreeDAppAAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genIsdisplayAttribute(),
        new CAttribute('关联项目代码', 'projectCode', ValueType.String, '', true, false, null, null, true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('APP类型', 'apptype', ValueType.String, EThreeDAppType.全局图拍照, true, false, ThreeDAppType_arr),
        new CAttribute('构件上传记录代码', 'targetRecordID', ValueType.String, '', true, false, null, null, true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        }),
        new CAttribute('最大探测距离', 'maxDistance', ValueType.Float, '', true, false, null, null),
    ]),
]);

class ThreeDAppA extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            ThreeDAppAKernel_Type,
            'ThreeDAppA',
            ThreeDAppAAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<CThreeDAppA key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }

    scriptCreated(attrName, scriptBP) {
        if(scriptBP == null){
            return;
        }
    }
}
var ThreeDAppA_api = new ControlAPIClass(ThreeDAppAKernel_Type);
ThreeDAppA_api.pushApi(new ApiItem_propsetter('targetRecordID'));
g_controlApi_arr.push(ThreeDAppA_api);

class CThreeDAppA extends React.PureComponent {
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
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>参数拍照APP</div>);
        }

        layoutConfig.addClass('hb-control');
        var showText = '参数拍照APP' + ctlKernel.id;

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
        label: '参数拍照APP',
        type: ThreeDAppAKernel_Type,
        namePrefix: ThreeDAppAKernel_Prefix,
        kernelClass: ThreeDAppA,
        reactClass: CThreeDAppA,
        canbeLabeled: false,
    }, '特殊');