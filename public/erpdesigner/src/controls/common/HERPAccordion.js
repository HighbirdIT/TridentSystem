const HERPAccordionKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('标题',AttrNames.Title,ValueType.String,''),
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        genIsdisplayAttribute(),
        new CAttribute('初始折叠', AttrNames.InitCollapsed, ValueType.Boolean, false),
    ]),
]);


class HERPAccordionKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                Accordion_Type,
                '可折叠控件',
                HERPAccordionKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        this.hadReactClass = true;
        var self = this;
        autoBind(self);
    }

    aidAccessableKernels(targetType, rlt_arr) {
        var needFilt = targetType != null;
        this.children.forEach(child => {
            if (!needFilt || child.type == targetType) {
                rlt_arr.push(child);
            }
            if (child.editor && (!needFilt || child.editor.type == targetType)) {
                rlt_arr.push(child.editor);
            }
            if (child.type == M_ContainerKernel_Type || child.type == Accordion_Type) {
                // 穿透div
                child.aidAccessableKernels(targetType, rlt_arr);
            }
        });
    }

    __attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray){
    }


    renderSelf(clickHandler, replaceChildClick){
        return (<HERPAccordion key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

var Accordion_api = new ControlAPIClass(Accordion_Type);
g_controlApi_arr.push(Accordion_api);

class HERPAccordion extends React.PureComponent {
    constructor(props){
        super(props);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, LayoutAttrNames_arr.concat([AttrNames.Title,AttrNames.Orientation,AttrNames.Chidlren]));
        M_ContainerBase(this);
        
        inintState.children = ctlKernel.children;
        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.title = ctlKernel.getAttribute(AttrNames.Title);

        this.state = inintState;

        autoBind(this);
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
        this.setState({
            orientation: ctlKernel.getAttribute(AttrNames.Orientation),
            children: childrenVal,
            title: ctlKernel.getAttribute(AttrNames.Title),
        });
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('card');
        var rootStyle = layoutConfig.style;

        var bodyLayoutConfig = new ControlLayoutConfig();
        bodyLayoutConfig.addClass('d-flex');
        if (this.state.orientation == Orientation_V) {
            bodyLayoutConfig.addClass('flex-column');
        }
        bodyLayoutConfig.addClass('card-body');
        
        var title = IsEmptyString(this.state.title) ? '[未命名]' : this.state.title;
        return(
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                <div className='card-header text-primary btn btn-link'>
                    {title}(折叠控件)
                </div>
                <div className={bodyLayoutConfig.getClassName()}>
                {
                    ctlKernel.children.length == 0 ?
                    ctlKernel.id :
                    ctlKernel.children.map(childKernel => {
                        return childKernel.renderSelf(this.props.replaceChildClick ? this.props.onClick : null,this.props.replaceChildClick);
                    })
                }
                </div>
            </div>
        ); 
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : '可折叠控件',
        type : Accordion_Type,
        namePrefix : Accordion_Prefix,
        kernelClass:HERPAccordionKernel,
        reactClass:HERPAccordion,
    }, '布局');