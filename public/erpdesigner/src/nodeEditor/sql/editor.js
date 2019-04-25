const SqlNodeEditorControls_arr =[
    {
        label:'源',
        nodeClass:SqlNode_DBEntity,
    },
    {
        label:'选择',
        nodeClass:SqlNode_Select,
    },
    {
        label:'多元运算',
        nodeClass:SqlNode_NOperand,
    }
    ,
    {
        label:'比较运算',
        nodeClass:SqlNode_Compare,
    }
    ,
    {
        label:'Join',
        nodeClass:SqlNode_XJoin,
    }
    ,
    {
        label:'常量',
        nodeClass:SqlNode_ConstValue,
    }
    ,
    {
        label:'RowNumber',
        nodeClass:SqlNode_RowNumber,
    }
    ,
    {
        label:'IsNull()',
        nodeClass:SqlNode_IsNullFun,
    }
    ,
    {
        label:'IsNullOperator',
        nodeClass:SqlNode_IsNullOperator,
    }
    ,
    {
        label:'逻辑运算',
        nodeClass:SqlNode_Logical_Operator,
    }
    ,
    {
         label:'环境变量',
         nodeClass:SqlNode_Env_Var,
    }
]; 


class C_SqlNode_Editor extends React.PureComponent{
    constructor(props){
        super(props);
        
        var editingNode = this.props.bluePrint;
        if(this.props.bluePrint.group != 'custom'){
            editingNode = this.props.bluePrint.finalSelectNode;
        }

        this.state={
            draing:false,
            showLink:false,
            scale:1,
            editingNode:editingNode,
        };

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            });
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
        if(editingNode){
            editingNode.preEditing(this);
        }
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

    showNodeData(nodeData, autoSelect){
        var editingNode = this.state.editingNode;
        if(nodeData.bluePrint == null || nodeData.bluePrint != editingNode.bluePrint || nodeData.parent == null)
            return;

        if(editingNode != nodeData.parent){
            this.setEditeNode(nodeData.parent);
            var self = this;
            setTimeout(() => {
                self.showNodeData(nodeData, autoSelect);
            }, 50);
            return;
        }
        
        if(nodeData.currentComponent){
            var frameElem = nodeData.currentComponent.frameRef.current;
            if(frameElem == null)
                return null;
            if(autoSelect != false){
                this.setSelectedNF(frameElem);
            }
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

    nodeFrameStartMove(srcNF){
        if(this.selectedNFManager.count()>1){
            var srcPos = {x:srcNF.props.nodedata.left,y:srcNF.props.nodedata.top};
            this.selectedNFManager.forEach(nf=>{
                if(nf == srcNF){
                    return;
                }
                nf.offsetBase = {x:nf.props.nodedata.left - srcPos.x,y:nf.props.nodedata.top - srcPos.y};
            });
        }
    }

    nodeFrameMoving(srcNF){
        if(this.selectedNFManager.count()>1){
            var srcPos = {x:srcNF.props.nodedata.left,y:srcNF.props.nodedata.top};
            this.selectedNFManager.forEach(nf=>{
                if(nf == srcNF){
                    return;
                }
                var theNode = nf.props.nodedata;
                var offsetBase = nf.offsetBase;
                theNode.setPos(srcPos.x + offsetBase.x, srcPos.y + offsetBase.y);
                nf.reDraw();
            });
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

        if(this.state.editingNode){
            var theNode = this.state.editingNode;
            setTimeout(() => {
                this.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                this.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
            }, 50);
        }
    }

    componentWillUnmount(){
        if(this.props.bluePrint){
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
        if(editingNode && this.editorDivRef.current){
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
        var settting = SqlNodeClassMap[nodeData.type];
        if(settting == null){
            console.warn(nodeData.type + ' 节点类型找不到映射');
            return null;
        }
        return this.genSqlNode_Component(settting.comClass, nodeData);
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
        var posLeft = -parseUnitInt(editorDiv.style.left);
        var posTop = -parseUnitInt(editorDiv.style.top);
        var newNodeData = new ctlData.nodeClass({newborn:true,left:posLeft,top:posTop},editingNode);
        if(newNodeData.type == SQLNODE_CASE_WHEN){

            var newCWNode = new SqlNode_CW_When({left:posLeft, top:posTop},editingNode);
            editingNode.bluePrint.linkPool.addLink(newCWNode.outSocket, newNodeData.inputScokets_arr[0]);
            var self = this;
          
            var newElseNode = new SqlNode_CW_Else({left:posLeft, top:posTop},editingNode);
            editingNode.bluePrint.linkPool.addLink(newElseNode.outSocket, newNodeData.inputScokets_arr[1]);
            setTimeout(() => {
                newCWNode.left = newNodeData.left - 200;
                newCWNode.top = newNodeData.top - 50;
                self.setSelectedNF(newCWNode.currentFrameCom, true);
             
                newElseNode.left = newNodeData.left - 200;
                newElseNode.top = newNodeData.top +100;
                self.setSelectedNF(newElseNode.currentFrameCom, true);
                self.nodeFrameStartMove(newNodeData.currentFrameCom);
            }, 100);
        }
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
        var editingNode = this.state.editingNode;
        editingNode.editorLeft = this.dragOrgin.left + offset.x;
        editingNode.editorTop = this.dragOrgin.top + offset.y;
        this.editorDivRef.current.style.left = editingNode.editorLeft  + 'px';
        this.editorDivRef.current.style.top = editingNode.editorTop + 'px';
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
            var editorPos = this.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y, left:nowPos.x, top: nowPos.y};
            if(ev.shiftKey){
                if(!this.selectedNFManager.isEmpty()){
                    var rightMostPos = {x:null,y:null};
                    this.selectedNFManager.forEach(nf=>{
                        var nfRect = nf.rootDivRef.current.getBoundingClientRect();
                        if(isNaN(rightMostPos.x) || nfRect.right > rightMostPos.x){
                            rightMostPos.x = nfRect.right;
                        }
                        if(isNaN(rightMostPos.y) || nfRect.top > rightMostPos.y){
                            rightMostPos.y = nfRect.top;
                        }
                    });
                    this.selectedNFManager.forEach(nf=>{
                        nf.addOffset({x:editorPos.x - rightMostPos.x,y:editorPos.y - rightMostPos.y});
                    });
                    return;
                }
            }
            if(ev.button == 0){
                // 拉取选择范围
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
        this.logManager.log("开始编译[" + theBluePrint.name + ']');
        var compileHelper = new SqlNode_CompileHelper(this.logManager, this);
        var compileRet = theBluePrint.compile(compileHelper);
        if(compileRet == false){
            this.logManager.log('[' + theBluePrint.name + ']编译失败');
        }
        else{
            this.logManager.log('[' + theBluePrint.name + ']编译成功');
            this.logManager.log(compileRet.varDeclareStr + compileRet.sql);
        }
        this.logManager.log('共' + this.logManager.getCount(LogTag_Warning) + '条警告,' + this.logManager.getCount(LogTag_Error) + '条错误,');
    }

    clickExportBtnHandler(ev){
        console.log("Start export");
        var editingNode = this.state.editingNode;
        var json = editingNode.bluePrint.getJson(new AttrJsonProfile());
        var text = JSON.stringify(json);
        console.log(text);
    }

    createNewNode(nodeClass, initData){
        var editorDiv = this.editorDivRef.current;
        var editingNode = this.state.editingNode;
        var newNode = new nodeClass(
            Object.assign({
                newborn:true,
                left:-parseUnitInt(editorDiv.style.left),
                top:-parseUnitInt(editorDiv.style.top),
            }, initData),
            editingNode
        );

        this.setState({
            magicObj:{},
        });
        return newNode;
    }

    createCanUseDS(dsconfig){
        this.createNewNode(SqlNode_CurrentDataRow,{
            formID:dsconfig.formID,
            dscode:dsconfig.entity.code,
            dsentity:dsconfig.entity,
        });
    }

    createApiObj(apiClass, apiItem){
        switch(apiItem.type){
            case EApiType.Prop:
            this.createNewNode(SqlNode_Control_Api_Prop,{
                apiClass:apiClass,
                apiItem:apiItem,
            });
            break;
        }
    }

    render(){
        var editingNode = this.state.editingNode;
        if(this.props.bluePrint != editingNode.bluePrint){
            var self = this;
            this.selectedNFManager.clear(false);
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
                    <SqlNodeEditorLeftPanel onMouseDown={this.mouseDownNodeCtlrHandler} editingNode={editingNode} editorDivRef={this.editorDivRef} editor={self} />
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

class SqlNodeEditorLeftPanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    listenNode(node){
        if(node){
            node.on('changed', this.editingNodeChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('changed', this.editingNodeChangedhandler);
        }
    }

    componentWillMount(){
        //listenNode(this.state.editingNode);
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    editingNodeChangedhandler(){
        this.setState({
            magicObj:{},
        });
    }

    clickOutlineImteHandler(nodeData, ev){
        this.props.editor.showNodeData(nodeData, ev.ctrlKey);
    }

    render() {
        if(this.listenedNode != this.props.editingNode){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode);
        }
        return (
            <SplitPanel 
                fixedOne={true}
                maxSize={200}
                defPercent={0.3}
                flexColumn={true}
                panel1={
                    <div className='w-100 h-100 autoScroll d-flex flex-column'>
                        {
                            this.props.editingNode.nodes_arr.map(nodeData=>{
                                return <SqlNodeOutlineItem key={nodeData.id} nodeData={nodeData} clickHandler={this.clickOutlineImteHandler} />
                            })
                        }
                    </div>
                }
                panel2={
                    <div className='d-flex flex-column h-100 w-100'>
                        <SqlNodeEditorVariables editingNode={this.props.editingNode} editor={this.props.editor} />
                        <SqlNodeEditorCanUseNodePanel editingNode={this.props.editingNode} onMouseDown={this.props.onMouseDown} editor={this.props.editor} />
                    </div>
                }
            />
        );
    }
}

class SqlNodeEditorCanUseNodePanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
        this.state = {
            canUseDS_arr:[],
            showCanUseDS:true,
            showCtlApi:false,
        };
    }

    mouseDownHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var ctlItem = SqlNodeEditorControls_arr.find(item=>{return item.label == itemValue});
        if(ctlItem){
            this.props.onMouseDown(ctlItem);
        }
    }

    scanBlueprint(bluePrint){
        this.scanedBP = bluePrint;
        if(bluePrint == null){
            return;
        }
        var scriptMaster = bluePrint.master;
        var project = scriptMaster.project;
        var logManager = this.props.editor.logManager;
        logManager.clear();
        var canUseDS_arr = [];
        if(bluePrint.group == 'ctlcus'){
            // 控件类型,获取上下文
            var ctlKernel = project.getControlById(bluePrint.ctlID);
            if(bluePrint.ctlID == null || ctlKernel == null){
                logManager.error('本蓝图没有找到相应的控件[' + bluePrint.ctlID + ']');
                return;
            }
            // 获取可用的数据源
            var parentForms_arr = ctlKernel.searchParentKernel(M_FormKernel_Type);
            if(parentForms_arr != null){
                parentForms_arr.forEach(formKernel=>{
                    var useDS = formKernel.getAttribute(AttrNames.DataSource);
                    if(useDS != null){
                        canUseDS_arr.push(
                            {
                                entity:useDS,
                                label:formKernel.getReadableName() + '当前行',
                                formID:formKernel.id
                            }
                        );
                    }
                });
            }
        }
        logManager.log(canUseDS_arr.length);
        console.log(canUseDS_arr);
        //console.log(canUseDS_arr);
        this.setState({
            canUseDS_arr:canUseDS_arr,
        });
    }

    mouseDownCanUseDSHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var theDSItem = this.state.canUseDS_arr.find(e=>{return e.formID == itemValue});
        if(theDSItem){
            this.props.editor.createCanUseDS(theDSItem);
        }
    }

    clickCanUseDSHeader(ev){
        this.setState({showCanUseDS:!this.state.showCanUseDS});
    }

    clickCtlApiHeader(ev){
        this.setState({showCtlApi:!this.state.showCtlApi});
    }

    clickControlAPIHandler(ev){
        var ctltype = getAttributeByNode(ev.target, 'data-ctltype');
        if(ctltype == null)
            return;
        var apiid = getAttributeByNode(ev.target, 'data-apiid');
        if(apiid == null)
            return;
        var theApiObj = g_controlApi_arr.find(e=>{return e.ctltype == ctltype;});
        var apiItem = theApiObj.getApiItemByid(apiid);
        this.props.editor.createApiObj(theApiObj,apiItem);
    }

    render() {
        var editingBP = this.props.editingNode.bluePrint;
        if(editingBP != this.scanedBP){
            if(this.scanTimeout == null){
                var self = this;
                setTimeout(() => {
                    self.scanBlueprint(editingBP);
                    self.scanTimeout = null;
                }, 10);
            }
            return null;
        }

        var canUseDS_arr = this.state.canUseDS_arr;
        var showCanUseDS = this.state.showCanUseDS;
        var showCtlApi = this.state.showCtlApi;
        if(editingBP.ctlID == null){
            showCtlApi = null;
            showCanUseDS = null;
        }
        var targetID = this.props.editingNode.bluePrint.code + 'canUseNode';
        return (
            <React.Fragment>
                <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}>节点</button>
                <div id={targetID} className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        {
                            canUseDS_arr.length > 0 &&
                            <React.Fragment>
                                <div className='d-flex flex-shrink-0'>
                                    <span onClick={this.clickCanUseDSHeader} className='btn btn-info flex-grow-1 flex-shrink-1'>作用域数据{showCanUseDS ? '-' : '+'}</span>
                                </div>
                                {showCanUseDS &&
                                <div className='btn-group-vertical mw-100 flex-shrink-0'>
                                    {canUseDS_arr.map(item=>{
                                        return (<button key={item.formID} onMouseDown={this.mouseDownCanUseDSHandler} data-value={item.formID} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.label}</button>);
                                    })}
                                </div>}
                            </React.Fragment>
                        }
                        <div className='btn-group-vertical mw-100 flex-shrink-0'>
                            {editingBP.ctlID != null && <span className='btn btn-info' onClick={this.clickCtlApiHeader}>控件接口{showCtlApi ? '-' : '+'}</span>}
                            {showCtlApi &&
                                g_controlApi_arr.map(
                                    ctlApi=>{
                                        var rlt = [];
                                        ctlApi.allapi_arr.forEach((apiItem,index)=>{
                                            if(apiItem.type != EApiType.Prop){
                                                return;
                                            }
                                            rlt.push(<button key={apiItem.uniqueID} onMouseDown={this.clickControlAPIHandler} data-ctltype={ctlApi.ctltype} data-apiid={apiItem.id} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{apiItem.toString()}</button>);
                                        });
                                        return rlt;
                                    }
                                )
                            }
                        </div>
                        
                        <div className='btn-group-vertical mw-100 flex-shrink-0'>
                            <span className='btn btn-info'>SQL节点</span>
                            {
                                SqlNodeEditorControls_arr.map(
                                    item=>{
                                        return <button key={item.label} onMouseDown={this.mouseDownHandler} data-value={item.label} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.label}</button>
                                    }
                                )
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class SqlNodeEditorVariables extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    mouseDownHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var ctlItem = SqlNodeEditorControls_arr.find(item=>{return item.label == itemValue});
        if(ctlItem && this.props.onMouseDown){
            this.props.onMouseDown(ctlItem);
        }
    }

    clickAddHandler(ev){
        this.props.editingNode.bluePrint.createEmptyVariable();
    }

    varChangedhandler(){
        this.setState({
            magicobj:{}
        });
    }

    listenNode(node){
        if(node){
            node.on('varChanged', this.varChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('varChanged', this.varChangedhandler);
        }
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    render() {
        if(this.listenedNode != this.props.editingNode.bluePrint){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode.bluePrint);
        }
        var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
        var targetID = blueprintPrefix + 'variables';
        return (
            <React.Fragment>
                <div className='flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center'>
                    <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}> 变量</button>
                    <i className='fa fa-plus fa-lg text-light cursor-pointer' onClick={this.clickAddHandler} style={{width:'30px'}} />
                </div>
                <div id={targetID} className="list-group flex-grow-0 flex-shrink-0 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        <div className='btn-group-vertical mw-100'>
                            {
                                this.props.editingNode.bluePrint.vars_arr.map(varData=>{
                                    return <SqlDef_Variable_Component belongNode={this.props.editingNode} key={blueprintPrefix + varData.id} varData={varData} editor={this.props.editor} />
                                })
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class SqlNodeOutlineItem extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);

        this.state = {
            label:this.props.nodeData.getNodeTitle(true),
            nodeData:this.props.nodeData,
        }
    }

    listenNode(target){
        target.on('changed', this.nodeChangedhandler);
    }

    unlistenNode(target){
        target.off('changed', this.nodeChangedhandler);
    }

    componentWillMount(){
        this.listenNode(this.state.nodeData);
    }

    componentWillUnmount(){
        this.unlistenNode(this.state.nodeData);
    }

    nodeChangedhandler(){
        this.setState({
            label:this.state.nodeData.getNodeTitle(),
        });
    }

    clickHandler(ev){
        this.props.clickHandler(this.state.nodeData, ev);
    }

    render(){
        if(this.state.nodeData != this.props.nodeData){
            this.unlistenNode(this.state.nodeData);
            this.listenNode(this.props.nodeData);
            var self = this;
            var newNodeData = this.props.nodeData;
            setTimeout(() => {
                self.setState({
                    nodeData:newNodeData,
                    label:newNodeData.getNodeTitle(true),
                });
            }, 20);
            return null;
        }
        return <div className='text-nowrap text-light cursor-pointer'  onClick={this.clickHandler}>{this.state.label}</div>
    }
}

class SqlDef_Variable_Component extends React.PureComponent{
    constructor(props){
        super(props);
        var varData = this.props.varData;
        this.state = {
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            size_1:varData.size_1,
            size_2:varData.size_2,
            editing:varData.needEdit == true,
        };

        autoBind(this);
    }

    varChanged(){
        if(this.state.editing){
            return;
        }
        var varData = this.props.varData;
        this.setState({
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            size_1:varData.size_1,
            size_2:varData.size_2,
        });
    }

    componentWillMount(){
        this.props.varData.on('changed', this.varChanged);
    }

    componentWillUnmount(){
        this.props.varData.off('changed', this.varChanged);
    }

    nameInputChangeHanlder(ev){
        this.setState({
            name:ev.target.value,
        });
    }

    valTypeChangedHandler(newData){
        this.setState({
            valType:newData,
        });
    }

    isParamChangedHandler(newData){
        this.setState({
            isParam:newData,
        });
    }

    size1InputChangedHandler(newVal){
        this.setState({
            size_1:isNaN(newVal) ? 0 : parseInt(newVal),
        });
    }

    size2InputChangedHandler(newVal){
        this.setState({
            size_2:isNaN(newVal) ? 0 : parseInt(newVal),
        });
    }

    renderSize(){
        var sizeCount = 0;
        switch(this.state.valType){
            case SqlVarType_NVarchar:
                sizeCount = 1;
                break;
            case SqlVarType_Decimal:
                sizeCount = 2;
                break;
        }
        if(sizeCount > 0){
            return(<div className='d-flex flex-grow-0 flex-shrink-0 w-100'>
                <NameInputRow isagent={true} label='S1' type='int' rootClass='flex-grow-1 flex-shrink-1' value={this.state.size_1} nameWidth='50px' nameColor='rgb(255,255,255)' onValueChanged={this.size1InputChangedHandler} />
                {
                    sizeCount == 2 ? 
                    <NameInputRow isagent={true} label='S2' type='int' rootClass='flex-grow-1 flex-shrink-1' value={this.state.size_2} nameWidth='50px' nameColor='rgb(255,255,255)' onValueChanged={this.size2InputChangedHandler} />
                    : null
                }
            </div>);
        }
        return null;
    }

    clickEditBtnHandler(){
        if(this.state.editing){
            var tval = Object.assign({},this.state);
            tval.editing = false;
            this.props.varData.setProp(tval);
        }
        this.setState({
            editing:!this.state.editing,
        });
    }

    clickTrashHandler(){
        gTipWindow.popAlert(makeAlertData('警告','确定删除变量:"' + this.state.name + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo]));
    }

    deleteTipCallback(key){
        if(key == 'ok'){
            this.props.varData.bluePrint.removeVariable(this.props.varData);
        }
    }

    labelMouseDownHandler(ev) {
        this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
        window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
    }

    labelWindowMouseUpHandler(ev) {
        if (this.dragTimeOut) {
            clearTimeout(this.dragTimeOut);
        }
    }

    genDragContentFun(){
        var varData = this.props.varData;
        return (<span className='text-nowrap border bg-dark text-light'>{'变量:' + varData.name}</span>)
    }

    dragTimeOutHandler() {
        var designer = this.props.varData.bluePrint.master.project.designer;
        designer.startDrag({info:'放置变量'}, this.dragEndHandler, this.genDragContentFun);
    }

    dragMenuCallBack(menuItem, pos){
        var varData = this.props.varData;
        if(menuItem.key == 'SET'){
            this.props.editor.addVarGSNode({isGet:false, varName:varData.name}, pos)
        }
        else if(menuItem.key == 'GET'){
            //console.log('get');
            this.props.editor.addVarGSNode({isGet:true, varName:varData.name}, pos)
        }
    }

    dragEndHandler(pos){
        // sql node 只支持var get
        var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
        if(MyMath.isPointInRect(editorRect, pos)){
            var designer = this.props.varData.bluePrint.master.project.designer;
            var varData = this.props.varData;
            this.dragMenuCallBack(new QuickMenuItem('Get ' + varData.name, 'GET'), pos);
            return;
            designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'),new QuickMenuItem('Get ' + varData.name, 'GET')]
                ,pos
                ,this.dragMenuCallBack
            );
        }
    }

    render() {
        var varData = this.props.varData;
        var editing = this.state.editing;
        if(!editing){
            return(
                <div className='d-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo'>
                    <i className={'fa fa-edit fa-lg'} onClick={this.clickEditBtnHandler} />
                    <div className='flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem'
                         onMouseDown={this.labelMouseDownHandler}>
                        {'' + varData}
                    </div>
                    <i className={'fa fa-trash fa-lg'} onClick={this.clickTrashHandler} />
                </div>
            )
        }
        return(
        <div className='d-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary'>
            <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center'>
                <i className={'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info')} onClick={this.clickEditBtnHandler} />
                <input onChange={this.nameInputChangeHanlder} type='text' value={this.state.name} className='flexinput flex-grow-1 flex-shrink-1' />
            </div>
            <div className='d-flex w-100 flex-grow-0 flex-shrink-0 align-items-center'>
                <DropDownControl itemChanged={this.valTypeChangedHandler} btnclass='btn-dark' options_arr={SqlVarTypes_arr} rootclass='flex-grow-1 flex-shrink-1' textAttrName='name' valueAttrName='code' value={this.state.valType} /> 
                <DropDownControl itemChanged={this.isParamChangedHandler} btnclass='btn-dark' options_arr={ISParam_Options_arr} rootclass='flex-grow-0 flex-shrink-0' textAttrName='name' valueAttrName='code' value={this.state.isParam} /> 
            </div>
            {
                this.renderSize()
            }
        </div>);
    }
}

class SqlNode_CompileHelper{
    constructor(logManager,editor){
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

    meetNode(theNode){
        if(this.startNode == null){
            this.startNode = theNode;
        }
        this.compileSeq.push(theNode);
    }

    setAddFuncs(otherHelper){
        otherHelper.addUseEnvVars = this.addUseEnvVars;
        otherHelper.addUseForm = this.addUseForm;
        otherHelper.addUseFormDS = this.addUseFormDS;
        otherHelper.addUseControlPropApi = this.addUseControlPropApi;
    }

    addUseEnvVars(varKey){
        this.useEnvVars[varKey] = 1;
    }

    clickLogBadgeItemHandler(badgeItem){
        //console.log('clickLogBadgeItemHandler');
        //console.log(badgeItem);
        if(this.editor && badgeItem.data){
            this.editor.showNodeData(badgeItem.data);
        }
    }

    getCache(id){
        return this.cacheObj[id];
    }

    setCache(id, data){
        this.cacheObj[id] = data;
    }

    getLinksByNode(theNode,type){
        if(type == null){
            type = '*';
        }
        var cacheID = 'linkcache-' + theNode.id + '-' + type;
        var rlt = this.getCache(cacheID);
        if(rlt == null){
            rlt = theNode.bluePrint.linkPool.getLinksByNode(theNode,type);
            this.setCache(cacheID, rlt);
        }
        return rlt;
    }

    getLinksBySocket(theSocket){
        var cacheID = 'linkcache-' + theSocket.id;
        var rlt = this.getCache(cacheID);
        if(rlt == null){
            rlt = theSocket.node.bluePrint.linkPool.getLinksBySocket(theSocket);
            this.setCache(cacheID, rlt);
        }
        return rlt;
    }

    addUseEntity(target){
        var index = this.useEntities_arr.indexOf(target);
        if(index == -1){
            this.useEntities_arr.push(target);
        }
    }

    addUseVariable(name, type, declareStr){
        if(this.useVariables_arr[name] == null){
            this.useVariables_arr[name] = {name:name,type:type,declareStr:declareStr};
        }
    }

    getContext(theNode, finder){
        var cacheID = 'contextCache-' + theNode.id + '-' + finder.type;
        var rlt = this.getCache(cacheID);
        if(rlt == null){
            theNode.getContext(finder, 0);
            rlt = finder;
            this.setCache(cacheID, rlt);
        }
        return rlt;
    }

    getCompileRetCache(theNode, isServerSide){
        var cacheID = 'compileRet-' + theNode.id + (isServerSide ? '-server' : '');
        return this.getCache(cacheID);
    }

    setCompileRetCache(theNode, data, isServerSide){
        var cacheID = 'compileRet-' + theNode.id + (isServerSide ? '-server' : '');
        this.setCache(cacheID, data);
    }

    addUseForm(formKernel){
        if(this.useForm_map[formKernel.id] == null){
            this.useForm_map[formKernel.id] = {
                useColumns_map:{},
                useControls_map:{},
                useNowRecord:false,
                formKernel:formKernel,
            };
        }
        return this.useForm_map[formKernel.id];
    }

    addUseFormDS(formKernel, columns_arr){
        var useForm = this.addUseForm(formKernel);
        useForm.useDS = formKernel.getAttribute(AttrNames.DataSource);
        columns_arr.forEach(col=>{
            useForm.useColumns_map[col] = 1;
        });
    }

    addUseControlPropApi(ctrKernel, apiitem){
        var rlt = null;
        var belongFormKernel = ctrKernel.searchParentKernel(M_FormKernel_Type,true);
        if(belongFormKernel == null){
            rlt = this.useGlobalControls_map[ctrKernel.id]
            if(rlt == null){
                rlt = {
                    kernel:ctrKernel,
                    useprops_map:{},
                };
                this.useGlobalControls_map[ctrKernel.id] = rlt;
            }
            rlt.useprops_map[apiitem.attrItem.name] = apiitem;
            return;
        }
        else{
            var formObj = this.addUseForm(belongFormKernel);
            rlt = formObj.useControls_map[ctrKernel.id];
            if(rlt == null){
                rlt = {
                    kernel:ctrKernel,
                    useprops_map:{},
                };
                formObj.useControls_map[ctrKernel.id] = rlt;
            }
        }
        rlt.useprops_map[apiitem.attrItem.name] = apiitem;
    }
}