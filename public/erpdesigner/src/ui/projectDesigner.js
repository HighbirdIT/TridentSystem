class ProjectDesigner extends React.PureComponent{
    constructor(props){
        super(props);

        var initState = {
        };

        this.state = initState;
    }

    render(){
        var thisProject = this.props.project;
        thisProject.designer = this;
        return(
            <div className={this.props.className}>
                <ControlPanel project={thisProject} />
                <ContentPanel project={thisProject} />
                <AttributePanel project={thisProject} />
            </div>
        )
    }
}