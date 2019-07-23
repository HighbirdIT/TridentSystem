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
            var newID = 'userControl';
            var ki = 0;
            do {
                newID = 'userControl_T' + ki;
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
            if (IsEmptyString(useID)) {
                for (var i = 0; i < 9999; ++i) {
                    useID = ctlKernel.type + '_' + i;
                    if (this.getControlById(useID) == null) {
                        break;
                    }
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
    }]);

    return CProject;
}(IAttributeable);

var AttrJsonProfile = function () {
    function AttrJsonProfile() {
        _classCallCheck(this, AttrJsonProfile);

        this.entities_arr = [];
    }

    _createClass(AttrJsonProfile, [{
        key: 'useEntity',
        value: function useEntity(entity) {
            if (isNaN(entity.code)) {
                return;
            }
            if (this.entities_arr.indexOf(entity) == -1) {
                this.entities_arr.push(entity);
            }
        }
    }]);

    return AttrJsonProfile;
}();