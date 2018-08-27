
class M_Page extends React.PureComponent {
    constructor(props) {
        super(props);
        ApplyControlBase(this);
        this.state = {
            title: this.props.pageData.getAttribute('title'),
            pageData: this.props.pageData,
        };

        autoBind(this);

        this.watchedAttrs = ['pagetitle'];
        this.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;
    }

    componentWillMount() {
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount() {
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
    }

    attrChangedHandler(ev) {
        var needFresh = false;
        var changedAttrIndex = -1;
        if (typeof ev.name === 'string') {
            changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
            needFresh = changedAttrIndex != -1;
        }
        else {
            needFresh = ev.name.find(
                attrName => {
                    changedAttrIndex = this.watchedAttrs.indexOf(attrName);
                    return changedAttrIndex != -1;
                }
            ) != null;
        }
        if (needFresh) {
            var changedAttrName = this.watchedAttrs[changedAttrIndex];
            console.log(changedAttrName);
            this.setState({
                title: this.props.pageData.getAttribute('title'),
            });
        }
    }

    renderPCPage() {
        return null;
    }

    renderMobilePage(pageData) {
        return (
            <React.Fragment>
                <div className="d-flex flex-grow-0 flex-shrink-0 text-light bg-primary align-items-baseline">
                    <div className="ml-1" href="#"><h5 className='icon icon-left-nav'></h5></div>


                    <div className="flex-grow-1 flex-shrink-1 justify-content-center d-flex" ><h3>{this.state.title}</h3></div>
                    <div className="ml-1" href="#">
                        <span className='icon icon-more-vertical mr-1' />
                    </div>
                </div>
                <div className='flex-grow-1 felx-shrink-1 '>内容区</div>
                <div className='flex-grow-0 felx-shrink-0 bg-primary'>操作区</div>
            </React.Fragment>
        )
    }

    render() {
        if (this.props.pageData != this.state.pageData) {
            var self = this;
            setTimeout(() => {
                self.setState({
                    title: this.props.pageData.getAttribute('title'),
                    pageData: this.props.pageData,
                });
            }, 1);
            return null;
        }
        if (this.propsisPC) {
            return this.renderPCPage(this.props.pageData);
        }
        else {
            return this.renderMobilePage(this.props.pageData);
        }
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '页面',
        type: 'M_Page',
        invisible: true,
    }, '布局');