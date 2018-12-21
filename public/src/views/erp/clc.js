var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = true;

var appInitState={

};

function setValueHandler(state, action){
    console.log(action);
    var newCalcState = Object.assign({}, state[action.calcLabel]);
    newCalcState[action.valueLabel] = action.value;
    var newState = {};
    newState[action.calcLabel] = newCalcState;
    return Object.assign({}, state, newState);
}

const makeAction_SetValue = makeActionCreator('SETVALUE', 'calcLabel','valueLabel', 'value');

const appReducer = createReducer(appInitState, {
    SETVALUE:setValueHandler
});


let reducer = appReducer;
let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

class MyInputer_old extends React.PureComponent{
    constructor(props){
        super();

        this.state={
            value:props.value,
        };

        this.inputChangedHandler = this.inputChangedHandler.bind(this);
    }

    inputChangedHandler(ev){
        this.setState({
            value:ev.target.value,
        });
        this.props.onChanged(this.props.label, ev.target.value);
    }

    render(){
        return (
            <div className='d-flex'>
                <span>{this.props.label + ':'}</span>
                <input onChange={this.inputChangedHandler} style={this.props.inputStyle} type={this.props.type} value={this.state.value} />
            </div>
        );
    }
}

class MyInputer extends React.PureComponent{
    constructor(props){
        super();

        this.inputChangedHandler = this.inputChangedHandler.bind(this);
    }

    inputChangedHandler(ev){
        /*
        this.setState({
            value:ev.target.value,
        });
        */
       var newValue = ev.target.value;
       if(this.props.onChange){
            this.props.onChange(this.props.label, newValue);
       }
    }

    render(){
        return (
            <div className='d-flex'>
                <span>{this.props.label + ':'}</span>
                <input onChange={this.inputChangedHandler} style={this.props.inputStyle} type={this.props.type} value={this.props.value} />
            </div>
        );
    }
}

function MyInputer_mapStateToProps(state, ownprop){
    // 映射属性到App组件
    return {
    }
}

function MyInputer_dispathToProps(dispatch, ownprop){
    // 映射方法到App组件
    return {
    }
}

const VisibleMyInputer = ReactRedux.connect(MyInputer_mapStateToProps, MyInputer_dispathToProps)(MyInputer);

class MyClac extends React.PureComponent{
    constructor(props){
        super();
    }

    debuginfo(){
        return this.props.label + '[' + this.state.valA + ' ' + this.state.opt + ' ' + this.state.valB + ' = ' + this.state.ret + ']';
    }

    render(){
        return(
            <div className='d-flex w-100'>
                <span className='bg-primary text-light'>{this.props.label}</span>
                <VisibleMyInputer label='ValueA' type='number' value={this.props.valA} onChange={this.props.valueChanged} />
                <VisibleMyInputer label='Opt' type='text' value={this.props.opt} inputStyle={{width:'2em'}} onChange={this.props.valueChanged} />
                <VisibleMyInputer label='ValueB' type='number' value={this.props.valB} onChange={this.props.valueChanged} />
                <div>Result={this.props.ret}</div>
            </div>
        );
    }
}

function MyClac_mapStateToProps(state, ownprop){
    // 映射属性到App组件
    var calcState = state[ownprop.label];
    if(calcState == null){
        calcState = {
            ValueA:0,
            ValueB:0,
            Opt:'+',
        }
    }else{
        if(calcState.ValueA == null){
            calcState.ValueA = 0;
        }
        if(calcState.ValueB == null){
            calcState.ValueB = 0;
        }
        if(calcState.Opt == null){
            calcState.Opt = '+';
        }
    }
    var valA = parseFloat(calcState.ValueA);
    var valB = parseFloat(calcState.ValueB);
    var ret = 'NaN';
        switch(calcState.Opt){
            case '+':
                ret = valA + valB;
            break;
            case '-':
                ret = valA - valB;
            break;
            case '*':
                ret = valA * valB;
            break;
            case '/':
                ret = valA / valB;
            break;
        }

    return {
        valA:calcState.ValueA,
        valB:calcState.ValueB,
        opt:calcState.Opt,
        ret:ret,
    }
}

function MyClac_dispathToProps(dispatch, ownprop){
    // 映射方法到App组件
    return {
        valueChanged:(valLabel, value)=>{
            store.dispatch(makeAction_SetValue(ownprop.label, valLabel, value));
        }
    }
}

const VisibleMyClac = ReactRedux.connect(MyClac_mapStateToProps, MyClac_dispathToProps)(MyClac);

class MyClac_old extends React.PureComponent{
    constructor(props){
        super();

        this.state={
            valA:0,
            valB:0,
            opt:'+',
            ret:0
        }

        this.valueChangedHandler = this.valueChangedHandler.bind(this);
    }

    componentWillMount(){
        // 在组件被创建到浏览器时调用
        if(this.props.register)
        {
            this.props.register(this);
        }
    }

    componentWillUnmount(){
        // 在组件被从浏览器移出时调用
    }

    debuginfo(){
        return this.props.label + '[' + this.state.valA + ' ' + this.state.opt + ' ' + this.state.valB + ' = ' + this.state.ret + ']';
    }

    valueChangedHandler(label, newValue){
        var valA = this.state.valA;
        var valB = this.state.valB;
        var opt = this.state.opt;
        if(label == 'ValueA'){
            valA = newValue;
        }
        else if(label == 'ValueB'){
            valB = newValue;
        }
        else{
            opt = newValue;
        }

        valA = parseFloat(valA);
        valB = parseFloat(valB);
        var ret = 'NaN';
        switch(opt){
            case '+':
                ret = valA + valB;
            break;
            case '-':
                ret = valA - valB;
            break;
            case '*':
                ret = valA * valB;
            break;
            case '/':
                ret = valA / valB;
            break;
        }

        this.setState({
            valA:valA,
            valB:valB,
            ret:ret,
            opt:opt,
        });
    }

    render(){
        return(
            <div className='d-flex w-100'>
                <span className='bg-primary text-light'>{this.props.label}</span>
                <VisibleMyInputer label='ValueA' type='number' value={this.state.valA} onChanged={this.valueChangedHandler} />
                <VisibleMyInputer label='OptA' type='text' value={this.state.opt} onChanged={this.valueChangedHandler} inputStyle={{width:'2em'}} />
                <VisibleMyInputer label='ValueB' type='number' value={this.state.valB} onChanged={this.valueChangedHandler} />
                <div>Result={this.state.ret}</div>
            </div>
        );
    }
}

class App extends React.PureComponent{
    constructor(props){
        super();

        this.clickDebugBtn = this.clickDebugBtn.bind(this);

        //this.calcRef = React.createRef();
        //this.calcItem_arr = [];
    }
/*
    calMounted(item){
        this.calcItem_arr.push(item);
    }
*/

    clickDebugBtn(){
        console.log('调试信息');
        for(var i=0;i<this.props.count;++i){
            var calcState = store.getState()['计算器' + i];
            var info = '计算器' + i + '还未被计算过';
            if(calcState != null)
            {
                info = '计算器' + i + ':[' + calcState.ValueA + ' ' + calcState.Opt + ' ' + calcState.ValueB + ' = ?]';
            }
            console.log(info);
        }
        /*
        this.calcItem_arr.forEach(item=>{
            console.log(item.debuginfo());
        });     
        */
    }

    render(){
        var calc_arr = [];
        for(var i=0;i<this.props.count;++i){
            calc_arr.push(<VisibleMyClac key={i} label={'计算器'+ i} />);
        }
        return (
        <div className='d-flex w-100 flex-column'>
            {calc_arr}
            <button type='button' className='btn btn-dark' onClick={this.clickDebugBtn} >调试</button>
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