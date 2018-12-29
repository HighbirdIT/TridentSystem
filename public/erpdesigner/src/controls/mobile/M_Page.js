const M_PageKernelAttrsSetting = {
    groups_arr: [
        new CAttributeGroup('基本设置', [
            new CAttribute('标题', AttrNames.Title, ValueType.String, '未命名页面'),
            new CAttribute('主页面', AttrNames.IsMain, ValueType.Boolean, false),
            new CAttribute('方向', AttrNames.Orientation, ValueType.String, Orientation_V, true, false, Orientation_Options_arr),
        ]),
        new CAttributeGroup('测试设置', [
            new CAttribute('测试', AttrNames.Test, ValueType.String,'', true, 1),
        ]),
    ],
};

class M_PageKernel extends ContainerKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData, 
            M_PageKernel_Type, 
            '页面',
            M_PageKernelAttrsSetting.groups_arr.concat(),
            parentKernel,
            createHelper,kernelJson
        );

        var self = this;
        autoBind(self);
        
        /*
        var nowParent = this;
        for(var i=0;i<1;++i){
            var newC = new M_ContainerKernel(null, project);
            nowParent.appandChild(newC);
            nowParent = newC;
            for(var j=0;j<5;++j){
                newC.appandChild(new M_LabelKernel(null, project));
            }
        }
        */
    }

    set_title(newTitle) {
        if (newTitle.length > 10) {
            newTitle = newTitle.substring(0, 10);
        }

        var flag = this.__setAttribute(AttrNames.Title, newTitle);
        if (flag) {
            this.attrChanged(AttrNames.Title);
        }
        return flag;
    }

    set_ismain(val){
        var flag = this.__setAttribute(AttrNames.IsMain, val);
        if (flag) {
            if(val){
                var project = this.project;
                project.mainPageChanged(this);
            }
            this.attrChanged(AttrNames.IsMain);
        }
        return flag;
    }
}

class M_Page extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
            ctlKernel: this.props.ctlKernel,
            children: this.props.ctlKernel.children,
            orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
        };

        autoBind(this);
        M_ControlBase(this,[AttrNames.Title, 
                            AttrNames.Chidlren, 
                            AttrNames.Orientation,
                            AttrNames.LayoutNames.APDClass,
                         ]);
        M_ContainerBase(this);
    }

    aAttrChanged(changedAttrName) {
        if(this.aAttrChangedBase(changedAttrName)){
            return;
        }
        var childrenVal = this.state.children;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = this.props.ctlKernel.children.concat();
        }
        //console.log(changedAttrName);
        this.setState({
            title: this.props.ctlKernel.getAttribute(AttrNames.Title),
            children: childrenVal,
            orientation: this.props.ctlKernel.getAttribute(AttrNames.Orientation),
        });
    }

    renderPCPage() {
        return null;
    }

    renderMobilePage(ctlKernel) {
        var layoutConfig = ctlKernel.getLayoutConfig();
        var rootDivClass = 'flex-grow-1 felx-shrink-0 d-flex' + (this.state.orientation == Orientation_V ? ' flex-column' : '');
        rootDivClass += layoutConfig.baseClassName;
        return (
            <React.Fragment>
                <div className="d-flex flex-grow-0 flex-shrink-1 text-light bg-primary align-items-baseline">
                    <div className="ml-1" href="#"><h5 className='icon icon-left-nav'></h5></div>


                    <div className="flex-grow-1 flex-shrink-1 justify-content-center d-flex" ><h3>{this.state.title}</h3></div>
                    <div className="ml-1" href="#">
                        <span className='icon icon-more-vertical mr-1' />
                    </div>
                </div>
                <div className={rootDivClass} ref={this.rootElemRef}>
                    {
                        this.state.children.map(childData => {
                            return childData.renderSelf()
                        })
                    }
                </div>
            </React.Fragment>
        )
    }

    render() {
        if (this.props.ctlKernel != this.state.ctlKernel) {
            var self = this;
            this.unlistenTarget(this.state.ctlKernel);
            this.listenTarget(this.props.ctlKernel);
            setTimeout(() => {
                self.setState({
                    title: this.props.ctlKernel.getAttribute('title'),
                    ctlKernel: this.props.ctlKernel,
                    children: this.props.ctlKernel.children,
                    orientation: this.props.ctlKernel.orientation,
                });
            }, 1);
            return null;
        }
        if (this.propsisPC) {
            return this.renderPCPage(this.props.ctlKernel);
        }
        else {
            return this.renderMobilePage(this.props.ctlKernel);
        }
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '页面',
        type: 'M_Page',
        invisible: true,
        kernelClass: M_PageKernel,
        controlClass: M_Page,
    }, '布局');