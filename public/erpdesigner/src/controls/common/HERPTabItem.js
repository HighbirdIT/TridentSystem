const HERPTabItemKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        new CAttribute('标题',AttrNames.Title,ValueType.String,''),
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        new CAttribute('图标类型', AttrNames.IconType, ValueType.String, ''),
        new CAttribute('有滚动条', AttrNames.AutoHeight, ValueType.Boolean, true),
        new CAttribute('不可见处理', AttrNames.InvisibleAct, ValueType.String, EInvisibleAct.Default, true, false, EInvisibleActs_arr),
    ]),
]);


class HERPTabItemKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
            TabItem_Type,
                '选项卡-子',
                HERPTabItemKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        this.banReParent = true;
        this.hadReactClass = true;
        var self = this;
        autoBind(self);
    }

    __attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray){
    }


    renderSelf(clickHandler, replaceChildClick, designer){
        return (<HERPTabItem key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

var Accordion_api = new ControlAPIClass(Accordion_Type);
g_controlApi_arr.push(Accordion_api);

class HERPTabItem extends React.PureComponent {
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
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');

        var rootStyle = layoutConfig.style;
        if (this.state.orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        
        return(
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    ctlKernel.children.length == 0 ?
                    ctlKernel.id :
                    ctlKernel.children.map(childKernel => {
                        return childKernel.renderSelf(this.props.replaceChildClick ? this.props.onClick : null,this.props.replaceChildClick, this.props.designer);
                    })
                }
            </div>
        ); 
    }
}

DesignerConfig.registerControl(
    {
        invisible : true,
        label : '选项卡-子',
        type : TabItem_Type,
        namePrefix : TabItem_Prefix,
        kernelClass:HERPTabItemKernel,
        reactClass:HERPTabItem,
    }, '布局');