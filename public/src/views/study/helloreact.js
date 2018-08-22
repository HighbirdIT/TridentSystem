
class Calculator extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            a:0,
            b:0,
            rlt:0,
            process:'+'
        };

        this.ctlOnchange = this.ctlOnchange.bind(this);
        this.clickBtnHandler = this.clickBtnHandler.bind(this);
    }

    ctlOnchange(ev){
        var target = ev.target;
        var id = target.getAttribute('id');
        var newState = {};
        switch(id){
            case this.props.name + 'a_input':
            newState.a = target.value;
            break;
            case this.props.name +'b_input':
            newState.b = target.value;
            break;
            case this.props.name +'process':
            newState.process = target.value;
            break;
        }
        
        this.setState(newState);
        this.setState(
            nowState=>{
                var rlt = 0;
                switch(nowState.process){
                    case '+':
                    rlt = parseFloat(nowState.a) + parseFloat(nowState.b);
                    break;
                    case '-':
                    rlt = parseFloat(nowState.a) - parseFloat(nowState.b);
                    break;
                    case 'x':
                    rlt = parseFloat(nowState.a) * parseFloat(nowState.b);
                    break;
                    case '÷':
                    rlt = parseFloat(nowState.a) / parseFloat(nowState.b);
                    break;
                }
                return {rlt:rlt};
            }
        );
    }

    clickBtnHandler(ev){
        this.setState(
            nowState=>{
                var rlt = 0;
                switch(nowState.process){
                    case '+':
                    rlt = parseFloat(nowState.a) + parseFloat(nowState.b);
                    break;
                    case '-':
                    rlt = parseFloat(nowState.a) - parseFloat(nowState.b);
                    break;
                    case 'x':
                    rlt = parseFloat(nowState.a) * parseFloat(nowState.b);
                    break;
                    case '÷':
                    rlt = parseFloat(nowState.a) / parseFloat(nowState.b);
                    break;
                }
                return {rlt:rlt};
            }
        );
    }

    render(){
        return(
            <div name='CalculatorDiv' className="w-100 d-flex align-items-center">
                <div className='badge badge-primary'>{this.props.name}</div>
                <span>A:</span>
                <input type='Number' value={this.state.a} id={this.props.name + 'a_input'} onChange={this.ctlOnchange}></input>
                <select id={this.props.name + 'process'} className='ml-' style={{width:'10%'}} value={this.state.process} onChange={this.ctlOnchange}>
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                    <option value='x'>x</option>
                    <option value='÷'>÷</option>
                </select>
                <span className='ml-1'>B:</span>
                <input type='Number' value={this.state.b} id={this.props.name + 'b_input'} onChange={this.ctlOnchange}></input>
                {
                    this.props.hadbtn ? (<button style={{width:'200px'}} onClick={this.clickBtnHandler} type='button' className='ml-1 btn btn-primary'>=</button>) : null
                }
                <div className='ml-1'><h1>{this.state.rlt}</h1></div>
            </div>
        )
    }
}

class MyApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
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

    renderCalculator(count){
        var rlt=[];
        for(var i=1;i<=count;++i){
            rlt.push(<Calculator key={i} name={'计算器' + i} hadbtn={false} />);
        }
        return rlt;
    }

    render(){
        return this.renderCalculator(100);
        /*
        return (
        <div className="w-100 h-100 d-flex flex-column">
            <div>
                你点了:{this.state.count}次按钮
            </div>
            <button onClick={this.clickBtnHandler} type='button' className='btn btn-primary' name='add'>点击喜加一</button>
            <button onClick={this.clickBtnHandler} type='button' className='btn btn-danger' name='sub'>点击喜-1</button>
        </div>);
        */
    }
}

// React start
ReactDOM.render(<MyApp name='Hello3React'/>, document.getElementById('reactRoot'));
