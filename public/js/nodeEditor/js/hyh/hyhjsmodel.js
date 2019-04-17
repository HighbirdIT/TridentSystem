'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSNODE_JSFOR = 'jsfor';

var JSNode_JsFor = function (_JSNode_Base) {
    _inherits(JSNode_JsFor, _JSNode_Base);

    function JSNode_JsFor(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_JsFor);

        var _this = _possibleConstructorReturn(this, (JSNode_JsFor.__proto__ || Object.getPrototypeOf(JSNode_JsFor)).call(this, initData, parentNode, createHelper, JSNODE_SWITCH, 'For', false, nodeJson));

        autoBind(_this);

        if (_this.inFlowSocket == null) {
            _this.inFlowSocket = new NodeFlowSocket('flow_i', _this, true);
            _this.addSocket(_this.inFlowSocket);
        }
        if (_this.inputSocket == null) {
            _this.inputSocket = new NodeSocket('in', _this, true);
            _this.addSocket(_this.inputSocket);
        }
        _this.inputSocket.label = 'target';
        if (_this.outFlowSockets_arr == null || _this.outFlowSockets_arr.length == 0) {
            _this.outFlowSockets_arr = [];
        } else {
            _this.outFlowSockets_arr.forEach(function (item) {
                item.inputable = true;
            });
        }
        return _this;
    }

    //编译


    return JSNode_JsFor;
}(JSNode_Base);

JSNodeEditorControls_arr.push({
    label: 'for循环',
    nodeClass: JSNode_JsFor,
    type: '流控制'
});

///////////////////////////////////
JSNodeClassMap[JSNODE_JSFOR] = {
    modelClass: JSNode_JsFor,
    comClass: C_Node_SimpleNode
};