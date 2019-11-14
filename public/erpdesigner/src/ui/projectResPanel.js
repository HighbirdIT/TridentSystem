class ProjectResPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            nweUserControlName:''
        };
        this.state = initState;
        this.watchedAttrs = ['editingType'];
        this.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;

        autoBind(this,{exclude:[]});
    }

    clickAddPageHandler(ev){
        var project = this.props.project;
        project.createEmptyPage(project.getNowEditingType() == 'PC');
        this.reRender();
    }

    clickDeletePageHandler(ev){
        var pageID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        var thePage = project.getPageById(pageID);
        if(thePage == null){
            return;
        }
        gTipWindow.popAlert(makeAlertData('警告', '确定要删除页面:' + thePage.title,this.clickDeletePageTipCallback,[makeAlertBtnData('确定', 'ok'),makeAlertBtnData('取消', 'cancel')], pageID));
    }

    clickDeletePageTipCallback(key, pageID){
        if(key == 'ok'){
            var project = this.props.project;
            project.deletePage(pageID);
            this.reRender();
        }
    }

    clickPageitem(ev){
        var pageID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        project.setEditingPageById(pageID);
        this.reRender();
    }

    nweUserControlNameChanged(ev){
        this.setState({
            nweUserControlName:ev.target.value.trim(),
        });
    }

    clickCreateNewUserControlHandler(ev){
        if(this.props.project.addUserControl(this.state.nweUserControlName)){
            this.reRender();
        }
    }

    clickControlItem(ev){
        var ctlID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        project.setEditingControlById(ctlID);
        this.reRender();
    }

    clickTrashUserControlBtn(ev){
        var ctlID = getAttributeByNode(ev.target,'d-id', true);
        var project = this.props.project;
        var userCtl = project.getUserControlById(ctlID);
        if(userCtl == null){
            return;
        }
        gTipWindow.popAlert(makeAlertData('警告', '确定要删除自订控件:' + userCtl.name,this.clickDeleteUserControlTipCallback,[makeAlertBtnData('确定', 'ok'),makeAlertBtnData('取消', 'cancel')], userCtl));
    }

    clickDeleteUserControlTipCallback(key, userCtl){
        if(key == 'ok'){
            this.props.project.deleteUserControl(userCtl);
            this.reRender();
        }
    }

    reRender(){
        this.setState({
            magicObj:{}
        });
    }

    attrChangedHandler(ev){
        var needFresh = false;
        if(typeof ev.name === 'string'){
            needFresh = this.watchedAttrs.indexOf(ev.name) != -1;
        }
        else{
            needFresh = ev.name.some(this.watchAttrMatch);
        }
        if(needFresh){
            this.reRender();
        }
    }

    componentWillMount(){
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount(){
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
    }

    render() {
        var project = this.props.project;
        var editingType = project.designeConfig.editingType;
        var editingPage = project.getEditingPage();
        var editingControl = project.getEditingControl();

        var pagesElem = null;
        if(editingType == 'MB'){
            pagesElem = <React.Fragment>
                <div className='bg-secondary text-light'>手机页面</div>
                <div className='list-group flex-shrink-0'>
                    {
                        project.content_Mobile.pages.map((page)=>{
                            return (<div key={page.id} d-id={page.id} className='d-flex align-items-center'><span onClick={this.clickPageitem} className={'list-group-item list-group-item-action ' + (editingPage == page ? 'active' : '')}>{page.title}</span><div onClick={this.clickDeletePageHandler} className='btn btn-dark'><i className='fa fa-trash text-danger fa-2x' /></div></div>);
                        })
                    }
                    <button className='btn btn-success' onClick={this.clickAddPageHandler} >新增手机页面</button>
                </div>
            </React.Fragment>
        }
        else{
            pagesElem = <React.Fragment>
                <div className='bg-secondary text-light'>PC端页面</div>
                <div className='list-group flex-shrink-0'>
                    {
                        project.content_PC.pages.map((page)=>{
                            return (<div key={page.id} d-id={page.id} className='d-flex align-items-center'><span onClick={this.clickPageitem} className={'list-group-item list-group-item-action ' + (editingPage == page ? 'active' : '')}>{page.title}</span><div onClick={this.clickDeletePageHandler} className='btn btn-dark'><i className='fa fa-trash text-danger fa-2x' /></div></div>);
                        })
                    }
                    <button className='btn btn-success' onClick={this.clickAddPageHandler} >新增电脑页面</button>
                </div>
                </React.Fragment>
        }

        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column autoScroll'>
                {pagesElem}
                <div className='bg-secondary text-light'>自订控件</div>
                <div className='list-group flex-shrink-0'>
                    {
                        project.userControls_arr.map((userctl)=>{
                            return (<div d-id={userctl.id} key={userctl.id} className={'d-flex  flex-shrink-0 list-group-item ' + (editingControl == userctl ? 'active' : '')}>
                                    <span onClick={this.clickControlItem} className='flex-grow-1 flex-shrink-1'>{userctl.name}[{userctl.id}]</span>
                                    <button onClick={this.clickTrashUserControlBtn} className='btn btn-danger'><i className='fa fa-trash' /></button>
                                </div>);
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
            project.designer.selectKernel(theKernel);
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