var mianServerPath = '/erppage/server/main';

class MainApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            account:'',
            password:'',
            info:'',
            loging:false,
        };
        this.pwdInputRef = React.createRef();

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
            
        }
        var newState = {
            userid : userid,
            username : username,
        }
        this.setState(newState);
        this.projectListRef.current.fresh();
    }

    accountChanged(ev){
        this.setState({
            account:ev.target.value,
        });
    }

    passwordChanged(ev){
        this.setState({
            password:ev.target.value,
        });
    }

    loginFetchend(respon){
        if(respon.err){
            this.setState({
                loging:false,
                info:respon.err.info,
            });
        }
        else if(respon.data){
            if(respon.data.err){
                this.setState({
                    loging:false,
                    info:respon.err.info,
                });
                return;
            }
            console.log(respon.data);
            this.setState({
                loging:false,
                info:'登录成功',
            });
        }
    }

    getPreLogDataCallBack(respon){
        if(respon.data){
            var rsa = forge.pki.rsa;
            var usePublickKey = forge.pki.publicKeyFromPem(respon.data.publicKey);
            var account = this.state.account;
            var password = this.pwdInputRef.current.value;
            var encryptPass = usePublickKey.encrypt(password);
            var encryptAccount = usePublickKey.encrypt(account);
            var self = this;
            nativeFetchJson(false,mianServerPath, {action:'userlogin',account:encryptAccount,password:encryptPass}).then(
                ret=>{
                    self.loginFetchend(ret);
                }
            );
        }
        else{
            this.setState({
                loging:false,
                info:respon.err.info,
            });
        }
    }

    clickHandler(){
        var account = this.state.account;
        var password = this.pwdInputRef.current.value;
        if(password.length == 0 || account.length == 0 || this.state.loging){
            return;
        }
        this.setState({
            loging:true,
        });
        var self = this;
        nativeFetchJson(false,mianServerPath, {action:'readyLogin'}).then(
            ret=>{
                self.getPreLogDataCallBack(ret);
            }
        );
    }

    render(){
        return (
        <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>
            <div className='d-flex align-items-center'>
                <span>账号</span>
                <input onChange={this.accountChanged} type='text' className='flex-grow-1 flex-shrink-1' style={{minWidth:'10px'}} value={this.state.account} />
            </div>
            <div className='d-flex align-items-center'>
                <span>密码</span>
                <input ref={this.pwdInputRef} type='password' className='flex-grow-1 flex-shrink-1' style={{minWidth:'10px'}} />
            </div>
            <button onClick={this.clickHandler} type='button' className='btn btn-primary' disabled={this.state.loging ? 'disabled' : null}>登录</button>
            <div>{this.state.info}</div>
        </div>);
    }
}

ReactDOM.render(<MainApp />, document.getElementById('reactRoot'));