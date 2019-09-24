'use strict';

var gByteToHex = [];

var initByteToHex = function initByteToHex() {
    if (gByteToHex.length == 0) {
        console.log('initByteToHex');
        for (var n = 0; n <= 0xff; ++n) {
            gByteToHex.push(n.toString(16).padStart(2, "0"));
        }
    }
};

var UIntToHexStr = function UIntToHexStr(data_arr) {
    initByteToHex();
    var hexOctets = [];
    for (var pos = 0; pos < data_arr.length; ++pos) {
        hexOctets.push(gByteToHex[data_arr[pos]]);
    }
    return hexOctets.join('');
};

var onmessage = function onmessage(event) {
    postMessage(UIntToHexStr(event.data));
};

initByteToHex();