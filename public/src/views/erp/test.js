var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var isDebug = false;
var thisAppTitle = '功能测试页面';
var appServerUrl = '/erppage/server/test';

var appInitState = {
    loaded:false,
    ui:{
    },
    page1:{
    }
};

const appReducerSetting = {AT_FETCHBEGIN:fetchBeginHandler,AT_FETCHEND:fetchEndHandler,};
const appReducer = createReducer(appInitState, Object.assign(baseReducerSetting,appReducerSetting));

let reducer = Redux.combineReducers({ app: appReducer });
let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));



const appStateChangedAct_map = {
    'page1.testControl01.text':(state, path, newValue, visited)=>{
        setTimeout(() => {
            store.dispatch(fetchJsonPost(appServerUrl, {action: 'getPersonCode', name:newValue }, makeFTD_Prop('page1','text01','text',false),EFetchKey.FetchPropValue));
        }, 20);
    },
    'page1.text01.text':(state, path, newValue, visited)=>{
        setTimeout(() => {
            store.dispatch(fetchJsonPost(appServerUrl, {action: 'getPersonIdentify', id:newValue }, makeFTD_Prop('page1','text02','text',false),EFetchKey.FetchPropValue));
        }, 20);
    },
    'page1.text03.value':(state, path, newValue, visited)=>{
        return setStateByPath(state, MakePath('page1.text04.value'), '没想到' + newValue + '哈哈', visited);
    }
};

class TestControl extends React.PureComponent{
    constructor(props){
        super();
    }

    render(){
        return (<div className='list-group flex-grow-1 flex-shrink-1 autoScroll'>
            <button type='button' className='btn btn-dark flex-shrink-0' onClick={this.props.clickFresh}>刷新</button>
            {this.props.data.map(item=>{
                return (<div key={item[this.props.textName]} onClick={this.props.onClickItem} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item[this.props.textName] == this.props.selectedValue ? 'active' : '')}>
                    {item[this.props.textName]}
                    </div>);
            })}
            </div>);
    }
}

const selectTestControlData = (state, ownProp)=>{
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.id, {});
    return ctlState.data == null ? [] : ctlState.data;
};

const selectTestControlSelectedValue = (state, ownProp)=>{
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.id, {});
    return ctlState.selectedValue;
};

const TestControl_dataSelector = Reselect.createSelector(selectTestControlData, b => b);

function TestControl_mapstatetoprops(state, ownprops) {
    return {
        data: TestControl_dataSelector(state, ownprops),
        selectedValue: selectTestControlSelectedValue(state, ownprops)
    };
}

function TestControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.id;
    return {
        clickFresh: (ev) => {
            store.dispatch(fetchJsonPost(appServerUrl, {action: 'getData', ctrlId:'t_0' }, makeFTD_Prop('page1','testControl01','data'),EFetchKey.FetchPropValue));
        },
        onClickItem:(ev)=>{
            var text = ev.target.innerText;
            store.dispatch(makeAction_setStateByPath(text, ctrlBasePath + '.selectedValue'));
        }
    };
}

const VisibleTestControl = ReactRedux.connect(TestControl_mapstatetoprops, TestControl_dispatchtorprops)(TestControl);

class TextControl extends React.PureComponent{
    constructor(props){
        super();
    }

    renderContent(){
        if(this.props.fetching){
            return <i className='fa fa-spinner fa-pulse fa-fw' />
        }
        return this.props.text;
    }

    render(){
        return(
            <div className='d-flex flex-grow-1 flex-shrink-1'>
                <div className='flex-grow-0 flex-shrink-0'>
                    {this.props.label}
                </div>
                <div className='flex-grow-1 flex-shrink-1'>
                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

function TextControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, 'app.' + ownprops.parentPath + '.' + ownprops.id, {});
    return {
        text: ctlState.text,
        fetching: ctlState.fetching
    };
}

function TextControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.id;
    return {
    };
}

const VisibleTextControl = ReactRedux.connect(TextControl_mapstatetoprops, TextControl_dispatchtorprops)(TextControl);

function pullDL01DataSource(){
    store.dispatch(fetchJsonPost(appServerUrl, {action: 'getPersonList'}, makeFTD_Prop('page1','testControl01','options_arr'),EFetchKey.FetchPropValue));
}

function pullControl01DataSource(){
    store.dispatch(fetchJsonPost(appServerUrl, {action: 'getControl01_ds'}, makeFTD_Prop('page1','control01','options_arr'),EFetchKey.FetchPropValue));
}

function pullControl02DataSource(){
    store.dispatch(fetchJsonPost(appServerUrl, {action: 'getControl02_ds'}, makeFTD_Prop('page1','control02','options_arr'),EFetchKey.FetchPropValue));
}

class App extends React.PureComponent{
    constructor(props){
        super();
    }
    renderLoadingTip(){
        if(this.props.fetchState == null){
            return null;
        }
        var fetchState = this.props.fetchState;
        var tipElem = null;
        if(fetchState.err == null){
            tipElem = <div className='d-flex align-items-center'>
                    <i className='fa fa-spinner fa-pulse fa-fw fa-3x' />
                    {fetchState.tip}
                </div>
        }
        else{
            tipElem = <React.Fragment>
                    <div className='bg-danger text-light d-flex d-flex align-items-center'><i className='fa fa-warning fa-2x'/><h3>错误</h3></div>
                    <div className='dropdown-divider' />
                    <div className='d-flex align-items-center'>
                        {fetchState.err.info}
                    </div>
                    <button onClick={this.props.clickLoadingErrorBtn} type='button' className='btn btn-danger'>知道了</button>
                </React.Fragment>
        }
        return<div className='loadingTipBG'>
            <div className='loadingTip bg-light rounded d-flex flex-column'>
                {tipElem}
            </div>
        </div>
    }


    renderContent(){
        if(!this.props.loaded){
            return null;
        }

        return <React.Fragment>
                <VisibleERPC_LabeledControl id='test01_label' parentPath='page1' label='所属部门'>
                    <VisibleERPC_DropDown pullDataSource={pullControl01DataSource} label='选择员工姓名' id='control01' parentPath='page1' textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' groupAttr='员工在职状态,员工工时状态,所属系统名称,所属部门名称' recentCookieKey='recent_user' />
                </VisibleERPC_LabeledControl>
                <VisibleERPC_LabeledControl id='test01_label' parentPath='page1' label='项目名称'>
                    <VisibleERPC_DropDown pullDataSource={pullControl02DataSource} label='选择项目名称' id='control02' parentPath='page1' textAttrName='项目登记名称' valueAttrName='项目登记名称代码' groupAttr='项目运行阶段' recentCookieKey='recent_projects' />
                </VisibleERPC_LabeledControl>
                <div className='d-flex flex-shrink-0'>
                    <VisibleTextControl label='代码' id='text01' parentPath='page1' />
                    <VisibleTextControl label='身份证' id='text02' parentPath='page1' />
                </div>
                <VisibleERPC_LabeledControl id='test01_label' parentPath='page1' label='员工姓名'>
                    <VisibleERPC_DropDown pullDataSource={pullDL01DataSource} id='testControl01' parentPath='page1' textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' recentCookieKey='recent_user' />
                </VisibleERPC_LabeledControl>

                <div className='rowlFameOne'>
                    <div className='rowlFameOne_Left'>
                        总结时间
                    </div>
                    <div className='rowlFameOne_right'>
                    <VisibleERPC_Text id='text05' type='date' parentPath='page1' />
                    </div>
                </div>
                <div className='rowlFameOne' last={1}>
                    <div className='rowlFameOne_Left'>
                        耗用小时
                    </div>
                    <div className='rowlFameOne_right'>
                    <VisibleERPC_Text id='text06' type='number' parentPath='page1' />
                    </div>
                </div>
                <div className='d-flex flex-shrink-0'>
                    <div className='rowlFameOne' hor={1}>
                        <div className='rowlFameOne_Left'>
                            总结时间
                        </div>
                        <div className='rowlFameOne_right'>
                        <VisibleERPC_Text id='text05' type='date' parentPath='page1' />
                        </div>
                    </div>
                    <div className='rowlFameOne' hor={1}>
                        <div className='rowlFameOne_Left'>
                            耗用小时
                        </div>
                        <div className='rowlFameOne_right'>
                        <VisibleERPC_Text id='text06' type='number' parentPath='page1' />
                        </div>
                    </div>
                </div>
                <div className='rowlFameOne' last={1}>
                    <div className='rowlFameOne_Left'>
                        工作内容
                    </div>
                    <div className='rowlFameOne_right'>
                    <VisibleERPC_Text id='textContent' type='multiline' parentPath='page1' />
                    </div>
                </div>
                <VisibleERPC_LabeledControl id='test01_label' parentPath='page1' label='所属部门'>
                    <VisibleERPC_DropDown pullDataSource={pullControl01DataSource} label='选择员工姓名' id='control01' parentPath='page1' textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' groupAttr='员工在职状态,员工工时状态,所属系统名称,所属部门名称' recentCookieKey='recent_user' />
                </VisibleERPC_LabeledControl>
            </React.Fragment>
    }

    clickTest(){
        alert('test');
    }

    render(){
        return (
            <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100 pageFooter'>
                {this.renderLoadingTip()}
                <div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap'>
                    <h3>{thisAppTitle}</h3>
                    <button type='button' onClick={this.clickTest} className='btn btn-dark'>123</button>
                </div>
                <div className='d-flex flex-column flex-grow-1 flex-shrink-1 autoScroll'>
                    {this.renderContent()}
                </div>
                <div className='flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter'>
                    <h3>页脚</h3>
                    <button type='button' onClick={this.clickTest} className='btn btn-dark'>123</button>
                </div>
            </div>
        );
    }
}

function App_mapstatetoprops(state){
    return{
        loaded:state.app.loaded,
        fetchState:state.app.ui.fetchState,
    }
}

function App_distpatchtoprops(dispatch, ownprops) {
    return{
        clickLoadingErrorBtn:(ev)=>{
            dispatch(makeAction_setStateByPath(null, 'ui.fetchState'));
        }
    };
}

const VisiblaeApp = ReactRedux.connect(App_mapstatetoprops, App_distpatchtoprops)(App);

ErpControlInit();

ReactDOM.render(<Provider store={store}>
    <VisiblaeApp />
</Provider>, document.getElementById('reactRoot'));

store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'pageloaded' }, null, 'pageloaded', '页面加载中'));
