class SplitPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        if(this.props.fixedOne != null && this.props.maxSize == null){
            console.warn('SplitPanel set fixedOne must set maxSize');
        }

        var initState = {
            percent:this.formatPercent(this.props.defPercent),
        };
        this.state = initState;
        this.rootDivRef = React.createRef();
        this.splitbarRef = React.createRef();
        this.panelOneRef = React.createRef();
        this.panelTwoRef = React.createRef();

        this.firstRealSizeCaled = false;
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
        var $rootDiv = $(this.rootDivRef.current);
        var $splitbar = $(this.splitbarRef.current);
        var rootWidth = $rootDiv.width();
        var rootHeight = $rootDiv.height();
        var fixedOne = this.props.fixedOne == null || this.props.fixedOne != false;
        var isHor = this.props.flexColumn != true;
        var rootSize = isHor ? rootWidth - $splitbar.width() : rootHeight - $splitbar.height();
        var usePercent = this.state.percent;
        var hideOne = usePercent < 0.1;
        var hideTwo = usePercent > 0.9;

        var maxSize = this.props.maxSize;
        if(maxSize != null){
            maxSize = parseInt(maxSize);
            if(isNaN(maxSize)){
                maxSize = null;
                console.warn('错误的maxsize:' + this.props.maxSize);
            }
        }

        var panelOneStyle = {};
        var panelTwoStyle = {};
        
        var panelOneSize = 0;
        var panelTwoSize = 0;
        if(rootSize > 0){
            if(!this.firstRealSizeCaled){
                var $panelOne = $(this.panelOneRef.current);
                //var $panelTwo = $(this.panelTwoRef.current);
                //usePercent = (fixedOne ? (isHor ? $panelOne.width() : $panelOne.height()) : (isHor ? $panelTwo.width() : $panelTwo.height())) / rootSize;
                usePercent = (isHor ? $panelOne.width() : $panelOne.height()) / rootSize;
                this.firstRealSizeCaled = true;
            }
            if(fixedOne){
                panelOneSize = Math.round(maxSize ? Math.min(maxSize, rootSize * usePercent) : rootSize * usePercent);
                panelTwoSize = rootSize - panelOneSize;
            }
            else{
                usePercent = 1 - usePercent;
                panelTwoSize = Math.round(maxSize ? Math.min(maxSize, rootSize * usePercent) : rootSize * usePercent);
                panelOneSize = rootSize - panelTwoSize;
            }
            panelOneStyle = isHor ? {width:panelOneSize + 'px'} : {height:panelOneSize + 'px'};
            panelTwoStyle = isHor ? {width:panelTwoSize + 'px'} : {height:panelTwoSize + 'px'};
            
        }
        else{
            usePercent *= 100;
            if(maxSize > 0){
                if(fixedOne){
                    panelOneStyle = isHor ? {width:maxSize + 'px'} : {height:maxSize + 'px'};
                    panelTwoStyle = isHor ? {width:'calc(100% - 0.75em - ' + maxSize + 'px)'} : {height:'calc(100% - 0.75em - ' + maxSize + 'px)'};
                }
                else{
                    panelTwoStyle = isHor ? {width:usePercent + '%', maxWidth:maxSize} : {height:usePercent + '%', maxHeight:maxSize};
                    panelOneStyle = isHor ? {width:'calc(100% - 0.75em - ' + maxSize + 'px)'} : {height:'calc(100% - 0.75em - ' + maxSize + 'px)'};

                }
            }
            else{
                if(fixedOne){
                    panelOneStyle = isHor ? {width:usePercent + '%', maxWidth:maxSize} : {height:usePercent + '%', maxHeight:maxSize};
                    panelTwoStyle = isHor ? {width:'calc('+(100-usePercent) + '% - 0.75em)'} : {height:'calc('+(100-usePercent) + '% - 0.75em)'};
                }
                else{
                    usePercent = 100 - usePercent;
                    panelTwoStyle = isHor ? {width:usePercent + '%', maxWidth:maxSize} : {height:usePercent + '%', maxHeight:maxSize};
                    panelOneStyle = isHor ? {width:'calc('+(100-usePercent) + '% - 0.75em)'} : {height:'calc('+(100-usePercent) + '% - 0.75em)'};

                }
            }
        }
        
        return (
            <div className={"flex-grow-1 flex-shrink-1 d-flex " + (!isHor ? ' flex-column mw-100 mh-100' : ' mw-100 mh-100')} ref={this.rootDivRef}>
                { 
                    <div ref={this.panelOneRef} className={''+(hideOne ? ' d-none' : ' d-flex')+(fixedOne && !hideTwo ? ' flex-grow-0 flex-shrink-0' : ' flex-grow-1 flex-shrink-1')} style={panelOneStyle}>
                        {
                            this.props.panel1
                        }
                    </div>
                }
                <div ref={this.splitbarRef} onMouseDown={this.mouseDownSplitHandler} className={'text-justify d-flex flex-grow-0 flex-shrink-0 ' + (isHor ? ' splitbar_H align-items-center' : ' splitbar_V justify-content-center') + (this.props.barClass ? ' ' + this.props.barClass : '')} >
                    <span className={'icon-sm text-light ' + (isHor ? 'icon-more-vertical' : 'icon-more')} />
                </div>
                {
                    <div ref={this.panelTwoRef} className={''+(hideTwo ? ' d-none' : ' d-flex')+(fixedOne || hideOne ? ' flex-grow-1 flex-shrink-1' : ' flex-grow-0 flex-shrink-0')} style={panelTwoStyle}>
                        {
                            this.props.panel2
                        }
                    </div>
                }
            </div>
        )
    }
}

