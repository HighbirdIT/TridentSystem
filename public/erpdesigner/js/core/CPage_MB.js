'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CPage_MBAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('标题', 'title', ValueType.String, true)]), new CAttributeGroup('测试设置', [new CAttribute('测试', 'test', ValueType.String, true, 1)])]
};

var CPage_MB = function (_IAttributeable) {
    _inherits(CPage_MB, _IAttributeable);

    function CPage_MB(initData) {
        _classCallCheck(this, CPage_MB);

        var _this = _possibleConstructorReturn(this, (CPage_MB.__proto__ || Object.getPrototypeOf(CPage_MB)).call(this, initData, null, '页面'));

        var self = _this;
        autoBind(self);
        _this.attrbuteGroups = CPage_MBAttrsSetting.groups_arr;
        return _this;
    }

    _createClass(CPage_MB, [{
        key: 'set_title',
        value: function set_title(newTitle) {
            if (newTitle.length > 10) {
                newTitle = newTitle.substring(0, 10);
            }

            var flag = this.__setAttribute('title', newTitle);
            if (flag) {
                this.attrChanged('title');
                this.project.attrChanged('pagetitle', {
                    targetPage: this
                });
            }
            return flag;
        }
    }]);

    return CPage_MB;
}(IAttributeable);