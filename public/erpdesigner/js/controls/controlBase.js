"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBase = function ControlBase(forPC, label) {
    _classCallCheck(this, ControlBase);

    Object.assign(this, {
        forPC: forPC,
        label: label
    });
};