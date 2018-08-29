class ProjectDesigner extends React.PureComponent{
    constructor(props){
        super(props);
        var initState = {
        };

        this.state = initState;
        this.flowMCRef = React.createRef();
        autoBind(this);
    }

    mouseDownControlIcon(ctltype,mouseX,mouseY){
        //console.log(ctltype);
        //console.log(this.flowMCRef);
        this.flowMCRef.current.setGetContentFun(()=>{
            return (<span>{ctltype}</span>)
        },mouseX,mouseY);

        window.addEventListener('mouseup', this.mouseUpWithFlowHandler);
    }

    mouseUpWithFlowHandler(ev){
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpWithFlowHandler);
    }

    render(){
        var thisProject = this.props.project;
        thisProject.designer = this;
        return(
            <div className={this.props.className}>
                <ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} />
                <ContentPanel project={thisProject} />
                <AttributePanel project={thisProject}/>
                <FlowMouseContainer project={thisProject} ref={this.flowMCRef} />
            </div>
        )
    }
}