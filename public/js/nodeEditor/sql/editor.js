'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SqlNodeEditorControls_arr = [{
    label: '源',
    nodeClass: SqlNode_DBEntity
}, {
    label: '选择',
    nodeClass: SqlNode_Select
}, {
    label: '多元运算',
    nodeClass: SqlNode_NOperand
}, {
    label: '比较运算',
    nodeClass: SqlNode_Compare
}, {
    label: 'Join',
    nodeClass: SqlNode_XJoin
}, {
    label: '常量',
    nodeClass: SqlNode_ConstValue
}, {
    label: 'RowNumber',
    nodeClass: SqlNode_RowNumber
}, {
    label: 'IsNull()',
    nodeClass: SqlNode_IsNullFun
}, {
    label: 'IsNullOperator',
    nodeClass: SqlNode_IsNullOperator
}, {
    label: '逻辑运算',
    nodeClass: SqlNode_Logical_Operator
}, {
    label: '环境变量',
    nodeClass: SqlNode_Env_Var
}];

var C_SqlNode_Editor = function (_React$PureComponent) {
    _inherits(C_SqlNode_Editor, _React$PureComponent);

    function C_SqlNode_Editor(props) {
        _classCallCheck(this, C_SqlNode_Editor);

        var _this = _possibleConstructorReturn(this, (C_SqlNode_Editor.__proto__ || Object.getPrototypeOf(C_SqlNode_Editor)).call(this, props));

        var editingNode = _this.props.bluePrint;
        if (_this.props.bluePrint.group != 'custom') {
            editingNode = _this.props.bluePrint.finalSelectNode;
        }

        _this.state = {
            draing: false,
            showLink: false,
            scale: 1,
            editingNode: editingNode
        };

        var self = _this;
        setTimeout(function () {
            _this.setState({
                showLink: true
            });
        }, 50);

        autoBind(_this);
        _this.dragingPathRef = React.createRef();
        _this.editorDivRef = React.createRef();
        _this.containerRef = React.createRef();
        _this.topBarRef = React.createRef();
        _this.zoomDivRef = React.createRef();
        _this.selectRectRef = React.createRef();
        _this.logManager = new LogManager('sqlnodeEditorLogManager');

        var editor = _this;
        _this.selectedNFManager = new SelectItemManager(_this.cb_addNF, _this.cb_removeNF);
        if (editingNode) {
            editingNode.preEditing(_this);
        }
        return _this;
    }

    _createClass(C_SqlNode_Editor, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'blueprinkChanged',
        value: function blueprinkChanged(ev) {
            this.reDraw();
        }
    }, {
        key: 'cb_removeNF',
        value: function cb_removeNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(false);
            }
        }
    }, {
        key: 'cb_addNF',
        value: function cb_addNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(true);
            }
        }
    }, {
        key: 'setSelectedNF',
        value: function setSelectedNF(target, addMode) {
            if (target == null) {
                this.selectedNFManager.clear();
                return;
            }
            if (this.selectedNFManager.isSelected(target)) {
                return;
            }
            if (addMode == null || target == null) {
                addMode = false;
            }
            if (!addMode) {
                this.selectedNFManager.clear();
            }
            this.selectedNFManager.add(target);
        }
    }, {
        key: 'showNodeData',
        value: function showNodeData(nodeData) {
            var editingNode = this.state.editingNode;
            if (nodeData.bluePrint == null || nodeData.bluePrint != editingNode.bluePrint || nodeData.parent == null) return;

            if (editingNode != nodeData.parent) {
                this.setEditeNode(nodeData.parent);
                var self = this;
                setTimeout(function () {
                    self.showNodeData(nodeData);
                }, 50);
                return;
            }

            if (nodeData.currentComponent) {
                var frameElem = nodeData.currentComponent.frameRef.current;
                if (frameElem == null) return null;
                this.setSelectedNF(frameElem);
                var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
                var zoomRect = this.zoomDivRef.current.getBoundingClientRect();

                if (!MyMath.intersectRect(frameRect, zoomRect)) {
                    var targetPos = {
                        x: Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                        y: Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5)
                    };
                    //console.log(targetPos);
                    this.editorDivRef.current.style.left = targetPos.x + 'px';
                    this.editorDivRef.current.style.top = targetPos.y + 'px';
                }
            }
        }
    }, {
        key: 'keyUpHandler',
        value: function keyUpHandler(ev) {
            //console.log(ev);
            switch (ev.keyCode) {
                case 27:
                    // esc
                    if (!this.selectedNFManager.isEmpty()) {
                        this.setSelectedNF(null);
                    }
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                case 46:
                    if (!this.selectedNFManager.isEmpty()) {
                        var titles = '';
                        var nodes_arr = [];
                        this.selectedNFManager.forEach(function (nf) {
                            titles += nf.getNodeTitle(true) + ';';
                            nodes_arr.push(nf.props.nodedata);
                        });
                        this.wantDeleteNode(nodes_arr, titles);
                    }
                    break;
            }
        }
    }, {
        key: 'keyDownHandler',
        value: function keyDownHandler(ev) {
            if (!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40) {
                var offset = { x: 0, y: 0 };
                switch (ev.keyCode) {
                    case 40:
                        offset.y = 10;
                        break;
                    case 38:
                        offset.y = -10;
                        break;
                    case 37:
                        offset.x = -10;
                        break;
                    case 39:
                        offset.x = 10;
                        break;
                }
                this.selectedNFManager.forEach(function (nf) {
                    nf.addOffset(offset);
                });
                ev.preventDefault();
            }
        }
    }, {
        key: 'nodeFrameStartMove',
        value: function nodeFrameStartMove(srcNF) {
            if (this.selectedNFManager.count() > 1) {
                var srcPos = { x: srcNF.props.nodedata.left, y: srcNF.props.nodedata.top };
                this.selectedNFManager.forEach(function (nf) {
                    if (nf == srcNF) {
                        return;
                    }
                    nf.offsetBase = { x: nf.props.nodedata.left - srcPos.x, y: nf.props.nodedata.top - srcPos.y };
                });
            }
        }
    }, {
        key: 'nodeFrameMoving',
        value: function nodeFrameMoving(srcNF) {
            if (this.selectedNFManager.count() > 1) {
                var srcPos = { x: srcNF.props.nodedata.left, y: srcNF.props.nodedata.top };
                this.selectedNFManager.forEach(function (nf) {
                    if (nf == srcNF) {
                        return;
                    }
                    var theNode = nf.props.nodedata;
                    var offsetBase = nf.offsetBase;
                    theNode.setPos(srcPos.x + offsetBase.x, srcPos.y + offsetBase.y);
                    nf.reDraw();
                });
            }
        }
    }, {
        key: 'wantDeleteNode',
        value: function wantDeleteNode(nodeData_arr, title) {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除' + nodeData_arr.length + '个节点:"' + title + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], nodeData_arr));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key, nodeData_arr) {
            if (key == 'ok') {
                this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
                this.setSelectedNF(null);
            }
        }
    }, {
        key: 'freshZoomDiv',
        value: function freshZoomDiv() {
            if (this.zoomDivRef.current) {
                var zoomDivElem = this.zoomDivRef.current;
                var $containerElem = $(this.containerRef.current);
                var $topBarElem = $(this.topBarRef.current);

                var newZoomDivSize = {
                    height: $containerElem.height() - $topBarElem.height(),
                    width: $containerElem.width(),
                    top: $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
                };

                if (this.preZoomDivSize == null) {
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                } else {
                    if (Math.abs(this.preZoomDivSize.height - newZoomDivSize.height) > 1) {
                        zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.width - newZoomDivSize.width) > 1) {
                        zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.top - newZoomDivSize.top) > 1) {
                        zoomDivElem.style.top = newZoomDivSize.top + 'px';
                    }
                }

                this.preZoomDivSize = newZoomDivSize;
            }
        }
    }, {
        key: 'listenBlueprint',
        value: function listenBlueprint(bp) {
            if (bp) {
                bp.on('changed', this.blueprinkChanged);
            };
            this.listenedBP = bp;
        }
    }, {
        key: 'unlistenBlueprint',
        value: function unlistenBlueprint(bp) {
            if (bp) {
                bp.off('changed', this.blueprinkChanged);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this2 = this;

            window.addEventListener('keyup', this.keyUpHandler);
            window.addEventListener('keydown', this.keyDownHandler);

            this.freshInt = setInterval(this.freshZoomDiv, 500);
            this.freshZoomDiv();

            if (this.state.editingNode) {
                var theNode = this.state.editingNode;
                setTimeout(function () {
                    _this2.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                    _this2.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
                }, 50);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.bluePrint) {
                this.props.bluePrint.genColumns();
            }
            window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            window.removeEventListener('keyup', this.keyUpHandler);
            window.removeEventListener('keydown', this.keyDownHandler);
            this.unlistenBlueprint(this.props.bluePrint);
            clearTimeout(this.delaySetTO);
            clearInterval(this.freshZoomDiv);
        }
    }, {
        key: 'mousemoveWidthDragingHandler',
        value: function mousemoveWidthDragingHandler(ev) {
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            var end = { x: ev.x - rootRect.left, y: ev.y - rootRect.top };
            var dragingPath = this.dragingPathRef.current;
            dragingPath.setState({
                end: end
            });
        }
    }, {
        key: 'mouseupWidthDragingHandler',
        value: function mouseupWidthDragingHandler(ev) {
            if (ev.target == this.editorDivRef.current) {
                if (this.preClickTime != null && Date.now() - this.preClickTime < 200) {
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                } else {
                    this.preClickTime = Date.now();
                    return;
                }
            }
        }
    }, {
        key: 'clickSocket',
        value: function clickSocket(srcSocket) {
            var srcNode = srcSocket.node;
            var dragingPath = this.dragingPathRef.current;
            if (dragingPath.state.draging == true) {
                var cancelDrag = false;
                if (srcSocket == dragingPath.state.startScoket) {
                    // 同一个socket连续点击
                    cancelDrag = true;
                } else if (dragingPath.state.startNode == srcNode) {
                    // 相同的node 忽略
                    //console.log('相同的node');
                    return;
                } else {
                    // 点击了不同的socket
                    if (srcSocket.isIn != dragingPath.state.startScoket.isIn) {
                        // 不同node的in out才能相互链接
                        this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                        cancelDrag = true;
                    }
                }
                if (cancelDrag) {
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                }
            } else {
                var rootRect = this.editorDivRef.current.getBoundingClientRect();
                dragingPath.setState({
                    draging: true,
                    start: srcSocket.currentComponent.getCenterPos(),
                    end: { x: WindowMouse.x - rootRect.left, y: WindowMouse.y - rootRect.top },
                    startScoket: srcSocket,
                    startNode: srcNode
                });
                window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }
    }, {
        key: 'setEditeNode',
        value: function setEditeNode(theNode) {
            var _this3 = this;

            if (theNode == this.state.editingNode) {
                return;
            }

            var editingNode = this.state.editingNode;
            if (editingNode && this.editorDivRef.current) {
                editingNode.editorLeft = parseUnitInt(this.editorDivRef.current.style.left);
                editingNode.editorTop = parseUnitInt(this.editorDivRef.current.style.top);
                editingNode.postEditing(this);
            }

            this.setState({
                draging: false,
                editingNode: theNode,
                scale: 1,
                showLink: false
            });

            var self = this;
            setTimeout(function () {
                _this3.setState({
                    showLink: true
                });
            }, 50);

            if (theNode) {
                theNode.preEditing(this);
                theNode.bluePrint.editingNode = theNode;
                setTimeout(function () {
                    _this3.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                    _this3.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
                }, 50);
            }
        }
    }, {
        key: 'genSqlNode_Component',
        value: function genSqlNode_Component(CName, nodeData) {
            var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
            return React.createElement(CName, { key: blueprintPrefix + nodeData.id, nodedata: nodeData, editorDivRef: this.editorDivRef, editor: this });
        }
    }, {
        key: 'renderNode',
        value: function renderNode(nodeData) {
            if (nodeData == null) return null;
            var settting = SqlNodeClassMap[nodeData.type];
            if (settting == null) {
                console.warn(nodeData.type + ' 节点类型找不到映射');
                return null;
            }
            return this.genSqlNode_Component(settting.comClass, nodeData);
        }
    }, {
        key: 'transToEditorPos',
        value: function transToEditorPos(pt) {
            var $zoomDivElem = $(this.zoomDivRef.current);
            var zoomOffset = $zoomDivElem.offset();

            var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
            var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
            return {
                x: x,
                y: y
            };
        }
    }, {
        key: 'addVarGSNode',
        value: function addVarGSNode(config, windPos) {
            var editingNode = this.state.editingNode;
            //var $zoomDivElem = $(this.zoomDivRef.current);
            //var zoomOffset = $zoomDivElem.offset();

            //var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
            //var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
            var editorPos = this.transToEditorPos(windPos);
            var newNodeData = null;
            if (config.isGet) {
                newNodeData = new SqlNode_Var_Get({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            } else {
                newNodeData = new SqlNode_Var_Set({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            }
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'mouseDownNodeCtlrHandler',
        value: function mouseDownNodeCtlrHandler(ctlData) {
            var editorDiv = this.editorDivRef.current;
            var editingNode = this.state.editingNode;
            var posLeft = -parseUnitInt(editorDiv.style.left);
            var posTop = -parseUnitInt(editorDiv.style.top);
            var newNodeData = new ctlData.nodeClass({ newborn: true, left: posLeft, top: posTop }, editingNode);
            if (newNodeData.type == SQLNODE_CASE_WHEN) {

                var newCWNode = new SqlNode_CW_When({ left: posLeft, top: posTop }, editingNode);
                editingNode.bluePrint.linkPool.addLink(newCWNode.outSocket, newNodeData.inputScokets_arr[0]);
                var self = this;

                var newElseNode = new SqlNode_CW_Else({ left: posLeft, top: posTop }, editingNode);
                editingNode.bluePrint.linkPool.addLink(newElseNode.outSocket, newNodeData.inputScokets_arr[1]);
                setTimeout(function () {
                    newCWNode.left = newNodeData.left - 200;
                    newCWNode.top = newNodeData.top - 50;
                    self.setSelectedNF(newCWNode.currentFrameCom, true);

                    newElseNode.left = newNodeData.left - 200;
                    newElseNode.top = newNodeData.top + 100;
                    self.setSelectedNF(newElseNode.currentFrameCom, true);
                    self.nodeFrameStartMove(newNodeData.currentFrameCom);
                }, 100);
            }
            this.setState({
                magicObj: {}

            });
        }
    }, {
        key: 'mousemoveWithDragHandler',
        value: function mousemoveWithDragHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            //var scrollNode = this.editorDivRef.current.parentNode;
            //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
            //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
            //console.log(offset);
            var editingNode = this.state.editingNode;
            editingNode.editorLeft = this.dragOrgin.left + offset.x;
            editingNode.editorTop = this.dragOrgin.top + offset.y;
            this.editorDivRef.current.style.left = editingNode.editorLeft + 'px';
            this.editorDivRef.current.style.top = editingNode.editorTop + 'px';
        }
    }, {
        key: 'mouseupWithDragHandler',
        value: function mouseupWithDragHandler(ev) {
            this.draging = false;
            window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
            window.removeEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }, {
        key: 'mousemoveWithSelectHandler',
        value: function mousemoveWithSelectHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            this.selectRectRef.current.setSize({
                width: offset.x,
                height: offset.y
            });
        }
    }, {
        key: 'mouseupWithSelectHandler',
        value: function mouseupWithSelectHandler(ev) {
            // check
            var theRect = this.selectRectRef.current.getRect();
            var hitNodes_arr = [];
            this.state.editingNode.nodes_arr.forEach(function (node) {
                var nodeRect = node.getRect();
                if (MyMath.intersectRect(nodeRect, theRect)) {
                    hitNodes_arr.push(node);
                }
            });
            if (!ev.ctrlKey) {
                this.selectedNFManager.clear();
            }
            if (hitNodes_arr.length > 0) {
                for (var i in hitNodes_arr) {
                    this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
                }
            }

            window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
            window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
            this.selectRectRef.current.setSize({
                width: 0,
                height: 0
            });
        }
    }, {
        key: 'rootMouseDownHandler',
        value: function rootMouseDownHandler(ev) {
            if (ev.target == this.zoomDivRef.current && this.draging != true) {
                var nowPos = {
                    x: parseUnitInt(this.editorDivRef.current.style.left),
                    y: parseUnitInt(this.editorDivRef.current.style.top)
                };
                this.dragOrgin = { x: WindowMouse.x, y: WindowMouse.y, left: nowPos.x, top: nowPos.y };
                if (ev.button == 0) {
                    // 拉取选择范围
                    var editorPos = this.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });
                    this.selectRectRef.current.setSize({
                        left: editorPos.x,
                        top: editorPos.y
                    });
                    window.addEventListener('mousemove', this.mousemoveWithSelectHandler);
                    window.addEventListener('mouseup', this.mouseupWithSelectHandler);
                    return;
                }
                this.draging = true;
                //var scrollNode = this.editorDivRef.current.parentNode;
                //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
                window.addEventListener('mousemove', this.mousemoveWithDragHandler);
                window.addEventListener('mouseup', this.mouseupWithDragHandler);
            }
        }
    }, {
        key: 'mouseWhileHandler',
        value: function mouseWhileHandler(ev) {
            console.log(ev);
        }
    }, {
        key: 'clickBigBtnHandler',
        value: function clickBigBtnHandler(ev) {
            var newScale = Math.min(this.state.scale + 0.1, 1);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickSmallBtnHandler',
        value: function clickSmallBtnHandler(ev) {
            var newScale = Math.max(this.state.scale - 0.1, 0.3);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickNavBtnHandler',
        value: function clickNavBtnHandler(ev) {
            var nodeId = getAttributeByNode(ev.target, 'data-id');
            if (nodeId == null) return;
            var theNode = this.props.bluePrint.getNodeByID(nodeId);
            if (theNode == this.state.editingNode) {
                return;
            }
            this.setEditeNode(theNode);
        }
    }, {
        key: 'clickCompileBtnHandler',
        value: function clickCompileBtnHandler(ev) {
            var theBluePrint = this.props.bluePrint;
            this.logManager.clear();
            this.logManager.log("开始编译[" + theBluePrint.name + ']');
            var compileHelper = new SqlNode_CompileHelper(this.logManager, this);
            var compileRet = theBluePrint.compile(compileHelper);
            if (compileRet == false) {
                this.logManager.log('[' + theBluePrint.name + ']编译失败');
            } else {
                this.logManager.log('[' + theBluePrint.name + ']编译成功');
                this.logManager.log(compileRet.varDeclareStr + compileRet.sql);
            }
            this.logManager.log('共' + this.logManager.getCount(LogTag_Warning) + '条警告,' + this.logManager.getCount(LogTag_Error) + '条错误,');
        }
    }, {
        key: 'clickExportBtnHandler',
        value: function clickExportBtnHandler(ev) {
            console.log("Start export");
            var editingNode = this.state.editingNode;
            var json = editingNode.bluePrint.getJson();
            var text = JSON.stringify(json);
            console.log(text);
        }
    }, {
        key: 'createNewNode',
        value: function createNewNode(nodeClass, initData) {
            var editorDiv = this.editorDivRef.current;
            var editingNode = this.state.editingNode;
            var newNode = new nodeClass(Object.assign({
                newborn: true,
                left: -parseUnitInt(editorDiv.style.left),
                top: -parseUnitInt(editorDiv.style.top)
            }, initData), editingNode);

            this.setState({
                magicObj: {}
            });
            return newNode;
        }
    }, {
        key: 'createCanUseDS',
        value: function createCanUseDS(dsconfig) {
            this.createNewNode(SqlNode_CurrentDataRow, {
                formID: dsconfig.formID,
                dscode: dsconfig.entity.code,
                dsentity: dsconfig.entity
            });
        }
    }, {
        key: 'createApiObj',
        value: function createApiObj(apiClass, apiItem) {
            switch (apiItem.type) {
                case EApiType.Prop:
                    this.createNewNode(SqlNode_Control_Api_Prop, {
                        apiClass: apiClass,
                        apiItem: apiItem
                    });
                    break;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var editingNode = this.state.editingNode;
            if (this.props.bluePrint != editingNode.bluePrint) {
                var self = this;
                this.selectedNFManager.clear(false);
                clearTimeout(this.delaySetTO);
                this.delaySetTO = setTimeout(function () {
                    _this4.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint);
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
            nodeParentList.push(editingNode);
            if (this.editorDivRef.current) {
                this.editorDivRef.current.scale = this.state.scale;
            }
            var self = this;
            var blueprintPrefix = editingNode.bluePrint.id + '_';
            if (this.listenedBP != editingNode.bluePrint) {
                this.unlistenBlueprint(this.listenedBP);
                this.listenBlueprint(editingNode.bluePrint);
            }
            var linkPool = editingNode.bluePrint.linkPool;

            return React.createElement(SplitPanel, {
                defPercent: 0.2,
                maxSize: '400px',
                barClass: 'bg-secondary',
                panel1: React.createElement(SqlNodeEditorLeftPanel, { onMouseDown: this.mouseDownNodeCtlrHandler, editingNode: editingNode, editorDivRef: this.editorDivRef, editor: self }),
                panel2: React.createElement(SplitPanel, {
                    defPercent: 0.8,
                    barClass: 'bg-secondary',
                    flexColumn: true,
                    panel1: React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column', ref: this.containerRef },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-0 flex-shrink-0 border bg-light ', style: { height: '40px' }, ref: this.topBarRef },
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-grow-1 flex-shrink-1' },
                                React.createElement(
                                    'ul',
                                    { className: 'nav nav-pills flex-grow-1 flex-shrink-1' },
                                    nodeParentList.map(function (nodeData) {
                                        return React.createElement(
                                            'li',
                                            { className: 'nav-item', key: nodeData.id },
                                            React.createElement(
                                                'a',
                                                { className: "nav-link" + (nodeData == editingNode ? ' active' : ''), href: '#', 'data-id': nodeData.id, onClick: _this4.clickNavBtnHandler },
                                                nodeData.getNodeTitle(),
                                                nodeData != editingNode && React.createElement('i', { className: 'fa fa-angle-right ml-1' })
                                            )
                                        );
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'btn-group flex-grow-0 flex-shrink-0' },
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickCompileBtnHandler, className: 'btn btn-dark' },
                                        '\u7F16\u8BD1'
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickExportBtnHandler, className: 'btn btn-dark' },
                                        '\u5BFC\u51FA'
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickBigBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-plus' })
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickSmallBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-minus' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 position-absolute hidenOverflow', style: { zoom: this.state.scale }, ref: this.zoomDivRef, onMouseDown: this.rootMouseDownHandler },
                            React.createElement(
                                'div',
                                { ref: this.editorDivRef, className: 'd-block position-absolute bg-dark', style: { width: '10px', height: '10px', overflow: 'visible' } },
                                editingNode.nodes_arr.map(function (nd) {
                                    return _this4.renderNode(nd); //<G_Node key={nd.id} data={nd} />
                                }),
                                React.createElement(C_Node_Link, { ref: this.dragingPathRef, editorDivRef: this.editorDivRef }),
                                this.state.showLink && linkPool.getAllLink().map(function (linkobj) {
                                    return React.createElement(C_Node_Link, { key: blueprintPrefix + linkobj.id, link: linkobj, editorDivRef: _this4.editorDivRef });
                                }),
                                React.createElement(C_SelectRect, { ref: this.selectRectRef })
                            )
                        )
                    ),
                    panel2: React.createElement(
                        'div',
                        { className: 'bg-dark m-100 h-100 flex-grow-1 flex-shrink-1' },
                        React.createElement(LogOutputPanel, { source: this.logManager })
                    )
                })
            });
        }
    }]);

    return C_SqlNode_Editor;
}(React.PureComponent);

var SqlNodeEditorLeftPanel = function (_React$PureComponent2) {
    _inherits(SqlNodeEditorLeftPanel, _React$PureComponent2);

    function SqlNodeEditorLeftPanel(props) {
        _classCallCheck(this, SqlNodeEditorLeftPanel);

        var _this5 = _possibleConstructorReturn(this, (SqlNodeEditorLeftPanel.__proto__ || Object.getPrototypeOf(SqlNodeEditorLeftPanel)).call(this, props));

        autoBind(_this5);
        return _this5;
    }

    _createClass(SqlNodeEditorLeftPanel, [{
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('changed', this.editingNodeChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('changed', this.editingNodeChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            //listenNode(this.state.editingNode);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'editingNodeChangedhandler',
        value: function editingNodeChangedhandler() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'clickOutlineImteHandler',
        value: function clickOutlineImteHandler(nodeData) {
            this.props.editor.showNodeData(nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            if (this.listenedNode != this.props.editingNode) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode);
            }
            return React.createElement(SplitPanel, {
                fixedOne: true,
                maxSize: 200,
                defPercent: 0.3,
                flexColumn: true,
                panel1: React.createElement(
                    'div',
                    { className: 'w-100 h-100 autoScroll d-flex flex-column' },
                    this.props.editingNode.nodes_arr.map(function (nodeData) {
                        return React.createElement(SqlNodeOutlineItem, { key: nodeData.id, nodeData: nodeData, clickHandler: _this6.clickOutlineImteHandler });
                    })
                ),
                panel2: React.createElement(
                    'div',
                    { className: 'd-flex flex-column h-100 w-100' },
                    React.createElement(SqlNodeEditorVariables, { editingNode: this.props.editingNode, editor: this.props.editor }),
                    React.createElement(SqlNodeEditorCanUseNodePanel, { editingNode: this.props.editingNode, onMouseDown: this.props.onMouseDown, editor: this.props.editor })
                )
            });
        }
    }]);

    return SqlNodeEditorLeftPanel;
}(React.PureComponent);

var SqlNodeEditorCanUseNodePanel = function (_React$PureComponent3) {
    _inherits(SqlNodeEditorCanUseNodePanel, _React$PureComponent3);

    function SqlNodeEditorCanUseNodePanel(props) {
        _classCallCheck(this, SqlNodeEditorCanUseNodePanel);

        var _this7 = _possibleConstructorReturn(this, (SqlNodeEditorCanUseNodePanel.__proto__ || Object.getPrototypeOf(SqlNodeEditorCanUseNodePanel)).call(this, props));

        autoBind(_this7);
        _this7.state = {
            canUseDS_arr: [],
            showCanUseDS: true,
            showCtlApi: false
        };
        return _this7;
    }

    _createClass(SqlNodeEditorCanUseNodePanel, [{
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var ctlItem = SqlNodeEditorControls_arr.find(function (item) {
                return item.label == itemValue;
            });
            if (ctlItem) {
                this.props.onMouseDown(ctlItem);
            }
        }
    }, {
        key: 'scanBlueprint',
        value: function scanBlueprint(bluePrint) {
            this.scanedBP = bluePrint;
            if (bluePrint == null) {
                return;
            }
            var scriptMaster = bluePrint.master;
            var project = scriptMaster.project;
            var logManager = this.props.editor.logManager;
            logManager.clear();
            var canUseDS_arr = [];
            if (bluePrint.group == 'ctlcus') {
                // 控件类型,获取上下文
                var ctlKernel = project.getControlById(bluePrint.ctlID);
                if (bluePrint.ctlID == null || ctlKernel == null) {
                    logManager.error('本蓝图没有找到相应的控件[' + bluePrint.ctlID + ']');
                    return;
                }
                // 获取可用的数据源
                var parentForms_arr = ctlKernel.searchParentKernel(M_FormKernel_Type);
                if (parentForms_arr != null) {
                    parentForms_arr.forEach(function (formKernel) {
                        var useDS = formKernel.getAttribute(AttrNames.DataSource);
                        if (useDS != null) {
                            canUseDS_arr.push({
                                entity: useDS,
                                label: formKernel.getReadableName() + '当前行',
                                formID: formKernel.id
                            });
                        }
                    });
                }
            }
            logManager.log(canUseDS_arr.length);
            console.log(canUseDS_arr);
            //console.log(canUseDS_arr);
            this.setState({
                canUseDS_arr: canUseDS_arr
            });
        }
    }, {
        key: 'mouseDownCanUseDSHandler',
        value: function mouseDownCanUseDSHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var theDSItem = this.state.canUseDS_arr.find(function (e) {
                return e.formID == itemValue;
            });
            if (theDSItem) {
                this.props.editor.createCanUseDS(theDSItem);
            }
        }
    }, {
        key: 'clickCanUseDSHeader',
        value: function clickCanUseDSHeader(ev) {
            this.setState({ showCanUseDS: !this.state.showCanUseDS });
        }
    }, {
        key: 'clickCtlApiHeader',
        value: function clickCtlApiHeader(ev) {
            this.setState({ showCtlApi: !this.state.showCtlApi });
        }
    }, {
        key: 'clickControlAPIHandler',
        value: function clickControlAPIHandler(ev) {
            var ctltype = getAttributeByNode(ev.target, 'data-ctltype');
            if (ctltype == null) return;
            var apiid = getAttributeByNode(ev.target, 'data-apiid');
            if (apiid == null) return;
            var theApiObj = g_controlApi_arr.find(function (e) {
                return e.ctltype == ctltype;
            });
            var apiItem = theApiObj.getApiItemByid(apiid);
            this.props.editor.createApiObj(theApiObj, apiItem);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var editingBP = this.props.editingNode.bluePrint;
            if (editingBP != this.scanedBP) {
                if (this.scanTimeout == null) {
                    var self = this;
                    setTimeout(function () {
                        self.scanBlueprint(editingBP);
                        self.scanTimeout = null;
                    }, 10);
                }
                return null;
            }

            var canUseDS_arr = this.state.canUseDS_arr;
            var showCanUseDS = this.state.showCanUseDS;
            var showCtlApi = this.state.showCtlApi;
            if (editingBP.ctlID == null) {
                showCtlApi = null;
                showCanUseDS = null;
            }
            var targetID = this.props.editingNode.bluePrint.code + 'canUseNode';
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'button',
                    { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                    '\u8282\u70B9'
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-1 flex-shrink-1 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        canUseDS_arr.length > 0 && React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-shrink-0' },
                                React.createElement(
                                    'span',
                                    { onClick: this.clickCanUseDSHeader, className: 'btn btn-info flex-grow-1 flex-shrink-1' },
                                    '\u4F5C\u7528\u57DF\u6570\u636E',
                                    showCanUseDS ? '-' : '+'
                                )
                            ),
                            showCanUseDS && React.createElement(
                                'div',
                                { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                                canUseDS_arr.map(function (item) {
                                    return React.createElement(
                                        'button',
                                        { key: item.formID, onMouseDown: _this8.mouseDownCanUseDSHandler, 'data-value': item.formID, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                        item.label
                                    );
                                })
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                            editingBP.ctlID != null && React.createElement(
                                'span',
                                { className: 'btn btn-info', onClick: this.clickCtlApiHeader },
                                '\u63A7\u4EF6\u63A5\u53E3',
                                showCtlApi ? '-' : '+'
                            ),
                            showCtlApi && g_controlApi_arr.map(function (ctlApi) {
                                var rlt = [];
                                ctlApi.allapi_arr.forEach(function (apiItem, index) {
                                    if (apiItem.type != EApiType.Prop) {
                                        return;
                                    }
                                    rlt.push(React.createElement(
                                        'button',
                                        { key: apiItem.uniqueID, onMouseDown: _this8.clickControlAPIHandler, 'data-ctltype': ctlApi.ctltype, 'data-apiid': apiItem.id, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                        apiItem.toString()
                                    ));
                                });
                                return rlt;
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                            React.createElement(
                                'span',
                                { className: 'btn btn-info' },
                                'SQL\u8282\u70B9'
                            ),
                            SqlNodeEditorControls_arr.map(function (item) {
                                return React.createElement(
                                    'button',
                                    { key: item.label, onMouseDown: _this8.mouseDownHandler, 'data-value': item.label, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                    item.label
                                );
                            })
                        )
                    )
                )
            );
        }
    }]);

    return SqlNodeEditorCanUseNodePanel;
}(React.PureComponent);

var SqlNodeEditorVariables = function (_React$PureComponent4) {
    _inherits(SqlNodeEditorVariables, _React$PureComponent4);

    function SqlNodeEditorVariables(props) {
        _classCallCheck(this, SqlNodeEditorVariables);

        var _this9 = _possibleConstructorReturn(this, (SqlNodeEditorVariables.__proto__ || Object.getPrototypeOf(SqlNodeEditorVariables)).call(this, props));

        autoBind(_this9);
        return _this9;
    }

    _createClass(SqlNodeEditorVariables, [{
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var ctlItem = SqlNodeEditorControls_arr.find(function (item) {
                return item.label == itemValue;
            });
            if (ctlItem && this.props.onMouseDown) {
                this.props.onMouseDown(ctlItem);
            }
        }
    }, {
        key: 'clickAddHandler',
        value: function clickAddHandler(ev) {
            this.props.editingNode.bluePrint.createEmptyVariable();
        }
    }, {
        key: 'varChangedhandler',
        value: function varChangedhandler() {
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('varChanged', this.varChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('varChanged', this.varChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            if (this.listenedNode != this.props.editingNode.bluePrint) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode.bluePrint);
            }
            var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
            var targetID = blueprintPrefix + 'variables';
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center' },
                    React.createElement(
                        'button',
                        { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                        ' \u53D8\u91CF'
                    ),
                    React.createElement('i', { className: 'fa fa-plus fa-lg text-light cursor-pointer', onClick: this.clickAddHandler, style: { width: '30px' } })
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-0 flex-shrink-0 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100' },
                            this.props.editingNode.bluePrint.vars_arr.map(function (varData) {
                                return React.createElement(SqlDef_Variable_Component, { belongNode: _this10.props.editingNode, key: blueprintPrefix + varData.id, varData: varData, editor: _this10.props.editor });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return SqlNodeEditorVariables;
}(React.PureComponent);

var SqlNodeOutlineItem = function (_React$PureComponent5) {
    _inherits(SqlNodeOutlineItem, _React$PureComponent5);

    function SqlNodeOutlineItem(props) {
        _classCallCheck(this, SqlNodeOutlineItem);

        var _this11 = _possibleConstructorReturn(this, (SqlNodeOutlineItem.__proto__ || Object.getPrototypeOf(SqlNodeOutlineItem)).call(this, props));

        autoBind(_this11);

        _this11.state = {
            label: _this11.props.nodeData.getNodeTitle(true),
            nodeData: _this11.props.nodeData
        };
        return _this11;
    }

    _createClass(SqlNodeOutlineItem, [{
        key: 'listenNode',
        value: function listenNode(target) {
            target.on('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(target) {
            target.off('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenNode(this.state.nodeData);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.state.nodeData);
        }
    }, {
        key: 'nodeChangedhandler',
        value: function nodeChangedhandler() {
            this.setState({
                label: this.state.nodeData.getNodeTitle()
            });
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.clickHandler(this.state.nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.nodeData != this.props.nodeData) {
                this.unlistenNode(this.state.nodeData);
                this.listenNode(this.props.nodeData);
                var self = this;
                var newNodeData = this.props.nodeData;
                setTimeout(function () {
                    self.setState({
                        nodeData: newNodeData,
                        label: newNodeData.getNodeTitle(true)
                    });
                }, 20);
                return null;
            }
            return React.createElement(
                'div',
                { className: 'text-nowrap text-light cursor-pointer', onClick: this.clickHandler },
                this.state.label
            );
        }
    }]);

    return SqlNodeOutlineItem;
}(React.PureComponent);

var SqlDef_Variable_Component = function (_React$PureComponent6) {
    _inherits(SqlDef_Variable_Component, _React$PureComponent6);

    function SqlDef_Variable_Component(props) {
        _classCallCheck(this, SqlDef_Variable_Component);

        var _this12 = _possibleConstructorReturn(this, (SqlDef_Variable_Component.__proto__ || Object.getPrototypeOf(SqlDef_Variable_Component)).call(this, props));

        var varData = _this12.props.varData;
        _this12.state = {
            name: varData.name,
            valType: varData.valType,
            isParam: varData.isParam,
            size_1: varData.size_1,
            size_2: varData.size_2,
            editing: varData.needEdit == true
        };

        autoBind(_this12);
        return _this12;
    }

    _createClass(SqlDef_Variable_Component, [{
        key: 'varChanged',
        value: function varChanged() {
            if (this.state.editing) {
                return;
            }
            var varData = this.props.varData;
            this.setState({
                name: varData.name,
                valType: varData.valType,
                isParam: varData.isParam,
                size_1: varData.size_1,
                size_2: varData.size_2
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.varData.on('changed', this.varChanged);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.varData.off('changed', this.varChanged);
        }
    }, {
        key: 'nameInputChangeHanlder',
        value: function nameInputChangeHanlder(ev) {
            this.setState({
                name: ev.target.value
            });
        }
    }, {
        key: 'valTypeChangedHandler',
        value: function valTypeChangedHandler(newData) {
            this.setState({
                valType: newData
            });
        }
    }, {
        key: 'isParamChangedHandler',
        value: function isParamChangedHandler(newData) {
            this.setState({
                isParam: newData
            });
        }
    }, {
        key: 'size1InputChangedHandler',
        value: function size1InputChangedHandler(newVal) {
            this.setState({
                size_1: isNaN(newVal) ? 0 : parseInt(newVal)
            });
        }
    }, {
        key: 'size2InputChangedHandler',
        value: function size2InputChangedHandler(newVal) {
            this.setState({
                size_2: isNaN(newVal) ? 0 : parseInt(newVal)
            });
        }
    }, {
        key: 'renderSize',
        value: function renderSize() {
            var sizeCount = 0;
            switch (this.state.valType) {
                case SqlVarType_NVarchar:
                    sizeCount = 1;
                    break;
                case SqlVarType_Decimal:
                    sizeCount = 2;
                    break;
            }
            if (sizeCount > 0) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 w-100' },
                    React.createElement(NameInputRow, { isagent: true, label: 'S1', type: 'int', rootClass: 'flex-grow-1 flex-shrink-1', value: this.state.size_1, nameWidth: '50px', nameColor: 'rgb(255,255,255)', onValueChanged: this.size1InputChangedHandler }),
                    sizeCount == 2 ? React.createElement(NameInputRow, { isagent: true, label: 'S2', type: 'int', rootClass: 'flex-grow-1 flex-shrink-1', value: this.state.size_2, nameWidth: '50px', nameColor: 'rgb(255,255,255)', onValueChanged: this.size2InputChangedHandler }) : null
                );
            }
            return null;
        }
    }, {
        key: 'clickEditBtnHandler',
        value: function clickEditBtnHandler() {
            if (this.state.editing) {
                var tval = Object.assign({}, this.state);
                tval.editing = false;
                this.props.varData.setProp(tval);
            }
            this.setState({
                editing: !this.state.editing
            });
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler() {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除变量:"' + this.state.name + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo]));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key) {
            if (key == 'ok') {
                this.props.varData.bluePrint.removeVariable(this.props.varData);
            }
        }
    }, {
        key: 'labelMouseDownHandler',
        value: function labelMouseDownHandler(ev) {
            this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
            window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
        }
    }, {
        key: 'labelWindowMouseUpHandler',
        value: function labelWindowMouseUpHandler(ev) {
            if (this.dragTimeOut) {
                clearTimeout(this.dragTimeOut);
            }
        }
    }, {
        key: 'genDragContentFun',
        value: function genDragContentFun() {
            var varData = this.props.varData;
            return React.createElement(
                'span',
                { className: 'text-nowrap border bg-dark text-light' },
                '变量:' + varData.name
            );
        }
    }, {
        key: 'dragTimeOutHandler',
        value: function dragTimeOutHandler() {
            var designer = this.props.varData.bluePrint.master.project.designer;
            designer.startDrag({ info: '放置变量' }, this.dragEndHandler, this.genDragContentFun);
        }
    }, {
        key: 'dragMenuCallBack',
        value: function dragMenuCallBack(menuItem, pos) {
            var varData = this.props.varData;
            if (menuItem.key == 'SET') {
                this.props.editor.addVarGSNode({ isGet: false, varName: varData.name }, pos);
            } else if (menuItem.key == 'GET') {
                //console.log('get');
                this.props.editor.addVarGSNode({ isGet: true, varName: varData.name }, pos);
            }
        }
    }, {
        key: 'dragEndHandler',
        value: function dragEndHandler(pos) {
            // sql node 只支持var get
            var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
            if (MyMath.isPointInRect(editorRect, pos)) {
                var designer = this.props.varData.bluePrint.master.project.designer;
                var varData = this.props.varData;
                this.dragMenuCallBack(new QuickMenuItem('Get ' + varData.name, 'GET'), pos);
                return;
                designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'), new QuickMenuItem('Get ' + varData.name, 'GET')], pos, this.dragMenuCallBack);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var varData = this.props.varData;
            var editing = this.state.editing;
            if (!editing) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg', onClick: this.clickEditBtnHandler }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem',
                            onMouseDown: this.labelMouseDownHandler },
                        '' + varData
                    ),
                    React.createElement('i', { className: 'fa fa-trash fa-lg', onClick: this.clickTrashHandler })
                );
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary' },
                React.createElement(
                    'div',
                    { className: 'd-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info'), onClick: this.clickEditBtnHandler }),
                    React.createElement('input', { onChange: this.nameInputChangeHanlder, type: 'text', value: this.state.name, className: 'flexinput flex-grow-1 flex-shrink-1' })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex w-100 flex-grow-0 flex-shrink-0 align-items-center' },
                    React.createElement(DropDownControl, { itemChanged: this.valTypeChangedHandler, btnclass: 'btn-dark', options_arr: SqlVarTypes_arr, rootclass: 'flex-grow-1 flex-shrink-1', textAttrName: 'name', valueAttrName: 'code', value: this.state.valType }),
                    React.createElement(DropDownControl, { itemChanged: this.isParamChangedHandler, btnclass: 'btn-dark', options_arr: ISParam_Options_arr, rootclass: 'flex-grow-0 flex-shrink-0', textAttrName: 'name', valueAttrName: 'code', value: this.state.isParam })
                ),
                this.renderSize()
            );
        }
    }]);

    return SqlDef_Variable_Component;
}(React.PureComponent);

var SqlNode_CompileHelper = function () {
    function SqlNode_CompileHelper(logManager, editor) {
        _classCallCheck(this, SqlNode_CompileHelper);

        this.logManager = logManager;
        this.startNode = null;
        this.editor = editor;
        this.cacheObj = {};
        this.useEntities_arr = [];
        this.useVariables_arr = [];
        this.useGlobalControls_map = {};
        this.useForm_map = {};
        this.useEnvVars = {};
        this.compileSeq = [];
        this.varValue_map = {};

        autoBind(this);
    }

    _createClass(SqlNode_CompileHelper, [{
        key: 'meetNode',
        value: function meetNode(theNode) {
            if (this.startNode == null) {
                this.startNode = theNode;
            }
            this.compileSeq.push(theNode);
        }
    }, {
        key: 'addUseEnvVars',
        value: function addUseEnvVars(varKey) {
            this.useEnvVars[varKey] = 1;
        }
    }, {
        key: 'clickLogBadgeItemHandler',
        value: function clickLogBadgeItemHandler(badgeItem) {
            //console.log('clickLogBadgeItemHandler');
            //console.log(badgeItem);
            if (this.editor && badgeItem.data) {
                this.editor.showNodeData(badgeItem.data);
            }
        }
    }, {
        key: 'getCache',
        value: function getCache(id) {
            return this.cacheObj[id];
        }
    }, {
        key: 'setCache',
        value: function setCache(id, data) {
            this.cacheObj[id] = data;
        }
    }, {
        key: 'getLinksByNode',
        value: function getLinksByNode(theNode, type) {
            if (type == null) {
                type = '*';
            }
            var cacheID = 'linkcache-' + theNode.id + '-' + type;
            var rlt = this.getCache(cacheID);
            if (rlt == null) {
                rlt = theNode.bluePrint.linkPool.getLinksByNode(theNode, type);
                this.setCache(cacheID, rlt);
            }
            return rlt;
        }
    }, {
        key: 'getLinksBySocket',
        value: function getLinksBySocket(theSocket) {
            var cacheID = 'linkcache-' + theSocket.id;
            var rlt = this.getCache(cacheID);
            if (rlt == null) {
                rlt = theSocket.node.bluePrint.linkPool.getLinksBySocket(theSocket);
                this.setCache(cacheID, rlt);
            }
            return rlt;
        }
    }, {
        key: 'addUseEntity',
        value: function addUseEntity(target) {
            var index = this.useEntities_arr.indexOf(target);
            if (index == -1) {
                this.useEntities_arr.push(target);
            }
        }
    }, {
        key: 'addUseVariable',
        value: function addUseVariable(name, type, declareStr) {
            if (this.useVariables_arr[name] == null) {
                this.useVariables_arr[name] = { name: name, type: type, declareStr: declareStr };
            }
        }
    }, {
        key: 'getContext',
        value: function getContext(theNode, finder) {
            var cacheID = 'contextCache-' + theNode.id + '-' + finder.type;
            var rlt = this.getCache(cacheID);
            if (rlt == null) {
                theNode.getContext(finder, 0);
                rlt = finder;
                this.setCache(cacheID, rlt);
            }
            return rlt;
        }
    }, {
        key: 'getCompileRetCache',
        value: function getCompileRetCache(theNode, isServerSide) {
            var cacheID = 'compileRet-' + theNode.id + (isServerSide ? '-server' : '');
            return this.getCache(cacheID);
        }
    }, {
        key: 'setCompileRetCache',
        value: function setCompileRetCache(theNode, data, isServerSide) {
            var cacheID = 'compileRet-' + theNode.id + (isServerSide ? '-server' : '');
            this.setCache(cacheID, data);
        }
    }, {
        key: 'addUseForm',
        value: function addUseForm(formKernel) {
            if (this.useForm_map[formKernel.id] == null) {
                this.useForm_map[formKernel.id] = {
                    useColumns_map: {},
                    useControls_map: {},
                    useNowRecord: false,
                    formKernel: formKernel
                };
            }
            return this.useForm_map[formKernel.id];
        }
    }, {
        key: 'addUseFormDS',
        value: function addUseFormDS(formKernel, columns_arr) {
            var useForm = this.addUseForm(formKernel);
            useForm.useDS = formKernel.getAttribute(AttrNames.DataSource);
            columns_arr.forEach(function (col) {
                useForm.useColumns_map[col] = 1;
            });
        }
    }, {
        key: 'addUseControlPropApi',
        value: function addUseControlPropApi(ctrKernel, apiitem) {
            var rlt = null;
            var belongFormKernel = ctrKernel.searchParentKernel(M_FormKernel_Type, true);
            if (belongFormKernel == null) {
                rlt = this.useGlobalControls_map[ctrKernel.id];
                if (rlt == null) {
                    rlt = {
                        kernel: ctrKernel,
                        useprops_map: {}
                    };
                    this.useGlobalControls_map[ctrKernel.id] = rlt;
                }
                rlt.useprops_map[apiitem.attrItem.name] = apiitem;
                return;
            } else {
                var formObj = this.addUseForm(belongFormKernel);
                rlt = formObj.useControls_map[ctrKernel.id];
                if (rlt == null) {
                    rlt = {
                        kernel: ctrKernel,
                        useprops_map: {}
                    };
                    formObj.useControls_map[ctrKernel.id] = rlt;
                }
            }
            rlt.useprops_map[apiitem.attrItem.name] = apiitem;
        }
    }]);

    return SqlNode_CompileHelper;
}();