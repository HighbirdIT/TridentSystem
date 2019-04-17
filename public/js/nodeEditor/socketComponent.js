'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_Node_Socket = function (_React$PureComponent) {
    _inherits(C_Node_Socket, _React$PureComponent);

    function C_Node_Socket(props) {
        _classCallCheck(this, C_Node_Socket);

        var _this = _possibleConstructorReturn(this, (C_Node_Socket.__proto__ || Object.getPrototypeOf(C_Node_Socket)).call(this, props));

        autoBind(_this);

        _this.flagRef = React.createRef();
        _this.inputRef = React.createRef();
        _this.state = {
            socket: _this.props.socket,
            draging: _this.props.draging == true
        };
        return _this;
    }

    _createClass(C_Node_Socket, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.editor.clickSocket(this.props.socket);
        }
    }, {
        key: 'getCenterPos',
        value: function getCenterPos() {
            var socket = this.state.socket;
            var nodeData = socket.node;
            if (nodeData.currentFrameCom == null || nodeData.currentFrameCom.rootDivRef.current == null || this.flagRef.current == null) {
                return null;
            }
            var baseRect = nodeData.currentFrameCom.rootDivRef.current.getBoundingClientRect();
            var rect = this.flagRef.current.getBoundingClientRect();
            return { x: Math.round(nodeData.left + (rect.left - baseRect.left) + rect.width * 0.5), y: Math.round(nodeData.top + (rect.top - baseRect.top) + rect.height * 0.5) };
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenData(this.state.socket);
            this.state.socket.setCurrentComponent(this);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenData(this.state.socket);
            this.state.socket.setCurrentComponent(null);
        }
    }, {
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler(ev) {
            var socket = this.state.socket;
            if (socket.node.parent == null) {
                return; // node removed
            }
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'getContent',
        value: function getContent() {}
    }, {
        key: 'listenData',
        value: function listenData(socket) {
            if (socket) {
                socket.on('changed', this.nodeDataChangedHandler);
                socket.on(Event_LinkChanged, this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(socket) {
            if (socket) {
                socket.off('changed', this.nodeDataChangedHandler);
                socket.off(Event_LinkChanged, this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            var socket = this.props.socket;
            socket.set({ defval: ev.target.value });
        }
    }, {
        key: 'checkInputChangedHandler',
        value: function checkInputChangedHandler(ev) {
            var socket = this.props.socket;
            socket.set({ defval: ev.target.checked });
        }
    }, {
        key: 'inputDDCChangedHandler',
        value: function inputDDCChangedHandler(newvalue, ddc) {
            ddc.props.socket.set({ defval: newvalue });
        }
    }, {
        key: 'mouseDownDragIconHandler',
        value: function mouseDownDragIconHandler(ev) {
            if (this.props.startDragAct != null) {
                this.props.startDragAct(this);
            }
        }
    }, {
        key: 'setDraging',
        value: function setDraging(val) {
            this.setState({
                draging: val == true
            });
        }
    }, {
        key: 'kernelChangedHandler',
        value: function kernelChangedHandler(newid, ddc) {
            ddc.props.socket.setExtra('ctlid', newid);
        }
    }, {
        key: 'render',
        value: function render() {
            var socket = this.props.socket;
            if (this.props.socket != this.state.socket) {
                var self = this;
                this.unlistenData(this.state.socket);
                this.listenData(socket);
                setTimeout(function () {
                    self.setState({
                        socket: socket
                    });
                }, 10);
                return null;
            }
            if (socket.visible == false) {
                return null;
            }
            var inputable = socket.isIn && (SqlVarInputableTypes_arr.indexOf(socket.type) != -1 || VarInputableTypes_arr.indexOf(socket.type) != -1);
            if (socket.inputable == false) {
                inputable = false;
            } else if (socket.inputable == true) {
                inputable = true;
            }
            var inputElem = null;
            if (socket.isIn && inputable && socket.autoHideInput != false) {
                var links = socket.getLinks();
                if (links.length > 0) {
                    inputable = false;
                }
            }
            if (inputable) {
                if (socket.inputDDC_setting) {
                    inputElem = React.createElement(DropDownControl, { socket: socket, options_arr: socket.inputDDC_setting.options_arr, value: socket.defval == null ? '' : socket.defval, itemChanged: this.inputDDCChangedHandler, textAttrName: socket.inputDDC_setting.textAttrName, valueAttrName: socket.inputDDC_setting.valueAttrName });
                } else if (socket.type == ValueType.Boolean) {
                    inputElem = React.createElement('input', { type: 'checkbox', ref: this.inputRef, checked: parseBoolean(socket.defval), onChange: this.checkInputChangedHandler });
                } else {
                    inputElem = React.createElement('input', { type: 'text', ref: this.inputRef, className: 'socketInputer', onChange: this.inputChangedHandler, value: socket.defval == null ? '' : socket.defval });
                }
            }
            var dragElem = null;
            if (this.props.startDragAct) {
                dragElem = React.createElement(
                    'div',
                    { className: 'btn btn-' + (this.state.draging ? 'primary' : 'dark'), onMouseDown: this.mouseDownDragIconHandler },
                    React.createElement('i', { className: 'fa fa-arrows-v cursor-pointer' })
                );
            }
            var cusElem = null;
            if (this.props.customSocketRender) {
                cusElem = this.props.customSocketRender(socket);
            } else {
                cusElem = socket.node.customSocketRender(socket);
            }
            var valTypeElem = null;
            if (socket.type == SocketType_CtlKernel) {
                var kernelType = socket.kernelType;
                if (kernelType == null) {
                    if (socket.isIn) {
                        valTypeElem = React.createElement(
                            'span',
                            { 'f-canmove': 1, className: 'badge badge-primary' },
                            '\u4EFB\u610F\u63A7\u4EF6'
                        );
                    } else {
                        valTypeElem = React.createElement(
                            'span',
                            { 'f-canmove': 1, className: 'badge badge-danger' },
                            '\u65E0\u6548'
                        );
                    }
                } else {
                    if (socket.isIn) {
                        if (socket.getLinks().length == 0) {
                            var bluePrint = socket.node.bluePrint;
                            if (bluePrint.group == EJsBluePrintFunGroup.CtlAttr || bluePrint.group == EJsBluePrintFunGroup.CtlEvent || bluePrint.group == ESqlBluePrintGroup.ControlCustom || bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
                                var ctlKernel = bluePrint.master.project.getControlById(bluePrint.ctlID);
                                if (ctlKernel != null) {
                                    var nowCtlId = socket.getExtra('ctlid');
                                    if (nowCtlId == null) {
                                        nowCtlId = 0;
                                    }
                                    inputElem = React.createElement(DropDownControl, { socket: socket, options_arr: ctlKernel.getAccessableKernels, funparamobj: kernelType, value: nowCtlId, itemChanged: this.kernelChangedHandler, textAttrName: 'readableName', valueAttrName: 'id' });
                                }
                            }
                        }
                    } else {
                        valTypeElem = React.createElement(
                            'span',
                            { 'f-canmove': 1, className: 'badge badge-primary' },
                            GetControlTypeReadableName(kernelType)
                        );
                    }
                }
            } else if (socket.type != 'flow') {
                valTypeElem = React.createElement(
                    'span',
                    { 'f-canmove': 1, className: 'badge badge-info' },
                    socket.type
                );
            }

            var arrowsItem = null;
            /*
            if(socket.node.isNeedMoveArrowBeforeSocket()){
                if(!this.props.nameMoveable){
                    arrowsItem = <i className='fa fa-arrows' f-canmove={1} />
                }
            }
            */
            var iconClass = 'fa cursor-pointer nodesocket ';
            if (socket.isFlowSocket) {
                iconClass += 'text-light fa- fa-arrow-circle-right';
            } else {
                iconClass += 'fa-circle-o';
            }
            var iconElem = React.createElement('i', { ref: this.flagRef, onClick: this.clickHandler, className: iconClass, vt: socket.type });
            if (socket.hideIcon == true) {
                iconElem = null;
            }
            return React.createElement(
                'div',
                { className: 'd-flex align-items-center text-nowrap text-light socketCell', 'd-socketid': socket.id, isin: socket.isIn ? 1 : null, isout: !socket.isIn ? 1 : null },
                arrowsItem,
                this.props.align == 'left' && React.createElement(
                    React.Fragment,
                    null,
                    iconElem,
                    valTypeElem,
                    dragElem,
                    inputElem,
                    cusElem
                ),
                React.createElement(
                    'div',
                    { 'f-canmove': 1 },
                    socket.label
                ),
                this.props.align != 'left' && React.createElement(
                    React.Fragment,
                    null,
                    cusElem,
                    inputElem,
                    dragElem,
                    valTypeElem,
                    iconElem
                )
            );
        }
    }]);

    return C_Node_Socket;
}(React.PureComponent);

var C_SqlNode_ScoketsPanel = function (_React$PureComponent2) {
    _inherits(C_SqlNode_ScoketsPanel, _React$PureComponent2);

    function C_SqlNode_ScoketsPanel(props) {
        _classCallCheck(this, C_SqlNode_ScoketsPanel);

        var _this2 = _possibleConstructorReturn(this, (C_SqlNode_ScoketsPanel.__proto__ || Object.getPrototypeOf(C_SqlNode_ScoketsPanel)).call(this, props));

        autoBind(_this2);

        _this2.socketParentRef = React.createRef();
        return _this2;
    }

    _createClass(C_SqlNode_ScoketsPanel, [{
        key: 'reRender',
        value: function reRender() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.nodedata.on(Event_SocketNumChanged, this.reRender);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.nodedata.off(Event_SocketNumChanged, this.reRender);
        }
    }, {
        key: 'clickAddIconHandler',
        value: function clickAddIconHandler(ev) {
            this.props.processFun(true);
        }
    }, {
        key: 'clickSubIconHandler',
        value: function clickSubIconHandler(ev) {
            this.props.processFun(false);
        }
    }, {
        key: 'renderDynamic',
        value: function renderDynamic() {
            if (this.props.processFun == null) return null;
            return React.createElement(
                'div',
                { className: 'socketDynamicDiv d-flex' },
                React.createElement('i', { className: 'fa fa-plus-square ml-1 text-primary fa-2x cursor-pointer', onClick: this.clickAddIconHandler }),
                React.createElement('i', { className: 'fa fa-minus-square ml-1 text-danger fa-2x cursor-pointer', onClick: this.clickSubIconHandler })
            );
        }
    }, {
        key: 'startDragSocket',
        value: function startDragSocket(targetSocketCom) {
            this.dragingSocket = targetSocketCom.props.socket;
            window.addEventListener('mouseup', this.mouseUpWhenDragingHandler);
            window.addEventListener('mousemove', this.mouseMoveWhenDragingHandler);
            targetSocketCom.setDraging(true);

            var theLinks = this.dragingSocket.node.bluePrint.linkPool.getLinksBySocket(this.dragingSocket);
            if (theLinks.length > 0) {
                var theLink = theLinks[0];
                var otherNode = theLink.inSocket == this.dragingSocket ? theLink.outSocket.node : theLink.inSocket.node;
                if (otherNode.bluePrint.master && otherNode.bluePrint.master.project) {
                    var designer = otherNode.bluePrint.master.project.designer;
                    if (designer) {
                        designer.startDrag({ info: otherNode.getNodeTitle() }, null, null);
                    }
                }
            }
        }
    }, {
        key: 'mouseUpWhenDragingHandler',
        value: function mouseUpWhenDragingHandler(ev) {
            if (this.dragingSocket.currentComponent) {
                this.dragingSocket.currentComponent.setDraging(false);
            }
            window.removeEventListener('mouseup', this.mouseUpWhenDragingHandler);
            window.removeEventListener('mousemove', this.mouseMoveWhenDragingHandler);
            this.dragingSocket = null;
        }
    }, {
        key: 'mouseMoveWhenDragingHandler',
        value: function mouseMoveWhenDragingHandler(ev) {
            if (this.dragingSocket == null) {
                mouseUpWhenDragingHandler(null);
                return;
            }
            if (this.socketParentRef.current == null) {
                return;
            }
            var sockets_arr = this.props.data;
            for (var i = 0; i < sockets_arr.length; ++i) {
                var theSocket = sockets_arr[i];
                var socketRect = theSocket.currentComponent.flagRef.current.getBoundingClientRect();
                if (ev.y > socketRect.top && ev.y < socketRect.bottom) {
                    if (theSocket == this.dragingSocket) {
                        return; // same socket
                    }
                    // swap socket
                    var dragingIndex = sockets_arr.indexOf(this.dragingSocket);
                    if (dragingIndex == -1) {
                        console.warn("dragingIndex = -1!");
                        return;
                    }
                    sockets_arr[dragingIndex] = theSocket;
                    sockets_arr[i] = this.dragingSocket;
                    this.dragingSocket.node.fireEvent(Event_SocketNumChanged);
                    this.dragingSocket.node.fireMoved(10);
                    return;
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.props.data.length == 0) return React.createElement(
                'div',
                { className: 'flex-grow-1 flex-shrink-1' },
                this.renderDynamic()
            );

            var isDynamic = this.props.processFun != null;
            return React.createElement(
                'div',
                { ref: this.socketParentRef, className: 'd-flex flex-grow-1 flex-shrink-1 flex-column align-items-' + this.props.align },
                this.props.data.map(function (socketObj) {
                    return React.createElement(C_Node_Socket, { key: socketObj.id, socket: socketObj, align: _this3.props.align == 'start' ? 'left' : 'right', editor: _this3.props.editor, nameMoveable: _this3.props.nameMoveable, startDragAct: isDynamic ? _this3.startDragSocket : null, draging: socketObj == _this3.dragingSocket, customSocketRender: _this3.props.customSocketRender });
                }),
                this.renderDynamic()
            );
        }
    }]);

    return C_SqlNode_ScoketsPanel;
}(React.PureComponent);