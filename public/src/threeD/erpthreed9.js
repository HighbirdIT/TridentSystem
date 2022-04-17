class ERPC_ThreeDApp_B extends React.PureComponent {
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
            });

        this.drawingDataDirted = true;
        this.图纸部位Btns_arr = [];
        this.paramBtns_arr = [];
        this.focus构件记录 = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};

        this.ProjectChanged = ProjectChanged1.bind(this);
        this.initApp = InitApp1.bind(this);
    }

    clickViewDrawingHandler(ev) {
        if (this.focus构件记录Btn && this.focus构件记录Btn.参数信息_arr.length > 0) {
            const 参数信息 = this.focus构件记录Btn.参数信息_arr[0];
            view附件文件(this.focus构件记录Btn.位置信息.中文名称, 参数信息.record.发图记录代码, 27);
        }
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
                参数记录.拍照状态 = 1;
                self.setState({magicObj:{}});
            };
            shotComParam(this.focus构件记录Btn.构件代码,参数记录.参数上传数据代码,4, callBack);
        }
    }

    clickParamButtonHandler(ev) {
        let uiItem = null;
        let elem = ev.target;
        while (uiItem == null && elem != null) {
            uiItem = elem.uiItem;
            elem = elem.parentElement;
        }
        this.setFocusParam(uiItem);
    }

    getNext构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) + 1;
        if (index >= this.构件上传记录_arr.length) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return rlt;
    }

    getPre构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) - 1;
        if (index < 0) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return rlt;
    }

    checkNeedDownloadModel() {
        let now构件记录 = this.focus构件记录Btn;
        if (now构件记录 == null) {
            return {};
        }
        let needDownloadItems = [];
        let focusItems_arr = [now构件记录];
        let targetPos = now构件记录.worldPos;
        if (now构件记录.object3d != null) {
            this.构件模型Parant.add(now构件记录.object3d);
            SetObejectMaterail(now构件记录.object3d, focusComponentModelMat);
        }
        else {
            needDownloadItems.push(now构件记录);
        }
        this.构件上传记录_arr.forEach(item => {
            if (now构件记录 == item) {
                return;
            }
            let dis = targetPos.distanceTo(item.worldPos);
            if (dis <= 1.5) {
                if (item.object3d != null) {
                    this.构件模型Parant.add(item.object3d);
                    SetObejectMaterail(item.object3d, componentModelMat);
                }
                else {
                    needDownloadItems.push(item);
                }
            }
        });

        this.focusItems_arr = focusItems_arr;
        this.needDownloadItems = needDownloadItems;
        if (needDownloadItems.length > 0) {
            setTimeout(() => {
                this.download构件模型();
            }, 10);
        }
        return {
            needDownloadItems: needDownloadItems,
            focusItems_arr: focusItems_arr,
            targetPos: targetPos
        };
    }

    构件记录Changed(want构件记录) {
        // let 图纸代码 = this.state.drawing.code;
        // let 部位位置信息 = this.focus构件记录Btn.位置信息;
        // let 部位key = `${图纸代码}_${部位位置信息.英文名称}`;
        // let 关联模型 = this.关联构件模型_dic[部位key];
        // if (关联模型 != null) {
        //     for (var si in 关联模型.构件记录_arr) {
        //         let item = 关联模型.构件记录_arr[si];
        //         targetPos = item.worldPos;
        //         focusItems_arr.push(item);
        //         if (item.object3d != null) {
        //             this.构件模型Parant.add(item.object3d);
        //             SetObejectMaterail(item.object3d, focusComponentModelMat);
        //         }
        //         else {
        //             needDownloadItems.push(item);
        //         }
        //     }
        // }
        if (want构件记录 == this.focus构件记录Btn) {
            return;
        }
        this.setFocusParam(null);
        const controls = this.controls;
        let self = this;
        let nowChildren = this.参数Parant.children.concat();
        nowChildren.forEach(x => {
            self.参数Parant.remove(x);
        });
        self.paramBtns_arr.forEach(tElem => {
            self.btnsRef.current.removeChild(tElem.docElem);
        });
        self.paramBtns_arr = [];

        if (this.focus构件记录Btn != null) {
            if (this.TargetToEye_vec == null) {
                this.TargetToEye_vec = new THREE.Vector3(0, 0, 0);
            }
            this.TargetToEye_vec.subVectors(this.camera.position, this.controls.target);
        }
        this.构件模型Parant.clear();
        this.focus构件记录Btn = want构件记录;
        if (want构件记录 == null) {
            controls.enablePan = true;
        }
        else {
            let checkRlt = this.checkNeedDownloadModel();
            let targetPos = checkRlt.targetPos;

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

            // want构件记录.参数信息_arr.forEach(item => {
            //     self.参数Parant.add(item.geometry);
            //     self.paramBtns_arr.push(item);
            //     self.btnsRef.current.appendChild(item.docElem);
            // });
        }
        this.setState({
            focus构件记录: this.focus构件记录Btn,
        });
        controls.update();
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
        if (downLoadItem == null) {
            return;
        }

        const loader = this.mainLoader;
        // const loader = new Rhino3dmLoader();
        // loader.setLibraryPath('/vendor/other/');
        const self = this;
        self.setState({
            fetch_title: `加载${downLoadItem.构件全称}实体模型`,
            fetching: true,
            fetch_percent: 0
        });
        loader.load(window.location.origin + downLoadItem.文件路径, function (object) {
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
                    SetObejectMaterail(object, componentModelMat);
                }
                self.setState({
                    fetching: false,
                });

                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            } catch (eo) {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${eo.message}`),
                });
            }
        }, (ev) => {
            self.setState({
                fetch_percent: (ev.loaded / ev.total) * 0.6 + 0.2,
            });
        }, (err) => {
            self.setState({
                fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
            });
            console.error(err);
        });
    }

    freshRenderParamLine() {
        if (this.focusParam == null) {
            return;
        }
        let paramItem = this.focusParam;
        this.参数Parant.clear();
        this.focus构件记录Btn.参数信息_arr.forEach(item => {
            if (item == paramItem) {
                item.geometry.visible = true;
                item.geometry.material = redLineMat;
                this.参数Parant.add(item.geometry);
            }
            else if (this.state.otherParamVisible) {
                if (item.参数序号 == 0) {
                    // 0号参数实体永远不必添加
                    return;
                }
                if (paramItem.参数序号 == 0 && paramItem.参数名称 == item.参数名称 && item.参数序号 == 1) {
                    // 当前参数的0号在上面被添加了，那么1号实体就不必添加了
                    return;
                }
                item.geometry.visible = true;
                item.geometry.material = normalLineMat;
                // item.geometry.visible = false;
                // if(item.dashLine == null){
                //     item.dashLine = new THREE.Line(item.geometry.geometry, dashLineMat);
                //     item.dashLine.computeLineDistances();
                // }
                this.参数Parant.add(item.geometry);
            }
        });
    }

    setFocusParam(paramItem) {
        if (paramItem == this.focusParam) {
            this.freshRenderParamLine();
            return;
        }
        const controls = this.controls;
        this.focusParam = paramItem;
        this.sphereInter.visible = false;
        if (paramItem == null) {
            this.参数Parant.clear();
            if (this.focus构件记录Btn) {
                this.focus构件记录Btn.参数信息_arr.forEach(item => {
                    item.geometry.visible = true;
                    item.geometry.material = normalLineMat;
                    this.参数Parant.add(item.geometry);
                });
            }
        }
        else {
            this.freshRenderParamLine();
            //this.saveCameraView();
            controls.target.copy(paramItem.worldPos);
            if (paramItem.record.参数序号 == 0) {
                this.sphereInter.visible = true;
                this.sphereInter.position.copy(paramItem.worldPos);
            }
            else {
                if (getCurveGeoLength(paramItem.geometry) >= 0.2) {
                    this.sphereInter.visible = true;
                    this.sphereLocPercent = 0;
                }
            }
        }
        this.setState({
            focusParam: this.focusParam,
        });
        controls.update();
    }

    clickPreButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus构件记录Btn.getPreParam(this.focusParam));
            return;
        }
        let newItem = this.getPre构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
        }
    }

    clickNextButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus构件记录Btn.getNextParam(this.focusParam));
            return;
        }
        let newItem = this.getNext构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
        }
    }

    clickExitButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(null);
            return;
        }
        let drawing = this.state.drawing;
        popComponentSelector(drawing.name, drawing.code, this.props.projectCode, drawing.关联模型代码, this.构件选择Callback);
    }

    clickKeyPointButtonHandler(ev) {
        let uiItem = null;
        let elem = ev.target;
        while (uiItem == null && elem != null) {
            uiItem = elem.uiItem;
            elem = elem.parentElement;
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

    toggleDoneVisible(ev) {
        let newVisible = !this.state.doneVisible;
        this.setState({
            doneVisible: newVisible,
        });
    }

    toggleUnDoneVisible(ev) {
        let newVisible = !this.state.undoneVisible;
        this.setState({
            undoneVisible: newVisible,
        });
    }

    toggleComponentModelVisible(ev) {
        let newVisible = !this.state.comModelVisible;
        this.构件模型Parant.visible = newVisible;
        this.setState({
            comModelVisible: newVisible,
        });
    }

    modelChanged() {
        if (this.state.drawing == null) {
            return;
        }
        let self = this;
        if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
            this.setState({
                showingModelPath: this.state.drawing.全局模型文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载图纸模型',
                fetch_error: '',
            });

            const loader = this.mainLoader;
            let logData = {};
            loader.load(window.location.origin + this.state.drawing.全局模型文件路径, function (object) {
                self.setState({
                    fetch_title: '解析图纸模型',
                });
                try {
                    const scene = self.scene;
                    const camera = self.camera;
                    const controls = self.controls;
                    logData.hadScene = scene != null;
                    logData.inited = self.state.inited;

                    // object.children.forEach(c=>{
                    //     c.material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
                    // });

                    scene.add(object);
                    let box = new THREE.Box3();
                    box.expandByObject(object);
                    let size = new THREE.Vector3();
                    let center = new THREE.Vector3();
                    box.getSize(size);
                    box.getCenter(center);
                    console.log('loaded');
                    controls.target.copy(center);
                    let cameraPos = center.clone();
                    logData.cameraPos = cameraPos;
                    logData.center = center;
                    cameraPos.add(new THREE.Vector3(size.x * 0.5, size.y * 0.5, size.z));
                    camera.position.copy(cameraPos);
                    if (self.projModelObject != null) {
                        self.projModelObject.clear();
                        scene.remove(self.projModelObject);
                    }
                    self.projModelObject = object;

                    object.userData['texts'].forEach(textGeo => {
                        let divElem = document.createElement('div');
                        divElem.innerText = textGeo.text;
                        divElem.className = 'badge badge-info';
                        let worldPos = new THREE.Vector3();
                        worldPos.fromArray(textGeo.point, 0);
                        // let helper = new THREE.AxesHelper(5);
                        // helper.position.copy(worldPos);
                        // scene.add(helper);

                        let newLabelItem = new THREE_LabelItem(divElem, worldPos);
                        self.labelsRef.current.appendChild(divElem);
                        self.uiItem_arr.push(newLabelItem);
                    });
                    self.setState({
                        fetching: false,
                        projModelVisible: true,
                    });
                } catch (eo) {
                    self.setState({
                        fetch_error: `出错了:${eo.message}:${JSON.stringify(logData)}`,
                    });
                }
            }, (ev) => {
                self.setState({
                    fetch_percent: (ev.loaded / ev.total) * 0.6 + 0.2,
                });
            }, (err) => {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
                });
                console.error(err);
            });
        }
    }

    参数文件Changed() {
        if (this.state.drawing == null) {
            return;
        }
        if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
            this.setState({
                showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载参数数据',
                fetch_error: '',
            });
            const self = this;
            let 图纸代码 = this.state.drawing.code;
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
                self.setState({
                    fetch_percent: 0.2,
                    fetch_title: '加载参数模型文件',
                });

                const loader = this.mainLoader;
                loader.load(window.location.origin + this.state.drawing.参数信息文件路径, function (object) {
                    self.setState({
                        fetch_title: '解析参数数据模型',
                    });
                    try {
                        const scene = self.scene;
                        const camera = self.camera;
                        const controls = self.controls;

                        self.图纸部位Btns_arr.forEach(item => item.clearParam());

                        let 参数几何体_dic = {};
                        let layers_arr = object.userData['layers'];
                        object.children.forEach(obj => {
                            let layer = layers_arr[obj.userData.attributes.layerIndex];
                            let objName = obj.userData.attributes.name;
                            let centerPos = new THREE.Vector3();
                            let startPos = new THREE.Vector3();
                            let endPos = new THREE.Vector3();
                            let t_arr = layer.name.split('_');
                            let paramCode = parseInt(t_arr[1]);
                            let paramName = 参数名称_dic[paramCode];
                            obj.userData.attributes.userStrings.forEach(item => {
                                if (item[0] == 'center') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    centerPos.set(X, Y, Z);
                                }
                                else if (item[0] == 'start') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    startPos.set(X, Y, Z);
                                }
                                else if (item[0] == 'end') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    endPos.set(X, Y, Z);
                                }
                            });
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

                        //let newMetaItem = new THREE_图纸部位Item(btnElem,worldPos,self.ProjectMeta.createPositionInfo(dr.全局代码,dr.方位名称,dr.部位代码));
                        // scene.add(object);
                        // console.log(object);
                        self.setState({
                            fetching: false,
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify(`出错了:${eo.message}`),
                        });
                    }
                }, (ev) => {
                    self.setState({
                        fetch_percent: (ev.loaded / ev.total) * 0.6 + 0.2,
                    });
                }, (err) => {
                    self.setState({
                        fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
                    });
                    console.error(err);
                });
            });
        }
    }



    clickDrawingBtnHandler(ev) {
        this.preDrawing = this.state.drawing;
        this.setState({ drawing: null });
    }

    clickCloseDSHandler(ev) {
        let preDrawing = this.preDrawing;
        setTimeout(() => {
            this.setState({ drawing: preDrawing });
        }, 10);
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
                    上传记录.复核参数_arr.push(item);
                }
            });
            downloading构件种类.downloaded = true;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
    }

    drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码, record) {
        const self = this;
        this.waitSetState = {
            drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null },
            coming: {}
        };
        this.setState({
            fetching: true,
            fetch_percent: 0,
            fetch_title: '加载构件集数据',
            fetch_error: '',
        });
        let 图纸代码 = drawingCode;
        nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_图纸关联构件模型' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let 关联模型数据_arr = json.data;
            let 所有构件种类_arr = [];
            关联模型数据_arr.forEach(item => {
                item.X *= 0.001;
                item.Y *= 0.001;
                item.Z *= 0.001;
                let 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                let 部位key = `${图纸代码}_${构件位置信息.英文名称}`;

                let found构件种类 = 所有构件种类_arr.find(x => { return x.code == item.构件代码 });
                if (found构件种类 == null) {
                    let t_arr = item.构件全称.split('-');
                    所有构件种类_arr.push({ code: item.构件代码, name: t_arr[1] });
                }

                let 上传记录 = null;
                if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                    上传记录 = new C构件上传记录();
                    上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X, item.Y, item.Z))
                    self.构件上传记录_arr.push(上传记录);
                    self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                    上传记录.位置信息 = 构件位置信息;
                }
                else {
                    上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                    上传记录.copy(item);
                }

                if (self.关联构件模型_dic[部位key] == null) {
                    self.关联构件模型_dic[部位key] = new C关联构件模型(构件位置信息);
                }
                let 关联构件模型 = self.关联构件模型_dic[部位key];
                关联构件模型.append(上传记录);
            });
            self.所有构件种类_arr = 所有构件种类_arr;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
        //console.log(`name:${drawingName},code:${drawingCode},参数上传记录代码:${参数上传记录代码},参数信息文件路径:${参数信息文件路径},关联模型代码:${关联模型代码}`);
        // this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null }, component:{构件上传记录代码:record.构件上传记录代码} });
        // this.setFocusParam(null);
    }

    构件选择Callback(rlt) {
        if (rlt == null) {
            if (this.state.focus构件记录 == null) {
                this.setState({ drawing: null });
            }
            return;
        }
        var posInfo = this.ProjectMeta.createPositionInfo(rlt.全局代码, rlt.方位名称, rlt.部位代码, rlt.一级序号, rlt.二级序号);
        var newdrawing = Object.assign(this.state.drawing, { 全局模型文件代码: rlt.全局模型文件代码, 全局模型文件路径: rlt.全局模型文件路径 });
        var newComponent = Object.assign(this.state.coming, { 上传记录代码: rlt.构件上传记录代码 });
        this.setState({ watchPos: posInfo, drawing: newdrawing, coming: newComponent });
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
        this.uiItem_arr.forEach(item => {
            theVec.subVectors(item.worldPos, camera.position);
            item.dot = theVec.dot(cameraDir);
            item.dis = item.worldPos.distanceTo(camera.position);
        });

        let sorted_arr = this.uiItem_arr.concat();
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

        this.paramBtns_arr.forEach(btnItem => {
            if (this.focusParam != null) {
                btnItem.docElem.style.display = 'none';
                return;
            }
            if (btnItem.record.拍照状态 == 1) {
                if (this.state.doneVisible == false) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
            }
            else {
                if (this.state.undoneVisible == false) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
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

        if (this.state.showingProjectCode != this.props.projectCode) {
            if (this.state.fetching == false) {
                if (this.state.showingProjectCode != this.props.projectCode) {
                    setTimeout(() => {
                        self.ProjectChanged();
                    }, 10);
                }
            }
        }
        else if (this.state.drawing == null) {
            // 选择全局图
            nativeUIElem = <div className='w-100 h-100 position-absolute' style={{ left: 0, top: 0, zIndex: 500 }}>
                {/* <button onClick={testHandler} className='btn btn-light'>测试功能</button> */}
                <VisibleCDrawingSelectorForm actionName='pulldata_可选构件安装图纸' 项目代码={this.props.projectCode} id='DrawingSelectorForm' parentPath={this.props.fullParentPath} title='选择定位图纸' pagebreak={false} selectMode='single' keyColumn='项目图纸定义代码' onSelectedChanged={this.drawingChangedHandler} closable={this.preDrawing != null} clickCloseHandler={this.clickCloseDSHandler} />
            </div>
            if (this.drawingDataDirted) {
                this.drawingDataDirted = false;
                setTimeout(() => {
                    pull_DrawingSelectorForm(null, self.props.fullParentPath, true, this.props.projectCode, 'pulldata_可选构件安装图纸');
                }, 10);
            }
        }
        else {
            let drawingBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDrawingBtnHandler}><i className="fa fa-map" />{this.state.drawing.name}</button>
            let iconElem1 = null;
            if (this.state.loadComponentModel) {
                iconElem1 = <i className="fa fa-cube"></i>
            }
            else {
                iconElem1 = <span className="fa-stack fa-lg">
                    <i className="fa fa-cube fa-stack-1x"></i>
                    <i className="fa fa-ban fa-stack-2x text-danger"></i>
                </span>
            }
            topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '70px', top: '5px', left: '5px' }}>
                {drawingBtn}
            </div>
            if (this.state.drawing.全局模型文件代码 == 0) {
                // 等待选择全局模型文件
            }
            else if (this.state.fetching == false) {
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.modelChanged();
                    }, 10);
                }
                else if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                    setTimeout(() => {
                        self.参数文件Changed();
                    }, 10);
                }
                else {
                    let wantfocus构件记录 = this.构件上传记录_map[this.state.coming.上传记录代码];
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
                        extraUIs_arr.push(
                            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickPreButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-angle-left" /></button>
                                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '150px' }} >{btnName}</button>
                                <button onClick={this.clickNextButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-angle-right" /></button>
                            </div>
                        );
                        extraUIs_arr.push(
                            <div key='middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 10) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickViewDrawingHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-file-image-o" /></button>
                                {/* <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-undo" /></button> */}
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
                if (this.ProjectMeta != null) {
                    // 全局BtnsDiv = <div className="d-flex flex-column position-absolute" style={{width: '50px',left: '100%', transform: 'translate(-50%, -50%)'}}>
                    //     {this.ProjectMeta.全局_arr.map(全局item=>{
                    //         return <button key={全局item.代码} className="btn btn-light flex-grow-0 flex-shrink=0" >{全局item.名称}</button>;
                    //     })}
                    // </div>
                }
            }
        }

        // let midBtnsDiv = null;
        // if(midBtns_arr.length > 0){
        //     midBtnsDiv = <div className="d-flex flex-column position-absolute" style={{width: canvasWidth + 'px', height:'auto', left: '0px',bottom:canvasHeight+'px', transform: 'translate(0%, -0%)'}}>
        //             {midBtns_arr}
        //         </div>
        // }

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

function ERPC_ThreeDApp_B_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_B_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_ThreeDApp_B = null;

function InitThreedApp2() {
    VisibleERPC_ThreeDApp_B = ReactRedux.connect(ERPC_ThreeDApp_B_mapstatetoprops, ERPC_ThreeDApp_B_dispatchtorprops)(ERPC_ThreeDApp_B);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp2);


// M_Page_ComSel
function init_M_Page_ComSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ComSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ComSel_onLoad(); }, 50);
    setTimeout(() => {
    }, 50);
    needSetState['M_Page_ComSel.parentPageID'] = parentPageID;
    needSetState['M_Page_ComSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_ComSel_onLoad() {
    var M_Page_ComSel_图纸名称 = getPageEntryParam('M_Page_ComSel', '图纸名称', 0);
    var M_Page_ComSel_项目代码 = getPageEntryParam('M_Page_ComSel', '项目代码', 0);
    var M_Page_ComSel_可视模型代码 = getPageEntryParam('M_Page_ComSel', '可视模型代码', 0);
    var M_Page_ComSel_图纸代码 = getPageEntryParam('M_Page_ComSel', '图纸代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '设置参数', data: { 图纸名称: M_Page_ComSel_图纸名称, 项目代码: M_Page_ComSel_项目代码, 可视模型代码: M_Page_ComSel_可视模型代码, 图纸代码: M_Page_ComSel_图纸代码 } }, 'M_Page_ComSel.M_iframe_comsel.msg'));
    }, 50);
}
function M_iframe_comsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var M_iframe_comsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            构件信息: data,
        };
        closePage2('M_Page_ComSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_ComSel', 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_ComSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_ComSel';
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
            <h3 className='flex-grow-1 flex-shrink-1'>安装构件选取</h3>
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='288' pageType='auto' onMessageFun={M_iframe_comsel_onReceiveMsg} id='M_iframe_comsel' parentPath='M_Page_ComSel' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_ComSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ComSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ComSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_ComSel = ReactRedux.connect(CM_Page_ComSel_mapstatetoprops, CM_Page_ComSel_disptchtoprops)(CM_Page_ComSel);