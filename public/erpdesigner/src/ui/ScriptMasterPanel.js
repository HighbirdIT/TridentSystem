var gCopiedCustomObjectData = null;

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

class CusObjEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        autoBind(this);
    }

    reRender(){
        this.setState({
            magicObj:{},
        });
    }

    clickDoneBtn(){
        this.props.cusObj.name = this.props.cusObj.name.trim();
        this.props.cusObj.dataMembers_arr = this.props.cusObj.dataMembers_arr.map(item=>{return item.trim();}).filter(item=>{return item.length>0;});
        this.props.cusObj.editing = false;
        this.props.cusObj.emit('changed');
        this.reRender();
    }

    clickEditBtn(){
        this.props.cusObj.editing = true;
        this.reRender();
    }

    clickAddBtn(){
        this.props.cusObj.dataMembers_arr = this.props.cusObj.dataMembers_arr.concat('');
        this.reRender();
    }

    clickCopyBtn(){
        var dataJson = this.props.cusObj.getJson();
        gCopiedCustomObjectData = dataJson;
    }

    clickTrashBtn(){
        gTipWindow.popAlert(makeAlertData('警告','确定删除对接对象[' + this.props.cusObj.name + ']?',this.deleteTipCallback,[TipBtnOK,TipBtnNo]));
    }

    deleteTipCallback(key, nodeData_arr){
        if(key == 'ok'){
            this.props.wantDeleteAct(this.props.cusObj);
            this.reRender();
        }
    }

    inputChangedHandler(ev){
        var propName = getAttributeByNode(ev.target,'propname',true,3);
        if(propName){
            this.props.cusObj[propName] = ev.target.value;
        }
        else{
            var index = getAttributeByNode(ev.target,'index',true,3);
            if(index){
                this.props.cusObj.dataMembers_arr[index] = ev.target.value;
            }
        }
        this.reRender();
    }

    render(){
        var cusObj = this.props.cusObj;
        if(cusObj.editing){
            return <div className='list-group-item p-1 flex-shrink-0'>
                <div className='w-100 list-group-item bg-info p-2'>
                    <span className='d-flex flex-grow-0 flex-shrink-0'>
                        Name:<input type='text' propname='name' className='flexinput flex-grow-1 flex-shrink-1' onChange={this.inputChangedHandler} value={cusObj.name} />
                    </span>
                    {
                        cusObj.dataMembers_arr.map((item,index)=>{
                            return <span key={index} className='d-flex flex-grow-0 flex-shrink-0'>
                                        {index+1}:<input type='text' index={index} className='flexinput flex-grow-1 flex-shrink-1' onChange={this.inputChangedHandler} value={item} />
                                    </span>
                        })
                    }
                    <span className='btn-group flex-shrink-0'>
                        <button onClick={this.clickAddBtn} className='btn btn-sm fa fa-plus text-success'></button>
                        <button onClick={this.clickDoneBtn} className='btn btn-sm btn-primary'>Done</button>
                    </span>
                </div>
            </div>
        }
        return <div className='list-group-item p-1 flex-shrink-0 d-flex align-items-center'>
            <span className='flex-grow-1 flex-shrink-1'>{cusObj.name}</span>
            <button onClick={this.clickEditBtn} className='btn btn-sm fa fa-edit'></button>
            <button onClick={this.clickCopyBtn} className='btn btn-sm btn-dark fa fa-copy'></button>
            <button onClick={this.clickTrashBtn} className='btn btn-danger btn-sm fa fa-trash'></button>
        </div>
    }
}

class CusObjManager extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            master:this.props.scriptMaster,
        }

        autoBind(this);
    }

    reRender(){
        this.setState({
            magicObj:{},
        });
    }

/*
    targetChanged(){
        this.setState({
            magicObj:{},
        });
    }

    listenTarget(target){
        if(target){
            target.on('cusobjchanged', this.targetChanged);
        }
    }

    unlistenTarget(target){
        if(target){
            target.off('cusobjchanged', this.targetChanged);
        }
    }

    componentWillMount() {
        this.listenTarget(this.state.master);
    }

    componentWillUnmount() {
        this.unlistenTarget(this.state.master);
    }
*/
    clickAddBtn(){
        var newCusObj = this.state.master.createCusObj('unname');
        newCusObj.editing = true;
        this.reRender();
    }

    clickPasteBtn(){
        if(gCopiedCustomObjectData){
            var newCusObj = new CustomObject(gCopiedCustomObjectData.name, gCopiedCustomObjectData.code, gCopiedCustomObjectData.dm);
            this.state.master.addCusObj(newCusObj);
            this.reRender();
        }
    }

    wantDeleteAct(custObj){
        this.state.master.deleteCusObj(custObj);
        this.reRender();
    }

    render(){
        if(this.state.master == null){
            return null;
        }
        return <React.Fragment>
            <span className='text-light flex-grow-0 flex-shrink-0 bg-dark d-flex align-items-center bg-secondary p-1'>
                <span className='flex-grow-1 flex-shrink-1'>数据对象</span>
                <button onClick={this.clickPasteBtn} className='btn btn-sm btn-dark fa fa-paste'></button>
                <button onClick={this.clickAddBtn} className='btn btn-sm btn-success fa fa-plus'></button>
            </span>
            <div className='list-group flex-grow-0 flex-shrink-0 autoScroll' style={{maxHeight:'300px'}}>
            {
                this.state.master.cusobjects_arr.map(item=>{
                    return <CusObjEditor wantDeleteAct={this.wantDeleteAct} key={item.code} cusObj={item} />
                })
            }
            </div>
        </React.Fragment>
        
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
        var groupedItems_arr = [];
        this.state.items_arr.forEach(x=>{
            var founedGroup = groupedItems_arr.find(y=>{return y.name == x.group;});
            if(founedGroup == null){
                groupedItems_arr.push({
                    name:x.group,
                    items:[x],
                });
            }
            else{
                founedGroup.items.push(x);
            }
        });
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
                    <div className='d-flex flex-column flex-grow-1 flex-shrink-1 w-100' >
                        <CusObjManager scriptMaster={this.props.project.scriptMaster} />
                        已创建的脚本:
                        <div className='d-flex flex-column flex-grow-1 flex-shrink-1 bg-dark autoScroll'>
                            {
                                groupedItems_arr.map(group=>{
                                    return <div key={group.name} className='card m-2 flex-grow-0 flex-shrink-0'>
                                        <div className='card-body p-1'>
                                            <span className='card-title'>{group.name}</span>
                                            {
                                                group.items.map(item=>{
                                                    return <div onClick={this.clickListItemHandler} key={item.code} data-itemvalue={item.code} className={'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '')}>{item.name}<span className='badge badge-secondary'>{item.type}</span></div>
                                                })
                                            }
                                        </div>
                                    </div>
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