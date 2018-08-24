class ControlBase extends React.PureComponent{
    constructor() {
        this.config = Object.assign({},{
        });
        this.eventEmitter = new EventEmitter();

        autoBind(this);
    }

    render(){
        
    }
}