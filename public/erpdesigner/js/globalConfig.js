"use strict";

var DesignerConfig = {
    controlsForPC: [],
    controlsForMobile: []
};

DesignerConfig.pushControl = function (ctlConfig) {
    if (ctlConfig.forPC) {
        DesignerConfig.controlsForPC.push(ctlConfig);
    } else {
        DesignerConfig.controlsForMobile.push(ctlConfig);
    }
};