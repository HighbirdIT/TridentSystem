class ERPC_ThreeDApp_D extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);
        ERP_ThreeDAppBase(this,
        {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false,
            paramlineVisible: true,
            comLabelVisible: true,
        });

        this.drawingDataDirted = true;
        this.图纸部位Btns_arr = [];
        this.focus构件记录 = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};
        this.comLabelItems_arr = [];

        this.ProjectChanged = ProjectChanged1.bind(this);
        this.initApp = InitApp1.bind(this);
    }

    download构件模型() {
        let now构件记录 = this.focus构件记录;
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

                if(downLoadItem == now构件记录){
                    self.focus构件Parant.add(object);
                }
                else{
                    self.构件模型Parant.add(object);
                }
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

    freshRenderParamLine() {
        if (this.focus构件记录 == null) {
            return;
        }
        if(this.参数Parant.length > 0){
            return;
        }
        let self = this;
        let 部位位置信息 = this.focus构件记录.位置信息;
        let 关联部位参数 = this.图纸部位_dic[部位位置信息.英文名称];
        if(关联部位参数 != null){
            关联部位参数.参数信息_arr.forEach(item => {
                self.参数Parant.add(item.geometry);
            });
        }
    }

    toggleProjModelVisible(ev) {
        let newVisible = !this.state.projModelVisible;
        this.projModelObject.visible = newVisible;
        this.setState({
            projModelVisible: newVisible,
        });
    }

    toggleOPVVisible(ev) {
        let newVisible = !this.state.otherParamVisible;
        this.setState({
            otherParamVisible: newVisible,
        });
        let self = this;
        setTimeout(() => {
            self.freshRenderParamLine();
        }, 100);
    }

    toggleMetaModelVisible(ev) {
        let newVisible = !this.state.metaModelVisible;
        if (this.metaModelObject) {
            this.metaModelObject.visible = newVisible;
        }
        this.setState({
            metaModelVisible: newVisible,
        });
    }

    toggleComponentModelVisible(ev) {
        let newVisible = !this.state.comModelVisible;
        this.构件模型Parant.visible = newVisible;
        this.setState({
            comModelVisible: newVisible,
        });
    }

    toggleParamLineVisible(ev) {
        let newVisible = !this.state.paramlineVisible;
        this.参数Parant.visible = newVisible;
        this.setState({
            paramlineVisible: newVisible,
        });
    }

    toggleComLabelVisible(ev){
        let newVisible = !this.state.comLabelVisible;
        this.setState({
            comLabelVisible: newVisible,
        });
    }

    clickToggleLoadParamLineHandler(ev){
        let loadParamModel = (this.state.loadParamModel == null ? this.props.loadParamModel : this.state.loadParamModel) == true;
        if(loadParamModel){
            this.参数Parant.clear();
        }
        this.setState({
            loadParamModel: !loadParamModel,
        });
    }

    参数文件Changed() {
        if (this.state.drawing == null) {
            return;
        }
        if(this.图纸部位参数_cache == null){
            this.图纸部位参数_cache = {}
        }
        if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
            let 参数信息文件路径 = this.state.drawing.参数信息文件路径;
            let 参数上传记录代码 = this.state.drawing.参数上传记录代码;
            let 图纸代码 = this.state.drawing.code;
            if(this.state.drawing.参数信息文件代码 == 0){
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: false,
                    参数文件loaded: false,
                });
                return;
            }

            if(this.图纸部位参数_cache[参数上传记录代码] != null){
                let cache = this.图纸部位参数_cache[参数上传记录代码];
                this.图纸部位Btns_arr = cache.图纸部位Btns_arr;
                this.图纸部位_dic = cache.图纸部位_dic;
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: false,
                    参数文件loaded: true,
                });
                return;
            }
            this.setState({
                showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载参数数据',
                fetch_error: '',
            });
            const self = this;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_全局参数数据' }).then(json => {
                if (json.err != null) {
                    self.setState({
                        fetch_error: `出错了:${JSON.stringify(json.err)}`,
                    });
                    return;
                }
                let 参数名称_dic = {};
                let 参数数据_arr = json.data;
                参数数据_arr.forEach(item => {
                    参数名称_dic[item.加工图纸参数代码] = item.参数名称;
                });

                self.load3dm(参数信息文件路径,'加载参数数据模型',0.2,0.8,(object)=>{
                    self.setState({
                        fetch_title: '解析参数数据模型',
                    });
                    try {
                        if(self.图纸部位Btns_arr != null){
                            self.图纸部位Btns_arr.forEach(item => item.clearParam());
                        }

                        let 参数几何体_dic = {};
                        let layers_arr = object.userData['layers'];
                        object.children.forEach(obj => {
                            let layer = layers_arr[obj.userData.attributes.layerIndex];
                            let objName = obj.userData.attributes.name;
                            let t_arr = layer.name.split('_');
                            let paramCode = parseInt(t_arr[1]);
                            let paramName = 参数名称_dic[paramCode];
                            let centerPos = geoPointAtNormalizeLength(obj,0.5);
                            let startPos = geoPointAtNormalizeLength(obj,0);
                            let endPos = geoPointAtNormalizeLength(obj,1);
                            t_arr = objName.split('_');
                            let 全局代码 = t_arr[0];
                            let 方位名称 = t_arr[1];
                            let 部位代码 = t_arr[2];
                            let 一级序号 = t_arr[3];
                            let 二级序号 = t_arr[4];
                            let 参数序号 = t_arr[5];
                            let 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                            let 参数key = `${参数位置信息.英文名称}_${paramName}${参数序号}`;
                            obj.material = normalLineMat;
                            参数几何体_dic[参数key] = { obj: obj, center: centerPos, start: startPos, end: endPos, 位置信息: 参数位置信息 };
                        });

                        self.图纸部位Btns_arr = [];
                        self.图纸部位_dic = {};
                        参数数据_arr.forEach(item => {
                            let 全局代码 = item.全局代码;
                            let 方位名称 = item.方位名称;
                            let 部位代码 = item.部位代码;
                            let 一级序号 = item.一级序号;
                            let 二级序号 = item.二级序号;
                            let 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                            let 参数key = `${参数位置信息.英文名称}_${item.参数名称}${item.参数序号 == 0 ? 1 : item.参数序号}`;
                            let 参数几何体 = 参数几何体_dic[参数key];
                            if (参数几何体 == null) {
                                return;
                            }
                            if (self.图纸部位_dic[参数位置信息.英文名称] == null) {
                                let new图纸部位Item = new THREE_图纸部位Item(参数位置信息);
                                self.图纸部位Btns_arr.push(new图纸部位Item);
                                self.图纸部位_dic[参数位置信息.英文名称] = new图纸部位Item;
                                self.图纸部位_dic[参数位置信息.中文名称] = new图纸部位Item;
                            }
                            let use图纸部位Item = self.图纸部位_dic[参数位置信息.英文名称];
                            let btnElem = document.createElement('button');
                            btnElem.className = 'btn btn-primary';
                            btnElem.onclick = self.clickParamButtonHandler;
                            let worldPos = 参数几何体.center;
                            if (item.参数序号 == 0) {
                                worldPos = 参数几何体.start;
                            }
                            let 参数item = new THREE_ParamItem(btnElem, worldPos, 参数几何体.obj, 参数位置信息, item);
                            use图纸部位Item.addParam(参数item, 参数几何体.start);
                            btnElem.uiItem = 参数item;
                        });

                        self.图纸部位Btns_arr.forEach(meta => {
                            meta.paramChanged();
                            meta.calWordlPos();
                        });

                        self.图纸部位参数_cache[参数上传记录代码] = {
                            图纸部位Btns_arr:self.图纸部位Btns_arr,
                            图纸部位_dic:self.图纸部位_dic
                        }

                        self.setState({
                            fetching: false,
                            fetch_percent: 0,
                            参数文件loaded: true,
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify(`出错了:${eo.message}`),
                        });
                    }
                });
            });
        }
    }

    download构件参数() {
        let 种类index = 0;
        let downloading构件种类 = null;
        let self = this;
        for (; 种类index < this.所有构件种类_arr.length; ++种类index) {
            let 构件种类 = this.所有构件种类_arr[种类index];
            if (!构件种类.downloaded) {
                downloading构件种类 = 构件种类;
                break;
            }
        }
        if (downloading构件种类 == null) {
            let newState = Object.assign(self.waitSetState, {
                fetching: false,
                fetch_percent: 0,
            });
            self.setState(newState);
            setTimeout(() => {
                popComponentSelector(newState.drawing.name, newState.drawing.code, self.props.projectCode, newState.drawing.关联模型代码, self.构件选择Callback);
            }, 10);
            return;
        }
        self.setState({
            fetching: true,
            fetch_percent: (种类index / this.所有构件种类_arr.length),
            fetch_title: '加载' + downloading构件种类.name + '参数数据',
            fetch_error: '',
        });
        nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸种类代码: 4, 构件代码: downloading构件种类.code }, action: 'pulldata_构件参数数据' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let 参数数据_arr = json.data;
            参数数据_arr.forEach(item => {
                let 上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                if (上传记录 == null) {
                    return;
                }
                if (item.是复核参数) {
                    上传记录.add复核参数(item);
                }
            });
            downloading构件种类.downloaded = true;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
    }

    targetRecordChanged(){
        if(this.camera == null || this.props.targetRecordID == this.state.targetRecordID){
            return;
        }
        if(this.focus构件Parant == null){
            this.focus构件Parant = new THREE.Object3D();
            this.scene.add(this.focus构件Parant);
        }
        else{
            this.focus构件Parant.clear();
        }
        let self = this;
        let 上传记录代码 = this.props.targetRecordID;

        this.setState({
            fetch_title:'获取构件数据中',
            fetch_percent:0,
            fetching: true,
            targetRecordID:this.props.targetRecordID
        });
        this.参数Parant.clear();
        this.构件模型Parant.clear();

        let labelsRefDiv = self.labelsRef.current;
        if(labelsRefDiv != null){
            self.comLabelItems_arr.forEach(item=>{
                labelsRefDiv.removeChild(item.docElem);
            });
            self.comLabelItems_arr = [];
        }
        nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: 上传记录代码,最大距离:0.1 }, action: 'pulldata_查找相邻构件信息' }).then(json => {
            if(self.props.targetRecordID != 上传记录代码){
                return; // 又切换了目录
            }
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let record_arr = json.data;
            if(record_arr.length == 0){
                self.setState({
                    fetch_error: `出错了:${上传记录代码}不是有效的构件记录`,
                });
                return;
            }
            let 显示记录_arr = [];
            let now构件记录 = null;
            record_arr.forEach(item => {
                item.X *= 0.001;
                item.Y *= 0.001;
                item.Z *= 0.001;
                let 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                let 上传记录 = null;
                if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                    上传记录 = new C构件上传记录();
                    上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                    self.构件上传记录_arr.push(上传记录);
                    self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                    上传记录.位置信息 = 构件位置信息;
                }
                else {
                    上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                    上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                }
                if(上传记录.上传记录代码 == 上传记录代码){
                    now构件记录 = 上传记录;
                }
                显示记录_arr.push(上传记录);
                
                let divElem = document.createElement('div');
                divElem.innerText = 上传记录.构件全称;
                divElem.className = now构件记录 == 上传记录 ? 'badge badge-primary' : 'badge badge-light';
                let newLabelItem = new THREE_LabelItem(divElem, 上传记录.worldPos);

                labelsRefDiv.appendChild(divElem);
                self.comLabelItems_arr.push(newLabelItem);
            });

            let TargetToEye_vec = new THREE.Vector3(0, 0, 0);
            if(this.focus构件记录 == null){
                let pos1 = new THREE.Vector3(0,0,0);
                pos1.set(0,0,now构件记录.worldPos.Z);
                TargetToEye_vec.subVectors(now构件记录.worldPos,pos1);
                TargetToEye_vec.normalize();
                TargetToEye_vec.Z += 1;
            }
            else{
                TargetToEye_vec.subVectors(self.camera.position, self.controls.target);
            }

            self.focus构件记录 = now构件记录;
            let needDownloadItems = [];
            let focusItems_arr = [now构件记录];
            let targetPos = now构件记录.worldPos;
            显示记录_arr.forEach(item => {
                if (item.object3d != null) {
                    if(item == now构件记录){
                        self.focus构件Parant.add(item.object3d);
                    }
                    else{
                        self.构件模型Parant.add(item.object3d);
                    }
                }
                else {
                    needDownloadItems.push(item);
                }
            });

            const controls = self.controls;
            let eyePos = new THREE.Vector3(0,0,0);
            eyePos.copy(targetPos);
            eyePos.add(TargetToEye_vec);
            self.camera.position.copy(eyePos);
            controls.target.copy(targetPos);
            controls.enablePan = false;

            self.显示记录_arr = 显示记录_arr;
            self.focusItems_arr = focusItems_arr;
            self.needDownloadItems = needDownloadItems;
            if (needDownloadItems.length > 0) {
                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            }

            self.needFresh部位参数 = true;
            self.setState({
                fetch_percent:0,
                fetching: needDownloadItems.length > 0,
                drawing: newDrawing,
            });
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

        this.comLabelItems_arr.forEach(btnItem => {
            if (this.state.comLabelVisible == false) {
                btnItem.docElem.style.display = 'none';
                return;
            }
            SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
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

        if(this.props.projectCode == null){
            nativeUIElem = <div className='btn btn-light position-absolute' style={{minWidth:'150px',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
                <i className='fa fa-warning text-danger' />未指定目标项目
            </div>
        }
        else if (this.state.showingProjectCode != this.props.projectCode) {
            if (this.state.fetching == false) {
                if (this.state.showingProjectCode != this.props.projectCode) {
                    setTimeout(() => {
                        self.ProjectChanged();
                    }, 10);
                }
            }
        }
        else if(this.props.targetRecordID == null){
            nativeUIElem = <div className='btn btn-light position-absolute' style={{minWidth:'150px',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
                <i className='fa fa-warning text-danger' />未选择要显示的构件
            </div>
        }
        else if(this.props.targetRecordID != this.state.targetRecordID){
            setTimeout(() => {
                self.targetRecordChanged();
            }, 10);
        }

        extraUIs_arr.push(
            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{minWidth:'150px'}} >{btnName}</button>
            </div>
        );

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

function ERPC_ThreeDApp_D_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;
    var targetRecordID = ctlState.targetRecordID != null ? ctlState.targetRecordID : ownprops.targetRecordID;
    var maxDistance = ctlState.maxDistance != null ? ctlState.maxDistance : ownprops.maxDistance;
    if(maxDistance == null || isNaN(maxDistance)){
        maxDistance = 0;
    }
    else{
        maxDistance = parseFloat(maxDistance);
    }

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode,
        targetRecordID: targetRecordID,
        maxDistance: maxDistance,
    };
}

function ERPC_ThreeDApp_D_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}
var VisibleERPC_ThreeDApp_D = null;

function InitThreedApp2() {
    VisibleERPC_ThreeDApp_D = ReactRedux.connect(ERPC_ThreeDApp_D_mapstatetoprops, ERPC_ThreeDApp_D_dispatchtorprops)(ERPC_ThreeDApp_D);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp2);