'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CAttribute = function CAttribute(label, name, valueType, editable, isArray) {
    _classCallCheck(this, CAttribute);

    Object.assign(this, {
        label: label,
        name: name,
        valueType: valueType,
        editable: editable,
        inputID: name + '_input',
        isArray: isArray
    });
};