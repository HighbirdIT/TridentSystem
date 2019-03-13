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

    clickDeleteMobilePageHandler(ev){
        var pageID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        var thePage = project.getPageById(pageID);
        if(thePage == null){
            return;
        }
        gTipWindow.popAlert(makeAlertData('警告', '确定要删除页面:' + thePage.title,this.clickDeleteMobilePageTipCallback,[makeAlertBtnData('确定', 'ok'),makeAlertBtnData('取消', 'cancel')], pageID));
    }

    clickDeleteMobilePageTipCallback(key, pageID){
        if(key == 'ok'){
            var project = this.props.project;
            project.deletePage(pageID);
            this.setState({
                magicObj:{}
            });
        }
    }

    clickPageitem(ev){
        var pageID = getAttributeByNode(ev.target,'d-id', true);
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
                            return (<div key={page.id} d-id={page.id} className='d-flex align-items-center'><span onClick={this.clickPageitem} className={'list-group-item list-group-item-action ' + (editingPage == page ? 'active' : '')}>{page.title}</span><div onClick={this.clickDeleteMobilePageHandler} className='btn btn-dark'><i className='fa fa-trash text-danger fa-2x' /></div></div>);
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