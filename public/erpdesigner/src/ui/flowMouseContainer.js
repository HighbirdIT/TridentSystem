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
        this.setState({
            x:ev.x + 20,
            y:ev.y + 20,
        });
    }

    setGetContentFun(theFun, mx, my){
        if(theFun){
            if(this.state.getContentFun == null){
                window.addEventListener('mousemove', this.onMouseMoveHandler);
            }
        }
        else{
            if(this.state.getContentFun == null){
                window.removeEventListener('mousemove', this.onMouseMoveHandler);
            }
        }
        this.setState({
            getContentFun:theFun,
            x:mx + 10,
            y:my + 10,
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
