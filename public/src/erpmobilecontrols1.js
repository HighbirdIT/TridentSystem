var ctrlCurrentComponent_map = {};
var gFixedContainerRef = React.createRef();
var gFixedItemCounter = 0;

const HashKey_FixItem = 'fixitem';

window.onhashchange = function() {
    var fixedItemNum = 0;    
    if (location.hash.length > 0) {
        var nowHash = location.hash.replace('#', '');
        var hash_arr = nowHash.split(',');
        for(var si in hash_arr){
            var tem_arr = hash_arr[si].split('=');
            if(tem_arr.length == 2){
                switch(tem_arr[0]){
                    case HashKey_FixItem:
                    fixedItemNum = parseInt(tem_arr[1]);
                    break;
                }
            }
        }
    } 
    if(gFixedContainerRef.current){
        gFixedContainerRef.current.setItemCount(fixedItemNum);
    }
};

function setLocHash(hashName,hashVal){
    var nowHash = location.hash;
    var newHash;
    if(nowHash.length >= 0){
        nowHash = nowHash.replace('#', '');
        var hash_arr = nowHash.length == 0 ? [] : nowHash.split(',');
        var found = false;
        for(var si in hash_arr){
            var tem_arr = hash_arr[si].split('=');
            if(tem_arr.length == 2){
                if(tem_arr[0] == hashName){
                    if(hashVal == null){
                        hash_arr.splice(si,1);
                    }
                    else{
                        hash_arr[si] = hashName + '=' + hashVal;
                    }
                    found = true;
                    break;
                }
            }
        }
        if(!found){
            if(hashVal != null)
            {
                hash_arr.push(hashName + '=' + hashVal);
            }
        }
        newHash = hash_arr.join(',');
    }
    else{
        newHash = hashName + '=' + hashVal;
    }
    location.hash = newHash;
}

class FixedContainer extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            items_arr:[]
        };
        this.item_map = {};
        this.banItemChange = false;
    }

    componentWillMount(){
    }

    setItemCount(val){
        var items_arr = this.state.items_arr;
        if(items_arr.length > 0){
            items_arr = items_arr.concat();
            this.banItemChange = true;
            while(items_arr.length > val){
                var topItem = items_arr.pop();
                if(topItem.ref.current){
                    topItem.ref.current.foceClose();
                }
            }
            this.banItemChange = false;
            this.setState({
                items_arr:items_arr
            });
        }
    }

    addItem(target){
        if(this.banItemChange){
            return;
        }
        this.setState(state=>{
            var index = state.items_arr.indexOf(target);
            if(index != -1)
                return state;
            setLocHash(HashKey_FixItem, state.items_arr.length + 1);
            return {
                items_arr:state.items_arr.concat(target),
            };
        });
    }

    removeItem(target){
        if(this.banItemChange){
            return;
        }
        this.setState(state=>{
            var index = state.items_arr.indexOf(target);
            if(index == -1)
                return state;
            var newArr = state.items_arr.concat();
            newArr.splice(index, 1);
            setLocHash(HashKey_FixItem, newArr.length == 0 ? null : newArr.length);
            return {
                items_arr:newArr,
            };
        });
    }

    render(){
        var items_arr = this.state.items_arr;
        if(items_arr.length == 0){
            return null;
        }
        return (<div className='d-fixed w-100 h-100 fixedBackGround'>
                {items_arr.map(
                    item=>{
                        return item;
                    }
                )}
            </div>);
    }
}

function addFixedItem(target){
    if(gFixedContainerRef.current){
        gFixedContainerRef.current.addItem(target);
    }
}

function removeFixedItem(target){
    if(gFixedContainerRef.current){
        gFixedContainerRef.current.removeItem(target);
    }
}

function SetCurrentComponent(ctrlProps, component) {
    ctrlCurrentComponent_map[MakePath(ctrlProps.parentPath, ctrlProps.id)] = component;
}

function ERPC_Fun_ComponentWillUnmount() {
    SetCurrentComponent(this.props, null);
    if (this.cusComponentWillMount) {
        this.cusComponentWillMount();
    }
}

function ERPC_Fun_ComponentWillMount() {
    SetCurrentComponent(this.props, this);
    if (this.cusComponentWillUnmount) {
        this.cusComponentWillUnmount();
    }
}

function ERPControlBase(target) {
    target.rootDivRef = React.createRef();
    target.initState = {
        keyword: '',
    };
    target.componentWillUnmount = ERPC_Fun_ComponentWillUnmount.bind(target);
    target.componentWillMount = ERPC_Fun_ComponentWillMount.bind(target);
}

class ERPC_DropDown_PopPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.contentDivRef = React.createRef();
        this.state={
            maxCount:50,
        };
        this.inited = false;
    }

    componentWillMount(){
        var self = this;
        setTimeout(() => {
            self.inited = true;
            self.setState(this.props.dropdownctl.getPopPanelInitState());
        }, 50);
    }

    componentWillUnmount(){
        this.inited = false;
    }

    foceClose(){
        this.props.dropdownctl.dropDownClosed();
    }

    clickCloseHandler() {
        this.props.dropdownctl.dropDownClosed();
    }

    contentDivScrollHandler(ev) {
        if (this.contentDivRef.current) {
            var contentDiv = this.contentDivRef.current;
            var height = $(contentDiv).height();
            if ((contentDiv.scrollTop + height) / contentDiv.scrollHeight > 0.95) {
                if (this.needListedCount > this.state.maxCount) {
                    this.setState({
                        maxCount: this.state.maxCount + 50,
                    });
                }
                console.log('增加');
            }
        }
    }

    groupListItemClick(ev) {
        var target = ev.target;
        var value = getAttributeByNode(target, 'value', true, 3);
        if (value == null) {
            console.error('can not find value attr');
        }
        var index = getAttributeByNode(target, 'index', true, 3);
        if (value == null) {
            console.error('can not find index attr');
        }
        var gvname = 'gv' + index;
        var nowgv = this.state[gvname];
        var newState = {};
        newState[gvname] = nowgv == value ? null : value;
        this.setState(newState);
    }

    listItemClick(ev) {
        var target = ev.target;
        var value = getAttributeByNode(target, 'value', true, 3);
        if (value == null) {
            console.error('can not find value attr');
        }
        var options_arr = this.state.optionsData.options_arr;
        var theOptionItem = options_arr.find(item => {
            return item.value == value;
        });
        if (theOptionItem == null) {
            console.error('没有找到对应的item' + value);
        }
        this.props.dropdownctl.selectItem(theOptionItem);
    }

    keyInputChanged(ev) {
        var target = ev.target;
        var keyword = target.value;
        this.setState({ keyword: keyword });
    }

    render() {
        var selectedVal = this.state.selectedVal;
        if(!this.inited){
            return (<div className='fixedBackGround'>
                <div className='dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded'>
                    .
                </div>
            </div>);
        }
        var keyword = this.state.keyword.trim();
        var options_arr = this.state.optionsData.options_arr;
        var groupData_arr = this.state.optionsData.groupData_arr;
        var groupCount = groupData_arr == null ? 0 : groupData_arr.length;
        var groupPanels_arr = [];
        var gi = 0;
        var temName = null;
        var maxRowCount = this.state.maxCount;

        var searchItem = null;
        var contentElem = null;
        var recentElem = null;
        var recentItems_arr = [];
        if (this.state.fetching) {
            contentElem = (<div className='d-flex align-items-center m-auto'>正在获取数据<i className='fa fa-spinner fa-pulse fa-fw fa-2x' /></div>);
        }
        else {
            if (options_arr == null) {
                options_arr = [];
            }
            var groupValues_arr = [];
            var groupItemCounter = {};
            for (gi = 0; gi < groupCount; ++gi) {
                groupValues_arr.push(this.state['gv' + gi]);
            }
            var recentUsed = this.state.recentUsed;
            var recentValues_arr = this.state.recentValues_arr;

            if (recentValues_arr.length > 0) {
                if (groupCount > 0) {
                    // 把最近使用放置在第一分组中
                    var firstGroup = groupData_arr[0];
                    if (firstGroup.options_map['_recent'] == null) {
                        firstGroup.options_arr.unshift({ text: '最近使用', value: '_recent' });
                        firstGroup.options_map['_recent'] = 1;
                    }
                    if (groupValues_arr[0] == null) {
                        groupValues_arr[0] = '_recent';
                    }
                }
            }

            var filted_arr = options_arr;
            if (keyword.length > 0) {
                maxRowCount = 100;
                filted_arr = options_arr.filter(item => {
                    if (recentUsed.hasOwnProperty(item.value)) {
                        recentUsed[item.value] = item;
                    }
                    return item.text.indexOf(this.state.keyword) >= 0;
                });
            }
            else {
                if (groupCount > 0) {
                    filted_arr = filted_arr.filter(item => {
                        var isRecentUsed = recentUsed.hasOwnProperty(item.value);
                        if (isRecentUsed) {
                            recentUsed[item.value] = item;
                        }
                        for (gi = 0; gi < groupCount; ++gi) {
                            temName = 'g' + gi + item['g' + gi];
                            groupItemCounter[temName] = groupItemCounter[temName] == null ? 1 : groupItemCounter[temName] + 1;
                            var gSelectedVal = groupValues_arr[gi];
                            if(gi == 0 && gSelectedVal == '_recent'){
                                return isRecentUsed;
                            }
                            if (groupValues_arr[gi] != null && groupValues_arr[gi] != item['g' + gi]) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                else if (recentValues_arr.length > 0) {
                    filted_arr.forEach(item => {
                        if (recentUsed.hasOwnProperty(item.value)) {
                            recentUsed[item.value] = item;
                        }
                    });
                }
            }

            for (gi in recentValues_arr) {
                var value = recentValues_arr[gi];
                if (recentUsed[value]) {
                    recentItems_arr.push(recentUsed[value]);
                }
            }
            if (recentItems_arr.length > 0) {
                if(groupCount > 0){
                    groupItemCounter['g0_recent'] = recentItems_arr.length;
                }
                else if (keyword.length == 0) {
                    recentElem = [];
                    recentElem.push(<div className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 text-secondary'} key='_recentTip' >
                        <div>最近使用</div>
                    </div>);
                    recentItems_arr.forEach(item => {
                        recentElem.push(
                            <div onClick={this.listItemClick} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : '')} key={'_ck' + item.value} value={item.value}>
                                <div>{item.text}</div>
                            </div>
                        );
                    });
                    recentElem.push(<div className='dropdown-divider' key='divider' />);
                }
            }

            if (groupCount > 0) {
                groupData_arr.forEach((groupData, index) => {
                    var theOptions_arr = groupData.options_arr;
                    var gvSelectedVal = groupValues_arr[index];
                    var selectedActived = false;
                    var groupElem = (
                        <div className='list-group flex-grow-1 flex-shrink-0 autoScroll_Touch' key={groupData.name}>
                            {
                                theOptions_arr.map((item, i) => {
                                    var count = groupItemCounter['g' + index + item.value];
                                    if (count == null) {
                                        count = 0;
                                    }
                                    if (item.value != gvSelectedVal) {
                                        if (count == 0 && index > 0) {
                                            return null;
                                        }
                                    }
                                    var isSelected = item.value == gvSelectedVal;
                                    return (<div onClick={this.groupListItemClick} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (isSelected ? ' active' : '')} key={item.value} value={item.value} index={index}>
                                        <div>{item.text == null ? item.value : item.text}({count})</div>
                                    </div>)
                                })
                            }
                        </div>
                    );
                    groupValues_arr.push(selectedActived ? gvSelectedVal : null);
                    groupPanels_arr.push(groupElem);
                });
            }


            if (filted_arr.length == 0) {
                contentElem = (<span className='text-nowrap'>没有找到</span>);
            }
            if (options_arr.length > 20) {
                searchItem = (<div className='d-flex flex-shrink-0 align-items-center'>
                    <span className='fa fa-search fa-2x text-primary' />
                    <input className='flex-grow-1 flex-shrink-1 flexinput' type='text' value={keyword} onChange={this.keyInputChanged} />
                </div>);
            }

            this.needListedCount = filted_arr.length;


            if (filted_arr.length > 0) {
                contentElem = (<div ref={this.contentDivRef} className='list-group flex-grow-1 flex-shrink-0 autoScroll_Touch' onScroll={filted_arr.length > maxRowCount ? this.contentDivScrollHandler : null}>
                    {recentElem}
                    {
                        filted_arr.map((item, i) => {
                            if (i >= maxRowCount) {
                                return null;
                            }
                            return (<div onClick={this.listItemClick} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item.value == selectedVal ? ' active' : '')} key={item.value} value={item.value}>
                                <div>{item.text}</div>
                            </div>)
                        })
                    }
                    {
                        filted_arr.length > maxRowCount ? <div className='text-nowrap'>加载中...</div>
                            :
                            filted_arr.length < 5 ? null : <div className='text-nowrap'>以上共{filted_arr.length}条</div>
                    }
                </div>);
            }
        }

        var finalContentElem = contentElem;
        if (groupPanels_arr.length > 0) {
            finalContentElem = (<div className='d-flex flex-grow-1 flex-shrink-1 autoScroll_Touch'>
                {groupPanels_arr}
                {contentElem}
                <div className='w-20p flex-grow-0 flex-shrink-0' />
            </div>);
        }
        else {
            finalContentElem = (<div className='d-flex flex-grow-1 flex-shrink-1 autoScroll_Touch'>
                {contentElem}
            </div>);
        }

        return (
            <div className='fixedBackGround'>
                <div className='dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded'>
                    <div className='d-flex flex-shrink-0'>
                        <h3><span onClick={this.clickCloseHandler}><i className='fa fa-arrow-left text-primary' /></span><span className='text-primary'>{this.state.label}</span></h3>
                    </div>
                    {searchItem}
                    {finalContentElem}
                </div>
            </div>
        );
    }
}

class ERPC_DropDown extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        ERPControlBase(this);
        this.state = Object.assign(this.initState, {
            keyword: '',
            opened: false,
        });

        this.editableInputRef = React.createRef();
        this.initState = null;
        this.contentDivRef = React.createRef();

        this.popPanelRef = React.createRef();
        this.popPanelItem = (<ERPC_DropDown_PopPanel ref={this.popPanelRef} dropdownctl={this} key={gFixedItemCounter++} />)
    }

    dropDownOpened() {
        var recentUsed = {};
        var recentValues_arr = [];
        if (this.props.recentCookieKey != null) {
            var cookieValue = Cookies.get(this.props.recentCookieKey);
            if (cookieValue != null && cookieValue.split != null) {
                recentValues_arr = cookieValue.split(',').filter(e => { return e != null && e.length > 0; }).filter(e => {
                    if(e.length == 0){
                        return false;
                    }
                    if(recentUsed.hasOwnProperty(e)){
                        return false;
                    }
                    recentUsed[e] = null;
                    return true;
                });
            }
        }
        this.recentValues_arr = recentValues_arr;
        this.recentUsed = recentUsed;
        addFixedItem(this.popPanelItem);

        this.setState({
            keyword: '',
            opened: true,
        });
        var needFetch = false;
        if (this.props.pullDataSource) {
            this.props.pullDataSource();
            needFetch = true;
        }
    }

    dropDownClosed() {
        this.setState({ opened: false });
        removeFixedItem(this.popPanelItem);
    }

    clickOpenHandler() {
        if (!this.state.opened) {
            this.dropDownOpened();
        } else {
            this.dropDownClosed();
        }
    }

    selectItem(theOptionItem) {
        var value = '';
        var text = '';
        if(theOptionItem){
            value = theOptionItem.value.toString();
            text = theOptionItem.text;
        }
        if (this.props.recentCookieKey) {
            var index = this.recentValues_arr.indexOf(value);
            if (index != 0) {
                if (index != -1) {
                    this.recentValues_arr.splice(index, 1);
                }
                this.recentValues_arr.unshift(value);
                if (this.recentValues_arr.length >= 6) {
                    this.recentValues_arr.pop();
                }
                Cookies.set(this.props.recentCookieKey, this.recentValues_arr.join(','), { expires: 7 });
            }
        }
        this.dropDownClosed();
        store.dispatch(makeAction_setManyStateByPath({
            value: value,
            text: text,
        }, MakePath(this.props.parentPath, this.props.id)));
    }

    getPopPanelInitState(){
        return {
            selectedVal:this.props.value,
            fetching:this.props.fetching,
            optionsData:this.props.optionsData,
            maxCount:50,
            keyword: '',
            recentValues_arr:this.recentValues_arr,
            recentUsed:this.recentUsed,
            label:this.props.label,
        }
    }

    render() {
        var hadMini = this.props.miniBtn != false;
        var selectedVal = this.props.value;
        var selectedText = this.props.text;
        if (selectedText == null) {
            selectedText = '请选择';
        }

        if(this.state.opened){
            var popPanelRefCurrent = this.popPanelRef.current;
            if(popPanelRefCurrent)
            {
                var newState = {
                    selectedVal:selectedVal,
                    fetching:this.props.fetching,
                    optionsData:this.props.optionsData,
                };
                setTimeout(() => {
                    popPanelRefCurrent.setState(newState);
                }, 50);
            }
        }
        //{this.renderPopPanel(selectedVal)}
        return (
            <div className={"d-flex btn-group flex-grow-1 flex-shrink-0 erpc_dropdown"} style={this.props.style} ref={this.rootDivRef}>
                {
                    this.props.editable ?
                        <input onFocus={this.editableInputFocushandler} ref={this.editableInputRef} type='text' className='flex-grow-1 flex-shrink-1 flexinput' onChange={this.keyChanged} value={selectedOption ? selectedOption.text : this.state.keyword} />
                        :
                        <button onClick={this.clickOpenHandler} type='button' className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1 erpc_dropdownMainBtn' + (selectedVal == null ? ' text-danger' : '')} hadmini={hadMini ? 1 : null} >
                            <div style={{ overflow: 'hidden' }} className='flex-grow-1 flex-shrink-1'>
                                <div>
                                    {selectedText}
                                </div>
                            </div>
                        </button>
                }
                {
                    hadMini && <button type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split'} ></button>
                }
            </div>
        );
    }
}

const selectERPC_DropDown_options = (state, ownprops) => {
    if (ownprops.options_arr != null) {
        return ownprops.options_arr;
    }
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    return ctlState.options_arr;
};

const selectERPC_DropDown_textName = (state, ownprops) => {
    return ownprops.textAttrName;
};

const selectERPC_DropDown_valueName = (state, ownprops) => {
    return ownprops.valueAttrName;
};

const selectERPC_DropDown_groupAttrName = (state, ownprops) => {
    return ownprops.groupAttr;
};

const formatERPC_DropDown_options = (orginData_arr, textAttrName, valueAttrName, groupAttr) => {
    if (orginData_arr == null) {
        return [];
    }
    if (valueAttrName == null || valueAttrName.length == 0) {
        valueAttrName = textAttrName;
    }
    var groupName_arr = groupAttr == null ? [] : groupAttr.split(',');
    var groupData_arr = [];
    groupName_arr.forEach(n => {
        groupData_arr.push({
            name: n,
            options_arr: [],
            options_map: {}
        });
    });
    var rlt = {
        groupData_arr: groupData_arr,
    };
    rlt.options_arr = orginData_arr.map(item => {
        var itemType = typeof item;
        if (itemType === 'string' || itemType === 'number') {
            return { text: item, value: item };
        }
        var newItem = { text: item[textAttrName], value: item[valueAttrName], data: item };
        groupData_arr.forEach((groupData, index) => {
            var data = item[groupData.name];
            if (groupData.options_map[data] == null) {
                var option = { value: data };
                for (var startI = 0; startI < index; ++startI) {
                    option['g' + startI] = newItem['g' + startI];
                }
                groupData.options_arr.push(option);
                groupData.options_map[data] = 1;
            }
            newItem['g' + index] = data;
        });
        return newItem;
    });

    return rlt;
}

const ERPC_DropDown_optionsSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, formatERPC_DropDown_options);

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    if(ctlState.fetching){
        console.log('ctlState.fetching');
    }
    return {
        value: ctlState.value,
        text: ctlState.text,
        fetching: ctlState.fetching,
        optionsData: ERPC_DropDown_optionsSelector(state, ownprops),
    };
}

function ERPC_DropDown_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_Text extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    inputChanged(ev) {
        var text = ev.target.value;
        store.dispatch(makeAction_setStateByPath(text, MakePath(this.props.parentPath, this.props.id, 'value')));
    }

    render() {
        var contentElem = null;
        var rootDivClassName = 'd-flex flex-grow-1 flex-shrink-1';
        if (this.props.fetching) {
            contentElem = (<i className='fa fa-spinner fa-pulse fa-fw' />);
        }
        else {
            if (this.props.readonly) {
                rootDivClassName += ' bg-secondary rounded border p-1'
                var nowValue = this.props.value;
                if (nowValue == null || nowValue.length == 0) {
                    rootDivClassName += ' text-secondary';
                    nowValue = '_';
                }
                else {
                    rootDivClassName += ' text-light';
                }
                contentElem = <div className='flex-grow-1 flex-shrink-1'>{nowValue}</div>
            }
            else if (this.props.type == 'multiline') {
                contentElem = <textarea onChange={this.inputChanged} className='flex-grow-1 flex-shrink-1 form-control textarea-2x' value={this.props.value} />
            }
            else {
                contentElem = (<input className='flex-grow-1 flex-shrink-1 form-control invalid ' type={this.props.type} value={this.props.value} onChange={this.inputChanged} />);
            }
        }
        return (<div className={rootDivClassName} ref={this.rootDivRef}>
            {contentElem}
        </div>);
    }
}

function ERPC_Text_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    return {
        value: ctlState.value == null ? '' : ctlState.value,
        fetching: ctlState.fetching
    };
}

function ERPC_Text_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_LabeledControl extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    render() {
        return (<div className='rowlFameOne'>
            <div className='rowlFameOne_Left'>
                {this.props.label}
            </div>
            <div className='rowlFameOne_right'>
                {this.props.children}
            </div>
        </div>);
    }
}

function ERPC_LabeledControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    var useLabel = ownprops.label ? ownprops.label : (ctlState.label ? ctlState.label : '未知名称');
    return {
        label: useLabel,
        fetching: ctlState.fetching
    };
}

function ERPC_LabeledControl_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_Form extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    render() {
        return (
        <div className={this.props.className} style={this.props.style}>\
            {this.props.children}
        </div>);
    }
}

function ERPC_Form_mapstatetoprops(state, ownprops) {
    return {};
}

function ERPC_Form_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}


var VisibleERPC_DropDown = null;
var VisibleERPC_Text = null;
var VisibleERPC_LabeledControl = null;

function ErpControlInit() {
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
    VisibleERPC_LabeledControl = ReactRedux.connect(ERPC_LabeledControl_mapstatetoprops, ERPC_LabeledControl_dispatchtorprops)(ERPC_LabeledControl);
}