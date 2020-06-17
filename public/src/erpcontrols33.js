var ctrlCurrentComponent_map = {};
var gFixedContainerRef = React.createRef();
var gTopLevelFrameRef = React.createRef();
var gFixedItemCounter = 0;
var gCusValidChecker_map = {};
var gPageInFrame = false;
var gParentFrame = null;
var gWeakParentFrame = null;
var gParentDingKit = null;
var gParentIsInDingTalk = null;
var gPCRenderMode = false;
var gPageReceiveMsgHandlers_arr = [];
var gDebugMode = false;
var gAppMsgPipe = null;
const gPreconditionInvalidInfo = '前置条件不足';
const gCantNullInfo = '不能为空值';

const HashKey_FixItem = 'fixitem';
const gEmptyArr = [];

function AppInit(app) {
    DebugApp('app init' + (gParentFrame ? ' with parentFrame' : ''));
    if (gParentFrame) {
        console.log('gPageInFrame');
        return gParentFrame.getUseState();
    }
    return null;
}

function DebugApp(info) {
    if (gDebugMode) {
        var debugpanel = document.getElementById('_debugpanel');
        if (debugpanel) {
            var spanElem = document.createElement('span');
            spanElem.className = 'border flex-grow-0 flex-shrink-0 p-1';
            spanElem.appendChild(document.createTextNode(info));
            debugpanel.appendChild(spanElem);
        }
    }
    else {
        console.log(info);
    }
}

function DistpathMsgFromParent(msgtype, data) {
    gPageReceiveMsgHandlers_arr.forEach(handler => {
        handler(msgtype, data);
    });
}

class DataCache {
    constructor(label) {
        this.label = label;
        this.data_map = {};
    }

    set(key, value) {
        this.data_map[key] = value;
    }

    get(key) {
        return this.data_map[key];
    }
}
const gDataCache = new DataCache('global');

window.onhashchange = function () {
    var fixedItemNum = 0;
    if (location.hash.length > 0) {
        var nowHash = location.hash.replace('#', '');
        var hash_arr = nowHash.split(',');
        for (var si in hash_arr) {
            var tem_arr = hash_arr[si].split('=');
            if (tem_arr.length == 2) {
                switch (tem_arr[0]) {
                    case HashKey_FixItem:
                        fixedItemNum = parseInt(tem_arr[1]);
                        break;
                }
            }
        }
    }
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.setItemCount(fixedItemNum);
    }
};

function setLocHash(hashName, hashVal) {
    var nowHash = location.hash;
    var newHash;
    nowHash = nowHash.replace('#', '');
    if (nowHash.length >= 0) {
        var hash_arr = nowHash.length == 0 ? [] : nowHash.split(',');
        var newHash_arr = [];
        var found = false;
        for (var si in hash_arr) {
            var tem_arr = hash_arr[si].split('=');
            if (tem_arr.length == 2) {
                if (tem_arr[0] == hashName) {
                    if (hashVal != null) {
                        newHash_arr.push(hashName + '=' + hashVal);
                    }
                    found = true;
                    break;
                }
                else {
                    newHash_arr.push(hash_arr[si]);
                }
            }
            else if (hash_arr[si] != 'empty') {
                newHash_arr.push(hash_arr[si]);
            }
        }
        if (!found) {
            if (hashVal != null) {
                newHash_arr.push(hashName + '=' + hashVal);
            }
        }
        newHash = newHash_arr.length == 0 ? 'empty' : newHash_arr.join(',');
    }
    else {
        newHash = hashName + '=' + hashVal;
    }
    location.hash = newHash;
}

class FixedContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            items_arr: [],
            pages_arr: [],
        };
        this.item_map = {};
        this.banItemChange = false;
    }

    componentWillMount() {
    }

    setItemCount(val) {
        var items_arr = this.state.items_arr;
        if (items_arr.length > 0) {
            items_arr = items_arr.concat();
            this.banItemChange = true;
            while (items_arr.length > val) {
                var topItem = items_arr.pop();
                if (topItem.ref.current) {
                    topItem.ref.current.foceClose();
                }
            }
            this.banItemChange = false;
            this.setState({
                items_arr: items_arr
            });
        }
    }

    popPage(id, pageElem) {
        this.setState(state => {
            var foundElem = state.pages_arr.find(x => { return x.id == id; });
            if (foundElem != null) {
                foundElem.closed = false;
                return state;
            }
            return {
                pages_arr: state.pages_arr.concat({ id: id, elem: pageElem }),
            };
        });
    }

    closePage(id) {
        var foundElem = this.state.pages_arr.find(x => { return x.id == id; });
        if (foundElem == null)
            return false;
        foundElem.closed = true;
        var newArr = this.state.pages_arr.filter(x => { return !x.closed && x != foundElem; });
        this.setState({
            pages_arr: newArr,
        });
        return true;
    }

    addItem(target) {
        if (this.banItemChange) {
            return;
        }
        this.setState(state => {
            var index = state.items_arr.indexOf(target);
            if (index != -1)
                return state;
            setLocHash(HashKey_FixItem, state.items_arr.length + 1);
            return {
                items_arr: state.items_arr.concat(target),
            };
        });
    }

    removeItem(target) {
        if (this.banItemChange) {
            return;
        }
        this.setState(state => {
            var index = state.items_arr.indexOf(target);
            if (index == -1)
                return state;
            var newArr = state.items_arr.concat();
            newArr.splice(index, 1);
            setLocHash(HashKey_FixItem, newArr.length == 0 ? null : newArr.length);
            return {
                items_arr: newArr,
            };
        });
    }

    removeTopestItem() {
        if (this.banItemChange || this.state.items_arr.length == 0) {
            return;
        }
        this.setState(state => {
            var newArr = state.items_arr.concat();
            newArr.pop();
            setLocHash(HashKey_FixItem, newArr.length == 0 ? null : newArr.length);
            return {
                items_arr: newArr,
            };
        });
    }

    render() {
        var items_arr = this.state.items_arr;
        var pages_arr = this.state.pages_arr;
        if (items_arr.length == 0 && pages_arr.length == 0) {
            return null;
        }
        return (<div className='d-fixed w-100 h-100 fixedBackGround'>
            {pages_arr.map(item => {
                return <div key={item.id} className='d-fixed w-100 h-100 fixedBackGround'>
                    {item.elem}
                </div>;
            })}
            {items_arr}
        </div>);
    }
}

function addFixedItem(target) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.addItem(target);
    }
}

function removeFixedItem(target) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.removeItem(target);
    }
}

function removeTopestFixedItem(target) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.removeTopestItem(target);
    }
}

function popPage(pid, pelem) {
    if (gFixedContainerRef.current) {
        gFixedContainerRef.current.popPage(pid, pelem);
    }
}

function closePage(pid) {
    if (gFixedContainerRef.current) {
        if (gFixedContainerRef.current.closePage(pid)) {
            return;
        }
    }
    if (pageRouter.length > 1) {
        pageRouter[pageRouter.length - 1] == pid;
        setTimeout(() => {
            pageRoute_Back(false);
        }, 20);
        return;
    }
}

class C_ReportPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
    }

    close() {
        removeTopestFixedItem();
    }

    render() {
        return <div className='w-100 h-100 d-flex flex-column'>
            <div className='d-flex flex-grow-0 flex-shrink-0 bg-primary p-1 align-items-center'>
                <h5 className='flex-grow-1 flex-shrink-1 text-light'>{this.props.label}</h5>
                <button className='btn btn-sm btn-danger flex-grow-0 flex-shrink-0' onClick={this.close}><i className='fa fa-close' /></button>
            </div>
            <div className='flex-grow-1 flex-shrink-1 bg-light' style={{ height: 'calc(100% - 40px)' }}>
                <iframe src={this.props.src} className='w-100 h-100' frameBorder='0' ></iframe>
            </div>
        </div>;
    }
}

function OpenReport(identity, label) {
    window.open("http://erp.highbird.cn/rpt/rptEx.aspx?rptidentity=" + identity);
}

function getPagePath(name, stepcode, stepdata) {
    var targetPath = '/erppage/' + (isMobile ? 'mb' : 'pc') + '/' + name;
    if (stepcode != null && stepcode != '0') {
        targetPath += '?flowStep=' + stepcode;
        if (stepdata != null) {
            if (typeof stepdata == 'object') {
                stepdata = JSON.stringify(stepdata);
            }
            targetPath += '&stepData' + stepcode + '=' + stepdata;
        }
    }
    return targetPath;
}

function openPage(name, stepcode, stepdata, mode, onMsgFun) {
    if (name == null || name.length == 0) {
        console.error('openPage 的name参数为空');
        return;
    }
    var targetPath = getPagePath(name, stepcode, stepdata);
    if (mode == 'topframe') {
        if (gParentFrame) {
            setTimeout(() => {
                var nowPageState = store.getState();
                gParentFrame.push(window.location.origin + targetPath, nowPageState);
            }, 20);
        }
        else {
            gTopLevelFrameRef.current.push(window.location.origin + targetPath, null, onMsgFun);
        }
        return;
    }
    location.href = targetPath;
}

function wantGoHomePage() {
    var msg = PopMessageBox('', EMessageBoxType.Loading, '');
    msg.query('返回首页?', [{ label: '确定', key: '确定' }, { label: '取消', key: '取消' }], (theKey) => {
        if (theKey == '确定') {
            goHomePage();
        }
        else {
            msg.fireClose();
        }
    });
}

function wantCloseInFramePage() {
    if (gParentFrame) {
        gParentFrame.pop();
    }
}

function goHomePage() {
    openPage('HBERP');
}

function SetCurrentComponent(ctrlProps, component) {
    ctrlCurrentComponent_map[MakePath(ctrlProps.parentPath, ctrlProps.id)] = component;
}

function ERPC_Fun_ComponentWillUnmount() {
    SetCurrentComponent(this.props, null);
    if (this.cusComponentWillUnmount) {
        this.cusComponentWillUnmount();
    }
}

function ERPC_Fun_ComponentWillMount() {
    SetCurrentComponent(this.props, this);
    if (this.cusComponentWillmount) {
        this.cusComponentWillmount();
    }
}

function ERPControlBase(target, initState) {
    target.rootDivRef = React.createRef();
    target.initState = initState == null ? {} : initState;
    target.componentWillUnmount = ERPC_Fun_ComponentWillUnmount.bind(target);
    target.componentWillMount = ERPC_Fun_ComponentWillMount.bind(target);
}

class ERPC_DropDown_PopPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.contentDivRef = React.createRef();
        this.containerRef = React.createRef();
        this.state = {
            maxCount: 50,
        };
        this.inited = false;
    }

    windowMouseDownHandler(ev) {
        var target;
        if (ev) {
            target = ev.target;
        }
        else {
            target = window.event.srcElement;
        }
        var parent = target.parentElement;
        while (parent) {
            if (parent == this.containerRef.current) {
                return;
            }
            parent = parent.parentElement;
        }
        this.foceClose();
    }

    componentWillMount() {
        var self = this;
        setTimeout(() => {
            self.inited = true;
            var dropdownctl = this.props.dropdownctl;
            if (!isMobile) {
                self.rootStyle = dropdownctl.getPopItemStyle();
                window.addEventListener('mousedown', this.windowMouseDownHandler);
            }
            self.setState(dropdownctl.getPopPanelInitState());
        }, 50);
    }

    componentWillUnmount() {
        this.inited = false;
        if (!isMobile) {
            window.removeEventListener('mousedown', this.windowMouseDownHandler);
        }
    }

    foceClose() {
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
        var multiselect = this.state.multiselect;
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
        if (multiselect) {
            var needClearKeyword = false;
            if (!Array.isArray(this.state.selectOpt)) {
                this.props.dropdownctl.selectItem([theOptionItem]);
                needClearKeyword = this.unSelectedCount == 1;
            }
            else if (this.state.selectOpt.find(item => {
                return item.value == theOptionItem.value;
            }) == null) {
                this.props.dropdownctl.selectItem(this.state.selectOpt.concat(theOptionItem));
                needClearKeyword = this.unSelectedCount == 1;
            }
            if (needClearKeyword) {
                this.setState({
                    keyword: ''
                });
            }
        }
        else {
            this.props.dropdownctl.selectItem(theOptionItem);
        }
    }

    clickStarItem(ev) {
        this.props.dropdownctl.selectItem('*');
    }

    clickSelectedItemTag(ev) {
        var target = ev.target;
        var value = getAttributeByNode(target, 'value', true, 3);
        if (value == null) {
            console.error('can not find value attr');
        }
        var selectedOption = this.state.selectOpt;
        var newArr = selectedOption.filter(item => {
            return item.value != value;
        });
        this.props.dropdownctl.selectItem(newArr);
    }

    keyInputChanged(ev) {
        var target = ev.target;
        var keyword = target.value;
        this.setState({ keyword: keyword });
    }

    clickFreshHandler() {
        this.props.dropdownctl.foreFresh();
    }

    render() {
        var multiselect = this.state.multiselect;
        var selectedVal = this.state.selectedVal;
        var selectedOption = this.state.selectOpt;
        if (multiselect) {
            if (selectedVal == null) {
                selectedVal = [];
            }
            if (selectedOption == null) {
                selectedOption = [];
            }
        }
        //console.log(selectedElem);
        if (!this.inited) {
            if (!isMobile) {
                return null;
            }
            return (<div className='fixedBackGround'>
                <div className='dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded'>
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
        var freshIconElem = null;
        var recentItems_arr = [];
        if (this.state.fetchingErr) {
            contentElem = renderFetcingErrDiv(this.state.fetchingErr.info);
        }
        else if (this.state.fetching) {
            contentElem = (<div className='d-flex align-items-center m-auto'>正在获取数据<i className='fa fa-spinner fa-pulse fa-fw fa-2x' /></div>);
        }
        else {
            if (isMobile) {
                freshIconElem = <i onClick={this.clickFreshHandler} className='fa fa-refresh text-success cursor_hand' />
            }
            else {
                freshIconElem = <button type='button' onClick={this.clickFreshHandler} className='btn fa fa-refresh btn-success btn-sm' />
            }
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
                            if (gi == 0 && gSelectedVal == '_recent') {
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
            var tItemSelected = false;
            if (recentItems_arr.length > 0) {
                if (groupCount > 0) {
                    groupItemCounter['g0_recent'] = recentItems_arr.length;
                }
                else if (keyword.length == 0) {
                    recentElem = [];
                    recentElem.push(<div className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 text-secondary'} key='_recentTip' >
                        <div>最近使用</div>
                    </div>);
                    recentItems_arr.forEach(item => {
                        if (multiselect) {
                            tItemSelected = selectedVal.indexOf(item.value + '') != -1;
                        }
                        else {
                            tItemSelected = item.value == selectedVal;
                        }
                        recentElem.push(
                            <div onClick={this.listItemClick} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (tItemSelected ? ' active' : '')} key={'_ck' + item.value} value={item.value}>
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

            var multiSelectedElem = null;
            if (multiselect && Array.isArray(selectedOption)) {
                multiSelectedElem = (<div className='d-flex flex-grow-0 flex-shrink-0 mb-1 flex-wrap'>
                    {
                        selectedOption && selectedOption.map(item => {
                            return <span key={item.value} onClick={this.clickSelectedItemTag} value={item.value} className='border btn' >{item.text}<i className='fa fa-close' /></span>
                        })
                    }
                    <div className='flex-grow-1 flex-shrink-1 input-group flex-nowrap w-initial'>
                        <input type='text' className='form-control flex-grow-1 flex-shrink-1 multiddcsearchinput' placeholder='搜索' value={keyword} onChange={this.keyInputChanged} />
                        <div className='input-group-append'>
                            <span className='text-primary input-group-text p-1' >{freshIconElem}</span>
                        </div>
                    </div>
                </div>);
            }
            if (filted_arr.length == 0) {
                contentElem = <div ref={this.contentDivRef} className='list-group flex-grow-1 flex-shrink-0'>
                    {this.state.starSelectable && <div onClick={this.clickStarItem} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedVal == this.props.starval ? ' active' : '')}>*</div>}
                    <span className='text-nowrap'>没有数据</span>
                </div>
            }
            if (!multiselect && options_arr.length > 20) {
                searchItem = (<div className='flex-shrink-0 input-group flex-nowrap'>
                    <div className="input-group-prepend">
                        <span className='text-primary input-group-text p-1' ><i className='fa fa-search' /></span>
                    </div>
                    <input className='form-control' type='text' value={keyword} onChange={this.keyInputChanged} />
                    {
                        !isMobile ?
                            <div className='input-group-append'>
                                <span className='text-primary input-group-text p-1' >{freshIconElem}</span>
                            </div>
                            : null
                    }
                </div>);
            }

            this.needListedCount = filted_arr.length;
            var unSelectedCount = 0;

            if (filted_arr.length > 0) {
                contentElem = (<div ref={this.contentDivRef} className='list-group flex-grow-1 flex-shrink-0 autoScroll_Touch' onScroll={filted_arr.length > maxRowCount ? this.contentDivScrollHandler : null}>
                    {this.state.starSelectable && <div onClick={this.clickStarItem} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedVal == this.props.starval ? ' active' : '')}>*</div>}
                    {recentElem}
                    {
                        filted_arr.map((item, i) => {
                            if (i >= maxRowCount) {
                                return null;
                            }
                            if (multiselect) {
                                tItemSelected = selectedVal.indexOf(item.value + '') != -1;
                            }
                            else {
                                tItemSelected = item.value == selectedVal;
                            }
                            if (!tItemSelected) {
                                unSelectedCount++;
                            }
                            return (<div onClick={this.listItemClick} className={'d-flex text-nowrap flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (tItemSelected ? ' active' : '')} key={item.value} value={item.value}>
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
            this.unSelectedCount = unSelectedCount;
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

        var titleBarRightElem = null;
        if (this.props.dropdownctl.props.createTitleBarRightElem) {
            titleBarRightElem = this.props.dropdownctl.props.createTitleBarRightElem();
        }

        if (!isMobile) {
            if (searchItem) {
                freshIconElem = null;
            }
            var bottomElem = null;
            if (titleBarRightElem || freshIconElem) {
                bottomElem = <div className='d-flex justify-content-end p-1 btn-group'>{titleBarRightElem}{freshIconElem}</div>
            }
            return (
                <div ref={this.containerRef} style={this.rootStyle} className='dropDownItemContainer_pc d-flex flex-column bg-light flex-shrink-0 rounded border-dark p-2'>
                    {multiSelectedElem}
                    {searchItem}
                    {finalContentElem}
                    {bottomElem}
                </div>
            );
        }

        return (
            <div className='fixedBackGround'>
                <div ref={this.containerRef} className='dropDownItemContainer d-flex flex-column bg-light flex-shrink-0 rounded'>
                    <div className='d-flex flex-shrink-0'>
                        <h3><span onClick={this.clickCloseHandler}>
                            <i className='fa fa-arrow-left text-primary' /></span>
                            <span onClick={this.clickCloseHandler} className='text-primary'>{this.state.label}{multiselect ? '(可多选)' : ''}
                            </span>
                            {freshIconElem}
                            {titleBarRightElem}
                        </h3>
                    </div>
                    {multiSelectedElem}
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

        this.hadValueAttr = this.props.valueAttrName != null;
        this.editableInputRef = React.createRef();
        this.initState = null;
        this.contentDivRef = React.createRef();

        this.popPanelRef = React.createRef();
        if (isMobile) {
            this.popPanelItem = (<ERPC_DropDown_PopPanel ref={this.popPanelRef} dropdownctl={this} key={gFixedItemCounter++} />)
        }
    }

    dropDownOpened() {
        if (this.props.pullDataSource) {
            if (this.props.pullOnce != true || this.props.optionsData.options_arr == null) {
                if (this.props.pullDataSource(this.props.fullParentPath) == false) {
                    return;
                }
            }
        }
        var recentUsed = {};
        var recentValues_arr = [];
        if (this.props.recentCookieKey != null) {
            var cookieValue = Cookies.get(this.props.recentCookieKey);
            if (cookieValue != null && cookieValue.split != null) {
                recentValues_arr = cookieValue.split(',').filter(e => { return e != null && e.length > 0; }).filter(e => {
                    if (e.length == 0) {
                        return false;
                    }
                    if (recentUsed.hasOwnProperty(e)) {
                        return false;
                    }
                    recentUsed[e] = null;
                    return true;
                });
            }
        }
        this.recentValues_arr = recentValues_arr;
        this.recentUsed = recentUsed;
        if (isMobile) {
            addFixedItem(this.popPanelItem);
        }

        this.setState({
            keyword: '',
            opened: true,
        });
    }

    foreFresh() {
        if (this.props.pullDataSource) {
            this.props.pullDataSource(this.props.fullParentPath);
        }
    }

    dropDownClosed() {
        if (this.state.opened) {
            this.setState({ opened: false });
            if (isMobile) {
                removeFixedItem(this.popPanelItem);
            }
        }
    }

    clickOpenHandler() {
        if (this.props.fetching) {
            return;
        }
        if (!this.state.opened) {
            this.dropDownOpened();
        } else {
            this.dropDownClosed();
        }
    }

    addSelectItem(theOptionItem) {
        if (theOptionItem == null || !this.props.multiselect) {
            return;
        }
    }

    selectItem(theOptionItem, autoClose) {
        var value = null;
        var text = null;
        var values_arr = [];
        var multiselect = this.props.multiselect;
        if (theOptionItem == '*' || theOptionItem == this.props.starval) {
            value = this.props.starval;
            text = '*';
            values_arr.push('*');
        }
        else {
            if (multiselect) {
                if (!Array.isArray(theOptionItem)) {
                    console.error("multiselect's selectItem theOptionItem must array!");
                }
                theOptionItem.forEach(item => {
                    values_arr.push(item.value);
                    //value = (value == null ? '' : value + ',') + item.value;
                    text = (text == null ? '' : text + ',') + item.text;
                });
                value = ERPXMLToolKit.convertToXmlString(values_arr, [this.props.valueAttrName]);
            }
            else {
                if (theOptionItem) {
                    value = theOptionItem.value.toString();
                    text = theOptionItem.text;
                    values_arr.push(value);
                }
                if (this.props.recentCookieKey && this.recentValues_arr) {
                    var index = this.recentValues_arr.indexOf(value);
                    if (index != 0) {
                        if (index != -1) {
                            this.recentValues_arr.splice(index, 1);
                        }
                        this.recentValues_arr.unshift(value);
                        if (this.recentValues_arr.length >= 11) {
                            this.recentValues_arr.pop();
                        }
                        Cookies.set(this.props.recentCookieKey, this.recentValues_arr.join(','), { expires: 7 });
                    }
                }
            }
        }

        if (autoClose != false && (value == this.props.starval || !this.props.multiselect)) {
            this.dropDownClosed();
        }

        this.confirmChanged(text, value, theOptionItem, values_arr);
    }

    
    confirmChanged(text, value, theOptionItem, values_arr) {
        var invalidInfo = BaseIsValueValid(null, null, null, value == null || text == null ? null : value, this.props.type, this.props.nullable, this.props.id, null, this.props.fullPath);
        var changedObj = {
            value: value,
            text: text,
            values_arr: values_arr,
            invalidInfo: invalidInfo,
            selectOpt: theOptionItem,
        };
        var record;
        if (this.props.dataCols) {
            record = theOptionItem && theOptionItem.data ? theOptionItem.data : {};
            this.props.dataCols.split(',').forEach(col => {
                changedObj[col] = record[col];
            });
        }
        store.dispatch(makeAction_setManyStateByPath(changedObj, this.props.fullPath));
        if (typeof this.props.onchanged === 'function') {
            this.props.onchanged(this.props.fullParentPath, text, value, record);
        }
    }

    getPopPanelInitState() {
        var multiselect = this.props.multiselect;
        var selectedVal = this.props.value;
        var selectOpt = this.props.selectOpt;
        if (multiselect) {
            if (selectOpt == null) {
                selectOpt = [];
            }
        }
        return {
            selectedVal: this.props.value,
            fetching: this.props.fetching,
            fetchingErr: this.props.fetchingErr,
            optionsData: this.props.optionsData,
            starSelectable: this.props.starSelectable,
            maxCount: 50,
            keyword: '',
            recentValues_arr: this.recentValues_arr,
            recentUsed: this.recentUsed,
            multiselect: this.props.multiselect,
            selectOpt: selectOpt,
            label: ReplaceIfNull(this.props.label, this.props.textAttrName),
            starval: this.props.starval,
        }
    }

    editableInputChanged(ev) {
        this.setState({
            inputingValue: ev.target.value,
        });
    }

    editableInputFocushandler(ev) {
        this.setState({
            focused: true,
            inputingValue: this.props.value,
        });
    }

    editableInputBlurhandler(ev) {
        this.confirmChanged(this.state.inputingValue, this.state.inputingValue, null, [this.state.inputingValue]);
        this.setState({
            focused: false
        });
    }

    getPopItemStyle() {
        var rootDiv = this.rootDivRef.current;
        var rootRect = rootDiv.getBoundingClientRect();
        var $window = $(window);
        var windowHeight = $window.height();
        var windowWidth = $window.width();
        var topSpace = rootRect.top;
        var bottomSpace = windowHeight - rootRect.bottom;
        var rootPos = $(rootDiv).position();
        var offsetParentHeight = rootDiv.offsetParent.scrollHeight;
        var useWidth = rootDiv.offsetWidth;
        if (this.props.poppanelminwidth && useWidth < parseInt(this.props.poppanelminwidth)) {
            useWidth = parseInt(this.props.poppanelminwidth);
        }
        var rlt = {
            width: useWidth + 'px',
            left: (rootPos.left + useWidth < windowWidth ? rootPos.left : windowWidth - useWidth - 10) + 'px',
        };
        if (bottomSpace > topSpace) {
            rlt.top = (rootPos.top + rootRect.height) + 'px';
            rlt.maxHeight = (bottomSpace - 20) + 'px';
        }
        else {
            rlt.bottom = (offsetParentHeight - rootPos.top) + 'px';
            rlt.maxHeight = (topSpace - 20) + 'px';
        }
        return rlt;
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var hadMini = this.props.miniBtn != false;
        var selectedVal = this.props.value;
        var selectedText = this.props.text;
        var self = this;
        var multiselect = this.props.multiselect;
        var selectedItems_arr;

        var inputingValue = null;
        if (this.props.editable) {
            if (this.state.focused) {
                inputingValue = this.state.inputingValue;
            }
            else {
                inputingValue = this.props.value;
            }
            if (inputingValue == null) {
                inputingValue = '';
            }
        }
        else {
            if (!IsEmptyString(selectedVal)) {
                if (IsEmptyString(selectedText)) {
                    if (selectedVal == this.props.starval) {
                        setTimeout(() => {
                            self.selectItem('*');
                        }, 50);
                    }
                    else if (this.props.fetchingErr != null) {
                        setTimeout(() => {
                            self.selectItem(null);
                        }, 50);
                    }
                    else {
                        if (this.props.optionsData.options_arr == null) {
                            selectedVal = null;
                            if (!this.props.fetching) {
                                if (this.autoPullTO == null) {
                                    this.autoPullTO = setTimeout(() => {
                                        self.props.pullDataSource(this.props.fullParentPath);
                                        self.autoPullTO = null;
                                    }, 50);
                                }
                            }
                        }
                        else {
                            if (multiselect) {
                                selectedItems_arr = this.props.optionsData.options_arr.filter(item => {
                                    return selectedVal.indexOf(item.value + '') != -1;
                                });
                                selectedText = '';
                                selectedItems_arr.forEach(item => {
                                    selectedText += item.text;
                                });
                                setTimeout(() => {
                                    self.selectItem(selectedItems_arr);
                                }, 50);
                            }
                            else {
                                var theOptionItem = this.props.optionsData.options_arr.find(item => {
                                    return item.value == selectedVal;
                                });
                                selectedText = theOptionItem ? theOptionItem.text : null;
                                setTimeout(() => {
                                    self.selectItem(theOptionItem);
                                }, 50);
                            }
                        }
                    }
                }
                else if (this.props.optionsData.options_arr) {
                    if (selectedVal != this.props.starval) {
                        if (multiselect) {
                            selectedItems_arr = this.props.optionsData.options_arr.filter(item => {
                                return selectedVal.indexOf(item.value + '') != -1;
                            });
                            if (selectedItems_arr) {
                                if (selectedItems_arr.length != this.props.selectOpt.length) {
                                    setTimeout(() => {
                                        self.selectItem(selectedItems_arr);
                                    }, 50);
                                }
                            }
                            else {
                                setTimeout(() => {
                                    self.selectItem(null, false);
                                }, 50);
                            }
                        }
                        else {
                            var selectedOptionItem = this.props.optionsData.options_arr.find(item => {
                                return item.value == selectedVal;
                            });
                            if (selectedOptionItem) {
                                if (selectedOptionItem.text != selectedText) {
                                    setTimeout(() => {
                                        self.selectItem(selectedOptionItem, false);
                                    }, 50);
                                }
                            }
                            else {
                                setTimeout(() => {
                                    self.selectItem(null, false);
                                }, 50);
                            }
                        }
                    }
                }
            }
        }

        var popPanelElem = null;
        if (this.state.opened) {
            if (!isMobile) {
                popPanelElem = (<ERPC_DropDown_PopPanel ref={this.popPanelRef} dropdownctl={this} />);
            }

            var popPanelRefCurrent = this.popPanelRef.current;
            if (popPanelRefCurrent) {
                var newState = {
                    selectedVal: selectedVal,
                    fetching: this.props.fetching,
                    fetchingErr: this.props.fetchingErr,
                    optionsData: this.props.optionsData,
                    selectOpt: !multiselect ? null : (this.props.selectOpt ? this.props.selectOpt : []),
                };
                setTimeout(() => {
                    popPanelRefCurrent.setState(newState);
                }, 50);
            }
        }
        var textElem = null;
        var textColor = '';
        if (!this.state.opened && this.props.fetching) {
            textElem = (<div className='m-auto d-flex align-items-center'>
                <i className='fa fa-spinner fa-pulse fa-fw fa-2x' />
                <div className='text-nowrap'>加载中</div>
            </div>);
        }
        else {
            if (!this.props.nullable) {
                textColor = selectedVal == null ? ' text-danger' : '';
                textElem = (<div>{selectedText == null ? '请选择' : selectedText}</div>);
            }
            else {
                textColor = selectedVal == null ? ' text-warning' : '';
                textElem = (<div>{selectedText == null ? '请选择(可以不选)' : selectedText}</div>);
            }
        }
        var errTipElem = null;
        if (this.props.invalidInfo) {
            errTipElem = <span className='text-danger'><i className='fa fa-warning' />{this.props.invalidInfo}</span>
        }
        if (this.props.plainTextMode) {
            return <div className='d-flex flex-column flex-grow-1 flex-shrink-1'>
                {textElem}
                {errTipElem}
            </div>
        }
        var dropDownElem = null;
        if (this.props.editable) {
            dropDownElem = (
                <div className={"d-flex mw-100 btn-group flex-shrink-0 erpc_dropdown input-group flex-grow-" + (this.props.growable == false ? '0' : '1')} style={this.props.style} ref={this.rootDivRef}>
                    <input onFocus={this.editableInputFocushandler} onBlur={this.editableInputBlurhandler} ref={this.editableInputRef} type='text' className='flex-grow-1 flex-shrink-1 flexinput form-control' onChange={this.editableInputChanged} value={inputingValue} placeholder='输入或选择' />
                    <div className="input-group-append">
                        <button type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split'} ></button>
                    </div>
                </div>
            );
        }
        else {
            dropDownElem = (
                <div className={"d-flex mw-100 btn-group flex-shrink-0 erpc_dropdown flex-grow-" + (this.props.growable == false ? '0' : '1')} style={this.props.style} ref={this.rootDivRef}>
                    <button onClick={this.clickOpenHandler} type='button' className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1 erpc_dropdownMainBtn' + textColor} hadmini={hadMini ? 1 : null} >
                        <div style={{ overflow: 'hidden' }} className='flex-grow-1 flex-shrink-1'>
                            {textElem}
                        </div>
                    </button>
                    {
                        hadMini && <button type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdownbtn dropdown-toggle-split'} ></button>
                    }
                </div>
            );
        }

        if (errTipElem == null && popPanelElem == null) {
            return dropDownElem;
        }
        return <div className={'d-flex flex-column flex-shrink-1 flex-grow-' + (this.props.growable == false ? '0' : '1')}>
            {dropDownElem}
            {errTipElem}
            {popPanelElem}
        </div>
    }
}

const selectERPC_DropDown_options = (state, ownprops) => {
    if (ownprops.options_arr != null) {
        return ownprops.options_arr;
    }
    var propProfile = getControlPropProfile(ownprops, state);
    return propProfile.ctlState.options_arr;
};

const selectERPC_DropDown_multiValues = (xmlstr) => {
    return ERPXMLToolKit.extractColumn(xmlstr, 1);
};

const selectERPC_DropDown_value = (state, ownprops) => {
    var propProfile = getControlPropProfile(ownprops, state);
    return propProfile.ctlState.value;
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

const selectERPC_DropDown_textType = (state, ownprops) => {
    return ownprops.textType;
};

const formatERPC_DropDown_options = (orginData_arr, textAttrName, valueAttrName, groupAttr, textType) => {
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
        switch (textType) {
            case 'date':
                newItem.text = FormatStringValue(newItem.text, 'date');
                break;
        }
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

function getControlPropProfile(ownprops, useState) {
    var ctlState;
    var rowState;
    var fullParentPath;
    var fullPath;
    if (ownprops.rowkey == null) {
        fullParentPath = ownprops.parentPath;
        fullPath = MakePath(ownprops.parentPath, ownprops.id);
        if (useState) {
            ctlState = getStateByPath(useState, fullPath, {});
        }
    }
    else {
        fullParentPath = MakePath(ownprops.parentPath, 'row_' + ownprops.rowkey);
        fullPath = fullParentPath + '.' + ownprops.id;
        if (useState) {
            rowState = getStateByPath(useState, fullParentPath, {});
            ctlState = getStateByPath(rowState, ownprops.id, {});
        }
    }
    return {
        ctlState: ctlState,
        rowState: rowState,
        fullParentPath: fullParentPath,
        fullPath: fullPath,
        rowkey: ownprops.rowkey,
    };
}

const ERPC_selector_map = {};

function ERPC_DropDown_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = propProfile.fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var starval = ownprops.starval == null ? '*' : ownprops.starval;
    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (useValue) {
        if (ownprops.multiselect && useValue != starval) {
            if (useValue[0] == '<') {
                selectorid = propProfile.fullPath + 'value';
                var valueSelector = ERPC_selector_map[selectorid];
                if (valueSelector == null) {
                    valueSelector = Reselect.createSelector(selectERPC_DropDown_value, selectERPC_DropDown_multiValues);
                    ERPC_selector_map[selectorid] = valueSelector;
                }
                //useValue = ERPXMLToolKit.extractColumn(useValue, 1);
                useValue = valueSelector(state, ownprops);
            }
            else {
                useValue = (useValue + '').split(',');
            }
        }
    }
    else {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        values_arr: ctlState.values_arr,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        starval: starval,
        poppanelminwidth: ownprops.poppanelminwidth,
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
        var invalidInfo = BaseIsValueValid(null, null, null, text, this.props.type, this.props.nullable, this.props.id, null, this.props.fullPath);
        store.dispatch(makeAction_setManyStateByPath({
            value: text,
            invalidInfo: invalidInfo,
        }, this.props.fullPath));
        if (typeof this.props.onchanged === 'function') {
            this.props.onchanged(this.props.fullParentPath, text);
        }
    }

    formatInputValue(val) {
        if (IsEmptyString(val)) {
            return '';
        }
        var type = this.props.type;
        var rlt = val;
        switch (type) {
            case 'int':
                rlt = parseInt(val);
                if (isNaN(rlt)) {
                    rlt = '';
                }
                break;
            case 'float':
                if (isNaN(rlt)) {
                    return '';
                }
                var precision = this.props.precision == null ? 2 : parseInt(this.props.precision);
                var t_arr = ('' + val).split('.');
                rlt = t_arr[0];
                if (t_arr.length > 1) {
                    rlt += '.' + t_arr[1].substr(0, precision);
                }
                break;
            case 'date':
                if (val.length > 10) {
                    rlt = getFormatDateString(new Date(Date.parse(val)))
                }
                break;
            case 'time':
                rlt = getFormatTimeString(castDateFromTimePart(val), false);
                break;
        }
        return rlt;
    }

    endInputHandler() {
        var invalidInfo = BaseIsValueValid(null, null, null, this.props.value, this.props.type, this.props.nullable, this.props.id, null, this.props.fullPath);
        store.dispatch(makeAction_setStateByPath(invalidInfo, MakePath(this.props.fullPath, 'invalidInfo')));
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var contentElem = null;
        var errTipElem = null;
        var rootDivClassName = 'd-flex ' + (this.props.className == null ? '' : this.props.className);
        if (this.props.fetching) {
            rootDivClassName += 'rounded border p-1';
            contentElem = <div className='flex-grow-1 flex-shrink-1'><i className='fa fa-spinner fa-pulse fa-fw' />通讯中</div>;
        }
        else if (this.props.fetchingErr) {
            rootDivClassName += 'rounded border p-1 text-danger';
            var errInfo = this.props.fetchingErr.info;
            if (errInfo == gPreconditionInvalidInfo) {
                errInfo = '';
            }
            contentElem = <small className='flex-grow-1 flex-shrink-1'><i className='fa fa-warning' />{errInfo}</small>;
        }
        else {
            if (this.props.plainTextMode) {
                var nowValue = FormatStringValue(this.props.value, this.props.type, this.props.precision);
                contentElem = <div className='flex-grow-1 flex-shrink-1'>{nowValue}</div>
            }
            else if (this.props.readonly) {
                rootDivClassName += ' bg-secondary rounded border p-1'
                var nowValue = FormatStringValue(this.props.value, this.props.type, this.props.precision);
                if (nowValue == null || nowValue.length == 0) {
                    rootDivClassName += ' text-secondary';
                    nowValue = '_';
                }
                else {
                    rootDivClassName += ' text-light';
                }
                contentElem = <div className='flex-grow-1 flex-shrink-1'>{nowValue}</div>
            }
            else if (this.props.type == 'string' && this.props.linetype != null && this.props.linetype != 'single') {
                contentElem = <textarea id={this.props.id} onChange={this.inputChanged} className={'flex-grow-1 flex-shrink-1 w-100 form-control textarea-' + this.props.linetype + (this.props.align ? ' text-' + this.props.align : '')} value={this.props.value} onBlur={this.endInputHandler} />
            }
            else {
                var useClass = 'flex-grow-1 flex-shrink-1 form-control invalid';
                var useType = this.props.type;
                var useChecked = null;
                switch (this.props.type) {
                    case 'string':
                        useType = 'text';
                        break;
                    case 'int':
                    case 'float':
                        useType = 'number';
                        break;
                    case 'boolean':
                        useType = 'checkbox';
                        useChecked = parseBoolean(useType);
                        break;
                    case 'date':
                        useClass += ' dateTextInput';
                        break;
                }
                var useValue = this.formatInputValue(this.props.value);
                if (useValue != this.props.value) {
                    if (!IsEmptyString(useValue) && !IsEmptyString(this.props.value) && useValue != this.props.value && (this.props.type == 'time' || this.props.type == 'date' || this.props.type == 'float')) {
                        setTimeout(() => {
                            store.dispatch(makeAction_setStateByPath(
                                useValue,
                                this.props.fullPath + '.value'));
                        }, 10);
                    }
                }
                contentElem = (<input id={this.props.id} className={useClass + (this.props.align ? ' text-' + this.props.align : '')} type={useType} value={useValue} checked={useChecked} onChange={this.inputChanged} onBlur={this.endInputHandler} />);
            }

            if (this.props.invalidInfo) {
                rootDivClassName += ' flex-column';
                errTipElem = <small className='text-danger'><i className='fa fa-warning' />{this.props.invalidInfo}</small>
            }
        }
        return (<div className={rootDivClassName} ref={this.rootDivRef} style={this.props.style}>
            {contentElem}
            {errTipElem}
        </div>);
    }
}

function ERPC_Text_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        value: ctlState.value == null ? '' : ctlState.value,
        fetching: ctlState.fetching,
        visible: ctlState.visible,
        fetchingErr: ctlState.fetchingErr,
        invalidInfo: ctlState.invalidInfo == gPreconditionInvalidInfo ? null : ctlState.invalidInfo,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
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

    renderInPC(toolTipIcon) {
        return (<div className={'rowlFameTwo' + (this.props.className ? ' ' + this.props.className : '')} wf={this.props.wf} style={this.props.style}>
            <label className='rowlFameTwo_Top font-weight-bold' htmlFor={this.props.forid}>
                {this.props.label}
            </label>
            <div className='rowlFameTwo_Bottom'>
                {toolTipIcon}
                {this.props.children}
            </div>
        </div>);
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var toolTipIcon = null;
        if (this.props.tooltip) {
            toolTipIcon = <ERPC_PopperBtn className='btn btn-sm btn-link' anchor='left' labelelem={<i className='fa fa-question-circle fa-2x' />} ><span>{this.props.tooltip}</span></ERPC_PopperBtn>;
        }
        var renderMode = this.props.rm;
        if (renderMode == null) {
            if (gPCRenderMode) {
                renderMode = 'pc';
            }
        }
        if (renderMode == 'pc') {
            return this.renderInPC(toolTipIcon);
        }
        var rightElem = null;
        if (toolTipIcon) {
            rightElem = <div className='d-flex align-items-center'>
                {toolTipIcon}
                <div className='flex-grow-1 flex-shrink-1'>
                    {this.props.children}
                </div>
            </div>
        }
        else {
            rightElem = this.props.children;
        }
        return (<div className={'rowlFameOne' + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style}>
            <div className='rowlFameOne_Left' wn={this.props.wn}>
                <span>
                    {this.props.label}
                </span>
            </div>
            <span className='rowlFameDivider' />
            <div className='rowlFameOne_right' wn={this.props.wn}>
                {rightElem}
            </div>
        </div>);
    }
}

function ERPC_LabeledControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, ownprops.id), {});
    var useLabel = ctlState.label != null ? ctlState.label : (ownprops.label != null ? ownprops.label : '');
    return {
        label: useLabel,
        fetching: ctlState.fetching,
        visible: ctlState.visible,
        tooltip: ctlState.tooltip ? ctlState.tooltip : ownprops.tooltip,
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

class ERPC_Label extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var rootDivClassName = 'erpc_label ' + (this.props.className == null ? '' : this.props.className);
        var contentElem = null;
        var tileLen = 0;
        if (this.props.fetching) {
            rootDivClassName += 'p-1';
            contentElem = <span><i className='fa fa-spinner fa-pulse fa-fw' />通讯中</span>;
        }
        else if (this.props.fetchingErr) {
            var errInfo = this.props.fetchingErr.info;
            if (errInfo == gPreconditionInvalidInfo) {
                errInfo = '';
            }
            rootDivClassName += 'p-1 text-danger';
            contentElem = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-warning' />{errInfo}</span>;
        }
        else if (this.props.type == 'boolean') {
            var value = this.props.text;
            var checked = checked = !(value == false || value == 0 || value == 'false' || value == 'FALSE');
            contentElem = <i className={'fa ' + (checked ? ' fa-check text-success' : ' fa-close text-danger')} />
        }
        else {
            contentElem = FormatStringValue(this.props.text, this.props.type, this.props.precision);
            tileLen = contentElem.toString().length;
        }

        var needCtlPath = false;
        if (this.props.onMouseDown != null) {
            needCtlPath = true;
        }

        return (<span className={rootDivClassName} style={this.props.style} charlen={this.props.boutcharlen ? tileLen : null} onMouseDown={this.props.onMouseDown} ctl-fullpath={needCtlPath ? this.props.fullPath : null} >{contentElem}</span>);
    }
}

function ERPC_Label_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var useText = ctlState.text != null ? ctlState.text : (ownprops.text ? ownprops.text : '');

    return {
        text: useText,
        visible: ctlState.visible,
        fetching: ctlState.fetching,
        visible: ctlState.visible == false || ownprops.definvisible ? false : true,
        fetchingErr: ctlState.fetchingErr,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_Label_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_Img extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var rootDivClassName = 'erpc_img ' + (this.props.className == null ? '' : this.props.className);
        var contentElem = null;
        var tileLen = 0;
        if (this.props.fetching) {
            rootDivClassName += 'p-1';
            contentElem = <span><i className='fa fa-spinner fa-pulse fa-fw' />通讯中</span>;
        }
        else if (this.props.fetchingErr) {
            var errInfo = this.props.fetchingErr.info;
            if (errInfo == gPreconditionInvalidInfo) {
                errInfo = '';
            }
            rootDivClassName += 'p-1 text-danger';
            contentElem = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-warning' />{errInfo}</span>;
        }

        if(contentElem){
            return (<span className={rootDivClassName} style={this.props.style} onMouseDown={this.props.onMouseDown} >{contentElem}</span>);
        }

        var needCtlPath = false;
        if (this.props.onMouseDown != null) {
            needCtlPath = true;
        }

        return (<img className={rootDivClassName} style={this.props.style} src={this.props.src} onMouseDown={this.props.onMouseDown} ctl-fullpath={needCtlPath ? this.props.fullPath : null} />);
    }
}

function ERPC_Img_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var useSrc = ctlState.src != null ? ctlState.src : (ownprops.src ? ownprops.src : '');

    return {
        src: useSrc,
        visible: ctlState.visible,
        fetching: ctlState.fetching,
        visible: ctlState.visible == false || ownprops.definvisible ? false : true,
        fetchingErr: ctlState.fetchingErr,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_Img_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_CheckBox extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    clickHandler(ev) {
        store.dispatch(makeAction_setManyStateByPath({
            value: this.checked ? 0 : 1,
        }, this.props.fullPath));
        if (typeof this.props.onchanged === 'function') {
            this.props.onchanged(this.props.fullParentPath, this.checked ? 0 : 1);
        }
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var checked = false;
        var value = this.props.value;
        if (value != null) {
            checked = !(value == false || value == 0 || value == 'false' || value == 'FALSE');
        }
        this.checked = checked;
        if (this.props.readonly || this.props.plainTextMode) {
            return (<span className={'erpc_checkbox ' + (this.props.className == null ? '' : this.props.className)} >
                <i className={'fa ' + (checked ? ' fa-check text-success' : ' fa-close text-danger')} />
            </span>);
        }
        return (<span className={'erpc_checkbox ' + (this.props.className == null ? '' : this.props.className)} >
            <span onClick={this.props.readonly ? null : this.clickHandler} className="fa-stack fa-lg">
                <i className={"fa fa-square-o fa-stack-2x" + (this.props.readonly ? ' text-secondary' : '')} />
                <i className={'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : ' fa-close text-danger')} />
            </span>
        </span>);
    }
}

function ERPC_CheckBox_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        value: ctlState.value,
        visible: ctlState.visible,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
    };
}

function ERPC_CheckBox_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_Button extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var className = this.props.className;
        var childElem = null;
        var titleElem = this.props.title;
        if (this.props.fetching) {
            titleElem = <div><i className='fa fa-spinner fa-pulse fa-fw' />通讯中</div>;
        }
        else if (this.props.fetchingErr) {
            titleElem = <div className='text-danger'><i className='fa fa-warning' />this.props.fetchingErr.info</div>;
        }
        if (this.props.btnType == 'ListLike') {
            className = 'w-100 d-flex btn btn-light align-items-center text-left';
            childElem = <React.Fragment>
                <div className='flex-grow-1 flex-shrink-1 hidenOverflow'>
                    {this.props.children}
                    {titleElem}
                </div>
                <i className='fa fa-angle-right' />
            </React.Fragment>;
        }
        else {
            if (className.indexOf('flex-shrink-') == -1) {
                className += ' flex-shrink-0';
            }
            childElem = <React.Fragment>
                {this.props.children}
                {titleElem}
            </React.Fragment>;
        }
        return <button className={className} style={this.props.style} onClick={this.props.onClick} ctl-fullpath={this.props.fullPath}>
            {childElem}
        </button>
    }
}

function ERPC_Button_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        title: ctlState.title == null ? ownprops.title : ctlState.title,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
    };
}

function ERPC_Button_dispatchtorprops(dispatch, ownprops) {
    return {
        onClick: ownprops.onClick,
    };
}

function ClosePopperBtn(fullPath, needSetState) {
    if (needSetState) {
        needSetState[fullPath + '.closeSignal'] = Math.round(Math.random() * 9999);
    }
    else {
        store.dispatch(makeAction_setStateByPath(Math.round(Math.random() * 9999), fullPath + '.closeSignal'));
    }
}

class ERPC_PopperBtn extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.initState.closeSignal = props.closeSignal;
        this.state = this.initState;
        this.popdivRef = React.createRef();
        this.rootRef = React.createRef();
    }

    close() {
        if (this.popdivRef.current == null) {
            return;
        }
        if (this.state.popper) {
            this.state.popper.destroy();
            this.setState({
                popper: null,
            });
            return;
        }
    }

    clickHandler(ev) {
        if (this.popdivRef.current == null) {
            return;
        }
        if (this.state.popper) {
            this.state.popper.destroy();
            this.setState({
                popper: null,
            });
            return;
        }
        var popper = Popper.createPopper(this.rootRef.current, this.popdivRef.current, {
            placement: this.props.anchor,
            strategy:(this.props.strategy ? this.props.strategy : 'absolute'),
        });
        this.setState({
            popper: popper,
        });
        /*
        if(gLastPopper){
            var isself = gLastPopper.srcReactObj == this;
            gLastPopper.popper.destroy();
            gLastPopper.srcReactObj.setState({
                poped:false,
            });
            gLastPopper = null;
            if(isself){
                return;
            }
        }
        var popper = new Popper(this.rootRef.current, this.popdivRef.current, {
			placement: this.props.anchor
		});
        gLastPopper = {
            srcReactObj: this,
            popper:popper,
            popDiv:this.popdivRef.current,
        }
        this.setState({
            poped:true,
        });
        */
    }

    cusComponentWillUnmount() {
        if (this.state.popper) {
            this.state.popper.destroy();
        }
        /*
        if(gLastPopper && gLastPopper.srcReactObj == this){
            gLastPopper.popper.destroy();
            gLastPopper = null;
        }
        */
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var nowPopper = this.state.popper;
        if (this.state.closeSignal != this.props.closeSignal) {
            var self = this;
            var newCloseSignal = this.props.closeSignal;
            if (nowPopper) {
                nowPopper.destroy();
                nowPopper = null;
            }
            setTimeout(() => {
                self.setState({
                    popper: null,
                    closeSignal: newCloseSignal,
                });
            }, 20);
        }
        /*
        if(this.state.poped && gLastPopper && gLastPopper.srcReactObj == this && gLastPopper.popDiv != this.popdivRef.current){
            gLastPopper.popper.destroy();
            gLastPopper = null;
            setTimeout(() => {
                this.setState({
                    poped: false,
                });
            }, 20);
            return null;
        }
        */
        var closeBtnElem = null;
        if (!this.props.hideCloseBtn) {
            closeBtnElem = <div className='toprightCloseBtn text-danger cursor_hand' onMouseDown={this.clickHandler}>
                <span className="fa-stack">
                    <i className="fa fa-circle fa-stack-2x"></i>
                    <i className="fa fa-close fa-stack-1x fa-inverse"></i>
                </span>
            </div>
        }
        return <span ref={this.rootRef}>
            <button className={this.props.className} style={this.props.style} onClick={this.clickHandler}>{this.props.labelelem}{this.props.title}</button>
            <div ref={this.popdivRef} className={nowPopper ? 'popper zindexPopper ' + (this.props.popperclassname ? this.props.popperclassname : '') : 'd-none'} style={this.props.popperstyle}>
                <div className='popper__arrow' />
                {this.props.children}
                {closeBtnElem}
            </div>
        </span>
    }
}

function ERPC_PopperBtn_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        title: ctlState.title == null ? ownprops.title : ctlState.title,
        closeSignal: ctlState.closeSignal,
    };
}

function EERPC_PopperBtn_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_DropDown = null;
var VisibleERPC_Text = null;
var VisibleERPC_LabeledControl = null;
var VisibleERPC_Label = null;
var VisibleERPC_CheckBox = null;
var VisibleERPC_Button = null;
var VisibleERPC_PopperBtn = null;
var VisibleERPC_FrameSet = null;
var VisibleERPC_IFrame = null;
var VisibleERPC_Img = null;
const gNeedCallOnErpControlInit_arr = [];

function ErpControlInit() {
    DebugApp('ErpControlInit start');
    VisibleERPC_DropDown = ReactRedux.connect(ERPC_DropDown_mapstatetoprops, ERPC_DropDown_dispatchtoprops)(ERPC_DropDown);
    VisibleERPC_Text = ReactRedux.connect(ERPC_Text_mapstatetoprops, ERPC_Text_dispatchtorprops)(ERPC_Text);
    VisibleERPC_LabeledControl = ReactRedux.connect(ERPC_LabeledControl_mapstatetoprops, ERPC_LabeledControl_dispatchtorprops)(ERPC_LabeledControl);
    VisibleERPC_Label = ReactRedux.connect(ERPC_Label_mapstatetoprops, ERPC_Label_dispatchtorprops)(ERPC_Label);
    VisibleERPC_CheckBox = ReactRedux.connect(ERPC_CheckBox_mapstatetoprops, ERPC_CheckBox_dispatchtorprops)(ERPC_CheckBox);
    VisibleERPC_Button = ReactRedux.connect(ERPC_Button_mapstatetoprops, ERPC_Button_dispatchtorprops)(ERPC_Button);
    VisibleERPC_PopperBtn = ReactRedux.connect(ERPC_PopperBtn_mapstatetoprops, EERPC_PopperBtn_dispatchtorprops)(ERPC_PopperBtn);
    VisibleERPC_FrameSet = ReactRedux.connect(ERPC_FrameSet_mapstatetoprops, ERPC_FrameSet_dispatchtorprops)(ERPC_FrameSet);
    VisibleERPC_IFrame = ReactRedux.connect(ERPC_IFrame_mapstatetoprops, ERPC_IFrame_dispatchtorprops)(ERPC_IFrame);
    VisibleERPC_Img = ReactRedux.connect(ERPC_Img_mapstatetoprops, ERPC_Img_dispatchtorprops)(ERPC_Img);

    gNeedCallOnErpControlInit_arr.forEach(elem => {
        if (typeof elem == 'function') {
            elem.call();
        }
    });
    DebugApp('ErpControlInit end');
}

function ERPC_PageForm(target) {
    target.clickPreNavBtnHandler = ERPC_PageForm_clickPreNavBtnHandler.bind(target);
    target.clickNextNavBtnHandler = ERPC_PageForm_clickNextNavBtnHandler.bind(target);
    target.clickPlusNavBtnHandler = ERPC_PageForm_clickPlusNavBtnHandler.bind(target);
    target.clickUnPlusNavBtnHandler = ERPC_PageForm_clickUnPlusNavBtnHandler.bind(target);
    target.renderNavigater = ERPC_PageForm_renderNavigater.bind(target);
}

function ERPC_PageForm_clickPreNavBtnHandler() {
    var nowIndex = this.props.recordIndex;
    var count = this.props.records_arr == null ? 0 : this.props.records_arr.length;
    if (count <= 1) {
        return;
    }
    var newIndex = nowIndex - 1;
    if (newIndex < 0) {
        newIndex += count;
    }
    store.dispatch(makeAction_setStateByPath(newIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickNextNavBtnHandler() {
    var nowIndex = this.props.recordIndex;
    var count = this.props.records_arr == null ? 0 : this.props.records_arr.length;
    if (count <= 1) {
        return;
    }
    var newIndex = (nowIndex + 1) % count;
    store.dispatch(makeAction_setStateByPath(newIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickPlusNavBtnHandler() {
    this.prePlusIndex = this.props.recordIndex;
    store.dispatch(makeAction_setStateByPath(-1, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_clickUnPlusNavBtnHandler() {
    if (this.saveInsertCache) {
        this.saveInsertCache();
    }
    store.dispatch(makeAction_setStateByPath(this.prePlusIndex, MakePath(this.props.parentPath, this.props.id, 'recordIndex')));
}

function ERPC_PageForm_renderNavigater() {
    var records_arr = this.props.records_arr;
    if (records_arr == null || records_arr.length == 1) {
        if (!this.canInsert) {
            return null;
        }
    }
    var count = records_arr == null ? 0 : records_arr.length;
    var plushBtnItem = null;
    var exitPlushBtnItem = null;
    var preBtnItem = null;
    var nextBtnItem = null;
    var infoItem = null;
    var nowIndex = this.props.recordIndex == null ? -1 : this.props.recordIndex;
    var countInfo = (count > 9999 ? '9999..' : count);
    var indexInfo = count == 0 ? '0' : (nowIndex > 9999 ? '9999..' : nowIndex + 1);

    if (nowIndex != -1) {
        preBtnItem = (<button type='button' onClick={this.clickPreNavBtnHandler} className='btn flex-grow-1 navigationBtn btn-info' ><span className='fa fa-chevron-left' /></button>);
        nextBtnItem = (<button type='button' onClick={this.clickNextNavBtnHandler} className='btn flex-grow-1 navigationBtn btn-info' ><span className='fa fa-chevron-right' /></button>);
        infoItem = (<span className='bg-info text-light d-flex align-items-center flex-shrink-1 p-1'>{indexInfo}/{countInfo}</span>);
    }

    if (this.canInsert) {
        if (nowIndex == -1) {
            if (count > 0) {
                exitPlushBtnItem = (<button type='button' onClick={this.clickUnPlusNavBtnHandler} className='btn btn-danger flex-grow-1 navigationBtn' ><span className='fa fa-undo' />放弃登记</button>);
            }
        }
        else {
            plushBtnItem = (<button type='button' onClick={this.clickPlusNavBtnHandler} className='btn btn-info flex-grow-1 navigationBtn' ><span className='fa fa-plus' /></button>);
        }
    }

    return (
        <div className='btn-group flex-grow-0 flex-shrink-0'>
            {preBtnItem}
            {infoItem}
            {nextBtnItem}
            {plushBtnItem}
            {exitPlushBtnItem}
        </div>
    );
}

function SmartSetScrollTop(theElem) {
    if (theElem == null) {
        return;
    }
    var offsetTop = 0;
    while (theElem.parentElement) {
        var parent = theElem.parentElement;
        if (parent.scrollTop > 0) {
            if (theElem.offsetTop < parent.scrollTop) {
                parent.scrollTop = offsetTop - 40;
                offsetTop = 0;
            }
        }
        offsetTop += theElem.offsetTop;
        theElem = parent;
        parent = parent.parentElement;
    }
}

function GetFormSelectedRows(formState, keyColumn) {
    var rlt = GetFormSelectedProfile(formState, keyColumn);
    return rlt.key != null ? [rlt.key] : rlt.keys_arr;
}

function GetFormSelectedColumns(formState, keyColumn, targetColmun) {
    if (targetColmun == null || keyColumn == targetColmun) {
        return formState.selectedValues_arr == null ? [] : formState.selectedValues_arr;
    }
    var rlt = GetFormSelectedProfile(formState, keyColumn);
    return rlt.records_arr.map(record => { return record[targetColmun]; })
}

function GetFormSelectedProfile(formState, keyColumn) {
    var rlt = {
        index: null,
        record: null,
        key: null,
        indexes_arr: [],
        records_arr: [],
        keys_arr: [],
    }
    var records_arr = formState.records_arr;
    if (records_arr == null || records_arr.length == 0) {
        return rlt;
    }
    var key = null;
    var count = records_arr.length;
    var ri;
    var record;
    if (formState.selectedValue != null) {
        for (ri = 0; ri < count; ++ri) {
            record = records_arr[ri];
            key = keyColumn == '_default' ? ri : record[keyColumn];
            if (key == formState.selectedValue) {
                rlt.index = ri;
                rlt.record = record;
                rlt.key = formState.selectedValue;
                break;
            }
        }
        return rlt;
    }
    var selectedValues_arr = formState.selectedValues_arr;
    if (selectedValues_arr == null || selectedValues_arr.length == 0) {
        return rlt;
    }
    var key_map = {};
    selectedValues_arr.forEach(k => { key_map[k] = 1; });
    for (ri = 0; ri < count; ++ri) {
        record = records_arr[ri];
        key = keyColumn == '_default' ? ri : record[keyColumn];
        if (key_map[key] != null) {
            rlt.indexes_arr.push(ri);
            rlt.records_arr.push(record);
            rlt.keys_arr.push(key);
        }
    }
    return rlt;
}

function GetFormRowDataFromKey(formState, rowkey, keyColumn) {
    var records_arr = formState.records_arr;
    var rlt = {
        index: -1,
        record: null,
        key: null,
    };
    if (records_arr == null || records_arr.length == 0) {
        return rlt;
    }
    for (ri = 0; ri < records_arr.length; ++ri) {
        var record = records_arr[ri];
        var key = keyColumn == '_default' ? ri : record[keyColumn];
        if (key == rowkey) {
            rlt.index = ri;
            rlt.record = record;
            rlt.key = rowkey;
            break;
        }
    }
    return rlt;
}

function ERPC_GridForm(target) {
    target.rootRef = React.createRef();
    target.rowPerPageChangedHandler = ERPC_GridForm_RowPerPageChangedHandler.bind(target);
    target.pageIndexChangedHandler = ERPC_GridForm_PageIndexChangedHandler.bind(target);
    target.prePageClickHandler = ERPC_GridForm_PrePageClickHandler.bind(target);
    target.nxtPageClickHandler = ERPC_GridForm_NxtPageClickHandler.bind(target);
    target.setRowPerPage = ERPC_GridForm_SetRowPerPage.bind(target);
    target.setPageIndex = ERPC_GridForm_SetPageIndex.bind(target);
    target.getRowPath = ERPC_GridForm_GetRowPath.bind(target);
    target.getRowState = ERPC_GridForm_GetRowState.bind(target);
    target.roweditClicked = ERPC_GridForm_RoweditClicked.bind(target);
    target.rowcanceleditClicked = ERPC_GridForm_RowcanceleditClicked.bind(target);
    target.rowdeleteClicked = ERPC_GridForm_RowdeleteClicked.bind(target);
    if (target.onUpdate != null) {
        target.rowconfirmeditClicked = ERPC_GridForm_RowconfirmeditClicked.bind(target);
    }
    target.clickNewRowHandler = ERPC_GridForm_ClickNewRowHandler.bind(target);
    target.cancelInsert = ERPC_GridForm_CancelInsert.bind(target);
    target.confrimInsert = ERPC_GridForm_ConfirmInsert.bind(target);
    target.selectorClicked = ERPC_GridForm_SelectorClicked.bind(target);
    target.selectAll = ERPC_GridForm_SelectAll.bind(target);
    target.unSelectAll = ERPC_GridForm_UnSelectAll.bind(target);
    target.antiSelect = ERPC_GridForm_AntiSelect.bind(target);
}

function ERPC_GridForm_SelectAll() {
    store.dispatch(makeAction_setStateByPath(this.props.records_arr.map(r => {
        return r._key;
    }), this.props.fullPath + '.selectedValues_arr'));
}

function ERPC_GridForm_UnSelectAll() {
    store.dispatch(makeAction_setStateByPath([], this.props.fullPath + '.selectedValues_arr'));
}

function ERPC_GridForm_AntiSelect() {
    var newValues_arr = [];
    this.props.records_arr.forEach(r => {
        if (this.props.selectedValues_arr.indexOf(r._key) == -1) {
            newValues_arr.push(r._key);
        }
    });
    store.dispatch(makeAction_setStateByPath(newValues_arr, this.props.fullPath + '.selectedValues_arr'));
}

function ERPC_GridForm_RowPerPageChangedHandler(ev) {
    this.setRowPerPage(ev.target.value);
}

function ERPC_GridForm_PageIndexChangedHandler(ev) {
    this.setPageIndex(ev.target.value);
}

function ERPC_GridForm_PrePageClickHandler(ev) {
    if (this.props.pageCount > 1) {
        this.setPageIndex(this.props.pageIndex - 1);
    }
}

function ERPC_GridForm_NxtPageClickHandler(ev) {
    if (this.props.pageCount > 1) {
        this.setPageIndex(this.props.pageIndex + 1);
    }
}

function ERPC_GridForm_SetRowPerPage(value) {
    if (value == this.props.rowPerPage) {
        return;
    }
    value = parseInt(value);
    var pageCount = Math.ceil(this.props.records_arr.length / value);
    var pageIndex = this.props.pageIndex >= pageCount ? pageCount - 1 : this.props.pageIndex;
    var pageIndexChanaged = pageIndex != this.props.pageIndex;
    var formPath = MakePath(this.props.parentPath, (this.props.rowkey == null ? null : 'row_' + this.props.rowkey), this.props.id);
    store.dispatch(makeAction_setManyStateByPath({
        rowPerPage: value,
        pageIndex: pageIndex,
        pageCount: pageCount,
    }, formPath));
    if (!pageIndexChanaged && this.props.bindpagefun) {
        var self = this;
        store.dispatch(makeAction_callFunction(state => {
            self.props.bindpagefun(state, self.props.fullPath);
        }));
    }
}

function ERPC_GridForm_SetPageIndex(value) {
    value = parseInt(value);
    if (value == this.props.pageIndex) {
        return;
    }
    if (value < 0) {
        value = this.props.pageCount - 1;
    }
    else if (value >= this.props.pageCount) {
        value = 0;
    }
    SmartSetScrollTop(this.rootRef.current);
    var statePath = MakePath(this.props.parentPath, (this.props.rowkey == null ? null : 'row_' + this.props.rowkey), this.props.id, 'pageIndex');
    store.dispatch(makeAction_setStateByPath(value, statePath));
}

function ERPC_GridForm_GetRowPath(rowkey) {
    return MakePath(this.props.parentPath, this.props.id, 'row_' + rowkey);
}

function ERPC_GridForm_GetRowState(rowkey, state) {
    if (state == null) {
        state = store.getState();
    }
    var path = this.getRowPath(rowkey);
    return getStateByPath(state, path);
}
-2
function ERPC_GridForm_RoweditClicked(rowkey) {
    var rowPath = this.getRowPath(rowkey);
    var rowState = this.getRowState(rowkey);
    var rowStateShot = JSON.stringify(rowState);
    store.dispatch(makeAction_setManyStateByPath({
        editing: true,
        stateshot: rowStateShot,
    }, rowPath));
}

function ERPC_GridForm_RowcanceleditClicked(rowkey) {
    var rowPath = this.getRowPath(rowkey);
    var rowState = this.getRowState(rowkey);
    var needSetState = JSON.parse(rowState.stateshot);
    needSetState.editing = false;
    store.dispatch(makeAction_setManyStateByPath(needSetState, rowPath));
}

function ERPC_GridForm_RowdeleteClicked(rowkey) {
    var deleteBtn = this.btns.find(x => { return x.key == 'delete' });
    deleteBtn.handler(rowkey);
}

function ERPC_GridForm_RowconfirmeditClicked(rowkey) {
    var self = this;
    var rowPath = self.getRowPath(rowkey);
    var editBtn = this.btns.find(x => { return x.key == 'edit' });
    editBtn.handler(rowkey, (state) => {
        if (state == null) {
            store.dispatch(makeAction_setStateByPath(false, rowPath + '.editing'));
        }
        else {
            setStateByPath(state, rowPath + '.editing', false);
        }
    });
}


function ERPC_GridForm_ClickNewRowHandler() {
    this.setState({
        hadNewRow: true,
    });
}

function ERPC_GridForm_CancelInsert() {
    this.setState({
        hadNewRow: false,
    });
}

function ERPC_GridForm_ConfirmInsert() {
    var self = this;
    this.submitInsert(() => {
        setTimeout(() => {
            self.setState({
                hadNewRow: false,
            });
        }, 50);
    });
}

function ERPC_GridForm_SelectorClicked(rowkey) {
    var needSetState = {};
    if (this.props.selectMode == 'single') {
        needSetState[this.props.fullPath + '.selectedValue'] = rowkey;
    }
    else {
        var index = this.props.selectedValues_arr.indexOf(rowkey);
        if (index == -1) {
            needSetState[this.props.fullPath + '.selectedValues_arr'] = this.props.selectedValues_arr.concat(rowkey);
        }
        else {
            var newArr = this.props.selectedValues_arr.concat();
            newArr.splice(index, 1);
            needSetState[this.props.fullPath + '.selectedValues_arr'] = newArr;
        }
    }

    if (this.clickRowHandler) {
        this.clickRowHandler(rowkey);
    }

    store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
}

class ERPC_GridForm_BtnCol extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    clickHandler(ev) {
        if (this.props.rowkey == null) {
            return;
        }
        var key = getAttributeByNode(ev.target, 'd-key', true, 5);
        if (key == null) {
            console.warn('no key');
            return;
        }
        var btnSetting = this.props.form.btns.find(x => { return x.key == key });
        switch (key) {
            case 'edit':
                this.props.form['roweditClicked'](this.props.rowkey);
                break;
            case 'delete':
                this.props.form['rowdeleteClicked'](this.props.rowkey);
                break;
            case 'confirmedit':
                this.props.form['rowconfirmeditClicked'](this.props.rowkey);
                break;
            case 'canceledit':
                this.props.form['rowcanceleditClicked'](this.props.rowkey);
                break;
            case 'cancelInsert':
                this.props.form.cancelInsert();
                break;
            case 'confirminsert':
                this.props.form.confrimInsert();
                break;
            default:
                btnSetting.handler(this.props.rowkey);
        }
    }

    render() {
        if (this.props.rowkey == 'new') {
            return <div className='btn-group gridFormBtnsCol'>
                <button onClick={this.clickHandler} d-key='confirminsert' className='btn btn-sm btn-dark' type='button'><i className='fa fa-upload text-success' /></button>
                <button onClick={this.clickHandler} d-key='cancelInsert' className='btn btn-sm btn-dark' type='button'><i className='fa fa-close text-danger' /></button>
            </div>;
        }
        if (this.props.editing == true) {
            return <div className='btn-group gridFormBtnsCol'>
                <button onClick={this.clickHandler} d-key='confirmedit' className='btn btn-sm btn-dark' type='button'><i className='fa fa-save text-success' /></button>
                <button onClick={this.clickHandler} d-key='canceledit' className='btn btn-sm btn-dark' type='button'><i className='fa fa-close text-danger' /></button>
            </div>;
        }

        return <div className='btn-group gridFormBtnsCol'>
            {this.props.form.btns.map(btn => {
                return <button key={btn.key} onClick={this.clickHandler} d-key={btn.key} className='btn btn-sm btn-dark' type='button'>{btn.content}</button>
            })}
        </div>;
    }

}

function ERPC_GridForm_BtnCol_mapstatetoprops(state, ownprops) {
    var rowState = ownprops.form.getRowState(ownprops.rowkey);
    var editing = rowState && rowState.editing && ownprops.form.rowconfirmeditClicked != null;
    return {
        editing: editing,
    };
}

function ERPC_GridForm_BtnCol_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_GridSelectableRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
    }
    clickHandler(ev) {
        this.props.form.selectorClicked(this.props.rowkey);
        if (this.timeOutInt) {
            clearTimeout(this.timeOutInt);
            this.timeOutInt = null;
        }
    }
    onMouseDown(ev) {
        //console.log('onMouseDown');
        if (this.timeOutInt) {
            clearTimeout(this.timeOutInt);
            this.timeOutInt = null;
        }
        var form = this.props.form;
        var rowkey = this.props.rowkey;
        this.timeOutInt = setTimeout(() => {
            form.selectorClicked(rowkey);
            form.quickSelect = {};
            form.quickSelect[rowkey] = true;
        }, 200);
    }
    onMouseUp(ev) {
        var form = this.props.form;
        if (this.timeOutInt) {
            clearTimeout(this.timeOutInt);
            this.timeOutInt = null;
        }
        form.quickSelect = null;
        //console.log('onMouseUp');
    }
    onMouseOver(ev) {
        //console.log('onMouseOver');
        var form = this.props.form;
        var rowkey = this.props.rowkey;
        if (form.quickSelect && form.quickSelect[rowkey] == null) {
            form.selectorClicked(rowkey);
            form.quickSelect[rowkey] = true;
        }
    }
    render() {
        var selectMode = this.props.form.props.selectMode;
        var checked = this.props.selected;
        var selectElem = null;
        if (selectMode == 'multi') {
            selectElem = <span onClick={this.clickHandler} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onMouseEnter={this.onMouseOver} className="fa-stack">
                <i className={"fa fa-square-o fa-stack-2x"} />
                <i className={'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : '')} />
            </span>;
        }
        else if (selectMode == 'single') {
            selectElem = <span onClick={this.clickHandler} className="fa-stack">
                <i className={"fa fa-circle-o fa-stack-2x"} />
                <i className={'fa fa-stack-1x ' + (checked ? ' fa-check text-success' : '')} />
            </span>
        }
        return <tr className={checked ? 'bg-warning' : null}>
            <td className='selectorTableHeader'>{selectElem}</td>
            {this.props.children}
        </tr>;
    }
}

function ERPC_GridSelectableRow_mapstatetoprops(state, ownprops) {
    return {
    };
}

function ERPC_GridSelectableRow_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

const VisibleERPC_GridSelectableRow = ReactRedux.connect(ERPC_GridSelectableRow_mapstatetoprops, ERPC_GridSelectableRow_dispatchtorprops)(ERPC_GridSelectableRow);
const VisibleERPC_GridForm_BtnCol = ReactRedux.connect(ERPC_GridForm_BtnCol_mapstatetoprops, ERPC_GridForm_BtnCol_dispatchtorprops)(ERPC_GridForm_BtnCol);

function ERPC_Accordion_ClickHeaderHander(ev) {
    store.dispatch(makeAction_setStateByPath(!this.props.collapsed, this.props.fullPath + '.collapsed'));
}

function ERPC_Accordion_Render() {
    var bodyElem = null;
    if (this.props.visible == false) { return null; }
    if (!this.props.collapsed) {
        if (!this.props.inited) {
            this.rebind();
        }
        else {
            this.rebindging = false;
            bodyElem = <div className={'accordionBody ' + (this.props.bodyIsColumn == true ? ' flex-column' : '')} >
                {this.rednerBody()}
            </div>;
        }
    }
    switch (this.props.mode) {
        case 'listitem':
            return (<div className='erp-control erp-accrodion flex-grow-0 flex-shrink-0' userctlpath={this.props.fullPath}>
                <div className='d-flex accordion_listitemheader align-items-center' onClick={this.clickHanderHandler} >
                    <span className='flex-grow-1'>{this.props.title}</span>
                    <span className={"fa flex-grow-0 " + (this.props.collapsed ? 'fa-angle-right' : 'fa-angle-down')} />
                </div>
                {bodyElem}
            </div>);
        default:
            return (<div className='erp-control card flex-grow-0 flex-shrink-0' userctlpath={this.props.fullPath}>
                <div className='card-header pl-0 btn btn-link text-left' onClick={this.clickHanderHandler} >
                    <span className="fa-stack">
                        <i className="fa fa-square-o fa-stack-2x"></i>
                        <i className={"fa fa-stack-1x " + (this.props.collapsed ? 'fa-plus' : 'fa-minus')}></i>
                    </span>
                    {this.props.title}
                </div>
                {bodyElem}
            </div>);
    }
}

function ERPC_Accordion_Rebind() {
    var self = this;
    if (this.rebindging) {
        this.rebindging = true;
    }
    this.rebindging = true;
    this.rebindBody();
    if (typeof this.props.onUnCollapse === 'function') {
        setTimeout(() => {
            this.props.onUnCollapse(this.props.fullPath);
        }, 200);
    }
}

function ERPC_Accordion(target) {
    target.clickHanderHandler = ERPC_Accordion_ClickHeaderHander.bind(target);
    target.commonRender = ERPC_Accordion_Render.bind(target);
    target.rebind = ERPC_Accordion_Rebind.bind(target);

    return {};
}

class CBaseGridFormNavBar extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        var pageOptions_arr = [];
        for (var pi = 0; pi < this.props.pageCount; ++pi) {
            pageOptions_arr.push(<option key={pi} value={pi}>第{pi + 1}页</option>);
        }
        return (<div className='btn-group flex-shrink-0'>
            <button onClick={this.props.prePageClickHandler} type='button' className='btn btn-light flex-grow-1'><i className='fa fa-long-arrow-left' /></button>
            <button onClick={this.props.nxtPageClickHandler} type='button' className='btn btn-light flex-grow-1'><i className='fa fa-long-arrow-right' /></button>
            <select className='btn btn-light' value={this.props.rowPerPage} onChange={this.props.rowPerPageChangedHandler}>
                <option value={5}>5条/页</option>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
                <option value={200}>200条/页</option>
            </select>
            <select className='btn btn-light' value={this.props.pageIndex} onChange={this.props.pageIndexChangedHandler}>
                {pageOptions_arr}
            </select>
        </div>);
    }
}

function BaseIsValueValid(nowState, visibleBelongState, ctlState, value, valueType, nullable, ctlID, validErrState, basePath) {
    if (visibleBelongState && visibleBelongState.visible == false) {
        // not visible is always valid
        return null;
    }
    if (ctlState != null) {
        if (ctlState.fetching) {
            return '等待通讯完成';
        }
        else if (ctlState.fetchingErr) {
            return ctlState.fetchingErr.info;
        }
        if (ctlState.uploaders) {
            if (nullable != true && ctlState.uploaders.length == 0) {
                return '请至少上传一个附件';
            }
            if (ctlState.uploaders.find(x => { return x.state != EFileUploaderState.COMPLETE }) != null) {
                return '请等待附件上传完毕';
            }
        }
        else if (ctlState.uploader) {
            if (ctlState.uploader.state == EFileUploaderState.WAITFILE) {
                if (isNaN(ctlState.fileID)) {
                    if (nullable != true) {
                        return '请上传文件';
                    }
                }
            }
            else if (ctlState.uploader.state != EFileUploaderState.COMPLETE) {
                return '等待完成';
            }
        }
    }
    if (nullable != true && IsEmptyString(value)) {
        return gCantNullInfo;
    }
    switch (valueType) {
        case 'int':
        case 'float':
            if (isNaN(value)) {
                return '必须是数字';
            }
            break;
        case 'date':
        case 'datetime':
            if (!checkDate(value)) {
                return '不是有效的日期格式';
            }
            break;
        case 'time':
            if (!checkTime(value)) {
                return '不是有效的时间格式';
            }
    }
    if (gCusValidChecker_map[ctlID]) {
        return gCusValidChecker_map[ctlID](value, nowState, validErrState, basePath);
    }
    return null;
}

var gCToastMangerRef = React.createRef();
var gCMessageBoxMangerRef = React.createRef();
function SendToast(info, type, timeTime) {
    if (isProduction && isInDingTalk) {
        var toastData = {
            icon: '',
            text: info,
            duration: timeTime = null ? EToastTime.Small : timeTime,
            delay: 0,
        }
        switch (type) {
            case EToastType.Warning:
                toastData.icon = isMobile ? 'error' : 'warning';
                break;
            case EToastType.Error:
                toastData.icon = isMobile ? 'error' : 'error';
                break;
            default:
                toastData.icon = 'success';
                break;
        }
        dingdingKit.device.notification.toast(toastData);
        return;
    }
    if (gCToastMangerRef.current) {
        gCToastMangerRef.current.toast(info, type, timeTime)
    }
    else {
        console.warn('gCToastMangerRef为空');
    }
}

function PopMessageBox(text, type, title, btns, callBack) {
    if (gCMessageBoxMangerRef.current) {
        var msg = new MessageBoxItem(text, type, title, btns, callBack);
        gCMessageBoxMangerRef.current.addMessage(msg);
        return msg;
    }
    else {
        console.warn('gCMessageBoxMangerRef为空');
    }
}

const EToastTime = {
    Normal: 5,
    Long: 10,
    Small: 3,
};

const EToastType = {
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
};

class CToastManger extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            msg_arr: [],
        };
        this.ticker = null;
        this.msgID = 0;
    }

    toast(info, type, timeTime) {
        if (info.length > 50) {
            info = info.substr(0, 50) + '……';
        }
        var newMsg = {
            text: info,
            timeType: timeTime == null ? EToastTime.Normal : timeTime,
            type: type == null ? EToastType.Info : type,
        };
        newMsg.id = this.msgID++;
        this.setState({
            msg_arr: this.state.msg_arr.concat(newMsg),
        });
    }

    tickHandler() {
        var msg_arr = this.state.msg_arr;
        var new_arr = [];
        msg_arr.forEach(msg => {
            if (msg.time == null) {
                msg.time = msg.timeType;
                msg.opacity = 1;
            }
            else {
                msg.time -= 0.2;
                if (msg.time <= 1) {
                    msg.opacity = 0;
                }
            }
            if (msg.time > 0) {
                new_arr.push(msg);
            }
        });
        this.setState({
            msg_arr: new_arr,
        });
    }

    render() {
        var msg_arr = this.state.msg_arr;
        if (msg_arr.length == 0) {
            if (this.ticker) {
                clearInterval(this.ticker);
                this.ticker = null;
            }
            return null;
        }
        if (this.ticker == null) {
            this.ticker = setInterval(this.tickHandler, 200);
        }
        return (<div className='toastMsgContainer'>
            {
                msg_arr.map((msg, index) => {
                    return <div key={msg.id} type={msg.type} className='toastMsg bg-light rounded shadow' style={{ opacity: (msg.opacity == null ? 0 : msg.opacity) }}>{msg.text}</div>
                })
            }
        </div>);
    }
}

const EMessageBoxType = {
    Tip: 'tip',
    Warning: 'warning',
    Error: 'error',
    Loading: 'loading',
    Blank: 'blank',
    Custom: 'custom',
};

const EMessageBoxBtnType = {
    Ok: {
        label: '确认',
        key: 'OK',
        class: 'btn btn-success',
    },
    Aware: {
        label: '知道了',
        key: 'OK',
        class: 'btn btn-info',
    },
    Cancel: {
        label: '取消',
        key: 'CANCEL',
        class: 'btn btn-danger',
    },
};

class MessageBoxItem {
    constructor(text, type, title, btns, callBack) {
        this.type = type;
        this.text = text;
        this.btns = btns;
        this.title = title;
        this.callBack = callBack;
        this.dataVersion = 0;
    }

    setData(text, type, title, btns) {
        var changed = false;
        if (type != this.type) {
            this.type = type;
            changed = true;
        }
        if (text != this.text) {
            this.text = text;
            changed = true;
        }
        if (title != this.title) {
            this.title = title;
            changed = true;
        }
        if (btns != this.btns) {
            this.btns = btns;
            changed = true;
        }
        if (changed) {
            if (this.manager) {
                this.manager.addMessage(this);
            }
            this.dataVersion += 1;
            this.fireChanged();
        }
    }

    fireChanged() {
        this.hidden = false;
        if (this.changedAct != null) {
            this.changedAct();
        }
        else {
            this.manager.redraw();
        }
    }

    fireClose() {
        this.manager.delete(this);
    }

    fireHide() {
        this.hidden = true;
        this.manager.redraw();
    }

    fireShow() {
        this.hidden = false;
        this.manager.redraw();
    }

    setType(val) {
        this.type = val;
        this.fireChanged();
    }

    setText(val) {
        this.text = val;
        this.fireChanged();
    }

    setTitle(val) {
        this.title = val;
        this.fireChanged();
    }

    setBtns(val) {
        this.btns = val;
        this.fireChanged();
    }

    query(tip, btns_arr, callBack) {
        this.text = tip;
        this.btns = btns_arr;
        this.callBack = callBack;
        this.type = EMessageBoxType.Tip;
        this.fireChanged();
    }

    custom(cusElem, closeable, callBack) {
        this.btns = [];
        if (closeable) {
            this.btns.push({ label: '关闭', key: 'CLOSE' });
        }
        this.callBack = callBack;
        this.type = EMessageBoxType.Custom;
        this.cusElem = cusElem;
        this.fireChanged();
    }
}

class CMessageBox extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.props.msgItem.changedAct = this.msgItemChanedHandler;
    }

    msgItemChanedHandler(ev) {
        this.setState({
            magicObj: {},
            hidden: false,
        });
    }

    componentWillUnmount() {
        this.props.msgItem.changedAct = null;

        if (this.timeInt) {
            clearInterval(this.timeInt);
            this.timeInt = null;
        }
    }

    timerHander(ev) {
        var now = (new Date()).getTime();
        var pssSec = Math.round((now - this.startTime) / 100) / 10;
        this.setState({
            passSec: pssSec,
        });
    }

    clickBtnHandler(ev) {
        var msgItem = this.props.msgItem;
        var autoClose = true;
        var olddataVersion = msgItem.dataVersion;
        if (msgItem.callBack) {
            if (msgItem.callBack(ev.target.getAttribute('d-type')) == false) {
                autoClose = false;
            }
        }
        if (autoClose && olddataVersion == msgItem.dataVersion) {
            msgItem.fireClose();
        }
    }

    render() {
        var msgItem = this.props.msgItem;
        var type = msgItem.type;

        var contentElem = null;
        var headerElem = null;
        var btnsElem = null;

        if (type == EMessageBoxType.Loading) {
            var passSec = 0;
            if (this.timeInt == null) {
                this.startTime = (new Date()).getTime();
                this.timeInt = setInterval(this.timerHander, 200);
            }
            else {
                passSec = this.state.passSec;
            }
            headerElem = (<span>{msgItem.title}<span className='badge badge-primary'>处理中</span><i className='fa fa-spinner fa-spin' />{passSec}s</span>);
            contentElem = (<p className='messageBoxContent'>{msgItem.text}</p>);
        }
        else {
            if (this.timeInt != null) {
                clearInterval(this.timeInt);
                this.timeInt = null;
            }
            switch (type) {
                case EMessageBoxType.Tip:
                    headerElem = (<span><span className='badge badge-info'>信息</span>{msgItem.title}</span>);
                    break;
                case EMessageBoxType.Error:
                    headerElem = (<span><span className='badge badge-danger'>错误</span>{msgItem.title}</span>);
                    btnsElem = (<button type='button' className='btn btn-danger'>了解</button>);
                    break;
                case EMessageBoxType.Warning:
                    headerElem = (<span><span className='badge badge-warning'>警告</span>{msgItem.title}</span>);
                    btnsElem = (<button type='button' className='btn btn-warning'>了解</button>);
                    break;
                case EMessageBoxType.Custom:
                    headerElem = (<span><span className='badge badge-warning'>信息</span>{msgItem.title}</span>);
                    contentElem = msgItem.cusElem;
                    break;
            }
            if (msgItem.btns == null) {
                btnsElem = (<button onClick={this.clickBtnHandler} d-type={EMessageBoxBtnType.Aware.key} type='button' className={EMessageBoxBtnType.Aware.class}>{EMessageBoxBtnType.Aware.label}</button>);
            }
            else {
                btnsElem = msgItem.btns.map(btn => {
                    return (<button onClick={this.clickBtnHandler} key={btn.label} d-type={btn.key} type='button' className={btn.class == null ? 'btn btn-light' : btn.class}>{btn.label}</button>);
                });
            }
            if (contentElem == null) {
                contentElem = (<p className='messageBoxContent'>{msgItem.text}</p>);
            }
			/*
			iconElem = <i className='fa fa-window-close text-danger' />
			times-circle
			exclamation-circle
			commenting
			*/
        }

        return (<div className="messageBox autoScroll_Touch" tabIndex="-1" role="dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{headerElem}</h5>
                </div>
                <div className="modal-body">
                    {contentElem}
                </div>
                <div className="modal-footer">
                    {btnsElem}
                </div>
            </div>
        </div>);
    }
}

class CMessageBoxManger extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            msg_arr: [],
        };
        this.msgID = 0;
    }

    addMessage(msgItem) {
        if (this.state.msg_arr.indexOf(msgItem) != -1) {
            return;
        }
        msgItem.manager = this;
        this.setState({
            msg_arr: this.state.msg_arr.concat(msgItem),
        });
    }

    delete(item) {
        var newarr = this.state.msg_arr.filter(msg => { return item != msg; });
        this.setState({
            msg_arr: newarr,
        });
    }

    redraw() {
        this.setState({
            magicObj: {},
        });
    }

    render() {
        var visibleMsg_arr = this.state.msg_arr.filter(x => { return !x.hidden && x.type != EMessageBoxType.Blank; });
        if (visibleMsg_arr.length == 0) {
            return null;
        }
        return (<div className='messageBoxMask'>
            {
                visibleMsg_arr.map((msg, index) => {
                    return <CMessageBox key={1} msgItem={msg} manager={this} />
                })
            }
        </div>);
    }
}

function WeakIFrameOnloadHandler(ev) {
    DebugApp('weakFrameLoaded');
    ev.target.contentWindow.gPageInFrame = true;
    ev.target.contentWindow.gWeakParentFrame = window;
    ev.target.contentWindow.gParentDingKit = dingdingKit;
    ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
}

var gWaitingLoadIFrames_arr = [];
function AddIFrameOnloadWatch(frameRef, frameParent, isWeak, loadCallBack) {
    var dataItem = gWaitingLoadIFrames_arr.find(x => {
        return x.frameRef == frameRef;
    });
    if (dataItem == null) {
        dataItem = {
            frameRef: frameRef,
            frameParent: frameParent,
            isWeak: isWeak,
            tryTime: 0,
            loadCallBack: loadCallBack,
        };
        gWaitingLoadIFrames_arr.push(dataItem);
    }
    else {
        dataItem.frameParent = frameParent;
        dataItem.isWeak = isWeak;
        dataItem.loadCallBack = loadCallBack;
    }
}

function FrameLoaded(theWindow, debugFun) {
    debugFun('gWaitingLoadIFrames_arr:' + gWaitingLoadIFrames_arr.length);
    var dataItem = gWaitingLoadIFrames_arr.find(data => {
        var frameWindow = data.frameRef.current ? data.frameRef.current.contentWindow : null;
        return frameWindow == theWindow;
    });
    if (dataItem) {
        debugFun('found');
        theWindow.gPageInFrame = true;
        theWindow.gParentDingKit = dingdingKit;
        theWindow.gParentIsInDingTalk = isInDingTalk;
        if (dataItem.isWeak) {
            theWindow.gWeakParentFrame = dataItem.frameParent;
        }
        else {
            theWindow.gParentFrame = dataItem.frameParent;
        }
        gWaitingLoadIFrames_arr = gWaitingLoadIFrames_arr.filter(x => {
            return x != dataItem;
        });
        if (dataItem.loadCallBack) {
            var callBack = dataItem.loadCallBack;
            setTimeout(() => {
                callBack();
            }, 1000);
        }
        return;
    }
    debugFun('not found');
}
/*
function CheckIFrameLoadState(){
    DebugApp('CheckIFrameLoadState');
    var newArr = [];
    gWaitingLoadIFrames_arr.forEach(data=>{
        var needAdd = true;
        var frameWindow = data.frameRef.current ? data.frameRef.current.contentWindow : null;
        if(frameWindow != null && frameWindow.document != null){
            if(frameWindow.document.readyState == 'complete'){
                needAdd = false;
                ++data.tryTime;
                if(frameWindow.gDingDingIniting == null){
                    needAdd = data.tryTime < 3;
                }
                else if(frameWindow.gDingDingIniting == false){
                    if(frameWindow.gInitDingCallBack == null){
                        needAdd = true;
                    }
                    else{
                        frameWindow.gPageInFrame = true;
                        frameWindow.gParentDingKit = dingdingKit;
                        frameWindow.gParentIsInDingTalk = isInDingTalk;
                        if(data.isWeak){
                            frameWindow.gWeakParentFrame = data.frameParent;
                        }
                        else{
                            frameWindow.gParentFrame = data.frameParent;
                        }
                        frameWindow.ActiveDing();
                    }
                }
            }
        }
        if(needAdd){
            newArr.push(data);
        }
    });
    gWaitingLoadIFrames_arr = newArr;
    if(newArr.length > 0){
        setTimeout(CheckIFrameLoadState, 1000);
    }
}
*/

function AddPageToFrameSet(state, ctlpath, title, pageCode, pageName, stepCode, stepData, closeable) {
    var hadState = state != null;
    state = hadState ? state : store.getState();
    var ctlState = getStateByPath(state, ctlpath, {});
    var nowItems_arr = ctlState.items_arr == null ? [] : ctlState.items_arr.concat();
    var itemKey = pageCode + (stepCode == null ? '' : '-' + stepCode);
    var sameKeyItem = nowItems_arr.find(item => { return item.key == itemKey; });

    if (sameKeyItem != null) {
        sameKeyItem.title = title;
        sameKeyItem.stepCode = stepCode;
        sameKeyItem.stepData = stepData;
    }

    if (sameKeyItem == null) {
        sameKeyItem = {
            pageCode: pageCode,
            pageName: pageName,
            stepCode: stepCode,
            stepData: stepData,
            title: title,
            key: itemKey,
            closeable: closeable,
            iframeRef: React.createRef(),
        };
        nowItems_arr.push(sameKeyItem);
    }
    var pagesrc = window.location.origin + getPagePath(pageName, stepCode, stepData);
    sameKeyItem.contentElem = <iframe ref={sameKeyItem.iframeRef} src={pagesrc} className='w-100 h-100' frameBorder='0' onLoad={WeakIFrameOnloadHandler} ></iframe>;
    AddIFrameOnloadWatch(sameKeyItem.iframeRef, window, true);
    var needSetState = {
        selectedKey: itemKey,
        items_arr: nowItems_arr,
    };
    if (hadState) {
        setManyStateByPath(state, ctlpath, needSetState);
    }
    else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ctlpath));
    }
}

class ERPC_FrameSet extends React.PureComponent {
    constructor(props) {
        super(props);
        this.headerItemStyle = { minWidth: '6em' };
        this.clickCloseHandler = this.clickCloseHandler.bind(this);
        this.clickHeaderHandler = this.clickHeaderHandler.bind(this);
    }

    clickCloseHandler() {
        var newItems_arr = [];
        var pos = 0;
        this.props.items_arr.forEach((item, index) => {
            if (item.key != this.props.selectedKey) {
                newItems_arr.push(item);
            }
            else {
                pos = index;
            }
        });
        var newSelectedValue = null;
        if (pos < newItems_arr.length) {
            newSelectedValue = newItems_arr[pos].key;
        }
        else if (newItems_arr.length > 0) {
            newSelectedValue = newItems_arr[newItems_arr.length - 1].key;
        }
        store.dispatch(makeAction_setManyStateByPath({
            selectedKey: newSelectedValue,
            items_arr: newItems_arr,
        }, this.props.fullPath));
    }

    clickHeaderHandler(ev) {
        var key = getAttributeByNode(ev.target, 'd-key');
        if (key == this.props.selectedKey) {
            return;
        }
        store.dispatch(makeAction_setStateByPath(key, MakePath(this.props.fullPath, 'selectedKey')));
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var itemsElem_arr = [];
        var selectedKey = this.props.selectedKey;
        var items_arr = this.props.items_arr;
        var selectedItem = null;
        if (items_arr != null) {
            if (selectedKey == null) {
                if (items_arr.length > 0) {
                    selectedKey = items_arr[0].key;
                }
            }
            itemsElem_arr = items_arr.map(item => {
                var isSelected = item.key == selectedKey;
                var btnElem = <button d-key={item.key} onClick={this.clickHeaderHandler} key={item.key} type='button' className={'btn btn-sm rounded-0 btn-' + (isSelected ? 'light' : 'secondary')} style={this.headerItemStyle}>{item.title}</button>;
                if (isSelected && item.closeable != false) {
                    selectedItem = item;
                    return [btnElem,
                        <button onClick={this.clickCloseHandler} key='close' type='button' className='btn btn-sm btn-light fa fa-close text-secondary rounded-0' ></button>
                    ];
                }
                return btnElem;
            });
        }
        return <div className={'d-flex flex-column ' + (this.props.className == null ? '' : this.props.className)} style={this.props.style} >
            <div className='btn-group bg-secondary flex-grow-0 flex-shrink-0' style={{ minHeight: '2em' }}>
                {itemsElem_arr}
            </div>
            {items_arr && items_arr.map(item => {
                return <div key={item.key} className={'w-100 h-100' + (item == selectedItem ? '' : ' d-none')}>{item.contentElem}</div>
            })}
        </div>
    }
}

function ERPC_FrameSet_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        items_arr: ctlState.items_arr,
        selectedKey: ctlState.selectedKey,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_FrameSet_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_TopLevelFrame extends React.PureComponent {
    constructor(props) {
        super(props);
        this.style = {
            left: '0px',
            top: '0px',
            zIndex: 10000,
        };
        this.state = {
            srcs_arr: [],
            states_arr: [],
            useSrc: null,
            useState: null,
        };
        this.onloadHandler = this.onloadHandler.bind(this);
        this.onErrorHandler = this.onErrorHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.push = this.push.bind(this);
        this.pop = this.pop.bind(this);
        this.iframeRef = React.createRef();
    }

    push(src, oldPageState, onMessageFun) {
        if (this.state.srcs_arr.length > 0 && this.state.srcs_arr[this.state.srcs_arr.length - 1] == src) {
            return;
        }
        if (this.state.srcs_arr.length == 0) {
            oldPageState = null;    // 宿主页面的state不用保存
            this.onMessageFun = onMessageFun;
        }
        this.setState({
            srcs_arr: this.state.srcs_arr.concat(src),
            states_arr: this.state.states_arr.concat(oldPageState),
            useSrc: src,
            useState: null,
        });
    }

    pop() {
        var newsrcs_arr = this.state.srcs_arr.concat();
        var newstates_arr = this.state.states_arr.concat();
        newsrcs_arr.pop();
        var useSrc = newsrcs_arr.length == 0 ? null : newsrcs_arr[newsrcs_arr.length - 1];
        var useState = newstates_arr.pop();
        this.setState({
            srcs_arr: newsrcs_arr,
            states_arr: newstates_arr,
            useState: useState,
            useSrc: useSrc,
            err: null,
        });
    }

    close() {
        this.onMessageFun = null;
        this.setState({
            srcs_arr: [],
            states_arr: [],
            useSrc: null,
            useState: null,
            err: null,
        });
    }

    sendMessage(msgtype, data) {
        if (this.onMessageFun) {
            this.onMessageFun(msgtype, data);
        }
    }

    getUseState() {
        return this.state.useState;
    }

    onloadHandler(ev) {
        DebugApp('frameLoaded');
        try {
            ev.target.contentWindow.gPageInFrame = true;
            ev.target.contentWindow.gParentFrame = this;
            ev.target.contentWindow.gParentDingKit = dingdingKit;
            ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
        }
        catch (eo) {
            DebugApp(ep.toString());
            this.setState({
                err: JSON.stringify(eo)
            });
        }
    }

    onErrorHandler(ev) {
        alert(JSON.stringify(ev));
        this.pop();
    }

    render() {
        if (this.state.useSrc == null) {
            return null;
        }
        if (this.state.err != null) {
            return <div className='position-fixed border rounded bg-light w-100 h-100' style={this.style} >
                <button className='btn btn-danger' onClick={this.pop}><i className='fa fa-close' /></button>
                {this.state.err}
            </div>;
        }
        AddIFrameOnloadWatch(this.iframeRef, this, false);
        return <div className='position-fixed border rounded bg-light w-100 h-100' style={this.style} >
            <iframe ref={this.iframeRef} src={this.state.useSrc} className='w-100 h-100' frameBorder='0' onLoad={this.onloadHandler} onError={this.onErrorHandler} ></iframe>
        </div>;
    }
}

class ERPC_IFrame extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onloadHandler = this.onloadHandler.bind(this);
        this.onErrorHandler = this.onErrorHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.trySendMsg = this.trySendMsg.bind(this);
        this.frameRef = React.createRef();
        this.tryIntval = null;
        this.tryCount = 0;
    }

    sendMessage(msgtype, data) {
        if (this.props.onMessageFun) {
            this.props.onMessageFun(msgtype, data, this.props.fullPath);
        }
    }

    onloadHandler(ev) {
        DebugApp('frameLoaded');
        try {
            ev.target.contentWindow.gPageInFrame = true;
            ev.target.contentWindow.gWeakParentFrame = this;
            ev.target.contentWindow.gParentDingKit = dingdingKit;
            ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
        }
        catch (eo) {
            DebugApp(eo.toString());
            this.setState({
                err: JSON.stringify(eo)
            });
        }
    }

    componentWillUnmount() {
        if (this.tryIntval != null) {
            clearTimeout(this.tryIntval);
            this.tryIntval = null;
        }
    }

    onErrorHandler(ev) {
        alert(JSON.stringify(ev));
    }

    trySendMsg(needDelay) {
        var self = this;
        if (this.props.msg == null) {
            return;
        }
        //console.log('trySendMsg:' + JSON.stringify(this.props.msg));
        var sendOK = false;
        if (this.frameRef.current != null) {
            var frameContentWindow = this.frameRef.current.contentWindow;
            if (frameContentWindow.gDingDingIniting && frameContentWindow.DistpathMsgFromParent) {
                frameContentWindow.DistpathMsgFromParent(this.props.msg.type, this.props.msg.data);
                sendOK = true;
            }
        }
        ++this.tryCount;
        //console.log('sendOK:' + sendOK + '  c:' + this.tryCount);
        if (this.tryCount >= 50) {
            //console.log('clear');
            sendOK = true;
        }
        if (!sendOK) {
            if (this.tryIntval == null) {
                this.tryIntval = setTimeout(() => {
                    self.tryIntval = null;
                    self.trySendMsg();
                }, 200);
            }
        }
        else {
            this.tryCount = 0;
            if (needDelay) {
                setTimeout(() => {
                    store.dispatch(makeAction_setStateByPath(null, this.props.fullPath + '.msg'));
                }, 20);
            }
            else {
                store.dispatch(makeAction_setStateByPath(null, this.props.fullPath + '.msg'));
            }
        }
    }

    render() {
        if (this.props.src == null || this.props.src.length == 0) {
            return null;
        }
        this.trySendMsg(true);
        AddIFrameOnloadWatch(this.frameRef, this, true, this.trySendMsg);
        return <div className={this.props.className + (this.props.visible == false ? ' invisible' : '')} style={this.props.style} >
            <iframe ref={this.frameRef} src={this.props.src} className='w-100 h-100 flex-grow-1 flex-shrink-1' frameBorder='0' onLoad={this.onloadHandler} onError={this.onErrorHandler} ></iframe>
        </div>;
    }
}

function ERPC_IFrame_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var proj = ctlState.proj ? ctlState.proj : ownprops.proj;
    var usesrc = null;
    if (proj != null) {
        var flowCode = ctlState.flowCode ? ctlState.flowCode : ownprops.flowCode;
        var flowData = ctlState.flowData ? ctlState.flowData : ownprops.flowData;
        usesrc = getPagePath(proj, flowCode, flowData);
    }

    return {
        visible: ctlState.visible,
        src: usesrc,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        msg: ctlState.msg,
    };
}

function ERPC_IFrame_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class CGridFormSelectCog extends React.PureComponent {
    constructor(props) {
        super(props);
        this.clickSelectAll = this.clickSelectAll.bind(this);
        this.clickUnSelectAll = this.clickUnSelectAll.bind(this);
        this.clickAntiSelect = this.clickAntiSelect.bind(this);
        this.divStyle = {
            width: '5em',
        }
        this.popperBtnRef = React.createRef();
    }

    clickSelectAll() {
        this.props.form.selectAll();
        if (this.popperBtnRef.current) {
            this.popperBtnRef.current.close();
        }
    }

    clickUnSelectAll() {
        this.props.form.unSelectAll();
        if (this.popperBtnRef.current) {
            this.popperBtnRef.current.close();
        }
    }

    clickAntiSelect() {
        this.props.form.antiSelect();
        if (this.popperBtnRef.current) {
            this.popperBtnRef.current.close();
        }
    }

    render() {
        if (this.props.form == null) {
            return null;
        }
        return <ERPC_PopperBtn ref={this.popperBtnRef} className='btn btn-sm fa fa-cog' popperclassname='d-flex flex-column bg-light btn-group btn-group-vertical' hideCloseBtn={true} anchor='bottom' >
            <button type='button' className='btn btn-light' onClick={this.clickSelectAll}>全选</button>
            <button type='button' className='btn btn-light' onClick={this.clickUnSelectAll}>全不选</button>
            <button type='button' className='btn btn-light' onClick={this.clickAntiSelect}>反选</button>
        </ERPC_PopperBtn>
    }
}


const ERPXMLToolKit = {
    createDocFromString: (xmlString) => {
        var xmlDoc = null;
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlString, "text/xml");
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlString);
        }
        return xmlDoc;
    },

    extractColumn: (xmldoc, colIndex) => {
        var rlt = [];
        if (typeof xmldoc === 'string' && xmldoc[0] == '<') {
            xmldoc = ERPXMLToolKit.createDocFromString(xmldoc);
        }
        if (xmldoc == null || xmldoc.childNodes.length == 0) {
            return rlt;
        }
        var rootNode = xmldoc.childNodes[0];
        rootNode.childNodes.forEach(node => {
            if (node.nodeType != 1) {
                return;
            }
            var val = node.attributes['f' + colIndex];
            if (val != null) {
                rlt.push(val.value);
            }
            //console.log(val.value);
        });
        return rlt;
    },

    convertToXmlString: (item_arr, attrs_arr) => {
        if (item_arr == null || item_arr.length == 0) {
            return '';
        }
        if (attrs_arr.length == 0) {
            console.error('convertToXmlString attrs_arr length==0');
        }
        var itemStr_arr = item_arr.map(item => {
            var itemType = typeof item;
            var valueStr = '';
            if (itemType === 'string' || itemType === 'number') {
                valueStr = '<Item f1="' + item + '" />';
            }
            else {
                valueStr = '<Item ';
                attrs_arr.forEach((attrName, i) => {
                    var fName = 'f' + (i + 1);
                    valueStr += (i == 0 ? '' : ' ') + fName + '="' + item[attrName] + '"';
                });
                valueStr += ' />'
            }
            return valueStr;
        });
        var rltStr = '<Data fNum="' + attrs_arr.length + '"';
        attrs_arr.forEach((name, i) => {
            rltStr += ' f' + (i + 1) + '="' + name + '"';
        });
        rltStr += '>' + itemStr_arr.join('') + '</Data>';
        return rltStr;
    }
}

function getPageEntryParam(pageid, paramName, defValue) {
    var entryObj = gDataCache.get(pageid + 'entryParam');
    if (entryObj == null || entryObj[paramName] == null) {
        return defValue;
    }
    return entryObj[paramName];
}

function ERPC_ListForm(target) {

}

function toRad(d) {
    return d * Math.PI / 180.0;
}

function GetDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = toRad(lat1);
    var radLat2 = toRad(lat2);
    var a = radLat1 - radLat2;
    var b = toRad(lng1) - toRad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137;
    s = Math.floor(s * 10000) / 10000;
    return s;
}

function GetFromatRowKey(rowkey) {
    if (typeof rowkey == 'number') {
        return rowkey;
    }
    if (!isNaN(rowkey)) {
        return parseInt(rowkey);
    }
    return rowkey;
}

function GenFormXmlData(formState, getRowItemFun, xmlconfig, keyColumn, formPath, splitChar = '', onlySelected = false) {
    var state = store.getState();
    var records_arr = formState.records_arr;
    var xmlHeadStr = '<Data fNum="' + xmlconfig.colcount + '"';
    var i;
    var cols_arr = [];
    var rlt = {
        xml: null,
        count: 0,
        text: null,
        textarr: null,
        isValid: false,
    };
    for (i = 1; i <= xmlconfig.colcount; ++i) {
        var colName = xmlconfig['col' + i];
        xmlHeadStr += ' f' + i + '="' + colName + '"';
        cols_arr.push({
            index: i,
            name: colName,
        });
    }
    xmlHeadStr += '>'
    if (records_arr == null || records_arr.length == 0) {
        rlt.xml = xmlHeadStr + '</Data>';
        rlt.isValid = true;
        return rlt;
    }
    var textStr = '';
    var itemStrs_arr = [];
    var rowText_arr = [];
    var count = 0;
    var selectedValues_arr = formState.selectedValues_arr
    for (var ri = 0; ri < records_arr.length; ++ri) {
        var record = records_arr[ri];
        var rowKey = keyColumn == '_default' ? ri : record[keyColumn];
        if(onlySelected && selectedValues_arr && selectedValues_arr.indexOf(rowKey) == -1){
            continue;
        }
        var rowState = formState['row_' + rowKey];
        if (rowState == null || rowState._isdirty) {
            return rlt;
        }
        var rowItem = getRowItemFun(state, rowState, formPath + '.row_' + rowKey, record);
        if (rowItem == null) {
            return rlt;
        }
        if (rowItem.rowtext) {
            textStr += rowItem.rowtext;
            rowText_arr.push(rowItem.rowtext);
        }
        ++count;
        var itemStr = '<Item'
        cols_arr.forEach(col => {
            itemStr += ' f' + col.index + '="' + (rowItem[col.name] == null ? '' : rowItem[col.name]) + '"';
        });
        itemStr += ' />'
        itemStrs_arr.push(itemStr);
    }
    //console.log(xmlHeadStr + itemStrs_arr.join('') + '</Data>');
    rlt.textarr = rowText_arr;
    rlt.xml = xmlHeadStr + itemStrs_arr.join(splitChar) + '</Data>';
    rlt.count = count;
    rlt.text = textStr;
    rlt.isValid = true;
    return rlt;
}

function GenFormJSONData(formState, getRowItemFun, formPath, headers) {
    var records_arr = formState.records_arr;
    var i;
    var rlt = {
        json: null,
        count: 0,
    };
    if (records_arr == null || records_arr.length == 0) {
        return rlt;
    }
    var rows_arr = [];
    for (var ri = 0; ri < records_arr.length; ++ri) {
        var record = records_arr[ri];
        var rowItem = getRowItemFun(formPath, record);
        if (rowItem != null) {
            rows_arr.push(rowItem);
        }
    }
    //console.log(xmlHeadStr + itemStrs_arr.join('') + '</Data>');
    rlt.json = {
        headers: headers,
        rows: rows_arr,
    };
    rlt.count = rows_arr.length;
    return rlt;
}

class Component_FileDownLoadIcon extends React.PureComponent {
    constructor(props) {
        super(props);
        this.style = {};
    }

    clickCloseHandler() {

    }

    render() {
        var fileAidData = getRenderAidDataFromFileType(this.props.fileType);
        return <div className='d-flex flex-column' style={this.style} >
            <a href={this.props.href} download={this.props.fileName}>
                <i className={'fa fa-5x ' + fileAidData.fileIconType} />
                <div>{this.props.fileName}</div>
            </a>
            <div>若下载没有自动开始，请点击链接或右键另存为来手动下载。</div>
        </div>
    }
}

function gStartExcelExport(bundle, msgItem, callBack) {
    store.dispatch(fetchJsonPost(fileSystemUrl,
        { bundle: bundle, action: 'exportExcelFileFromJson', }, makeFTD_Callback((state, ret_data, ret_err) => {
            if (ret_err) { return callBack(state, null, ret_err); }
            var fileIdentity = ret_data;
            var queryFileState = (state, ret_data, ret_err) => {
                if (state == null) {
                    ret_data = {
                        state: 0,
                    };
                }
                if (ret_data.state == 0) {
                    setTimeout(() => {
                        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { fileIdentity: fileIdentity }, action: 'queryExcelFileState', }, makeFTD_Callback(queryFileState)));
                    }, 1000);
                }
                else if (ret_data.state == 2) {
                    callBack(state, null, { info: ret_data.stateinfo });
                }
                else if (ret_data.state == 1) {
                    var fileUrl = window.location.origin + ret_data.url;
                    gExcelExported(fileUrl, bundle.title + '.xlsx', msgItem, callBack, fileIdentity);
                }
            };
            msgItem.setText('文件生成中');
            setTimeout(() => {
                queryFileState();
            }, 2000);
        }, false)));
}

function gExcelExported(fileUrl, fileName, msgItem, callBack, fileIdentity) {
    if (isInDingTalk) {
        if (!isMobile) {
            dingdingKit.biz.util.isLocalFileExist({
                params: [{ url: fileUrl }],
                onSuccess: function (result) {
                    if (result[0].isExist) {
                        dingdingKit.biz.util.openLocalFile({
                            url: fileUrl, //本地文件的url，指的是调用DingTalkPC.biz.util.downloadFile接口下载时填入的url，配合DingTalkPC.biz.util.downloadFile使用
                            onSuccess: function (result) {
                            },
                            onFail: function () { }
                        });
                    }
                    else {
                        dingdingKit.biz.util.downloadFile({
                            url: fileUrl, //要下载的文件的url
                            name: fileName, //定义下载文件名字
                            onProgress: function (msg) {
                            },
                            onSuccess: function (result) {
                                dingdingKit.biz.util.openLocalFile({
                                    url: fileUrl,
                                    onSuccess: function (result) {
                                    },
                                    onFail: function () { }
                                });
                            },
                            onFail: function () { }
                        });
                    }
                },
                onFail: function () { }
            });
        }
        else {
            dingdingKit.biz.util.openLink({
                url: fileUrl,
            });
        }
    }
    else {
        window.open(fileUrl, '_self');
    }
    msgItem.custom(<Component_FileDownLoadIcon href={fileUrl} fileName={fileName} fileType='excel' />, true, () => {
        if (callBack != null) {
            callBack(null, fileIdentity, null);
        }
    });
}

function gWaitLongProcess(msgItem, key, callBack) {
    var queryProcess = (state, ret_data, ret_err) => {
        if (ret_data != null || ret_err != null) {
            callBack(state, ret_data, ret_err);
            return;
        }
        setTimeout(() => {
            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { key: key }, action: 'queryLongProcessResult', }, makeFTD_Callback(queryProcess)));
        }, 1000);
    };
    msgItem.setText('正在等待一个耗时的后台操作');
    setTimeout(() => {
        queryProcess();
    }, 2000);
}

class FormColumnFilter{
    constructor(name, setting){
        this.name = name;
        this.setting = setting;
        this.bAll = true;
        this.selectedValues = {};
    }

    getValues(useCache){
        return this.setting.getColumnValues(this, useCache);
    }

    selectAll(){
        this.bAll = true;
        this.setting.filterChanged(this);
    }

    unSelectAll(){
        this.bAll = false;
        this.selectedValues = {};
        this.setting.filterChanged(this);
    }

    toggleSelect(value){
        var values_arr = this.getValues();
        if(this.bAll){
            /*
            this.selectedValues = {};
            values_arr.forEach(x=>{
                this.selectedValues[x] = true;
            });
            */
           this.selectedValues = {};
            this.bAll = false;
        }
        this.selectedValues[value] = !this.selectedValues[value];
        if(this.selectedValues[value]){
            if(values_arr.find(x=>{return !this.selectedValues[x];}) == null){
                this.bAll = true;
            }
        }
        this.setting.filterChanged(this);
    }

    confirm(){
        this.setting.confirmFilter(this);
    }
}

class ERPCFormSetting{
    constructor(formPath){
        this.formPath = formPath;
        this.records_arr = null;
        this.dataversion = 0;
        this.sort={
            colkey:null,
            header:null,
            type:null,
        };
        this.filters_arr=[];
        this.filters_map={};
        this.sortFun = this.sortFun.bind(this);
    }
    
    getFilter(colkey){
        var rlt = this.filters_map[colkey];
        if(rlt == null){
            rlt = new FormColumnFilter(colkey, this);
            this.filters_map[colkey] = rlt;
        }
        return rlt;
    }

    confirmFilter(filter){
        if(filter.bAll){
            var filters_arr = this.filters_arr;
            var pos = filters_arr.indexOf(filter);
            if(pos != -1){
                filters_arr.splice(pos,1);
                for(var fi=pos; fi < filters_arr.length; ++fi){
                    var tFilter = filters_arr[fi];
                    tFilter.index = fi + 1;
                    if(tFilter.header){
                        tFilter.header.reRender();
                    }
                }
            }
        }
    }

    filterChanged(filter){
        var filters_arr = this.filters_arr;
        var pos = filters_arr.indexOf(filter);
        var needFresh = false;
        if(pos != -1){
            for(var fi=pos + 1; fi < filters_arr.length; ++fi){
                var tFilter = filters_arr[fi];
                this.valuesCache[tFilter.name] = null;
            }
        }
        
        if(filter.bAll){
            if(pos != -1){
                needFresh = true;
            }
        }else{
            needFresh = true;
            if(pos == -1){
                filters_arr.push(filter);
                filter.index = filters_arr.length;
            }
        }
        if(needFresh){
            this.reProcess();
        }
    }

    valueSortFun(a,b){
        if(a.localeCompare && b.localeCompare){
            return a.localeCompare(b);
        }
        return a < b ? -1 : (a > b ? 1 : 0);
    }

    getColumnValues(filter, useCache){
        var colkey = filter.name;
        if(useCache != false && this.valuesCache && this.valuesCache[colkey]){
            return this.valuesCache[colkey].rlt_arr;
        }
        var index = this.filters_arr.indexOf(filter);
        var useFilters_arr = index == -1 ? this.filters_arr : this.filters_arr.slice(0, index);
        var aid_map = {};
        var rlt_arr = [];
        if(this.records_arr){
            this.records_arr.forEach(rcd=>{
                for(var fi in useFilters_arr){
                    var tFilter = useFilters_arr[fi];
                    if(!tFilter.bAll && !tFilter.selectedValues[rcd[tFilter.name]]){
                        return;
                    }
                }
                
                var cv = rcd[colkey].toString();
                if(aid_map[cv] == null){
                    aid_map[cv] = true;
                    rlt_arr.push(cv);
                }
            });
        }
        if(this.valuesCache == null){
            this.valuesCache = {};
        }
        rlt_arr.sort(this.valueSortFun);
        this.valuesCache[colkey] = {
            aid_map:aid_map,
            rlt_arr:rlt_arr,
        };
        return rlt_arr;
    }

    setSort(colkey, header, type){
        var bForceFresh = false;
        if(this.sort.header){
            if(this.sort.header != header){
                this.sort.header.setState({
                    sortType:null,
                });
            }
            else if(this.sort.header == header && this.sort.type == type){
                colkey = null;
                bForceFresh = true;
                type = null;
            }
        }
        this.sort.colkey = colkey;
        this.sort.type = type;
        if(header){
            header.setState({
                sortType:type,
            });
            if(colkey == null){
                header = null;
            }
        }
        this.sort.header = header;
        if(bForceFresh || this.isValid()){
            this.reProcess();
        }
    }

    isValid(){
        return this.records_arr && this.records_arr.length > 0 && (this.sort.colkey || this.filters_arr.length > 0);
    }

    setRecords(records_arr){
        this.records_arr = records_arr;
        this.valuesCache = {};
        if(records_arr == null){
            if(this.lastClickHeader){
                this.lastClickHeader.closePopper(true);
            }
            return false;
        }

        if(this.isValid()){
            this.reProcess();
            return true;
        }  
        return false;
    }

    sortFun(a, b){
        var akey = a[this.sort.colkey];
        var bkey = b[this.sort.colkey];
        if(akey.localeCompare && bkey.localeCompare){
            return akey.localeCompare(bkey) * (this.sort.type == 'asc' ? 1 : -1);
        }
        
        if(akey == bkey){
            return 0;
        }
        if(this.sort.type == 'asc'){
            if(akey < bkey){
                return -1;
            }
            return 1;
        }
        else{
            if(akey < bkey){
                return 1;
            }
            return -1;
        }
    }

    reProcess(){
        var rlt_arr = this.records_arr.concat();
        if(this.filters_arr.length > 0){
            var filters_arr = this.filters_arr;
            rlt_arr = rlt_arr.filter(rcd=>{
                for(var fi in filters_arr){
                    var filter = filters_arr[fi];
                    if(!filter.bAll && !filter.selectedValues[rcd[filter.name]]){
                        return false;
                    }
                }
                return true;
            });
        }
        if(this.sort.colkey){
            rlt_arr.sort(this.sortFun);
        }
        rlt_arr.fromReProcess = true;
        setTimeout(()=>{
            ++this.dataversion;
            store.dispatch(makeAction_setStateByPath(rlt_arr,this.formPath + '.records_arr'));
        },200);
    }
}

function gGetFormSetting(formPath){
    var setting = gDataCache.get(formPath + '_setting');
    if(setting == null){
        setting = new ERPCFormSetting(formPath);
        gDataCache.set(formPath + '_setting', setting);
    }
    return setting;
}

function gCreatFormSetting(form){
    var setting = gGetFormSetting(form.props.fullPath);
    setting.form = form;
    return setting;
}

class ERPC_AdvanceFormHeader extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
        }
        this.rootRef = React.createRef();
        this.popRef = React.createRef();
        this.valueDivRef = React.createRef();
        this.clickHeaderHandler = this.clickHeaderHandler.bind(this);
        this.clickSortBtn = this.clickSortBtn.bind(this);
        this.clickSelectAll = this.clickSelectAll.bind(this);
        this.clickUnselectAll = this.clickUnselectAll.bind(this);
        this.reRender = this.reRender.bind(this);
        this.clickFilterElem = this.clickFilterElem.bind(this);
        this.closePopper = this.closePopper.bind(this);
        this.valueDivScrollHandler = this.valueDivScrollHandler.bind(this);
        this.keyInputChanged = this.keyInputChanged.bind(this);
    }

    closePopper(autoSetState){
        if(this.state.popper){
            this.state.popper.destroy();
            if(autoSetState != false){
                this.setState({
                    popper: null,
                });
                var filter = this.state.filter;
                if(filter){
                    setTimeout(()=>{filter.confirm()}, 200);
                }
            }
        }
    }

    componentWillUnmount() {
        this.closePopper(false);
        var formSetting = gGetFormSetting(this.props.form.props.fullPath);
        if(formSetting.sort.header == this){
            formSetting.sort.header = null;
            formSetting.sort.colkey = null;
        }
        var filter = formSetting.getFilter(this.props.colkey);
        filter.header = null;
        this.unmounted = true;
    }

    clickHeaderHandler(ev){
        if(this.state.popper){
            this.closePopper(true);
            return;
        }
        var formSetting = gGetFormSetting(this.props.form.props.fullPath);
		var records_arr = formSetting.records_arr;
		if(records_arr && records_arr.length <= 1){
			return;	// no data
		}
		var popper = Popper.createPopper(this.rootRef.current, this.popRef.current, {
            placement: 'bottom',
            strategy:'absolute',
        });

        var filter = formSetting.getFilter(this.props.colkey);
        filter.header = this;
        this.values_arr = filter.getValues(false);
        this.setState({
            popper:popper,
            filter:filter,
            maxCount:20,
            keyword:'',
        });
        if(formSetting.lastClickHeader){
            formSetting.lastClickHeader.closePopper(true);
        }
        formSetting.lastClickHeader = this;
    }
    
    clickSortBtn(ev){
        var type = getAttributeByNode(ev.target, 'd-type', true, 5);
        if (type == null) {
            console.warn('no type');
            return;
        }
        var formSetting = gGetFormSetting(this.props.form.props.fullPath);
        formSetting.setSort(this.props.colkey, this, type);
        this.closePopper(true);
    }

    clickSelectAll(ev){
        var filter = this.state.filter;
        if(filter && filter.bAll == false){
            filter.selectAll();
            this.reRender();
        }
    }

    clickUnselectAll(ev){
        var filter = this.state.filter;
        if(filter){
            filter.unSelectAll();
            this.reRender();
        }
    }

    clickFilterElem(ev){
        var key = getAttributeByNode(ev.target, 'd-key', true, 5);
        if (key == null) {
            console.warn('no key');
            return;
        }
        var filter = this.state.filter;
        if(filter){
            filter.toggleSelect(key);
            this.reRender();
        }
    }

    reRender(){
        if(this.unmounted){
            return;
        }
        this.setState({
            magicObj: {}
        });
    }

    valueDivScrollHandler(ev) {
        if (this.valueDivRef.current) {
            var valueDiv = this.valueDivRef.current;
            var height = $(valueDiv).height();
            if ((valueDiv.scrollTop + height) / valueDiv.scrollHeight > 0.95) {
                this.setState({
                    maxCount: this.state.maxCount + 20,
                });
            }
        }
    }

    keyInputChanged(ev){
        this.setState({
            keyword: ev.target.value,
        });
    }

    render() {
        var filterElem;
        var filter = this.state.filter;
        if(this.props.canFilt && filter){
            var values_arr = this.values_arr;
            var keyword = this.state.keyword.trim();
            var filtedValues_arr = values_arr;
            if(!IsEmptyString(keyword)){
                filtedValues_arr = values_arr.filter(x=>{return x.indexOf(keyword) != -1;});
            }
            this.filtedValues_arr = filtedValues_arr;
            filterElem = <React.Fragment>
                <span className='shadow border-top btn-group align-items-center p-1'>筛选
                    <button onClick={this.clickSelectAll} className='btn btn-sm btn-dark'>全选</button>
                    <button onClick={this.clickUnselectAll} className='btn btn-sm btn-dark'>全不选</button>
                </span>
                <div className='flex-shrink-0 flex-grow-0 input-group flex-nowrap'>
                    <div className="input-group-prepend">
                        <span className='text-primary input-group-text p-1' ><i className='fa fa-search' /></span>
                    </div>
                    <input className='form-control' type='text' value={keyword} onChange={this.keyInputChanged} />
                </div>

                <div ref={this.valueDivRef} onScroll={filtedValues_arr.length > this.state.maxCount ? this.valueDivScrollHandler : null} className='list-group autoScroll border rounded' style={{maxHeight:'400px'}}>
                    {filtedValues_arr.slice(0,this.state.maxCount).map((x,i)=>{
                        return <div d-key={x} onClick={this.clickFilterElem} className='list-group-item flex-grow-0 flex-shrink-0 cursor_hand p-2 d-flex' key={i}>
                                <span className="fa-stack fa-lg">
                                    <i className="fa fa-square-o fa-stack-2x" />
                                    {filter.bAll || filter.selectedValues[x] ? <i className={'fa fa-stack-1x fa-check text-' + (filter.bAll ? 'warning' : 'success')} /> : null}
                                </span>
                                {x}
                            </div>
                    })}
                </div>
            </React.Fragment>
        }
        return <React.Fragment>
            <div ref={this.rootRef} className="btn btn-sam btn-link p-0" onClick={this.clickHeaderHandler}>
                {this.props.title}
                {this.state.sortType == null ? null : <i className={"fa fa-long-arrow-" + (this.state.sortType == 'asc' ? 'up' : 'down')} />}
                {filter && !filter.bAll ? <span className="fa fa-filter">{filter.index}</span> : null}
            </div>
			<div ref={this.popRef} className={'bg-light shadow flex-column p-1 border rounded d-' + (this.state.popper ? 'flex' : 'none')} style={{width:'200px', zIndex: 5000}}>
                <div className='btn-group border m-1'>
                    <button d-type='asc' className={'btn flex-grow-1 flex-shrink-1 text-right btn-' + (this.state.sortType == 'asc' ? 'primary' : 'light')} onClick={this.clickSortBtn} >升序排列</button>
                    <button d-type='desc' className={'btn flex-grow-1 flex-shrink-1 text-right btn-' + (this.state.sortType == 'desc' ? 'primary' : 'light')} onClick={this.clickSortBtn} >降序排列</button>
                </div>
                {filterElem}
                <button className='btn btn-sm btn-danger' onClick={this.closePopper}>关闭</button>
			</div>
        </React.Fragment>
    }
}