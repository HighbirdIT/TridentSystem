var mianServerPath = '/erppage/server/main';
var nowuserid;
var nowusername;

window.onerror=(msg, url, line)=>{
    //alert('onError:' + msg + ',' + url + ',' + line);
    //alert(document.getElementsByTagName('html')[0].innerHTML);
    //document.getElementById('reactRoot');
    //mainAppRef.current.setState({htmlerr : document.getElementsByTagName('html')[0].innerHTML});
    //var docStr = document.getElementsByTagName('html')[0].innerHTML;
    nativeFetchJson(false,mianServerPath, {action:'reportError',msg:msg,url:url,line:line});
}

class C_ModelTip extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            info:'1234',
            show:false,
        };

        autoBind(this);
    }

    showInfo(str, btnLabel, btnCallBack){
        var hadBtn = btnCallBack != null || btnLabel != null;
        this.setState(
            {
                show:true,
                info:str,
                hadBtn:hadBtn,
                btnLabel:!hadBtn ? null : btnLabel == null ? 'OK' : btnLabel,
                btnCallBack:btnCallBack,
            }
        );
    }

    close(){
        this.setState({
            show:false,
        });
    }

    clickBtnHandler(ev){
        this.setState({
            show:false,
        });
        var callBack = this.state.btnCallBack;
        if(callBack){
            setTimeout(() => {
                callBack();
            }, 20);
        }
    }

    render(){
        if(this.state.show == false){
            return null;
        }
        return (<div className='fixedBackGround'>
            <div className='loadingTip bg-light rounded flex-column d-flex'>
                {this.state.info}
                {
                    this.state.hadBtn &&
                    <button className='flex-grow-0 flex-shrink-0 btn btn-primary' onClick={this.clickBtnHandler}>
                        {this.state.btnLabel}
                    </button>
                }
            </div>
        </div>);
    }
}

function freshPage(){
    location.reload();
}

function userLogSuccess(userid, username){
    clearModelTip();
    mainAppRef.current.userLogin(userid, username);    
}

var mainAppRef = React.createRef();
var modelTipRef = React.createRef();

function showModelTip(info, btnLabel, btnCallBack){
    if(modelTipRef.current){
        modelTipRef.current.showInfo(info, btnLabel, btnCallBack);
    }
}

function clearModelTip(){
    if(modelTipRef.current){
        modelTipRef.current.close();
    }
}

class C_ProjectList extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            items_arr:[],
        };

        autoBind(this);
    }

    fresh(){
        this.setState({
            loading:true,
            fetchErrInfo:null,
            items_arr:[]
        });
        nativeFetchJson(false,mianServerPath, {action:'getMenu'}).then(
            ret=>{
                console.log(ret);
                var newState = {
                    loading:false,
                    items_arr:ret.data,
                };
                if(ret.err){
                    newState.fetchErrInfo = '加载数据失败:' + ret.err.info;
                }
                this.setState(newState);
            }
        );
    }

    clickProjLinkHandler(ev){
        var code = getAttributeByNode(ev.target, 'd-code');
        if(code == null){
            return;
        }
        var projItem = this.state.items_arr.find(x=>{return x.系统方案名称代码 == code});
        if(projItem == null){
            return;
        }
        var targetPath = '/erppage/';
        if(projItem.移动端名称.length > 0){
            targetPath += 'mb/' + projItem.方案英文名称;
        }
        else{
            targetPath += 'pc/' + projItem.方案英文名称;
        }
        location.href = targetPath;
    }

    render(){
        if(this.state.loading){
            return <div className='flex-grow-1 flex-shrink-1'><h3 className='d-flex align-items-center'><i className='fa fa-refresh fa-spin' />菜单加载中</h3></div>
        }
        if(this.state.fetchErrInfo){
            return <div className='text-danger'>{this.state.fetchErrInfo}</div>
        }
        
        var items_arr = this.state.items_arr;
        if(items_arr == null){
            return null;
        }
        return <div className='list-group flex-grow-1 flex-shrink-1 autoScroll_Touch'>
                {
                    items_arr.map(item=>{
                        var label = item.系统方案名称;
                        var canClick = true;
                        var appendElem = null;
                        if(item.完成确认状态 == '0'){
                            if(item.桌面端名称.length > 0 || item.移动端名称.length > 0){
                                appendElem = <span className='badge badge-info'>开发中</span>
                            }
                            else{
                                appendElem = <span className='badge badge-secondary'>不可用</span>
                            }
                        }
                        return <div key={item.系统方案名称代码} onClick={canClick ? this.clickProjLinkHandler : null} d-code={item.系统方案名称代码} className='d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action'>{appendElem}{label}</div>
                    })
                }
            </div>
    }
}

class MainApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            infos:[],
        };
        this.projectListRef = React.createRef();

        autoBind(this);
    }

    userLogin(userid, username){
        if(userid > 0){
            var query = getQueryObject();
            if(query.goto){
                var gotourl = query.goto;
                var search = '';
                for(var si in query){
                    if(si != 'goto' && query[si]){
                        search += (search.length == 0 ? '?' : '&') + si + '=' + query[si];
                    }
                }
                location.href = gotourl + search;
                return;
            }
            goHomePage();
            return;
        }
        var newState = {
            userid : userid,
            username : username,
        }
        this.setState(newState);
        this.projectListRef.current.fresh();
    }

    renderContent(){
        return <div className='flex-grow-1 flex-shrink-1 d-flex'>
                    <C_ProjectList ref={this.projectListRef} />
                </div>
    }

    render(){
        var infos = this.state.infos;
        return (
        <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>
            <C_ModelTip ref={modelTipRef} />
            <div className='d-flex flex-column flex-grow-1 flex-shrink-1'>
                {this.renderContent()}
            </div>
        </div>);
    }
}


ReactDOM.render(<MainApp ref={mainAppRef} />, document.getElementById('reactRoot'));