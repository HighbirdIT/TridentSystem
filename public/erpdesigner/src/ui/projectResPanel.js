class ProjectResPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            
        };
        this.state = initState;

        autoBind(this,{exclude:[]});
    }

    clickAddMobilePageHandler(ev){
        var project = this.props.project;
        project.createEmptyPage(false);
        this.setState({
            magicObj:{}
        });
    }

    clickPageitem(ev){
        var pageID = ev.target.getAttribute('d-id');
        var project = this.props.project;
        project.setEditingPageById(pageID);
        this.setState({
            magicObj:{}
        });
    }

    render() {
        var project = this.props.project;
        var editingPage = project.getEditingPage();

        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                <div className='bg-secondary text-light'>手机页面</div>
                <div className='list-group'>
                    {
                        project.content_Mobile.pages.map((page)=>{
                            return (<span onClick={this.clickPageitem} d-id={page.id} key={page.id} className={'list-group-item list-group-item-action ' + (editingPage == page ? 'active' : '')}>{page.title}</span>);
                        })
                    }
                    <button className='btn btn-success' onClick={this.clickAddMobilePageHandler} >新增手机页面</button>
                </div>

                <div className='bg-secondary text-light'>PC端页面</div>
                <div className='list-group'>
                    {
                        project.content_PC.pages.map((page)=>{
                            return (<span onClick={this.clickPageitem} d-id={page.id} key={page.id} className={'list-group-item list-group-item-action ' + (editingPage == page ? 'active' : '')}>{page.title}</span>);
                        })
                    }
                </div>
            </div>
        )
    }
}