class ProjectManagerPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            loaded:false,
            errinfo:'',
            info:'',
            selectTitle:'',
            keyword:'',
        };

        this.state = initState;
        this.panelBaseRef = React.createRef();
        autoBind(this);

    }

    freshCallBack(fetchData){
        console.log(fetchData);
        if(fetchData.success){
            this.setState({
                loaded:true,
                projects_arr:ReplaceIfNull(fetchData.json.data.projects,[]),
            });
        }
    }

    freshData(){
        fetchJsonPost('server', { action: 'getProjectsJson' }, this.freshCallBack);
    }

    panelPreShow(){
        if(!this.state.loaded){
            this.freshData();
        }
    }

    componentWillMount(){
    }

    componentWillUnmount(){

    }

    openProject(title){
        if(this.props.wantOpenProjectFun(title)){
            this.panelBaseRef.current.close();
        }
    }

    toggle() {
        this.panelBaseRef.current.toggle();
    }

    clickItemHandler(ev){
        var target = ev.target;
        var itemTitle = target.innerText;
        var projects_arr = this.state.projects_arr;
        var item = projects_arr.find(e=>{
            return e.title == itemTitle;
        });
        if(item){
            this.setState({
                selectTitle:itemTitle,
                selectItem:item,
            });
            if(this.preClickTick != null && this.preClickItem == item){
                var pastSec = (new Date() - this.preClickTick);
                if(pastSec < 400){
                    this.openProject(itemTitle);
                }
            }
        }

        this.preClickTick = new Date().getTime();
        this.preClickItem = item;
    }

    renderProjList(){
        var projects_arr = this.state.projects_arr;
        if(projects_arr == null){
            return null;
        }
        return projects_arr.map(item=>{
            return (<div onClick={this.clickItemHandler} className={'list-group-item list-group-item-action flex-grow-0 flex-shrink-0' + (this.state.selectTitle == item.title ? ' active' : '')} key={item.title}>{item.title}</div>);
        });
    }

    renderItemInfo(){
        var item = this.state.selectItem;
        if(item == null)
        {
            return null;
        }

        
        return <React.Fragment>
                <div>创建者:{item.creator}</div>
                <div>创建时间:{item.createTime}</div>
                <div className='flex-grow-1 flex-shrink-0 d-flex flex-column'>
                    <div>修改历史</div>
                    {
                        item.history && item.history.map((his,i)=>{
                            return (<div key={i}><span className='text-info'>{his.name}:</span><span className='text-light'>{his.time}</span></div>);
                        })
                    }
                </div>
            </React.Fragment>
    }

    render(){
        return(
            <FloatPanelbase title='项目管理' ref={this.panelBaseRef} initShow={false} preShow={this.panelPreShow} >
                <div className='d-flex flex-grow-1 flex-shrink-1 w-100 h-100'>
                    <div className='d-flex flex-column flex-grow-0 flex-shrink-0 h1-00' style={{width:"200px"}}>
                        <div className='d-flex flex-grow-0 flex-shrink-0'>
                            <span>搜</span>
                            <div className='flex-grow-1 flex-shrink-1'>
                                <input className='w-100' />
                            </div>
                        </div>
                        <div className='flex-grow-1 flex-shrink-1 autoScroll'>
                            <div className='d-flex flex-column list-group'>
                                {
                                    this.renderProjList()
                                }
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column flex-grow-1 flex-shrink-1 autoScroll'>
                        {this.renderItemInfo()}
                    </div>
                </div>
            </FloatPanelbase>
        );
    }
}

class CreateProjectPanel extends React.PureComponent{
    constructor(props) {
        super(props);
        var initState = {
            title:'',
        };

        this.state = initState;
        this.panelBaseRef = React.createRef();
        autoBind(this);
    }

    toggle() {
        this.panelBaseRef.current.toggle();
    }

    inputChangeHandler(ev){
        if(this.posting){
            this.setState({
                info:'稍等，正在创建中'
            });
            return;
        }
        this.setState({
            title:ev.target.value,
        });
    }

    freshCallBack(respon){
        console.log(respon);
        if(respon.success){
            var jsonData = respon.json;
            if(jsonData.err){
                this.setState({
                    errinfo:jsonData.err.info,
                });
            }else{
                this.setState({
                    errinfo:'',
                    info:'创建成功'
                });
            }
        }
        this.posting = false;
    }

    clickConfirmHandler(ev){
        if(this.posting){
            this.setState({
                info:'稍等，正在创建中'
            });
            return;
        }
        var title = this.state.title.trim();
        if(title.length < 4){
            this.setState({
                errinfo:'长度要在4位以上'
            });
            return;
        }
        this.posting = true;

        this.setState({
            info:'创建中',
            errinfo:'',
        });

        fetchJsonPost('server', { action: 'createProject', title:title }, this.freshCallBack);
        return;
    }

    render(){
        return(
            <FloatPanelbase title='创建项目' ref={this.panelBaseRef} initShow={false} sizeable={false} width={320} height={160} >
                <div>新项目名称:<span className='text-danger'>{this.state.errinfo}</span></div>
                <div>
                    <input className='w-100' value={this.state.title} onChange={this.inputChangeHandler} ></input>
                </div>
                <div className='w-100'>
                    <button type='button' onClick={this.clickConfirmHandler} className='btn btn-dark w-100' >{'确认创建'}</button>
                </div>
                <div className='text-success'>{this.state.info}</div>
            </FloatPanelbase>
        );
    }
}