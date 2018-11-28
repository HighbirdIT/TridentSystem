class C_Node_Link extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
        var initState = {};
        if(this.props.link){
            initState.start = this.props.link.outSocket.currentComponent ? this.props.link.outSocket.currentComponent.getCenterPos() : null;
            initState.end = this.props.link.inSocket.currentComponent ? this.props.link.inSocket.currentComponent.getCenterPos() : null;
            initState.link = this.props.link;
        }
        else{
            initState.start = this.props.start;
            initState.end = this.props.end;
        }
        this.state=initState;

        this.rootDivRef = React.createRef();
    }

    startNodeMovedHandler(){
        var newVal = this.state.link.outSocket.currentComponent ? this.state.link.outSocket.currentComponent.getCenterPos() : null;
        this.setState({
            start : newVal
        });
    }

    endNodeMovedHandler(){
        var newVal = this.state.link.inSocket.currentComponent ? this.state.link.inSocket.currentComponent.getCenterPos() : null;
        this.setState({
            end : newVal
        });
    }

    componentWillMount(){
        if(this.props.link){
            this.props.link.outSocket.node.on('moved', this.startNodeMovedHandler);
            this.props.link.outSocket.node.on(Event_CurrentComponentchanged, this.startNodeMovedHandler);
            this.props.link.inSocket.node.on('moved', this.endNodeMovedHandler);
            this.props.link.inSocket.node.on(Event_CurrentComponentchanged, this.endNodeMovedHandler);
        }
    }

    componentWillUnmount(){
        if(this.props.link){
            this.props.link.outSocket.node.off('moved', this.startNodeMovedHandler);
            this.props.link.outSocket.node.off(Event_CurrentComponentchanged, this.startNodeMovedHandler);
            this.props.link.inSocket.node.off('moved', this.endNodeMovedHandler);
            this.props.link.inSocket.node.off(Event_CurrentComponentchanged, this.endNodeMovedHandler);
        }
    }

    mouseDownHandler(ev){
        if(ev.altKey){
            console.log('delete link');
            if(this.props.link){
                this.props.link.pool.removeLink(this.props.link);
            }
        }
    }

    render() {
        var start = this.state.start;
        var end = this.state.end;
        if(start == null || end == null)
            return null;
        var dis = Math.round(MyMath.disBetweenPoint(start,end));
        //console.log('dis:' + dis);
        var angle = dis == 0 ? 0 : Math.asin((end.y - start.y) / dis) * (180 / Math.PI);
        if(end.x < start.x){
            if(end.y > start.y)
                angle = 180 - angle;
            else
                angle = -180 - angle;
        }
        //console.log(angle);
        var thisStyle = {width:dis + 'px', height:'2px',transform:'rotate(' + angle + 'deg)',left:start.x + 'px',top:start.y + 'px'};
        return (
            <div ref={this.rootDivRef} className='nodepath' style={thisStyle} draging={this.state.draging ? 1 : null} onMouseDown={this.mouseDownHandler}>
                
            </div>
        );
    }
}