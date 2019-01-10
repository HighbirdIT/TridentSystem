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
        EnhanceEventEmiter(_this);
        _this.cacheObj = {};
        //autoBind(this);
        return _this;
    }

    _createClass(IAttributeable, [{
        key: 'findAttributeByName',
        value: function findAttributeByName(attrName) {
            var foundAttr = null;
            var rlt = this.cacheObj[attrName + '_c'];
            if (rlt != null) {
                return rlt;
            }
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
            this.cacheObj[attrName + '_c'] = foundAttr;
            return foundAttr;
        }
    }, {
        key: '__setAttribute',
        value: function __setAttribute(realAtrrName, value, attrName, indexInArray) {
            var oldValue = this.consignor[realAtrrName];
            if (typeof value === 'string' && oldValue == value) {
                return false;
            }
            if (attrName == null) {
                attrName = realAtrrName;
            }
            this.consignor[realAtrrName] = value;
            if (this.__attributeChanged != null) {
                this.__attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray);
            }
            return true;
        }
    }, {
        key: 'setAttribute',
        value: function setAttribute(attrName, value, indexInArray) {
            if (typeof this.consignor['set_' + attrName] == 'function') {
                return this.consignor['set_' + attrName](value, indexInArray);
            } else {
                var realAtrrName = attrName + (indexInArray >= 0 ? '_' + indexInArray : '');
                if (this.__setAttribute(realAtrrName, value, attrName, indexInArray) != false) {
                    this.attrChanged(attrName, { index: indexInArray });
                }
            }
        }
    }, {
        key: 'getAttribute',
        value: function getAttribute(attrName, index) {
            if (index == null) {
                var keypos = attrName.lastIndexOf('_');
                if (keypos != -1) {
                    // maybe attrarry
                    var nameStr = attrName.substring(0, keypos);
                    var indexStr = attrName.substring(keypos + 1);
                    attrName = nameStr;
                    index = indexStr;
                    if (isNaN(index)) {
                        console.error('vist attrarray item without index:' + attrName);
                    }
                }
            }
            if (typeof this.consignor['get_' + attrName] == 'function') {
                return this.consignor['get_' + attrName](index);
            }
            var realname = index == null ? attrName : attrName + '_' + index;
            var rlt = this[realname];
            if (rlt == null) {
                var attrItem = this.findAttributeByName(attrName);
                if (attrItem == null) {
                    console.error('访问不存在的属性:' + attrName);
                }
                rlt = attrItem.defaultVal;
                if (rlt == null) {
                    switch (attrItem.name) {
                        case AttrNames.LayoutNames.StyleAttr:
                        case AttrNames.Name:
                            break;
                        default:
                            console.warn('属性:' + attrName + '没有默认值');
                    }
                }
            }
            return rlt;
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
            return this.getAttrArrayNames(attrName).length;
        }
    }, {
        key: 'attrNameArraySortFun',
        value: function attrNameArraySortFun(a, b) {
            return a.index < b.index;
        }
    }, {
        key: 'getAttrArrayList',
        value: function getAttrArrayList(attrName) {
            var rlt = this.cacheObj[attrName + '_arry_cache'];
            if (rlt == null) {
                var tem_arr = [];
                var nameReg = new RegExp(attrName + "_\\d+$");
                var indexReg = /\d+$/;
                for (var propName in this) {
                    if (nameReg.test(propName)) {
                        var index = parseInt(indexReg.exec(propName)[0]);
                        tem_arr.push({ index: index, name: propName });
                    }
                }
                tem_arr.sort(this.attrNameArraySortFun);
                rlt = tem_arr;
                this.cacheObj[attrName + '_arry_cache'] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'growAttrArray',
        value: function growAttrArray(attrName) {
            var nowAttrArrayList = this.getAttrArrayList(attrName);
            var useIndex = 0;
            var newAttrname = null;
            while (useIndex < 9999) {
                newAttrname = attrName + '_' + useIndex;
                if (nowAttrArrayList.find(function (e) {
                    return e.name == newAttrname;
                }) == null) {
                    break;
                }
                ++useIndex;
            }
            this[newAttrname] = null;
            nowAttrArrayList.push({ index: useIndex, name: newAttrname });
            //nowAttrArrayList.sort(this.attrNameArraySortFun);
            return nowAttrArrayList.length;
        }
    }, {
        key: 'deleteAttrArrayItem',
        value: function deleteAttrArrayItem(attrName, realName) {
            var nowAttrArrayList = this.getAttrArrayList(attrName);
            var index = nowAttrArrayList.findIndex(function (e) {
                return e.name == realName;
            });
            if (index != -1) {
                nowAttrArrayList.splice(index, 1);
            }
            delete this[realName];
            //console.log('delete:' + realName);
            this.attrChanged(attrName);
            return nowAttrArrayList.length;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var _this2 = this;

            var rlt = {};
            this.attrbuteGroups.forEach(function (group) {
                group.attrs_arr.forEach(function (attr) {
                    if (!attr.editable) return;
                    var attrItemArray = null;
                    if (attr.isArray) {
                        attrItemArray = _this2.getAttrArrayList(attr.name).map(function (e) {
                            return e.name;
                        });
                    } else {
                        attrItemArray = [attr.name];
                    }
                    attrItemArray.forEach(function (attrName) {
                        var val = _this2[attrName];
                        if (val == null || val == attr.defaultVal) {
                            return;
                        }
                        switch (attr.valueType) {
                            case ValueType.DataSource:
                                val = val.code;
                                break;
                        }
                        rlt[attrName] = val;
                    });
                });
            });
            return rlt;
        }
    }, {
        key: 'restoreJson',
        value: function restoreJson(target) {
            Object.assign(this, target);
        }
    }]);

    return IAttributeable;
}(EventEmitter);