class ContentPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var project = this.props.project;
        var initState = {
            isPC:project.config.isPC
        };
        this.state = initState;
        this.switchProjectVersion = this.switchProjectVersion.bind(this);
    }

    switchProjectVersion(){
        var project = this.props.project;
        project.projectManager.switchProjectVersion(project.projectIndex);
    }

    render() {
        var project = this.props.project;
        return (
            <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                <div className='flex-grow-0 flex-shrink-0 d-flex bg-secondary justify-content-center align-items-center text-light' style={{ height: '2.5em',overflow:'hidden' }}>
                    <h4 >{project.config.title}
                        
                    </h4>
                    <button type="button" className={"ml-1 p-0 btn btn-secondary dropdown-toggle dropdown-toggle-split"} data-toggle="dropdown">
                        <div className={"badge badge-pill ml-1 badge-" + (project.config.isPC ? "danger" : "success")}>
                            {project.config.isPC ? "电脑版" : "手机版"}
                        </div>
                    </button>
                    <div className="dropdown-menu">
                        <button onClick={this.switchProjectVersion} className="dropdown-item" type="button">{project.config.isPC ? '切换手机版' : '切换电脑版'}</button>
                    </div>
                </div>
                <div className='flex-grow-1 flex-shrink-1'>
                    
                </div>
            </div>
        )
    }
}