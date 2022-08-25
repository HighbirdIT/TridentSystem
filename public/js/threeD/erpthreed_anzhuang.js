'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CWCB构件记录 = function CWCB构件记录(rcd) {
    _classCallCheck(this, CWCB构件记录);

    rcd.X *= 0.001;
    rcd.Y *= 0.001;
    rcd.Z *= 0.001;

    this.rcd = rcd;
    this.构件全称 = rcd.真构件完整编号;
    if (this.构件全称 == null) {
        this.构件全称 = rcd.构件全称;
    }
    this.worldPos = new THREE.Vector3(rcd.X, rcd.Y, rcd.Z);
    this.构件上传记录代码 = rcd.构件上传记录代码;
    this.上传记录代码 = rcd.构件上传记录代码;
    this.复核参数_arr = [];
    this.相邻构件_arr = [];
    this.asyned = false;
};

var ERPC_ThreeDApp_AZWCB = function (_React$PureComponent) {
    _inherits(ERPC_ThreeDApp_AZWCB, _React$PureComponent);

    function ERPC_ThreeDApp_AZWCB(props) {
        _classCallCheck(this, ERPC_ThreeDApp_AZWCB);

        var _this = _possibleConstructorReturn(this, (ERPC_ThreeDApp_AZWCB.__proto__ || Object.getPrototypeOf(ERPC_ThreeDApp_AZWCB)).call(this));

        autoBind(_this);
        ERPControlBase(_this);
        ERP_ThreeDAppBase(_this, {
            showingModelPath: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false,
            全局模型文件代码: null,
            全局模型文件路径: null,
            上传记录代码: 0,
            drawing: {}
        });

        _this.drawingDataDirted = true;
        _this.focus构件记录 = null;
        _this.cameraInfo_arr = [];
        _this.部位相机loc = {};
        _this.关联构件模型_dic = {};
        _this.构件上传记录_arr = [];
        _this.构件上传记录_map = {};

        _this.initApp = InitApp1.bind(_this);
        return _this;
    }

    _createClass(ERPC_ThreeDApp_AZWCB, [{
        key: 'doPopWCBSelector',
        value: function doPopWCBSelector(ev) {
            popWCBSelector(this.构件选择Callback);
        }
    }, {
        key: 'clickExitButtonHandler',
        value: function clickExitButtonHandler(ev) {
            this.doPopWCBSelector();
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
                    if (参数记录.拍照状态 == 0) {
                        参数记录.拍照状态 = 1;
                        self.setState({ magicObj: {} });
                    }
                };
                if (参数记录.是多点拍照 == 1) {
                    shotMultiComParam(225, 参数记录.参数上传数据代码, 4, callBack);
                } else {
                    shotComParam(225, 参数记录.参数上传数据代码, 4, callBack);
                }
            }
        }
    }, {
        key: 'getNext\u6784\u4EF6\u8BB0\u5F55',
        value: function getNext(base) {
            var index = this.构件上传记录_arr.indexOf(base) + 1;
            if (index >= this.构件上传记录_arr.length) {
                return null;
            }
            var rlt = this.构件上传记录_arr[index];
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
            return rlt;
        }
    }, {
        key: '\u6784\u4EF6\u8BB0\u5F55Changed',
        value: function Changed(want构件记录) {
            var _this2 = this;

            if (want构件记录 == this.focus构件记录Btn) {
                return;
            }

            var controls = this.controls;
            var self = this;

            if (this.focus构件记录Btn != null) {
                if (this.focus构件记录Btn.object3d) {
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
            } else {
                if (want构件记录.object3d) {
                    SetObejectMaterail(want构件记录.object3d, focusComponentModelMat);
                }

                if (want构件记录.asyned == false) {
                    // 同步构件数据
                    this.setState({
                        fetching: true,
                        fetch_percent: 0,
                        fetch_title: '\u52A0\u8F7D' + want构件记录.构件全称 + '\u6570\u636E',
                        fetch_error: ''
                    });

                    nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: want构件记录.上传记录代码, 最大距离: 5 }, action: 'pulldata_同步WCB信息' }).then(function (json) {
                        if (json.err != null) {
                            self.setState({
                                fetch_error: '\u51FA\u9519\u4E86:' + JSON.stringify(json.err)
                            });
                            return;
                        }
                        // console.log(json);
                        want构件记录.复核参数_arr = json.data.参数rcd_arr;
                        var 相邻构件_arr = [];
                        json.data.相邻rcd_arr.forEach(function (rcd) {
                            if (_this2.构件上传记录_map[rcd.构件上传记录代码] == null) {
                                _this2.构件上传记录_map[rcd.构件上传记录代码] = new CWCB构件记录(rcd);
                            }
                            var 构件记录 = _this2.构件上传记录_map[rcd.构件上传记录代码];
                            构件记录.文件路径 = rcd.模型文件路径;
                            构件记录.构件生存状态代码 = rcd.构件生存状态代码;
                            相邻构件_arr.push(构件记录);
                        });
                        want构件记录.相邻构件_arr = 相邻构件_arr;
                        want构件记录.asyned = true;
                        self.needDownloadItems = 相邻构件_arr;
                        self.download构件模型();
                    });
                } else {
                    self.needDownloadItems = want构件记录.相邻构件_arr;
                    self.download构件模型();
                }
            }
            this.setState({
                focus构件记录: this.focus构件记录Btn
            });
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
            var self = this;
            if (downLoadItem == null) {
                if (this.state.fetching) {
                    self.setState({
                        fetching: false,
                        fetch_percent: 0
                    });
                }
                var controls = this.controls;
                var targetPos = now构件记录.worldPos;
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
                controls.update();

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
                    var _controls = self.controls;

                    self.构件模型Parant.add(object);
                    var box = new THREE.Box3();
                    box.expandByObject(object);
                    var size = new THREE.Vector3();
                    var center = new THREE.Vector3();
                    box.getSize(size);
                    box.getCenter(center);
                    downLoadItem.center = center;
                    if (downLoadItem == now构件记录) {
                        _controls.target.copy(center);
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
        key: 'clickPreButtonHandler',
        value: function clickPreButtonHandler(ev) {
            var newItem = this.getPre构件记录(this.focus构件记录Btn);
            if (newItem) {
                this.setState({ 上传记录代码: newItem.上传记录代码 });
            }
        }
    }, {
        key: 'clickNextButtonHandler',
        value: function clickNextButtonHandler(ev) {
            var newItem = this.getNext构件记录(this.focus构件记录Btn);
            if (newItem) {
                this.setState({ 上传记录代码: newItem.上传记录代码 });
            }
        }
    }, {
        key: '\u6784\u4EF6\u9009\u62E9Callback',
        value: function Callback(rlt) {
            var _this3 = this;

            if (rlt == null) {
                return;
            }
            var new构件上传记录_arr = [];
            rlt.构件记录_arr.forEach(function (rcd) {
                if (_this3.构件上传记录_map[rcd.构件上传记录代码] == null) {
                    _this3.构件上传记录_map[rcd.构件上传记录代码] = new CWCB构件记录(rcd);
                }
                new构件上传记录_arr.push(_this3.构件上传记录_map[rcd.构件上传记录代码]);
            });
            this.构件上传记录_arr = new构件上传记录_arr;
            var newdrawing = {
                全局模型文件代码: rlt.全局模型文件代码,
                全局模型文件路径: rlt.全局模型文件路径
            };
            this.setState({
                drawing: newdrawing,
                上传记录代码: rlt.构件上传记录代码
            });
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

            renderer.render(scene, camera);
            requestAnimationFrame(this.renderFrame);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

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

            if (this.state.drawing.全局模型文件代码 == null) {
                // 还没目标构件
                if (this.popSeled == null) {
                    setTimeout(function () {
                        self.doPopWCBSelector();
                    }, 50);
                    this.popSeled = true;
                }
            } else {
                if (this.state.fetching == false) {
                    if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                        setTimeout(function () {
                            self.全局模型changed();
                        }, 10);
                    } else {
                        var wantfocus构件记录 = this.构件上传记录_map[this.state.上传记录代码];
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
                            var 状态提示elem = null;
                            if (this.state.focus构件记录.生存状态代码 < 4) {
                                状态提示elem = React.createElement(
                                    'span',
                                    { className: 'badge badge-danger' },
                                    React.createElement('i', { className: 'fa fa-warning' }),
                                    '\u672A\u5230\u8FBE\u73B0\u573A'
                                );
                            } else if (this.state.focus构件记录.生存状态代码 > 4) {
                                状态提示elem = React.createElement(
                                    'span',
                                    { className: 'badge badge-success' },
                                    React.createElement('i', { className: 'fa fa-checke' }),
                                    '\u5DF2\u5B89\u88C5'
                                );
                            }
                            if (状态提示elem != null) {
                                extraUIs_arr.push(React.createElement(
                                    'div',
                                    { key: 'mag_statetip', className: 'd-flex flex-nowrap position-absolute ', style: { left: canvasWidth_half + 'px', top: canvasHeight - 90 + 'px', transform: 'translate(-50%,-100%)' } },
                                    状态提示elem
                                ));
                            }
                            extraUIs_arr.push(React.createElement(
                                'div',
                                { key: 'nag_middleBtns', className: 'd-flex flex-nowrap position-absolute ', style: { left: canvasWidth_half + 'px', top: canvasHeight - 50 + 'px', transform: 'translate(-50%,-100%)' } },
                                React.createElement(
                                    'button',
                                    { onClick: this.clickPreButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2', style: { minWidth: '60px' } },
                                    React.createElement('i', { className: 'fa fa-angle-left' })
                                ),
                                React.createElement(
                                    'button',
                                    { onClick: this.clickExitButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2', style: { minWidth: '150px' } },
                                    btnName
                                ),
                                React.createElement(
                                    'button',
                                    { onClick: this.clickNextButtonHandler, className: 'btn btn-primary flex-grow-0 flex-shrink=0 mr-2', style: { minWidth: '60px' } },
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
                                            { key: item.参数上传数据代码, record_id: item.参数上传数据代码, onClick: _this4.clickShotHandler, className: "btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (item.拍照状态 ? 'success' : 'light') },
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
                }
            }

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

    return ERPC_ThreeDApp_AZWCB;
}(React.PureComponent);

function ERPC_ThreeDApp_AZWCB_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_AZWCB_dispatchtorprops(dispatch, ownprops) {
    return {};
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
    if (!hadState) {
        state = store.getState();
    }
    setTimeout(function () {
        M_Page_WCBSel_onLoad();
    }, 50);
    needSetState['M_Page_WCBSel.parentPageID'] = parentPageID;
    needSetState['M_Page_WCBSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function M_Page_WCBSel_onLoad() {}

function M_iframe_wcbsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var M_iframe_comsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            构件信息: data
        };
        closePage2('M_Page_WCBSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_WCBSel', 'callBack');
        if (closePage_0_callback) {
            setTimeout(function () {
                closePage_0_callback(closePage_0exportParam);
            }, 20);
        }
    }
}

var CM_Page_WCBSel = function (_React$PureComponent2) {
    _inherits(CM_Page_WCBSel, _React$PureComponent2);

    function CM_Page_WCBSel(props) {
        _classCallCheck(this, CM_Page_WCBSel);

        var _this5 = _possibleConstructorReturn(this, (CM_Page_WCBSel.__proto__ || Object.getPrototypeOf(CM_Page_WCBSel)).call(this, props));

        _this5.id = 'M_Page_WCBSel';
        ERPC_Page(_this5);
        return _this5;
    }

    _createClass(CM_Page_WCBSel, [{
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
                    'WCB\u9009\u62E9'
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
                React.createElement(VisibleERPC_IFrame, { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column ', proj: 'GJYM', flowCode: '302', pageType: 'auto', onMessageFun: M_iframe_wcbsel_onReceiveMsg, id: 'M_iframe_comsel', parentPath: 'M_Page_WCBSel' }),
                this.renderSidePage()
            );
            return retElem;
        }
    }]);

    return CM_Page_WCBSel;
}(React.PureComponent);

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
var VisibleCM_Page_WCBSel = ReactRedux.connect(CM_Page_WCBSel_mapstatetoprops, CM_Page_WCBSel_disptchtoprops)(CM_Page_WCBSel);

function popWCBSelector(completeCallBack) {
    var popPage_1_callback = function popPage_1_callback(popPage_1exportParam) {
        setTimeout(function () {
            completeCallBack(popPage_1exportParam.构件信息);
        }, 50);
    };
    var popPage_1entryParam = {
        callBack: popPage_1_callback
    };
    gDataCache.set('M_Page_WCBSelentryParam', popPage_1entryParam);
    init_M_Page_WCBSel();
    popPersistentPage('M_Page_WCBSel', function () {
        return React.createElement(VisibleCM_Page_WCBSel, { key: 'M_Page_WCBSel' });
    });
}