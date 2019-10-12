const M_ContainerKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_H, true, false, Orientation_Options_arr),
        new CAttribute('元素类型', AttrNames.TagType, ValueType.String, EContainerTag.Div, true, false, ContainerTag_arr),
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
            if(child.type == M_ContainerKernel_Type || child.type == Accordion_Type || (child.type == M_FormKernel_Type && child.isPageForm())){
                // 穿透div
                child.aidAccessableKernels(targetType, rlt_arr);
            }
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

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<M_Container key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

class M_Container extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, LayoutAttrNames_arr.concat([AttrNames.Orientation, AttrNames.Chidlren, AttrNames.TagType]));
        M_ContainerBase(this);

        inintState.orientation = ctlKernel.getAttribute(AttrNames.Orientation);
        inintState.tagtype = ctlKernel.getAttribute(AttrNames.TagType);
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
            tagtype: ctlKernel.getAttribute(AttrNames.TagType),
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
        if (this.props.ctlKernel.children.length == 0) {
            layoutConfig.addClass('M_Container_Empty');
        }

        var contentElem = this.props.ctlKernel.id;
        if (this.props.ctlKernel.children.length > 0) {
            contentElem = this.props.ctlKernel.children.map(childKernel => {
                return childKernel.renderSelf(this.props.replaceChildClick ? this.props.onClick : null, this.props.replaceChildClick, this.props.designer);
            });
        }
        var finalElem = null;
        switch (this.state.tagtype) {
            case EContainerTag.Div:
                if(this.state.orientation == Orientation_V){
                    layoutConfig.addClass('flex-column');
                }
                finalElem = <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </div>
                break;
            case EContainerTag.Span:
                finalElem = <span className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </span>
                break;
            case EContainerTag.H1:
                finalElem = <h1 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h1>
                break;
            case EContainerTag.H2:
                finalElem = <h2 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h2>
                break;
            case EContainerTag.H3:
                finalElem = <h3 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h3>
                break;
            case EContainerTag.H4:
                finalElem = <h4 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h4>
                break;
            case EContainerTag.H5:
                finalElem = <h5 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h5>
                break;
            case EContainerTag.H6:
                finalElem = <h6 className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                    {this.renderHandleBar()}
                    {contentElem}
                </h6>
                break;

        }

        return finalElem;
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
        canbeLabeled: true,
    }, '布局');