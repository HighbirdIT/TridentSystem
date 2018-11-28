class C_SqlNode_Editor extends React.PureComponent{
    constructor(props){
        super(props);

        this.state={
            draing:false,
            editingNode:this.props.bluePrint,
            showLink:false,
            scale:1,
        }

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            })
        }, 50);

        autoBind(this);
        this.dragingPathRef = React.createRef();
        this.editorDivRef = React.createRef();
        this.containerRef = React.createRef();
        this.topBarRef = React.createRef();
        this.zoomDivRef = React.createRef();
        this.selectRectRef = React.createRef();
        this.logManager = new LogManager('sqlnodeEditorLogManager');

        var editor = this;
        this.selectedNFManager=new SelectItemManager(this.cb_addNF, this.cb_removeNF);
    }

    reDraw(){
        this.setState({
            magicObj:{},
        });
    }

    blueprinkChanged(ev){
        this.reDraw();
    }

    cb_removeNF(target){
        if(target && !target.unmounted){
            target.setSelected(false);
        }
    }

    cb_addNF(target){
        if(target && !target.unmounted){
            target.setSelected(true);
        }
    }

    setSelectedNF(target, addMode){
        if(target == null){
            this.selectedNFManager.clear();
            return;
        }
        if(this.selectedNFManager.isSelected(target)){
            return;
        }
        if(addMode == null || target == null){
            addMode = false;
        }
        if(!addMode){
            this.selectedNFManager.clear();
        }
        this.selectedNFManager.add(target);
    }

    showNodeData(nodeData){
        var editingNode = this.state.editingNode;
        if(nodeData.bluePrint == null || nodeData.bluePrint != editingNode.bluePrint || nodeData.parent == null)
            return;

        if(editingNode != nodeData.parent){
            this.setEditeNode(nodeData.parent);
            var self = this;
            setTimeout(() => {
                self.showNodeData(nodeData);
            }, 50);
            return;
        }
        
        if(nodeData.currentComponent){
            var frameElem = nodeData.currentComponent.frameRef.current;
            if(frameElem == null)
                return null;
            this.setSelectedNF(frameElem);
            var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
            var zoomRect = this.zoomDivRef.current.getBoundingClientRect();
            
            if(!MyMath.intersectRect(frameRect, zoomRect)){
                var targetPos = {
                    x:Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                    y:Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5),
                };
                //console.log(targetPos);
                this.editorDivRef.current.style.left = targetPos.x  + 'px';
                this.editorDivRef.current.style.top = targetPos.y + 'px';
            }
        }
    }

    keyUpHandler(ev){
        //console.log(ev);
        switch(ev.keyCode){
            case 27:
                // esc
                if(!this.selectedNFManager.isEmpty()){
                    this.setSelectedNF(null);
                }
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
            case 46:
                if(!this.selectedNFManager.isEmpty()){
                    var titles = '';
                    var nodes_arr = [];
                    this.selectedNFManager.forEach(nf=>{
                        titles += nf.getNodeTitle(true) + ';';
                        nodes_arr.push(nf.props.nodedata);
                    });
                    this.wantDeleteNode(nodes_arr, titles);
                }
            break;
        }
    }

    keyDownHandler(ev){
        if(!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40){
            var offset = {x:0,y:0};
            switch(ev.keyCode){
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
            this.selectedNFManager.forEach(nf=>{
                nf.addOffset(offset);
            });
            ev.preventDefault();
        }
    }

    wantDeleteNode(nodeData_arr, title){
        gTipWindow.popAlert(makeAlertData('警告','确定删除' + nodeData_arr.length + '个节点:"' + title + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo], nodeData_arr));
    }

    deleteTipCallback(key, nodeData_arr){
        if(key == 'ok'){
            this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
            this.setSelectedNF(null);
        }
    }

    freshZoomDiv(){
        if(this.zoomDivRef.current){
            var zoomDivElem = this.zoomDivRef.current;
            var $containerElem = $(this.containerRef.current);
            var $topBarElem = $(this.topBarRef.current);

            var newZoomDivSize = {
                height : $containerElem.height() - $topBarElem.height(),
                width : $containerElem.width(),
                top : $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
            };

            if(this.preZoomDivSize == null){
                zoomDivElem.style.height = newZoomDivSize.height + 'px';
                zoomDivElem.style.width = newZoomDivSize.width + 'px';
                zoomDivElem.style.top = newZoomDivSize.top + 'px';
            }
            else{
                if(Math.abs(this.preZoomDivSize.height - newZoomDivSize.height)>1){
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                }
                if(Math.abs(this.preZoomDivSize.width - newZoomDivSize.width)>1){
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                }
                if(Math.abs(this.preZoomDivSize.top - newZoomDivSize.top)>1){
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                }
            }

            this.preZoomDivSize = newZoomDivSize;
        }
    }

    listenBlueprint(bp){
        if(bp){
            bp.on('changed', this.blueprinkChanged);
        };
        this.listenedBP = bp;
    }

    unlistenBlueprint(bp){
        if(bp){
            bp.off('changed', this.blueprinkChanged);
        }
    }

    componentWillMount(){
        window.addEventListener('keyup', this.keyUpHandler);
        window.addEventListener('keydown', this.keyDownHandler);

        this.freshInt = setInterval(this.freshZoomDiv, 500);
        this.freshZoomDiv();
    }

    componentWillUnmount(){
        window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
        window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('keydown', this.keyDownHandler);
        this.unlistenBlueprint(this.props.bluePrint);
        clearTimeout(this.delaySetTO);
        clearInterval(this.freshZoomDiv);
    }

    mousemoveWidthDragingHandler(ev){
        var rootRect = this.editorDivRef.current.getBoundingClientRect();
        var end = {x:ev.x - rootRect.left, y:ev.y - rootRect.top};
        var dragingPath = this.dragingPathRef.current;
        dragingPath.setState({
            end:end
        });
    }

    mouseupWidthDragingHandler(ev){
        if(ev.target == this.editorDivRef.current){
            if(this.preClickTime != null && (Date.now() - this.preClickTime) < 200){
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
            else{
                this.preClickTime = Date.now();
                return;
            }
        }
    }

    clickSocket(srcSocket){
        var srcNode = srcSocket.node;
        var dragingPath = this.dragingPathRef.current;
        if(dragingPath.state.draging == true){
            var cancelDrag = false;
            if(srcSocket == dragingPath.state.startScoket){
                // 同一个socket连续点击
                cancelDrag = true;
            }
            else if(dragingPath.state.startNode == srcNode){
                // 相同的node 忽略
                //console.log('相同的node');
                return;
            }
            else{
                // 点击了不同的socket
                if(srcSocket.isIn != dragingPath.state.startScoket.isIn){
                    // 不同node的in out才能相互链接
                    this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                    cancelDrag = true;
                }
            }
            if(cancelDrag)
            {
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }else{
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            dragingPath.setState({
                draging:true,
                start:srcSocket.currentComponent.getCenterPos(),
                end:{x:WindowMouse.x - rootRect.left,y:WindowMouse.y - rootRect.top},
                startScoket:srcSocket,
                startNode:srcNode,
            });
            window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
        }
    }

    setEditeNode(theNode){
        if(theNode == this.state.editingNode){
            return;
        }
        
        var editingNode = this.state.editingNode;
        var scrollNode = this.editorDivRef.current.parentNode;
        if(editingNode){
            editingNode.editorLeft = parseUnitInt(this.editorDivRef.current.style.left);
            editingNode.editorTop = parseUnitInt(this.editorDivRef.current.style.top);
            editingNode.postEditing(this);
        }
        
        this.setState({
            draging:false,
            editingNode:theNode,
            scale:1,
            showLink:false,
        });

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            })
        }, 50);

        if(theNode){
            theNode.preEditing(this);
            theNode.bluePrint.editingNode = theNode;
            setTimeout(() => {
                this.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                this.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
            }, 50);
        }
    }

    genSqlNode_Component(CName, nodeData){
        var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
        return <CName key={blueprintPrefix + nodeData.id} nodedata={nodeData} editorDivRef={this.editorDivRef} editor={this} />
    }

    renderNode(nodeData){
        if(nodeData == null)
            return null;
        switch(nodeData.type){
            case SQLNODE_BDBENTITY:
                return this.genSqlNode_Component(C_SqlNode_DBEntity, nodeData);
            break;
            case SQLNODE_SELECT:
                return this.genSqlNode_Component(C_SqlNode_Select, nodeData);
            break;
            case SQLNODE_VAR_GET:
                return this.genSqlNode_Component(C_SqlNode_Var_Get, nodeData);
            break;
            case SQLNODE_VAR_SET:
                return this.genSqlNode_Component(C_SqlNode_Var_Set, nodeData);
            break;
            case SQLNODE_NOPERAND:
                return this.genSqlNode_Component(C_SqlNode_NOperand, nodeData);
            break;
            case SQLNODE_DBENTITY_COLUMNSELECTOR:
                return this.genSqlNode_Component(C_SqlNode_DBEntity_ColumnSelector, nodeData);
            break;
            case SQLNODE_XJOIN:
                return this.genSqlNode_Component(C_SqlNode_XJoin, nodeData);
            break;
            default:
                return this.genSqlNode_Component(C_SqlNode_SimpleNode, nodeData);
            break;
        }

        return null;
    }

    transToEditorPos(pt){
        var $zoomDivElem = $(this.zoomDivRef.current);
        var zoomOffset = $zoomDivElem.offset();

        var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
        var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
        return{
            x:x,
            y:y
        }
    }

    addVarGSNode(config, windPos){
        var editingNode = this.state.editingNode;
        //var $zoomDivElem = $(this.zoomDivRef.current);
        //var zoomOffset = $zoomDivElem.offset();
        
        //var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
        //var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
        var editorPos = this.transToEditorPos(windPos);
        var newNodeData = null;
        if(config.isGet){
            newNodeData = new SqlNode_Var_Get({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        else{
            newNodeData = new SqlNode_Var_Set({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        this.setState({
            magicObj:{},
        });
    }

    mouseDownNodeCtlrHandler(ctlData){
        var editorDiv = this.editorDivRef.current;
        var editingNode = this.state.editingNode;
        var newNodeData = new ctlData.nodeClass({newborn:true,left:-parseUnitInt(editorDiv.style.left),top:-parseUnitInt(editorDiv.style.top)},editingNode);
        this.setState({
            magicObj:{},
        });
    }

    mousemoveWithDragHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        //var scrollNode = this.editorDivRef.current.parentNode;
        //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
        //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
        //console.log(offset);
        this.editorDivRef.current.style.left = (this.dragOrgin.left + offset.x )  + 'px';
        this.editorDivRef.current.style.top = (this.dragOrgin.top + offset.y ) + 'px';
    }

    mouseupWithDragHandler(ev){
        this.draging = false;
        window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
        window.removeEventListener('mouseup', this.mouseupWithDragHandler);
    }

    mousemoveWithSelectHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        this.selectRectRef.current.setSize({
            width:offset.x,
            height:offset.y
        });
    }

    mouseupWithSelectHandler(ev){
        // check
        var theRect = this.selectRectRef.current.getRect();
        var hitNodes_arr = [];
        this.state.editingNode.nodes_arr.forEach(node=>{
            var nodeRect = node.getRect();
            if(MyMath.intersectRect(nodeRect, theRect)){
                hitNodes_arr.push(node);
            }
        });
        if(!ev.ctrlKey){
            this.selectedNFManager.clear();
        }
        if(hitNodes_arr.length > 0){
            for(var i in hitNodes_arr){
                this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
            }
        }

        window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
        window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
        this.selectRectRef.current.setSize({
            width:0,
            height:0
        });
    }

    rootMouseDownHandler(ev){
        if(ev.target == this.zoomDivRef.current && this.draging != true){
            var nowPos = {
                x:parseUnitInt(this.editorDivRef.current.style.left),
                y:parseUnitInt(this.editorDivRef.current.style.top),
            }
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y, left:nowPos.x, top: nowPos.y};
            if(ev.button == 0){
                // 拉取选择范围
                var editorPos = this.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});
                this.selectRectRef.current.setSize({
                    left:editorPos.x,
                    top:editorPos.y
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

    mouseWhileHandler(ev){
        console.log(ev);
    }

    clickBigBtnHandler(ev){
        var newScale = Math.min(this.state.scale + 0.1,1);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickSmallBtnHandler(ev){
        var newScale = Math.max(this.state.scale - 0.1,0.3);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickNavBtnHandler(ev){
        var nodeId = getAttributeByNode(ev.target, 'data-id');
        if(nodeId == null)
            return;
        var theNode = this.props.bluePrint.getNodeByID(nodeId);
        if(theNode == this.state.editingNode){
            return;
        }
        this.setEditeNode(theNode);
    }

    clickCompileBtnHandler(ev){
        var theBluePrint = this.props.bluePrint;
        this.logManager.clear();
        //this.logManager.log("Start compile");
        var compileHelper = new SqlNode_CompileHelper(this.logManager, this);
        theBluePrint.compile(compileHelper);
        //this.logManager.log("End compile");
    }

    clickExportBtnHandler(ev){
        console.log("Start export");
        var editingNode = this.state.editingNode;
        var json = editingNode.bluePrint.getJson();
        console.log(json);
    }

    render(){
        var editingNode = this.state.editingNode;
        if(this.props.bluePrint != editingNode.bluePrint){
            var self = this;
            clearTimeout(this.delaySetTO);
            this.delaySetTO = setTimeout(() => {
                this.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint); 
                self.delaySetTO = null;
            }, 10);
        }
        var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
        nodeParentList.push(editingNode);
        if(this.editorDivRef.current){
            this.editorDivRef.current.scale = this.state.scale;
        }
        var self = this;
        var blueprintPrefix = editingNode.bluePrint.id + '_';
        if(this.listenedBP != editingNode.bluePrint){
            this.unlistenBlueprint(this.listenedBP);
            this.listenBlueprint(editingNode.bluePrint);
        }
        var linkPool = editingNode.bluePrint.linkPool;

        return (<SplitPanel
                defPercent={0.2}
                maxSize='400px'
                barClass='bg-secondary'
                panel1={
                    <CusDBEEditorLeftPanel onMouseDown={this.mouseDownNodeCtlrHandler} editingNode={editingNode} editorDivRef={this.editorDivRef} editor={self} />
                }
                panel2={
                    <SplitPanel
                    defPercent={0.8}
                    barClass='bg-secondary'
                    flexColumn={true}
                    panel1={
                        <div className='flex-grow-1 flex-shrink-1 d-flex flex-column' ref={this.containerRef}>
                            <div className='flex-grow-0 flex-shrink-0 border bg-light ' style={{height:'40px'}} ref={this.topBarRef}>
                                <div className='d-flex flex-grow-1 flex-shrink-1'>
                                    <ul className="nav nav-pills flex-grow-1 flex-shrink-1">
                                        {
                                            nodeParentList.map(nodeData=>{
                                                return (<li className="nav-item" key={nodeData.id}> 
                                                            <a className={"nav-link" + (nodeData == editingNode ? ' active' : '')} href="#" data-id={nodeData.id} onClick={this.clickNavBtnHandler}>
                                                                {nodeData.getNodeTitle()}
                                                                {nodeData != editingNode && <i className='fa fa-angle-right ml-1' />}
                                                            </a>
                                                        </li>)
                                            })
                                        }
                                    </ul>
                                    <div className='btn-group flex-grow-0 flex-shrink-0'>
                                        <button type='button' onClick={this.clickCompileBtnHandler} className='btn btn-dark' >编译</button>
                                        <button type='button' onClick={this.clickExportBtnHandler} className='btn btn-dark' >导出</button>
                                        <button type='button' onClick={this.clickBigBtnHandler} className='btn btn-dark' ><i className='fa fa-search-plus' /></button>
                                        <button type='button' onClick={this.clickSmallBtnHandler} className='btn btn-dark' ><i className='fa fa-search-minus' /></button>
                                    </div>
                                </div>
                            </div>
                            <div className='flex-grow-1 flex-shrink-1 position-absolute hidenOverflow' style={{zoom:this.state.scale}} ref={this.zoomDivRef} onMouseDown={this.rootMouseDownHandler} >
                                <div ref={this.editorDivRef} className='d-block position-absolute bg-dark' style={{width:'10px',height:'10px',overflow:'visible'}}>
                                    {
                                        editingNode.nodes_arr.map(nd=>{
                                            return this.renderNode(nd) //<G_Node key={nd.id} data={nd} />
                                        })
                                    }
                                    <C_Node_Link ref={this.dragingPathRef} editorDivRef={this.editorDivRef} />
                                    {
                                        this.state.showLink && linkPool.getAllLink().map((linkobj=>{
                                            return <C_Node_Link key={blueprintPrefix + linkobj.id} link={linkobj} editorDivRef={this.editorDivRef} />
                                        }))
                                    }
                                    <C_SelectRect ref={this.selectRectRef}/>
                                </div>
                            </div>
                        </div>
                    }
                    panel2={
                        <div className='bg-dark m-100 h-100 flex-grow-1 flex-shrink-1'>
                            <LogOutputPanel source={this.logManager} />
                        </div>
                    }
                    />
                }
                />);
    }
}

class SqlNode_CompileHelper{
    constructor(logManager,editor){
        this.logManager = logManager;
        this.startNode = null;
        this.editor = editor;
        this.linkCache = {};

        autoBind(this);
    }

    meetNode(theNode){
        if(this.startNode == null){
            this.startNode = theNode;
        }
    }

    clickLogBadgeItemHandler(badgeItem){
        //console.log('clickLogBadgeItemHandler');
        //console.log(badgeItem);
        if(this.editor && badgeItem.data){
            this.editor.showNodeData(badgeItem.data);
        }
    }

    getLinksByNode(theNode,type){
        if(type == null){
            type = '*';
        }
        var cacheID = 'linkcache-' + theNode.id + '-' + type;
        if(this.linkCache[cacheID] == null){
            this.linkCache[cacheID] = theNode.bluePrint.linkPool.getLinksByNode(theNode,type);
        }
        return this.linkCache[cacheID];
    }

    getLinksBySocket(theSocket){
        var cacheID = 'linkcache-' + theSocket.id;
        if(this.linkCache[cacheID] == null){
            this.linkCache[cacheID] = theSocket.node.bluePrint.linkPool.getLinksBySocket(theSocket);
        }
        return this.linkCache[cacheID];
    }
}