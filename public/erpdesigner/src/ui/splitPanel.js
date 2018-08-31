class SplitPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var initState = {
            percent:this.formatPercent(this.props.defPercent),
        };
        this.state = initState;
        this.rootDivRef = React.createRef();
    }

    componentWillMount() {
        //window.addEventListener('mousemove', this.onMouseMoveHandler);
    }

    componentWillUnmount() {
        //window.removeEventListener('mousemove', this.onMouseMoveHandler);
    }

    mouseDownSplitHandler(ev){
        window.addEventListener('mousemove', this.onMouseMoveHandler);
        window.addEventListener('mouseup', this.onMouseUpHandler);
    }

    onMouseMoveHandler(ev){
        var newX = Math.round(ev.x);
        var newY = Math.round(ev.y);
        var isHor = this.props.flexColumn != true;
        var rootBoundRect = this.rootDivRef.current.getBoundingClientRect();
        var percent = 0;
        if(isHor){
            percent = (newX - rootBoundRect.left) / rootBoundRect.width;
        }
        else{
            percent = (newY - rootBoundRect.top) / rootBoundRect.height;
        }
        //console.log(percent);
        this.setState({
            percent:this.formatPercent(percent),
        });
    }

    formatPercent(val){
        if(val == null || isNaN(val) || val < 0){
            return 0;
        }
        if(val > 1){
            return 1;
        }
        return Math.round(val * 100) / 100;
    }

    onMouseUpHandler(ev){
        window.removeEventListener('mousemove', this.onMouseMoveHandler);
        window.removeEventListener('mouseup', this.onMouseUpHandler);
    }

    render() {
        var fixedOne = this.props.fixedOne == null || this.props.fixedOne != false;
        var isHor = this.props.flexColumn != true;
        var usePercent = this.state.percent;
        var hideOne = usePercent < 0.1;
        var hideTwo = usePercent > 0.9;
        if(!fixedOne){
            usePercent = 1-usePercent;
        }
        usePercent = usePercent * 100 + '%';
        return (
            <div className={"flex-grow-1 flex-shrink-1 d-flex" + (!isHor ? ' flex-column mw-100' : ' mh-100')} ref={this.rootDivRef}>
                { 
                    !hideOne &&
                    <div className={'hidenOverflow d-flex '+(fixedOne && !hideTwo ? ' flex-grow-0 flex-shrink-0' : 'flex-grow-1 flex-shrink-1')} style={!fixedOne ? {} : (isHor ? {width:usePercent} : {height:usePercent})}>
                        {
                            this.props.panel1
                        }
                    </div>
                }
                <div onMouseDown={this.mouseDownSplitHandler} className={'text-justify d-flex flex-grow-0 flex-shrink-0 ' + (isHor ? ' splitbar_H align-items-center' : ' splitbar_V justify-content-center') + (this.props.barClass ? ' ' + this.props.barClass : '')} >
                    <span className={'icon-sm text-light ' + (isHor ? 'icon-more-vertical' : 'icon-more')} />
                </div>
                {
                    !hideTwo &&
                    <div className={'hidenOverflow d-flex '+(fixedOne || hideOne ? ' flex-grow-1 flex-shrink-1' : 'flex-grow-0 flex-shrink-0')} style={fixedOne ? {} : (isHor ? {width:usePercent} : {height:usePercent})}>
                        {
                            this.props.panel2
                        }
                    </div>
                }
            </div>
        )
    }
}

