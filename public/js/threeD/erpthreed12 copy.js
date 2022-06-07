'use strict';

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

var THREE_图纸部位Item = function () {
    function THREE_图纸部位Item(位置信息) {
        _classCallCheck(this, THREE_图纸部位Item);

        this.位置信息 = 位置信息;
        this.参数信息_arr = [];
        this.worldPos = new THREE.Vector3(0, 0, 0);
    }

    _createClass(THREE_图纸部位Item, [{
        key: 'clearParam',
        value: function clearParam() {
            this.参数信息_arr = [];
        }
    }, {
        key: 'addParam',
        value: function addParam(target, startPos) {
            this.参数信息_arr.push(target);
            target.modelMeta = this;
            this.worldPos.add(startPos);
        }
    }, {
        key: 'calWordlPos',
        value: function calWordlPos() {
            this.worldPos.divideScalar(this.参数信息_arr.length);
        }
    }, {
        key: 'paramChanged',
        value: function paramChanged() {
            this.paramCount = this.参数信息_arr.length;
            var completeCount = 0;
            this.参数信息_arr.forEach(function (paramItem) {
                if (paramItem.record.拍照状态 == 1) {
                    completeCount += 1;
                }
            });
            this.completeCount = completeCount;
            this.allDone = completeCount == this.参数信息_arr.length;
            //this.docElem.innerHTML = `${this.位置信息.中文名称}</br>${completeCount}/${this.paramCount}`;
            //this.docElem.className = 'btn btn-' + (this.allDone ? 'success' : 'primary');
        }
    }, {
        key: 'getNextParam',
        value: function getNextParam(base) {
            var index = this.参数信息_arr.indexOf(base) + 1;
            if (index >= this.参数信息_arr.length) {
                index = 0;
            }
            return this.参数信息_arr[index];
        }
    }, {
        key: 'getPreParam',
        value: function getPreParam(base) {
            var index = this.参数信息_arr.indexOf(base) - 1;
            if (index < 0) {
                index = this.参数信息_arr.length - 1;
            }
            return this.参数信息_arr[index];
        }
    }]);

    return THREE_图纸部位Item;
}();

var THREE_ParamItem = function (_THREE_ButtonItem) {
    _inherits(THREE_ParamItem, _THREE_ButtonItem);

    function THREE_ParamItem(docElem, worldPosition, geometry, 位置信息, record) {
        _classCallCheck(this, THREE_ParamItem);

        var _this3 = _possibleConstructorReturn(this, (THREE_ParamItem.__proto__ || Object.getPrototypeOf(THREE_ParamItem)).call(this, docElem, worldPosition));

        _this3.位置信息 = 位置信息;
        _this3.geometry = geometry;
        _this3.record = record;
        _this3.recordChanged();
        _this3.参数名称 = record.参数名称;
        _this3.参数序号 = record.参数序号;
        return _this3;
    }

    _createClass(THREE_ParamItem, [{
        key: 'recordChanged',
        value: function recordChanged() {
            if (this.record.拍照状态 == 0) {
                this.docElem.className = 'btn btn-warning btn-sm';
            } else {
                this.docElem.className = 'btn btn-success btn-sm';
            }
            var htmlText = '';
            // if (this.record.一级序号 > 0) {
            //     let 序号str = "" + this.record.一级序号;
            //     if (this.record.二级序号 > 0) {
            //         序号str += "-" + this.record.二级序号;
            //     }
            //     htmlText = `${序号str}:${this.record.参数名称}${this.record.参数序号}`;
            // }
            // else {
            //     htmlText = `${this.record.参数名称}${this.record.参数序号}`;
            // }
            htmlText = '' + this.record.参数名称 + this.record.参数序号;
            // if (this.record.参数值 > 0) {
            //     htmlText += `</br>${RoundFloat(this.record.参数值)}`;
            // }
            this.docElem.innerHTML = htmlText;
        }
    }]);

    return THREE_ParamItem;
}(THREE_ButtonItem);

var PositionInfo = function () {
    function PositionInfo(全局名称, 全局代码, 中文方位, 英文方位, 部位代码, 一级序号, 二级序号) {
        _classCallCheck(this, PositionInfo);

        this.全局名称 = 全局名称;
        this.全局代码 = 全局代码;
        this.中文方位 = 中文方位;
        this.英文方位 = 英文方位;
        this.部位代码 = 部位代码;
        this.一级序号 = 一级序号;
        this.二级序号 = 二级序号;

        this.中文名称 = MakePositionName(全局名称, 中文方位, 部位代码, 一级序号, 二级序号);
        this.英文名称 = MakePositionName(全局名称, 英文方位, 部位代码, 一级序号, 二级序号);
    }

    _createClass(PositionInfo, [{
        key: 'clone',
        value: function clone() {
            var rlt = new PositionInfo(this.全局名称, this.全局代码, this.中文方位, this.英文方位, this.部位代码, this.一级序号, this.二级序号);
            return rlt;
        }
    }]);

    return PositionInfo;
}();

var C构件上传记录 = function () {
    function C构件上传记录() {
        _classCallCheck(this, C构件上传记录);

        this.复核参数_arr = [];
    }

    _createClass(C构件上传记录, [{
        key: 'set',
        value: function set(上传记录代码, 构件编号, 构件全称, 文件路径, 上传时间, 构件代码, worldPos) {
            this.上传记录代码 = 上传记录代码;
            this.构件编号 = 构件编号;
            this.构件全称 = 构件全称;
            this.上传时间 = 上传时间;
            this.构件代码 = 构件代码;
            this.worldPos = worldPos;

            if (this.文件路径 != 文件路径) {
                this.文件路径 = 文件路径;
                this.object3d = null;
            }
        }
    }, {
        key: 'copy',
        value: function copy(other) {
            this.set(other.上传记录代码, other.构件编号, other.构件全称, other.文件路径, other.上传时间, other.构件代码, other.worldPos);
        }
    }]);

    return C构件上传记录;
}();

var C关联构件模型 = function () {
    function C关联构件模型(posInfo) {
        _classCallCheck(this, C关联构件模型);

        this.posInfo = posInfo;
        this.构件记录_arr = [];
    }

    _createClass(C关联构件模型, [{
        key: 'append',
        value: function append(构件记录) {
            if (this.构件记录_arr.indexOf(构件记录) == -1) {
                this.构件记录_arr.push(构件记录);
            }
        }
    }]);

    return C关联构件模型;
}();

function SetObejectMaterail(object, mat) {
    for (var si in object.children) {
        object.children[si].material = mat;
    }
}

function MakePositionName(全局名称, 方位名称, 部位代码, 一级序号, 二级序号) {
    var name = 全局名称;
    var 序号 = "";
    if (一级序号 >= 0) {
        序号 = "" + 一级序号;
        if (二级序号 >= 0) {
            序号 += "-" + 二级序号;
        }
    }

    var bHad方位 = false;
    if (方位名称.length > 0 && 方位名称 != "无" && 方位名称 != "0") {
        bHad方位 = true;
        name += "-" + 方位名称;
        if (部位代码 >= 0) {
            name += "" + 部位代码;
        }
    } else if (部位代码 >= 0) {
        name += "-" + 部位代码;
    }

    if (序号.length > 0) {
        name += (部位代码 >= 0 || !bHad方位 ? "-" : "") + 序号;
    }
    return name;
}

var ProjectMeta = function () {
    function ProjectMeta() {
        _classCallCheck(this, ProjectMeta);

        this.全局_map = {};
        this.方位_map = {};
        this.全局_arr = [];
    }

    _createClass(ProjectMeta, [{
        key: 'createPositionInfo',
        value: function createPositionInfo(全局代码, 方位名称, 部位代码) {
            var 一级序号 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
            var 二级序号 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;

            var 全局设置 = this.全局_map[全局代码];
            var 方位设置 = this.方位_map[方位名称];
            var rlt = new PositionInfo(全局设置.名称, 全局代码, 方位设置.中文名, 方位设置.英文名, 部位代码, 一级序号, 二级序号);
            return rlt;
        }
    }]);

    return ProjectMeta;
}();

function makeInstance(geometry, color, coord) {
    var mat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    var rlt = new THREE.Mesh(geometry, mat);
    rlt.position.copy(coord);
    return rlt;
}

function geoPointAtNormalizeLength(geo, lf) {
    if (geo == null || geo.geometry == null || geo.geometry.attributes == null || geo.geometry.attributes.position == null) {
        return null;
    }
    if (lf < 0) {
        lf = 0;
    } else if (lf > 1) {
        lf = 1;
    }
    var vec_a = new THREE.Vector3(0, 0, 0);
    var vec_b = new THREE.Vector3(0, 0, 0);
    var sumLen = 0;
    var posArr = geo.geometry.attributes.position;
    for (var i = 0; i < posArr.count; ++i) {
        vec_a.fromArray(posArr.array, i * 3);
        if (i != 0) {
            sumLen += vec_a.distanceTo(vec_b);
        } else if (lf == 0) {
            return vec_a;
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
    }
    if (lf == 1) {
        return vec_a;
    }

    var targetDis = lf * sumLen;
    sumLen = 0;
    var preSumLen = 0;
    for (var _i = 0; _i < posArr.count; ++_i) {
        vec_a.fromArray(posArr.array, _i * 3);
        if (_i != 0) {
            var segLen = vec_a.distanceTo(vec_b);
            sumLen += segLen;
            if (targetDis <= sumLen) {
                var vec_seg = new THREE.Vector3();
                vec_seg.subVectors(vec_a, vec_b);
                vec_b.addScaledVector(vec_seg, (targetDis - preSumLen) / segLen);
                return vec_b;
            }
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
        preSumLen = sumLen;
    }
    return vec_a;
}

function getCurveGeoLength(geo) {
    if (geo == null || geo.geometry == null || geo.geometry.attributes == null || geo.geometry.attributes.position == null) {
        return null;
    }
    var vec_a = new THREE.Vector3(0, 0, 0);
    var vec_b = new THREE.Vector3(0, 0, 0);
    var sumLen = 0;
    var posArr = geo.geometry.attributes.position;
    for (var i = 0; i < posArr.count; ++i) {
        vec_a.fromArray(posArr.array, i * 3);
        if (i != 0) {
            sumLen += vec_a.distanceTo(vec_b);
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
    }
    return sumLen;
}

var normalLineMat = new THREE.LineBasicMaterial({
    color: 0x0000FF
});

var redLineMat = new THREE.LineBasicMaterial({
    color: 0xFF0000
});

var dashLineMat = new THREE.LineDashedMaterial({
    color: 0x0000FF, dashSize: 0.3, gapSize: 0.1
});

var focusComponentModelMat = new THREE.MeshStandardMaterial({ color: 0xFF9933, side: THREE.DoubleSide });
var componentModelMat = new THREE.MeshStandardMaterial({ color: 0x8030B, side: THREE.DoubleSide });

function SmartUpdateButtonItem(btnItem, camera, canvas) {
    var maxDis = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;

    var cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    var theVec = new THREE.Vector3();
    theVec.subVectors(btnItem.worldPos, camera.position);
    var dot = theVec.dot(cameraDir);
    var dis = btnItem.worldPos.distanceTo(camera.position);
    if (dot < 0 || dis > maxDis) {
        btnItem.docElem.style.display = 'none';
        return;
    }
    var tempV = new THREE.Vector3();
    tempV.copy(btnItem.worldPos);
    tempV.project(camera);
    var x = (tempV.x * .5 + .5) * canvas.clientWidth;
    var y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    btnItem.docElem.style.display = '';
    btnItem.docElem.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px)';
    btnItem.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
}

function TurnOffShadow(object) {
    object.castShadow = false;
}

function InitApp1() {
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
    this.参数Parant = new THREE.Object3D();
    this.参数Parant.position.set(0, 0, 0);
    scene.add(this.参数Parant);
    this.构件模型Parant = new THREE.Object3D();
    this.构件模型Parant.position.set(0, 0, 0);
    scene.add(this.构件模型Parant);

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

    var geometry = new THREE.SphereGeometry(0.1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var sphereInter = new THREE.Mesh(geometry, material);
    this.sphereInter = sphereInter;
    sphereInter.visible = false;
    //scene.add(sphereInter);
}

function ProjectChanged1() {
    if (this.props.projectCode == null) {
        return;
    }
    if (this.state.showingProjectCode != this.props.projectCode) {
        this.setState({
            fetching: true,
            fetch_percent: 0,
            fetch_title: '加载项目元信息',
            fetch_error: '',
            projModelVisible: true,
            metaModelVisible: true,
            comModelVisible: true
        });
        this.drawingDataDirted = true;
        var self = this;
        nativeFetchJson(false, threeDServerUrl, { bundle: { 项目代码: this.props.projectCode }, action: 'pulldata_ProjectMeta' }).then(function (json) {
            if (json.err != null) {
                self.setState({
                    fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                });
                return;
            }

            var 全局_map = {};
            var 全局_arr = [];
            for (var key in json.data.全局_arr) {
                var 全局 = json.data.全局_arr[key];
                var 全局obj = { 代码: 全局.全局分类代码, 名称: 全局.全局分类名称, 全称: 全局.全局分类全称 };
                全局_map[全局obj.代码] = 全局obj;
                全局_arr.push(全局obj);
            }
            var 方位_map = {};
            for (var key in json.data.方位_arr) {
                var 方位 = json.data.方位_arr[key];
                var 方位obj = { 代码: 方位.路径代码, 英文名: 方位.英文名称, 中文名: 方位.中文名称 };
                方位_map[方位obj.代码] = 方位obj;
                方位_map[方位obj.英文名] = 方位obj;
                方位_map[方位obj.中文名] = 方位obj;
            }

            if (self.ProjectMeta == null) {
                self.ProjectMeta = new ProjectMeta();
            }
            self.ProjectMeta.全局_arr = 全局_arr;
            self.ProjectMeta.全局_map = 全局_map;
            self.ProjectMeta.方位_map = 方位_map;

            self.setState({
                fetching: false,
                showingProjectCode: self.props.projectCode
            });
        });
    }
}

function ResizeRendererToDisplaySize() {
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

function StartAPP() {
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
    this.preGameTime = 0;
    //console.log(this.canvasRef.current);
    requestAnimationFrame(this.renderFrame);
}

function SaveCameraView() {
    var nowPos = new THREE.Vector3();
    var nowTarget = new THREE.Vector3();
    nowPos.copy(this.camera.position);
    nowTarget.copy(this.controls.target);
    this.cameraInfo_arr.push({ pos: nowPos, target: nowTarget });
}

function LoadCameraView() {
    if (this.cameraInfo_arr.length > 0) {
        var item = this.cameraInfo_arr.pop();
        this.camera.position.copy(item.pos);
        this.controls.target.copy(item.target);
    }
}

function ThreeDApp_CusComponentWillmount() {
    this.startAPP();
}

function ThreeDApp_CusComponentWillUnmount() {}

function ERP_ThreeDAppBase(target, initState) {
    var useInitState = Object.assign({
        fetching: false,
        fetch_title: "",
        fetch_percent: 0,
        fetch_error: ""
    }, initState);

    target.state = useInitState;
    target.mainLoader = new Rhino3dmLoader();
    target.mainLoader.setLibraryPath('/vendor/other/');

    target.canvasRef = React.createRef();
    target.rootRef = React.createRef();
    target.labelsRef = React.createRef();
    target.btnsRef = React.createRef();
    target.uiItem_arr = [];
    target.cameraInfo_arr = [];

    target.resizeRendererToDisplaySize = ResizeRendererToDisplaySize.bind(target);
    target.startAPP = StartAPP.bind(target);
    target.saveCameraView = SaveCameraView.bind(target);
    target.loadCameraView = LoadCameraView.bind(target);
    target.cusComponentWillmount = ThreeDApp_CusComponentWillmount.bind(target);
    target.cusComponentWillUnmount = ThreeDApp_CusComponentWillUnmount.bind(target);
}

// 全局图拍照app

var ERPC_ThreeDApp_A = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp_A, _React$PureComponent);

    function ERPC_ThreeDApp_A(props) {
        _classCallCheck(this, ERPC_ThreeDApp_A);

        var _this4 = _possibleConstructorReturn(this, (ERPC_ThreeDApp_A.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_A)).call(this));

        autoBind(_this4);
        ERPControlBase(_this4);
        ERP_ThreeDAppBase(_this4, {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false,
            loadComponentModel: false
        });

        _this4.drawingDataDirted = true;
        _this4.图纸部位Btns_arr = [];
        _this4.paramBtns_arr = [];
        _this4.focus图纸部位Btn = null;
        _this4.focusParam = null;
        _this4.cameraInfo_arr = [];
        _this4.部位相机loc = {};
        _this4.关联构件模型_dic = {};
        _this4.构件上传记录_arr = [];
        _this4.构件上传记录_map = {};

        _this4.ProjectChanged = ProjectChanged1.bind(_this4);
        _this4.initApp = InitApp1.bind(_this4);
        return _this4;
    }

    _createClass(ERPC_ThreeDApp_A, [{
        key: 'clickViewDrawingHandler',
        value: function clickViewDrawingHandler(ev) {
            if (this.focus图纸部位Btn && this.focus图纸部位Btn.参数信息_arr.length > 0) {
                var 参数信息 = this.focus图纸部位Btn.参数信息_arr[0];
                view附件文件(this.focus图纸部位Btn.位置信息.中文名称, 参数信息.record.发图记录代码, 27);
            }
        }
    }, {
        key: 'clickShotHandler',
        value: function clickShotHandler(ev) {
            if (this.focusParam != null) {
                var self = this;
                var callBack = function callBack() {
                    if (self.focusParam != null) {
                        self.focusParam.record.拍照状态 = 1;
                        self.focusParam.recordChanged();
                        self.focus图纸部位Btn.paramChanged();
                    }
                };
                shotParam(this.focusParam.位置信息.中文名称, this.focusParam.record.发图记录代码, this.focusParam.record.参数上传数据代码, callBack);
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
        key: 'getNext\u56FE\u7EB8\u90E8\u4F4D',
        value: function getNext(base) {
            var index = this.图纸部位Btns_arr.indexOf(base) + 1;
            if (index >= this.图纸部位Btns_arr.length) {
                return null;
            }
            var rlt = this.图纸部位Btns_arr[index];
            if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
                return null;
            }
            return this.图纸部位Btns_arr[index];
        }
    }, {
        key: 'getPre\u56FE\u7EB8\u90E8\u4F4D',
        value: function getPre(base) {
            var index = this.图纸部位Btns_arr.indexOf(base) - 1;
            if (index < 0) {
                return null;
            }
            var rlt = this.图纸部位Btns_arr[index];
            if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
                return null;
            }
            return this.图纸部位Btns_arr[index];
        }

        // checkNeedDownloadModel(){
        //     let now图纸部位 = this.focus图纸部位Btn;
        //     if(now图纸部位 == null){
        //         return {};
        //     }
        //     let 图纸代码 = this.state.drawing.code;
        //     let 部位位置信息 = this.focus图纸部位Btn.位置信息;
        //     let needDownloadItems = [];
        //     let focusItems_arr = [];
        //     let targetPos = now图纸部位.worldPos;
        //     for (let index = -1; index < 2; ++index) {
        //         let 探测位置信息 = new PositionInfo(部位位置信息.全局名称, 部位位置信息.全局代码, 部位位置信息.中文方位, 部位位置信息.英文方位, 部位位置信息.部位代码, 部位位置信息.一级序号 + index, 部位位置信息.二级序号);
        //         let 部位key = `${图纸代码}_${探测位置信息.英文名称}`;
        //         let 关联模型 = this.关联构件模型_dic[部位key];
        //         if (关联模型 != null) {
        //             for (var si in 关联模型.构件记录_arr) {
        //                 let item = 关联模型.构件记录_arr[si];
        //                 if (index == 0) {
        //                     focusItems_arr.push(item);
        //                 }
        //                 if (item.object3d != null) {
        //                     targetPos = item.center;
        //                     this.构件模型Parant.add(item.object3d);
        //                 }
        //                 else {
        //                     needDownloadItems.push(item);
        //                 }
        //             }

        //         }
        //     }
        //     this.focusItems_arr = focusItems_arr;
        //     this.needDownloadItems = needDownloadItems;
        //     if (this.state.loadComponentModel && needDownloadItems.length > 0) {
        //         setTimeout(() => {
        //             this.download构件模型();
        //         }, 10);
        //     }
        //     return {
        //         needDownloadItems:needDownloadItems,
        //         focusItems_arr:focusItems_arr,
        //         targetPos:targetPos
        //     };
        // }

    }, {
        key: 'checkNeedDownloadModel',
        value: function checkNeedDownloadModel() {
            var _this5 = this;

            var now图纸部位 = this.focus图纸部位Btn;
            if (now图纸部位 == null) {
                return {};
            }
            var needDownloadItems = [];
            var focusItems_arr = [];
            var targetPos = now图纸部位.worldPos;
            var 图纸代码 = this.state.drawing.code;
            var 部位位置信息 = this.focus图纸部位Btn.位置信息;
            var 部位key = 图纸代码 + '_' + 部位位置信息.英文名称;
            var 关联模型 = this.关联构件模型_dic[部位key];
            if (关联模型 != null) {
                for (var si in 关联模型.构件记录_arr) {
                    var item = 关联模型.构件记录_arr[si];
                    targetPos = item.worldPos;
                    focusItems_arr.push(item);
                    if (item.object3d != null) {
                        this.构件模型Parant.add(item.object3d);
                        SetObejectMaterail(item.object3d, focusComponentModelMat);
                    } else {
                        needDownloadItems.push(item);
                    }
                }
            }
            for (var si in this.关联构件模型_dic) {
                var 关联模型_a = this.关联构件模型_dic[si];
                if (关联模型_a == 关联模型) {
                    continue;
                }
                for (var sj in 关联模型_a.构件记录_arr) {
                    var _item = 关联模型_a.构件记录_arr[sj];
                    var dis = targetPos.distanceTo(_item.worldPos);
                    if (dis <= 2) {
                        if (_item.object3d != null) {
                            this.构件模型Parant.add(_item.object3d);
                            SetObejectMaterail(_item.object3d, componentModelMat);
                        } else {
                            needDownloadItems.push(_item);
                        }
                    }
                }
            }

            this.focusItems_arr = focusItems_arr;
            this.needDownloadItems = needDownloadItems;
            if (this.state.loadComponentModel && needDownloadItems.length > 0) {
                setTimeout(function () {
                    _this5.download构件模型();
                }, 10);
            }
            return {
                needDownloadItems: needDownloadItems,
                focusItems_arr: focusItems_arr,
                targetPos: targetPos
            };
        }
    }, {
        key: '\u56FE\u7EB8\u90E8\u4F4DChanged',
        value: function Changed(want图纸部位) {
            if (want图纸部位 == this.focus图纸部位Btn) {
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

            if (this.focus图纸部位Btn != null) {
                if (this.TargetToEye_vec == null) {
                    this.TargetToEye_vec = new THREE.Vector3(0, 0, 0);
                }
                this.TargetToEye_vec.subVectors(this.camera.position, this.controls.target);
                this.部位相机loc[this.focus图纸部位Btn.位置信息.英文名称] = [new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z), new THREE.Vector3(controls.target.x, controls.target.y, controls.target.z)];
            }
            this.构件模型Parant.clear();
            this.focus图纸部位Btn = want图纸部位;
            if (want图纸部位 == null) {
                // controls.target.copy(this.originControlsTarget);
                //this.loadCameraView();
                controls.enablePan = true;
            } else {
                var checkRlt = this.checkNeedDownloadModel();
                var targetPos = checkRlt.targetPos;

                var t_arr = this.部位相机loc[want图纸部位.位置信息.英文名称];
                var eyePos = null;
                if (t_arr == null) {
                    var pos_center = new THREE.Vector3(0, 0, targetPos.z);
                    var theVec = new THREE.Vector3();
                    theVec.subVectors(targetPos, pos_center);
                    theVec.normalize();
                    eyePos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z + 1);
                    eyePos.addScaledVector(theVec, 1);
                } else {
                    eyePos = t_arr[0];
                    targetPos = t_arr[1];
                }
                if (this.TargetToEye_vec) {
                    eyePos.copy(targetPos);
                    eyePos.add(this.TargetToEye_vec);
                }
                this.camera.position.copy(eyePos);

                //console.log(want图纸部位);
                //this.saveCameraView();
                // this.originControlsTarget.copy(controls.target);
                controls.target.copy(targetPos);
                controls.enablePan = false;

                want图纸部位.参数信息_arr.forEach(function (item) {
                    self.参数Parant.add(item.geometry);
                    self.paramBtns_arr.push(item);
                    self.btnsRef.current.appendChild(item.docElem);
                });
            }
            this.setState({
                focus图纸部位: this.focus图纸部位Btn
            });
            controls.update();
        }
    }, {
        key: 'download\u6784\u4EF6\u6A21\u578B',
        value: function download() {
            if (this.focus图纸部位Btn == null) {
                return;
            }
            // let 图纸代码 = this.state.drawing.code;
            // let 部位key = `${图纸代码}_${this.focus图纸部位Btn.位置信息.英文名称}`;
            // let 关联模型 = this.关联构件模型_dic[部位key];
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
                    if (self.focusItems_arr.indexOf(downLoadItem) != -1) {
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
            var _this6 = this;

            if (this.focusParam == null) {
                return;
            }
            var paramItem = this.focusParam;
            this.参数Parant.clear();
            this.focus图纸部位Btn.参数信息_arr.forEach(function (item) {
                if (item == paramItem) {
                    item.geometry.visible = true;
                    item.geometry.material = redLineMat;
                    _this6.参数Parant.add(item.geometry);
                } else if (_this6.state.otherParamVisible) {
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
                    _this6.参数Parant.add(item.geometry);
                }
            });
        }
    }, {
        key: 'setFocusParam',
        value: function setFocusParam(paramItem) {
            var _this7 = this;

            if (paramItem == this.focusParam) {
                this.freshRenderParamLine();
                return;
            }
            var controls = this.controls;
            this.focusParam = paramItem;
            this.sphereInter.visible = false;
            if (paramItem == null) {
                this.参数Parant.clear();
                if (this.focus图纸部位Btn) {
                    this.focus图纸部位Btn.参数信息_arr.forEach(function (item) {
                        item.geometry.visible = true;
                        item.geometry.material = normalLineMat;
                        _this7.参数Parant.add(item.geometry);
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
                this.setFocusParam(this.focus图纸部位Btn.getPreParam(this.focusParam));
                return;
            }
            var newItem = this.getPre图纸部位(this.focus图纸部位Btn);
            if (newItem) {
                this.setState({ watchPos: newItem.位置信息 });
            }
        }
    }, {
        key: 'clickNextButtonHandler',
        value: function clickNextButtonHandler(ev) {
            if (this.focusParam != null) {
                this.setFocusParam(this.focus图纸部位Btn.getNextParam(this.focusParam));
                return;
            }
            var newItem = this.getNext图纸部位(this.focus图纸部位Btn);
            if (newItem) {
                this.setState({ watchPos: newItem.位置信息 });
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
            popLocationSelector(drawing.name, drawing.code, this.props.projectCode, drawing.关联模型代码, this.部位选择Callback);
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
            var _this8 = this;

            if (this.state.drawing == null) {
                return;
            }
            if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: true,
                    fetch_percent: 0,
                    fetch_title: '加载关联构件模型数据',
                    fetch_error: ''
                });
                var self = this;
                var 图纸代码 = this.state.drawing.code;
                nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_图纸关联构件模型' }).then(function (json) {
                    if (json.err != null) {
                        self.setState({
                            fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                        });
                        return;
                    }
                    var 关联模型数据_arr = json.data;
                    关联模型数据_arr.forEach(function (item) {
                        item.X *= 0.001;
                        item.Y *= 0.001;
                        item.Z *= 0.001;
                        var 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);

                        var 上传记录 = null;
                        if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                            上传记录 = new C构件上传记录();
                            上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X, item.Y, item.Z));
                            self.构件上传记录_arr.push(上传记录);
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
                    self.setState({
                        fetch_percent: 0.1,
                        fetch_title: '加载参数数据'
                    });
                    nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: _this8.state.drawing.code }, action: 'pulldata_全局参数数据' }).then(function (json) {
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

                        var loader = _this8.mainLoader;
                        loader.load(window.location.origin + _this8.state.drawing.参数信息文件路径, function (object) {
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
            var _this9 = this;

            var preDrawing = this.preDrawing;
            setTimeout(function () {
                _this9.setState({ drawing: preDrawing });
            }, 10);
        }
    }, {
        key: 'clickToggleLoadComHandler',
        value: function clickToggleLoadComHandler(ev) {
            var newVal = !this.state.loadComponentModel;
            this.setState({ loadComponentModel: newVal });
            if (newVal) {
                var self = this;
                setTimeout(function () {
                    var checkRlt = self.checkNeedDownloadModel();
                }, 100);
            }
        }
    }, {
        key: 'drawingChangedHandler',
        value: function drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码) {

            console.log('name:' + drawingName + ',code:' + drawingCode + ',\u53C2\u6570\u4E0A\u4F20\u8BB0\u5F55\u4EE3\u7801:' + 参数上传记录代码 + ',\u53C2\u6570\u4FE1\u606F\u6587\u4EF6\u8DEF\u5F84:' + 参数信息文件路径 + ',\u5173\u8054\u6A21\u578B\u4EE3\u7801:' + 关联模型代码);
            this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null } });
            var self = this;
            this.setFocusParam(null);
            setTimeout(function () {
                popLocationSelector(drawingName, drawingCode, self.props.projectCode, 关联模型代码, self.部位选择Callback);
            }, 100);
        }
    }, {
        key: '\u90E8\u4F4D\u9009\u62E9Callback',
        value: function Callback(rlt) {
            if (rlt == null) {
                if (this.state.focus图纸部位 == null) {
                    this.setState({ drawing: null });
                }
                return;
            }
            var posInfo = this.ProjectMeta.createPositionInfo(rlt.全局代码, rlt.方位名称, rlt.部位代码, rlt.一级序号, rlt.二级序号);
            var newdrawing = Object.assign(this.state.drawing, { 全局模型文件代码: rlt.全局模型文件代码, 全局模型文件路径: rlt.全局模型文件路径 });
            this.setState({ watchPos: posInfo, drawing: newdrawing });
        }
    }, {
        key: 'renderFrame',
        value: function renderFrame(gameTime) {
            var _this10 = this;

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
                if (_this10.focusParam != null) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
                if (btnItem.record.拍照状态 == 1) {
                    if (_this10.state.doneVisible == false) {
                        btnItem.docElem.style.display = 'none';
                        return;
                    }
                } else {
                    if (_this10.state.undoneVisible == false) {
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
            var _this11 = this;

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
                    React.createElement(VisibleCDrawingSelectorForm, { actionName: 'pulldata_\u53EF\u9009\u5168\u5C40\u56FE\u7EB8', 项目代码: this.props.projectCode, id: 'DrawingSelectorForm', parentPath: this.props.fullParentPath, title: '\u9009\u62E9\u56FE\u7EB8', pagebreak: false, selectMode: 'single', keyColumn: '\u9879\u76EE\u56FE\u7EB8\u5B9A\u4E49\u4EE3\u7801', onSelectedChanged: this.drawingChangedHandler, closable: this.preDrawing != null, clickCloseHandler: this.clickCloseDSHandler })
                );
                if (this.drawingDataDirted) {
                    this.drawingDataDirted = false;
                    setTimeout(function () {
                        pull_DrawingSelectorForm(null, self.props.fullParentPath, true, _this11.props.projectCode, 'pulldata_可选全局图纸');
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
                    drawingBtn,
                    React.createElement(
                        'button',
                        { className: 'btn btn-light flex-grow-0 flex-shrink=0 mt-1', onClick: this.clickToggleLoadComHandler },
                        iconElem1,
                        '\u52A0\u8F7D\u6784\u4EF6\u6A21\u578B'
                    )
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
                        var wantfocus图纸部位 = this.图纸部位_dic[this.state.watchPos.英文名称];
                        if (this.state.focus图纸部位 != wantfocus图纸部位) {
                            setTimeout(function () {
                                self.图纸部位Changed(wantfocus图纸部位);
                            }, 10);
                        } else if (this.state.focus图纸部位 != null) {
                            var btnName = this.state.focus图纸部位.位置信息.中文名称 + '  ';
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
                        opvBtn,
                        React.createElement(
                            'button',
                            { onClick: this.toggleDoneVisible, className: 'btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1' },
                            React.createElement('i', { className: "fa fa-eye" + (this.state.doneVisible == false ? '-slash text-danger' : '') }),
                            '\u5DF2\u5B8C\u6210'
                        ),
                        React.createElement(
                            'button',
                            { onClick: this.toggleUnDoneVisible, className: 'btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1' },
                            React.createElement('i', { className: "fa fa-eye" + (this.state.undoneVisible == false ? '-slash text-danger' : '') }),
                            '\u672A\u5B8C\u6210'
                        )
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

    return ERPC_ThreeDApp_A;
}(React.PureComponent);

function ERPC_ThreeDApp_A_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_A_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_ThreeDApp_A = null;

function InitThreedApp() {
    VisibleERPC_ThreeDApp_A = ReactRedux.connect(ERPC_ThreeDApp_A_mapstatetoprops, ERPC_ThreeDApp_A_dispatchtorprops)(ERPC_ThreeDApp_A);
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
function pull_DrawingSelectorForm(retState, fullParentPath, holdScroll, 项目代码, actionName) {
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
        store.dispatch(fetchJsonPost(threeDServerUrl, { bundle: bundle, action: actionName }, makeFTD_Prop(fullParentPath, 'DrawingSelectorForm', 'records_arr', false), EFetchKey.FetchPropValue));
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
        this.props.onSelectedChanged(selectedProfile.record['图纸名称'], selectedProfile.record['项目图纸定义代码'], selectedProfile.record['参数上传记录代码'], selectedProfile.record['参数信息路径'], selectedProfile.record['关联模型代码'], selectedProfile.record);
    }
}

var CDrawingSelectorForm = function (_React$PureComponent2) {
    _inherits(CDrawingSelectorForm, _React$PureComponent2);

    function CDrawingSelectorForm(props) {
        _classCallCheck(this, CDrawingSelectorForm);

        var _this12 = _possibleConstructorReturn(this, (CDrawingSelectorForm.__proto__ || Object.getPrototypeOf(CDrawingSelectorForm)).call(this, props));

        ERPC_GridForm(_this12);
        gCreatFormSetting(_this12);
        _this12.clickRowHandler = _this12.clickRowHandler.bind(_this12);
        _this12.clickFreshHandler = _this12.clickFreshHandler.bind(_this12);

        _this12.DrawingSelectorForm_records_arr_changed = DrawingSelectorForm_records_arr_changed.bind(_this12);
        _this12.bind_DrawingSelectorForm = bind_DrawingSelectorForm.bind(_this12);
        _this12.DrawingSelectorForm_selectedValue_changed = DrawingSelectorForm_selectedValue_changed.bind(_this12);
        return _this12;
    }

    _createClass(CDrawingSelectorForm, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var fullPath = this.props.fullPath;
            if (appStateChangedAct_map[fullPath + '.records_arr'] == null) {
                appStateChangedAct_map[fullPath + '.records_arr'] = this.DrawingSelectorForm_records_arr_changed;
                appStateChangedAct_map[fullPath + '.pageIndex'] = this.bind_DrawingSelectorForm;
                appStateChangedAct_map[fullPath + '.selectedValue'] = this.DrawingSelectorForm_selectedValue_changed;
            }
        }
    }, {
        key: 'componentWillUnmount',
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
        key: 'render',
        value: function render() {
            var retElem = null;
            if (this.props.visible == false) {
                return null;
            }
            retElem = this.renderContent();
            return retElem;
        }
    }, {
        key: 'renderContent',
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
                                'div',
                                { className: 'm-auto' },
                                '\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E'
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
            var closeBtn = null;
            if (this.props.closable) {
                closeBtn = React.createElement(
                    'div',
                    { className: 'd-flex justify-content-center flex-grow-0 flex-shrink-0' },
                    React.createElement(
                        'button',
                        { onClick: this.props.clickCloseHandler, className: 'btn btn-danger', style: { minWidth: '100px' } },
                        React.createElement('i', { className: 'fa fa close' }),
                        '\u5173\u95ED'
                    )
                );
            }
            return React.createElement(
                'div',
                { ref: this.rootRef, className: 'd-flex erp-form flexHelper flex-column centerelem w-100 position-absolute bg-light', style: { maxHeight: '80%' } },
                this.props.title && React.createElement(
                    'div',
                    { className: 'bg-dark text-light justify-content-start d-flex flex-shrink-0 p-1' },
                    React.createElement(
                        'span',
                        null,
                        this.props.title,
                        this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null,
                        this.props.fetching ? null : React.createElement('i', { className: 'btn btn-sm fa fa-refresh', onClick: this.clickFreshHandler })
                    )
                ),
                React.createElement(
                    'div',
                    { id: this.props.fullPath + 'tableheader', className: 'mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv' },
                    React.createElement(
                        'table',
                        { className: 'table', style: DrawingSelectorForm_headtableStyle },
                        React.createElement(CDrawingSelectorForm_THead, { form: this })
                    )
                ),
                React.createElement(
                    'div',
                    { id: this.props.fullPath + 'scroller', onScroll: this.tableBodyScroll, className: 'mw-100 autoScroll' },
                    retElem
                ),
                navElem,
                closeBtn
            );
        }
    }, {
        key: 'clickFreshHandler',
        value: function clickFreshHandler(ev) {
            pull_DrawingSelectorForm(null, this.props.fullParentPath, true, this.props.项目代码, this.props.actionName);
        }
    }, {
        key: 'clickRowHandler',
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
        key: 'render',
        value: function render() {
            var retElem = null;
            var simpleMode = this.props.simpleMode;
            return React.createElement(
                'thead',
                { className: 'thead-light' },
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        { scope: 'col', className: 'indexTableHeader' },
                        '\u5E8F\u53F7'
                    ),
                    this.props.M_LC_41_visible == false ? null : React.createElement(
                        'th',
                        { style: DrawingSelectorFormheadstyle0 },
                        '\u56FE\u7EB8\u79CD\u7C7B'
                    ),
                    this.props.M_LC_43_visible == false ? null : React.createElement(
                        'th',
                        { style: DrawingSelectorFormheadstyle1 },
                        '\u56FE\u7EB8\u540D\u79F0'
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
        key: 'render',
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
                        'td',
                        { className: 'indexTableHeader' },
                        rowIndex + 1
                    ),
                    this.props.M_LC_41_visible == false ? null : React.createElement(
                        'td',
                        { style: DrawingSelectorFormtdstyle0 },
                        React.createElement(VisibleERPC_Label, { className: 'erp-control ', rowkey: rowkey, id: 'M_Label_42', parentPath: this.props.fullPath, type: 'string' })
                    ),
                    this.props.M_LC_43_visible == false ? null : React.createElement(
                        'td',
                        { style: DrawingSelectorFormtdstyle1 },
                        React.createElement(VisibleERPC_Label, { className: 'erp-control ', rowkey: rowkey, id: 'M_Label_53', parentPath: this.props.fullPath, type: 'string' })
                    )
                ));
            }
            return React.createElement(
                'table',
                { className: 'table table-striped table-hover ', style: DrawingSelectorForm_tableStyle },
                React.createElement(CDrawingSelectorForm_THead, { simpleMode: true }),
                React.createElement(
                    'tbody',
                    null,
                    trElems_arr
                )
            );
        }
    }]);

    return CDrawingSelectorForm_TBody;
}(React.PureComponent);

//===============


var M_Page_FileViewer_style = { "height": "100%" };
function view附件文件(图片名称, 关联记录代码, 归属流程代码) {
    var popPage_0entryParam = {
        显示名称: 图片名称,
        关联记录代码: 关联记录代码,
        归属流程代码: 归属流程代码,
        callBack: null
    };
    gDataCache.set('M_Page_FileViewerentryParam', popPage_0entryParam);
    init_M_Page_FileViewer();
    popPersistentPage('M_Page_FileViewer', function () {
        return React.createElement(VisibleCM_Page_FileViewer, { key: 'M_Page_FileViewer' });
    });
}
function shotParam(名称显示, 发图记录代码, 参数上传记录代码, completeCallBack) {
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        if (popPage_1exportParam.拍照完成) {
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        发图记录代码: 发图记录代码,
        参数上传记录代码: 参数上传记录代码,
        名称显示: 名称显示,
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_ParamShoterentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter();
    popPersistentPage('M_Page_ParamShoter', function () {
        return React.createElement(VisibleCM_Page_ParamShoter, { key: 'M_Page_ParamShoter', id: 'M_Page_ParamShoter', parenPath: 'M_Page_ParamShoter' });
    });
}

function shotComParam(构件代码, 参数上传数据代码, 图纸种类代码, completeCallBack) {
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        if (popPage_1exportParam.拍照完成) {
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        构件代码: 构件代码,
        参数上传数据代码: 参数上传数据代码,
        图纸种类代码: 图纸种类代码,
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_ParamShoter_comentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter_Com();
    popPersistentPage('M_Page_ParamShoter_com', function () {
        return React.createElement(VisibleCM_Page_ParamShoter, { key: 'M_Page_ParamShoter_com', id: 'M_Page_ParamShoter_com', parenPath: 'M_Page_ParamShoter_com' });
    });
}

function popLocationSelector(图纸名称, 图纸代码, 项目代码, 关联模型代码, completeCallBack) {
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        setTimeout(function () {
            completeCallBack(popPage_1exportParam.部位信息);
        }, 50);
    };
    var popPage_1entryParam = {
        图纸名称: 图纸名称,
        图纸代码: 图纸代码,
        项目代码: 项目代码,
        可视模型代码: 关联模型代码,
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_LocSelentryParam', popPage_1entryParam);
    init_M_Page_LocSel();
    popPersistentPage('M_Page_LocSel', function () {
        return React.createElement(VisibleCM_Page_LocSel, { key: 'M_Page_LocSel' });
    });
}

function popComponentSelector(图纸名称, 图纸代码, 项目代码, 关联模型代码, completeCallBack) {
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        setTimeout(function () {
            completeCallBack(popPage_1exportParam.构件信息);
        }, 50);
    };
    var popPage_1entryParam = {
        图纸名称: 图纸名称,
        图纸代码: 图纸代码,
        项目代码: 项目代码,
        可视模型代码: 关联模型代码,
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_ComSelentryParam', popPage_1entryParam);
    init_M_Page_ComSel();
    popPersistentPage('M_Page_ComSel', function () {
        return React.createElement(VisibleCM_Page_ComSel, { key: 'M_Page_ComSel' });
    });
}

function testHandler() {
    return;
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        if (popPage_1exportParam.拍照完成) {
            //setTimeout(() => {pull_M_Form_28(null,true,'M_Page_14.tabcontrol_4.tabitem_8',true);},50);
        }
    };
    var popPage_1entryParam = {
        发图记录代码: 3101,
        参数上传记录代码: 93095,
        名称显示: '一个地方',
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_ParamShoterentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter();
    popPage('M_Page_ParamShoter', React.createElement(VisibleCM_Page_ParamShoter, { key: 'M_Page_ParamShoter' }));
}

function init_M_Page_FileViewer(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_FileViewer';
    var hadState = state != null;
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_FileViewer_onLoad();
    }, 50);
    setTimeout(function () {}, 50);
    needSetState['M_Page_FileViewer.parentPageID'] = parentPageID;
    needSetState['M_Page_FileViewer._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_FileViewer_onLoad() {
    var M_Page_FileViewer_显示名称 = getPageEntryParam('M_Page_FileViewer', '显示名称', 0);
    var M_Page_FileViewer_关联记录代码 = getPageEntryParam('M_Page_FileViewer', '关联记录代码', 0);
    var M_Page_FileViewer_归属流程代码 = getPageEntryParam('M_Page_FileViewer', '归属流程代码', 0);
    var state = store.getState();
    setTimeout(function () {
        store.dispatch(makeAction_setStateByPath({ type: '查看文件', data: { 显示名称: M_Page_FileViewer_显示名称, 关联记录代码: M_Page_FileViewer_关联记录代码, 归属流程代码: M_Page_FileViewer_归属流程代码 } }, 'M_Page_FileViewer.iframe_fv.msg'));
    }, 50);
}

var CM_Page_FileViewer = function (_React$PureComponent5) {
    _inherits(CM_Page_FileViewer, _React$PureComponent5);

    function CM_Page_FileViewer(props) {
        _classCallCheck(this, CM_Page_FileViewer);

        var _this15 = _possibleConstructorReturn(this, (CM_Page_FileViewer.__proto__ || Object.getPrototypeOf(CM_Page_FileViewer)).call(this, props));

        _this15.id = 'M_Page_FileViewer';
        ERPC_Page(_this15);
        return _this15;
    }

    _createClass(CM_Page_FileViewer, [{
        key: 'render',
        value: function render() {
            var retElem = null;
            retElem = React.createElement(
                'div',
                { className: 'd-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen'), style: M_Page_FileViewer_style },
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
                    '\u67E5\u770B\u56FE\u7EB8'
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
                React.createElement(VisibleERPC_IFrame, { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column ', proj: 'GJYM', flowCode: '286', pageType: 'mb', id: 'iframe_fv', parentPath: 'M_Page_FileViewer' }),
                this.renderSidePage()
            );
            return retElem;
        }
    }]);

    return CM_Page_FileViewer;
}(React.PureComponent);

function CM_Page_FileViewer_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_FileViewer', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_FileViewer_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
var VisibleCM_Page_FileViewer = ReactRedux.connect(CM_Page_FileViewer_mapstatetoprops, CM_Page_FileViewer_disptchtoprops)(CM_Page_FileViewer);

// M_Page_ParamShoter
function init_M_Page_ParamShoter(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ParamShoter';
    var hadState = state != null;
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_ParamShoter_onLoad();
    }, 50);
    needSetState['M_Page_ParamShoter.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function init_M_Page_ParamShoter_Com(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var hadState = state != null;
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_ParamShoter_Com_onLoad();
    }, 50);
    needSetState['M_Page_ParamShoter_com.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter_com._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_ParamShoter_onLoad() {
    var M_Page_ParamShoter_发图记录代码 = getPageEntryParam('M_Page_ParamShoter', '发图记录代码', 0);
    var M_Page_ParamShoter_参数上传记录代码 = getPageEntryParam('M_Page_ParamShoter', '参数上传记录代码', 0);
    var M_Page_ParamShoter_名称显示 = getPageEntryParam('M_Page_ParamShoter', '名称显示', 0);
    var state = store.getState();
    setTimeout(function () {
        store.dispatch(makeAction_setStateByPath({ type: '刷新参数', data: { 发图记录代码: M_Page_ParamShoter_发图记录代码, 参数上传数据代码: M_Page_ParamShoter_参数上传记录代码, 构件全称: M_Page_ParamShoter_名称显示 } }, 'M_Page_ParamShoter.iframe_shot.msg'));
    }, 50);
}

function M_Page_ParamShoter_Com_onLoad() {
    var 构件代码 = getPageEntryParam('M_Page_ParamShoter_com', '构件代码', 0);
    var 参数上传数据代码 = getPageEntryParam('M_Page_ParamShoter_com', '参数上传数据代码', 0);
    var 图纸种类代码 = getPageEntryParam('M_Page_ParamShoter_com', '图纸种类代码', 0);
    var state = store.getState();
    setTimeout(function () {
        store.dispatch(makeAction_setStateByPath({ type: '刷新构件参数', data: { 构件代码: 构件代码, 参数上传数据代码: 参数上传数据代码, 图纸种类代码: 图纸种类代码 } }, 'M_Page_ParamShoter_com.iframe_shot.msg'));
    }, 50);
}

function iframe_shot_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_shot_path = fullPath;
    var pageID = 'M_Page_ParamShoter';
    if (fullPath.indexOf('_com') > 0) {
        pageID += '_com';
    }
    if (msgtype == '拍照完成') {
        var closePage_0exportParam = {
            拍照完成: true
        };
        closePage2(pageID, state);

        var closePage_0_callback = getPageEntryParam(pageID, 'callBack');
        if (closePage_0_callback) {
            setTimeout(function () {
                closePage_0_callback(closePage_0exportParam);
            }, 20);
        }
    }
}

var CM_Page_ParamShoter = function (_React$PureComponent6) {
    _inherits(CM_Page_ParamShoter, _React$PureComponent6);

    function CM_Page_ParamShoter(props) {
        _classCallCheck(this, CM_Page_ParamShoter);

        var _this16 = _possibleConstructorReturn(this, (CM_Page_ParamShoter.__proto__ || Object.getPrototypeOf(CM_Page_ParamShoter)).call(this, props));

        ERPC_Page(_this16);
        return _this16;
    }

    _createClass(CM_Page_ParamShoter, [{
        key: 'render',
        value: function render() {
            if (this.id == null) {
                this.id = this.props.id;
            }
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
                    '\u62CD\u7167\u4E0A\u4F20'
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
                React.createElement(VisibleERPC_IFrame, { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column ', proj: 'GJYM', flowCode: '285', pageType: 'mb', onMessageFun: iframe_shot_onReceiveMsg, id: 'iframe_shot', parentPath: this.props.parenPath }),
                this.renderSidePage()
            );
            return retElem;
        }
    }]);

    return CM_Page_ParamShoter;
}(React.PureComponent);

function CM_Page_ParamShoter_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ParamShoter', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ParamShoter_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
var VisibleCM_Page_ParamShoter = ReactRedux.connect(CM_Page_ParamShoter_mapstatetoprops, CM_Page_ParamShoter_disptchtoprops)(CM_Page_ParamShoter);

// M_Page_LocSel
function init_M_Page_LocSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_LocSel';
    var hadState = state != null;
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_LocSel_onLoad();
    }, 50);
    setTimeout(function () {}, 50);
    needSetState['M_Page_LocSel.parentPageID'] = parentPageID;
    needSetState['M_Page_LocSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_LocSel_onLoad() {
    var M_Page_LocSel_图纸名称 = getPageEntryParam('M_Page_LocSel', '图纸名称', 0);
    var M_Page_LocSel_项目代码 = getPageEntryParam('M_Page_LocSel', '项目代码', 0);
    var M_Page_LocSel_可视模型代码 = getPageEntryParam('M_Page_LocSel', '可视模型代码', 0);
    var M_Page_LocSel_图纸代码 = getPageEntryParam('M_Page_LocSel', '图纸代码', 0);
    var state = store.getState();
    setTimeout(function () {
        store.dispatch(makeAction_setStateByPath({ type: '设置参数', data: { 图纸名称: M_Page_LocSel_图纸名称, 项目代码: M_Page_LocSel_项目代码, 可视模型代码: M_Page_LocSel_可视模型代码, 图纸代码: M_Page_LocSel_图纸代码 } }, 'M_Page_LocSel.iframe_locsel.msg'));
    }, 50);
}
function iframe_locsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_locsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            部位信息: data
        };
        closePage2('M_Page_LocSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_LocSel', 'callBack');
        if (closePage_0_callback) {
            setTimeout(function () {
                closePage_0_callback(closePage_0exportParam);
            }, 20);
        }
    }
}

var CM_Page_LocSel = function (_React$PureComponent7) {
    _inherits(CM_Page_LocSel, _React$PureComponent7);

    function CM_Page_LocSel(props) {
        _classCallCheck(this, CM_Page_LocSel);

        var _this17 = _possibleConstructorReturn(this, (CM_Page_LocSel.__proto__ || Object.getPrototypeOf(CM_Page_LocSel)).call(this, props));

        _this17.id = 'M_Page_LocSel';
        ERPC_Page(_this17);
        return _this17;
    }

    _createClass(CM_Page_LocSel, [{
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
                    '\u56FE\u7EB8\u90E8\u4F4D\u9009\u53D6'
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
                React.createElement(VisibleERPC_IFrame, { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column ', proj: 'GJYM', flowCode: '287', pageType: 'auto', onMessageFun: iframe_locsel_onReceiveMsg, id: 'iframe_locsel', parentPath: 'M_Page_LocSel' }),
                this.renderSidePage()
            );
            return retElem;
        }
    }]);

    return CM_Page_LocSel;
}(React.PureComponent);

function CM_Page_LocSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_LocSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_LocSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
var VisibleCM_Page_LocSel = ReactRedux.connect(CM_Page_LocSel_mapstatetoprops, CM_Page_LocSel_disptchtoprops)(CM_Page_LocSel);

var ERPC_ThreeDApp_B = function (_React$PureComponent8) {
    _inherits(ERPC_ThreeDApp_B, _React$PureComponent8);

    function ERPC_ThreeDApp_B(props) {
        _classCallCheck(this, ERPC_ThreeDApp_B);

        var _this18 = _possibleConstructorReturn(this, (ERPC_ThreeDApp_B.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_B)).call(this));

        autoBind(_this18);
        ERPControlBase(_this18);
        ERP_ThreeDAppBase(_this18, {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false
        });

        _this18.drawingDataDirted = true;
        _this18.图纸部位Btns_arr = [];
        _this18.paramBtns_arr = [];
        _this18.focus构件记录 = null;
        _this18.focusParam = null;
        _this18.cameraInfo_arr = [];
        _this18.部位相机loc = {};
        _this18.关联构件模型_dic = {};
        _this18.构件上传记录_arr = [];
        _this18.构件上传记录_map = {};

        _this18.ProjectChanged = ProjectChanged1.bind(_this18);
        _this18.initApp = InitApp1.bind(_this18);
        return _this18;
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
            var _this19 = this;

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
                        _this19.构件模型Parant.add(item.object3d);
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
                    _this19.download构件模型();
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
            var _this20 = this;

            if (this.focusParam == null) {
                return;
            }
            var paramItem = this.focusParam;
            this.参数Parant.clear();
            this.focus构件记录Btn.参数信息_arr.forEach(function (item) {
                if (item == paramItem) {
                    item.geometry.visible = true;
                    item.geometry.material = redLineMat;
                    _this20.参数Parant.add(item.geometry);
                } else if (_this20.state.otherParamVisible) {
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
                    _this20.参数Parant.add(item.geometry);
                }
            });
        }
    }, {
        key: 'setFocusParam',
        value: function setFocusParam(paramItem) {
            var _this21 = this;

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
                        _this21.参数Parant.add(item.geometry);
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
            var _this22 = this;

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

                    var loader = _this22.mainLoader;
                    loader.load(window.location.origin + _this22.state.drawing.参数信息文件路径, function (object) {
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
                                        var _X3 = parseFloat(t_arr[0]);
                                        var _Y3 = parseFloat(t_arr[1]);
                                        var _Z3 = parseFloat(t_arr[2]);
                                        startPos.set(_X3, _Y3, _Z3);
                                    } else if (item[0] == 'end') {
                                        t_arr = item[1].split(',');
                                        var _X4 = parseFloat(t_arr[0]);
                                        var _Y4 = parseFloat(t_arr[1]);
                                        var _Z4 = parseFloat(t_arr[2]);
                                        endPos.set(_X4, _Y4, _Z4);
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
            var _this23 = this;

            var preDrawing = this.preDrawing;
            setTimeout(function () {
                _this23.setState({ drawing: preDrawing });
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
            var _this24 = this;

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
                if (_this24.focusParam != null) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
                if (btnItem.record.拍照状态 == 1) {
                    if (_this24.state.doneVisible == false) {
                        btnItem.docElem.style.display = 'none';
                        return;
                    }
                } else {
                    if (_this24.state.undoneVisible == false) {
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
            var _this25 = this;

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
                        pull_DrawingSelectorForm(null, self.props.fullParentPath, true, _this25.props.projectCode, 'pulldata_可选构件安装图纸');
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
                                            { key: item.参数上传数据代码, record_id: item.参数上传数据代码, onClick: _this25.clickShotHandler, className: "btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (item.拍照状态 ? 'success' : 'light') },
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

var CM_Page_ComSel = function (_React$PureComponent9) {
    _inherits(CM_Page_ComSel, _React$PureComponent9);

    function CM_Page_ComSel(props) {
        _classCallCheck(this, CM_Page_ComSel);

        var _this26 = _possibleConstructorReturn(this, (CM_Page_ComSel.__proto__ || Object.getPrototypeOf(CM_Page_ComSel)).call(this, props));

        _this26.id = 'M_Page_ComSel';
        ERPC_Page(_this26);
        return _this26;
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