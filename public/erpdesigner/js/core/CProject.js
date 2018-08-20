'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CProject = function (_IAttributeable) {
    _inherits(CProject, _IAttributeable);

    function CProject(title) {
        _classCallCheck(this, CProject);

        var _this = _possibleConstructorReturn(this, (CProject.__proto__ || Object.getPrototypeOf(CProject)).call(this));

        _this.config = {
            title: title,
            isPC: 0
        };
        _this.description = '页面';

        var self = _this;
        autoBind(self);
        _this.attrbuteGroups = [new CAttributeGroup('基本设置', self, [new CAttribute('页面名称', 'title', '', _this.getLabel, _this.setLabel), new CAttribute('真实名称', 'realName', '', _this.getRealName, null)])];
        return _this;
    }

    _createClass(CProject, [{
        key: 'getLabel',
        value: function getLabel() {
            return this.config.title;
        }
    }, {
        key: 'setLabel',
        value: function setLabel(newtitle) {
            if (newtitle.length > 8) {
                newtitle = newtitle.substring(0, 8);
            }
            if (newtitle == this.config.title) {
                return false;
            }
            var newConfig = updateObject(this.config, { title: newtitle });
            this.projectManager.changeProjectConfig(this.projectIndex, newConfig);
            this.attrChanged(['title', 'realName']);
            return true;
        }
    }, {
        key: 'getRealName',
        value: function getRealName() {
            return this.config.title + 'Real';
        }
    }]);

    return CProject;
}(IAttributeable);