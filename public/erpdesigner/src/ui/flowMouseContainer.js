class FlowMouseContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var initState = {
            x:0,
            y:0,
            getContentFun:null,
        };
        this.state = initState;
    }

    onMouseMoveHandler(ev){
        var newX = Math.round(ev.x);
        var newY = Math.round(ev.y);
        if(newX == this.state.x && newY == this.state.y){
            return;
        }
        this.setState({
            x:newX + 20,
            y:newY + 20,
        });
        if(this.props.positionChanged){
            this.props.positionChanged({x:newX,y:newY});
        }
    }

    setGetContentFun(theFun){
        if(theFun){
            if(this.state.getContentFun == null){
                window.addEventListener('mousemove', this.onMouseMoveHandler);
            }
        }
        else{
            if(this.state.getContentFun != null){
                window.removeEventListener('mousemove', this.onMouseMoveHandler);
            }
        }
        this.setState({
            getContentFun:theFun,
            x:WindowMouse.x + 10,
            y:WindowMouse.y + 10,
        });
    }

    componentWillMount() {
        //window.addEventListener('mousemove', this.onMouseMoveHandler);
    }

    componentWillUnmount() {
        //window.removeEventListener('mousemove', this.onMouseMoveHandler);
    }

    render() {
        if(!this.state.getContentFun)
            return null;
        return (
            <div className="position-fixed bg-light border-1 shadow flowMouseContainer" style={{left:this.state.x + 'px',top:this.state.y + 'px'}}>
                {this.state.getContentFun()}
            </div>
        )
    }
}
