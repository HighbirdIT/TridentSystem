"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SocketLink = function () {
    function SocketLink(outSocket, inSocket, pool) {
        _classCallCheck(this, SocketLink);

        this.outID = outSocket.id;
        this.inID = inSocket.id;
        this.pool = pool;
        this.outSocket = outSocket;
        this.inSocket = inSocket;

        this.id = this.outID + '|L|' + this.inID;
        //this.revid = inID + '|L|' + outID;
    }

    _createClass(SocketLink, [{
        key: "fireChanged",
        value: function fireChanged() {
            this.inSocket.fireLinkChanged();
            this.outSocket.fireLinkChanged();
        }
    }, {
        key: "straightOut",
        value: function straightOut(offsetX) {
            var inSocket = this.inSocket;
            var outSocket = this.outSocket;
            if (outSocket.node.currentFrameCom == null || inSocket.node.currentFrameCom == null) {
                return;
            }
            if (isNaN(offsetX)) {
                offsetX = 100;
            }
            var inSocketCenter = inSocket.currentComponent.getCenterPos();
            var outSocketCenter = outSocket.currentComponent.getCenterPos();
            var offset = { x: inSocketCenter.x - outSocketCenter.x, y: inSocketCenter.y - outSocketCenter.y };
            offset.x += offsetX;
            outSocket.node.setPos(outSocket.node.left + offset.x, outSocket.node.top + offset.y);
            outSocket.node.currentFrameCom.reDraw();
        }
    }, {
        key: "getJson",
        value: function getJson() {
            if (this.inSocket && this.outSocket && this.inSocket.node && this.outSocket.node && this.inSocket.node.bluePrint && this.outSocket.node.bluePrint) {
                return {
                    inSocketID: this.inSocket.id,
                    outSocketID: this.outSocket.id
                };
            }
        }
    }]);

    return SocketLink;
}();

var ScoketLinkPool = function () {
    function ScoketLinkPool(bluePrint) {
        _classCallCheck(this, ScoketLinkPool);

        this.bluePrint = bluePrint;
        this.link_map = {};
    }

    _createClass(ScoketLinkPool, [{
        key: "_deleteLink",
        value: function _deleteLink(linkObj) {
            if (this.link_map[linkObj.id] == null) {
                return false;
            }
            if (linkObj) {
                this.link_map[linkObj.id] = null;
                delete this.link_map[linkObj.id];
                linkObj.fireChanged();

                linkObj.inSocket.node.linkRemoved(linkObj);
                linkObj.outSocket.node.linkRemoved(linkObj);
            }
            return true;
        }
    }, {
        key: "addLink",
        value: function addLink(outSocket, inSocket) {
            if (outSocket.isIn == inSocket.isIn) {
                throw new Error("两个socket流方向不能一样");
            }
            if (outSocket.isFlowSocket != inSocket.isFlowSocket) {
                throw new Error("两个socket不是相同种类");
            }
            if (outSocket.isIn) {
                var t = outSocket;
                outSocket = inSocket;
                inSocket = t;
            }
            var id = outSocket.id + '|L|' + inSocket.id;
            if (this.link_map[id] == null) {
                // 把已有的inSocket删除掉
                for (var si in this.link_map) {
                    var theLink = this.link_map[si];
                    if (theLink == null) continue;
                    var needDelete = false;
                    if (inSocket.isFlowSocket) {
                        // 流接口的是单输出，多输入
                        needDelete = theLink.outSocket == outSocket;
                    } else {
                        // 数据接口是单输入，多输出
                        needDelete = theLink.inSocket == inSocket;
                    }
                    if (needDelete) {
                        this._deleteLink(this.link_map[si]);
                        break;
                    }
                }
                var newLink = new SocketLink(outSocket, inSocket, this);
                this.link_map[id] = newLink;
                newLink.fireChanged();
                this.cacheData = null;
                this.bluePrint.fireChanged(10);

                inSocket.node.linkAdded(newLink);
                outSocket.node.linkAdded(newLink);
            }
            return this.link_map[id];
        }
    }, {
        key: "removeLink",
        value: function removeLink(link) {
            if (this._deleteLink(link)) {
                this.cacheData = null;
                this.bluePrint.fireChanged();
            }
        }
    }, {
        key: "clearNodeLink",
        value: function clearNodeLink(theNode) {
            var needClearids_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket.node == theNode || theLink.outSocket.node == theNode) {
                    needClearids_arr.push(si);
                }
            }
            if (needClearids_arr.length > 0) {
                for (var si in needClearids_arr) {
                    var id = needClearids_arr[si];
                    this._deleteLink(this.link_map[id]);
                }
                this.cacheData = null;
            }
            return needClearids_arr.length > 0;
        }
    }, {
        key: "clearSocketLink",
        value: function clearSocketLink(theSocket) {
            var needClearids_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket == theSocket || theLink.outSocket == theSocket) {
                    needClearids_arr.push(si);
                }
            }
            if (needClearids_arr.length > 0) {
                for (var si in needClearids_arr) {
                    var id = needClearids_arr[si];
                    this._deleteLink(this.link_map[id]);
                }
                this.cacheData = null;
            }
            return needClearids_arr.length > 0;
        }
    }, {
        key: "getLinksByNode",
        value: function getLinksByNode(theNode, type) {
            if (type == null) {
                type = '*';
            }
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket.node == theNode) {
                    if (type == '*' || type == 'i') {
                        rlt_arr.push(theLink);
                    }
                } else if (theLink.outSocket.node == theNode) {
                    if (type == '*' || type == 'o') {
                        rlt_arr.push(theLink);
                    }
                }
            }
            return rlt_arr;
        }
    }, {
        key: "getLinksBySocket",
        value: function getLinksBySocket(theSocket) {
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                if (theLink.inSocket == theSocket) {
                    rlt_arr.push(theLink);
                } else if (theLink.outSocket == theSocket) {
                    rlt_arr.push(theLink);
                }
            }
            return rlt_arr;
        }
    }, {
        key: "getAllLink",
        value: function getAllLink() {
            if (this.cacheData == null) {
                this.cacheData = [];
                for (var si in this.link_map) {
                    if (this.link_map[si]) {
                        this.cacheData.push(this.link_map[si]);
                    }
                }
            }
            return this.cacheData;
        }
    }, {
        key: "getJson",
        value: function getJson() {
            var rlt_arr = [];
            for (var si in this.link_map) {
                var theLink = this.link_map[si];
                if (theLink == null) continue;
                var linkJson = theLink.getJson();
                if (linkJson != null) {
                    rlt_arr.push(linkJson);
                }
            }
            return rlt_arr;
        }
    }, {
        key: "restorFromJson",
        value: function restorFromJson(linkjson_arr, createHelper) {
            var self = this;
            if (linkjson_arr != null) {
                linkjson_arr.forEach(function (linkJson) {
                    var inSocket = createHelper.getObjFromID(linkJson.inSocketID);
                    var outSocket = createHelper.getObjFromID(linkJson.outSocketID);
                    if (inSocket == null || outSocket == null) {
                        console.warn('有一个link没有加载');
                        return;
                    }
                    self.addLink(outSocket, inSocket);
                });
            }
        }
    }]);

    return ScoketLinkPool;
}();