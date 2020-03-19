'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContentPanel = function (_React$PureComponent) {
    _inherits(ContentPanel, _React$PureComponent);

    function ContentPanel(props) {
        _classCallCheck(this, ContentPanel);

        var _this = _possibleConstructorReturn(this, (ContentPanel.__proto__ || Object.getPrototypeOf(ContentPanel)).call(this, props));

        var project = _this.props.project;
        var editingPage = project.getEditingPage();
        var editingControl = project.getEditingControl();
        var initState = {
            isPC: _this.props.project.designeConfig.editingType == 'PC',
            title: _this.props.project.getAttribute('title'),
            editingPage: editingPage,
            editingControl: editingControl
        };
        _this.state = initState;

        _this.watchedAttrs = ['title', 'editingType', 'editingPage'];
        _this.pageCtlRef = React.createRef();
        _this.userCtlRef = React.createRef();

        autoBind(_this);
        return _this;
    }

    _createClass(ContentPanel, [{
        key: 'toggleProjectEditingType',
        value: function toggleProjectEditingType() {
            this.props.project.toggleEditingType();
        }
    }, {
        key: 'attrChangedHandler',
        value: function attrChangedHandler(ev) {
            var _this2 = this;

            var needFresh = false;
            var changedAttrIndex = -1;
            if (typeof ev.name === 'string') {
                changedAttrIndex = this.watchedAttrs.indexOf(ev.name);
                needFresh = changedAttrIndex != -1;
            } else {
                needFresh = ev.name.find(function (attrName) {
                    changedAttrIndex = _this2.watchedAttrs.indexOf(attrName);
                    return changedAttrIndex != -1;
                }) != null;
            }
            if (needFresh) {
                var newEditingPage = this.props.project.getEditingPage();
                var editingControl = this.props.project.getEditingControl();
                var changedAttrName = this.watchedAttrs[changedAttrIndex];
                this.setState({
                    isPC: this.props.project.designeConfig.editingType == 'PC',
                    title: this.props.project.getAttribute('title'),
                    editingPage: newEditingPage,
                    editingControl: editingControl
                });
                //console.log('changedAttrName:' + changedAttrName);
                if (changedAttrName == 'editingPage' && this.props.project.designer.attributePanel) {
                    if (newEditingPage) {
                        this.props.project.designer.attributePanel.setTarget(newEditingPage);
                    } else if (editingControl) {
                        this.props.project.designer.attributePanel.setTarget(editingControl);
                    }
                }
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
        }
    }, {
        key: 'renderEditingPage',
        value: function renderEditingPage(project, editingPage, isPC) {
            if (editingPage == null) return null;
            return React.createElement(
                'div',
                { id: 'pageContainer', className: 'bg-light d-flex flex-column border border-primary flex-grow-0 flex-shrink-1 rounded ' + (isPC ? 'pcPage' : 'mobilePage') },
                React.createElement(M_Page, { project: project, ctlKernel: editingPage, isPC: isPC, ref: this.pageCtlRef, designer: this.props.designer })
            );
        }
    }, {
        key: 'renderEditingControl',
        value: function renderEditingControl(project, editingControl) {
            if (editingControl == null) return null;

            return React.createElement(
                'div',
                { id: 'pageContainer', className: 'bg-light d-flex flex-column border border-primary flex-grow-0 flex-shrink-1 mobilePage rounded' },
                React.createElement(CUserControl, { project: project, ctlKernel: editingControl, ref: this.userCtlRef, designer: this.props.designer })
            );
        }
    }, {
        key: 'changeEditingPageBtnClickHandler',
        value: function changeEditingPageBtnClickHandler(ev) {
            var target = ev.target;
            var targetPageid = target.getAttribute('pageid');
            this.props.project.setEditingPageById(targetPageid);
        }
    }, {
        key: 'changeEditingControlBtnClickHandler',
        value: function changeEditingControlBtnClickHandler(ev) {
            var target = ev.target;
            var targetCtlid = target.getAttribute('ctlid');
            this.props.project.setEditingControlById(targetCtlid);
        }
    }, {
        key: 'clickProjSettingBtnHandler',
        value: function clickProjSettingBtnHandler(ev) {
            if (this.props.project.designer.attributePanel) {
                this.props.project.designer.attributePanel.setTarget(this.props.project);
            }
        }
    }, {
        key: 'clickContentDivHander',
        value: function clickContentDivHander(ev) {
            var tNode = ev.target;
            var found = false;
            do {
                if (tNode.hasAttribute('id') && tNode.getAttribute('id') == 'pageContainer') {
                    found = true;
                    break;
                }
                tNode = tNode.parentNode;
            } while (tNode && tNode != document.body);
            if (found) {
                return;
            }
            if (this.props.project.designer.attributePanel) {
                if (this.state.editingPage) {
                    this.props.project.designer.attributePanel.setTarget(this.state.editingPage);
                } else if (this.state.editingControl) {
                    this.props.project.designer.attributePanel.setTarget(this.state.editingControl);
                }
            }
        }
    }, {
        key: 'startPlace',
        value: function startPlace(ctlKernel) {
            this.placingKernel = ctlKernel;
        }
    }, {
        key: 'endPlace',
        value: function endPlace() {
            if (this.placingKernel) {
                this.placingKernel.__placing = false;
                if (this.placingKernel.parent) {
                    this.placingKernel.fireForceRender();
                    this.props.project.designer.selectKernel(this.placingKernel);
                } else {
                    console.log('reback');
                }
                this.placingKernel = null;
            }
        }
    }, {
        key: 'placePosChanged',
        value: function placePosChanged(newPos) {

            if (this.state.editingControl) {
                this.userCtlRef.current.tryPlaceKernel(this.placingKernel, newPos);
            } else if (this.state.editingPage) {
                this.pageCtlRef.current.tryPlaceKernel(this.placingKernel, newPos);
            }
            //var $rootDiv = $(this.pageCtlRef.current);
            //console.log($thisDiv);
            //console.log(newPos);
            //console.log($rootDiv.position());
            //console.log(this.pageCtlRef.current.getBoundingClientRect());
        }
    }, {
        key: 'clickPanelNameBtn',
        value: function clickPanelNameBtn(ev) {
            this.props.wantOpenPanel(getAttributeByNode(ev.target, 'pname', true, 3));
        }
    }, {
        key: 'clickSaveBtnHanlder',
        value: function clickSaveBtnHanlder(ev) {
            var project = this.props.project;
            /*
            var jsonData =  project.getJson();
            console.log(jsonData);
            */
            project.designer.saveProject();
        }
    }, {
        key: 'clickCompileBtnHanlder',
        value: function clickCompileBtnHanlder(ev) {
            var project = this.props.project;
            var compiler = new ProjectCompiler(project);
            compiler.compile();
        }
    }, {
        key: 'clickPublickBtnHandler',
        value: function clickPublickBtnHandler(ev) {
            var project = this.props.project;
            project.logManager.clear();
            project.logManager.log('开始发布方案,结束前请不要操作本项目!');
            project.logManager.log('获取方案基础信息,');
            fetchJsonPost('server', { action: 'getProjectProfile', projTitle: project.title }, this.getProjectProfileCallBack);
        }
    }, {
        key: 'clickExprotBtnHandler',
        value: function clickExprotBtnHandler(ev) {
            var project = this.props.project;
            var jsonData = project.getJson();
            console.log(JSON.stringify(jsonData));
            /*
            var lzwCompress = window.lzwCompress;
            var t = lzwCompress.pack(jsonData);
            console.log(t);
            */
            //console.log(JSON.stringify(jsonData));
        }
    }, {
        key: 'DataSizeToString',
        value: function DataSizeToString(size) {
            var kbsize = Math.round(size / 1024);
            var sizeStr = '';
            if (kbsize < 1000) {
                sizeStr = kbsize + 'KB';
            } else {
                var mbsize = Math.round(10 * kbsize / 1024) / 10.0;
                if (mbsize < 1000) {
                    sizeStr = mbsize + 'MB';
                } else {
                    var gbsize = Math.round(10 * kbsize / 1024) / 10.0;
                    sizeStr = gbsize + 'GB';
                }
            }
            return sizeStr;
        }
    }, {
        key: 'logJsonSize',
        value: function logJsonSize(jsonObj, objName) {
            if ((typeof jsonObj === 'undefined' ? 'undefined' : _typeof(jsonObj)) != 'object') {
                return;
            }
            if (jsonObj.id) {
                objName = jsonObj.id;
            }
            if (jsonObj.code) {
                objName = jsonObj.code;
            }
            if (jsonObj.name) {
                objName += '(' + jsonObj.name + ')';
            }
            var jsonStr = window.lzwCompress.pack(jsonObj);
            //var len = JSON.stringify(jsonObj).length;
            var len = jsonStr.length;
            console.log(objName + ': ' + this.DataSizeToString(len));
            if (jsonObj.id || jsonObj.code) {
                return;
            }
            for (var n in jsonObj) {
                this.logJsonSize(jsonObj[n], n);
            }
        }
    }, {
        key: 'clickEvalSizeBtnHandler',
        value: function clickEvalSizeBtnHandler(ev) {
            var project = this.props.project;
            var jsonData = project.getJson();
            this.logJsonSize(jsonData, 'proj');
        }
    }, {
        key: 'compileCompletedHandler',
        value: function compileCompletedHandler(theCompile) {
            var project = this.props.project;
            theCompile.off('completed', this.compileCompletedHandler);
            if (theCompile.isCompleted) {
                project.logManager.log('开始上传');
                var compileResult = {
                    mbLayoutName: 'erppagetype_MA',
                    pcLayoutName: 'erppagetype_MA_PC',
                    mobilePart: theCompile.mobileContentCompiler.getString(),
                    pcPart: theCompile.pcContentCompiler.getString(),
                    serverPart: theCompile.serverSide.getString()
                };
                fetchJsonPost('server', { action: 'publishProject', projTitle: project.title, compileResult: compileResult }, this.uploadResultCallBack);
            } else {
                project.logManager.log('发布失败');
            }
        }
    }, {
        key: 'uploadResultCallBack',
        value: function uploadResultCallBack(respon) {
            var project = this.props.project;
            if (respon.success) {
                if (respon.json.err != null) {
                    project.logManager.error(respon.json.err.info);
                    project.logManager.log('发布失败！');
                    return;
                }
                project.logManager.log(respon.json.data.mobileUrl);
                project.logManager.log(respon.json.data.pcUrl);
                project.logManager.log('发布成功');
            } else {
                project.logManager.error(respon.json.err.info);
                project.logManager.log('发布失败！');
            }
        }
    }, {
        key: 'getProjectProfileCallBack',
        value: function getProjectProfileCallBack(respon) {
            var project = this.props.project;
            if (respon.success) {
                if (respon.json.err != null) {
                    project.logManager.error(respon.json.err.info);
                    project.logManager.log('发布失败！');
                    return;
                }
                project.logManager.log(JSON.stringify(respon.json.data));
                var compiler = new ProjectCompiler(project, respon.json.data);
                compiler.on('completed', this.compileCompletedHandler);
                compiler.compile();
            } else {
                project.logManager.error(respon.json.err.info);
                project.logManager.log('发布失败！');
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var project = this.props.project;
            var isPC = this.state.isPC;
            var editingPage = this.state.editingPage;
            var editingControl = this.state.editingControl;
            return React.createElement(
                'div',
                { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column' },
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 d-flex bg-secondary projectContentHeader align-items-center' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex justify-content-center align-items-center text-light' },
                        React.createElement(
                            'h4',
                            null,
                            this.state.title
                        ),
                        React.createElement('button', { type: 'button', onClick: this.clickProjSettingBtnHandler, className: 'btn btn-sm icon icon-gear bg-secondary ml-1' }),
                        React.createElement(
                            'button',
                            { type: 'button', className: "ml-1 p-0 btn btn-secondary dropdown-toggle dropdown-toggle-split", 'data-toggle': 'dropdown' },
                            React.createElement(
                                'div',
                                { className: "badge badge-pill ml-1 badge-" + (isPC ? "danger" : "success") },
                                isPC ? "电脑版" : "手机版"
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'dropdown-menu' },
                            React.createElement(
                                'button',
                                { onClick: this.toggleProjectEditingType, className: 'dropdown-item', type: 'button' },
                                isPC ? '切换手机版' : '切换电脑版'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-0 flex-shrink-1' },
                        React.createElement(
                            'button',
                            { type: 'button', className: "p-0 btn btn-secondary dropdown-toggle", 'data-toggle': 'dropdown' },
                            editingPage ? editingPage.title : editingControl ? '控件:' + editingControl.name : '暂无页面'
                        ),
                        React.createElement(
                            'div',
                            { className: 'dropdown-menu' },
                            (isPC ? project.content_PC.pages : project.content_Mobile.pages).map(function (page) {
                                return page == editingPage ? null : React.createElement(
                                    'button',
                                    { key: page.id, onClick: _this3.changeEditingPageBtnClickHandler, className: 'dropdown-item', type: 'button', pageid: page.id },
                                    page.title
                                );
                            }),
                            React.createElement('div', { className: 'dropdown-divider' }),
                            project.userControls_arr.map(function (userCtl) {
                                return userCtl == editingControl ? null : React.createElement(
                                    'button',
                                    { key: userCtl.id, onClick: _this3.changeEditingControlBtnClickHandler, className: 'dropdown-item bg-warning', type: 'button', ctlid: userCtl.id },
                                    userCtl.name
                                );
                            })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1 minh-0' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0 flex-column' },
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickPanelNameBtn, pname: 'datamaster' },
                            React.createElement(
                                'div',
                                null,
                                '\u6570\u636E'
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u5927\u5E08'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickPanelNameBtn, pname: 'scriptmaster' },
                            React.createElement(
                                'div',
                                null,
                                '\u811A\u672C'
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u5927\u5E08'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickPanelNameBtn, pname: 'flowmaster' },
                            React.createElement(
                                'div',
                                null,
                                '\u6D41\u7A0B'
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u5927\u5E08'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickCompileBtnHanlder },
                            React.createElement(
                                'div',
                                null,
                                '\u7F16\u8BD1'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickSaveBtnHanlder },
                            React.createElement(
                                'div',
                                null,
                                '\u4FDD\u5B58'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickPublickBtnHandler },
                            React.createElement(
                                'div',
                                null,
                                '\u53D1\u5E03'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickExprotBtnHandler },
                            React.createElement(
                                'div',
                                null,
                                '\u5BFC\u51FA'
                            )
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-sm bg-dark text-light', onClick: this.clickEvalSizeBtnHandler },
                            React.createElement(
                                'div',
                                null,
                                '\u8BC4\u4F30'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { onClick: this.clickContentDivHander, className: 'flex-grow-1 flex-shrink-1 autoScroll d-flex width-1 p-5' },
                        editingPage && this.renderEditingPage(project, editingPage, isPC),
                        editingControl && this.renderEditingControl(project, editingControl)
                    )
                )
            );
        }
    }]);

    return ContentPanel;
}(React.PureComponent);