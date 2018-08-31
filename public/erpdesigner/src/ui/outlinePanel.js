class OutlineItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            collapsed:false,
            selected:false,
        };
        autoBind(this);
        React_Make_AttributeListener(this, ['children','selected','unselected']);
    }

    aAttrChanged(changedAttrName) {
        if(changedAttrName == 'children')
        {
            this.setState({
                magicObj: {},
            });
        }
        else if(changedAttrName == 'selected')
        {
            this.setState({
                selected: true,
            });
        }
        else if(changedAttrName == 'unselected')
        {
            this.setState({
                selected: false,
            });
        }
    }
    
    componentWillUnmount() {
        this.unlistenTarget(this.props.kernel);
    }

    toggleCollapse(){
        this.setState(
            {
                collapsed : !this.state.collapsed,
            }
        );
    }

    clickhandler(){
        this.state.kernel.project.designer.selectKernel(this.state.kernel);
    }

    render() {
        var self = this;
        if (this.state.kernel != this.props.kernel) {
            if (this.state.kernel) {
                this.unlistenTarget(this.state.kernel);
            }
            if (this.props.kernel) {
                this.listenTarget(this.props.kernel);
            }
            setTimeout(() => {
                self.setState({
                    kernel: self.props.kernel,
                });
            }, 1);
            return null;
        }

        var kernel = this.state.kernel;
        if(kernel == null )
            return null;
        var isContainer = kernel.children != null;
        var hasChild = isContainer && kernel.children.length > 0;
        return (
                <div key={kernel.name} className={'outlineItemDiv' + (kernel.parent.parent ? ' ' : ' topest') + (isContainer ? " d-felx flex-column" : '')}>
                    {!hasChild ? <div className='outlineItem flex-grow-1 flex-shrink-1' onClick={this.clickhandler}>{kernel.name}</div> 
                        : 
                        <div className='d-flex'>
                            <span onClick={this.toggleCollapse} className={'ml-1 icon-sm btn-secondary btn-sm' + (this.state.collapsed ? ' icon-right' : ' icon-down')} />
                            <div className='outlineItem flex-grow-1 flex-shrink-1' onClick={this.clickhandler}>{kernel.name}</div> 
                        </div>
                    }
                    
                {
                    this.state.collapsed || kernel.children == null || kernel.children.length == 0 ? null :
                    <div className='d-flex flex-column'>
                        {
                            kernel.children.map(childKernel => {
                                return (<OutlineItem key={childKernel.name} kernel={childKernel} />)
                            })
                        }
                    </div>
                }

                </div>
        );
    }
}

class OutlinePanel extends React.PureComponent {
    constructor(props) {
        super(props);
        var editingPage = this.props.project.getEditingPage();
        this.state = { editingPage: editingPage, };
        React_Make_AttributeListener(this, ['editingPage', 'children']);

        this.listenTarget(editingPage);
    }

    selectKernel(kernel){
        this.setState({selectedKernel:kernel});
    }

    componentWillMount() {
        this.listenTarget(this.props.project);
    }

    componentWillUnmount() {
        this.unlistenTarget(this.props.project);
    }

    aAttrChanged(changedAttrName) {
        if (changedAttrName == 'children') {
            this.setState({ magicObj: {} });
        }
        else if (changedAttrName == 'editingPage') {
            var newEditingPage = this.props.project.getEditingPage();
            if (newEditingPage != this.state.editingPage) {
                if (this.state.editingPage) {
                    this.unlistenTarget(this.state.editingPage);
                }
                if (newEditingPage) {
                    this.listenTarget(newEditingPage);
                }
                this.setState({
                    editingPage: newEditingPage,
                });
            }
        }
    }
    render() {
        return (
            <div id="outlineRoot" className="flex-grow-1 flex-shrink-1 bg-light d-flex flex-column mw-100">
                <button type="button" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{ borderRadius: '0em', height: '2.5em', overflow: 'hidden' }}>大纲</button>
                <div className='flex-grow-1 flex-shrink-1 autoScroll'>
                    {
                        this.state.editingPage && this.state.editingPage.children.map(
                            kernal => {
                                return <OutlineItem key={kernal.name} kernel={kernal} />
                            }
                        )
                    }
                </div>
            </div>
        );
    }
}