'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TitleHeaderItem = function (_React$PureComponent) {
    _inherits(TitleHeaderItem, _React$PureComponent);

    function TitleHeaderItem(props) {
        _classCallCheck(this, TitleHeaderItem);

        var _this = _possibleConstructorReturn(this, (TitleHeaderItem.__proto__ || Object.getPrototypeOf(TitleHeaderItem)).call(this, props));

        var initState = {
            title: _this.props.project.getAttribute('title')
        };

        _this.state = initState;
        autoBind(_this);
        return _this;
    }

    _createClass(TitleHeaderItem, [{
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var needFresh = false;
            if (typeof ev.name === 'string') {
                needFresh = ev.name == 'title';
            } else {
                needFresh = ev.name.indexOf('title') != -1;
            }
            if (needFresh) {
                this.setState({
                    title: this.props.project.getAttribute('title')
                });
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'btn-group', projectindex: this.props.index },
                React.createElement(
                    'button',
                    { onClick: this.props.clickTitlehandler, type: 'button', className: "btn btn-" + (this.props.active ? 'primary' : 'dark') },
                    this.state.title
                ),
                !this.props.hideClose && React.createElement(
                    'button',
                    { onClick: this.props.clickClosehandler, className: "btn btn-" + (this.props.active ? 'primary' : 'dark'), type: 'button' },
                    React.createElement(
                        'span',
                        null,
                        '\xD7'
                    )
                )
            );
        }
    }]);

    return TitleHeaderItem;
}(React.PureComponent);

var gFlowMasterRef = React.createRef();

var ProjectContainer = function (_React$PureComponent2) {
    _inherits(ProjectContainer, _React$PureComponent2);

    function ProjectContainer(props) {
        _classCallCheck(this, ProjectContainer);

        var _this2 = _possibleConstructorReturn(this, (ProjectContainer.__proto__ || Object.getPrototypeOf(ProjectContainer)).call(this, props));

        var initState = {
            projects: [
                //new CProject('员工信息管理'),
            ],
            selectedIndex: 0
        };

        _this2.projManagerRef = React.createRef();
        _this2.creatProjRef = React.createRef();
        _this2.savePanelRef = React.createRef();
        _this2.state = initState;
        autoBind(_this2);
        return _this2;
    }

    _createClass(ProjectContainer, [{
        key: 'clickTitlehandler',
        value: function clickTitlehandler(ev) {
            var newIndex = this.getProjectIndexFromElem(ev.target);
            if (newIndex < 0) return;
            if (newIndex != this.state.selectedIndex) {
                this.setState({ selectedIndex: newIndex });
            }
        }
    }, {
        key: 'getProjectIndexFromElem',
        value: function getProjectIndexFromElem(elem) {
            while (elem && !elem.hasAttribute('projectindex')) {
                elem = elem.parentElement;
            }
            if (elem == null) {
                return -1;
            }
            return parseInt(elem.getAttribute('projectindex'));
        }
    }, {
        key: 'clickClosehandler',
        value: function clickClosehandler(ev) {
            var deleteIndex = this.getProjectIndexFromElem(ev.target);
            if (deleteIndex < 0) return;
            var new_arr = this.state.projects.concat();
            new_arr.splice(deleteIndex, 1);
            var selectedIndex = this.state.selectedIndex;
            if (selectedIndex >= new_arr.length) {
                selectedIndex = Math.max(new_arr.length - 1, 0);
            }
            this.setState({ projects: new_arr, selectedIndex: selectedIndex });

            var self = this;
            setTimeout(function () {
                self.openedPageChanged();
            }, 100);
        }
    }, {
        key: 'openedPageChanged',
        value: function openedPageChanged() {
            var newOpenPage_his = '';
            this.state.projects.forEach(function (project) {
                newOpenPage_his += (newOpenPage_his.length == 0 ? '' : '|P|') + project.title;
            });
            Cookies.set('openedPages', newOpenPage_his, { expires: 7 });
        }
    }, {
        key: 'wantOpenProject',
        value: function wantOpenProject(projTitle) {
            var projects_arr = this.state.projects;
            var nowProj = projects_arr.find(function (item) {
                return item.title == projTitle;
            });
            if (nowProj != null) {
                console.log(projTitle + '已经打开过了');
                return false;
            }
            var path = 'files/proj/' + projTitle + '.json';
            this.openingProj = {
                path: path,
                title: projTitle
            };
            fetchJsonGet(path, { rnd: Math.random() }, this.fetchProjJsonCallback);
            return true;
        }
    }, {
        key: 'synProjUseEntitiesCallback',
        value: function synProjUseEntitiesCallback(response) {
            var newProject = new CProject(null, response.json);
            var newProjects = this.state.projects.concat(newProject);
            this.setState({
                projects: newProjects
            });

            this.openedPageChanged();
            /*
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
            */
        }
    }, {
        key: 'fetchProjJsonCallback',
        value: function fetchProjJsonCallback(response) {
            if (response.success) {
                var self = this;
                g_dataBase.doSyn_Unload_bycodes(response.json.useEntities_arr, function () {
                    self.synProjUseEntitiesCallback(response);
                });
            } else {
                gTipWindow.popAlert(makeAlertData('错误', '[' + this.openingProj.path + ']文件未能在服务器中找到', null, [TipBtnOK]));
            }
        }
    }, {
        key: 'wantSaveProject',
        value: function wantSaveProject(project) {
            this.savePanelRef.current.saveProject(project);
        }
    }, {
        key: 'createEmptyProject',
        value: function createEmptyProject() {
            var emptyProj = new CProject('未命名方案');
            var newProjects = this.state.projects.concat(emptyProj);
            this.setState({
                projects: newProjects
            });
        }
    }, {
        key: 'logCompleteFun',
        value: function logCompleteFun() {
            var _this3 = this;

            var self = this;
            //self.projManagerRef.current.toggle();
            this.setState({
                magicObj: {}
            });

            var openedPages_cookie = Cookies.get('openedPages');
            if (openedPages_cookie != null && openedPages_cookie.length > 0) {
                //console.log(openPage_his);
                var arr = openedPages_cookie.split('|P|');
                arr.forEach(function (projTitle) {
                    if (projTitle.length > 0) {
                        _this3.wantOpenProject(projTitle);
                    }
                });
                return;
            }

            setTimeout(function () {
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

    }, {
        key: 'switchProjectVersion',
        value: function switchProjectVersion(index) {
            if (index < 0) return;
            var theProject = this.state.projects[index];
            var newConfig = updateObject(theProject.config, { isPC: theProject.config.isPC ? 0 : 1 });
            this.changeProjectConfig(index, newConfig);
        }
    }, {
        key: 'changeProjectConfig',
        value: function changeProjectConfig(index, newConfig) {
            if (index < 0) return;
            var new_arr = updateItemInArrayByIndex(this.state.projects, index, function (item) {
                item.config = newConfig;
                return item;
            });
            this.setState({ projects: new_arr });
        }
    }, {
        key: 'executCmd',
        value: function executCmd(cmdItem) {
            if (LoginUser == null) {
                return;
            }
            switch (cmdItem.cmd) {
                case 'open':
                    {
                        this.projManagerRef.current.toggle();
                        break;
                    }
                case 'create':
                    {
                        this.createEmptyProject();
                    }
                    break;
                case 'openflowmaster':
                    {
                        if (gFlowMasterRef.current) {
                            gFlowMasterRef.current.toggle();
                        }
                    }
                    break;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var projectManager = this;
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(CFlowMaster, { ref: gFlowMasterRef }),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0' },
                        React.createElement(
                            'div',
                            { className: 'btn-group flex-grow-1 flex-shrink-1', role: 'group' },
                            React.createElement(
                                MenuItem,
                                { id: 'MI_HB', text: "HB" + (LoginUser == null ? '' : LoginUser.name), className: 'text-primary' },
                                React.createElement(MenuCammandItem, { text: '\u6253\u5F00\u9879\u76EE', cmd: 'open', executFun: this.executCmd }),
                                React.createElement(MenuCammandItem, { text: '\u521B\u5EFA\u7A7A\u9879\u76EE', cmd: 'create', executFun: this.executCmd }),
                                React.createElement(MenuCammandItem, { text: '\u6253\u5F00\u6D41\u7A0B\u5927\u5E08', cmd: 'openflowmaster', executFun: this.executCmd })
                            ),
                            this.state.projects.map(function (item, i) {
                                return React.createElement(TitleHeaderItem, { key: item.designeConfig.name, project: item, index: i, clickTitlehandler: _this4.clickTitlehandler, clickClosehandler: _this4.clickClosehandler, active: i == _this4.state.selectedIndex });
                            })
                        ),
                        React.createElement(QuickKeyWordSynBar, null)
                    ),
                    React.createElement(ProjectManagerPanel, { ref: this.projManagerRef, wantOpenProjectFun: this.wantOpenProject }),
                    React.createElement(LoginPanel, { logCompleteFun: this.logCompleteFun }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 bg-dark d-flex' },
                        this.state.projects.map(function (item, i) {
                            item.projectIndex = i;
                            item.projectManager = projectManager;
                            return React.createElement(ProjectDesigner, { key: item.designeConfig.name, project: item, className: 'flex-grow-1 flex-shrink-1 ' + (_this4.state.selectedIndex == i ? 'd-flex' : 'd-none'), savePanelRef: _this4.savePanelRef });
                        })
                    )
                ),
                React.createElement(RC_SavaPanel, { ref: this.savePanelRef })
            );
        }
    }]);

    return ProjectContainer;
}(React.PureComponent);

var RC_SavaPanel = function (_React$PureComponent3) {
    _inherits(RC_SavaPanel, _React$PureComponent3);

    function RC_SavaPanel(props) {
        _classCallCheck(this, RC_SavaPanel);

        var _this5 = _possibleConstructorReturn(this, (RC_SavaPanel.__proto__ || Object.getPrototypeOf(RC_SavaPanel)).call(this, props));

        _this5.state = {
            targetProject: null,
            saving: false,
            info: ''
        };
        autoBind(_this5);

        _this5.logManager = new LogManager('_savepanel');
        return _this5;
    }

    _createClass(RC_SavaPanel, [{
        key: 'saveProject',
        value: function saveProject(target) {
            if (this.state.saving) {
                console.warn('正在保存另一个方案');
                return;
            }
            this.logManager.clear();

            this.logManager.log('保存[' + target.title + ']');
            this.logManager.log('开始生成文件');
            var self = this;
            setTimeout(function () {
                self.do_getJson();
            }, 50);

            this.setState({
                show: true,
                targetProject: target,
                saving: true
            });
        }
    }, {
        key: 'do_getJson',
        value: function do_getJson() {
            var projectJson = this.state.targetProject.getJson();
            this.projectJson = projectJson;
            this.logManager.log('生成文件成功');
            this.logManager.log('开始上传');
            var self = this;
            setTimeout(function () {
                self.do_fetch();
            }, 50);
        }
    }, {
        key: 'do_fetch',
        value: function do_fetch() {
            var self = this;
            fetchJsonPost('server', { action: 'saveProject', projJson: self.projectJson }, this.fetchComplete);
        }
    }, {
        key: 'fetchComplete',
        value: function fetchComplete(respon) {
            var newState = {
                saving: false
            };
            if (respon.success) {
                if (respon.json.err != null) {
                    this.logManager.error(respon.json.err.info);
                } else {
                    this.logManager.log('上传成功');
                    newState.show = false;
                    var self = this;
                    this.autoCloseTimeOut = setTimeout(function () {
                        self.clickCloseBtnHanlder();
                    }, 2000);
                }
            } else {
                this.logManager.err(respon.json.err.info);
            }
            this.setState(newState);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'clickCloseBtnHanlder',
        value: function clickCloseBtnHanlder(ev) {
            if (this.autoCloseTimeOut) {
                clearTimeout(this.autoCloseTimeOut);
                this.autoCloseTimeOut = null;
            }
            this.setState({
                show: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.state.show) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'maskDiv' },
                React.createElement(
                    'div',
                    { className: 'fixedTipPanel bg-dark border' },
                    React.createElement(LogOutputPanel, { source: this.logManager }),
                    !this.state.saving && React.createElement(
                        'button',
                        { type: 'button', className: 'w-100 btn btn-sm bg-danger text-light', onClick: this.clickCloseBtnHanlder },
                        '\u5173\u95ED'
                    )
                )
            );
        }
    }]);

    return RC_SavaPanel;
}(React.PureComponent);