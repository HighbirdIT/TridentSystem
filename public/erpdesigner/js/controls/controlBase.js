"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBase = function ControlBase(forPC, label, groupName) {
    _classCallCheck(this, ControlBase);

    this.config = Object.assign({}, {
        forPC: forPC,
        label: label
    });
};