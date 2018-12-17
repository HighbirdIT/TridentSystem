var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var pageInitState = {

};

const mainReducer = createReducer(pageInitState, {
    WELCOMINFOCHANGED: welcomInfoChangedHandler,
});

const WELCOMINFOCHANGED = 'WELCOMINFOCHANGED';
const welcomInfoChanged = makeActionCreator(WELCOMINFOCHANGED, 'name', 'value');
function welcomInfoChangedHandler(state, action) {
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, {
        [action.name]: action.value
    });
}

let reducer = Redux.combineReducers({ main: mainReducer });
let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

class ThisPage extends React.PureComponent{
    render(){
        return (<div>Hello World</div>);
    }
}

ReactDOM.render(<Provider store={store}>
    <ThisPage />
</Provider>, document.getElementById('reactRoot'));

//store.dispatch(fetchJsonPost('onlineinterview_process', { action: 'pageinit' }, 'pageiniting'));
