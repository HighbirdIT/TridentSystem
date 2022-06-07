'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ERPC_ThreeDApp_B = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp_B, _React$PureComponent);

    function ERPC_ThreeDApp_B(props) {
        _classCallCheck(this, ERPC_ThreeDApp_B);

        var _this = _possibleConstructorReturn(this, (ERPC_ThreeDApp_B.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_B)).call(this));

        autoBind(_this);
        ERPControlBase(_this);
        ERP_ThreeDAppBase(_this, {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false
        });

        _this.drawingDataDirted = true;
        _this.图纸部位Btns_arr = [];
        _this.paramBtns_arr = [];
        _this.focus构件记录 = null;
        _this.focusParam = null;
        _this.cameraInfo_arr = [];
        _this.部位相机loc = {};
        _this.关联构件模型_dic = {};
        _this.构件上传记录_arr = [];
        _this.构件上传记录_map = {};

        _this.ProjectChanged = ProjectChanged1.bind(_this);
        _this.initApp = InitApp1.bind(_this);
        return _this;
    }

    _createClass(ERPC_ThreeDApp_B, [{
        key: 'clickViewDrawingHandler',
        value: function clickViewDrawingHandler(ev) {
            if (this.focus构件记录Btn && this.focus构件记录Btn.参数信息_arr.length > 0) {
                var 参数信息 = this.focus构件记录Btn.参数信息_arr[0];
                view附件文件(this.focus构件记录Btn.位置信息.中文名称, 参数信息.record.发图记录代码, 27);
            }
        }
    }, {
        key: 'clickShotHandler',
        value: function clickShotHandler(ev) {
            if (this.focus构件记录Btn == null) {
                return;
            }
            var elem = ev.target;
            var record_id = 0;
            while (elem != null) {
                var tid = elem.getAttribute('record_id');
                if (!isNaN(tid)) {
                    record_id = parseInt(tid);
                    break;
                }
                elem = elem.parentElement;
            }
            var 参数记录 = this.focus构件记录Btn.复核参数_arr.find(function (x) {
                return x.参数上传数据代码 == record_id;
            });
            if (参数记录 != null) {
                var self = this;
                var callBack = function callBack() {
                    参数记录.拍照状态 = 1;
                    self.setState({ magicObj: {} });
                };
                shotComParam(this.focus构件记录Btn.构件代码, 参数记录.参数上传数据代码, 4, callBack);
            }
        }
    }, {
        key: 'clickParamButtonHandler',
        value: function clickParamButtonHandler(ev) {
            var uiItem = null;
            var elem = ev.target;
            while (uiItem == null && elem != null) {
                uiItem = elem.uiItem;
                elem = elem.parentElement;
            }
            this.setFocusParam(uiItem);
        }
    }, {
        key: 'getNext\u6784\u4EF6\u8BB0\u5F55',
        value: function getNext(base) {
            var index = this.构件上传记录_arr.indexOf(base) + 1;
            if (index >= this.构件上传记录_arr.length) {
                return null;
            }
            var rlt = this.构件上传记录_arr[index];
            if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
                return null;
            }
            return rlt;
        }
    }, {
        key: 'getPre\u6784\u4EF6\u8BB0\u5F55',
        value: function getPre(base) {
            var index = this.构件上传记录_arr.indexOf(base) - 1;
            if (index < 0) {
                return null;
            }
            var rlt = this.构件上传记录_arr[index];
            if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
                return null;
            }
            return rlt;
        }
    }, {
        key: 'checkNeedDownloadModel',
        value: function checkNeedDownloadModel() {
            var _this2 = this;

            var now构件记录 = this.focus构件记录Btn;
            if (now构件记录 == null) {
                return {};
            }
            var needDownloadItems = [];
            var focusItems_arr = [now构件记录];
            var targetPos = now构件记录.worldPos;
            if (now构件记录.object3d != null) {
                this.构件模型Parant.add(now构件记录.object3d);
                SetObejectMaterail(now构件记录.object3d, focusComponentModelMat);
            } else {
                needDownloadItems.push(now构件记录);
            }
            this.构件上传记录_arr.forEach(function (item) {
                if (now构件记录 == item) {
                    return;
                }
                var dis = targetPos.distanceTo(item.worldPos);
                if (dis <= 1.5) {
                    if (item.object3d != null) {
                        _this2.构件模型Parant.add(item.object3d);
                        SetObejectMaterail(item.object3d, componentModelMat);
                    } else {
                        needDownloadItems.push(item);
                    }
                }
            });

            this.focusItems_arr = focusItems_arr;
            this.needDownloadItems = needDownloadItems;
            if (needDownloadItems.length > 0) {
                setTimeout(function () {
                    _this2.download构件模型();
                }, 10);
            }
            return {
                needDownloadItems: needDownloadItems,
                focusItems_arr: focusItems_arr,
                targetPos: targetPos
            };
        }
    }, {
        key: '\u6784\u4EF6\u8BB0\u5F55Changed',
        value: function Changed(want构件记录) {
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
            var controls = this.controls;
            var self = this;
            var nowChildren = this.参数Parant.children.concat();
            nowChildren.forEach(function (x) {
                self.参数Parant.remove(x);
            });
            self.paramBtns_arr.forEach(function (tElem) {
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
            } else {
                var checkRlt = this.checkNeedDownloadModel();
                var targetPos = checkRlt.targetPos;

                var eyePos = null;
                var pos_center = new THREE.Vector3(0, 0, targetPos.z);
                var theVec = new THREE.Vector3();
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
                focus构件记录: this.focus构件记录Btn
            });
            controls.update();
        }
    }, {
        key: 'download\u6784\u4EF6\u6A21\u578B',
        value: function download() {
            if (this.focus构件记录Btn == null) {
                return;
            }
            var now构件记录 = this.focus构件记录Btn;
            var downLoadItem = null;
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

            var loader = this.mainLoader;
            // const loader = new Rhino3dmLoader();
            // loader.setLibraryPath('/vendor/other/');
            var self = this;
            self.setState({
                fetch_title: '\u52A0\u8F7D' + downLoadItem.构件全称 + '\u5B9E\u4F53\u6A21\u578B',
                fetching: true,
                fetch_percent: 0
            });
            loader.load(window.location.origin + downLoadItem.文件路径, function (object) {
                self.setState({
                    fetch_title: '解析实体模型'
                });
                try {
                    for (var si in object.children) {
                        TurnOffShadow(object.children[si]);
                    }
                    downLoadItem.object3d = object;
                    var controls = self.controls;

                    self.构件模型Parant.add(object);
                    var box = new THREE.Box3();
                    box.expandByObject(object);
                    var size = new THREE.Vector3();
                    var center = new THREE.Vector3();
                    box.getSize(size);
                    box.getCenter(center);
                    downLoadItem.center = center;
                    if (downLoadItem == now构件记录) {
                        controls.target.copy(center);
                        SetObejectMaterail(object, focusComponentModelMat);
                    } else {
                        SetObejectMaterail(object, componentModelMat);
                    }
                    self.setState({
                        fetching: false
                    });

                    setTimeout(function () {
                        self.download构件模型();
                    }, 10);
                } catch (eo) {
                    self.setState({
                        fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + eo.message)
                    });
                }
            }, function (ev) {
                self.setState({
                    fetch_percent: ev.loaded / ev.total * 0.6 + 0.2
                });
            }, function (err) {
                self.setState({
                    fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + err.target.statusText)
                });
                console.error(err);
            });
        }
    }, {
        key: 'freshRenderParamLine',
        value: function freshRenderParamLine() {
            var _this3 = this;

            if (this.focusParam == null) {
                return;
            }
            var paramItem = this.focusParam;
            this.参数Parant.clear();
            this.focus构件记录Btn.参数信息_arr.forEach(function (item) {
                if (item == paramItem) {
                    item.geometry.visible = true;
                    item.geometry.material = redLineMat;
                    _this3.参数Parant.add(item.geometry);
                } else if (_this3.state.otherParamVisible) {
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
                    _this3.参数Parant.add(item.geometry);
                }
            });
        }
    }, {
        key: 'setFocusParam',
        value: function setFocusParam(paramItem) {
            var _this4 = this;

            if (paramItem == this.focusParam) {
                this.freshRenderParamLine();
                return;
            }
            var controls = this.controls;
            this.focusParam = paramItem;
            this.sphereInter.visible = false;
            if (paramItem == null) {
                this.参数Parant.clear();
                if (this.focus构件记录Btn) {
                    this.focus构件记录Btn.参数信息_arr.forEach(function (item) {
                        item.geometry.visible = true;
                        item.geometry.material = normalLineMat;
                        _this4.参数Parant.add(item.geometry);
                    });
                }
            } else {
                this.freshRenderParamLine();
                //this.saveCameraView();
                controls.target.copy(paramItem.worldPos);
                if (paramItem.record.参数序号 == 0) {
                    this.sphereInter.visible = true;
                    this.sphereInter.position.copy(paramItem.worldPos);
                } else {
                    if (getCurveGeoLength(paramItem.geometry) >= 0.2) {
                        this.sphereInter.visible = true;
                        this.sphereLocPercent = 0;
                    }
                }
            }
            this.setState({
                focusParam: this.focusParam
            });
            controls.update();
        }
    }, {
        key: 'clickPreButtonHandler',
        value: function clickPreButtonHandler(ev) {
            if (this.focusParam != null) {
                this.setFocusParam(this.focus构件记录Btn.getPreParam(this.focusParam));
                return;
            }
            var newItem = this.getPre构件记录(this.focus构件记录Btn);
            if (newItem) {
                this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
            }
        }
    }, {
        key: 'clickNextButtonHandler',
        value: function clickNextButtonHandler(ev) {
            if (this.focusParam != null) {
                this.setFocusParam(this.focus构件记录Btn.getNextParam(this.focusParam));
                return;
            }
            var newItem = this.getNext构件记录(this.focus构件记录Btn);
            if (newItem) {
                this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
            }
        }
    }, {
        key: 'clickExitButtonHandler',
        value: function clickExitButtonHandler(ev) {
            if (this.focusParam != null) {
                this.setFocusParam(null);
                return;
            }
            var drawing = this.state.drawing;
            popComponentSelector(drawing.name, drawing.code, this.props.projectCode, drawing.关联模型代码, this.构件选择Callback);
        }
    }, {
        key: 'clickKeyPointButtonHandler',
        value: function clickKeyPointButtonHandler(ev) {
            var uiItem = null;
            var elem = ev.target;
            while (uiItem == null && elem != null) {
                uiItem = elem.uiItem;
                elem = elem.parentElement;
            }
        }
    }, {
        key: 'toggleProjModelVisible',
        value: function toggleProjModelVisible(ev) {
            var newVisible = !this.state.projModelVisible;
            this.projModelObject.visible = newVisible;
            this.setState({
                projModelVisible: newVisible
            });
        }
    }, {
        key: 'toggleOPVVisible',
        value: function toggleOPVVisible(ev) {
            var newVisible = !this.state.otherParamVisible;
            this.setState({
                otherParamVisible: newVisible
            });
            var self = this;
            setTimeout(function () {
                self.freshRenderParamLine();
            }, 100);
        }
    }, {
        key: 'toggleMetaModelVisible',
        value: function toggleMetaModelVisible(ev) {
            var newVisible = !this.state.metaModelVisible;
            if (this.metaModelObject) {
                this.metaModelObject.visible = newVisible;
            }
            this.setState({
                metaModelVisible: newVisible
            });
        }
    }, {
        key: 'toggleDoneVisible',
        value: function toggleDoneVisible(ev) {
            var newVisible = !this.state.doneVisible;
            this.setState({
                doneVisible: newVisible
            });
        }
    }, {
        key: 'toggleUnDoneVisible',
        value: function toggleUnDoneVisible(ev) {
            var newVisible = !this.state.undoneVisible;
            this.setState({
                undoneVisible: newVisible
            });
        }
    }, {
        key: 'toggleComponentModelVisible',
        value: function toggleComponentModelVisible(ev) {
            var newVisible = !this.state.comModelVisible;
            this.构件模型Parant.visible = newVisible;
            this.setState({
                comModelVisible: newVisible
            });
        }
    }, {
        key: 'modelChanged',
        value: function modelChanged() {
            if (this.state.drawing == null) {
                return;
            }
            var self = this;
            if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                this.setState({
                    showingModelPath: this.state.drawing.全局模型文件路径,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载图纸模型',
                    fetch_error: ''
                });

                var loader = this.mainLoader;
                var logData = {};
                loader.load(window.location.origin + this.state.drawing.全局模型文件路径, function (object) {
                    self.setState({
                        fetch_title: '解析图纸模型'
                    });
                    try {
                        var scene = self.scene;
                        var camera = self.camera;
                        var controls = self.controls;
                        logData.hadScene = scene != null;
                        logData.inited = self.state.inited;

                        // object.children.forEach(c=>{
                        //     c.material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
                        // });

                        scene.add(object);
                        var box = new THREE.Box3();
                        box.expandByObject(object);
                        var size = new THREE.Vector3();
                        var center = new THREE.Vector3();
                        box.getSize(size);
                        box.getCenter(center);
                        console.log('loaded');
                        controls.target.copy(center);
                        var cameraPos = center.clone();
                        logData.cameraPos = cameraPos;
                        logData.center = center;
                        cameraPos.add(new THREE.Vector3(size.x * 0.5, size.y * 0.5, size.z));
                        camera.position.copy(cameraPos);
                        if (self.projModelObject != null) {
                            self.projModelObject.clear();
                            scene.remove(self.projModelObject);
                        }
                        self.projModelObject = object;

                        object.userData['texts'].forEach(function (textGeo) {
                            var divElem = document.createElement('div');
                            divElem.innerText = textGeo.text;
                            divElem.className = 'badge badge-info';
                            var worldPos = new THREE.Vector3();
                            worldPos.fromArray(textGeo.point, 0);
                            // let helper = new THREE.AxesHelper(5);
                            // helper.position.copy(worldPos);
                            // scene.add(helper);

                            var newLabelItem = new THREE_LabelItem(divElem, worldPos);
                            self.labelsRef.current.appendChild(divElem);
                            self.uiItem_arr.push(newLabelItem);
                        });
                        self.setState({
                            fetching: false,
                            projModelVisible: true
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: '\u51FA\u9519\u4E86:' + eo.message + ':' + JSON.stringify(logData)
                        });
                    }
                }, function (ev) {
                    self.setState({
                        fetch_percent: ev.loaded / ev.total * 0.6 + 0.2
                    });
                }, function (err) {
                    self.setState({
                        fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + err.target.statusText)
                    });
                    console.error(err);
                });
            }
        }
    }, {
        key: '\u53C2\u6570\u6587\u4EF6Changed',
        value: function Changed() {
            var _this5 = this;

            if (this.state.drawing == null) {
                return;
            }
            if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载参数数据',
                    fetch_error: ''
                });
                var self = this;
                var 图纸代码 = this.state.drawing.code;
                nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_全局参数数据' }).then(function (json) {
                    if (json.err != null) {
                        self.setState({
                            fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                        });
                        return;
                    }
                    var 参数名称_dic = {};
                    var 参数数据_arr = json.data;
                    参数数据_arr.forEach(function (item) {
                        参数名称_dic[item.加工图纸参数代码] = item.参数名称;
                    });
                    self.setState({
                        fetch_percent: 0.2,
                        fetch_title: '加载参数模型文件'
                    });

                    var loader = _this5.mainLoader;
                    loader.load(window.location.origin + _this5.state.drawing.参数信息文件路径, function (object) {
                        self.setState({
                            fetch_title: '解析参数数据模型'
                        });
                        try {
                            var scene = self.scene;
                            var camera = self.camera;
                            var controls = self.controls;

                            self.图纸部位Btns_arr.forEach(function (item) {
                                return item.clearParam();
                            });

                            var 参数几何体_dic = {};
                            var layers_arr = object.userData['layers'];
                            object.children.forEach(function (obj) {
                                var layer = layers_arr[obj.userData.attributes.layerIndex];
                                var objName = obj.userData.attributes.name;
                                var centerPos = new THREE.Vector3();
                                var startPos = new THREE.Vector3();
                                var endPos = new THREE.Vector3();
                                var t_arr = layer.name.split('_');
                                var paramCode = parseInt(t_arr[1]);
                                var paramName = 参数名称_dic[paramCode];
                                obj.userData.attributes.userStrings.forEach(function (item) {
                                    if (item[0] == 'center') {
                                        t_arr = item[1].split(',');
                                        var X = parseFloat(t_arr[0]);
                                        var Y = parseFloat(t_arr[1]);
                                        var Z = parseFloat(t_arr[2]);
                                        centerPos.set(X, Y, Z);
                                    } else if (item[0] == 'start') {
                                        t_arr = item[1].split(',');
                                        var _X = parseFloat(t_arr[0]);
                                        var _Y = parseFloat(t_arr[1]);
                                        var _Z = parseFloat(t_arr[2]);
                                        startPos.set(_X, _Y, _Z);
                                    } else if (item[0] == 'end') {
                                        t_arr = item[1].split(',');
                                        var _X2 = parseFloat(t_arr[0]);
                                        var _Y2 = parseFloat(t_arr[1]);
                                        var _Z2 = parseFloat(t_arr[2]);
                                        endPos.set(_X2, _Y2, _Z2);
                                    }
                                });
                                t_arr = objName.split('_');
                                var 全局代码 = t_arr[0];
                                var 方位名称 = t_arr[1];
                                var 部位代码 = t_arr[2];
                                var 一级序号 = t_arr[3];
                                var 二级序号 = t_arr[4];
                                var 参数序号 = t_arr[5];
                                var 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                                var 参数key = 参数位置信息.英文名称 + '_' + paramName + 参数序号;
                                obj.material = normalLineMat;
                                参数几何体_dic[参数key] = { obj: obj, center: centerPos, start: startPos, end: endPos, 位置信息: 参数位置信息 };
                            });

                            self.图纸部位Btns_arr = [];
                            self.图纸部位_dic = {};
                            参数数据_arr.forEach(function (item) {
                                var 全局代码 = item.全局代码;
                                var 方位名称 = item.方位名称;
                                var 部位代码 = item.部位代码;
                                var 一级序号 = item.一级序号;
                                var 二级序号 = item.二级序号;
                                var 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                                var 参数key = 参数位置信息.英文名称 + '_' + item.参数名称 + (item.参数序号 == 0 ? 1 : item.参数序号);
                                var 参数几何体 = 参数几何体_dic[参数key];
                                if (参数几何体 == null) {
                                    return;
                                }
                                if (self.图纸部位_dic[参数位置信息.英文名称] == null) {
                                    var new图纸部位Item = new THREE_图纸部位Item(参数位置信息);
                                    self.图纸部位Btns_arr.push(new图纸部位Item);
                                    self.图纸部位_dic[参数位置信息.英文名称] = new图纸部位Item;
                                    self.图纸部位_dic[参数位置信息.中文名称] = new图纸部位Item;
                                }
                                var use图纸部位Item = self.图纸部位_dic[参数位置信息.英文名称];
                                var btnElem = document.createElement('button');
                                btnElem.className = 'btn btn-primary';
                                btnElem.onclick = self.clickParamButtonHandler;
                                var worldPos = 参数几何体.center;
                                if (item.参数序号 == 0) {
                                    worldPos = 参数几何体.start;
                                }
                                var 参数item = new THREE_ParamItem(btnElem, worldPos, 参数几何体.obj, 参数位置信息, item);
                                use图纸部位Item.addParam(参数item, 参数几何体.start);
                                btnElem.uiItem = 参数item;
                            });

                            self.图纸部位Btns_arr.forEach(function (meta) {
                                meta.paramChanged();
                                meta.calWordlPos();
                            });

                            //let newMetaItem = new THREE_图纸部位Item(btnElem,worldPos,self.ProjectMeta.createPositionInfo(dr.全局代码,dr.方位名称,dr.部位代码));
                            // scene.add(object);
                            // console.log(object);
                            self.setState({
                                fetching: false
                            });
                        } catch (eo) {
                            self.setState({
                                fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + eo.message)
                            });
                        }
                    }, function (ev) {
                        self.setState({
                            fetch_percent: ev.loaded / ev.total * 0.6 + 0.2
                        });
                    }, function (err) {
                        self.setState({
                            fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + err.target.statusText)
                        });
                        console.error(err);
                    });
                });
            }
        }
    }, {
        key: 'clickDrawingBtnHandler',
        value: function clickDrawingBtnHandler(ev) {
            this.preDrawing = this.state.drawing;
            this.setState({ drawing: null });
        }
    }, {
        key: 'clickCloseDSHandler',
        value: function clickCloseDSHandler(ev) {
            var _this6 = this;

            var preDrawing = this.preDrawing;
            setTimeout(function () {
                _this6.setState({ drawing: preDrawing });
            }, 10);
        }
    }, {
        key: 'download\u6784\u4EF6\u53C2\u6570',
        value: function download() {
            var 种类index = 0;
            var downloading构件种类 = null;
            var self = this;
            for (; 种类index < this.所有构件种类_arr.length; ++种类index) {
                var 构件种类 = this.所有构件种类_arr[种类index];
                if (!构件种类.downloaded) {
                    downloading构件种类 = 构件种类;
                    break;
                }
            }
            if (downloading构件种类 == null) {
                var newState = Object.assign(self.waitSetState, {
                    fetching: false
                });
                self.setState(newState);
                setTimeout(function () {
                    popComponentSelector(newState.drawing.name, newState.drawing.code, self.props.projectCode, newState.drawing.关联模型代码, self.构件选择Callback);
                }, 10);
                return;
            }
            self.setState({
                fetching: true,
                fetch_percent: 种类index / this.所有构件种类_arr.length,
                fetch_title: '加载' + downloading构件种类.name + '参数数据',
                fetch_error: ''
            });
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸种类代码: 4, 构件代码: downloading构件种类.code }, action: 'pulldata_构件参数数据' }).then(function (json) {
                if (json.err != null) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                    });
                    return;
                }
                var 参数数据_arr = json.data;
                参数数据_arr.forEach(function (item) {
                    var 上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                    if (上传记录 == null) {
                        return;
                    }
                    if (item.是复核参数) {
                        上传记录.复核参数_arr.push(item);
                    }
                });
                downloading构件种类.downloaded = true;
                setTimeout(function () {
                    self.download构件参数();
                }, 10);
            });
        }
    }, {
        key: 'drawingChangedHandler',
        value: function drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码, record) {
            var self = this;
            this.waitSetState = {
                drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null },
                coming: {}
            };
            this.setState({
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载构件集数据',
                fetch_error: ''
            });
            var 图纸代码 = drawingCode;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_图纸关联构件模型' }).then(function (json) {
                if (json.err != null) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                    });
                    return;
                }
                var 关联模型数据_arr = json.data;
                var 所有构件种类_arr = [];
                关联模型数据_arr.forEach(function (item) {
                    item.X *= 0.001;
                    item.Y *= 0.001;
                    item.Z *= 0.001;
                    var 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                    var 部位key = 图纸代码 + '_' + 构件位置信息.英文名称;

                    var found构件种类 = 所有构件种类_arr.find(function (x) {
                        return x.code == item.构件代码;
                    });
                    if (found构件种类 == null) {
                        var t_arr = item.构件全称.split('-');
                        所有构件种类_arr.push({ code: item.构件代码, name: t_arr[1] });
                    }

                    var 上传记录 = null;
                    if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                        上传记录 = new C构件上传记录();
                        上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X, item.Y, item.Z));
                        self.构件上传记录_arr.push(上传记录);
                        self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                        上传记录.位置信息 = 构件位置信息;
                    } else {
                        上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                        上传记录.copy(item);
                    }

                    if (self.关联构件模型_dic[部位key] == null) {
                        self.关联构件模型_dic[部位key] = new C关联构件模型(构件位置信息);
                    }
                    var 关联构件模型 = self.关联构件模型_dic[部位key];
                    关联构件模型.append(上传记录);
                });
                self.所有构件种类_arr = 所有构件种类_arr;
                setTimeout(function () {
                    self.download构件参数();
                }, 10);
            });
            //console.log(`name:${drawingName},code:${drawingCode},参数上传记录代码:${参数上传记录代码},参数信息文件路径:${参数信息文件路径},关联模型代码:${关联模型代码}`);
            // this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null }, component:{构件上传记录代码:record.构件上传记录代码} });
            // this.setFocusParam(null);
        }
    }, {
        key: '\u6784\u4EF6\u9009\u62E9Callback',
        value: function Callback(rlt) {
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
    }, {
        key: 'renderFrame',
        value: function renderFrame(gameTime) {
            var _this7 = this;

            var time = gameTime - this.preGameTime;
            this.preGameTime = gameTime;
            var camera = this.camera;
            var scene = this.scene;
            var canvas = this.canvasRef.current;
            var renderer = this.renderer;
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
            var cameraDir = new THREE.Vector3();
            camera.getWorldDirection(cameraDir);

            var tempV = new THREE.Vector3();

            var theVec = new THREE.Vector3();
            this.uiItem_arr.forEach(function (item) {
                theVec.subVectors(item.worldPos, camera.position);
                item.dot = theVec.dot(cameraDir);
                item.dis = item.worldPos.distanceTo(camera.position);
            });

            var sorted_arr = this.uiItem_arr.concat();
            sorted_arr = sorted_arr.sort(function (a, b) {
                return a.dis - b.dis;
            });

            var visibleCount = 0;
            sorted_arr.forEach(function (item) {
                var visible = true;
                if (item.dot < 0 || visibleCount > 3) {
                    visible = false;
                }

                if (visible) {
                    visibleCount += 1;
                    tempV.copy(item.worldPos);
                    // item.target.getWorldPosition(tempV);
                    tempV.project(camera);
                    var x = (tempV.x * .5 + .5) * canvas.clientWidth;
                    var y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                    item.docElem.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px)';
                    item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
                    item.docElem.style.display = '';
                } else {
                    item.docElem.style.display = 'none';
                }
            });

            this.paramBtns_arr.forEach(function (btnItem) {
                if (_this7.focusParam != null) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
                if (btnItem.record.拍照状态 == 1) {
                    if (_this7.state.doneVisible == false) {
                        btnItem.docElem.style.display = 'none';
                        return;
                    }
                } else {
                    if (_this7.state.undoneVisible == false) {
                        btnItem.docElem.style.display = 'none';
                        return;
                    }
                }
                SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
            });

            renderer.render(scene, camera);
            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            if (this.props.visible == false) {
                return null;
            }
            var self = this;
            var fetchBarElem = null;
            if (this.state.fetching) {
                var percentValue = Math.round(this.state.fetch_percent * 100);
                fetchBarElem = React.createElement(
                    'div',
                    { className: 'progressContainer', style: { zIndex: 2000 } },
                    React.createElement('div', { className: 'mask' }),
                    React.createElement(
                        'div',
                        { className: 'progressDiv' },
                        React.createElement(
                            'h5',
                            null,
                            React.createElement(
                                'span',
                                { className: 'badge badge-light flex-grow-0 flex-shrink-0 p-2 shadow' },
                                this.state.fetch_title
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'progress' },
                            React.createElement(
                                'div',
                                { className: 'progress-bar progress-bar-striped progress-bar-animated', role: 'progressbar', style: { width: percentValue + '%' } },
                                percentValue,
                                '%'
                            )
                        ),
                        this.state.fetch_error && this.state.fetch_error.length > 0 ? React.createElement(
                            'div',
                            { className: 'flex-grow-0 flex-shrink-0 mt-2 text-danger bg-light' },
                            this.state.fetch_error
                        ) : null
                    )
                );
            }
            var rootDivClassName = 'erpc_threeD d-block hidenOverflow position-relative ' + (this.props.className == null ? '' : this.props.className);

            var topBtnsDiv = null;
            var 全局BtnsDiv = null;
            var nativeUIElem = null;
            var extraUIs_arr = [];

            var canvasWidth = 0;
            var canvasHeight = 0;
            if (this.rootRef.current != null) {
                canvasWidth = this.rootRef.current.clientWidth;
                canvasHeight = this.rootRef.current.clientHeight;
            }
            var canvasWidth_half = parseInt(canvasWidth * 0.5);
            var canvasHeight_half = parseInt(canvasHeight * 0.5);

            if (this.state.showingProjectCode != this.props.projectCode) {
                if (this.state.fetching == false) {
                    if (this.state.showingProjectCode != this.props.projectCode) {
                        setTimeout(function () {
                            self.ProjectChanged();
                        }, 10);
                    }
                }
            } else if (this.state.drawing == null) {
                // 选择全局图
                nativeUIElem = React.createElement(
                    'div',
                    { className: 'w-100 h-100 position-absolute', style: { left: 0, top: 0, zIndex: 500 } },
                    React.createElement(VisibleCDrawingSelectorForm, { actionName: 'pulldata_\u53EF\u9009\u6784\u4EF6\u5B89\u88C5\u56FE\u7EB8', 项目代码: this.props.projectCode, id: 'DrawingSelectorForm', parentPath: this.props.fullParentPath, title: '\u9009\u62E9\u5B9A\u4F4D\u56FE\u7EB8', pagebreak: false, selectMode: 'single', keyColumn: '\u9879\u76EE\u56FE\u7EB8\u5B9A\u4E49\u4EE3\u7801', onSelectedChanged: this.drawingChangedHandler, closable: this.preDrawing != null, clickCloseHandler: this.clickCloseDSHandler })
                );
                if (this.drawingDataDirted) {
                    this.drawingDataDirted = false;
                    setTimeout(function () {
                        pull_DrawingSelectorForm(null, self.props.fullParentPath, true, _this8.props.projectCode, 'pulldata_可选构件安装图纸');
                    }, 10);
                }
            } else {
                var drawingBtn = React.createElement(
                    'button',
                    { className: 'btn btn-light flex-grow-0 flex-shrink=0', onClick: this.clickDrawingBtnHandler },
                    React.createElement('i', { className: 'fa fa-map' }),
                    this.state.drawing.name
                );
                var iconElem1 = null;
                if (this.state.loadComponentModel) {
                    iconElem1 = React.createElement('i', { className: 'fa fa-cube' });
                } else {
                    iconElem1 = React.createElement(
                        'span',
                        { className: 'fa-stack fa-lg' },
                        React.createElement('i', { className: 'fa fa-cube fa-stack-1x' }),
                        React.createElement('i', { className: 'fa fa-ban fa-stack-2x text-danger' })
                    );
                }
                topBtnsDiv = React.createElement(
                    'div',
                    { className: 'd-flex flex-column position-absolute', style: { height: '70px', top: '5px', left: '5px' } },
                    drawingBtn
                );
                if (this.state.drawing.全局模型文件代码 == 0) {
                    // 等待选择全局模型文件
                } else if (this.state.fetching == false) {
                    if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                        setTimeout(function () {
                            self.modelChanged();
                        }, 10);
                    } else if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                        setTimeout(function () {
                            self.参数文件Changed();
                        }, 10);
                    } else {
                        var wantfocus构件记录 = this.构件上传记录_map[this.state.coming.上传记录代码];
                        if (this.state.focus构件记录 != wantfocus构件记录) {
                            setTimeout(function () {
                                self.构件记录Changed(wantfocus构件记录);
                            }, 10);
                        } else if (this.state.focus构件记录 != null) {
                            var btnName = this.state.focus构件记录.构件全称 + '  ';
                            var shotBtn = null;
                            if (this.state.focusParam != null) {
                                btnName += this.state.focusParam.record.参数名称 + this.state.focusParam.record.参数序号 + '=' + this.state.focusParam.record.参数值.toFixed(0);

                                shotBtn = React.createElement(
                                    'button',
                                    { onClick: this.clickShotHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 ml-2' },
                                    React.createElement('i', { className: 'fa fa-camera' })
                                );
                            }
                            extraUIs_arr.push(React.createElement(
                                'div',
                                { key: 'nag_middleBtns', className: 'd-flex flex-nowrap position-absolute ', style: { left: canvasWidth_half + 'px', top: canvasHeight - 50 + 'px', transform: 'translate(-50%,-100%)' } },
                                React.createElement(
                                    'button',
                                    { onClick: this.clickPreButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2' },
                                    React.createElement('i', { className: 'fa fa-angle-left' })
                                ),
                                React.createElement(
                                    'button',
                                    { onClick: this.clickExitButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2', style: { minWidth: '150px' } },
                                    btnName
                                ),
                                React.createElement(
                                    'button',
                                    { onClick: this.clickNextButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2' },
                                    React.createElement('i', { className: 'fa fa-angle-right' })
                                )
                            ));
                            extraUIs_arr.push(React.createElement(
                                'div',
                                { key: 'middleBtns', className: 'd-flex flex-nowrap position-absolute ', style: { left: canvasWidth_half + 'px', top: canvasHeight - 10 + 'px', transform: 'translate(-50%,-100%)' } },
                                React.createElement(
                                    'button',
                                    { onClick: this.clickViewDrawingHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2' },
                                    React.createElement('i', { className: 'fa fa-file-image-o' })
                                ),
                                shotBtn
                            ));
                            if (this.state.focus构件记录.复核参数_arr.length > 0) {
                                // 复核参数按钮
                                extraUIs_arr.push(React.createElement(
                                    'div',
                                    { key: 'comParamBtns', className: 'd-flex flex-column flex-nowrap position-absolute ', style: { left: '2px', top: canvasHeight - 100 + 'px', transform: 'translate(0%,-100%)' } },
                                    this.state.focus构件记录.复核参数_arr.map(function (item) {
                                        return React.createElement(
                                            'button',
                                            { key: item.参数上传数据代码, record_id: item.参数上传数据代码, onClick: _this8.clickShotHandler, className: "btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (item.拍照状态 ? 'success' : 'light') },
                                            React.createElement('i', { className: 'fa fa-camera' }),
                                            item.参数名称
                                        );
                                    })
                                ));
                            }
                        }
                    }
                    var opvBtn = null;
                    if (this.focusParam != null) {
                        opvBtn = React.createElement(
                            'button',
                            { onClick: this.toggleOPVVisible, className: 'btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1' },
                            React.createElement('i', { className: "fa fa-eye" + (this.state.otherParamVisible == false ? '-slash text-danger' : '') }),
                            '\u5176\u5B83\u53C2\u6570\u7EBF'
                        );
                    }
                    extraUIs_arr.push(React.createElement(
                        'div',
                        { key: 'toprightBtns', className: 'd-flex flex-column position-absolute ', style: { left: canvasWidth - 5 + 'px', top: '5px', transform: 'translate(-100%,0%)' } },
                        React.createElement(
                            'button',
                            { onClick: this.toggleProjModelVisible, className: 'btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1' },
                            React.createElement('i', { className: "fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '') }),
                            '\u573A\u9986\u6A21\u578B'
                        ),
                        React.createElement(
                            'button',
                            { onClick: this.toggleComponentModelVisible, className: 'btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1' },
                            React.createElement('i', { className: "fa fa-eye" + (this.state.comModelVisible == false ? '-slash text-danger' : '') }),
                            '\u6784\u4EF6\u6A21\u578B'
                        ),
                        opvBtn
                    ));
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
            return React.createElement(
                'div',
                { ref: this.rootRef, className: useStyleClass.class, style: useStyleClass.style, 'ctl-fullpath': needCtlPath ? this.props.fullPath : null },
                React.createElement('canvas', { ref: this.canvasRef, className: 'w-100 h-100 d-block' }),
                React.createElement('div', { ref: this.labelsRef, className: 'three-label-container', style: { left: 0, top: 0, zIndex: 10 } }),
                React.createElement('div', { ref: this.btnsRef, className: 'three-ui-container', style: { left: 0, top: 0, zIndex: 20 } }),
                React.createElement(
                    'div',
                    { className: 'position-absolute', style: { left: 0, top: 0, zIndex: 30 } },
                    topBtnsDiv,
                    extraUIs_arr
                ),
                nativeUIElem,
                fetchBarElem
            );
        }
    }]);

    return ERPC_ThreeDApp_B;
}(React.PureComponent);

function ERPC_ThreeDApp_B_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;

    return {
        visible: ctlState.visible != null ? ctlState.visible : ownprops.definvisible ? false : true,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode
    };
}

function ERPC_ThreeDApp_B_dispatchtorprops(dispatch, ownprops) {
    return {};
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
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_ComSel_onLoad();
    }, 50);
    setTimeout(function () {}, 50);
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
    setTimeout(function () {
        store.dispatch(makeAction_setStateByPath({ type: '设置参数', data: { 图纸名称: M_Page_ComSel_图纸名称, 项目代码: M_Page_ComSel_项目代码, 可视模型代码: M_Page_ComSel_可视模型代码, 图纸代码: M_Page_ComSel_图纸代码 } }, 'M_Page_ComSel.M_iframe_comsel.msg'));
    }, 50);
}
function M_iframe_comsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var M_iframe_comsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            构件信息: data
        };
        closePage2('M_Page_ComSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_ComSel', 'callBack');
        if (closePage_0_callback) {
            setTimeout(function () {
                closePage_0_callback(closePage_0exportParam);
            }, 20);
        }
    }
}

var CM_Page_ComSel = function (_React$PureComponent2) {
    _inherits(CM_Page_ComSel, _React$PureComponent2);

    function CM_Page_ComSel(props) {
        _classCallCheck(this, CM_Page_ComSel);

        var _this9 = _possibleConstructorReturn(this, (CM_Page_ComSel.__proto__ || Object.getPrototypeOf(CM_Page_ComSel)).call(this, props));

        _this9.id = 'M_Page_ComSel';
        ERPC_Page(_this9);
        return _this9;
    }

    _createClass(CM_Page_ComSel, [{
        key: 'render',
        value: function render() {
            var retElem = null;
            retElem = React.createElement(
                'div',
                { className: 'd-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen') },
                this.renderHead(),
                this.renderContent()
            );
            return retElem;
        }
    }, {
        key: 'renderHead',
        value: function renderHead() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
                React.createElement(
                    'h3',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    '\u5B89\u88C5\u6784\u4EF6\u9009\u53D6'
                ),
                React.createElement(
                    'button',
                    { onClick: this.close, className: 'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '') },
                    React.createElement('i', { className: 'fa fa-close' })
                )
            );
        }
    }, {
        key: 'renderHeadButton',
        value: function renderHeadButton() {
            var rlt_arr = [];
            return rlt_arr;
        }
    }, {
        key: 'renderContent',
        value: function renderContent() {
            var retElem = null;
            retElem = React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column fixPageContent ' },
                React.createElement(VisibleERPC_IFrame, { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column ', proj: 'GJYM', flowCode: '288', pageType: 'auto', onMessageFun: M_iframe_comsel_onReceiveMsg, id: 'M_iframe_comsel', parentPath: 'M_Page_ComSel' }),
                this.renderSidePage()
            );
            return retElem;
        }
    }]);

    return CM_Page_ComSel;
}(React.PureComponent);

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
var VisibleCM_Page_ComSel = ReactRedux.connect(CM_Page_ComSel_mapstatetoprops, CM_Page_ComSel_disptchtoprops)(CM_Page_ComSel);