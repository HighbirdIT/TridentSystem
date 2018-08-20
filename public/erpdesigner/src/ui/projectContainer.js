class ProjectContainer extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            projects: [
                new CProject('员工信息管理'),
                new CProject('行政管理'),
                new CProject('行政是的管理'),
            ],
            selectedIndex: 0,
        };

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

    render() {
        var projectManager = this;
        return (
            <React.Fragment>
                <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                    <div className="btn-group flex-grow-0 flex-shrink-0" role="group">
                        <MenuItem id='MI_HB' text="HB" className='text-primary' >
                            <MenuCammandItem text="打开" />
                            <MenuCammandItem text="创建" />
                        </MenuItem>
                        {
                            this.state.projects.map((item, i) => {
                                return (
                                    <div key={i} className="btn-group" projectindex={i}>
                                        <button onClick={this.clickTitlehandler} type="button" className={"btn btn-" + (this.state.selectedIndex == i ? 'primary' : 'dark')}>
                                            {item.config.title}
                                        </button>
                                        <button onClick={this.clickClosehandler} className={"btn btn-" + (this.state.selectedIndex == i ? 'primary' : 'dark')} type="button"><span>&times;</span></button>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="flex-grow-1 flex-shrink-1 bg-dark d-flex" >
                        {
                            this.state.projects.map((item, i) => {
                                item.projectIndex = i;
                                item.projectManager = projectManager;
                                return (
                                    <ProjectDesigner key={i} project={item} projConfig={item.config} className={'flex-grow-1 flex-shrink-1 ' + (this.state.selectedIndex == i ? 'd-flex' : 'd-none')} />
                                )
                            })
                        }

                    </div>
                </div>
            </React.Fragment>
        );
    }
}

