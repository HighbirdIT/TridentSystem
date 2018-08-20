

class AttributeEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            value:this.props.targetattr.nowValue(),
        };
        this.state = initState;

        autoBind(this,{exclude:['rednerEditor']});
    }

    componentWillMount(){
        this.props.targetattr.group.belongObj.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount(){
        this.props.targetattr.group.belongObj.off(EATTRCHANGED, this.attrChangedHandler);
    }

    attrChangedHandler(ev){
        var myAttrName = this.props.targetattr.name;
        const match = pattern => typeof pattern === 'string' ? myAttrName === pattern : pattern.test(key);
        var isMyAttrChaned = false;
        if(typeof ev.name === 'string'){
            isMyAttrChaned = ev.name == myAttrName;
        }
        else{
            isMyAttrChaned = ev.name.some(match);
        }
        if(isMyAttrChaned){
            this.setState(nowState=>{
                return {value:this.props.targetattr.nowValue(),};
            });
        }
    }

    rednerEditor(theAttr){
        if(theAttr.setFun == null){
            return (<div className="form-control" id={theAttr.inputID}>{this.state.value}</div>);
        }
        return (<input type="text" className="form-control" id={theAttr.inputID} value={this.state.value} onChange={this.editorChanged} attrname={theAttr.name} />);
    }

    render() {
        var theAttr = this.props.targetattr;
        return (
            <div key={theAttr.name} className="bg-dark d-flex align-items-center">
                <label htmlFor={theAttr.inputID} className="col-sm-4 col-form-label text-light">
                    {theAttr.label}
                </label>

                <div className="flex-grow-1 flex-shrink-1 p-1">
                    {
                        this.rednerEditor(theAttr)
                    }
                </div>
            </div>
        )
    }

    editorChanged(ev){
        var editorElem = ev.target;
        var newVal = null;
        if(editorElem.tagName.toUpperCase() === 'INPUT'){
            newVal = editorElem.value;
        }
        this.props.targetattr.setFun(newVal);
    }
}

