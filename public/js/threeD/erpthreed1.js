"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
var threeDServerUrl = '/erppage/server/threeD/threeD_s1';

var THREE_UIItem = function THREE_UIItem(docElem, worldPosition) {
    _classCallCheck(this, THREE_UIItem);

    this.docElem = docElem;
    this.worldPos = worldPosition;
};

var THREE_LabelItem = function (_THREE_UIItem) {
    _inherits(THREE_LabelItem, _THREE_UIItem);

    function THREE_LabelItem(docElem, worldPosition) {
        _classCallCheck(this, THREE_LabelItem);

        return _possibleConstructorReturn(this, (THREE_LabelItem.__proto__ || Object.getPrototypeOf(THREE_LabelItem)).call(this, docElem, worldPosition));
    }

    return THREE_LabelItem;
}(THREE_UIItem);

var THREE_ButtonItem = function (_THREE_UIItem2) {
    _inherits(THREE_ButtonItem, _THREE_UIItem2);

    function THREE_ButtonItem(docElem, worldPosition) {
        _classCallCheck(this, THREE_ButtonItem);

        return _possibleConstructorReturn(this, (THREE_ButtonItem.__proto__ || Object.getPrototypeOf(THREE_ButtonItem)).call(this, docElem, worldPosition));
    }

    return THREE_ButtonItem;
}(THREE_UIItem);

function makeInstance(geometry, color, coord) {
    var mat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    var rlt = new THREE.Mesh(geometry, mat);
    rlt.position.copy(coord);
    return rlt;
}

var ERPC_ThreeDApp = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp, _React$PureComponent);

    function ERPC_ThreeDApp(props) {
        _classCallCheck(this, ERPC_ThreeDApp);

        var _this3 = _possibleConstructorReturn(this, (ERPC_ThreeDApp.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp)).call(this));

        autoBind(_this3);

        ERPControlBase(_this3);
        _this3.initState = {
            fetching: false,
            fetch_title: "",
            fetch_percent: 0,
            fetch_error: "",
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null
        };
        _this3.state = _this3.initState;
        _this3.canvasRef = React.createRef();
        _this3.rootRef = React.createRef();
        _this3.labelsRef = React.createRef();
        _this3.btnsRef = React.createRef();
        _this3.drawingDataDirted = true;

        _this3.cubes_arr = [];
        _this3.uiItem_arr = [];
        _this3.图元Btns_arr = [];
        _this3.focusUIElem = null;
        _this3.focus图元Btn = null;
        _this3.cameraInfo_arr = [];
        return _this3;
    }

    _createClass(ERPC_ThreeDApp, [{
        key: "saveCameraView",
        value: function saveCameraView() {
            var nowPos = new THREE.Vector3();
            var nowTarget = new THREE.Vector3();
            nowPos.copy(this.camera.position);
            nowTarget.copy(this.controls.target);
            this.cameraInfo_arr.push({ pos: nowPos, target: nowTarget });
        }
    }, {
        key: "loadCameraView",
        value: function loadCameraView() {
            if (this.cameraInfo_arr.length > 0) {
                var item = this.cameraInfo_arr.pop();
                this.camera.position.copy(item.pos);
                this.controls.target.copy(item.target);
            }
        }
    }, {
        key: "cusComponentWillmount",
        value: function cusComponentWillmount() {
            this.startAPP();
            var drawingFormPath = this.props.fullParentPath + '.DrawingSelectorForm';
        }
    }, {
        key: "cusComponentWillUnmount",
        value: function cusComponentWillUnmount() {}
    }, {
        key: "clickKeyPointButtonHandler",
        value: function clickKeyPointButtonHandler(ev) {
            var uiItem = null;
            var elem = ev.target;
            while (uiItem == null && elem != null) {
                uiItem = elem.uiItem;
                elem = elem.parentElement;
            }
            var controls = this.controls;
            if (this.focus图元Btn == uiItem) {
                this.focus图元Btn = null;
                // controls.target.copy(this.originControlsTarget);
                this.loadCameraView();
                controls.enablePan = true;
            } else {
                this.focus图元Btn = uiItem;
                console.log(uiItem);
                this.saveCameraView();
                // this.originControlsTarget.copy(controls.target);
                controls.target.copy(uiItem.worldPos);
                controls.enablePan = false;
            }
            controls.update();
        }
    }, {
        key: "initApp",
        value: function initApp() {
            var canvas = this.canvasRef.current;
            var renderer = new THREE.WebGLRenderer({ canvas: canvas });
            this.renderer = renderer;

            var fov = 75;
            var aspect = canvas.clientWidth / canvas.clientHeight;
            var near = 0.1;
            var far = 500;
            var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            this.camera = camera;

            camera.position.set(0, 0, 100);

            var scene = new THREE.Scene();
            this.scene = scene;
            scene.background = new THREE.Color(0x9DA3AA);

            // const geometry = new THREE.BoxGeometry(1,1,1);
            // this.cubes_arr.push(makeInstance(geometry, 0xff0000, new THREE.Vector3(-2,0,0)));
            // this.cubes_arr.push(makeInstance(geometry, 0x00ff00, new THREE.Vector3(0,0,0)));
            // this.cubes_arr.push(makeInstance(geometry, 0x0000ff, new THREE.Vector3(2,0,0)));

            // this.cubes_arr.forEach(cube=>{
            //     scene.add(cube);
            // });

            var lightColor = 0xFFFFFF;
            var intensity = 1;
            var light = new THREE.DirectionalLight(lightColor, intensity);
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
        }
    }, {
        key: "\u56FE\u5143Changed",
        value: function Changed() {
            var _this4 = this;

            if (this.state.drawing == null) {
                return;
            }
            if (this.state.showing图元代码 != this.state.drawing.图元代码) {
                this.setState({
                    showing图元代码: this.state.drawing.图元代码,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载图元数据',
                    fetch_error: ''
                });
                var self = this;
                nativeFetchJson(false, threeDServerUrl, { bundle: { 图元代码: this.state.drawing.图元代码 }, action: 'pulldata_图元明细数据' }).then(function (json) {
                    if (json.err != null) {
                        self.setState({
                            fetch_error: JSON.stringify("\u51FA\u9519\u4E86:" + json.info)
                        });
                        return;
                    }
                    _this4.setState({
                        fetch_percent: 0.5,
                        fetch_title: '分析图元数据'
                    });
                    if (self.图元Btns_arr != null) {
                        self.图元Btns_arr.forEach(function (tElem) {
                            self.btnsRef.current.removeChild(tElem.docElem);
                        });
                    }
                    var 全局_arr = [];
                    var 全局_dic = {};
                    self.图元Btns_arr = [];
                    for (var si in json.data) {
                        var dr = json.data[si];
                        if (全局_dic[dr.全局名称] == null) {
                            全局_dic[dr.全局名称] = 1;
                            全局_arr.push({ name: dr.全局名称, code: dr.全局代码 });
                        }
                        var worldPos = new THREE.Vector3();
                        var t_arr = dr.放置点.split(',');
                        var X = parseFloat(t_arr[0]) * 0.001;
                        var Y = parseFloat(t_arr[1]) * 0.001;
                        var Z = parseFloat(t_arr[2]) * 0.001;
                        worldPos.set(X, -Y, Z);
                        var btnElem = document.createElement('button');
                        btnElem.className = 'btn btn-primary';
                        btnElem.onclick = self.clickKeyPointButtonHandler;
                        btnElem.innerHTML = "<i class=\"fa fa-star\" />";
                        var newBtnItem = new THREE_ButtonItem(btnElem, worldPos);
                        btnElem.uiItem = newBtnItem;
                        self.btnsRef.current.appendChild(btnElem);
                        self.图元Btns_arr.push(newBtnItem);
                    }
                    console.log(全局_arr);
                    _this4.setState({
                        fetching: false,
                        全局_arr: 全局_arr
                    });
                });
            }
        }
    }, {
        key: "modelChanged",
        value: function modelChanged() {
            if (this.state.drawing == null) {
                return;
            }
            if (this.state.showingModelPath != this.state.drawing.modelPath) {
                this.setState({
                    showingModelPath: this.state.drawing.modelPath,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载图纸模型',
                    fetch_error: ''
                });

                var loader = new Rhino3dmLoader();
                loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/');
                var self = this;
                loader.load(window.location.origin + this.state.drawing.modelPath, function (object) {
                    self.setState({
                        fetch_title: '解析图纸模型'
                    });
                    try {
                        var scene = self.scene;
                        var camera = self.camera;
                        var controls = self.controls;

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
                        cameraPos.add(new THREE.Vector3(size.x * 0.5, size.y * 0.5, size.z));
                        camera.position.copy(cameraPos);

                        self.keyMesh = object;

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
                            // self.labelsRef.current.appendChild(divElem);
                            // self.uiItem_arr.push(newLabelItem);

                            // let btnElem = document.createElement('button');
                            // btnElem.className = 'btn btn-primary';
                            // btnElem.onclick = self.clickKeyPointButtonHandler;
                            // btnElem.innerHTML = "<i class=\"fa fa-star\" />";
                            // let newBtnItem = new THREE_ButtonItem(btnElem,worldPos);
                            // btnElem.uiItem = newBtnItem;
                            // self.btnsRef.current.appendChild(btnElem);
                            // self.图元Btns_arr.push(newBtnItem);
                        });
                        self.setState({
                            fetching: false
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify("\u51FA\u9519\u4E86:" + eo.message)
                        });
                    }
                }, function (ev) {
                    self.setState({
                        fetch_percent: ev.loaded / ev.total * 0.8
                    });
                }, function (err) {
                    self.setState({
                        fetch_error: JSON.stringify("\u51FA\u9519\u4E86:" + err.target.statusText)
                    });
                    console.error(err);
                });
            }
        }
    }, {
        key: "startAPP",
        value: function startAPP() {
            if (this.canvasRef.current == null) {
                setTimeout(this.startAPP, 100);
                return;
            }
            if (!this.state.inited) {
                this.initApp();
                this.setState({
                    inited: true
                });
            }
            //console.log(this.canvasRef.current);
            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: "pauseAPP",
        value: function pauseAPP() {}
    }, {
        key: "clickDrawingBtnHandler",
        value: function clickDrawingBtnHandler(ev) {
            this.setState({ drawing: null });
        }
    }, {
        key: "drawingChangedHandler",
        value: function drawingChangedHandler(drawingName, drawingCode, modelPath, 图元代码) {
            console.log("name:" + drawingName + ",code:" + drawingCode + ",modelPath:" + modelPath + ",\u56FE\u5143\u4EE3\u7801:" + 图元代码);
            this.setState({ drawing: { name: drawingName, code: drawingCode, modelPath: modelPath, 图元代码: 图元代码 } });
        }
    }, {
        key: "resizeRendererToDisplaySize",
        value: function resizeRendererToDisplaySize() {
            var canvas = this.canvasRef.current;
            var canvasParent = this.rootRef.current;
            var pixelRatio = 1;
            var width = canvasParent.clientWidth * pixelRatio | 0;
            var height = canvasParent.clientHeight * pixelRatio | 0;
            var needResize = canvas.width != width || canvas.height != height;
            if (needResize) {
                this.renderer.setSize(width, height, false);
            }
            return needResize;
        }
    }, {
        key: "renderFrame",
        value: function renderFrame(time) {
            var _this5 = this;

            time *= 0.001;
            var camera = this.camera;
            var scene = this.scene;
            var canvas = this.canvasRef.current;
            var renderer = this.renderer;
            if (this.resizeRendererToDisplaySize()) {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            this.controls.update();
            this.dirLight.position.copy(camera.position);
            this.dirLight.target.position.copy(this.controls.target);
            var cameraDir = new THREE.Vector3();
            camera.getWorldDirection(cameraDir);
            // this.cubes_arr.forEach((cube,i)=>{
            //     var speed = 1 + i * 0.5;
            //     cube.rotation.x = time * speed;
            //     cube.rotation.y = time * speed;
            // });

            var tempV = new THREE.Vector3();
            this.uiItem_arr.forEach(function (item) {
                tempV.copy(item.worldPos);
                // item.target.getWorldPosition(tempV);
                tempV.project(camera);
                var x = (tempV.x * .5 + .5) * canvas.clientWidth;
                var y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                item.docElem.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px)";
                item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
            });

            this.图元Btns_arr.forEach(function (keyBtn) {
                if (_this5.focus图元Btn != null) {
                    if (keyBtn != _this5.focus图元Btn) {
                        keyBtn.docElem.style.display = 'none';
                        return;
                    }
                } else {
                    var theVec = new THREE.Vector3();
                    theVec.subVectors(keyBtn.worldPos, camera.position);
                    var dot = theVec.dot(cameraDir);
                    var dis = keyBtn.worldPos.distanceTo(camera.position);
                    if (dot < 0 || dis > 100) {
                        keyBtn.docElem.style.display = 'none';
                        return;
                    }
                }
                tempV.copy(keyBtn.worldPos);
                tempV.project(camera);
                var x = (tempV.x * .5 + .5) * canvas.clientWidth;
                var y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                keyBtn.docElem.style.display = '';
                keyBtn.docElem.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px)";
                keyBtn.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
            });

            renderer.render(scene, camera);

            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            if (this.props.visible == false) {
                return null;
            }
            var self = this;
            var fetchBarElem = null;
            if (this.state.fetching) {
                var percentValue = Math.fround(this.state.fetch_percent * 100);
                fetchBarElem = React.createElement(
                    "div",
                    { className: "progressContainer", style: { zIndex: 2000 } },
                    React.createElement("div", { className: "mask" }),
                    React.createElement(
                        "div",
                        { className: "progressDiv" },
                        React.createElement(
                            "h5",
                            null,
                            React.createElement(
                                "span",
                                { className: "badge badge-light flex-grow-0 flex-shrink-0 p-2 shadow" },
                                this.state.fetch_title
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "progress" },
                            React.createElement(
                                "div",
                                { className: "progress-bar progress-bar-striped progress-bar-animated", role: "progressbar", style: { width: percentValue + '%' } },
                                percentValue,
                                "%"
                            )
                        ),
                        this.state.fetch_error && this.state.fetch_error.length > 0 ? React.createElement(
                            "div",
                            { className: "flex-grow-0 flex-shrink-0 mt-2 text-danger bg-light" },
                            this.state.fetch_error
                        ) : null
                    )
                );
            }
            var rootDivClassName = 'erpc_threeD d-block hidenOverflow position-relative ' + (this.props.className == null ? '' : this.props.className);

            var topBtnsDiv = null;
            var 全局BtnsDiv = null;
            var nativeUIElem = null;
            if (this.state.drawing == null) {
                // 选择全局图
                nativeUIElem = React.createElement(
                    "div",
                    { className: "w-100 h-100 position-absolute", style: { left: 0, top: 0, zIndex: 500 } },
                    React.createElement(VisibleCDrawingSelectorForm, { 项目代码: this.props.projectCode, id: "DrawingSelectorForm", parentPath: this.props.fullParentPath, title: "\u9009\u62E9\u56FE\u7EB8", pagebreak: false, selectMode: "single", keyColumn: "\u9879\u76EE\u56FE\u7EB8\u5B9A\u4E49\u4EE3\u7801", onSelectedChanged: this.drawingChangedHandler })
                );
                if (this.drawingDataDirted) {
                    this.drawingDataDirted = false;
                    setTimeout(function () {
                        pull_DrawingSelectorForm(null, self.props.fullParentPath, true, _this6.props.projectCode);
                    }, 10);
                }
            } else {
                var drawingBtn = React.createElement(
                    "button",
                    { className: "btn btn-light flex-grow-0 flex-shrink=0", onClick: this.clickDrawingBtnHandler },
                    React.createElement("i", { className: "fa fa-map" }),
                    this.state.drawing.name
                );
                topBtnsDiv = React.createElement(
                    "div",
                    { className: "d-flex position-absolute", style: { height: '30px', top: '5px', left: '5px' } },
                    drawingBtn
                );
                if (this.state.showingModelPath != this.state.drawing.modelPath) {
                    setTimeout(function () {
                        self.modelChanged();
                    }, 10);
                } else if (this.state.fetching == false) {
                    if (this.state.showing图元代码 != this.state.drawing.图元代码) {
                        setTimeout(function () {
                            self.图元Changed();
                        }, 10);
                    }
                }
                if (this.state.全局_arr != null) {
                    全局BtnsDiv = React.createElement(
                        "div",
                        { className: "d-flex flex-column position-absolute", style: { width: '50px', left: '100%', right: '100%', transform: 'translate(-50%, -50%)' } },
                        this.state.全局_arr.map(function (全局item) {
                            React.createElement(
                                "button",
                                { key: 全局item.code, className: "btn btn-light flex-grow-0 flex-shrink=0" },
                                全局item.name
                            );
                        })
                    );
                }
            }

            var needCtlPath = true;
            var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
            return React.createElement(
                "div",
                { ref: this.rootRef, className: useStyleClass.class, style: useStyleClass.style, "ctl-fullpath": needCtlPath ? this.props.fullPath : null },
                React.createElement("canvas", { ref: this.canvasRef, className: "w-100 h-100 d-block" }),
                React.createElement("div", { ref: this.labelsRef, className: "three-label-container", style: { left: 0, top: 0, zIndex: 10 } }),
                React.createElement("div", { ref: this.btnsRef, className: "three-ui-container", style: { left: 0, top: 0, zIndex: 20 } }),
                React.createElement(
                    "div",
                    { className: "position-absolute", style: { left: 0, top: 0, zIndex: 30 } },
                    topBtnsDiv,
                    全局BtnsDiv
                ),
                nativeUIElem,
                fetchBarElem
            );
        }
    }]);

    return ERPC_ThreeDApp;
}(React.PureComponent);

function ERPC_ThreeDApp_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible != null ? ctlState.visible : ownprops.definvisible ? false : true,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: ownprops.projectCode
    };
}

function ERPC_ThreeDApp_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_ThreeDApp = null;

function InitThreedApp() {
    VisibleERPC_ThreeDApp = ReactRedux.connect(ERPC_ThreeDApp_mapstatetoprops, ERPC_ThreeDApp_dispatchtorprops)(ERPC_ThreeDApp);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp);

// controls
// ui

var DrawingSelectorFormheadstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "minWidth": "33.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var DrawingSelectorFormtdstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "minWidth": "33.3%", "verticalAlign": "middle" };
var DrawingSelectorFormheadstyle1 = { "width": "66.7%", "maxWidth": "66.7%", "minWidth": "66.7%", "whiteSpace": "nowrap", "overflow": "hidden" };
var DrawingSelectorFormtdstyle1 = { "width": "66.7%", "maxWidth": "66.7%", "minWidth": "66.7%", "verticalAlign": "middle" };
var DrawingSelectorForm_tableStyle = { "marginTop": "-50px" };
var DrawingSelectorForm_headtableStyle = { "marginBottom": "0px" };

function fresh_DrawingSelectorForm(retState, records_arr, oldValue, statePath, visited, delayActs, rowKeyInfo_map) {
    var DrawingSelectorForm_path = getParentPathByKey(statePath, 'DrawingSelectorForm');
    var DrawingSelectorForm_state = getStateByPath(retState, DrawingSelectorForm_path, {});
    var needSetState = {};
    if (oldValue != null) {
        var newRowCount = records_arr.length;
        oldValue.forEach(function (x, i) {
            var rowkey = x.项目图纸定义代码;
            if (DrawingSelectorForm_state.hasOwnProperty('row_' + rowkey)) {
                needSetState['row_' + rowkey + '._isdirty'] = true;
            }
        });
    }
    var newKey_map = {};
    records_arr.forEach(function (rcd, index) {
        var rowkey = rcd.项目图纸定义代码;
        rcd._key = rowkey;
        newKey_map[rowkey] = rcd;
    });
    gDataCache.set(DrawingSelectorForm_path + ".KeyToRcd_map", newKey_map);
    needSetState.selectedValue = GetFormSelectedProfile(DrawingSelectorForm_state, '项目图纸定义代码').key;
    retState = setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
    bind_DrawingSelectorForm(retState, null, null, statePath);
    var scrollSetting = gDataCache.get(DrawingSelectorForm_path + 'scrollsetting');
    if (scrollSetting) {
        setTimeout(function () {
            var scrollerElem = document.getElementById(DrawingSelectorForm_path + 'scroller');
            if (scrollerElem) {
                scrollerElem.scrollTop = scrollSetting.top;scrollerElem.scrollLeft = scrollSetting.left;
            }
        }, 200);
    }
}
function bind_DrawingSelectorForm(retState, newIndex, oldIndex, statePath) {
    var DrawingSelectorForm_path = getParentPathByKey(statePath, 'DrawingSelectorForm');
    var formState = getStateByPath(retState, DrawingSelectorForm_path, {});
    var records_arr = formState.records_arr;
    var needSetState = {};
    var bundle = {};
    var needActiveBindPage = true;
    needSetState['invalidbundle'] = false;
    retState = setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
    return bind_DrawingSelectorFormPage(retState, DrawingSelectorForm_path);
}
function DrawingSelectorForm_records_arr_changed(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map) {
    var needSetState = {};
    fresh_DrawingSelectorForm(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map);
    return setManyStateByPath(state, '', needSetState);
}
function pull_DrawingSelectorForm(retState, fullParentPath, holdScroll, 项目代码) {
    var hadStateParam = retState != null;
    var rowKeyInfo_map = getRowKeyMapFromPath(fullParentPath);
    var state = hadStateParam ? retState : store.getState();
    var scrollerElem = document.getElementById(fullParentPath + '.DrawingSelectorFormscroller');
    if (scrollerElem) {
        gDataCache.set(fullParentPath + '.DrawingSelectorFormscrollsetting', holdScroll ? { left: scrollerElem.scrollLeft, top: scrollerElem.scrollTop } : null);
    }
    var bundle = {
        项目代码: 项目代码
    };
    setTimeout(function () {
        store.dispatch(fetchJsonPost(threeDServerUrl, { bundle: bundle, action: 'pulldata_DrawingSelectorForm' }, makeFTD_Prop(fullParentPath, 'DrawingSelectorForm', 'records_arr', false), EFetchKey.FetchPropValue));
    }, 50);
    return state;
}

function bind_DrawingSelectorFormPage(retState, DrawingSelectorForm_path) {
    var formState = getStateByPath(retState, DrawingSelectorForm_path, {});
    var records_arr = formState.records_arr;
    var needSetState = {};
    var startRowIndex = 0;
    var endRowIndex = records_arr.length - 1;
    var freshrows_arr = [];
    for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
        var nowRecord = records_arr[rowIndex];
        if (nowRecord == null) {
            break;
        }
        var rowkey = GetFromatRowKey(nowRecord.项目图纸定义代码);
        var rowstate = getStateByPath(formState, "row_" + rowkey, {});
        if (rowstate._isdirty != false) {
            freshrows_arr.push(rowkey);
            needSetState["row_" + rowkey + "._isdirty"] = false;
            needSetState['row_' + rowkey + '.M_Label_42.text'] = nowRecord['加工图纸种类'];
            needSetState['row_' + rowkey + '.M_Label_53.text'] = nowRecord['图纸名称'];
        }
    }
    needSetState.startRowIndex = startRowIndex;
    needSetState.endRowIndex = endRowIndex;
    return setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
}

function DrawingSelectorForm_selectedValue_changed(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map) {
    var formState = getStateByPath(state, this.props.fullPath);
    var selectedProfile = GetFormSelectedProfile(formState, '项目图纸定义代码');
    // console.log(selectedProfile.record);
    if (typeof this.props.onSelectedChanged == 'function') {
        this.props.onSelectedChanged(selectedProfile.record['图纸名称'], selectedProfile.record['项目图纸定义代码'], selectedProfile.record['模型文件路径'], selectedProfile.record['可视模型图元代码']);
    }
}

var CDrawingSelectorForm = function (_React$PureComponent2) {
    _inherits(CDrawingSelectorForm, _React$PureComponent2);

    function CDrawingSelectorForm(props) {
        _classCallCheck(this, CDrawingSelectorForm);

        var _this7 = _possibleConstructorReturn(this, (CDrawingSelectorForm.__proto__ || Object.getPrototypeOf(CDrawingSelectorForm)).call(this, props));

        ERPC_GridForm(_this7);
        gCreatFormSetting(_this7);
        _this7.clickRowHandler = _this7.clickRowHandler.bind(_this7);
        _this7.clickFreshHandler = _this7.clickFreshHandler.bind(_this7);

        _this7.DrawingSelectorForm_records_arr_changed = DrawingSelectorForm_records_arr_changed.bind(_this7);
        _this7.bind_DrawingSelectorForm = bind_DrawingSelectorForm.bind(_this7);
        _this7.DrawingSelectorForm_selectedValue_changed = DrawingSelectorForm_selectedValue_changed.bind(_this7);
        return _this7;
    }

    _createClass(CDrawingSelectorForm, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            var fullPath = this.props.fullPath;
            if (appStateChangedAct_map[fullPath + '.records_arr'] == null) {
                appStateChangedAct_map[fullPath + '.records_arr'] = this.DrawingSelectorForm_records_arr_changed;
                appStateChangedAct_map[fullPath + '.pageIndex'] = this.bind_DrawingSelectorForm;
                appStateChangedAct_map[fullPath + '.selectedValue'] = this.DrawingSelectorForm_selectedValue_changed;
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            var fullPath = this.props.fullPath;
            if (appStateChangedAct_map[fullPath + '.records_arr'] != null) {
                appStateChangedAct_map[fullPath + '.records_arr'] = null;
                appStateChangedAct_map[fullPath + '.pageIndex'] = null;
                appStateChangedAct_map[fullPath + '.selectedValue'] = null;
                appStateChangedAct_map[fullPath + '.records_arr'] = null;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var retElem = null;
            if (this.props.visible == false) {
                return null;
            }
            retElem = this.renderContent();
            return retElem;
        }
    }, {
        key: "renderContent",
        value: function renderContent() {
            var retElem = null;
            var navElem = null;
            var bHadBottom = false;
            if (this.props.fetching) {
                retElem = renderFetcingTipDiv();
            } else {
                if (this.props.fetchingErr) {
                    retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
                } else {
                    if (this.props.invalidbundle) {
                        retElem = renderInvalidBundleDiv();
                    } else {
                        bHadBottom = true;
                        if (!this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
                            retElem = React.createElement(
                                "div",
                                { className: "m-auto" },
                                "\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
                            );
                        } else {
                            var setting = gGetFormSetting(this.props.fullPath);
                            retElem = React.createElement(CDrawingSelectorForm_TBody, { dataversion: setting.dataversion, records_arr: this.props.records_arr, startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex, fullPath: this.props.fullPath, form: this, clickRowHandler: this.clickRowHandler, selectedValue: this.props.selectedValue });
                            if (this.props.pagebreak) {
                                navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
                            }
                        }
                    }
                }
            }
            return React.createElement(
                "div",
                { ref: this.rootRef, className: "d-flex erp-form flexHelper flex-column centerelem w-100 position-absolute bg-light", style: { maxHeight: '80%' } },
                this.props.title && React.createElement(
                    "div",
                    { className: "bg-dark text-light justify-content-start d-flex flex-shrink-0 p-1" },
                    React.createElement(
                        "span",
                        null,
                        this.props.title,
                        this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null,
                        this.props.fetching ? null : React.createElement("i", { className: "btn btn-sm fa fa-refresh", onClick: this.clickFreshHandler })
                    )
                ),
                React.createElement(
                    "div",
                    { id: this.props.fullPath + 'tableheader', className: "mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv" },
                    React.createElement(
                        "table",
                        { className: "table", style: DrawingSelectorForm_headtableStyle },
                        React.createElement(CDrawingSelectorForm_THead, { form: this })
                    )
                ),
                React.createElement(
                    "div",
                    { id: this.props.fullPath + 'scroller', onScroll: this.tableBodyScroll, className: "mw-100 autoScroll" },
                    retElem
                ),
                navElem
            );
        }
    }, {
        key: "clickFreshHandler",
        value: function clickFreshHandler(ev) {
            pull_DrawingSelectorForm(null, this.props.fullParentPath, true, this.props.项目代码);
        }
    }, {
        key: "clickRowHandler",
        value: function clickRowHandler(ev) {
            var rowkey = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target, 'DrawingSelectorForm_rowkey'));
            var rowIndex = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target, 'DrawingSelectorForm_rowindex'));
            var state = store.getState();
            var formState = getStateByPath(state, this.props.fullPath, {});
            var keyvalue = rowkey;
            var nowRowKey = formState.selectedValue;
            if (nowRowKey == rowkey) {
                var selectedProfile = GetFormSelectedProfile(formState, '项目图纸定义代码');
                this.DrawingSelectorForm_selectedValue_changed(state, this.props.fullPath, selectedProfile.record, selectedProfile.index, selectedProfile.key);
                return;
            }
            var needSetState = {
                selectedValue: keyvalue,
                selectedRowIndex: rowIndex
            };
            store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
        }
    }]);

    return CDrawingSelectorForm;
}(React.PureComponent);

function CDrawingSelectorForm_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.visible = ctlState.visible == null ? true : ctlState.visible == true;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.startRowIndex = ctlState.startRowIndex;
    retProps.endRowIndex = ctlState.endRowIndex;
    retProps.pageCount = ctlState.pageCount;
    retProps.pageIndex = ctlState.pageIndex;
    retProps.rowPerPage = ctlState.rowPerPage;
    retProps.bindedRow = ctlState.bindedRow;
    retProps.selectedValue = ctlState.selectedValue == null ? null : ctlState.selectedValue;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    retProps.title = ctlState.title == null ? ownprops.title : ctlState.title;
    retProps.selectMode = 'single';
    retProps.项目代码 = ctlState.项目代码 == null ? ownprops.项目代码 : ctlState.项目代码;
    return retProps;
}
function CDrawingSelectorForm_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
var VisibleCDrawingSelectorForm = ReactRedux.connect(CDrawingSelectorForm_mapstatetoprops, CDrawingSelectorForm_disptchtoprops)(CDrawingSelectorForm);

var CDrawingSelectorForm_THead = function (_React$PureComponent3) {
    _inherits(CDrawingSelectorForm_THead, _React$PureComponent3);

    function CDrawingSelectorForm_THead(props) {
        _classCallCheck(this, CDrawingSelectorForm_THead);

        return _possibleConstructorReturn(this, (CDrawingSelectorForm_THead.__proto__ || Object.getPrototypeOf(CDrawingSelectorForm_THead)).call(this, props));
    }

    _createClass(CDrawingSelectorForm_THead, [{
        key: "render",
        value: function render() {
            var retElem = null;
            var simpleMode = this.props.simpleMode;
            return React.createElement(
                "thead",
                { className: "thead-light" },
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "th",
                        { scope: "col", className: "indexTableHeader" },
                        "\u5E8F\u53F7"
                    ),
                    this.props.M_LC_41_visible == false ? null : React.createElement(
                        "th",
                        { style: DrawingSelectorFormheadstyle0 },
                        "\u56FE\u7EB8\u79CD\u7C7B"
                    ),
                    this.props.M_LC_43_visible == false ? null : React.createElement(
                        "th",
                        { style: DrawingSelectorFormheadstyle1 },
                        "\u56FE\u7EB8\u540D\u79F0"
                    )
                )
            );
            return retElem;
        }
    }]);

    return CDrawingSelectorForm_THead;
}(React.PureComponent);

var CDrawingSelectorForm_TBody = function (_React$PureComponent4) {
    _inherits(CDrawingSelectorForm_TBody, _React$PureComponent4);

    function CDrawingSelectorForm_TBody(props) {
        _classCallCheck(this, CDrawingSelectorForm_TBody);

        return _possibleConstructorReturn(this, (CDrawingSelectorForm_TBody.__proto__ || Object.getPrototypeOf(CDrawingSelectorForm_TBody)).call(this, props));
    }

    _createClass(CDrawingSelectorForm_TBody, [{
        key: "render",
        value: function render() {
            var retElem = null;
            var trElems_arr = [];
            var startRowIndex = this.props.startRowIndex;
            var endRowIndex = this.props.endRowIndex;
            var formProp = this.props.form.props;
            for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
                var rowRecord = formProp.records_arr[rowIndex];
                if (rowRecord == null) {
                    break;
                }
                var rowkey = GetFromatRowKey(rowRecord.项目图纸定义代码);
                var selected = this.props.selectedValue == rowkey;
                trElems_arr.push(React.createElement(
                    VisibleERPC_GridSelectableRow,
                    { key: rowkey, onMouseDown: this.props.clickRowHandler, rowClickable: true, rowkey: rowkey, form: this.props.form, selected: selected, hideSelector: true },
                    React.createElement(
                        "td",
                        { className: "indexTableHeader" },
                        rowIndex + 1
                    ),
                    this.props.M_LC_41_visible == false ? null : React.createElement(
                        "td",
                        { style: DrawingSelectorFormtdstyle0 },
                        React.createElement(VisibleERPC_Label, { className: "erp-control ", rowkey: rowkey, id: "M_Label_42", parentPath: this.props.fullPath, type: "string" })
                    ),
                    this.props.M_LC_43_visible == false ? null : React.createElement(
                        "td",
                        { style: DrawingSelectorFormtdstyle1 },
                        React.createElement(VisibleERPC_Label, { className: "erp-control ", rowkey: rowkey, id: "M_Label_53", parentPath: this.props.fullPath, type: "string" })
                    )
                ));
            }
            return React.createElement(
                "table",
                { className: "table table-striped table-hover ", style: DrawingSelectorForm_tableStyle },
                React.createElement(CDrawingSelectorForm_THead, { simpleMode: true }),
                React.createElement(
                    "tbody",
                    null,
                    trElems_arr
                )
            );
        }
    }]);

    return CDrawingSelectorForm_TBody;
}(React.PureComponent);