const TaskServerURL = '/erppage/server/task';
class ERPC_TaskSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPControlBase(this);
        this.pullUserTask = this.pullUserTask.bind(this);
        this.createTitleBarRightElem = this.createTitleBarRightElem.bind(this);
        this.popupCreator = this.popupCreator.bind(this);

        this.popPanelRef = React.createRef();
        this.popPanelItem = (<ERPC_TaskCreator ref={this.popPanelRef} selector={this} key={gFixedItemCounter++} />)
    }

    pullUserTask() {
        var ownprops = this.props;
        var parentStatePath = MakePath(ownprops.parentPath, (ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex), ownprops.id);
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentStatePath, ownprops.id), 'options_arr', false), EFetchKey.FetchPropValue);
    }

    popupCreator(){
        addFixedItem(this.popPanelItem);
    }

    closeCreator(){
        removeFixedItem(this.popPanelItem);
    }

    createTitleBarRightElem(){
        return (<button type='button' onClick={this.popupCreator} className='btn btn-success'><i className='fa fa-plus'/>创建任务</button>);
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        return (<ERPC_DropDown 
                value={this.props.value}
                text={this.props.text}
                fetching={this.props.fetching}
                fetchingErr={this.props.fetchingErr}
                optionsData={this.props.optionsData}
                invalidInfo={this.props.invalidInfo}
                selectOpt={this.props.selectOpt}
                rowIndex={this.props.rowIndex}
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
                createTitleBarRightElem={this.createTitleBarRightElem}
        />);
    }
}

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
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
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
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowIndex != 'new',
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