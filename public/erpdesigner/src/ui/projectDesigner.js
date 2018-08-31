class ProjectDesigner extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
        };

        this.state = initState;
        this.flowMCRef = React.createRef();
        this.contenPanelRef = React.createRef();
        this.attrbutePanelRef = React.createRef();
        this.outlineRef = React.createRef();
        autoBind(this);

        this.placingCtonrols = {};
        this.selectedKernel = null;
    }

    selectKernel(kernel){
        /*
        if(this.selectedKernel == kernel){
            return;
        }
        if(this.selectedKernel){
            this.selectedKernel.setSelected(false);
        }
        if(kernel){
            kernel.setSelected(true);
        }
        this.selectedKernel = kernel;
        */
        if(this.attrbutePanelRef.current)
            this.attrbutePanelRef.current.setTarget(kernel);
    }

    mouseDownControlIcon(ctltype, mouseX, mouseY) {
        this.contenPanelRef.current.endPlace();
        var thisProject = this.props.project;
        var newKernel = null;
        if(this.placingCtonrols[ctltype] && this.placingCtonrols[ctltype].parent == null){
            newKernel = this.placingCtonrols[ctltype];
        }
        else{
            newKernel = thisProject.createKernalByType(ctltype);
            this.placingCtonrols[ctltype] = newKernel;
        }
        if (newKernel == null) {
            console.warn('从' + ctltype + '创建控件失败！');
            return;
        }

        this.flowMCRef.current.setGetContentFun(() => {
            return (<span>放置:{newKernel.description}</span>)
        }, mouseX, mouseY);

        window.addEventListener('mouseup', this.mouseUpWithFlowHandler);
        newKernel.__placing = true;
        this.contenPanelRef.current.startPlace(newKernel);
    }

    mouseUpWithFlowHandler(ev) {
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpWithFlowHandler);
        this.contenPanelRef.current.endPlace();
    }

    FMpositionChanged(newPos) {
        if (this.contenPanelRef.current)
            this.contenPanelRef.current.placePosChanged(newPos);
    }

    render() {
        var thisProject = this.props.project;
        thisProject.designer = this;
        return (
            <div className={this.props.className}>
                <SplitPanel
                    defPercent={0.15}
                    barClass='bg-secondary'
                    panel1={<SplitPanel
                                        defPercent={0.7}
                                        fixedOne={false}
                                        flexColumn={true}
                                        panel1={<ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} />}
                                        panel2={<OutlinePanel project={thisProject} ref={this.outlineRef}/>}
                                    />}
                    panel2={
                        <SplitPanel defPercent={0.8}
                             fixedOne={false}
                             barClass='bg-secondary'
                             panel1={<ContentPanel project={thisProject} ref={this.contenPanelRef} />}
                             panel2={<AttributePanel project={thisProject} ref={this.attrbutePanelRef} />}
                            />
                            }
                />
                <FlowMouseContainer project={thisProject} ref={this.flowMCRef} positionChanged={this.FMpositionChanged} />
            </div>
        )
    }
}

/*
<ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} />
                <ContentPanel project={thisProject} ref={this.contenPanelRef}/>
                <div className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' style={{width:'350px'}}>
                    <AttributePanel project={thisProject}/>
                    <OutlinePanel project={thisProject}/>
                </div>

                <SplitPanel defPercent={0.1}
                             panel1={<ContentPanel project={thisProject} ref={this.contenPanelRef} />}
                             panel2={<div className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' style={{ width: '350px' }}>
                                        <AttributePanel project={thisProject} />
                                        <OutlinePanel project={thisProject} />
                                    </div>}
                            />
*/