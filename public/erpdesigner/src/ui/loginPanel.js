class LoginPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        var initState = {
            account:'',
            password:'',
        };

        this.state = initState;
        this.panelBaseRef = React.createRef();
        autoBind(this);
    }

    componentWillMount(){
        // autolog
        this.fetching = true;
        this.setState({
            info:'尝试自动登录',
        });
        fetchJsonPost('server', { action: 'loginUseCoockie'}, this.loginUseCookieCallBack);
    }

    logComplete(useData){
        //console.log(useData);
        LoginUser = new Account(useData);

        this.setState({
            info:'获取基础配置信息',
        });
        fetchJsonPost('server', { action: 'getBaseConfigData'}, this.getBaseConfigDataCallBack);
    }

    getBaseConfigDataCallBack(respon){
        if(respon.success){
            if(respon.json.err != null){
                this.endFetch(respon.json.err.info);
                return;
            }
            gFlowMaster.synFromJson(respon.json.data.flows);
            PersonEductOptions_arr = respon.json.data.personEducts_arr;
            AllPosts_arr = respon.json.data.posts_arr;
            ProjectRecords_arr = respon.json.data.projects_arr;
            AllReports_arr = respon.json.data.reports_arr;
            AllExcelTemplate_arr = [{name:'无',code:0}].concat(respon.json.data.excelTemplate_arr);
            AllPermissionGroups_arr = respon.json.data.permissionGroups_arr;

            while(AllFileFlows_arr.length > 0){
                AllFileFlows_arr.pop();
            }
            respon.json.data.fileFlows_arr.forEach(t=>{
                AllFileFlows_arr.push(t);
            });

            this.endFetch('获取成功');
            var self = this;
            setTimeout(()=>{
                self.panelBaseRef.current.close();
                if(self.props.logCompleteFun != null){
                    self.props.logCompleteFun();
                }
            },200);
        }
        else{
            this.endFetch(respon.json.err.info);
        }
    }

    loginUseCookieCallBack(respon){
        if(respon.success){
            if(respon.json.err != null){
                this.endFetch(respon.json.err.info);
                return;
            }
            //this.endFetch('缓存登录成功');
            this.logComplete(respon.json.data);
        }
        else{
            this.endFetch(respon.json.err.info);
        }
    }

    accountInputChangeHandler(ev){
        this.setState({
            account:ev.target.value,
        });
    }

    passwordInputChangeHandler(ev){
        this.setState({
            password:ev.target.value,
        });
    }

    loginCallBack(respon){
        if(respon.success){
            if(respon.json.err != null){
                this.endFetch(respon.json.err.info);
                return;
            }
            this.endFetch('成功');
            this.logComplete(respon.json.data);
        }
        else{
            this.endFetch(respon.json.err.info);
        }
    }

    getPreLogDataCallBack(respon){
        if(respon.success){
            if(respon.json.err != null){
                this.endFetch(respon.json.err.info);
                return;
            }
            var rsa = forge.pki.rsa;
            //var tk = forge.pki.publicKeyToRSAPublicKey(respon.json.data);
            var usePublickKey = forge.pki.publicKeyFromPem(respon.json.data.publicKey);
            //var dstText = forge.util.encodeUtf8("12345"); 
            var encryptPass = usePublickKey.encrypt(this.usePassword);
            var encryptAccount = usePublickKey.encrypt(this.useAccount);
            fetchJsonPost('server', { action: 'login', account:encryptAccount, password:encryptPass}, this.loginCallBack);
        }
        else{
            this.endFetch(respon.json.err.info);
        }
    }
    
    endFetch(info){
        this.fetching = false;
        this.setState({
            info:info
        });
    }

    clickConfirmHandler(){
        if(this.fetching){
            this.setState({
                info:'请稍等',
            });
            return;
        }
        this.useAccount = this.state.account.trim();
        this.usePassword = this.state.password;
        if(this.useAccount.length < 3){
            this.endFetch('账户太短');
            return;
        }
        if(this.usePassword.length < 6){
            this.endFetch('密码太短');
            return;
        }
        fetchJsonPost('server', { action: 'getPreLogData' }, this.getPreLogDataCallBack);
        this.fetching = true;
    }

    render(){
        var passwordText = this.state.password;
        var info = IsEmptyString(this.state.info) ? '' : '(' + this.state.info + ')';
        return(
            <FloatPanelbase title='登录' ref={this.panelBaseRef} initShow={true} width={320} height={130} sizeable={false} >
                <div className='d-flex align-items-center m-1' >
                    <span className='d-flex justify-content-center' style={{width:'40px'}}>
                        <i className='fa fa-user-circle fa-2x text-light' />
                    </span>
                    <div className='flex-grow-1 flex-shrink-1'>
                        <input type='text' className='w-100' value={this.state.account} onChange={this.accountInputChangeHandler} />
                    </div>
                </div>
                <div className='d-flex align-items-center m-1'>
                    <span className='d-flex justify-content-center' style={{width:'40px'}}>
                        <i className='fa fa-lock fa-2x text-light' />
                    </span>
                    <div className='flex-grow-1 flex-shrink-1'>
                        <input type='password' className='w-100' value={passwordText}  onChange={this.passwordInputChangeHandler} />
                    </div>
                </div>
                <button type='button' onClick={this.clickConfirmHandler} className='btn btn-dark w-100' >登录<span className='text-info'>{info}</span></button>
            </FloatPanelbase>
        );
    }
}