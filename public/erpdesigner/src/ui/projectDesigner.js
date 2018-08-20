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
                <ControlPanel project={thisProject} projconfig={thisProject.config} className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' />
                <ContentPanel project={thisProject} projconfig={thisProject.config} />
                <AttributePanel project={thisProject} />
            </div>
        )
    }
}