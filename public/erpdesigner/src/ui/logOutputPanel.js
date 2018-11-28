const LogTag_Info='info';
const LogTag_Warning='warning';
const LogTag_Error='error';

const LogItemBadge='Badge';

class LogManager extends EventEmitter{
    constructor(label){
        super();
        EnhanceEventEmiter(this);
        this.logs_arr = [];
        this.label = label;
        this.baseTime = (new Date()).getTime();
    }

    _add(tag, content, data){
        this.logs_arr.push({
            tag:tag,
            content:content,
            data:data,
            time:(new Date()).getTime() - this.baseTime,
        });
        this.fireEvent('changed');
    }

    _addEx(tag, items_arr, data){
        this.logs_arr.push({
            tag:tag,
            contents:items_arr,
            data:data,
            time:(new Date()).getTime() - this.baseTime,
        });
        this.fireEvent('changed');
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

    render(){
        var logItem = this.props.logItem;
        var iconElem = null;
        var textColor = 'text-light';
        switch(logItem.tag){
            case LogTag_Warning:
            {
                iconElem = (<i className='fa fa-warning'/>);
                textColor = 'text-warning';
                break;
            }
            case LogTag_Error:
            {
                iconElem = (<i className='fa fa-times-circle'/>);
                textColor = 'text-danger';
                break;
            }
        }
        var d = new Date();
        return (<span className={textColor}>
                    {'[' + (logItem.time / 1000.0) + ']'}
                    {iconElem}
                    {this.renderItem(logItem)}
                </span>);
    }
}

class LogOutputPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            infos_arr:[]
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
        return (
            <div className={"w-100 h-100 autoScroll d-flex flex-column " + (this.props.className == null ? '' : this.props.className)}>
                {
                    this.state.infos_arr.map((logItem,i)=>{
                        return <CLogItem key={i} logItem={logItem} />
                    })
                }
            </div>
        );
    }
}