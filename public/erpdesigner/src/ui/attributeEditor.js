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
        var rlt = this.props.targetobj.getAttribute(this.getRealAttrName());
        return rlt == null ? '' : rlt;
    }

    getRealAttrName(){
        return this.props.targetattr.name + (this.props.index == null ? '' : this.props.index);
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
        var myAttrName = this.getRealAttrName();
        const match = pattern => typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
        var isMyAttrChaned = false;
        if (typeof ev.name === 'string') {
            isMyAttrChaned = ev.name == myAttrName;
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

    itemChangedHandler(newItem){
        this.props.targetobj.setAttribute(this.getRealAttrName(), newItem);
    }

    rednerEditor(theAttr,attrName,inputID) {
        if (!theAttr.editable) {
            return (<div className="form-control-plaintext text-light" id={inputID}>{this.state.value}</div>);
        }
        var realAttrName = this.getRealAttrName();
        if(theAttr.options_arr != null){
            return (<DropDownControl options_arr={theAttr.options_arr} value={this.state.value} itemChanged={this.itemChangedHandler}/>);
        }
        return (<input type="text" className="form-control" id={inputID} value={this.state.value} onChange={this.editorChanged} attrname={attrName} />);
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
            </div>
        )
    }

    editorChanged(ev) {
        var editorElem = ev.target;
        var newVal = null;
        if (editorElem.tagName.toUpperCase() === 'INPUT') {
            newVal = editorElem.value;
        }
        this.props.targetobj.setAttribute(this.getRealAttrName(), newVal);
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
        this.setState({
            count:newCount,
        });
    }

    renderAttribute(attr){
        var target = this.state.target;
        if(attr.isArray){
            var rlt_arr = [];
            var count = target.getAttrArrayCount(attr.name);
            for(var i = 0; i < count; ++i){
                rlt_arr.push(<AttributeEditor key={attr.name + i} targetattr={attr} targetobj={target} index={i} />);
            }
            rlt_arr.push(<button key='addBtn' attrname={attr.name} onClick={this.clickAddBtnHandler} type='button' className='btn btn-dark' ><span className='icon icon-plus' /></button>);
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