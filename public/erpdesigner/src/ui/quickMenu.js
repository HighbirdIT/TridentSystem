class QuickMenuItem{
    constructor(label,key, config){
        this.label = label;
        this.key = key;
        this.config = config == null ? {} : config;
    }
}

class QuickMenuItem_Visible extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    clickHandler(ev){
        this.props.clickMenuHandler(this.props.item);
    }

    render(){
        var menuItem = this.props.item;
        return (<button type='button' className={'btn ' + menuItem.config.btnClass} onClick={this.clickHandler}>{menuItem.label}</button>);
    }
}

class QuickMenuContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.rootRef = React.createRef();

        var initState = {
            
        };
        this.state = initState;
    }

    popMenu(items_arr, pos, callback){
        if(items_arr){
            if(this.state.items_arr == null){
                window.addEventListener('mouseup', this.onMouseUpHandler);
            }
            this.setState({
                items_arr:items_arr,
                x: pos.x,
                y: pos.y,
            });
        }
        else{
            if(this.state.items_arr != null){
                window.removeEventListener('mouseup', this.onMouseUpHandler);
            }
            this.setState({
                items_arr: null,
            });
        }
        this.callback = callback;
        this.pos = pos;
    }

    onMouseUpHandler(ev){
        if(!isNodeHasParent(ev.target, this.rootRef.current)){
            this.popMenu(null);
        }
    }

    clickMenuHandler(menuItem){
        this.callback(menuItem, this.pos);
        this.popMenu(null);
    }

    render() {
        if(!this.state.items_arr)
            return null;
        return (
            <div ref={this.rootRef} className="position-fixed shadow quickMenuContainer d-flex flex-column" style={{left:this.state.x + 'px',top:this.state.y + 'px'}}>
                {this.state.items_arr.map(item=>{
                    return <QuickMenuItem_Visible key={item.key} item={item} clickMenuHandler={this.clickMenuHandler} />
                })}
            </div>
        )
    }
}
