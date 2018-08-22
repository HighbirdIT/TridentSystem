class MyApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            keyword:'',
            selectedCode:-1,
        };

        this.keyChanged = this.keyChanged.bind(this);
        this.litItemClick = this.litItemClick.bind(this);
    }

    keyChanged(ev){
        var target = ev.target;
        var keyword = target.value;

        this.setState({keyword:keyword});
    }

    litItemClick(ev){
        var target = ev.target;
        if(!target.hasAttribute('code')){
            target = target.parentElement;
        }
        var code = target.getAttribute('code');
        this.setState({selectedCode:code});
    }

    render(){
        var filted_arr = this.props.dataarr.filter(item=>{
            return this.state.keyword == '' || this.state.keyword == ' ' || item.name.indexOf(this.state.keyword) >= 0;
        });
        var selectedItem = this.props.dataarr.find(item=>{
            return this.state.selectedCode == item.code;
        });

        return (
            <div className="w-100 h-100 d-flex flex-column">
                <div className='bg-primary p-1 text-light d-flex felx-grow-0 flex-shrink-0 align-items-center'> 
                    <span htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >关键字:</span>
                    <input className='ml-1 flex-grow-1 flex-shrink-1' type='text' id='keyword' name='keyword' onChange={this.keyChanged} />
                    <span >过滤出{filted_arr.length}条</span>
                    <span >{selectedItem ? '"' + selectedItem.name + '"' : ''}</span>
                </div>
                <div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{overflow:'auto'}} >
                    {
                        filted_arr.map((item,i)=>{
                            return(<div onClick={this.litItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' + (item.code == this.state.selectedCode ? ' active' : '')} key={i} code={item.code}>
                                    <div className='col-6'>{item.name}</div>
                                    <div className='col-6'>{item.code}</div>
                                </div>)
                        })
                    }
                </div>
            </div>
        );
    }
}

var data=[
    {name:'叶媛媛',code:1}
,{name:'潘佳伟',code:2}
,{name:'陈怡',code:3}
,{name:'沈珏茹',code:4}
,{name:'顾熙',code:5}
,{name:'沈晓霞',code:6}
,{name:'赵智淼',code:7}
,{name:'唐媛',code:8}
,{name:'李烨',code:9}
,{name:'王继红',code:10}
,{name:'张琳',code:11}
,{name:'周玲',code:12}
,{name:'胡玲玲',code:13}
,{name:'卢彩琴',code:14}
,{name:'李悦',code:15}
,{name:'陈晟',code:16}
,{name:'金茂永',code:17}
,{name:'肖康',code:18}
,{name:'郭其宝',code:19}
,{name:'李旭',code:20}
,{name:'陈伟',code:21}
,{name:'李晶晶',code:22}
,{name:'吴溢华',code:23}
,{name:'吕承梅',code:24}
,{name:'陆敏',code:25}
,{name:'吴安琴',code:26}
,{name:'张霞',code:27}
,{name:'谢颖清',code:28}
,{name:'冯鑫',code:29}
,{name:'张亚飞',code:30}
,{name:'孙运姣',code:31}
,{name:'杨振兴',code:32}
,{name:'梁秀兰',code:33}
,{name:'赵志良',code:34}
,{name:'张贵',code:35}
,{name:'金鑫华',code:36}
,{name:'纪爱光',code:37}
,{name:'谷德明',code:38}
,{name:'李士娟',code:39}
,{name:'石草林',code:40}
,{name:'陈虎',code:41}
,{name:'纪爱军',code:42}
,{name:'张光运',code:43}
,{name:'彭善文',code:44}
,{name:'孙红闯',code:45}
,{name:'陈光华',code:46}
,{name:'龙腾云',code:47}
,{name:'盛琴',code:48}
,{name:'田石亚',code:49}
,{name:'王敬',code:50}
];

ReactDOM.render(<MyApp name='Hello3React' dataarr={data}/>, document.getElementById('reactRoot'));
