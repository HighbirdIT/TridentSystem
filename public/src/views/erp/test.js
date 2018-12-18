var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var isDebug = false;
var fetchTracer={};
var thisAppTitle = '功能测试页面';

var appInitState = {
    loaded:false,
    ui:{
    },
    page1:{
    }
};

const appReducer = createReducer(appInitState, {
    AT_FETCHBEGIN: fetchBeginHandler,
    AT_FETCHEND: fetchEndHandler,
    AT_SETSTATEBYPATH:setStateByPathHandler,
    AT_SETMANYSTATEBYPATH:setManyStateByPathHandler,
});


function fetchBeginHandler(state, action){
    //console.log('fetchBeginHandler');
    var retState = state;
    var triggerData = action.fetchData.triggerData;
    var fetchIdentify = null;

    var isModel = true;
    if(triggerData){
        isModel = triggerData.isModel != false;
        if(triggerData.base != null && triggerData.id != null && triggerData.propName != null){
            fetchIdentify = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
        }
    }
    if(isModel){
        var newUI = Object.assign({}, retState.ui);
        newUI.fetchState = action.fetchData;
        retState.ui = newUI;
        retState = Object.assign({}, retState);
    }

    if(triggerData)
    {
        if(triggerData.base != null && triggerData.id != null){
            var propPath = triggerData.base + '.' + triggerData.id;
            retState = setManyStateByPath(retState, propPath, {
                fetching:true,
                fetchingpropname:triggerData.propName,
            });
        }
    }

    if(fetchIdentify)
    {
        fetchTracer[fetchIdentify] = action.fetchData;
    }
    return retState;
}

function fetchEndHandler(state, action){
    //console.log('fetchEndHandler');
    var retState = state;
    var isModel = true;
    var fetchIdentify = null;
    var triggerData = action.fetchData.triggerData;
    if(triggerData){
        isModel = triggerData.isModel != false;
        if(triggerData.base != null && triggerData.id != null && triggerData.propName != null){
            fetchIdentify = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
        }
    }
    if(fetchIdentify){
        if(fetchTracer[fetchIdentify] != action.fetchData){
            console.warn('丢弃了一个fetchResult');
            return state;
        }
    }

    if(action.err != null)
    {
        console.warn(action.err);
        if(triggerData)
        {
            var propPath = triggerData.base + '.' + triggerData.id + '.fetching';
            retState = setStateByPath(retState, propPath, false);
        }

        if(isModel){
            var newFetchState = Object.assign({}, retState.ui.fetchState);
            newFetchState.err = action.err;
            retState.ui.fetchState = newFetchState;
        }
        return retState == state ? Object.assign({}, retState) : retState;
    }

    if(triggerData)
    {
        if(triggerData.base != null && triggerData.id != null){
            var propPath = triggerData.base + '.' + triggerData.id + '.fetching';
            retState = setStateByPath(retState, propPath, false);
        }
    }

    if(isModel){
        retState.ui = Object.assign({}, retState.ui, {fetchState:null});
    }

    switch(action.key){
        case 'pageloaded':
            return Object.assign({},retState,{loaded:true});
        case 'fetchpropvalue':
        {
            var propPath = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
            return setStateByPath(retState, propPath, action.json.data);
        }
    }
    return retState == state ? Object.assign({}, retState) : retState;
}

function setStateByPathHandler(state, action){
    return setStateByPath(state, action.path, action.value);
}

function setManyStateByPathHandler(state, action){
    return setManyStateByPath(state, action.path, action.value);
}

function controlStateChanged(state, path, newValue, visited = {}){
    if(visited[path] != null){
        console.err('controlStateChanged回路访问:' + path);
    }
    var retState = state;
    switch(path){
        case 'page1.testControl01.text':
            setTimeout(() => {
                store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonCode', name:newValue }, {
                    base:'page1',
                    id:'text01',
                    propName:'text',
                    isModel:false,
                },
                'fetchpropvalue'));
            }, 20);
        break;
        case 'page1.text01.text':
            setTimeout(() => {
                store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonIdentify', id:newValue }, {
                    base:'page1',
                    id:'text02',
                    propName:'text',
                    isModel:false,
                },
                'fetchpropvalue'));
            }, 20);
        break;
    }
    return retState;
}

let reducer = Redux.combineReducers({ app: appReducer });
let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

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
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.ctrlID, {});
    return ctlState.data == null ? [] : ctlState.data;
};

const selectTestControlSelectedValue = (state, ownProp)=>{
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.ctrlID, {});
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
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {
        clickFresh: (ev) => {
            store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getData', ctrlId:'t_0' }, {
                base:'page1',
                id:'testControl01',
                propName:'data'
            },
            'fetchpropvalue'));
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
    var ctlState = getStateByPath(state, 'app.' + ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return {
        text: ctlState.text,
        fetching: ctlState.fetching
    };
}

function TextControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {
    };
}

const VisibleTextControl = ReactRedux.connect(TextControl_mapstatetoprops, TextControl_dispatchtorprops)(TextControl);

function pullDL01DataSource(){
    store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonList' }, {
        base:'page1',
        id:'testControl01',
        propName:'options_arr',
        isModel:true,
    },
    'fetchpropvalue'));
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
                <VisibleERPC_DropDownControl pullDataSource={pullDL01DataSource} ctrlID='testControl01' label='员工姓名' parentPath='page1' textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' />
                <div className='d-flex flex-shrink-0'>
                    <VisibleTextControl label='代码' ctrlID='text01' parentPath='page1' />
                    <VisibleTextControl label='身份证' ctrlID='text02' parentPath='page1' />
                </div>
            </React.Fragment>
    }

    render(){
        return (
            <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>
                {this.renderLoadingTip()}
                <div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap'>
                    <h3>{thisAppTitle}</h3>
                </div>
                <div className='d-flex flex-column flex-grow-1 flex-shrink-1 hidenOverflow'>
                    {this.renderContent()}
                </div>
                <div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light'>
                    <h3>页脚</h3>
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
