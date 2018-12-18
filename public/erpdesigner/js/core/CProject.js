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
        _this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        _this.defaultNameCounter = {};
        _this.controlName_map = {};
        _this.controlId_map = {};
        _this.cacheState = {};
        _this.dataMaster = new DataMaster(_this);
        _this.project = _this;

        _this.designeConfig = {
            name: genProjectName(),
            editingType: 'MB',
            editingPage: {
                name: ''
            },
            description: '页面'
        };

        _this.content_PC = {
            pages: []
        };

        _this.content_Mobile = {
            pages: []
        };

        _this.logmanager = new LogManager(_this.designeConfig.name + '_lm');

        if (jsonData == null) {
            var mainPage = new M_PageKernel({
                title: '主页面',
                isMain: 1,
                nav: {
                    hidden: 1,
                    leftBtn: {
                        hidden: 0,
                        label: '返回',
                        action: 'retutn'
                    },
                    rightBtn: {
                        hidden: 0
                    }
                },
                body: {
                    direction: 'column'
                }
            }, _this);
            mainPage.project = _this;
            _this.content_Mobile.pages.push(mainPage);
        } else {
            if (jsonData.attr != null) {
                Object.assign(_this, jsonData.attr);
            }
            var self = _this;
            _this.dataMaster.restoreFromJson(jsonData.dataMaster);

            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            jsonData.content_Mobile.pages.forEach(function (pageJson) {
                var newPage = new M_PageKernel({}, _this, ctlCreatioinHelper, pageJson);
                _this.content_Mobile.pages.push(newPage);
            });
        }
        _this.logmanager.log('加载完成');
        return _this;
    }

    _createClass(CProject, [{
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
        key: 'setEditingPageByName',
        value: function setEditingPageByName(pageName) {
            var thePage = this.getPageByName(pageName);
            if (thePage == null) return false;
            this.designeConfig.editingPage.name = thePage.name;
            this.attrChanged('editingPage');
        }
    }, {
        key: 'getPageByName',
        value: function getPageByName(pageName) {
            var rlt = null;
            if (this.designeConfig.editingType == 'PC') {
                rlt = this.content_PC.pages.find(function (item) {
                    return item.name == pageName;
                });
                if (rlt == null) {
                    rlt = this.content_PC.pages.length > 0 ? this.content_PC.pages[0] : null;
                }
            } else {
                rlt = this.content_Mobile.pages.find(function (item) {
                    return item.name == pageName;
                });
                if (rlt == null) {
                    rlt = this.content_Mobile.pages.length > 0 ? this.content_Mobile.pages[0] : null;
                }
            }
            return rlt;
        }
    }, {
        key: 'getEditingPage',
        value: function getEditingPage() {
            var nowEditingPageName = this.designeConfig.editingPage.name;
            return this.getPageByName(this.designeConfig.editingPage.name);
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
        value: function getJson() {
            var attrJson = _get(CProject.prototype.__proto__ || Object.getPrototypeOf(CProject.prototype), 'getJson', this).call(this);
            var rlt = {
                attr: attrJson
            };
            rlt.content_PC = {
                pages: []
            };
            this.content_PC.pages.forEach(function (page) {
                rlt.content_PC.pages.push(page.getJson());
            });

            rlt.content_Mobile = {
                pages: []
            };
            this.content_Mobile.pages.forEach(function (page) {
                rlt.content_Mobile.pages.push(page.getJson());
            });
            rlt.dataMaster = this.dataMaster.getJson();
            return rlt;
        }
    }]);

    return CProject;
}(IAttributeable);