class AttributeEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var initState = {
            value: this.getAttrNowValue(),
            targetobj: this.props.targetobj,
        };
        this.state = initState;
    }

    getAttrNowValue(notclone) {
        var rlt = this.props.targetobj.getAttribute(this.props.targetattr.name, this.props.index);
        if(rlt == null){
            switch(this.props.targetattr.valueType){
                case ValueType.StyleValues:
                rlt = {};
                break;
                default:
                rlt = '';
            }
        }
        else{
            if(typeof rlt === 'object'){
                rlt = notclone ? rlt : Object.assign({},rlt);
            }
        }
        switch(this.props.targetattr.valueType){
            case ValueType.StyleValues:
            if(typeof rlt === 'string'){
                rlt = {};
            }
            break;
        }
        return rlt;
    }

    getRealAttrName(){
        return this.props.targetattr.name + (this.props.index == null ? '' : '_' + this.props.index);
    }

    getRealAttrLabel(){
        return this.props.targetattr.label + (this.props.index == null ? '' : this.props.index);
    }

    getRealAttrInputID(){
        return this.props.targetattr.inputID + (this.props.index == null ? '' : this.props.index);
    }

    listenTarget(target) {
        target.on(EATTRCHANGED, this.attrChangedHandler);
    }

    unlistenTarget(target) {
        target.off(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillMount() {
        this.listenTarget(this.props.targetobj);
    }

    componentWillUnmount() {
        this.unlistenTarget(this.props.targetobj);
    }

    attrChangedHandler(ev) {
        var myAttrName = this.props.targetattr.name;
        const match = pattern => typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
        var isMyAttrChaned = false;
        if (typeof ev.name === 'string') {
            isMyAttrChaned = ev.name == myAttrName;
            if(isMyAttrChaned && this.props.index >= 0){
                isMyAttrChaned = this.props.index == ev.index;
            }
        }
        else {
            isMyAttrChaned = ev.name.some(match);
        }
        if (isMyAttrChaned) {
            this.setState(nowState => {
                return { value: this.getAttrNowValue(), };
            });
        }
    }

    doSetAttribute(newValue){
        this.props.targetobj.setAttribute(this.props.targetattr.name, newValue, this.props.index);
    }

    itemChangedHandler(newItem){
        this.doSetAttribute(newItem);
    }

    renderStyleAttrEditor(nowVal,theAttr,attrName,inputID){
        var nameDDCValue = ReplaceIfNull(nowVal.name, '');
        var valueElem = null;
        var setting = StyleAttrSetting[nameDDCValue];
        if(setting != null){
            var value = ReplaceIfNull(nowVal.value, setting.def);
            if(setting.options_arr){
                valueElem = (<DropDownControl options_arr={setting.options_arr} value={value} itemChanged={this.styleValueDDCChanged}/>)
            }
            else{
                var inputType = 'text';
                switch(setting.type){
                    case ValueType.Boolean:
                    inputType = 'checkbox';
                    break;
                }

                valueElem = (<input type={inputType} className="form-control" checked={value} value={value} onChange={this.styleValueInputChanged} />);
            }
            
        }
        this.styleSetting = setting;
        return (<div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <DropDownControl options_arr={AttrNames.StyleAttrNames.values_arr} value={nameDDCValue} itemChanged={this.styleNameDDCChanged}/>
                    {valueElem}
                </div>);
        
    }

    styleValueInputChanged(ev) {
        if(this.styleSetting == null){
            return;
        }
        var inputElem = ev.target;
        var inputVal = null;
        switch(this.styleSetting.type){
            case ValueType.Boolean:
            inputVal = inputElem.checked;
            break;
            default:
            inputVal = inputElem.value;
        }
        var nowVal = this.state.value;
        
        nowVal.value = inputVal;
        this.doSetAttribute(nowVal);
    }

    styleNameDDCChanged(newName){
        var nowVal = this.state.value;
        nowVal.name = newName;
        var setting = StyleAttrSetting[newName];
        if(setting != null){
            nowVal.value = setting.def;
        }
        this.doSetAttribute(nowVal);
    }

    styleValueDDCChanged(newVal){
        var nowVal = this.state.value;
        this.doSetAttribute(nowVal);
    }

    clickjsIconHandler(ev){
        var nowValParseRet = parseObj_CtlPropJsBind(this.state.value);
        var newVal = '';
        if(nowValParseRet.isScript){
            newVal = nowValParseRet.oldtext == null ? '' : nowValParseRet.oldtext;
        }
        else{
            newVal = makeObj_CtlPropJsBind(this.props.targetobj.id, this.props.targetattr.name, 'get', nowValParseRet.string);
        }
        this.doSetAttribute(newVal);
    }

    clickModifyJSBtnHandler(ev){
        var project = this.props.targetobj.project;
        if(project == null){
            return;
        }
        var nowValParseRet = parseObj_CtlPropJsBind(this.state.value, project.scriptMaster);
        if(!nowValParseRet.isScript){
            return;
        }
        var targetBP = nowValParseRet.jsBp;
        if(targetBP == null){
            var theAttr = this.props.targetattr;
            targetBP = project.scriptMaster.createBP(nowValParseRet.funName, this.props.targetattr.scriptSetting.type, theAttr.scriptSetting.group);
            targetBP.ctlID = this.props.targetobj.id;
            this.setState({
                magicObj:{}
            });
        }
        project.designer.editScriptBlueprint(targetBP);
    }

    clickModifyScriptBtnHandler(ev){
        var project = this.props.targetobj.project;
        if(project == null){
            return;
        }
        var theAttr = this.props.targetattr;
        var funName = this.props.targetobj.id + '_' + theAttr.name;
        var targetBP = project.scriptMaster.getBPByName(funName);
        if(targetBP == null){
            var jsGroup = null;
            if(theAttr.scriptSetting != null){
                jsGroup = theAttr.scriptSetting.group;
            }
            else if(theAttr.valueType == ValueType.Event){
                jsGroup = EJsBluePrintFunGroup.CtlEvent;
            }
            
            if(jsGroup == null){
                console.error("bad jsgroup!");
            }
            targetBP = project.scriptMaster.createBP(funName, FunType_Client, jsGroup);
            targetBP.ctlID = this.props.targetobj.id;
            targetBP.eventName = theAttr.name;
            this.setState({
                magicObj:{}
            });
        }
        project.designer.editScriptBlueprint(targetBP);
    }

    clickTrshScriptBtnHandler(ev){
        var theAttr = this.props.targetattr;
        var funName = this.props.targetobj.id + '_' + theAttr.name;
        var project = this.props.targetobj.project;
        var jsBP = project.scriptMaster.getBPByName(funName);
        if(jsBP != null){
            gTipWindow.popAlert(makeAlertData('警告', '确定要删除这个脚本:' + jsBP.name,this.clickDeleteJSTipCallback,[makeAlertBtnData('确定', 'ok'),makeAlertBtnData('取消', 'cancel')], jsBP));
        }
    }

    clickDeleteJSTipCallback(key, jsBP){
        if(key == 'ok'){
            jsBP.master.deleteBP(jsBP);
            this.setState({
                magicObj:{}
            });
        }
    }

    renderPureScriptAttrEditor(nowVal,theAttr,attrName,inputID){
        var project = this.props.targetobj.project;
        var funName = this.props.targetobj.id + '_' + attrName;
        var jsBP = project.scriptMaster.getBPByName(funName);
        var trushIconElem = jsBP == null ? null : (
            <span onClick={this.clickTrshScriptBtnHandler} className={'fa-stack cursor-pointer text-danger'}>
                <i className='fa fa-trash fa-stack-1x' />
                <i className='fa fa-square-o fa-stack-2x' />
            </span>
        );
        return (<div className='d-flex w-100 h-100 align-items-center'>
                    <span onClick={this.clickModifyScriptBtnHandler} className='btn btn-dark flex-grow-1'>{jsBP ? '编辑' : '创建'}</span>
                    {trushIconElem}
                </div>);
    }

    clickCusdatasourcebtn(){
        var theBP = this.getAttrNowValue(true);
        if(theBP){
            var project = this.props.targetobj.project;
            project.designer.editSqlBlueprint(theBP);
        }
    }

    renderCustomDataSource(nowVal,theAttr,attrName,inputID){
        return (<button type='button' className='btn btn-dark w-100' onClick={this.clickCusdatasourcebtn}>定制数据源</button>);
    }

    clickListFormContent(){
        var project = this.props.targetobj.project;
        project.designer.editListFormContent(this.props.targetobj);
    }

    renderListFormContent(nowVal,theAttr,attrName,inputID){
        return (<button type='button' className='btn btn-dark w-100' onClick={this.clickListFormContent}>定制列表数据</button>);
    }

    rednerEditor(theAttr,attrName,inputID) {
        var nowVal = this.state.value;
        if(theAttr.valueType == ValueType.Event || theAttr.valueType == ValueType.Script){
            return this.renderPureScriptAttrEditor(nowVal,theAttr,attrName,inputID);
        }
        if(theAttr.valueType == ValueType.StyleValues){
            return this.renderStyleAttrEditor(nowVal,theAttr,attrName,inputID);
        }
        if(theAttr.valueType == ValueType.CustomDataSource){
            return this.renderCustomDataSource(nowVal,theAttr,attrName,inputID);
        }
        if(theAttr.valueType == ValueType.ListFormContent){
            return this.renderListFormContent(nowVal,theAttr,attrName,inputID);
        }
        var attrEditable = ReplaceIfNull(this.props.targetobj[attrName + '_editable'], theAttr.editable);
        if (!attrEditable) {
            switch(theAttr.valueType){
                case ValueType.Boolean:
                return <input autoComplete='off' type='checkbox' readOnly='readonly' className="form-control" id={inputID} checked={nowVal} value={nowVal} />
                default:
                return (<div className="form-control-plaintext text-light" id={inputID}>{nowVal.toString()}</div>);
            }
        }
        var jsIconElem = null;
        var project = this.props.targetobj.project;
        var scriptable = theAttr.scriptSetting && theAttr.scriptSetting.scriptable;
        if(scriptable && project){
            // 可脚本化
            var parseRet = parseObj_CtlPropJsBind(nowVal, project.scriptMaster);
            jsIconElem = (
                <span onClick={this.clickjsIconHandler} className={'fa-stack cursor-pointer text-' + (parseRet.isScript ? 'info' : 'light')}>
                    <i className='fa fa-plug fa-stack-1x' />
                    <i className='fa fa-square-o fa-stack-2x' />
                </span>
            );
            if(parseRet.isScript){
                return (<div className='d-flex w-100 h-100 align-items-center'>
                            <span onClick={this.clickModifyJSBtnHandler} className='btn btn-dark flex-grow-1'>{parseRet.jsBp ? '编辑' : '创建'}</span>
                            {jsIconElem}
                        </div>);
            }
        }
        if(theAttr.options_arr != null){
            var dropdownSetting = theAttr.dropdownSetting == null ? {} : theAttr.dropdownSetting;
            var useOptioins_arr = theAttr.options_arr;
            if(dropdownSetting.pullDataFun != null){
                var pullDataFun = dropdownSetting.pullDataFun;
                var nowTarget = this.props.targetobj;
                useOptioins_arr = ()=>{
                    return pullDataFun(nowTarget);
                }
            }
            if(typeof(theAttr.options_arr) === 'string'){
                useOptioins_arr = this.props.targetobj[theAttr.options_arr];
                if(useOptioins_arr == null){
                    console.error('没有找到:' + theAttr.options_arr);
                }
            }
            
            if(theAttr.valueType == ValueType.DataSource){
                if(nowVal && nowVal.loaded == false){
                    return (<div className='text-light'>加载中</div>);
                }
            }
            var ddc = (<DropDownControl options_arr={useOptioins_arr} value={nowVal} itemChanged={this.itemChangedHandler} textAttrName={dropdownSetting.text} valueAttrName={dropdownSetting.value} editable={dropdownSetting.editable}/>);
            if(jsIconElem == null){
                return ddc;
            }
            return (<div className='d-flex flex-grow-1 flex-shrink-1'>
                <div className='d-flex flex-column flex-grow-1 flex-shrink-1'>
                    <DropDownControl options_arr={useOptioins_arr} value={nowVal} itemChanged={this.itemChangedHandler} textAttrName={dropdownSetting.text} valueAttrName={dropdownSetting.value} editable={dropdownSetting.editable} />
                </div>
                {jsIconElem}
            </div>)
        }
        
        var inputType = 'text';
        switch(theAttr.valueType){
            case ValueType.Boolean:
            inputType = 'checkbox';
            break;
        }
        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 align-items-center'>
            <input autoComplete='off' type={inputType} className="form-control" id={inputID} checked={this.state.value} value={this.state.value} onChange={this.editorChanged} attrname={attrName} />
            {jsIconElem}
            </div>
        );
    }

    clickTrashHandler(ev){
        var newCount = this.props.targetobj.deleteAttrArrayItem(this.props.targetattr.name, this.getRealAttrName());
        if(this.props.onAttrArrayChanged){
            this.props.onAttrArrayChanged(this.props.targetattr.name, newCount);
        }
    }

    render() {
        if (this.state.targetobj != this.props.targetobj) {
            var self = this;
            self.unlistenTarget(this.state.targetobj);
            setTimeout(() => {
                self.setState({
                    targetobj: self.props.targetobj,
                    value: self.getAttrNowValue(),
                });
                self.listenTarget(this.props.targetobj);
            }, 1);
            return null;
        }
        var theAttr = this.props.targetattr;
        var attrName = this.getRealAttrName();
        var label = this.getRealAttrLabel();
        var inputID = this.getRealAttrInputID();
        var deleteElem = this.props.index >= 0 ? <div onClick={this.clickTrashHandler} className='btn btn-dark flex-grow-0 flex-shrink-0'><i className='fa fa-trash text-danger' /></div> : null;
        return (
            <div key={attrName} className="bg-dark d-flex align-items-center flex-grow-0 flex-shrink-0">
                <label htmlFor={inputID} className="col-form-label text-light flex-grow-0 flex-shrink-0 attrEditorLabel">
                    {label}
                </label>
                <div className="p-1 border-left border-secondary attrEditorContent flex-grow-1 flex-shrink-1" hadtrash={deleteElem ? 1 : null}>
                    {
                        this.rednerEditor(theAttr,attrName,inputID)
                    }
                </div>
                {deleteElem}
            </div>
        )
    }

    editorChanged(ev) {
        var editorElem = ev.target;
        var newVal = null;
        var theAttr = this.props.targetattr;
        if (editorElem.tagName.toUpperCase() === 'INPUT') {
            newVal = editorElem.value;
            switch(theAttr.valueType){
                case ValueType.Boolean:
                newVal = editorElem.checked;
                break;
                default:
                newVal = editorElem.value;
            }
        }
        this.doSetAttribute(newVal);
    }
}

class AttributeGroup extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var initState = {
            target:this.props.target,
        };
        this.state = initState;
    }

    clickAddBtnHandler(ev){
        var attrName = ev.target.getAttribute('attrname');
        if(attrName == null){
            attrName = ev.target.parentNode.getAttribute('attrname');
            if(attrName == null)
                return;
        }
        
        var newCount = this.state.target.growAttrArray(attrName);
        this.attrArrayChanged(attrName,newCount);
    }

    groupChangedhandler(ev){
        this.setState({
            magicObj:{}
        });
    }

    componentWillUnmount(){
        this.listenGroup(this.props.attrGroup);
    }

    listenGroup(group){
        this.listeningGroup = group;
        if(group == null){
            return;
        }
        group.on('changed', this.groupChangedhandler);
    }

    unlistenGroup(group){
        this.listeningGroup = null;
        if(targroupget == null){
            return;
        }
        group.off('changed', this.groupChangedhandler);
    }

    attrArrayChanged(attrName, newCount){
        var newState = {};
        newState[attrName + 'count'] = newCount;
        this.setState(newState);
    }

    renderAttribute(attr){
        var target = this.state.target;
        if(attr.visible){
            if(target[attr.name + '_visible'] == false){
                return null;
            }
        }
        else if(target[attr.name + '_visible'] != true){
            return null;
        }
        if(attr.isArray){
            var rlt_arr = [];
            var attrArrayItem_arr = target.getAttrArrayList(attr.name);
            for(var i = 0; i < attrArrayItem_arr.length; ++i){
                var attrArrayItem = attrArrayItem_arr[i];
                rlt_arr.push(<AttributeEditor key={attrArrayItem.name} targetattr={attr} targetobj={target} index={attrArrayItem.index} onAttrArrayChanged={this.attrArrayChanged} />);
            }
            rlt_arr.push(<button key='addBtn' attrname={attr.name} onClick={this.clickAddBtnHandler} type='button' className='btn btn-dark' ><span className='icon icon-plus' />{attr.label}</button>);
            return rlt_arr;
        }
        return (<AttributeEditor key={attr.name} targetattr={attr} targetobj={target} />);
    }

    render() {
        var self = this;
        if(this.state.target != this.props.target){
            setTimeout(() => {
                self.setState({
                    target:this.props.target,
                });
            }, 1);
            return null;
        }
        var projectName = this.props.projectName;
        var attrGroup = this.props.attrGroup;
        var attrGroupIndex = this.props.attrGroupIndex;
        if(this.listeningGroup != attrGroup){
            this.listenGroup(attrGroup);
        }
        return(
            <React.Fragment>
                <button type="button" data-toggle="collapse" data-target={"#attrGroup" + projectName + attrGroup.label} className={'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' + (attrGroupIndex >= 0 ? '' : ' collapsed')} style={{ borderRadius: '0em', height: '2.5em' }}>{attrGroup.label}</button>
                <div id={"attrGroup" + projectName + attrGroup.label} className={"list-group flex-grow-0 flex-shrink-0 collapse" + (attrGroupIndex >= 0 ? ' show' : '')} >
                    {
                        attrGroup.attrs_arr.map(attr => {
                            return this.renderAttribute(attr)
                        })
                    }
                </div>
            </React.Fragment>
        )
    }
}