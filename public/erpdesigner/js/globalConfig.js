'use strict';

var EATTRCHANGED = 'attrChanged';
var EFORCERENDER = 'forcerender';

var Orientation_H = '水平';
var Orientation_V = '垂直';
var Orientation_Options_arr = [Orientation_H, Orientation_V];

var DesignerConfig = {
    controlConfig: {
        groups: [],
        configs_obj: {}
    }
};

DesignerConfig.registerControl = function (ctlConfig, groupName) {
    var ctlGroup = this.controlConfig.groups.find(function (item) {
        return item.name == groupName;
    });
    if (ctlGroup == null) {
        ctlGroup = {
            name: groupName,
            controlsForPC: [],
            controlsForMobile: []
        };
        this.controlConfig.groups.push(ctlGroup);
    }

    if (ctlConfig.forPC) {
        ctlGroup.controlsForPC.push(ctlConfig);
    } else {
        ctlGroup.controlsForMobile.push(ctlConfig);
    }
    this.controlConfig.configs_obj[ctlConfig.type] = ctlConfig;
}.bind(DesignerConfig);

DesignerConfig.findConfigByType = function (ctlType) {
    return this.controlConfig.configs_obj[ctlType];
}.bind(DesignerConfig);

var ValueType = {
    String: 'String',
    Int: 'Int'
};