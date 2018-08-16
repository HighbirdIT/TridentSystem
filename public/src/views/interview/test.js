var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;
var Grid = AMUITouch.Grid;
var Col = AMUITouch.Col;
var Card = AMUITouch.Card;
var Icon = AMUITouch.Icon;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;


class MySelection extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {isOpen:false,id:123};
        this.onClickHandler = this.onClickHandler.bind(this);
        this.onBlurHandler = this.onBlurHandler.bind(this);
        this.onFocusHandler = this.onFocusHandler.bind(this);
    }

    onClickHandler(){
        this.setState(currentState => ({
            isOpen: !currentState.isOpen
        }));
        this.setState(currentState => ({
            id: 3456
        }));
        var g= 0;
    }

    onBlurHandler() {
        this.timeOutId = setTimeout(() => {
          this.setState({
            isOpen: false
        });
    })}
    
    
    onFocusHandler() {
        clearTimeout(this.timeOutId);
    }

    render(){
        return(
            <div onBlur={this.onBlurHandler} 
            onFocus={this.onFocusHandler}>

            <button onClick={this.onClickHandler} 
                    aria-haspopup="true" 
                    aria-expanded={this.state.isOpen}>
            Select an option
            </button>
            {this.state.isOpen ? (
            <ul>
                <li>Option 1</li>
                <li>Option 2</li>
                <li>Option 3</li>
            </ul>
            ) : null}
            {them=><div>dferer</div>}
        </div>
        );
    }
}

const CHANGED = 'CHAGNED';
const mk_changeAction = makeActionCreator(CHANGED, 'label','value');

function reducer(state,action){
    if(state == null){
        return {
            A:'',
            B:'',
            C:'',
        };
    }
    console.log(action);
    switch(action.type){
      case CHANGED:
        return updateObject(state, {[action.label]:action.value});
      break;
    }
    return state;
}


let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

const themes = {
    light: {
      foreground: '#000000',
      background: '#eeeeee',
    },
    dark: {
      foreground: '#ffffff',
      background: '#222222',
    },
};
  
const ThemeContext = React.createContext({
    theme:themes.light,
    toggleFun:()=>{},
    }
);

function ThemedButton(props) {
    return (
      <ThemeContext.Consumer>
        {({theme,toggleFun}) => (
          <button
            {...props}
            onClick={toggleFun}
            style={{backgroundColor: theme.background}}
          />
  
        )}
      </ThemeContext.Consumer>
    );
}

function Toolbar(props) {
    return (
      <ThemedButton>
        Change Theme
      </ThemedButton>
    );
  }
  
  class App extends React.Component {
    constructor(props) {
      super(props);
      
      var g = this.feret.sdfer;
      this.toggleTheme = this.toggleTheme.bind(this);
      this.state = {
        themeContext: {theme:themes.light,toggleFun:this.toggleTheme},
      };
    }

    toggleTheme(){
        console.log('toggle');
        this.setState(state => ({
            themeContext:{
                theme:state.themeContext.theme === themes.dark ? themes.light : themes.dark,
                toggleFun:this.toggleTheme
            }
          }));
    }
  
    render() {
      // The ThemedButton button inside the ThemeProvider
      // uses the theme from state while the one outside uses
      // the default dark theme
      return (
        <View>
          <div>
            <h2>Wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            dfgerteryyrert
          </details>
            </div>
        
          <ThemeContext.Provider value={this.state.themeContext}>
            <Toolbar />
          </ThemeContext.Provider>
          <Container>
            <ThemedButton >
                Button
            </ThemedButton>
          </Container>
        </View>
      );
    }
  }

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      // Display fallback UI
      this.setState({ hasError: true, errInfo:error });
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
      return (<div>
        <h1>Something went wrong.</h1>
        <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errInfo.toString()}
          </details>
        </div>);
      }
      return this.props.children;
    }
}

class MyInputor extends React.Component{
  constructor(props){
    super(props);
    this.state = {};
  }


  render(){
    return(
      <React.Fragment>
        <div>
      <span>input{this.props.label}</span>
      <input name={this.props.label} type="text" value={this.props.value} onChange={this.props.onChanged} />
      <div>value:{this.props.value}</div>
      </div>
      </React.Fragment>
    )
  }
}

function MyInputor_mapstatetoprops(state, ownprops){
  return {value:state[ownprops.label]};
}

function MyInputor_mapdispatchtoprops(dispatch, ownprops){
  return{
    onChanged:(inputItem)=>{
      dispatch(mk_changeAction(ownprops.label, inputItem.target.value));
      inputItem.preventDefault();
    }
  }
}

const VisibleMyInputor = ReactRedux.connect(MyInputor_mapstatetoprops, MyInputor_mapdispatchtoprops)(MyInputor);

ReactDOM.render(<Provider store={store}>
  <ErrorBoundary>
    <VisibleMyInputor label='A' />
    <VisibleMyInputor label='B' />
    <VisibleMyInputor label='C' />
  </ErrorBoundary>
</Provider>, document.getElementById('root'));
