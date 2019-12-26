const TaskServerURL = '/erppage/server/task';
class ERPC_TaskSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPControlBase(this);
        this.dropdownRef = React.createRef();
        this.pullUserTask = this.pullUserTask.bind(this);
        this.pop = this.pop.bind(this);
        this.createTitleBarRightElem = this.createTitleBarRightElem.bind(this);
        this.popupCreator = this.popupCreator.bind(this);
        this.taskConfirmed = this.taskConfirmed.bind(this);
        this.onloadHandler = this.onloadHandler.bind(this);
        this.onErrorHandler = this.onErrorHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.iframeRef = React.createRef();
        this.iframeItem = null;
    }

    pop(){
        this.closeCreator();
    }

    pullUserTask(parentPath) {
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentPath, this.props.id, 'options_arr', false), EFetchKey.FetchPropValue));
    }

    sendMessage(msgtype, data) {
        if(msgtype == '任务已下发'){
            this.taskConfirmed(data.任务代码,data.任务名称,'默认小组');
            this.closeCreator();
        }
    }

    onloadHandler(ev) {
        try {
            ev.target.contentWindow.gPageInFrame = true;
            ev.target.contentWindow.gParentFrame = this;
            ev.target.contentWindow.gParentDingKit = dingdingKit;
            ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
        }
        catch (eo) {
            console.log(eo);
        }
    }

    onErrorHandler(ev) {
        alert(JSON.stringify(ev));
    }

    popupCreator(){
        this.iframeItem = <div key={this.props.id + 'creator'} className='d-fixed w-100 h-100' style={{zIndex:10000}}>
                                <iframe ref={this.iframeRef} src='http://192.168.0.15:1330/erppage/mb/ZZMZY?flowStep=144' className='w-100 h-100' frameBorder='0' onLoad={this.onloadHandler} onError={this.onErrorHandler} ></iframe>
                            </div>
        addFixedItem(this.iframeItem);
        if(this.dropdownRef.current){
            this.dropdownRef.current.dropDownClosed();
        }
    }

    closeCreator(){
        if(this.iframeItem){
            removeFixedItem(this.iframeItem);
        }
    }

    createTitleBarRightElem(){
        return (<button type='button' onClick={this.popupCreator} className={'ml-1 btn btn-success' + (isMobile ? '' : ' btn-sm')}><i className='fa fa-plus'/>创建任务</button>);
    }

    taskConfirmed(taskid, taskname, groupname){
        var newOptions_arr = this.props.optionsData.options_arr;
        newOptions_arr = newOptions_arr.map(x=>{
            return x.data;
        }).concat(
            {
                工作任务记录代码:taskid,
                任务标题:taskname,
                工作小组名称:groupname
            },
        );
        var needSetState={
            options_arr:newOptions_arr,
            text:taskname,
            value:taskid,
        }
        store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
        if(this.dropdownRef.current){
            this.dropdownRef.current.dropDownClosed();
        }
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        return (<ERPC_DropDown 
                ref={this.dropdownRef}
                value={this.props.value}
                text={this.props.text}
                fetching={this.props.fetching}
                fetchingErr={this.props.fetchingErr}
                optionsData={this.props.optionsData}
                invalidInfo={this.props.invalidInfo}
                selectOpt={this.props.selectOpt}
                rowkey={this.props.rowkey}
                id={this.props.id}
                parentPath={this.props.parentPath}
                type='string'
                pullOnce={true}
                pullDataSource={this.pullUserTask}
                options_arr={this.props.options_arr}
                plainTextMode={this.props.plainTextMode}
                fullParentPath={this.props.fullParentPath}
                fullPath={this.props.fullPath}
                label={this.props.label}
                textAttrName='任务标题' 
                valueAttrName='工作任务记录代码'
                recentCookieKey='task'
                onchanged={this.props.onchanged}
                createTitleBarRightElem={this.createTitleBarRightElem}
        />);
    }
}

const selectERPC_TaskSelector_textName = (state, ownprops) => {
    return '任务标题';
};

const selectERPC_TaskSelector_valueName = (state, ownprops) => {
    return '工作任务记录代码';
};

const selectERPC_TaskSelector_groupAttrName = (state, ownprops) => {
    return '工作小组名称';
};

function ERPC_TaskSelector_mapstatetoprops(state, ownprops) {
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
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_TaskSelector_textName, selectERPC_TaskSelector_valueName, selectERPC_TaskSelector_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (!useValue) {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_TaskSelector_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_TaskSelector = null;
gNeedCallOnErpControlInit_arr.push(()=>{
    VisibleERPC_TaskSelector = ReactRedux.connect(ERPC_TaskSelector_mapstatetoprops, ERPC_TaskSelector_dispatchtoprops)(ERPC_TaskSelector);
});