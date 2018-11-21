var gTipWindow = null;
var TipBtnOK = makeAlertBtnData('确定', 'ok', {r:144,g:238,b:144}, {r:0,g:0,b:0});
var TipBtnNo = makeAlertBtnData('取消', 'no', {r:232,g:144,b:144}, {r:0,g:0,b:0});
function makeAlertBtnData(label, key, bgColor, textColor){
    if(bgColor == null){
        bgColor = {r:200,g:200,b:200};
    }
    if(textColor == null){
        textColor = {r:0,g:0,b:0};
    }
    return {
        label:label,
        key:key,
        bgColor:bgColor,
        textColor:textColor,
    }
}
function makeAlertData(title, content, callBack, btns_arr, data){
    if(btns_arr == null || btns_arr.length == 0){
        btns_arr = [makeAlertBtnData('确定', 'ok')];
    }
    return {
        title:title,
        content:content,
        btns_arr:btns_arr,
        callBack:callBack,
        data:data,
    }
}

class TipPanel extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
    }

    componentWillMount(){

    }

    componentWillUnmount(){

    }

    rootDivRef(divItem){
        if(divItem == null){
            return;
        }
        var $window = $(window);
        var $div = $(divItem);
        divItem.style.left = Math.round(($window.width() - $div.width()) * 0.5) + 'px';
        divItem.style.top = Math.round(($window.height() - $div.height()) * 0.5) + 'px';
    }

    clickBtnHandler(ev){
        var key = getAttributeByNode(ev.target, 'btnkey');
        this.props.clickBtnHandler(key, this.props.data);
    }

    render() {
        var tipData = this.props.data;
        var index = this.props.index;
        return (<div className='tippanelroot cursor-arrow' style={{zIndex:index * 10}}>
                    <div ref={this.rootDivRef} className='d-flex flex-column border rounded bg-light' style={{maxWidth:'90%',maxHeight:'90%',position:'absolute',minWidth:'20%',minHeight:'20%'}}>
                        <div className='d-flex justify-content-center flex-grow-0 flex-shrink-0'>
                            <h3>
                                {
                                    tipData.title
                                }
                            </h3>
                        </div>
                        <div className="dropdown-divider"></div>
                        <div className='flex-grow-1 flex-shrink-1 p-1 autoScroll'>
                            {tipData.content}
                        </div>
                        <div className="d-flex flex-grow-0 flex-shrink-0" >
                            {
                                tipData.btns_arr.map(btndata=>{
                                    var btnStyle = {
                                        color:'rgb(' + btndata.textColor.r + ',' +  btndata.textColor.g + ',' +  btndata.textColor.b + ')',
                                        backgroundColor:'rgb(' + btndata.bgColor.r + ',' +  btndata.bgColor.g + ',' +  btndata.bgColor.b + ')',
                                    }
                                    return (<button key={btndata.key} onClick={this.clickBtnHandler} className='btn flex-grow-1 flex-shrink-1' btnkey={btndata.key} type="button" style={btnStyle} >{btndata.label}</button>)
                                })
                            }
                        </div>
                    </div>
                </div>
            );
    }
}

class TipWindow extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            tips_arr:[],
        }
        gTipWindow = this;
        autoBind(this);
    }

    popAlert(tipData){
        var newTipArr = this.state.tips_arr.concat(tipData);
        this.setState({
            tips_arr:newTipArr,
        });
    }

    clickBtnHandler(btnKey, tipData){
        var index = this.state.tips_arr.indexOf(tipData);
        var newTipArr = this.state.tips_arr.concat();
        newTipArr.splice(index, 1);
        setTimeout(() => {
            if(tipData.callBack != null){
                tipData.callBack(btnKey, tipData.data);
            }
        }, 10);
        this.setState({
            tips_arr:newTipArr,
        });
    }

    render(){
        return (<div className={'tipwindowroot' + (this.state.tips_arr.length == 0 ? 'd-none' : '')}>
                {
                    this.state.tips_arr.map((data,index)=>{
                        return <TipPanel key={index} data={data} index={index} clickBtnHandler={this.clickBtnHandler} />
                    })
                }
            </div>);
    }
}