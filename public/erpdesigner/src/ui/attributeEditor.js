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

    getAttrNowValue() {
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
                rlt = Object.assign({},rlt);
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

    rednerEditor(theAttr,attrName,inputID) {
        var nowVal = this.state.value;
        if(theAttr.valueType == ValueType.StyleValues){
            return this.renderStyleAttrEditor(nowVal,theAttr,attrName,inputID);
        }
        if (!theAttr.editable) {
            return (<div className="form-control-plaintext text-light" id={inputID}>{nowVal}</div>);
        }
        if(theAttr.options_arr != null){
            var dropdownSetting = theAttr.dropdownSetting == null ? {} : theAttr.dropdownSetting;
            if(dropdownSetting.text == null){
                dropdownSetting.text = 'text';
            }
            if(theAttr.valueType == ValueType.DataSource){
                if(nowVal && nowVal.loaded == false){
                    return (<div className='text-light'>加载中</div>);
                }
            }
            return (<DropDownControl options_arr={theAttr.options_arr} value={nowVal} itemChanged={this.itemChangedHandler} textAttrName={dropdownSetting.text} valueAttrName={dropdownSetting.value}/>);
        }
        
        var inputType = 'text';
        switch(theAttr.valueType){
            case ValueType.Boolean:
            inputType = 'checkbox';
            break;
        }
        return (<input type={inputType} className="form-control" id={inputID} checked={this.state.value} value={this.state.value} onChange={this.editorChanged} attrname={attrName} />);
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
            <div key={attrName} className="bg-dark d-flex align-items-center">
                <label htmlFor={inputID} className="col-sm-4 col-form-label text-light">
                    {label}
                </label>
                <div className="flex-grow-1 flex-shrink-1 p-1 border-left border-secondary">
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
        if(!attr.visible && !target[attr.name + '_visible']){
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