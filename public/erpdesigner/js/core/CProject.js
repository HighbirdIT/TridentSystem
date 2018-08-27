'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CProjectAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('页面名称', 'title', ValueType.String, true), new CAttribute('真实名称', 'realName', ValueType.String, false)])]
};

var hadNames_project = {};
function genProjectName() {
    var rlt = '';
    for (var i = 1; i < 999; ++i) {
        rlt = 'PROJ_' + i;
        if (hadNames_project[rlt] == null) break;
    }
    hadNames_project[rlt] = 1;
    return rlt;
}

var CProject = function (_IAttributeable) {
    _inherits(CProject, _IAttributeable);

    function CProject(title) {
        _classCallCheck(this, CProject);

        var _this = _possibleConstructorReturn(this, (CProject.__proto__ || Object.getPrototypeOf(CProject)).call(this, {
            title: title
        }, null, '方案'));

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
        var mainPage = new CPage_MB({
            title: '主页面',
            name: 'page01',
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
        });
        var secondPage = new CPage_MB({
            title: '次页面',
            name: 'page02',
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
        });
        mainPage.project = _this;
        secondPage.project = _this;
        _this.content_Mobile = {
            pages: [mainPage, secondPage]
        };

        var self = _this;
        autoBind(self);
        _this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        return _this;
    }

    _createClass(CProject, [{
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
            if (this.__setAttribute('title', newtitle)) {
                this.attrChanged(['title', 'realName']);
                return true;
            }
            return false;
        }
    }, {
        key: 'get_realName',
        value: function get_realName() {
            return this.getAttribute('title') + 'Real';
        }
    }]);

    return CProject;
}(IAttributeable);