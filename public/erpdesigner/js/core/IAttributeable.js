'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EATTRCHANGED = 'attrChanged';

var IAttributeable = function (_EventEmitter) {
    _inherits(IAttributeable, _EventEmitter);

    function IAttributeable(initAttrValues) {
        _classCallCheck(this, IAttributeable);

        var _this = _possibleConstructorReturn(this, (IAttributeable.__proto__ || Object.getPrototypeOf(IAttributeable)).call(this));

        _this.attrVersion = 0;
        _this.description = '未知';
        _this.attrValues = initAttrValues;
        autoBind(_this);
        return _this;
    }

    _createClass(IAttributeable, [{
        key: 'findAttributeByName',
        value: function findAttributeByName(attrName) {
            var foundAttr = null;
            this.attrbuteGroups.find(function (group) {
                var t = group.attrs_arr.find(function (attr) {
                    return attr.name === attrName ? attr : null;
                });
                if (t) {
                    foundAttr = t;
                    return true;
                }
                return false;
            });
            return foundAttr;
        }
    }, {
        key: '__setAttribute',
        value: function __setAttribute(attrName, value) {
            if (this.attrValues[attrName] == value) {
                return false;
            }
            this.attrValues[attrName] = value;
            return true;
        }
    }, {
        key: 'setAttribute',
        value: function setAttribute(attrName, value) {
            if (typeof this['set_' + attrName] == 'function') {
                return this['set_' + attrName](value);
            } else {
                if (this.__setAttribute(attrName, value) != false) {
                    this.attrChanged(attrName);
                }
            }
        }
    }, {
        key: 'getAttribute',
        value: function getAttribute(attrName) {
            if (typeof this['get_' + attrName] == 'function') {
                return this['get_' + attrName]();
            }
            return this.attrValues[attrName];
        }
    }, {
        key: 'someAttributeChanged',
        value: function someAttributeChanged() {
            this.attrVersion += 1;
        }
    }, {
        key: 'attrChanged',
        value: function attrChanged(attrName) {
            this.emit(EATTRCHANGED, { name: attrName });
        }
    }]);

    return IAttributeable;
}(EventEmitter);