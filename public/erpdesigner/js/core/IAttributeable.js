'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IAttributeable = function (_EventEmitter) {
    _inherits(IAttributeable, _EventEmitter);

    function IAttributeable(initAttrValues, consignor, description) {
        _classCallCheck(this, IAttributeable);

        var _this = _possibleConstructorReturn(this, (IAttributeable.__proto__ || Object.getPrototypeOf(IAttributeable)).call(this));

        consignor = consignor == null ? _this : consignor;
        _this.consignor = consignor;
        _this.attrVersion = 0;
        _this.description = description == null ? '未知' : description;
        consignor = Object.assign(consignor, initAttrValues);
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
            if (this.consignor[attrName] == value) {
                return false;
            }
            this.consignor[attrName] = value;
            return true;
        }
    }, {
        key: 'setAttribute',
        value: function setAttribute(attrName, value) {
            if (typeof this.consignor['set_' + attrName] == 'function') {
                return this.consignor['set_' + attrName](value);
            } else {
                if (this.__setAttribute(attrName, value) != false) {
                    this.attrChanged(attrName);
                }
            }
        }
    }, {
        key: 'getAttribute',
        value: function getAttribute(attrName) {
            if (typeof this.consignor['get_' + attrName] == 'function') {
                return this.consignor['get_' + attrName]();
            }
            return this[attrName];
        }
    }, {
        key: 'someAttributeChanged',
        value: function someAttributeChanged() {
            this.attrVersion += 1;
        }
    }, {
        key: 'attrChanged',
        value: function attrChanged(attrName, params) {
            //console.log(attrName + ' changed');
            this.emit(EATTRCHANGED, Object.assign({ name: attrName }, params));
        }
    }, {
        key: 'getAttrArrayCount',
        value: function getAttrArrayCount(attrName) {
            var countVarName = attrName + '_count';
            if (this[countVarName] == null) {
                this[countVarName] = 0;
            }
            return parseInt(this[countVarName]);
        }
    }, {
        key: 'growAttrArray',
        value: function growAttrArray(attrName) {
            var countVarName = attrName + '_count';
            if (this[countVarName] == null) {
                this[countVarName] = 0;
            }
            this[countVarName] = parseInt(this[countVarName]) + 1;
            return this[countVarName];
        }
    }]);

    return IAttributeable;
}(EventEmitter);