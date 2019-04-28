const M_ContainerKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
    ]),
]);

class M_ContainerKernel extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_ContainerKernel_Type,
            'Flex容器',
            M_ContainerKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );

        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler) {
        return (<M_Container key={this.id} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}

class M_Container extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, LayoutAttrNames_arr.concat([AttrNames.Orientation, AttrNames.Chidlren], inintState));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.children = ctlKernel.children;

        this.state = inintState;
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

    getDescendantControls(rlt_arr) {
        this.children.forEach(child => {
            switch (child.type) {
                case M_ContainerKernel_Type:
                    child.getDescendantControls(rlt_arr);
                    break;
                case M_FormKernel_Type:
                    break;
                default:
                    rlt_arr.push(child);
            }
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        var rootStyle = layoutConfig.style;

        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_Container_Empty');
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={rootStyle} ref={this.rootElemRef}></div>);
        }
        layoutConfig.addClass('M_Container');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        if (this.state.orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        if (this.props.ctlKernel.children.length == 0) {
            layoutConfig.addClass('M_Container_Empty');
        }

        return (
            <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {
                    this.props.ctlKernel.children.length == 0 ?
                        this.props.ctlKernel.id :
                        this.props.ctlKernel.children.map(childKernel => {
                            return childKernel.renderSelf();
                        })
                }
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: 'DIV',
        type: M_ContainerKernel_Type,
        namePrefix: M_ContainerKernel_Prefix,
        kernelClass: M_ContainerKernel,
        reactClass: M_Container,
    }, '布局');