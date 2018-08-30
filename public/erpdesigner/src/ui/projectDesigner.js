class ProjectDesigner extends React.PureComponent{
    constructor(props){
        super(props);
        var initState = {
        };

        this.state = initState;
        this.flowMCRef = React.createRef();
        this.contenPanelRef = React.createRef();
        autoBind(this);
    }

    mouseDownControlIcon(ctltype,mouseX,mouseY){
        this.contenPanelRef.current.endPlace();
        var thisProject = this.props.project;
        var newKernel = thisProject.createKernalByType(ctltype);
        if(newKernel == null){
            console.warn('从' + ctltype + '创建控件失败！');
            return;
        }

        this.flowMCRef.current.setGetContentFun(()=>{
            return (<span>放置:{newKernel.description}</span>)
        },mouseX,mouseY);

        window.addEventListener('mouseup', this.mouseUpWithFlowHandler);
        newKernel.__placing = true;
        this.contenPanelRef.current.startPlace(newKernel);
    }

    mouseUpWithFlowHandler(ev){
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpWithFlowHandler);
        this.contenPanelRef.current.endPlace();
    }

    FMpositionChanged(newPos){
        this.contenPanelRef.current.placePosChanged(newPos);
    }

    render(){
        var thisProject = this.props.project;
        thisProject.designer = this;
        return(
            <div className={this.props.className}>
                <ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} />
                <ContentPanel project={thisProject} ref={this.contenPanelRef}/>
                <AttributePanel project={thisProject}/>
                <FlowMouseContainer project={thisProject} ref={this.flowMCRef} positionChanged={this.FMpositionChanged}  />
            </div>
        )
    }
}