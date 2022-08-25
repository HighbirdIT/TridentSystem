class CWCB构件记录{
    constructor(rcd){
        rcd.X *= 0.001;
        rcd.Y *= 0.001;
        rcd.Z *= 0.001;

        this.rcd = rcd;
        this.构件全称 = rcd.真构件完整编号;
        if(this.构件全称 == null){
            this.构件全称 = rcd.构件全称;
        }
        this.worldPos = new THREE.Vector3(rcd.X,rcd.Y,rcd.Z);
        this.构件上传记录代码 = rcd.构件上传记录代码;
        this.上传记录代码 = rcd.构件上传记录代码;
        this.复核参数_arr = [];
        this.相邻构件_arr = [];
        this.asyned = false;
    }
}

class ERPC_ThreeDApp_AZWCB extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);
        ERP_ThreeDAppBase(this,
            {
                showingModelPath: null,
                doneVisible: true,
                undoneVisible: true,
                otherParamVisible: false,
                全局模型文件代码:null,
                全局模型文件路径:null,
                上传记录代码:0,
                drawing:{}
            });

        this.drawingDataDirted = true;
        this.focus构件记录 = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};

        this.initApp = InitApp1.bind(this);
    }

    doPopWCBSelector(ev){
        popWCBSelector(this.构件选择Callback);
    }

    clickExitButtonHandler(ev) {
        this.doPopWCBSelector();
    }

    clickShotHandler(ev) {
        if(this.focus构件记录Btn == null){
            return;
        }
        let elem = ev.target;
        let record_id = 0;
        while (elem != null) {
            let tid = elem.getAttribute('record_id');
            if(!isNaN(tid)){
                record_id = parseInt(tid);
                break;
            }
            elem = elem.parentElement;
        }
        let 参数记录 = this.focus构件记录Btn.复核参数_arr.find(x=>{return x.参数上传数据代码 == record_id;});
        if(参数记录 != null){
            const self = this;
            let callBack = () => {
                if(参数记录.拍照状态 == 0){
                    参数记录.拍照状态 = 1;
                    self.setState({magicObj:{}});
                }
            };
            if(参数记录.是多点拍照 == 1){
                shotMultiComParam(225,参数记录.参数上传数据代码,4, callBack);
            }
            else{
                shotComParam(225,参数记录.参数上传数据代码,4, callBack);
            }
        }
    }

    getNext构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) + 1;
        if (index >= this.构件上传记录_arr.length) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        return rlt;
    }

    getPre构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) - 1;
        if (index < 0) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        return rlt;
    }

    构件记录Changed(want构件记录) {
        if (want构件记录 == this.focus构件记录Btn) {
            return;
        }

        const controls = this.controls;
        let self = this;

        if (this.focus构件记录Btn != null) {
            if(this.focus构件记录Btn.object3d){
                SetObejectMaterail(this.focus构件记录Btn.object3d, 判断构件使用Mat(this.focus构件记录Btn.生存状态代码));
            }

            if (this.TargetToEye_vec == null) {
                this.TargetToEye_vec = new THREE.Vector3(0, 0, 0);
            }
            this.TargetToEye_vec.subVectors(this.camera.position, this.controls.target);
        }
        // this.构件模型Parant.clear();
        this.focus构件记录Btn = want构件记录;
        if (want构件记录 == null) {
            controls.enablePan = true;
        }
        else {
            if(want构件记录.object3d){
                SetObejectMaterail(want构件记录.object3d, focusComponentModelMat);
            }

            if(want构件记录.asyned == false){
                // 同步构件数据
                this.setState({
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: `加载${want构件记录.构件全称}数据`,
                    fetch_error: '',
                });

                nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: want构件记录.上传记录代码,最大距离:5 }, action: 'pulldata_同步WCB信息' }).then(json => {
                    if (json.err != null) {
                        self.setState({
                            fetch_error: `出错了:${JSON.stringify(json.err)}`,
                        });
                        return;
                    }
                    // console.log(json);
                    want构件记录.复核参数_arr = json.data.参数rcd_arr;
                    var 相邻构件_arr = [];
                    json.data.相邻rcd_arr.forEach(rcd=>{
                        if(this.构件上传记录_map[rcd.构件上传记录代码] == null){
                            this.构件上传记录_map[rcd.构件上传记录代码] = new CWCB构件记录(rcd);
                        }
                        var 构件记录 = this.构件上传记录_map[rcd.构件上传记录代码];
                        构件记录.文件路径 = rcd.模型文件路径;
                        构件记录.构件生存状态代码 = rcd.构件生存状态代码;
                        相邻构件_arr.push(构件记录);
                    });
                    want构件记录.相邻构件_arr = 相邻构件_arr;
                    want构件记录.asyned = true;
                    self.needDownloadItems = 相邻构件_arr;
                    self.download构件模型();
                });
            }
            else{
                self.needDownloadItems = want构件记录.相邻构件_arr;
                self.download构件模型();
            }
        }
        this.setState({
            focus构件记录: this.focus构件记录Btn,
        });
    }

    download构件模型() {
        if (this.focus构件记录Btn == null) {
            return;
        }
        let now构件记录 = this.focus构件记录Btn;
        let downLoadItem = null;
        for (var si in this.needDownloadItems) {
            var item = this.needDownloadItems[si];
            if (item.object3d == null) {
                downLoadItem = item;
                break;
            }
        }
        const self = this;
        if (downLoadItem == null) {
            if(this.state.fetching){
                self.setState({
                    fetching: false,
                    fetch_percent: 0,
                });
            }
            const controls = this.controls;
            let targetPos = now构件记录.worldPos;
            let eyePos = null;
            let pos_center = new THREE.Vector3(0, 0, targetPos.z);
            let theVec = new THREE.Vector3();
            theVec.subVectors(targetPos, pos_center);
            theVec.normalize();
            eyePos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z + 1);
            eyePos.addScaledVector(theVec, 1);
            if (this.TargetToEye_vec) {
                eyePos.copy(targetPos);
                eyePos.add(this.TargetToEye_vec);
            }
            this.camera.position.copy(eyePos);

            controls.target.copy(targetPos);
            controls.enablePan = false;
            controls.update();

            return;
        }

        this.load3dm(downLoadItem.文件路径,`加载${downLoadItem.构件全称}实体模型`,0,1,(object)=>{
            self.setState({
                fetch_title: '解析实体模型',
            });
            try {
                for (var si in object.children) {
                    TurnOffShadow(object.children[si]);
                }
                downLoadItem.object3d = object;
                const controls = self.controls;

                self.构件模型Parant.add(object);
                let box = new THREE.Box3();
                box.expandByObject(object);
                let size = new THREE.Vector3();
                let center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                downLoadItem.center = center;
                if (downLoadItem == now构件记录) {
                    controls.target.copy(center);
                    SetObejectMaterail(object, focusComponentModelMat);
                }
                else {
                    SetObejectMaterail(object, 判断构件使用Mat(downLoadItem.生存状态代码));
                }

                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            } catch (eo) {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${eo.message}`),
                });
            }
        });
    }

    clickPreButtonHandler(ev) {
        let newItem = this.getPre构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ 上传记录代码: newItem.上传记录代码 });
        }
    }

    clickNextButtonHandler(ev) {
        let newItem = this.getNext构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ 上传记录代码: newItem.上传记录代码 });
        }
    }


    构件选择Callback(rlt) {
        if (rlt == null) {
            return;
        }
        var new构件上传记录_arr = [];
        rlt.构件记录_arr.forEach(rcd=>{
            if(this.构件上传记录_map[rcd.构件上传记录代码] == null){
                this.构件上传记录_map[rcd.构件上传记录代码] = new CWCB构件记录(rcd);
            }
            new构件上传记录_arr.push(this.构件上传记录_map[rcd.构件上传记录代码]);
        });
        this.构件上传记录_arr = new构件上传记录_arr;
        var newdrawing = {
            全局模型文件代码:rlt.全局模型文件代码,
            全局模型文件路径:rlt.全局模型文件路径,
        };
        this.setState({
            drawing:newdrawing,
            上传记录代码:rlt.构件上传记录代码,
        });
    }


    renderFrame(gameTime) {
        const time = gameTime - this.preGameTime;
        this.preGameTime = gameTime;
        const camera = this.camera;
        const scene = this.scene;
        const canvas = this.canvasRef.current;
        const renderer = this.renderer;
        if (this.resizeRendererToDisplaySize()) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            this.setState({
                magicObj: {} // 窗口尺寸有变化，UI也要重新渲染
            });
        }

        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);

        let tempV = new THREE.Vector3();


        let theVec = new THREE.Vector3();
        this.projLabelItem_arr.forEach(item => {
            theVec.subVectors(item.worldPos, camera.position);
            item.dot = theVec.dot(cameraDir);
            item.dis = item.worldPos.distanceTo(camera.position);
        });

        let sorted_arr = this.projLabelItem_arr.concat();
        sorted_arr = sorted_arr.sort((a, b) => { return a.dis - b.dis });

        let visibleCount = 0;
        sorted_arr.forEach(item => {
            let visible = true;
            if (item.dot < 0 || visibleCount > 3) {
                visible = false;
            }

            if (visible) {
                visibleCount += 1;
                tempV.copy(item.worldPos);
                // item.target.getWorldPosition(tempV);
                tempV.project(camera);
                const x = (tempV.x * .5 + .5) * canvas.clientWidth;
                const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
                item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
                item.docElem.style.display = '';
            }
            else {
                item.docElem.style.display = 'none';
            }
        });

        renderer.render(scene, camera);
        requestAnimationFrame(this.renderFrame);
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        const self = this;
        let fetchBarElem = null;
        if (this.state.fetching) {
            let percentValue = Math.round(this.state.fetch_percent * 100);
            fetchBarElem = <div className='progressContainer' style={{ zIndex: 2000 }}>
                <div className='mask'></div>
                <div className='progressDiv'>
                    <h5><span className="badge badge-light flex-grow-0 flex-shrink-0 p-2 shadow" >{this.state.fetch_title}</span></h5>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: percentValue + '%' }}>{percentValue}%</div>
                    </div>
                    {this.state.fetch_error && this.state.fetch_error.length > 0 ? <div className='flex-grow-0 flex-shrink-0 mt-2 text-danger bg-light'>{this.state.fetch_error}</div> : null}
                </div>
            </div>
        }
        var rootDivClassName = 'erpc_threeD d-block hidenOverflow position-relative ' + (this.props.className == null ? '' : this.props.className);

        let topBtnsDiv = null;
        let 全局BtnsDiv = null;
        let nativeUIElem = null;
        let extraUIs_arr = [];

        let canvasWidth = 0;
        let canvasHeight = 0;
        if (this.rootRef.current != null) {
            canvasWidth = this.rootRef.current.clientWidth;
            canvasHeight = this.rootRef.current.clientHeight;
        }
        let canvasWidth_half = parseInt(canvasWidth * 0.5);
        let canvasHeight_half = parseInt(canvasHeight * 0.5);

        if (this.state.drawing.全局模型文件代码 == null) {
            // 还没目标构件
            if(this.popSeled == null){
                setTimeout(() => {
                    self.doPopWCBSelector();
                }, 50);
                this.popSeled = true;
            }
        }
        else {
            if (this.state.fetching == false) {
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.全局模型changed();
                    }, 10);
                }
                else {
                    let wantfocus构件记录 = this.构件上传记录_map[this.state.上传记录代码];
                    if (this.state.focus构件记录 != wantfocus构件记录) {
                        setTimeout(() => {
                            self.构件记录Changed(wantfocus构件记录);
                        }, 10);
                    }
                    else if (this.state.focus构件记录 != null) {
                        let btnName = this.state.focus构件记录.构件全称 + '  ';
                        let shotBtn = null;
                        if (this.state.focusParam != null) {
                            btnName += this.state.focusParam.record.参数名称 + this.state.focusParam.record.参数序号 + '=' + this.state.focusParam.record.参数值.toFixed(0);

                            shotBtn = <button onClick={this.clickShotHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 ml-2" ><i className="fa fa-camera" /></button>
                        }
                        let 状态提示elem = null;
                        if(this.state.focus构件记录.生存状态代码 < 4){
                            状态提示elem = <span className='badge badge-danger'><i className='fa fa-warning'/>未到达现场</span>
                        }
                        else if(this.state.focus构件记录.生存状态代码 > 4){
                            状态提示elem = <span className='badge badge-success'><i className='fa fa-checke'/>已安装</span>
                        }
                        if(状态提示elem != null){
                            extraUIs_arr.push(
                                <div key='mag_statetip' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 90) + 'px', transform: 'translate(-50%,-100%)' }}>
                                    {状态提示elem}
                                </div>
                            );
                        }
                        extraUIs_arr.push(
                            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickPreButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '60px' }} ><i className="fa fa-angle-left" /></button>
                                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '150px' }} >{btnName}</button>
                                <button onClick={this.clickNextButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '60px' }} ><i className="fa fa-angle-right" /></button>
                            </div>
                        );
                        extraUIs_arr.push(
                            <div key='middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 10) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickViewDrawingHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-file-image-o" /></button>
                                {shotBtn}
                            </div>
                        );
                        if(this.state.focus构件记录.复核参数_arr.length > 0){
                            // 复核参数按钮
                            extraUIs_arr.push(
                                <div key='comParamBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left: '2px', top: (canvasHeight - 100) + 'px', transform: 'translate(0%,-100%)' }}>
                                {this.state.focus构件记录.复核参数_arr.map(item=>{
                                    return <button key={item.参数上传数据代码} record_id={item.参数上传数据代码} onClick={this.clickShotHandler} className={"btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (item.拍照状态 ? 'success' : 'light')} ><i className="fa fa-camera" />{item.参数名称}</button>
                                })}
                                </div>
                            );
                        }
                    }
                }
                let opvBtn = null;
                if (this.focusParam != null) {
                    opvBtn = <button onClick={this.toggleOPVVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.otherParamVisible == false ? '-slash text-danger' : '')}></i>其它参数线</button>
                }
                extraUIs_arr.push(
                    <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                        <button onClick={this.toggleProjModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '')}></i>场馆模型</button>
                        <button onClick={this.toggleComponentModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.comModelVisible == false ? '-slash text-danger' : '')}></i>构件模型</button>
                        {opvBtn}
                        {/* <button onClick={this.toggleMetaModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.metaModelVisible == false ? '-slash text-danger' : '')}></i>图元模型</button> */}
                        {/* <button onClick={this.toggleDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.doneVisible == false ? '-slash text-danger' : '')}></i>已完成</button>
                        <button onClick={this.toggleUnDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.undoneVisible == false ? '-slash text-danger' : '')}></i>未完成</button> */}
                    </div>
                );
            }
        }

        var needCtlPath = true;
        var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
        return <div ref={this.rootRef} className={useStyleClass.class} style={useStyleClass.style} ctl-fullpath={needCtlPath ? this.props.fullPath : null}>
            <canvas ref={this.canvasRef} className='w-100 h-100 d-block' />
            <div ref={this.labelsRef} className='three-label-container' style={{ left: 0, top: 0, zIndex: 10 }} />
            <div ref={this.btnsRef} className='three-ui-container' style={{ left: 0, top: 0, zIndex: 20 }} />
            <div className='position-absolute' style={{ left: 0, top: 0, zIndex: 30 }}>
                {topBtnsDiv}
                {extraUIs_arr}
            </div>
            {nativeUIElem}
            {fetchBarElem}
        </div>
    }
}

function ERPC_ThreeDApp_AZWCB_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode
    };
}

function ERPC_ThreeDApp_AZWCB_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_ThreeDApp_AZWCB = null;

function InitThreedApp_anzhuang() {
    VisibleERPC_ThreeDApp_AZWCB = ReactRedux.connect(ERPC_ThreeDApp_AZWCB_mapstatetoprops, ERPC_ThreeDApp_AZWCB_dispatchtorprops)(ERPC_ThreeDApp_AZWCB);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp_anzhuang);

// M_Page_WCBSel
function init_M_Page_WCBSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_WCBSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_WCBSel_onLoad(); }, 50);
    needSetState['M_Page_WCBSel.parentPageID'] = parentPageID;
    needSetState['M_Page_WCBSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function M_Page_WCBSel_onLoad() {
}

function M_iframe_wcbsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var M_iframe_comsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            构件信息: data,
        };
        closePage2('M_Page_WCBSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_WCBSel', 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_WCBSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_WCBSel';
        ERPC_Page(this);
    }
    render() {
        var retElem = null;
        retElem = (
            <div className={'d-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen')} >
                {this.renderHead()}
                {this.renderContent()}
            </div>);
        return retElem;
    }
    renderHead() {
        return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>
            <h3 className='flex-grow-1 flex-shrink-1'>WCB选择</h3>
            <button onClick={this.close} className={'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '')}><i className='fa fa-close' /></button>
        </div>);
    }
    renderHeadButton() {
        var rlt_arr = [];
        return rlt_arr;
    }
    renderContent() {
        var retElem = null;
        retElem = (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column fixPageContent '>
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='302' pageType='auto' onMessageFun={M_iframe_wcbsel_onReceiveMsg} id='M_iframe_comsel' parentPath='M_Page_WCBSel' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }
}
function CM_Page_WCBSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_WCBSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_WCBSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_WCBSel = ReactRedux.connect(CM_Page_WCBSel_mapstatetoprops, CM_Page_WCBSel_disptchtoprops)(CM_Page_WCBSel);

function popWCBSelector(completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(() => {
            completeCallBack(popPage_1exportParam.构件信息);
        }, 50);
    };
    var popPage_1entryParam = {
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_WCBSelentryParam', popPage_1entryParam);
    init_M_Page_WCBSel();
    popPersistentPage('M_Page_WCBSel', ()=>{return <VisibleCM_Page_WCBSel key='M_Page_WCBSel' />});
}
