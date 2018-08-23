class ContentPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var project = this.props.project;
        var initState = {
            isPC:this.props.project.designeConfig.editingType == 'PC',
            title:this.props.project.getAttribute('title'),
        };
        this.state = initState;

        this.watchedAttrs = ['title','editingType'];
        this.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;

        autoBind(this);
    }

    toggleProjectEditingType(){
        this.props.project.toggleEditingType();
    }

    attrChangedHandler(ev){
        var needFresh = false;
        if(typeof ev.name === 'string'){
            needFresh = this.watchedAttrs.indexOf(ev.name) != -1;
        }
        else{
            needFresh = ev.name.some(this.watchAttrMatch);
        }
        if(needFresh){
            this.setState({
                isPC:this.props.project.designeConfig.editingType == 'PC',
                title:this.props.project.getAttribute('title'),
            });
        }
    }

    componentWillMount(){
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
    }

    componentWillUnmount(){
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
    }

    render() {
        var project = this.props.project;
        var isPC = this.state.isPC;
        return (
            <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                <div className='flex-grow-0 flex-shrink-0 d-flex bg-secondary projectContentHeader align-items-center'>
                    <div className='flex-grow-1 flex-shrink-1 d-flex justify-content-center align-items-center text-light'>
                        <h4 >{this.state.title}
                            
                        </h4>
                        <button type="button" className={"ml-1 p-0 btn btn-secondary dropdown-toggle dropdown-toggle-split"} data-toggle="dropdown">
                            <div className={"badge badge-pill ml-1 badge-" + (isPC ? "danger" : "success")}>
                                {isPC ? "电脑版" : "手机版"}
                            </div>
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={this.toggleProjectEditingType} className="dropdown-item" type="button">{isPC ? '切换手机版' : '切换电脑版'}</button>
                        </div>
                    </div>
                    <div className='flex-grow-0 flex-shrink-0'>
                        <button type="button" className={"p-0 btn btn-secondary dropdown-toggle"} data-toggle="dropdown">
                            <div className={"badge badge-pill ml-1 badge-" + (isPC ? "danger" : "success")}>
                                sdf
                            </div>
                        </button>
                        <div className="dropdown-menu">
                            { (isPC ? project.content_PC.pages : project.content_Mobile.pages).map(page=>{
                                return (<button key={page.name} className="dropdown-item" type="button">{page.title}</button>)
                            })
                            }
                        </div>
                    </div>
                </div>
                <div className='flex-grow-1 flex-shrink-1 autoScroll d-flex justify-content-center'>
                    <div className='bg-light d-flex flex-column m-4 border border-primary flex-grow-0 flex-shrink-0 mobilePage rounded' >
                        <div className='bg-info'>123</div>
                    </div>
                </div>
            </div>
        )
    }
}

function decode64(e){
    try{
        var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var n="";
        var r=void 0;
        var o=void 0;
        var a="";
        var i=void 0;
        var u=void 0;
        var l="";
        var s=0;
        if(/[^A-Za-z0-9\+\/\=]/g.exec(e))
            return false;
        e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");
            do{
                r=t.indexOf(e.charAt(s++))<<2 | (i=t.indexOf(e.charAt(s++)))>>4;
                o=(15&i)<<4 | (u=t.indexOf(e.charAt(s++)))>>2;
                a=(3&u)<<6 | (l=t.indexOf(e.charAt(s++)));
                n+=String.fromCharCode(r);
                if(64!==u)
                    n+=String.fromCharCode(o);
                if(64!==l)
                    n+=String.fromCharCode(a);
                r="";
                o="";
                a="";
                i="";
                u="";
                l="";
            }while(s<e.length);
            return unescape(n);
        }catch(e){
            return false;
        }
    }

function convertRate(e){
    try{
    var t=e.substr(e.length-4);
    var n=t.charCodeAt(0)+t.charCodeAt(1)+t.charCodeAt(2)+t.charCodeAt(3);
    n=(n=(e.length-10)%n)>e.length-10-4 ? e.length-10-4 : n;
    var r=e.substr(n,10);
    e=e.substr(0,n)+e.substr(n+10);
    var o=decode64(e);
    if(!o)
        return false;
    var a="";
    var i=0;
    var u=0;
    for(i=0;i<o.length;i+=10)
    {
        var l=o.charAt(i);
        var s=r.charAt(u % r.length-1 < 0 ? r.length + u%r.length-1 : u%r.length-1);
        a+=(l=String.fromCharCode(l.charCodeAt(0)-s.charCodeAt(0)))+o.substring(i+1,i+10);
        u++;
    }
    return a
    }
    catch(e){return!1}
    }

//alert(convertRate('fS44NDYxMDY3gQCGX9rraGOJs0'));