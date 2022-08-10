var mianServerPath = '/erppage/server/main';

class MainApp extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            account:'',
            password:'',
            info:'',
            loging:false,
            imgData:null
        };
        this.pwdInputRef = React.createRef();
        this.logGUID = guid2().toUpperCase();


        var gotoUrl = 'https://erp.highbird.cn/erppage/pc/KJDL?flowStep=217|and|stepData217=2:' + this.logGUID;
        var self = this;
        nativeFetchJson(false, '/makeqrcode2', {text:gotoUrl}).then(retData => {
            self.setState({
                imgData:retData.data
            });
            setTimeout(self.checkLoginState, 2000);
        });


        autoBind(this);
    }

    checkLoginState(){
        var self = this;
        var fetchParam = {
            method: "GET",
            credentials: "include"
        };
        fetch('/server/queryqrloginstate?id=' + this.logGUID, fetchParam).then(function (response) {
            if (response.ok) {
                return response.text();
            } else {
                setTimeout(self.checkLoginState, 1000);
            }
        }, function (error) {
            setTimeout(self.checkLoginState, 1000);
        }).then(function (text) {
            if(text[0] == '1'){
                var t_arr = text.split(',');
                var name = t_arr[0].substring(1,t_arr[0].length);
                self.setState({
                    info:'欢迎：' + name
                });

                setTimeout(() => {
                    window.location.href = window.location.origin + "/erppage/pc/jzcj";
                }, 1500);
            }
            else{
                setTimeout(self.checkLoginState, 1000);
            }

        });
    }

    render(){
        return (
        <div className='w-100 h-100'>
            <div style={{width:'510px'}} className='p-2 border rounded shadow d-flex flex-column centerelem position-absolute'>
                <span className='h3 border-bottom'>金属车间扫码登录</span>
                <img src={this.state.imgData} style={{width:'500px',height:'500px'}} />
                <div>{this.state.info}</div>
            </div>
        </div>);
    }
}

ReactDOM.render(<MainApp />, document.getElementById('reactRoot'));