
class MyApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            keyword:0,
            arr:[],
            html: "Edit <b>me</b> !"
        };

        this.keyChanged = this.keyChanged.bind(this);
        this.messageboxonclick = this.messageboxonclick.bind(this);
    }

    keyChanged(ev){
        var target = ev.target;
        var keyword = target.value;

        this.setState({keyword:keyword});
    }
    handleChange(evt) {
        this.setState({ html: evt.target.value });
      };
    messageboxonclick(){
        
        var times =this.state.keyword;
        times = times+1;
        this.setState({keyword:times});
        var arr_list=[];
        arr_list.push(times);
        this.setState({arr:arr_list});
    }
    render(){
        return (
            <div className="w-100 h-100 d-flex flex-column">
                <div> 
                    <button onClick={this.messageboxonclick}>测试按钮</button>
                    
                <div className={'topMsg '+(this.state.keyword > 0 ? 'fadeIn' : 'fadeOut')} onClick={this.messageboxonclick}>
                    Info!Some text......
                </div>
                </div>
                <div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{overflow:'auto'}} >
                    {
                        this.state.arr.map((item,i)=>{
                            return(<div onClick={this.messageboxonclick} className={'topMsg '+(this.state.keyword > 0 ? 'fadeIn' : 'fadeOut')} key={i} code={item.code}>
                                    <div className='col-6'>{item.name}</div>
                                    <div className='col-6'>{item.code}</div>
                                </div>)
                        })
                    }
                </div>
                <div contentEditable className='li-instead-input'></div>
                    </div>
                
        );
    }
}

ReactDOM.render(<MyApp name='Hello3React' />, document.getElementById('reactRoot'));
