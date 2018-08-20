'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CAttribute = function () {
    function CAttribute(label, name, valueType, getFun, setFun) {
        _classCallCheck(this, CAttribute);

        Object.assign(this, {
            label: label,
            name: name,
            valueType: valueType,
            getFun: getFun,
            setFun: setFun,
            inputID: name + '_input'
        });
    }

    _createClass(CAttribute, [{
        key: 'nowValue',
        value: function nowValue() {
            return this.getFun();
        }
    }]);

    return CAttribute;
}();