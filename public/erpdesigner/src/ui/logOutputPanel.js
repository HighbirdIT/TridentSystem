const LogTag_Info='info';
const LogTag_Warning='warning';
const LogTag_Error='error';

const LogItemBadge='Badge';

var g_logMangerCounter = {};

class LogManager extends EventEmitter{
    constructor(label){
        super();
        EnhanceEventEmiter(this);
        this.logs_arr = [];
        if(label == null){
            label = 'unname';
        }
        this.label = label;
        this.baseTime = (new Date()).getTime();
        this.counter = {};
        var nowCount = ReplaceIfNaN(g_logMangerCounter[label],0) + 1;
        this.id = label + (nowCount + 1);
        g_logMangerCounter[label] = nowCount;
    }

    _add(tag, content, data){
        if(this.counter[tag] == null){
            this.counter[tag] = 0;
        }
        ++this.counter[tag];

        this.logs_arr.push({
            tag:tag,
            content:content,
            data:data,
            time:(new Date()).getTime() - this.baseTime,
        });
        this.fireEvent('changed');
    }

    _addEx(tag, items_arr, data){
        if(this.counter[tag] == null){
            this.counter[tag] = 0;
        }
        ++this.counter[tag];

        this.logs_arr.push({
            tag:tag,
            contents:items_arr,
            data:data,
            time:(new Date()).getTime() - this.baseTime,
        });
        this.fireEvent('changed');
    }

    getCount(tag){
        return this.counter[tag] == null ? 0 : this.counter[tag];
    }

    log(info,data){
        this._add(LogTag_Info, info, data);
    }

    warn(info,data){
        this._add(LogTag_Warning, info, data);
    }

    error(info,data){
        this._add(LogTag_Error, info, data);
    }

    logEx(items_arr,data){
        this._addEx(LogTag_Info, items_arr, data);
    }

    warnEx(items_arr,data){
        this._addEx(LogTag_Warning, items_arr, data);
    }

    errorEx(items_arr,data){
        this._addEx(LogTag_Error, items_arr, data);
    }

    createBadgeItem(text, data, clickCallBack){
        return{
            type:LogItemBadge,
            text:text,
            data:data,
            clickCallBack:clickCallBack,
        }
    }

    clear(){
        this.logs_arr = [];
        this.fireEvent('changed');
        this.baseTime = (new Date()).getTime();
        this.counter = {};
    }


    getLogs(copy){
        if(copy == null){
            copy = true;
        }
        return copy ? this.logs_arr.concat() : this.logs_arr;
    }
}

class CLogItem extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        this.copyBtnRef = React.createRef();

        this.state={

        }
    }

    clickHandler(ev){
        var ci = getAttributeByNode(ev.target, 'd-ci');
        if(ci == null){
            return;
        }
        ci = parseInt(ci);
        var logItem = this.props.logItem;
        if(isNaN(ci) || logItem.contents == null){
            return;
        }
        if(ci < 0 || ci >= logItem.contents.length){
            return;
        }
        var content = logItem.contents[ci];
        if(typeof(content) != 'object'){
            return;
        }
        if(content.clickCallBack != null){
            content.clickCallBack(content);
        }
    }

    renderContentItem(contentItem, i){
        if(typeof(contentItem) == 'string'){
            return (<span key={i}>{contentItem}</span>)
        }
        var elem = null;
        switch(contentItem.type){
            case LogItemBadge:
            {
                elem = (<span key={i} className="badge badge-secondary" d-ci={i} onClick={contentItem.clickCallBack ? this.clickHandler : null}>{contentItem.text}</span>);
                break;
            }
        }
        return elem;
    }

    renderItem(logItem){
        if(logItem.content){
            return logItem.content;
        }
        if(logItem.contents){
            return (<React.Fragment>
                    {logItem.contents.map((item,i)=>{
                        return this.renderContentItem(item, i);
                    })}
                </React.Fragment>);
        }
    }

    componentWillMount(){
        var self = this;
        setTimeout(() => {
            if(self.copyBtnRef.current){
                self.clipboard = new ClipboardJS(self.copyBtnRef.current);
            }
        }, 50);
    }

    componentWillUnmount(){
        if(this.clipboard){
            this.clipboard.destroy();
        }
    }

    render(){
        var logItem = this.props.logItem;
        var iconElem = null;
        var textColor = 'text-light';
        switch(logItem.tag){
            case LogTag_Warning:
            {
                textColor = 'text-warning';
                iconElem = (<i className='fa fa-warning text-warning'/>);
                break;
            }
            case LogTag_Error:
            {
                textColor = 'text-danger';
                iconElem = (<i className='fa fa-times-circle text-danger'/>);
                break;
            }
        }
        var d = new Date();
        var paseSec = Math.floor((logItem.time / 1000.0));
        var itemID = this.props.idPrefix + '_' + this.props.index;
        return (<div className='d-flex flex-grow-0 flex-shrink-0'>
                    <span className='text-light'>{'[' + paseSec + ']'}</span>
                    {iconElem}
                    <span id={itemID} className={textColor + ' selectable flex-grow-1 flex-shrink-1'}>
                        {this.renderItem(logItem)}
                    </span>
                    <span ref={this.copyBtnRef} className='btn btn-dark' data-clipboard-target={"#" + itemID}>
                        <i className='fa fa-copy text-light' />
                    </span>
                </div>);
    }
}

class LogOutputPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            infos_arr:this.props.source.getLogs(),
        };
        
    }

    sourceChangedHanlder(){
        this.setState({
            infos_arr:this.props.source.getLogs(),
        });
    }

    componentWillMount(){
        if(this.props.source != null){
            this.props.source.on('changed', this.sourceChangedHanlder);
        }
    }

    componentWillUnmount(){
        if(this.props.source != null){
            this.props.source.off('changed', this.sourceChangedHanlder);
        }
    }

    render() {
        var sourceID = this.props.source.id;
        if(sourceID == null){
            console.error("LogOutputPanel'source need id prop!");
        }
        return (
            <div className={"w-100 h-100 autoScroll d-flex flex-column" + (this.props.className == null ? '' : this.props.className)}>
                {
                    this.state.infos_arr.map((logItem,i)=>{
                        return <CLogItem key={i} logItem={logItem} idPrefix={sourceID} index={i} />
                    })
                }
            </div>
        );
    }
}