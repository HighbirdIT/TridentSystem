const M_PageKernelAttrsSetting = {
    groups_arr: [
        new CAttributeGroup('基本设置', [
            new CAttribute('标题', 'title', ValueType.String, true),
            new CAttribute('方向', 'orientation', ValueType.String, true, false, Orientation_Options_arr),
        ]),
        new CAttributeGroup('测试设置', [
            new CAttribute('测试', 'test', ValueType.String, true, 1),
        ]),
    ],
};

const M_PageKernel_Type = 'M_PageKernel';
const M_PageKernel_Prefix = 'M_P';

class M_PageKernel extends ContainerKernelBase {
    constructor(initData, project) {
        var thisInitData = extractPropsFromObj(initData,
            [{ name: 'title', default: '未命名页面' },
            { name: 'name', default: project.genControlName(M_PageKernel_Prefix) },
            { name: 'orientation', default: Orientation_V },]);
        super(thisInitData, project, '页面');

        var self = this;
        autoBind(self);
        this.attrbuteGroups = M_PageKernelAttrsSetting.groups_arr;

        var nowParent = this;
        for(var i=0;i<1;++i){
            var newC = new M_ContainerKernel(null, project);
            nowParent.appandChild(newC);
            nowParent = newC;
            for(var j=0;j<5;++j){
                newC.appandChild(new M_LabelKernel(null, project));
            }
        }
    }

    set_title(newTitle) {
        if (newTitle.length > 10) {
            newTitle = newTitle.substring(0, 10);
        }

        var flag = this.__setAttribute('title', newTitle);
        if (flag) {
            this.attrChanged('title');
        }
        return flag;
    }
}

class M_Page extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.ctlKernel.getAttribute('title'),
            ctlKernel: this.props.ctlKernel,
            children: this.props.ctlKernel.children,
            orientation: this.props.ctlKernel.orientation,
        };

        autoBind(this);
        M_ControlBase(this,['title', 'children', 'orientation']);
        M_ContainerBase(this);
    }

    aAttrChanged(changedAttrName) {
        var childrenVal = this.state.children;
        if (changedAttrName == 'children') {
            childrenVal = this.props.ctlKernel.children.concat();
        }
        //console.log(changedAttrName);
        this.setState({
            title: this.props.ctlKernel.getAttribute('title'),
            children: childrenVal,
            orientation: this.props.ctlKernel.orientation,
        });
    }

    renderPCPage() {
        return null;
    }

    renderMobilePage(ctlKernel) {
        var s = 'div';
        return (
            <React.Fragment>
                <div className="d-flex flex-grow-0 flex-shrink-1 text-light bg-primary align-items-baseline">
                    <div className="ml-1" href="#"><h5 className='icon icon-left-nav'></h5></div>


                    <div className="flex-grow-1 flex-shrink-1 justify-content-center d-flex" ><h3>{this.state.title}</h3></div>
                    <div className="ml-1" href="#">
                        <span className='icon icon-more-vertical mr-1' />
                    </div>
                </div>
                <div className={'flex-grow-1 felx-shrink-0 d-flex' + (this.state.orientation == Orientation_V ? ' flex-column' : '')} ref={this.rootElemRef}>
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