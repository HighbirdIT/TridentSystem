class ScriptMasterPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.panelBaseRef = React.createRef();
        this.state = {};

        autoBind(this);
    }

    forcusJsNode(nodeData){
        var self = this;
        setTimeout(() => {
        }, 200);
    }

    show() {
        this.panelBaseRef.current.show();
    }
    close() {
        this.panelBaseRef.current.close();
    }

    toggle() {
        this.panelBaseRef.current.toggle();
    }

    navChanged(oldItem, newItem) {
        this.setState({
            magicObj: {}
        });
    }


    render() {
        return (
            <FloatPanelbase title='脚本大师' ref={this.panelBaseRef} initShow={false} initMax={true}>
                <JSBPItemPanel project={this.props.project} />
            </FloatPanelbase>
        );
    }
}

class JSBPItemPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        var item_arr = this.props.project.scriptMaster.blueprints_arr;
        this.state={
            items_arr:item_arr,
            selectedItem:item_arr.length == 0 ? null : item_arr[0],
        }
        this.bpEditorRef = React.createRef();
        autoBind(this);
    }

    clickListItemHandler(ev){
        var targetCode = getAttributeByNode(ev.target, 'data-itemvalue', true, 5);
        var targetItem = this.state.items_arr.find(item=>{return item.code == targetCode});
        this.setState({selectedItem:targetItem});
    }

    clickAddBtnhandler(ev){
        this.setState({
            creating:true,
        });
    }

    clickEditBtnHandler(ev){
        if(this.state.selectedItem){
            this.setState({
                modifing:true,
            });
        }
    }

    newItemCompleteHandler(newDBE){
        this.setState({
            creating:false,
            modifing:false,
        });
    }

    forcusNode(nodeData){
        this.setState({selectedItem:nodeData.bluePrint});
        var self = this;
        setTimeout(() => {
            if(self.bpEditorRef.current == null){
                return;
            }
            self.bpEditorRef.current.forcusNode(nodeData);
        }, 200);
    }

    render() {
        var selectedItem = this.state.selectedItem;
        return (
            <React.Fragment>
                {
                    this.state.creating || this.state.modifing ? <JSBPEditPanel targetBP={this.state.modifing ? selectedItem : null} scriptMaster={this.props.project.scriptMaster} onComplete={this.newItemCompleteHandler} /> : null
                }
                <SplitPanel
                defPercent={0.45}
                maxSize='300px'
                barClass='bg-secondary'
                panel1={
                    <div className='d-flex flex-column flex-grow-1 flex-shrink-1' >
                        已创建的:
                        <div className='list-group flex-grow-1 flex-shrink-1 bg-dark autoScroll'>
                            {
                                this.state.items_arr.map(item=>{
                                    return <div onClick={this.clickListItemHandler} key={item.code} data-itemvalue={item.code} className={'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '')}>{item.name}<span className='badge badge-secondary'>{item.type}</span></div>
                                })
                            }
                        </div>
                        <div className='flex-shrink-0 btn-group'>
                            <button type='button' onClick={this.clickAddBtnhandler} className='btn btn-success flex-grow-1'><i className='fa fa-plus' /></button>
                            <button type='button' onClick={this.clickEditBtnHandler} className='btn'><i className='fa fa-edit' /></button>
                        </div>
                    </div>
                }
                panel2={
                    <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                        <C_JSNode_Editor ref={this.bpEditorRef} bluePrint={selectedItem} />
                    </div>
                }
                />
            </React.Fragment>)
    }
}

class JSBPEditPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
        }
        autoBind(this);

        this.nameRef = React.createRef();
        this.typeRef = React.createRef();
    }

    clickConfirmHandler(){
        var targetBP = this.props.targetBP;
        if(targetBP != null && targetBP.group != 'custom'){
            this.setState({
                errinfo:'这个不是自定义蓝图不可修改!'
            });
            return;
        }
        var name = this.nameRef.current.getValue().trim();
        if(name.length <= 2){
            this.setState({
                errinfo:'名字的长度必须大于2'
            });
            return;
        }
        var nowBP = this.props.scriptMaster.getBPByName(name);
        if(nowBP != null && nowBP != targetBP){
            this.setState({
                errinfo:'已有同名的蓝图存在'
            });
            return;
        }
        var type = this.typeRef.current.getValue();
        if(type.length == 0){
            this.setState({
                errinfo:'必须选择类型'
            });
            return;
        }
        var targetBP = this.props.targetBP;
        if(targetBP == null){
            targetBP = this.props.scriptMaster.createBP(name, type, 'custom');
        }
        else{
            targetBP = this.props.scriptMaster.modifyBP(targetBP, name, type);
        }
        this.props.onComplete(targetBP);
    }

    clickCancelHandler(){
        this.props.onComplete(null);
    }

    render(){
        var targetBP = this.props.targetBP;
        var title = '新建脚本蓝图';
        if(targetBP != null){
            title = '修改' + targetBP.name;
        }
        var value = targetBP == null ? '' : targetBP.name;
        var type = targetBP == null ? 'client' : targetBP.type;
        var nameWidth = 100;
        return <FloatPanelbase title={title} width={480} height={320} initShow={true} sizeable={false} closeable={false} ismodel={true} >
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <div className='d-flex flex-column autoScroll flex-grow-1 flex-shrink-1'>
                        <NameInputRow label='名称' type='text' rootClass='m-1' nameWidth={nameWidth} ref={this.nameRef} default={value} />
                        <NameInputRow label='类型' type='select' rootClass='m-1' nameWidth={nameWidth} options_arr={[FunType_Client,FunType_Server]} default={type} ref={this.typeRef} />   
                        <div className='flex-grow-1 flex-shrink-1 text-info'>
                            {
                                this.state.errinfo
                            }
                        </div>
                    </div>
                    <div className='flex-grow-0 flex-shrink-0 btn-group'>
                        <button type='button' onClick={this.clickConfirmHandler} className='btn btn-success flex-grow-1 flex-shrink-1'>{targetBP ? '修改' : '创建'}</button>
                        <button type='button' onClick={this.clickCancelHandler} className='btn btn-danger flex-grow-1 flex-shrink-1'>取消</button>
                    </div>
                </div>
            </FloatPanelbase>
    }
}

class QuickScriptEditPanel extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            blueprints_arr:[]
        }
        autoBind(this);
    }

    showBlueprint(target){
        var index = this.state.blueprints_arr.indexOf(target);
        if(index == -1){
            this.setState({
                blueprints_arr:this.state.blueprints_arr.concat(target),
            });
        }
    }

    hideBlueprint(target){
        var index = this.state.blueprints_arr.indexOf(target);
        if(index != -1){
            var newArr = this.state.blueprints_arr.concat();
            newArr.splice(index,1);
            this.setState({
                blueprints_arr:newArr,
            });
        }
    }

    prePanelCloseHandler(thePanel){
        this.hideBlueprint(thePanel.props.targetBP);
        return false;
    }

    render(){
        var bpArr = this.state.blueprints_arr;
        if(bpArr.length == 0){
            return null;
        }
        return bpArr.map(bp=>{
            return(<FloatPanelbase preClose={this.prePanelCloseHandler} key={bp.code} title={'编辑:' + bp.name} initShow={true} initMax={false} width={800} height={640} targetBP={bp}>
                <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                    <C_JSNode_Editor bluePrint={bp} />
                </div>
            </FloatPanelbase>);
        });
    }
}