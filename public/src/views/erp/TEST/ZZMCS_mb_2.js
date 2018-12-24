var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug=false;
var appServerUrl='/erppage/server/ZZMCS_server';
var thisAppTitle='赵智淼测试';
var appInitState;
var appReducerSetting={};
var appReducer=createReducer(appInitState, Object.assign(baseReducerSetting,appReducerSetting));;
var reducer=Redux.combineReducers({ app: appReducer });;
var store=Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));;


class App extends React.PureComponent{
	constructor(props){
		super(props)
	}
	render(){
		return (<div>{thisAppTitle}</div>)
	}

}
function App_mapstatetoprops(state){
	return {};
}
function App_disptchtoprops(dispatch,ownprops){
	return {};
}
const VisibleApp = ReactRedux.connect(App_mapstatetoprops, App_disptchtoprops)(App);

ErpControlInit();
ReactDOM.render(<Provider store={store}>
	<VisiblaeApp />
</Provider>, document.getElementById('reactRoot'));
