class CKernelContentPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var targetKernel = this.props.targetKernel;
        var initState = {
            title: targetKernel.getReadableName(),
            targetKernel: targetKernel,
        };
        this.state = initState;

        this.rootRef = React.createRef();
        autoBind(this);
    }

    clickContentDivHander(ev) {
        var tNode = ev.target;
        var found = false;
        do {
            if (tNode.hasAttribute('id') && tNode.getAttribute('id') == 'editorContainer') {
                found = true;
                break;
            }
            tNode = tNode.parentNode;
        } while (tNode && tNode != document.body);
        if (found) {
            return;
        }
        this.props.designer.selectKernel(this.state.targetKernel);
    }

    startPlace(ctlKernel) {
        this.placingKernel = ctlKernel;
    }

    endPlace(){
        if(this.placingKernel){
            this.placingKernel.__placing = false;
            if(this.placingKernel.parent){
                this.placingKernel.fireForceRender();
                this.props.designer.selectKernel(this.placingKernel);
            }
            else{
                console.log('reback');
            }
            this.placingKernel = null;
        }
    }

    placePosChanged(newPos){
        if(this.state.targetKernel.currentControl){
            this.state.targetKernel.currentControl.tryPlaceKernel(this.placingKernel,newPos);
        }
    }

    clickControlHandler(ev){
        var project = this.state.targetKernel.project;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if (ctlid != null) {
            var ctlKernel = project.getControlById(ctlid);
            this.props.designer.selectKernel(ctlKernel);
            if(ev.preventDefault){
                ev.preventDefault();
            }
        }
    }

    render() {
        return (
            <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                <div className='flex-grow-0 flex-shrink-0 d-flex bg-secondary projectContentHeader align-items-center'>
                    <div className='flex-grow-1 flex-shrink-1 d-flex justify-content-center align-items-center text-light'>
                        <h4 >
                            {this.state.title}
                        </h4>
                    </div>
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 minh-0'>
                    <div onClick={this.clickContentDivHander} className='flex-grow-1 flex-shrink-1 autoScroll d-flex justify-content-center'>
                        <div id='editorContainer' className='bg-light d-flex flex-column m-4 border border-primary flex-grow-0 flex-shrink-1 mobilePage rounded' >
                            {this.state.targetKernel.renderSelf(this.clickControlHandler, null, this.props.designer)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class CKernelContentEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            targetKernel:this.props.targetKernel,
            project:this.props.targetKernel.project,
        };

        this.state = initState;
        this.flowMCRef = React.createRef();
        this.contenPanelRef = React.createRef();
        this.attrbutePanelRef = React.createRef();
        this.outlineRef = React.createRef();
        this.quickMenuRef = React.createRef();
        autoBind(this);

        this.placingCtonrols = {};
    }

    propUpMenu(items_arr, pos, callBack) {
        this.quickMenuRef.current.popMenu(items_arr, pos, callBack);
    }

    getSelectedKernel(){
        if (this.attrbutePanelRef.current)
            return this.attrbutePanelRef.current.getTarget(); 
    }

    selectKernel(kernel) {
        var nowTarget = this.attrbutePanelRef.current.getTarget();
        if(nowTarget == kernel){
            return;
        }
        if(nowTarget && nowTarget != this.state.targetKernel){
            nowTarget.setSelected(false);
        }
        if (this.attrbutePanelRef.current)
            this.attrbutePanelRef.current.setTarget(kernel);
    }

    deleteSelectedKernel() {
        if (this.attrbutePanelRef.current == null) {
            return;
        }
        var nowTarget = this.attrbutePanelRef.current.getTarget();
        if (nowTarget == null) {
            return;
        }
        if (nowTarget.parent == null) {
            return;
        }

        if (ControlKernelBase.prototype.isPrototypeOf(nowTarget)) {
            // is kernel
            if (nowTarget.parent == M_LabeledControlKernel_Type) {
                return;
            }
            var kernelLabel = nowTarget.id + (IsEmptyString(nowTarget[AttrNames.Name]) ? '' : '(' + nowTarget[AttrNames.Name] + ')');
            gTipWindow.popAlert(makeAlertData('警告', '确定删除"' + kernelLabel + '"吗?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], nowTarget));
        }
    }

    deleteTipCallback(key, nowTarget) {
        if (key == 'ok') {
            nowTarget.delete();
        }
        this.attrbutePanelRef.current.setTarget(null);
    }

    mouseDownControlIcon(ctltype) {
        this.contenPanelRef.current.endPlace();
        var newKernel = null;
        if (this.placingCtonrols[ctltype] && this.placingCtonrols[ctltype].parent == null) {
            newKernel = this.placingCtonrols[ctltype];
        }
        else {
            newKernel = this.state.project.createKernalByType(ctltype);
            this.placingCtonrols[ctltype] = newKernel;
        }
        if (newKernel == null) {
            console.warn('从' + ctltype + '创建控件失败！');
            return;
        }
        this.startPlaceKernel(newKernel);
    }

    mouseDownUserControlIcon(refID) {
        this.contenPanelRef.current.endPlace();
        var newKernel = null;
        if (this.placingCtonrols[refID] && this.placingCtonrols[refID].parent == null) {
            newKernel = this.placingCtonrols[refID];
        }
        else {
            newKernel = new UserControlKernel({ refID: refID }, this.state.targetKernel);
            this.placingCtonrols[refID] = newKernel;
        }
        if (newKernel == null) {
            console.warn('从' + refID + '创建控件失败！');
            return;
        }

        this.startPlaceKernel(newKernel);
    }

    startPlaceKernel(theKernel, callBack) {
        this.flowMCRef.current.setGetContentFun(() => {
            return (<span>放置:{theKernel.description + theKernel.id}</span>)
        });

        window.addEventListener('mouseup', this.mouseUpInPlacingHandler);
        theKernel.__placing = true;

        this.contenPanelRef.current.startPlace(theKernel);
        this.placeEndCallBack = callBack;
        this.placingKernel = theKernel;
        this.state.project.placingKernel = theKernel;
        theKernel.fireForceRender();
        if (this.outlineRef.current)
            this.outlineRef.current.startPlace();
    }

    mouseUpInPlacingHandler(ev) {
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpInPlacingHandler);
        this.state.project.placingKernel = null;
        this.contenPanelRef.current.endPlace();
        if (this.outlineRef.current)
            this.outlineRef.current.endPlace();
        if (this.placeEndCallBack) {
            this.placeEndCallBack(this.placingKernel);
            this.placeEndCallBack = null;
        }
        if (this.placingKernel.type) {
            this.placingCtonrols[this.placingKernel.type] = null;
        }
        else if (this.placingKernel.refID) {
            this.placingCtonrols[this.placingKernel.refID] = null;
        }
        this.placingKernel = null;
        //console.log('mouseUpInPlacingHandler');
        return;
    }

    startDrag(dragData, callBack, contentFun) {
        if (dragData.info == null) {
            dragData.info = '位置drag';
        }
        if (contentFun == null) {
            this.flowMCRef.current.setGetContentFun(() => {
                return (<span className='text-nowrap border bg-dark text-light'>{dragData.info}</span>)
            });
        }
        else {
            this.flowMCRef.current.setGetContentFun(() => {
                return contentFun();
            });
        }

        window.addEventListener('mouseup', this.mouseUpInDragingHandler);
        this.dragEndCallBack = callBack;
        this.dragingData = dragData;
    }

    mouseUpInDragingHandler(ev) {
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpInDragingHandler);
        if (this.dragEndCallBack) {
            this.dragEndCallBack({ x: ev.x, y: ev.y }, this.dragingData);
            this.dragingData = null;
        }
        //console.log(ev);
    }

    FMpositionChanged(newPos) {
        if (this.placingKernel != null) {
            if (this.outlineRef.current)
                this.outlineRef.current.placePosChanged(newPos, this.placingKernel);
            if (this.contenPanelRef.current && !this.outlineRef.current.bMouseInPanel) {
                this.contenPanelRef.current.placePosChanged(newPos);
            }
        }
    }

    render() {
        var thisProject = this.state.project;
        return (
            <div className='w-100 h-100'>
                <SplitPanel
                    defPercent={0.15}
                    barClass='bg-secondary'
                    panel1={<SplitPanel
                        defPercent={0.7}
                        fixedOne={false}
                        flexColumn={true}
                        panel1={<ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} mouseDownUserControlIcon={this.mouseDownUserControlIcon} />}
                        panel2={<OutlinePanel designer={this} rootItem={this.state.targetKernel} ref={this.outlineRef} />}
                    />}
                    panel2={
                        <SplitPanel defPercent={0.8}
                            fixedOne={false}
                            barClass='bg-secondary'
                            panel1={
                                <CKernelContentPanel targetKernel={this.props.targetKernel} ref={this.contenPanelRef} designer={this} attributePanelRef={this.attrbutePanelRef} />
                            }
                            panel2={
                                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                                    <AttributePanel ref={this.attrbutePanelRef} nofixwidth={true} />
                                </div>
                            }
                        />
                    }
                />
                <FlowMouseContainer project={thisProject} ref={this.flowMCRef} positionChanged={this.FMpositionChanged} />
                <QuickMenuContainer project={thisProject} ref={this.quickMenuRef} />
            </div>);
    }
    
}

class QuickKernelContentEditprPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targetKernels: []
        }
        autoBind(this);
        
    }

    showKernel(target) {
        var index = this.state.targetKernels.indexOf(target);
        if (index == -1) {
            this.setState({
                targetKernels: this.state.targetKernels.concat(target),
            });
        }
    }

    hideKernel(target) {
        var index = this.state.targetKernels.indexOf(target);
        if (index != -1) {
            var newArr = this.state.targetKernels.concat();
            newArr.splice(index, 1);
            this.setState({
                targetKernels: newArr,
            });
        }
    }

    prePanelCloseHandler(thePanel) {
        this.hideKernel(thePanel.props.targetKernel);
        return false;
    }

    render() {
        var kernelArr = this.state.targetKernels;
        if (kernelArr.length == 0) {
            return null;
        }
        return kernelArr.map(kernel => {
            return (<FloatPanelbase preClose={this.prePanelCloseHandler} key={kernel.id} title={'编辑:' + kernel.id} initShow={true} initMax={false} width={1000} height={640} targetKernel={kernel}>
                    <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark w-100 h-100'>
                        <CKernelContentEditor targetKernel={kernel} />
                    </div>
            </FloatPanelbase>);
        });
    }
}