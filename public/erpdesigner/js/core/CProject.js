'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CProjectAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('页面名称', 'title', ValueType.String, true), new CAttribute('真实名称', 'realName', ValueType.String, false), new CAttribute('DEBUG模式', 'debugmode', ValueType.Boolean, false)]), new CAttributeGroup('顶层设置', [new CAttribute('样式', AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true), new CAttribute('类', AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true)])]
};

var projNames_project = {};
function genProjectName() {
    var rlt = '';
    for (var i = 1; i < 999; ++i) {
        rlt = 'PROJ_' + i;
        if (projNames_project[rlt] == null) break;
    }
    projNames_project[rlt] = 1;
    return rlt;
}

var CProject = function (_IAttributeable) {
    _inherits(CProject, _IAttributeable);

    function CProject(title, jsonData) {
        _classCallCheck(this, CProject);

        var _this = _possibleConstructorReturn(this, (CProject.__proto__ || Object.getPrototypeOf(CProject)).call(this, {
            title: title
        }, null, '方案'));

        var self = _this;
        autoBind(self);
        _this.loaded = false;
        _this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        _this.defaultNameCounter = {};
        _this.controlName_map = {};
        _this.controlId_map = {};
        _this.cacheState = {};
        _this.dataMaster = new DataMaster(_this);
        _this.scriptMaster = new ScriptMaster(_this);
        _this.project = _this;
        _this.userControls_arr = [];

        var designeConfig = {
            name: genProjectName(),
            editingType: jsonData == null || jsonData.editingType == null ? 'MB' : jsonData.editingType,
            editingPage: {
                mbid: jsonData == null || jsonData.lastEditingMBPageID == null ? -1 : jsonData.lastEditingMBPageID,
                pcid: jsonData == null || jsonData.lastEditingPCPageID == null ? -1 : jsonData.lastEditingPCPageID,
                id: jsonData == null ? -1 : jsonData.lastEditingPageID
            },
            description: '页面',
            editingControl: {
                id: jsonData == null ? -1 : jsonData.lastEditingControlID
            }
        };
        _this.designeConfig = designeConfig;

        _this.content_PC = {
            pages: []
        };

        _this.content_Mobile = {
            pages: []
        };

        _this.logManager = new LogManager(_this.designeConfig.name + '_lm');

        if (jsonData == null) {
            var mainPage = new M_PageKernel(null, _this);
            mainPage.project = _this;
            mainPage.set_ismain(true);
            mainPage.set_title('主页面');
            _this.content_Mobile.pages.push(mainPage);
        } else {
            if (jsonData.attr != null) {
                Object.assign(_this, jsonData.attr);
            }
            var restoreHelper = new RestoreHelper(jsonData.dictionary);
            _this.dataMaster.restoreFromJson(jsonData.dataMaster, restoreHelper);
            _this.scriptMaster.restoreFromJson(jsonData.scriptMaster, restoreHelper);

            var usertemplateCreatioinHelper = new CtlKernelCreationHelper();
            usertemplateCreatioinHelper.restoreHelper = restoreHelper;
            if (jsonData.userControls_arr) {
                jsonData.userControls_arr.forEach(function (ctlJson) {
                    ctlJson.restoreHelper = restoreHelper;
                    var newUCtl = new UserControlKernel({ project: _this }, null, usertemplateCreatioinHelper, ctlJson);
                    _this.userControls_arr.push(newUCtl);
                });

                jsonData.userControls_arr.forEach(function (ctlJson, index) {
                    _this.userControls_arr[index].__restoreChildren(usertemplateCreatioinHelper, ctlJson);
                });
            }

            var self = _this;
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            ctlCreatioinHelper.restoreHelper = restoreHelper;
            var newPage;
            jsonData.content_Mobile.pages.forEach(function (pageJson) {
                pageJson.restoreHelper = restoreHelper;
                newPage = new M_PageKernel({}, _this, ctlCreatioinHelper, pageJson);
                newPage.ispcPage = false;
                _this.content_Mobile.pages.push(newPage);
            });

            jsonData.content_PC.pages.forEach(function (pageJson) {
                pageJson.restoreHelper = restoreHelper;
                newPage = new M_PageKernel({}, _this, ctlCreatioinHelper, pageJson);
                newPage.ispcPage = true;
                _this.content_PC.pages.push(newPage);
            });
        }
        _this.sortPCPages();
        _this.sortMBPages();
        _this.sortUC();
        _this.loaded = true;
        _this.emit('loaded');
        _this.logManager.log('加载完成');
        return _this;
    }

    _createClass(CProject, [{
        key: 'sortPageFun',
        value: function sortPageFun(a, b) {
            return a.title.localeCompare(b.title);
        }
    }, {
        key: 'sortUCFun',
        value: function sortUCFun(a, b) {
            return a.name.localeCompare(b.name);
        }
    }, {
        key: 'sortPCPages',
        value: function sortPCPages() {
            this.content_PC.pages.sort(this.sortPageFun);
        }
    }, {
        key: 'sortMBPages',
        value: function sortMBPages() {
            this.content_Mobile.pages.sort(this.sortPageFun);
        }
    }, {
        key: 'sortUC',
        value: function sortUC() {
            this.userControls_arr.sort(this.sortUCFun);
        }
    }, {
        key: 'mainPageChanged',
        value: function mainPageChanged(pagekernel) {
            var index = this.content_PC.pages.indexOf(pagekernel);
            if (index != -1) {
                this.content_PC.pages.forEach(function (pk) {
                    if (pk != pagekernel) {
                        pk.__setAttribute(AttrNames.IsMain, false);
                    }
                });
            } else {
                index = this.content_Mobile.pages.indexOf(pagekernel);
                if (index != -1) {
                    this.content_Mobile.pages.forEach(function (pk) {
                        if (pk != pagekernel) {
                            pk.__setAttribute(AttrNames.IsMain, false);
                        }
                    });
                }
            }
        }
    }, {
        key: 'getLayoutConfig',
        value: function getLayoutConfig(classAttrName, styleAttrName) {
            var _this2 = this;

            var rlt = new ControlLayoutConfig();
            var apdAttrList = this.getAttrArrayList(classAttrName ? classAttrName : AttrNames.LayoutNames.APDClass);
            var self = this;
            apdAttrList.forEach(function (attrArrayItem) {
                var val = _this2.getAttribute(attrArrayItem.name);
                rlt.addClass(val);
            });

            var styleAttrList = this.getAttrArrayList(styleAttrName ? styleAttrName : AttrNames.LayoutNames.StyleAttr);
            styleAttrList.forEach(function (attrArrayItem) {
                var val = _this2.getAttribute(attrArrayItem.name);
                if (val != null && !IsEmptyString(val.name) && !IsEmptyString(val.value)) {
                    var styleName = val.name;
                    var styleValue = val.value;
                    switch (styleName) {
                        case AttrNames.StyleAttrNames.Width:
                        case AttrNames.StyleAttrNames.Height:
                            {
                                styleValue = isNaN(styleValue) ? styleValue : styleValue + 'px';
                                break;
                            }
                        case AttrNames.StyleAttrNames.FlexGrow:
                            {
                                rlt.addSwitchClass(AttrNames.StyleAttrNames.FlexGrow, styleValue ? 1 : 0);
                                styleName = null;
                                break;
                            }
                        case AttrNames.StyleAttrNames.FlexShrink:
                            {
                                rlt.addSwitchClass(AttrNames.StyleAttrNames.FlexShrink, styleValue ? 1 : 0);
                                styleName = null;
                                break;
                            }
                    }

                    if (styleName != null) {
                        rlt.addStyle(styleName, styleValue);
                    }
                }
            });
            return rlt;
        }
    }, {
        key: 'addUserControl',
        value: function addUserControl(name) {
            name = name.trim();
            if (name.length < 2 || name.length > 20) {
                return null;
            }
            var foundItem = this.userControls_arr.find(function (x) {
                return x.name == name;
            });
            if (foundItem != null) {
                return null;
            }
            var newID = 'UserControl';
            var ki = 0;
            do {
                newID = 'UserControl_T' + ki;
                foundItem = this.userControls_arr.find(function (x) {
                    return x.id == newID;
                });
                if (foundItem == null) {
                    break;
                }
                ki++;
            } while (ki < 1000);
            var newControl = new UserControlKernel({ id: newID, name: name, project: this }, null);
            this.userControls_arr.push(newControl);
            this.emit('userControlChanged');
            return newControl;
        }
    }, {
        key: 'deleteUserControl',
        value: function deleteUserControl(userCtlKernel) {
            var index = this.userControls_arr.indexOf(userCtlKernel);
            if (index == -1) {
                return;
            }
            var instances_arr = this.getControlsByType(UserControlKernel_Type).filter(function (p) {
                return p.refID == userCtlKernel.id;
            });
            var hadIntanceSelected = false;
            var selectedKernel = this.designer.getSelectedKernel();
            instances_arr.forEach(function (instance) {
                if (instance.isAEditor()) {
                    instance.parent.setAttribute(AttrNames.EditorType, M_TextKernel_Type);
                } else {
                    instance.parent.removeChild(instance);
                }
                if (!hadIntanceSelected && selectedKernel == instance) {
                    hadIntanceSelected = true;
                }
            });
            this.userControls_arr.splice(index, 1);
            var self = this;
            var targetOpened = this.designeConfig.editingControl.id == userCtlKernel.id;
            this.unRegisterControl(userCtlKernel);
            setTimeout(function () {
                self.emit('userControlChanged');
                if (targetOpened) {
                    self.setEditingPageById(-1);
                }
                if (hadIntanceSelected) {
                    self.designer.selectKernel(null);
                }
            }, 100);
        }
    }, {
        key: 'getEditingControl',
        value: function getEditingControl() {
            return this.getUserControlById(this.designeConfig.editingControl.id);
        }
    }, {
        key: 'getUserControlById',
        value: function getUserControlById(id) {
            return this.userControls_arr.find(function (x) {
                return x.id == id;
            });
        }
    }, {
        key: 'setEditingControlById',
        value: function setEditingControlById(ctlID) {
            this.designeConfig.editingPage.id = -1;
            this.designeConfig.editingControl.id = ctlID;
            this.attrChanged('editingPage');
        }
    }, {
        key: 'registerControl',
        value: function registerControl(ctlKernel) {
            var useID = ctlKernel.id;
            var registedCtl = this.getControlById(useID);
            if (registedCtl == ctlKernel) {
                console.warn(useID + ' 重复注册');
            } else if (registedCtl != null) {
                console.warn(useID + ' 已被占用');
                useID = null;
            }
            var ctlType = ctlKernel.type;
            if (IsEmptyString(useID)) {
                if (ctlType == UserControlKernel_Type) {
                    ctlType = ctlKernel.refID == null ? 'UserControl_T' : 'UserControl';
                }
                for (var i = 0; i < 9999; ++i) {
                    useID = ctlType + '_' + i;
                    if (this.getControlById(useID) == null) {
                        break;
                    }
                }
            } else {
                if (ctlType == UserControlKernel_Type) {
                    useID = useID[0].toUpperCase() + useID.substring(1, useID.length);
                }
            }
            ctlKernel.id = useID;
            this.controlId_map[useID] = ctlKernel;
        }
    }, {
        key: 'unRegisterControl',
        value: function unRegisterControl(ctlKernel) {
            var _this3 = this;

            var clearData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var useID = ctlKernel.id;
            var registedCtl = this.getControlById(useID);
            if (registedCtl == null) {
                return true;
            }
            delete this.controlId_map[useID];

            if (clearData) {
                var useBPs_arr = this.scriptMaster.getBPsByControlKernel(useID);
                useBPs_arr.forEach(function (bp) {
                    _this3.scriptMaster.deleteBP(bp);
                });
            }
        }
    }, {
        key: 'getControlById',
        value: function getControlById(id) {
            return this.controlId_map[id];
        }
    }, {
        key: 'getControlByName',
        value: function getControlByName(name) {
            return this.controlName_map[name];
        }
    }, {
        key: 'genControlName2',
        value: function genControlName2(prefix) {
            if (prefix == null) {
                console.warn('genNodeId参数不能为空');
                return;
            }
            var testI = 0;
            var useID = '';
            while (testI < 9999) {
                useID = prefix + '_' + testI;
                if (this.controlName_map[useID] == null) {
                    break;
                }
                ++testI;
            }
            return useID;
        }
    }, {
        key: 'getControlsByType',
        value: function getControlsByType(theType) {
            var isArray = Array.isArray(theType);
            var rlt_arr = [];
            for (var id in this.controlId_map) {
                var ctl = this.controlId_map[id];
                if (ctl) {
                    var hit = false;
                    if (isArray) {
                        hit = theType.indexOf(ctl.type) != -1;
                    } else {
                        hit = ctl.type == theType;
                    }
                    if (hit) {
                        rlt_arr.push(ctl);
                    }
                }
            }
            return rlt_arr;
        }
    }, {
        key: 'getUserControlByUUID',
        value: function getUserControlByUUID(uuid) {
            return this.userControls_arr.find(function (t) {
                return t.uuid == uuid;
            });
        }
    }, {
        key: 'createKernalByType',
        value: function createKernalByType(ctlType) {
            var ctlConfig = DesignerConfig.findConfigByType(ctlType);
            if (ctlConfig == null) {
                console.warn('找不到ctl type:' + ctlType + '的config');
                return null;
            }
            return new ctlConfig.kernelClass({}, this);
        }
    }, {
        key: 'setEditingPageById',
        value: function setEditingPageById(pageID) {
            var thePage = this.getPageById(pageID);
            //if(thePage == null)
            //return false;
            this.designeConfig.editingControl.id = -1;
            this.designeConfig.editingPage.id = pageID;
            this.attrChanged('editingPage');
            if (thePage) {
                this.setEditingType(!thePage.ispcPage ? 'MB' : 'PC');
            }
        }
    }, {
        key: 'getPageById',
        value: function getPageById(pageID) {
            var rlt = this.content_PC.pages.find(function (item) {
                return item.id == pageID;
            });
            if (rlt == null) {
                rlt = this.content_Mobile.pages.find(function (item) {
                    return item.id == pageID;
                });
            }
            return rlt;
        }
    }, {
        key: 'deletePage',
        value: function deletePage(pageID) {
            var thePage = this.getPageById(pageID);
            if (thePage == null) {
                return;
            }
            var index = this.content_PC.pages.indexOf(thePage);
            if (index != -1) {
                this.content_PC.pages.splice(index, 1);
            } else {
                index = this.content_Mobile.pages.indexOf(thePage);
                if (index != -1) {
                    this.content_Mobile.pages.splice(index, 1);
                }
            }
            if (this.designeConfig.editingPage.id == pageID) {
                this.setEditingPageById(-1);
            }
        }
    }, {
        key: 'createEmptyPage',
        value: function createEmptyPage(isPC) {
            var newPage = new M_PageKernel(null, this);
            newPage.project = this;
            newPage.set_ismain(false);
            var newTitle;
            for (var i = 1; i < 999; ++i) {
                var hadItem = null;
                newTitle = (!isPC ? '手机页面_' : 'PC页面_') + i;
                if (isPC) {
                    hadItem = this.content_PC.pages.find(function (item) {
                        return item.getAttribute('title') == newTitle;
                    });
                } else {
                    hadItem = this.content_Mobile.pages.find(function (item) {
                        return item.getAttribute('title') == newTitle;
                    });
                }
                if (hadItem == null) {
                    break;
                }
            }
            newPage.set_title(newTitle);
            if (isPC) {
                this.content_PC.pages.push(newPage);
            } else {
                this.content_Mobile.pages.push(newPage);
            }
            newPage.ispcPage = isPC;
            return newPage;
        }
    }, {
        key: 'getUnUserPageID',
        value: function getUnUserPageID() {
            var useID = null;
            for (var i = 1; i < 999; ++i) {
                useID = M_PageKernel_Type + '_' + i;
                if (this.getPageById(useID) == null) {
                    return useID;
                }
            }
        }
    }, {
        key: 'getAllPages',
        value: function getAllPages(isPC) {
            if (isPC == null) {
                isPC = this.designeConfig.editingType == 'PC';
            }
            return isPC ? this.content_PC.pages : this.content_Mobile.pages;
        }
    }, {
        key: 'getUseFlowSteps',
        value: function getUseFlowSteps() {
            var rlt = [];
            this.content_PC.pages.forEach(function (page) {
                page.getUseFlowSteps().forEach(function (flowStep) {
                    if (rlt.indexOf(flowStep) == -1) {
                        rlt.push(flowStep);
                    }
                });
            });
            this.content_Mobile.pages.forEach(function (page) {
                page.getUseFlowSteps().forEach(function (flowStep) {
                    if (rlt.indexOf(flowStep) == -1) {
                        rlt.push(flowStep);
                    }
                });
            });
            return rlt;
        }
    }, {
        key: 'getPopablePages',
        value: function getPopablePages(isPC) {
            if (isPC == null) {
                isPC = this.designeConfig.editingType == 'PC';
            }
            return isPC ? this.content_PC.pages.filter(function (page) {
                return page.getAttribute(AttrNames.PopablePage) == true;
            }) : this.content_Mobile.pages.filter(function (page) {
                return page.getAttribute(AttrNames.PopablePage) == true;
            });
            //return isPC ? this.content_PC.pages : this.content_Mobile.pages;
        }
    }, {
        key: 'getJumpablePages',
        value: function getJumpablePages(isPC) {
            if (isPC == null) {
                isPC = this.designeConfig.editingType == 'PC';
            }
            return isPC ? this.content_PC.pages.filter(function (page) {
                return page.getAttribute(AttrNames.PopablePage) != true;
            }) : this.content_Mobile.pages.filter(function (page) {
                return page.getAttribute(AttrNames.PopablePage) != true;
            });
        }
    }, {
        key: 'getEditingPage',
        value: function getEditingPage() {
            return this.getPageById(this.designeConfig.editingPage.id);
        }
    }, {
        key: 'setEditingType',
        value: function setEditingType(newValue) {
            var nowValue = this.designeConfig.editingType;
            var editingPage = this.getEditingPage();
            if (newValue == nowValue) {
                return;
            }
            if (nowValue == 'PC') {
                if (editingPage) {
                    this.designeConfig.editingPage.pcid = editingPage.id;
                }
            } else {
                if (editingPage) {
                    this.designeConfig.editingPage.mbid = editingPage.id;
                }
            }
            this.designeConfig.editingType = newValue == 'PC' ? 'PC' : 'MB';
            var restorePage = null;
            if (newValue == 'PC') {
                restorePage = this.getPageById(this.designeConfig.editingPage.pcid);
                if (restorePage && !restorePage.ispcPage) {
                    restorePage = null;
                }
            } else {
                restorePage = this.getPageById(this.designeConfig.editingPage.mbid);
                if (restorePage && restorePage.ispcPage) {
                    restorePage = null;
                }
            }
            this.setEditingPageById(restorePage ? restorePage.id : -1);
            this.attrChanged('editingType');
        }
    }, {
        key: 'toggleEditingType',
        value: function toggleEditingType() {
            this.setEditingType(this.designeConfig.editingType == 'PC' ? 'MB' : 'PC');
            return true;
        }
    }, {
        key: 'getNowEditingType',
        value: function getNowEditingType() {
            return this.designeConfig.editingType;
        }
    }, {
        key: 'set_title',
        value: function set_title(newtitle) {
            if (newtitle.length > 8) {
                newtitle = newtitle.substring(0, 8);
            }
            if (this.__setAttribute(AttrNames.Title, newtitle)) {
                this.attrChanged([AttrNames.Title, AttrNames.RealName]);
                return true;
            }
            return false;
        }
    }, {
        key: 'get_realName',
        value: function get_realName() {
            return this.getAttribute(AttrNames.Title) + 'Real';
        }
    }, {
        key: 'getJson',
        value: function getJson(jsonProf) {
            if (jsonProf == null) {
                jsonProf = new AttrJsonProfile();
            }
            //jsonProf.hadDictionary = true;
            var attrJson = _get(CProject.prototype.__proto__ || Object.getPrototypeOf(CProject.prototype), 'getJson', this).call(this, jsonProf);
            var rlt = {
                attr: attrJson,
                editingType: this.designeConfig.editingType,
                lastEditingPageID: this.designeConfig.editingPage.id,
                lastEditingPCPageID: this.designeConfig.editingPage.pcid,
                lastEditingMBPageID: this.designeConfig.editingPage.mbid,
                lastEditingControlID: this.designeConfig.editingControl.id
            };
            rlt.content_PC = {
                pages: []
            };
            this.content_PC.pages.forEach(function (page) {
                rlt.content_PC.pages.push(page.getJson(jsonProf));
            });

            rlt.content_Mobile = {
                pages: []
            };
            this.content_Mobile.pages.forEach(function (page) {
                rlt.content_Mobile.pages.push(page.getJson(jsonProf));
            });
            rlt.userControls_arr = this.userControls_arr.map(function (ctl) {
                return ctl.getJson(jsonProf);
            });
            rlt.dataMaster = this.dataMaster.getJson(jsonProf);
            rlt.scriptMaster = this.scriptMaster.getJson(jsonProf);
            rlt.useEntities_arr = jsonProf.entities_arr.map(function (entity) {
                return entity.code;
            });
            //rlt.dictionary = jsonProf.getDictionaryObj();
            return rlt;
        }
    }, {
        key: 'copyKernel',
        value: function copyKernel(theKernel) {
            var _this4 = this;

            if (theKernel == null) {
                return;
            }
            var copyResult = {
                project: this,
                cusDS_arr: [],
                scripts_arr: [],
                userControls_arr: [],
                controlsID_map: {},
                refControlID_map: {},
                targetControl: null,
                cusObjects_arr: []
            };
            var controlJsonProf = new AttrJsonProfile();
            var controlJson = null;
            if (theKernel.parent == null) {
                if (theKernel.type == UserControlKernel_Type) {
                    controlJsonProf.useUserControl(theKernel);
                    controlJson = {
                        type: UserControlKernel_Type
                    };
                }
                if (theKernel.type == M_PageKernel_Type) {
                    controlJson = theKernel.getJson(controlJsonProf);
                    controlJson.ispcPage = theKernel.ispcPage;
                }
            } else {
                controlJson = theKernel.getJson(controlJsonProf);
            }
            var si;
            var ctlid;
            var meetCusDS_map = {};
            var meetScript_map = {};
            var meetUserControl_map = {};
            var copyCusDS = function copyCusDS(cusEntity, cusDS_arr, refControl_map) {
                if (meetCusDS_map[cusEntity.code]) {
                    return;
                }
                meetCusDS_map[cusEntity.code] = 1;
                var cusDSJsonProf = new AttrJsonProfile();
                var dsJson = cusEntity.getJson(cusDSJsonProf);
                cusDSJsonProf.customDS_arr.forEach(function (entity) {
                    if (entity.isCustomDS) {
                        copyCusDS(entity, cusDS_arr, refControl_map);
                    }
                });
                if (refControl_map) {
                    for (var rcid in cusDSJsonProf.refControl_map) {
                        refControl_map[rcid] = cusDSJsonProf.refControl_map[rcid].type;
                    }
                }
                cusDS_arr.push(dsJson);
            };

            controlJsonProf.customObjects_arr.forEach(function (cusobj) {
                if (copyResult.cusObjects_arr.indexOf(cusobj) == -1) {
                    copyResult.cusObjects_arr.push(cusobj);
                }
            });

            controlJsonProf.customDS_arr.forEach(function (entity) {
                if (entity.isCustomDS) {
                    copyCusDS(entity, copyResult.cusDS_arr, copyResult.refControlID_map);
                }
            });

            var copyScript = function copyScript(scriptBP, scripts_arr, cusDS_arr, refControl_map) {
                if (meetScript_map[scriptBP.code]) {
                    return;
                }
                meetScript_map[scriptBP.code] = 1;
                var scriptJsonProf = new AttrJsonProfile();
                var scriptJson = scriptBP.getJson(scriptJsonProf);
                scriptJsonProf.customObjects_arr.forEach(function (cusobj) {
                    if (copyResult.cusObjects_arr.indexOf(cusobj) == -1) {
                        copyResult.cusObjects_arr.push(cusobj);
                    }
                });
                scriptJsonProf.customDS_arr.forEach(function (entity) {
                    if (entity.isCustomDS) {
                        copyCusDS(entity, cusDS_arr, refControl_map);
                    }
                });
                scriptJsonProf.useScript_arr.forEach(function (tScriptBP) {
                    copyScript(tScriptBP, scripts_arr, cusDS_arr, refControl_map);
                });
                if (refControl_map) {
                    for (var rcid in scriptJsonProf.refControl_map) {
                        refControl_map[rcid] = scriptJsonProf.refControl_map[rcid].type;
                    }
                }
                scripts_arr.push(scriptJson);
            };

            controlJsonProf.useScript_arr.forEach(function (scriptBP) {
                copyScript(scriptBP, copyResult.scripts_arr, copyResult.cusDS_arr, copyResult.refControlID_map);
            });

            for (ctlid in controlJsonProf.useControl_map) {
                var ctlType = controlJsonProf.useControl_map[ctlid].type;
                if (copyResult.controlsID_map[ctlType] == null) {
                    copyResult.controlsID_map[ctlType] = [];
                }
                copyResult.controlsID_map[ctlType].push(ctlid);
                var useScripteBP_arr = this.scriptMaster.getBPsByControlKernel(ctlid);
                useScripteBP_arr.forEach(function (scriptBP) {
                    copyScript(scriptBP, copyResult.scripts_arr, copyResult.cusDS_arr, copyResult.refControlID_map);
                });
            }

            var copyUserControl = function copyUserControl(UCKernel) {
                if (meetUserControl_map[UCKernel.id]) {
                    return;
                }
                var userCtlProfile = {
                    controlsID_map: {},
                    scripts_arr: [],
                    cusDS_arr: [],
                    refControlID_map: {}
                };
                meetUserControl_map[UCKernel.id] = 1;
                var UCJsonProf = new AttrJsonProfile();
                var UCJson = UCKernel.getJson(UCJsonProf);

                UCJsonProf.customObjects_arr.forEach(function (cusobj) {
                    if (copyResult.cusObjects_arr.indexOf(cusobj) == -1) {
                        copyResult.cusObjects_arr.push(cusobj);
                    }
                });

                UCJsonProf.customDS_arr.forEach(function (entity) {
                    if (entity.isCustomDS) {
                        copyCusDS(entity, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                    }
                });

                UCJsonProf.useScript_arr.forEach(function (scriptBP) {
                    copyScript(scriptBP, copyResult.scripts_arr, copyResult.cusDS_arr, copyResult.refControlID_map);
                });

                for (ctlid in UCJsonProf.useControl_map) {
                    var ctlType = UCJsonProf.useControl_map[ctlid].type;
                    if (userCtlProfile.controlsID_map[ctlType] == null) {
                        userCtlProfile.controlsID_map[ctlType] = [];
                    }
                    userCtlProfile.controlsID_map[ctlType].push(ctlid);
                    var useScripteBP_arr = _this4.scriptMaster.getBPsByControlKernel(ctlid);
                    useScripteBP_arr.forEach(function (scriptBP) {
                        copyScript(scriptBP, userCtlProfile.scripts_arr, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                    });
                }

                UCJsonProf.meetUserControlSeq_arr.reverse().forEach(function (uctl) {
                    copyUserControl(uctl);
                });
                userCtlProfile.jsonData = UCJson;
                copyResult.userControls_arr.push(userCtlProfile);
            };

            controlJsonProf.meetUserControlSeq_arr.reverse().forEach(function (uctl) {
                copyUserControl(uctl);
            });
            copyResult.targetControl = controlJson;
            return copyResult;
        }
    }, {
        key: 'pasteKernel',
        value: function pasteKernel(copiedData, parentKernel, targetIndex) {
            var _this5 = this;

            var bOverwrite = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var copyFromThisProject = copiedData.project == this;
            if (!copyFromThisProject) {
                copiedData.cusObjects_arr.forEach(function (cusObj) {
                    _this5.scriptMaster.smartAddCusObj(cusObj);
                });
            }

            var ctlID;
            var oldID;
            var useUUID;
            var goodJson;
            var si;
            var i;
            var ctlType;
            var aidControlId_map = Object.assign({}, this.controlId_map);
            var renameContrls_map = {};
            var renameCusDS_map = {};
            var useControlsID_all = {};
            var isPastePage = false;
            if (parentKernel == null) {
                if (copiedData.targetControl.type == UserControlKernel_Type) {
                    if (copyFromThisProject) {
                        if (!bOverwrite) {
                            // 来自本项目的克隆
                            copyFromThisProject = false;
                        }
                    }
                } else if (copiedData.targetControl.type == M_PageKernel_Type) {
                    isPastePage = true;
                    var newPageid = this.getUnUserPageID();
                    //renameContrls_map[copiedData.targetControl.id] = newPageid;
                }
            }

            for (ctlType in copiedData.controlsID_map) {
                copiedData.controlsID_map[ctlType].forEach(function (ctlID) {
                    useControlsID_all[ctlID] = 1;
                });
            }
            copiedData.userControls_arr.forEach(function (UCJson) {
                useControlsID_all[UCJson.id] = 1;
            });
            for (var rcid in copiedData.refControlID_map) {
                if (useControlsID_all[rcid] == null) {
                    renameContrls_map[rcid] = '';
                }
            }
            for (ctlType in copiedData.controlsID_map) {
                copiedData.controlsID_map[ctlType].forEach(function (ctlID) {
                    if (aidControlId_map[ctlID] != null) {
                        var newID = '';
                        for (i = 0; i < 9999; ++i) {
                            newID = ctlType + '_' + i;
                            if (aidControlId_map[newID] == null) {
                                if (useControlsID_all[newID] == null) {
                                    break;
                                }
                            }
                        }
                        aidControlId_map[newID] = 1;
                        renameContrls_map[ctlID] = newID;
                    }
                });
            }

            var replaceIDChangedInJsonString = function replaceIDChangedInJsonString(pJsonStr) {
                for (oldID in renameContrls_map) {
                    pJsonStr = pJsonStr.replace(new RegExp(doubleQuotesStr(oldID), 'g'), doubleQuotesStr(renameContrls_map[oldID]));
                    if (renameContrls_map[oldID].length > 0) {
                        pJsonStr = pJsonStr.replace(new RegExp(oldID + '_', 'g'), renameContrls_map[oldID] + '_');
                    }
                }
                for (oldID in renameCusDS_map) {
                    pJsonStr = pJsonStr.replace(new RegExp(doubleQuotesStr(oldID), 'g'), doubleQuotesStr(renameCusDS_map[oldID]));
                }
                return pJsonStr;
            };

            var needPasteCusDS_arr = copiedData.cusDS_arr.concat();
            var needPasteScripts_arr = copiedData.scripts_arr.concat();

            if (!copyFromThisProject) {
                copiedData.userControls_arr.forEach(function (userCtlProfile) {
                    var UCJson = userCtlProfile.jsonData;
                    var hadUserControl = _this5.getUserControlByUUID(UCJson.uuid);
                    if (hadUserControl) {
                        if (hadUserControl.id != UCJson.id) {
                            renameContrls_map[UCJson.id] = hadUserControl.id;
                        }
                        if (!bOverwrite) {
                            return;
                        }
                    } else if (aidControlId_map[UCJson.id] != null) {
                        var newID = '';
                        for (i = 0; i < 9999; ++i) {
                            newID = 'UserControl_T' + i;
                            if (aidControlId_map[newID] == null) {
                                if (useControlsID_all[newID] == null) {
                                    break;
                                }
                            }
                        }
                        aidControlId_map[newID] = 1;
                        renameContrls_map[UCJson.id] = newID;
                    }
                    needPasteCusDS_arr = needPasteCusDS_arr.concat(userCtlProfile.cusDS_arr);
                    needPasteScripts_arr = needPasteScripts_arr.concat(userCtlProfile.scripts_arr);

                    for (ctlType in userCtlProfile.controlsID_map) {
                        userCtlProfile.controlsID_map[ctlType].forEach(function (ctlID) {
                            if (aidControlId_map[ctlID] != null && ctlID != UCJson.id) {
                                if (hadUserControl) {
                                    // 看看是否是同一个自订控件中的，是的话就不要改名了
                                    var ctlBelongUserControl = aidControlId_map[ctlID].searchParentKernel(UserControlKernel_Type, true);
                                    if (ctlBelongUserControl == hadUserControl) {
                                        return;
                                    }
                                }
                                var newID = '';
                                for (i = 0; i < 9999; ++i) {
                                    newID = ctlType + '_' + i;
                                    if (aidControlId_map[newID] == null) {
                                        if (useControlsID_all[newID] == null) {
                                            break;
                                        }
                                    }
                                }
                                aidControlId_map[newID] = 1;
                                renameContrls_map[ctlID] = newID;
                            }
                        });
                    }
                });
            }

            var aidEntityCode_map = {};
            this.dataMaster.BP_sql_arr.forEach(function (bp) {
                aidEntityCode_map[bp.code] = 1;
            });
            if (!copyFromThisProject) {
                var useDSID_all = {};
                needPasteCusDS_arr.forEach(function (cusDSBP) {
                    useDSID_all[cusDSBP.code] = 1;
                });
                needPasteCusDS_arr.forEach(function (cusDSBP) {
                    if (cusDSBP.group == 'custom') {
                        if (copyFromThisProject) {
                            return; // 从本方案里来的，自订数据源已经存在了肯定
                        }
                        var hadSqlBp = _this5.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
                        if (hadSqlBp) {
                            if (cusDSBP.code != hadSqlBp.code) {
                                renameCusDS_map[cusDSBP.code] = hadSqlBp.code;
                            }
                            return;
                        }
                        if (aidEntityCode_map[cusDSBP.code] != null) {
                            for (i = 0; i < 9999; ++i) {
                                var useCode = 'sqlBP_' + i;
                                if (aidEntityCode_map[useCode] == null && useDSID_all[useCode] == null) {
                                    aidEntityCode_map[useCode] = 1;
                                    renameCusDS_map[cusDSBP.code] = useCode;
                                    break;
                                }
                            }
                        }
                    }
                });
            }

            needPasteCusDS_arr.forEach(function (cusDSBP) {
                useUUID = cusDSBP.uuid;
                var hadSqlBp = null;
                if (cusDSBP.group == 'custom') {
                    if (copyFromThisProject) {
                        return; // 从本方案里来的，自订数据源已经存在了肯定
                    }
                    hadSqlBp = _this5.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
                } else if (cusDSBP.group == 'ctlcus') {} else {
                    console.error('不支持的group:' + cusDSBP.group);
                    return;
                }

                if (hadSqlBp && !bOverwrite) {
                    return;
                }

                var sqlBPCreationHelper = new NodeCreationHelper();
                sqlBPCreationHelper.project = _this5.project;
                var jsonStr = JSON.stringify(cusDSBP);
                var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
                if (cusDSBP.group == 'ctlcus') {
                    hadSqlBp = _this5.dataMaster.getSqlBPByName(goodJson.name);
                    useUUID = hadSqlBp ? hadSqlBp.uuid : null;
                }
                goodJson.uuid = useUUID;
                if (hadSqlBp) {
                    if (bOverwrite) {
                        goodJson.id = hadSqlBp.id;
                        hadSqlBp.reCreate({}, goodJson, sqlBPCreationHelper);
                    }
                } else {
                    var newbp = new SqlNode_BluePrint({ master: _this5.dataMaster }, goodJson, sqlBPCreationHelper);
                    _this5.dataMaster.addSqlBP(newbp);
                }
            });

            needPasteScripts_arr.forEach(function (scriptBP) {
                useUUID = null;
                var hadScriptBP = null;
                var scriptBPCreationHelper = new NodeCreationHelper();
                scriptBPCreationHelper.project = _this5.project;

                var jsonStr = JSON.stringify(scriptBP);
                var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
                hadScriptBP = _this5.scriptMaster.getBPByName(goodJson.name);
                if (hadScriptBP) {
                    goodJson.uuid = hadScriptBP.uuid;
                    goodJson.id = hadScriptBP.id;
                    hadScriptBP.reCreate({}, goodJson, scriptBPCreationHelper);
                } else {
                    goodJson.uuid = useUUID;
                    var newbp = new JSNode_BluePrint({ master: _this5.scriptMaster }, goodJson, scriptBPCreationHelper);
                    _this5.scriptMaster.addBP(newbp);
                }
            });

            var createdUserCtls_arr = [];
            var userCtlCreatioinHelper;
            var goodUserCtlJson;
            var newUCtl;

            if (!copyFromThisProject || isPastePage) {
                copiedData.userControls_arr.forEach(function (userCtlProfile) {
                    var UCJson = userCtlProfile.jsonData;
                    var hadUserControl = _this5.getUserControlByUUID(UCJson.uuid);
                    if (!hadUserControl) {
                        userCtlCreatioinHelper = new CtlKernelCreationHelper();
                        userCtlCreatioinHelper.project = _this5;
                        goodUserCtlJson = JSON.parse(replaceIDChangedInJsonString(JSON.stringify(UCJson)));
                        newUCtl = new UserControlKernel({ project: _this5 }, null, userCtlCreatioinHelper, goodUserCtlJson);
                        _this5.userControls_arr.push(newUCtl);
                        createdUserCtls_arr.push({
                            ctl: newUCtl,
                            json: goodUserCtlJson
                        });
                    } else if (bOverwrite) {
                        userCtlCreatioinHelper = new CtlKernelCreationHelper();
                        userCtlCreatioinHelper.project = _this5;
                        goodUserCtlJson = JSON.parse(replaceIDChangedInJsonString(JSON.stringify(UCJson)));
                        hadUserControl.__recreate(userCtlCreatioinHelper, goodUserCtlJson);
                    }
                });

                createdUserCtls_arr.forEach(function (p) {
                    p.ctl.__restoreChildren(null, p.json);
                });
            }
            if (isPastePage) {
                userCtlCreatioinHelper = new CtlKernelCreationHelper();
                userCtlCreatioinHelper.project = this;
                goodUserCtlJson = JSON.parse(replaceIDChangedInJsonString(JSON.stringify(copiedData.targetControl)));
                newUCtl = new M_PageKernel(null, this, userCtlCreatioinHelper, goodUserCtlJson);
                newUCtl.ispcPage = copiedData.targetControl.ispcPage;
                if (copiedData.targetControl.ispcPage) {
                    this.content_PC.pages.push(newUCtl);
                } else {
                    this.content_Mobile.pages.push(newUCtl);
                }
            }

            var targetCtlJsonStr = JSON.stringify(copiedData.targetControl);
            var goodTargetCtlJson = JSON.parse(replaceIDChangedInJsonString(targetCtlJsonStr));
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            var ctlConfig = DesignerConfig.findConfigByType(goodTargetCtlJson.type);
            if (ctlConfig == null) {
                console.warn('type:' + goodTargetCtlJson.type + '未找到配置数据');
                return;
            }
            var self = this;
            if (parentKernel) {
                var initData = {};
                if (targetIndex >= 0) {
                    initData.hintIndexInParent = targetIndex + 1;
                }
                var newCtl = new ctlConfig.kernelClass(initData, parentKernel, ctlCreatioinHelper, goodTargetCtlJson);
                setTimeout(function () {
                    self.designer.selectKernel(newCtl);
                    if (createdUserCtls_arr.length > 0) {
                        self.emit('userControlChanged');
                    }
                }, 50);
            } else {
                setTimeout(function () {
                    if (createdUserCtls_arr.length > 0) {
                        self.emit('userControlChanged');
                    }
                }, 50);
            }
        }
    }, {
        key: 'exportUserControl',
        value: function exportUserControl(target) {
            if (target == null || target.type != UserControlKernel_Type) {
                return;
            }
            return this.copyKernel(target);
        }
    }, {
        key: 'importUserControl',
        value: function importUserControl(copiedData) {
            if (copiedData) {
                this.pasteKernel(copiedData, null, null, true);
            }
        }
    }, {
        key: 'cloneUserControl',
        value: function cloneUserControl(target) {
            if (target == null || target.type != UserControlKernel_Type) {
                return;
            }
            var copiedData = this.copyKernel(target);
            var targetItem = copiedData.userControls_arr.find(function (x) {
                return x.jsonData.id == target.id;
            });
            targetItem.jsonData.uuid = guid2();
            targetItem.jsonData.attr.name += '(复制)';
            this.pasteKernel(copiedData, null, null);
        }
    }, {
        key: 'clonePage',
        value: function clonePage(target) {
            if (target == null || target.type != M_PageKernel_Type) {
                return;
            }
            var copiedData = this.copyKernel(target);
            copiedData.targetControl.attr.title += '(复制)';
            copiedData.targetControl.attr[AttrNames.IsMain] = false;
            this.pasteKernel(copiedData, null, null);
        }
    }]);

    return CProject;
}(IAttributeable);

var RestoreHelper = function () {
    function RestoreHelper(dictionary) {
        _classCallCheck(this, RestoreHelper);

        this.dictionary = dictionary;
    }

    _createClass(RestoreHelper, [{
        key: 'queryDictionnary',
        value: function queryDictionnary(key) {
            if (this.dictionary == null || typeof key != 'string' || key[0] != '$' || this.dictionary[key] == null) {
                return key;
            }
            return this.dictionary[key];
        }
    }, {
        key: 'trasnlateJson',
        value: function trasnlateJson(targetJson) {
            if (this.dictionary == null) {
                return;
            }
            for (var name in targetJson) {
                var value = targetJson[name];
                if (typeof value == 'string') {
                    targetJson[name] = this.queryDictionnary(value);
                }
            }
        }
    }]);

    return RestoreHelper;
}();

var AttrJsonProfile = function () {
    function AttrJsonProfile(hadDictionary) {
        _classCallCheck(this, AttrJsonProfile);

        this.entities_arr = [];
        this.customDS_arr = [];
        this.useControl_map = {};
        this.useUserControl_map = {};
        this.refControl_map = {};
        this.dictionary = {};
        this.customObjects_arr = [];
        this.keyIndex = 0;
        this.hadDictionary = hadDictionary == true;
        this.meetUserControlSeq_arr = [];
        this.useScript_arr = [];
    }

    _createClass(AttrJsonProfile, [{
        key: 'addCusObject',
        value: function addCusObject(cusObj) {
            if (cusObj == null) {
                return;
            }
            if (this.customObjects_arr.indexOf(cusObj) == -1) {
                this.customObjects_arr.push(cusObj);
            }
        }
    }, {
        key: 'addDictionnary',
        value: function addDictionnary(value) {
            if (!this.hadDictionary) {
                return value;
            }
            if (typeof value != 'string' || value.length < 2) {
                return value;
            }
            if (this.dictionary[value]) {
                return this.dictionary[value];
            }
            var newKey = '$' + this.keyIndex.toString(16).toLocaleLowerCase();
            if (newKey.length >= value.length) {
                return value;
            }
            this.dictionary[value] = newKey;
            this.keyIndex++;
            return newKey;
        }
    }, {
        key: 'getDictionaryObj',
        value: function getDictionaryObj() {
            var rlt = {};
            if (this.hadDictionary) {
                for (var key in this.dictionary) {
                    rlt[this.dictionary[key]] = key;
                }
            }
            return rlt;
        }
    }, {
        key: 'useEntity',
        value: function useEntity(entity) {
            if (isNaN(entity.code)) {
                if (this.customDS_arr.indexOf(entity) == -1) {
                    this.customDS_arr.push(entity);
                }
                return;
            }
            if (this.entities_arr.indexOf(entity) == -1) {
                this.entities_arr.push(entity);
            }
        }
    }, {
        key: 'useControl',
        value: function useControl(theCtl) {
            if (theCtl == null) {
                return;
            }
            this.useControl_map[theCtl.id] = theCtl;
        }
    }, {
        key: 'useUserControl',
        value: function useUserControl(theCtl) {
            if (theCtl == null) {
                return;
            }
            if (this.useUserControl_map[theCtl.id] == null) {
                this.useUserControl_map[theCtl.id] = theCtl;
                this.meetUserControlSeq_arr.push(theCtl);
            }
        }
    }, {
        key: 'addRefControl',
        value: function addRefControl(theCtl) {
            if (theCtl == null) {
                return;
            }
            this.refControl_map[theCtl.id] = theCtl;
        }
    }, {
        key: 'addUseScript_arr',
        value: function addUseScript_arr(scriptBP) {
            if (scriptBP == null) {
                return;
            }
            if (this.useScript_arr.indexOf(scriptBP) == -1) {
                this.useScript_arr.push(scriptBP);
            }
        }
    }]);

    return AttrJsonProfile;
}();