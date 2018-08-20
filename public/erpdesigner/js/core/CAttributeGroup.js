"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CAttributeGroup = function CAttributeGroup(label, belongObj, attrs_arr) {
    _classCallCheck(this, CAttributeGroup);

    var self = this;
    this.label = label;
    this.attrs_arr = attrs_arr;
    this.belongObj = belongObj;
    attrs_arr.forEach(function (attr) {
        attr.group = self;
    });
};