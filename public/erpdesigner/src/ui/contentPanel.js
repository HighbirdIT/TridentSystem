class ContentPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var project = this.props.project;
        var editingPage = project.getEditingPage();
        var editingControl = project.getEditingControl();
        var initState = {
            isPC: this.props.project.designeConfig.editingType == 'PC',
            title: this.props.project.getAttribute('title'),
            editingPage: editingPage,
            editingControl: editingControl,
        };
        this.state = initState;

        this.watchedAttrs = ['title', 'editingType', 'editingPage'];
        this.pageCtlRef = React.createRef();
        this.userCtlRef = React.createRef();

        autoBind(this);
    }

    toggleProjectEditingType() {
        this.props.project.toggleEditingType();
    }

    attrChangedHandler(ev) {
        var needFresh = false;
        var changedAttrIndex = -1;
        if (typeof ev.name === 'string') {
            changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
            needFresh = changedAttrIndex != -1;
        }
        else {
            needFresh = ev.name.find(
                attrName => {
                    changedAttrIndex = this.watchedAttrs.indexOf(attrName);
                    return changedAttrIndex != -1;
                }
            ) != null;
        }
        if (needFresh) {
            var newEditingPage = this.props.project.getEditingPage();
            var editingControl = this.props.project.getEditingControl();
            var changedAttrName = this.watchedAttrs[changedAttrIndex];
            this.setState({
                isPC: this.props.project.designeConfig.editingType == 'PC',
                title: this.props.project.getAttribute('title'),
                editingPage: newEditingPage,
                editingControl: editingControl,
            });
            //console.log('changedAttrName:' + changedAttrName);
            if (changedAttrName == 'editingPage' && this.props.project.designer.attributePanel) {
                if(newEditingPage){
                    this.props.project.designer.attributePanel.setTarget(newEditingPage);   
                }
                else if(editingControl){
                    this.props.project.designer.attributePanel.setTarget(editingControl);   
                }
            }
        }
    }

    componentWillMount() {
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount() {
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
    }

    renderEditingPage(project, editingPage, isPC) {
        if (editingPage == null)
            return null;
        return (
            <div id='pageContainer' className={'bg-light d-flex flex-column border border-primary flex-grow-0 flex-shrink-1 rounded ' + (isPC ? 'pcPage' : 'mobilePage')} >
                <M_Page project={project} ctlKernel={editingPage} isPC={isPC} ref={this.pageCtlRef} designer={this.props.designer} />
            </div>
        );
    }

    renderEditingControl(project, editingControl){
        if (editingControl == null)
            return null;

        return (
                <div id='pageContainer' className='bg-light d-flex flex-column border border-primary flex-grow-0 flex-shrink-1 mobilePage rounded' >
                    <CUserControl project={project} ctlKernel={editingControl} ref={this.userCtlRef} designer={this.props.designer} />
                </div>
        );
    }

    changeEditingPageBtnClickHandler(ev) {
        var target = ev.target;
        var targetPageid = target.getAttribute('pageid');
        this.props.project.setEditingPageById(targetPageid);
    }

    changeEditingControlBtnClickHandler(ev) {
        var target = ev.target;
        var targetCtlid = target.getAttribute('ctlid');
        this.props.project.setEditingControlById(targetCtlid);
    }

    clickProjSettingBtnHandler(ev) {
        if (this.props.project.designer.attributePanel) {
            this.props.project.designer.attributePanel.setTarget(this.props.project);
        }
    }

    clickContentDivHander(ev) {
        var tNode = ev.target;
        var found = false;
        do {
            if (tNode.hasAttribute('id') && tNode.getAttribute('id') == 'pageContainer') {
                found = true;
                break;
            }
            tNode = tNode.parentNode;
        } while (tNode && tNode != document.body);
        if (found) {
            return;
        }
        if (this.props.project.designer.attributePanel) {
            if(this.state.editingPage){
                this.props.project.designer.attributePanel.setTarget(this.state.editingPage);
            }
            else if(this.state.editingControl){
                this.props.project.designer.attributePanel.setTarget(this.state.editingControl);
            }
        }
    }

    startPlace(ctlKernel) {
        this.placingKernel = ctlKernel;
    }

    endPlace(){
        if(this.placingKernel){
            this.placingKernel.__placing = false;
            if(this.placingKernel.parent){
                this.placingKernel.fireForceRender();
                this.props.project.designer.selectKernel(this.placingKernel);
            }
            else{
                console.log('reback');
            }
            this.placingKernel = null;
        }
    }

    placePosChanged(newPos){

        if(this.state.editingControl){
            this.userCtlRef.current.tryPlaceKernel(this.placingKernel,newPos);
        }
        else if(this.state.editingPage){
            this.pageCtlRef.current.tryPlaceKernel(this.placingKernel,newPos);
        }
        //var $rootDiv = $(this.pageCtlRef.current);
        //console.log($thisDiv);
        //console.log(newPos);
        //console.log($rootDiv.position());
        //console.log(this.pageCtlRef.current.getBoundingClientRect());
    }

    clickPanelNameBtn(ev){
        this.props.wantOpenPanel(getAttributeByNode(ev.target, 'pname', true, 3));
    }

    clickSaveBtnHanlder(ev){
        var project = this.props.project;
        /*
        var jsonData =  project.getJson();
        console.log(jsonData);
        */
        project.designer.saveProject();
    }

    clickCompileBtnHanlder(ev){
        var project = this.props.project;
        var compiler = new ProjectCompiler(project);
        compiler.compile();
    }

    clickPublickBtnHandler(ev){
        var project = this.props.project;
        project.logManager.clear();
        project.logManager.log('开始发布方案,结束前请不要操作本项目!');
        project.logManager.log('获取方案基础信息,');
        fetchJsonPost('server', { action: 'getProjectProfile', projTitle:project.title}, this.getProjectProfileCallBack);
    }

    clickExprotBtnHandler(ev){
        var project = this.props.project;
        var jsonData =  project.getJson();
        console.log(JSON.stringify(jsonData));
        /*
        var lzwCompress = window.lzwCompress;
        var t = lzwCompress.pack(jsonData);
        console.log(t);
        */
        //console.log(JSON.stringify(jsonData));
    }

    DataSizeToString(size) {
        var kbsize = Math.round(size / 1024);
        var sizeStr = '';
        if (kbsize < 1000) {
            sizeStr = kbsize + 'KB';
        }
        else {
            var mbsize = Math.round(10 * kbsize / 1024) / 10.0;
            if (mbsize < 1000) {
                sizeStr = mbsize + 'MB';
            }
            else {
                var gbsize = Math.round(10 * kbsize / 1024) / 10.0;
                sizeStr = gbsize + 'GB';
            }
        }
        return sizeStr;
    }

    logJsonSize(jsonObj, objName){
        if(typeof jsonObj != 'object'){
            return;
        }
        if(jsonObj.id){
            objName = jsonObj.id;
        }
        if(jsonObj.code){
            objName = jsonObj.code;
        }
        if(jsonObj.name){
            objName += '(' + jsonObj.name + ')';
        }
        var jsonStr = window.lzwCompress.pack(jsonObj);
        //var len = JSON.stringify(jsonObj).length;
        var len = jsonStr.length;
        console.log(objName + ': ' + this.DataSizeToString(len));
        if(jsonObj.id || jsonObj.code){
            return;
        }
        for(var n in jsonObj){
            this.logJsonSize(jsonObj[n], n)
        }
    }

    clickEvalSizeBtnHandler(ev){
        var project = this.props.project;
        var jsonData =  project.getJson();
        this.logJsonSize(jsonData, 'proj');
    }

    compileCompletedHandler(theCompile){
        var project = this.props.project;
        theCompile.off('completed', this.compileCompletedHandler);
        if(theCompile.isCompleted){
            project.logManager.log('开始上传');
            var compileResult = {
                mbLayoutName:'erppagetype_MA',
                pcLayoutName:'erppagetype_MA_PC',
                mobilePart:theCompile.mobileContentCompiler.getString(),
                pcPart:theCompile.pcContentCompiler.getString(),
                serverPart:theCompile.serverSide.getString(),
            };
            fetchJsonPost('server', { action: 'publishProject', projTitle:project.title, compileResult:compileResult}, this.uploadResultCallBack);
        }
        else{
            project.logManager.log('发布失败');
        }
    }

    uploadResultCallBack(respon){
        var project = this.props.project;
        if(respon.success){
            if(respon.json.err != null){
                project.logManager.error(respon.json.err.info);
                project.logManager.log('发布失败！');
                return;
            }
            project.logManager.log(respon.json.data.mobileUrl);
            project.logManager.log(respon.json.data.pcUrl);
            project.logManager.log('发布成功');
        }
        else{
            project.logManager.error(respon.json.err.info);
            project.logManager.log('发布失败！');
        }
    }

    getProjectProfileCallBack(respon){
        var project = this.props.project;
        if(respon.success){
            if(respon.json.err != null){
                project.logManager.error(respon.json.err.info);
                project.logManager.log('发布失败！');
                return;
            }
            project.logManager.log(JSON.stringify(respon.json.data));
            var compiler = new ProjectCompiler(project, respon.json.data);
            compiler.on('completed', this.compileCompletedHandler);
            compiler.compile();
        }
        else{
            project.logManager.error(respon.json.err.info);
            project.logManager.log('发布失败！');
        }
    }

    render() {
        var project = this.props.project;
        var isPC = this.state.isPC;
        var editingPage = this.state.editingPage;
        var editingControl = this.state.editingControl;
        return (
            <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                <div className='flex-grow-0 flex-shrink-0 d-flex bg-secondary projectContentHeader align-items-center'>
                    <div className='flex-grow-1 flex-shrink-1 d-flex justify-content-center align-items-center text-light'>
                        <h4 >
                            {this.state.title}
                        </h4>
                        <button type='button' onClick={this.clickProjSettingBtnHandler} className='btn btn-sm icon icon-gear bg-secondary ml-1' />
                        <button type="button" className={"ml-1 p-0 btn btn-secondary dropdown-toggle dropdown-toggle-split"} data-toggle="dropdown">
                            <div className={"badge badge-pill ml-1 badge-" + (isPC ? "danger" : "success")}>
                                {isPC ? "电脑版" : "手机版"}
                            </div>
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={this.toggleProjectEditingType} className="dropdown-item" type="button">{isPC ? '切换手机版' : '切换电脑版'}</button>
                        </div>
                    </div>
                    <div className='flex-grow-0 flex-shrink-1'>
                        <button type="button" className={"p-0 btn btn-secondary dropdown-toggle"} data-toggle="dropdown">
                            {editingPage ? editingPage.title : (editingControl ? '控件:' + editingControl.name : '暂无页面')}
                        </button>
                        <div className="dropdown-menu">
                            {(isPC ? project.content_PC.pages : project.content_Mobile.pages).map(page => {
                                return page == editingPage ? null : (<button key={page.id} onClick={this.changeEditingPageBtnClickHandler} className="dropdown-item" type="button" pageid={page.id}>{page.title}</button>)
                            })
                            }
                            <div className="dropdown-divider"></div>
                            {
                                project.userControls_arr.map(userCtl=>{
                                    return userCtl == editingControl ? null : (<button key={userCtl.id} onClick={this.changeEditingControlBtnClickHandler} className="dropdown-item bg-warning" type="button" ctlid={userCtl.id}>{userCtl.name}</button>)
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 minh-0'>
                    <div className='d-flex flex-grow-0 flex-shrink-0 flex-column'>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickPanelNameBtn} pname='datamaster' ><div>数据</div><div>大师</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickPanelNameBtn} pname='scriptmaster' ><div>脚本</div><div>大师</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickPanelNameBtn} pname='flowmaster' ><div>流程</div><div>大师</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickCompileBtnHanlder} ><div>编译</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickSaveBtnHanlder} ><div>保存</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickPublickBtnHandler} ><div>发布</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickExprotBtnHandler} ><div>导出</div></button>
                        <button type='button' className='btn btn-sm bg-dark text-light' onClick={this.clickEvalSizeBtnHandler} ><div>评估</div></button>
                    </div>
                    <div onClick={this.clickContentDivHander} className='flex-grow-1 flex-shrink-1 autoScroll d-flex width-1'>
                        {editingPage && this.renderEditingPage(project, editingPage, isPC)}
                        {editingControl && this.renderEditingControl(project, editingControl)}
                    </div>
                </div>
            </div>
        )
    }
}