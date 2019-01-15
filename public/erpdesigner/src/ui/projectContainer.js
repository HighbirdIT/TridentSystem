class TitleHeaderItem extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            title: this.props.project.getAttribute('title'),
        };

        this.state = initState;
        autoBind(this);
    }

    attrChangedHandler(ev){
        var needFresh = false;
        if(typeof ev.name === 'string'){
            needFresh = ev.name == 'title';
        }
        else{
            needFresh = ev.name.indexOf('title') != -1;
        }
        if(needFresh){
            this.setState({
                title: this.props.project.getAttribute('title'),
            });
        }
    }

    componentWillMount(){
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount(){
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
    }

    render() {
        return (
            <div className="btn-group" projectindex={this.props.index}>
                <button onClick={this.props.clickTitlehandler} type="button" className={"btn btn-" + (this.props.active ? 'primary' : 'dark')}>
                    {this.state.title}
                </button>
                {
                    !this.props.hideClose &&  <button onClick={this.props.clickClosehandler} className={"btn btn-" + (this.props.active ? 'primary' : 'dark')} type="button"><span>&times;</span></button>
                }
            </div>
        )
    }
}

class ProjectContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            projects: [
                //new CProject('员工信息管理'),
            ],
            selectedIndex: 0,
        };

        this.projManagerRef = React.createRef();
        this.creatProjRef = React.createRef();
        this.savePanelRef = React.createRef();
        this.state = initState;
        autoBind(this);
    }

    clickTitlehandler(ev) {
        var newIndex = this.getProjectIndexFromElem(ev.target);
        if (newIndex < 0)
            return;
        if (newIndex != this.state.selectedIndex) {
            this.setState({ selectedIndex: newIndex });
        }
    }

    getProjectIndexFromElem(elem) {
        while (elem && !elem.hasAttribute('projectindex')) {
            elem = elem.parentElement;
        }
        if (elem == null) {
            return -1;
        }
        return parseInt(elem.getAttribute('projectindex'));
    }

    clickClosehandler(ev) {
        var deleteIndex = this.getProjectIndexFromElem(ev.target);
        if (deleteIndex < 0)
            return;
        var new_arr = this.state.projects.concat();
        new_arr.splice(deleteIndex, 1);
        var selectedIndex = this.state.selectedIndex;
        if (selectedIndex >= new_arr.length) {
            selectedIndex = Math.max(new_arr.length - 1, 0);
        }
        this.setState({ projects: new_arr, selectedIndex: selectedIndex });
    }

    wantOpenProject(projTitle){
        var projects_arr = this.state.projects;
        var nowProj = projects_arr.find(item=>{return item.title == projTitle});
        if(nowProj != null){
            console.log(projTitle + '已经打开过了');
            return false;
        }
        var path = 'files/proj/' + projTitle + '.json';
        this.openingProj={
            path:path,
            title:projTitle,
        }
        fetchJsonGet(path, {rnd:Math.random()}, this.fetchProjJsonCallback);
        return true;
    }

    fetchProjJsonCallback(response){
        if(response.success){
            var newProject = new CProject(null, response.json);
            var newProjects = this.state.projects.concat(newProject);
            this.setState({
                projects:newProjects
            });

            var openPage_his = ReplaceIfNull(Cookies.get('openPage_his'),'');
            var t_arr = openPage_his.split('|P|');
            var newProjTitle = this.openingProj.title;
            var index = t_arr.indexOf(newProjTitle);
            if(index != 0){
                var newHis = newProjTitle;
                t_arr.forEach(item=>{
                    if(item != newProjTitle && item != null && item.length > 0){
                        newHis += '|P|' + item;
                    }
                });
                Cookies.set('openPage_his', newHis, { expires: 7 });
            }
        }
        else{
            gTipWindow.popAlert(makeAlertData('错误','[' + this.openingProj.path + ']文件未能在服务器中找到',null,[TipBtnOK]));
        }
    }

    wantSaveProject(project){
        this.savePanelRef.current.saveProject(project);
    }
    
    createEmptyProject(){
        var emptyProj = new CProject('未命名方案');
        var newProjects = this.state.projects.concat(emptyProj);
        this.setState({
            projects:newProjects
        });
    }

    logCompleteFun(){
        var self = this;
        //self.projManagerRef.current.toggle();
        this.setState({
            magicObj:{},
        });

        var openPage_his = Cookies.get('openPage_his');
        if(openPage_his != null){
            console.log(openPage_his);
            var arr = openPage_his.split('|P|');
            if(this.wantOpenProject(arr[0])){
                return;
            }
        }

        setTimeout(() => {
            //self.createEmptyProject();
            self.projManagerRef.current.toggle();
        }, 200);
    }

    /*
    changeProjectVersion(index, isPC) {
        if (index < 0)
            return;
        if (this.state.projects[index].config.isPC == isPC) {
            if (this.state.selectedIndex != index) {
                this.setState({ selectedIndex: index });
            }
            return;
        }
        var new_arr = updateItemInArrayByIndex(this.state.projects, index, item => {
            var newConfig = updateObject(item.config, { isPC: isPC });
            return updateObject(item, { config: newConfig });
        });

        var selectedIndex = this.state.selectedIndex == index ? this.state.selectedIndex : index;
        this.setState({ projects: new_arr, selectedIndex: selectedIndex });
    }
    */

    switchProjectVersion(index) {
        if (index < 0)
            return;
        var theProject = this.state.projects[index];
        var newConfig = updateObject(theProject.config, { isPC: (theProject.config.isPC ? 0 : 1) });
        this.changeProjectConfig(index, newConfig);
    }

    changeProjectConfig(index, newConfig) {
        if (index < 0)
            return;
        var new_arr = updateItemInArrayByIndex(this.state.projects, index, item => {
            item.config = newConfig;
            return item;
        });
        this.setState({ projects: new_arr });
    }

    executCmd(cmdItem){
        if(LoginUser == null){
            return;
        }
        switch(cmdItem.cmd){
            case 'open':
            {
                this.projManagerRef.current.toggle();
                break;
            }
            case 'create':{
                this.createEmptyProject();
            }
        }
    }

    render() {
        var projectManager = this;
        return (
            <React.Fragment>
                <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                    <div className="btn-group flex-grow-0 flex-shrink-0" role="group">
                        <MenuItem id='MI_HB' text={"HB" + (LoginUser == null ? '' : LoginUser.name)} className='text-primary' >
                            <MenuCammandItem text="打开项目" cmd='open' executFun={this.executCmd} />
                            <MenuCammandItem text="创建空项目" cmd='create' executFun={this.executCmd} />
                        </MenuItem>
                        {
                            this.state.projects.map((item, i) => {
                                return (
                                    <TitleHeaderItem key={item.designeConfig.name} project={item} index={i} clickTitlehandler={this.clickTitlehandler} clickClosehandler = {this.clickClosehandler} active={i == this.state.selectedIndex} />
                                )
                            })
                        }
                    </div>
                    <ProjectManagerPanel ref={this.projManagerRef} wantOpenProjectFun={this.wantOpenProject} />
                    <LoginPanel logCompleteFun={this.logCompleteFun} />
                    <div className="flex-grow-1 flex-shrink-1 bg-dark d-flex" >
                        {
                            this.state.projects.map((item, i) => {
                                item.projectIndex = i;
                                item.projectManager = projectManager;
                                return (
                                    <ProjectDesigner key={item.designeConfig.name} project={item} className={'flex-grow-1 flex-shrink-1 ' + (this.state.selectedIndex == i ? 'd-flex' : 'd-none')} savePanelRef={this.savePanelRef} />
                                )
                            })
                        }

                    </div>
                </div>
                <RC_SavaPanel ref={this.savePanelRef} />
            </React.Fragment>
        );
    }
}

class RC_SavaPanel extends React.PureComponent {
    constructor(props){
        super(props);

        this.state={
            targetProject:null,
            saving:false,
            info:'',
        };
        autoBind(this);

        this.logManager = new LogManager('_savepanel');
    }

    saveProject(target){
        if(this.state.saving){
            console.warn('正在保存另一个方案');
            return;
        }
        this.logManager.clear();
        
        this.logManager.log('保存[' + target.title + ']');
        this.logManager.log('开始生成文件');
        var self = this;
        setTimeout(() => {
            self.do_getJson();
        }, 50);

        this.setState({
            show:true,
            targetProject:target,
            saving:true,
        });
    }

    do_getJson(){
        var projectJson = this.state.targetProject.getJson();
        this.projectJson = projectJson;
        this.logManager.log('生成文件成功');
        this.logManager.log('开始上传');
        var self = this;
        setTimeout(() => {
            self.do_fetch();
        }, 50);
    }

    do_fetch(){
        var self = this;
        fetchJsonPost('server', { action: 'saveProject', projJson: self.projectJson }, this.fetchComplete);
    }

    fetchComplete(respon){
        var newState = {
            saving:false,
        }
        if(respon.success){
            if(respon.json.err != null){
                this.logManager.error(respon.json.err.info);
            }
            else
            {
                this.logManager.log('上传成功');
                newState.show = false;
                var self = this;
                this.autoCloseTimeOut = setTimeout(() => {
                    self.clickCloseBtnHanlder();
                }, 2000);
            }
        }
        else{
            this.logManager.err(respon.json.err.info);
            
        }
        this.setState(newState);
    }

    componentWillMount(){

    }

    componentWillUnmount(){
        
    }

    clickCloseBtnHanlder(ev){
        if(this.autoCloseTimeOut){
            clearTimeout(this.autoCloseTimeOut);
            this.autoCloseTimeOut = null;
        }
        this.setState({
            show:false,
        });
    }
    
    render(){
        if(!this.state.show){
            return null;
        }
        return (<div className='maskDiv' >
                    <div className='fixedTipPanel bg-dark border'>
                        <LogOutputPanel source={this.logManager} />
                        {
                            !this.state.saving 
                            &&
                            <button type='button' className='w-100 btn btn-sm bg-danger text-light' onClick={this.clickCloseBtnHanlder} >关闭</button>
                        }
                    </div>
                </div>);
    }
}