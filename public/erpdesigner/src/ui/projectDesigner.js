class ProjectDesigner extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
        };

        this.state = initState;
        this.flowMCRef = React.createRef();
        this.contenPanelRef = React.createRef();
        this.attrbutePanelRef = React.createRef();
        this.outlineRef = React.createRef();
        this.dataMasterPanelRef = React.createRef();
        this.quickMenuRef = React.createRef();
        this.scriptMasterPanelRef = React.createRef();
        this.quickScriptEditPanelRef = React.createRef();
        this.quickSqlBPEditPanelRef = React.createRef();
        this.quickListFormContentEditPanelRef = React.createRef();
        autoBind(this);
        this.props.project.designer = this;

        this.placingCtonrols = {};
        this.selectedKernel = null;

        var rightPanelNavItems = [
            CreateNavItemData('属性', <AttributePanel project={this.props.project} ref={this.attrbutePanelRef} />),
            CreateNavItemData('项目管理', <ProjectResPanel project={this.props.project} />),
        ];
        
        this.rightPanelNavData = {
            selectedItem: rightPanelNavItems[0],
            items: rightPanelNavItems,
        };
    }

    saveProject(){
        this.props.savePanelRef.current.saveProject(this.props.project);
    }

    propUpMenu(items_arr, pos, callBack){
        this.quickMenuRef.current.popMenu(items_arr, pos, callBack);
    }

    selectKernel(kernel){
        /*
        if(this.selectedKernel == kernel){
            return;
        }
        if(this.selectedKernel){
            this.selectedKernel.setSelected(false);
        }
        if(kernel){
            kernel.setSelected(true);
        }
        this.selectedKernel = kernel;
        */
        if(this.attrbutePanelRef.current)
            this.attrbutePanelRef.current.setTarget(kernel);
    }

    deleteSelectedKernel(){
        if(this.attrbutePanelRef.current == null){
            return;
        }
        var nowTarget = this.attrbutePanelRef.current.getTarget();
        if(nowTarget == null){
            return;
        }
        if(nowTarget.parent == null){
            return;
        }
        if(ControlKernelBase.prototype.isPrototypeOf(nowTarget)){
            // is kernel
            if(nowTarget.parent == M_LabeledControlKernel_Type){
                return;
            }
            nowTarget.delete();
        }
    }

    mouseDownControlIcon(ctltype) {
        this.contenPanelRef.current.endPlace();
        var thisProject = this.props.project;
        var editingPage = thisProject.getEditingPage();
        var editingControl = thisProject.getEditingControl();
        if(editingPage == null && editingControl == null){
            return;
        }
        var newKernel = null;
        if(this.placingCtonrols[ctltype] && this.placingCtonrols[ctltype].parent == null){
            newKernel = this.placingCtonrols[ctltype];
        }
        else{
            newKernel = thisProject.createKernalByType(ctltype);
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
        var thisProject = this.props.project;
        var editingPage = thisProject.getEditingPage();
        var editingControl = thisProject.getEditingControl();
        if(editingPage == null && editingControl == null){
            return;
        }
        var newKernel = null;
        if(this.placingCtonrols[refID] && this.placingCtonrols[refID].parent == null){
            newKernel = this.placingCtonrols[refID];
        }
        else{
            newKernel = new UserontrolKernel({refID:refID}, thisProject);
            this.placingCtonrols[refID] = newKernel;
        }
        if (newKernel == null) {
            console.warn('从' + refID + '创建控件失败！');
            return;
        }

        this.startPlaceKernel(newKernel);
    }

    startPlaceKernel(theKernel,callBack){
        this.flowMCRef.current.setGetContentFun(() => {
            return (<span>放置:{theKernel.description + theKernel.id}</span>)
        });

        window.addEventListener('mouseup', this.mouseUpInPlacingHandler);
        theKernel.__placing = true;
        this.contenPanelRef.current.startPlace(theKernel);
        this.placeEndCallBack = callBack;
        this.placingKernel = theKernel;
        this.props.project.placingKernel = theKernel;
        theKernel.fireForceRender();
        if(this.outlineRef.current)
            this.outlineRef.current.startPlace();
    }

    mouseUpInPlacingHandler(ev) {
        this.flowMCRef.current.setGetContentFun(null);
        window.removeEventListener('mouseup', this.mouseUpInPlacingHandler);
        this.props.project.placingKernel = null;
        this.contenPanelRef.current.endPlace();
        if(this.outlineRef.current)
            this.outlineRef.current.endPlace();
        if(this.placeEndCallBack){
            this.placeEndCallBack(this.placingKernel);
            this.placeEndCallBack = null;
        }
        if(this.placingKernel.type){
            this.placingCtonrols[this.placingKernel.type] = null;
        }
        else if(this.placingKernel.refID){
            this.placingCtonrols[this.placingKernel.refID] = null;
        }
        this.placingKernel = null;
        //console.log('mouseUpInPlacingHandler');
        return;
    }

    startDrag(dragData, callBack, contentFun){
        if(dragData.info == null){
            dragData.info = '位置drag';
        }
        if(contentFun == null){
            this.flowMCRef.current.setGetContentFun(() => {
                return (<span className='text-nowrap border bg-dark text-light'>{dragData.info}</span>)
            });
        }
        else{
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
        if(this.dragEndCallBack){
            this.dragEndCallBack({x:ev.x, y:ev.y},this.dragingData);
            this.dragingData = null;
        }
        //console.log(ev);
    }

    FMpositionChanged(newPos) {
        if(this.placingKernel != null){
            if(this.outlineRef.current)
                this.outlineRef.current.placePosChanged(newPos, this.placingKernel);
            if (this.contenPanelRef.current && !this.outlineRef.current.bMouseInPanel){
                this.contenPanelRef.current.placePosChanged(newPos);
            }
        }
    }

    wantOpenPanel(panelName){
        console.log('wantOpenPanel:' + panelName);
        switch(panelName){
            case 'datamaster':
                if(this.dataMasterPanelRef.current){
                    //this.dataMasterPanelRef.current.show();
                    this.dataMasterPanelRef.current.toggle();
                }
            break;
            case 'scriptmaster':
                if(this.scriptMasterPanelRef.current){
                    //this.dataMasterPanelRef.current.show();
                    this.scriptMasterPanelRef.current.toggle();
                }
            break;
            case 'flowmaster':
                if(gFlowMasterRef.current){
                    //this.dataMasterPanelRef.current.show();
                    gFlowMasterRef.current.toggle();
                }
            break;
        }
    }

    forcusSqlNode(nodeData){
        if(this.dataMasterPanelRef.current == null){
            return;
        }
        this.dataMasterPanelRef.current.show();
        var dataMaskterPanel = this.dataMasterPanelRef.current;
        setTimeout(() => {
            dataMaskterPanel.forcusSqlNode(nodeData);
        }, 200);
    }

    editScriptBlueprint(jsbp){
        if(this.quickScriptEditPanelRef.current != null){
            this.quickScriptEditPanelRef.current.showBlueprint(jsbp);
        }
    }

    editSqlBlueprint(sqlbp){
        if(this.quickSqlBPEditPanelRef.current != null){
            this.quickSqlBPEditPanelRef.current.showBlueprint(sqlbp);
        }
    }

    editListFormContent(formKernel){
        if(this.quickListFormContentEditPanelRef.current != null){
            this.quickListFormContentEditPanelRef.current.showKernel(formKernel);
        }
    }

    rightNavChanged(oldItem, newItem) {
        this.setState({
            magicObj: {}
        });
    }

    render() {
        var thisProject = this.props.project;
        return (
            <div className={this.props.className}>
                <DataMasterPanel ref={this.dataMasterPanelRef} project={thisProject} />
                <ScriptMasterPanel ref={this.scriptMasterPanelRef} project={thisProject} />
                <QuickScriptEditPanel ref={this.quickScriptEditPanelRef} project={thisProject} />
                <QuickSqlBPEditPanel ref={this.quickSqlBPEditPanelRef} project={thisProject} />
                <QuickListFormContentEditPanel ref={this.quickListFormContentEditPanelRef} project={thisProject} />
                <SplitPanel
                    defPercent={0.15}
                    barClass='bg-secondary'
                    panel1={<SplitPanel
                                        defPercent={0.7}
                                        fixedOne={false}
                                        flexColumn={true}
                                        panel1={<ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} mouseDownUserControlIcon={this.mouseDownUserControlIcon} />}
                                        panel2={<OutlinePanel project={thisProject} ref={this.outlineRef}/>}
                                    />}
                    panel2={
                        <SplitPanel defPercent={0.8}
                             fixedOne={false}
                             barClass='bg-secondary'
                             panel1={
                                <SplitPanel
                                        defPercent={0.8}
                                        barClass='bg-secondary'
                                        fixedOne={false}
                                        flexColumn={true}
                                        panel1={<ContentPanel project={thisProject} ref={this.contenPanelRef} wantOpenPanel={this.wantOpenPanel} />}
                                        panel2={<LogOutputPanel source={thisProject.logManager} />}
                                />
                             }
                             panel2={
                                 <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                                    <div className='d-flex flex-grow-0 flex-shrink-0 bg-secondary'>
                                        <TabNavBar ref={this.navbarRef} navData={this.rightPanelNavData} navChanged={this.rightNavChanged} />
                                    </div>
                                    {
                                        this.rightPanelNavData.items.map(item => {
                                            return (<div key={item.text} className={'flex-grow-1 flex-shrink-1 ' + (item == this.rightPanelNavData.selectedItem ? ' d-flex' : ' d-none')}>
                                                {item.content}
                                            </div>)
                                        })
                                    }
                                </div>
                             }
                            />
                            }
                />
                <FlowMouseContainer project={thisProject} ref={this.flowMCRef} positionChanged={this.FMpositionChanged} />
                <QuickMenuContainer project={thisProject} ref={this.quickMenuRef} />
            </div>
        )
    }
}

/*
<ControlPanel project={thisProject} mouseDownControlIcon={this.mouseDownControlIcon} />
                <ContentPanel project={thisProject} ref={this.contenPanelRef}/>
                <div className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' style={{width:'350px'}}>
                    <AttributePanel project={thisProject}/>
                    <OutlinePanel project={thisProject}/>
                </div>

                <SplitPanel defPercent={0.1}
                             panel1={<ContentPanel project={thisProject} ref={this.contenPanelRef} />}
                             panel2={<div className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' style={{ width: '350px' }}>
                                        <AttributePanel project={thisProject} />
                                        <OutlinePanel project={thisProject} />
                                    </div>}
                            />
*/