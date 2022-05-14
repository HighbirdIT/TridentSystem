'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ERPC_ThreeDApp_D = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp_D, _React$PureComponent);

    function ERPC_ThreeDApp_D(props) {
        _classCallCheck(this, ERPC_ThreeDApp_D);

        var _this = _possibleConstructorReturn(this, (ERPC_ThreeDApp_D.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_D)).call(this));

        autoBind(_this);
        ERPControlBase(_this);
        ERP_ThreeDAppBase(_this, {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false,
            paramlineVisible: true,
            comLabelVisible: true
        });

        _this.drawingDataDirted = true;
        _this.图纸部位Btns_arr = [];
        _this.focus构件记录 = null;
        _this.focusParam = null;
        _this.cameraInfo_arr = [];
        _this.部位相机loc = {};
        _this.关联构件模型_dic = {};
        _this.构件上传记录_arr = [];
        _this.构件上传记录_map = {};
        _this.comLabelItems_arr = [];

        _this.ProjectChanged = ProjectChanged1.bind(_this);
        _this.initApp = InitApp1.bind(_this);
        return _this;
    }

    _createClass(ERPC_ThreeDApp_D, [{
        key: 'download\u6784\u4EF6\u6A21\u578B',
        value: function download() {
            var now构件记录 = this.focus构件记录;
            var downLoadItem = null;
            for (var si in this.needDownloadItems) {
                var item = this.needDownloadItems[si];
                if (item.object3d == null) {
                    downLoadItem = item;
                    break;
                }
            }
            var self = this;
            if (downLoadItem == null) {
                if (this.state.fetching) {
                    self.setState({
                        fetching: false,
                        fetch_percent: 0
                    });
                }
                return;
            }

            this.load3dm(downLoadItem.文件路径, '\u52A0\u8F7D' + downLoadItem.构件全称 + '\u5B9E\u4F53\u6A21\u578B', 0, 1, function (object) {
                self.setState({
                    fetch_title: '解析实体模型'
                });
                try {
                    for (var si in object.children) {
                        TurnOffShadow(object.children[si]);
                    }

                    downLoadItem.object3d = object;
                    var controls = self.controls;

                    if (downLoadItem == now构件记录) {
                        self.focus构件Parant.add(object);
                    } else {
                        self.构件模型Parant.add(object);
                    }
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
                        SetObejectMaterail(object, 判断构件使用Mat(downLoadItem.生存状态代码));
                    }

                    setTimeout(function () {
                        self.download构件模型();
                    }, 10);
                } catch (eo) {
                    self.setState({
                        fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + eo.message)
                    });
                }
            });
        }
    }, {
        key: 'freshRenderParamLine',
        value: function freshRenderParamLine() {
            if (this.focus构件记录 == null) {
                return;
            }
            if (this.参数Parant.length > 0) {
                return;
            }
            var self = this;
            var 部位位置信息 = this.focus构件记录.位置信息;
            var 关联部位参数 = this.图纸部位_dic[部位位置信息.英文名称];
            if (关联部位参数 != null) {
                关联部位参数.参数信息_arr.forEach(function (item) {
                    self.参数Parant.add(item.geometry);
                });
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
        key: 'toggleComponentModelVisible',
        value: function toggleComponentModelVisible(ev) {
            var newVisible = !this.state.comModelVisible;
            this.构件模型Parant.visible = newVisible;
            this.setState({
                comModelVisible: newVisible
            });
        }
    }, {
        key: 'toggleParamLineVisible',
        value: function toggleParamLineVisible(ev) {
            var newVisible = !this.state.paramlineVisible;
            this.参数Parant.visible = newVisible;
            this.setState({
                paramlineVisible: newVisible
            });
        }
    }, {
        key: 'toggleComLabelVisible',
        value: function toggleComLabelVisible(ev) {
            var newVisible = !this.state.comLabelVisible;
            this.setState({
                comLabelVisible: newVisible
            });
        }
    }, {
        key: 'clickToggleLoadParamLineHandler',
        value: function clickToggleLoadParamLineHandler(ev) {
            var loadParamModel = (this.state.loadParamModel == null ? this.props.loadParamModel : this.state.loadParamModel) == true;
            if (loadParamModel) {
                this.参数Parant.clear();
            }
            this.setState({
                loadParamModel: !loadParamModel
            });
        }
    }, {
        key: '\u53C2\u6570\u6587\u4EF6Changed',
        value: function Changed() {
            if (this.state.drawing == null) {
                return;
            }
            if (this.图纸部位参数_cache == null) {
                this.图纸部位参数_cache = {};
            }
            if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                var 参数信息文件路径 = this.state.drawing.参数信息文件路径;
                var 参数上传记录代码 = this.state.drawing.参数上传记录代码;
                var 图纸代码 = this.state.drawing.code;
                if (this.state.drawing.参数信息文件代码 == 0) {
                    this.setState({
                        showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                        fetching: false,
                        参数文件loaded: false
                    });
                    return;
                }

                if (this.图纸部位参数_cache[参数上传记录代码] != null) {
                    var cache = this.图纸部位参数_cache[参数上传记录代码];
                    this.图纸部位Btns_arr = cache.图纸部位Btns_arr;
                    this.图纸部位_dic = cache.图纸部位_dic;
                    this.setState({
                        showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                        fetching: false,
                        参数文件loaded: true
                    });
                    return;
                }
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载参数数据',
                    fetch_error: ''
                });
                var self = this;
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

                    self.load3dm(参数信息文件路径, '加载参数数据模型', 0.2, 0.8, function (object) {
                        self.setState({
                            fetch_title: '解析参数数据模型'
                        });
                        try {
                            if (self.图纸部位Btns_arr != null) {
                                self.图纸部位Btns_arr.forEach(function (item) {
                                    return item.clearParam();
                                });
                            }

                            var 参数几何体_dic = {};
                            var layers_arr = object.userData['layers'];
                            object.children.forEach(function (obj) {
                                var layer = layers_arr[obj.userData.attributes.layerIndex];
                                var objName = obj.userData.attributes.name;
                                var t_arr = layer.name.split('_');
                                var paramCode = parseInt(t_arr[1]);
                                var paramName = 参数名称_dic[paramCode];
                                var centerPos = geoPointAtNormalizeLength(obj, 0.5);
                                var startPos = geoPointAtNormalizeLength(obj, 0);
                                var endPos = geoPointAtNormalizeLength(obj, 1);
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

                            self.图纸部位参数_cache[参数上传记录代码] = {
                                图纸部位Btns_arr: self.图纸部位Btns_arr,
                                图纸部位_dic: self.图纸部位_dic
                            };

                            self.setState({
                                fetching: false,
                                fetch_percent: 0,
                                参数文件loaded: true
                            });
                        } catch (eo) {
                            self.setState({
                                fetch_error: JSON.stringify('\u51FA\u9519\u4E86:' + eo.message)
                            });
                        }
                    });
                });
            }
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
                    fetching: false,
                    fetch_percent: 0
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
                        上传记录.add复核参数(item);
                    }
                });
                downloading构件种类.downloaded = true;
                setTimeout(function () {
                    self.download构件参数();
                }, 10);
            });
        }
    }, {
        key: 'targetRecordChanged',
        value: function targetRecordChanged() {
            var _this2 = this;

            if (this.camera == null || this.props.targetRecordID == this.state.targetRecordID) {
                return;
            }
            if (this.focus构件Parant == null) {
                this.focus构件Parant = new THREE.Object3D();
                this.scene.add(this.focus构件Parant);
            } else {
                this.focus构件Parant.clear();
            }
            var self = this;
            var 上传记录代码 = this.props.targetRecordID;

            this.setState({
                fetch_title: '获取构件数据中',
                fetch_percent: 0,
                fetching: true,
                targetRecordID: this.props.targetRecordID
            });
            this.参数Parant.clear();
            this.构件模型Parant.clear();

            var labelsRefDiv = self.labelsRef.current;
            if (labelsRefDiv != null) {
                self.comLabelItems_arr.forEach(function (item) {
                    labelsRefDiv.removeChild(item.docElem);
                });
                self.comLabelItems_arr = [];
            }
            nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: 上传记录代码, 最大距离: 0.1 }, action: 'pulldata_查找相邻构件信息' }).then(function (json) {
                if (self.props.targetRecordID != 上传记录代码) {
                    return; // 又切换了目录
                }
                if (json.err != null) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                    });
                    return;
                }
                var record_arr = json.data;
                if (record_arr.length == 0) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + 上传记录代码 + '\u4E0D\u662F\u6709\u6548\u7684\u6784\u4EF6\u8BB0\u5F55'
                    });
                    return;
                }
                var 显示记录_arr = [];
                var now构件记录 = null;
                record_arr.forEach(function (item) {
                    item.X *= 0.001;
                    item.Y *= 0.001;
                    item.Z *= 0.001;
                    var 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                    var 上传记录 = null;
                    if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                        上传记录 = new C构件上传记录();
                        上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z), item.构件生存状态代码);
                        self.构件上传记录_arr.push(上传记录);
                        self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                        上传记录.位置信息 = 构件位置信息;
                    } else {
                        上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                        上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z), item.构件生存状态代码);
                    }
                    if (上传记录.上传记录代码 == 上传记录代码) {
                        now构件记录 = 上传记录;
                    }
                    显示记录_arr.push(上传记录);

                    var divElem = document.createElement('div');
                    divElem.innerText = 上传记录.构件全称;
                    divElem.className = now构件记录 == 上传记录 ? 'badge badge-primary' : 'badge badge-light';
                    var newLabelItem = new THREE_LabelItem(divElem, 上传记录.worldPos);

                    labelsRefDiv.appendChild(divElem);
                    self.comLabelItems_arr.push(newLabelItem);
                });

                var TargetToEye_vec = new THREE.Vector3(0, 0, 0);
                if (_this2.focus构件记录 == null) {
                    var pos1 = new THREE.Vector3(0, 0, 0);
                    pos1.set(0, 0, now构件记录.worldPos.Z);
                    TargetToEye_vec.subVectors(now构件记录.worldPos, pos1);
                    TargetToEye_vec.normalize();
                    TargetToEye_vec.Z += 1;
                } else {
                    TargetToEye_vec.subVectors(self.camera.position, self.controls.target);
                }

                self.focus构件记录 = now构件记录;
                var needDownloadItems = [];
                var focusItems_arr = [now构件记录];
                var targetPos = now构件记录.worldPos;
                显示记录_arr.forEach(function (item) {
                    if (item.object3d != null) {
                        if (item == now构件记录) {
                            self.focus构件Parant.add(item.object3d);
                        } else {
                            self.构件模型Parant.add(item.object3d);
                        }
                    } else {
                        needDownloadItems.push(item);
                    }
                });

                var controls = self.controls;
                var eyePos = new THREE.Vector3(0, 0, 0);
                eyePos.copy(targetPos);
                eyePos.add(TargetToEye_vec);
                self.camera.position.copy(eyePos);
                controls.target.copy(targetPos);
                controls.enablePan = false;

                self.显示记录_arr = 显示记录_arr;
                self.focusItems_arr = focusItems_arr;
                self.needDownloadItems = needDownloadItems;
                if (needDownloadItems.length > 0) {
                    setTimeout(function () {
                        self.download构件模型();
                    }, 10);
                }

                self.needFresh部位参数 = true;
                self.setState({
                    fetch_percent: 0,
                    fetching: needDownloadItems.length > 0,
                    drawing: newDrawing
                });
            });
        }
    }, {
        key: 'renderFrame',
        value: function renderFrame(gameTime) {
            var _this3 = this;

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
            this.projLabelItem_arr.forEach(function (item) {
                theVec.subVectors(item.worldPos, camera.position);
                item.dot = theVec.dot(cameraDir);
                item.dis = item.worldPos.distanceTo(camera.position);
            });

            var sorted_arr = this.projLabelItem_arr.concat();
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

            this.comLabelItems_arr.forEach(function (btnItem) {
                if (_this3.state.comLabelVisible == false) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
                SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
            });

            renderer.render(scene, camera);
            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: 'render',
        value: function render() {
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

            if (this.props.projectCode == null) {
                nativeUIElem = React.createElement(
                    'div',
                    { className: 'btn btn-light position-absolute', style: { minWidth: '150px', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' } },
                    React.createElement('i', { className: 'fa fa-warning text-danger' }),
                    '\u672A\u6307\u5B9A\u76EE\u6807\u9879\u76EE'
                );
            } else if (this.state.showingProjectCode != this.props.projectCode) {
                if (this.state.fetching == false) {
                    if (this.state.showingProjectCode != this.props.projectCode) {
                        setTimeout(function () {
                            self.ProjectChanged();
                        }, 10);
                    }
                }
            } else if (this.props.targetRecordID == null) {
                nativeUIElem = React.createElement(
                    'div',
                    { className: 'btn btn-light position-absolute', style: { minWidth: '150px', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' } },
                    React.createElement('i', { className: 'fa fa-warning text-danger' }),
                    '\u672A\u9009\u62E9\u8981\u663E\u793A\u7684\u6784\u4EF6'
                );
            } else if (this.props.targetRecordID != this.state.targetRecordID) {
                setTimeout(function () {
                    self.targetRecordChanged();
                }, 10);
            }

            extraUIs_arr.push(React.createElement(
                'div',
                { key: 'nag_middleBtns', className: 'd-flex flex-nowrap position-absolute ', style: { left: canvasWidth_half + 'px', top: canvasHeight - 50 + 'px', transform: 'translate(-50%,-100%)' } },
                React.createElement(
                    'button',
                    { onClick: this.clickExitButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2', style: { minWidth: '150px' } },
                    btnName
                )
            ));

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

    return ERPC_ThreeDApp_D;
}(React.PureComponent);

function ERPC_ThreeDApp_D_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;
    var targetRecordID = ctlState.targetRecordID != null ? ctlState.targetRecordID : ownprops.targetRecordID;
    var maxDistance = ctlState.maxDistance != null ? ctlState.maxDistance : ownprops.maxDistance;
    if (maxDistance == null || isNaN(maxDistance)) {
        maxDistance = 0;
    } else {
        maxDistance = parseFloat(maxDistance);
    }

    return {
        visible: ctlState.visible != null ? ctlState.visible : ownprops.definvisible ? false : true,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode,
        targetRecordID: targetRecordID,
        maxDistance: maxDistance
    };
}

function ERPC_ThreeDApp_D_dispatchtorprops(dispatch, ownprops) {
    return {};
}
var VisibleERPC_ThreeDApp_D = null;

function InitThreedApp2() {
    VisibleERPC_ThreeDApp_D = ReactRedux.connect(ERPC_ThreeDApp_D_mapstatetoprops, ERPC_ThreeDApp_D_dispatchtorprops)(ERPC_ThreeDApp_D);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp2);