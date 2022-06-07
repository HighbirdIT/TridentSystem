'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _console;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

function makeInstance(geometry, color, coord) {
    var mat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    var rlt = new THREE.Mesh(geometry, mat);
    rlt.position.copy(coord);
    return rlt;
}

function init() {

    requestAnimationFrame(render);
}

//setTimeout(init, 500);

var a = [1, 23, 4];
(_console = console).log.apply(_console, a);

var ERPC_ThreeDApp = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp, _React$PureComponent);

    function ERPC_ThreeDApp(props) {
        _classCallCheck(this, ERPC_ThreeDApp);

        var _this = _possibleConstructorReturn(this, (ERPC_ThreeDApp.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp)).call(this));

        autoBind(_this);

        ERPControlBase(_this);
        _this.state = _this.initState;
        _this.canvasRef = React.createRef();
        _this.rootRef = React.createRef();

        _this.cubes_arr = [];
        return _this;
    }

    _createClass(ERPC_ThreeDApp, [{
        key: 'cusComponentWillmount',
        value: function cusComponentWillmount() {
            this.startAPP();
        }
    }, {
        key: 'cusComponentWillUnmount',
        value: function cusComponentWillUnmount() {}
    }, {
        key: 'initApp',
        value: function initApp() {
            var canvas = this.canvasRef.current;
            var renderer = new THREE.WebGLRenderer({ canvas: canvas });
            this.renderer = renderer;

            var fov = 75;
            var aspect = canvas.clientWidth / canvas.clientHeight;
            var near = 0.1;
            var far = 5;
            var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            this.camera = camera;

            camera.position.z = 4;

            var scene = new THREE.Scene();
            this.scene = scene;
            scene.background = new THREE.Color(0xAAAAAA);

            var geometry = new THREE.BoxGeometry(1, 1, 1);
            this.cubes_arr.push(makeInstance(geometry, 0xff0000, new THREE.Vector3(-2, 0, 0)));
            this.cubes_arr.push(makeInstance(geometry, 0x00ff00, new THREE.Vector3(0, 0, 0)));
            this.cubes_arr.push(makeInstance(geometry, 0x0000ff, new THREE.Vector3(2, 0, 0)));

            var lightColor = 0xFFFFFF;
            var intensity = 1;
            var light = new THREE.DirectionalLight(lightColor, intensity);
            light.position.set(-1, 2, 4);
            scene.add(light);

            var controls = new OrbitControls(camera, canvas);
            this.controls = controls;
            controls.target.set(0, 0, 0);
            controls.update();

            var loader = new Rhino3dmLoader();
            loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/');
            loader.load(window.location.origin + '/filehouse/proModel.3dm', function (object) {
                scene.add(object);
            });
        }
    }, {
        key: 'startAPP',
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
        key: 'pauseAPP',
        value: function pauseAPP() {}
    }, {
        key: 'resizeRendererToDisplaySize',
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
        key: 'renderFrame',
        value: function renderFrame(time) {
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
            this.cubes_arr.forEach(function (cube, i) {
                var speed = 1 + i * 0.5;
                cube.rotation.x = time * speed;
                cube.rotation.y = time * speed;
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
            var rootDivClassName = 'erpc_threeD d-block hidenOverflow ' + (this.props.className == null ? '' : this.props.className);

            var needCtlPath = true;
            var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
            return React.createElement(
                'div',
                { ref: this.rootRef, className: useStyleClass.class, style: useStyleClass.style, 'ctl-fullpath': needCtlPath ? this.props.fullPath : null },
                React.createElement('canvas', { ref: this.canvasRef, className: 'w-100 h-100 d-block' })
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
        dynamicClass: ctlState.class
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