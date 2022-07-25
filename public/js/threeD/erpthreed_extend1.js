'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ERPC_ThreeDApp_DaLianViewer = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp_DaLianViewer, _React$PureComponent);

    function ERPC_ThreeDApp_DaLianViewer(props) {
        _classCallCheck(this, ERPC_ThreeDApp_DaLianViewer);

        var _this = _possibleConstructorReturn(this, (ERPC_ThreeDApp_DaLianViewer.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_DaLianViewer)).call(this));

        autoBind(_this);
        ERPControlBase(_this);
        _this.inited = false;
        _this.initing = false;
        ERP_ThreeDAppBase(_this, {});
        return _this;
    }

    _createClass(ERPC_ThreeDApp_DaLianViewer, [{
        key: 'initApp',
        value: function initApp() {
            var canvas = this.canvasRef.current;
            var renderer = null;
            try {
                renderer = new THREE.WebGLRenderer({ canvas: canvas });
            } catch (eo) {
                alert('需要开启钉钉的WebGL功能');
                return;
            }
            if (renderer == null) {
                alert('需要开启钉钉的WebGL功能');
                return;
            }
            this.renderer = renderer;

            // const aspect = canvas.clientWidth / canvas.clientHeight;
            // const frustumSize = 100;
            // const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
            // camera.frustumSize = frustumSize;

            var fov = 75;
            var aspect = canvas.clientWidth / canvas.clientHeight;
            var near = 0.1;
            var far = 500;
            var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            this.camera = camera;

            camera.position.set(0, 0, 100);

            var self = this;
            var scene = new THREE.Scene();
            if (scene == null) {
                alert('无法创建THREE.Scene对象');
            }
            this.scene = scene;
            //scene.background = new THREE.Color(0x9DA3AA);
            scene.background = new THREE.Color(0xEEEEEE);
            this.拉索模型Parant = new THREE.Object3D();
            this.拉索模型Parant.position.set(0, 0, 0);
            scene.add(this.拉索模型Parant);

            this.索夹模型Parant = new THREE.Object3D();
            this.索夹模型Parant.position.set(0, 0, 0);
            scene.add(this.索夹模型Parant);

            var lightColor = 0xFFFFFF;
            var intensity = 1;
            var light = new THREE.DirectionalLight(lightColor, intensity);
            light.castShadow = false;
            this.dirLight = light;
            light.position.set(-1, 2, 4);
            scene.add(light);
            scene.add(light.target);

            var controls = new OrbitControls(camera, canvas);
            this.controls = controls;
            controls.target.set(0, 0, 0);
            controls.update();
            controls.enableDamping = true;
            controls.rotateSpeed = 0.3;
            controls.zoomSpeed = 0.3;
            controls.panSpeed = 0.5;
            controls.dampingFactor = 0.08;

            this.cameraLerp = new CCameraLerp(camera, controls);
        }
    }, {
        key: 'tryLoad\u6784\u4EF6\u6A21\u578B',
        value: function tryLoad() {
            var loading构件 = null;
            for (var si in this.needLoad构件_arr) {
                if (!this.needLoad构件_arr[si].isLoaded()) {
                    loading构件 = this.needLoad构件_arr[si];
                    break;
                }
            }
            if (loading构件 == null) {
                this.生成网片模型();
                return;
            }
            var self = this;
            this.load3dm(loading构件.fileurl, '\u52A0\u8F7D' + loading构件.name + '\u6A21\u578B', 0, 1, function (object) {
                var theMesh = object.children[0];
                loading构件.meshGeometry = theMesh.geometry;
                self.tryLoad构件模型();
            });
        }
    }, {
        key: 'showLine',
        value: function showLine(left, right, top, dowm, eyeLoc, targetLoc, targetQua, bForceFocus) {
            if (left > right) {
                var t = left;
                left = right;
                right = t;
            }
            if (dowm > top) {
                var _t = top;
                top = dowm;
                dowm = _t;
            }
            left -= 5;
            right += 5;
            top += 5;
            dowm -= 5;

            var dif_x = right - left;
            var dif_y = top - dowm;
            var dis_x = Math.abs(dif_x);
            var dis_y = Math.abs(dif_y);

            var mid_x = left + dif_x * 0.5;
            var mid_y = dowm + dif_y * 0.5;

            var camera = this.camera;
            var camera_width = camera.right - camera.left;
            var camera_height = camera.top - camera.bottom;

            var zoom = 1;
            if (dis_x > dis_y) {
                zoom = camera_width / dis_x;
            } else {
                zoom = camera_height / dis_y;
            }
            if (!bForceFocus && zoom > camera.zoom) {
                zoom = camera.zoom;
            }
            // camera.zoom = zoom;
            // camera.position.set(mid_x,mid_y,100);
            // camera.updateProjectionMatrix();
            // this.controls.target.set(mid_x,mid_y,0);
            // this.controls.cameraZoomChanged();
            // this.controls.update();

            this.cameraLerp.setPosition(eyeLoc, targetLoc, zoom, targetQua);
        }
    }, {
        key: '\u751F\u6210\u7F51\u7247\u6A21\u578B',
        value: function _() {
            var _this2 = this;

            var self = this;

            var _loop = function _loop(stepI) {
                var targetNet = _this2.state.targetNetA;
                var 网data = _this2.网Adata;
                if (stepI == 1) {
                    targetNet = _this2.state.targetNetB;
                    网data = _this2.网Bdata;
                }
                var 目标网片 = null;
                if (_this2.网片_map[targetNet.code] == null) {
                    目标网片 = new C网片(targetNet.name, targetNet.code);
                    _this2.网片_map[targetNet.code] = 目标网片;
                } else {
                    目标网片 = _this2.网片_map[targetNet.code];
                }
                if (stepI == 0) {
                    _this2.目标网片A = 目标网片;
                } else {
                    _this2.目标网片B = 目标网片;
                }

                目标网片.组网参数_arr = 网data.组网参数_arr;
                var self = _this2;
                var 拉索明细_arr = 网data.拉索_arr;
                var 拉索节点_map = {};
                // let 索夹_arr = 网data.索夹_arr;
                var 节点_arr = 网data.节点_arr;
                节点_arr.forEach(function (节点rcd) {
                    if (拉索节点_map[节点rcd.构件上传记录代码] == null) {
                        拉索节点_map[节点rcd.构件上传记录代码] = [];
                    }
                    节点rcd.X /= 100.0;
                    节点rcd.Y /= 100.0;
                    节点rcd.Z /= 100.0;
                    节点rcd.平X /= 100.0;
                    节点rcd.平Y /= 100.0;
                    节点rcd.平Z /= 100.0;
                    拉索节点_map[节点rcd.构件上传记录代码].push(节点rcd);
                });

                var 编号类型 = self.state.编号类型;
                var 当前索网拉索_map = {};
                var 张拉索_map = {};
                拉索明细_arr.forEach(function (拉索rcd) {
                    var 张拉索 = 目标网片.add索FromRecord(拉索rcd);
                    self.拉索模型Parant.add(张拉索.object3d);

                    张拉索_map[拉索rcd.构件上传记录代码] = 张拉索;
                    当前索网拉索_map[拉索rcd.构件上传记录代码] = 张拉索;

                    var 拉索节点_arr = 拉索节点_map[张拉索.构件上传记录代码];
                    张拉索.节点_arr = 拉索节点_arr;
                    var points = [];
                    var vector_arr = [];
                    拉索节点_arr.forEach(function (节点rcd) {
                        points.push(节点rcd.X, 节点rcd.Y, 节点rcd.Z);
                        vector_arr.push(new THREE.Vector3(节点rcd.X, 节点rcd.Y, 节点rcd.Z));
                    });

                    var lineGeometry = new THREE.BufferGeometry();
                    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
                    张拉索.索线geo = new THREE.Line(lineGeometry, 拉索lineMaterial);

                    var theSpline = new THREE.CatmullRomCurve3(vector_arr);
                    var extrudeSettings1 = {
                        steps: 100,
                        bevelEnabled: false,
                        extrudePath: theSpline
                    };
                    var useShape = null;
                    if (张拉索.类型 == E索类型.竖索) {
                        if (张拉索.索径 == 55) {
                            useShape = cicle_55;
                        } else {
                            useShape = cicle_40;
                        }
                    } else {
                        useShape = cicle_30;
                    }
                    var lineMeshGeometry = new THREE.ExtrudeGeometry(useShape, extrudeSettings1);
                    var lineMesh = new THREE.Mesh(lineMeshGeometry, 拉索Meshmaterial);
                    张拉索.索线mesh = lineMesh;
                    张拉索.object3d.add(lineMesh);

                    var B节点 = 拉索节点_arr[0];
                    var T节点 = 拉索节点_arr[拉索节点_arr.length - 1];
                    var B端索头mesh = 张拉索.B索头构件.getone();
                    张拉索.B端索头mesh = B端索头mesh;
                    var B端rotMat = CreateMatrixFromAxisString(拉索rcd.朝向B);

                    B端索头mesh.setRotationFromMatrix(B端rotMat);
                    B端索头mesh.position.set(B节点.X, B节点.Y, B节点.Z);
                    B端索头mesh.scale.set(10, 10, 10);
                    张拉索.object3d.add(B端索头mesh);

                    var T端索头mesh = 张拉索.T索头构件.getone();
                    张拉索.T端索头mesh = T端索头mesh;
                    var T端rotMat = CreateMatrixFromAxisString(拉索rcd.朝向T);
                    T端索头mesh.setRotationFromMatrix(T端rotMat);
                    T端索头mesh.position.set(T节点.X, T节点.Y, T节点.Z);
                    T端索头mesh.scale.set(10, 10, 10);
                    张拉索.object3d.add(T端索头mesh);

                    张拉索.B节点 = B节点;
                    张拉索.T节点 = T节点;

                    张拉索.平B_label.worldPos.set(B节点.X, B节点.Y, B节点.Z);
                    张拉索.平T_label.worldPos.set(T节点.X, T节点.Y, T节点.Z);

                    self.labelsRef.current.appendChild(张拉索.平B_label.docElem);
                    self.labelsRef.current.appendChild(张拉索.平T_label.docElem);

                    张拉索.设置编号(编号类型);
                });
            };

            for (var stepI = 0; stepI < 2; ++stepI) {
                _loop(stepI);
            }

            this.switch步骤(self.步骤_无步骤, {
                fetching: false
            });
        }
    }, {
        key: '\u7F51\u7247\u9009\u62E9Callback',
        value: function Callback(data) {
            var _this3 = this;

            var target网片A = {
                code: data.网片A代码,
                name: data.网片A轴号,
                部位代码: data.网片A部位代码
            };
            var target网片B = {
                code: data.网片B代码,
                name: data.网片B轴号,
                部位代码: data.网片B部位代码
            };
            if (target网片A.部位代码 > target网片B.部位代码) {
                var t = target网片A;
                target网片A = target网片B;
                target网片B = t;
            }
            if (target网片A.code == this.state.targetNetA.code && target网片B.code == this.state.targetNetB.code) {
                return;
            }
            if (this.目标网片_arr.length > 0) {
                this.state.now步骤.exit();
                this.state.now步骤 = this.步骤_无步骤;
                this.拉索模型Parant.clear();
                this.索夹模型Parant.clear();
                this.标注线Parant.clear();
                var labelsRef = this.labelsRef;
                this.目标网片_arr.forEach(function (当前网片) {
                    当前网片.索_arr.forEach(function (张拉索) {
                        labelsRef.current.removeChild(张拉索.平B_label.docElem);
                        labelsRef.current.removeChild(张拉索.平T_label.docElem);
                        张拉索.索线geo.geometry.dispose();
                        张拉索.索线geo = null;

                        张拉索.object3d.clear();
                        张拉索.索线mesh.geometry.dispose();
                        张拉索.索线mesh = null;
                        张拉索.B索头构件.reback(张拉索.B端索头mesh);
                        张拉索.T索头构件.reback(张拉索.T端索头mesh);
                        张拉索.B端索头mesh = null;
                        张拉索.T端索头mesh = null;
                    });
                    当前网片.索夹_arr.forEach(function (索夹) {
                        索夹.构件.reback(索夹.meshObj);
                        索夹.meshObj = null;
                    });
                    当前网片.索夹_arr = [];
                });
                this.目标网片_arr = [];
            }
            console.log('网片选择Callback');

            var self = this;

            self.setState({
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载网片信息',
                fetch_error: '',
                targetNetA: target网片A,
                targetNetB: target网片B
            });

            nativeFetchJson(false, threeDServerUrl, { bundle: { 索网A代码: target网片A.code, 索网B代码: target网片B.code }, action: 'pulldata_并网数据查询' }).then(function (json) {
                if (json.err != null) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                    });
                    return;
                }
                console.log(json.data);

                var 网Adata = json.data.网A;
                var 网Bdata = json.data.网B;

                _this3.网Adata = 网Adata;
                _this3.网Bdata = 网Bdata;

                var 构件_arr = json.data.构件_arr;
                构件_arr.forEach(function (构件rcd) {
                    all构件模型_map[构件rcd.构件代码].fileurl = 构件rcd.文件路径;
                });

                var needLoad构件_arr = [标准构件_30固定端, 标准构件_40固定端, 标准构件_55固定端, 标准构件_30调节端];
                if (!标准构件_30固定端.isLoaded()) {
                    needLoad构件_arr.push(标准构件_30固定端);
                }
                if (!标准构件_40固定端.isLoaded()) {
                    needLoad构件_arr.push(标准构件_40固定端);
                }
                if (!标准构件_55固定端.isLoaded()) {
                    needLoad构件_arr.push(标准构件_55固定端);
                }
                if (!标准构件_30调节端.isLoaded()) {
                    needLoad构件_arr.push(标准构件_30调节端);
                }
                // let checked_map = {};
                // 索夹_arr.forEach(索夹rcd=>{
                //     if(!checked_map[索夹rcd.索夹构件代码]){
                //         let 索夹构件 = all构件模型_map[索夹rcd.索夹构件代码];
                //         if(!索夹构件.isLoaded()){
                //             needLoad构件_arr.push(索夹构件);
                //             checked_map[索夹rcd.索夹构件代码] = 1;
                //         }
                //     }
                // });
                self.needLoad构件_arr = needLoad构件_arr;
                self.tryLoad构件模型();
            });
        }
    }, {
        key: 'clickResetBtnHandler',
        value: function clickResetBtnHandler(ev) {
            // this.camera.setRotationFromEuler(new THREE.Euler( 0, 0, 0, 'XYZ' ));
            // this.camera.updateProjectionMatrix();
            var controls = this.controls;
            if (this.cameraLerp.defaultState) {
                var lerState = this.cameraLerp.defaultState;
                this.cameraLerp.setPosition(lerState.eyepos, lerState.target, lerState.zoom, lerState.quaternion);
            }
        }
    }, {
        key: 'renderFrame',
        value: function renderFrame(gameTime) {
            var time = gameTime - this.preGameTime;
            this.preGameTime = gameTime;
            var camera = this.camera;
            var scene = this.scene;
            var canvas = this.canvasRef.current;
            var renderer = this.renderer;
            if (this.resizeRendererToDisplaySize()) {
                // camera.aspect = canvas.clientWidth / canvas.clientHeight;
                var aspect = canvas.clientWidth / canvas.clientHeight;
                var frustumSize = camera.frustumSize;
                camera.left = frustumSize * aspect / -2;
                camera.right = frustumSize * aspect / 2;
                camera.top = frustumSize / 2;
                camera.bottom = frustumSize / -2;
                camera.updateProjectionMatrix();
                this.setState({
                    magicObj: {} // 窗口尺寸有变化，UI也要重新渲染
                });
            }

            // this.controls.update();
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

            if (this.目标网片A) {
                this.state.now步骤.renderFrame(time);
            }

            renderer.render(scene, camera);
            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: 'doDataInit',
        value: function doDataInit() {
            var self = this;
            self.setState({
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载基础信息',
                fetch_error: ''
            });
            nativeFetchJson(false, threeDServerUrl, { bundle: { 项目代码: 10429 }, action: 'pulldata_项目全局可视模型' }).then(function (json) {
                if (json.err != null) {
                    self.setState({
                        fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                    });
                    return;
                }
                console.log(json.data);

                self.setState({
                    fetching: false,
                    fetch_percent: 0
                });
            });
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
            } else {
                if (!this.inited) {
                    if (!this.initing) {
                        this.initing = true;
                        setTimeout(function () {
                            self.doDataInit();
                        }, 100);
                    }
                }
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

    return ERPC_ThreeDApp_DaLianViewer;
}(React.PureComponent);

function ERPC_ThreeDApp_DaLianViewer_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_DaLianViewer_dispatchtorprops(dispatch, ownprops) {
    return {};
}
var VisibleERPC_ThreeDApp_DaLianViewer = null;

function InitThreedApp_DaLianViewer() {
    VisibleERPC_ThreeDApp_DaLianViewer = ReactRedux.connect(ERPC_ThreeDApp_DaLianViewer_mapstatetoprops, ERPC_ThreeDApp_DaLianViewer_dispatchtorprops)(ERPC_ThreeDApp_DaLianViewer);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp_DaLianViewer);