class ProjectResPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            nweUserControlName:''
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

    nweUserControlNameChanged(ev){
        this.setState({
            nweUserControlName:ev.target.value.trim(),
        });
    }

    clickCreateNewUserControlHandler(ev){
        if(this.props.project.addUserControl(this.state.nweUserControlName)){
            this.setState({
                magicObj:{}
            });
        }
    }

    clickControlItem(ev){
        var ctlID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        project.setEditingControlById(ctlID);
        this.setState({
            magicObj:{}
        });
    }

    render() {
        var project = this.props.project;
        var editingPage = project.getEditingPage();
        var editingControl = project.getEditingControl();

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
                <div className='bg-secondary text-light'>自订控件</div>
                <div className='list-group'>
                    {
                        project.userControls_arr.map((userctl)=>{
                            return (<span onClick={this.clickControlItem} d-id={userctl.id} key={userctl.id} className={'list-group-item list-group-item-action ' + (editingControl == userctl ? 'active' : '')}>{userctl.name}[{userctl.id}]</span>);
                        })
                    }
                </div>
                <div className='d-flex flex-grow-0 flex-shrink-0'>
                    <input type='text' className='flexinput flex-grow-1 flex-shrink-1' onChange={this.nweUserControlNameChanged} value={this.state.nweUserControlName} />
                    <button type="button" onClick={this.clickCreateNewUserControlHandler} className='btn flex-grow-0 flex-shrink-0 btn-success' >创建控件</button>
                </div>
                <div className='bg-secondary text-light'>快捷功能</div>
                <QuickControlSelector project={project} />
            </div>
        )
    }
}

class QuickControlSelector extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
        };
        this.state = initState;

        autoBind(this);
    }

    getAllControls(){
        var controlId_map = this.props.project.controlId_map;
        var rlt_arr = [];
        for(var cid in controlId_map){
            for(var i = 0; i < rlt_arr.length; ++i){
                if(rlt_arr[i] > cid){
                    break;
                }
            }
            rlt_arr.splice(i, 0, cid);
        }
        return rlt_arr;
    }

    ctlIDChanged(newID){
        var project = this.props.project;
        var theKernel = project.getControlById(newID);
        this.setState({
            ctlpath:theKernel ? theKernel.getStatePath('','.',{},true) : null,
        });
        if(theKernel){
            var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
            project.setEditingPageById(belongPage.id);
            setTimeout(() => {
                project.designer.selectKernel(theKernel);
            }, 50);
        }
    }


    render(){
        return <div className='flex-shrink-0 flex-grow-0 d-flex flex-column'>
                <div>
                    <span className='text-light'>选取控件</span>
                    <DropDownControl itemChanged={this.ctlIDChanged} btnclass='btn-primary' options_arr={this.getAllControls} rootclass='flex-grow-1 flex-shrink-1' editable={true} value='' />
                </div>
                {this.state.ctlpath ? <div className='text-light'>{this.state.ctlpath}</div> : null}
            </div>
    }
}