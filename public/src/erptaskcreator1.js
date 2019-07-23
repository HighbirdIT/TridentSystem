const TaskTargetPage_style = { "width": "100%" };
const Form_1headstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "whiteSpace": "nowrap", "overflow": "hidden" };
const Form_1tdstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "verticalAlign": "middle" };
const Form_1_tableStyle = { "marginTop": "-50px" };
const Form_1_headtableStyle = { "marginBottom": "0px" };

class ERPC_TaskCreator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.contentDivRef = React.createRef();
        this.inited = false;
        this.formStyle={
            maxWidth:'1024px',
            margin:'auto',
        };
    }

    componentWillMount() {
        var self = this;
        setTimeout(() => {
            self.inited = true;
        }, 50);
        if(appStateChangedAct_map){
            appStateChangedAct_map['TaskCreatePage.Form0.records_arr'] = gFreshTCKForm;
            appStateChangedAct_map['TaskCreatePage.Form0.recordIndex'] = gBindTCKForm;
        }
    }

    componentWillUnmount() {
        this.inited = false;
    }

    foceClose() {
        this.clickCloseHandler();
    }

    clickCloseHandler() {
        this.props.selector.closeCreator();
    }

    renderHead() {
        return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' >
            <h3 onClick={this.clickCloseHandler}><i className='fa fa-arrow-left' />任务创建</h3>
        </div>
        );
    }

    renderContent() {
        return <div className='d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column bg-light' style={{maxHeight:'calc(100% - 40px)'}}>
            <VisibleTKCForm id='Form0' parentPath='TaskCreatePage' />
        </div>;
    }

    render() {
        var retElem = null;
        retElem = (
            <div className='fixedBackGround'>
                <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100' style={this.formStyle}>
                    {this.renderHead()}
                    {this.renderContent()}
                </div>
            </div>);
        return retElem;
    }
}

function ERPC_TaskCreator_mapstatetoprops(state, ownprops) {
    return {
    };
}

function ERPC_TaskCreator_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_TaskCreator = null;
var VisibleTKCForm = null;
gNeedCallOnErpControlInit_arr.push(() => {
    VisibleERPC_TaskCreator = ReactRedux.connect(ERPC_TaskCreator_mapstatetoprops, ERPC_TaskCreator_dispatchtoprops)(ERPC_TaskCreator);
    VisibleTKCForm = ReactRedux.connect(TKCForm_mapstatetoprops, TKCForm_disptchtoprops)(TKCForm);
});

function gPullTCKForm(retState){
    setTimeout(() => {
        store.dispatch(fetchJsonPost(TaskServerURL, {action:'getTCKFormData',}, makeFTD_Prop('TaskCreatePage','Form0','records_arr',false), EFetchKey.FetchPropValue));
    }, 50);
    return retState;
}

function gFreshTCKForm(retState,records_arr){
	simpleFreshFormFun(retState,records_arr,'TaskCreatePage.Form0',gBindTCKForm);
}

function gBindTCKForm(retState,newIndex,oldIndex,statePath){
	var Form0_path='TaskCreatePage.Form0';
	var formState=getStateByPath(retState,Form0_path,{});
	var records_arr=formState.records_arr;
	var needSetState={};
	var bundle={};
	var nowRecord=null;
	var useIndex=newIndex;
	needSetState['M_Dropdown_0.text']=null;
	needSetState['M_Dropdown_1.text']=null;
	needSetState['M_Dropdown_2.text']=null;
	needSetState['M_Dropdown_3.text']=null;
	needSetState['M_Dropdown_4.text']=null;
	needSetState['M_Dropdown_5.text']=null;
	needSetState['M_Dropdown_6.text']=null;
	needSetState['M_Dropdown_7.text']=null;
	if(records_arr == null || newIndex == -1 || records_arr.length == 0){
		var insertCache=getStateByPath(formState,'insertCache');
		if(insertCache){
			needSetState['M_Text_0.value']=insertCache.M_Text_0_value;
			needSetState['M_Text_1.value']=insertCache.M_Text_1_value;
			needSetState['M_Dropdown_0.text']=insertCache.M_Dropdown_0_text;
			needSetState['M_Dropdown_0.value']=insertCache.M_Dropdown_0_value;
			needSetState['M_Dropdown_1.text']=insertCache.M_Dropdown_1_text;
			needSetState['M_Dropdown_1.value']=insertCache.M_Dropdown_1_value;
			needSetState['M_Dropdown_2.text']=insertCache.M_Dropdown_2_text;
			needSetState['M_Dropdown_2.value']=insertCache.M_Dropdown_2_value;
			needSetState['M_Dropdown_3.text']=insertCache.M_Dropdown_3_text;
			needSetState['M_Dropdown_3.value']=insertCache.M_Dropdown_3_value;
			needSetState['M_Dropdown_4.text']=insertCache.M_Dropdown_4_text;
			needSetState['M_Dropdown_4.value']=insertCache.M_Dropdown_4_value;
			needSetState['M_Text_4.value']=insertCache.M_Text_4_value;
			needSetState['M_CheckBox_0.value']=insertCache.M_CheckBox_0_value;
			needSetState['M_Text_2.value']=insertCache.M_Text_2_value;
			needSetState['M_Dropdown_5.text']=insertCache.M_Dropdown_5_text;
			needSetState['M_Dropdown_5.value']=insertCache.M_Dropdown_5_value;
			needSetState['M_CheckBox_1.value']=insertCache.M_CheckBox_1_value;
			needSetState['M_Dropdown_6.text']=insertCache.M_Dropdown_6_text;
			needSetState['M_Dropdown_6.value']=insertCache.M_Dropdown_6_value;
			needSetState['M_Text_3.value']=insertCache.M_Text_3_value;
			needSetState['M_Dropdown_7.text']=insertCache.M_Dropdown_7_text;
			needSetState['M_Dropdown_7.value']=insertCache.M_Dropdown_7_value;
		}
		else{
			needSetState['M_Text_0.value']=null;
			needSetState['M_Text_1.value']=null;
			needSetState['M_Dropdown_0.value']=null;
			needSetState['M_Dropdown_1.value']=null;
			needSetState['M_Dropdown_2.value']=null;
			needSetState['M_Dropdown_3.value']=null;
			needSetState['M_Dropdown_4.value']=null;
			needSetState['M_Text_4.value']=null;
			needSetState['M_CheckBox_0.value']=0;
			needSetState['M_Text_2.value']=null;
			needSetState['M_Dropdown_5.value']=4;
			needSetState['M_CheckBox_1.value']=0;
			needSetState['M_Dropdown_6.value']=null;
			needSetState['M_Text_3.value']=null;
			needSetState['M_Dropdown_7.value']=1;
			needSetState['M_Dropdown_0.value']=M_Dropdown_0_defaultvalue_get(retState,bundle,Form0_path);
			needSetState['M_Text_4.value']=M_Text_4_defaultvalue_get(retState,bundle,Form0_path);
			needSetState['M_Text_2.value']=M_Text_2_defaultvalue_get(retState,bundle,Form0_path);
		}
		needSetState['button_2.visible']=false;
		needSetState['button_1.visible']=false;
		needSetState['button_0.visible']=true;
	}
	else{
		nowRecord=records_arr[useIndex];
		bundle.Form0_nowRecord=nowRecord;
		needSetState['M_Text_0.value']=nowRecord['任务标题'];
		needSetState['M_Text_1.value']=nowRecord['任务描述'];
		needSetState['M_Dropdown_0.value']=nowRecord['发起人员代码'];
		needSetState['M_Dropdown_1.value']=nowRecord['执行人员代码'];
		needSetState['M_Dropdown_2.value']=nowRecord['关联工作小组代码'];
		needSetState['M_Dropdown_3.value']=nowRecord['关联项目代码'];
		needSetState['M_Dropdown_4.value']=nowRecord['抄送人员明细'];
		needSetState['M_Text_4.value']=nowRecord['开始日期'];
		needSetState['M_CheckBox_0.value']=nowRecord['有无期限'];
		needSetState['M_Text_2.value']=nowRecord['截止日期'];
		needSetState['M_Dropdown_5.value']=nowRecord['汇报频率代码'];
		needSetState['M_CheckBox_1.value']=nowRecord['是否周期任务'];
		needSetState['M_Dropdown_6.value']=nowRecord['周期单位'];
		needSetState['M_Text_3.value']=nowRecord['周期数值'];
		needSetState['M_Dropdown_7.value']=nowRecord['重要程度代码'];
		needSetState['button_2.visible']=true;
		needSetState['button_1.visible']=true;
		needSetState['button_0.visible']=false;
	}
	if(oldIndex == -1){
		needSetState['insertCache.M_Text_0_value']=getStateByPath(formState,'M_Text_0.value');
		needSetState['insertCache.M_Text_1_value']=getStateByPath(formState,'M_Text_1.value');
		needSetState['insertCache.M_Dropdown_0_text']=getStateByPath(formState,'M_Dropdown_0.text');
		needSetState['insertCache.M_Dropdown_0_value']=getStateByPath(formState,'M_Dropdown_0.value');
		needSetState['insertCache.M_Dropdown_1_text']=getStateByPath(formState,'M_Dropdown_1.text');
		needSetState['insertCache.M_Dropdown_1_value']=getStateByPath(formState,'M_Dropdown_1.value');
		needSetState['insertCache.M_Dropdown_2_text']=getStateByPath(formState,'M_Dropdown_2.text');
		needSetState['insertCache.M_Dropdown_2_value']=getStateByPath(formState,'M_Dropdown_2.value');
		needSetState['insertCache.M_Dropdown_3_text']=getStateByPath(formState,'M_Dropdown_3.text');
		needSetState['insertCache.M_Dropdown_3_value']=getStateByPath(formState,'M_Dropdown_3.value');
		needSetState['insertCache.M_Dropdown_4_text']=getStateByPath(formState,'M_Dropdown_4.text');
		needSetState['insertCache.M_Dropdown_4_value']=getStateByPath(formState,'M_Dropdown_4.value');
		needSetState['insertCache.M_Text_4_value']=getStateByPath(formState,'M_Text_4.value');
		needSetState['insertCache.M_CheckBox_0_value']=getStateByPath(formState,'M_CheckBox_0.value');
		needSetState['insertCache.M_Text_2_value']=getStateByPath(formState,'M_Text_2.value');
		needSetState['insertCache.M_Dropdown_5_text']=getStateByPath(formState,'M_Dropdown_5.text');
		needSetState['insertCache.M_Dropdown_5_value']=getStateByPath(formState,'M_Dropdown_5.value');
		needSetState['insertCache.M_CheckBox_1_value']=getStateByPath(formState,'M_CheckBox_1.value');
		needSetState['insertCache.M_Dropdown_6_text']=getStateByPath(formState,'M_Dropdown_6.text');
		needSetState['insertCache.M_Dropdown_6_value']=getStateByPath(formState,'M_Dropdown_6.value');
		needSetState['insertCache.M_Text_3_value']=getStateByPath(formState,'M_Text_3.value');
		needSetState['insertCache.M_Dropdown_7_text']=getStateByPath(formState,'M_Dropdown_7.text');
		needSetState['insertCache.M_Dropdown_7_value']=getStateByPath(formState,'M_Dropdown_7.value');
	}
	needSetState['nowRecord']=nowRecord;
	needSetState['invalidbundle']=false;
	retState=setManyStateByPath(retState,Form0_path,needSetState);
	return retState;
}


class TKCForm extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPC_PageForm(this);
        this.canInsert = true;

        autoBind(this);
    }

    componentWillMount() {
        gPullTCKForm();
        if(appStateChangedAct_map){
            appStateChangedAct_map[this.props.fullPath + '.M_CheckBox_0.value'] = this.M_CheckBox_0_value_changed;
            appStateChangedAct_map[this.props.fullPath + '.M_CheckBox_1.value'] = this.M_CheckBox_1_value_changed;
        }
    }

    M_CheckBox_0_value_changed(state, newValue) {
        var needSetState = {};
        needSetState['M_LC_8.visible'] = newValue ? 1 : 0;
        return setManyStateByPath(state, this.props.fullPath, needSetState);
    }

    M_CheckBox_1_value_changed(state, newValue) {
        var needSetState = {};
        needSetState['M_LC_11.visible'] = newValue ? 1 : 0;
        needSetState['M_LC_12.visible'] = newValue ? 1 : 0;
        return setManyStateByPath(state, this.props.fullPath, needSetState);
    }

    doPullDropdown(parentPath,dropdownid,action){
        store.dispatch(fetchJsonPost(TaskServerURL, { action: action, }, makeFTD_Prop(parentPath, dropdownid, 'options_arr', false), EFetchKey.FetchPropValue));
    }

    pull_M_Dropdown_0(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_0','get用系统的用户');
    }

    pull_M_Dropdown_1(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_1','get用系统的用户');
    }

    pull_M_Dropdown_2(parentPath){
        this.doPullDropdown(parentPath,'M_Dropdown_2','get所属工作组List');
    }

    pull_M_Dropdown_3(parentPath){
        this.doPullDropdown(parentPath,'M_Dropdown_3','get可用项目List');
    }

    pull_M_Dropdown_4(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_4','get用系统的用户');
    }

    pull_M_Dropdown_5(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_5','get汇报频率List');
    }

    pull_M_Dropdown_6(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_6','get周期单位List');
    }

    pull_M_Dropdown_7(parentPath) {
        this.doPullDropdown(parentPath,'M_Dropdown_7','get重要程度List');
    }

    modifybtn_onclick(ev) {
        var state = store.getState();
        var M_Form_0_Path = this.props.fullPath;
        var M_Form_0_state = getStateByPath(state, M_Form_0_Path, {});
        var M_Form_0_nowRecord = M_Form_0_state.nowRecord;
        var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
        var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
        var M_Text_0_value = M_Text_0_state.value;
        var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
        var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
        var M_Text_1_value = M_Text_1_state.value;
        var M_Dropdown_0_state = getStateByPath(M_Form_0_state, 'M_Dropdown_0', {});
        var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
        var M_Dropdown_0_value = M_Dropdown_0_state.value;
        var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
        var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
        var M_Dropdown_1_value = M_Dropdown_1_state.value;
        var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
        var M_LC_4_state = getStateByPath(M_Form_0_state, 'M_LC_4', {});
        var M_Dropdown_2_value = M_Dropdown_2_state.value;
        var M_Dropdown_3_state = getStateByPath(M_Form_0_state, 'M_Dropdown_3', {});
        var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
        var M_Dropdown_3_value = M_Dropdown_3_state.value;
        var M_Dropdown_4_state = getStateByPath(M_Form_0_state, 'M_Dropdown_4', {});
        var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
        var M_Dropdown_4_value = M_Dropdown_4_state.value;
        var M_Text_4_state = getStateByPath(M_Form_0_state, 'M_Text_4', {});
        var M_LC_14_state = getStateByPath(M_Form_0_state, 'M_LC_14', {});
        var M_Text_4_value = M_Text_4_state.value;
        var M_CheckBox_0_state = getStateByPath(M_Form_0_state, 'M_CheckBox_0', {});
        var M_LC_7_state = getStateByPath(M_Form_0_state, 'M_LC_7', {});
        var M_CheckBox_0_value = M_CheckBox_0_state.value;
        var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
        var M_LC_8_state = getStateByPath(M_Form_0_state, 'M_LC_8', {});
        var M_Text_2_value = M_Text_2_state.value;
        var M_Dropdown_5_state = getStateByPath(M_Form_0_state, 'M_Dropdown_5', {});
        var M_LC_9_state = getStateByPath(M_Form_0_state, 'M_LC_9', {});
        var M_Dropdown_5_value = M_Dropdown_5_state.value;
        var M_CheckBox_1_state = getStateByPath(M_Form_0_state, 'M_CheckBox_1', {});
        var M_LC_10_state = getStateByPath(M_Form_0_state, 'M_LC_10', {});
        var M_CheckBox_1_value = M_CheckBox_1_state.value;
        var M_Dropdown_6_state = getStateByPath(M_Form_0_state, 'M_Dropdown_6', {});
        var M_LC_11_state = getStateByPath(M_Form_0_state, 'M_LC_11', {});
        var M_Dropdown_6_value = M_Dropdown_6_state.value;
        var M_Text_3_state = getStateByPath(M_Form_0_state, 'M_Text_3', {});
        var M_LC_12_state = getStateByPath(M_Form_0_state, 'M_LC_12', {});
        var M_Text_3_value = M_Text_3_state.value;
        var M_Dropdown_7_state = getStateByPath(M_Form_0_state, 'M_Dropdown_7', {});
        var M_LC_13_state = getStateByPath(M_Form_0_state, 'M_LC_13', {});
        var M_Dropdown_7_value = M_Dropdown_7_state.value;
        var validErr;
        var hadValidErr = false;
        var validErrState = {};
        var scriptBP_12_msg = null;
        var callback_final = (state, data, err) => {
            if (state == null) { store.dispatch(makeAction_setManyStateByPath(validErrState, '')); }
            else { setManyStateByPath(state, '', validErrState); }
            if (hadValidErr) { SendToast('验证失败，无法执行', EToastType.Warning); return; }
            if (err) {
                if (scriptBP_12_msg) { scriptBP_12_msg.setData(err.info, EMessageBoxType.Error, '提交修改'); }
                else { SendToast(err.info, EToastType.Error); }
                return;
            }
            if (scriptBP_12_msg) { scriptBP_12_msg.fireClose(); }
            SendToast('执行成功');
        };
        if (IsEmptyString(M_Form_0_nowRecord)) {
            return callback_final(state, null, { info: gPreconditionInvalidInfo });
        }
        validErr = BaseIsValueValid(state, M_LC_0_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
        validErrState[M_Form_0_Path + '.M_Text_0.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
        validErrState[M_Form_0_Path + '.M_Text_1.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_0.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_3_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_1.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_4_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_2.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_5_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_3.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_6_state, M_Dropdown_4_state, M_Dropdown_4_value, 'xml', true, 'M_Dropdown_4', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_4.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_14_state, M_Text_4_state, M_Text_4_value, 'date', false, 'M_Text_4', validErrState);
        validErrState[M_Form_0_Path + '.M_Text_4.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_7_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
        validErrState[M_Form_0_Path + '.M_CheckBox_0.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_8_state, M_Text_2_state, M_Text_2_value, 'date', false, 'M_Text_2', validErrState);
        if (validErr == null && M_CheckBox_0_value == 1 && getDateDiff('天', castDate(M_Text_4_value), castDate(M_Text_2_value)) < 0) {
            validErr = '必须大于开始日期。';
        }
        validErrState[M_Form_0_Path + '.M_Text_2.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_9_state, M_Dropdown_5_state, M_Dropdown_5_value, 'string', false, 'M_Dropdown_5', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_5.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_10_state, M_CheckBox_1_state, M_CheckBox_1_value, 'string', false, 'M_CheckBox_1', validErrState);
        validErrState[M_Form_0_Path + '.M_CheckBox_1.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_11_state, M_Dropdown_6_state, M_Dropdown_6_value, 'string', false, 'M_Dropdown_6', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_6.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_12_state, M_Text_3_state, M_Text_3_value, 'float', false, 'M_Text_3', validErrState);
        validErrState[M_Form_0_Path + '.M_Text_3.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        validErr = BaseIsValueValid(state, M_LC_13_state, M_Dropdown_7_state, M_Dropdown_7_value, 'string', false, 'M_Dropdown_7', validErrState);
        validErrState[M_Form_0_Path + '.M_Dropdown_7.invalidInfo'] = validErr;
        if (validErr != null) hadValidErr = true;
        
        if (hadValidErr) { return callback_final(null, null, { info: gPreconditionInvalidInfo }); }
        var fetchid = Math.round(Math.random() * 999999);
        var fetchKey = 'button_2_onclick';
        fetchTracer[fetchKey] = fetchid;
        var baseBundle = {
        };
        scriptBP_12_msg = PopMessageBox('', EMessageBoxType.Loading, '提交修改');
        var bundle_update_table_0 = Object.assign({}, baseBundle, {
            M_Form_0_nowRecord: M_Form_0_nowRecord,
            M_Text_0_value: M_Text_0_value,
            M_Text_1_value: M_Text_1_value,
            M_Dropdown_0_value: M_Dropdown_0_value,
            M_Dropdown_1_value: M_Dropdown_1_value,
            M_Dropdown_2_value: M_Dropdown_2_value,
            M_Dropdown_3_value: M_Dropdown_3_value,
            M_Dropdown_4_value: M_Dropdown_4_value,
            M_CheckBox_0_value: M_CheckBox_0_value,
            M_Text_4_value: M_Text_4_value,
            M_Text_2_value: M_Text_2_value,
            M_Dropdown_5_value: M_Dropdown_5_value,
            M_CheckBox_1_value: M_CheckBox_1_value,
            M_Text_3_value: M_Text_3_value,
            M_Dropdown_6_value: M_Dropdown_6_value,
            M_Dropdown_7_value: M_Dropdown_7_value,
        });
        store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_update_table_0, action: 'modifyTask', }, makeFTD_Callback((state, data_update_table_0, err_update_table_0) => {
            if (err_update_table_0 == null) {
                if (scriptBP_12_msg != null) { scriptBP_12_msg.fireClose(); }
                var popPage_0entryParam = {
                    任务名称: M_Text_0_value,
                    任务代码: M_Form_0_nowRecord['工作任务记录代码'],
                    callBack: null,
                };
                gDataCache.set('M_Page_1entryParam', popPage_0entryParam);
                /*
                init_M_Page_1(state);
                setTimeout(() => {
                    popPage('M_Page_1', <VisibleCM_Page_1 key='M_Page_1' />);
                }, 50);
                */
            }
            else {
                return callback_final(state, data_update_table_0, err_update_table_0);
            }
        })));
    }

    deletebtn_onclick(ev) {
        var state = store.getState();
        var M_Form_0_Path = this.props.fullPath;
        var M_Form_0_state = getStateByPath(state, M_Form_0_Path, {});
        var M_Form_0_nowRecord = M_Form_0_state.nowRecord;
        var hadValidErr = false;
        var validErrState = {};
        var scriptBP_11_msg = null;
        var callback_final = (state, data, err) => {
            if (state == null) { store.dispatch(makeAction_setManyStateByPath(validErrState, '')); }
            else { setManyStateByPath(state, '', validErrState); }
            if (hadValidErr) { SendToast('验证失败，无法执行', EToastType.Warning); return; }
            if (err) {
                if (scriptBP_11_msg) { scriptBP_11_msg.setData(err.info, EMessageBoxType.Error, '撤销此任务'); }
                else { SendToast(err.info, EToastType.Error); }
                return;
            }
            if (scriptBP_11_msg) { scriptBP_11_msg.fireClose(); }
            SendToast('执行成功');
        };
        if (IsEmptyString(M_Form_0_nowRecord)) {
            return callback_final(state, null, { info: gPreconditionInvalidInfo });
        }
        var fetchid = Math.round(Math.random() * 999999);
        var fetchKey = 'button_1_onclick';
        fetchTracer[fetchKey] = fetchid;

        scriptBP_11_msg = PopMessageBox('', EMessageBoxType.Loading, '撤销此任务');
        var bundle_excute_pro_0 = {
            M_Form_0_nowRecord: M_Form_0_nowRecord,
        };
        store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_excute_pro_0, action: 'repealTask', }, makeFTD_Callback((state, excute_pro_0_ret, error_excute_pro_0) => {
            if (error_excute_pro_0) { return callback_final(state, null, error_excute_pro_0); }
            setTimeout(() => { gPullTCKForm(); }, 50);
            var ret = callback_final(state, excute_pro_0_ret.output.执行成功, null);
            return ret == null ? state : ret;
        }, false)));
    }

    render() {
        var retElem = null;
        if (this.props.fetching) {
            retElem = renderFetcingTipDiv();
        }
        else {
            if (this.props.fetchingErr) {
                retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
            }
            else {
                if (this.props.invalidbundle) {
                    retElem = renderInvalidBundleDiv();
                }
                else {
                    if (!this.canInsert && this.props.nowRecord == null) {
                        retElem = <div className='m-auto'>没有查询到数据</div>;
                    }
                    else {
                        retElem = (
                            <div className='d-flex flex-column d-flex flex-grow-0 flex-shrink-0 erp-form flex-column '>
                                {this.props.title && <div className='bg-dark text-light justify-content-center d-flex flex-shrink-0'><span>{this.props.title}</span></div>}
                                <div className='d-flex flex-grow-1  flex-column'>
                                    <VisibleERPC_LabeledControl id='M_LC_0' parentPath={this.props.fullPath} label='任务标题'>
                                        <VisibleERPC_Text id='M_Text_0' parentPath={this.props.fullPath} type='string' linetype='single' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_1' parentPath={this.props.fullPath} label='任务描述'>
                                        <VisibleERPC_Text id='M_Text_1' parentPath={this.props.fullPath} type='string' linetype='1x' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_2' parentPath={this.props.fullPath} label='发起人'>
                                        <VisibleERPC_DropDown id='M_Dropdown_0' parentPath={this.props.fullPath} pullOnce={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={this.pull_M_Dropdown_0} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='发起人' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_3' parentPath={this.props.fullPath} label='执行人'>
                                        <VisibleERPC_DropDown id='M_Dropdown_1' parentPath={this.props.fullPath} pullOnce={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={this.pull_M_Dropdown_1} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='执行人' recentCookieKey='task-executor' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_4' parentPath={this.props.fullPath} label='关联工作小组'>
                                        <VisibleERPC_DropDown id='M_Dropdown_2' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={this.pull_M_Dropdown_2} textAttrName='工作小组名称' valueAttrName='工作小组代码' label='关联工作小组' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_5' parentPath={this.props.fullPath} label='关联项目'>
                                        <VisibleERPC_DropDown id='M_Dropdown_3' parentPath={this.props.fullPath} pullOnce={true} groupAttr='项目运行阶段' pullDataSource={this.pull_M_Dropdown_3} textAttrName='项目登记名称' valueAttrName='项目登记名称代码' label='关联项目' recentCookieKey='task-project' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_6' parentPath={this.props.fullPath} label='抄送人员'>
                                        <VisibleERPC_DropDown id='M_Dropdown_4' parentPath={this.props.fullPath} textType='xml' multiselect={true} pullOnce={true} nullable={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={this.pull_M_Dropdown_4} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='抄送人员' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_14' parentPath={this.props.fullPath} label='开始日期'>
                                        <VisibleERPC_Text id='M_Text_4' parentPath={this.props.fullPath} type='date' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_7' parentPath={this.props.fullPath} label='有无期限'>
                                        <VisibleERPC_CheckBox id='M_CheckBox_0' parentPath={this.props.fullPath} />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_8' parentPath={this.props.fullPath} label='截止日期'>
                                        <VisibleERPC_Text id='M_Text_2' parentPath={this.props.fullPath} type='date' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_9' parentPath={this.props.fullPath} label='汇报频率'>
                                        <VisibleERPC_DropDown id='M_Dropdown_5' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={this.pull_M_Dropdown_5} textAttrName='汇报频率名称' valueAttrName='任务汇报频率代码' label='汇报频率' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_10' parentPath={this.props.fullPath} label='是否周期任务'>
                                        <VisibleERPC_CheckBox id='M_CheckBox_1' parentPath={this.props.fullPath} />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_11' parentPath={this.props.fullPath} label='周期单位'>
                                        <VisibleERPC_DropDown id='M_Dropdown_6' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={this.pull_M_Dropdown_6} textAttrName='周期单位' valueAttrName='任务周期单位代码' label='周期单位' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_12' parentPath={this.props.fullPath} label='周期数值'>
                                        <VisibleERPC_Text id='M_Text_3' parentPath={this.props.fullPath} type='float' precision='1' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_13' parentPath={this.props.fullPath} label='重要程度代码'>
                                        <VisibleERPC_DropDown id='M_Dropdown_7' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={this.pull_M_Dropdown_7} textAttrName='重要程度名称' valueAttrName='任务重要程度代码' label='重要程度代码' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_Button className='btn btn-primary erp-control ' id='button_2' parentPath={this.props.fullPath} onClick={this.modifybtn_onclick}>
                                        提交修改
									</VisibleERPC_Button>
                                    <VisibleERPC_Button className='btn btn-warning erp-control ' id='button_1' parentPath={this.props.fullPath} onClick={this.deletebtn_onclick}>
                                        撤销此任务
									</VisibleERPC_Button>
                                    <VisibleERPC_Button className='btn btn-primary erp-control ' id='button_0' parentPath={this.props.fullPath} onClick={this.button_0_onclick}>
                                        提交
									</VisibleERPC_Button>
                                </div>
                                {this.renderNavigater()}
                            </div>);
                    }
                }
            }
        }
        return retElem;
    }

}
function TKCForm_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    return retProps;
}
function TKCForm_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}