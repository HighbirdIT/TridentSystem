'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CProjectAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('页面名称', 'title', ValueType.String, true), new CAttribute('真实名称', 'realName', ValueType.String, false)])]
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

        _this.designeConfig = {
            name: genProjectName(),
            editingType: 'MB',
            editingPage: {
                id: jsonData == null ? -1 : jsonData.lastEditingPageID
            },
            description: '页面',
            editingControl: {
                id: jsonData == null ? -1 : jsonData.lastEditingControlID
            }
        };

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
            _this.dataMaster.restoreFromJson(jsonData.dataMaster);
            _this.scriptMaster.restoreFromJson(jsonData.scriptMaster);

            if (jsonData.userControls_arr) {
                jsonData.userControls_arr.forEach(function (ctlJson) {
                    var newUCtl = new UserControlKernel({ project: _this }, null, null, ctlJson);
                    _this.userControls_arr.push(newUCtl);
                });

                jsonData.userControls_arr.forEach(function (ctlJson, index) {
                    _this.userControls_arr[index].__restoreChildren(null, ctlJson);
                });
            }

            var self = _this;
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            jsonData.content_Mobile.pages.forEach(function (pageJson) {
                var newPage = new M_PageKernel({}, _this, ctlCreatioinHelper, pageJson);
                _this.content_Mobile.pages.push(newPage);
            });
        }
        _this.loaded = true;
        _this.emit('loaded');
        _this.logManager.log('加载完成');
        return _this;
    }

    _createClass(CProject, [{
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
            var _this2 = this;

            var useID = ctlKernel.id;
            var registedCtl = this.getControlById(useID);
            if (registedCtl == null) {
                return true;
            }
            delete this.controlId_map[useID];

            var useBPs_arr = this.scriptMaster.getBPsByControlKernel(useID);
            useBPs_arr.forEach(function (bp) {
                _this2.scriptMaster.deleteBP(bp);
            });
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
            var rlt_arr = [];
            for (var id in this.controlId_map) {
                var ctl = this.controlId_map[id];
                if (ctl && ctl.type == theType) {
                    rlt_arr.push(ctl);
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
            return newPage;
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
        value: function setEditingType(newValue) {}
    }, {
        key: 'toggleEditingType',
        value: function toggleEditingType(newValue) {
            this.designeConfig.editingType = this.designeConfig.editingType == 'PC' ? 'MB' : 'PC';
            this.attrChanged('editingType');
            return true;
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
            var attrJson = _get(CProject.prototype.__proto__ || Object.getPrototypeOf(CProject.prototype), 'getJson', this).call(this, jsonProf);
            var rlt = {
                attr: attrJson,
                lastEditingPageID: this.designeConfig.editingPage.id,
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
            return rlt;
        }
    }, {
        key: 'copyKernel',
        value: function copyKernel(theKernel) {
            var _this3 = this;

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
                targetControl: null
            };
            var controlJsonProf = new AttrJsonProfile();
            var controlJson = theKernel.getJson(controlJsonProf);
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
                        copyCusDS(entity, refControl_map);
                    }
                });
                if (refControl_map) {
                    for (var rcid in cusDSJsonProf.refControl_map) {
                        refControl_map[rcid] = cusDSJsonProf.refControl_map[rcid].type;
                    }
                }
                cusDS_arr.push(dsJson);
            };
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
                scriptJsonProf.customDS_arr.forEach(function (entity) {
                    if (entity.isCustomDS) {
                        copyCusDS(entity, cusDS_arr, refControl_map);
                    }
                });
                if (refControl_map) {
                    for (var rcid in scriptJsonProf.refControl_map) {
                        refControl_map[rcid] = scriptJsonProf.refControl_map[rcid].type;
                    }
                }
                scripts_arr.push(scriptJson);
            };

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

                UCJsonProf.customDS_arr.forEach(function (entity) {
                    if (entity.isCustomDS) {
                        copyCusDS(entity, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                    }
                });

                for (ctlid in UCJsonProf.useControl_map) {
                    var ctlType = UCJsonProf.useControl_map[ctlid].type;
                    if (userCtlProfile.controlsID_map[ctlType] == null) {
                        userCtlProfile.controlsID_map[ctlType] = [];
                    }
                    userCtlProfile.controlsID_map[ctlType].push(ctlid);
                    var useScripteBP_arr = _this3.scriptMaster.getBPsByControlKernel(ctlid);
                    useScripteBP_arr.forEach(function (scriptBP) {
                        copyScript(scriptBP, userCtlProfile.scripts_arr, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                    });
                }

                for (ctlid in UCJsonProf.useUserControl_map) {
                    copyUserControl(UCJsonProf.useUserControl_map[ctlid]);
                }
                userCtlProfile.jsonData = UCJson;
                copyResult.userControls_arr.push(userCtlProfile);
            };

            for (ctlid in controlJsonProf.useUserControl_map) {
                copyUserControl(controlJsonProf.useUserControl_map[ctlid]);
            }

            copyResult.targetControl = controlJson;
            return copyResult;
        }
    }, {
        key: 'pasteKernel',
        value: function pasteKernel(copiedData, parentKernel, targetIndex) {
            var _this4 = this;

            var copyFromThisProject = copiedData.project == this;
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
                    var hadUserControl = _this4.getUserControlByUUID(UCJson.uuid);
                    if (hadUserControl) {
                        if (hadUserControl.id != UCJson.id) {
                            renameContrls_map[UCJson.id] = hadUserControl.id;
                        }
                        return;
                    }
                    if (aidControlId_map[UCJson.id] != null) {
                        var newID = '';
                        for (i = 0; i < 9999; ++i) {
                            newID = 'userControl_T' + i;
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
                        var hadSqlBp = _this4.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
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
                if (cusDSBP.group == 'custom') {
                    if (copyFromThisProject) {
                        return; // 从本方案里来的，自订数据源已经存在了肯定
                    }
                    var hadSqlBp = _this4.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
                    if (hadSqlBp) {
                        return;
                    }
                } else if (cusDSBP.group == 'ctlcus') {
                    useUUID = null;
                } else {
                    console.error('不支持的group:' + cusDSBP.group);
                    return;
                }
                var expireBP = null;
                var sqlBPCreationHelper = new NodeCreationHelper();
                sqlBPCreationHelper.project = _this4.project;
                var jsonStr = JSON.stringify(cusDSBP);
                var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
                goodJson.uuid = useUUID;
                if (cusDSBP.group == 'ctlcus') {
                    expireBP = _this4.dataMaster.getSqlBPByName(goodJson.name);
                    if (expireBP) {
                        _this4.dataMaster.deleteSqlBP(expireBP);
                    }
                }
                var newbp = new SqlNode_BluePrint({ master: _this4.dataMaster }, goodJson, sqlBPCreationHelper);
                _this4.dataMaster.addSqlBP(newbp);
            });

            needPasteScripts_arr.forEach(function (scriptBP) {
                useUUID = null;
                var expireBP = null;
                var scriptBPCreationHelper = new NodeCreationHelper();
                scriptBPCreationHelper.project = _this4.project;

                var jsonStr = JSON.stringify(scriptBP);
                var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
                expireBP = _this4.scriptMaster.getBPByName(goodJson.name);
                if (expireBP) {
                    _this4.scriptMaster.deleteBP(expireBP);
                }
                goodJson.uuid = useUUID;
                var newbp = new JSNode_BluePrint({ master: _this4.scriptMaster }, goodJson, scriptBPCreationHelper);
                _this4.scriptMaster.addBP(newbp);
            });

            var createdUserCtls_arr = [];
            if (!copyFromThisProject) {
                copiedData.userControls_arr.forEach(function (userCtlProfile) {
                    var UCJson = userCtlProfile.jsonData;
                    var hadUserControl = _this4.getUserControlByUUID(UCJson.uuid);
                    if (!hadUserControl) {
                        var userCtlCreatioinHelper = new CtlKernelCreationHelper();
                        userCtlCreatioinHelper.project = _this4;
                        var goodUserCtlJson = JSON.parse(replaceIDChangedInJsonString(JSON.stringify(UCJson)));
                        var newUCtl = new UserControlKernel({ project: _this4 }, null, userCtlCreatioinHelper, goodUserCtlJson);
                        _this4.userControls_arr.push(newUCtl);
                        createdUserCtls_arr.push({
                            ctl: newUCtl,
                            json: goodUserCtlJson
                        });
                    }
                });

                createdUserCtls_arr.forEach(function (p) {
                    p.ctl.__restoreChildren(null, p.json);
                });
            }

            var targetCtlJsonStr = JSON.stringify(copiedData.targetControl);
            var goodTargetCtlJson = JSON.parse(replaceIDChangedInJsonString(targetCtlJsonStr));
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            var ctlConfig = DesignerConfig.findConfigByType(goodTargetCtlJson.type);
            if (ctlConfig == null) {
                console.warn('type:' + goodTargetCtlJson.type + '未找到配置数据');
                return;
            }
            var initData = {};
            if (targetIndex >= 0) {
                initData.hintIndexInParent = targetIndex + 1;
            }
            var newCtl = new ctlConfig.kernelClass(initData, parentKernel, ctlCreatioinHelper, goodTargetCtlJson);
            var self = this;
            setTimeout(function () {
                self.designer.selectKernel(newCtl);
                if (createdUserCtls_arr.length > 0) {
                    self.emit('userControlChanged');
                }
            }, 50);
        }
    }]);

    return CProject;
}(IAttributeable);

var AttrJsonProfile = function () {
    function AttrJsonProfile() {
        _classCallCheck(this, AttrJsonProfile);

        this.entities_arr = [];
        this.customDS_arr = [];
        this.useControl_map = {};
        this.useUserControl_map = {};
        this.refControl_map = {};
    }

    _createClass(AttrJsonProfile, [{
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
            this.useUserControl_map[theCtl.id] = theCtl;
        }
    }, {
        key: 'addRefControl',
        value: function addRefControl(theCtl) {
            if (theCtl == null) {
                return;
            }
            this.refControl_map[theCtl.id] = theCtl;
        }
    }]);

    return AttrJsonProfile;
}();