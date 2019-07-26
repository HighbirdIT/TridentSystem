class DropDownControl extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            selectedCode: -1,
            selectedText: '        ',
            data_arr: [],
            dataLoaded: false
        };

        this.keyChanged = this.keyChanged.bind(this);
        this.litItemClick = this.litItemClick.bind(this);
        this.dropDowmDivRef = this.dropDowmDivRef.bind(this);

        this.dropDownOpened = this.dropDownOpened.bind(this);
        this.dropDownClosed = this.dropDownClosed.bind(this);
    }


    dropDownOpened() {
        console.log('菜单被打开了');

        var timeout = Math.min(Math.max(30, timeout), 120) * 1000;
        var self = this;
        this.setState(
            {
                dataLoaded: false,
            }
        );

        fetch('helloProcess', {
            method: "POST",
            body: JSON.stringify({
                tableName: 'T903B物资仓库名称',
                action: 'getDataTable',
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(
            function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error(response.statusText);
                    return null;
                }
            }
        ).then(
            function (rltJson) {
                var data_arr = rltJson.data;
                self.setState(
                    {
                        data_arr: data_arr.map(item => {
                            return { name: item.物资仓库名称, code: item.物资仓库名称代码 }
                        }),
                        dataLoaded: true,
                    }
                );
            }
        );
    }

    dropDownClosed() {
        console.log('菜单被关闭了');
    }

    dropDowmDivRef(elem) {
        $(elem).on('shown.bs.dropdown', this.dropDownOpened);
        $(elem).on('hidden.bs.dropdown', this.dropDownClosed);
    }

    keyChanged(ev) {
        var target = ev.target;
        var keyword = target.value;

        this.setState({ keyword: keyword });
    }

    litItemClick(ev) {
        var target = ev.target;
        if (!target.hasAttribute('code')) {
            target = target.parentElement;
        }
        var code = target.getAttribute('code');
        this.setState({ selectedCode: code, selectedText: target.textContent, keyword: '' });
    }

    renderDropDown(filted_arr, selectedItem) {
        if (!this.state.dataLoaded) {
            return (<div>通讯中请等待</div>)
        }
        return (
            <React.Fragment>
                <div className='d-flex'>
                    <span htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >搜索:</span>
                    <input className='ml-1 flex-grow-1 flex-shrink-1' type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.keyChanged} />
                </div>
                <div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{ overflow: 'auto', height: '300px' }} >
                    {
                        filted_arr.map((item, i) => {
                            return (<div onClick={this.litItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' + (item.code == this.state.selectedCode ? ' active' : '')} key={i} code={item.code}>
                                <div>{item.name}</div>
                            </div>)
                        })
                    }
                </div>
            </React.Fragment>)
    }

    render() {
        var filted_arr = this.state.data_arr.filter(item => {
            return this.state.keyword == '' || this.state.keyword == ' ' || item.name.indexOf(this.state.keyword) >= 0;
        });
        var selectedItem = this.state.data_arr.find(item => {
            return this.state.selectedCode == item.code;
        });

        return (
            <div className="d-flex flex-column" style={{ width: this.props.width, height: this.props.height }}>
                <div className='d-flex flex-grow-0 flex-shrink-0'>
                    {this.props.label}
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 mt-1'>
                    <div className='flex-grow-1 flex-shrink-1 d-flex btn-group' ref={this.dropDowmDivRef}>
                        <button type='button' className='btn btn-dark flex-grow-1 flex-shrink-1 ' data-toggle="dropdown" >{this.state.selectedText}</button>
                        <button type='button' className='btn btn-dark flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' data-toggle="dropdown" data-reference="parent" ></button>

                        <div className="dropdown-menu" id='dropContentDiv'>
                            {this.renderDropDown(filted_arr, selectedItem)}
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

/*
var t = (<div className='bg-primary p-1 text-light d-flex felx-grow-0 flex-shrink-0 align-items-center'> 
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
</div>);
*/

class MyApp extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (<DropDownControl label='物资仓库名称' width='100px' height='60px' />);
    }
}

var data = [
    { name: '叶媛媛', code: 1 }
    , { name: '潘佳伟', code: 2 }
    , { name: '陈怡', code: 3 }
    , { name: '沈珏茹', code: 4 }
    , { name: '顾熙', code: 5 }
    , { name: '沈晓霞', code: 6 }
    , { name: '赵智淼', code: 7 }
    , { name: '唐媛', code: 8 }
    , { name: '李烨', code: 9 }
    , { name: '王继红', code: 10 }
    , { name: '张琳', code: 11 }
    , { name: '周玲', code: 12 }
    , { name: '胡玲玲', code: 13 }
    , { name: '卢彩琴', code: 14 }
    , { name: '李悦', code: 15 }
    , { name: '陈晟', code: 16 }
    , { name: '金茂永', code: 17 }
    , { name: '肖康', code: 18 }
    , { name: '郭其宝', code: 19 }
    , { name: '李旭', code: 20 }
    , { name: '陈伟', code: 21 }
    , { name: '李晶晶', code: 22 }
    , { name: '吴溢华', code: 23 }
    , { name: '吕承梅', code: 24 }
    , { name: '陆敏', code: 25 }
    , { name: '吴安琴', code: 26 }
    , { name: '张霞', code: 27 }
    , { name: '谢颖清', code: 28 }
    , { name: '冯鑫', code: 29 }
    , { name: '张亚飞', code: 30 }
    , { name: '孙运姣', code: 31 }
    , { name: '杨振兴', code: 32 }
    , { name: '梁秀兰', code: 33 }
    , { name: '赵志良', code: 34 }
    , { name: '张贵', code: 35 }
    , { name: '金鑫华', code: 36 }
    , { name: '纪爱光', code: 37 }
    , { name: '谷德明', code: 38 }
    , { name: '李士娟', code: 39 }
    , { name: '石草林', code: 40 }
    , { name: '陈虎', code: 41 }
    , { name: '纪爱军', code: 42 }
    , { name: '张光运', code: 43 }
    , { name: '彭善文', code: 44 }
    , { name: '孙红闯', code: 45 }
    , { name: '陈光华', code: 46 }
    , { name: '龙腾云', code: 47 }
    , { name: '盛琴', code: 48 }
    , { name: '田石亚', code: 49 }
    , { name: '王敬', code: 50 }
];

ReactDOM.render(<MyApp name='Hello3React' />, document.getElementById('reactRoot'));
