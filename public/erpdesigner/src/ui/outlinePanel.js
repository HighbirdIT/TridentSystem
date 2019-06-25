class OutlineItem extends React.PureComponent {
    constructor(props) {
        super(props);
        if (this.props.kernel.outlineProfile == null) {
            this.props.kernel.outlineProfile = {
                collapsed: false,
                selected: false,
            };
        }
        else {
            this.props.kernel.outlineProfile.outlineItem = this;
        }
        if (this.props.kernel.currentControl) {
            this.props.kernel.outlineProfile.selected = this.props.kernel.currentControl.state.selected == true;
        }
        this.state = Object.assign({ kernel: this.props.kernel }, this.props.kernel.outlineProfile);
        autoBind(this);
        React_Make_AttributeListener(this, [AttrNames.Name, AttrNames.Chidlren, 'selected', 'unselected', 'placeChanged']);
        this.rootElemRef = React.createRef();
    }

    aAttrChanged(changedAttrName) {
        if (changedAttrName == AttrNames.Chidlren) {
            this.setState({
                magicObj: {},
            });
        }
        else if (changedAttrName == 'selected') {
            this.props.kernel.outlineProfile.selected = true;
            this.setState({
                selected: true,
            });
            this.props.itemSelected(this, this.rootElemRef.current);
        }
        else if (changedAttrName == 'unselected') {
            this.props.kernel.outlineProfile.selected = false;
            this.setState({
                selected: false,
            });
        }
        else if (changedAttrName == 'placeChanged') {
            this.props.itemSelected(this, this.rootElemRef.current);
        }
        else if(changedAttrName == AttrNames.Name){
            this.setState({
                magicObj: {},
            });
        }
    }

    componentWillUnmount() {
        this.unlistenTarget(this.props.kernel);
        if (this.props.kernel.outlineProfile.outlineItem == this) {
            this.props.kernel.outlineProfile.outlineItem = null;
        }
    }

    componentWillMount() {
        this.listenTarget(this.props.kernel);
        this.props.kernel.outlineProfile.outlineItem = this;
    }

    toggleCollapse() {
        this.props.kernel.outlineProfile.collapsed = !this.state.collapsed;
        this.setState(
            {
                collapsed: !this.state.collapsed,
            }
        );
    }

    collapse() {
        this.props.kernel.outlineProfile.collapsed = true;
        this.setState(
            {
                collapsed: true,
            }
        );
    }

    uncollapse() {
        this.props.kernel.outlineProfile.collapsed = false;
        this.setState(
            {
                collapsed: false,
            }
        );
    }

    clickhandler() {
        this.state.kernel.project.designer.selectKernel(this.state.kernel);
    }

    dragTimeOutHandler() {
        //console.log('dragTimeOutHandler');
        window.removeEventListener('mouseup', this.windowMouseUpHandler);
        this.props.wantDragAct(this);
    }

    mouseDownHandler(ev) {
        this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 400);
        //console.log(ev.target);
        window.addEventListener('mouseup', this.windowMouseUpHandler);
    }

    windowMouseUpHandler(ev) {
        if (this.dragTimeOut) {
            clearTimeout(this.dragTimeOut);
        }
        window.removeEventListener('mouseup', this.windowMouseUpHandler);
    }

    render() {
        var self = this;
        if (this.state.kernel != this.props.kernel) {
            if (this.state.kernel) {
                this.unlistenTarget(this.state.kernel);
            }
            if (this.props.kernel) {
                this.listenTarget(this.props.kernel);
                if (this.props.kernel.outlineProfile) {
                    this.props.kernel.outlineProfile = {
                        collapsed: false,
                        selected: false,
                    };
                }
            }
            setTimeout(() => {
                self.setState(this.props.kernel.outlineProfile);
            }, 1);
            return null;
        }

        var kernel = this.state.kernel;
        if (kernel == null)
            return null;
        var isContainer = kernel.children != null;
        var hasChild = isContainer && kernel.children.length > 0;
        var offsetStyle = { width: (this.props.deep * 25 + (hasChild ? 0 : 7) + 'px') };
        var kernelLabel = kernel.id + (IsEmptyString(kernel[AttrNames.Name]) ? '' : '(' + kernel[AttrNames.Name] + ')');
        return (
            <div key={kernel.id} className={'outlineItemDiv' + (this.props.deep ? ' ' : ' topest') + (isContainer ? " d-felx flex-column" : '')}>
                <div className='d-flex'>
                    <span style={offsetStyle} className='flex-grow-0 flex-shrink-0' />
                    {!hasChild ? null : <span onClick={this.toggleCollapse} className={'flex-grow-0 flex-shrink-0 ml-1 icon-sm btn-secondary btn-sm' + (this.state.collapsed ? ' icon-right btn-info' : ' icon-down btn-secondary')} />}
                    <div className={'outlineItem flex-grow-0 flex-shrink-0' + (kernel.__placing ? ' bg-dark text-light' : '')} ctlselected={(this.state.selected ? ' active' : null)} onClick={this.clickhandler} onMouseDown={this.mouseDownHandler} ref={this.rootElemRef}>{(kernel.__placing ? '*' : '') + kernelLabel}</div>
                </div>

                {
                    kernel.__placing || this.state.collapsed || kernel.children == null || kernel.children.length == 0 ? null :

                        kernel.children.map(childKernel => {
                            return (<OutlineItem key={childKernel.id} kernel={childKernel} deep={this.props.deep + 1} itemSelected={this.props.itemSelected} wantDragAct={this.props.wantDragAct} />)
                        })

                }

            </div>
        );
    }
}

class OutlinePanel extends React.PureComponent {
    constructor(props) {
        super(props);
        var editingPage = this.props.project.getEditingPage();
        var editingControl = this.props.project.getEditingControl();
        this.state = { 
            editingPage: editingPage, 
            editingControl: editingControl,
        };
        React_Make_AttributeListener(this, ['editingPage', 'children']);
        autoBind(this);

        this.listenTarget(editingPage);
        this.listenTarget(editingControl);
        this.scrollDivRef = React.createRef();
        this.bottomDivRef = React.createRef();
    }

    selectKernel(kernel) {
        this.setState({ selectedKernel: kernel });
    }

    componentWillMount() {
        this.listenTarget(this.props.project);
    }

    componentWillUnmount() {
        this.unlistenTarget(this.props.project);
    }

    aAttrChanged(changedAttrName) {
        if (changedAttrName == 'children') {
            this.setState({ magicObj: {} });
        }
        else if (changedAttrName == 'editingPage') {
            var newEditingPage = this.props.project.getEditingPage();
            var newEditingControl = this.props.project.getEditingControl();
            if (newEditingPage != this.state.editingPage) {
                this.unlistenTarget(this.state.editingPage);
                this.unlistenTarget(this.state.editingControl);
                if (newEditingPage) {
                    this.listenTarget(newEditingPage);
                }
                this.setState({
                    editingPage: newEditingPage,
                });
            }
            if (newEditingControl != this.state.editingControl) {
                this.unlistenTarget(this.state.editingPage);
                this.unlistenTarget(this.state.editingControl);
                if (newEditingControl) {
                    this.listenTarget(newEditingControl);
                }
                this.setState({
                    editingControl: newEditingControl,
                });
            }
        }
    }

    wantDragAct(targetItem) {
        if(targetItem.props.kernel.isfixed){
            return;
        }
        //console.log(targetItem);
        this.beforeDragData = {
            kernel: targetItem.props.kernel,
            parent: targetItem.props.kernel.parent,
            index: targetItem.props.kernel.parent.getChildIndex(targetItem.props.kernel),
        };

        //targetItem.collapse();
        this.props.project.designer.startPlaceKernel(targetItem.props.kernel, this.dragEndHandler);
    }

    dragEndHandler(theKernel) {
        if (theKernel == this.beforeDragData.kernel) {
            if (theKernel.parent == null) {
                this.beforeDragData.parent.appandChild(theKernel, this.beforeDragData.index);
            }
        }
        if(this.autoScrollInt){
            clearInterval(this.autoScrollInt);
            this.autoScrollInt = null;
        }
        this.beforeDragData = null;
    }

    itemSelected(itemCtl, itemElem) {
        if(this.props.project.placingKernel != null && this.bMouseInPanel){
            return;
        }
        var itemRect = itemElem.getBoundingClientRect();
        var scrollDivRect = this.scrollDivRef.current.getBoundingClientRect();
        var scrollBarSize = 25;
        if (itemRect.left < scrollDivRect.left) {
            this.scrollDivRef.current.scrollLeft -= scrollDivRect.left - itemRect.left + scrollBarSize;
        }
        else if (itemRect.right > scrollDivRect.right - scrollBarSize) {
            this.scrollDivRef.current.scrollLeft += itemRect.right - scrollDivRect.right + scrollBarSize;
        }

        if (itemRect.top < scrollDivRect.top) {
            this.scrollDivRef.current.scrollTop -= scrollDivRect.top - itemRect.top + scrollBarSize;
        }
        else if (itemRect.bottom > scrollDivRect.bottom - scrollBarSize) {
            this.scrollDivRef.current.scrollTop += itemRect.bottom - scrollDivRect.bottom + scrollBarSize;
        }
    }

    searchHitResult(pos, kernel){
        var outlineItem = kernel.outlineProfile && kernel.outlineProfile.outlineItem ? kernel.outlineProfile.outlineItem : null;
        if(outlineItem == null)
            return null;
        var kernelRect = outlineItem.rootElemRef.current ? outlineItem.rootElemRef.current.getBoundingClientRect() : null
        if(!kernelRect){
            return null;
        }
        if(MyMath.isPointInRect(kernelRect, pos)){
            return {kernel:kernel, outlineItem:outlineItem, rect:kernelRect};
        }
        if(pos.y < kernelRect.bottom){
            return {lastKernel:kernel, lastRect:kernelRect}
        }
        if(kernel.children && kernel.children.length > 0){
            for(var ci in kernel.children){
                var rlt = this.searchHitResult(pos, kernel.children[ci]);
                if(rlt)
                    return rlt;
            }
        }
        return null;
    }

    placePosChanged(newPos, targetKernel) {
        var nowScrollDiv = this.scrollDivRef.current;
        var scrollDivRect = nowScrollDiv.getBoundingClientRect();
        this.bMouseInPanel = MyMath.isPointInRect(scrollDivRect, newPos);
        if (this.bMouseInPanel) {
            //console.log('isPointInRect');
            var checkBound = 40;
            var step = 5;
            if(newPos.x - scrollDivRect.left < checkBound){
                this.scrollHStep = -step;
            }
            else if(scrollDivRect.right - newPos.x < checkBound){
                this.scrollHStep = step;
            }
            else{
                this.scrollHStep = 0;
            }

            if(newPos.y - scrollDivRect.top < checkBound){
                this.scrollVStep = -step;
            }
            else if(scrollDivRect.bottom - newPos.y < checkBound){
                this.scrollVStep = step;
            }
            else{
                this.scrollVStep = 0;
            }


            var targetKernelRect = targetKernel.outlineProfile && targetKernel.outlineProfile.outlineItem && targetKernel.outlineProfile.outlineItem.rootElemRef.current ? targetKernel.outlineProfile.outlineItem.rootElemRef.current.getBoundingClientRect() : null;
            if (targetKernelRect && MyMath.isPointInRect(targetKernelRect, newPos)) {
                //console.log('move in self outlineItem');
                return;
            }
            
            var hitResult = null;
            if(this.state.editingPage){
                for(var ci in this.state.editingPage.children){
                    hitResult = this.searchHitResult(newPos, this.state.editingPage.children[ci]);
                    if(hitResult)
                        break;
                }
            }
            if(this.state.editingControl){
                for(var ci in this.state.editingControl.children){
                    hitResult = this.searchHitResult(newPos, this.state.editingControl.children[ci]);
                    if(hitResult)
                        break;
                }
            }
            
            if(hitResult && hitResult.kernel){
                var hitKernel = hitResult.kernel;
                if(hitKernel.isfixed){
                    return;
                }
                if(!hitKernel.canAppand(targetKernelRect)){
                    return;
                }
                /*
                var specialParent = hitKernel.searchParentKernel([M_LabeledControlKernel_Type], true);
                if(specialParent){
                    hitKernel = specialParent;
                }
                */

                if(hitKernel == targetKernel)
                    return;
                if(hitKernel.children != null && hitKernel.staticChild != true){
                    if(newPos.y - hitResult.rect.top <= 5){
                        hitKernel.parent.appandChild(targetKernel,hitKernel.parent.getChildIndex(hitResult.kernel));
                    }
                    else{
                        hitKernel.appandChild(targetKernel);
                    }
                }else if(hitKernel.parent){
                    hitKernel.parent.appandChild(targetKernel, hitKernel.parent.getChildIndex(hitResult.kernel));
                }
            }
            else{
                // can not found
                var bottomDivRect = this.bottomDivRef.current.getBoundingClientRect();
                if(bottomDivRect.top < newPos.y){
                    if(this.state.editingPage){
                        this.state.editingPage.appandChild(targetKernel);
                    }
                    if(this.state.editingControl){
                        this.state.editingControl.appandChild(targetKernel);
                    }
                }
            }
        }
    }

    startPlace(){
        this.autoScrollInt = setInterval(this.autoScrollHandler, 50);
        this.scrollHStep = 0;
        this.scrollVStep = 0;
    }

    endPlace(){
        clearInterval(this.autoScrollInt);
        this.autoScrollInt = null;
    }

    autoScrollHandler(){
        this.scrollDivRef.current.scrollLeft += this.scrollHStep;
        this.scrollDivRef.current.scrollTop += this.scrollVStep;
        //console.log(this.scrollHStep);
    }

    clickTrashBtnHandler(ev){
        this.props.project.designer.deleteSelectedKernel();
    }

    render() {
        return (
            <div id="outlineRoot" className="flex-grow-1 flex-shrink-1 bg-light d-flex flex-column mw-100">
                <button type="button" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{ borderRadius: '0em', height: '2.5em', overflow: 'hidden' }}>大纲</button>
                <div className='btn-group flex-grow-0 flex-shrink-0 bg-dark'>
                    <div className='btn btn-dark' onClick={this.clickTrashBtnHandler}>
                        <i className='fa fa-trash text-danger' />
                    </div>
                </div>
                <div className='flex-grow-1 flex-shrink-1 autoScroll' ref={this.scrollDivRef} >
                    <div className='flex-grow-0 flex-shrink-0 d-flex flex-column'>
                        {
                            this.state.editingPage && this.state.editingPage.children.map(
                                kernal => {
                                    return <OutlineItem key={kernal.id} kernel={kernal} deep={0} itemSelected={this.itemSelected} wantDragAct={this.wantDragAct} />
                                }
                            )
                        }
                        {
                            this.state.editingControl && this.state.editingControl.children.map(
                                kernal => {
                                    return <OutlineItem key={kernal.id} kernel={kernal} deep={0} itemSelected={this.itemSelected} wantDragAct={this.wantDragAct} />
                                }
                            )
                        }
                        <div ref={this.bottomDivRef} style={{height:'20px'}}></div>
                    </div>
                </div>
            </div>
        );
    }
}