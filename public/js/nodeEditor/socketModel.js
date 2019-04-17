'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NodeSocket = function (_EventEmitter) {
    _inherits(NodeSocket, _EventEmitter);

    function NodeSocket(name, tNode, isIn, initData, isSimpleVal) {
        _classCallCheck(this, NodeSocket);

        var _this = _possibleConstructorReturn(this, (NodeSocket.__proto__ || Object.getPrototypeOf(NodeSocket)).call(this));

        Object.assign(_this, initData);
        EnhanceEventEmiter(_this);
        _this.name = name;
        _this.node = tNode;
        _this.isIn = isIn;
        _this.isSimpleVal = isSimpleVal != false;
        _this.setName(_this.name);
        _this.setCurrentComponent = CommonFun_SetCurrentComponent.bind(_this);
        return _this;
    }

    _createClass(NodeSocket, [{
        key: 'setName',
        value: function setName(name) {
            this.id = this.node.id + '$' + name;
        }
    }, {
        key: 'set',
        value: function set(data) {
            var changed = false;
            for (var name in data) {
                if (data[name] != this[name]) {
                    this[name] = data[name];
                    changed = true;
                }
            }
            if (changed) {
                this.fireEvent('changed', data);
            }
        }
    }, {
        key: 'getLinks',
        value: function getLinks() {
            return this.node.bluePrint.linkPool.getLinksBySocket(this);
        }
    }, {
        key: 'fireLinkChanged',
        value: function fireLinkChanged() {
            this.emit(Event_LinkChanged);
            var self = this;
            setTimeout(function () {
                self.node.fireMoved();
            }, 20);
        }
    }, {
        key: 'getExtra',
        value: function getExtra(key, def) {
            if (this.extra == null) {
                return def;
            }
            return this.extra[key] == null ? def : this.extra[key];
        }
    }, {
        key: 'setExtra',
        value: function setExtra(key, val) {
            if (this.extra == null) {
                this.extra = {};
            }
            this.extra[key] = val;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var rlt = {
                name: this.name,
                isIn: this.isIn,
                id: this.id,
                type: this.type
            };
            if (this.visible == false) {
                rlt.visible = false;
            }
            if (this.defval != null) {
                rlt.defval = this.defval;
            }
            if (this.extra) {
                rlt.extra = {};
                for (var si in this.extra) {
                    var tVal = this.extra[si];
                    if (tVal != null) {
                        rlt.extra[si] = tVal;
                    }
                }
            }
            return rlt;
        }
    }]);

    return NodeSocket;
}(EventEmitter);

var NodeFlowSocket = function (_NodeSocket) {
    _inherits(NodeFlowSocket, _NodeSocket);

    function NodeFlowSocket(name, tNode, isIn, initData) {
        _classCallCheck(this, NodeFlowSocket);

        var _this2 = _possibleConstructorReturn(this, (NodeFlowSocket.__proto__ || Object.getPrototypeOf(NodeFlowSocket)).call(this, name, tNode, isIn, initData));

        _this2.isFlowSocket = true;
        _this2.type = 'flow';
        return _this2;
    }

    return NodeFlowSocket;
}(NodeSocket);

function CreateNodeSocketByJson(theNode, jsonData, createHelper) {
    var rlt = null;
    var initData = { defval: jsonData.defval, extra: jsonData.extra };
    if (jsonData.type == 'flow') {
        rlt = new NodeFlowSocket(jsonData.name, theNode, jsonData.isIn, initData);
    } else {
        initData.type = jsonData.type;
        rlt = new NodeSocket(jsonData.name, theNode, jsonData.isIn, initData);
    }
    createHelper.saveJsonMap(jsonData, rlt);
    return rlt;
}