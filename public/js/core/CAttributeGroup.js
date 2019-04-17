"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CAttributeGroup = function (_EventEmitter) {
    _inherits(CAttributeGroup, _EventEmitter);

    function CAttributeGroup(label, attrs_arr) {
        _classCallCheck(this, CAttributeGroup);

        var _this = _possibleConstructorReturn(this, (CAttributeGroup.__proto__ || Object.getPrototypeOf(CAttributeGroup)).call(this));

        EnhanceEventEmiter(_this);
        _this.label = label;
        _this.setAttrs(attrs_arr);
        return _this;
    }

    _createClass(CAttributeGroup, [{
        key: "appandAttr",
        value: function appandAttr(target) {
            var self = this;
            if (Array.isArray(target)) {
                this.attrs_arr = this.attrs_arr.concat(target);
                target.forEach(function (attr) {
                    attr.group = self;
                });
            } else {
                this.attrs_arr.push(target);
                target.group = self;
            }
        }
    }, {
        key: "setAttrs",
        value: function setAttrs(attrs_arr) {
            var self = this;
            this.attrs_arr = attrs_arr;
            attrs_arr.forEach(function (attr) {
                attr.group = self;
            });
        }
    }, {
        key: "findAttrByName",
        value: function findAttrByName(attrName) {
            return this.attrs_arr.find(function (e) {
                return e.name == attrName;
            });
        }
    }]);

    return CAttributeGroup;
}(EventEmitter);