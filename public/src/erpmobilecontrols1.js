class ERPC_DropDownControl extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            keyword:'',
            opened:false,
        };

        this.dropdownbtnRef = React.createRef();
        this.editableInputRef = React.createRef();
        this.dropmenudivRef = React.createRef();
        this.rootDivRef = React.createRef();
    }

    componentWillUnmount(){
    }

    dropDownOpened() {
        this.setState({
            keyword:'',
            opened:true,
        });
        if(this.props.pullDataSource){
            this.props.pullDataSource();
        }
    }

    dropDownClosed() {
        this.setState({opened:false});
    }

    keyInputChanged(ev) {
        var target = ev.target;
        var keyword = target.value;
        //var selectedOpt = this.state.options_arr.find(item=>{return item.text == keyword});
        this.setState({ keyword: keyword});
        /*
        if(this.props.editable){
            this.setState({ keyword: keyword,
                selectedOption:selectedOpt,});
        }
        else{
            if(selectedOpt){
                this.setState({ keyword: keyword,
                    selectedOption:selectedOpt, });
            }
            else{
                this.setState({ keyword: keyword });
            }
        }
        */
    }

    listItemClick(ev) {
        var target = ev.target;
        var value = getAttributeByNode(target, 'value', true, 3);
        if(value == null){
            console.error('can not find value attr');
        }
        
        var theOptionItem = this.props.options_arr.find(item=>{
            return item.value == value;
        });
        if(theOptionItem == null){
            console.error('没有找到对应的item' + value);
        }
        this.setState({opened:false});
        store.dispatch(makeAction_setManyStateByPath({
            value:theOptionItem.value,
            text:theOptionItem.text,
        }, this.props.parentPath + '.' + this.props.ctrlID));
    }

    clickOpenHandler(){
        if(!this.state.opened){
            this.dropDownOpened();
        }else{
            this.dropDownClosed();
        }
    }

    clickCloseHandler(){
        this.dropDownClosed();
    }

    renderPopPanel(keyword, filted_arr, item_arr, selectedVal){
        if(!this.state.opened){
            return null;
        }

        var searchItem = null;
        var contentElem = null;
        if(this.props.fetching){
            contentElem = (<div className='d-flex align-items-center'>正在获取数据<i className='fa fa-spinner fa-pulse fa-fw fa-2x' /></div>);
        }
        else{
            if(item_arr.length > 20){
                searchItem=(<div className='d-flex flex-shrink-0 align-items-center'>
                                <span className='badge badge-primary'>搜索:</span>
                                <input className='flex-grow-1 flex-shrink-1 flexinput' type='text' value={keyword} onChange={this.keyInputChanged} />
                            </div>);
            }

            if(filted_arr.length > 0){
                contentElem = (<div className='list-group flex-grow-1 flex-shrink-1 autoScroll'>
                                {
                                    filted_arr.map((item, i) => {
                                        return (<div onClick={this.listItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : '')} key={item.value} value={item.value}>
                                            <div>{item.text}</div>
                                        </div>)
                                    })
                                }
                            </div>);
            }
            else{
                contentElem = (<span>没有找到符合条件的选项</span>);
            }
        }

        return (
            <div className='fixedBackGround'>
                <div className='dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded'>
                    <div className='d-flex flex-shrink-0'>
                        <h3><span className='badge badge-primary'>{this.props.label}</span></h3>
                        <h3 className='flex-grow-1 flex-shrink-1' />
                        <h3 onClick={this.clickCloseHandler}><span className='badge badge-primary'><i className='fa fa-close' /></span></h3>
                    </div>
                    {searchItem}
                    {contentElem}
                </div>
            </div>
        );
    }

    render() {
        var hadMini = this.props.miniBtn != false;
        var keyword = this.state.keyword.trim();
        var filted_arr = this.props.options_arr;
        if(keyword.length > 0)
        {
            filted_arr = this.props.options_arr.filter(item => {
                return item.text.indexOf(this.state.keyword) >= 0;
            });
        }
        var selectedVal = this.props.value;
        var selectedText = this.props.text;
        if(selectedText == null){
            selectedText = '请选择';
        }
        return (
            <div className={"d-flex btn-group flex-grow-1 flex-shrink-1 erpc_dropdown"} style={this.props.style} ref={this.rootDivRef}>
                        {
                            this.props.editable ? 
                            <input onFocus={this.editableInputFocushandler} ref={this.editableInputRef} type='text' className='flex-grow-1 flex-shrink-1 flexinput' onChange={this.keyChanged} value={selectedOption ? selectedOption.text : this.state.keyword} />
                            :
                            <button onClick={this.clickOpenHandler} type='button' className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1 erpc_dropdownMainBtn' + (selectedVal == null ? ' text-danger' : '')} hadmini={hadMini ? 1 : null} >
                                <div style={{overflow:'hidden'}} className='flex-grow-1 flex-shrink-1'>
                                    <div>
                                        {selectedText}
                                    </div>
                                </div>
                            </button>
                        }
                        {
                            hadMini && <button ref={this.dropdownbtnRef} type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split'} ></button>
                        }
                        {this.renderPopPanel(keyword, filted_arr,this.props.options_arr, selectedVal)}
            </div>
        );
    }
}

const selectERPC_DropDownControl_options = (state, ownprops)=>{
    if(ownprops.options_arr != null){
        return ownprops.options_arr;
    }
    var ctlState = getStateByPath(state, ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return ctlState.options_arr;
};

const selectERPC_DropDownControl_textName = (state, ownprops)=>{
    return ownprops.textAttrName;
};

const selectERPC_DropDownControl_valueName = (state, ownprops)=>{
    return ownprops.valueAttrName;
};

const formatERPC_DropDownControl_options = (orginData_arr, textAttrName, valueAttrName)=>{
    if(orginData_arr == null){
        return [];
    }
    if(valueAttrName == null || valueAttrName.length == 0){
        valueAttrName = textAttrName;
    }
    return orginData_arr.map(item=>{
        var itemType = typeof item;
        return itemType === 'string' || itemType === 'number' ? {text:item,value:item} : {text:item[textAttrName],value:item[valueAttrName],data:item};
    });
}

const ERPC_DropDownControl_optionsSelector = Reselect.createSelector(selectERPC_DropDownControl_options,selectERPC_DropDownControl_textName,selectERPC_DropDownControl_valueName, formatERPC_DropDownControl_options);

function ERPC_DropDownControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state.app, ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return {
        value: ctlState.value,
        text: ctlState.text,
        fetching: ctlState.fetching,
        options_arr: ERPC_DropDownControl_optionsSelector(state.app, ownprops),
    };
}

function ERPC_DropDownControl_dispatchtoprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {
    };
}

var VisibleERPC_DropDownControl = null;

function ErpControlInit(){
    VisibleERPC_DropDownControl = ReactRedux.connect(ERPC_DropDownControl_mapstatetoprops, ERPC_DropDownControl_dispatchtoprops)(ERPC_DropDownControl);
}