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
        this.state = initState;
        autoBind(this);

        /*
        var self = this;
        setTimeout(() => {
            self.createEmptyProject();
        }, 100);
        */
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
        var nowProj = projects_arr.find(item=>{return item.label});
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

        setTimeout(() => {
            self.createEmptyProject();
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
                                    <ProjectDesigner key={i} project={item} className={'flex-grow-1 flex-shrink-1 ' + (this.state.selectedIndex == i ? 'd-flex' : 'd-none')} />
                                )
                            })
                        }

                    </div>
                </div>
            </React.Fragment>
        );
    }
}

