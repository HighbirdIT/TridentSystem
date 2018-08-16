//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var accelerometer;

    // DOM elements
    var reportTypeComboBox;

    var page = WinJS.UI.Pages.define("/erpdesigner/html/scenario0_Choose.html", {
        ready: function (element, options) {
            reportTypeComboBox = document.getElementById("reportTypeComboBox");
            
            reportTypeComboBox.selectedIndex = Array.prototype.findIndex.call(reportTypeComboBox.options, function (o) {
                return o.value == SdkSample.accelerometerReadingType;
            });

            document.getElementById('canvas').addEventListener('contextmenu', (e) => {
                var menu = document.getElementById("menu1").winControl;
                var te = e.target.getBoundingClientRect();
                var me = {
                    left:e.clientX,
                    top:e.clientY,
                    height:10,
                    width:10,
                    bottom:e.clientY + 10,
                    right:e.clientX + 10,
                };

                menu.show({getBoundingClientRect:function(){
                    return me;
                    return {left:e.clientX,top:e.clientY,width:100,hieght:200};
                }}, 'right');
                e.preventDefault();
            });
        },
        unload: function () {
            SdkSample.accelerometerReadingType = reportTypeComboBox.options[reportTypeComboBox.selectedIndex].value;
        }
    });
})();
