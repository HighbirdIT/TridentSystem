
class MyApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            count:0,
        };

        this.clickBtnHandler = this.clickBtnHandler.bind(this);
    }

    clickBtnHandler(ev){
        var theBtn = ev.target;
        var newCount = this.state.count;
        if(theBtn.getAttribute('name') == 'add'){
            newCount += 1;
        }
        else if(theBtn.getAttribute('name') == 'sub'){
            newCount -= 1;
        }
        
        this.setState({count:newCount });
    }

    render(){
        return (
        <div className="w-100 h-100 d-flex flex-column">
            <div>
                你点了:{this.state.count}次按钮
            </div>
            <button onClick={this.clickBtnHandler} type='button' className='btn btn-primary' name='add'>点击喜加一</button>
            <button onClick={this.clickBtnHandler} type='button' className='btn btn-danger' name='sub'>点击喜-1</button>
        </div>);
    }
}

// React start
ReactDOM.render(<MyApp name='Hello3React'/>, document.getElementById('reactRoot'));
