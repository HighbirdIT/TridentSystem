class CListFormContentEditor extends React.PureComponent
{
    constructor(props) {
        super(props);
        this.attrPanelRef = React.createRef();
        this.state={
            checkState:{
            },
            selectedColName:null,
        };
        this.formContentValue = this.props.formKernel.getAttribute(AttrNames.ListFormContent);

        autoBind(this);
    }

    clickCanUseColumnHandler(ev){
        var columnName= ev.target.innerText;
        var newCheckState = Object.assign({}, this.state.checkState);
        newCheckState[columnName] = !newCheckState[columnName];
        this.setState({
            checkState:newCheckState,
        });
    }

    clickControlHandler(ev){
        var project = this.props.formKernel.project;
        var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
        if (ctlid != null) {
            var ctlKernel = project.getControlById(ctlid);
            this.attrPanelRef.current.setTarget(ctlKernel);
            ev.preventDefault();
        }
    }

    render(){
        var canUseColumns_arr = this.props.formKernel.getCanuseColumns();
        var checkState = this.state.checkState;
        
        return (<div className='w-100 h-100 d-flex'>
                <div className='d-flex flex-grow-0 flex-shrink-0 flex-column list-group autoScroll' style={{width:'13em'}}>
                    {
                        canUseColumns_arr.map(column=>{
                            return (<div onClick={this.clickCanUseColumnHandler} className='list-group-item' key={column}>
                                    <i className={'fa ' + (checkState[column] == true ? 'fa-check-square-o' : 'fa-square-o')} />{column}
                                </div>);
                        })
                    }
                </div>
                <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 flex-column' style={{width:'30em'}}>
                    {
                        this.formContentValue.controls_arr.map(control=>{
                            return (<div key={control.id} className='list-group-item'>
                                        {control.renderSelf(this.clickControlHandler)}
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

class QuickListFormContentEditPanel extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            formkernels_arr:[]
        }
        autoBind(this);
    }

    showKernel(target){
        var index = this.state.formkernels_arr.indexOf(target);
        if(index == -1){
            this.setState({
                formkernels_arr:this.state.formkernels_arr.concat(target),
            });
        }
    }

    hideKernel(target){
        var index = this.state.formkernels_arr.indexOf(target);
        if(index != -1){
            var newArr = this.state.formkernels_arr.concat();
            newArr.splice(index,1);
            this.setState({
                formkernels_arr:newArr,
            });
        }
    }

    prePanelCloseHandler(thePanel){
        this.hideKernel(thePanel.props.targetKernel);
        return false;
    }

    render(){
        var kernelArr = this.state.formkernels_arr;
        if(kernelArr.length == 0){
            return null;
        }
        return kernelArr.map(kernel=>{
            return(<FloatPanelbase preClose={this.prePanelCloseHandler} key={kernel.id} title={'编辑:' + kernel.id} initShow={true} initMax={false} width={1000} height={640} targetKernel={kernel}>
                <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                    <CListFormContentEditor formKernel={kernel} />
                </div>
            </FloatPanelbase>);
        });
    }
}