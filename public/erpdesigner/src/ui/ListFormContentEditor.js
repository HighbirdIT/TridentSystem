class CListFormContentEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.attrPanelRef = React.createRef();
        this.controlListRef = React.createRef();
        var controls_arr = this.props.formKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
        if (controls_arr == null) {
            controls_arr = [];
        }
        this.defaultControlType = M_TextKernel_Type;
        this.defaultInterActType = EInterActiveType.ReadWrite;

        var checkState = this.collectCheckState(controls_arr);

        this.state = {
            checkState: checkState,
            selectedColName: null,
            controls_arr: controls_arr,
        };
        this.formContentValue = this.props.formKernel.getAttribute(AttrNames.ListFormContent);
    }

    collectCheckState(controls_arr) {
        var rlt = {};
        controls_arr.forEach(ctlKernel => {
            var fieldValue = ctlKernel.getTextValueFieldValue();
            if (!IsEmptyString(fieldValue.text)) {
                rlt[fieldValue.text] = 1;
            }
            if (!IsEmptyString(fieldValue.value)) {
                rltrlt[fieldValue.value] = 1;
            }
            if (!IsEmptyString(fieldValue.interact)) {
                rlt[fieldValue.interact] = 1;
            }
            if (ctlKernel.editor) {
                fieldValue = ctlKernel.editor.getTextValueFieldValue();
                if (!IsEmptyString(fieldValue.text)) {
                    rlt[fieldValue.text] = 1;
                }
                if (!IsEmptyString(fieldValue.value)) {
                    rlt[fieldValue.value] = 1;
                }
                if (!IsEmptyString(fieldValue.interact)) {
                    rlt[fieldValue.interact] = 1;
                }
            }
        });
        return rlt;
    }

    clickCanUseColumnHandler(ev) {
        var columnName = getAttributeByNode(ev.target, 'columname', true);
        if (!this.state.checkState[columnName]) {
            /// add AttrNames.EditorType
            var initState = {};
            initState[AttrNames.EditorType] = this.defaultControlType;
            initState[AttrNames.InteractiveType] = this.defaultInterActType;
            var newCtl = new M_LabeledControlKernel(initState, this.props.formKernel);
            newCtl.setAttribute(AttrNames.TextField, columnName);

            var newControls_arr = this.state.controls_arr.concat(newCtl);
            var newCheckState = Object.assign({}, this.state.checkState);
            newCheckState[columnName] = !newCheckState[columnName];
            this.setState({
                checkState: newCheckState,
                controls_arr: newControls_arr,
            });
        }

    }

    clickControlHandler(ev) {
        var project = this.props.formKernel.project;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if (ctlid != null) {
            var ctlKernel = project.getControlById(ctlid);
            this.attrPanelRef.current.setTarget(ctlKernel);
            if(ev.preventDefault){
                ev.preventDefault();
            }
        }
    }

    defaultControlTypeChanged(newType){
        this.defaultControlType = newType;
    }

    defaultInteractTypeChanged(newType){
        this.defaultInterActType = newType;
    }

    clickTrashControlHandler(ev){
        var project = this.props.formKernel.project;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if (ctlid != null) {
            var ctlKernel = project.getControlById(ctlid);
            ctlKernel.delete();

            var controls_arr = this.props.formKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
            if (controls_arr == null) {
                controls_arr = [];
            }
            var checkState = this.collectCheckState(controls_arr);
            this.setState({
                checkState: checkState,
                controls_arr: controls_arr,
            });

            ev.preventDefault();
        }
    }

    mouseDownDragIconHandler(ev){
        var project = this.props.formKernel.project;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        //var dragElem = null;
        //dragElem = (<div className={'btn btn-' + (this.state.draging ? 'primary' : 'dark')} onMouseDown={this.mouseDownDragIconHandler}><i className='fa fa-arrows-v cursor-pointer' /></div>);

        this.dragingKernel = project.getControlById(ctlid);
        window.addEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.addEventListener('mousemove', this.mouseMoveWhenDragingHandler);
    }

    mouseUpWhenDragingHandler(ev){
        window.removeEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.removeEventListener('mousemove', this.mouseMoveWhenDragingHandler);
        this.dragingKernel = null;
    }

    mouseMoveWhenDragingHandler(ev){
        if(this.dragingKernel == null){
            mouseUpWhenDragingHandler(null);
            return;
        }
        var allControlElem_arr = this.controlListRef.current.children;

        for(var i=0;i<allControlElem_arr.length;++i){
            var controlElem = allControlElem_arr[i];
            var theCtlid = getAttributeByNode(controlElem, 'ctlid', true);
            var controlReact = controlElem.getBoundingClientRect();
            if(ev.y > controlReact.top + 10 && ev.y < controlReact.bottom - 10){
                if(theCtlid == this.dragingKernel.id)
                {
                    return; // same socket
                }
                this.props.formKernel.appandChild(this.dragingKernel, i);
                var controls_arr = this.props.formKernel.searchChildKernel(M_LabeledControlKernel_Type, false);
                this.setState({
                    controls_arr:controls_arr,
                });
                return;
            }
        }
    }

    addNewCtlHandler(){
        var initState = {};
        initState[AttrNames.EditorType] = this.defaultControlType;
        initState[AttrNames.InteractiveType] = this.defaultInterActType;
        var newCtl = new M_LabeledControlKernel(initState, this.props.formKernel);

        var newControls_arr = this.state.controls_arr.concat(newCtl);
        this.setState({
            controls_arr: newControls_arr,
        });
    }

    render() {
        var cusDS_bp = this.props.formKernel.getAttribute(AttrNames.CustomDataSource);
        var canUseColumns_arr = cusDS_bp && cusDS_bp.columns ? cusDS_bp.columns : [];
        
        var checkState = this.state.checkState;
        var controls_arr = this.state.controls_arr;

        return (<div className='w-100 h-100 d-flex'>
            <div className='flex-grow-0 flex-shrink-0 flex-column' >
                <div className='flex-grow-0 flex-shrink-0 text-light' style={{height:'80px'}}>
                    <div className='d-flex align-items-center'>控件类型:
                        <DropDownControl rootclass='flex-grow-1' options_arr={DesignerConfig.getMobileCanLabeledControls} value={this.defaultControlType} itemChanged={this.defaultControlTypeChanged} textAttrName='label' valueAttrName='type' />
                    </div>
                    <div className='d-flex align-items-center'>交互类型:
                        <DropDownControl rootclass='flex-grow-1' options_arr={EInterActiveTypes_arr} value={this.defaultInterActType} itemChanged={this.defaultInteractTypeChanged} textAttrName='text' valueAttrName='value' />
                    </div>
                </div>
                <div className='btn btn-group flex-grow-0 flex-shrink-0'>
                    <button onClick={this.addNewCtlHandler} type='button' className='btn btn-success' ><i className='fa fa-plus'/></button>
                </div>
                <div className='flex-grow-1 flex-shrink-1 autoScroll' style={{maxHeight:'calc(100% - 80px)'}}>
                    <div className='list-group' style={{ width: '13em' }}>
                        {
                            canUseColumns_arr.map(column => {
                                return (<div onClick={this.clickCanUseColumnHandler} className='list-group-item' key={column.name} columname={column.name}>
                                    <i className={'fa ' + (checkState[column.name] == true ? 'fa-check-square-o' : 'fa-square-o')} />{column.name}
                                </div>);
                            })
                        }
                    </div>
                </div>
            </div>
            <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 flex-column h-100 autoScroll' style={{ width: '30em' }} ref={this.controlListRef}>
                {
                    controls_arr && controls_arr.map(control => {
                        return (<div key={control.id} className='list-group-item p-0 d-flex align-items-center' ctlid={control.id}>
                            <button onMouseDown={this.mouseDownDragIconHandler} type='btn' className='btn-light'><i className='fa fa-arrows-v' /></button>
                            <div className='flex-grow-1 flex-shrink-1'>
                                {control.renderSelf(this.clickControlHandler)}
                            </div>
                            <button onClick={this.clickTrashControlHandler} type='btn' className='btn-light text-danger'><i className='fa fa-trash fa-2x' /></button>
                        </div>);
                    })
                }
            </div>
            <div className='d-flex bg-light flex-grow-1 flex-shrink-1'>
                <AttributePanel ref={this.attrPanelRef} />
            </div>
        </div>);
    }
}

class QuickListFormContentEditPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            formkernels_arr: []
        }
        autoBind(this);
    }

    showKernel(target) {
        var index = this.state.formkernels_arr.indexOf(target);
        if (index == -1) {
            this.setState({
                formkernels_arr: this.state.formkernels_arr.concat(target),
            });
        }
    }

    hideKernel(target) {
        var index = this.state.formkernels_arr.indexOf(target);
        if (index != -1) {
            var newArr = this.state.formkernels_arr.concat();
            newArr.splice(index, 1);
            this.setState({
                formkernels_arr: newArr,
            });
        }
    }

    prePanelCloseHandler(thePanel) {
        this.hideKernel(thePanel.props.targetKernel);
        return false;
    }

    render() {
        var kernelArr = this.state.formkernels_arr;
        if (kernelArr.length == 0) {
            return null;
        }
        return kernelArr.map(kernel => {
            return (<FloatPanelbase preClose={this.prePanelCloseHandler} key={kernel.id} title={'编辑:' + kernel.id} initShow={true} initMax={false} width={1000} height={640} targetKernel={kernel}>
                <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark w-100 h-100'>
                    <CListFormContentEditor formKernel={kernel} />
                </div>
            </FloatPanelbase>);
        });
    }
}