var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;

var appInitState={
};


function appReducer(state,action){
    if(state == null){
        // 返回默认state
        return{
            page:{
                text01:'',
            }
        };
    }
    if(action.type != 'InputChanged'){
        return state;   // 我不管
    }
    var newSate = Object.assign({}, state);
    newSate.page = Object.assign({}, state.page, {text01:action.value});
    console.log(action);
    return newSate;
}


let store = Redux.createStore(appReducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

class Page extends React.PureComponent{
    constructor(props){
        super();
        autoBind(this);
    }

    inputChanged(ev){
        //console.log(ev.target.value);
        store.dispatch({type:'InputChanged',value:ev.target.value});
    }

    render(){
        return (<input type='text' onChange={this.inputChanged} value={this.props.pageState.text01} />);
    }
}

function Page_mapStateToProps(state, ownprop){
    // 映射属性到App组件
    //var pageState = state.page;
    return {
//        inputValue:state.page.text01,
        pageState:state.page,
    }
}

function Page_dispathToProps(dispatch, ownprop){
    // 映射方法到App组件
    return {

    }
}

const VisiblePage = ReactRedux.connect(Page_mapStateToProps, Page_dispathToProps)(Page);

class App extends React.PureComponent{
    constructor(props){
        super();
    }

    render(){
        return (
        <div className='d-flex w-100 flex-column'>
            <VisiblePage />
        </div>);
    }
}

function App_mapStateToProps(state, ownprop){
    // 映射属性到App组件
    return {

    }
}

function App_dispathToProps(dispatch, ownprop){
    // 映射方法到App组件
    return {

    }
}

const VisibleApp = ReactRedux.connect(App_mapStateToProps, App_dispathToProps)(App);

ReactDOM.render(<Provider store={store}>
    <VisibleApp count={5} />
</Provider>, document.getElementById('reactRoot'));